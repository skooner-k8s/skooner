import React from 'react';

const HamburgerSvg = (props: {[key: string]: any}) => (
    <svg version="1" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M4 10h24a2 2 0 0 0 0-4H4a2 2 0 0 0 0 4zm24 4H4a2 2 0 0 0 0 4h24a2 2 0 0 0 0-4zm0 8H4a2 2 0 0 0 0 4h24a2 2 0 0 0 0-4z"/>
    </svg>
);

export default HamburgerSvg;
