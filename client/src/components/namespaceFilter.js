import React from 'react';
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
        const {namespace, namespaces = []} = this.state;

        return (
            <select
                value={namespace}
                className='select_namespace'
                onChange={x => this.setNamespace(x.target.value)}
            >
                <>
                    <option value=''>All Namespaces</option>
                    {namespaces.map(x => (
                        <option key={x.metadata.name}>{x.metadata.name}</option>
                    ))}
                </>
            </select>
        );
    }
}
