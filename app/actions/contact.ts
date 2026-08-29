"use server";

import { sendContactEmail } from "@/lib/mailer";

type ContactActionState = {
  error?: string;
  success?: string;
};

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function submitContact(
  _previousState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const name = clean(formData.get("name"));
  const email = clean(formData.get("email"));
  const phone = clean(formData.get("phone"));
  const enquiry = clean(formData.get("enquiry"));
  const message = clean(formData.get("message"));
  const agreement = formData.get("agreement");

  if (!name || !email || !phone || !enquiry || !message) {
    return { error: "All fields are required." };
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  if (!agreement) {
    return { error: "Please accept the privacy policy and terms to continue." };
  }

  try {
    await sendContactEmail({ name, email, phone, enquiry, message });
  } catch {
    return { error: "Could not send your message. Please try again later." };
  }

  return { success: "Thanks for reaching out — we'll get back to you soon." };
}
