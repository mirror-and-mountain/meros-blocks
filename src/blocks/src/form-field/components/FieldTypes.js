import { useBlockProps } from "@wordpress/block-editor";
import { useEffect, useRef, forwardRef, useState } from '@wordpress/element';
import { initEditorScripts } from "../../../../assets/src/utils/editor.js";

export const FormField = {
    Edit: FormFieldEdit,
    Save: FormFieldSave
};

function injectTomSelect({ win, doc, winRef, docRef, winReady, setWinReady }) {
    if (winReady) return;

    winRef.current = win;
    docRef.current = doc;

    const TS_SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/tom-select/dist/js/tom-select.complete.min.js';
    const TS_STYLE_URL = 'https://cdn.jsdelivr.net/npm/tom-select/dist/css/tom-select.css';

    const injectScript = () => {
        const script = doc.head.querySelector(`script[src="${TS_SCRIPT_URL}"]`);
        if (script) return;

        const newScript = doc.createElement('script');
        newScript.src = TS_SCRIPT_URL;
        newScript.onload = () => {
            win.MerosTomSelect = win.TomSelect;
        };
        doc.head.appendChild(newScript);
    }

    const injectStyle = () => {
        const style = doc.querySelector(`link[href="${TS_STYLE_URL}"]`);
        if (style) return;

        const newStyle = doc.createElement('link');
        newStyle.rel = 'stylesheet';
        newStyle.href = TS_STYLE_URL;
        doc.head.appendChild(newStyle);
    }

    if (!win.MerosTomSelect) {
        injectStyle();
        injectScript();
        setWinReady(true);
    } else {
        setWinReady(true);
    }
}

function FormFieldEdit({ attributes, setAttributes, clientId }) {
    const winRef = useRef();
    const docRef = useRef();
    const fieldRef = useRef();
    const tomSelectRef = useRef();
    const advancedSelectRef = useRef();

    const { type, multiple, id } = attributes;
    const [winReady, setWinReady] = useState(false);

    useEffect(() => {
        const Id = `meros-form-field-${clientId}`;
        setAttributes({
            id: Id
        });

    }, [clientId]);

    useEffect(() => {
        if (type !== 'advanced-select') return;
        if (!fieldRef.current || !id) return;

        if (!winRef.current || !docRef.current) {
            initEditorScripts(injectTomSelect, {
                winRef: winRef,
                docRef: docRef,
                winReady: winReady,
                setWinReady: setWinReady
            });
            return;
        }

        const MerosTomSelect = winRef.current.MerosTomSelect;
        if (!MerosTomSelect) return;

        const field = fieldRef.current.querySelector('.meros-advanced-select-control');
        if (!field) return;

        advancedSelectRef.current = field;

        if (advancedSelectRef.current.tomselect) {
            advancedSelectRef.current.tomselect.destroy();
        }

        tomSelectRef.current = new MerosTomSelect(`#${advancedSelectRef.current.id}`, {
            plugins: multiple ? {
                remove_button: {
                    title: 'Remove',
                }
            } : {},
            create: false,
            sortField: [{ field: '$order' }, { field: '$score' }],
            maxItems: multiple ? null : 1,
            placeholder: 'Select...',
            onChange: () => {
                advancedSelectRef.current.tomselect.blur();
            }
        });

        return () => {
            tomSelectRef.current?.destroy();
            tomSelectRef.current = null;
        };
    }, [id, winReady]);

    const blockProps = useBlockProps({
        className: `meros-form-field meros-form-field-${type} nice-form-group`
    });

    return (
        <FormFieldType
            blockProps={blockProps}
            attributes={attributes}
            ref={fieldRef}
        />
    );
}

function FormFieldSave({ attributes }) {
    const { type } = attributes;
    const blockProps = useBlockProps.save({
        className: `meros-form-field meros-form-field-${type} nice-form-group`
    });

    return (
        <FormFieldType
            blockProps={blockProps}
            attributes={attributes}
        />
    );
}

const FormFieldType = forwardRef(function FormFieldType(
    { blockProps, attributes },
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
    const safeOptions = Array.isArray(options) ? options : [];

    return (
        <FieldWrapper
            ref={ref}
            blockProps={blockProps}
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
                    required={true}
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
                    options={safeOptions}
                    required={required}
                />
            )}

            {type === 'advanced-select' && (
                <FieldAdvancedSelect
                    id={id}
                    name={name}
                    value={stringValue}
                    options={safeOptions}
                    multiple={multiple}
                    required={required}
                />
            )}

            {choiceGroupTypes.includes(type) && (
                <FieldChoiceGroup
                    type={type}
                    name={name}
                    value={type === 'checkbox-group' ? selectedOptions : stringValue}
                    options={safeOptions}
                    horizontal={horizontal}
                    useSwitch={useSwitch}
                    required={required}
                />
            )}
        </FieldWrapper>
    );
});

const FieldWrapper = forwardRef(function FieldWrapper(
    { blockProps, label, children, required = false },
    ref
) {
    return (
        <div {...blockProps} ref={ref}>
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
                required={required}
                className={`${iconCompatibleTypes.includes(type) && showIcon ? `icon-${showIcon}` : ''}`}
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
}) {
    return (
        <>
            <select
                id={id}
                {...(name !== undefined && name !== '' && { name })}
                multiple={multiple}
                required={required}
                className="meros-advanced-select-control"
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