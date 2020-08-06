import React from 'react';
import Donut from './donut';
import LoadingEllipsis from './loadingEllipsis';

export default function Chart() {
    return (
        <div className='charts_donut'>
            <Donut />
            <LoadingEllipsis />
        </div>
    );
}
