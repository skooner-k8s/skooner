import React from 'react';

const AddSvg = (props: {[key: string]: any}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 24 24" {...props}>
        <path d="M11.5 0C17.847 0 23 5.153 23 11.5S17.847 23 11.5 23 0 17.847 0 11.5 5.153 0 11.5 0zm0 1C17.295 1 22 5.705 22 11.5S17.295 22 11.5 22 1 17.295 1 11.5 5.705 1 11.5 1zm.5 10h6v1h-6v6h-1v-6H5v-1h6V5h1v6z"/>
    </svg>
);

export default AddSvg;
