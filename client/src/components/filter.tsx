import React, { useEffect, useCallback } from 'react';
import InputFilter from './inputFilter';
import NamespaceFilter from './namespaceFilter';

type FilterProps = {
    text: string;
    filter: string;
    onChange: (value: string) => void;
    onNamespaceChange?: (namespace: string) => void;
}

function handleFilterOnChange(cb: (value: string) => void) {
    return (val: string) => {
        if(val) {
            const url = new URL(window.location.href)
            url.searchParams.set('filterKey', val)
            window.history.replaceState({url: url.href}, '', url.search + url.hash)
        }        
        return cb(val)
    }
}

function onInit(cb: (value: string) => void) {    
    return () => {
        const urlParams = new URLSearchParams(window.location.search);    
        const filterKey = urlParams.get('filterKey')
        if (filterKey){
            cb(filterKey)
        }    
    }
}

const Filter = ({text, filter, onChange, onNamespaceChange}: FilterProps) => {
    const memoedOnChange = useCallback(onChange, [])

    useEffect(onInit(memoedOnChange), [memoedOnChange])
    
    return (
        <div id='header'>
            <span className='header_label'>{text}</span>

            {onNamespaceChange && (
                <NamespaceFilter onChange={handleFilterOnChange(onNamespaceChange)} />
            )}

            <InputFilter filter={filter} onChange={handleFilterOnChange(onChange)} />
        </div>
    )
}
export default Filter;
