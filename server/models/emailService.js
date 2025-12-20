const nodemailer = require('nodemailer');
const config = require('../config');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service configuration error:', error);
  } else {
    console.log('✅ Email service is ready');
  }
});

// Send email function
const sendEmail = async (to, subject, message, senderName, senderEmail) => {
  try {
    const mailOptions = {
      from: `"${senderName} via Clubify" <${config.EMAIL_USER}>`,
      to: to,
      subject: subject,
      replyTo: senderEmail, // Allow recipient to reply directly to sender
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="background-color: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">📧 New Message from Clubify</h2>
          </div>
          
          <div style="padding: 20px; background-color: #f9fafb;">
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
              <strong>From:</strong> ${senderName} (${senderEmail})
            </p>
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">
              <strong>Subject:</strong> ${subject}
            </p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #4F46E5;">
              <p style="font-size: 16px; line-height: 1.6; color: #1f2937; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          
          <div style="padding: 20px; background-color: #f3f4f6; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              This message was sent via Clubify App<br>
              Reply directly to this email to respond to ${senderName}
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
