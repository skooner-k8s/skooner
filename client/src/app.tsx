import React, {Component, Fragment, ReactNode} from 'react';
import Menu from './components/menu';
import {Notifier} from './components/notifier';
import Error from './components/error';
import Footer from './components/footer';
import {initRouter} from './router';
import log from './utils/log';
import Button from './components/button';
import LogoSvg from './art/skoonerSvg';
import HamburgerSvg from './art/hamburgerSvg';

type State = {
    content?: ReactNode;
    contentDate?: number;
    hasError?: boolean;
    menuToggled?: boolean;
}

const genericError = (
    <div id='content'>
        <Error messages={['There was an error and this content was unable to be displayed.']} />
    </div>
);

class App extends Component<{}, State> {
    componentDidMount() {
        initRouter((content: ReactNode) => {
            this.setState({content, contentDate: Date.now(), hasError: false});
            window.scrollTo(0, 0);
        });
    }

    componentDidCatch(err: Error, info: any) { // eslint-disable-line class-methods-use-this
        log.error('Error rendering ', {err, info});
        this.setState({hasError: true});
    }

    render() {
        const {content, contentDate, hasError, menuToggled} = this.state || {};

        return (
            <>
                <div id='titleBar'>
                    <Button className='button_clear titleBar_hamburger' onClick={() => this.setState({menuToggled: !menuToggled})}>
                        <HamburgerSvg className='svg_button' />
                    </Button>

                    <a href='#!'>
                        <LogoSvg className='titleBar_logo' />
                    </a>
                </div>

                <div id='shell'>
                    <Menu
                        toggled={menuToggled}
                        onClick={() => this.setState({menuToggled: false})}
                    />

                    <Fragment key={contentDate}>
                        {hasError ? genericError : content}
                    </Fragment>
                </div>

                <Notifier />

                <Footer />
            </>
        );
    }
}

export default App;
