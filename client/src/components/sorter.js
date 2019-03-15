import './sorter.scss';
import React from 'react';
import Base from './base';
import ArrowUpSvg from '../art/arrowUpSvg';
import ArrowDownSvg from '../art/arrowDownSvg';

export default class Sorter extends Base {
    render() {
        const {text, field, sortBy, sortDirection, onSort} = this.props;

        const isSelected = (sortBy && field === sortBy);
        const isUpSelected = (isSelected && sortDirection === 'asc');
        const isDownSelected = (isSelected && sortDirection === 'desc');

        return (
            <div className={onSort ? 'sorter' : undefined} onClick={() => this.sort()}>
                <span>{text}</span>
                {onSort && (
                    <span className={`sorter_arrows ${isSelected && 'sorter_active'}`}>
                        <ArrowUpSvg className={isUpSelected ? 'sorter_active' : undefined} />
                        <ArrowDownSvg className={isDownSelected ? 'sorter_active' : undefined} />
                    </span>
                )}
            </div>
        );
    }

    sort() {
        const {field, sortBy, sortDirection, onSort} = this.props;
        if (!onSort) return;

        const isSelected = (sortBy && field === sortBy);
        const isDownSelected = (isSelected && sortDirection === 'desc');
        const direction = !isSelected || isDownSelected ? 'asc' : 'desc';

        onSort(field, direction);
    }
}
