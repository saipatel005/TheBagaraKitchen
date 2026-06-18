import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataProvider';
import { useData } from './context/DataContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Menu from './components/Menu';
import Banquet from './components/Banquet';
import PDR from './components/PDR';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import Logo from './components/Logo';

import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

const PublicView = ({ handleOpenBooking, handleCloseBooking, isBookingOpen, handleOrderClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.toLowerCase().replace(/\/$/, "");
    let targetId = '';
    
    if (path === '/about') targetId = '#about';
    else if (path === '/menu') targetId = '#menu';
    else if (path === '/banquet') targetId = '#banquet';
    else if (path === '/pdr') targetId = '#pdr';
    else if (path === '/gallery') targetId = '#gallery';
    else if (path === '/contact') targetId = '#contact';
    else if (path === '/' || path === '') targetId = '#home';

    if (targetId) {
      const timer = setTimeout(() => {
        const element = document.querySelector(targetId);
        if (element) {
          const offsetTop = element.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        } else if (targetId === '#home') {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return (
    <div className="bg-[#00251e] text-[#e2e2e2] min-h-screen selection:bg-primary selection:text-white overflow-x-hidden antialiased">
      {/* Sticky Top Navigation */}
      <Navbar 
        onBookClick={handleOpenBooking} 
        onLoginClick={() => navigate('/login')}
        onDashboardClick={() => navigate('/dashboard')}
      />

      {/* Hero Header & Effervescent Particle Backdrop */}
      <Hero onOrderClick={handleOrderClick} />

      {/* About Nizami Heritage and Interior preview */}
      <About />

      {/* Interactive Menu Filtering explorer */}
      <Menu />

      {/* Banquet space showcase & bookings */}
      <Banquet onOpenBooking={handleOpenBooking} />

      {/* Private Dining Room section */}
      <PDR />

      {/* Dynamic Gallery Grid Showcase */}
      <Gallery />

      {/* Operations, Operating hours, and Inquiry Forms */}
      <Contact />

      {/* Footer Nav & Corporate copyrights */}
      <Footer />

      {/* Booking Form Modal */}
      <BookingModal isOpen={isBookingOpen} onClose={handleCloseBooking} />
    </div>
  );
};

const LoginRoute = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login onCancel={() => navigate('/')} />;
};

const DashboardRoute = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard onGoToPublic={() => navigate('/')} />;
  }
  if (user.role === 'manager') {
    return <ManagerDashboard onGoToPublic={() => navigate('/')} />;
  }

  return <Navigate to="/" replace />;
};

const AppContent = () => {
  const { isLoaded } = useData();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleOpenBooking = () => {
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
  };

  const handleOrderClick = () => {
    const menuElement = document.querySelector('#menu');
    if (menuElement) {
      const offsetTop = menuElement.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  // 1. Startup Dynamic Loader (Displays while DB API initializes)
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#00251e] flex flex-col items-center justify-center relative overflow-hidden font-body">
        {/* Glowing backdrop leaks */}
        <div className="absolute w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col items-center gap-6 relative z-10 animate-pulse duration-1000">
          <Logo className="w-40 h-40 md:w-48 md:h-48 text-primary drop-shadow-[0_0_20px_rgba(197,160,89,0.3)]" />
          <div className="text-center space-y-1">
            <h2 className="font-headline text-2xl text-white font-semibold tracking-wide">The Bagara Kitchen</h2>
            <p className="text-[10px] text-secondary font-bold uppercase tracking-[0.2em] mt-1">Loading Royal Heritage...</p>
          </div>
        </div>
      </div>
    );
  }

  const publicRoutes = ["/", "/about", "/menu", "/banquet", "/pdr", "/gallery", "/contact"];

  return (
    <Routes>
      {publicRoutes.map((path) => (
        <Route 
          key={path}
          path={path} 
          element={
            <PublicView 
              handleOpenBooking={handleOpenBooking} 
              handleCloseBooking={handleCloseBooking} 
              isBookingOpen={isBookingOpen} 
              handleOrderClick={handleOrderClick} 
            />
          } 
        />
      ))}
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/dashboard" element={<DashboardRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <AppContent />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
