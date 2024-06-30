import './footer.scss';
import React from 'react';

export default function Footer() {
    if (process.env.REACT_APP_FOOTER) {
        document.body.style.setProperty('--footer-height', '17px');
        return <div id='footer'>{process.env.REACT_APP_FOOTER}</div>;
    }
    return null;
}
