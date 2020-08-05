/**
 * @param {*status* object with a status field  (most likely the row from the TableBody)}
 * @returns the status text, as defined in https://kubernetes.io/docs/concepts/architecture/nodes/#condition
 */
function getReadyStatus({status}: {status: {[key: string]: any}}) {
    if (!status.conditions) return null;
    const ready = status.conditions.find((y: any) => y.type === 'Ready');
    return ready && ready.status;
}

export default getReadyStatus;
