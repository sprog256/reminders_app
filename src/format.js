import { LOCALE } from './config'

const timeFormatter = new Intl.DateTimeFormat(LOCALE, { minute: '2-digit', hour: '2-digit' })
const dayFormatter = new Intl.DateTimeFormat(LOCALE, { year: 'numeric', month: '2-digit', day: '2-digit' })

export const formatTime = (date) => {
  return timeFormatter.format(date)
}

export const formatDay = (date) => {
  return dayFormatter.format(date)
}

export const isSameDay = (d1, d2) => {
  return (d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate())
}
