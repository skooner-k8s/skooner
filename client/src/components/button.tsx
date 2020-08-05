import React from 'react';
import Base from './base';
import log from '../utils/log';
import {addUserNotification} from './notifier';
import './button.scss';

type Props = {
    disabled?: boolean;
    className: string;
    title?: string;
    children: React.ReactNode;
    onClick: () => void;
};

type State = {
    working: boolean;
};

export default class Button extends Base<Props, State> {
    async click() {
        this.setState({working: true});

        try {
            await this.props.onClick();
        } catch (err) {
            log.error('Error in button handler', {err});
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
