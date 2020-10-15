import _ from 'lodash';
import React from 'react';
import Base from './base';
import Sorter, {SortInfo} from './sorter';
import LoadingEllipsis from './loadingEllipsis';
import {MetadataHeaders, MetadataColumns, TableBody, objectMap} from './listViewHelpers';
import {unparseCpu, unparseRam} from '../utils/unitHelpers';
import {getNodeResourceValue, getNodeResourcePercent, getNodeUsagePercent, getNodeUsage, getNodeResourcesAvailable, ResourceType} from '../utils/metricsHelpers';
import getReadyStatus from '../utils/nodeHelpers';
import {TODO, Pod, Node} from '../utils/types';

interface NodesPanelProps {
    metrics: TODO;
    pods?: Pod[];
    items?: Node[];
    sort: SortInfo;
    filter?: string;
}

interface NodesPanelStates {
    show: {}
}

export default class NodesPanel extends Base<NodesPanelProps, NodesPanelStates> {
    private sortByCpuUsage: TODO;

    private sortByCpuRequest: TODO;

    private sortByCpuLimit: TODO;

    private sortByRamUsage: TODO;

    private sortByRamRequest: TODO;

    private sortByRamLimit: TODO;

    constructor(props: TODO) {
        super(props);

        this.sortByCpuUsage = (x: TODO) => getNodeUsagePercent(x, this.props.metrics, 'cpu');
        this.sortByCpuRequest = (x: TODO) => getNodeResourcePercent(x, this.props.pods, 'cpu', 'requests');
        this.sortByCpuLimit = (x: TODO) => getNodeResourcePercent(x, this.props.pods, 'cpu', 'limits');

        this.sortByRamUsage = (x: TODO) => getNodeUsagePercent(x, this.props.metrics, 'memory');
        this.sortByRamRequest = (x: TODO) => getNodeResourcePercent(x, this.props.pods, 'memory', 'requests');
        this.sortByRamLimit = (x: TODO) => getNodeResourcePercent(x, this.props.pods, 'memory', 'limits');
    }

    render() {
        const {items, metrics, pods, sort, filter} = this.props;

        return (
            <div className='contentPanel'>
                <table>
                    <thead>
                        <tr>
                            <MetadataHeaders sort={sort} />
                            <th className='optional_medium'>Labels</th>
                            <th className='optional_small'>
                                <Sorter field={getReadyStatus} sort={sort}>Ready</Sorter>
                            </th>
                            <th>
                                <Sorter field={this.sortByCpuUsage} sort={sort}>
                                    Cpu
                                    <div className='smallText'>Actual</div>
                                </Sorter>
                            </th>
                            <th className='optional_xsmall'>
                                <Sorter field={this.sortByCpuRequest} sort={sort}>
                                    Cpu
                                    <div className='smallText'>Requests</div>
                                </Sorter>
                            </th>
                            <th className='optional_xsmall'>
                                <Sorter field={this.sortByCpuLimit} sort={sort}>
                                    Cpu
                                    <div className='smallText'>Limits</div>
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
                                    <div className='smallText'>Requests</div>
                                </Sorter>
                            </th>
                            <th className='optional_xsmall'>
                                <Sorter field={this.sortByRamLimit} sort={sort}>
                                    Ram
                                    <div className='smallText'>Limits</div>
                                </Sorter>
                            </th>
                        </tr>
                    </thead>

                    <TableBody items={items} filter={filter} sort={sort} colSpan={11} row={(x: TODO) => (
                        <tr key={x.metadata.uid}>
                            <MetadataColumns item={x} href={`#!node/${x.metadata.name}`} />
                            <td className='smallText optional_medium'>{objectMap(x.metadata.labels)}</td>
                            <td className='optional_small center'>{statusSymbol(getReadyStatus(x))}</td>
                            <td>{getPercentDisplay(x, metrics, 'cpu')}</td>
                            <td className='optional_xsmall'>{getResourcePercentDisplay(x, pods, 'cpu', 'requests')}</td>
                            <td className='optional_xsmall'>{getResourcePercentDisplay(x, pods, 'cpu', 'limits')}</td>
                            <td>{getPercentDisplay(x, metrics, 'memory')}</td>
                            <td className='optional_xsmall'>{getResourcePercentDisplay(x, pods, 'memory', 'requests')}</td>
                            <td className='optional_xsmall'>{getResourcePercentDisplay(x, pods, 'memory', 'limits')}</td>
                        </tr>
                    )} />
                </table>
            </div>
        );
    }
}


/** Simple mapping between ready statuses and an UTF-8 symbol character */
const statusesToUtf8: {[key: string]: string} = {True: '\u2713', False: 'X', Unknown: '?'};

function statusSymbol(statusTxt?: string) {
    const cssClass = `node-ready-status-${statusTxt}`;
    const utf8Symbol = statusTxt && (statusesToUtf8[statusTxt] || statusesToUtf8.Unknown);
    return <span className={cssClass} title={statusTxt}>{utf8Symbol}</span>;
}


function getPercentDisplay(node: Node, metrics: TODO, resource: ResourceType) {
    const used = getNodeUsage(node, metrics, resource);
    return percent(node, used, resource);
}

function getResourcePercentDisplay(
    node: Node,
    pods: Pod[] | undefined,
    resource: ResourceType,
    type: string,
) {
    const used = getNodeResourceValue(node, pods, resource, type, ['Running']);
    return percent(node, used, resource);
}

function percent(node: Node, used: number | string | null, resource: ResourceType) {
    if (used == null) return <LoadingEllipsis />;
    if (!used) return <span className='smallText'>-</span>;

    const unparser: TODO = resource === 'cpu' ? unparseCpu : unparseRam;
    const result = unparser(used);

    const available = getNodeResourcesAvailable(node, resource);
    const displayPercent = available ? _.round(Number(used) / available * 100, 1) : 0;
    const className = displayPercent >= 85 ? 'contentPanel_warn' : undefined;

    return (
        <div className={className}>
            {displayPercent}<span className='smallText'>%</span>
            <div className='smallText'>{result.value}{result.unit}</div>
        </div>
    );
}
