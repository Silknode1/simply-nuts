import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { SHOP_URL } from '../config'

type NavLink = { to: string; label: string; external?: boolean }

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links: NavLink[] = [
    { to: SHOP_URL, label: 'Shop', external: true },
    { to: '/corporate', label: 'Corporate Gifting' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]

  const isActive = (link: NavLink) => !link.external && location.pathname === link.to

  const linkClass = (active: boolean) =>
    `text-sm font-semibold tracking-wide transition-colors no-underline ${
      active ? 'text-gold-400' : 'text-wood-100 hover:text-gold-300'
    }`

  const renderLink = (link: NavLink, onClick?: () => void, block = false) => {
    const cls = `${block ? 'block py-2.5 ' : ''}${linkClass(isActive(link))}`
    return link.external ? (
      <a key={link.label + link.to} href={link.to} className={cls} onClick={onClick}>
        {link.label}
      </a>
    ) : (
      <Link key={link.label + link.to} to={link.to} className={cls} onClick={onClick}>
        {link.label}
      </Link>
    )
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-wood-950/95 backdrop-blur-md border-b border-wood-800 shadow-lg'
          : 'bg-wood-950/80 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 no-underline" aria-label="Simply Nuts & More home">
            <img
              src="/brand/logo-main.png"
              alt=""
              aria-hidden="true"
              className="h-9 w-auto rounded-sm bg-cream/95 p-0.5"
            />
            <span className="font-display text-lg font-bold text-gold-400 hidden sm:inline">
              Simply Nuts &amp; More
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7">
            {links.map((link) => renderLink(link))}
            <a
              href={SHOP_URL}
              className="ml-1 inline-flex items-center rounded-full bg-burn hover:bg-burn-light px-5 py-2 text-sm font-bold text-white no-underline transition-colors"
            >
              Shop Now
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-wood-100 hover:text-gold-400 bg-transparent border-none cursor-pointer"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div id="mobile-menu" className="md:hidden bg-wood-950 border-t border-wood-800 px-4 pb-5 pt-1">
          {links.map((link) => renderLink(link, () => setMobileOpen(false), true))}
          <a
            href={SHOP_URL}
            className="mt-3 block text-center rounded-full bg-burn hover:bg-burn-light px-5 py-3 text-sm font-bold text-white no-underline transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Shop Now
          </a>
        </div>
      )}
    </nav>
  )
}
