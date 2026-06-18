import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Logo from '../components/Logo';
import CloudinaryUpload from '../components/CloudinaryUpload';
import BanquetDatePicker from '../components/BanquetDatePicker';
import { 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  Store, 
  UtensilsCrossed, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Flame, 
  Sparkles, 
  ShoppingBag,
  Info,
  CheckCircle,
  XCircle,
  Layers,
  ArrowRight,
  LayoutDashboard,
  CalendarDays,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Check,
  X,
  FileImage,
  Database,
  Menu as MenuIcon,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ManagerDashboard = ({ onGoToPublic }) => {
  const { logout, user } = useAuth();
  const { 
    menuItems, 
    contactInfo, 
    bookings, 
    galleryImages, 
    restaurantMenuImage,
    banquetVegMenuImage,
    banquetNonVegMenuImage,
    updateRestaurantMenuImage,
    updateBanquetVegMenuImage,
    updateBanquetNonVegMenuImage,
    addMenuItem, 
    updateMenuItem, 
    deleteMenuItem, 
    updateContactInfo,
    addBooking,
    updateBookingStatus,
    updateBooking,
    deleteBooking,
    pdrBookings,
    updatePdrBookingStatus,
    deletePdrBooking,
    addGalleryImage,
    deleteGalleryImage,
    managerMenuEditingEnabled,
    managerGalleryEditingEnabled,
    managerSettingsEditingEnabled,
    managerBookingsEditingEnabled,
    messages,
    deleteMessage,
    updateMessageStatus
  } = useData();

  // Dynamic timezone-safe local date YYYY-MM-DD
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayString = `${yyyy}-${mm}-${dd}`;

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'bookings', 'gallery', 'content', 'settings'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [bookingFilter, setBookingFilter] = useState('upcoming');
  const [selectedDashboardMenuType, setSelectedDashboardMenuType] = useState('restaurant'); // 'restaurant' or 'banquet'
  const [managerSuccess, setManagerSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Gallery Form State
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [galleryForm, setGalleryForm] = useState({ title: '', image: '', type: 'restaurant' });

  // Offline Booking Form State
  const [isAddingBooking, setIsAddingBooking] = useState(false);
  const [offlineBookingForm, setOfflineBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    guests: '100',
    eventType: 'Corporate Gathering',
    catering: 'Veg Silver',
    notes: '',
    status: 'Pending',
    session: 'Lunch: 10:30 AM - 03:30 PM'
  });

  const [editingBookingId, setEditingBookingId] = useState(null);

  // Menu Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [dishForm, setDishForm] = useState({
    name: '',
    category: 'biryanis',
    price: '₹350',
    description: '',
    image: '',
    isSpicy: false,
    isChefSpecial: false,
    isVeg: false,
    menuType: 'restaurant'
  });

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    address: contactInfo.address || '',
    phone: contactInfo.phone || '',
    email: contactInfo.email || '',
    hoursWeekday: contactInfo.hoursWeekday || '',
    hoursWeekend: contactInfo.hoursWeekend || '',
    swiggy: contactInfo.swiggy || '',
    zomato: contactInfo.zomato || ''
  });

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setManagerSuccess(true);
    setTimeout(() => setManagerSuccess(false), 3000);
  };

  // Gallery Submissions
  const handleGallerySubmit = (e) => {
    e.preventDefault();
    if (!managerGalleryEditingEnabled) {
      alert('Action blocked: Gallery editing is locked by the Administrator.');
      return;
    }
    if (!galleryForm.image) {
      alert('Please upload an image first.');
      return;
    }
    addGalleryImage({
      title: galleryForm.title || 'Restaurant Showcase',
      image: galleryForm.image,
      type: galleryForm.type
    });
    setIsAddingImage(false);
    setGalleryForm({ title: '', image: '', type: 'restaurant' });
    showNotification('Image added successfully to the public Gallery Showcase.');
  };

  // Contact settings submit
  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!managerSettingsEditingEnabled) {
      alert('Action blocked: Operational settings updates are locked by the Administrator.');
      return;
    }
    updateContactInfo(contactForm);
    showNotification('Operational settings successfully updated.');
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  // Menu item actions
  const startAddDish = () => {
    setDishForm({
      name: '',
      category: 'biryanis',
      price: '₹350',
      description: '',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
      isSpicy: false,
      isChefSpecial: false,
      isVeg: false,
      menuType: 'restaurant'
    });
    setEditingId(null);
    setIsEditing(true);
  };

  const startEditDish = (dish) => {
    setDishForm({ 
      name: dish.name || '',
      category: dish.category || 'biryanis',
      price: dish.price || '₹350',
      description: dish.description || '',
      image: dish.image || '',
      isSpicy: !!dish.isSpicy,
      isChefSpecial: !!dish.isChefSpecial,
      isVeg: !!dish.isVeg,
      menuType: dish.menuType || 'restaurant'
    });
    setEditingId(dish.id);
    setIsEditing(true);
  };

  const handleDishChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDishForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDishUploadSuccess = (url) => {
    setDishForm(prev => ({ ...prev, image: url }));
  };

  const handleDishSubmit = (e) => {
    e.preventDefault();
    if (!managerMenuEditingEnabled) {
      alert('Action blocked: Menu uploader controls are locked by the Administrator.');
      return;
    }
    if (!dishForm.name || !dishForm.description) {
      alert('Please fill out the dish name and description.');
      return;
    }

    if (editingId) {
      updateMenuItem(editingId, dishForm);
      showNotification(`"${dishForm.name}" updated successfully.`);
    } else {
      addMenuItem(dishForm);
      showNotification(`"${dishForm.name}" added to menu catalog.`);
    }
    setIsEditing(false);
  };

  const handleDeleteDish = (id, name) => {
    if (!managerMenuEditingEnabled) {
      alert('Action blocked: Menu edits are locked by the Administrator.');
      return;
    }
    if (window.confirm(`Are you sure you want to remove "${name}" from the menu?`)) {
      deleteMenuItem(id);
      showNotification(`"${name}" removed from menu.`);
    }
  };

  const handleOfflineBookingSubmit = (e) => {
    e.preventDefault();
    if (!managerBookingsEditingEnabled) {
      alert('Action blocked: Event booking updates are locked by the Administrator.');
      return;
    }
    if (!offlineBookingForm.name || !offlineBookingForm.phone || !offlineBookingForm.date) {
      alert('Please fill out Name, Phone, and Event Date.');
      return;
    }

    const allowedCharsRegex = /^[+\s\-\(\)\d]+$/;
    if (!offlineBookingForm.phone || !allowedCharsRegex.test(offlineBookingForm.phone)) {
      alert("Action Blocked: Please enter a valid phone number containing only numbers, spaces, dashes, or international prefix (+).");
      return;
    }
    const digitCount = offlineBookingForm.phone.replace(/\D/g, '').length;
    if (digitCount < 10 || digitCount > 13) {
      alert("Action Blocked: Phone number must contain between 10 and 13 digits (e.g. 9876543210 or +91 79953 61212).");
      return;
    }

    if (offlineBookingForm.date < todayString) {
      alert('Action Blocked: You cannot register an event booking for a past date.');
      return;
    }

    const hasConflict = bookings.some(
      (b) => b.id !== editingBookingId && 
             b.date === offlineBookingForm.date && 
             b.status === 'Approved' && 
             (b.session || 'Lunch: 10:30 AM - 03:30 PM').substring(0, 5) === offlineBookingForm.session.substring(0, 5)
    );
    if (hasConflict) {
      alert(`Action Blocked: This date already has an approved reservation for the ${offlineBookingForm.session.substring(0, 5)} session. Please choose another date or session.`);
      return;
    }

    if (editingBookingId) {
      updateBooking(editingBookingId, {
        ...offlineBookingForm,
        email: offlineBookingForm.email || 'offline@bagarakitchen.com',
        notes: offlineBookingForm.notes ? `[Offline Booking] ${offlineBookingForm.notes}` : '[Offline Booking]'
      });
      showNotification('Banquet booking details updated successfully.');
    } else {
      addBooking({
        ...offlineBookingForm,
        isOffline: true,
        email: offlineBookingForm.email || 'offline@bagarakitchen.com',
        notes: offlineBookingForm.notes ? `[Offline Booking] ${offlineBookingForm.notes}` : '[Offline Booking]'
      });
      showNotification('Offline banquet booking registered successfully.');
    }

    setIsAddingBooking(false);
    setEditingBookingId(null);
    setOfflineBookingForm({
      name: '',
      email: '',
      phone: '',
      date: '',
      guests: '100',
      eventType: 'Corporate Gathering',
      catering: 'Veg Silver',
      notes: '',
      status: 'Pending',
      session: 'Lunch: 10:30 AM - 03:30 PM'
    });
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
    <div className="min-h-screen bg-[#001b16] text-[#e2e2e2] flex flex-col lg:flex-row font-body">
      
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-surface-low border-b border-outline-variant/35 py-4 px-6 flex justify-between items-center shadow-lg sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Logo className="w-9 h-9 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-white font-headline font-bold text-[14px] min-[360px]:text-base tracking-wider leading-none uppercase">
              THE BAGARA KITCHEN
            </span>
            <span className="text-[9px] text-secondary font-semibold uppercase tracking-wider block mt-1">Manager Portal</span>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-primary flex-shrink-0 focus:outline-none p-1 transition-transform duration-200 active:scale-90 cursor-pointer"
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
              <nav className="flex flex-col gap-1.5">
                <button
                  onClick={() => { setActiveTab('dashboard'); setIsEditing(false); setIsMobileMenuOpen(false); }}
                  disabled={activeTab === 'dashboard'}
                  className={`w-full flex items-center gap-3.5 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                      : 'text-on-surface-variant hover:text-white hover:bg-surface cursor-pointer'
                  }`}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </button>

                <button
                  onClick={() => { setActiveTab('bookings'); setIsEditing(false); setIsMobileMenuOpen(false); }}
                  disabled={activeTab === 'bookings'}
                  className={`w-full flex items-center gap-3.5 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                    activeTab === 'bookings'
                      ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                      : 'text-on-surface-variant hover:text-white hover:bg-surface cursor-pointer'
                  }`}
                >
                  <CalendarDays size={18} />
                  Banquet Bookings
                </button>

                <button
                  onClick={() => { setActiveTab('pdrBookings'); setIsEditing(false); setIsMobileMenuOpen(false); }}
                  disabled={activeTab === 'pdrBookings'}
                  className={`w-full flex items-center gap-3.5 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                    activeTab === 'pdrBookings'
                      ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                      : 'text-on-surface-variant hover:text-white hover:bg-surface cursor-pointer'
                  }`}
                >
                  <CalendarDays size={18} />
                  PDR Reservations
                </button>

                <button
                  onClick={() => { setActiveTab('messages'); setIsEditing(false); setIsMobileMenuOpen(false); }}
                  disabled={activeTab === 'messages'}
                  className={`w-full flex items-center gap-3.5 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                    activeTab === 'messages'
                      ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                      : 'text-on-surface-variant hover:text-white hover:bg-surface cursor-pointer'
                  }`}
                >
                  <Mail size={18} />
                  Guest Inquiries
                </button>

                <button
                  onClick={() => { setActiveTab('gallery'); setIsEditing(false); setIsMobileMenuOpen(false); }}
                  disabled={activeTab === 'gallery'}
                  className={`w-full flex items-center gap-3.5 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                    activeTab === 'gallery'
                      ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                      : 'text-on-surface-variant hover:text-white hover:bg-surface cursor-pointer'
                  }`}
                >
                  <ImageIcon size={18} />
                  Gallery Management
                </button>

                <button
                  onClick={() => { setActiveTab('content'); setIsEditing(false); setIsMobileMenuOpen(false); }}
                  disabled={activeTab === 'content'}
                  className={`w-full flex items-center gap-3.5 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                    activeTab === 'content'
                      ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                      : 'text-on-surface-variant hover:text-white hover:bg-surface cursor-pointer'
                  }`}
                >
                  <UtensilsCrossed size={18} />
                  Restaurant Content
                </button>

                <button
                  onClick={() => { setActiveTab('settings'); setIsEditing(false); setIsMobileMenuOpen(false); }}
                  disabled={activeTab === 'settings'}
                  className={`w-full flex items-center gap-3.5 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                    activeTab === 'settings'
                      ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                      : 'text-on-surface-variant hover:text-white hover:bg-surface cursor-pointer'
                  }`}
                >
                  <SettingsIcon size={18} />
                  Settings
                </button>
              </nav>

              <div className="border-t border-outline-variant/20 pt-4 flex flex-col gap-3">
                <div className="px-3 text-xs text-on-surface-variant/80">
                  <p className="font-semibold text-white">Logged in as:</p>
                  <p className="truncate mt-0.5">{user.name} ({user.email})</p>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <button 
                    onClick={() => { onGoToPublic(); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 bg-surface hover:bg-surface-high border border-outline-variant/30 text-secondary hover:text-white rounded-xl text-xs font-semibold py-3 transition-all cursor-pointer duration-300"
                  >
                    <Store size={18} />
                    View Public Site
                  </button>
                  <button 
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 bg-surface hover:bg-surface-high border border-outline-variant/30 hover:border-red-500/40 hover:text-red-400 rounded-xl text-xs font-semibold py-3 transition-all cursor-pointer duration-300"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SIDEBAR NAVIGATION PANEL (Requested Layout) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-surface-low border-r lg:border-b-0 border-b border-outline-variant/30 flex-shrink-0 z-20 lg:sticky lg:top-0 lg:h-screen overflow-y-auto custom-scrollbar">
        <div className="p-6 flex flex-col gap-8 flex-grow">
          
          <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-5 flex-shrink-0">
            <Logo className="w-10 h-10 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-white font-headline font-bold text-lg tracking-wider leading-none uppercase">
                THE BAGARA KITCHEN
              </span>
              <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block mt-2">Manager Portal</span>
            </div>
          </div>

          {/* Requested Navigation List */}
          <nav className="flex flex-col gap-1.5 flex-grow">
            <button
              onClick={() => { setActiveTab('dashboard'); setIsEditing(false); }}
              disabled={activeTab === 'dashboard'}
              className={`w-full flex items-center gap-3.5 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                  : 'text-on-surface-variant hover:text-white hover:bg-surface cursor-pointer'
              }`}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>

            <button
              onClick={() => { setActiveTab('bookings'); setIsEditing(false); }}
              disabled={activeTab === 'bookings'}
              className={`w-full flex items-center gap-3.5 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                activeTab === 'bookings'
                  ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                  : 'text-on-surface-variant hover:text-white hover:bg-surface cursor-pointer'
              }`}
            >
              <CalendarDays size={18} />
              Banquet Bookings
            </button>

            <button
              onClick={() => { setActiveTab('pdrBookings'); setIsEditing(false); }}
              disabled={activeTab === 'pdrBookings'}
              className={`w-full flex items-center gap-3.5 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                activeTab === 'pdrBookings'
                  ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                  : 'text-on-surface-variant hover:text-white hover:bg-surface cursor-pointer'
              }`}
            >
              <CalendarDays size={18} />
              PDR Reservations
            </button>

            <button
              onClick={() => { setActiveTab('messages'); setIsEditing(false); }}
              disabled={activeTab === 'messages'}
              className={`w-full flex items-center gap-3.5 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                activeTab === 'messages'
                  ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                  : 'text-on-surface-variant hover:text-white hover:bg-surface cursor-pointer'
              }`}
            >
              <Mail size={18} />
              Guest Inquiries
            </button>

            <button
              onClick={() => { setActiveTab('gallery'); setIsEditing(false); }}
              disabled={activeTab === 'gallery'}
              className={`w-full flex items-center gap-3.5 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                activeTab === 'gallery'
                  ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                  : 'text-on-surface-variant hover:text-white hover:bg-surface cursor-pointer'
              }`}
            >
              <ImageIcon size={18} />
              Gallery Management
            </button>

            <button
              onClick={() => { setActiveTab('content'); setIsEditing(false); }}
              disabled={activeTab === 'content'}
              className={`w-full flex items-center gap-3.5 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                activeTab === 'content'
                  ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                  : 'text-on-surface-variant hover:text-white hover:bg-surface cursor-pointer'
              }`}
            >
              <UtensilsCrossed size={18} />
              Restaurant Content
            </button>

            <button
              onClick={() => { setActiveTab('settings'); setIsEditing(false); }}
              disabled={activeTab === 'settings'}
              className={`w-full flex items-center gap-3.5 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                activeTab === 'settings'
                  ? 'bg-primary text-white shadow-lg shadow-primary/10 cursor-default'
                  : 'text-on-surface-variant hover:text-white hover:bg-surface cursor-pointer'
              }`}
            >
              <SettingsIcon size={18} />
              Settings
            </button>

            <div className="mt-auto flex flex-col pt-6">
              <button
                onClick={onGoToPublic}
                className="w-full flex items-center gap-3.5 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide text-secondary hover:text-white hover:bg-surface-high/10 transition-all border border-secondary/30 hover:border-secondary cursor-pointer duration-300"
              >
                <Store size={18} />
                View Public Site
              </button>

              <button
                onClick={logout}
                className="w-full flex items-center gap-3.5 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide text-on-surface-variant hover:text-red-400 hover:bg-red-950/15 transition-all mt-3 border-t border-outline-variant/10 pt-3"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </nav>

        </div>

        {/* Sidebar Footer Info */}
        <div className="p-6 bg-background/30 border-t border-outline-variant/10 hidden lg:block text-xs font-light text-on-surface-variant/80 flex-shrink-0">
          <p className="font-semibold text-white">Logged in as:</p>
          <p className="truncate mt-0.5">{user.name}</p>
          <p className="truncate text-[10px] opacity-75">{user.email}</p>
        </div>
      </aside>

      {/* MAIN CONTAINER WORKSPACE */}
      <main className="flex-grow p-6 md:p-8 max-w-5xl mx-auto w-full z-10 space-y-6">

        {/* Notification banners */}
        {managerSuccess && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 rounded-xl text-xs flex items-center gap-2.5 shadow-md shadow-emerald-500/5">
            <CheckCircle className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {activeTab === 'dashboard' && (
          // TAB 1: Analytical Dashboard
          <div className="space-y-6">
            {/* Welcome banner */}
            <div className="bg-surface border border-outline-variant/35 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
              <div className="space-y-2 relative z-10">
                <span className="text-secondary text-xs font-bold uppercase tracking-wider">Welcome,</span>
                <h2 className="font-headline text-3xl text-white font-bold">{user.name}</h2>
                <p className="text-xs text-on-surface-variant font-light max-w-xl">
                  Manage banquet operations, add signature dishes, publish gallery showcases, and manage Swiggy integrations instantly.
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('content')}
                className="bg-primary hover:bg-[#b08d4b] text-white font-bold py-3 px-6 rounded-xl text-xs transition-all hover:scale-105 active:scale-95 shadow-md shadow-primary/15 flex items-center gap-2"
              >
                Manage Menu Content <ArrowRight size={14} />
              </button>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-surface border border-outline-variant/35 rounded-2xl p-5 shadow-xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Banquet Reservations</span>
                  <span className="text-3xl font-bold text-white block">{bookings.length}</span>
                  <span className="text-[9px] text-emerald-400 font-medium block mt-1">Pending approvals: {bookings.filter(b => b.status === 'Pending').length}</span>
                </div>
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl text-primary">
                  <CalendarDays size={24} />
                </div>
              </div>



              <div className="bg-surface border border-outline-variant/35 rounded-2xl p-5 shadow-xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Gallery Pictures</span>
                  <span className="text-3xl font-bold text-white block">{galleryImages.length}</span>
                  <span className="text-[9px] text-secondary font-medium block mt-1">Cloudinary backed: Active</span>
                </div>
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl text-primary">
                  <ImageIcon size={24} />
                </div>
              </div>

            </div>

            {/* Quick Operational settings snapshot */}
            <div className="bg-surface border border-outline-variant/35 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="font-headline text-lg text-white font-medium flex items-center gap-2 border-b border-outline-variant/15 pb-2">
                <Store size={16} className="text-secondary" /> Active Location & Swiggy configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-light text-on-surface-variant">
                <div className="space-y-1">
                  <span className="font-bold text-white block">Operational Phone</span>
                  <p>{contactInfo.phone}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-white block">Operational Address</span>
                  <p className="line-clamp-1">{contactInfo.address}</p>
                </div>
                <div className="space-y-1 pt-2 border-t border-outline-variant/10 md:border-t-0 md:pt-0">
                  <span className="font-bold text-white block">Active Swiggy Handle</span>
                  <a href={contactInfo.swiggy} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline truncate block max-w-sm">{contactInfo.swiggy}</a>
                </div>
                <div className="space-y-1 pt-2 border-t border-outline-variant/10 md:border-t-0 md:pt-0">
                  <span className="font-bold text-white block">Operational Hours</span>
                  <p>Weekday: {contactInfo.hoursWeekday}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          // TAB 2: Banquet Bookings Manager
          <div className="bg-surface border border-outline-variant/35 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-outline-variant/20 pb-4">
              <div>
                <h2 className="font-headline text-2xl text-white font-bold flex items-center gap-2">
                  <CalendarDays className="text-secondary" /> Banquet Bookings Planner
                </h2>
                <p className="text-xs text-on-surface-variant font-light mt-1">Review event requests, guest capacity slots, and catering allocations.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!managerBookingsEditingEnabled) return;
                  setEditingBookingId(null);
                  setOfflineBookingForm({
                    name: '',
                    email: '',
                    phone: '',
                    date: '',
                    guests: '100',
                    eventType: 'Corporate Gathering',
                    catering: 'Veg Silver',
                    notes: '',
                    status: 'Pending',
                    session: 'Lunch: 10:30 AM - 03:30 PM'
                  });
                  setIsAddingBooking(true);
                }}
                disabled={!managerBookingsEditingEnabled}
                className="bg-primary hover:bg-[#b08d4b] disabled:bg-primary/50 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all hover:scale-105 active:scale-95 shadow-md shadow-primary/15 flex items-center gap-1.5 disabled:cursor-not-allowed cursor-pointer duration-300"
              >
                <Plus size={14} /> Add Offline Booking
              </button>
            </div>

            {!managerBookingsEditingEnabled && (
              <div className="p-4 bg-amber-950/40 border border-amber-500/55 text-amber-400 rounded-xl text-xs flex items-start gap-2.5 shadow-md shadow-amber-500/5 leading-relaxed">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold">Booking Controls Disabled</span>
                  <p className="opacity-90">The Executive Administrator has locked event booking controls. You can review scheduling details, but status approvals and scheduling updates are read-only.</p>
                </div>
              </div>
            )}

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
                        {managerBookingsEditingEnabled && (
                          <button
                            onClick={() => {
                              if (!managerBookingsEditingEnabled) return;
                              setEditingBookingId(booking.id);
                              setOfflineBookingForm({
                                name: booking.name || '',
                                email: booking.email || '',
                                phone: booking.phone || '',
                                date: booking.date || '',
                                guests: booking.guests || '100',
                                eventType: booking.eventType || 'Corporate Gathering',
                                catering: booking.catering || 'Veg Silver',
                                notes: booking.notes ? booking.notes.replace(/^\[Offline Booking\]\s*/, '') : '',
                                status: booking.status || 'Pending',
                                session: booking.session || 'Lunch: 10:30 AM - 03:30 PM'
                              });
                              setIsAddingBooking(true);
                            }}
                            className="bg-primary/10 border border-primary/40 hover:bg-primary hover:text-white text-primary font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all duration-300 cursor-pointer"
                          >
                            <Edit size={12} /> Edit Details
                          </button>
                        )}
                        {booking.status !== 'Approved' && (
                          <button
                            onClick={() => {
                              if (!managerBookingsEditingEnabled) return;
                              updateBookingStatus(booking.id, 'Approved');
                            }}
                            disabled={!managerBookingsEditingEnabled}
                            className="bg-emerald-950/40 border border-emerald-500/55 hover:bg-emerald-500 hover:text-white text-emerald-400 font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Check size={12} /> Approve Event
                          </button>
                        )}
                        {booking.status !== 'Completed' && (
                          <button
                            onClick={() => {
                              if (!managerBookingsEditingEnabled) return;
                              updateBookingStatus(booking.id, 'Completed');
                            }}
                            disabled={!managerBookingsEditingEnabled}
                            className="bg-blue-950/40 border border-blue-500/55 hover:bg-blue-500 hover:text-white text-blue-400 font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Clock size={12} /> Mark Completed
                          </button>
                        )}
                        {booking.status !== 'Pending' && (
                          <button
                            onClick={() => {
                              if (!managerBookingsEditingEnabled) return;
                              updateBookingStatus(booking.id, 'Pending');
                            }}
                            disabled={!managerBookingsEditingEnabled}
                            className="bg-amber-950/40 border border-primary/50 hover:bg-primary hover:text-white text-primary font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <X size={12} /> Set Pending
                          </button>
                        )}
                        {booking.status !== 'Rejected' && (
                          <button
                            onClick={() => {
                              if (!managerBookingsEditingEnabled) return;
                              updateBookingStatus(booking.id, 'Rejected');
                            }}
                            disabled={!managerBookingsEditingEnabled}
                            className="bg-red-950/40 border border-red-500/55 hover:bg-red-500 hover:text-white text-red-400 font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <XCircle size={12} /> Reject Booking
                          </button>
                        )}
                        {managerBookingsEditingEnabled && (
                          <button
                            onClick={() => {
                              if (!managerBookingsEditingEnabled) return;
                              if (window.confirm(`Are you sure you want to permanently delete "${booking.name}'s" banquet booking?`)) {
                                deleteBooking(booking.id);
                                showNotification(`"${booking.name}'s" booking has been permanently deleted.`);
                              }
                            }}
                            disabled={!managerBookingsEditingEnabled}
                            className="bg-red-950/10 border border-red-500/30 hover:bg-red-500 hover:text-white text-red-400/90 font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed sm:ml-auto ml-0"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'messages' && (
          // TAB 2b: Guest Inquiries Inbox
          <div className="bg-surface border border-outline-variant/35 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
            <div className="border-b border-outline-variant/20 pb-4">
              <h2 className="font-headline text-2xl text-white font-bold flex items-center gap-2">
                <Mail className="text-secondary" /> Guest Inquiries Inbox
              </h2>
              <p className="text-xs text-on-surface-variant font-light mt-1">Direct feedback queries and banquet inquiries left on the contact form.</p>
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-16 text-on-surface-variant/60 font-light space-y-2 bg-surface-low/30 border border-outline-variant/10 rounded-xl">
                <MessageSquare className="w-10 h-10 mx-auto text-outline-variant/50 animate-pulse" />
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

        {activeTab === 'pdrBookings' && (
          // TAB 2B: PDR Bookings Manager
          <div className="bg-surface border border-outline-variant/35 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
            <div className="border-b border-outline-variant/20 pb-4">
              <h2 className="font-headline text-2xl text-white font-bold flex items-center gap-2">
                <CalendarDays className="text-secondary" /> Private Dining Coordinator
              </h2>
              <p className="text-xs text-on-surface-variant font-light mt-1">Review exclusive PDR reservation requests and room assignments.</p>
            </div>

            {!managerBookingsEditingEnabled && (
              <div className="p-4 bg-amber-950/40 border border-amber-500/55 text-amber-400 rounded-xl text-xs flex items-start gap-2.5 shadow-md shadow-amber-500/5 leading-relaxed">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold">Booking Controls Disabled</span>
                  <p className="opacity-90">The Executive Administrator has locked event booking controls. You can review scheduling details, but status approvals and scheduling updates are read-only.</p>
                </div>
              </div>
            )}

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
                            onClick={() => {
                              if (!managerBookingsEditingEnabled) {
                                alert('Action blocked: Operations Manager permissions are currently restricted to read-only.');
                                return;
                              }
                              updatePdrBookingStatus(booking.id, 'Approved');
                            }}
                            disabled={!managerBookingsEditingEnabled}
                            className="bg-emerald-950/40 border border-emerald-500/50 hover:bg-emerald-500 hover:text-white text-emerald-400 font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Check size={12} /> Approve Event
                          </button>
                        )}
                        {booking.status !== 'Completed' && (
                          <button
                            onClick={() => {
                              if (!managerBookingsEditingEnabled) return;
                              updatePdrBookingStatus(booking.id, 'Completed');
                            }}
                            disabled={!managerBookingsEditingEnabled}
                            className="bg-blue-950/40 border border-blue-500/55 hover:bg-blue-500 hover:text-white text-blue-400 font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Clock size={12} /> Mark Completed
                          </button>
                        )}
                        {booking.status !== 'Pending' && (
                          <button
                            onClick={() => {
                              if (!managerBookingsEditingEnabled) return;
                              updatePdrBookingStatus(booking.id, 'Pending');
                            }}
                            disabled={!managerBookingsEditingEnabled}
                            className="bg-amber-950/40 border border-primary/50 hover:bg-primary hover:text-white text-primary font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X size={12} /> Set Pending
                          </button>
                        )}
                        {booking.status !== 'Rejected' && (
                          <button
                            onClick={() => {
                              if (!managerBookingsEditingEnabled) return;
                              updatePdrBookingStatus(booking.id, 'Rejected');
                            }}
                            disabled={!managerBookingsEditingEnabled}
                            className="bg-red-950/40 border border-red-500/50 hover:bg-red-500 hover:text-white text-red-400 font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle size={12} /> Reject Booking
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (!managerBookingsEditingEnabled) {
                              alert('Action blocked: Operations Manager permissions are currently restricted to read-only.');
                              return;
                            }
                            if (window.confirm(`Are you sure you want to permanently delete "${booking.name}'s" PDR booking?`)) {
                              deletePdrBooking(booking.id);
                            }
                          }}
                          disabled={!managerBookingsEditingEnabled}
                          className="bg-red-950/10 border border-red-500/30 hover:bg-red-500 hover:text-white text-red-400/90 font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all duration-300 sm:ml-auto ml-0 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {activeTab === 'gallery' && (
          // TAB 3: Gallery Management (Cloudinary Integrated)
          <div className="bg-surface border border-outline-variant/35 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
            
            {isAddingImage ? (
              // SUBVIEW: Add Image form
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
                  <h2 className="font-headline text-2xl text-white font-bold">Add Gallery Image</h2>
                  <button 
                    onClick={() => setIsAddingImage(false)}
                    className="text-xs text-on-surface-variant hover:text-white border border-outline-variant/30 px-3 py-1.5 rounded-lg hover:bg-surface"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleGallerySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Image Caption / Title</label>
                      <input 
                        type="text" 
                        value={galleryForm.title}
                        onChange={(e) => setGalleryForm(prev => ({ ...prev, title: e.target.value }))}
                        required
                        placeholder="e.g. VIP Velvet Seating"
                        className="w-full bg-background border border-outline-variant/60 rounded-xl py-3 px-4 text-sm text-white placeholder-on-surface-variant/30 focus:outline-none focus:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Image Category</label>
                      <select 
                        value={galleryForm.type}
                        onChange={(e) => setGalleryForm(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full bg-background border border-outline-variant/60 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all appearance-none"
                      >
                        <option value="restaurant">Restaurant Ambience</option>
                        <option value="banquet hall">Banquet Hall</option>
                        <option value="pdr">Private Dining Room (PDR)</option>
                        <option value="food">Food & Drinks</option>
                        <option value="extra">Extra / Other</option>
                      </select>
                    </div>
                    <div className="pt-2 border-t border-outline-variant/15 flex justify-end gap-3">
                      <button 
                        type="button"
                        onClick={() => setIsAddingImage(false)}
                        className="border border-outline-variant/30 text-on-surface-variant hover:text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition-all hover:bg-surface-low"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="bg-primary hover:bg-[#b08d4b] text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                      >
                        <Save size={14} /> Add Picture
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Image Asset (Cloudinary Upload)</label>
                    <CloudinaryUpload 
                      onUploadSuccess={(url) => setGalleryForm(prev => ({ ...prev, image: url }))}
                      currentImage={galleryForm.image}
                      disabled={!managerGalleryEditingEnabled}
                    />
                  </div>
                </form>
              </div>
            ) : (
              // SUBVIEW: Gallery Grid Manager
              <div className="space-y-6">
                
                {!managerGalleryEditingEnabled && (
                  <div className="p-4 bg-amber-950/40 border border-amber-500/55 text-amber-400 rounded-xl text-xs flex items-start gap-2.5 shadow-md shadow-amber-500/5 leading-relaxed mb-6">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-semibold">Gallery Controls Locked</span>
                      <p className="opacity-90">The Executive Administrator has locked Gallery editing permissions. You can view showcase photos, but uploading or removing pictures is disabled.</p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
                  <div>
                    <h2 className="font-headline text-2xl text-white font-bold flex items-center gap-2">
                      <ImageIcon className="text-secondary" /> Gallery Management
                    </h2>
                    <p className="text-xs text-on-surface-variant font-light mt-1">Upload and manage visual assets displayed in the public showcase.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (!managerGalleryEditingEnabled) return;
                      setIsAddingImage(true);
                    }}
                    disabled={!managerGalleryEditingEnabled}
                    className="bg-primary hover:bg-[#b08d4b] disabled:bg-primary/50 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all hover:scale-105 active:scale-95 shadow-md shadow-primary/15 flex items-center gap-1.5 disabled:cursor-not-allowed"
                  >
                    <Plus size={14} /> Upload Picture
                  </button>
                </div>

                {galleryImages.length === 0 ? (
                  <div className="text-center py-16 text-on-surface-variant/60 font-light space-y-2">
                    <FileImage className="w-10 h-10 mx-auto text-outline-variant/50 animate-pulse" />
                    <p>No gallery images uploaded yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {galleryImages.map((img) => (
                      <div 
                        key={img.id}
                        className="bg-surface-low border border-outline-variant/20 rounded-xl overflow-hidden shadow-md flex flex-col group relative"
                      >
                        <div className="relative aspect-video">
                          <img 
                            src={img.image} 
                            alt={img.title} 
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Floating Delete button */}
                          <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button
                              onClick={() => {
                                if (!managerGalleryEditingEnabled) {
                                  alert('Action blocked: Operations Manager permissions are currently restricted to read-only.');
                                  return;
                                }
                                if (window.confirm(`Are you sure you want to delete "${img.title}" from the gallery?`)) {
                                  deleteGalleryImage(img.id);
                                  showNotification(`"${img.title}" removed from gallery.`);
                                }
                              }}
                              disabled={!managerGalleryEditingEnabled}
                              className="p-2 bg-red-950 border border-red-500/80 rounded-lg text-red-400 hover:bg-red-500 hover:text-white disabled:bg-red-950/40 disabled:text-red-800 disabled:border-red-950/10 disabled:cursor-not-allowed transition-all shadow-lg"
                              title="Delete Image"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="p-4 flex-grow flex items-center justify-between">
                          <span className="text-xs font-semibold text-white truncate max-w-[150px]">{img.title}</span>
                          <span className="text-[8px] text-on-surface-variant font-light bg-background/50 border border-outline-variant/10 px-2 py-0.5 rounded capitalize">{img.type || 'Gallery'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {activeTab === 'content' && (
          // TAB 4: Restaurant Content (Whole-Document Menu Cards Manager)
          <div className="space-y-8 animate-fadeIn">
              {/* Header banner */}
              <div className="bg-surface border border-outline-variant/35 rounded-2xl p-6 md:p-8 shadow-xl">
                
                {!managerMenuEditingEnabled && (
                  <div className="p-4 bg-amber-950/40 border border-amber-500/55 text-amber-400 rounded-xl text-xs flex items-start gap-2.5 shadow-md shadow-amber-500/5 leading-relaxed mb-6">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-semibold">Menu Card Uploads Disabled</span>
                      <p className="opacity-90">The Executive Administrator has locked Menu editing permissions. You can preview standard document cards, but uploading new menu flyers is disabled.</p>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-outline-variant/20 pb-5">
                  <div>
                    <h2 className="font-headline text-2xl text-white font-bold flex items-center gap-2.5">
                      <UtensilsCrossed className="text-secondary" /> Restaurant & Banquet Menu Cards
                    </h2>
                    <p className="text-xs text-on-surface-variant font-light mt-1.5 leading-relaxed">
                      Upload and manage the full physical menu documents. The uploaded image/PDF files represent the actual menus containing all dishes and will be displayed in the premium interactive viewer on the live website.
                    </p>
                  </div>
                  <div className="text-[10px] text-primary bg-primary/10 border border-primary/25 px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Database size={12} /> Document Mode Active
                  </div>
                </div>

              {/* Informational Alert Box */}
              <div className="mt-5 p-4 bg-primary/5 border border-primary/20 rounded-xl text-xs text-on-surface-variant/90 leading-relaxed flex items-start gap-3">
                <Info size={16} className="text-secondary flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-white">How this works:</span>
                  <p>
                    Instead of maintaining dozens of individual items manually, simply upload your beautifully designed printed menu sheets or digital PDF flyers. To give your guests a customized experience, you can upload the **Vegetarian Banquet Menu** and **Non-Vegetarian Banquet Menu** separately!
                  </p>
                </div>
              </div>
            </div>

            {/* Layout hierarchy: Main Restaurant Menu first, then Banquet Split Grid */}
            <div className="space-y-8">
              
              {/* SECTION 1: Restaurant Menu */}
              <div className="bg-surface border border-outline-variant/35 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/15 pb-4">
                  <div className="space-y-0.5">
                    <h3 className="font-headline text-lg text-white font-bold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary" /> Restaurant Menu Card
                    </h3>
                    <p className="text-xs text-on-surface-variant font-light">A la Carte & Signature Craft Brews</p>
                  </div>
                  <span className="bg-emerald-950/70 border border-emerald-500/50 text-emerald-400 text-[9px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">Live on Site</span>
                </div>

                {/* Cloudinary Uploader */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  
                  {/* Preview aspect container */}
                  <div className="relative group border border-outline-variant/20 rounded-xl overflow-hidden bg-transparent aspect-[3/4] shadow-md max-h-[300px] mx-auto w-full flex items-center justify-center max-w-[220px]">
                    {restaurantMenuImage ? (
                      <>
                        <img 
                          src={restaurantMenuImage.toLowerCase().split('?')[0].endsWith('.pdf') && restaurantMenuImage.includes('res.cloudinary.com') ? restaurantMenuImage.replace('/upload/', '/upload/pg_1/').replace(/\.pdf($|\?)/, '.jpg$1') : restaurantMenuImage} 
                          alt="Restaurant Menu Preview" 
                          className="w-full h-full object-contain transition-all duration-300 group-hover:scale-[1.02] filter brightness-95"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=1000&auto=format&fit=crop';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <a 
                            href={restaurantMenuImage} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-primary/90 hover:bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg border border-secondary transition-all cursor-pointer"
                          >
                            Open Original
                          </a>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6 text-on-surface-variant/50 space-y-2">
                        <ImageIcon size={32} className="mx-auto stroke-1" />
                        <p className="text-[10px] font-medium">No Restaurant Menu Uploaded</p>
                      </div>
                    )}
                  </div>

                  {/* Uploader widget */}
                  <div className="space-y-4">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Upload New Restaurant Menu Card (Image / PDF)</label>
                    <CloudinaryUpload 
                      key={restaurantMenuImage}
                      onUploadSuccess={(url) => {
                        updateRestaurantMenuImage(url);
                        showNotification("Restaurant Menu Card uploaded successfully!");
                      }}
                      currentImage={restaurantMenuImage}
                      disabled={!managerMenuEditingEnabled}
                    />

                    {restaurantMenuImage && (
                      <button
                        onClick={() => {
                          if (!managerMenuEditingEnabled) return;
                          if (window.confirm("Reset the Restaurant Menu Card to the elegant default printed mockup?")) {
                            updateRestaurantMenuImage('https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=1000&auto=format&fit=crop');
                            showNotification("Restored default Restaurant Menu template.");
                          }
                        }}
                        disabled={!managerMenuEditingEnabled}
                        className="w-full text-center py-2 border border-outline-variant/30 text-on-surface-variant/80 hover:text-white rounded-xl text-xs font-semibold hover:bg-surface-low transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Reset to Default Template
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2: Banquet Split Menus (Veg and Non-Veg Uploaders) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Banquet Card 1: Vegetarian Menu */}
                <div className="bg-surface border border-outline-variant/35 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-outline-variant/15 pb-3">
                      <div className="space-y-0.5">
                        <h3 className="font-headline text-base text-white font-bold flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Banquet Vegetarian Menu
                        </h3>
                        <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Veg Banquet & Catering Packages</span>
                      </div>
                      <span className="bg-emerald-950/70 border border-emerald-500/50 text-emerald-400 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">Live on Site</span>
                    </div>

                    {/* Preview Area */}
                    <div className="relative group border border-outline-variant/20 rounded-xl overflow-hidden bg-transparent aspect-[3/4] shadow-md max-h-[300px] mx-auto w-full flex items-center justify-center max-w-[220px]">
                      {banquetVegMenuImage ? (
                        <>
                          <img 
                            src={banquetVegMenuImage.toLowerCase().split('?')[0].endsWith('.pdf') && banquetVegMenuImage.includes('res.cloudinary.com') ? banquetVegMenuImage.replace('/upload/', '/upload/pg_1/').replace(/\.pdf($|\?)/, '.jpg$1') : banquetVegMenuImage} 
                            alt="Banquet Veg Menu Preview" 
                            className="w-full h-full object-contain transition-all duration-300 group-hover:scale-[1.02] filter brightness-95"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?q=80&w=1000&auto=format&fit=crop';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <a 
                              href={banquetVegMenuImage} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="bg-primary/90 hover:bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg border border-secondary transition-all cursor-pointer"
                            >
                              Open Original
                            </a>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-6 text-on-surface-variant/50 space-y-2">
                          <ImageIcon size={32} className="mx-auto stroke-1" />
                          <p className="text-[10px] font-medium">No Veg Banquet Menu Uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Controls */}
                  <div className="space-y-4 pt-4 border-t border-outline-variant/15">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Upload Veg Menu File (Image / PDF)</label>
                    <CloudinaryUpload 
                      key={banquetVegMenuImage}
                      onUploadSuccess={(url) => {
                        updateBanquetVegMenuImage(url);
                        showNotification("Banquet Vegetarian Menu Card uploaded successfully!");
                      }}
                      currentImage={banquetVegMenuImage}
                      disabled={!managerMenuEditingEnabled}
                    />

                    {banquetVegMenuImage && (
                      <button
                        onClick={() => {
                          if (!managerMenuEditingEnabled) return;
                          if (window.confirm("Reset the Banquet Vegetarian Menu Card to the elegant default Veg template?")) {
                            updateBanquetVegMenuImage('https://images.unsplash.com/photo-1541832676-9b763b0239ab?q=80&w=1000&auto=format&fit=crop');
                            showNotification("Restored default Vegetarian Banquet template.");
                          }
                        }}
                        disabled={!managerMenuEditingEnabled}
                        className="w-full text-center py-2 border border-outline-variant/30 text-on-surface-variant/80 hover:text-white rounded-xl text-xs font-semibold hover:bg-surface-low transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Reset to Default Veg Template
                      </button>
                    )}
                  </div>
                </div>

                {/* Banquet Card 2: Non-Vegetarian Menu */}
                <div className="bg-surface border border-outline-variant/35 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-outline-variant/15 pb-3">
                      <div className="space-y-0.5">
                        <h3 className="font-headline text-base text-white font-bold flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-rose-500" /> Banquet Non-Vegetarian Menu
                        </h3>
                        <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider">Non-Veg Banquet & Catering Packages</span>
                      </div>
                      <span className="bg-emerald-950/70 border border-emerald-500/50 text-emerald-400 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">Live on Site</span>
                    </div>

                    {/* Preview Area */}
                    <div className="relative group border border-outline-variant/20 rounded-xl overflow-hidden bg-transparent aspect-[3/4] shadow-md max-h-[300px] mx-auto w-full flex items-center justify-center max-w-[220px]">
                      {banquetNonVegMenuImage ? (
                        <>
                          <img 
                            src={banquetNonVegMenuImage.toLowerCase().split('?')[0].endsWith('.pdf') && banquetNonVegMenuImage.includes('res.cloudinary.com') ? banquetNonVegMenuImage.replace('/upload/', '/upload/pg_1/').replace(/\.pdf($|\?)/, '.jpg$1') : banquetNonVegMenuImage} 
                            alt="Banquet Non-Veg Menu Preview" 
                            className="w-full h-full object-contain transition-all duration-300 group-hover:scale-[1.02] filter brightness-95"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1000&auto=format&fit=crop';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <a 
                              href={banquetNonVegMenuImage} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="bg-primary/90 hover:bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg border border-secondary transition-all cursor-pointer"
                            >
                              Open Original
                            </a>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-6 text-on-surface-variant/50 space-y-2">
                          <ImageIcon size={32} className="mx-auto stroke-1" />
                          <p className="text-[10px] font-medium">No Non-Veg Banquet Menu Uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Controls */}
                  <div className="space-y-4 pt-4 border-t border-outline-variant/15">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Upload Non-Veg Menu File (Image / PDF)</label>
                    <CloudinaryUpload 
                      key={banquetNonVegMenuImage}
                      onUploadSuccess={(url) => {
                        updateBanquetNonVegMenuImage(url);
                        showNotification("Banquet Non-Vegetarian Menu Card uploaded successfully!");
                      }}
                      currentImage={banquetNonVegMenuImage}
                      disabled={!managerMenuEditingEnabled}
                    />

                    {banquetNonVegMenuImage && (
                      <button
                        onClick={() => {
                          if (!managerMenuEditingEnabled) return;
                          if (window.confirm("Reset the Banquet Non-Vegetarian Menu Card to the elegant default Non-Veg template?")) {
                            updateBanquetNonVegMenuImage('https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1000&auto=format&fit=crop');
                            showNotification("Restored default Non-Vegetarian Banquet template.");
                          }
                        }}
                        disabled={!managerMenuEditingEnabled}
                        className="w-full text-center py-2 border border-outline-variant/30 text-on-surface-variant/80 hover:text-white rounded-xl text-xs font-semibold hover:bg-surface-low transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Reset to Default Non-Veg Template
                      </button>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          // TAB 5: Operational Settings
          <div className="bg-surface border border-outline-variant/35 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
            
            {!managerSettingsEditingEnabled && (
              <div className="p-4 bg-amber-950/40 border border-amber-500/55 text-amber-400 rounded-xl text-xs flex items-start gap-2.5 shadow-md shadow-amber-500/5 leading-relaxed">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold">Operational Settings Locked</span>
                  <p className="opacity-90">The Executive Administrator has locked store contact parameters. Weekday operating hours and Swiggy store listing linkages are currently read-only.</p>
                </div>
              </div>
            )}
            
            <div className="border-b border-outline-variant/20 pb-4">
              <h2 className="font-headline text-2xl text-white font-bold flex items-center gap-2">
                <SettingsIcon className="text-secondary" /> Restaurant Operational Settings
              </h2>
              <p className="text-xs text-on-surface-variant font-light mt-1">Configure business address details, phone numbers, hours of operation, and Swiggy links.</p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5"><MapPin size={12} className="text-secondary" /> Business Address</label>
                  <textarea 
                    name="address" 
                    required
                    rows="2"
                    disabled={!managerSettingsEditingEnabled}
                    value={contactForm.address}
                    onChange={handleContactChange}
                    className="w-full bg-background border border-outline-variant/60 rounded-xl py-3 px-4 text-sm text-white placeholder-on-surface-variant/30 focus:outline-none focus:border-primary transition-all resize-none disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5"><Phone size={12} className="text-secondary" /> Telephone Number</label>
                  <input 
                    type="text" 
                    name="phone"
                    required
                    disabled={!managerSettingsEditingEnabled}
                    value={contactForm.phone}
                    onChange={handleContactChange}
                    className="w-full bg-background border border-outline-variant/60 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5"><Mail size={12} className="text-secondary" /> Guest Relations Email</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    disabled={!managerSettingsEditingEnabled}
                    value={contactForm.email}
                    onChange={handleContactChange}
                    className="w-full bg-background border border-outline-variant/60 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5 col-span-2 border-t border-outline-variant/15 pt-4">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5"><Clock size={12} className="text-secondary" /> Weekday Operating Hours</label>
                  <input 
                    type="text" 
                    name="hoursWeekday"
                    required
                    disabled={!managerSettingsEditingEnabled}
                    value={contactForm.hoursWeekday}
                    onChange={handleContactChange}
                    className="w-full bg-background border border-outline-variant/60 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5"><Clock size={12} className="text-secondary" /> Weekend Operating Hours</label>
                  <input 
                    type="text" 
                    name="hoursWeekend"
                    required
                    disabled={!managerSettingsEditingEnabled}
                    value={contactForm.hoursWeekend}
                    onChange={handleContactChange}
                    className="w-full bg-background border border-outline-variant/60 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5 col-span-2 border-t border-outline-variant/15 pt-4">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5"><ShoppingBag size={12} className="text-secondary" /> Swiggy Store Listing Link</label>
                  <input 
                    type="text" 
                    name="swiggy"
                    required
                    disabled={!managerSettingsEditingEnabled}
                    value={contactForm.swiggy}
                    onChange={handleContactChange}
                    className="w-full bg-background border border-outline-variant/60 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5"><ShoppingBag size={12} className="text-secondary" /> Zomato Store Listing Link</label>
                  <input 
                    type="text" 
                    name="zomato"
                    required
                    disabled={!managerSettingsEditingEnabled}
                    value={contactForm.zomato}
                    onChange={handleContactChange}
                    className="w-full bg-background border border-outline-variant/60 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/20 flex justify-end">
                <button 
                  type="submit"
                  disabled={!managerSettingsEditingEnabled}
                  className="bg-primary hover:bg-[#b08d4b] disabled:bg-primary/50 text-white font-bold py-3.5 px-8 rounded-xl text-sm transition-all hover:scale-105 active:scale-95 shadow-md shadow-primary/15 flex items-center gap-2 duration-300 disabled:cursor-not-allowed"
                >
                  <Save size={16} /> Save Settings
                </button>
              </div>

            </form>
          </div>
        )}

        {isAddingBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              onClick={() => setIsAddingBooking(false)}
              className="absolute inset-0 bg-background/90 backdrop-blur-sm"
            />
            {/* Modal content */}
            <div className="relative w-full max-w-lg bg-surface border border-outline-variant/40 rounded-2xl shadow-2xl overflow-hidden z-10 animate-fadeIn">
              <div className="p-6 bg-surface-low border-b border-outline-variant/20 flex justify-between items-center">
                <div>
                  <h3 className="font-headline text-xl text-primary font-bold">
                    {editingBookingId ? 'Edit Banquet Booking' : 'Add Offline Banquet Booking'}
                  </h3>
                  <p className="text-[10px] text-on-surface-variant/80 font-light mt-0.5">
                    {editingBookingId ? 'Modify reservation parameters and details.' : 'Register walk-in, phone-in, or custom offline events.'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsAddingBooking(false)}
                  className="text-xs text-on-surface-variant hover:text-white border border-outline-variant/30 px-3 py-1.5 rounded-lg hover:bg-surface"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleOfflineBookingSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Host / Guest Name</label>
                  <input 
                    type="text"
                    required
                    value={offlineBookingForm.name}
                    onChange={(e) => setOfflineBookingForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Sayed Ali"
                    className="w-full bg-background border border-outline-variant/60 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Phone Number</label>
                    <input 
                      type="text"
                      required
                      value={offlineBookingForm.phone}
                      onChange={(e) => setOfflineBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-background border border-outline-variant/60 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Email Address (Optional)</label>
                    <input 
                      type="email"
                      value={offlineBookingForm.email}
                      onChange={(e) => setOfflineBookingForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g. host@example.com"
                      className="w-full bg-background border border-outline-variant/60 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Expected Guests</label>
                    <input 
                      type="number"
                      required
                      value={offlineBookingForm.guests}
                      onChange={(e) => setOfflineBookingForm(prev => ({ ...prev, guests: e.target.value }))}
                      placeholder="e.g. 150"
                      className="w-full bg-background border border-outline-variant/60 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Initial Status</label>
                    <select
                      value={offlineBookingForm.status}
                      onChange={(e) => setOfflineBookingForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full bg-background border border-outline-variant/60 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                    >
                      <option value="Approved">Approved (Confirmed Reservation)</option>
                      <option value="Pending">Pending (Draft / Unconfirmed Inquiry)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Event Type</label>
                    <select
                      value={offlineBookingForm.eventType}
                      onChange={(e) => setOfflineBookingForm(prev => ({ ...prev, eventType: e.target.value }))}
                      className="w-full bg-background border border-outline-variant/60 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                    >
                      <option value="Wedding Reception">Wedding Reception</option>
                      <option value="Corporate Gathering">Corporate Gathering</option>
                      <option value="Birthday Party">Birthday Party</option>
                      <option value="Family Celebration">Family Celebration</option>
                      <option value="Custom Event">Custom Event</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Catering Menu</label>
                    <select
                      value={offlineBookingForm.catering}
                      onChange={(e) => setOfflineBookingForm(prev => ({ ...prev, catering: e.target.value }))}
                      className="w-full bg-background border border-outline-variant/60 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                    >
                      <option value="Veg Silver">Veg Silver</option>
                      <option value="Veg Gold">Veg Gold</option>
                      <option value="Non-Veg Silver">Non-Veg Silver</option>
                      <option value="Non-Veg Gold">Non-Veg Gold</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Session / Time Selection</label>
                  <select
                    value={offlineBookingForm.session}
                    onChange={(e) => setOfflineBookingForm(prev => ({ ...prev, session: e.target.value }))}
                    className="w-full bg-background border border-outline-variant/60 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                  >
                    <option value="Lunch: 10:30 AM - 03:30 PM">Lunch: 10:30 AM - 03:30 PM</option>
                    <option value="Dinner: 06:30 PM - 10:30 PM">Dinner: 06:30 PM - 10:30 PM</option>
                  </select>
                </div>

                <div className="space-y-1.5 border-t border-outline-variant/10 pt-4 mt-2">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2 text-center">Select Event Date</label>
                  <BanquetDatePicker 
                    selectedDate={offlineBookingForm.date}
                    onChange={(date) => setOfflineBookingForm(prev => ({ ...prev, date }))}
                    bookings={bookings}
                    excludeBookingId={editingBookingId}
                    selectedSession={offlineBookingForm.session}
                  />
                  {offlineBookingForm.date && (
                    <p className="text-xs text-primary font-bold mt-2 text-center">
                      Selected: {new Date(offlineBookingForm.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Special Notes</label>
                  <textarea 
                    rows="2"
                    value={offlineBookingForm.notes}
                    onChange={(e) => setOfflineBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="e.g. Stage request, mic setup, standard flower decoration details..."
                    className="w-full bg-background border border-outline-variant/60 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-outline-variant/15 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsAddingBooking(false)}
                    className="border border-outline-variant/30 text-on-surface-variant hover:text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition-all hover:bg-surface-low"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-primary hover:bg-[#b08d4b] text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer duration-300"
                  >
                    <Save size={14} /> {editingBookingId ? 'Update Reservation' : 'Save Reservation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};

export default ManagerDashboard;
