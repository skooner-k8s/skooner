import React from 'react';
import Donut from './donut';
import LoadingEllipsis from './loadingEllipsis';

export default function Chart() {
    return (
        <div className='charts_donut'>
            <Donut percent={0} percent2={0} />
            <LoadingEllipsis />
        </div>
    );
}
