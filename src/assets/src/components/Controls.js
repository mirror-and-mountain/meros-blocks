import { __ } from '@wordpress/i18n';
import { InspectorControls as BaseInspectorControls } from '@wordpress/block-editor';
import { useEffect, useRef, useState } from '@wordpress/element';

import { ColorPicker as BaseColorPicker } from './ColorPicker.js';
import {
    PanelBody as BasePanelBody,
    TextControl as BaseTextControl,
    ToggleControl as BaseToggleControl,
    SelectControl as BaseSelectControl,
    RangeControl as BaseRangeControl,
    FontSizePicker as BaseFontSizePicker,
    Button as BaseButton,
    Modal as BaseModal,
    __experimentalUnitControl as BaseUnitControl,
    __experimentalNumberControl as BaseNumberControl,
    __experimentalToolsPanel as BaseToolsPanel,
    __experimentalToolsPanelItem as BaseToolsPanelItem
} from '@wordpress/components';

export function InspectorControls({ group, className, children }) {
    return (
        <BaseInspectorControls className={className} group={group}>
            {children}
        </BaseInspectorControls>
    );
}

export function PanelBody({ title, initialOpen, children }) {
    return (
        <BasePanelBody title={title} initialOpen={initialOpen}>
            {children}
        </BasePanelBody>
    );
}

export function ToolsPanel({ label, resetAll, children }) {
    return (
        <BaseToolsPanel label={label} resetAll={resetAll}>
            {children}
        </BaseToolsPanel>
    );
}

export function ToolsPanelItem({ label, isShownByDefault, hasValue, onDeselect, children }) {
    return (
        <BaseToolsPanelItem
            label={label}
            isShownByDefault={isShownByDefault}
            hasValue={hasValue}
            onDeselect={onDeselect}
        >
            {children}
        </BaseToolsPanelItem>
    );
}

export function TextControl({ label, value, onChange }) {
    return (
        <BaseTextControl
            label={label}
            value={value}
            onChange={onChange}
            __next40pxDefaultSize={true}
            __nextHasNoMarginBottom={true}
        />
    );
}

export function ToggleControl({ label, checked, onChange, disabled = false }) {
    return (
        <BaseToggleControl
            label={label}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            __nextHasNoMarginBottom={true}
            __next40pxDefaultSize={true}
        />
    );
}

export function SelectControl({ label, value, options, onChange }) {
    return (
        <BaseSelectControl
            label={label}
            value={value}
            options={options}
            onChange={onChange}
            __nextHasNoMarginBottom={true}
            __next40pxDefaultSize={true}
        />
    );
}

export function RangeControl({ label, value, onChange, min, max, step }) {
    return (
        <BaseRangeControl
            label={label}
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            step={step}
            __nextHasNoMarginBottom={true}
            __next40pxDefaultSize={true}
        />
    );
}

export function FontSizePicker({ fontSizes, value, onChange }) {
    return (
        <BaseFontSizePicker
            fontSizes={fontSizes}
            value={value}
            onChange={onChange}
        />
    );
}

export function NumberControl({ label, value, onChange, min, max, step }) {
    return (
        <BaseNumberControl
            label={label}
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            step={step}
            __next40pxDefaultSize={true}
        />
    );
}

export function UnitControl({ label, value, onChange, units = [
    { name: 'px', label: 'px' },
    { name: 'em', label: 'em' },
    { name: 'rem', label: 'rem' },
    { name: '%', label: '%' }
] }) {
    return (
        <BaseUnitControl
            label={label}
            value={value}
            onChange={onChange}
            units={units}
            __next40pxDefaultSize={true}
        />
    );
}

export function ColorPicker({ label, value, onChange, margin = true }) {
    return (
        <BaseColorPicker
            label={label}
            currentColor={value}
            onChange={onChange}
            margin={margin}
        />
    );
}

export function HTMLEditor({ label, value, onChange, height = 200 }) {
    const textareaRef = useRef(null);
    const editorRef = useRef(null);

    useEffect(() => {
        if (!textareaRef.current || editorRef.current) return;

        editorRef.current = wp.codeEditor.initialize(
            textareaRef.current,
            {
                mode: 'htmlmixed',
                lineNumbers: true,
                indentUnit: 2,
                tabSize: 2,
                indentWithTabs: false,
            }
        );

        editorRef.current.codemirror.setSize(null, height);
        editorRef.current.codemirror.on('change', (cm) => {
            onChange(cm.getValue());
        });
    }, []);

    // Keep external value in sync
    useEffect(() => {
        if (!editorRef.current) return;

        const cm = editorRef.current.codemirror;
        if (cm.getValue() !== value) {
            cm.setValue(value || '');
        }
    }, [value]);

    return (
        <>
            <label className="components-truncate components-text components-input-control__label em5sgkm2 dbadef-eb-f-ae-aaaeaead-116rv4z e19lxcc00">{label}</label>
            <textarea
                ref={textareaRef}
                defaultValue={value}
                style={{ width: '100%' }}
            />
        </>
    );
}

export function HTMLEditorModal({ label, value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <BaseButton
                variant="secondary"
                onClick={() => setIsOpen(true)}
                className="meros-html-editor-button"
            >
                {label}
            </BaseButton>

            {isOpen && (
                <BaseModal
                    title={label}
                    onRequestClose={() => setIsOpen(false)}
                    shouldCloseOnClickOutside={false}
                    className="meros-html-editor-modal"
                >
                    <HTMLEditor
                        label={label}
                        value={value}
                        onChange={onChange}
                        height={300}
                    />

                    <div style={{ marginTop: '16px', textAlign: 'right' }}>
                        <BaseButton
                            variant="primary"
                            onClick={() => setIsOpen(false)}
                        >
                            {__('Done', 'meros-theme')}
                        </BaseButton>
                    </div>
                </BaseModal>
            )}
        </>
    );
}

