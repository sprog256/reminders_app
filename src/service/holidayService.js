import axios from "axios"
import { LOCALE, HOLIDAYS_BASE_URL } from '../config'

const fromDB = (list) => {
    return list.map(o => ({
        ...o,
        day: new Date(o.day)
    }))
}

const getByPeriod = (minDay, maxDay) => {
    let urls = []
    for (let i = minDay.getFullYear(); i <= maxDay.getFullYear(); i++) {
      urls.push(HOLIDAYS_BASE_URL + '/' + i + '/' + LOCALE)
    }

    const requests = urls.map(url => axios.get(url))

    return axios.all(requests)
      .then(responses => {
        let list = responses.map(o => o.data)
        return fromDB([].concat(...list))
      })
}

export const HolidayService = {
    get: getByPeriod
}