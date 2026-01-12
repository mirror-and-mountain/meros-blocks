import { __ } from '@wordpress/i18n';
import {
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
    RangeControl,
    ToggleControl
} from '@wordpress/components';

import { getFxAttrs, setPreviewFx } from '../block-mods/utils';

export default function StickyControls({ attributes, setAttributes, isHeader, clientId }) {
    const {
        merosStickyElement,
        merosHeaderFx
    } = attributes;

    const {
        enabled,
        topOffset,
        removeHeaderBottomMargin,
        headerOffset
    } = merosStickyElement || {};

    const defaultValues = getFxAttrs('Sticky');
    const defaultHeaderFxValues = getFxAttrs('Header');
    const label = isHeader ? 'Header' : 'Element';

    const reset = () => {
        setAttributes({
            merosStickyElement: {
                enabled: false,
                topOffset: 0,
                removeHeaderBottomMargin: false,
                headerOffset: false
            }
        });

        if (isHeader) {
            setAttributes({
                merosHeaderFx: {
                    ...merosHeaderFx,
                    ...defaultHeaderFxValues
                }
            });
        }

        setPreviewFx('header', clientId, false);
    }

    return (
        <ToolsPanel label={__(`Sticky ${label} Settings`, 'meros-theme')} resetAll={reset}>
            <ToolsPanelItem
                label={__(`Enable Sticky ${label}`, 'meros-theme')}
                hasValue={() => enabled !== false}
                isShownByDefault={true}
                onDeselect={() => {
                        setAttributes({
                            merosStickyElement: {
                                ...merosStickyElement,
                                ...defaultValues
                            }
                        });
                        if (isHeader) {
                            setAttributes({
                                merosHeaderFx: {
                                    ...merosHeaderFx,
                                    ...defaultHeaderFxValues
                                }
                            });
                            setPreviewFx('header', clientId, false);
                        }
                    }
                }
            >
                <ToggleControl
                    label={__(`Enable Sticky ${label}`, 'meros-theme')}
                    checked={enabled}
                    onChange={(value) => {
                            setAttributes({
                                merosStickyElement: {
                                    ...merosStickyElement,
                                    enabled: value
                                }
                            });
                            if (value === false && isHeader) {
                                setAttributes({
                                    merosHeaderFx: {
                                        ...merosHeaderFx,
                                        ...defaultHeaderFxValues
                                    }
                                });
                                setPreviewFx('header', clientId, false);
                            }
                        }
                    }
                />
            </ToolsPanelItem>

            {enabled && !isHeader && (
                <ToolsPanelItem
                    label={__('Sticky Offset (px)', 'meros-theme')}
                    hasValue={() => topOffset !== 0}
                    isShownByDefault={true}
                    onDeselect={() =>
                        setAttributes({
                            merosStickyElement: {
                                ...merosStickyElement,
                                topOffset: 0
                            }
                        })
                    }
                >
                    <RangeControl
                        label={__('Sticky Offset (px)', 'meros-theme')}
                        value={topOffset}
                        onChange={(value) =>
                            setAttributes({
                                merosStickyElement: {
                                    ...merosStickyElement,
                                    topOffset: value
                                }
                            })
                        }
                        min={0}
                        max={2000}
                    />
                </ToolsPanelItem>
            )}

            {enabled && isHeader && (
                <>
                    <ToolsPanelItem
                        label={__('Remove Bottom Margin', 'meros-theme')}
                        hasValue={() => removeHeaderBottomMargin !== true}
                        isShownByDefault={true}
                        onDeselect={() =>
                            setAttributes({
                                merosStickyElement: {
                                    ...merosStickyElement,
                                    removeHeaderBottomMargin: false
                                }
                            })
                        }
                    >
                        <ToggleControl
                            label={__('Remove Bottom Margin', 'meros-theme')}
                            checked={removeHeaderBottomMargin}
                            onChange={(value) =>
                                setAttributes({
                                    merosStickyElement: {
                                        ...merosStickyElement,
                                        removeHeaderBottomMargin: value
                                    }
                                })
                            }
                            disabled={headerOffset ? true : false}
                        />
                    </ToolsPanelItem>

                    <ToolsPanelItem
                        label={__('Offset Header', 'meros-theme')}
                        hasValue={() => headerOffset !== true}
                        isShownByDefault={true}
                        onDeselect={() =>
                            setAttributes({
                                merosStickyElement: {
                                    ...merosStickyElement,
                                    headerOffset: false
                                }
                            })
                        }
                    >
                        <ToggleControl
                            label={__('Offset Header', 'meros-theme')}
                            checked={headerOffset}
                            onChange={(value) => 
                                setAttributes({
                                    merosStickyElement: {
                                        ...merosStickyElement,
                                        headerOffset: value,
                                        removeHeaderBottomMargin: value ? false : removeHeaderBottomMargin
                                    }
                                })
                            }
                        />
                    </ToolsPanelItem>
                </>
            )}
        </ToolsPanel>
    );
}