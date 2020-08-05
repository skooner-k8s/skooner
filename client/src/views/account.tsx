import React from 'react';
import Button from '../components/button';
import ItemHeader from '../components/itemHeader';
import {getUserInfo, logout} from '../services/auth';
import LogoutSvg from '../art/logoutSvg';

const Account = () => (
    <div id='content'>
        <ItemHeader title={['Account', 'Token']} ready={true}>
            <Button title='Logout' className='button_headerAction' onClick={logout}>
                <LogoutSvg />
                <span className='button_label'>Logout</span>
            </Button>
        </ItemHeader>


        <div className='contentPanel'>
            <h3>Current User</h3>
            <pre>{getJson()}</pre>
        </div>

        <div className='contentPanel'>
            <h3>Learn More</h3>
            <div>Follow K8dash on <a href='https://github.com/herbrandson/k8dash'>GitHub</a></div>
            <div>or at <a href='https://hub.docker.com/r/herbrandson/k8dash'>DockerHub</a></div>
        </div>

        <div className='contentPanel'>
            <h3>Special Thanks</h3>
            <div>Icons made by <a href='https://www.flaticon.com/authors/dave-gandy' title='Dave Gandy'>Dave Gandy</a></div>
            <div>from <a href='https://www.flaticon.com/' title='Flaticon'>www.flaticon.com</a></div>
            <div>licensed by <a href='http://creativecommons.org/licenses/by/3.0/' title='Creative Commons BY 3.0'>CC 3.0 BY</a></div>
        </div>
    </div>
);

function getJson() {
    const user = getUserInfo();
    return JSON.stringify(user, null, 4);
}

export default Account;
