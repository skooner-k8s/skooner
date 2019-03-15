import React, {Component, Fragment} from 'react';
import TitleBar from './components/titleBar';
import Menu from './components/menu';
import {Notifier} from './components/notifier';
import Error from './components/error';
import {registerHandler, initRouter} from './router';
import log from './utils/log';

const genericError = (
    <div id='content'>
        <Error messages={['There was an error and this content was unable to be displayed.']} />;
    </div>
);

class App extends Component {
    componentDidMount() {
        registerHandler(content => this.setState({content, hasError: false}));
        initRouter();
    }

    componentDidCatch(err, info) { // eslint-disable-line class-methods-use-this
        log.error('Error rendering ', {err, info});
        this.setState({hasError: true});
    }

    render() {
        const {content, hasError} = this.state || {};

        return (
        <>
            <TitleBar />
            <div id='shell'>
                <Menu />
                <Fragment key={Date.now()}>
                    {hasError ? genericError : content}
                </Fragment>
                <Notifier />
            </div>

        </>
        );
    }
}

export default App;
