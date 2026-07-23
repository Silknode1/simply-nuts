/**
 * LogoMarquee — past-client logos running across the page.
 *
 * `variant="glass"` renders a full-bleed translucent overlay band (backdrop
 * blur + warm tint) designed to sit ON TOP of photography or the 3D canvas;
 * `variant="plain"` is the quiet inline version.
 *
 * Pauses on hover/focus. `prefers-reduced-motion` → static wrapped row
 * (see styles/corporate.css).
 *
 * LOGO FILES: an entry renders a styled text wordmark until a real logo file
 * is supplied — drop web-ready files in `public/clients/` and set `src`.
 * Masters belong in `brand-src/clients/`.
 *
 * ⚠️ PERMISSION: the engraved-box clients (K2 Capital, Orijin Stone, Motorwerks
 * BMW) were read off our own product photography and are NOT yet cleared for
 * use as an endorsement logo-wall — get written sign-off before publishing
 * those. The testimonial businesses are already published publicly by Simply
 * Nuts on simplynutsandmore.com/testimonials, so they carry far less risk.
 */

export type ClientLogo = {
  name: string;
  /** Path under public/, e.g. "/clients/acme.svg". Absent → text wordmark. */
  src?: string;
};

/** Named on simplynutsandmore.com/testimonials — already public. */
export const TESTIMONIAL_CLIENTS: ClientLogo[] = [
  { name: 'Honeywood Builders' },
  { name: 'VAA, LLC' },
  { name: 'St. Anthony Kiwanis Club' },
];

/** Read off engraved lids in our own product photography — see permission note. */
export const ENGRAVED_CLIENTS: ClientLogo[] = [
  { name: 'K2 Capital Group' },
  { name: 'Orijin Stone' },
  { name: 'Motorwerks BMW' },
];

export const DEFAULT_CLIENTS: ClientLogo[] = [
  ...TESTIMONIAL_CLIENTS,
  ...ENGRAVED_CLIENTS,
];

function LogoItem({ logo }: { logo: ClientLogo }) {
  if (logo.src) {
    return (
      <img
        src={logo.src}
        alt={logo.name}
        className="logo-marquee__logo"
        loading="lazy"
        draggable={false}
      />
    );
  }
  return (
    <span className="logo-marquee__wordmark" aria-label={logo.name}>
      {logo.name}
    </span>
  );
}

export default function LogoMarquee({
  clients = DEFAULT_CLIENTS,
  variant = 'plain',
  label = 'Trusted by teams across Minnesota & beyond',
}: {
  clients?: ClientLogo[];
  variant?: 'plain' | 'glass';
  /** Caption above the band; pass an empty string to hide it. */
  label?: string;
}) {
  if (clients.length === 0) return null;
  return (
    <div
      className={`logo-marquee${variant === 'glass' ? ' logo-marquee--glass' : ''}`}
      aria-label="Past corporate clients"
    >
      {label ? <p className="logo-marquee__label">{label}</p> : null}
      <div className="logo-marquee__viewport">
        <div className="logo-marquee__track">
          {/* two identical halves → seamless -50% loop */}
          {[0, 1].map((half) => (
            <div key={half} className="logo-marquee__half" aria-hidden={half === 1}>
              {clients.map((logo) => (
                <LogoItem key={`${half}-${logo.name}`} logo={logo} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
