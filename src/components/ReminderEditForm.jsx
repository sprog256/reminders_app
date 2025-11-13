import "./ReminderCreateForm.css"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import Grid from "@mui/material/Grid"
import TextField from "@mui/material/TextField"
import { useContext, useState } from "react"
import { DayContext } from "./DayContext"
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from "dayjs"
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/lt';
import IconButton from "@mui/material/IconButton"
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close'
import { LOCALE } from '../config'
import { formatDay } from '../format'
import { useFormik } from 'formik'
import { validationSchema } from './validation'


export const ReminderEditForm = ({onUpdate, reminder}) => {
    const [open, setOpen] = useState(false)

    const day = useContext(DayContext)

    const TITLE = `Pakeisti priminimą ${formatDay(day)}`

    const closeDialog = () => {
        setOpen(false)
    }

    const onSubmit = (formData) => {
        // transform time from dayjs fomat to Date
        let data = {...formData, time: formData.time.toDate()}
        onUpdate(data)
        closeDialog()
    }

    const initialValues = {...reminder, time: dayjs(reminder.deadline)}

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        onSubmit: onSubmit,
    })

    const openDialog = () => {
        formik.setValues(initialValues)
        setOpen(true)
    }

    return (
        <>
            <IconButton aria-label="Pakeisti priminimą"
                onClick={openDialog}
            >
                <EditIcon color="secondary" />
            </IconButton>

            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={LOCALE}>

            <Dialog
                open={open}
                onClose={closeDialog}
                fullWidth
            >
                <DialogTitle>
                    {TITLE}
                    <IconButton style={{float: "right"}} onClick={closeDialog}><CloseIcon color="primary"/></IconButton>
                </DialogTitle>
                <DialogContent>
                    <Grid container direction={"row"}>
                        <Grid container direction={"column"} size={3}>
                            <TimePicker
                            name='time'
                            ampm={false}
                            defaultValue={formik.values.time}
                            onChange={(value) => formik.setFieldValue('time', value)}
                            />
                        </Grid>
                        <Grid container direction={"column"} size={9}>
                            <TextField
                            name='description'
                            required={true}
                            placeholder={'Aprašymas'}
                            fullWidth={true}
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.description && formik.errors.description}
                            helperText={formik.touched.description && formik.errors.description}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="error">
                        Atšaukti
                    </Button>
                    <Button onClick={formik.handleSubmit} color="primary" autoFocus>
                        Pakeisti
                    </Button>
                </DialogActions>
            </Dialog>

            </LocalizationProvider>
        </>

    )
}