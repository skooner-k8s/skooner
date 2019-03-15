
export default function test(filter = '', ...values) {
    const lowerCaseFilter = filter.toLowerCase();
    return values.some(x => (x || '').toLowerCase().includes(lowerCaseFilter));
}

export function filterByOwner(items, owner) {
    if (!items || !owner) return null;

    const {uid} = owner.metadata;

    return items.filter((x) => {
        if (x.involvedObject && x.involvedObject.uid === uid) return true;

        const {ownerReferences} = x.metadata;
        return ownerReferences && ownerReferences.some(y => y.uid === uid);
    });
}

export function filterByOwners(items, owners) {
    if (!items || !owners) return null;

    const uids = owners.map(x => x.metadata.uid);

    return items.filter((x) => {
        if (x.involvedObject && uids.includes(x.involvedObject.uid)) return true;

        const {ownerReferences} = x.metadata;
        return ownerReferences && ownerReferences.some(y => uids.includes(y.uid));
    });
}