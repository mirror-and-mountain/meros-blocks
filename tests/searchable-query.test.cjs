const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const babel = require('@babel/core');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const filters = {};
let variation;
const context = {
    React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) },
    require: (name) => {
        if (name === '@wordpress/hooks') return { addFilter: (hook, id, callback) => filters[hook] = callback };
        if (name === '@wordpress/blocks') return { registerBlockVariation: (name, definition) => variation = { name, ...definition } };
        if (name === '@wordpress/i18n') return { __: (text) => text };
        if (name === '@wordpress/block-editor') return { InspectorControls: 'InspectorControls' };
        if (name === '@wordpress/components') return { PanelBody: 'PanelBody', ToggleControl: 'ToggleControl', SelectControl: 'SelectControl', Notice: 'Notice' };
        return {};
    },
};
vm.runInNewContext(babel.transformSync(fs.readFileSync(path.join(root, 'src/resources/assets/wordpress/src/searchable-query/editor/index.js'), 'utf8'), {
    presets: [require.resolve('@babel/preset-react')],
    plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
    configFile: false, babelrc: false,
}).code, context);

function find(node, type) {
    if (!node || typeof node !== 'object') return undefined;
    if (node.type === type) return node;
    return (Array.isArray(node) ? node : node.props?.children ?? []).map((child) => find(child, type)).find(Boolean);
}
test('native variation and existing-query toggle retain native configuration and warn about inheritance', () => {
    assert.equal(variation.attributes.namespace, 'meros-blocks/searchable-query');
    assert.equal(variation.attributes.query.inherit, false);
    assert.equal(variation.innerBlocks[0][0], 'core/search');
    assert.equal(variation.innerBlocks[1][0], 'core/post-template');
    assert.ok(variation.isActive({ merosLiveSearch: true }));
    const settings = { attributes: { query: { type: 'object' } }, supports: { align: true } };
    const registered = filters['blocks.registerBlockType'](settings, 'core/query');
    assert.equal(registered.attributes.merosLiveSearch.default, false);
    assert.equal(registered.supports, settings.supports);
    assert.equal(filters['blocks.registerBlockType'](settings, 'core/search'), settings);
    let update;
    const attributes = { query: { inherit: true, taxQuery: { category: [3] } }, merosLiveSearch: true };
    const render = filters['editor.BlockEdit']('Block');
    const tree = render({ name: 'core/query', attributes, isSelected: true, setAttributes: (value) => update = value });
    assert.ok(find(tree, 'Notice'));
    find(tree, 'ToggleControl').props.onChange(true);
    assert.equal(update.merosLiveSearch, true);
    assert.equal(update.enhancedPagination, false);
    assert.equal(update.query, undefined, 'Toggling must never replace the chosen native query settings');
    const position = find(tree, 'SelectControl');
    assert.equal(position.props.value, 'above');
    position.props.onChange('below');
    assert.equal(update.merosLiveSearchSpinnerPosition, 'below');
    assert.equal(update.query, undefined, 'Moving the spinner must not alter query filters');
    assert.equal(find(render({ name: 'core/query', attributes: { merosLiveSearch: false }, isSelected: true }), 'SelectControl'), undefined);
    assert.equal(find(render({ name: 'core/query', attributes: { ...attributes, query: { inherit: false } }, isSelected: true }), 'Notice'), undefined);
    assert.equal(find(render({ name: 'core/search', attributes: {} }), 'ToggleControl'), undefined);
});

const build = path.join(root, 'src/resources/assets/wordpress/build');
const script = fs.readFileSync(path.join(build, 'searchable-query/index.js'), 'utf8');
const css = fs.readFileSync(path.join(build, 'searchable-query/style-index.css'), 'utf8');
const masonryScript = fs.readFileSync(path.join(build, 'masonry-query/index.js'), 'utf8');
const masonryCss = fs.readFileSync(path.join(build, 'masonry-query/style-index.css'), 'utf8');

function results(text, count = 3, empty = false) {
    return `<div data-meros-live-query>
        <template data-meros-live-query-slot="0"></template>${empty ? '' : `<ul class="wp-block-post-template">${Array.from({ length: count }, (_, index) =>
            `<li class="wp-block-post post-${index + 1}"><a style="display:block;height:${80 + index * 25}px" href="/post-${index}">${text} ${index}</a></li>`).join('')}</ul>`}<template data-meros-live-query-end="0"></template>
        <template data-meros-live-query-slot="1"></template><nav class="wp-block-query-pagination"><a href="https://query.test/home/?query-12-page=2">Next</a><a href="https://query.test/home/">First</a></nav><template data-meros-live-query-end="1"></template>
        <template data-meros-live-query-slot="2"></template>${empty ? '<p class="no-results">No posts found.</p>' : ''}<template data-meros-live-query-end="2"></template></div>`;
}
function fixture(id) {
    return `<div id="${id}" data-meros-live-query data-meros-live-query-token="${id}-token" data-meros-live-query-endpoint="https://query.test/api"
        data-meros-live-query-page-key="query-12-page" data-meros-live-query-loading="Searching" data-meros-live-query-complete="Results updated" data-meros-live-query-error="Search failed">
        <form data-meros-live-query-search><label>Search <input name="s"></label><button>Search</button></form>
        ${results('Initial').replace('<div data-meros-live-query>', '').replace(/<\/div>$/, '')}
        <form class="per-card-search"><input name="s"></form>
    </div>`;
}

test('spinner renders above or below the search box inside a row without affecting its siblings', async () => {
    const edge = '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';
    const browser = await chromium.launch(fs.existsSync(edge) ? { executablePath: edge } : {});
    const page = await browser.newPage();
    try {
        await page.setContent(['above', 'below'].map((position) => `<div id="${position}" data-meros-live-query data-meros-live-query-spinner-position="${position}" data-meros-live-query-loading="Searching">
            <div class="row" style="display:flex"><form data-meros-live-query-search><input name="s"><button>Search</button></form><nav>Pagination</nav></div>
        </div>`).join(''));
        await page.evaluate(() => { window.fetch = () => new Promise(() => {}); });
        await page.addStyleTag({ content: css });
        await page.addScriptTag({ content: script });
        for (const position of ['above', 'below']) {
            await page.locator(`#${position} input`).fill('Test');
            await page.waitForFunction((id) => document.querySelector(`#${id} [data-loading]`), position);
            const boxes = await page.locator(`#${position} form`).evaluate((form) => {
                const status = form.querySelector('[data-meros-live-query-status]');
                const loading = status.getBoundingClientRect();
                const input = form.querySelector('input').getBoundingClientRect();
                return { first: status === form.firstElementChild, last: status === form.lastElementChild, top: loading.top, bottom: loading.bottom, inputTop: input.top, inputBottom: input.bottom };
            });
            assert.ok(position === 'above' ? boxes.first && boxes.bottom <= boxes.inputTop : boxes.last && boxes.top >= boxes.inputBottom, 'The visible indicator must be on the selected side of the search box');
            assert.equal(await page.locator(`#${position} .row > nav`).count(), 1, 'The indicator must stay inside the Search block, not become a new Row item');
        }
    } finally { await browser.close(); }
});

test('browser live search debouncing, race handling, pagination, errors and masonry replacement', async () => {
    const edge = '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';
    const browser = await chromium.launch(fs.existsSync(edge) ? { executablePath: edge } : {});
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
    try {
        await page.route('https://query.test/**', (route) => route.fulfill({ contentType: 'text/html', body: `<style>ul{padding:0;list-style:none}</style>
            <section class="meros-masonry-query" style="width:900px;--meros-masonry-gap:24px">${fixture('one')}</section>${fixture('two')}` }));
        await page.goto('https://query.test/home/');
        await page.evaluate(() => {
            window.pending = [];
            // Deliberately ignore abort to ensure late network responses cannot overwrite newer input.
            window.fetch = (url, options) => new Promise((resolve) => window.pending.push({
                body: JSON.parse(options.body), options,
                resolve: (data, ok = true) => resolve({ ok, json: async () => data }),
            }));
        });
        await page.addStyleTag({ content: css + masonryCss });
        await page.addScriptTag({ content: script });
        await page.addScriptTag({ content: masonryScript });
        const input = page.locator('#one form[data-meros-live-query-search] input');
        await input.fill('Al');
        await input.fill('Alpha');
        await page.waitForFunction(() => window.pending.length === 1);
        const status = page.locator('#one [data-meros-live-query-status]');
        assert.equal(await status.getAttribute('data-loading'), '');
        assert.equal(await status.textContent(), 'Searching');
        assert.deepEqual(await status.evaluate((element) => ({
            clipped: getComputedStyle(element).clipPath,
            spinner: getComputedStyle(element, '::before').animationName,
        })), { clipped: 'none', spinner: 'meros-query-loading-spin' }, 'Pending searches must show a visible spinner and loading text');
        assert.equal(await page.locator('#two [data-loading]').count(), 0, 'The indicator must only appear on the searching query');
        await page.emulateMedia({ reducedMotion: 'reduce' });
        assert.equal(await status.evaluate((element) => getComputedStyle(element, '::before').animationName), 'none');
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        assert.deepEqual(await page.evaluate(() => window.pending[0].body), { token: 'one-token', search: 'Alpha', page: 1 });
        await input.fill('Beta');
        await page.waitForFunction(() => window.pending.length === 2);
        await page.evaluate((html) => window.pending[1].resolve({ html }), results('Beta', 4));
        await page.waitForFunction(() => document.querySelector('#one ul').textContent.includes('Beta'));
        assert.equal(await status.getAttribute('data-loading'), null, 'Successful searches must stop the indicator');
        assert.equal(await status.evaluate((element) => getComputedStyle(element).clipPath), 'inset(50%)', 'Completion announcements remain screen-reader-only');
        await page.evaluate((html) => window.pending[0].resolve({ html }), results('Stale'));
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
        assert.ok((await page.locator('#one ul').textContent()).includes('Beta'));
        assert.equal(await input.inputValue(), 'Beta');
        assert.ok(await input.evaluate((element) => element === element.ownerDocument.activeElement), 'Results must update without replacing or defocusing the search input');
        assert.ok((await page.locator('#two ul').textContent()).includes('Initial'), 'Other Query Loops must not change');
        await page.waitForFunction(() => [...document.querySelectorAll('#one ul li')].every((card) => card.style.gridRowEnd));
        assert.equal(await page.locator('#one ul').evaluate((grid) => grid.hasAttribute('data-meros-masonry-grid')), true, 'AJAX result replacement must reinitialize the existing masonry observer');
        assert.equal(await page.locator('#one > .wp-block-post-template').count(), 1, 'Native direct-child layout selectors must remain valid after AJAX replacement');
        await page.locator('#one .wp-block-query-pagination a').first().click();
        await page.waitForFunction(() => window.pending.length === 3);
        assert.deepEqual(await page.evaluate(() => window.pending[2].body), { token: 'one-token', search: 'Beta', page: 2 });
        await page.evaluate((html) => window.pending[2].resolve({ html }), results('Second page'));
        await page.waitForFunction(() => document.querySelector('#one ul').textContent.includes('Second page'));
        await input.fill('');
        await page.waitForFunction(() => window.pending.length === 4);
        assert.deepEqual(await page.evaluate(() => window.pending[3].body), { token: 'one-token', search: '', page: 1 });
        await page.evaluate((html) => window.pending[3].resolve({ html }), results('Restored'));
        await page.waitForFunction(() => document.querySelector('#one ul').textContent.includes('Restored'));
        await input.fill('Missing');
        await page.waitForFunction(() => window.pending.length === 5);
        await page.evaluate((html) => window.pending[4].resolve({ html }), results('', 0, true));
        await page.waitForFunction(() => document.querySelector('#one .no-results')?.textContent === 'No posts found.');
        assert.equal(await page.locator('#one ul').count(), 0);
        await input.fill('Failure');
        await page.waitForFunction(() => window.pending.length === 6);
        await page.evaluate(() => window.pending[5].resolve({ message: 'Configuration expired. Reload the page.' }, false));
        await page.waitForFunction(() => document.querySelector('#one [data-error]'));
        assert.equal(await page.locator('#one [data-error]').textContent(), 'Configuration expired. Reload the page.');
        assert.equal(await page.locator('#one').getAttribute('aria-busy'), null);
        assert.equal(await status.getAttribute('data-loading'), null, 'Failed searches must stop the spinner and show the error');
        await input.fill('Retry');
        await page.locator('#one form[data-meros-live-query-search] button').click();
        await page.waitForFunction(() => window.pending.length === 7);
        await page.evaluate((html) => window.pending[6].resolve({ html }), results('Retry'));
        await page.waitForFunction(() => document.querySelector('#one ul').textContent.includes('Retry'));
        assert.equal(await page.locator('#one [data-error]').count(), 0);
        await page.locator('#one .per-card-search input').fill('Unwired');
        await page.waitForTimeout(350);
        assert.equal(await page.evaluate(() => window.pending.length), 7, 'Search blocks in Post Templates/unwired searches must not drive their parent query');
        await input.dispatchEvent('compositionstart');
        await input.fill('Composing');
        await page.waitForTimeout(350);
        assert.equal(await page.evaluate(() => window.pending.length), 7);
        await input.dispatchEvent('compositionend');
        await page.waitForFunction(() => window.pending.length === 8);
        await page.evaluate((html) => window.pending[7].resolve({ html }), results('Composed'));
        await page.waitForFunction(() => document.querySelector('#one ul').textContent.includes('Composed'));
        await input.fill('Removed');
        await page.waitForFunction(() => window.pending.length === 9);
        await page.locator('#one').evaluate((root) => { window.removed = root; root.remove(); });
        await page.waitForFunction(() => !window.removed.querySelector('[data-meros-live-query-status]'));
        await page.evaluate((html) => window.pending[8].resolve({ html }), results('Must not apply'));
        assert.ok((await page.evaluate(() => window.removed.querySelector('ul').textContent)).includes('Composed'), 'Disconnected queries must cancel pending updates');
        await page.evaluate(() => document.body.append(window.removed));
        await page.waitForFunction(() => document.querySelector('#one [data-meros-live-query-status]'));
        assert.equal(await page.locator('#one [data-meros-live-query-status]').count(), 1);
    } finally { await browser.close(); }
});
