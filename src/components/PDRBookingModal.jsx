import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, Star, CheckCircle, ArrowRight, ArrowLeft, Loader2, DoorOpen } from 'lucide-react';
import { useData } from '../context/DataContext';
import PDRDatePicker from './PDRDatePicker';

const motionFramer = motion;

const PDRBookingModal = ({ isOpen, onClose }) => {
  const { addPdrBooking, pdrBookings, pdrSettings, pdrPaymentEnabled } = useData();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);

  // Dynamic timezone-safe local date YYYY-MM-DD
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayString = `${yyyy}-${mm}-${dd}`;

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    guests: '15',
    room: 'Room 1',
    eventType: 'Private Gathering',
    catering: 'Veg Silver',
    notes: '',
    session: 'Lunch: 10:30 AM - 03:30 PM'
  });

  const getAdvanceAmount = () => {
    if (formData.room === 'Room 1') return pdrSettings?.room1?.price || '5000';
    return pdrSettings?.room2?.price || '8000';
  };
  
  const advanceAmount = getAdvanceAmount();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.date) {
        alert("Please select a date for your reservation.");
        return;
      }
      if (formData.date < todayString) {
        alert("Action Blocked: You cannot book a PDR for a past date.");
        return;
      }
      const hasConflict = pdrBookings.some(
        (b) => b.date === formData.date &&
          b.status === 'Approved' &&
          (b.room || 'Room 1') === formData.room &&
          (b.session || 'Lunch: 10:30 AM - 03:30 PM').substring(0, 5) === formData.session.substring(0, 5)
      );
      if (hasConflict) {
        alert(`We apologize, but ${formData.room} is already reserved during the ${formData.session.substring(0, 5)} session. Please choose another date, session, or room.`);
        return;
      }
      
      // Guest validation against room capacity
      const maxGuests = parseInt(formData.room === 'Room 1' ? pdrSettings?.room1?.capacity : pdrSettings?.room2?.capacity) || 20;
      if (parseInt(formData.guests) > maxGuests) {
        alert(`Action Blocked: ${formData.room} has a maximum capacity of ${maxGuests} guests. Please reduce the guest count or choose the other room if available.`);
        return;
      }
    }

    if (step === 2) {
      const allowedCharsRegex = /^[+\s\-\(\)\d]+$/;
      if (!formData.phone || !allowedCharsRegex.test(formData.phone)) {
        alert("Action Blocked: Please enter a valid phone number containing only numbers, spaces, dashes, or international prefix (+).");
        return;
      }
      const digitCount = formData.phone.replace(/\D/g, '').length;
      if (digitCount < 10 || digitCount > 13) {
        alert("Action Blocked: Phone number must contain between 10 and 13 digits (e.g. 9876543210 or +91 98765 43210).");
        return;
      }
    }

    if (step < 3) setStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const processSubmission = (paymentData = { paidAdvance: false }) => {
    setIsSubmitting(true);
    setPaymentInfo(paymentData);
    const finalData = { ...formData, ...paymentData };

    setTimeout(async () => {
      try {
        await addPdrBooking(finalData);

        // Send booking alerts
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'new_booking', data: { ...finalData, bookingType: 'PDR' } })
        });
      } catch (err) {
        console.error('Failed to dispatch booking emails:', err);
      } finally {
        setIsSubmitting(false);
        setIsSubmitted(true);
      }
    }, 2000);
  };

  const handleRazorpayPayment = async () => {
    if (!window.Razorpay) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: advanceAmount })
      });
      const data = await res.json();
      
      if (!data.success) {
        setIsSubmitting(false);
        alert("Failed to initialize payment gateway. Please try again.");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_Sw2XA2RVzxAmX0',
        amount: Number(advanceAmount) * 100, 
        currency: "INR",
        name: "The Bagara Kitchen",
        description: `PDR Advance Payment - ${formData.room}`,
        image: "https://the-bagara-kitchen.vercel.app/logo.jpg",
        order_id: data.order.id,
        handler: function (response) {
          const paymentData = {
            paidAdvance: true,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature
          };
          processSubmission(paymentData);
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#c5a059",
        },
        modal: {
          ondismiss: function() {
            setIsSubmitting(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setIsSubmitting(false);
        alert("Payment failed: " + response.error.description);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert("Error processing payment.");
    }
  };

  const handleSubmit = (e, bypassPayment = false) => {
    if (e) e.preventDefault();

    if (formData.date < todayString) {
      alert("Action Blocked: You cannot book a PDR for a past date.");
      return;
    }
    const hasConflict = pdrBookings.some(
      (b) => b.date === formData.date &&
        b.status === 'Approved' &&
        (b.room || 'Room 1') === formData.room &&
        (b.session || 'Lunch: 10:30 AM - 03:30 PM').substring(0, 5) === formData.session.substring(0, 5)
    );
    if (hasConflict) {
      alert(`We apologize, but ${formData.room} is already reserved during the ${formData.session.substring(0, 5)} session. Please choose another date, session, or room.`);
      return;
    }

    const allowedCharsRegex = /^[+\s\-\(\)\d]+$/;
    if (!formData.phone || !allowedCharsRegex.test(formData.phone)) {
      alert("Action Blocked: Please enter a valid phone number containing only numbers, spaces, dashes, or international prefix (+).");
      return;
    }

    if (!bypassPayment && pdrPaymentEnabled && advanceAmount && Number(advanceAmount) > 0) {
      handleRazorpayPayment();
    } else {
      processSubmission({ paidAdvance: false });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motionFramer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/90 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motionFramer
          initial={{ opacity: 0, scale: 0.95, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 25 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-lg bg-surface border border-outline-variant/40 rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[95vh] sm:max-h-[90vh] flex flex-col"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-on-surface-variant hover:text-white p-1 rounded-full hover:bg-surface-high transition-colors"
          >
            <X size={20} />
          </button>

          {/* Heading */}
          <div className="p-6 bg-surface-low border-b border-outline-variant/20">
            <h3 className="font-headline text-2xl text-primary font-bold">
              Reserve Private Dining
            </h3>
            <p className="text-xs text-on-surface-variant/80 font-light mt-1">
              Intimate spaces for your exclusive celebrations.
            </p>
          </div>

          {/* Progress Indicator */}
          {!isSubmitted && (
            <div className="px-6 pt-4 flex items-center gap-2">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex-grow flex items-center gap-1">
                  <div
                    className={`h-1.5 rounded-full flex-grow transition-all duration-300 ${step >= num ? 'bg-primary' : 'bg-outline-variant/20'}`}
                  />
                  <span className={`text-[10px] font-bold ${step >= num ? 'text-primary' : 'text-on-surface-variant/40'}`}>
                    {num}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Form Content */}
          <div className="p-6 flex-grow overflow-hidden flex flex-col">
            {isSubmitted ? (
              // STEP 4: Success confirmation screen
              <motionFramer
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-6"
              >
                <div className="w-16 h-16 bg-amber-950/40 border border-secondary rounded-full flex items-center justify-center mx-auto text-secondary shadow-lg shadow-secondary/10 animate-bounce">
                  <CheckCircle size={32} />
                </div>

                <div className="space-y-2">
                  <h4 className="font-headline text-2xl text-white font-semibold">
                    Reservation Request Sent!
                  </h4>
                  <p className="text-sm text-on-surface-variant font-light leading-relaxed max-w-sm mx-auto">
                    Thank you for choosing The Bagara Kitchen. Our premium coordinator will reach out to you shortly to finalize the details for your Private Dining experience.
                  </p>
                  {paymentInfo?.paidAdvance ? (
                    <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-medium">
                      Advance payment of <strong className="font-bold text-emerald-300">₹{advanceAmount}</strong> received successfully! <br/>
                      <span className="opacity-80 block mt-1">Payment ID: {paymentInfo.paymentId}</span>
                    </div>
                  ) : advanceAmount && Number(advanceAmount) > 0 ? (
                    <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-xl text-primary text-xs font-medium">
                      To confirm your reservation, an advance payment of <strong className="font-bold">₹{advanceAmount}</strong> is required. Our executive will share the payment link shortly.
                    </div>
                  ) : null}
                </div>

                <div className="bg-surface-low border border-outline-variant/30 rounded-xl p-4 text-left max-w-xs mx-auto text-xs space-y-2">
                  <p className="text-on-surface-variant"><strong className="text-white">Host Name:</strong> {formData.name}</p>
                  <p className="text-on-surface-variant"><strong className="text-white">Room:</strong> {formData.room}</p>
                  <p className="text-on-surface-variant"><strong className="text-white">Date of Event:</strong> {formData.date}</p>
                  <p className="text-on-surface-variant"><strong className="text-white">Session Time:</strong> {formData.session}</p>
                  <p className="text-on-surface-variant"><strong className="text-white">Guests:</strong> {formData.guests} Guests</p>
                </div>

                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setStep(1);
                    onClose();
                  }}
                  className="bg-primary hover:bg-[#059669] text-white px-8 py-3 rounded-lg font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-md shadow-primary/20"
                >
                  Return to Website
                </button>
              </motionFramer>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); if (step < 3) handleNext(e); }} className="space-y-4 flex-grow flex flex-col justify-between overflow-hidden">
                <div className="flex-grow overflow-y-auto pr-1 max-h-[50vh] sm:max-h-[55vh]">
                  <AnimatePresence mode="wait">
                  {step === 1 && (
                    // STEP 1: Basic details
                    <motionFramer
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary flex items-center gap-2 mb-2">
                        <DoorOpen size={16} /> Room & Event details
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Select Room</label>
                          <div className="grid grid-cols-2 gap-3">
                            <div 
                              onClick={() => setFormData(prev => ({ ...prev, room: 'Room 1' }))}
                              className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${formData.room === 'Room 1' ? 'border-primary bg-primary/10' : 'border-outline-variant/40 bg-surface hover:border-primary/50'}`}
                            >
                              <p className="text-white font-bold text-sm">Room 1</p>
                              <p className="text-xs text-on-surface-variant">Up to {pdrSettings?.room1?.capacity || 20} Guests</p>
                            </div>
                            <div 
                              onClick={() => setFormData(prev => ({ ...prev, room: 'Room 2' }))}
                              className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${formData.room === 'Room 2' ? 'border-primary bg-primary/10' : 'border-outline-variant/40 bg-surface hover:border-primary/50'}`}
                            >
                              <p className="text-white font-bold text-sm">Room 2</p>
                              <p className="text-xs text-on-surface-variant">Up to {pdrSettings?.room2?.capacity || 40} Guests</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Guest Count</label>
                          <input
                            type="number"
                            name="guests"
                            required
                            min="1"
                            max={formData.room === 'Room 1' ? (pdrSettings?.room1?.capacity || 20) : (pdrSettings?.room2?.capacity || 40)}
                            value={formData.guests}
                            onChange={handleChange}
                            className="w-full bg-background border border-outline-variant/60 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Event Type</label>
                          <select
                            name="eventType"
                            value={formData.eventType}
                            onChange={handleChange}
                            className="w-full bg-background border border-outline-variant/60 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary"
                          >
                            <option>Private Gathering</option>
                            <option>Business Meeting</option>
                            <option>Birthday</option>
                            <option>Anniversary</option>
                            <option>Others</option>
                          </select>
                        </div>

                        <div className="space-y-1.5 col-span-2">
                          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Session / Time Selection</label>
                          <select
                            name="session"
                            value={formData.session}
                            onChange={handleChange}
                            className="w-full bg-background border border-outline-variant/60 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary"
                          >
                            <option value="Lunch: 10:30 AM - 03:30 PM">Lunch: 10:30 AM - 03:30 PM</option>
                            <option value="Dinner: 06:30 PM - 10:30 PM">Dinner: 06:30 PM - 10:30 PM</option>
                          </select>
                        </div>

                        <div className="space-y-1.5 col-span-2 border-t border-outline-variant/10 pt-4 mt-2">
                          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2 text-center">Select Event Date</label>
                          <PDRDatePicker
                            selectedDate={formData.date}
                            onChange={(date) => setFormData(prev => ({ ...prev, date }))}
                            pdrBookings={pdrBookings}
                            selectedSession={formData.session}
                            selectedRoom={formData.room}
                          />
                          {formData.date && (
                            <p className="text-xs text-primary font-bold mt-2 text-center">
                              Selected: {new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          )}
                        </div>
                      </div>
                    </motionFramer>
                  )}

                  {step === 2 && (
                    // STEP 2: Contact info
                    <motionFramer
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary flex items-center gap-2 mb-2">
                        <Star size={16} /> Contact Information
                      </h4>

                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Full Name</label>
                          <input
                            type="text"
                            name="name"
                            required
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-background border border-outline-variant/60 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Email Address</label>
                          <input
                            type="email"
                            name="email"
                            required
                            placeholder="johndoe@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-background border border-outline-variant/60 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Phone Number</label>
                          <input
                            type="tel"
                            name="phone"
                            required
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full bg-background border border-outline-variant/60 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    </motionFramer>
                  )}

                  {step === 3 && (
                    // STEP 3: Special notes
                    <motionFramer
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary flex items-center gap-2 mb-2">
                        <Calendar size={16} /> Catering & Special Notes
                      </h4>

                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Catering Options</label>
                          <select
                            name="catering"
                            value={formData.catering}
                            onChange={handleChange}
                            className="w-full bg-background border border-outline-variant/60 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary"
                          >
                            <option value="Veg Silver">Veg Silver</option>
                            <option value="Veg Gold">Veg Gold</option>
                            <option value="Non-Veg Silver">Non-Veg Silver</option>
                            <option value="Non-Veg Gold">Non-Veg Gold</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Special Requests / Notes</label>
                          <textarea
                            name="notes"
                            placeholder="Any diet restrictions, specific table arrangements..."
                            rows="3"
                            value={formData.notes}
                            onChange={handleChange}
                            className="w-full bg-background border border-outline-variant/60 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary resize-none"
                          />
                        </div>
                      </div>
                    </motionFramer>
                  )}
                </AnimatePresence>
                </div>

                {/* Form Buttons */}
                <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-center gap-4 flex-shrink-0">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-white font-semibold transition-colors py-2 px-4 rounded-lg bg-surface-high border border-outline-variant/30"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {step === 3 ? (
                    <div className="flex flex-col sm:flex-row gap-3 ml-auto">
                      <button
                        type="button"
                        onClick={(e) => handleSubmit(e, true)}
                        disabled={isSubmitting}
                        className={`flex items-center justify-center gap-2 bg-surface hover:bg-surface-high border border-outline-variant/30 text-white font-bold py-3 px-5 rounded-lg text-sm transition-all shadow-md ${!pdrPaymentEnabled ? 'hidden' : ''}`}
                      >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Only'}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleSubmit(e, !pdrPaymentEnabled)}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 bg-primary hover:bg-[#059669] disabled:bg-primary/50 text-white font-bold py-3 px-5 rounded-lg text-sm transition-all hover:scale-105 active:scale-95 shadow-md shadow-primary/20"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          pdrPaymentEnabled ? `Pay ₹${advanceAmount} & Submit` : 'Submit Booking'
                        )}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 bg-primary hover:bg-[#059669] disabled:bg-primary/50 text-white font-bold py-3 px-6 rounded-lg text-sm transition-all hover:scale-105 active:scale-95 shadow-md shadow-primary/20"
                    >
                      Continue <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </motionFramer>
      </div>
    </AnimatePresence>
  );
};

export default PDRBookingModal;
