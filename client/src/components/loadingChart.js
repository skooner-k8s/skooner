import React from 'react';
import ChartistGraph from 'react-chartist';

const options = {
    donut: true,
    donutWidth: 25,
    donutSolid: true,
    startAngle: 0,
    showLabel: false,
};

export default function Chart() {
    return (
        <div className='charts_donut'>
            <ChartistGraph data={{series: [0, 0, 1]}} options={options} type='Pie' />
            <span className='chart_donutLabel'>
                ...
            </span>
        </div>
    );
}
