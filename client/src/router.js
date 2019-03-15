import React from 'react';
import {Router} from 'director/build/director';
import {hasToken} from './services/apiProxy';
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

const handlers = [];
const router = Router().configure({notfound: onNotFound});

registerRoute('/', () => <Dashboard />);
registerRoute('/account', () => <Account />);
registerRoute('/clusterrole/:name', name => <ClusterRole name={name} />);
registerRoute('/clusterrolebinding/:name', name => <ClusterRoleBinding name={name} />);
registerRoute('/configmap', () => <ConfigMaps />);
registerRoute('/configmap/:namespace/:name', (namespace, name) => <ConfigMap namespace={namespace} name={name} />);
registerRoute('/ingress', () => <Ingresses />);
registerRoute('/ingress/:namespace/:name', (namespace, name) => <Ingress namespace={namespace} name={name} />);
registerRoute('/namespace', () => <Namespaces />);
registerRoute('/namespace/:namespace', namespace => <Namespace namespace={namespace} />);
registerRoute('/node', () => <Nodes />);
registerRoute('/node/:name', name => <Node name={name} />);
registerRoute('/persistentvolume', () => <PersistentVolumes />);
registerRoute('/persistentvolume/:name', name => <PersistentVolume name={name} />);
registerRoute('/persistentvolumeclaim', () => <PersistentVolumeClaims />);
registerRoute('/persistentvolumeclaim/:namespace/:name', (namespace, name) => <PersistentVolumeClaim namespace={namespace} name={name} />);
registerRoute('/pod', () => <Pods />);
registerRoute('/pod/:namespace/:name', (namespace, name) => <Pod namespace={namespace} name={name} />);
registerRoute('/pod/:namespace/:name/logs', (namespace, name) => <Logs namespace={namespace} name={name} />);
registerRoute('/replicaset', () => <ReplicaSets />);
registerRoute('/replicaset/:namespace/:name', (namespace, name) => <ReplicaSet namespace={namespace} name={name} />);
registerRoute('/role', () => <Roles />);
registerRoute('/role/:namespace/:name', (namespace, name) => <Role namespace={namespace} name={name} />);
registerRoute('/rolebinding', () => <RoleBindings />);
registerRoute('/rolebinding/:namespace/:name', (namespace, name) => <RoleBinding namespace={namespace} name={name} />);
registerRoute('/secret', () => <Secrets />);
registerRoute('/secret/:namespace/:name', (namespace, name) => <Secret namespace={namespace} name={name} />);
registerRoute('/service', () => <Services />);
registerRoute('/service/:namespace/:name', (namespace, name) => <Service namespace={namespace} name={name} />);
registerRoute('/serviceaccount', () => <ServiceAccounts />);
registerRoute('/serviceaccount/:namespace/:name', (namespace, name) => <ServiceAccount namespace={namespace} name={name} />);
registerRoute('/storageclass', () => <StorageClasses />);
registerRoute('/storageclass/:name', name => <StorageClass name={name} />);
registerRoute('/workload', () => <Workloads />);
registerRoute('/workload/cronjob/:namespace/:name', (namespace, name) => <CronJob namespace={namespace} name={name} />);
registerRoute('/workload/daemonset/:namespace/:name', (namespace, name) => <DaemonSet namespace={namespace} name={name} />);
registerRoute('/workload/deployment/:namespace/:name', (namespace, name) => <Deployment namespace={namespace} name={name} />);
registerRoute('/workload/job/:namespace/:name', (namespace, name) => <Job namespace={namespace} name={name} />);
registerRoute('/workload/statefulset/:namespace/:name', (namespace, name) => <StatefulSet namespace={namespace} name={name} />);

export function initRouter() {
    router.init(['/']);
}

export function registerHandler(handler) {
    handlers.push(handler);
}

export function getRootPath() {
    return router.getRoute()[0];
}

export function goTo(name) {
    window.location = `#/${name}`;
}

function registerRoute(route, factory) {
    router.on(route, (...args) => {
        if (!hasToken()) {
            onRoute(<Auth />);
        } else {
            const result = factory(...args);
            onRoute(result);
        }
    });
}

function onRoute(value) {
    handlers.forEach(x => x(value));
}

function onNotFound() {
    onRoute(<NotFound />);
}
