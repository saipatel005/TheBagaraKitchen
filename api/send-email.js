import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { type, data, status, booking } = req.body;

  // Retrieve SMTP credentials from environment variables
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER || 'developer.tbk1@gmail.com';
  const smtpPass = process.env.SMTP_PASS || 'kmjtqvagitxlwgir';
  const adminEmail = process.env.SMTP_ADMIN_EMAIL || 'thebagarakitchen.bar@gmail.com';

  // Safeguard: Check config
  if (!smtpUser || !smtpPass) {
    console.error('SMTP configuration missing in server environment variables.');
    return res.status(500).json({ error: 'Mail server unconfigured.' });
  }

  // Create Node Mailer transporter
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // True for port 465 SSL, false for others (587 TLS)
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    tls: {
      rejectUnauthorized: false // Bypass self-signed cert validation issues if any
    }
  });

  try {
    if (type === 'new_booking') {
      const isPdr = data.bookingType === 'PDR';
      const systemAlertName = isPdr ? 'Private Dining System Alert' : 'Banquet System Alert';
      const subjectPrefix = isPdr ? '🍽️ New PDR Booking Request' : '👑 New Banquet Booking Request';
      const introText = isPdr 
        ? 'An online guest has submitted a private dining room reservation. Below are the requested details:' 
        : 'An online guest has submitted a banquet hall reservation. Below are the registered event details:';

      // 1. Mail to ADMIN (alerting about a new guest booking inquiry)
      const adminMailOptions = {
        from: `"TBK Control Center" <${smtpUser}>`,
        to: adminEmail,
        subject: `${subjectPrefix} - ${data.name}`,
        html: `
          <div style="background-color: #001b16; color: #e2e2e2; font-family: 'Inter', Arial, sans-serif; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #c5a059;">
            <div style="text-align: center; border-bottom: 1px solid rgba(197, 160, 89, 0.3); padding-bottom: 20px; margin-bottom: 25px;">
              <h1 style="color: #c5a059; font-family: 'Playfair Display', serif; margin: 0; font-size: 24px; letter-spacing: 1px;">The Bagara Kitchen & Bar</h1>
              <p style="color: #a8c7be; font-size: 11px; text-transform: uppercase; tracking-wider; margin: 5px 0 0 0;">${systemAlertName}</p>
            </div>
            
            <h2 style="color: #ffffff; font-size: 16px; font-weight: 600; margin-bottom: 15px;">New Booking Registered from Public Site</h2>
            <p style="font-size: 13px; line-height: 1.6; color: #a8c7be; font-weight: 300;">${introText}</p>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 20px 0; font-weight: 300;">
              <tr style="border-bottom: 1px solid rgba(197, 160, 89, 0.15);">
                <td style="padding: 10px 0; color: #c5a059; font-weight: bold; width: 140px;">Host Name:</td>
                <td style="padding: 10px 0; color: #ffffff;">${data.name}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(197, 160, 89, 0.15);">
                <td style="padding: 10px 0; color: #c5a059; font-weight: bold;">Mail Address:</td>
                <td style="padding: 10px 0; color: #ffffff;">${data.email}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(197, 160, 89, 0.15);">
                <td style="padding: 10px 0; color: #c5a059; font-weight: bold;">Phone Number:</td>
                <td style="padding: 10px 0; color: #ffffff;">${data.phone}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(197, 160, 89, 0.15);">
                <td style="padding: 10px 0; color: #c5a059; font-weight: bold;">Event Date:</td>
                <td style="padding: 10px 0; color: #ffffff; font-weight: bold;">${data.date}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(197, 160, 89, 0.15);">
                <td style="padding: 10px 0; color: #c5a059; font-weight: bold;">Session Selected:</td>
                <td style="padding: 10px 0; color: #ffffff;">${data.session}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(197, 160, 89, 0.15);">
                <td style="padding: 10px 0; color: #c5a059; font-weight: bold;">Expected Guests:</td>
                <td style="padding: 10px 0; color: #ffffff;">${data.guests} Guests</td>
              </tr>
              ${isPdr ? `
              <tr style="border-bottom: 1px solid rgba(197, 160, 89, 0.15);">
                <td style="padding: 10px 0; color: #c5a059; font-weight: bold;">Room Selected:</td>
                <td style="padding: 10px 0; color: #ffffff;">${data.room}</td>
              </tr>
              ` : ''}
              <tr style="border-bottom: 1px solid rgba(197, 160, 89, 0.15);">
                <td style="padding: 10px 0; color: #c5a059; font-weight: bold;">Event Type:</td>
                <td style="padding: 10px 0; color: #ffffff;">${data.eventType}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(197, 160, 89, 0.15);">
                <td style="padding: 10px 0; color: #c5a059; font-weight: bold;">Catering Choice:</td>
                <td style="padding: 10px 0; color: #ffffff;">${data.catering}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #c5a059; font-weight: bold; vertical-align: top;">Special Notes:</td>
                <td style="padding: 10px 0; color: #ffffff; line-height: 1.5; font-style: italic;">"${data.notes || 'None'}"</td>
              </tr>
            </table>

            <div style="border-top: 1px solid rgba(197, 160, 89, 0.3); padding-top: 20px; margin-top: 25px; text-align: center;">
              <p style="font-size: 11px; color: #a8c7be; margin: 0; font-weight: 300;">This booking is marked as <strong>Pending</strong>. You can review, approve, or cancel this booking inside the Administration Console.</p>
            </div>
          </div>
        `
      };

      // 2. Mail to GUEST (acknowledging receipt)
      const guestSystemName = isPdr ? 'Private Dining Reservations' : 'Banquet Reservations';
      const guestIntro = isPdr
        ? 'Your Response has been received! Our premium dining coordinator will approach you shortly to discuss catering and confirm your PDR booking.'
        : 'Your Response has been received! Our premium banquet coordination team will approach you shortly to discuss catering allocations, royal setup options, and confirm scheduling details.';

      const guestMailOptions = {
        from: `"The Bagara Kitchen & Bar" <${smtpUser}>`,
        to: data.email,
        subject: `✨ Booking Response Received - The Bagara Kitchen & Bar`,
        html: `
          <div style="background-color: #001b16; color: #e2e2e2; font-family: 'Inter', Arial, sans-serif; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #c5a059;">
            <div style="text-align: center; border-bottom: 1px solid rgba(197, 160, 89, 0.3); padding-bottom: 20px; margin-bottom: 25px;">
              <h1 style="color: #c5a059; font-family: 'Playfair Display', serif; margin: 0; font-size: 24px; letter-spacing: 1px;">The Bagara Kitchen & Bar</h1>
              <p style="color: #a8c7be; font-size: 11px; text-transform: uppercase; tracking-wider; margin: 5px 0 0 0;">${guestSystemName}</p>
            </div>
            
            <p style="font-size: 14px; color: #ffffff; font-weight: 500;">Greetings ${data.name},</p>
            <p style="font-size: 13px; line-height: 1.6; color: #a8c7be; font-weight: 300;">${guestIntro}</p>
            
            <div style="background-color: #002d24; border: 1px solid rgba(197, 160, 89, 0.2); padding: 15px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #c5a059; font-size: 12px; text-transform: uppercase; margin: 0 0 10px 0; tracking-wider;">Reservation Request Summary</h3>
              <p style="margin: 4px 0; font-size: 12px; color: #e2e2e2; font-weight: 300;"><strong>Event Date:</strong> ${data.date}</p>
              <p style="margin: 4px 0; font-size: 12px; color: #e2e2e2; font-weight: 300;"><strong>Session Time:</strong> ${data.session}</p>
              <p style="margin: 4px 0; font-size: 12px; color: #e2e2e2; font-weight: 300;"><strong>Guests:</strong> ${data.guests}</p>
              ${isPdr ? `<p style="margin: 4px 0; font-size: 12px; color: #e2e2e2; font-weight: 300;"><strong>Room Selected:</strong> ${data.room}</p>` : ''}
              <p style="margin: 4px 0; font-size: 12px; color: #e2e2e2; font-weight: 300;"><strong>Catering Menu:</strong> ${data.catering}</p>
            </div>

            <div style="text-align: center; margin: 25px 0;">
              <a href="tel:+917995361212" style="background-color: #c5a059; color: #001b16; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.15); transition: all 0.3s ease;">
                📞 Call Now to Align Details
              </a>
            </div>

            <p style="font-size: 12px; line-height: 1.6; color: #a8c7be; font-weight: 300;">If you have any quick questions or require custom banquet pricing adjustments, please reply directly to this mail or reach out to us at <strong>${process.env.SMTP_ADMIN_EMAIL || 'hello@bagarakitchen.com'}</strong>.</p>
            
            <div style="border-top: 1px solid rgba(197, 160, 89, 0.3); padding-top: 20px; margin-top: 25px; text-align: center;">
              <p style="font-size: 10px; color: #a8c7be; margin: 0; font-weight: 300;">Sy No 25/LU, Kompally, Hyderabad, India</p>
              <p style="font-size: 9px; color: #a8c7be; opacity: 0.7; margin: 5px 0 0 0; font-weight: 300;">© ${new Date().getFullYear()} The Bagara Kitchen and Bar. All rights reserved.</p>
            </div>
          </div>
        `
      };

      // Dispatch both emails in parallel
      await Promise.all([
        transporter.sendMail(adminMailOptions),
        transporter.sendMail(guestMailOptions)
      ]);

      return res.status(200).json({ success: true, message: 'New booking alerts successfully dispatched.' });
    }

    if (type === 'booking_status') {
      const isApproved = status === 'Approved';
      const isPdr = booking.type === 'PDR';
      const statusTitle = isApproved ? 'Approved & Confirmed' : 'Cancelled / Declined';
      const statusColor = isApproved ? '#10b981' : '#ef4444';
      const badgeBg = isApproved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
      
      const guestSystemNameStatus = isPdr ? 'Private Dining Reservations' : 'Banquet Reservations';
      const bookingTypeLabel = isPdr ? 'private dining room' : 'banquet hall';
      const subjectPrefixStatus = isPdr ? '🍽️ PDR Booking Update' : '✨ Banquet Booking Update';

      const statusMailOptions = {
        from: `"The Bagara Kitchen & Bar" <${smtpUser}>`,
        to: booking.email,
        subject: `${subjectPrefixStatus}: ${statusTitle} - The Bagara Kitchen & Bar`,
        html: `
          <div style="background-color: #001b16; color: #e2e2e2; font-family: 'Inter', Arial, sans-serif; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #c5a059;">
            <div style="text-align: center; border-bottom: 1px solid rgba(197, 160, 89, 0.3); padding-bottom: 20px; margin-bottom: 25px;">
              <h1 style="color: #c5a059; font-family: 'Playfair Display', serif; margin: 0; font-size: 24px; letter-spacing: 1px;">The Bagara Kitchen & Bar</h1>
              <p style="color: #a8c7be; font-size: 11px; text-transform: uppercase; tracking-wider; margin: 5px 0 0 0;">${guestSystemNameStatus}</p>
            </div>
            
            <p style="font-size: 14px; color: #ffffff; font-weight: 500;">Greetings ${booking.name},</p>
            
            <p style="font-size: 13px; line-height: 1.6; color: #a8c7be; font-weight: 300;">We are writing to provide you with an update regarding your recent ${bookingTypeLabel} reservation request:</p>
            
            <div style="text-align: center; background-color: ${badgeBg}; border: 1px solid ${statusColor}35; padding: 15px; border-radius: 10px; margin: 20px 0;">
              <span style="font-size: 16px; font-weight: 700; color: ${statusColor}; text-transform: uppercase; letter-spacing: 1px;">
                Status: ${statusTitle}
              </span>
            </div>

            <div style="background-color: #002d24; border: 1px solid rgba(197, 160, 89, 0.2); padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #c5a059; font-size: 12px; text-transform: uppercase; margin: 0 0 10px 0; tracking-wider;">Reservation Details</h3>
              <p style="margin: 4px 0; font-size: 12px; color: #e2e2e2; font-weight: 300;"><strong>Booking ID:</strong> ${booking.id}</p>
              <p style="margin: 4px 0; font-size: 12px; color: #e2e2e2; font-weight: 300;"><strong>Event Date:</strong> ${booking.date}</p>
              <p style="margin: 4px 0; font-size: 12px; color: #e2e2e2; font-weight: 300;"><strong>Guests:</strong> ${booking.guests}</p>
              ${isPdr ? `<p style="margin: 4px 0; font-size: 12px; color: #e2e2e2; font-weight: 300;"><strong>Room:</strong> ${booking.room}</p>` : ''}
              <p style="margin: 4px 0; font-size: 12px; color: #e2e2e2; font-weight: 300;"><strong>Catering Selection:</strong> ${booking.catering}</p>
            </div>

            <div style="text-align: center; margin: 25px 0;">
              <a href="tel:+917995361212" style="background-color: #c5a059; color: #001b16; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.15); transition: all 0.3s ease;">
                📞 Call Now to Align Details
              </a>
            </div>

            ${isApproved ? `
              <p style="font-size: 13px; line-height: 1.6; color: #a8c7be; font-weight: 300;">Congratulations! Your event date has been **fully approved and locked** in our active system scheduler. We have reserved the space and allocated premium kitchen chefs for your specific menu templates.</p>
              <p style="font-size: 13px; line-height: 1.6; color: #a8c7be; font-weight: 300;">Our coordinator will connect with you soon to discuss advance token payments and confirm setup details.</p>
            ` : `
              <p style="font-size: 13px; line-height: 1.6; color: #a8c7be; font-weight: 300;">We regret to inform you that your request has been **cancelled or declined** at this time due to high-occupancy conflicts on your selected date, or failure to align on details.</p>
              <p style="font-size: 13px; line-height: 1.6; color: #a8c7be; font-weight: 300;">If you wish to reschedule or examine open booking dates, please connect with us at <strong>${adminEmail}</strong> or call our front desk directly.</p>
            `}
            
            <div style="border-top: 1px solid rgba(197, 160, 89, 0.3); padding-top: 20px; margin-top: 25px; text-align: center;">
              <p style="font-size: 10px; color: #a8c7be; margin: 0; font-weight: 300;">The Bagara Kitchen and Bar, Kompally, Hyderabad, India</p>
              <p style="font-size: 9px; color: #a8c7be; opacity: 0.7; margin: 5px 0 0 0; font-weight: 300;">© ${new Date().getFullYear()} The Bagara Kitchen and Bar. All rights reserved.</p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(statusMailOptions);
      return res.status(200).json({ success: true, message: `Status update email successfully sent to ${booking.email}` });
    }

    return res.status(400).json({ error: 'Invalid Request Type' });
  } catch (error) {
    console.error('SMTP email dispatch error:', error);
    return res.status(500).json({ error: error.message || 'SMTP Server failed to dispatch.' });
  }
}
