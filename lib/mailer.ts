import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOtpEmail(toEmail: string, otp: string) {
  await transporter.sendMail({
    from: `"Migration Platform" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'আপনার Registration OTP কোড',
    html: `
      <div style="font-family: sans-serif;">
        <h2>আপনার OTP কোড</h2>
        <p style="font-size: 24px; font-weight: bold;">${otp}</p>
        <p>এই কোডটি ১০ মিনিটের জন্য বৈধ। কারো সাথে শেয়ার করবেন না।</p>
      </div>
    `,
  });
}

export async function sendConfirmationEmail(toEmail: string) {
  await transporter.sendMail({
    from: `"Migration Platform" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'আপনার Registration সম্পন্ন হয়েছে',
    html: `<p>আপনার একাউন্ট সফলভাবে verify হয়েছে। এখন আপনি লগইন করতে পারবেন।</p>`,
  });
}