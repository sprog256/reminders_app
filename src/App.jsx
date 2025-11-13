import { useEffect, useState } from 'react'

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
import { LOCALE } from './config'
import { formatTime, formatDay, isSameDay } from './format'

import './App.css'
import { ReminderService } from './service/reminderService'
import { HolidayService } from './service/holidayService'

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
    setLoadingReminders(true)
    ReminderService.getAll()
      .then(data => setReminders(data))
      .finally(() => setLoadingReminders(false))
  }, [])

  useEffect(() => {
    HolidayService.get(minDay, maxDay)
      .then(data => setHolidays(data))
      .finally(() => setLoadingHolidays(false))
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

  const createReminder = (formData) => {
    ReminderService.create(formData, day)
      .then(data => setReminders([...reminders, data]))
  }

  const updateReminder = (id, formData) => {
    ReminderService.update(id, formData, day)
      .then(data => setReminders([...reminders.filter(o => o.id !== data.id), data]))
  }

  const deleteReminder = (id) => {
    ReminderService.del(id)
      .then(() => setReminders(reminders.filter(o => o.id !== id)))
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
              onUpdate={(formData) => updateReminder(reminder.id, formData)}
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

