import './secretValue.scss';
import React from 'react';
import Base from './base';
import LockSvg from '../art/lockSvg';
import UnlockSvg from '../art/unlockSvg';
import Button from './button';

interface SecretValueProps {
    text: string
}

interface SecretValueStates {
    show: {}
}

export default class SecretValue extends Base<SecretValueProps, SecretValueStates> {
    toggle() {
        const {show = null} = this.state || {};
        this.setState({show: !show});
    }

    render() {
        const {text} = this.props;
        const {show = null} = this.state || {};

        return (
            <div className='secretValue'>
                <Button className='button_clear' onClick={() => this.toggle()}>
                    {show ? <UnlockSvg /> : <LockSvg />}
                </Button>

                <span className={show ? 'secretValue_text' : 'secretValue_textHidden'}>{text}</span>
            </div>
        );
    }
}
