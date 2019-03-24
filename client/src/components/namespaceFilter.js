import React from 'react';
import Select from 'react-select';
import Base from './base';
import api from '../services/api';

export default class NamespaceFilter extends Base {
    constructor({onChange}) {
        super();
        const {namespace} = localStorage;
        this.state = {namespace};
        this.onChange = onChange;
        onChange(namespace);

        this.registerApi({
            namespaces: api.namespace.list(namespaces => this.setState({namespaces})),
        });
    }

    async setNamespace(namespace) {
        localStorage.namespace = namespace;
        this.setState({namespace});
        this.onChange(namespace);
    }

    render() {
        const {namespace = '', namespaces = []} = this.state;

        const options = namespaces.map(x => ({value: x.metadata.name, label: x.metadata.name}));
        options.unshift({value: '', label: 'All Namespaces'});

        const value = options.find(x => x.value === namespace);

        return (
            <div className='select_namespace'>
                <Select
                    className="react-select"
                    classNamePrefix="react-select"
                    value={value}
                    onChange={x => this.setNamespace(x.value)}
                    options={options}
                />
            </div>
        );
    }
}
