const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const babel = require('@babel/core');

const root = path.resolve(__dirname, '..');
const definitions = JSON.parse(execFileSync('php', ['-r',
    'ob_start(); require "tests/mega-menu-typography.test.php"; ob_end_clean(); echo json_encode(["menu"=>$block->attributes,"column"=>$column->attributes]);',
], { cwd: root, encoding: 'utf8' }));
const filters = {};
const context = {
    window: { meros_script_data: { blocks: {
        'meros/mega-menu': { attributes: definitions.menu },
        'meros/mega-menu-custom-column': { attributes: definitions.column },
    } } },
    React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) },
    require: (name) => {
        if (name === '@wordpress/hooks') return { addFilter: (hook, id, callback) => filters[hook] = callback };
        if (name === '@wordpress/i18n') return { __: (text) => text };
        if (name === '@wordpress/block-editor') return { InspectorControls: 'InspectorControls', PanelColorSettings: 'PanelColorSettings' };
        if (name === '@wordpress/components') return { PanelBody: 'PanelBody', SelectControl: 'SelectControl' };
        return {};
    },
};
const source = fs.readFileSync(path.join(root, 'src/resources/assets/wordpress/src/mega-menu/editor/index.js'), 'utf8');
vm.runInNewContext(babel.transformSync(source, {
    presets: [require.resolve('@babel/preset-react')],
    plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
    configFile: false, babelrc: false,
}).code, context);

function find(node, predicate) {
    if (!node || typeof node !== 'object') return undefined;
    if (predicate(node)) return node;
    const children = Array.isArray(node) ? node : node.props?.children ?? [];
    return children.map((child) => find(child, predicate)).find(Boolean);
}

function decorations(attributes, update = () => {}, name = 'meros/mega-menu') {
    const tree = filters['editor.BlockEdit']('Block')({
        name, attributes, isSelected: true, setAttributes: update,
    });
    return find(tree, (node) => node.type?.name === 'LinkDecorationControls');
}

test('decoration changes preserve legacy styling without resurrecting obsolete font overrides', () => {
    let update;
    const component = decorations({
        menu_color_group_label: '#abcdef', menu_decoration_text: 'underline', menu_font_size_group: 'large',
    }, (value) => update = value);
    const control = find(component.type(component.props), (node) => node.type === 'SelectControl').props;
    assert.equal(control.value, 'underline');
    control.onChange('none');
    assert.equal(update.menu_decoration_group, 'none');
    assert.equal(update.menu_color_group_link, '#abcdef');
    assert.equal(update.menu_font_size_group, undefined);
    control.onChange('');
    assert.equal(update.menu_decoration_group, '');
    assert.equal(update.menu_decoration_text, '');
});

test('columns expose only link decorations without colour controls and retain native wrapper styles', () => {
    let update;
    const tree = filters['editor.BlockEdit']('Block')({
        name: 'meros/mega-menu-custom-column', attributes: {}, isSelected: true,
        setAttributes: (value) => update = value,
    });
    assert.equal(find(tree, (node) => node.type === 'PanelColorSettings'), undefined);
    const typography = find(tree, (node) => node.type?.name === 'LinkDecorationControls');
    assert.equal(typography.props.column, true);
    assert.deepEqual(Array.from(typography.props.controls, ([key]) => key), [
        'menu_decoration_panel_link', 'menu_decoration_panel_link_current',
    ]);
    const controls = typography.type(typography.props);
    find(controls, (node) => node.type === 'SelectControl').props.onChange('none');
    assert.equal(update.menu_decoration_panel_link, 'none');

    const preview = filters['editor.BlockListBlock']('Block')({
        name: 'meros/mega-menu-custom-column',
        attributes: { menu_font_size_panel_link: 'large', menu_color_panel_link: 'red', menu_decoration_panel_link: 'none' },
        wrapperProps: { style: { fontFamily: 'Georgia, serif', fontSize: '22px' } },
    });
    assert.equal(preview.props.wrapperProps.style.fontFamily, 'Georgia, serif');
    assert.equal(preview.props.wrapperProps.style.fontSize, '22px');
    assert.equal(preview.props.wrapperProps.style['--meros-menu-panel-link-font-size'], undefined);
    assert.equal(preview.props.wrapperProps.style['--meros-menu-panel-link-decoration'], 'none');
    assert.equal(preview.props.wrapperProps.style['--meros-menu-panel-link'], undefined);
});
