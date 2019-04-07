import './menu.scss';
import React from 'react';
import Base from './base';
import {getRootPath} from '../router';
import EditorModal from '../views/editorModal';
import api from '../services/api';
import ResourceSvg from '../art/resourceSvg';
import AddSvg from '../art/addSvg';

export default class Menu extends Base {
    render() {
        const {showAdd} = this.state || {};

        return (
            <div id='menu'>

                {/* Cluster */}
                <Group>
                    <MenuItem title='Cluster' path='' resource='Logo' />
                    <MenuItem title='Nodes' path='node' resource='Node' />
                    <MenuItem title='Namespaces' path='namespace' resource='Namespace' />
                </Group>

                {/* Workloads */}
                <Group>
                    <MenuItem title='Workloads' path='workload' resource='Deployment' />
                    <MenuItem title='Services' path='service' resource='Service' />
                    <MenuItem title='Replicas' path='replicaset' resource='ReplicaSet' />
                    <MenuItem title='Pods' path='pod' resource='Pod' />
                    <MenuItem title='Ingresses' path='ingress' resource='Ingress' />
                    <MenuItem title='Config' path='configmap' resource='ConfigMap' />
                </Group>

                {/* Storage */}
                <Group>
                    <MenuItem title='Storage' path='storageclass' resource='StorageClass' />
                    <MenuItem title='Volumes' path='persistentvolume' resource='PersistentVolume' />
                    <MenuItem title='Claims' path='persistentvolumeclaim' resource='PersistentVolumeClaim' />
                </Group>

                {/* Security */}
                <Group>
                    <MenuItem title='Accounts' path='serviceaccount' resource='ServiceAccount' />
                    <MenuItem title='Roles' path='role' resource='Role' additionalPaths={['clusterrole']} />
                    <MenuItem title='Bindings' path='rolebinding' resource='Role' additionalPaths={['clusterrolebinding']} />
                    <MenuItem title='Secrets' path='secret' resource='Secret' />
                </Group>

                <Group>
                    <MenuItem title='Profile' path='account' resource='User' />
                </Group>

                <Group>
                    <div className='menu_itemApply'>
                        <button className='menu_item button button_clear' onClick={() => this.setState({showAdd: true})}>
                            <AddSvg className='menu_icon' />
                            <div className='menu_title'>Apply</div>
                        </button>
                    </div>
                </Group>

                {showAdd && (
                    <EditorModal
                        onSave={x => api.apply(x)}
                        onRequestClose={() => this.setState({showAdd: false})}
                    />
                )}

            </div>
        );
    }
}

function MenuItem(item) {
    const currentPath = getRootPath();
    const paths = getPaths(item);
    const className = paths.includes(currentPath) ? 'menu_item menu_itemSelected' : 'menu_item';
    const {path, title, resource} = item;

    return (
        <a href={`#!${path}`} title={title} className={className}>
            <ResourceSvg className='menu_icon' resource={resource} />
            <span className='menu_title'>{title}</span>
        </a>
    );
}

function Group({children = []}) {
    if (!Array.isArray(children)) children = [children]; // eslint-disable-line no-param-reassign

    const paths = children.flatMap(x => getPaths(x.props));

    const currentPath = getRootPath();
    const isSelected = paths.some(x => x === currentPath);

    return (
        <div className='menu_group'>
            <div>
                {children[0]}
            </div>

            <div className={isSelected ? 'menu_subMenu menu_subMenuSelected' : 'menu_subMenu'}>
                {children.slice(1)}
            </div>
        </div>
    );
}

function getPaths({path, additionalPaths = []}) {
    return [path, ...additionalPaths];
}
