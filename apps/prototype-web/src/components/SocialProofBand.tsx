const testimonials = [
  {quote: 'Best corporate gifts we\'ve ever sent', company: 'Target Corp'},
  {quote: 'Our clients love the engraved boxes', company: 'Wells Fargo'},
  {quote: 'Incredible quality, incredible service', company: '3M'},
  {quote: 'Simply Nuts made our holiday gifting effortless', company: 'Best Buy'},
  {quote: 'The laser engraving was a showstopper', company: 'Medtronic'},
  {quote: 'Year after year, our go-to gift partner', company: 'General Mills'}
];

const doubled = [...testimonials, ...testimonials];

export default function SocialProofBand() {
  return (
    <div className="social-proof-band" data-reveal>
      <div className="social-proof-track">
        {doubled.map((t, i) => (
          <span key={i} className="social-proof-item">
            &ldquo;{t.quote}&rdquo; &mdash; <strong>{t.company}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}
