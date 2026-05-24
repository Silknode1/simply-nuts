import { Link } from 'react-router-dom'
import { SHOP_URL, SHOP_COLLECTIONS } from '../config'

export default function Footer() {
  return (
    <footer className="bg-wood-950 text-wood-300 border-t border-wood-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🥜</span>
              <span className="font-display text-lg font-bold text-gold-400">
                Simply Nuts
              </span>
            </div>
            <p className="text-sm text-wood-400">
              Custom laser-engraved corporate gifts filled with premium nuts.
              Show your clients you care.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-gold-400 mb-3">Shop</h4>
            <ul className="space-y-2 text-sm list-none p-0">
              <li><a href={SHOP_URL} className="hover:text-gold-300 text-wood-400 no-underline">All Treats</a></li>
              <li><a href={SHOP_COLLECTIONS.nuts} className="hover:text-gold-300 text-wood-400 no-underline">Nuts</a></li>
              <li><a href={SHOP_COLLECTIONS.trailMixes} className="hover:text-gold-300 text-wood-400 no-underline">Trail Mixes</a></li>
              <li><a href={SHOP_COLLECTIONS.chocolates} className="hover:text-gold-300 text-wood-400 no-underline">Chocolates</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-gold-400 mb-3">Company</h4>
            <ul className="space-y-2 text-sm list-none p-0">
              <li><Link to="/about" className="hover:text-gold-300 text-wood-400 no-underline">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-gold-300 text-wood-400 no-underline">Corporate Gifting</Link></li>
              <li><Link to="/contact" className="hover:text-gold-300 text-wood-400 no-underline">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-gold-400 mb-3">Get in Touch</h4>
            <ul className="space-y-2 text-sm list-none p-0 text-wood-400">
              <li>hello@simplynuts.com</li>
              <li>(555) 123-NUTS</li>
              <li>Mon-Fri 9am-5pm EST</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-wood-800 text-center text-xs text-wood-500">
          &copy; {new Date().getFullYear()} Simply Nuts. All rights reserved. Made with care for your corporate gifting needs.
        </div>
      </div>
    </footer>
  )
}
