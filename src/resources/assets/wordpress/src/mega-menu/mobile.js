const prefix = 'meros-dynamic-mega-menu';
const menuSelector = `.${prefix}[data-meros-menu-breakpoint]`;
const instances = new WeakMap();

function setup(menu, drawer) {
    const groups = menu.querySelector(`:scope > .${prefix}__groups`);
    const toggle = menu.querySelector(`:scope > .${prefix}__mobile-toggle`);
    const body = drawer.querySelector(`.${prefix}__drawer-body`);
    const back = drawer.querySelector(`.${prefix}__mobile-back`);
    const close = drawer.querySelector(`.${prefix}__mobile-close`);
    let activeGroup;

    function showGroups(restoreFocus = false) {
        const summary = activeGroup?.querySelector('summary');
        if (activeGroup) activeGroup.open = false;
        activeGroup = undefined;
        drawer.removeAttribute('data-subpage');
        back.hidden = true;
        drawer.scrollTop = 0;
        if (restoreFocus) summary?.focus();
    }

    function setActive(active) {
        if (menu.hasAttribute('data-mobile-active') === active) return;

        if (drawer.open) drawer.close();
        showGroups();
        for (const disclosure of groups.querySelectorAll(`.${prefix}__disclosure[open]`)) {
            disclosure.open = false;
        }

        menu.toggleAttribute('data-mobile-active', active);
        if (active) body.append(groups);
        else drawer.before(groups);
    }

    toggle.addEventListener('click', () => {
        if (drawer.open) return;
        showGroups();
        drawer.showModal();
        toggle.setAttribute('aria-expanded', 'true');
    });

    back.addEventListener('click', () => showGroups(true));
    close.addEventListener('click', () => drawer.close());
    drawer.addEventListener('close', () => {
        if (drawer.open) return;
        toggle.setAttribute('aria-expanded', 'false');
        window.getComputedStyle(drawer).transform;
        // Keep the current page visible until the drawer finishes sliding out.
        Promise.allSettled(drawer.getAnimations().map((animation) => animation.finished)).then(() => {
            if (!drawer.open) showGroups();
        });
    });

    drawer.addEventListener('click', (event) => {
        if (event.target === drawer) {
            drawer.close();
            return;
        }

        const summary = event.target.closest(`.${prefix}__disclosure > summary`);
        if (summary) {
            event.preventDefault();
            activeGroup = summary.parentElement;
            activeGroup.open = true;
            back.hidden = false;
            drawer.setAttribute('data-subpage', '');
            drawer.scrollTop = 0;
            back.focus();
        } else if (event.target.closest('a[href]') && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
            drawer.close();
        }
    });

    return setActive;
}

function syncMobileMenus() {
    for (const menu of document.querySelectorAll(menuSelector)) {
        const drawer = menu.querySelector(`:scope > .${prefix}__drawer`);
        if (typeof drawer?.showModal !== 'function') continue;

        if (!instances.has(menu)) instances.set(menu, setup(menu, drawer));
        const breakpoint = Number(menu.dataset.merosMenuBreakpoint);
        instances.get(menu)(window.matchMedia(`(max-width: ${breakpoint}px)`).matches);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncMobileMenus, { once: true });
} else {
    syncMobileMenus();
}
window.addEventListener('resize', syncMobileMenus);
document.addEventListener('livewire:navigated', syncMobileMenus);
