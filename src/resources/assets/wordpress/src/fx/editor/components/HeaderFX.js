import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { previewFx, updateFx, hasSiteLogo } from '../utils.js';
import { getFxAttrs } from '../hooks/fxAttributes.js';
import { Enable, Color, SiteLogo } from './FX.js';

export default function HeaderFX({ attributes, setAttributes, clientId, setPreview }) {
    const {
        enabled,
        headerAnimateBgColor,
        headerAnimateTextColor,
        headerAnimateLinkColor,
        headerAnimateLinkHoverColor,
        headerAnimateLogoWidth
    } = attributes.merosHeaderFx;

    const stickyFx = attributes.merosStickyElement || {};
    const defaultValues = getFxAttrs('Header');
    const preview = previewFx.headerPreviewFx[clientId] || false;

    const update = (patch) => {
        updateFx(
            setAttributes,
            'merosHeaderFx',
            attributes.merosHeaderFx,
            patch
        );
    }

    const previewAnimation = () => {
        setPreview('header', clientId, !preview);
        // Force a re-render
        setAttributes({
            merosHeaderFx: {
                ...attributes.merosHeaderFx,
                enabled: true
            }
        });
    }

    return (
        <>
            <Enable
                enabled={enabled}
                onChange={(value) => {
                    if (value === false) {
                        update(defaultValues);
                        setPreview('header', clientId, false);
                        return;
                    }
                    update({ enabled: true });
                }}
                disable={ stickyFx.enabled ? () => false : () => true }
            />

            {enabled && (
                <>
                    <Button
                        variant="secondary"
                        onClick={previewAnimation}
                        style={{ width: '100%' }}
                    >
                        {__(preview ? 'Stop Previewing in Editor' : 'Preview In Editor', 'meros-theme')}
                    </Button>

                    <Color
                        bg={headerAnimateBgColor}
                        text={headerAnimateTextColor}
                        link={headerAnimateLinkColor}
                        duration={false}
                        delay={false}
                        prefix="header"
                        defaultValues={{
                            headerAnimateBgColor: '',
                            headerAnimateTextColor: '',
                            headerAnimateLinkColor: '',
                            headerAnimateLinkHoverColor: ''
                        }}
                        update={update}
                        linkHover={headerAnimateLinkHoverColor}
                        showControls={true}
                        showTiming={false}
                    />

                    {hasSiteLogo(clientId) && (
                        <SiteLogo
                            width={headerAnimateLogoWidth}
                            defaultValues={{
                                headerAnimateLogoWidth: 100
                            }}
                            update={update}
                        />
                    )}
                </>
            )}
        </>
    );
}