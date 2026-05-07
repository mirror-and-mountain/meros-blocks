import { __ } from '@wordpress/i18n';
import SettingsControls from './settings.js';
import AnimationControls from './animation.js';
import NavigationControls from './navigation.js';
import Breakpoints from './breakpoints.js';

import { InspectorControls, PanelBody } from '../../../../assets/src/components/Controls.js';

export function SwiperControls({ attributes, setAttributes, slideCount }) {
    return (
        <InspectorControls>
            <PanelBody title={__('Swiper Settings', 'meros-theme')} initialOpen={true}>
                <SettingsControls
                    attributes={attributes}
                    setAttributes={setAttributes}
                    slideCount={slideCount}
                />
                <AnimationControls
                    attributes={attributes}
                    setAttributes={setAttributes}
                />
                <NavigationControls
                    attributes={attributes}
                    setAttributes={setAttributes}
                />
            </PanelBody>
            <Breakpoints
                attributes={attributes}
                setAttributes={setAttributes}
                slideCount={slideCount}
            />
        </InspectorControls>
    );
}

