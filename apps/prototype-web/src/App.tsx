import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import JourneyNav from './components/JourneyNav';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CorporateGiftingPage from './pages/CorporateGiftingPage';

// three.js is heavy — keep it (and the whole journey) out of the shared bundle
const JourneyPage = lazy(() => import('./pages/JourneyPage'));
const FloatingIslandHeroCanvas = lazy(() => import('./components/FloatingIslandHeroCanvas'));

function Shell() {
  const { pathname } = useLocation();
  // The homepage is the full scroll journey: the pinned 3D orchard followed by
  // the tonal content rooms. It gets the floating glass JourneyNav instead of
  // the standard bar. The bare /island-2d fallback stays fully chrome-free.
  const journey = pathname === '/';
  const immersive = journey || pathname === '/island-2d';
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {immersive ? <JourneyNav /> : <Navbar />}
      <main id="main-content" className="flex-1">
        <Routes>
          <Route path="/" element={<Suspense fallback={null}><JourneyPage /></Suspense>} />
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
