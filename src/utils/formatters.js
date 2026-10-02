export const formatCurrency = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)

export const formatDate = (date, options = {}) =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', ...options }).format(new Date(date))

export const truncate = (str, length = 50) =>
  str.length > length ? `${str.slice(0, length)}...` : str

export const capitalize = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
