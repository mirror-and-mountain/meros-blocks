import { __ } from '@wordpress/i18n';
import {
    ToolsPanel,
    ToolsPanelItem,
    ToggleControl,
    RangeControl
} from '../../../../assets/src/components/Controls.js';

export default function AnimationControls({ attributes, setAttributes }) {
    const {
        autoplay,
        loop,
        speed,
        autoplayDelay,
        mousewheel,
        centeredSlides,
        freeMode
    } = attributes;

    const resetAnimationSettings = () => {
        setAttributes({
            autoplay: false,
            loop: true,
            speed: 800,
            autoplayDelay: 3000
        });
    };

    return (
        <ToolsPanel label={__('Autoplay & Loop', 'meros-theme')} resetAll={resetAnimationSettings}>
            <ToolsPanelItem
                label={__('Autoplay', 'meros-theme')}
                hasValue={() => (autoplay || false) !== false}
                isShownByDefault={true}
                onDeselect={() => setAttributes({
                    autoplay: false
                })}
            >
                <ToggleControl
                    label={__('Enable Autoplay', 'meros-theme')}
                    checked={autoplay !== false}
                    onChange={(value) => setAttributes({ autoplay: value })}
                    disabled={mousewheel?.enabled === true || freeMode?.enabled === true}
                />
            </ToolsPanelItem>
            <ToolsPanelItem
                label={__('Loop', 'meros-theme')}
                hasValue={() => (loop || true) !== true}
                isShownByDefault={true}
                onDeselect={() => setAttributes({
                    loop: centeredSlides === true ? false : true
                })}
            >
                <ToggleControl
                    label={__('Enable Loop', 'meros-theme')}
                    checked={loop !== false}
                    onChange={(value) => setAttributes({ loop: value })}
                    disabled={centeredSlides === true}
                />
            </ToolsPanelItem>
            <ToolsPanelItem
                label={__('Transition Speed', 'meros-theme')}
                hasValue={() => (speed || 800) !== 800}
                isShownByDefault={true}
                onDeselect={() => setAttributes({
                    speed: 800
                })}
            >
                <RangeControl
                    label={__('Transition Speed (ms)', 'meros-theme')}
                    value={speed || 800}
                    onChange={(value) => setAttributes({ speed: parseInt(value) || 0 })}
                    min={100}
                    max={2000}
                    step={100}
                />
            </ToolsPanelItem>
            {autoplay === true && (
                <ToolsPanelItem
                    label={__('Autoplay Delay', 'meros-theme')}
                    hasValue={() => (autoplayDelay || 3000) !== 3000}
                    isShownByDefault={true}
                    onDeselect={() => setAttributes({
                        autoplayDelay: 3000
                    })}
                >
                    <RangeControl
                        label={__('Autoplay Delay (ms)', 'meros-theme')}
                        value={autoplayDelay || 3000}
                        onChange={(value) => setAttributes({ autoplayDelay: parseInt(value) || 0 })}
                        min={1000}
                        max={10000}
                        step={500}
                    />
                </ToolsPanelItem>
            )}
        </ToolsPanel>
    );
}