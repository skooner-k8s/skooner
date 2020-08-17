import './auth.scss';
import React from 'react';
import {addUserNotification} from '../components/notifier';
import {setToken, deleteToken} from '../services/auth';
import api from '../services/api';
import Base from '../components/base';
import Button from '../components/button';
import Loading from '../components/loading';
import log from '../utils/log';
import LogoSvg from '../art/logoSvg';

type State = {
    token: string;
    useTokenLogin?: boolean;
}

const LOGIN_MESSAGE = 'Invalid credentials';
const ERROR_MESSAGE = 'Error occurred attempting to login';

export default class Auth extends Base<{}, State> {
    state: State = {
        token: '',
    };

    async componentDidMount() {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');

        if (code && state) {
            this.oidcLogin(code, state);
            return;
        }

        const {authEndpoint} = await api.oidc.get();
        if (authEndpoint) {
            redirectToOidc(authEndpoint);
            return;
        }

        this.setState({useTokenLogin: true});
    }

    render() {
        const {token, useTokenLogin} = this.state || {};

        return (
            <div className='auth'>
                {!useTokenLogin ? <Loading /> : (
                    <>
                        <LogoSvg className='optional_small' />
                        <input
                            type='password'
                            name='password'
                            className='auth_input'
                            autoComplete='current-password'
                            placeholder='Enter your auth token here...'
                            spellCheck='false'
                            value={token}
                            onChange={x => this.setState({token: x.target.value})}
                        />
                        <Button disabled={!token} className='button auth_button' onClick={() => login(token)}>
                            Go
                        </Button>
                    </>
                )}
            </div>
        );
    }

    async oidcLogin(code: string, returnedState: string) {
        const {state, redirectUri} = JSON.parse(sessionStorage.oidc) || {};
        delete sessionStorage.oidc;

        window.history.replaceState(null, '', redirectUri);

        if (returnedState !== state) {
            log.error('Invalid state', {state, returnedState});
            return;
        }

        try {
            const {token} = await api.oidc.post(code, redirectUri);
            login(token, state);
        } catch (err) {
            log.error('OIDC login failed', {err});
            addUserNotification('Login failed.', true);
            this.setState({useTokenLogin: true});
        }
    }
}

async function redirectToOidc(authEndpoint: string) {
    const state = window.location.href;
    const redirectUri = window.location.href.replace(window.location.hash, '');
    sessionStorage.oidc = JSON.stringify({state, redirectUri});

    const url = new URL(authEndpoint);
    url.searchParams.set('state', state);
    url.searchParams.set('redirect_uri', redirectUri);

    // @ts-ignore
    window.location = url.href;
}

async function login(token: string, redirectUri?: string) {
    try {
        setToken(token);
        await api.testAuth();

        if (redirectUri) {
            // @ts-ignore
            window.location = redirectUri;
        } else {
            window.location.reload();
        }
    } catch (err) {
        log.error('Login Failed', err);

        deleteToken();

        const message = (err.status === 401 || err.status === 403) ? LOGIN_MESSAGE : ERROR_MESSAGE;
        addUserNotification(message, true);
    }
}
