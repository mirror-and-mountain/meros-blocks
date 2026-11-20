import { InspectorControls } from '@wordpress/block-editor';
import { registerBlockVariation } from '@wordpress/blocks';
import { Notice, PanelBody, ToggleControl } from '@wordpress/components';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

addFilter('blocks.registerBlockType', 'meros/searchable-query-attribute', (settings, name) => name === 'core/query' ? {
    ...settings,
    attributes: { ...settings.attributes, merosLiveSearch: { type: 'boolean', default: false } },
} : settings);

registerBlockVariation('core/query', {
    name: 'meros-blocks/searchable-query',
    title: __('Searchable Query', 'meros-blocks'),
    description: __('A native Query Loop with live title search within its configured filters.', 'meros-blocks'),
    icon: 'search',
    scope: ['inserter', 'block'],
    attributes: {
        namespace: 'meros-blocks/searchable-query',
        merosLiveSearch: true,
        enhancedPagination: false,
        query: { perPage: 6, pages: 0, offset: 0, postType: 'post', order: 'desc', orderBy: 'date', author: '', search: '', exclude: [], sticky: '', inherit: false },
    },
    isActive: (attributes) => attributes.merosLiveSearch === true,
    innerBlocks: [
        ['core/search', { label: __('Search posts', 'meros-blocks'), placeholder: __('Search titles…', 'meros-blocks'), buttonText: __('Search', 'meros-blocks') }],
        ['core/post-template', {}, [
            ['core/post-featured-image', { isLink: true }],
            ['core/post-title', { level: 3, isLink: true }],
            ['core/post-excerpt', { excerptLength: 24 }],
        ]],
        ['core/query-pagination', { layout: { type: 'flex', justifyContent: 'center' } }, [
            ['core/query-pagination-previous'], ['core/query-pagination-numbers'], ['core/query-pagination-next'],
        ]],
        ['core/query-no-results', {}, [['core/paragraph', { content: __('No posts found.', 'meros-blocks') }]]],
    ],
});

addFilter('editor.BlockEdit', 'meros/searchable-query-controls', (BlockEdit) => (props) => {
    if (props.name !== 'core/query') return <BlockEdit {...props} />;
    const inherited = props.attributes.query?.inherit !== false;
    return (
        <>
            <BlockEdit {...props} />
            {props.isSelected && (
                <InspectorControls>
                    <PanelBody title={__('Live search', 'meros-blocks')}>
                        <ToggleControl
                            label={__('Live title search', 'meros-blocks')}
                            checked={props.attributes.merosLiveSearch === true}
                            onChange={(enabled) => props.setAttributes({ merosLiveSearch: enabled, ...(enabled ? { enhancedPagination: false } : {}) })}
                            help={__('On the front end, a Search block inside this query updates its results as visitors type. Add one anywhere outside the Post Template. Query filters and ordering still apply.', 'meros-blocks')}
                            __nextHasNoMarginBottom
                        />
                        {inherited && props.attributes.merosLiveSearch === true && (
                            <Notice status="warning" isDismissible={false}>
                                {__('Switch off “Inherit query from template” in the Query Loop settings to enable live search.', 'meros-blocks')}
                            </Notice>
                        )}
                    </PanelBody>
                </InspectorControls>
            )}
        </>
    );
});
