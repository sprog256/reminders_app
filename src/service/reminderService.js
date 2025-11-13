import axios from 'axios'
import {REMINDERS_BASE_URL} from '../config'

const gatherDeadline = (time, day) => new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    time.getHours(),
    time.getMinutes()
)

const fromDB = (list) => list.map(o => ({
    ...o,
    deadline: new Date(o.deadline)
}))

const toDB = (formData, day) => ({
    deadline: gatherDeadline(formData.time, day),
    description: formData.description
})

const getAll = async () => axios.get(REMINDERS_BASE_URL)
    .then((response) => {
        return fromDB(response.data)
    })

const insert = async (formData, day) => axios.post(REMINDERS_BASE_URL, toDB(formData, day))
    .then((response) => {
        return fromDB([response.data])[0]
    })

const update = async (id, formData, day) => axios.put(REMINDERS_BASE_URL + "/" + id, toDB(formData, day))
    .then((response) => {
        return fromDB([response.data])[0]
    })

const del = async (id) => axios.delete(REMINDERS_BASE_URL + "/" + id)

export const ReminderService = {
    getAll: getAll,
    create: insert,
    update: update,
    del: del,
}








