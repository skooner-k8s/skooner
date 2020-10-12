import React, { Component } from 'react';
import InputFilter from './inputFilter';
import NamespaceFilter from './namespaceFilter';

type FilterProps = {
    text: string;
    filter: string;
    onChange: (value: string) => void;
    onNamespaceChange?: (namespace: string) => void;
}

function handleSaveOnBlur(value: string) {
    if(value) {
        const url = new URL(window.location.href)
        url.searchParams.set('filterKey', value)
        window.history.replaceState({url: url.href}, '', url.search + url.hash)
    } else {
        const url = new URL(window.location.href)
        url.searchParams.delete('filterKey')
        window.history.replaceState({url: url.href}, '', url.search + url.hash)
    }
}

export default class Filter extends Component<FilterProps> {
    componentDidMount() {
        const { onChange } = this.props
        const urlParams = new URLSearchParams(window.location.search);    
        const filterKey = urlParams.get('filterKey') || ''
        onChange(filterKey)
    }

    render() {
        const {text, filter, onChange, onNamespaceChange} = this.props

        return (
            <div id='header'>
                <span className='header_label'>{text}</span>
    
                {onNamespaceChange && (
                    <NamespaceFilter onChange={onNamespaceChange} />
                )}
    
                <InputFilter filter={filter} onBlur={handleSaveOnBlur} onChange={onChange} />
            </div>
        )
    }
    
}