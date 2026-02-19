import { __ } from '@wordpress/i18n';
import { ColorPicker } from '../../../components/ColorPicker.js';
import {
    ToolsPanel,
    ToolsPanelItem,
    ToggleControl,
    RangeControl,
    SelectControl
} from '../../../components/Controls.js';

export function Duration({ label, current, defaultValue, prop, update }) {
    return (
        <ToolsPanelItem
            label={__(`${label} Duration`, 'meros-theme')}
            hasValue={() => current !== defaultValue}
            isShownByDefault={true}
            onDeselect={() => update({ [prop]: defaultValue })}
        >
            <RangeControl
                label={__(`${label} Duration (s)`, 'meros-theme')}
                value={current}
                onChange={(value) => update({ [prop]: value })}
                min={0.1}
                max={5}
                step={0.1}
            />
        </ToolsPanelItem>
    );
}

export function Delay({ label, current, defaultValue, prop, update }) {
    return (
        <ToolsPanelItem
            label={__(`${label} Delay (s)`, 'meros-theme')}
            hasValue={() => current !== defaultValue}
            isShownByDefault={true}
            onDeselect={() => update({ [prop]: defaultValue })}
        >
            <RangeControl
                label={__(`${label} Delay (s)`, 'meros-theme')}
                value={current}
                onChange={(value) => update({ [prop]: value })}
                min={0}
                max={5}
                step={0.1}
            />
        </ToolsPanelItem>
    );
}

export function Enable({ enabled, onChange, disable = () => {} }) {
    return (
        <ToggleControl
            label={__('Enable Animation', 'meros-theme')}
            checked={!!enabled}
            onChange={(value) => onChange(value)}
            disabled={disable()}
        />
    );
}

export function Presets({ current, presets, defaultPreset, onChange }) {
    return (
        <SelectControl
            label={__('Animation Presets', 'meros-theme')}
            value={current ?? defaultPreset}
            options={presets}
            onChange={(value) => onChange(value)}
        />
    );
}

export function Transform({
    translateX,
    translateY,
    scaleX,
    scaleY,
    duration,
    delay,
    prefix,
    defaultValues,
    update,
    showControls = true,
    showTiming = true
}) {

    return (
        <ToolsPanel
            label={__('Transform', 'meros-theme')}
            resetAll={() => update(defaultValues)}
        >
            {showControls && (
                <>
                    <ToolsPanelItem
                        label={__('Translate X', 'meros-theme')}
                        hasValue={() => translateX !== 0}
                        isShownByDefault={true}
                        onDeselect={() => update({ [`${prefix}AnimateX`]: 0 })}
                    >
                        <RangeControl
                            label={__('Translate X (%)', 'meros-theme')}
                            value={translateX}
                            onChange={(value) =>
                                update({ [`${prefix}AnimateX`]: value })
                            }
                            min={-100}
                            max={100}
                            step={1}
                        />
                    </ToolsPanelItem>

                    <ToolsPanelItem
                        label={__('Translate Y', 'meros-theme')}
                        hasValue={() => translateY !== 0}
                        isShownByDefault={true}
                        onDeselect={() => update({ [`${prefix}AnimateY`]: 0 })}
                    >
                        <RangeControl
                            label={__('Translate Y (%)', 'meros-theme')}
                            value={translateY}
                            onChange={(value) =>
                                update({ [`${prefix}AnimateY`]: value })
                            }
                            min={-100}
                            max={100}
                            step={1}
                        />
                    </ToolsPanelItem>

                    <ToolsPanelItem
                        label={__('Scale X', 'meros-theme')}
                        hasValue={() => scaleX !== 1}
                        isShownByDefault={true}
                        onDeselect={() => update({ [`${prefix}AnimateScaleX`]: 1 })}
                    >
                        <RangeControl
                            label={__('Scale X', 'meros-theme')}
                            value={scaleX}
                            onChange={(value) => update({ [`${prefix}AnimateScaleX`]: value })}
                            min={0.1}
                            max={3}
                            step={0.01}
                        />
                    </ToolsPanelItem>

                    <ToolsPanelItem
                        label={__('Scale Y', 'meros-theme')}
                        hasValue={() => scaleY !== 1}
                        isShownByDefault={true}
                        onDeselect={() => update({ [`${prefix}AnimateScaleY`]: 1 })}
                    >
                        <RangeControl
                            label={__('Scale Y', 'meros-theme')}
                            value={scaleY}
                            onChange={(value) => update({ [`${prefix}AnimateScaleY`]: value })}
                            min={0.1}
                            max={3}
                            step={0.01}
                        />
                    </ToolsPanelItem>
                </>
            )}

            {showTiming && (
                <>
                    <Duration
                        label="Transform"
                        current={duration}
                        defaultValue={0.8}
                        prop={`${prefix}TransformDuration`}
                        update={update}
                    />

                    <Delay
                        label="Transform"
                        current={delay}
                        defaultValue={0}
                        prop={`${prefix}TransformDelay`}
                        update={update}
                    />
                </>
            )}
        </ToolsPanel>
    );
}

export function Opacity({
    current,
    duration,
    delay,
    prefix,
    defaultValues,
    update,
    showControls = true,
    showTiming = true
}) {

    return (
        <ToolsPanel
            label={__('Opacity', 'meros-theme')}
            resetAll={() => update(defaultValues)}
        >
            {showControls && (
                <ToolsPanelItem
                    label={__('Opacity', 'meros-theme')}
                    hasValue={() => current !== 1}
                    isShownByDefault={true}
                    onDeselect={() => update({ [`${prefix}AnimateOpacity`]: 1 })}
                >
                    <RangeControl
                        label={__('Opacity', 'meros-theme')}
                        value={current}
                        onChange={(value) =>
                            update({ [`${prefix}AnimateOpacity`]: value })
                        }
                        min={0}
                        max={1}
                        step={0.01}
                    />
                </ToolsPanelItem>
            )}

            {showTiming && (
                <>
                    <Duration
                        label="Opacity"
                        current={duration}
                        defaultValue={0.8}
                        prop={`${prefix}OpacityDuration`}
                        update={update}
                    />

                    <Delay
                        label="Opacity"
                        current={delay}
                        defaultValue={0}
                        prop={`${prefix}OpacityDelay`}
                        update={update}
                    />
                </>
            )}
        </ToolsPanel>
    );
}

export function Color({
    bg,
    text,
    link,
    duration,
    delay,
    prefix,
    defaultValues,
    update,
    linkHover = false,
    showControls = true,
    showTiming = true
}) {

    return (
        <ToolsPanel
            label={__('Colour', 'meros-theme')}
            resetAll={() => update(defaultValues)}
        >
            {showControls && (
                <>
                    <ToolsPanelItem
                        label={__('Background Colour', 'meros-theme')}
                        hasValue={() => bg !== ''}
                        isShownByDefault={true}
                        onDeselect={() => update({ [`${prefix}AnimateBgColor`]: '' })}
                    >
                        <ColorPicker
                            label={__('Background Colour', 'meros-theme')}
                            currentColor={bg}
                            onChange={(color) =>
                                update({ [`${prefix}AnimateBgColor`]: color })
                            }
                            margin={false}
                        />
                    </ToolsPanelItem>

                    <ToolsPanelItem
                        label={__('Text Colour', 'meros-theme')}
                        hasValue={() => text !== ''}
                        isShownByDefault={true}
                        onDeselect={() => update({ [`${prefix}AnimateTextColor`]: '' })}
                    >
                        <ColorPicker
                            label={__('Text Colour', 'meros-theme')}
                            currentColor={text}
                            onChange={(color) =>
                                update({ [`${prefix}AnimateTextColor`]: color })
                            }
                        />
                    </ToolsPanelItem>

                    <ToolsPanelItem
                        label={__('Link Colour', 'meros-theme')}
                        hasValue={() => link !== ''}
                        isShownByDefault={true}
                        onDeselect={() => update({ [`${prefix}AnimateLinkColor`]: '' })}
                    >
                        <ColorPicker
                            label={__('Link Colour', 'meros-theme')}
                            currentColor={link}
                            onChange={(color) =>
                                update({ [`${prefix}AnimateLinkColor`]: color })
                            }
                        />
                    </ToolsPanelItem>

                    {linkHover !== false && (
                        <ToolsPanelItem
                            label={__('Link Hover Colour', 'meros-theme')}
                            hasValue={() => linkHover !== ''}
                            isShownByDefault={true}
                            onDeselect={() => update({ [`${prefix}AnimateLinkHoverColor`]: '' })}
                        >
                            <ColorPicker
                                label={__('Link Hover Colour', 'meros-theme')}
                                currentColor={linkHover}
                                onChange={(color) =>
                                    update({ [`${prefix}AnimateLinkHoverColor`]: color })
                                }
                            />
                        </ToolsPanelItem>
                    )}
                </>
            )}

            {showTiming && (
                <>
                    <Duration
                        label="Colour"
                        current={duration}
                        defaultValue={0.8}
                        prop={`${prefix}ColorDuration`}
                        update={update}
                    />

                    <Delay
                        label="Colour"
                        current={delay}
                        defaultValue={0}
                        prop={`${prefix}ColorDelay`}
                        update={update}
                    />
                </>
            )}
        </ToolsPanel>
    );
}

export function SiteLogo({
    width,
    defaultValues,
    update
}) {
    return (
        <ToolsPanel label={__('Site Logo Animation', 'meros-theme')} resetAll={() => update(defaultValues)}>
            <ToolsPanelItem
                label={__('Logo Width', 'meros-theme')}
                hasValue={() => width !== 1}
                isShownByDefault={true}
                onDeselect={() => update({ headerAnimateLogoWidth: 1 })}
            >
                <RangeControl
                    label={__('Animate Logo Width (%)', 'meros-theme')}
                    value={width}
                    onChange={(value) =>
                        update({ headerAnimateLogoWidth: value })
                    }
                    min={1}
                    max={2}
                    step={0.01}
                />
            </ToolsPanelItem>
        </ToolsPanel>
    );
}