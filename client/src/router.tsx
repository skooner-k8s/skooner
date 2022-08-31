import React, {ReactNode} from 'react';
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
import NotFound from './views/notFound';
import Pod from './views/pod';
import Pods from './views/pods';
import Service from './views/service';
import ServiceAccounts from './views/serviceAccounts';
import Services from './views/services';
import StatefulSet from './views/statefulSet';
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
// @ts-ignore
registerRoute('ingress', () => <Ingresses />);
// @ts-ignore
registerRoute('ingress/:namespace/:name', params => <Ingress {...params} />);
registerRoute('namespace', () => <Namespaces />);
// @ts-ignore
registerRoute('namespace/:namespace', params => <Namespace {...params} />);
// @ts-ignore
registerRoute('pod', () => <Pods />);
// @ts-ignore
registerRoute('pod/:namespace/:name', params => <Pod {...params} />);
// @ts-ignore
registerRoute('pod/:namespace/:name/exec', params => <Exec {...params} />);
// @ts-ignore
registerRoute('pod/:namespace/:name/logs', params => <Logs {...params} />);
registerRoute('service', () => <Services />);
// @ts-ignore
registerRoute('service/:namespace/:name', params => <Service {...params} />);
registerRoute('serviceaccount', () => <ServiceAccounts />);
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
