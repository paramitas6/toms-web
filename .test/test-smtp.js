// test-smtp.js

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

async function sendTestEmail() {
  // Create a transporter using Amazon SES SMTP settings
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST, // 'email-smtp.us-east-2.amazonaws.com'
    port: Number(process.env.EMAIL_SERVER_PORT), // 587
    secure: process.env.EMAIL_SERVER_SECURE === 'true', // false for 587
    auth: {
      user: process.env.EMAIL_SERVER_USER, // Your SES SMTP username
      pass: process.env.EMAIL_SERVER_PASSWORD, // Your SES SMTP password
    },
  });

  try {
    // Send a test email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM, // Verified "From" address
      to: 'jae.park@live.ca', // Replace with your test recipient email
      subject: 'Test Email from Amazon SES',
      text: 'This is a test email sent using Amazon SES SMTP.',
      html: '<p>This is a <strong>test email</strong> sent using Amazon SES SMTP.</p>',
    });

    console.log('Test email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending test email:', error);
  }
}

sendTestEmail();
