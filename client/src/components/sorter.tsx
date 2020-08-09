import './sorter.scss';
import React, {Component} from 'react';
import Base from './base';
import ArrowUpSvg from '../art/arrowUpSvg';
import ArrowDownSvg from '../art/arrowDownSvg';
import {TODO} from '../utils/types';

export type Direction = "asc" | "desc";

export interface SortInfo {
    field: string,
    direction: Direction,
    onSort: (sort: SorterStates) => void,
}

interface SorterProps {
    field: TODO;
    sort?: {
        field: string, 
        direction: Direction, 
        onSort: Function,
    };
}

interface SorterStates {
    showEditor: boolean;
}

type SortCallback = (item: TODO) => void;

export function defaultSortInfo(target: Component | SortCallback, field: TODO = 'metadata.name', direction: Direction = 'asc'): SortInfo {
    return {
        field,
        direction,
        onSort: typeof target === 'function' ? target : defaultOnSort,
    };

    function defaultOnSort(sort: SorterStates) {
        // @ts-ignore
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

        const direction: Direction = !this.isSelected() || this.isDownSelected() ? 'asc' : 'desc';
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
        return (this.isSelected() && sort!.direction === 'asc');
    }

    isDownSelected() {
        const {sort} = this.props;
        return (this.isSelected() && sort!.direction === 'desc');
    }
}
