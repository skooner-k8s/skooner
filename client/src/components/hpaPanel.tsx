import React from 'react';
import Field from './field';
import {TODO} from '../utils/types';

const HpaPanel = ({spec}: TODO) => (
    <>
        {spec && (
            <div>
                <div className='contentPanel_header'>Container</div>
                <div key="hpa" className='contentPanel'>
                    <Field name='Min Replicas'>{spec.minReplicas}</Field>
                    <Field name='Max Replicas'>{spec.maxReplicas}</Field>
                    <Field name='CPU Utilization %'>{spec.targetCPUUtilizationPercentage}</Field>
                </div>
            </div>
        )}
    </>
);

export default HpaPanel;
