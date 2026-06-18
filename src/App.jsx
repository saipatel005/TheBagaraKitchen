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

const AppContent = () => {
  const { user } = useAuth();
  const { isLoaded } = useData();
  const [view, setView] = useState('public'); // 'public', 'login', 'dashboard'
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setView('dashboard');
    } else {
      setView('public');
    }
  }, [user]);

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

  // 2. Main Role-Based Routing
  if (user && view === 'dashboard') {
    if (user.role === 'admin') {
      return <AdminDashboard onGoToPublic={() => setView('public')} />;
    }
    if (user.role === 'manager') {
      return <ManagerDashboard onGoToPublic={() => setView('public')} />;
    }
  }

  if (view === 'login') {
    return <Login onCancel={() => setView('public')} />;
  }

  return (
    <div className="bg-[#00251e] text-[#e2e2e2] min-h-screen selection:bg-primary selection:text-white overflow-x-hidden antialiased">
      {/* Sticky Top Navigation */}
      <Navbar 
        onBookClick={handleOpenBooking} 
        onLoginClick={() => setView('login')}
        onDashboardClick={() => setView('dashboard')} // Return back to dashboard controls
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

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
