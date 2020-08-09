import React from 'react';
import Base from './base';

interface ItemHeaderProps {
    title: string[];
    ready?: boolean;
}

export default class ItemHeader extends Base<ItemHeaderProps, {}> {
    render() {
        const {title, ready, children} = this.props;

        return (
            <div id='header' className={ready ? 'header_ready' : undefined}>
                <span className='header_label optional_xsmall'>
                    {title.join(' • ')}
                </span>

                <div className='header_fill' />

                {children}
            </div>
        );
    }
}
