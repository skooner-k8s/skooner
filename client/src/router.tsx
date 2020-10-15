import React, {ReactNode} from 'react';
import {hasToken} from './services/auth';
import Account from './views/account';
import Auth from './views/auth';
import ClusterRole from './views/clusterRole';
import ClusterRoleBinding from './views/clusterRoleBinding';
import ConfigMap from './views/configMap';
import ConfigMaps from './views/configMaps';
import CronJob from './views/cronJob';
import DaemonSet from './views/daemonSet';
import Dashboard from './views/dashboard';
import Deployment from './views/deployment';
import Exec from './views/exec';
import Ingress from './views/ingress';
import Ingresses from './views/ingresses';
import Job from './views/job';
import Logs from './views/logs';
import Namespace from './views/namespace';
import Namespaces from './views/namespaces';
import Node from './views/node';
import Nodes from './views/nodes';
import NotFound from './views/notFound';
import PersistentVolume from './views/persistentVolume';
import PersistentVolumeClaim from './views/persistentVolumeClaim';
import PersistentVolumeClaims from './views/persistentVolumeClaims';
import PersistentVolumes from './views/persistentVolumes';
import Pod from './views/pod';
import Pods from './views/pods';
import ReplicaSet from './views/replicaSet';
import ReplicaSets from './views/replicaSets';
import Role from './views/role';
import RoleBinding from './views/roleBinding';
import RoleBindings from './views/roleBindings';
import Roles from './views/roles';
import Secret from './views/secret';
import Secrets from './views/secrets';
import Service from './views/service';
import ServiceAccount from './views/serviceAccount';
import ServiceAccounts from './views/serviceAccounts';
import Services from './views/services';
import StatefulSet from './views/statefulSet';
import StorageClass from './views/storageClass';
import StorageClasses from './views/storageClasses';
import Workloads from './views/workloads';

type Params = {[name: string]: any};
type Callback = (params?: Params) => ReactNode;
type Handler = (content: ReactNode) => void;

type Route = {
    routeParts: string[];
    factory: Callback;
}

const routes: Route[] = [];
let handler: Handler;

registerRoute('', () => <Dashboard />);
registerRoute('account', () => <Account />);
// @ts-ignore
registerRoute('clusterrole/:name', params => <ClusterRole {...params} />);
// @ts-ignore
registerRoute('clusterrolebinding/:name', params => <ClusterRoleBinding {...params} />);
registerRoute('configmap', () => <ConfigMaps />);
// @ts-ignore
registerRoute('configmap/:namespace/:name', params => <ConfigMap {...params} />);
registerRoute('ingress', () => <Ingresses />);
// @ts-ignore
registerRoute('ingress/:namespace/:name', params => <Ingress {...params} />);
registerRoute('namespace', () => <Namespaces />);
// @ts-ignore
registerRoute('namespace/:namespace', params => <Namespace {...params} />);
registerRoute('node', () => <Nodes />);
// @ts-ignore
registerRoute('node/:name', params => <Node {...params} />);
registerRoute('persistentvolume', () => <PersistentVolumes />);
// @ts-ignore
registerRoute('persistentvolume/:name', params => <PersistentVolume {...params} />);
registerRoute('persistentvolumeclaim', () => <PersistentVolumeClaims />);
// @ts-ignore
registerRoute('persistentvolumeclaim/:namespace/:name', params => <PersistentVolumeClaim {...params} />);
registerRoute('pod', () => <Pods />);
// @ts-ignore
registerRoute('pod/:namespace/:name', params => <Pod {...params} />);
// @ts-ignore
registerRoute('pod/:namespace/:name/exec', params => <Exec {...params} />);
// @ts-ignore
registerRoute('pod/:namespace/:name/logs', params => <Logs {...params} />);
registerRoute('replicaset', () => <ReplicaSets />);
// @ts-ignore
registerRoute('replicaset/:namespace/:name', params => <ReplicaSet {...params} />);
registerRoute('role', () => <Roles />);
// @ts-ignore
registerRoute('role/:namespace/:name', params => <Role {...params} />);
registerRoute('rolebinding', () => <RoleBindings />);
// @ts-ignore
registerRoute('rolebinding/:namespace/:name', params => <RoleBinding {...params} />);
registerRoute('secret', () => <Secrets />);
// @ts-ignore
registerRoute('secret/:namespace/:name', params => <Secret {...params} />);
registerRoute('service', () => <Services />);
// @ts-ignore
registerRoute('service/:namespace/:name', params => <Service {...params} />);
registerRoute('serviceaccount', () => <ServiceAccounts />);
// @ts-ignore
registerRoute('serviceaccount/:namespace/:name', params => <ServiceAccount {...params} />);
registerRoute('storageclass', () => <StorageClasses />);
// @ts-ignore
registerRoute('storageclass/:name', params => <StorageClass {...params} />);
registerRoute('workload', () => <Workloads />);
// @ts-ignore
registerRoute('workload/cronjob/:namespace/:name', params => <CronJob {...params} />);
// @ts-ignore
registerRoute('workload/daemonset/:namespace/:name', params => <DaemonSet {...params} />);
// @ts-ignore
registerRoute('workload/deployment/:namespace/:name', params => <Deployment {...params} />);
// @ts-ignore
registerRoute('workload/job/:namespace/:name', params => <Job {...params} />);
// @ts-ignore
registerRoute('workload/statefulset/:namespace/:name', params => <StatefulSet {...params} />);

window.addEventListener('hashchange', onNavigate);

export function initRouter(cb: Handler) {
    handler = cb;
    onNavigate();
}

export function getRootPath() {
    return getPathParts()[0];
}

function getPathParts() {
    return window.location.hash.replace('#!', '').split('/');
}

function registerRoute(route: string, factory: Callback) {
    const routeParts = route.split('/');
    routes.push({routeParts, factory});
}

function onNavigate() {
    const content = getContent();
    handler(content);
}

function getContent() {
    if (!hasToken()) return <Auth />;

    const pathParts = getPathParts();
    for (const {routeParts, factory} of routes) {
        const {isMatch, params} = testRoute(pathParts, routeParts);
        if (isMatch) return factory(params);
    }

    return <NotFound />;
}

function testRoute(pathParts: string[], routeParts: string[]) {
    if (pathParts.length !== routeParts.length) return {isMatch: false};

    const params: {[name: string]: string} = {};

    for (let i = 0; i < pathParts.length; i++) {
        const pathPart = pathParts[i];
        const routePart = routeParts[i];

        if (routePart.startsWith(':')) {
            const paramName = routePart.replace(':', '');
            params[paramName] = pathPart;
        } else if (pathPart !== routePart) {
            return {isMatch: false};
        }
    }

    return {isMatch: true, params};
}
