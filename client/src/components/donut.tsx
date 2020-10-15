import React from 'react';
import Base from './base';

type Props = {
    percent?: number;
    percent2?: number;
}

type State = {
    currentPercent: number;
    currentPercent2: number;
};
export default class Donut extends Base<Props, State> {
    state = {
        currentPercent: 0,
        currentPercent2: 0,
    };

    private unmounted = false;

    private animationQueued = false;

    constructor(props: Props) {
        super(props);
        requestAnimationFrame(() => this.animate());
    }

    async componentWillUnmount() {
        super.componentWillUnmount();
        this.unmounted = true;
    }

    componentDidUpdate(prevProps: Props) {
        if (this.animationQueued) return;

        const {percent, percent2} = this.props;
        if (prevProps.percent !== percent || prevProps.percent2 !== percent2) {
            this.animate();
        }
    }

    animate() {
        this.animationQueued = false;
        if (this.unmounted) return;

        const {percent = 0, percent2 = 0} = this.props;
        const {currentPercent = 0, currentPercent2 = 0} = this.state;

        if (currentPercent === percent && currentPercent2 === percent2) return;

        const next1 = getNextStep(percent, currentPercent);
        const next2 = getNextStep(percent2, currentPercent2);
        this.setState({currentPercent: next1, currentPercent2: next2});

        this.animationQueued = true;
        requestAnimationFrame(() => this.animate());
    }

    render() {
        const {currentPercent, currentPercent2} = this.state;
        const percent = currentPercent * 100;
        const percent2 = currentPercent2 * 100;

        return (
            <svg className='donut' xmlns='http://www.w3.org/2000/svg' viewBox="0 0 42 42" width='100%' height='100%'>
                <circle className='donut_background' cx='21' cy='21' r='16' />
                <circle className='donut_layer1' cx='21' cy='21' r='16' strokeDasharray={`${percent} ${100 - percent}`} strokeDashoffset="25" />
                <circle className='donut_layer2' cx='21' cy='21' r='16' strokeDasharray={`${percent2} ${100 - percent2}`} strokeDashoffset={25 + (100 - percent)} />
            </svg>
        );
    }
}

function getNextStep(target: number, current: number) {
    const diff = current - target;
    const absDiff = Math.abs(diff);
    const change = Math.min(absDiff, 0.03);
    return diff > 0 ? current - change : current + change;
}
