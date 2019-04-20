import './podsPanel.scss';
import _ from 'lodash';
import React from 'react';
import Base from './base';
import Sorter from './sorter';
import LoadingEllipsis from './loadingEllipsis';
import {MetadataHeaders, MetadataColumns, TableBody} from './listViewHelpers';
import {unparseRam, unparseCpu} from '../utils/unitHelpers';
import {getPodResourcePercent, getPodUsage, getPodResourceValue} from '../utils/metricsHelpers';

export default class PodsPanel extends Base {
    constructor(props) {
        super(props);

        this.sortByCpuUsage = x => getPodUsage(x, this.props.metrics, 'cpu');
        this.sortByCpuRequest = x => getPodResourcePercent(x, this.props.metrics, 'cpu', 'requests');
        this.sortByCpuLimit = x => getPodResourcePercent(x, this.props.metrics, 'cpu', 'limits');

        this.sortByRamUsage = x => getPodUsage(x, this.props.metrics, 'memory');
        this.sortByRamRequest = x => getPodResourcePercent(x, this.props.metrics, 'memory', 'requests');
        this.sortByRamLimit = x => getPodResourcePercent(x, this.props.metrics, 'memory', 'limits');
    }

    render() {
        const {items, metrics, sort, filter, skipNamespace, skipNodeName} = this.props;
        const col = 8 + !skipNamespace + !skipNodeName; // TODO: fix me

        return (
            <div className='contentPanel'>
                <table>
                    <thead>
                        <tr>
                            <MetadataHeaders sort={sort} includeNamespace={!skipNamespace} />
                            {/*
                            TODO: remove this (and all callers too)
                            {!skipNodeName && (
                                <th className='optional_small'><Sorter field='spec.nodeName' sort={sort}>Node</Sorter></th>
                            )}
                            */}
                            <th className='optional_medium'><Sorter field={getRestartCount} sort={sort}>Restarts</Sorter></th>
                            <th>
                                <Sorter field={this.sortByCpuUsage} sort={sort}>Cpu</Sorter>
                            </th>
                            <th className='optional_xsmall'>
                                <Sorter field={this.sortByCpuRequest} sort={sort}>Request</Sorter>
                            </th>
                            <th className='optional_xsmall'>
                                <Sorter field={this.sortByCpuLimit} sort={sort}>Limit</Sorter>
                            </th>
                            <th>
                                <Sorter field={this.sortByRamUsage} sort={sort}>Ram</Sorter>
                            </th>
                            <th className='optional_xsmall'>
                                <Sorter field={this.sortByRamRequest} sort={sort}>Request</Sorter>
                            </th>
                            <th className='optional_xsmall'>
                                <Sorter field={this.sortByRamLimit} sort={sort}>Limit</Sorter>
                            </th>
                        </tr>
                    </thead>

                    <TableBody items={items} filter={filter} sort={sort} colSpan={col} row={x => (
                        <tr key={x.metadata.uid}>
                            <MetadataColumns
                                item={x}
                                isError={x.status.phase !== 'Running'}
                                includeNamespace={!skipNamespace}
                                href={`#!pod/${x.metadata.namespace}/${x.metadata.name}`}
                            />
                            {/* {!skipNodeName && <td className='optional_small'>{x.spec.nodeName}</td>} */}
                            <td className='optional_medium'>{getRestartCount(x)}</td>
                            {getChart(x, metrics, 'cpu')}
                            {getChart(x, metrics, 'memory')}
                        </tr>
                    )} />
                </table>
            </div>
        );
    }
}

function getRestartCount({status}) {
    return _.sumBy(status.containerStatuses, 'restartCount');
}

function getChart(item, metrics, resource) {
    const actual = getPodUsage(item, metrics, resource);

    return (
        <>
            {getRawDisplay(item, metrics, actual, resource)}
            {getPercentDisplay(item, metrics, actual, resource, 'requests')}
            {getPercentDisplay(item, metrics, actual, resource, 'limits')}
        </>
    );
}

function getRawDisplay(item, metrics, actual, resource) {
    if (!item || !metrics) return <td><LoadingEllipsis /></td>;

    const unparser = resource === 'cpu' ? unparseCpu : unparseRam;
    const actualResult = unparser(actual);

    return (
        <td>
            {actualResult.value}
            <span className='podsPanel_label'>{actualResult.unit}</span>
        </td>
    );
}

function getPercentDisplay(item, metrics, actual, resource, type) {
    if (!item || !metrics) return <td><LoadingEllipsis /></td>;

    const request = getPodResourceValue(item, resource, type);
    if (!request) return <td className='podsPanel_label'>-</td>;

    const unparser = resource === 'cpu' ? unparseCpu : unparseRam;
    const result = unparser(request);
    const percent = request ? _.round(actual / request * 100, 1) : 0;
    const className = percent > 85 ? 'optional_xsmall contentPanel_warn' : 'optional_xsmall';

    return (
        <td className={className}>
            {percent}<span className='podsPanel_label'>%</span>
            <div className='podsPanel_label'>{result.value}{result.unit}</div>
        </td>
    );
}
