import './secretValue.scss';
import React from 'react';
import Base from './base';
import LockSvg from '../art/lockSvg';
import UnlockSvg from '../art/unlockSvg';
import Button from './button';

export default class SecretValue extends Base {
    toggle() {
        const {show} = this.state || {};
        this.setState({show: !show});
    }

    render() {
        const {text} = this.props;
        const {show} = this.state || {};

        return (
            <div className='secretValue'>
                <Button className='button button_clear' onClick={() => this.toggle()}>
                    {show ? <UnlockSvg /> : <LockSvg />}
                </Button>

                {show && (
                    <span className='secretValue_text'>{text}</span>
                )}
            </div>
        );
    }
}
