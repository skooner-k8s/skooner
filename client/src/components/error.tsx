import './error.scss';
import React from 'react';

const Error = ({messages}: {messages: string[]}) => (
    <div className='error contentPanel'>
        {messages.map((x, i) => (
            <div key={i}>{x}</div>
        ))}
    </div>
);

export default Error;
