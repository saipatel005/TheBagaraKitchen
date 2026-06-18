import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Armchair, Wine, Calendar } from 'lucide-react';
import { useData } from '../context/DataContext';
import PDRBookingModal from './PDRBookingModal';

const PDR = () => {
  const { galleryImages, pdrSettings } = useData();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  // Find PDR specific images
  const pdrImages = galleryImages?.filter(img => img.type === 'pdr') || [];
  const displayImageSrc = pdrImages.length > 0 ? pdrImages[0].image : 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?q=80&w=600&auto=format&fit=crop';
  const displayImageTitle = pdrImages.length > 0 ? pdrImages[0].title : 'Intimate PDR Setup';

  // Read settings
  const room1 = pdrSettings?.room1 || { capacity: '20', price: '5000' };
  const room2 = pdrSettings?.room2 || { capacity: '40', price: '8000' };

  const features = [
    {
      icon: <Users className="text-secondary w-8 h-8" />,
      title: `Room 1: Up to ${room1.capacity} Guests`,
      description: `Perfect for smaller, intimate gatherings. Exclusive dining experience starting at ₹${room1.price}.`
    },
    {
      icon: <Armchair className="text-secondary w-8 h-8" />,
      title: `Room 2: Up to ${room2.capacity} Guests`,
      description: `Spacious premium room for mid-sized events. Available from ₹${room2.price}.`
    },
    {
      icon: <Wine className="text-secondary w-8 h-8" />,
      title: "VIP Services",
      description: "Dedicated waitstaff, customizable menus, and ultimate privacy for your special occasions."
    }
  ];

  return (
    <section 
      id="pdr" 
      className="py-24 px-6 md:px-8 bg-surface-low border-b border-outline-variant/20 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #d4af37 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10 flex-col-reverse lg:flex-row">
        
        {/* Left Side: Showcase PDR Photo */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-5 relative group order-2 lg:order-1"
        >
          <div className="absolute -inset-2.5 rounded-2xl border border-secondary/20 group-hover:border-secondary/40 transition-colors duration-500 pointer-events-none" />
          
          <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-2xl shadow-black/80 border border-outline-variant/30">
            <img 
              src={displayImageSrc} 
              alt="Private Dining Room" 
              className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-80 pointer-events-none" />
            
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-secondary text-[10px] font-bold uppercase tracking-[0.25em]">Premium Privacy</span>
              <h4 className="text-white font-headline text-xl font-medium mt-1">{displayImageTitle}</h4>
              <p className="text-on-surface-variant text-xs font-light mt-1">Exclusive ambiance for your private celebrations.</p>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Text and Features List */}
        <div className="lg:col-span-7 space-y-10 order-1 lg:order-2">
          <div className="space-y-4">
            <span className="inline-block px-4 py-1.5 rounded-full border border-secondary/30 bg-secondary/5 text-xs text-secondary font-bold uppercase tracking-[0.25em]">
              Exclusive Dining
            </span>
            <h2 className="font-headline text-4xl md:text-5xl text-white font-semibold leading-tight">
              Private Dining Rooms
            </h2>
            <p className="font-body text-base md:text-lg text-on-surface-variant font-light leading-relaxed max-w-2xl">
              Elevate your dining experience in our Private Dining Rooms. Designed for absolute privacy and comfort, our PDRs provide the perfect setting for corporate dinners, intimate family celebrations, or romantic evenings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feat, index) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 bg-surface border border-outline-variant/20 rounded-xl hover:border-secondary/30 transition-colors duration-300"
              >
                <div className="mb-4">{feat.icon}</div>
                <h3 className="font-headline text-lg text-white font-medium mb-2">{feat.title}</h3>
                <p className="text-on-surface-variant font-body text-xs leading-relaxed font-light">{feat.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="pt-2">
            <button 
              onClick={() => setIsBookingModalOpen(true)}
              className="bg-primary hover:bg-[#059669] text-white px-10 py-4.5 rounded-xl font-bold text-base transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/25 inline-flex items-center gap-3 duration-300"
            >
              <Calendar size={20} />
              Book Private Dining
            </button>
          </div>
        </div>

      </div>

      <PDRBookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
      />
    </section>
  );
};

export default PDR;
