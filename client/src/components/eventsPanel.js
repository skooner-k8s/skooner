import React from 'react';
import fromNow from '../utils/dates';
import {TableBody} from './listViewHelpers';
import log from '../utils/log';
import ResourceSvg from '../art/resourceSvg';
import Sorter, {sortByDate} from './sorter';

export default function EventsPanel({items, filter, shortList, sort}) {
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
                    row={x => (
                        <tr key={x.metadata.name}>
                            <td className='td_icon optional_medium'>
                                <ResourceSvg
                                    resource={x.involvedObject.kind}
                                    className={getTypeClass(x.type)}
                                />
                                <div className='td_iconLabel'>{x.involvedObject.kind}</div>
                            </td>
                            {!shortList && (
                                <td className='wrapped_name'>{getName(x.involvedObject)}</td>
                            )}
                            <td>{fromNow(x.metadata.creationTimestamp)}</td>
                            <td className='optional_small'>{x.reason}</td>
                            <td>{x.message}</td>
                        </tr>
                    )}
                />
            </table>
        </div>
    );
}

function getName({kind, namespace, name}) {
    const text = namespace ? `${namespace}:${name}` : name;
    const href = getHref(kind, namespace, name);
    return href ? (<a href={href}>{text}</a>) : text;
}

function getHref(kind, namespace, name) {
    switch (kind) {
        case 'ClusterRole': return `/#!clusterrole/${name}`;
        case 'ClusterRoleBinding': return `/#!clusterrolebinding/${name}`;
        case 'ConfigMap': return `/#!configmap/${namespace}/${name}`;
        case 'DaemonSet': return `/#!workload/daemonset/${namespace}/${name}`;
        case 'Deployment': return `/#!workload/deployment/${namespace}/${name}`;
        case 'Ingress': return `/#!ingress/${namespace}/${name}`;
        case 'Node': return `/#!node/${name}`;
        case 'PersistentVolume': return `/#!persistentvolume/${name}`;
        case 'PersistentVolumeClaim': return `/#!persistentvolumeclaim/${namespace}/${name}`;
        case 'Pod': return `/#!pod/${namespace}/${name}`;
        case 'ReplicaSet': return `/#!replicaset/${namespace}/${name}`;
        case 'Role': return `/#!role/${namespace}/${name}`;
        case 'RoleBinding': return `/#!rolebinding/${namespace}/${name}`;
        case 'Secret': return `/#!secret/${namespace}/${name}`;
        case 'Service': return `/#!service/${namespace}/${name}`;
        case 'ServiceAccount': return `/#!serviceaccount/${namespace}/${name}`;
        case 'StatefulSet': return `/#!workload/statefulset/${namespace}/${name}`;
        case 'StorageClass': return `/#!storageclass/${name}`;
        default: return undefined;
    }
}

function sortByName({involvedObject}) {
    return `${involvedObject.namespace}:${involvedObject.name}`;
}

function getTypeClass(type) {
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
