import React from 'react';
import Search from '../art/searchSvg';
import Cancel from '../art/cancelSvg';

type InputFilterProps = {
    filter: string;
    onChange: (value: string) => void;
}

const InputFilter = ({filter, onChange}: InputFilterProps) => (
    <>
        <input
            className='header_filter header_fill optional_xsmall'
            type='text'
            placeholder='type to filter'
            value={filter}
            onChange={x => onChange(x.target.value)}
            onKeyUp={(x) => {
                // Clear the textbox on `esc` keypress
                if (x.keyCode === 27) onChange('');
            }}
        />

        {filter.length === 0 ? (
            <Search className='optional_xsmall' />
        ) : (
            <Cancel className='svg_button svg_error optional_xsmall' onClick={() => onChange('')} />
        )}
    </>
);

export default InputFilter;
