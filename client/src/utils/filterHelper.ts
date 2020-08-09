import {ApiItem} from './types';

export default function test(filter = '', ...values: string[]) {
    const value = filter.toLowerCase();
    return values
        .filter(x => !!x)
        .some(x => x.toLowerCase().includes(value));
}

export function filterByOwner<T extends ApiItem<any, any>>(items?: T[], owner?: ApiItem<any, any>): T[] | undefined {
    if (!items || !owner) return undefined;

    const {uid} = owner.metadata;

    return items.filter((x) => {
        if (x.involvedObject && x.involvedObject.uid === uid) return true;

        const {ownerReferences} = x.metadata;
        return ownerReferences && ownerReferences.some((y: {uid: string}) => y.uid === uid);
    });
}

export function filterByOwners<T extends ApiItem<any, any>>(items?: T[], owners?: ApiItem<any, any>[]): T[] | undefined {
    if (!items || !owners) return undefined;

    const uidList = owners.map(x => x.metadata.uid);

    return items.filter((x) => {
        if (x.involvedObject && uidList.includes(x.involvedObject.uid)) return true;

        const {ownerReferences} = x.metadata;
        return ownerReferences && ownerReferences.some((y: {uid: string}) => uidList.includes(y.uid));
    });
}
