import React from 'react';

const NamespaceSvg = (props: {[key: string]: any}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.04 17.5" {...props}>
        <path d="M8.96.46a1.14 1.13 0 0 0-.44.11L2.58 3.41a1.14 1.13 0 0 0-.61.77L.5 10.55a1.14 1.13 0 0 0 .16.86 1.14 1.13 0 0 0 .06.1l4.11 5.1a1.14 1.13 0 0 0 .9.43h6.58a1.14 1.13 0 0 0 .9-.43l4.1-5.1a1.14 1.13 0 0 0 .22-.96l-1.47-6.38a1.14 1.13 0 0 0-.61-.76L9.5.57a1.14 1.13 0 0 0-.55-.1z"/>
        <path d="M8.96 0a1.2 1.19 0 0 0-.46.12l-6.27 3a1.2 1.19 0 0 0-.65.8L.03 10.65a1.2 1.19 0 0 0 .16.91 1.2 1.19 0 0 0 .07.1l4.34 5.4a1.2 1.19 0 0 0 .94.44h6.96a1.2 1.19 0 0 0 .94-.45l4.33-5.4a1.2 1.19 0 0 0 .24-1l-1.55-6.73a1.2 1.19 0 0 0-.65-.8l-6.27-3A1.2 1.19 0 0 0 8.96 0zm0 .46a1.14 1.13 0 0 1 .55.11l5.94 2.84a1.14 1.13 0 0 1 .61.76l1.47 6.38a1.14 1.13 0 0 1-.22.95l-4.1 5.11a1.14 1.13 0 0 1-.9.43H5.72a1.14 1.13 0 0 1-.89-.42L.73 11.5a1.14 1.13 0 0 1-.07-.09 1.14 1.13 0 0 1-.16-.86l1.47-6.37a1.14 1.13 0 0 1 .61-.77L8.52.57a1.14 1.13 0 0 1 .44-.1z"
            color="#000" fontWeight="400" fontFamily="Sans" overflow="visible" fill="#fff"/>
        <text y="16.81" x="9.97"
            fontWeight="400" fontSize="10.58" fontFamily="Sans" letterSpacing="0" wordSpacing="0" fill="#fff" strokeWidth=".26" transform="translate(-1 -1.17)">
            <tspan
                y="16.81" x="9.97" fontSize="2.82" fontFamily="Arial" textAnchor="middle">ns</tspan>
        </text>
        <path fill="none" stroke="#fff" strokeWidth=".4" strokeLinejoin="round" strokeMiterlimit="10" strokeDasharray=".8 .4" strokeDashoffset="3.44" d="M5.18 5.2h7.67v6.69H5.18z"/>
    </svg>
);

export default NamespaceSvg;
