import React from 'react';
import LoadingSvg from '../art/loadingSvg';
import './loading.scss';

const Loading = ({text}: { text?: string | null }) => (
    <div className='loading'>
        <LoadingSvg className='loading_svg' />
        <span className='loading_text'>{text != null ? text : 'Loading...'}</span>
    </div>
);

export default Loading;
