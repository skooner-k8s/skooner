import React from 'react';
import InputFilter from './inputFilter';
import NamespaceFilter from './namespaceFilter';

const Filter = ({text, filter, onChange, onNamespaceChange}) => (
    <div id='header'>
        <span className='header_label'>{text}</span>

        {onNamespaceChange && (
            <NamespaceFilter onChange={onNamespaceChange} />
        )}

        <InputFilter filter={filter} onChange={onChange} />
    </div>
);

export default Filter;
