/** "AKPOLO PRINCE OGAGAOGHENE" → "Akpolo Prince Ogagaoghene", for showing the bank's name. */
export function titleCase(name: string): string {
  return name
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
