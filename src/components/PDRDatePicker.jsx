import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';

const PDRDatePicker = ({ selectedDate, onChange, pdrBookings = [], excludeBookingId = null, selectedSession = null, selectedRoom = 'Room 1' }) => {
  const [currentDate, setCurrentDate] = useState(selectedDate ? new Date(selectedDate) : new Date());

  // Dynamic timezone-safe local date YYYY-MM-DD for today comparison
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayString = `${yyyy}-${mm}-${dd}`;

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    // Prevent going to past months than today's month
    const targetDate = new Date(currentYear, currentMonth - 1, 1);
    const todayFirstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (targetDate >= todayFirstOfMonth) {
      setCurrentDate(targetDate);
    }
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Days in month calculation
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Day of week offset for the 1st of the month
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  const daysGrid = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysGrid.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysGrid.push(i);
  }

  const handleDayClick = (day) => {
    if (!day) return;
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Check conflicts specifically for the selected room
    const isPast = dateString < todayString;
    const isLunchBooked = pdrBookings.some(
      (b) => b.id !== excludeBookingId && 
             b.date === dateString && 
             b.status === 'Approved' && 
             (b.room || 'Room 1') === selectedRoom &&
             (b.session || 'Lunch: 10:30 AM - 03:30 PM').substring(0, 5) === 'Lunch'
    );
    const isDinnerBooked = pdrBookings.some(
      (b) => b.id !== excludeBookingId && 
             b.date === dateString && 
             b.status === 'Approved' && 
             (b.room || 'Room 1') === selectedRoom &&
             (b.session || 'Lunch: 10:30 AM - 03:30 PM').substring(0, 5) === 'Dinne'
    );
    const isFullyBooked = isLunchBooked && isDinnerBooked;

    const isSessionConflict = selectedSession 
      ? pdrBookings.some(
          (b) => b.id !== excludeBookingId && 
                 b.date === dateString && 
                 b.status === 'Approved' && 
                 (b.room || 'Room 1') === selectedRoom &&
                 (b.session || 'Lunch: 10:30 AM - 03:30 PM').substring(0, 5) === selectedSession.substring(0, 5)
        )
      : isFullyBooked;

    if (isPast || isSessionConflict) return; // Do nothing if past or locked

    onChange(dateString);
  };

  return (
    <div className="bg-background-variant/40 border border-outline-variant/30 rounded-2xl p-4 space-y-4 max-w-sm mx-auto shadow-md">
      {/* Calendar Header with Month/Year Navigation */}
      <div className="flex justify-between items-center px-1">
        <h4 className="font-headline text-sm font-bold text-white uppercase tracking-wider">
          {months[currentMonth]} {currentYear}
        </h4>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:text-white hover:bg-surface-low transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
            disabled={new Date(currentYear, currentMonth - 1, 1) < new Date(today.getFullYear(), today.getMonth(), 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:text-white hover:bg-surface-low transition-colors duration-300 cursor-pointer flex items-center justify-center"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday Row Headers */}
      <div className="grid grid-cols-7 text-center text-[10px] font-bold text-secondary uppercase tracking-widest pb-1 border-b border-outline-variant/10">
        <span>Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysGrid.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="py-2" />;
          }

          const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isPast = dateString < todayString;
          const isSelected = selectedDate === dateString;

          const isLunchBooked = pdrBookings.some(
            (b) => b.id !== excludeBookingId && 
                   b.date === dateString && 
                   b.status === 'Approved' && 
                   (b.room || 'Room 1') === selectedRoom &&
                   (b.session || 'Lunch: 10:30 AM - 03:30 PM').substring(0, 5) === 'Lunch'
          );
          const isDinnerBooked = pdrBookings.some(
            (b) => b.id !== excludeBookingId && 
                   b.date === dateString && 
                   b.status === 'Approved' && 
                   (b.room || 'Room 1') === selectedRoom &&
                   (b.session || 'Lunch: 10:30 AM - 03:30 PM').substring(0, 5) === 'Dinne'
          );
          const isFullyBooked = isLunchBooked && isDinnerBooked;

          // Check if this cell is locked for the user's specific selected session
          const isSessionConflict = selectedSession 
            ? pdrBookings.some(
                (b) => b.id !== excludeBookingId && 
                       b.date === dateString && 
                       b.status === 'Approved' && 
                       (b.room || 'Room 1') === selectedRoom &&
                       (b.session || 'Lunch: 10:30 AM - 03:30 PM').substring(0, 5) === selectedSession.substring(0, 5)
              )
            : isFullyBooked;

          // Render Classes and Interactive properties
          let cellClass = "py-2 px-1 text-xs rounded-lg text-center flex flex-col items-center justify-center transition-all duration-300 font-sans border ";
          let dayDisplay = day;
          let tooltip = "";
          let onClickHandler = () => handleDayClick(day);
          let cellStyle = {};

          if (isPast) {
            cellClass += "text-on-surface-variant/20 cursor-not-allowed line-through border-transparent";
            onClickHandler = null;
          } else if (isSessionConflict) {
            if (isFullyBooked) {
              cellClass += "bg-red-950/40 border-red-500/50 text-red-400 line-through cursor-not-allowed hover:bg-red-900/10 hover:border-red-500/60";
              tooltip = "Fully Booked";
            } else if (isLunchBooked) {
              cellClass += "border-yellow-500/50 text-yellow-400 line-through cursor-not-allowed hover:bg-yellow-900/10 hover:border-yellow-500/60";
              cellStyle = { background: 'linear-gradient(to right, rgba(234, 179, 8, 0.45) 50%, #00261f 50%)' };
              tooltip = "Lunch Session Booked";
            } else {
              cellClass += "border-orange-500/50 text-orange-400 line-through cursor-not-allowed hover:bg-orange-900/10 hover:border-orange-500/60";
              cellStyle = { background: 'linear-gradient(to right, #00261f 50%, rgba(249, 115, 22, 0.45) 50%)' };
              tooltip = "Dinner Session Booked";
            }
            onClickHandler = null;
          } else if (isSelected) {
            cellClass += "bg-primary border-primary text-white font-bold shadow-lg shadow-primary/20 scale-105 cursor-pointer";
          } else {
            if (isLunchBooked) {
              cellClass += "border-yellow-500/35 text-white hover:border-primary hover:scale-105 cursor-pointer";
              cellStyle = { background: 'linear-gradient(to right, rgba(234, 179, 8, 0.35) 50%, #00261f 50%)' };
              tooltip = "Lunch Session Booked (Dinner Available)";
            } else if (isDinnerBooked) {
              cellClass += "border-orange-500/35 text-white hover:border-primary hover:scale-105 cursor-pointer";
              cellStyle = { background: 'linear-gradient(to right, #00261f 50%, rgba(249, 115, 22, 0.35) 50%)' };
              tooltip = "Dinner Session Booked (Lunch Available)";
            } else {
              cellClass += "bg-[#00261f] border-outline-variant/35 text-white hover:border-primary hover:scale-105 hover:bg-surface-low cursor-pointer";
            }
          }

          return (
            <div
              key={`day-${day}`}
              onClick={onClickHandler}
              className={cellClass}
              style={cellStyle}
              title={tooltip}
            >
              <span className="font-semibold">{dayDisplay}</span>
              {isSessionConflict && (
                <Lock size={7} className={isFullyBooked ? "text-red-400 mt-0.5" : isLunchBooked ? "text-yellow-400 mt-0.5" : "text-orange-400 mt-0.5"} />
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t border-outline-variant/10 mt-2 space-y-2">
        <p className="text-[9px] font-bold text-secondary uppercase tracking-widest text-center">Session Availability Legend</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[9px] font-medium text-on-surface-variant/90 pl-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded border border-outline-variant/35 bg-[#00261f]" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded border border-red-500/50 bg-red-950/40" />
            <span>Fully Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded border border-yellow-500/40" style={{ background: 'linear-gradient(to right, #eab308 50%, #00261f 50%)' }} />
            <span>Lunch Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded border border-orange-500/40" style={{ background: 'linear-gradient(to right, #00261f 50%, #f97316 50%)' }} />
            <span>Dinner Reserved</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDRDatePicker;
