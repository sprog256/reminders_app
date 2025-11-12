import * as yup from 'yup';

export const validationSchema = yup.object({
    description: yup
        .string('Įveskite priminimo tekstą')
        .min(4, 'Priminime turi būti mažiausiai 4 simboliai')
        .required('Priminimo tekstas turi būti įvestas'),
})