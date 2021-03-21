const CONTEXT = 'context';

export type Context = {
    protoEnabled?: boolean;
    promethusEnabled?: boolean;
}

export function getContextItem(item: string) {
    return getItem(CONTEXT)[item];
}

export function setContext(context: Context) {
    setItem(CONTEXT, {
        protoEnabled: true,
        promethusEnabled: false,
        ...context,
    });
}

export function setItem(item: string, object: Object) {
    localStorage.setItem(item, JSON.stringify(object));
}

export function getItem(item: string) {
    return JSON.parse(localStorage.getItem(item) || '');
}
