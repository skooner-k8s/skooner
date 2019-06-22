import _ from 'lodash';
import React from 'react';
import moment from 'moment';
import Loading from './loading';
import Sorter, {sortByDate} from './sorter';
import ResourceSvg from '../art/resourceSvg';

export function objectMap(items = {}) {
    return Object.entries(items).map(([key, value]) => (
        <div key={key}>
            <span>{key}</span> • <span title={value}>{value.length <= 50 ? value : `${value.substr(0, 50)}...`}</span>
        </div>
    ));
}

export function TableBody({items, filter, colSpan, sort, row}) {
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

export function MetadataHeaders({includeNamespace, sort}) {
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

export function MetadataColumns({item, href, includeNamespace, resourceClass}) {
    return (
        <>
            <td className='td_icon optional_small'>
                <ResourceSvg
                    resource={item.kind}
                    className={resourceClass}
                />
                <div className='td_iconLabel'>{item.kind}</div>
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
                {moment(item.metadata.creationTimestamp).fromNow(true)}
            </td>
        </>
    );
}

function NoResults({items, filter, colSpan}) {
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
