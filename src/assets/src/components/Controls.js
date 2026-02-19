import { InspectorControls as BaseInspectorControls } from '@wordpress/block-editor';
import { ColorPicker as BaseColorPicker } from './ColorPicker.js';
import { 
    PanelBody as BasePanelBody,
    TextControl as BaseTextControl,
    ToggleControl as BaseToggleControl,
    SelectControl as BaseSelectControl,
    RangeControl as BaseRangeControl,
    FontSizePicker as BaseFontSizePicker,
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
    { name: 'px', label: 'px'},
    { name: 'em', label: 'em'},
    { name: 'rem', label: 'rem'},
    { name: '%', label: '%'}
]}) {
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


