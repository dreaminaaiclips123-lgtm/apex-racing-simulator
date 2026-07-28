export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^[\d+\s-]{8,20}$/.test(phone);
}

export function isValidDob(dob: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return false;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

/** Only accept same-site relative paths — never redirect to an attacker-supplied external URL. */
export function safeReturnTo(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}
