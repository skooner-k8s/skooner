import './field.scss';
import React, {ReactNode} from 'react';

type FieldProps = {
    name: string;
    value?: string | null;
    children?: ReactNode;
}

const Field = ({name, value, children}: FieldProps) => (
    <div className='field_set'>
        <label className='field_name'>{name}</label>
        <span className='field_value'>{value || children}</span>
    </div>
);

export default Field;
