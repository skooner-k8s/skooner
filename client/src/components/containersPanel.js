import React from 'react';
import Field from './field';

const ContainersPanel = ({spec}) => (
    <>
        {spec && spec.containers && spec.containers.map(item => (
            <div key={item.name} className='contentPanel'>
                <Field name='Container'>{item.name}</Field>
                <Field name='Image'>{item.image}</Field>

                {item.args && (
                    <Field name='Args'>{item.args.join(' ')}</Field>
                )}

                {item.env && (
                    <Field name='Env'>
                        {item.env.map(x => (
                            <div key={x.name}>
                                {x.name}: {getVariableValue(x)}
                            </div>
                        ))}
                    </Field>
                )}

                {item.resources && item.resources.requests && (
                    <>
                        <Field name='Cpu Request'>{item.resources.requests && item.resources.requests.cpu}</Field>
                        <Field name='Memory Request'>{item.resources.requests && item.resources.requests.memory}</Field>
                    </>
                )}

                {item.resources && item.resources.limits && (
                    <>
                        <Field name='Cpu Limit'>{item.resources.limits && item.resources.limits.cpu}</Field>
                        <Field name='Memory Limit'>{item.resources.limits && item.resources.limits.memory}</Field>
                    </>
                )}

                {item.ports && (
                    <Field name='Ports'>
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Container Port</th>
                                    <th>Host Port</th>
                                    <th>Protocol</th>
                                </tr>
                            </thead>
                            <tbody>
                                {item.ports.map((x, i) => (
                                    <tr key={i}>
                                        <td>{x.name}</td>
                                        <td>{x.containerPort}</td>
                                        <td>{x.hostPort}</td>
                                        <td>{x.protocol}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Field>
                )}
            </div>
        ))}
    </>
);

function getVariableValue(item) {
    if (item.value) return item.value;
    if (!item.valueFrom) return null;
    if (item.valueFrom.secretKeyRef) return item.valueFrom.secretKeyRef.key;
    if (item.valueFrom.fieldRef) return item.valueFrom.fieldRef.fieldPath;

    return null;
}

export default ContainersPanel;
