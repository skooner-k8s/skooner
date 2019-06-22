import React from 'react';
import Base from './base';
import log from '../utils/log';
import {addUserNotification} from './notifier';
import './button.scss';

export default class Button extends Base {
    async click() {
        this.setState({working: true});

        try {
            await this.props.onClick();
        } catch (err) {
            log.error({err}, 'Error in button handler');
            addUserNotification(err.message, true);
        }

        this.setState({working: false});
    }

    render() {
        const {working} = this.state || {};
        const {children, disabled, className, title} = this.props;

        return (
            <button
                className={className}
                title={title}
                disabled={working || disabled}
                onClick={() => this.click()}
            >
                {children}
            </button>
        );
    }
}
