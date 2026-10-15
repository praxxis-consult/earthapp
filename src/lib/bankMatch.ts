/**
 * Whether the name a bank returns for an account belongs to the seller. Banks return names in
 * their own order and case ("AKPOLO PRINCE OGAGAOGHENE", "Ngozi Ada"), often with a middle name
 * the account holder never typed, so the rule is: every part of the seller's name (first and
 * last, as they signed up) appears somewhere in the bank's name. Initials and punctuation are
 * ignored; a single shared surname is not enough.
 */
export function namesMatch(bankName: string, holderName: string): boolean {
  const bank = tokens(bankName)
  const holder = tokens(holderName).filter((t) => t.length > 1)
  if (bank.length === 0 || holder.length === 0) return false
  return holder.every((part) => bank.includes(part))
}

function tokens(name: string): string[] {
  return name
    .toUpperCase()
    .replace(/[^A-Z\s'-]/g, ' ')
    .replace(/['-]/g, '')
    .split(/\s+/)
    .filter(Boolean)
}

/** "AKPOLO PRINCE OGAGAOGHENE" → "Akpolo Prince Ogagaoghene", for showing the bank's name. */
export function titleCase(name: string): string {
  return name
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
