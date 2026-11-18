import './style.scss';
import './mobile';

const menuSelector = '.meros-dynamic-mega-menu';
const desktopMenuSelector = `${menuSelector}:not([data-mobile-active])`;
const groupSelector = '.meros-dynamic-mega-menu__group';
const groupLinkSelector = '.meros-dynamic-mega-menu__group-link';
const disclosureSelector = '.meros-dynamic-mega-menu__disclosure';
const openSelector = `${disclosureSelector}[open]`;
const hoverMenuSelector = `${desktopMenuSelector}[data-meros-menu-trigger="hover"]`;
const slideSelector = '.meros-dynamic-mega-menu__slide';
const closeTimers = new WeakMap();
const switchTimers = new WeakMap();
const floatingLayout = window.matchMedia('(width > 640px)');

function getHeader(menu) {
    return menu.closest('header, [role="banner"]');
}

function usesFloatingPanel(menu) {
    return floatingLayout.matches && !menu.matches('.meros-dynamic-mega-menu--vertical, [data-mobile-active]');
}

function alignPanel(menu) {
    const { left, top } = menu.getBoundingClientRect();
    const header = getHeader(menu);
    const panelLeft = left + menu.clientLeft;
    const panelRight = panelLeft + menu.clientWidth;
    const panelTop = top + menu.clientTop + menu.clientHeight;
    const headerGap = header ? Math.max(0, header.getBoundingClientRect().bottom - panelTop) : 0;

    menu.style.setProperty('--meros-mega-menu-panel-left', `${-panelLeft}px`);
    menu.style.setProperty('--meros-mega-menu-panel-right', `${panelRight - document.documentElement.clientWidth}px`);
    menu.style.setProperty('--meros-mega-menu-header-gap', `${headerGap}px`);
}

function cancelClose(disclosure) {
    clearTimeout(closeTimers.get(disclosure));
    closeTimers.delete(disclosure);
}

function cancelSwitch(menu) {
    clearTimeout(switchTimers.get(menu));
    switchTimers.delete(menu);
}

function pointerRegion(menu, disclosure) {
    return usesFloatingPanel(menu) ? getHeader(menu) ?? menu : disclosure.parentElement;
}

function containsPointerTarget(menu, disclosure, target) {
    return pointerRegion(menu, disclosure).contains(target) || disclosure.contains(target);
}

function isPointerInside(menu, disclosure) {
    return pointerRegion(menu, disclosure).matches(':hover') || disclosure.matches(':hover');
}

function openDisclosure(menu, disclosure) {
    cancelSwitch(menu);
    alignPanel(menu);

    for (const other of menu.querySelectorAll(openSelector)) {
        if (other === disclosure) continue;

        if (usesFloatingPanel(menu)) {
            disclosure.dataset.panelSwitch = 'in';
            other.dataset.panelSwitch = 'out';
        }
        cancelClose(other);
        other.open = false;
    }

    disclosure.open = true;
}

document.addEventListener('toggle', (event) => {
    const disclosure = event.target;
    if (!disclosure.matches?.(disclosureSelector)) return;

    if (!disclosure.open) {
        if (disclosure.dataset.panelSwitch === 'in') delete disclosure.dataset.panelSwitch;
        cancelClose(disclosure);
        return;
    }

    const menu = disclosure.closest(desktopMenuSelector);
    if (!menu) return;

    if (disclosure.dataset.panelSwitch === 'out') delete disclosure.dataset.panelSwitch;
    if ([...menu.querySelectorAll(openSelector)].some((open) => open !== disclosure)) {
        openDisclosure(menu, disclosure);
    } else {
        alignPanel(menu);
    }
}, true);

window.addEventListener('resize', () => {
    for (const menu of document.querySelectorAll(desktopMenuSelector)) {
        if (menu.querySelector(openSelector)) alignPanel(menu);
    }
});

document.addEventListener('pointerover', (event) => {
    if (event.pointerType !== 'mouse') return;

    for (const open of document.querySelectorAll(`${desktopMenuSelector} ${openSelector}`)) {
        const menu = open.closest(desktopMenuSelector);
        if (containsPointerTarget(menu, open, event.target)) cancelClose(open);
    }

    const group = event.target.closest?.(groupSelector);
    const disclosure = group?.querySelector(`:scope > ${disclosureSelector}`);
    if (!disclosure) return;

    const menu = disclosure.closest(hoverMenuSelector);
    if (!menu || !event.target.closest(`${disclosureSelector} > summary, ${groupLinkSelector}`) ||
        group.contains(event.relatedTarget)) return;

    const open = menu.querySelector(openSelector);
    if (open === disclosure) return;
    // Hover should not hide links someone is navigating with the keyboard.
    if (open?.querySelector(slideSelector).contains(document.activeElement)) return;

    cancelSwitch(menu);
    if (open && usesFloatingPanel(menu)) {
        switchTimers.set(menu, setTimeout(() => {
            switchTimers.delete(menu);
            if (!menu.isConnected || !menu.matches(hoverMenuSelector) || !menu.contains(group) ||
                menu.querySelector(openSelector)?.querySelector(slideSelector).contains(document.activeElement)) return;
            openDisclosure(menu, disclosure);
        }, 100));
    } else {
        openDisclosure(menu, disclosure);
    }
});

document.addEventListener('pointerout', (event) => {
    if (event.pointerType !== 'mouse') return;

    const group = event.target.closest?.(groupSelector);
    const hoverMenu = group?.closest(hoverMenuSelector);
    if (hoverMenu && !group.contains(event.relatedTarget)) cancelSwitch(hoverMenu);

    for (const open of document.querySelectorAll(`${desktopMenuSelector} ${openSelector}`)) {
        const menu = open.closest(desktopMenuSelector);
        if (!containsPointerTarget(menu, open, event.target) || containsPointerTarget(menu, open, event.relatedTarget)) continue;

        cancelClose(open);
        closeTimers.set(open, setTimeout(() => {
            closeTimers.delete(open);
            if (menu.matches(desktopMenuSelector) && !isPointerInside(menu, open) &&
                !open.querySelector(slideSelector).contains(document.activeElement)) {
                open.open = false;
            }
        }, 180));
    }
});

document.addEventListener('focusout', (event) => {
    const group = event.target.closest?.(groupSelector);
    const disclosure = group?.querySelector(`:scope > ${openSelector}`);
    const menu = disclosure?.closest(hoverMenuSelector);
    if (!menu || containsPointerTarget(menu, disclosure, event.relatedTarget) || isPointerInside(menu, disclosure)) return;

    disclosure.open = false;
});

document.addEventListener('click', (event) => {
    const summary = event.target.closest?.(`${disclosureSelector} > summary`);
    const link = event.target.closest?.(groupLinkSelector);
    const clicked = summary?.parentElement ?? link?.parentElement.querySelector(`:scope > ${disclosureSelector}`);
    if (clicked) {
        cancelClose(clicked);
        const menu = clicked.closest(desktopMenuSelector);
        if (menu && !event.defaultPrevented) {
            alignPanel(menu);
            cancelSwitch(menu);
            if (summary && !clicked.open && usesFloatingPanel(menu)) {
                event.preventDefault();
                openDisclosure(menu, clicked);
            }
            // Keyboard and assistive-technology activation follow the link directly.
            if (link && event.detail > 0 && menu.dataset.merosMenuTrigger === 'click' && !clicked.open &&
                !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                event.preventDefault();
                openDisclosure(menu, clicked);
            }
        }
    }

    for (const disclosure of document.querySelectorAll(`${desktopMenuSelector} ${openSelector}`)) {
        const menu = disclosure.closest(desktopMenuSelector);
        if (!menu.contains(event.target) && !containsPointerTarget(menu, disclosure, event.target)) {
            cancelSwitch(menu);
            disclosure.open = false;
        }
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    if (event.target.closest?.('[data-mobile-active]')) return;

    const menu = event.target.closest?.(desktopMenuSelector);
    const disclosures = menu ? menu.querySelectorAll(openSelector) : document.querySelectorAll(`${hoverMenuSelector} ${openSelector}`);
    for (const disclosure of disclosures) {
        event.preventDefault();
        cancelSwitch(disclosure.closest(desktopMenuSelector));
        if (disclosure.parentElement.contains(document.activeElement)) disclosure.querySelector('summary').focus();
        disclosure.open = false;
    }
});
