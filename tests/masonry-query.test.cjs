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
    'ob_start(); require "tests/masonry-query.test.php"; ob_end_clean(); echo json_encode($block->attributes);',
], { cwd: root, encoding: 'utf8' }));
const filters = {};
let previewDevice = 'Desktop';
const editorBlocks = {
    wrapper: { name: 'meros-blocks/masonry-query', attributes: { masonry_prioritise_sticky: true } },
    query: { name: 'core/query', parent: 'wrapper' },
    template: { name: 'core/post-template', parent: 'query' },
    nested: { name: 'core/query', parent: 'template' },
    nestedTemplate: { name: 'core/post-template', parent: 'nested' },
};
const context = {
    window: { meros_script_data: { blocks: { 'meros-blocks/masonry-query': { attributes: definitions } } } },
    React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) },
    require: (name) => {
        if (name === '@wordpress/hooks') return { addFilter: (hook, id, callback) => filters[hook] = callback };
        if (name === '@wordpress/i18n') return { __: (text) => text };
        if (name === '@wordpress/data') return { useSelect: (callback) => callback(() => ({
            getDeviceType: () => previewDevice,
            getBlockRootClientId: (id) => editorBlocks[id]?.parent,
            getBlockName: (id) => editorBlocks[id]?.name,
            getBlock: (id) => editorBlocks[id],
        })) };
        if (name === '@wordpress/block-editor') return { InspectorControls: 'InspectorControls' };
        if (name === '@wordpress/components') return { PanelBody: 'PanelBody', RangeControl: 'RangeControl', ToggleControl: 'ToggleControl', SelectControl: 'SelectControl' };
        return {};
    },
};
vm.runInNewContext(babel.transformSync(fs.readFileSync(path.join(root,
    'src/resources/assets/wordpress/src/masonry-query/editor/index.js'), 'utf8'), {
    presets: [require.resolve('@babel/preset-react')],
    plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
    configFile: false, babelrc: false,
}).code, context);

function find(node, predicate) {
    if (!node || typeof node !== 'object') return undefined;
    if (predicate(node)) return node;
    return (Array.isArray(node) ? node : node.props?.children ?? [])
        .map((child) => find(child, predicate)).find(Boolean);
}

function preview(props) {
    const element = filters['editor.BlockListBlock']('Block')(props);
    return typeof element.type === 'function' ? element.type(element.props) : element;
}

test('native inspector ranges store numbers and preview styles preserve core supports', () => {
    let update;
    const tree = filters['editor.BlockEdit']('Block')({
        name: 'meros-blocks/masonry-query', attributes: {}, isSelected: true,
        setAttributes: (value) => update = value,
    });
    const range = find(tree, (node) => node.type === 'RangeControl');
    range.props.onChange(4);
    assert.equal(update.masonry_columns_desktop, 4);
    find(tree, (node) => node.type === 'ToggleControl' && node.props.label === 'Vary card sizes').props.onChange(true);
    assert.equal(update.masonry_varied, true);
    find(tree, (node) => node.type === 'ToggleControl' && node.props.label === 'Prioritise sticky posts').props.onChange(true);
    assert.equal(update.masonry_prioritise_sticky, true);
    const wrapper = preview({
        name: 'meros-blocks/masonry-query',
        attributes: { masonry_gap: 0, masonry_columns_desktop: 50, masonry_columns_mobile: '3;color:red', masonry_varied: true, masonry_prioritise_sticky: true },
        wrapperProps: { className: 'user-class', style: { padding: '20px' }, 'data-existing': 'kept' },
    });
    assert.equal(wrapper.props.wrapperProps.style['--meros-masonry-columns-desktop'], '6');
    assert.equal(wrapper.props.wrapperProps.style['--meros-masonry-columns-mobile'], '1');
    assert.equal(wrapper.props.wrapperProps.style['--meros-masonry-gap'], '0px');
    assert.equal(wrapper.props.wrapperProps.style.padding, '20px');
    assert.equal(wrapper.props.wrapperProps.className, 'user-class meros-masonry-query');
    assert.equal(wrapper.props.wrapperProps['data-existing'], 'kept');
    assert.equal(wrapper.props.wrapperProps['data-meros-masonry-varied'], 'true');
    assert.equal(wrapper.props.wrapperProps['data-meros-masonry-sticky'], 'true');
    const unrelated = preview({ name: 'core/query', attributes: {} });
    assert.equal(unrelated.props.wrapperProps, undefined);
});

test('sticky row sharing is conditional and preserves the priority toggle', () => {
    let update;
    const render = (attributes) => filters['editor.BlockEdit']('Block')({
        name: 'meros-blocks/masonry-query', attributes, isSelected: true, setAttributes: (value) => update = value,
    });
    const isSharedControl = (node) => node.type === 'ToggleControl' && node.props.label === 'Allow sticky posts to share rows';
    assert.equal(find(render({ masonry_sticky_shared_rows: true }), isSharedControl), undefined);
    const control = find(render({ masonry_prioritise_sticky: true }), isSharedControl);
    assert.equal(control.props.checked, false);
    control.props.onChange(true);
    assert.equal(update.masonry_sticky_shared_rows, true);
    const attributes = { masonry_prioritise_sticky: true, masonry_sticky_shared_rows: true };
    const enabled = preview({ name: 'meros-blocks/masonry-query', attributes });
    assert.equal(enabled.props.wrapperProps['data-meros-masonry-sticky'], 'true');
    assert.equal(enabled.props.wrapperProps['data-meros-masonry-sticky-shared'], 'true');
    const inactive = preview({ name: 'meros-blocks/masonry-query', attributes: { ...attributes, masonry_prioritise_sticky: false } });
    assert.equal(inactive.props.wrapperProps['data-meros-masonry-sticky-shared'], undefined);
});

test('experimental column variation exposes device maximums and defaults to subtle', () => {
    let update;
    const render = (attributes) => filters['editor.BlockEdit']('Block')({
        name: 'meros-blocks/masonry-query', attributes, isSelected: true, setAttributes: (value) => update = value,
    });
    const disabled = render({});
    assert.equal(find(disabled, (node) => node.type === 'SelectControl'), undefined);
    find(disabled, (node) => node.type === 'ToggleControl' && node.props.label.includes('experimental')).props.onChange(true);
    assert.equal(update.masonry_vary_columns, true);
    const attributes = { masonry_vary_columns: true };
    const enabled = render(attributes);
    const select = find(enabled, (node) => node.type === 'SelectControl');
    assert.equal(select.props.value, 'subtle');
    select.props.onChange('broad');
    assert.equal(update.masonry_column_variation, 'broad');
    for (const label of ['Desktop max columns', 'Tablet max columns', 'Mobile max columns', 'Card gap (px)']) {
        assert.ok(find(enabled, (node) => node.type === 'RangeControl' && node.props.label === label));
    }
    const wrapper = preview({ name: 'meros-blocks/masonry-query', attributes: { ...attributes, masonry_column_variation: 'broad' } });
    assert.equal(wrapper.props.wrapperProps['data-meros-masonry-vary-columns'], 'true');
    assert.equal(wrapper.props.wrapperProps['data-meros-masonry-column-variation'], 'broad');
});

test('sticky preview extends only the direct native post query without persisting extra attributes', () => {
    const render = (clientId, query) => {
        const element = filters['editor.BlockEdit']('Block')({ name: 'core/post-template', clientId, context: { query } });
        return element.type(element.props).props.context.query;
    };
    const query = { postType: 'post', perPage: 6, taxQuery: { category: [3] } };
    assert.equal(render('template', query).meros_masonry_priority, true);
    assert.equal(query.meros_masonry_priority, undefined);
    assert.equal(render('nestedTemplate', query), query);
    const inherited = { ...query, inherit: true };
    assert.equal(render('template', inherited), inherited);
});

test('editor wrappers follow the selected WordPress preview device without changing attributes', () => {
    const attributes = { masonry_columns_desktop: 4, masonry_columns_tablet: 3, masonry_columns_mobile: 2 };
    for (const device of ['Desktop', 'Tablet', 'Mobile']) {
        previewDevice = device;
        const wrapper = preview({ name: 'meros-blocks/masonry-query', attributes });
        assert.equal(wrapper.props.wrapperProps['data-meros-masonry-device'], device);
        assert.equal(wrapper.props.attributes, attributes);
    }
    previewDevice = 'Desktop';
});

const build = path.join(root, 'src/resources/assets/wordpress/build/masonry-query');
const css = fs.readFileSync(path.join(build, 'style-index.css'), 'utf8');
const script = fs.readFileSync(path.join(build, 'index.js'), 'utf8');
const heights = [180, 90, 240, 150, 100, 130, 75];

function fixture(id = 'grid', width = 1100, gap = 24) {
    return `<section id="${id}" class="meros-masonry-query" style="width:${width}px;--meros-masonry-gap:${gap}px">
        <div class="wp-block-query"><ul class="wp-block-post-template is-flex-container columns-3" style="display:flex;gap:40px">
        ${heights.map((height, index) => `<li class="wp-block-post" data-id="${index}"><a href="#post-${index}" style="display:block;height:${height}px">Post ${index}</a></li>`).join('')}
        </ul><nav class="wp-block-query-pagination"><a href="?query-8-page=2">Next page</a></nav></div></section>`;
}

async function geometry(page, id = 'grid') {
    return page.locator(`#${id} > .wp-block-query > ul > li`).evaluateAll((cards) => cards.map((card) => {
        const { x, y, width, height } = card.getBoundingClientRect();
        return { id: card.dataset.id, x, y, width, height };
    }));
}

function packed(cards, columns, gap = 24, scale = 1) {
    assert.deepEqual(cards.map((card) => card.id), heights.map((_, index) => String(index)), 'DOM order must stay intact');
    const starts = [...new Set(cards.slice(0, columns).map((card) => card.x))].sort((a, b) => a - b);
    assert.equal(starts.length, columns, 'The responsive column count must match');
    const bottoms = starts.map(() => cards[0].y);
    cards.forEach((card, index) => {
        const column = starts.findIndex((x) => Math.abs(x - card.x) < 1);
        assert.ok(column >= 0);
        const next = Math.min(...bottoms);
        assert.ok(Math.abs(card.y - next) <= 1 * scale, `Card ${index} must fill the next available column`);
        assert.ok(Math.abs(card.y - bottoms[column]) <= 1 * scale, `Card ${index} must have the configured gap, without overlap`);
        assert.ok(card.y >= bottoms[column] - 0.01, `Card ${index} must not overlap or reduce the configured gap`);
        bottoms[column] = card.y + card.height + gap * scale;
        if (index) assert.ok(card.y >= cards[index - 1].y - 1, 'Visual order must follow DOM order');
    });
}

test('browser geometry, responsive repacking, native query replacement and isolation', async (t) => {
    const edge = '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';
    const browser = await chromium.launch(fs.existsSync(edge) ? { executablePath: edge } : {});
    try {
        await t.test('packs uneven cards and responds to content, container width and zoom', async () => {
            const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
            try {
                const errors = [];
                page.on('pageerror', (error) => errors.push(error.message));
                await page.setContent(`<style>ul{padding:0;margin:0;list-style:none}.columns-3>li{width:30%}</style>${fixture()}`);
                await page.addStyleTag({ content: css });
                await page.addScriptTag({ content: script });
                await page.waitForFunction(() => document.querySelector('#grid li').style.gridRowEnd);
                packed(await geometry(page), 3);
                await page.locator('#grid li a').first().evaluate((element) => element.style.height = '310px');
                await page.waitForFunction(() => document.querySelector('#grid li').style.gridRowEnd === 'span 334');
                packed(await geometry(page), 3);
                await page.locator('#grid li').first().evaluate((card) => {
                    const image = document.createElement('img');
                    image.style.cssText = 'display:block;width:100%';
                    card.append(image);
                    image.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100"/>';
                });
                await page.locator('#grid img').evaluate((image) => image.decode());
                await page.waitForFunction(() => {
                    const card = document.querySelector('#grid li');
                    return card.style.gridRowEnd === `span ${Math.ceil(parseFloat(getComputedStyle(card).height) + 24)}`;
                });
                packed(await geometry(page), 3);
                await page.locator('#grid li').first().evaluate((card) => {
                    const text = document.createElement('p');
                    text.textContent = 'Cards must reflow when font metrics change. '.repeat(5);
                    text.style.cssText = 'margin:0;font:16px/1.5 sans-serif';
                    card.append(text);
                });
                const before = (await geometry(page))[0].height;
                await page.locator('#grid li p').evaluate((text) => text.style.fontSize = '28px');
                await page.waitForFunction(() => {
                    const card = document.querySelector('#grid li');
                    return card.style.gridRowEnd === `span ${Math.ceil(parseFloat(getComputedStyle(card).height) + 24)}`;
                });
                assert.ok((await geometry(page))[0].height > before, 'Changed font metrics must resize the card');
                packed(await geometry(page), 3);
                for (const [width, columns] of [[900, 3], [500, 3]]) {
                    await page.locator('#grid').evaluate((element, width) => element.style.width = `${width}px`, width);
                    await page.waitForFunction(({ columns }) => {
                        const cards = [...document.querySelectorAll('#grid li')];
                        return new Set(cards.slice(0, 3).map((card) => card.offsetLeft)).size === columns;
                    }, { columns });
                    await page.waitForFunction(() => {
                        const card = document.querySelector('#grid li');
                        return card.style.gridRowEnd === `span ${Math.ceil(parseFloat(getComputedStyle(card).height) + 24)}`;
                    });
                    packed(await geometry(page), columns);
                }
                await page.locator('#grid').evaluate((element) => {
                    element.style.width = '1100px';
                    element.style.transformOrigin = 'top left';
                    element.style.transform = 'scale(0.5)';
                });
                await page.waitForFunction(() => new Set([...document.querySelectorAll('#grid li')].slice(0, 3).map((card) => card.offsetLeft)).size === 3);
                await page.waitForFunction(() => {
                    const card = document.querySelector('#grid li');
                    return card.style.gridRowEnd === `span ${Math.ceil(parseFloat(getComputedStyle(card).height) + 24)}`;
                });
                packed(await geometry(page), 3, 24, 0.5);
                assert.deepEqual(errors, [], 'Layout must not cause observer loops or uncaught errors');
            } finally { await page.close(); }
        });

        await t.test('honours selected column counts by viewport and editor device, not container width', async () => {
            const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
            try {
                await page.setContent(`<style>ul{padding:0;margin:0;list-style:none}</style>${fixture('grid', 794)}`);
                await page.locator('#grid').evaluate((element) => {
                    element.style.maxWidth = '100%';
                    element.style.setProperty('--meros-masonry-columns-desktop', '4');
                    element.style.setProperty('--meros-masonry-columns-tablet', '3');
                    element.style.setProperty('--meros-masonry-columns-mobile', '2');
                });
                await page.addStyleTag({ content: css });
                await page.addScriptTag({ content: script });
                await page.waitForFunction(() => document.querySelector('#grid li').style.gridRowEnd);
                packed(await geometry(page), 4);
                await page.locator('#grid').evaluate((element) => element.style.width = '500px');
                packed(await geometry(page), 4);
                for (const [width, columns] of [[1024, 4], [1023, 3], [640, 3], [639, 2]]) {
                    await page.setViewportSize({ width, height: 900 });
                    await page.waitForFunction((count) => getComputedStyle(document.querySelector('#grid ul')).gridTemplateColumns.split(' ').length === count, columns);
                    packed(await geometry(page), columns);
                }
                for (const width of [375, 1400]) {
                    await page.setViewportSize({ width, height: 900 });
                    for (const [device, columns] of [['Desktop', 4], ['Tablet', 3], ['Mobile', 2]]) {
                        await page.locator('#grid').evaluate((element, device) => element.setAttribute('data-meros-masonry-device', device), device);
                        packed(await geometry(page), columns);
                    }
                }
            } finally { await page.close(); }
        });

        await t.test('varies stable post sizes, features sticky rows and keeps text and responsive cards intact', async () => {
            const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
            try {
                async function load() {
                    await page.setContent(`<style>ul,figure,p{padding:0;margin:0;list-style:none}img{display:block}</style>${fixture()}`);
                    await page.locator('#grid').evaluate((element) => {
                        element.dataset.merosMasonryVaried = 'true';
                        element.dataset.merosMasonrySticky = 'true';
                        for (const [index, card] of [...element.querySelectorAll('li')].entries()) {
                            card.classList.add(`post-${index + 1}`);
                            if (index < 2) card.classList.add('meros-masonry-sticky');
                            card.innerHTML = `<figure class="wp-block-post-featured-image"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'/%3E"></figure><p>Post ${index}: ${'Full visible post text. '.repeat(index + 1)}</p>`;
                        }
                    });
                    await page.addStyleTag({ content: css });
                    await page.addScriptTag({ content: script });
                    await page.locator('#grid img').evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
                }
                async function settle() {
                    await page.waitForFunction(() => [...document.querySelectorAll('#grid > .wp-block-query > ul > li')].every(
                        (card) => card.style.gridRowEnd === `span ${Math.ceil(card.getBoundingClientRect().height + 24)}`
                    ));
                }
                async function sizes() {
                    return page.locator('#grid li').evaluateAll((cards) => cards.map((card) => ({
                        id: card.dataset.id,
                        column: card.style.gridColumnEnd,
                        ratio: card.style.getPropertyValue('--meros-masonry-image-ratio'),
                        text: card.textContent,
                    })));
                }
                function separated(cards) {
                    for (let i = 0; i < cards.length; i++) {
                        for (const other of cards.slice(i + 1)) {
                            const card = cards[i];
                            assert.ok(card.x + card.width + 23.99 <= other.x ||
                                other.x + other.width + 23.99 <= card.x ||
                                card.y + card.height + 23.99 <= other.y ||
                                other.y + other.height + 23.99 <= card.y, 'Mixed spans must not overlap and must retain the gap');
                        }
                    }
                }
                await load();
                await settle();
                const initial = await sizes();
                const cards = await geometry(page);
                assert.deepEqual(initial.map((card) => card.id), heights.map((_, index) => String(index)), 'Card variation must preserve reading order');
                assert.ok(initial.slice(2).some((card) => card.column === 'span 2'), 'Some regular cards must be wider');
                assert.ok(new Set(initial.slice(2).map((card) => card.ratio)).size > 1, 'Image proportions must vary');
                const gridWidth = await page.locator('#grid ul').evaluate((grid) => grid.clientWidth);
                assert.ok(Math.abs(cards[0].width - gridWidth) < 0.1);
                assert.ok(Math.abs(cards[1].width - gridWidth) < 0.1);
                assert.ok(cards[1].y >= cards[0].y + cards[0].height + 23.99);
                assert.ok(cards.slice(2).every((card) => card.y >= cards[1].y + cards[1].height + 23.99));
                separated(cards);
                const imageRatios = await page.locator('#grid img').evaluateAll((images) => images.map((image) => {
                    const box = image.getBoundingClientRect();
                    return box.width / box.height;
                }));
                for (const [index, card] of initial.entries()) {
                    const [width, height] = card.ratio.split('/').map(Number);
                    assert.ok(Math.abs(imageRatios[index] - width / height) < 0.01, 'The chosen proportion must actually render');
                }
                await page.setViewportSize({ width: 500, height: 900 });
                await page.locator('#grid').evaluate((element) => element.style.width = '450px');
                await settle();
                const mobile = await geometry(page);
                assert.ok(mobile.every((card) => Math.abs(card.width - 450) < 0.1), 'Wider cards must not create implicit columns on mobile');
                separated(mobile);
                assert.deepEqual((await sizes()).map((card) => card.text), initial.map((card) => card.text), 'Text must not be trimmed to force card heights');
                await page.setViewportSize({ width: 1400, height: 900 });
                await load();
                await settle();
                assert.deepEqual(await sizes(), initial, 'Stable sizes must survive a fresh render');
                await page.locator('#grid').evaluate((element) => {
                    window.removedMasonry = element;
                    element.remove();
                });
                await page.waitForFunction(() => !window.removedMasonry.querySelector('ul').hasAttribute('data-meros-masonry-grid'));
                assert.equal(await page.evaluate(() => window.removedMasonry.querySelector('[data-meros-masonry-image]')), null);
                assert.equal(await page.evaluate(() => window.removedMasonry.querySelector('li').style.gridColumnEnd), '');
                await page.evaluate(() => {
                    delete window.removedMasonry.dataset.merosMasonryVaried;
                    delete window.removedMasonry.dataset.merosMasonrySticky;
                    document.body.append(window.removedMasonry);
                });
                await settle();
                assert.ok((await sizes()).every((card) => card.column === '' && card.ratio === ''), 'Disabling both options must restore uniform cards');
                assert.ok(await page.locator('#grid img').evaluateAll((images) => images.every((image) => {
                    const box = image.getBoundingClientRect();
                    return Math.abs(box.width / box.height - 1.5) < 0.01;
                })), 'Disabling variation must restore original image proportions');
            } finally { await page.close(); }
        });

        await t.test('shared sticky rows use normal card and column variation and can return to full-width rows', async () => {
            for (const variable of [false, true]) {
                const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
                try {
                    await page.setContent(`<style>ul,figure,p{padding:0;margin:0;list-style:none}img{display:block}</style>${fixture()}`);
                    await page.locator('#grid').evaluate((root, variable) => {
                        root.dataset.merosMasonryVaried = 'true';
                        if (variable) root.dataset.merosMasonryVaryColumns = 'true';
                        root.style.setProperty('--meros-masonry-columns-desktop', '4');
                        [...root.querySelectorAll('li')].forEach((card, index) => {
                            card.classList.add(`post-${index + 1}`);
                            if (index < 2) card.classList.add('meros-masonry-sticky');
                            card.innerHTML = `<figure class="wp-block-post-featured-image"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'/%3E"></figure><p>Post ${index}</p>`;
                        });
                    }, variable);
                    await page.addStyleTag({ content: css });
                    await page.addScriptTag({ content: script });
                    await page.locator('#grid img').evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
                    async function snapshot() {
                        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
                        return page.locator('#grid li').evaluateAll((cards) => cards.map((card) => {
                            const { x, y, width, height } = card.getBoundingClientRect();
                            return { id: card.dataset.id, x, y, width, height, ratio: card.style.getPropertyValue('--meros-masonry-image-ratio') };
                        }));
                    }
                    const normal = await snapshot();
                    await page.locator('#grid').evaluate((root) => {
                        root.dataset.merosMasonrySticky = 'true';
                        root.dataset.merosMasonryStickyShared = 'true';
                    });
                    const shared = await snapshot();
                    assert.deepEqual(shared, normal, 'Shared sticky posts must receive exactly the normal size, image and column variation');
                    assert.equal(shared[0].y, shared[1].y, 'Sticky posts must be allowed on the same row');
                    assert.ok(shared.slice(0, 2).every((card) => card.width < 1100));
                    await page.locator('#grid').evaluate((root) => delete root.dataset.merosMasonryStickyShared);
                    const full = await snapshot();
                    assert.ok(full.slice(0, 2).every((card) => Math.abs(card.width - 1100) < 0.1 && card.ratio === '16 / 9'));
                    assert.ok(full[1].y >= full[0].y + full[0].height + 23.99, 'Disabling sharing must restore separate full-width rows');
                    await page.locator('#grid').evaluate((root) => root.dataset.merosMasonryStickyShared = 'true');
                    assert.deepEqual(await snapshot(), normal, 'Re-enabling sharing must restore the same stable layout');
                } finally { await page.close(); }
            }
        });

        await t.test('experimental column bands respect maxima, preview devices, gaps, sticky rows and stable intensity', async () => {
            const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
            try {
                const errors = [];
                page.on('pageerror', (error) => errors.push(error.message));
                await page.setContent(`<style>ul{padding:0;margin:0;list-style:none}</style>${fixture('grid', 794)}`);
                await page.locator('#grid').evaluate((root) => {
                    root.dataset.merosMasonryVaryColumns = 'true';
                    root.dataset.merosMasonrySticky = 'true';
                    root.style.setProperty('--meros-masonry-columns-desktop', '4');
                    root.style.setProperty('--meros-masonry-columns-tablet', '3');
                    root.style.setProperty('--meros-masonry-columns-mobile', '2');
                    const list = root.querySelector('ul');
                    list.innerHTML = Array.from({ length: 36 }, (_, index) =>
                        `<li class="wp-block-post post-${100 + index}${index < 2 ? ' meros-masonry-sticky' : ''}" data-id="${index}"><a href="#${index}" style="display:block;height:${55 + index % 5 * 17}px">Post ${index}</a></li>`
                    ).join('');
                    const hidden = list.firstElementChild.cloneNode(true);
                    hidden.style.display = 'none';
                    list.prepend(hidden);
                    root.style.display = 'none';
                });
                const original = await page.locator('#grid').evaluate((root) => root.outerHTML);
                await page.addStyleTag({ content: css });
                await page.addScriptTag({ content: script });
                await page.waitForFunction(() => document.querySelector('[data-meros-masonry-variable-columns]'));
                await page.locator('#grid').evaluate((root) => root.style.display = '');
                async function waitCounts(minimum, maximum, requireMaximum = true) {
                    await page.waitForFunction(({ minimum, maximum, requireMaximum }) => {
                        const grid = document.querySelector('#grid ul');
                        const cards = [...grid.children].filter((card) => card.offsetHeight > 0 && !card.classList.contains('meros-masonry-sticky'));
                        const counts = cards.map((card) => Math.round((grid.clientWidth + 24) / (card.getBoundingClientRect().width + 24)));
                        return counts.length === 34 && counts.every((count) => count >= minimum && count <= maximum) && counts.includes(minimum) && (!requireMaximum || counts.includes(maximum));
                    }, { minimum, maximum, requireMaximum });
                }
                async function check() {
                    const result = await page.locator('#grid ul').evaluate((grid) => {
                        const bounds = grid.getBoundingClientRect();
                        const style = getComputedStyle(grid);
                        return {
                            width: grid.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
                            start: parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft),
                            height: bounds.height - parseFloat(style.paddingBottom) - parseFloat(style.borderBottomWidth),
                            gap: parseFloat(style.columnGap),
                            paginationTop: grid.nextElementSibling.getBoundingClientRect().top - bounds.top,
                            outerHeight: bounds.height,
                            cards: [...grid.children].filter((card) => card.offsetHeight > 0).map((card) => {
                                const rect = card.getBoundingClientRect();
                                return { id: card.dataset.id, x: rect.x - bounds.x, y: rect.y - bounds.y, width: rect.width, height: rect.height };
                            }),
                        };
                    });
                    assert.deepEqual(result.cards.map((card) => card.id), Array.from({ length: 36 }, (_, index) => String(index)), 'Hidden editor previews must not affect packing or reading order');
                    assert.ok(result.cards.slice(0, 2).every((card) => Math.abs(card.width - result.width) < 0.1), 'Sticky rows must remain full width');
                    assert.ok(result.paginationTop >= result.outerHeight, 'Pagination must follow the packed container');
                    result.cards.forEach((card, index) => {
                        assert.ok(card.x >= result.start - 0.1 && card.x + card.width <= result.start + result.width + 0.1, 'Cards must stay within the grid');
                        assert.ok(card.y + card.height <= result.height + 0.1, 'The container must contain every card');
                        if (index) assert.ok(card.y >= result.cards[index - 1].y, 'Visual order must follow DOM order');
                        for (const other of result.cards.slice(index + 1)) {
                            assert.ok(card.x + card.width + result.gap - 0.1 <= other.x || other.x + other.width + result.gap - 0.1 <= card.x ||
                                card.y + card.height + result.gap - 0.1 <= other.y || other.y + other.height + result.gap - 0.1 <= card.y, 'Band transitions must retain gaps without overlaps');
                        }
                    });
                    return result.cards;
                }
                await waitCounts(3, 4);
                const initial = await check();
                await page.setViewportSize({ width: 1023, height: 900 });
                await waitCounts(2, 3);
                await check();
                await page.locator('#grid').evaluate((root) => root.dataset.merosMasonryDevice = 'Mobile');
                await waitCounts(1, 2);
                await check();
                await page.locator('#grid').evaluate((root) => {
                    root.dataset.merosMasonryDevice = 'Desktop';
                    root.dataset.merosMasonryColumnVariation = 'broad';
                });
                await waitCounts(1, 4, false);
                await check();
                await page.setViewportSize({ width: 1400, height: 900 });
                await page.locator('#grid').evaluate((root) => root.dataset.merosMasonryColumnVariation = 'subtle');
                await waitCounts(3, 4);
                assert.deepEqual(await check(), initial, 'Returning to subtle must restore the same layout');
                await page.locator('#grid').evaluate((root) => root.dataset.merosMasonryVaried = 'true');
                await page.waitForFunction(() => [...document.querySelectorAll('#grid li')].some((card) => card.style.gridColumnEnd === 'span 2'));
                await check();
                await page.locator('#grid').evaluate((root) => {
                    root.style.setProperty('--meros-masonry-columns-mobile', '1');
                    root.dataset.merosMasonryDevice = 'Mobile';
                });
                await waitCounts(1, 1);
                await check();
                await page.locator('#grid').evaluate((root) => root.dataset.merosMasonryDevice = 'Desktop');
                await page.waitForFunction(() => parseFloat(document.querySelector('#grid [data-id="2"]').style.getPropertyValue('--meros-masonry-card-width')) < 794);
                await page.locator('#grid ul').evaluate((grid) => Object.assign(grid.style, {
                    boxSizing: 'border-box', padding: '11px 17px 19px 23px', border: '2px solid', direction: 'rtl',
                }));
                await page.waitForFunction(() => parseFloat(document.querySelector('#grid li:not([style*="display: none"])').style.getPropertyValue('--meros-masonry-card-inset')) === 17);
                await check();
                await page.locator('#grid').evaluate((root) => {
                    root.style.setProperty('--meros-masonry-gap', '0px');
                    window.dispatchEvent(new Event('resize'));
                });
                await page.waitForFunction(() => [187.5, 250, 375, 500].includes(parseFloat(document.querySelector('#grid [data-id="2"]').style.getPropertyValue('--meros-masonry-card-width'))));
                await check();
                await page.locator('#grid').evaluate((root, html) => root.outerHTML = html, original);
                await page.locator('#grid').evaluate((root) => root.style.display = '');
                await waitCounts(3, 4);
                assert.deepEqual(await check(), initial, 'Fresh rendering must retain stable column variation');
                await page.locator('#grid').evaluate((root) => {
                    delete root.dataset.merosMasonryVaryColumns;
                    delete root.dataset.merosMasonrySticky;
                });
                await page.waitForFunction(() => !document.querySelector('[data-meros-masonry-variable-columns]') && document.querySelector('#grid ul').style.height === '');
                assert.equal(await page.locator('#grid ul').evaluate((grid) => getComputedStyle(grid).display), 'grid');
                assert.deepEqual(errors, []);
            } finally { await page.close(); }
        });

        await t.test('reinitialises replaced query results without touching nested queries or pagination', async () => {
            const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
            try {
                await page.setContent(`<style>ul{padding:0;margin:0;list-style:none}</style>${fixture()}${fixture('second', 500, 0)}`);
                await page.locator('#second').evaluate((element) => element.style.setProperty('--meros-masonry-columns-desktop', '1'));
                await page.addStyleTag({ content: css });
                await page.addScriptTag({ content: script });
                await page.waitForFunction(() => document.querySelectorAll('[data-meros-masonry-grid]').length === 2);
                packed(await geometry(page), 3);
                packed(await geometry(page, 'second'), 1, 0);
                await page.locator('#second li a').first().evaluate((element) => element.style.height = '180.375px');
                await page.waitForFunction(() => document.querySelector('#second li').style.gridRowEnd === 'span 181');
                packed(await geometry(page, 'second'), 1, 0);
                await page.locator('#grid > .wp-block-query > ul').evaluate((list) => {
                    const replacement = list.cloneNode(true);
                    replacement.removeAttribute('data-meros-masonry-grid');
                    for (const card of replacement.children) card.style.gridRowEnd = '';
                    list.replaceWith(replacement);
                    const nested = document.createElement('ul');
                    nested.className = 'wp-block-post-template';
                    nested.innerHTML = '<li class="wp-block-post">Nested query</li>';
                    list = document.querySelector('#grid > .wp-block-query > ul');
                    list.firstElementChild.append(nested);
                });
                await page.waitForFunction(() => document.querySelector('#grid > .wp-block-query > ul').hasAttribute('data-meros-masonry-grid'));
                packed(await geometry(page), 3);
                assert.equal(await page.locator('#grid li ul[data-meros-masonry-grid]').count(), 0);
                assert.equal(await page.locator('#grid nav').getAttribute('data-meros-masonry-grid'), null);
                assert.equal(await page.locator('#grid nav a').getAttribute('href'), '?query-8-page=2');
                await page.locator('#grid').evaluate((element) => {
                    window.removedMasonry = element;
                    element.remove();
                });
                await page.waitForFunction(() => !window.removedMasonry.querySelector('ul').hasAttribute('data-meros-masonry-grid'));
                assert.equal(await page.evaluate(() => window.removedMasonry.querySelector('li').style.gridRowEnd), '');
                packed(await geometry(page, 'second'), 1, 0);
            } finally { await page.close(); }
        });
    } finally { await browser.close(); }
});
