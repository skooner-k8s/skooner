import React from 'react';
import fromNow from '../utils/dates';
import {TableBody} from './listViewHelpers';
import log from '../utils/log';
import ResourceSvg from '../art/resourceSvg';
import Sorter, {sortByDate, SortInfo} from './sorter';
import {K8sEvent, InvolvedObject} from '../utils/types';

type EventsPanelProps = {
    items?: K8sEvent[];
    filter?: React.ReactNode;
    shortList?: boolean;
    sort?: SortInfo;
}

export default function EventsPanel({items, filter, shortList, sort} : EventsPanelProps) {
    return (
        <div className='contentPanel'>
            <table className='wrapped'>
                <thead>
                    <tr>
                        <th className='th_icon optional_medium'>
                            <Sorter field='involvedObject.kind' sort={sort}>Type</Sorter>
                        </th>
                        {!shortList && (
                            <th>
                                <Sorter field={sortByName} sort={sort}>Name</Sorter>
                            </th>
                        )}
                        <th>
                            <Sorter field={sortByDate} sort={sort}>Time</Sorter>
                        </th>
                        <th className='optional_small'>
                            <Sorter field='reason' sort={sort}>Reason</Sorter>
                        </th>
                        <th>
                            <Sorter field='message' sort={sort}>Event</Sorter>
                        </th>
                    </tr>
                </thead>

                <TableBody
                    items={items}
                    filter={filter}
                    colSpan={shortList ? 4 : 5}
                    sort={sort}
                    row={event => (
                        <tr key={event.metadata.name}>
                            <td className='td_icon optional_medium'>
                                <ResourceSvg
                                    resource={event.involvedObject!.kind}
                                    className={getTypeClass(event.type)}
                                />
                                <div className='td_iconLabel'>{event.involvedObject!.kind}</div>
                            </td>
                            {!shortList && (
                                <td className='wrapped_name'>{getName(event.involvedObject!)}</td>
                            )}
                            <td>{fromNow(event.metadata.creationTimestamp)}</td>
                            <td className='optional_small'>{event.reason}</td>
                            <td>{event.message}</td>
                        </tr>
                    )}
                />
            </table>
        </div>
    );
}


function getName({kind, namespace, name} : InvolvedObject) {
    const text = namespace ? `${namespace}:${name}` : name;
    const href = getHref(kind, namespace, name);
    return href ? (<a href={href}>{text}</a>) : text;
}

function getHref(kind: string, namespace: string, name: string) {
    switch (kind) {
        case 'ClusterRole': return `#!clusterrole/${name}`;
        case 'ClusterRoleBinding': return `#!clusterrolebinding/${name}`;
        case 'ConfigMap': return `#!configmap/${namespace}/${name}`;
        case 'DaemonSet': return `#!workload/daemonset/${namespace}/${name}`;
        case 'Deployment': return `#!workload/deployment/${namespace}/${name}`;
        case 'Ingress': return `#!ingress/${namespace}/${name}`;
        case 'Node': return `#!node/${name}`;
        case 'PersistentVolume': return `#!persistentvolume/${name}`;
        case 'PersistentVolumeClaim': return `#!persistentvolumeclaim/${namespace}/${name}`;
        case 'Pod': return `#!pod/${namespace}/${name}`;
        case 'ReplicaSet': return `#!replicaset/${namespace}/${name}`;
        case 'Role': return `#!role/${namespace}/${name}`;
        case 'RoleBinding': return `#!rolebinding/${namespace}/${name}`;
        case 'Secret': return `#!secret/${namespace}/${name}`;
        case 'Service': return `#!service/${namespace}/${name}`;
        case 'ServiceAccount': return `#!serviceaccount/${namespace}/${name}`;
        case 'StatefulSet': return `#!workload/statefulset/${namespace}/${name}`;
        case 'StorageClass': return `#!storageclass/${name}`;
        default: return undefined;
    }
}

function sortByName(event: K8sEvent) {
    return `${event.involvedObject!.namespace}:${event.involvedObject!.name}`;
}

function getTypeClass(type: string) {
    switch (type) {
        case 'Normal': return undefined;
        case 'Warning': return 'svg_warn';
        case 'Error': return 'svg_error';

        default: {
            const error = new Error('Unexpected event type');
            log.error('Unexpected event type', {error, type});
            return 'svg_neutral';
        }
    }
}
