import React, { useState, useEffect } from 'react';
import { DataContext } from './DataContext';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

const DEFAULT_MENU_ITEMS = [
  {
    id: 'biryani-1',
    name: 'Bagara Rice with Mutton Dalcha',
    category: 'biryanis',
    price: '₹420',
    description: 'Fragrant Bagara rice seasoned with mint, coriander, and light whole spices, served alongside Nizami-style slow-cooked mutton and lentil stew.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop',
    isSpicy: false,
    isChefSpecial: true,
    isVeg: false,
    menuType: 'restaurant',
  },
  {
    id: 'biryani-2',
    name: 'Authentic Hyderabadi Chicken Biryani',
    category: 'biryanis',
    price: '₹390',
    description: 'World-famous slow-cooked Dum biryani featuring tender marinated chicken layered with premium saffron-stained long-grain basmati rice and aromatic Nizami spices.',
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=600&auto=format&fit=crop',
    isSpicy: true,
    isChefSpecial: true,
    isVeg: false,
    menuType: 'restaurant',
  },
  {
    id: 'biryani-3',
    name: 'Royal Vegetable Dum Biryani',
    category: 'biryanis',
    price: '₹320',
    description: 'A vibrant medley of fresh seasonal vegetables and cottage cheese marinated in rich yoghurt spices, slow-cooked in handis with aromatic basmati rice.',
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?q=80&w=600&auto=format&fit=crop',
    isSpicy: false,
    isChefSpecial: false,
    isVeg: true,
    menuType: 'restaurant',
  },
  {
    id: 'starter-1',
    name: 'Pathar ka Gosht',
    category: 'starters',
    price: '₹450',
    description: 'Tender mutton slices marinated overnight in green papaya, ginger-garlic, and Deccan stone-ground spices, cooked slow on a hot granite stone slab.',
    image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?q=80&w=600&auto=format&fit=crop',
    isSpicy: true,
    isChefSpecial: true,
    isVeg: false,
    menuType: 'restaurant',
  },
  {
    id: 'starter-2',
    name: 'Jubilee Hills Crispy Paneer',
    category: 'starters',
    price: '₹340',
    description: 'Premium soft paneer cubes wok-tossed in a spicy home-brewed craft beer reduction, ginger, curry leaves, and cracked black pepper.',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=600&auto=format&fit=crop',
    isSpicy: true,
    isChefSpecial: false,
    isVeg: true,
    menuType: 'restaurant',
  },
  {
    id: 'starter-3',
    name: 'Nizami Shikampuri Kebab',
    category: 'starters',
    price: '₹410',
    description: 'Pan-griddled patties of minced lamb and chana dal stuffed with a smooth hung curd center, fresh mint, green chillies, and finely chopped red onions.',
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?q=80&w=600&auto=format&fit=crop',
    isSpicy: false,
    isChefSpecial: true,
    isVeg: false,
    menuType: 'restaurant',
  },
  {
    id: 'brew-1',
    name: 'Deccan Gold Ale',
    category: 'brews',
    price: '₹280',
    description: 'A crisp, easy-drinking golden ale brewed locally with organic barley. Features light citrus notes and a clean, refreshing malt finish.',
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=600&auto=format&fit=crop',
    isSpicy: false,
    isChefSpecial: false,
    isVeg: true,
    menuType: 'restaurant',
  },
  {
    id: 'brew-2',
    name: 'Nizami Witbier',
    category: 'brews',
    price: '₹300',
    description: 'Belgian-style wheat beer brewed with a local twist using dried orange peel, coriander seeds, and a hint of green cardamom for a spiced heritage aroma.',
    image: 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?q=80&w=600&auto=format&fit=crop',
    isSpicy: false,
    isChefSpecial: true,
    isVeg: true,
    menuType: 'restaurant',
  },
  {
    id: 'brew-3',
    name: 'Charminar Stout',
    category: 'brews',
    price: '₹320',
    description: 'A luxurious dark oatmeal stout presenting complex aromas of fresh roasted coffee beans, premium dark chocolate, and a thick, creamy head.',
    image: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?q=80&w=600&auto=format&fit=crop',
    isSpicy: false,
    isChefSpecial: false,
    isVeg: true,
    menuType: 'restaurant',
  },
  {
    id: 'dessert-1',
    name: 'Saffron Shahi Tukda',
    category: 'desserts',
    price: '₹190',
    description: 'Imperial bread pudding deep fried in ghee, soaked in fragrant sugar syrup, and layered generously with dense cardamom rabri and genuine gold leaf.',
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop',
    isSpicy: false,
    isChefSpecial: true,
    isVeg: true,
    menuType: 'restaurant',
  },
  {
    id: 'dessert-2',
    name: 'Double ka Meetha',
    category: 'desserts',
    price: '₹180',
    description: 'A traditional Hyderabadi celebration dessert of baked bread slices simmered in concentrated sweet milk, cream, and crunchy chopped almonds and pistachios.',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop',
    isSpicy: false,
    isChefSpecial: false,
    isVeg: true,
    menuType: 'restaurant',
  },
  {
    id: 'dessert-3',
    name: 'Qubani ka Meetha with Ice Cream',
    category: 'desserts',
    price: '₹210',
    description: 'Delectable stewed dried apricots cooked to a rich glaze, served warm with a scoop of premium house-churned organic vanilla bean ice cream.',
    image: 'https://images.unsplash.com/photo-149514740007a-f8a53e30d22c?q=80&w=600&auto=format&fit=crop',
    isSpicy: false,
    isChefSpecial: false,
    isVeg: true,
    menuType: 'restaurant',
  },
  // Banquet & Catering Packages
  {
    id: 'banquet-1',
    name: 'Royal Shahi Banquet Feast',
    category: 'starters',
    price: '₹1,200 / Guest',
    description: 'Our signature banquet package starting with welcome saffron mint mocktails, live Pathar ka Gosht stone-griddle counters, followed by Bagara Rice, Mutton Dalcha, and hot saffron Shahi Tukda.',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=600&auto=format&fit=crop',
    isSpicy: true,
    isChefSpecial: true,
    isVeg: false,
    menuType: 'banquet',
  },
  {
    id: 'banquet-2',
    name: 'Imperial Grand Celebration Package',
    category: 'biryanis',
    price: '₹1,600 / Guest',
    description: 'A luxurious grand wedding & corporate catering selection with specialized live tables. Includes unlimited custom craft wheat beers, unlimited Dum Biryani handis, and complete Nizami velvet upholstery settings.',
    image: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=600&auto=format&fit=crop',
    isSpicy: false,
    isChefSpecial: true,
    isVeg: false,
    menuType: 'banquet',
  },
  {
    id: 'banquet-3',
    name: 'Vrindavan Premium Veg Banquet',
    category: 'desserts',
    price: '₹950 / Guest',
    description: 'Premium pure vegetarian corporate and family gathering feast package. Features customized paneer tikka, slow-cooked handi vegetable dum biryani, and stewed Qubani apricots with ice cream.',
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?q=80&w=600&auto=format&fit=crop',
    isSpicy: false,
    isChefSpecial: false,
    isVeg: true,
    menuType: 'banquet',
  }
];

const DEFAULT_CONTACT_INFO = {
  address: 'SY NO 25/LU, PLOT NO 18, Raichandani Mall 3rd Floor, Ruby Block, Qutubullapur, Petbasheerabad, Brundavan Colony, Kompally, Hyderabad, Telangana 500100',
  phone: '+91 79953 61212',
  email: 'hello@bagarakitchen.com',
  instagram: 'https://www.instagram.com/thebagarakitchen.bar',
  website: 'https://bagarakitchen.com',
  swiggy: 'https://www.swiggy.com/city/hyderabad/tbk-the-bagara-kitchen-and-bar-vrindavan-colony-kompalli-rest1338889',
  zomato: 'https://zomato.com',
  hoursWeekday: '12:00 PM - 3:30 PM, 6:30 PM - 12:30 AM',
  hoursWeekend: '12:00 PM - 4:00 PM, 6:30 PM - 1:30 AM'
};

const DEFAULT_CLOUDINARY_SETTINGS = {
  cloudName: '',
  uploadPreset: ''
};

const DEFAULT_PDR_SETTINGS = {
  room1: { capacity: '20', price: '5000' },
  room2: { capacity: '40', price: '8000' }
};

const DEFAULT_GALLERY_IMAGES = [
  { id: 'gal-1', title: 'Luxury Ochre Velvet Seating', image: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=600&auto=format&fit=crop', type: 'banquet hall', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'gal-2', title: 'Authentic Nizam Kitchen handis', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop', type: 'food', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'gal-3', title: 'Luxurious dining room ambience', image: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?q=80&w=600&auto=format&fit=crop', type: 'restaurant', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
];

export const DataProvider = ({ children }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [contactInfo, setContactInfo] = useState({});
  const [cloudinarySettings, setCloudinarySettings] = useState({});
  const [bookings, setBookings] = useState([]);
  const [pdrBookings, setPdrBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  
  const [restaurantMenuImage, setRestaurantMenuImage] = useState('');
  const [banquetMenuImage, setBanquetMenuImage] = useState('');
  const [banquetVegMenuImage, setBanquetVegMenuImage] = useState('');
  const [banquetNonVegMenuImage, setBanquetNonVegMenuImage] = useState('');
  
  const [managerMenuEditingEnabled, setManagerMenuEditingEnabled] = useState(true);
  const [managerGalleryEditingEnabled, setManagerGalleryEditingEnabled] = useState(true);
  const [managerSettingsEditingEnabled, setManagerSettingsEditingEnabled] = useState(true);
  const [managerBookingsEditingEnabled, setManagerBookingsEditingEnabled] = useState(true);
  
  const [advanceAmount, setAdvanceAmount] = useState('5000');
  const [pdrSettings, setPdrSettings] = useState(DEFAULT_PDR_SETTINGS);
  const [pdrPaymentEnabled, setPdrPaymentEnabled] = useState(true);
  
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Initial State Load with Cloud Firestore Fallback
  useEffect(() => {
    const loadAllData = async () => {
      let dbData = null;
      try {
        const response = await fetch('/api/data');
        dbData = await response.json();
      } catch (e) {
        console.log('Backend sync offline, falling back to local storage.');
      }

      // Check if Firebase is active and Firestore is connected
      if (isFirebaseConfigured && db) {
        try {
          console.log('%c🔥 Fetching state from Cloud Firestore...', 'color: #ffca28; font-weight: bold;');
          
          // A. Settings (flyer images, perm flags, contact details, cloudinary)
          const settingsRef = doc(db, 'settings', 'operational');
          const settingsSnap = await getDoc(settingsRef);
          let settings = {};
          if (settingsSnap.exists()) {
            settings = settingsSnap.data();
          }

          // B. Bookings
          const bookingsSnap = await getDocs(collection(db, 'bookings'));
          const loadedBookings = [];
          bookingsSnap.forEach((doc) => {
            loadedBookings.push(doc.data());
          });

          // B2. PDR Bookings
          const pdrBookingsSnap = await getDocs(collection(db, 'pdrBookings'));
          const loadedPdrBookings = [];
          pdrBookingsSnap.forEach((doc) => {
            loadedPdrBookings.push(doc.data());
          });

          // C. Menu Items
          const menuItemsSnap = await getDocs(collection(db, 'menuItems'));
          const loadedMenuItems = [];
          menuItemsSnap.forEach((doc) => {
            loadedMenuItems.push(doc.data());
          });

          // D. Gallery Images
          const gallerySnap = await getDocs(collection(db, 'galleryImages'));
          const loadedGallery = [];
          gallerySnap.forEach((doc) => {
            loadedGallery.push(doc.data());
          });

          // Seeding: If Firestore is fresh, seed defaults in the background
          if (!settingsSnap.exists() && loadedMenuItems.length === 0) {
            console.log('%c🌱 Seeding fresh Firestore configuration...', 'color: #00e676; font-weight: bold;');
            
            const defaultSettings = {
              contactInfo: dbData?.contactInfo || DEFAULT_CONTACT_INFO,
              cloudinarySettings: dbData?.cloudinarySettings || DEFAULT_CLOUDINARY_SETTINGS,
              restaurantMenuImage: dbData?.restaurantMenuImage || 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=1000&auto=format&fit=crop',
              banquetMenuImage: dbData?.banquetMenuImage || 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1000&auto=format&fit=crop',
              banquetVegMenuImage: dbData?.banquetVegMenuImage || 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?q=80&w=1000&auto=format&fit=crop',
              banquetNonVegMenuImage: dbData?.banquetNonVegMenuImage || 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1000&auto=format&fit=crop',
              managerMenuEditingEnabled: true,
              managerGalleryEditingEnabled: true,
              managerSettingsEditingEnabled: true,
              managerBookingsEditingEnabled: true,
              pdrPaymentEnabled: true,
              pdrSettings: dbData?.pdrSettings || DEFAULT_PDR_SETTINGS,
              messages: dbData?.messages || [
                { id: 'm-1', name: 'Amit Verma', email: 'amit@example.com', message: 'Looking for a table booking of 12 guests this Saturday night around 9:00 PM. Do you offer parking?', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
              ]
            };
            await setDoc(settingsRef, defaultSettings);

            const itemsToSeed = dbData?.menuItems || DEFAULT_MENU_ITEMS;
            for (const item of itemsToSeed) {
              await setDoc(doc(db, 'menuItems', item.id), item);
            }

            const galleryToSeed = dbData?.galleryImages || DEFAULT_GALLERY_IMAGES;
            for (const img of galleryToSeed) {
              await setDoc(doc(db, 'galleryImages', img.id), img);
            }

            const bookingsToSeed = dbData?.bookings || [
              { id: 'b-1', name: 'Rakesh Sharma', email: 'rakesh@example.com', phone: '9876543210', date: '2026-06-15', guests: '150', eventType: 'Wedding Reception', catering: 'Authentic Nizami Menu', notes: 'Stage setup and mic requested.', status: 'Approved', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
              { id: 'b-2', name: 'Dr. Srinivas Rao', email: 'srinivas@example.com', phone: '8765432109', date: '2026-06-28', guests: '100', eventType: 'Corporate Gathering', catering: 'Royal Fusion Menu', notes: 'Need high-speed projector.', status: 'Pending', timestamp: new Date().toISOString() }
            ];
            for (const b of bookingsToSeed) {
              await setDoc(doc(db, 'bookings', b.id), b);
            }

            setMenuItems(itemsToSeed);
            setContactInfo(defaultSettings.contactInfo);
            setCloudinarySettings(defaultSettings.cloudinarySettings);
            setBookings(bookingsToSeed);
            setPdrBookings([]); // Default empty for new setups
            setMessages(defaultSettings.messages);
            setGalleryImages(galleryToSeed);
            setRestaurantMenuImage(defaultSettings.restaurantMenuImage);
            setBanquetMenuImage(defaultSettings.banquetMenuImage);
            setBanquetVegMenuImage(defaultSettings.banquetVegMenuImage);
            setBanquetNonVegMenuImage(defaultSettings.banquetNonVegMenuImage);
            setManagerMenuEditingEnabled(true);
            setManagerGalleryEditingEnabled(true);
            setManagerSettingsEditingEnabled(true);
            setManagerBookingsEditingEnabled(true);
            setPdrSettings(defaultSettings.pdrSettings);
            setPdrPaymentEnabled(true);
            setAdvanceAmount(defaultSettings.advanceAmount || '5000');
          } else {
            // Apply loaded values
            setMenuItems(loadedMenuItems);
            setContactInfo(settings.contactInfo || DEFAULT_CONTACT_INFO);
            setCloudinarySettings(settings.cloudinarySettings || DEFAULT_CLOUDINARY_SETTINGS);
            setBookings(loadedBookings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
            setPdrBookings(loadedPdrBookings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
            setMessages(settings.messages || []);
            setGalleryImages(loadedGallery.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
            setRestaurantMenuImage(settings.restaurantMenuImage || '');
            setBanquetMenuImage(settings.banquetMenuImage || '');
            setBanquetVegMenuImage(settings.banquetVegMenuImage || '');
            setBanquetNonVegMenuImage(settings.banquetNonVegMenuImage || '');
            setManagerMenuEditingEnabled(settings.managerMenuEditingEnabled !== undefined ? settings.managerMenuEditingEnabled : true);
            setManagerGalleryEditingEnabled(settings.managerGalleryEditingEnabled !== undefined ? settings.managerGalleryEditingEnabled : true);
            setManagerSettingsEditingEnabled(settings.managerSettingsEditingEnabled !== undefined ? settings.managerSettingsEditingEnabled : true);
            setManagerBookingsEditingEnabled(settings.managerBookingsEditingEnabled !== undefined ? settings.managerBookingsEditingEnabled : true);
            setPdrPaymentEnabled(settings.pdrPaymentEnabled !== undefined ? settings.pdrPaymentEnabled : true);
            setPdrSettings(settings.pdrSettings || DEFAULT_PDR_SETTINGS);
            setAdvanceAmount(settings.advanceAmount !== undefined ? settings.advanceAmount : '5000');
          }

          setIsLoaded(true);
          return;
        } catch (err) {
          console.error('Cloud Firestore fetch failed. Falling back to local storage storage.', err);
        }
      }

      // 2. Fallback: LocalStorage / dbData loading
      if (dbData && dbData.initialized) {
        setMenuItems(dbData.menuItems || []);
        setContactInfo(dbData.contactInfo || {});
        setCloudinarySettings(dbData.cloudinarySettings || {});
        setBookings(dbData.bookings || []);
        setPdrBookings(dbData.pdrBookings || []);
        setMessages(dbData.messages || []);
        setGalleryImages(dbData.galleryImages || []);
        setRestaurantMenuImage(dbData.restaurantMenuImage || '');
        setBanquetMenuImage(dbData.banquetMenuImage || '');
        setBanquetVegMenuImage(dbData.banquetVegMenuImage || '');
        setBanquetNonVegMenuImage(dbData.banquetNonVegMenuImage || '');
        setManagerMenuEditingEnabled(dbData.managerMenuEditingEnabled !== undefined ? dbData.managerMenuEditingEnabled : true);
        setManagerGalleryEditingEnabled(dbData.managerGalleryEditingEnabled !== undefined ? dbData.managerGalleryEditingEnabled : true);
        setManagerSettingsEditingEnabled(dbData.managerSettingsEditingEnabled !== undefined ? dbData.managerSettingsEditingEnabled : true);
        setManagerBookingsEditingEnabled(dbData.managerBookingsEditingEnabled !== undefined ? dbData.managerBookingsEditingEnabled : true);
        setPdrPaymentEnabled(dbData.pdrPaymentEnabled !== undefined ? dbData.pdrPaymentEnabled : true);
        setPdrSettings(dbData.pdrSettings || DEFAULT_PDR_SETTINGS);
        setAdvanceAmount(dbData.advanceAmount !== undefined ? dbData.advanceAmount : '5000');
        setIsLoaded(true);
        return;
      }

      const savedMenu = localStorage.getItem('tbk_menu');
      let finalMenu = DEFAULT_MENU_ITEMS;
      if (savedMenu) finalMenu = JSON.parse(savedMenu);
      setMenuItems(finalMenu);

      const savedContact = localStorage.getItem('tbk_contact');
      let finalContact = DEFAULT_CONTACT_INFO;
      if (savedContact) finalContact = JSON.parse(savedContact);
      setContactInfo(finalContact);

      const savedCloudinary = localStorage.getItem('tbk_cloudinary');
      let finalCloudinary = DEFAULT_CLOUDINARY_SETTINGS;
      if (savedCloudinary) finalCloudinary = JSON.parse(savedCloudinary);
      setCloudinarySettings(finalCloudinary);

      const savedBookings = localStorage.getItem('tbk_bookings');
      let finalBookings = [];
      if (savedBookings) finalBookings = JSON.parse(savedBookings);
      setBookings(finalBookings);

      const savedPdrBookings = localStorage.getItem('tbk_pdr_bookings');
      let finalPdrBookings = [];
      if (savedPdrBookings) finalPdrBookings = JSON.parse(savedPdrBookings);
      setPdrBookings(finalPdrBookings);

      const savedMessages = localStorage.getItem('tbk_messages');
      let finalMessages = [];
      if (savedMessages) finalMessages = JSON.parse(savedMessages);
      setMessages(finalMessages);

      const savedGallery = localStorage.getItem('tbk_gallery');
      let finalGallery = DEFAULT_GALLERY_IMAGES;
      if (savedGallery) finalGallery = JSON.parse(savedGallery);
      setGalleryImages(finalGallery);

      setRestaurantMenuImage(localStorage.getItem('tbk_res_menu_img') || 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=1000&auto=format&fit=crop');
      setBanquetMenuImage(localStorage.getItem('tbk_ban_menu_img') || 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1000&auto=format&fit=crop');
      setBanquetVegMenuImage(localStorage.getItem('tbk_ban_veg_menu_img') || 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?q=80&w=1000&auto=format&fit=crop');
      setBanquetNonVegMenuImage(localStorage.getItem('tbk_ban_non_veg_menu_img') || 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1000&auto=format&fit=crop');

      setManagerMenuEditingEnabled(localStorage.getItem('tbk_manager_menu_edit') !== null ? JSON.parse(localStorage.getItem('tbk_manager_menu_edit')) : true);
      setManagerGalleryEditingEnabled(localStorage.getItem('tbk_manager_gallery_edit') !== null ? JSON.parse(localStorage.getItem('tbk_manager_gallery_edit')) : true);
      setManagerSettingsEditingEnabled(localStorage.getItem('tbk_manager_settings_edit') !== null ? JSON.parse(localStorage.getItem('tbk_manager_settings_edit')) : true);
      setManagerBookingsEditingEnabled(localStorage.getItem('tbk_manager_bookings_edit') !== null ? JSON.parse(localStorage.getItem('tbk_manager_bookings_edit')) : true);
      
      const savedPdr = localStorage.getItem('tbk_pdr_settings');
      let finalPdr = DEFAULT_PDR_SETTINGS;
      if (savedPdr) finalPdr = JSON.parse(savedPdr);
      setPdrSettings(finalPdr);

      setAdvanceAmount(localStorage.getItem('tbk_advance_amount') || '5000');

      setIsLoaded(true);
    };

    loadAllData();
  }, []);

  // 1b. Real-time Firebase listeners
  useEffect(() => {
    if (!isLoaded || !isFirebaseConfigured || !db) return;

    console.log('%c🔥 Subscribing to real-time Cloud Firestore listeners...', 'color: #ffca28; font-weight: bold;');

    const unsubscribeBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const loadedBookings = [];
      snapshot.forEach((doc) => {
        loadedBookings.push(doc.data());
      });
      setBookings(loadedBookings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    }, (err) => {
      console.error('Real-time bookings sync failed:', err);
    });

    const unsubscribePdrBookings = onSnapshot(collection(db, 'pdrBookings'), (snapshot) => {
      const loadedPdrBookings = [];
      snapshot.forEach((doc) => {
        loadedPdrBookings.push(doc.data());
      });
      setPdrBookings(loadedPdrBookings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    }, (err) => {
      console.error('Real-time PDR bookings sync failed:', err);
    });

    const unsubscribeMenuItems = onSnapshot(collection(db, 'menuItems'), (snapshot) => {
      const loadedMenuItems = [];
      snapshot.forEach((doc) => {
        loadedMenuItems.push(doc.data());
      });
      setMenuItems(loadedMenuItems);
    }, (err) => {
      console.error('Real-time menuItems sync failed:', err);
    });

    const unsubscribeGallery = onSnapshot(collection(db, 'galleryImages'), (snapshot) => {
      const loadedGallery = [];
      snapshot.forEach((doc) => {
        loadedGallery.push(doc.data());
      });
      setGalleryImages(loadedGallery.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    }, (err) => {
      console.error('Real-time galleryImages sync failed:', err);
    });

    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'operational'), (docSnap) => {
      if (docSnap.exists()) {
        const settings = docSnap.data();
        setContactInfo(settings.contactInfo || DEFAULT_CONTACT_INFO);
        setCloudinarySettings(settings.cloudinarySettings || DEFAULT_CLOUDINARY_SETTINGS);
        setMessages(settings.messages || []);
        setRestaurantMenuImage(settings.restaurantMenuImage || '');
        setBanquetMenuImage(settings.banquetMenuImage || '');
        setBanquetVegMenuImage(settings.banquetVegMenuImage || '');
        setBanquetNonVegMenuImage(settings.banquetNonVegMenuImage || '');
        setManagerMenuEditingEnabled(settings.managerMenuEditingEnabled !== undefined ? settings.managerMenuEditingEnabled : true);
        setManagerGalleryEditingEnabled(settings.managerGalleryEditingEnabled !== undefined ? settings.managerGalleryEditingEnabled : true);
        setManagerSettingsEditingEnabled(settings.managerSettingsEditingEnabled !== undefined ? settings.managerSettingsEditingEnabled : true);
        setManagerBookingsEditingEnabled(settings.managerBookingsEditingEnabled !== undefined ? settings.managerBookingsEditingEnabled : true);
        setPdrSettings(settings.pdrSettings || DEFAULT_PDR_SETTINGS);
      }
    }, (err) => {
      console.error('Real-time settings sync failed:', err);
    });

    return () => {
      unsubscribeBookings();
      unsubscribePdrBookings();
      unsubscribeMenuItems();
      unsubscribeGallery();
      unsubscribeSettings();
    };
  }, [isLoaded, isFirebaseConfigured]);

  // 3. Automated real-time state synchronization backend listener (dev fallbacks)
  useEffect(() => {
    if (!isLoaded || (isFirebaseConfigured && db)) return;

    const syncStateToBackend = async () => {
      try {
        await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            initialized: true,
            menuItems,
            contactInfo,
            cloudinarySettings,
            bookings,
            pdrBookings,
            messages,
            galleryImages,
            restaurantMenuImage,
            banquetMenuImage,
            banquetVegMenuImage,
            banquetNonVegMenuImage,
            managerMenuEditingEnabled,
            managerGalleryEditingEnabled,
            managerSettingsEditingEnabled,
            managerBookingsEditingEnabled,
            pdrSettings
          })
        });
      } catch (e) {
        console.log('Failed to synchronize state variables over network.');
      }
    };

    const timer = setTimeout(syncStateToBackend, 300);
    return () => clearTimeout(timer);
  }, [menuItems, contactInfo, cloudinarySettings, bookings, pdrBookings, messages, galleryImages, restaurantMenuImage, banquetMenuImage, banquetVegMenuImage, banquetNonVegMenuImage, managerMenuEditingEnabled, managerGalleryEditingEnabled, managerSettingsEditingEnabled, managerBookingsEditingEnabled, pdrSettings, isLoaded]);

  // Firestore Settings Helper
  const syncSettingsFieldToFirestore = async (fieldName, value) => {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'settings', 'operational'), { [fieldName]: value });
      } catch (err) {
        try {
          await setDoc(doc(db, 'settings', 'operational'), { [fieldName]: value }, { merge: true });
        } catch (e) {
          console.error('Failed to sync settings field to Firestore:', e);
        }
      }
    }
  };

  // Menu operations
  const addMenuItem = async (item) => {
    const itemId = `dish-${Date.now()}`;
    const newItem = { ...item, id: itemId };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'menuItems', itemId), newItem);
      } catch (err) {
        console.error('Failed to sync menu item to Firestore:', err);
      }
    }

    const newItems = [...menuItems, newItem];
    localStorage.setItem('tbk_menu', JSON.stringify(newItems));
    setMenuItems(newItems);
  };

  const updateMenuItem = async (id, updatedItem) => {
    const newItems = menuItems.map(item => item.id === id ? { ...item, ...updatedItem } : item);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'menuItems', id), { ...menuItems.find(m => m.id === id), ...updatedItem });
      } catch (err) {
        console.error('Failed to sync menu item update to Firestore:', err);
      }
    }

    localStorage.setItem('tbk_menu', JSON.stringify(newItems));
    setMenuItems(newItems);
  };

  const deleteMenuItem = async (id) => {
    const newItems = menuItems.filter(item => item.id !== id);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'menuItems', id));
      } catch (err) {
        console.error('Failed to delete menu item from Firestore:', err);
      }
    }

    localStorage.setItem('tbk_menu', JSON.stringify(newItems));
    setMenuItems(newItems);
  };

  const updateRestaurantMenuImage = (url) => {
    localStorage.setItem('tbk_res_menu_img', url);
    setRestaurantMenuImage(url);
    syncSettingsFieldToFirestore('restaurantMenuImage', url);
  };

  const updateBanquetMenuImage = (url) => {
    localStorage.setItem('tbk_ban_menu_img', url);
    setBanquetMenuImage(url);
    syncSettingsFieldToFirestore('banquetMenuImage', url);
  };

  const updateBanquetVegMenuImage = (url) => {
    localStorage.setItem('tbk_ban_veg_menu_img', url);
    setBanquetVegMenuImage(url);
    syncSettingsFieldToFirestore('banquetVegMenuImage', url);
  };

  const updateBanquetNonVegMenuImage = (url) => {
    localStorage.setItem('tbk_ban_non_veg_menu_img', url);
    setBanquetNonVegMenuImage(url);
    syncSettingsFieldToFirestore('banquetNonVegMenuImage', url);
  };

  const updateContactInfo = (info) => {
    const newContact = { ...contactInfo, ...info };
    localStorage.setItem('tbk_contact', JSON.stringify(newContact));
    setContactInfo(newContact);
    syncSettingsFieldToFirestore('contactInfo', newContact);
  };

  // Booking operations
  const addBooking = async (booking) => {
    const bookingId = `b-${Date.now()}`;
    const newBooking = { 
      ...booking, 
      id: bookingId, 
      status: booking.status || 'Pending', 
      timestamp: new Date().toISOString() 
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'bookings', bookingId), newBooking);
      } catch (err) {
        console.error('Failed to sync booking to Firestore:', err);
      }
    }

    const newBookings = [newBooking, ...bookings];
    localStorage.setItem('tbk_bookings', JSON.stringify(newBookings));
    setBookings(newBookings);
  };

  const updateBookingStatus = async (id, status) => {
    // If approving, prevent double-bookings on the same date for the same session!
    const targetBooking = bookings.find(b => b.id === id);
    if (status === 'Approved' && targetBooking) {
      const targetSessionPrefix = (targetBooking.session || 'Lunch: 10:30 AM - 03:30 PM').substring(0, 5);
      const hasConflict = bookings.some(
        (b) => b.id !== id && 
               b.date === targetBooking.date && 
               b.status === 'Approved' && 
               (b.session || 'Lunch: 10:30 AM - 03:30 PM').substring(0, 5) === targetSessionPrefix
      );
      if (hasConflict) {
        alert(`Conflict Error: Date ${targetBooking.date} already has an approved reservation for the ${targetSessionPrefix} session. You must cancel or reschedule the existing approved booking first.`);
        return false;
      }
    }

    const newBookings = bookings.map(b => b.id === id ? { ...b, status } : b);

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'bookings', id), { status });
      } catch (err) {
        console.error('Failed to sync booking status to Firestore:', err);
      }
    }

    localStorage.setItem('tbk_bookings', JSON.stringify(newBookings));
    setBookings(newBookings);

    // Send Status Update Email via secure server-side SMTP
    if (targetBooking && (status === 'Approved' || status === 'Rejected') && targetBooking.email && targetBooking.email !== 'offline@bagarakitchen.com') {
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'booking_status',
          status,
          booking: { ...targetBooking, status }
        })
      }).catch(err => console.error('Failed to dispatch status email:', err));
    }

    return true;
  };

  const updateBooking = async (id, updatedFields) => {
    const newBookings = bookings.map(b => b.id === id ? { ...b, ...updatedFields } : b);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'bookings', id), { ...bookings.find(b => b.id === id), ...updatedFields });
      } catch (err) {
        console.error('Failed to sync booking update to Firestore:', err);
      }
    }

    localStorage.setItem('tbk_bookings', JSON.stringify(newBookings));
    setBookings(newBookings);
  };

  const deleteBooking = async (id) => {
    const newBookings = bookings.filter(b => b.id !== id);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'bookings', id));
      } catch (err) {
        console.error('Failed to sync booking deletion to Firestore:', err);
      }
    }

    localStorage.setItem('tbk_bookings', JSON.stringify(newBookings));
    setBookings(newBookings);
  };

  // PDR Booking operations
  const addPdrBooking = async (booking) => {
    const bookingId = `pdr-b-${Date.now()}`;
    const newBooking = { 
      ...booking, 
      id: bookingId, 
      status: booking.status || 'Pending', 
      timestamp: new Date().toISOString() 
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'pdrBookings', bookingId), newBooking);
      } catch (err) {
        console.error('Failed to sync PDR booking to Firestore:', err);
      }
    }

    const newBookings = [newBooking, ...pdrBookings];
    localStorage.setItem('tbk_pdr_bookings', JSON.stringify(newBookings));
    setPdrBookings(newBookings);
  };

  const updatePdrBookingStatus = async (id, status) => {
    const targetBooking = pdrBookings.find(b => b.id === id);
    if (status === 'Approved' && targetBooking) {
      const targetSessionPrefix = (targetBooking.session || 'Lunch: 10:30 AM - 03:30 PM').substring(0, 5);
      const targetRoom = targetBooking.room || 'Room 1';
      
      const hasConflict = pdrBookings.some(
        (b) => b.id !== id && 
               b.date === targetBooking.date && 
               b.status === 'Approved' && 
               (b.room || 'Room 1') === targetRoom &&
               (b.session || 'Lunch: 10:30 AM - 03:30 PM').substring(0, 5) === targetSessionPrefix
      );
      if (hasConflict) {
        alert(`Conflict Error: Date ${targetBooking.date} already has an approved reservation for ${targetRoom} during the ${targetSessionPrefix} session. You must cancel or reschedule the existing approved booking first.`);
        return false;
      }
    }

    const newBookings = pdrBookings.map(b => b.id === id ? { ...b, status } : b);

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'pdrBookings', id), { status });
      } catch (err) {
        console.error('Failed to sync PDR booking status to Firestore:', err);
      }
    }

    localStorage.setItem('tbk_pdr_bookings', JSON.stringify(newBookings));
    setPdrBookings(newBookings);

    // Send Status Update Email via secure server-side SMTP
    if (targetBooking && (status === 'Approved' || status === 'Rejected') && targetBooking.email && targetBooking.email !== 'offline@bagarakitchen.com') {
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'booking_status',
          status,
          booking: { ...targetBooking, status, type: 'PDR' }
        })
      }).catch(err => console.error('Failed to dispatch status email:', err));
    }

    return true;
  };

  const deletePdrBooking = async (id) => {
    const newBookings = pdrBookings.filter(b => b.id !== id);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'pdrBookings', id));
      } catch (err) {
        console.error('Failed to sync PDR booking deletion to Firestore:', err);
      }
    }

    localStorage.setItem('tbk_pdr_bookings', JSON.stringify(newBookings));
    setPdrBookings(newBookings);
  };

  const addMessage = (msg) => {
    const newMessages = [
      { ...msg, id: `m-${Date.now()}`, status: 'Pending', timestamp: new Date().toISOString() },
      ...messages
    ];
    localStorage.setItem('tbk_messages', JSON.stringify(newMessages));
    setMessages(newMessages);
    syncSettingsFieldToFirestore('messages', newMessages);
  };

  const deleteMessage = async (id) => {
    const newMessages = messages.filter(msg => msg.id !== id);
    localStorage.setItem('tbk_messages', JSON.stringify(newMessages));
    setMessages(newMessages);
    syncSettingsFieldToFirestore('messages', newMessages);
  };

  const updateMessageStatus = async (id, status) => {
    const newMessages = messages.map(msg => msg.id === id ? { ...msg, status } : msg);
    localStorage.setItem('tbk_messages', JSON.stringify(newMessages));
    setMessages(newMessages);
    syncSettingsFieldToFirestore('messages', newMessages);
  };

  const updateCloudinarySettings = (settings) => {
    const newCloudinary = { ...cloudinarySettings, ...settings };
    localStorage.setItem('tbk_cloudinary', JSON.stringify(newCloudinary));
    setCloudinarySettings(newCloudinary);
    syncSettingsFieldToFirestore('cloudinarySettings', newCloudinary);
  };

  // Gallery operations
  const addGalleryImage = async (img) => {
    const imgId = `gal-${Date.now()}`;
    const newImg = { ...img, id: imgId, timestamp: new Date().toISOString() };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'galleryImages', imgId), newImg);
      } catch (err) {
        console.error('Failed to sync gallery image to Firestore:', err);
      }
    }

    const newImages = [newImg, ...galleryImages];
    localStorage.setItem('tbk_gallery', JSON.stringify(newImages));
    setGalleryImages(newImages);
  };

  const deleteGalleryImage = async (id) => {
    const newImages = galleryImages.filter(img => img.id !== id);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'galleryImages', id));
      } catch (err) {
        console.error('Failed to delete gallery image from Firestore:', err);
      }
    }

    localStorage.setItem('tbk_gallery', JSON.stringify(newImages));
    setGalleryImages(newImages);
  };

  const updateManagerMenuEditingEnabled = (enabled) => {
    localStorage.setItem('tbk_manager_menu_edit', JSON.stringify(enabled));
    setManagerMenuEditingEnabled(enabled);
    syncSettingsFieldToFirestore('managerMenuEditingEnabled', enabled);
  };

  const updateManagerGalleryEditingEnabled = (enabled) => {
    localStorage.setItem('tbk_manager_gallery_edit', JSON.stringify(enabled));
    setManagerGalleryEditingEnabled(enabled);
    syncSettingsFieldToFirestore('managerGalleryEditingEnabled', enabled);
  };

  const updateManagerSettingsEditingEnabled = (enabled) => {
    localStorage.setItem('tbk_manager_settings_edit', JSON.stringify(enabled));
    setManagerSettingsEditingEnabled(enabled);
    syncSettingsFieldToFirestore('managerSettingsEditingEnabled', enabled);
  };

  const updateManagerBookingsEditingEnabled = (enabled) => {
    localStorage.setItem('tbk_manager_bookings_edit', JSON.stringify(enabled));
    setManagerBookingsEditingEnabled(enabled);
    syncSettingsFieldToFirestore('managerBookingsEditingEnabled', enabled);
  };

  const updateAdvanceAmount = (amount) => {
    localStorage.setItem('tbk_advance_amount', amount);
    setAdvanceAmount(amount);
    syncSettingsFieldToFirestore('advanceAmount', amount);
  };
  const updatePdrSettings = (settings) => {
    const newPdrSettings = { ...pdrSettings, ...settings };
    localStorage.setItem('tbk_pdr_settings', JSON.stringify(newPdrSettings));
    setPdrSettings(newPdrSettings);
    syncSettingsFieldToFirestore('pdrSettings', newPdrSettings);
  };

  const updatePdrPaymentEnabled = (enabled) => {
    localStorage.setItem('tbk_pdr_payment_enabled', JSON.stringify(enabled));
    setPdrPaymentEnabled(enabled);
    syncSettingsFieldToFirestore('pdrPaymentEnabled', enabled);
  };

  return (
    <DataContext.Provider value={{
      menuItems,
      contactInfo,
      cloudinarySettings,
      bookings,
      pdrBookings,
      messages,
      galleryImages,
      restaurantMenuImage,
      banquetMenuImage,
      banquetVegMenuImage,
      banquetNonVegMenuImage,
      managerMenuEditingEnabled,
      managerGalleryEditingEnabled,
      managerSettingsEditingEnabled,
      managerBookingsEditingEnabled,
      pdrPaymentEnabled,
      advanceAmount,
      pdrSettings,
      isLoaded,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      updateRestaurantMenuImage,
      updateBanquetMenuImage,
      updateBanquetVegMenuImage,
      updateBanquetNonVegMenuImage,
      updateContactInfo,
      addBooking,
      updateBookingStatus,
      updateBooking,
      deleteBooking,
      addPdrBooking,
      updatePdrBookingStatus,
      deletePdrBooking,
      addMessage,
      deleteMessage,
      updateMessageStatus,
      updateCloudinarySettings,
      addGalleryImage,
      deleteGalleryImage,
      updateManagerMenuEditingEnabled,
      updateManagerGalleryEditingEnabled,
      updateManagerSettingsEditingEnabled,
      updateManagerBookingsEditingEnabled,
      updatePdrPaymentEnabled,
      updateAdvanceAmount,
      updatePdrSettings
    }}>
      {children}
    </DataContext.Provider>
  );
};
