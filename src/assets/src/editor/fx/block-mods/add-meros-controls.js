import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';

import StickyControls from '../components/StickyControls';
import ScrollFX from '../components/ScrollFX';
import HoverFX from '../components/HoverFX';
import HeaderFX from '../components/HeaderFX';

import {
    setPreviewFx,
    getBlockParentType,
    isCompatible,
    ScrollFxBlocks,
    HoverFxBlocks,
    HeaderFxBlocks
} from './utils.js';

export const addMerosControls = createHigherOrderComponent((BlockEdit) => {
    return (props) => {
        const { name, attributes, setAttributes, clientId } = props;

        if (!isCompatible(name)) {
            return <BlockEdit {...props} />;
        }

        const isHeader = getBlockParentType(clientId) === 'header';
        const isInHeader = getBlockParentType(clientId) === 'inner-header';
        const isInSwiper = getBlockParentType(clientId) === 'swiper';

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