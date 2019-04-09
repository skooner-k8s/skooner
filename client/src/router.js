import React from 'react';
import page from 'page';
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

const handlers = [];
let path = '';

registerRoute('/', () => <Dashboard />);
registerRoute('/account', () => <Account />);
registerRoute('/clusterrole/:name', params => <ClusterRole {...params} />);
registerRoute('/clusterrolebinding/:name', params => <ClusterRoleBinding {...params} />);
registerRoute('/configmap', () => <ConfigMaps />);
registerRoute('/configmap/:namespace/:name', params => <ConfigMap {...params} />);
registerRoute('/ingress', () => <Ingresses />);
registerRoute('/ingress/:namespace/:name', params => <Ingress {...params} />);
registerRoute('/namespace', () => <Namespaces />);
registerRoute('/namespace/:namespace', params => <Namespace {...params} />);
registerRoute('/node', () => <Nodes />);
registerRoute('/node/:name', params => <Node {...params} />);
registerRoute('/persistentvolume', () => <PersistentVolumes />);
registerRoute('/persistentvolume/:name', params => <PersistentVolume {...params} />);
registerRoute('/persistentvolumeclaim', () => <PersistentVolumeClaims />);
registerRoute('/persistentvolumeclaim/:namespace/:name', params => <PersistentVolumeClaim {...params} />);
registerRoute('/pod', () => <Pods />);
registerRoute('/pod/:namespace/:name', params => <Pod {...params} />);
registerRoute('/pod/:namespace/:name/exec', params => <Exec {...params} />);
registerRoute('/pod/:namespace/:name/logs', params => <Logs {...params} />);
registerRoute('/replicaset', () => <ReplicaSets />);
registerRoute('/replicaset/:namespace/:name', params => <ReplicaSet {...params} />);
registerRoute('/role', () => <Roles />);
registerRoute('/role/:namespace/:name', params => <Role {...params} />);
registerRoute('/rolebinding', () => <RoleBindings />);
registerRoute('/rolebinding/:namespace/:name', params => <RoleBinding {...params} />);
registerRoute('/secret', () => <Secrets />);
registerRoute('/secret/:namespace/:name', params => <Secret {...params} />);
registerRoute('/service', () => <Services />);
registerRoute('/service/:namespace/:name', params => <Service {...params} />);
registerRoute('/serviceaccount', () => <ServiceAccounts />);
registerRoute('/serviceaccount/:namespace/:name', params => <ServiceAccount {...params} />);
registerRoute('/storageclass', () => <StorageClasses />);
registerRoute('/storageclass/:name', params => <StorageClass {...params} />);
registerRoute('/workload', () => <Workloads />);
registerRoute('/workload/cronjob/:namespace/:name', params => <CronJob {...params} />);
registerRoute('/workload/daemonset/:namespace/:name', params => <DaemonSet {...params} />);
registerRoute('/workload/deployment/:namespace/:name', params => <Deployment {...params} />);
registerRoute('/workload/job/:namespace/:name', params => <Job {...params} />);
registerRoute('/workload/statefulset/:namespace/:name', params => <StatefulSet {...params} />);
registerRoute('*', () => <NotFound />);

export function initRouter() {
    page({hashbang: true});
    const {hash} = window.location;
    if (hash && hash.startsWith('#!') && !hash.startsWith('#!/')) {
        const fixedHash = hash.replace('#!', '/');
        page(fixedHash);
    }
}

export function registerHandler(handler) {
    handlers.push(handler);
}

export function getRootPath() {
    return path;
}

function registerRoute(route, factory) {
    page(route, (context) => {
        const [current] = context.path.split('/').filter(x => !!x);
        path = current || '';

        if (!hasToken()) {
            onRoute(<Auth />);
        } else {
            const result = factory(context.params);
            onRoute(result);
        }
    });
}

function onRoute(value) {
    handlers.forEach(x => x(value));
}
