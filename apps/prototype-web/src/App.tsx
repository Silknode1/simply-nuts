import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// three.js is heavy — keep it out of the landing-page bundle
const FloatingIslandHero3D = lazy(() => import('./components/FloatingIslandHero3D'));
const FloatingIslandHeroCanvas = lazy(() => import('./components/FloatingIslandHeroCanvas'));

/** Chrome-free header for the 3D journey: just the logo, floating over the scene. */
function JourneyHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 pointer-events-none">
      <Link to="/" className="pointer-events-auto no-underline" aria-label="Simply Nuts & More home">
        <img
          src="/brand/logo-main.png"
          alt="Simply Nuts & More"
          className="h-12 w-auto rounded-md bg-cream/95 p-1 shadow-md"
        />
      </Link>
    </header>
  );
}

function Shell() {
  const { pathname } = useLocation();
  // The island routes are a self-contained 3D scroll journey — no nav chrome
  // (logo only) and the page ends where the pinned scroll ends, with no
  // footer below to scroll into.
  const immersive = pathname === '/island' || pathname === '/island-2d';
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {immersive ? <JourneyHeader /> : <Navbar />}
      <main id="main-content" className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/island" element={<Suspense fallback={null}><FloatingIslandHero3D /></Suspense>} />
          <Route path="/island-2d" element={<Suspense fallback={null}><FloatingIslandHeroCanvas /></Suspense>} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>
      {!immersive && <Footer />}
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
