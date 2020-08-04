import React from 'react';
import Field from './field';

const HpaPanel = ({spec}) => (
    <>
        {spec &&
            <div>
                <div className='contentPanel_header'>Container</div>
                <div key="hpa" className='contentPanel'>
                    {spec.minReplicas && (
                        <>
                            <Field name='Min Replicas'>{spec.minReplicas}</Field>
                        </>
                    )}
                    {spec.maxReplicas && (
                        <>
                            <Field name='Max Replicas'>{spec.maxReplicas}</Field>
                        </>
                    )}
                    {spec.targetCPUUtilizationPercentage && (
                        <>
                            <Field name='CPU Utilization %'>{spec.targetCPUUtilizationPercentage}</Field>
                        </>
                    )}
                </div>
            </div>
        }
    </>
);

export default HpaPanel;
