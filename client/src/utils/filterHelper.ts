
export default function test(filter = '', ...values: string[]) {
    const value = filter.toLowerCase();
    return values
        .filter(x => !!x)
        .some(x => x.toLowerCase().includes(value));
}

export function filterByOwner(items: any[], owner: {[key: string]: any}) {
    if (!items || !owner) return null;

    const {uid} = owner.metadata;

    return items.filter((x) => {
        if (x.involvedObject && x.involvedObject.uid === uid) return true;

        const {ownerReferences} = x.metadata;
        return ownerReferences && ownerReferences.some((y: {uid: string}) => y.uid === uid);
    });
}

export function filterByOwners(items: any[] , owners: {[key: string]: any}) {
    if (!items || !owners) return null;

    const uids = owners.map((x: any) => x.metadata.uid);

    return items.filter((x) => {
        if (x.involvedObject && uids.includes(x.involvedObject.uid)) return true;

        const {ownerReferences} = x.metadata;
        return ownerReferences && ownerReferences.some((y: {uid: string}) => uids.includes(y.uid));
    });
}
