import React from 'react';
import Button from '../components/button';
import ItemHeader from '../components/itemHeader';
import {getUserInfo, logout} from '../services/apiProxy';
import LogoutSvg from '../art/logoutSvg';

const Account = () => (
    <div id='content'>
        <ItemHeader title={['Account', 'Token']} item={{}}>
            <Button title='Logout' className='button button_clear' onClick={logout}>
                <LogoutSvg />
                <span className='button_label'>Logout</span>
            </Button>
        </ItemHeader>


        <div className='contentPanel'>
            <pre>{getJson()}</pre>
        </div>
    </div>
);

function getJson() {
    const user = getUserInfo();
    return JSON.stringify(user, null, 4);
}

export default Account;
