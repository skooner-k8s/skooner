import _ from 'lodash';
import React from 'react';
import Base from './base';
import {MetadataHeaders, MetadataColumns, TableBody, objectMap} from './listViewHelpers';
import Sorter from './sorter';
import {parseCpu, parseRam} from '../utils/unitHelpers';

export default class NodesPanel extends Base {
    constructor(props) {
        super(props);
        this.sortByCpu = this.sortByCpu.bind(this);
        this.sortByRam = this.sortByRam.bind(this);
    }

    sortByCpu(item) {
        const used = getCpuUsed(item, this.props.metrics);
        if (used == null) return null;

        const available = getCpuAvailable(item);
        return used / available;
    }

    sortByRam(item) {
        const used = getRamUsed(item, this.props.metrics);
        if (used == null) return null;

        const available = getRamAvailable(item);
        return used / available;
    }

    render() {
        const {items, metrics, sort, filter} = this.props;

        return (
            <div className='contentPanel'>
                <table>
                    <thead>
                        <tr>
                            <MetadataHeaders sort={sort} />
                            <th>Labels</th>
                            <th><Sorter field={getReadyStatus} sort={sort}>Ready</Sorter></th>
                            <th><Sorter field={this.sortByCpu} sort={sort}>Cpu</Sorter></th>
                            <th><Sorter field={this.sortByRam} sort={sort}>Ram</Sorter></th>
                        </tr>
                    </thead>

                    <TableBody items={items} filter={filter} sort={sort} colSpan='8' row={x => (
                        <tr key={x.metadata.uid}>
                            <MetadataColumns item={x} href={`#!node/${x.metadata.name}`} />
                            <td>{objectMap(x.metadata.labels)}</td>
                            <td>{getReadyStatus(x)}</td>
                            <td><CpuPercent item={x} metrics={metrics} /></td>
                            <td><RamPercent item={x} metrics={metrics} /></td>
                        </tr>
                    )} />
                </table>
            </div>
        );
    }
}

function getReadyStatus({status}) {
    if (!status.conditions) return null;

    const ready = status.conditions.find(y => y.type === 'Ready');
    return ready && ready.status;
}

function CpuPercent({item, metrics}) {
    const used = getCpuUsed(item, metrics);
    if (used == null) return null;

    const available = getCpuAvailable(item);
    return <Percent used={used} available={available} />;
}

function getCpuUsed(item, metrics) {
    const usage = getUsage(item, metrics);
    if (!usage) return null;

    return parseCpu(usage.cpu) / 1000000;
}

function getCpuAvailable(item) {
    return parseCpu(item.status.capacity.cpu) / 1000000;
}

function RamPercent({item, metrics}) {
    const used = getRamUsed(item, metrics);
    if (used == null) return null;

    const available = getRamAvailable(item);
    return <Percent used={used} available={available} />;
}

function getRamUsed(item, metrics) {
    const usage = getUsage(item, metrics);
    if (!usage) return null;

    return parseRam(usage.memory);
}

function getRamAvailable(item) {
    return parseRam(item.status.capacity.memory);
}

function Percent({used, available}) {
    const percent = _.round(used / available * 100, 1);
    const className = percent >= 85 ? 'contentPanel_warn' : undefined;
    return (<span className={className}>{`${percent}%`}</span>);
}

function getUsage(item, metrics) {
    if (!item || !metrics) return null;
    const result = metrics[item.metadata.name] || {};
    return result && result.usage;
}
