import './field.scss';
import React from 'react';

const Field = ({name, value, children}) => (
    <div className='field_set'>
        <label className='field_name'>{name}</label>
        <span className='field_value'>{value || children}</span>
    </div>
);

export default Field;
