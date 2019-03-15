import React from 'react';
import LoadingSvg from '../art/loadingSvg';
import './loading.scss';

const Loading = ({text}) => (
    <div className='loading'>
        <LoadingSvg />
        <span className='loading_text'>{text != null ? text : 'Loading...'}</span>
    </div>
);

export default Loading;
