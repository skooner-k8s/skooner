import React from 'react';
import Base from './base';

export default class ItemHeader extends Base {
    render() {
        const {title, ready, children} = this.props;

        return (
            <div id='header' className={ready ? 'header_ready' : undefined}>
                <span className='header_label'>{title.join(' • ')}</span>
                <div className='header_fill'></div>

                {children}
            </div>
        );
    }
}
