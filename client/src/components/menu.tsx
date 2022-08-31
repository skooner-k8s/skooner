import './menu.scss';
import React from 'react';
import Base from './base';
import {getRootPath} from '../router';
import ResourceSvg from '../art/resourceSvg';

interface MenuProps {
    onClick: () => void;
    toggled?: boolean;
}

interface MenuStates {
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
    }

    render() {
        const {onClick, toggled} = this.props;

        return (
            <>
                <div className={toggled ? 'menu_background menu_backgroundToggled' : 'menu_background'} onClick={onClick} />

                <div id='menu' className={toggled ? 'menu_toggled' : undefined}>

                <MenuItem title='Deployment' path='workload' resource='Deployment' onClick={onClick} />

                <MenuItem title='Pods' path='pod' resource='Pod' onClick={onClick} />

                <MenuItem title='Services' path='service' resource='Service' onClick={onClick} />

                <MenuItem title='Ingresses' path='ingress' resource='Ingress' onClick={onClick} />

                </div>
            </>
        );
    }
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

function getPaths({path, additionalPaths = []}: MenuItemProps) {
    return [path, ...additionalPaths];
}
