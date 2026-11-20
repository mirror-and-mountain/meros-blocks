import { InspectorControls, PanelColorSettings } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

const colourPrefix = 'menu_color_';
const decorationPrefix = 'menu_decoration_';
const decorationOptions = [
    { value: 'none', label: __('None', 'meros-blocks') },
    { value: 'underline', label: __('Underline', 'meros-blocks') },
    { value: 'line-through', label: __('Strikethrough', 'meros-blocks') },
];
const colourPattern = /^(?:#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|[a-z]+|(?:rgba?|hsla?)\([0-9.,% +/-]+\))$/i;
const getStyleAttributes = (name, prefix) => Object.entries(window.meros_script_data?.blocks?.[name]?.attributes ?? {})
    .filter(([key, { label }]) => key.startsWith(prefix) && label);
const getStyleValue = (attributes, key, { style_fallbacks = [] }) =>
    [key, ...style_fallbacks].map((candidate) => attributes[candidate]).find((value) => value !== undefined && value !== '') ?? '';
function styleUpdate(name, attributes, key, value) {
    const updates = {};
    for (const prefix of [colourPrefix, decorationPrefix]) {
        for (const [candidate, definition] of getStyleAttributes(name, prefix)) {
            const fallbacks = definition.style_fallbacks ?? [];
            if (!fallbacks.some((fallback) => attributes[fallback])) continue;
            updates[candidate] = getStyleValue(attributes, candidate, definition);
            for (const fallback of fallbacks) updates[fallback] = '';
        }
    }
    return { ...updates, [key]: value };
}
const getPart = (name) => {
    const slug = name.split('/').pop();
    return slug === 'mega-menu' ? 'menu' : slug === 'mega-menu-group' ? 'group' : slug === 'mega-menu-custom-column' ? 'column' : null;
};

function GroupPreviewPosition({ clientId }) {
    const marker = useRef(null);
    const open = useSelect((select) => {
        const editor = select('core/block-editor');
        return editor.isBlockSelected(clientId) || editor.hasSelectedInnerBlock(clientId, true);
    }, [clientId]);

    useEffect(() => {
        const doc = marker.current?.ownerDocument;
        const group = doc?.getElementById(`block-${clientId}`);
        const nav = group?.closest('.meros-mega-menu-editor--menu');
        const view = doc?.defaultView;
        if (!open || !nav || !view) return;

        const header = nav.closest('header, [role="banner"]');
        const canvas = nav.closest('.editor-styles-wrapper') ?? doc.documentElement;
        const align = () => {
            const groupBox = group.getBoundingClientRect();
            const below = (header ?? nav).getBoundingClientRect().bottom;
            const canvasBox = canvas.getBoundingClientRect();
            const left = groupBox.left + group.clientLeft;
            group.style.setProperty('--meros-editor-panel-left', `${canvasBox.left + canvas.clientLeft - left}px`);
            group.style.setProperty('--meros-editor-panel-width', `${canvas.clientWidth}px`);
            group.style.setProperty('--meros-editor-panel-top', `${Math.max(group.clientHeight, below - groupBox.top - group.clientTop)}px`);
        };
        align();
        const observer = new view.ResizeObserver(align);
        for (const element of new Set([canvas, nav, group, header].filter(Boolean))) observer.observe(element);
        view.addEventListener('resize', align);

        return () => {
            observer.disconnect();
            view.removeEventListener('resize', align);
        };
    }, [clientId, open]);

    return <span hidden ref={marker} />;
}

function LinkDecorationControls({ controls, attributes, update, inherited, column }) {
    return (
        <PanelBody title={__('Link decorations', 'meros-blocks')} initialOpen={false}>
            {inherited && <p>{__('Default inherits the parent setting.', 'meros-blocks')}</p>}
            <p>{column
                ? __('Current decoration applies to links to the current page.', 'meros-blocks')
                : __('Group decoration applies to linked and unlinked labels. Group current decoration also applies when a panel link is the current page.', 'meros-blocks')}</p>
            {controls.map(([key, definition]) => (
                <SelectControl
                    key={key}
                    label={definition.label}
                    value={getStyleValue(attributes, key, definition)}
                    options={[{ label: __('Default', 'meros-blocks'), value: '' }, ...decorationOptions]}
                    onChange={(value) => update(key, value)}
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            ))}
        </PanelBody>
    );
}

addFilter('editor.BlockEdit', 'meros/dynamic-mega-menu-styles', (BlockEdit) => (props) => {
    const { name, attributes, setAttributes, clientId, isSelected } = props;
    const part = getPart(name);
    if (!part) return <BlockEdit {...props} />;
    const colours = getStyleAttributes(name, colourPrefix);
    const decorations = getStyleAttributes(name, decorationPrefix);
    const inherited = part !== 'menu';
    const update = (key, value) => setAttributes(styleUpdate(name, attributes, key, value));

    return (
        <>
            <BlockEdit {...props} />
            {part === 'group' && <GroupPreviewPosition clientId={clientId} />}
            {isSelected && (
                <InspectorControls group="styles">
                    {decorations.length > 0 && (
                        <LinkDecorationControls
                            controls={decorations}
                            attributes={attributes}
                            update={update}
                            inherited={inherited}
                            column={part === 'column'}
                        />
                    )}
                    {colours.length > 0 && (
                        <PanelColorSettings
                            title={__('Mega menu colours', 'meros-blocks')}
                            colorSettings={colours.map(([key, definition]) => ({
                                label: definition.label,
                                value: getStyleValue(attributes, key, definition) || undefined,
                                onChange: (value) => update(key, value || ''),
                                enableAlpha: false,
                            }))}
                        >
                            <p>{__('Group label is for unlinked labels. Group link current also highlights the parent label of a current panel link. Current is not keyboard focus; hover also applies on keyboard focus.', 'meros-blocks')}</p>
                            {inherited && <p>{__('Clear a colour to inherit the menu style.', 'meros-blocks')}</p>}
                        </PanelColorSettings>
                    )}
                </InspectorControls>
            )}
        </>
    );
});

addFilter('editor.BlockListBlock', 'meros/dynamic-mega-menu-preview', (BlockListBlock) => (props) => {
    const { name, attributes, wrapperProps } = props;
    const part = getPart(name);
    if (!part) return <BlockListBlock {...props} />;
    const colours = getStyleAttributes(name, colourPrefix);
    const style = { ...wrapperProps?.style };
    const data = {};
    const legacyText = attributes.menu_color_panel_text;
    if (part !== 'column' && typeof legacyText === 'string' && colourPattern.test(legacyText)) {
        style['--meros-menu-panel-text'] = legacyText;
    }
    for (const [key, definition] of colours) {
        const raw = getStyleValue(attributes, key, definition);
        const value = typeof raw === 'string' ? raw.trim() : '';
        if (!value || !colourPattern.test(value)) continue;
        const role = key.slice(colourPrefix.length).replaceAll('_', '-');
        style[`--meros-menu-${role}`] = value;
        data[`data-meros-menu-color-${role}`] = 'true';
    }
    for (const [key, definition] of getStyleAttributes(name, decorationPrefix)) {
        const value = getStyleValue(attributes, key, definition);
        if (!decorationOptions.some((option) => option.value === value)) continue;
        const role = key.slice(decorationPrefix.length).replaceAll('_', '-');
        style[`--meros-menu-${role}-decoration`] = value;
        data[`data-meros-menu-decoration-${role}`] = 'true';
    }

    return (
        <BlockListBlock
            {...props}
            wrapperProps={{
                ...wrapperProps,
                ...data,
                className: [
                    wrapperProps?.className,
                    `meros-mega-menu-editor--${part}`,
                    part === 'menu' && `meros-mega-menu-editor--${attributes.menu_orientation === 'vertical' ? 'vertical' : 'horizontal'}`,
                ].filter(Boolean).join(' '),
                style,
            }}
        />
    );
});
