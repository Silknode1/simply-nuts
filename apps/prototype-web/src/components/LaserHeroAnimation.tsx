import {useEffect, useRef, useState, useCallback} from 'react';
import gsap from 'gsap';

/*
  Full-screen laser engraving intro overlay.
  - Measures the actual logo element position, places SVG directly over it
  - Laser beam raster-scans left→right, revealing "Simply Nuts & More"
  - Dark overlay fades simultaneously with the scan
*/

const ANIM_DURATION = 4.9;

interface Props {
  onComplete?: () => void;
}

export default function LaserHeroAnimation({onComplete}: Props) {
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [done, setDone] = useState(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const resizeCleanupRef = useRef<(() => void) | null>(null);

  const build = useCallback(() => {
    const svg = svgRef.current;
    const wrap = wrapRef.current;
    if (!svg || !wrap) return;

    // === Position SVG over the actual logo element (+ keep aligned on resize) ===
    const logoEl = document.querySelector('.hero-logo-wrap') as HTMLElement;
    const positionSvg = () => {
      if (!logoEl) return;
      const rect = logoEl.getBoundingClientRect();
      svg.style.position = 'absolute';
      svg.style.top = `${rect.top}px`;
      svg.style.left = `${rect.left}px`;
      svg.style.width = `${rect.width}px`;
      svg.style.height = `${rect.height}px`;
    };
    positionSvg();
    window.addEventListener('resize', positionSvg);
    const cleanupResize = () => window.removeEventListener('resize', positionSvg);
    resizeCleanupRef.current = cleanupResize;

    const clipRect = svg.querySelector('.clip-rect') as SVGRectElement;
    const beamLine = svg.querySelector('.beam-line') as SVGLineElement;
    const beamRay = svg.querySelector('.beam-ray') as SVGLineElement;
    const beamDot = svg.querySelector('.beam-dot') as SVGCircleElement;
    const txt = svg.querySelector('.laser-text') as SVGTextElement;

    if (!clipRect || !beamDot || !beamLine || !beamRay || !txt) return;

    // Measure text bounding box in SVG coords
    const bbox = txt.getBBox();
    const padX = 15;
    const startX = bbox.x - padX;
    const endX = bbox.x + bbox.width + padX;
    const centerY = bbox.y + bbox.height * 0.5;
    const ampY = bbox.height * 0.7;

    // Init clip rect — zero width
    clipRect.setAttribute('x', String(startX));
    clipRect.setAttribute('y', String(bbox.y - 30));
    clipRect.setAttribute('width', '0');
    clipRect.setAttribute('height', String(bbox.height + 60));

    beamDot.setAttribute('opacity', '0');
    beamLine.setAttribute('opacity', '0');
    beamRay.setAttribute('opacity', '0');

    // Calculate a fixed point at the bottom-center of the viewport in SVG coordinates
    const svgRect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const svgScale = vb.width / svgRect.width;
    const raySrcX = (window.innerWidth / 2 - svgRect.left) * svgScale;
    const raySrcY = (window.innerHeight - svgRect.top) * svgScale;

    const tl = gsap.timeline({
      onComplete() {
        cleanupResize();
        setDone(true);
        onComplete?.();
      }
    });

    // Overlay fades — lasts 1s longer than the laser scan
    tl.to(wrap, {
      opacity: 0,
      duration: ANIM_DURATION + 0.4,
      ease: 'power2.in',
    }, 0);

    // Beam appears
    tl.set(beamDot, {attr: {opacity: 1}}, 0.1);
    tl.set(beamLine, {attr: {opacity: 1}}, 0.1);
    tl.set(beamRay, {attr: {opacity: 0.3}}, 0.1);

    // Laser sweep
    const scanDuration = ANIM_DURATION - 0.5;
    const oscillationCycles = 14;
    const progress = {val: 0};

    tl.to(progress, {
      val: 1,
      duration: scanDuration,
      ease: 'power1.inOut',
      onUpdate() {
        const p = progress.val;
        const bx = startX + p * (endX - startX);
        const oscillation = Math.sin(p * oscillationCycles * Math.PI * 2);
        const by = centerY + oscillation * ampY;

        clipRect.setAttribute('width', String(Math.max(0, bx - startX)));

        beamDot.setAttribute('cx', String(bx));
        beamDot.setAttribute('cy', String(by));

        const lineLen = 18;
        const dir = oscillation > 0 ? -1 : 1;
        beamLine.setAttribute('x1', String(bx));
        beamLine.setAttribute('y1', String(by - lineLen * dir));
        beamLine.setAttribute('x2', String(bx));
        beamLine.setAttribute('y2', String(by + lineLen * dir));

        // Ray from fixed bottom-center of screen to beam dot
        beamRay.setAttribute('x1', String(raySrcX));
        beamRay.setAttribute('y1', String(raySrcY));
        beamRay.setAttribute('x2', String(bx));
        beamRay.setAttribute('y2', String(by));
      }
    }, 0.15);

    // Beam fades
    tl.to(beamDot, {attr: {opacity: 0}, duration: 0.2}, scanDuration);
    tl.to(beamLine, {attr: {opacity: 0}, duration: 0.2}, scanDuration);
    tl.to(beamRay, {attr: {opacity: 0}, duration: 0.2}, scanDuration);

    tlRef.current = tl;
  }, [onComplete]);

  useEffect(() => {
    if (prefersReducedMotion) onComplete?.();
  }, [prefersReducedMotion, onComplete]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const t = setTimeout(build, 100);
    return () => { clearTimeout(t); tlRef.current?.kill(); resizeCleanupRef.current?.(); };
  }, [build, prefersReducedMotion]);

  if (done || prefersReducedMotion) return null;

  return (
    <div ref={wrapRef} className="laser-fullscreen">
      <svg
        ref={svgRef}
        viewBox="0 0 1020 280"
        preserveAspectRatio="xMidYMid meet"
        overflow="visible"
        aria-label="Simply Nuts laser engraving animation"
      >
        <defs>
          <clipPath id="textReveal">
            <rect className="clip-rect" x="0" y="0" width="0" height="280" />
          </clipPath>

          <filter id="beamGlow" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b2" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="b3" />
            <feMerge>
              <feMergeNode in="b3" />
              <feMergeNode in="b2" />
              <feMergeNode in="b1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="textGlow" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="g" />
            <feMerge>
              <feMergeNode in="g" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Text centered in SVG — positioned to align with logo banner text */}
        <g clipPath="url(#textReveal)">
          <text
            x="615" y="121"
            className="laser-text"
            fontFamily="'Playfair Display', 'Fraunces', Georgia, serif"
            fontSize="102"
            fontWeight="700"
            fontStyle="italic"
            letterSpacing="2"
            textAnchor="middle"
            fill="none"
            stroke="#ff9944"
            strokeWidth="2.2"
            strokeLinecap="round"
            filter="url(#textGlow)"
          >
            Simply Nuts &amp; More
          </text>
        </g>

        {/* Laser ray from bottom of screen to dot — thin, 50% opacity */}
        <line
          className="beam-ray"
          x1="0" y1="0" x2="0" y2="0"
          stroke="#ff9944"
          strokeWidth="1.2"
          opacity="0"
        />

        {/* Short scan line at the dot */}
        <line
          className="beam-line"
          x1="0" y1="0" x2="0" y2="0"
          stroke="#fff"
          strokeWidth="2"
          filter="url(#beamGlow)"
          opacity="0"
        />
        <circle
          className="beam-dot"
          cx="0" cy="90"
          r="5"
          fill="#fff"
          filter="url(#beamGlow)"
          opacity="0"
        />
      </svg>
    </div>
  );
}
