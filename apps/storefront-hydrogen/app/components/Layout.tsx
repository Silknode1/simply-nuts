import type {ReactNode} from 'react';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Shared layout shell for the Hydrogen storefront.
 * Will be populated with Navbar, Footer, and CartDrawer
 * as they are migrated from the prototype.
 */
export function Layout({children}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header>
        <nav>
          <a href="/">Simply Nuts &amp; More</a>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer>
        <p>&copy; {new Date().getFullYear()} Simply Nuts &amp; More</p>
      </footer>
    </div>
  );
}
