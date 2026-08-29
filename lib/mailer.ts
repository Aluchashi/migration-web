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

export async function sendContactEmail(data: {
  name: string;
  email: string;
  phone: string;
  enquiry: string;
  message: string;
}) {
  const to = process.env.CONTACT_TO_EMAIL ?? "imranzbrbd@gmail.com";

  const enquiryLabel =
    {
      general: "General Inquiry",
      support: "Technical Support",
      sales: "Sales & Pricing",
      partnership: "Partnership Opportunities",
    }[data.enquiry] ?? data.enquiry;

  await transporter.sendMail({
    from: `"Porizayi Contact" <${process.env.GMAIL_USER}>`,
    to,
    replyTo: data.email,
    subject: `New contact enquiry from ${data.name}`,
    html: `
      <div style="font-family: sans-serif; color: #18181b;">
        <h2 style="margin: 0 0 12px;">New contact enquiry</h2>
        <table style="border-collapse: collapse; font-size: 14px;">
          <tbody>
            <tr><td style="padding: 4px 12px 4px 0; font-weight: 600;">Name</td><td style="padding: 4px 0;">${data.name}</td></tr>
            <tr><td style="padding: 4px 12px 4px 0; font-weight: 600;">Email</td><td style="padding: 4px 0;">${data.email}</td></tr>
            <tr><td style="padding: 4px 12px 4px 0; font-weight: 600;">Phone</td><td style="padding: 4px 0;">${data.phone}</td></tr>
            <tr><td style="padding: 4px 12px 4px 0; font-weight: 600;">Enquiry</td><td style="padding: 4px 0;">${enquiryLabel}</td></tr>
          </tbody>
        </table>
        <p style="margin: 12px 0 4px; font-weight: 600;">Message</p>
        <p style="margin: 0; white-space: pre-wrap;">${data.message.replace(/</g, "&lt;")}</p>
      </div>
    `,
  });
}