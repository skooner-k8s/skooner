import React from 'react';
import {Swipeable} from 'react-swipeable';
import Base from './base';

type Props = {
    children: React.ReactNode[];
}

type State = {
    index: number;
}

export default class ChartsContainer extends Base<Props, State> {
    state = {
        index: 0,
    };

    swipe(value: number) {
        let {index} = this.state;
        const {children} = this.props;
        index += value;
        index = Math.max(0, index);
        index = Math.min(children.length - 1, index);
        this.setState({index});
    }

    next() {
        let {index} = this.state;
        const {children} = this.props;
        index++;
        if (index >= children.length) index = 0;
        this.setState({index});
    }

    render() {
        const {children} = this.props;
        const {index} = this.state;

        return (
            <div className='charts_container'>
                <Swipeable
                    onSwipedLeft={() => this.swipe(1)}
                    onSwipedRight={() => this.swipe(-1)}
                    trackMouse={true}
                    preventDefaultTouchmoveEvent={true}
                    className={`charts chart_${index}`}
                >
                    {children}
                </Swipeable>

                <div className='chart_dots' onClick={() => this.next()}>
                    {children.map((_, i) => (
                        <span key={i} className={i === index ? 'chart_dotSelected' : undefined}>•</span>
                    ))}
                </div>
            </div>
        );
    }
}
