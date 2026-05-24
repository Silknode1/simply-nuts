import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { SHOP_URL } from '../config'

type NavLink = { to: string; label: string; external?: boolean }

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const links: NavLink[] = [
    { to: '/', label: 'Home' },
    { to: SHOP_URL, label: 'Shop', external: true },
    { to: '/contact', label: 'Corporate Gifting' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]

  const isActive = (link: NavLink) => !link.external && location.pathname === link.to

  const linkClass = (active: boolean) =>
    `text-sm font-medium transition-colors no-underline ${
      active ? 'text-gold-400' : 'text-wood-200 hover:text-gold-300'
    }`

  const renderLink = (link: NavLink, onClick?: () => void, block = false) => {
    const cls = `${block ? 'block py-2 ' : ''}${linkClass(isActive(link))}`
    return link.external ? (
      <a key={link.label} href={link.to} className={cls} onClick={onClick}>
        {link.label}
      </a>
    ) : (
      <Link key={link.label} to={link.to} className={cls} onClick={onClick}>
        {link.label}
      </Link>
    )
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-wood-950/95 backdrop-blur-md border-b border-wood-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="text-2xl">🥜</span>
            <span className="font-display text-xl font-bold text-gold-400">
              Simply Nuts
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => renderLink(link))}
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-wood-200 hover:text-gold-400 bg-transparent border-none cursor-pointer"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-wood-950 border-t border-wood-800 px-4 pb-4">
          {links.map((link) => renderLink(link, () => setMobileOpen(false), true))}
        </div>
      )}
    </nav>
  )
}
