import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Logo from '../components/Logo';
import { 
  LogOut, 
  BarChart3, 
  CalendarDays, 
  Mail, 
  Settings, 
  Phone,
  Check, 
  X, 
  Clock, 
  Trash2,
  XCircle,
  Sliders, 
  Save, 
  MessageSquare,
  Shield,
  Layers,
  Database,
  Users,
  UserPlus,
  Loader2,
  Menu as MenuIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, onSnapshot } from 'firebase/firestore';
import { getApps, initializeApp, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';

const AdminDashboard = ({ onGoToPublic }) => {
  const { logout, user, isFirebaseConfigured } = useAuth();
  const { 
    menuItems, 
    bookings, 
    messages, 
    cloudinarySettings, 
    updateBookingStatus, 
    deleteBooking,
    pdrBookings,
    updatePdrBookingStatus,
    deletePdrBooking,
    deleteMessage,
    updateMessageStatus,
    updateCloudinarySettings,
    managerMenuEditingEnabled,
    managerGalleryEditingEnabled,
    managerSettingsEditingEnabled,
    managerBookingsEditingEnabled,
    pdrPaymentEnabled,
    updateManagerMenuEditingEnabled,
    updateManagerGalleryEditingEnabled,
    updateManagerSettingsEditingEnabled,
    updateManagerBookingsEditingEnabled,
    updatePdrPaymentEnabled,
    advanceAmount,
    updateAdvanceAmount,
    pdrSettings,
    updatePdrSettings
  } = useData();

  const [activeTab, setActiveTab] = useState('bookings');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [bookingFilter, setBookingFilter] = useState('upcoming');

  // Dynamic timezone-safe local date YYYY-MM-DD
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayString = `${yyyy}-${mm}-${dd}`;
  
  // Cloudinary Settings Form State
  const [cloudName, setCloudName] = useState(cloudinarySettings.cloudName || 'demo');
  const [uploadPreset, setUploadPreset] = useState(cloudinarySettings.uploadPreset || 'unsigned_preset');
  const [localAdvanceAmount, setLocalAdvanceAmount] = useState(advanceAmount || '5000');
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // PDR Settings Form State
  const [pdr1Capacity, setPdr1Capacity] = useState(pdrSettings?.room1?.capacity || '20');
  const [pdr1Price, setPdr1Price] = useState(pdrSettings?.room1?.price || '5000');
  const [pdr2Capacity, setPdr2Capacity] = useState(pdrSettings?.room2?.capacity || '40');
  const [pdr2Price, setPdr2Price] = useState(pdrSettings?.room2?.price || '8000');
  const [pdrSuccess, setPdrSuccess] = useState(false);

  // Managers registry states
  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [managerName, setManagerName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [managerPassword, setManagerPassword] = useState('');
  const [managerRole, setManagerRole] = useState('manager');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Dynamic list loader with real-time updates
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      setLoadingManagers(true);
      const unsubscribe = onSnapshot(collection(db, 'managers'), (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data());
        });
        setManagers(list);
        setLoadingManagers(false);
      }, (e) => {
        console.error("Error loading managers in real-time from Firestore:", e);
        setLoadingManagers(false);
      });
      return () => unsubscribe();
    } else {
      const saved = localStorage.getItem('tbk_managers');
      if (saved) {
        try {
          setManagers(JSON.parse(saved));
        } catch(e){}
      }
    }
  }, [isFirebaseConfigured]);

  const handleCreateManager = async (e) => {
    e.preventDefault();
    if (!managerName || !managerEmail || !managerPassword) {
      setCreateError('Please fill out all fields.');
      return;
    }
    if (managerPassword.length < 6) {
      setCreateError('Password must be at least 6 characters long.');
      return;
    }

    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(false);

    const emailClean = managerEmail.toLowerCase().trim();

    if (managers.some(m => m.email.toLowerCase().trim() === emailClean)) {
      setCreateError('An account with this email already exists.');
      setCreateLoading(false);
      return;
    }

    try {
      if (isFirebaseConfigured && db) {
        const firebaseConfig = {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: import.meta.env.VITE_FIREBASE_APP_ID,
        };

        let secondaryApp;
        if (getApps().some(app => app.name === 'secondary')) {
          secondaryApp = getApp('secondary');
        } else {
          secondaryApp = initializeApp(firebaseConfig, 'secondary');
        }

        const secondaryAuth = getAuth(secondaryApp);
        try {
          await createUserWithEmailAndPassword(secondaryAuth, emailClean, managerPassword);
          await firebaseSignOut(secondaryAuth);
        } catch (authErr) {
          // If the auth profile already exists (e.g. it was deleted from Firestore but remains in Auth),
          // we can catch the error and proceed to restore the Firestore document registry.
          if (authErr.code === 'auth/email-already-in-use') {
            console.log('Firebase Auth credentials already exist for this user. Restoring Firestore registry document.');
          } else {
            throw authErr;
          }
        }

        const newManager = {
          name: managerName,
          email: emailClean,
          role: managerRole,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'managers', emailClean), newManager);
      } else {
        const newManager = {
          name: managerName,
          email: emailClean,
          password: managerPassword,
          role: managerRole,
          createdAt: new Date().toISOString()
        };

        const updatedList = [...managers, newManager];
        localStorage.setItem('tbk_managers', JSON.stringify(updatedList));
        setManagers(updatedList);
      }

      setCreateSuccess(true);
      setManagerName('');
      setManagerEmail('');
      setManagerPassword('');
      setManagerRole('manager');
      setTimeout(() => setCreateSuccess(false), 3000);
    } catch (err) {
      console.error('Error creating account:', err);
      setCreateError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteManager = async (email) => {
    const account = managers.find(m => m.email.toLowerCase().trim() === email.toLowerCase().trim());
    const roleLabel = account ? (account.role === 'admin' ? 'Administrator' : 'Manager') : 'staff';

    if (!window.confirm(`Are you sure you want to delete the ${roleLabel} account for "${email}"?`)) {
      return;
    }

    const emailClean = email.toLowerCase().trim();

    try {
      if (isFirebaseConfigured && db) {
        await deleteDoc(doc(db, 'managers', emailClean));
      } else {
        const updatedList = managers.filter(m => m.email.toLowerCase().trim() !== emailClean);
        localStorage.setItem('tbk_managers', JSON.stringify(updatedList));
        setManagers(updatedList);
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      alert('Failed to delete account. Please try again.');
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateCloudinarySettings({ cloudName, uploadPreset });
    updateAdvanceAmount(localAdvanceAmount);
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-950/40 border border-emerald-500/80 text-emerald-400';
      case 'Completed':
        return 'bg-blue-950/40 border border-blue-500/80 text-blue-400';
      case 'Rejected':
        return 'bg-red-950/40 border border-red-500/80 text-red-400';
      case 'Pending':
      default:
        return 'bg-amber-950/40 border border-primary/80 text-primary';
    }
  };

  return (
    <div className="min-h-screen bg-[#001b16] text-[#e2e2e2] flex flex-col font-body">
      
      {/* Upper Dashboard Header */}
      <header className="bg-surface-low border-b border-outline-variant/35 py-4 px-6 md:px-8 flex justify-between items-center shadow-lg sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Logo className="w-9 h-9 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-white font-headline font-bold text-[14px] min-[360px]:text-base tracking-wider leading-none uppercase">
              THE BAGARA KITCHEN
            </span>
            <span className="text-[9px] text-on-surface-variant/80 font-light mt-1 flex items-center gap-1">
              <Shield size={9} className="text-secondary" /> Admin Console
            </span>
          </div>
        </div>

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-white">{user.name}</p>
            <p className="text-[10px] text-on-surface-variant font-light">{user.email}</p>
          </div>
          <button 
            onClick={onGoToPublic}
            className="flex items-center gap-2 bg-surface hover:bg-surface-high border border-outline-variant/30 text-secondary hover:text-white rounded-lg text-xs font-semibold py-2 px-3 transition-all duration-300 cursor-pointer"
          >
            View Live Site
          </button>
          <button 
            onClick={logout}
            className="flex items-center gap-2 bg-surface hover:bg-surface-high border border-outline-variant/30 hover:border-red-500/40 hover:text-red-400 rounded-lg text-xs font-semibold py-2 px-3 transition-all duration-300 cursor-pointer"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden text-primary flex-shrink-0 focus:outline-none p-1 transition-transform duration-200 active:scale-90 cursor-pointer"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Blurred Glassmorphic Backdrop for Click-Outside Dismissals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-0 top-[70px] z-40 lg:hidden bg-[#001c16]/98 backdrop-blur-lg border-b border-outline-variant/30 py-6 px-6 flex flex-col gap-5 shadow-2xl shadow-black/80"
            >
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-3 mb-1">Systems Controls</p>
                
                <button
                  onClick={() => { setActiveTab('bookings'); setIsMobileMenuOpen(false); }}
                  disabled={activeTab === 'bookings'}
                  className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                    activeTab === 'bookings'
                      ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                      : 'text-on-surface-variant hover:text-white hover:bg-surface-low cursor-pointer'
                  }`}
                >
                  <CalendarDays size={16} />
                  Event Planners
                </button>

                <button
                  onClick={() => { setActiveTab('pdrBookings'); setIsMobileMenuOpen(false); }}
                  disabled={activeTab === 'pdrBookings'}
                  className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                    activeTab === 'pdrBookings'
                      ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                      : 'text-on-surface-variant hover:text-white hover:bg-surface-low cursor-pointer'
                  }`}
                >
                  <CalendarDays size={16} />
                  PDR Reservations
                </button>

                <button
                  onClick={() => { setActiveTab('messages'); setIsMobileMenuOpen(false); }}
                  disabled={activeTab === 'messages'}
                  className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                    activeTab === 'messages'
                      ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                      : 'text-on-surface-variant hover:text-white hover:bg-surface-low cursor-pointer'
                  }`}
                >
                  <Mail size={16} />
                  Guest Inquiries
                </button>

                <button
                  onClick={() => { setActiveTab('permissions'); setIsMobileMenuOpen(false); }}
                  disabled={activeTab === 'permissions'}
                  className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                    activeTab === 'permissions'
                      ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                      : 'text-on-surface-variant hover:text-white hover:bg-surface-low cursor-pointer'
                  }`}
                >
                  <Shield size={16} />
                  Operations Controls
                </button>

                <button
                  onClick={() => { setActiveTab('pdr'); setIsMobileMenuOpen(false); }}
                  disabled={activeTab === 'pdr'}
                  className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                    activeTab === 'pdr'
                      ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                      : 'text-on-surface-variant hover:text-white hover:bg-surface-low cursor-pointer'
                  }`}
                >
                  <Settings size={16} />
                  PDR Configurations
                </button>

                <button
                  onClick={() => { setActiveTab('cloudinary'); setIsMobileMenuOpen(false); }}
                  disabled={activeTab === 'cloudinary'}
                  className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                    activeTab === 'cloudinary'
                      ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                      : 'text-on-surface-variant hover:text-white hover:bg-surface-low cursor-pointer'
                  }`}
                >
                  <Settings size={16} />
                  API & Payments
                </button>

                <button
                  onClick={() => { setActiveTab('staff'); setIsMobileMenuOpen(false); }}
                  disabled={activeTab === 'staff'}
                  className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                    activeTab === 'staff'
                      ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                      : 'text-on-surface-variant hover:text-white hover:bg-surface-low cursor-pointer'
                  }`}
                >
                  <Users size={16} />
                  Manage Staff
                </button>
              </div>

              {/* Mobile Drawer Actions & Info */}
              <div className="border-t border-outline-variant/20 pt-4 flex flex-col gap-3">
                <div className="px-3 text-xs text-on-surface-variant/80">
                  <p className="font-semibold text-white">Logged in as:</p>
                  <p className="truncate mt-0.5">{user.name} ({user.email})</p>
                </div>
                <div className="flex gap-2 w-full mt-2">
                  <button 
                    onClick={() => { onGoToPublic(); setIsMobileMenuOpen(false); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-surface hover:bg-surface-high border border-outline-variant/30 text-secondary hover:text-white rounded-xl text-xs font-semibold py-3 transition-all cursor-pointer duration-300"
                  >
                    View Live Site
                  </button>
                  <button 
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-surface hover:bg-surface-high border border-outline-variant/30 hover:border-red-500/40 hover:text-red-400 rounded-xl text-xs font-semibold py-3 transition-all cursor-pointer duration-300"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Core Dashboard Layout */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-8 max-w-7xl mx-auto w-full items-start">
        
        {/* SIDE BAR: Navigation & Analytics Summary */}
        <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] overflow-y-auto pr-1 pb-4 custom-scrollbar">
          
          {/* Active Navigation Tabs */}
          <div className="hidden lg:block bg-surface border border-outline-variant/35 rounded-2xl p-4 shadow-xl space-y-1">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-3 mb-2">Systems Controls</p>
            
            <button
              onClick={() => setActiveTab('bookings')}
              disabled={activeTab === 'bookings'}
              className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                activeTab === 'bookings'
                  ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                  : 'text-on-surface-variant hover:text-white hover:bg-surface-low cursor-pointer'
              }`}
            >
              <CalendarDays size={16} />
              Event Planners
            </button>

            <button
              onClick={() => setActiveTab('pdrBookings')}
              disabled={activeTab === 'pdrBookings'}
              className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                activeTab === 'pdrBookings'
                  ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                  : 'text-on-surface-variant hover:text-white hover:bg-surface-low cursor-pointer'
              }`}
            >
              <CalendarDays size={16} />
              PDR Reservations
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              disabled={activeTab === 'messages'}
              className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                activeTab === 'messages'
                  ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                  : 'text-on-surface-variant hover:text-white hover:bg-surface-low cursor-pointer'
              }`}
            >
              <Mail size={16} />
              Guest Inquiries
            </button>

            <button
              onClick={() => setActiveTab('permissions')}
              disabled={activeTab === 'permissions'}
              className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                activeTab === 'permissions'
                  ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                  : 'text-on-surface-variant hover:text-white hover:bg-surface-low cursor-pointer'
              }`}
            >
              <Shield size={16} />
              Operations Controls
            </button>

            <button
              onClick={() => setActiveTab('pdr')}
              disabled={activeTab === 'pdr'}
              className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                activeTab === 'pdr'
                  ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                  : 'text-on-surface-variant hover:text-white hover:bg-surface-low cursor-pointer'
              }`}
            >
              <Settings size={16} />
              PDR Configurations
            </button>

            <button
              onClick={() => setActiveTab('cloudinary')}
              disabled={activeTab === 'cloudinary'}
              className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                activeTab === 'cloudinary'
                  ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                  : 'text-on-surface-variant hover:text-white hover:bg-surface-low cursor-pointer'
              }`}
            >
              <Settings size={16} />
              API & Payments
            </button>

            <button
              onClick={() => setActiveTab('staff')}
              disabled={activeTab === 'staff'}
              className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                activeTab === 'staff'
                  ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                  : 'text-on-surface-variant hover:text-white hover:bg-surface-low cursor-pointer'
              }`}
            >
              <Users size={16} />
              Manage Staff
            </button>
          </div>

          {/* Quick Analytics Summary Box */}
          <div className="bg-surface border border-outline-variant/35 rounded-2xl p-5 shadow-xl space-y-5">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5 border-b border-outline-variant/15 pb-2">
              <BarChart3 size={12} className="text-secondary" /> Database Analytics
            </p>

            <div className="grid grid-cols-1 gap-4">


              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                  <CalendarDays size={14} className="text-primary" /> Bookings
                </div>
                <span className="text-sm font-bold text-white bg-surface-low border border-outline-variant/30 px-2.5 py-0.5 rounded-full">{bookings.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                  <MessageSquare size={14} className="text-primary" /> Guest Messages
                </div>
                <span className="text-sm font-bold text-white bg-surface-low border border-outline-variant/30 px-2.5 py-0.5 rounded-full">{messages.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                  <Users size={14} className="text-primary" /> Active Managers
                </div>
                <span className="text-sm font-bold text-white bg-surface-low border border-outline-variant/30 px-2.5 py-0.5 rounded-full">{managers.length}</span>
              </div>
            </div>
          </div>

        </div>

        {/* MAIN PANEL CONTENT */}
        <div className="lg:col-span-9 space-y-6">
          
          {activeTab === 'bookings' && (
            // TAB 1: Banquet bookings manager
            <div className="bg-surface border border-outline-variant/35 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
              <div className="border-b border-outline-variant/20 pb-4">
                <h2 className="font-headline text-2xl text-white font-bold flex items-center gap-2">
                  <CalendarDays className="text-secondary" /> Banquet Bookings Coordinator
                </h2>
                <p className="text-xs text-on-surface-variant font-light mt-1">Review event requests, guest capacity slots, and catering allocations.</p>
              </div>

              {/* Booking Filter Tabs */}
              <div className="flex overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-outline-variant/15 pb-px gap-2 mb-4">
                {[
                  { id: 'upcoming', label: 'Upcoming Events', count: bookings.filter(b => b.date >= todayString && b.status !== 'Completed' && b.status !== 'Rejected').length },
                  { id: 'history', label: 'Booking History', count: bookings.filter(b => b.date < todayString || b.status === 'Completed' || b.status === 'Rejected').length },
                  { id: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'Pending').length },
                  { id: 'approved', label: 'Approved', count: bookings.filter(b => b.status === 'Approved').length },
                  { id: 'rejected', label: 'Rejected', count: bookings.filter(b => b.status === 'Rejected').length },
                  { id: 'offline', label: 'Offline', count: bookings.filter(b => b.isOffline || b.email === 'offline@bagarakitchen.com' || (b.notes && b.notes.includes('[Offline Booking]'))).length }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setBookingFilter(tab.id)}
                    className={`pb-3 pt-1 px-4 font-semibold text-xs tracking-wider uppercase border-b-2 transition-all relative cursor-pointer flex-shrink-0 ${
                      bookingFilter === tab.id
                        ? 'border-primary text-primary font-bold'
                        : 'border-transparent text-on-surface-variant hover:text-white'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              {(() => {
                const filteredBookings = bookings.filter((b) => {
                  switch (bookingFilter) {
                    case 'upcoming':
                      return b.date >= todayString && b.status !== 'Completed' && b.status !== 'Rejected';
                    case 'history':
                      return b.date < todayString || b.status === 'Completed' || b.status === 'Rejected';
                    case 'pending':
                      return b.status === 'Pending';
                    case 'approved':
                      return b.status === 'Approved';
                    case 'rejected':
                      return b.status === 'Rejected';
                    case 'offline':
                      return b.isOffline || b.email === 'offline@bagarakitchen.com' || (b.notes && b.notes.includes('[Offline Booking]'));
                    default:
                      return true;
                  }
                });

                return filteredBookings.length === 0 ? (
                  <div className="text-center py-16 text-on-surface-variant/60 font-light space-y-2 bg-surface-low/30 border border-outline-variant/10 rounded-xl">
                    <Database className="w-10 h-10 mx-auto text-outline-variant/50 animate-pulse" />
                    <p>No banquet bookings found for this category.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <div 
                        key={booking.id}
                        className="bg-surface-low border border-outline-variant/20 rounded-xl p-5 space-y-4 shadow-sm hover:border-outline-variant/40 transition-colors"
                      >
                        {/* Booking Card Header */}
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-outline-variant/10 pb-3">
                          <div>
                            <h3 className="text-base font-semibold text-white flex flex-wrap items-center gap-2">
                              {booking.name} 
                              <span className="text-[10px] text-on-surface-variant font-light bg-background border border-outline-variant/35 px-2 py-0.5 rounded-full font-sans tracking-normal">ID: {booking.id}</span>
                              {(booking.isOffline || booking.email === 'offline@bagarakitchen.com' || (booking.notes && booking.notes.includes('[Offline Booking]'))) && (
                                <span className="bg-amber-950/40 border border-primary/50 text-primary font-bold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1">
                                  Offline Booking
                                </span>
                              )}
                            </h3>
                            <p className="text-xs text-on-surface-variant font-light mt-0.5 flex items-center gap-1.5 flex-wrap">
                              <span>{booking.email}</span>
                              <span className="text-outline-variant/40">|</span>
                              <span className="flex items-center gap-1.5">
                                {booking.phone}
                                <a 
                                  href={`tel:${booking.phone}`} 
                                  title={`Call ${booking.name}`}
                                  className="inline-flex items-center justify-center p-1 rounded-md bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
                                >
                                  <Phone size={10} />
                                </a>
                              </span>
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${getStatusBadgeClass(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>

                        {/* Booking Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs font-light">
                          <div className="space-y-1">
                            <p className="text-on-surface-variant font-medium uppercase tracking-wider text-[10px]">Event Date</p>
                            <p className="text-white font-medium">{booking.date}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-on-surface-variant font-medium uppercase tracking-wider text-[10px]">Session Time</p>
                            <p className="text-white font-medium">{booking.session || 'Lunch: 10:30 AM - 03:30 PM'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-on-surface-variant font-medium uppercase tracking-wider text-[10px]">Guest Capacity</p>
                            <p className="text-white font-medium">{booking.guests} Guests</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-on-surface-variant font-medium uppercase tracking-wider text-[10px]">Event Type</p>
                            <p className="text-white font-medium">{booking.eventType}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-on-surface-variant font-medium uppercase tracking-wider text-[10px]">Catering Choice</p>
                            <p className="text-white font-medium">{booking.catering}</p>
                          </div>
                        </div>

                        {booking.notes && (
                          <div className="p-3 bg-background/50 rounded-lg border border-outline-variant/15 text-xs text-on-surface-variant font-light">
                            <strong className="text-white font-medium">Special Requests:</strong> "{booking.notes}"
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row flex-wrap sm:justify-end gap-2 sm:gap-3 border-t border-outline-variant/10 pt-3 w-full">
                          {booking.status !== 'Approved' && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'Approved')}
                              className="bg-emerald-950/40 border border-emerald-500/50 hover:bg-emerald-500 hover:text-white text-emerald-400 font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all duration-300"
                            >
                              <Check size={12} /> Approve Event
                            </button>
                          )}
                          {booking.status !== 'Completed' && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'Completed')}
                              className="bg-blue-950/40 border border-blue-500/55 hover:bg-blue-500 hover:text-white text-blue-400 font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all duration-300"
                            >
                              <Clock size={12} /> Mark Completed
                            </button>
                          )}
                          {booking.status !== 'Pending' && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'Pending')}
                              className="bg-amber-950/40 border border-primary/50 hover:bg-primary hover:text-white text-primary font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all duration-300"
                            >
                              <X size={12} /> Set Pending
                            </button>
                          )}
                          {booking.status !== 'Rejected' && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'Rejected')}
                              className="bg-red-950/40 border border-red-500/50 hover:bg-red-500 hover:text-white text-red-400 font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all duration-300"
                            >
                              <XCircle size={12} /> Reject Booking
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to permanently delete "${booking.name}'s" banquet booking?`)) {
                                deleteBooking(booking.id);
                              }
                            }}
                            className="bg-red-950/10 border border-red-500/30 hover:bg-red-500 hover:text-white text-red-400/90 font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all duration-300 sm:ml-auto ml-0"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === 'pdrBookings' && (
            // TAB 1B: PDR Bookings manager
            <div className="bg-surface border border-outline-variant/35 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
              <div className="border-b border-outline-variant/20 pb-4">
                <h2 className="font-headline text-2xl text-white font-bold flex items-center gap-2">
                  <CalendarDays className="text-secondary" /> Private Dining Coordinator
                </h2>
                <p className="text-xs text-on-surface-variant font-light mt-1">Review exclusive PDR reservation requests and room assignments.</p>
              </div>

              {/* Booking Filter Tabs */}
              <div className="flex overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-outline-variant/15 pb-px gap-2 mb-4">
                {[
                  { id: 'upcoming', label: 'Upcoming Events', count: pdrBookings.filter(b => b.date >= todayString && b.status !== 'Completed' && b.status !== 'Rejected').length },
                  { id: 'history', label: 'Booking History', count: pdrBookings.filter(b => b.date < todayString || b.status === 'Completed' || b.status === 'Rejected').length },
                  { id: 'pending', label: 'Pending', count: pdrBookings.filter(b => b.status === 'Pending').length },
                  { id: 'approved', label: 'Approved', count: pdrBookings.filter(b => b.status === 'Approved').length },
                  { id: 'rejected', label: 'Rejected', count: pdrBookings.filter(b => b.status === 'Rejected').length }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setBookingFilter(tab.id)}
                    className={`pb-3 pt-1 px-4 font-semibold text-xs tracking-wider uppercase border-b-2 transition-all relative cursor-pointer flex-shrink-0 ${
                      bookingFilter === tab.id
                        ? 'border-primary text-primary font-bold'
                        : 'border-transparent text-on-surface-variant hover:text-white'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              {(() => {
                const filteredBookings = pdrBookings.filter((b) => {
                  switch (bookingFilter) {
                    case 'upcoming':
                      return b.date >= todayString && b.status !== 'Completed' && b.status !== 'Rejected';
                    case 'history':
                      return b.date < todayString || b.status === 'Completed' || b.status === 'Rejected';
                    case 'pending':
                      return b.status === 'Pending';
                    case 'approved':
                      return b.status === 'Approved';
                    case 'rejected':
                      return b.status === 'Rejected';
                    default:
                      return true;
                  }
                });

                return filteredBookings.length === 0 ? (
                  <div className="text-center py-16 text-on-surface-variant/60 font-light space-y-2 bg-surface-low/30 border border-outline-variant/10 rounded-xl">
                    <Database className="w-10 h-10 mx-auto text-outline-variant/50 animate-pulse" />
                    <p>No PDR reservations found for this category.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <div 
                        key={booking.id}
                        className="bg-surface-low border border-outline-variant/20 rounded-xl p-5 space-y-4 shadow-sm hover:border-outline-variant/40 transition-colors"
                      >
                        {/* Booking Card Header */}
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-outline-variant/10 pb-3">
                          <div>
                            <h3 className="text-base font-semibold text-white flex flex-wrap items-center gap-2">
                              {booking.name} 
                              <span className="text-[10px] text-on-surface-variant font-light bg-background border border-outline-variant/35 px-2 py-0.5 rounded-full font-sans tracking-normal">ID: {booking.id}</span>
                              <span className="bg-secondary/20 border border-secondary/50 text-secondary font-bold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1">
                                {booking.room || 'Room 1'}
                              </span>
                            </h3>
                            <p className="text-xs text-on-surface-variant font-light mt-0.5 flex items-center gap-1.5 flex-wrap">
                              <span>{booking.email}</span>
                              <span className="text-outline-variant/40">|</span>
                              <span className="flex items-center gap-1.5">
                                {booking.phone}
                                <a 
                                  href={`tel:${booking.phone}`} 
                                  title={`Call ${booking.name}`}
                                  className="inline-flex items-center justify-center p-1 rounded-md bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
                                >
                                  <Phone size={10} />
                                </a>
                              </span>
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${getStatusBadgeClass(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>

                        {/* Booking Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs font-light">
                          <div className="space-y-1">
                            <p className="text-on-surface-variant font-medium uppercase tracking-wider text-[10px]">Event Date</p>
                            <p className="text-white font-medium">{booking.date}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-on-surface-variant font-medium uppercase tracking-wider text-[10px]">Session Time</p>
                            <p className="text-white font-medium">{booking.session || 'Lunch: 10:30 AM - 03:30 PM'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-on-surface-variant font-medium uppercase tracking-wider text-[10px]">Guest Count</p>
                            <p className="text-white font-medium">{booking.guests} Guests</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-on-surface-variant font-medium uppercase tracking-wider text-[10px]">Event Type</p>
                            <p className="text-white font-medium">{booking.eventType}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-on-surface-variant font-medium uppercase tracking-wider text-[10px]">Catering</p>
                            <p className="text-white font-medium">{booking.catering}</p>
                          </div>
                        </div>

                        {booking.notes && (
                          <div className="p-3 bg-background/50 rounded-lg border border-outline-variant/15 text-xs text-on-surface-variant font-light">
                            <strong className="text-white font-medium">Special Requests:</strong> "{booking.notes}"
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row flex-wrap sm:justify-end gap-2 sm:gap-3 border-t border-outline-variant/10 pt-3 w-full">
                          {booking.status !== 'Approved' && (
                            <button
                              onClick={() => updatePdrBookingStatus(booking.id, 'Approved')}
                              className="bg-emerald-950/40 border border-emerald-500/50 hover:bg-emerald-500 hover:text-white text-emerald-400 font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all duration-300"
                            >
                              <Check size={12} /> Approve Event
                            </button>
                          )}
                          {booking.status !== 'Completed' && (
                            <button
                              onClick={() => updatePdrBookingStatus(booking.id, 'Completed')}
                              className="bg-blue-950/40 border border-blue-500/55 hover:bg-blue-500 hover:text-white text-blue-400 font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all duration-300"
                            >
                              <Clock size={12} /> Mark Completed
                            </button>
                          )}
                          {booking.status !== 'Pending' && (
                            <button
                              onClick={() => updatePdrBookingStatus(booking.id, 'Pending')}
                              className="bg-amber-950/40 border border-primary/50 hover:bg-primary hover:text-white text-primary font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all duration-300"
                            >
                              <X size={12} /> Set Pending
                            </button>
                          )}
                          {booking.status !== 'Rejected' && (
                            <button
                              onClick={() => updatePdrBookingStatus(booking.id, 'Rejected')}
                              className="bg-red-950/40 border border-red-500/50 hover:bg-red-500 hover:text-white text-red-400 font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all duration-300"
                            >
                              <XCircle size={12} /> Reject Booking
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to permanently delete "${booking.name}'s" PDR booking?`)) {
                                deletePdrBooking(booking.id);
                              }
                            }}
                            className="bg-red-950/10 border border-red-500/30 hover:bg-red-500 hover:text-white text-red-400/90 font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all duration-300 sm:ml-auto ml-0"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === 'messages' && (
            // TAB 2: Messages center
            <div className="bg-surface border border-outline-variant/35 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
              <div className="border-b border-outline-variant/20 pb-4">
                <h2 className="font-headline text-2xl text-white font-bold flex items-center gap-2">
                  <Mail className="text-secondary" /> Guest Inquiries Inbox
                </h2>
                <p className="text-xs text-on-surface-variant font-light mt-1">Direct feedback queries and banquet inquiries left on the contact form.</p>
              </div>

              {messages.length === 0 ? (
                <div className="text-center py-16 text-on-surface-variant/60 font-light space-y-2">
                  <MessageSquare className="w-10 h-10 mx-auto text-outline-variant/50" />
                  <p>Inbox is currently empty. No new guest messages.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div 
                      key={msg.id}
                      className="bg-surface-low border border-outline-variant/20 rounded-xl p-5 space-y-4 shadow-sm hover:border-outline-variant/40 transition-colors"
                    >
                      {/* Header block with status badges */}
                      <div className="flex justify-between items-start gap-4 border-b border-outline-variant/10 pb-3">
                        <div>
                          <h3 className="text-sm font-semibold text-white">{msg.name}</h3>
                          <p className="text-xs text-primary font-light">{msg.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            msg.status === 'Contacted'
                              ? 'bg-emerald-950/40 border border-emerald-500/80 text-emerald-400'
                              : 'bg-amber-950/40 border border-primary/80 text-primary'
                          }`}>
                            {msg.status || 'Pending'}
                          </span>
                          <span className="text-[10px] text-on-surface-variant font-light">
                            {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : 'Just now'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-on-surface-variant leading-relaxed font-light font-sans py-1">
                        "{msg.message}"
                      </p>

                      {/* Inquiry Actions */}
                      <div className="flex flex-col sm:flex-row flex-wrap sm:justify-end gap-2 sm:gap-3 border-t border-outline-variant/10 pt-3 w-full">
                        <a
                          href={`mailto:${msg.email}?subject=Regarding your Inquiry - The Bagara Kitchen and Bar`}
                          className="bg-primary/15 border border-primary/40 hover:bg-primary hover:text-white text-primary font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1.5 transition-all duration-300 cursor-pointer"
                        >
                          <Mail size={12} /> Send Email
                        </a>

                        {msg.status !== 'Contacted' && (
                          <button
                            onClick={() => updateMessageStatus(msg.id, 'Contacted')}
                            className="bg-emerald-950/40 border border-emerald-500/50 hover:bg-emerald-500 hover:text-white text-emerald-400 font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1.5 transition-all duration-300 cursor-pointer"
                          >
                            <Check size={12} /> Mark Contacted
                          </button>
                        )}

                        {msg.status === 'Contacted' && (
                          <button
                            onClick={() => updateMessageStatus(msg.id, 'Pending')}
                            className="bg-amber-950/40 border border-primary/50 hover:bg-primary hover:text-white text-primary font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1.5 transition-all duration-300 cursor-pointer"
                          >
                            <Clock size={12} /> Mark Pending
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${msg.name}'s" guest inquiry?`)) {
                              deleteMessage(msg.id);
                            }
                          }}
                          className="bg-red-950/10 border border-red-500/30 hover:bg-red-500 hover:text-white text-red-400/90 font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1.5 transition-all duration-300 cursor-pointer"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'cloudinary' && (
            // TAB 3: Cloudinary config
            <div className="bg-surface border border-outline-variant/35 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
              <div className="border-b border-outline-variant/20 pb-4">
                <h2 className="font-headline text-2xl text-white font-bold flex items-center gap-2">
                  <Sliders className="text-secondary" /> API & Payment Integrations
                </h2>
                <p className="text-xs text-on-surface-variant font-light mt-1">Configure direct client-side media uploads and booking payment settings.</p>
              </div>

              {settingsSuccess && (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 rounded-xl text-xs flex items-center gap-2.5 shadow-md shadow-emerald-500/5">
                  <Check className="w-4 h-4" />
                  <span>Cloudinary configurations successfully updated and stored in database.</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-5 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Cloudinary Cloud Name</label>
                  <input 
                    type="text" 
                    value={cloudName}
                    onChange={(e) => setCloudName(e.target.value)}
                    required
                    placeholder="e.g. your-cloud-name"
                    className="w-full bg-background border border-outline-variant/60 rounded-xl py-3 px-4 text-sm text-white placeholder-on-surface-variant/30 focus:outline-none focus:border-primary transition-all"
                  />
                  <p className="text-[10px] text-on-surface-variant/70 italic font-light">The unique identifier for your Cloudinary account dashboard.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Unsigned Upload Preset</label>
                  <input 
                    type="text" 
                    value={uploadPreset}
                    onChange={(e) => setUploadPreset(e.target.value)}
                    required
                    placeholder="e.g. food_preset"
                    className="w-full bg-background border border-outline-variant/60 rounded-xl py-3 px-4 text-sm text-white placeholder-on-surface-variant/30 focus:outline-none focus:border-primary transition-all"
                  />
                  <p className="text-[10px] text-on-surface-variant/70 italic font-light">The unsigned upload preset created in your Cloudinary upload settings page.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Booking Advance Amount (₹)</label>
                  <input 
                    type="number" 
                    value={localAdvanceAmount}
                    onChange={(e) => setLocalAdvanceAmount(e.target.value)}
                    required
                    placeholder="e.g. 5000"
                    className="w-full bg-background border border-outline-variant/60 rounded-xl py-3 px-4 text-sm text-white placeholder-on-surface-variant/30 focus:outline-none focus:border-primary transition-all"
                  />
                  <p className="text-[10px] text-on-surface-variant/70 italic font-light">The mandatory advance payment required to confirm a banquet reservation.</p>
                </div>

                <button 
                  type="submit"
                  className="bg-primary hover:bg-[#b08d4b] text-white font-bold py-3 px-8 rounded-xl text-sm transition-all hover:scale-105 active:scale-95 shadow-md shadow-primary/10 flex items-center gap-2 cursor-pointer duration-300"
                >
                  <Save size={16} /> Save Integrations
                </button>
              </form>
            </div>
          )}

          {activeTab === 'pdr' && (
            // TAB: PDR config
            <div className="bg-surface border border-outline-variant/35 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
              <div className="border-b border-outline-variant/20 pb-4">
                <h2 className="font-headline text-2xl text-white font-bold flex items-center gap-2">
                  <Settings className="text-secondary" /> Private Dining Room (PDR) Configurations
                </h2>
                <p className="text-xs text-on-surface-variant font-light mt-1">Configure pricing and capacity parameters for the two Private Dining Rooms.</p>
              </div>

              {pdrSuccess && (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 rounded-xl text-xs flex items-center gap-2.5 shadow-md shadow-emerald-500/5">
                  <Check className="w-4 h-4" />
                  <span>PDR settings successfully updated and stored in database.</span>
                </div>
              )}

              <form onSubmit={(e) => {
                e.preventDefault();
                updatePdrSettings({
                  room1: { capacity: pdr1Capacity, price: pdr1Price },
                  room2: { capacity: pdr2Capacity, price: pdr2Price }
                });
                setPdrSuccess(true);
                setTimeout(() => setPdrSuccess(false), 3000);
              }} className="space-y-6 max-w-xl">
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-primary">Room 1 Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Capacity (Guests)</label>
                      <input 
                        type="number" 
                        value={pdr1Capacity}
                        onChange={(e) => setPdr1Capacity(e.target.value)}
                        required
                        className="w-full bg-background border border-outline-variant/60 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Pricing (₹)</label>
                      <input 
                        type="number" 
                        value={pdr1Price}
                        onChange={(e) => setPdr1Price(e.target.value)}
                        required
                        className="w-full bg-background border border-outline-variant/60 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-outline-variant/20">
                  <h3 className="font-semibold text-primary">Room 2 Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Capacity (Guests)</label>
                      <input 
                        type="number" 
                        value={pdr2Capacity}
                        onChange={(e) => setPdr2Capacity(e.target.value)}
                        required
                        className="w-full bg-background border border-outline-variant/60 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Pricing (₹)</label>
                      <input 
                        type="number" 
                        value={pdr2Price}
                        onChange={(e) => setPdr2Price(e.target.value)}
                        required
                        className="w-full bg-background border border-outline-variant/60 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="bg-primary hover:bg-[#b08d4b] text-white font-bold py-3 px-8 rounded-xl text-sm transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer duration-300"
                >
                  <Save size={16} /> Save PDR Configuration
                </button>
              </form>
            </div>
          )}

          {activeTab === 'permissions' && (
            // TAB 4: Operations Permissions Controls
            <div className="bg-surface border border-outline-variant/35 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
              <div className="border-b border-outline-variant/20 pb-4">
                <h2 className="font-headline text-2xl text-white font-bold flex items-center gap-2">
                  <Shield className="text-secondary" /> Manager Access & Permissions Controls
                </h2>
                <p className="text-xs text-on-surface-variant font-light mt-1">Configure precise administrative control permissions for different areas of the Operations Manager Dashboard.</p>
              </div>

              <div className="space-y-4">
                
                {/* 1. Menu Cards Control */}
                <div className="bg-surface-low border border-outline-variant/20 rounded-xl p-5 flex items-center justify-between shadow-sm">
                  <div className="space-y-1 pr-6 max-w-xl">
                    <h4 className="text-sm font-semibold text-white">1. Enable Menu Card Uploads</h4>
                    <p className="text-[11px] text-on-surface-variant font-light leading-relaxed">
                      Allows the Operations Manager to upload new printed Restaurant Menu cards and split Vegetarian/Non-Vegetarian Banquet catalog PDF documents.
                    </p>
                  </div>
                  <div className="flex items-center flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => updateManagerMenuEditingEnabled(!managerMenuEditingEnabled)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        managerMenuEditingEnabled ? 'bg-primary' : 'bg-surface border-outline-variant/40'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          managerMenuEditingEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* 2. Gallery Control */}
                <div className="bg-surface-low border border-outline-variant/20 rounded-xl p-5 flex items-center justify-between shadow-sm">
                  <div className="space-y-1 pr-6 max-w-xl">
                    <h4 className="text-sm font-semibold text-white">2. Enable Gallery Photo Uploads</h4>
                    <p className="text-[11px] text-on-surface-variant font-light leading-relaxed">
                      Allows the Operations Manager to add, modify, and delete showcase photographs and high-res imagery displayed inside the public Gallery carousel.
                    </p>
                  </div>
                  <div className="flex items-center flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => updateManagerGalleryEditingEnabled(!managerGalleryEditingEnabled)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        managerGalleryEditingEnabled ? 'bg-primary' : 'bg-surface border-outline-variant/40'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          managerGalleryEditingEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* 3. Settings Control */}
                <div className="bg-surface-low border border-outline-variant/20 rounded-xl p-5 flex items-center justify-between shadow-sm">
                  <div className="space-y-1 pr-6 max-w-xl">
                    <h4 className="text-sm font-semibold text-white">3. Enable Operational Settings Updates</h4>
                    <p className="text-[11px] text-on-surface-variant font-light leading-relaxed">
                      Allows the Operations Manager to edit operational parameters including the business address, helpline phone numbers, weekday/weekend hours, and Zomato/Swiggy ordering links.
                    </p>
                  </div>
                  <div className="flex items-center flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => updateManagerSettingsEditingEnabled(!managerSettingsEditingEnabled)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        managerSettingsEditingEnabled ? 'bg-primary' : 'bg-surface border-outline-variant/40'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          managerSettingsEditingEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* 4. Bookings Control */}
                <div className="bg-surface-low border border-outline-variant/20 rounded-xl p-5 flex items-center justify-between shadow-sm">
                  <div className="space-y-1 pr-6 max-w-xl">
                    <h4 className="text-sm font-semibold text-white">4. Enable Banquet Booking Approvals</h4>
                    <p className="text-[11px] text-on-surface-variant font-light leading-relaxed">
                      Allows the Operations Manager to review banquet reservations, approve bookings, and update their operational statuses.
                    </p>
                  </div>
                  <div className="flex items-center flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => updateManagerBookingsEditingEnabled(!managerBookingsEditingEnabled)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        managerBookingsEditingEnabled ? 'bg-primary' : 'bg-surface border-outline-variant/40'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          managerBookingsEditingEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* 5. PDR Payments Control */}
                <div className="bg-surface-low border border-outline-variant/20 rounded-xl p-5 flex items-center justify-between shadow-sm">
                  <div className="space-y-1 pr-6 max-w-xl">
                    <h4 className="text-sm font-semibold text-white">5. Enable PDR Advance Payments</h4>
                    <p className="text-[11px] text-on-surface-variant font-light leading-relaxed">
                      Toggle the mandatory advance payment step for Private Dining Room (PDR) bookings. When disabled, customers can submit PDR requests without paying upfront.
                    </p>
                  </div>
                  <div className="flex items-center flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => updatePdrPaymentEnabled(!pdrPaymentEnabled)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        pdrPaymentEnabled ? 'bg-primary' : 'bg-surface border-outline-variant/40'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          pdrPaymentEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'staff' && (
            // TAB 5: Manage Managers Staff Tab
            <div className="bg-surface border border-outline-variant/35 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
              <div className="border-b border-outline-variant/20 pb-4">
                <h2 className="font-headline text-2xl text-white font-bold flex items-center gap-2">
                  <Users className="text-secondary" /> Staff & Managers Management
                </h2>
                <p className="text-xs text-on-surface-variant font-light mt-1">Create new Operations Manager logins and review existing credentials registry.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Form to Create Account (Manager / Admin) */}
                <div className="md:col-span-5 space-y-4">
                  <div className="bg-surface-low border border-outline-variant/20 rounded-xl p-5 space-y-4 shadow-md">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-outline-variant/15 pb-2">
                      <UserPlus size={16} className="text-secondary" /> Add Account Profile
                    </h3>

                    {createError && (
                      <div className="p-3 bg-red-950/40 border border-red-500/50 text-red-400 rounded-lg text-[11px] flex items-center gap-2">
                        <XCircle size={14} className="flex-shrink-0" />
                        <span>{createError}</span>
                      </div>
                    )}

                    {createSuccess && (
                      <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 rounded-lg text-[11px] flex items-center gap-2">
                        <Check size={14} className="flex-shrink-0" />
                        <span>Account credentials registered successfully.</span>
                      </div>
                    )}

                    <form onSubmit={handleCreateManager} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Account Full Name</label>
                        <input 
                          type="text"
                          required
                          value={managerName}
                          onChange={(e) => setManagerName(e.target.value)}
                          placeholder="e.g. Sai Kiran"
                          disabled={createLoading}
                          className="w-full bg-background border border-outline-variant/60 rounded-lg py-2 px-3 text-xs text-white placeholder-on-surface-variant/30 focus:outline-none focus:border-primary transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Login Email (Mail ID)</label>
                        <input 
                          type="email"
                          required
                          value={managerEmail}
                          onChange={(e) => setManagerEmail(e.target.value)}
                          placeholder="e.g. kiran@bagarakitchen.com"
                          disabled={createLoading}
                          className="w-full bg-background border border-outline-variant/60 rounded-lg py-2 px-3 text-xs text-white placeholder-on-surface-variant/30 focus:outline-none focus:border-primary transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Security Password</label>
                        <input 
                          type="password"
                          required
                          value={managerPassword}
                          onChange={(e) => setManagerPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          disabled={createLoading}
                          className="w-full bg-background border border-outline-variant/60 rounded-lg py-2 px-3 text-xs text-white placeholder-on-surface-variant/30 focus:outline-none focus:border-primary transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Account Role</label>
                        <select
                          value={managerRole}
                          onChange={(e) => setManagerRole(e.target.value)}
                          disabled={createLoading}
                          className="w-full bg-background border border-outline-variant/60 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-primary transition-all cursor-pointer font-sans"
                        >
                          <option value="manager" className="bg-[#001c16] text-[#e2e2e2]">Operations Manager</option>
                          <option value="admin" className="bg-[#001c16] text-[#e2e2e2]">Co-Administrator</option>
                        </select>
                      </div>

                      <button 
                        type="submit"
                        disabled={createLoading}
                        className="w-full bg-primary hover:bg-[#b08d4b] disabled:bg-primary/50 text-white font-bold py-2.5 rounded-lg text-xs transition-all hover:scale-[1.01] active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer duration-300 animate-pulse-subtle"
                      >
                        {createLoading ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            Creating Login Credentials...
                          </>
                        ) : (
                          <>
                            <UserPlus size={12} />
                            Save Credentials
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* List of existing Managers */}
                <div className="md:col-span-7 space-y-4">
                  <div className="bg-surface-low border border-outline-variant/20 rounded-xl p-5 space-y-4 min-h-[300px] flex flex-col shadow-md">
                    <h3 className="text-sm font-semibold text-white flex items-center justify-between border-b border-outline-variant/15 pb-2">
                      <span className="flex items-center gap-2"><Users size={16} className="text-secondary" /> Active Registry</span>
                      <span className="text-[10px] text-on-surface-variant font-light font-sans bg-background border border-outline-variant/30 px-2 py-0.5 rounded-full">
                        {(() => {
                          const seen = new Set();
                          return managers.filter(m => {
                            const email = m.email?.toLowerCase().trim();
                            if (!email || seen.has(email)) return false;
                            seen.add(email);
                            return true;
                          }).length;
                        })()} accounts
                      </span>
                    </h3>

                    {loadingManagers ? (
                      <div className="flex-grow flex flex-col items-center justify-center text-on-surface-variant/50 text-xs gap-2">
                        <Loader2 size={24} className="animate-spin text-primary" />
                        <span>Querying credentials registry...</span>
                      </div>
                    ) : managers.length === 0 ? (
                      <div className="flex-grow flex flex-col items-center justify-center text-center text-on-surface-variant/60 text-xs font-light space-y-2 py-12">
                        <Users className="w-8 h-8 text-outline-variant/40" />
                        <p>No custom manager or admin accounts registered in the database.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                        {(() => {
                          const seenEmails = new Set();
                          const uniqueManagers = managers.filter(m => {
                            const emailLower = m.email?.toLowerCase().trim();
                            if (!emailLower || seenEmails.has(emailLower)) return false;
                            seenEmails.add(emailLower);
                            return true;
                          });

                          return uniqueManagers.map((manager, idx) => (
                            <div 
                              key={manager.email || idx}
                              className="p-3.5 bg-background border border-outline-variant/20 hover:border-outline-variant/45 rounded-lg flex items-center justify-between gap-4 transition-all"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-white truncate">{manager.name}</h4>
                                  {manager.role === 'admin' ? (
                                    <span className="text-[8px] bg-amber-950/40 border border-primary/50 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex-shrink-0">
                                      Admin
                                    </span>
                                  ) : (
                                    <span className="text-[8px] bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex-shrink-0">
                                      Manager
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-primary font-medium truncate mt-0.5">{manager.email}</p>
                                {manager.createdAt && (
                                  <p className="text-[8px] text-on-surface-variant/70 italic mt-0.5">
                                    Created: {new Date(manager.createdAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => handleDeleteManager(manager.email)}
                                className="p-2 bg-red-950/10 border border-red-500/20 hover:border-red-500 hover:bg-red-500 hover:text-white text-red-400 rounded-md transition-all duration-300 cursor-pointer flex-shrink-0"
                                title="Delete manager role"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
