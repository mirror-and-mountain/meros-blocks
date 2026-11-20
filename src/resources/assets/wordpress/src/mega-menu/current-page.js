function pageUrl(value) {
    if (!value || value.startsWith('#') || !URL.canParse(value, window.location.href)) return null;

    const url = new URL(value, window.location.href);
    if (!['http:', 'https:'].includes(url.protocol)) return null;

    url.searchParams.sort();
    return url.origin + (url.pathname.replace(/\/+$/, '') || '/') + url.search;
}

function highlightCurrentPage() {
    const current = pageUrl(window.location.href);
    for (const menu of document.querySelectorAll('.meros-dynamic-mega-menu')) {
        for (const element of menu.querySelectorAll('a[href], summary[data-meros-menu-url]')) {
            const matches = pageUrl(element.getAttribute('href') ?? element.dataset.merosMenuUrl) === current;
            element.classList.toggle('meros-menu-current-page', matches);
            if (element.matches('a')) {
                if (matches) element.setAttribute('aria-current', 'page');
                else if (element.getAttribute('aria-current') === 'page') element.removeAttribute('aria-current');
            }
        }
        for (const group of menu.querySelectorAll('.meros-dynamic-mega-menu__group')) {
            if (group.closest('.meros-dynamic-mega-menu') !== menu) continue;
            const currentPanelLink = [...group.querySelectorAll('.meros-dynamic-mega-menu__panel a.meros-menu-current-page')]
                .some((link) => link.closest('.meros-dynamic-mega-menu__group') === group);
            for (const trigger of group.querySelectorAll('.meros-dynamic-mega-menu__trigger')) {
                if (trigger.closest('.meros-dynamic-mega-menu__group') !== group
                    || trigger.closest('.meros-dynamic-mega-menu__panel')?.closest('.meros-dynamic-mega-menu__group') === group) continue;
                const destination = trigger.getAttribute('href') ?? trigger.dataset.merosMenuUrl;
                trigger.classList.toggle('meros-menu-current-page', currentPanelLink || pageUrl(destination) === current);
            }
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', highlightCurrentPage, { once: true });
} else {
    highlightCurrentPage();
}
document.addEventListener('livewire:navigated', highlightCurrentPage);
window.addEventListener('popstate', highlightCurrentPage);
