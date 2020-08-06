import _ from 'lodash';
import React from 'react';
import Base from './base';
import Sorter from './sorter';
import LoadingEllipsis from './loadingEllipsis';
import {MetadataHeaders, MetadataColumns, TableBody} from './listViewHelpers';
import {unparseRam, unparseCpu} from '../utils/unitHelpers';
import {getPodResourcePercent, getPodUsage, getPodResourceValue} from '../utils/metricsHelpers';
import {TODO} from "../utils/types";

interface PodsPanelProps {
    metrics: TODO;
    pods: TODO[];
    items: TODO[];
    sort: TODO;
    filter: TODO;
    skipNamespace: boolean;
}

interface PodsPanelStates {
}

export default class PodsPanel extends Base<PodsPanelProps, PodsPanelStates> {
    private sortByCpuUsage: TODO;
    private sortByCpuRequest: TODO;
    private sortByCpuLimit: TODO;
    private sortByRamUsage: TODO;
    private sortByRamRequest: TODO;
    private sortByRamLimit: TODO;

    constructor(props: TODO) {
        super(props);

        this.sortByCpuUsage = (x: TODO) => getPodUsage(x, this.props.metrics, 'cpu');
        this.sortByCpuRequest = (x: TODO) => sortBy(x, this.props.metrics, 'cpu', 'requests');
        this.sortByCpuLimit = (x: TODO) => sortBy(x, this.props.metrics, 'cpu', 'limits');

        this.sortByRamUsage = (x: TODO) => getPodUsage(x, this.props.metrics, 'memory');
        this.sortByRamRequest = (x: TODO) => sortBy(x, this.props.metrics, 'memory', 'requests');
        this.sortByRamLimit = (x: TODO) => sortBy(x, this.props.metrics, 'memory', 'limits');
    }

    render() {
        const {items, metrics, sort, filter, skipNamespace} = this.props;
        const col = 10 + Number(!skipNamespace);

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

                    <TableBody items={items} filter={filter} sort={sort} colSpan={col} row={(x: TODO) => (
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

function getPhaseStyle(phase: string) {
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

function sortBy(item: TODO, metrics: TODO, resource: string, type: string) {
    const result = getPodResourcePercent(item, metrics, resource, type);
    return result && Number.isFinite(result) ? result : -1;
}

function getRestartCount({status}: {status: TODO}) {
    return _.sumBy(status.containerStatuses, 'restartCount');
}

function getChart(item: TODO, metrics: TODO, resource: string) {
    const actual = getPodUsage(item, metrics, resource);

    return (
        <>
            {actual && getRawDisplay(item, metrics, actual, resource)}
            {actual && getPercentDisplay(item, metrics, actual, resource, 'requests')}
            {actual && getPercentDisplay(item, metrics, actual, resource, 'limits')}
        </>
    );
}

function getRawDisplay(item: TODO, metrics: TODO, actual: number | string | null, resource: string) {
    if (!item || !metrics) return <td><LoadingEllipsis /></td>;

    const unparser: TODO = resource === 'cpu' ? unparseCpu : unparseRam;
    const actualResult = unparser(actual);

    return (
        <td>
            {actualResult.value}
            <span className='smallText'>{actualResult.unit}</span>
        </td>
    );
}

function getPercentDisplay(item: TODO, metrics: TODO, actual: number, resource: string, type: TODO) {
    if (!item || !metrics) return <td className='optional_xsmall'><LoadingEllipsis /></td>;

    const request = getPodResourceValue(item, resource, type);
    if (!request) return <td className='smallText optional_xsmall'>-</td>;

    const unparser: TODO = resource === 'cpu' ? unparseCpu : unparseRam;
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
