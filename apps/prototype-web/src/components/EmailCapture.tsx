import {useState} from 'react';

export default function EmailCapture() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) console.log('[newsletter] Subscribe:', email);
    setEmail('');
  };

  return (
    <section className="email-capture" data-reveal>
      <div>
        <h2>Stay in the Loop</h2>
        <p className="subtitle">Seasonal deals, new products, and gifting inspiration.</p>
      </div>
      <form className="email-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Subscribe</button>
      </form>
    </section>
  );
}
