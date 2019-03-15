import React from 'react';

const LoadingSvg = props => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" {...props}>
        <circle cx="50" cy="50" fill="none" strokeLinecap="round" r="40" strokeWidth="10" stroke="#326ce5" strokeDasharray="62.83185307 62.83185307" transform="rotate(28.717 50 50)">
            <animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;360 50 50" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"/>
        </circle>
        <circle cx="50" cy="50" fill="none" strokeLinecap="round" r="30" strokeWidth="10" stroke="#555" strokeDasharray="54.97787144 54.97787144" strokeDashoffset="54.97787144" transform="rotate(-28.717 50 50)">
            <animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;-360 50 50" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"/>
        </circle>
    </svg>
);

export default LoadingSvg;
