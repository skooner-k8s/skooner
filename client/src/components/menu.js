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
        const {onClick, toggled} = this.props;
        const {showAdd} = this.state || {};

        return (
            <div id='menu' className={toggled ? 'menu_toggled' : undefined}>

                {/* Cluster */}
                <Group>
                    <MenuItem title='Cluster' path='' resource='Logo' onClick={onClick} />
                    <MenuItem title='Nodes' path='node' resource='Node' onClick={onClick} />
                    <MenuItem title='Namespaces' path='namespace' resource='Namespace' onClick={onClick} />
                </Group>

                {/* Workloads */}
                <Group>
                    <MenuItem title='Workloads' path='workload' resource='Deployment' onClick={onClick} />
                    <MenuItem title='Services' path='service' resource='Service' onClick={onClick} />
                    <MenuItem title='Replicas' path='replicaset' resource='ReplicaSet' onClick={onClick} />
                    <MenuItem title='Pods' path='pod' resource='Pod' onClick={onClick} />
                    <MenuItem title='Ingresses' path='ingress' resource='Ingress' onClick={onClick} />
                    <MenuItem title='Config' path='configmap' resource='ConfigMap' onClick={onClick} />
                </Group>

                {/* Storage */}
                <Group>
                    <MenuItem title='Storage' path='storageclass' resource='StorageClass' onClick={onClick} />
                    <MenuItem title='Volumes' path='persistentvolume' resource='PersistentVolume' onClick={onClick} />
                    <MenuItem title='Claims' path='persistentvolumeclaim' resource='PersistentVolumeClaim' onClick={onClick} />
                </Group>

                {/* Security */}
                <Group>
                    <MenuItem title='Accounts' path='serviceaccount' resource='ServiceAccount' onClick={onClick} />
                    <MenuItem title='Roles' path='role' resource='Role' additionalPaths={['clusterrole']} onClick={onClick} />
                    <MenuItem title='Bindings' path='rolebinding' resource='Role' additionalPaths={['clusterrolebinding']} onClick={onClick} />
                    <MenuItem title='Secrets' path='secret' resource='Secret' onClick={onClick} />
                </Group>

                <Group>
                    <MenuItem title='Profile' path='account' resource='User' onClick={onClick} />
                </Group>

                <Group>
                    <div className='menu_itemApply'>
                        <button className='menu_item button_clear' onClick={() => { this.setState({showAdd: true}); onClick(); }}>
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
    const {path, title, resource, onClick} = item;

    return (
        <a href={`#!${path}`} title={title} className={className} onClick={onClick}>
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
