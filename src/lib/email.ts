// src/lib/email.ts

import nodemailer from 'nodemailer';

export async function sendVerificationEmail(email: string, token: string) {
  // Create a transporter using your email service credentials
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // e.g., smtp.gmail.com
    port: Number(process.env.EMAIL_PORT), // e.g., 587
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
  });

  // Define the verification URL
  const verificationUrl = `https://localhost:3000/auth/verify?token=${token}`;

  // Define the email options
  const mailOptions = {
    from: '"Your App Name" <no-reply@yourapp.com>', // Sender address
    to: email, // Recipient address
    subject: 'Verify Your Email',
    text: `Please verify your email by clicking the link: ${verificationUrl}`,
    html: `
      <p>Hi,</p>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  // Send the email
  const info = await transporter.sendMail(mailOptions);
  console.log('Verification email sent: %s', info.messageId);
}
