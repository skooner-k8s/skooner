import React from 'react';
import Base from './base';

export default class ItemHeader extends Base {
    render() {
        const {title, item, children} = this.props;

        return (
            <div id='header'>
                <span className='header_label'>{title.join(' • ')}</span>
                <div className='header_fill'></div>

                {item && children}

            </div>
        );
    }
}
