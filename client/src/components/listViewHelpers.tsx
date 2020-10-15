import _ from 'lodash';
import React, {ReactNode} from 'react';
import fromNow from '../utils/dates';
import {isAValidURL} from '../utils/string';
import Loading from './loading';
import Sorter, {sortByDate, SortInfo} from './sorter';
import ResourceSvg from '../art/resourceSvg';
import {TODO} from '../utils/types';

type TableBodyProps<T> = {
    items?: T[] | null;
    filter?: TODO;
    colSpan: number;
    sort?: SortInfo;
    row: (item: T, index: number) => ReactNode;
}

export function objectMap(items: {[key: string]: string} = {}) {
    return Object.entries(items).map(([key, value]) => {
        const substrValue = value.length <= 50 ? value : `${value.substr(0, 50)}...`;

        if (isAValidURL(value)) {
            // Check valid URL
            return (
                <div key={key}>
                    <span>{key}</span> • <a title={value} target="_blank" rel="noopener noreferrer" href={value}>{substrValue}</a>
                </div>
            );
        }

        // Note : alternative parsing could be implemented in other if clauses
        // By default, just display the raw value in a span
        return (
            <div key={key}>
                <span>{key}</span> • <span title={value}> {substrValue} </span>
            </div>
        );
    });
}

export function TableBody<T>({items, filter, colSpan, sort, row}: TableBodyProps<T>) {
    if (items && sort) {
        const {field, direction} = sort;
        items = _.orderBy(items, [field], [direction]); // eslint-disable-line no-param-reassign
    }

    return (
        <tbody>
            {items && items.length > 0 ? items.map(row) : (
                <NoResults items={items} filter={filter} colSpan={colSpan} />
            )}
        </tbody>
    );
}

export function MetadataHeaders({includeNamespace, sort}: {includeNamespace?: boolean, sort: TODO}) {
    return (
        <>
            <th className='th_icon optional_small'>
                <Sorter field='kind' sort={sort}>Type</Sorter>
            </th>
            <th>
                <Sorter field='metadata.name' sort={sort}>Name</Sorter>
            </th>
            {includeNamespace && (
                <th className='optional_medium'>
                    <Sorter field='metadata.namespace' sort={sort}>Namespace</Sorter>
                </th>
            )}
            <th className='optional_medium'>
                <Sorter field={sortByDate} sort={sort}>Age</Sorter>
            </th>
        </>
    );
}

type MetadataColumnsProps = {
    item: TODO,
    href: string,
    includeNamespace?: boolean,
    resourceClass?: string
};

export function MetadataColumns({item, href, includeNamespace, resourceClass}: MetadataColumnsProps) {
    return (
        <>
            <td className='td_icon optional_small'>
                <ResourceSvg
                    resource={item.kind}
                    className={resourceClass}
                />
                <div className='td_iconLabel metadata-type'>{item.kind}</div>

                {// If node is a master, display a simple "MASTER" label below the item.kind icon
                    _.has(item.metadata.labels, ['node-role.kubernetes.io/master'])
                    && <span className='td_iconLabel node-master'>MASTER</span>
                }

            </td>
            <td>
                {href ? (<a href={href}>{item.metadata.name}</a>) : item.metadata.name}
            </td>

            {includeNamespace && (
                <td className='optional_medium'>
                    {item.metadata.namespace || 'All Namespaces'}
                </td>
            )}

            <td className='optional_medium'>
                {fromNow(item.metadata.creationTimestamp)}
            </td>
        </>
    );
}

function NoResults({items, filter, colSpan}: {items: TODO, filter: TODO, colSpan: number}) {
    if (!items) {
        return (
            <tr>
                <td colSpan={colSpan}><Loading /></td>
            </tr>
        );
    }

    if (!items.length && filter) {
        return (
            <tr>
                <td colSpan={colSpan}>No results found for filter: {filter}</td>
            </tr>
        );
    }

    if (!items.length) {
        return (
            <tr>
                <td colSpan={colSpan}>No results found</td>
            </tr>
        );
    }

    return (
        <tr />
    );
}
