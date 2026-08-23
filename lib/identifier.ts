const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[a-z0-9_]{3,20}$/;

export function isEmail(value: string) {
  return emailPattern.test(value);
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeUsername(value: string) {
  const username = value.trim().toLowerCase();
  if (!usernamePattern.test(username)) {
    return null;
  }
  return username;
}

export function normalizePhone(value: string) {
  let phone = value.trim().replace(/[\s()-]/g, "");
  phone = phone.replace(/^\+?880/, "0");

  if (/^01[3-9]\d{8}$/.test(phone)) {
    return phone;
  }

  return null;
}
