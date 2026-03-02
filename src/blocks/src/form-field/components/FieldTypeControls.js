import { __ } from '@wordpress/i18n';
import {
    InspectorControls,
    ToolsPanel,
    ToolsPanelItem,
    TextControl,
    ToggleControl,
    NumberControl,
    SelectControl
} from '../../../../assets/src/components/Controls.js';

export function FieldTypeControls({ attributes, setAttributes }) {
    const { 
        type,
        label,
        name,
        showIcon,
        stringValue,
        booleanValue,
        numberValue,
        selectedOptions,
        lookupQuery,
        placeholder,
        rows,
        options,
        multiple,
        horizontal,
        min,
        max,
        step,
        required,
        disabled,
        hidden,        
        conditions
     } = attributes;

    const defaultSettings = {
        label: type.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase()) + ' Field',
        name: type.replace(/-/g, '_') + '_' + Math.random().toString(36).substring(2, 8),
        showIcon: true,
        stringValue: '',
        booleanValue: false,
        numberValue: 0,
        selectedOptions: [],
        lookupQuery: {
            availablePostTypes: [],
            postType: 'post',
            fields: [],
            taxonomies: [],
            metaQuery: [],
            search: '',
            perPage: 20
        },
        placeholder: '',
        rows: 4,
        options: [],
        multiple: false,
        horizontal: false,
        min: 0,
        max: 100,
        step: 1,
        required: false,
        disabled: false,
        hidden: false,
        conditions: {
            'show': [],
            'hide': [],
            'disable': [],
            'enable': [],
            require: [],
            optional: []
        }

    }

    const lookupAvailablePostTypes = Object.entries(
        lookupQuery.availablePostTypes).map(([value, label]) => ({ 
            value, 
            label: label.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
        })
    );

    const valueAttrMap = {
        'stringValue': ['text', 'email', 'password', 'date', 'time', 'tel', 'url', 'textarea', 'select'],
        'booleanValue': ['checkbox', 'toggle'],
        'numberValue': ['number', 'range'],
        'selectedOptions': ['radio-group', 'checkbox-group']
    }

    const defaultValueAttr = 
        valueAttrMap['stringValue'].includes(type) ? 'stringValue' :
        valueAttrMap['booleanValue'].includes(type) ? 'booleanValue' :
        valueAttrMap['numberValue'].includes(type) ? 'numberValue' :
        valueAttrMap['selectedOptions'].includes(type) ? 'selectedOptions' : null;
    
    const defaultValue = attributes[defaultValueAttr];

    const resetFieldSettings = () => {
        setAttributes({
            ...defaultSettings
        });
    };

    const hasValue = (setting) => {
        if (setting === 'defaultValue') {
            const value = attributes[defaultValueAttr];
            if (Array.isArray(value)) {
                return value.length > 0;
            }
            return value !== defaultSettings[defaultValueAttr];
        }

        const value = attributes[setting];
        if (value !== defaultSettings[setting]) {
            return true;
        }
        return false;
    };

    const resetSetting = (setting) => {
        if (setting === 'defaultValue') {
            setAttributes({ 
                [defaultValueAttr]: defaultSettings[defaultValueAttr] 
            });
            return;
        }

        setAttributes({
            [setting]: defaultSettings[setting]
        });
    };

    const setSetting = (setting, value) => {
        if (setting === 'defaultValue') {
            setAttributes({ [defaultValueAttr]: value });
            return;
        }

        setAttributes({ [setting]: value });
    };

    const resetLookupSetting = (setting) => {
        setAttributes({
            lookupQuery: {
                ...lookupQuery,
                [setting]: defaultSettings.lookupQuery[setting]
            }
        });
    }

    const setLookupSetting = (setting, value) => {
        setAttributes({ 
            lookupQuery: {
                ...lookupQuery,
                [setting]: value
            }
        });
    }

    const iconCompatibleTypes = ['email', 'password', 'date', 'time', 'tel', 'url'];

    return (
        <InspectorControls>
            <ToolsPanel label={__('Field Settings', 'meros-theme')} resetAll={resetFieldSettings}>
                {/* Field Label */}
                <ToolsPanelItem 
                    label={__('Label', 'meros-theme')}
                    hasValue={() => hasValue('label')}
                    onDeselect={() => resetSetting('label')}
                    isShownByDefault={true}
                >
                    <TextControl
                        label={__('Label', 'meros-theme')}
                        value={label}
                        onChange={(value) => setSetting('label', value)}
                    />
                </ToolsPanelItem>

                {/* Field Name */}
                <ToolsPanelItem 
                    label={__('Name', 'meros-theme')}
                    hasValue={() => hasValue('name')}
                    onDeselect={() => resetSetting('name')}
                    isShownByDefault={true}
                >
                    <TextControl
                        label={__('Name', 'meros-theme')}
                        value={name}
                        onChange={(value) => setSetting('name', value)}
                    />
                </ToolsPanelItem>

                {/* Placeholder */}
                <ToolsPanelItem 
                    label={__('Placeholder', 'meros-theme')}
                    hasValue={() => hasValue('placeholder')}
                    onDeselect={() => resetSetting('placeholder')}
                    isShownByDefault={true}
                >
                    <TextControl
                        label={__('Placeholder', 'meros-theme')}
                        value={placeholder}
                        onChange={(value) => setSetting('placeholder', value)}
                    />
                </ToolsPanelItem>

                {/* Default Value */}
                <ToolsPanelItem 
                    label={__('Default Value', 'meros-theme')}
                    hasValue={() => hasValue('defaultValue')}
                    onDeselect={() => resetSetting('defaultValue')}
                    isShownByDefault={true}
                >
                    {valueAttrMap['stringValue'].includes(type) && type !== 'select' && (
                        <TextControl
                            label={__('Default Value', 'meros-theme')}
                            value={defaultValue}
                            onChange={(value) => setSetting('defaultValue', value)}
                        />
                    )}

                    {valueAttrMap['stringValue'].includes(type) && type === 'select' && (
                        <SelectControl
                            label={__('Default Value', 'meros-theme')}
                            value={defaultValue}
                            options={Array.isArray(options) ? options.map(opt => ({ label: opt.label, value: opt.value })) : []}
                            onChange={(value) => setSetting('defaultValue', value)}
                        />
                    )}

                    {valueAttrMap['numberValue'].includes(type) && (
                        <NumberControl
                            label={__('Default Value', 'meros-theme')}
                            value={defaultValue}
                            onChange={(value) => setSetting('defaultValue', value)}
                        />
                    )}

                    {valueAttrMap['booleanValue'].includes(type) && (
                        <ToggleControl
                            label={__('Default Value', 'meros-theme')}
                            checked={defaultValue}
                            onChange={(value) => setSetting('defaultValue', value)}
                        />
                    )}
                </ToolsPanelItem>

                {/* Required */}
                <ToolsPanelItem 
                    label={__('Required', 'meros-theme')}
                    hasValue={() => hasValue('required')}
                    onDeselect={() => resetSetting('required')}
                    isShownByDefault={true}
                >
                    <ToggleControl
                        label={__('Required', 'meros-theme')}
                        checked={required}
                        onChange={(value) => setSetting('required', value)}
                    />
                </ToolsPanelItem>

                {/* Lookup Query Post Type */}
                <ToolsPanelItem 
                    label={__('Post Type', 'meros-theme')}
                    hasValue={() => lookupQuery.postType !== defaultSettings.lookupQuery.postType}
                    onDeselect={() => resetLookupSetting('postType')}
                    isShownByDefault={true}
                >
                    <SelectControl
                        label={__('Post Type', 'meros-theme')}
                        value={lookupQuery.postType}
                        onChange={(value) => setLookupSetting('postType', value)}
                        options={lookupAvailablePostTypes}
                    />
                </ToolsPanelItem>
            </ToolsPanel>
        </InspectorControls>
    );
}