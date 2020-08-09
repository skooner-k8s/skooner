import React from 'react';
import InputFilter from './inputFilter';
import NamespaceFilter from './namespaceFilter';

type FilterProps = {
    text: string;
    filter: string;
    onChange: (value: string) => void;
    onNamespaceChange?: (namespace: string) => void;
}

const Filter = ({text, filter, onChange, onNamespaceChange}: FilterProps) => (
    <div id='header'>
        <span className='header_label'>{text}</span>

        {onNamespaceChange && (
            <NamespaceFilter onChange={onNamespaceChange} />
        )}

        <InputFilter filter={filter} onChange={onChange} />
    </div>
);

export default Filter;
