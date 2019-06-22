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
        this.sortByCpuRequest = x => sortBy(x, this.props.metrics, 'cpu', 'requests');
        this.sortByCpuLimit = x => sortBy(x, this.props.metrics, 'cpu', 'limits');

        this.sortByRamUsage = x => getPodUsage(x, this.props.metrics, 'memory');
        this.sortByRamRequest = x => sortBy(x, this.props.metrics, 'memory', 'requests');
        this.sortByRamLimit = x => sortBy(x, this.props.metrics, 'memory', 'limits');
    }

    render() {
        const {items, metrics, sort, filter, skipNamespace} = this.props;
        const col = 10 + !skipNamespace;

        return (
            <div className='contentPanel'>
                <table>
                    <thead>
                        <tr>
                            <MetadataHeaders sort={sort} includeNamespace={!skipNamespace} />
                            <th className='optional_medium'><Sorter field={getRestartCount} sort={sort}>Restarts</Sorter></th>
                            <th>
                                <Sorter field={this.sortByCpuUsage} sort={sort}>
                                    Cpu
                                    <div className='smallText'>Actual</div>
                                </Sorter>
                            </th>
                            <th className='optional_xsmall'>
                                <Sorter field={this.sortByCpuRequest} sort={sort}>
                                    Cpu
                                    <div className='smallText'>Request</div>
                                </Sorter>
                            </th>
                            <th className='optional_xsmall'>
                                <Sorter field={this.sortByCpuLimit} sort={sort}>
                                    Cpu
                                    <div className='smallText'>Limit</div>
                                </Sorter>
                            </th>
                            <th>
                                <Sorter field={this.sortByRamUsage} sort={sort}>
                                    Ram
                                    <div className='smallText'>Actual</div>
                                </Sorter>
                            </th>
                            <th className='optional_xsmall'>
                                <Sorter field={this.sortByRamRequest} sort={sort}>
                                    Ram
                                    <div className='smallText'>Request</div>
                                </Sorter>
                            </th>
                            <th className='optional_xsmall'>
                                <Sorter field={this.sortByRamLimit} sort={sort}>
                                    Ram
                                    <div className='smallText'>Limit</div>
                                </Sorter>
                            </th>
                        </tr>
                    </thead>

                    <TableBody items={items} filter={filter} sort={sort} colSpan={col} row={x => (
                        <tr key={x.metadata.uid}>
                            <MetadataColumns
                                item={x}
                                resourceClass={getPhaseStyle(x.status.phase)}
                                includeNamespace={!skipNamespace}
                                href={`#!pod/${x.metadata.namespace}/${x.metadata.name}`}
                            />
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

function getPhaseStyle(phase) {
    switch (phase) {
        case 'Pending':
            return 'svg_warn';

        case 'Running':
            return undefined;

        case 'Failed':
        case 'Unknown':
            return 'svg_error';

        case 'Succeeded':
        case 'Completed':
        default:
            return 'svg_neutral';
    }
}

function sortBy(item, metrics, resource, type) {
    const result = getPodResourcePercent(item, metrics, resource, type);
    return Number.isFinite(result) ? result : -1;
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
            <span className='smallText'>{actualResult.unit}</span>
        </td>
    );
}

function getPercentDisplay(item, metrics, actual, resource, type) {
    if (!item || !metrics) return <td className='optional_xsmall'><LoadingEllipsis /></td>;

    const request = getPodResourceValue(item, resource, type);
    if (!request) return <td className='smallText optional_xsmall'>-</td>;

    const unparser = resource === 'cpu' ? unparseCpu : unparseRam;
    const result = unparser(request);
    const percent = request ? _.round(actual / request * 100, 1) : 0;
    const className = percent > 85 ? 'optional_xsmall contentPanel_warn' : 'optional_xsmall';

    return (
        <td className={className}>
            {percent}<span className='smallText'>%</span>
            <div className='smallText'>{result.value}{result.unit}</div>
        </td>
    );
}
