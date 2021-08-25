import './menu.scss';
import React from 'react';
import Base from './base';
import {getRootPath} from '../router';
import EditorModal from '../views/editorModal';
import api from '../services/api';
import {addHandler} from '../services/auth';
import ResourceSvg from '../art/resourceSvg';
import AddSvg from '../art/addSvg';
import {TODO} from '../utils/types';

interface MenuProps {
    onClick: () => void;
    toggled?: boolean;
}

interface MenuStates {
    rules: TODO[];
    showAdd: boolean;
}

interface MenuItemProps {
    path: string;
    title: string;
    resource: string;
    onClick: () => void;
    additionalPaths?: string[];
}

export default class Menu extends Base<MenuProps, MenuStates> {
    componentDidMount() {
        this.getRules();

        this.registerApi({
            status: addHandler(() => this.getRules()),
        });
    }

    async getRules() {
        const {status} = await api.getRules('default');
        this.setState({rules: status.resourceRules});
    }

    render() {
        const {onClick, toggled} = this.props;
        const {showAdd, rules} = this.state || {};

        return (
            <>
                <div className={toggled ? 'menu_background menu_backgroundToggled' : 'menu_background'} onClick={onClick} />

                <div id='menu' className={toggled ? 'menu_toggled' : undefined}>

                    {/* Cluster */}
                    <Group>
                        <MenuItem title='Cluster' path='' resource='Logo' onClick={onClick} />

                        {canView(rules, api.node) && (
                            <MenuItem title='Nodes' path='node' resource='Node' onClick={onClick} />
                        )}

                        {canView(rules, api.namespace) && (
                            <MenuItem title='Namespaces' path='namespace' resource='Namespace' onClick={onClick} />
                        )}
                    </Group>

                    {/* Workloads */}
                    <Group>
                        {canView(rules, api.deployment) && (
                            <MenuItem title='Workloads' path='workload' resource='Deployment' onClick={onClick} />
                        )}

                        {canView(rules, api.service) && (
                            <MenuItem title='Services' path='service' resource='Service' onClick={onClick} />
                        )}

                        {canView(rules, api.replicaSet) && (
                            <MenuItem title='Replicas' path='replicaset' resource='ReplicaSet' onClick={onClick} />
                        )}

                        {canView(rules, api.pod) && (
                            <MenuItem title='Pods' path='pod' resource='Pod' onClick={onClick} />
                        )}

                        {canView(rules, api.ingress) && (
                            <MenuItem title='Ingresses' path='ingress' resource='Ingress' onClick={onClick} />
                        )}

                        {canView(rules, api.configMap) && (
                            <MenuItem title='Config' path='configmap' resource='ConfigMap' onClick={onClick} />
                        )}
                    </Group>

                    {/* Storage */}
                    <Group>
                        {canView(rules, api.storageClass) && (
                            <MenuItem title='Storage' path='storageclass' resource='StorageClass' onClick={onClick} />
                        )}

                        {canView(rules, api.persistentVolume) && (
                            <MenuItem title='Volumes' path='persistentvolume' resource='PersistentVolume' onClick={onClick} />
                        )}

                        {canView(rules, api.persistentVolumeClaim) && (
                            <MenuItem title='Claims' path='persistentvolumeclaim' resource='PersistentVolumeClaim' onClick={onClick} />
                        )}
                    </Group>

                    {/* Security */}
                    <Group>
                        {canView(rules, api.serviceAccount) && (
                            <MenuItem title='Accounts' path='serviceaccount' resource='ServiceAccount' onClick={onClick} />
                        )}

                        {canView(rules, api.role, api.clusterRole) && (
                            <MenuItem title='Roles' path='role' resource='Role' additionalPaths={['clusterrole']} onClick={onClick} />
                        )}

                        {canView(rules, api.roleBinding, api.clusterRoleBinding) && (
                            <MenuItem title='Bindings' path='rolebinding' resource='Role' additionalPaths={['clusterrolebinding']} onClick={onClick} />
                        )}

                        {canView(rules, api.secret) && (
                            <MenuItem title='Secrets' path='secret' resource='Secret' onClick={onClick} />
                        )}
                    </Group>

                    <Group>
                        <MenuItem title='Profile' path='account' resource='User' onClick={onClick} />
                    </Group>

                    <Group>
                        <div className='menu_itemApply'>
                            <button className='menu_item button_clear' onClick={() => { this.setState({showAdd: true}); onClick(); }}>
                                <AddSvg />
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
            </>
        );
    }
}

function canView(resourcesRules: TODO[], ...args: TODO) {
    if (!resourcesRules) return false;

    return args.some((x: TODO) => canViewResource(resourcesRules, x.resource));
}

function canViewResource(resourcesRules: TODO[], {group, resource}: {group: TODO, resource: string}) {
    return resourcesRules.some((x) => {
        const hasVerb = (x.verbs.includes('list') || x.verbs.includes('*'));
        const hasGroup = (x.apiGroups.includes(group) || x.apiGroups.includes('*'));
        const hasResource = (x.resources.includes(resource)) || x.resources.includes('*');
        return hasVerb && hasGroup && hasResource;
    });
}

function MenuItem(props: MenuItemProps) {
    const currentPath = getRootPath();
    const paths = getPaths(props);
    const className = paths.includes(currentPath) ? 'menu_item menu_itemSelected' : 'menu_item';
    const {path, title, resource, onClick} = props;

    return (
        <a href={`#!${path}`} title={title} className={className} onClick={onClick}>
            <ResourceSvg resource={resource} />
            <span className='menu_title'>{title}</span>
        </a>
    );
}

function Group({children = []}: TODO) {
    if (!Array.isArray(children)) children = [children]; // eslint-disable-line no-param-reassign
    children = children.filter(Boolean); // eslint-disable-line no-param-reassign

    if (children.length === 0) return null;

    const paths = children.flatMap((x: TODO) => getPaths(x.props));

    const currentPath = getRootPath();
    const isSelected = paths.some((x: TODO) => x === currentPath);

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

function getPaths({path, additionalPaths = []}: MenuItemProps) {
    return [path, ...additionalPaths];
}
