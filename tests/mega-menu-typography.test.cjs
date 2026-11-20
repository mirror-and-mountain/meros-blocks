const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const babel = require('@babel/core');
const { chromium } = require('playwright');

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

    test('current panel links highlight only their parent group with independent current styles and accurate aria-current', async () => {
        const edge = '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';
        const browser = await chromium.launch(fs.existsSync(edge) ? { executablePath: edge } : {});
        const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
        const build = path.join(root, 'src/resources/assets/wordpress/build/mega-menu');
        try {
            const group = (id, linked = false, override = false, hidden = false, href = '/current/?b=2&a=1#content') => `
                <li id="${id}" class="meros-dynamic-mega-menu__group" ${override ? 'data-meros-menu-color-group-link-current data-meros-menu-decoration-group-link-current style="--meros-menu-group-link-current:#008800;--meros-menu-group-link-current-decoration:none"' : ''}>
                    ${linked && !hidden ? `<a class="meros-dynamic-mega-menu__trigger meros-dynamic-mega-menu__group-link" href="/group-page">Group ${id}</a>` : ''}
                    <details class="meros-dynamic-mega-menu__disclosure">
                        <summary class="meros-dynamic-mega-menu__trigger${hidden ? ' meros-dynamic-mega-menu__trigger--no-chevron' : ''}" ${linked ? 'data-meros-menu-url="/group-page"' : ''}><span class="meros-dynamic-mega-menu__summary-label">Group ${id}</span></summary>
                        <div class="meros-dynamic-mega-menu__panel"><ul class="meros-dynamic-mega-menu__links"><li><a href="${href}">Panel ${id}</a></li></ul></div>
                    </details>
                </li>`;
            const html = `<nav class="meros-dynamic-mega-menu"
                data-meros-menu-color-group data-meros-menu-color-group-link data-meros-menu-color-group-link-current data-meros-menu-decoration-group-link-current
                data-meros-menu-color-panel-link data-meros-menu-color-panel-link-current data-meros-menu-decoration-panel-link-current
                style="--meros-menu-group:#333333;--meros-menu-group-link:#555555;--meros-menu-panel-link:#777777;--meros-menu-group-link-current:#cc0000;--meros-menu-group-link-current-decoration:line-through;--meros-menu-panel-link-current:#0000cc;--meros-menu-panel-link-current-decoration:underline">
                <ul class="meros-dynamic-mega-menu__groups">${group('unlinked')}${group('linked', true, true)}${group('hidden', true, false, true)}${group('other', false, false, false, '/elsewhere')}
                    <li id="outer" class="meros-dynamic-mega-menu__group"><details class="meros-dynamic-mega-menu__disclosure"><summary class="meros-dynamic-mega-menu__trigger">Outer</summary><div class="meros-dynamic-mega-menu__panel"><ul>${group('nested')}</ul></div></details></li>
                </ul>
            </nav>`;
            await page.route('https://menu.test/**', (route) => route.fulfill({ contentType: 'text/html', body: html }));
            await page.goto('https://menu.test/current/?a=1&b=2');
            await page.addStyleTag({ content: fs.readFileSync(path.join(build, 'style-index.css'), 'utf8') });
            await page.addScriptTag({ content: fs.readFileSync(path.join(build, 'index.js'), 'utf8') });
            const style = (selector) => page.locator(selector).evaluate((element) => ({
                color: getComputedStyle(element).color, decoration: getComputedStyle(element).textDecorationLine,
            }));
            assert.deepEqual(await style('#unlinked summary'), { color: 'rgb(204, 0, 0)', decoration: 'line-through' });
            assert.deepEqual(await style('#unlinked .meros-dynamic-mega-menu__summary-label'), { color: 'rgb(204, 0, 0)', decoration: 'line-through' });
            assert.deepEqual(await style('#hidden summary'), { color: 'rgb(204, 0, 0)', decoration: 'line-through' });
            assert.deepEqual(await style('#linked > a'), { color: 'rgb(0, 136, 0)', decoration: 'none' }, 'Group overrides must remain independent of panel styles');
            assert.deepEqual(await style('#linked .meros-dynamic-mega-menu__links a'), { color: 'rgb(0, 0, 204)', decoration: 'underline' });
            assert.equal(await page.locator('#linked > a').getAttribute('aria-current'), null, 'A parent destination must not claim to be the current page');
            assert.equal(await page.locator('#linked .meros-dynamic-mega-menu__links a').getAttribute('aria-current'), 'page');
            assert.equal(await page.locator('#other summary').evaluate((element) => element.classList.contains('meros-menu-current-page')), false);
            assert.equal(await page.locator('#outer > details > summary').evaluate((element) => element.classList.contains('meros-menu-current-page')), false, 'A current link belongs only to its nearest group, not every enclosing panel');
            assert.equal(await page.locator('#nested summary').evaluate((element) => element.classList.contains('meros-menu-current-page')), true);
            await page.setViewportSize({ width: 500, height: 800 });
            assert.deepEqual(await style('#linked .meros-dynamic-mega-menu__summary-label'), { color: 'rgb(0, 136, 0)', decoration: 'none' }, 'The mobile label must use the group current style too');
            await page.evaluate(() => {
                history.pushState({}, '', '/elsewhere');
                window.dispatchEvent(new PopStateEvent('popstate'));
            });
            assert.equal(await page.locator('#unlinked .meros-menu-current-page, #linked .meros-menu-current-page, #hidden .meros-menu-current-page').count(), 0, 'Navigation must clear stale ancestor highlights');
            assert.equal(await page.locator('#other summary').evaluate((element) => element.classList.contains('meros-menu-current-page')), true);
            assert.equal(await page.locator('#linked .meros-dynamic-mega-menu__links a').getAttribute('aria-current'), null);
            await page.evaluate(() => {
                history.pushState({}, '', '/group-page');
                document.dispatchEvent(new Event('livewire:navigated'));
            });
            assert.equal(await page.locator('#linked > a').getAttribute('aria-current'), 'page', 'Direct group-page matching must remain intact');
            assert.equal(await page.locator('#other .meros-menu-current-page').count(), 0);
            assert.deepEqual(await style('#hidden summary'), { color: 'rgb(204, 0, 0)', decoration: 'line-through' });
        } finally { await browser.close(); }
    });
