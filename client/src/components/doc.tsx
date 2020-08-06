import './doc.scss';
import React from 'react';
import Base from './base';
import ArrowDownSvg from '../art/arrowDownSvg';


type DocItemValues = {
    format?: string
    type?: string
    description: string
    properties: Map<string, DocItemProps>;
}

type DocItemProps = {
    name: string
    value: DocItemValues;
}

type DocProps = {
    properties: Map<string, DocItemProps>;
};

type State = {
    expanded: boolean;
};

export default class Doc extends Base<DocProps, State> {
    render() {
        const {properties} = this.props;
        const pairs = Object.entries(properties || {});

        return (
            <ul className='doc_group'>
                {pairs.map(([name, value]) => (
                    <DocItem key={name} name={name} value={value} />
                ))}
            </ul>
        );
    }
}

class DocItem extends Base<DocItemProps, State> {
    toggle() {
        const {expanded} = this.state || {};
        this.setState({expanded: !expanded});
    }

    render() {
        const {name, value} = this.props;
        const {expanded} = this.state || {};
        return (
            <>
                <li className='doc_item' key={name} onClick={() => this.toggle()}>
                    <ArrowDownSvg className={expanded ? 'doc_arrow doc_arrowExpanded' : 'doc_arrow'} />
                    <span>{name}</span>
                    <span className='doc_itemType'> {value.format || value.type}</span>
                    {expanded && <div className='doc_description'>{value.description}</div>}
                </li>
                {expanded && (
                    <Doc key={`${name}-properties`} properties={value.properties} />
                )}
            </>
        );
    }
}
