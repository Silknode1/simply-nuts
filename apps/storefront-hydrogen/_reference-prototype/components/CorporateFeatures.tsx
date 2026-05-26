const features = [
  {
    icon: '\uD83C\uDFA8',
    title: 'Guided Design Studio',
    desc: 'Choose your container, upload your logo, customize engraving text \u2014 all in one guided flow with live preview.'
  },
  {
    icon: '\uD83D\uDCE4',
    title: 'Recipient Import',
    desc: 'Upload CSV, XLSX, or connect Google Sheets. We validate addresses and ship directly to each recipient.'
  },
  {
    icon: '\uD83E\uDD1D',
    title: 'White-Glove Support',
    desc: 'Need design cleanup? Our team polishes your artwork and handles production so you don\u2019t have to.'
  }
];

export default function CorporateFeatures() {
  return (
    <section className="corporate-features" data-reveal>
      <p className="eyebrow">Built for Enterprise</p>
      <h2>Corporate Gifting, Simplified</h2>
      <div className="corp-grid">
        {features.map((f) => (
          <article key={f.title} className="corp-card">
            <div className="corp-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
