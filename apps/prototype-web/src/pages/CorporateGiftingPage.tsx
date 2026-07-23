import { Link } from 'react-router-dom';
import LogoMarquee from '../components/LogoMarquee';
import '../styles/corporate.css';

/**
 * Corporate Gifting — Phase 4 v1 (showcase, no customizer).
 * Past-work gallery + client-logo marquee + inquiry CTA, in the island
 * journey's warm visual language. The logo-upload design studio is Phase 2
 * and mounts into the clearly-marked slot near the bottom of this page.
 */

type GalleryItem = {
  src: string;
  alt: string;
  caption: string;
};

// Swap/extend freely — new master photos land in brand-src/gallery/,
// web-ready copies go in public/brand/ (or public/gallery/) and get a row here.
const GALLERY: GalleryItem[] = [
  { src: '/brand/corp-wood-box-4lb.jpg', alt: 'Laser-engraved 4 lb wooden gift box', caption: 'Wooden Collector’s Box — engraved lid, 4 lb' },
  { src: '/brand/corp-bamboo-container.jpg', alt: 'Engraved bamboo gift canister', caption: 'Bamboo Canister — sustainable + engravable' },
  { src: '/brand/corp-tin-pinecone.jpg', alt: 'Holiday gift tin with pinecone design', caption: 'Holiday Gift Tin — seasonal artwork' },
  { src: '/brand/corp-tins-v3.jpg', alt: 'A set of corporate holiday gift tins', caption: 'Gift Tin Collection — batch-engraved for teams' },
  { src: '/brand/corp-containers.jpg', alt: 'Assorted corporate gift containers', caption: 'The full lineup — boxes, bamboo, and tins' },
  { src: '/brand/wood-box.jpg', alt: 'Classic engraved wooden box', caption: 'Classic Wooden Box — walnut finish' },
];

const STEPS = [
  { n: '1', title: 'Pick your container', body: 'Wooden boxes, bamboo canisters, or gift tins — in sizes from a thank-you to a statement.' },
  { n: '2', title: 'We engrave your logo', body: 'Two Epilog lasers burn your artwork into every lid. Proofed with you before a single lid is cut.' },
  { n: '3', title: 'Shipped to every name', body: 'Filled with the treats you choose, packed by hand, and delivered directly to your client list.' },
];

export default function CorporateGiftingPage() {
  return (
    <div className="pt-16 bg-cream min-h-screen">
      {/* ---- hero band ---- */}
      <section className="relative overflow-hidden">
        <img
          src="/brand/corp-containers.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-wood-950/85 via-wood-950/45 to-wood-950/25" />
        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-36">
          <div className="glass max-w-2xl p-8 md:p-10">
            <p className="text-gold-300 font-semibold tracking-wide uppercase text-sm mb-3">
              Corporate Gifting
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-cream leading-tight mb-4">
              Your logo, laser-engraved.
              <span className="block text-gold-300 mt-1">Their new favorite gift.</span>
            </h1>
            <p className="text-cream/85 text-lg leading-relaxed mb-8">
              Since 1986 we’ve helped Minnesota companies skip the boring gift basket:
              premium containers engraved with your brand, filled with freshly roasted
              treats, and shipped straight to every client on your list.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact" className="glass-pill glass-pill--solid text-base">
                Start an Inquiry
              </Link>
              <a href="#gallery" className="glass-pill text-cream/90 text-base">
                See Past Work
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---- client marquee: a translucent band riding over the hero image ---- */}
      <section aria-label="Companies we have gifted for" className="-mt-px">
        <LogoMarquee variant="glass" />
      </section>

      {/* ---- gallery ---- */}
      <section id="gallery" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-wood-900 mb-3">
            Engraved &amp; delivered
          </h2>
          <p className="text-wood-500 max-w-xl mx-auto">
            A few of the boxes, canisters, and tins that have carried our clients’ logos —
            every lid cut on our own laser engravers in Chanhassen.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GALLERY.map((item) => (
            <figure key={item.src} className="corp-gallery__item glass-card glass glass--bright m-0">
              <div className="overflow-hidden">
                <img src={item.src} alt={item.alt} className="w-full aspect-[4/3] object-cover" loading="lazy" />
              </div>
              <figcaption className="px-5 py-4 text-sm font-medium text-wood-700">
                {item.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ---- how it works ---- */}
      <section className="bg-wood-950 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cream text-center mb-12">
            From your logo to their doorstep
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div key={s.n} className="glass p-7">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gold-500 text-wood-950 font-display font-bold text-lg mb-4">
                  {s.n}
                </span>
                <h3 className="font-display text-xl font-bold text-cream mb-2">{s.title}</h3>
                <p className="text-cream/75 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*
        ================================================================
        PHASE 2 MOUNT POINT — logo-upload design studio
        The interactive customizer (upload → as-engraved preview → proof)
        mounts here. Do not remove the section id.
        ================================================================
      */}
      <section id="customizer-slot" className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="glass glass--bright p-8">
          <p className="text-gold-600 font-semibold tracking-wide uppercase text-xs mb-2">Coming soon</p>
          <h3 className="font-display text-2xl font-bold text-wood-900 mb-2">The Design Studio</h3>
          <p className="text-wood-500 text-sm max-w-lg mx-auto">
            Upload your logo, preview it engraved on real wood, and approve your proof —
            all in the browser. Until then, our team proofs every design with you personally.
          </p>
        </div>
      </section>

      {/* ---- closing CTA ---- */}
      <section className="max-w-4xl mx-auto px-4 pb-24 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-wood-900 mb-4">
          Gifting season books up fast.
        </h2>
        <p className="text-wood-500 mb-8 max-w-xl mx-auto">
          Our two lasers run around the clock from September on. Tell us about your list
          and we’ll reserve your production window.
        </p>
        <Link to="/contact" className="glass-pill glass-pill--solid text-lg px-8 py-3.5">
          Get a Corporate Quote
        </Link>
      </section>
    </div>
  );
}
