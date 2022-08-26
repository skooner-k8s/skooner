import React from 'react';
import Select, {ValueType} from 'react-select';
import Base from './base';
import api from '../services/api';
import {TODO} from '../utils/types';

interface NamespaceFilterProps {
    onChange?: Function;
}

interface NamespaceFilterStates {
    namespace: {};
    namespaces?: TODO[];
    config?: { namespaces: string[]};
}

export default class NamespaceFilter extends Base<NamespaceFilterProps, NamespaceFilterStates> {
    private onChange: Function;

    constructor({onChange}: { onChange: Function }) {
        super({});
        const {namespace} = localStorage;
        this.state = {namespace};
        this.onChange = onChange;
        onChange(namespace);

        this.registerApi({
            namespaces: api.namespace.list((namespaces: TODO[]) => this.setState({namespaces})),
            config: api.config.getConfig().then(config => this.setState({config}))
        });
    }

    async setNamespace(namespace: string) {
        localStorage.namespace = namespace;
        this.setState({namespace});
        this.onChange(namespace);
    }

    render() {
        const {namespace = '', namespaces = [], config = { namespaces: [] }} = this.state;

        let options = namespaces.map(x => ({value: x.metadata.name, label: x.metadata.name}));
        options.unshift({value: '', label: 'All Namespaces'});

        if (config && config.namespaces){
            options = options.filter(ns => config.namespaces.includes(ns.label))
        }
        
        const value = options.find(x => x.value === namespace);

        return (
            <div className='select_namespace'>
                <Select
                    className="react-select"
                    classNamePrefix="react-select"
                    value={value}
                    onChange={(x:ValueType<TODO>) => this.setNamespace(x.value)}
                    options={options}
                />
            </div>
        );
    }
}
