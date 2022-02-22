import React from 'react';
import Field from './field';
import {objectMap} from './listViewHelpers';
import {safeParseTimeToDate} from '../utils/dates';

const MetadataFields = ({item}: {[key: string]: any}) => (
    <>
        <Field name='Name' value={item.metadata.name} />
        <Field name='Kind' value={item.kind} />

        {item.metadata.namespace && (
            <Field name='Namespace'>
                <a href={`#!namespace/${item.metadata.namespace}`}>{item.metadata.namespace}</a>
            </Field>
        )}

        <Field name='Created'>
            {safeParseTimeToDate(item.metadata.creationTimestamp).toLocaleString()}
        </Field>

        {item.metadata.labels && (
            <Field name='Labels'>
                {objectMap(item.metadata.labels)}
            </Field>
        )}

        {item.metadata.annotations && (
            <Field name='Annotations'>
                {objectMap(item.metadata.annotations)}
            </Field>
        )}

        <Field name='Version' value={item.metadata.resourceVersion} />
    </>
);

export default MetadataFields;
