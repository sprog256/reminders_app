import { useEffect, useState } from 'react'

import axios from 'axios'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import IconButton from '@mui/material/IconButton'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { styled } from '@mui/material/styles'
import { ReminderCreateForm } from './components/ReminderCreateForm'
import { DayContext } from './components/DayContext';
import { ReminderEditForm } from './components/ReminderEditForm'
import { formatTime, formatDay, isSameDay, LOCALE } from './format'

import './App.css'

const REMINDERS_BASE_URL = 'http://localhost:8080/reminders'
const HOLIDAYS_BASE_URL = 'http://localhost:8080/holidays'
const HOLIDAY_CLASS = "holiday"

function App() {
  const [day, setDay] = useState(new Date());
  const [minDay] = useState(new Date());
  const [maxDay] = useState(new Date(minDay.getFullYear() + 1, minDay.getMonth(), minDay.getDate()));
  const [loadingReminders, setLoadingReminders] = useState(true)
  const [loadingHolidays, setLoadingHolidays] = useState(true)
  const [reminders, setReminders] = useState([]);
  const [holidays, setHolidays] = useState([])
  const [remindersToShow, setRemindersToShow] = useState([])
  const [holidaysToShow, setHolidaysToShow] = useState([])

  useEffect(() => {
    axios.get(REMINDERS_BASE_URL)
      .then(response => {
        let data_transformed = response.data.map(o => ({
          ...o,
          deadline: new Date(o.deadline)
        }))

        setReminders(data_transformed)
      })
      .finally(() => {
        setLoadingReminders(false);
      })
  }, [])

  useEffect(() => {
    let urls = []
    for (let i = minDay.getFullYear(); i <= maxDay.getFullYear(); i++) {
      urls.push(HOLIDAYS_BASE_URL + '/' + i + '/' + LOCALE)
    }

    const requests = urls.map(url => axios.get(url))

    axios.all(requests)
      .then(responses => {
        let data = responses.map(response => response.data)
        let data_flat = [].concat(...data)
        let data_flat_transformed = data_flat.map(o => ({
          ...o,
          day: new Date(o.day)
        }))
        setHolidays(data_flat_transformed)
      })
      .finally(() => {
        setLoadingHolidays(false)
      })

  }, [minDay, maxDay])

  useEffect(() => {
    setRemindersToShow(
      reminders
        .filter(reminder => isSameDay(reminder.deadline, day))
        .sort((a,b) => a.deadline.getTime() - b.deadline.getTime())
    )
  }, [day, reminders])

  useEffect(() => {
    setHolidaysToShow(holidays.filter(holiday => isSameDay(holiday.day, day)));
  }, [day, holidays])

  const deleteReminder = (id) => {
    axios.delete(REMINDERS_BASE_URL + "/" + id).then(() => {
      setReminders(reminders.filter(o => o.id !== id))
    })
  }

  const gatherDeadline = (formData) => {
    let deadline = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      formData.time.getHours(),
      formData.time.getMinutes())
    return deadline
  }

  const createReminder = (formData) => {
    let newData = {
      deadline: gatherDeadline(formData),
      description: formData.description
    }

    axios.post(REMINDERS_BASE_URL, newData)
      .then((response) => {
        let newReminder = {
          ...response.data,
          deadline: new Date(response.data.deadline)
        }
        setReminders([...reminders, newReminder])
      })

  }

  const editReminder = (formData) => {
    let dto = {
      deadline: gatherDeadline(formData),
      description: formData.description
    }

    axios.put(REMINDERS_BASE_URL + "/" + formData.id, dto)
      .then((response) => {
        let newReminder = {
          ...response.data,
          deadline: new Date(response.data.deadline)
        }
        setReminders([...reminders.filter(o => o.id !== newReminder.id), newReminder])
      })

  }

  const countReminders = (date) => {
    return reminders.filter(reminder => isSameDay(reminder.deadline, date)).length;
  }

  const isHoliday = (date) => {
    return holidays.filter(holiday => isSameDay(holiday.day, date)).length > 0;
  }

  const customTileContent = ({ date, view }) => {
    if (view === "month") {
      const n = countReminders(date)
      if (n > 0) {
        return (
          <div className='bubble__container'>
            <span className='bubble'>{n}</span>
          </div>
        )
      }
    }
    return null;
  }

  const customTileClass = ({ date, view }) => {
    if (view === "month") {
      if (isHoliday(date)) {
        return HOLIDAY_CLASS;
      }
    }
    return null;
  }

  const HolidayItems = () => {
    const StyledTableCell = styled(TableCell)(() => ({
        color: "#f70303",
        fontWeight: "bold",
    }))

    const items = holidaysToShow.map(holiday =>
      <TableRow
        key={holiday.day}
      >
        <StyledTableCell align='left'>
          {holiday.name}
        </StyledTableCell>
      </TableRow>
    )

    return (
      <TableContainer  sx={{ width: 600 }}>
        <Table>
          <TableBody>
            { items }
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  const ReminderItems = () => {
    const items = remindersToShow.map(reminder =>
      <TableRow
        key={reminder.id}
      >
        <TableCell align='left'>
          {formatTime(reminder.deadline)}
        </TableCell>

        <TableCell align='left'>
          {reminder.description}
        </TableCell>
        <TableCell align='right'>
          <IconButton aria-label="Ištrinti priminimą" onClick={() => deleteReminder(reminder.id)}>
            <DeleteForeverIcon />
          </IconButton>
        </TableCell>
        <TableCell align='right'>
          <DayContext.Provider value={day}>
            <ReminderEditForm
              onUpdate={(formData) => editReminder(formData)}
              reminder={reminder}
              />
          </DayContext.Provider>
        </TableCell>
      </TableRow>
    )

    return (
      <TableContainer  sx={{ width: 600 }}>
        <Table>
          <TableBody>
            { items }
          </TableBody>
        </Table>
      </TableContainer>
    )

  }

  return (
    <div className="App">
      <h1>Kalendoriaus priminimai</h1>

      {
        loadingHolidays || loadingReminders ? (
          <div>Startuoja...</div>
        ) : (
          <>

          <h3>{formatDay(day)}</h3>

          <div className="calendar__container">

                <Calendar onChange={setDay} value={day}
                locale={LOCALE}
                minDate={minDay}
                maxDate={maxDay}
                maxDetail="month"
                minDetail="year"
                tileContent={customTileContent}
                tileClassName={customTileClass}
                onClickDay={setDay}
                />

          </div>

          <DayContext.Provider value={day}>
            <ReminderCreateForm
            onCreate={(formData) => createReminder(formData)}
            />
          </DayContext.Provider>

          <div className="holidays__container">
            <HolidayItems />
          </div>

          <div className="reminders__container">
            <ReminderItems />
          </div>

          </>
        )
      }


    </div>
  )
}

export default App

