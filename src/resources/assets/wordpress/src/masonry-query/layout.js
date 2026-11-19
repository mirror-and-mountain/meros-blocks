export const masonrySelector = '.meros-masonry-query';
const placementProperties = ['--meros-masonry-card-width', '--meros-masonry-card-top', '--meros-masonry-card-inset'];

function variation(card) {
    const key = card.className.match(/(?:^|\s)post-(\d+)(?:\s|$)/)?.[1] ??
        card.querySelector('a[href]')?.getAttribute('href') ?? card.textContent;
    let hash = 2166136261;
    for (const character of key) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
    return { seed: (hash ^ (hash >>> 16)) >>> 0, wide: hash % 4 === 0, ratio: ['4 / 3', '1 / 1', '3 / 4', '16 / 9'][(hash >>> 3) % 4] };
}

function columnBands(entries, maximum, mode, varied) {
    const plan = [];
    let band = 0;
    let columns = 0;
    let previous = 0;
    let used = 0;
    for (const entry of entries) {
        if (entry.featured) {
            plan.push({ ...entry, columns: maximum, span: maximum, band: ++band });
            columns = 0;
            continue;
        }
        if (!columns || used + Math.min(varied && entry.wide ? 2 : 1, columns) > columns * 2) {
            const minimum = mode === 'broad' ? 1 : Math.max(1, maximum - 1);
            columns = minimum + entry.seed % (maximum - minimum + 1);
            if (columns === previous && maximum > 1) columns = mode === 'broad' ? columns % maximum + 1 : columns === maximum ? minimum : maximum;
            previous = columns;
            used = 0;
            band++;
        }
        const span = Math.min(varied && entry.wide ? 2 : 1, columns);
        plan.push({ ...entry, columns, span, band });
        used += span;
        if (used === columns * 2) columns = 0;
    }
    return plan;
}

export function observeMasonry(root) {
    const view = root.ownerDocument.defaultView;
    const grids = new Map();
    const items = new Map();
    const images = new Map();
    let frame;

    const schedule = () => {
        if (frame !== undefined) return;
        frame = view.requestAnimationFrame(layout);
    };
    const resize = new view.ResizeObserver(schedule);

    function setStyle(element, property, value) {
        if (element.style.getPropertyValue(property) !== value) element.style.setProperty(property, value);
    }

    function restoreAttribute(element, attribute, original) {
        if (original === null) element.removeAttribute(attribute);
        else element.setAttribute(attribute, original);
    }

    function restoreGrid(grid, original) {
        restoreAttribute(grid, 'data-meros-masonry-grid', original.marker);
        restoreAttribute(grid, 'data-meros-masonry-variable-columns', original.variable);
        grid.style.height = original.height;
    }

    function restoreCard(card, original) {
        card.style.gridRowEnd = original.row;
        card.style.gridColumnStart = original.start;
        card.style.gridColumnEnd = original.end;
        if (original.ratio) card.style.setProperty('--meros-masonry-image-ratio', original.ratio);
        else card.style.removeProperty('--meros-masonry-image-ratio');
        restorePlacement(card, original);
    }

    function restorePlacement(card, original) {
        for (const property of placementProperties) setStyle(card, property, original.placement[property]);
    }

    function measureCard(card) {
        // Keep fractional layout pixels without the editor canvas's zoom transform.
        const style = view.getComputedStyle(card);
        let height = parseFloat(style.height);
        if (!Number.isFinite(height)) height = card.offsetHeight;
        else if (style.boxSizing !== 'border-box') {
            for (const property of ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth']) height += parseFloat(style[property]);
        }
        return height;
    }

    function variableColumns(grid, entries, gridStyle, gap, maximum, updates) {
        const paddingTop = parseFloat(gridStyle.paddingTop);
        const paddingBottom = parseFloat(gridStyle.paddingBottom);
        const paddingStart = parseFloat(gridStyle.paddingInlineStart);
        const paddingEnd = parseFloat(gridStyle.paddingInlineEnd);
        const borders = parseFloat(gridStyle.borderLeftWidth) + parseFloat(gridStyle.borderRightWidth);
        const width = parseFloat(gridStyle.width) - (gridStyle.boxSizing === 'border-box' ? paddingStart + paddingEnd + borders : 0);
        if (!Number.isFinite(width) || width <= 0) return;
        const fitting = gap > 0 ? Math.max(1, Math.floor((width + gap) / (gap + 1))) : maximum;
        const visible = entries.filter(({ card }) => view.getComputedStyle(card).display !== 'none');
        const plan = columnBands(visible, Math.min(maximum, fitting), root.dataset.merosMasonryColumnVariation, root.dataset.merosMasonryVaried === 'true');
        for (const entry of plan) {
            const cardWidth = (width + gap) * entry.span / entry.columns - gap;
            setStyle(entry.card, placementProperties[0], `${cardWidth}px`);
        }
        const measured = plan.map((entry) => ({ ...entry, height: Math.ceil(measureCard(entry.card)) }));
        let band = -1;
        let bottoms = [];
        let cursor = paddingTop;
        for (const entry of measured) {
            if (band !== entry.band) {
                // Start density changes below the preceding band, never inside its occupied columns.
                const top = bottoms.length ? Math.max(...bottoms) : paddingTop;
                bottoms = Array(entry.columns).fill(top);
                cursor = top;
                band = entry.band;
            }
            let column = 0;
            let top = Infinity;
            for (let start = 0; start <= entry.columns - entry.span; start++) {
                const candidate = Math.max(cursor, ...bottoms.slice(start, start + entry.span));
                if (candidate < top) {
                    top = candidate;
                    column = start;
                }
            }
            updates.push([entry.card, placementProperties[1], `${top}px`]);
            updates.push([entry.card, placementProperties[2], `${paddingStart + column * (width + gap) / entry.columns}px`]);
            for (let slot = column; slot < column + entry.span; slot++) bottoms[slot] = top + entry.height + gap;
            cursor = top;
        }
        const contentHeight = bottoms.length ? Math.max(...bottoms) - paddingTop : 0;
        const extra = gridStyle.boxSizing === 'border-box' ? paddingTop + paddingBottom + parseFloat(gridStyle.borderTopWidth) + parseFloat(gridStyle.borderBottomWidth) : 0;
        updates.push([grid, 'height', `${contentHeight + extra}px`]);
    }

    function layout() {
        frame = undefined;
        const activeGrids = new Set();
        const activeItems = new Set();
        const activeImages = new Set();
        const updates = [];
        for (const grid of root.querySelectorAll('.wp-block-post-template')) {
            if (grid.closest(masonrySelector) !== root) continue;
            const parentGrid = grid.parentElement.closest('.wp-block-post-template');
            if (parentGrid && root.contains(parentGrid)) continue;
            const cards = [...grid.children].filter((child) => child.matches('.wp-block-post'));
            if (!cards.length) continue;

            activeGrids.add(grid);
            if (!grids.has(grid)) {
                grids.set(grid, {
                    marker: grid.getAttribute('data-meros-masonry-grid'),
                    variable: grid.getAttribute('data-meros-masonry-variable-columns'),
                    height: grid.style.height,
                });
                grid.setAttribute('data-meros-masonry-grid', '');
                resize.observe(grid);
            }
            const variable = root.dataset.merosMasonryVaryColumns === 'true';
            if (variable) {
                if (!grid.hasAttribute('data-meros-masonry-variable-columns')) grid.setAttribute('data-meros-masonry-variable-columns', '');
            } else {
                grid.removeAttribute('data-meros-masonry-variable-columns');
                if (grid.style.height !== grids.get(grid).height) grid.style.height = grids.get(grid).height;
            }
            const gridStyle = view.getComputedStyle(grid);
            const gap = parseFloat(gridStyle.columnGap);
            const columns = parseInt(gridStyle.getPropertyValue('--meros-masonry-columns'), 10);
            const entries = [];
            for (const card of cards) {
                activeItems.add(card);
                if (!items.has(card)) {
                    items.set(card, {
                        row: card.style.gridRowEnd,
                        start: card.style.gridColumnStart,
                        end: card.style.gridColumnEnd,
                        ratio: card.style.getPropertyValue('--meros-masonry-image-ratio'),
                        placement: Object.fromEntries(placementProperties.map((property) => [property, card.style.getPropertyValue(property)])),
                    });
                    resize.observe(card);
                }
                const original = items.get(card);
                if (!variable) restorePlacement(card, original);
                const varied = root.dataset.merosMasonryVaried === 'true';
                const featured = root.dataset.merosMasonrySticky === 'true' && root.dataset.merosMasonryStickyShared !== 'true' && card.classList.contains('meros-masonry-sticky');
                const details = variation(card);
                const { wide, ratio } = details;
                entries.push({ card, featured, ...details });
                const start = featured ? '1' : original.start;
                const end = featured ? '-1' : varied ? `span ${Math.min(wide ? 2 : 1, columns)}` : original.end;
                if (card.style.gridColumnStart !== start) card.style.gridColumnStart = start;
                if (card.style.gridColumnEnd !== end) card.style.gridColumnEnd = end;
                const image = card.querySelector('.wp-block-post-featured-image');
                if (varied && image?.closest('.wp-block-post') === card) {
                    if (!images.has(image)) images.set(image, image.getAttribute('data-meros-masonry-image'));
                    if (!image.hasAttribute('data-meros-masonry-image')) image.setAttribute('data-meros-masonry-image', '');
                    const imageRatio = featured ? '16 / 9' : ratio;
                    if (card.style.getPropertyValue('--meros-masonry-image-ratio') !== imageRatio) {
                        card.style.setProperty('--meros-masonry-image-ratio', imageRatio);
                    }
                    activeImages.add(image);
                }
            }
            if (variable) variableColumns(grid, entries, gridStyle, gap, columns, updates);
            else for (const card of cards) {
                updates.push([card, 'grid-row-end', `span ${Math.max(1, Math.ceil(measureCard(card) + gap))}`]);
            }
        }
        for (const [element, property, value] of updates) setStyle(element, property, value);
        for (const [image, original] of images) {
            if (activeImages.has(image)) continue;
            restoreAttribute(image, 'data-meros-masonry-image', original);
            images.delete(image);
        }
        for (const [card, original] of items) {
            if (activeItems.has(card)) continue;
            resize.unobserve(card);
            restoreCard(card, original);
            items.delete(card);
        }
        for (const [grid, original] of grids) {
            if (activeGrids.has(grid)) continue;
            resize.unobserve(grid);
            restoreGrid(grid, original);
            grids.delete(grid);
        }
    }

    resize.observe(root);
    const mutations = new view.MutationObserver(schedule);
    mutations.observe(root, {
        childList: true, subtree: true, characterData: true, attributes: true,
        attributeFilter: ['data-meros-masonry-device', 'data-meros-masonry-varied', 'data-meros-masonry-sticky', 'data-meros-masonry-sticky-shared', 'data-meros-masonry-vary-columns', 'data-meros-masonry-column-variation'],
    });
    view.addEventListener('resize', schedule);
    schedule();

    return () => {
        view.cancelAnimationFrame(frame);
        resize.disconnect();
        mutations.disconnect();
        view.removeEventListener('resize', schedule);
        for (const [card, original] of items) restoreCard(card, original);
        for (const [image, original] of images) {
            restoreAttribute(image, 'data-meros-masonry-image', original);
        }
        for (const [grid, original] of grids) {
            restoreGrid(grid, original);
        }
    };
}
