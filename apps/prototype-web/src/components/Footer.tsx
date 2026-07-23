import { Link } from 'react-router-dom'
import { SHOP_URL, SHOP_COLLECTIONS, SHOP_GIFT_CARDS } from '../config'

export default function Footer() {
  return (
    <footer className="bg-wood-950 text-wood-300 border-t border-wood-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="/brand/logo-main.png"
                alt=""
                aria-hidden="true"
                className="h-10 w-auto rounded-sm bg-cream/95 p-0.5"
              />
              <span className="font-display text-lg font-bold text-gold-400">Simply Nuts &amp; More</span>
            </div>
            <p className="text-sm text-wood-400 leading-relaxed">
              Family-crafted nuts, trail mixes, and chocolates — roasted in small batches in Chanhassen,
              Minnesota since 1986. A State Fair favorite for 40 years.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-display font-semibold text-gold-400 mb-3">Shop</h4>
            <ul className="space-y-2 text-sm list-none p-0">
              <li><a href={SHOP_URL} className="hover:text-gold-300 text-wood-400 no-underline">All Treats</a></li>
              <li><a href={SHOP_COLLECTIONS.nuts} className="hover:text-gold-300 text-wood-400 no-underline">Nuts</a></li>
              <li><a href={SHOP_COLLECTIONS.trailMixes} className="hover:text-gold-300 text-wood-400 no-underline">Trail Mixes</a></li>
              <li><a href={SHOP_COLLECTIONS.chocolates} className="hover:text-gold-300 text-wood-400 no-underline">Chocolates</a></li>
              <li><a href={SHOP_GIFT_CARDS} className="hover:text-gold-300 text-wood-400 no-underline">Gift Cards</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-gold-400 mb-3">Company</h4>
            <ul className="space-y-2 text-sm list-none p-0">
              <li><Link to="/about" className="hover:text-gold-300 text-wood-400 no-underline">About Us</Link></li>
              <li><Link to="/corporate" className="hover:text-gold-300 text-wood-400 no-underline">Corporate Gifting</Link></li>
              <li><Link to="/contact" className="hover:text-gold-300 text-wood-400 no-underline">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-gold-400 mb-3">Get in Touch</h4>
            <ul className="space-y-2 text-sm list-none p-0 text-wood-400">
              <li>Chanhassen, Minnesota</li>
              <li><a href="tel:18884496887" className="hover:text-gold-300 text-wood-400 no-underline">1-888-449-6887</a></li>
              <li>Family-run since 1986</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-wood-800 text-center text-xs text-wood-500">
          &copy; {new Date().getFullYear()} Simply Nuts &amp; More. Family-crafted in Minnesota since 1986.
        </div>
      </div>
    </footer>
  )
}
