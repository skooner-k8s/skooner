import Swagger from 'swagger-parser';
import apis from './api';
import {TODO} from '../utils/types';

let docsPromise: Promise<TODO>;

async function getDocs() {
    const docs = await apis.swagger();
    return Swagger.dereference(docs);
}

export default async function getDocDefinitions(apiVersion: string, kind: string) {
    if (!docsPromise) {
        docsPromise = getDocs(); // Don't wait here. Just kick off the request
    }

    const {definitions} = await docsPromise;

    let [group, version] = apiVersion.split('/');
    if (!version) {
        version = group;
        group = '';
    }

    return Object.values(definitions)
        .filter((x: TODO) => !!x['x-kubernetes-group-version-kind'])
        .find((x: TODO) => x['x-kubernetes-group-version-kind'].some(comparer));

    function comparer(info: TODO) {
        return info.group === group
            && info.version === version
            && info.kind === kind;
    }
}
