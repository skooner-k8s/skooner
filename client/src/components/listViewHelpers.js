import React from 'react';
import moment from 'moment';
import Loading from './loading';
import Sorter from './sorter';
import ResourceSvg from '../art/resourceSvg';

export function MetadataHeaders({includeNamespace, sortBy, sortDirection, onSort}) {
    return (
        <>
            <th className='th_icon'>
                <Sorter text='Type' field='kind' sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} />
            </th>
            <th>
                <Sorter text='Name' field='metadata.name' sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} />
            </th>
            {includeNamespace && (
                <th>
                    <Sorter text='Namespace' field='metadata.namespace' sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} />
                </th>
            )}
            <th>
                <Sorter text='Age' field='metadata.creationTimestamp' sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} />
            </th>
        </>
    );
}

export function MetadataColumns({item, href, includeNamespace, isError}) {
    return (
        <>
            <td className='td_icon'>
                <ResourceSvg
                    resource={item.kind}
                    className={isError ? 'svg_error' : undefined}
                />
                <div className='td_iconLabel'>{item.kind}</div>
            </td>
            <td>
                <a href={href}>{item.metadata.name}</a>
            </td>

            {includeNamespace && (
                <td>
                    {item.metadata.namespace || 'All Namespaces'}
                </td>
            )}

            <td>
                {moment(item.metadata.creationTimestamp).fromNow(true)}
            </td>
        </>
    );
}

export function hasResults(items) {
    return !!items && items.length > 0;
}

export function NoResults({items, filter, colSpan}) {
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
}

export function objectMap(items = {}) {
    return Object.entries(items).map(([key, value]) => (
        <div key={key}>
            <span>{key}</span> • <span title={value}>{value.length <= 50 ? value : `${value.substr(0, 50)}...`}</span>
        </div>
    ));
}
