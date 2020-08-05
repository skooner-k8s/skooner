import './notifier.scss';
import _ from 'lodash';
import React from 'react';
import Base from './base';
import Button from './button';

type ActionButton = {
    name: string;
    className?: string;
    action: () => void;
}

type Notification = {
    id: number;
    isError: boolean;
    message: string;
    buttons: ActionButton[];
};

type State = {
    messages?: Notification[];
}

const messages: Notification[] = [];
let singleton: Notifier;

export function addUserNotification(message: string, isError = false) {
    const item = {
        id: Date.now(),
        isError,
        message,
        buttons: [
            {
                name: 'ok',
                action: () => remove(item),
            },
        ],
    };

    pushNotification(item, true);
}

export function addUserConfirmation(message: string, callback: (result: boolean) => void) {
    const item: Notification = {
        id: Date.now(),
        isError: false,
        message,
        buttons: [
            {
                name: 'Wait, No!',
                action: () => {
                    remove(item);
                    callback(false);
                },
            },
            {
                name: 'Yes Please',
                className: 'button_negative',
                action: () => {
                    remove(item);
                    callback(true);
                },
            },
        ],
    };

    pushNotification(item, false);
}

function pushNotification(item: Notification, autoRemove: boolean) {
    messages.push(item);
    singleton.setState({messages});

    if (!autoRemove) return;

    // remove the message after 15 seconds
    setTimeout(() => remove(item), 15000);
}

function remove(item: Notification) {
    _.pull(messages, item);
    singleton.setState({messages});
}

export class Notifier extends Base<{}, State> {
    constructor(props: any) {
        super(props);
        singleton = this;
    }

    render() {
        const {messages} = this.state || {}; // eslint-disable-line no-shadow
        if (!messages) return null;

        return (
            <div className='notifier'>
                {messages.map(x => (
                    <div key={x.id} className={x.isError ? 'notifier_error' : 'notifier_message'}>
                        <span className='notifier_body'>{x.message}</span>
                        {x.buttons.map(y => (
                            <Button key={y.name} className={`button ${y.className}`} onClick={y.action}>{y.name}</Button>
                        ))}
                    </div>
                ))}
            </div>
        );
    }
}
