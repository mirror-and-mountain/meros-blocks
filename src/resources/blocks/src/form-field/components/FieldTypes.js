import { useEffect, useState, useRef, forwardRef } from '@wordpress/element';
import { withAdvancedSelect } from '../hooks/withAdvancedSelect.js';
import { withLookup } from '../hooks/withLookup.js';

export const FormField = {
    Edit: FormFieldEdit,
    Save: FormFieldSave
};

function FormFieldEdit({ attributes, setAttributes, clientId }) {
    const fieldRef = useRef();
    const advancedSelectRef = useRef();

    const { type } = attributes;

    if (type === 'advanced-select' || type === 'lookup') {
        advancedSelectRef.current = withAdvancedSelect(
            attributes, fieldRef, advancedSelectRef
        );
    }

    const [lookupOptions, setLookupOptions] = useState([]);
    if (type === 'lookup') {
        withLookup(attributes, fieldRef, lookupOptions, setLookupOptions);
    }

    useEffect(() => {
        if (type !== 'lookup' || !lookupOptions || lookupOptions.length === 0) {
            return;
        }

        setAttributes({
            options: lookupOptions
        });

    }, [lookupOptions]);

    useEffect(() => {
        const Id = `meros-form-field-${clientId}`;
        setAttributes({
            id: Id
        });

    }, [clientId]);

    return (
        <FormFieldType
            attributes={attributes}
            ref={fieldRef}
        />
    );
}

function FormFieldSave({ attributes }) {
    return (
        <FormFieldType
            attributes={attributes}
        />
    );
}

const FormFieldType = forwardRef(function FormFieldType(
    { attributes },
    ref
) {
    const {
        id,
        type,
        label,
        name,
        showIcon,
        stringValue,
        selectedOptions,
        placeholder,
        required,
        rows,
        options,
        multiple,
        horizontal,
        useSwitch,
        min,
        max,
        step
    } = attributes;

    const inputTextTypes = ['text', 'email', 'password', 'date', 'time', 'tel'];
    const inputNumberTypes = ['number', 'range'];
    const choiceGroupTypes = ['radio-group', 'checkbox-group'];
    const renderedOptions = Array.isArray(options) ? options : [];

    return (
        <FieldWrapper
            ref={ref}
            type={type}
            label={label}
            required={required}
        >
            {inputTextTypes.includes(type) && (
                <FieldTextInput
                    id={id}
                    type={type}
                    name={name}
                    value={stringValue}
                    placeholder={placeholder}
                    required={required}
                    showIcon={showIcon}
                />
            )}

            {inputNumberTypes.includes(type) && (
                <FieldNumberInput
                    id={id}
                    type={type}
                    name={name}
                    value={stringValue}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    step={step}
                    required={required}
                />
            )}

            {type === 'textarea' && (
                <FieldTextArea
                    id={id}
                    name={name}
                    value={stringValue}
                    placeholder={placeholder}
                    rows={rows}
                    required={required}
                />
            )}

            {type === 'select' && (
                <FieldSelect
                    id={id}
                    name={name}
                    value={stringValue}
                    options={renderedOptions}
                    required={required}
                />
            )}

            {(type === 'advanced-select' || type === 'lookup') && (
                <FieldAdvancedSelect
                    id={id}
                    name={name}
                    value={stringValue}
                    options={renderedOptions}
                    multiple={multiple}
                    required={required}
                    isLookup={type === 'lookup'}
                />
            )}

            {choiceGroupTypes.includes(type) && (
                <FieldChoiceGroup
                    type={type}
                    name={name}
                    value={type === 'checkbox-group' ? selectedOptions : stringValue}
                    options={renderedOptions}
                    horizontal={horizontal}
                    useSwitch={useSwitch}
                    required={required}
                />
            )}
        </FieldWrapper>
    );
});

const FieldWrapper = forwardRef(function FieldWrapper(
    { type, label, children, required = false },
    ref
) {
    return (
        <div className={`meros-form-field meros-form-field-${type} nice-form-group`} ref={ref}>
            <label className="meros-form-field-label">
                {label}
                {required && <span className="meros-form-field-required">*</span>}
            </label>
            {children}
        </div>
    );
});

function FieldTextInput({
    id,
    type,
    name,
    value,
    placeholder,
    required = false,
    showIcon = 'left'
}) {
    const iconCompatibleTypes = ['email', 'password', 'date', 'time', 'tel', 'url'];
    return (
        <>
            <input
                id={id}
                type={type}
                {...(name !== undefined && name !== '' && { name })}
                {...(placeholder !== undefined && placeholder !== '' && { placeholder })}
                {...(value !== undefined && value !== '' && { value })}
                {...(iconCompatibleTypes.includes(type) && showIcon ? { className: `icon-${showIcon}` } : {})}
                required={required}
            />
        </>
    );
}

function FieldNumberInput({
    id,
    type,
    name,
    value,
    placeholder,
    min = undefined,
    max = undefined,
    step = undefined,
    required = false
}) {
    return (
        <>
            <input
                id={id}
                type={type}
                {...(name !== undefined && name !== '' && { name })}
                {...(placeholder !== undefined && placeholder !== '' && { placeholder })}
                {...(value !== undefined && value !== '' && { value })}
                {...(min !== undefined && { min })}
                {...(max !== undefined && { max })}
                {...(step !== undefined && { step })}
                required={required}
            />
        </>
    );
}

function FieldTextArea({
    id,
    name,
    value,
    placeholder,
    rows = 4,
    required = false
}) {
    return (
        <>
            <textarea
                id={id}
                {...(name !== undefined && name !== '' && { name })}
                {...(placeholder !== undefined && placeholder !== '' && { placeholder })}
                {...(value !== undefined && value !== '' && { value })}
                {...(rows !== undefined && { rows })}
                required={required}
            />
        </>
    );
}

function FieldSelect({
    id,
    name,
    value,
    options = [],
    required = false
}) {
    return (
        <>
            <select
                id={id}
                {...(name !== undefined && name !== '' && { name })}
                required={required}
            >
                {options.map((option, index) => (
                    <option key={index} value={option.value} selected={option.value === value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </>
    );
}

function FieldAdvancedSelect({
    id,
    name,
    value,
    options = [],
    multiple = false,
    required = false,
    isLookup = false
}) {
    return (
        <>
            <select
                id={id}
                {...(name !== undefined && name !== '' && { name })}
                multiple={multiple}
                required={required}
                className={`meros-advanced-select-control${isLookup ? ' meros-advanced-select-lookup' : ''}`}
            >
                {options.map((option, index) => (
                    <option
                        key={index}
                        value={option.value}
                        selected={Array.isArray(value)
                            ? value.includes(option.value)
                            : option.value === value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        </>
    );
};

function FieldChoiceGroup({
    type,
    name,
    value,
    options = [],
    horizontal = false,
    useSwitch = false,
    required = false
}) {
    const switchClass = type === 'checkbox-group' && useSwitch ? 'switch' : '';
    return (
        <fieldset className={`meros-choice-group nice-form-group ${horizontal ? 'meros-fieldset-horizontal' : ''}`}>
            {options.map((option, index) => (
                <div className="meros-choice-option nice-form-group">
                    <input
                        id={`radio-${index}`}
                        type={type === 'checkbox-group' ? 'checkbox' : 'radio'}
                        name={name}
                        checked={value && type === 'checkbox-group' ? value.includes(option.value) : value === option.value}
                        required={required}
                        className={switchClass}
                    />
                    <label key={index} htmlFor={`radio-${index}`}>
                        {option.label}
                    </label>
                </div>
            ))}
        </fieldset>
    );
}