import { createHigherOrderComponent } from '@wordpress/compose';
import { useEffect } from '@wordpress/element';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { InspectorControls, PanelBody } from '../../../components/Controls.js';
import { isDirectChildOf, isChildOf } from '../../../utils/editor.js';

import StickyControls from './StickyControls.js';
import ScrollFX from './ScrollFX.js';
import HoverFX from './HoverFX.js';
import HeaderFX from './HeaderFX.js';

import {
    setPreviewFx,
    isCompatible,
    ScrollFxBlocks,
    HoverFxBlocks,
    HeaderFxBlocks
} from '../utils.js';

export const AnimationControls = createHigherOrderComponent((BlockEdit) => {
    return (props) => {
        const { name, attributes, setAttributes, clientId } = props;

        if (!isCompatible(name)) {
            return <BlockEdit {...props} />;
        }

        const isHeader = name === 'core/template-part' && attributes?.slug === 'header' ||
            name === 'core/group' && attributes?.tagName === 'header';

        const isInHeader = isChildOf(
            clientId, 
            ['core/template-part', 'core/group'], 
            function (block) { 
                if (block.name === 'core/template-part') {
                    return block.attributes?.slug === 'header';
                } else if (block.name === 'core/group') {
                    return block.attributes?.tagName === 'header';
                }
            }
        );

        const isInSwiper = isChildOf('meros/swiper', clientId);

        // Update wp preset colours for headerfx
        useEffect(() => {
            if (!isHeader) return;
            if (!attributes.merosHeaderFx?.enabled) return;

            const headerBgColor =
                attributes.backgroundColor
                    ? `var(--wp--preset--color--${attributes.backgroundColor})`
                    : attributes?.style?.color?.background ?? '#FFFFFF00';

            const headerTextColor =
                attributes.textColor
                    ? `var(--wp--preset--color--${attributes.textColor})`
                    : attributes?.style?.color?.text ?? '#000000';

            const headerLinkColor =
                attributes?.style?.elements?.link?.color?.text
                    ? attributes.style.elements.link.color.text
                    : '#0000EE';

            const headerLinkHoverColor =
                attributes?.style?.elements?.link?.[':hover']?.color?.text
                    ? attributes.style.elements.link[':hover'].color.text
                    : '#551A8B';

            setAttributes({
                merosHeaderFx: {
                    ...attributes.merosHeaderFx,
                    headerAnimateBgColorEnd: headerBgColor,
                    headerAnimateTextColorEnd: headerTextColor,
                    headerAnimateLinkColorEnd: headerLinkColor,
                    headerAnimateLinkHoverColorEnd: headerLinkHoverColor
                }
            });

        }, [
            attributes.backgroundColor,
            attributes.textColor,
            attributes.style,
            attributes.merosHeaderFx?.enabled
        ]);

        return (
            <Fragment>
                <BlockEdit {...props} />
                <InspectorControls>
                    {ScrollFxBlocks.includes(name) && !isHeader && !isInHeader && (
                        <PanelBody title={__('Scroll Animation', 'meros-theme')} initialOpen={false}>
                            <ScrollFX
                                attributes={attributes}
                                setAttributes={setAttributes}
                                isInSwiper={isInSwiper}
                            />
                        </PanelBody>
                    )}

                    {HoverFxBlocks.includes(name) && !isHeader && (
                        <PanelBody title={__('Hover Animation', 'meros-theme')} initialOpen={false}>
                            <HoverFX
                                attributes={attributes}
                                setAttributes={setAttributes}
                                clientId={clientId}
                                setPreview={setPreviewFx}
                            />
                        </PanelBody>
                    )}

                    {HeaderFxBlocks.includes(name) && isHeader && (
                        <PanelBody title={__('Header Animation', 'meros-theme')} initialOpen={false}>
                            <HeaderFX
                                attributes={attributes}
                                setAttributes={setAttributes}
                                clientId={clientId}
                                setPreview={setPreviewFx}
                            />
                        </PanelBody>
                    )}

                    {name === 'core/group' && !isInSwiper && !isInHeader && (
                        <PanelBody title={__('Sicky Element', 'meros-theme')} initialOpen={false}>
                            <StickyControls
                                attributes={attributes}
                                setAttributes={setAttributes}
                                isHeader={isHeader}
                                clientId={clientId}
                            />
                        </PanelBody>
                    )}
                </InspectorControls>
            </Fragment>
        );
    };
}, 'addMerosControls');