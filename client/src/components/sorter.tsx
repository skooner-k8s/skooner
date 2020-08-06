import './sorter.scss';
import React, {Component} from 'react';
import Base from './base';
import ArrowUpSvg from '../art/arrowUpSvg';
import ArrowDownSvg from '../art/arrowDownSvg';
import {TODO} from "../utils/types";

interface SorterProps {
    sort: {field: string, direction: string, onSort: Function};
    field: TODO;
}

interface SorterStates {
    showEditor: boolean;
}

export function defaultSortInfo(target: Component, field = 'metadata.name', direction = 'asc') {
    return {
        field,
        direction,
        onSort: typeof target === 'function' ? target : defaultOnSort,
    };

    function defaultOnSort(sort: SorterStates) {
        target.setState({sort});
    }
}

export function sortByDate(x: {metadata: {creationTimestamp: string}}) {
    return -Date.parse(x.metadata.creationTimestamp);
}

export default class Sorter extends Base<SorterProps, SorterStates> {
    render() {
        const {children, sort} = this.props;

        return (
            <div className={sort ? 'sorter' : undefined} onClick={() => sort && this.sort()}>
                <span>{children}</span>
                {sort && (
                    <span className={`sorter_arrows ${this.isSelected() && 'sorter_active'}`}>
                        <ArrowUpSvg className={this.isUpSelected() ? 'sorter_active' : undefined} />
                        <ArrowDownSvg className={this.isDownSelected() ? 'sorter_active' : undefined} />
                    </span>
                )}
            </div>
        );
    }

    sort() {
        const {field, sort} = this.props;
        if (!sort) return;

        const direction = !this.isSelected() || this.isDownSelected() ? 'asc' : 'desc';
        sort.field = field;
        sort.direction = direction;
        sort.onSort(sort);
    }

    isSelected() {
        const {sort, field} = this.props;
        return (sort && field === sort.field);
    }

    isUpSelected() {
        const {sort} = this.props;
        return (this.isSelected() && sort.direction === 'asc');
    }

    isDownSelected() {
        const {sort} = this.props;
        return (this.isSelected() && sort.direction === 'desc');
    }
}
