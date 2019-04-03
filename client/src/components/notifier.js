import './notifier.scss';
import _ from 'lodash';
import React from 'react';
import Base from './base';
import Button from './button';

const messages = [];
let singleton;

export function addUserNotification(message, isError) {
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

export function addUserConfirmation(message, callback) {
    const item = {
        id: Date.now(),
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

function pushNotification(item, autoRemove) {
    messages.push(item);
    singleton.setState({messages});

    if (!autoRemove) return;

    // remove the message after 15 seconds
    setTimeout(() => remove(item), 15000);
}

function remove(item) {
    _.pull(messages, item);
    singleton.setState({messages});
}

export class Notifier extends Base {
    constructor() {
        super();
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
