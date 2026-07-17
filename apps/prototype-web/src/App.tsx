import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import JourneyNav from './components/JourneyNav';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CorporateGiftingPage from './pages/CorporateGiftingPage';

// three.js is heavy — keep it out of the shared bundle
const FloatingIslandHero3D = lazy(() => import('./components/FloatingIslandHero3D'));
const FloatingIslandHeroCanvas = lazy(() => import('./components/FloatingIslandHeroCanvas'));

function Shell() {
  const { pathname } = useLocation();
  // The island journey IS the homepage — a self-contained 3D scroll story.
  // It gets the floating glass JourneyNav (no standard chrome) and no footer,
  // so the page scroll ends exactly where the pinned journey ends.
  const immersive = pathname === '/' || pathname === '/island-2d';
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {immersive ? <JourneyNav /> : <Navbar />}
      <main id="main-content" className="flex-1">
        <Routes>
          <Route path="/" element={<Suspense fallback={null}><FloatingIslandHero3D /></Suspense>} />
          {/* legacy route from the /island preview era */}
          <Route path="/island" element={<Navigate to="/" replace />} />
          <Route path="/island-2d" element={<Suspense fallback={null}><FloatingIslandHeroCanvas /></Suspense>} />
          <Route path="/corporate" element={<CorporateGiftingPage />} />
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
