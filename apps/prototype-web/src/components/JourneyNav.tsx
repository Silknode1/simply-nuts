import { Link } from 'react-router-dom';
import { SHOP_URL } from '../config';

/**
 * JourneyNav — the floating warm-glass nav for the immersive island journey.
 * A single pill panel (blur stays panel-sized, never full-width over the
 * canvas). Secondary links collapse away on small screens; Shop Now stays.
 */
export default function JourneyNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-3 px-3 pointer-events-none">
      <nav
        className="glass glass-nav pointer-events-auto flex items-center gap-1.5 sm:gap-3 max-w-full"
        aria-label="Primary"
      >
        <Link
          to="/"
          className="flex items-center no-underline shrink-0 pl-1"
          aria-label="Simply Nuts & More home"
        >
          <img
            src="/brand/logo-wordmark.webp"
            alt="Simply Nuts & More"
            className="h-8 sm:h-9 w-auto drop-shadow-sm"
            draggable={false}
          />
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link to="/corporate" className="glass-pill text-cream/90 hover:text-gold-300">
            Corporate Gifting
          </Link>
          <Link to="/about" className="glass-pill text-cream/90 hover:text-gold-300">
            About
          </Link>
          <Link to="/contact" className="glass-pill text-cream/90 hover:text-gold-300">
            Contact
          </Link>
        </div>

        {/* compact companion link on small screens */}
        <Link to="/corporate" className="glass-pill md:hidden text-cream/90 text-sm">
          Corporate
        </Link>

        <a href={SHOP_URL} className="glass-pill glass-pill--solid shrink-0">
          Shop Now
        </a>
      </nav>
    </header>
  );
}
