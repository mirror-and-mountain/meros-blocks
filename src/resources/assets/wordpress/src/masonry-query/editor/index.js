import { InspectorControls } from '@wordpress/block-editor';
import { Notice, PanelBody, RangeControl, SelectControl, ToggleControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { observeMasonry } from '../layout';

const isMasonry = (name) => name.endsWith('/masonry-query');
const controls = (name) => Object.entries(window.meros_script_data?.blocks?.[name]?.attributes ?? {})
    .filter(([, definition]) => definition.masonry_control);
const bounded = (value, { default: fallback, masonry_control: { min, max } }) =>
    typeof value === 'number' && Number.isFinite(value) ? Math.max(min, Math.min(max, Math.round(value))) : fallback;
const maxLabels = () => ({
    masonry_columns_desktop: __('Desktop max columns', 'meros-blocks'),
    masonry_columns_tablet: __('Tablet max columns', 'meros-blocks'),
    masonry_columns_mobile: __('Mobile max columns', 'meros-blocks'),
});

function MasonryPreview({ clientId, attributes }) {
    const marker = useRef(null);
    useEffect(() => {
        const root = marker.current?.ownerDocument.getElementById(`block-${clientId}`);
        if (root) return observeMasonry(root);
    }, [clientId, attributes.masonry_columns_desktop, attributes.masonry_columns_tablet, attributes.masonry_columns_mobile, attributes.masonry_gap, attributes.masonry_varied, attributes.masonry_prioritise_sticky, attributes.masonry_sticky_shared_rows, attributes.masonry_vary_columns, attributes.masonry_column_variation]);
    return <span hidden ref={marker} />;
}

function StickyTemplatePreview({ BlockEdit, ...props }) {
    const sticky = useSelect((select) => {
        const editor = select('core/block-editor');
        let parent = editor.getBlockRootClientId(props.clientId);
        while (parent) {
            if (editor.getBlockName(parent) === 'core/query') {
                const wrapper = editor.getBlock(editor.getBlockRootClientId(parent));
                return isMasonry(wrapper?.name ?? '') && wrapper.attributes.masonry_prioritise_sticky === true;
            }
            parent = editor.getBlockRootClientId(parent);
        }
        return false;
    }, [props.clientId]);
    const query = props.context?.query;
    if (!sticky || query?.inherit || (query?.postType ?? 'post') !== 'post') return <BlockEdit {...props} />;
    return <BlockEdit {...props} context={{ ...props.context, query: { ...query, meros_masonry_priority: true } }} />;
}

function InheritedStickyNotice({ clientId, enabled }) {
    const inherited = useSelect((select) => select('core/block-editor').getBlocks(clientId)
        .some((block) => block.name === 'core/query' && block.attributes.query?.inherit), [clientId]);
    return enabled && inherited ? (
        <Notice status="warning" isDismissible={false}>
            {__('Use a custom Query Loop to prioritise sticky posts. Inherited queries retain the template ordering.', 'meros-blocks')}
        </Notice>
    ) : null;
}

addFilter('editor.BlockEdit', 'meros/masonry-query-controls', (BlockEdit) => (props) => {
    if (props.name === 'core/post-template') return <StickyTemplatePreview {...props} BlockEdit={BlockEdit} />;
    if (!isMasonry(props.name)) return <BlockEdit {...props} />;
    return (
        <>
            <BlockEdit {...props} />
            <MasonryPreview clientId={props.clientId} attributes={props.attributes} />
            {props.isSelected && (
                <InspectorControls>
                    <PanelBody title={__('Masonry layout', 'meros-blocks')}>
                        <p>{__('Select the inner Query Loop to choose posts, filters and pagination. Edit its Post Template to design the cards.', 'meros-blocks')}</p>
                        <p>{__('Column presets follow the screen width: mobile below 640px, tablet from 640px, desktop from 1024px. The editor follows its selected preview device.', 'meros-blocks')}</p>
                        <ToggleControl
                            label={__('Vary card sizes', 'meros-blocks')}
                            help={__('Mix wider cards and image proportions, consistently for each post. Text stays fully visible.', 'meros-blocks')}
                            checked={props.attributes.masonry_varied === true}
                            onChange={(value) => props.setAttributes({ masonry_varied: value })}
                            __nextHasNoMarginBottom
                        />
                        <ToggleControl
                            label={__('Prioritise sticky posts', 'meros-blocks')}
                            help={__('In custom queries, matching sticky posts appear first. Post counts and filters still apply.', 'meros-blocks')}
                            checked={props.attributes.masonry_prioritise_sticky === true}
                            onChange={(value) => props.setAttributes({ masonry_prioritise_sticky: value })}
                            __nextHasNoMarginBottom
                        />
                        {props.attributes.masonry_prioritise_sticky === true && (
                            <ToggleControl
                                label={__('Allow sticky posts to share rows', 'meros-blocks')}
                                help={__('Use the normal card layout, including size and column variation. When off, each sticky post occupies a full-width row.', 'meros-blocks')}
                                checked={props.attributes.masonry_sticky_shared_rows === true}
                                onChange={(value) => props.setAttributes({ masonry_sticky_shared_rows: value })}
                                __nextHasNoMarginBottom
                            />
                        )}
                        <InheritedStickyNotice clientId={props.clientId} enabled={props.attributes.masonry_prioritise_sticky} />
                        <ToggleControl
                            label={__('Vary column count (experimental)', 'meros-blocks')}
                            help={__('Mix column counts between groups of posts. Experimental: density changes may leave uneven gaps or produce odd layouts.', 'meros-blocks')}
                            checked={props.attributes.masonry_vary_columns === true}
                            onChange={(value) => props.setAttributes({ masonry_vary_columns: value })}
                            __nextHasNoMarginBottom
                        />
                        {props.attributes.masonry_vary_columns === true && (
                            <SelectControl
                                label={__('Column variation', 'meros-blocks')}
                                value={props.attributes.masonry_column_variation ?? 'subtle'}
                                options={[
                                    { label: __('Subtle', 'meros-blocks'), value: 'subtle' },
                                    { label: __('Broader', 'meros-blocks'), value: 'broad' },
                                ]}
                                help={__('Subtle alternates the maximum and one fewer. Broader varies from one column up to the maximum. Both stay stable between visits.', 'meros-blocks')}
                                onChange={(value) => props.setAttributes({ masonry_column_variation: value })}
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                            />
                        )}
                        {controls(props.name).map(([key, definition]) => (
                            <RangeControl
                                key={key}
                                label={props.attributes.masonry_vary_columns === true ? maxLabels()[key] ?? definition.label : definition.label}
                                value={bounded(props.attributes[key], definition)}
                                min={definition.masonry_control.min}
                                max={definition.masonry_control.max}
                                onChange={(value) => props.setAttributes({ [key]: bounded(value, definition) })}
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                            />
                        ))}
                    </PanelBody>
                </InspectorControls>
            )}
        </>
    );
});

function MasonryWrapper({ BlockListBlock, ...props }) {
    const device = useSelect((select) => select('core/editor').getDeviceType(), []);
    const style = { ...props.wrapperProps?.style };
    for (const [key, definition] of controls(props.name)) {
        style[`--meros-${key.replaceAll('_', '-')}`] = bounded(props.attributes[key], definition) + (key === 'masonry_gap' ? 'px' : '');
    }
    return (
        <BlockListBlock
            {...props}
            wrapperProps={{
                ...props.wrapperProps,
                className: [props.wrapperProps?.className, 'meros-masonry-query'].filter(Boolean).join(' '),
                'data-meros-masonry-device': device,
                'data-meros-masonry-varied': props.attributes.masonry_varied === true ? 'true' : undefined,
                'data-meros-masonry-sticky': props.attributes.masonry_prioritise_sticky === true ? 'true' : undefined,
                'data-meros-masonry-sticky-shared': props.attributes.masonry_prioritise_sticky === true && props.attributes.masonry_sticky_shared_rows === true ? 'true' : undefined,
                'data-meros-masonry-vary-columns': props.attributes.masonry_vary_columns === true ? 'true' : undefined,
                'data-meros-masonry-column-variation': props.attributes.masonry_column_variation === 'broad' ? 'broad' : 'subtle',
                style,
            }}
        />
    );
}

addFilter('editor.BlockListBlock', 'meros/masonry-query-preview', (BlockListBlock) => (props) => {
    if (!isMasonry(props.name)) return <BlockListBlock {...props} />;
    return <MasonryWrapper {...props} BlockListBlock={BlockListBlock} />;
});
