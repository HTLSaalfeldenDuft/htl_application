import { Form } from 'react-bootstrap'
import { Contact } from '../../../models/contact.model'
import { useFormContext } from 'react-hook-form'
import { Applicant } from '../../../models/applicant.model'
import { useContact } from '../../../contexts/contact.context'
import { ErrorMessege } from './ErrorMessage'

interface Props { 
    attr: keyof Contact
    title: string
    required?: boolean
    className?: string
    type?: string
}

export const FormInput = (props: Props) => {
    const { attr, title, required, className } = props
    let { type } = props
    type ||= 'text'

    const { index } = useContact()

    const {
        register,
        formState: { errors }
    } = useFormContext<Applicant>()

    const hasError = !!(errors.contacts && errors.contacts[index] && errors.contacts[index]![attr])

    return (
        <Form.Group className={`mb-3 ${className}`}>
            <Form.Label htmlFor={`contacts.${index}.${attr}`}>
                {title}{required ? '*' : null}
            </Form.Label>
            <Form.Control
                type={type}
                {...register(`contacts.${index}.${attr}`, { required: (required ? `Bitte ${title} angeben` : undefined) })}
                id={`contacts.${index}.${attr}`}
                isInvalid={hasError}
            />
            <ErrorMessege errors={errors} index={index} attr={attr}/>
        </Form.Group>
    )
}