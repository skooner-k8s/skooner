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

                    {/* Workloads */}
                    <Group>
                        <MenuItem title='Deployment' path='workload' resource='Deployment' onClick={onClick} />

                        <MenuItem title='Pods' path='pod' resource='Pod' onClick={onClick} />

                        <MenuItem title='Services' path='service' resource='Service' onClick={onClick} />

                        <MenuItem title='Ingresses' path='ingress' resource='Ingress' onClick={onClick} />
                    </Group>

                    <Group>
                        <MenuItem title='Profile' path='account' resource='User' onClick={onClick} />
                    </Group>
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
