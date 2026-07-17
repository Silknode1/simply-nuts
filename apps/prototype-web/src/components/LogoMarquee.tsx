/**
 * LogoMarquee — horizontal, infinitely auto-scrolling band of past-client
 * logos. Pauses on hover/focus; prefers-reduced-motion renders a static
 * wrapped row (see styles/corporate.css).
 *
 * ⚠ PLACEHOLDER DATA: real client logo files have not been supplied yet.
 * When they land in `apps/prototype-web/brand-src/clients/` (masters), copy
 * web-ready versions to `public/clients/` and set `src` on each entry —
 * entries with `src` render the image; entries without render a styled
 * text wordmark.
 */

export type ClientLogo = {
  name: string;
  /** Path under public/, e.g. "/clients/acme.svg". Absent → text wordmark. */
  src?: string;
};

const PLACEHOLDER_CLIENTS: ClientLogo[] = [
  { name: 'Northfield Bank & Trust' },
  { name: 'Cedar & Main' },
  { name: 'TC Logistics Co.' },
  { name: 'Lakeview Dental Group' },
  { name: 'Birchwood Builders' },
  { name: 'MPLS Roasting Co.' },
  { name: 'Prairie Insurance' },
  { name: 'Gopher State Realty' },
];

function LogoItem({ logo }: { logo: ClientLogo }) {
  if (logo.src) {
    return (
      <img
        src={logo.src}
        alt={logo.name}
        className="h-10 w-auto opacity-70 grayscale"
        loading="lazy"
        draggable={false}
      />
    );
  }
  return (
    <span
      className="font-display text-lg md:text-xl font-bold tracking-wide text-wood-500/70 whitespace-nowrap select-none"
      aria-label={logo.name}
    >
      {logo.name}
    </span>
  );
}

export default function LogoMarquee({ clients = PLACEHOLDER_CLIENTS }: { clients?: ClientLogo[] }) {
  if (clients.length === 0) return null;
  return (
    <div className="logo-marquee py-2" aria-label="Past corporate clients">
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
  );
}
