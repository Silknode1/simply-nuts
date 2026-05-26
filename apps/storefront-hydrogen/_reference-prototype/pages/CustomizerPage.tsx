import {useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import StepProgress from '../components/StepProgress';
import {useReveal} from '../hooks/useReveal';

type ContainerKey = 'wood' | 'bamboo' | 'tin';

const containerOptions = [
  {key: 'wood' as const, label: 'Wooden Box', image: '/brand/wood-box.jpg', desc: 'Classic warmth. Perfect for corporate appreciation.', price: 18},
  {key: 'bamboo' as const, label: 'Bamboo Container', image: '/brand/corp-bamboo-container.jpg', desc: 'Eco-conscious elegance. Sustainable and stunning.', price: 22},
  {key: 'tin' as const, label: 'Gift Tin', image: '/brand/tins.jpg', desc: 'Sleek and stackable. Ideal for large orders.', price: 15}
];

const steps = ['Container', 'Design', 'Recipients', 'Review', 'Submit'];

export default function CustomizerPage() {
  useReveal();

  const [step, setStep] = useState(1);
  const [container, setContainer] = useState<ContainerKey | null>(null);
  const [engravingText, setEngravingText] = useState('');
  const [includeChippy, setIncludeChippy] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [recipientCount, setRecipientCount] = useState(25);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [designHelp, setDesignHelp] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [orderRef, setOrderRef] = useState('');

  const logoInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const selectedOpt = containerOptions.find((c) => c.key === container);
  const unitPrice = selectedOpt?.price ?? 0;

  const canNext =
    (step === 1 && container !== null) ||
    (step === 2) ||
    (step === 3) ||
    (step === 4) ||
    (step === 5 && email.includes('@'));

  const handleNext = () => {
    if (step === 5) {
      setOrderRef(`SNM-${Date.now().toString(36).toUpperCase()}`);
      setSubmitted(true);
      return;
    }
    if (canNext && step < 5) setStep(step + 1);
  };

  const handleDrop = (setter: (f: File) => void) => (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setter(file);
  };

  const prevent = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className="customizer-page" data-reveal>
      <StepProgress currentStep={step} steps={steps} />

      <div className="step-content">
        {step === 1 && (
          <>
            <h2>Choose Your Container</h2>
            <p>Select the perfect vessel for your custom gift.</p>
            <div className="container-grid" role="radiogroup" aria-label="Container options">
              {containerOptions.map((c) => (
                <article
                  key={c.key}
                  className={`container-card${container === c.key ? ' selected' : ''}`}
                  role="radio"
                  aria-checked={container === c.key}
                  aria-label={`${c.label} — ${c.desc}. From $${c.price}/unit`}
                  tabIndex={0}
                  onClick={() => setContainer(c.key)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setContainer(c.key); }}}
                >
                  <img src={c.image} alt={c.label} />
                  <h3>{c.label}</h3>
                  <p>{c.desc}</p>
                  <span className="price">From ${c.price}/unit</span>
                </article>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Design Your Gift</h2>
            <div className="customizer-form">
              <label className="control-group">
                <span>Engraving Text ({engravingText.length}/30)</span>
                <input
                  value={engravingText}
                  maxLength={30}
                  onChange={(e) => setEngravingText(e.target.value)}
                  placeholder="Your message here..."
                  aria-label="Engraving text"
                />
              </label>

              <label className="checkbox-row">
                <input type="checkbox" checked={includeChippy} onChange={(e) => setIncludeChippy(e.target.checked)} />
                Include Chippy mascot in design
              </label>

              <div>
                <p className="control-label">Logo Upload</p>
                <div
                  className={`dropzone${logoFile ? ' has-file' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={logoFile ? `Logo uploaded: ${logoFile.name}` : 'Upload logo file'}
                  onClick={() => logoInputRef.current?.click()}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); logoInputRef.current?.click(); }}}
                  onDragOver={prevent}
                  onDrop={handleDrop(setLogoFile)}
                >
                  {logoFile ? <span>{logoFile.name} ({(logoFile.size / 1024).toFixed(0)} KB)</span> : <span>Drop SVG, PNG, or JPG here — or click to browse</span>}
                </div>
                <input ref={logoInputRef} type="file" accept=".svg,.png,.jpg,.jpeg" hidden onChange={(e) => { if (e.target.files?.[0]) setLogoFile(e.target.files[0]); }} />
              </div>

              <label className="checkbox-row">
                <input type="checkbox" checked={designHelp} onChange={(e) => setDesignHelp(e.target.checked)} />
                Request design cleanup (our team polishes your artwork)
              </label>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Recipients</h2>
            <div className="customizer-form">
              <div>
                <p className="control-label">Quantity</p>
                <div className="quantity-control">
                  <button type="button" aria-label="Decrease quantity" onClick={() => setRecipientCount(Math.max(12, recipientCount - 1))}>-</button>
                  <input type="number" min={12} value={recipientCount} aria-label="Recipient count" onChange={(e) => setRecipientCount(Math.max(12, Number(e.target.value)))} />
                  <button type="button" aria-label="Increase quantity" onClick={() => setRecipientCount(recipientCount + 1)}>+</button>
                </div>
              </div>

              <div>
                <p className="control-label">Recipient List (CSV/XLSX)</p>
                <div
                  className={`dropzone${csvFile ? ' has-file' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={csvFile ? `File uploaded: ${csvFile.name}` : 'Upload recipient list'}
                  onClick={() => csvInputRef.current?.click()}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); csvInputRef.current?.click(); }}}
                  onDragOver={prevent}
                  onDrop={handleDrop(setCsvFile)}
                >
                  {csvFile ? <span>{csvFile.name}</span> : <span>Drop CSV or XLSX here — or click to browse</span>}
                </div>
                <input ref={csvInputRef} type="file" accept=".csv,.xlsx" hidden onChange={(e) => { if (e.target.files?.[0]) setCsvFile(e.target.files[0]); }} />
              </div>

              <p className="customizer-hint">
                For orders under 5 recipients, please <Link to="/contact">contact us directly</Link>.
              </p>
              <p className="customizer-summary">{recipientCount} gifts will be shipped directly to recipients</p>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2>Review Your Order</h2>
            <div className="review-table">
              <div className="review-row">
                <span className="label">Container</span>
                <span className="value">{selectedOpt?.label ?? 'None'}</span>
                <button className="edit-link" type="button" aria-label="Edit container selection" onClick={() => setStep(1)}>Edit</button>
              </div>
              <div className="review-row">
                <span className="label">Engraving</span>
                <span className="value">{engravingText || '(none)'}</span>
                <button className="edit-link" type="button" aria-label="Edit engraving text" onClick={() => setStep(2)}>Edit</button>
              </div>
              <div className="review-row">
                <span className="label">Logo</span>
                <span className="value">{logoFile?.name ?? 'None'}</span>
                <button className="edit-link" type="button" aria-label="Edit logo upload" onClick={() => setStep(2)}>Edit</button>
              </div>
              <div className="review-row">
                <span className="label">Chippy</span>
                <span className="value">{includeChippy ? 'Yes' : 'No'}</span>
              </div>
              <div className="review-row">
                <span className="label">Design Cleanup</span>
                <span className="value">{designHelp ? 'Requested' : 'Not requested'}</span>
              </div>
              <div className="review-row">
                <span className="label">Quantity</span>
                <span className="value">{recipientCount}</span>
                <button className="edit-link" type="button" aria-label="Edit recipient quantity" onClick={() => setStep(3)}>Edit</button>
              </div>
              <div className="review-row">
                <span className="label">Estimated Total</span>
                <span className="value review-total">${(recipientCount * unitPrice).toLocaleString()}</span>
              </div>
              <div className="review-row">
                <span className="label">Lead Time</span>
                <span className="value">7-10 business days after approval</span>
              </div>
            </div>
          </>
        )}

        {step === 5 && !submitted && (
          <>
            <h2>Submit Your Order</h2>
            <div className="customizer-form customizer-form--narrow">
              <label className="control-group">
                <span>Email Address</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required aria-label="Email address" />
              </label>
              <p className="customizer-hint">
                We&apos;ll send an order confirmation and follow up within 1 business day.
              </p>
            </div>
          </>
        )}

        {step === 5 && submitted && (
          <div className="success-state">
            <img src="/brand/chippy.png" alt="Chippy celebrating" />
            <h2>Order Submitted!</h2>
            <span className="ref">{orderRef}</span>
            <p>We&apos;ll be in touch within 1 business day to confirm your order details.</p>
            <Link to="/" className="btn btn-primary success-back-link">Back to Home</Link>
          </div>
        )}
      </div>

      {!submitted && (
        <div className="step-nav" role="navigation" aria-label="Customizer step navigation">
          {step > 1 && <button className="btn btn-secondary" type="button" aria-label="Go to previous step" onClick={() => setStep(step - 1)}>Back</button>}
          <button className="btn btn-primary" type="button" disabled={!canNext} aria-label={step === 5 ? 'Submit your order' : 'Continue to next step'} onClick={handleNext}>
            {step === 5 ? 'Submit Order' : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
}
