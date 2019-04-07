import './titleBar.scss';
import React from 'react';
import LogoSvg from '../art/logoSvg';

const TitleBar = () => (
    <div id='titleBar'>
        <a href='#!'>
            <LogoSvg className='titleBar_logo' />
        </a>

    </div>
);

export default TitleBar;
