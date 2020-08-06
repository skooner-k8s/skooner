import './field.scss';
import React from 'react';

type FieldProps = {
    name: string;
    value?: string | null;
    children?: React.ReactNode[] | null | string;
}

const Field = ({name, value, children}: FieldProps) => (
    <div className='field_set'>
        <label className='field_name'>{name}</label>
        <span className='field_value'>{value || children}</span>
    </div>
);

export default Field;
