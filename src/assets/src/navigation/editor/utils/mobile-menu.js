import { dispatch } from '@wordpress/data';

import {
    enableSubmenuOpenOnClick,
    disableSubmenuOpenOnClick,
    enableSubmenuOpenOnHover,
    disableSubmenuOpenOnHover
} from '../../listeners.js';

let merosNavWrapperObservers = {};

function setMobileMenu(doc, wrapper, isMobile, forceOpen = false) {
    if (!isMobile) {
        const forcedOpenSubmenusOnClick = wrapper.dataset.forcedSubmenuOpenOnClick === 'true';

        if (forcedOpenSubmenusOnClick) {
            disableSubmenuOpenOnClick(doc, wrapper);
            enableSubmenuOpenOnHover(doc, wrapper);
        }

        wrapper.classList.remove('meros-mobile-menu-open');
        wrapper.classList.remove('meros-mobile-menu-active');
        wrapper.classList.remove('meros-submenu-open');

    } else {
        const openSubmenusOnClick = wrapper.classList.contains('meros-open-submenus-on-click');

        if (!openSubmenusOnClick) {
            disableSubmenuOpenOnHover(wrapper);
            enableSubmenuOpenOnClick(doc, wrapper, true);
        }

        wrapper.classList.add('meros-mobile-menu-active');

        if (forceOpen) {
            wrapper.classList.add('meros-mobile-menu-open');
        }
    }
}

function enableRootObserver(doc, rootContainer) {
    if (rootContainer.dataset.merosRootObserverInitialised === 'true') return;

    const rootObserver = new ResizeObserver(() => {
        const isMobile = rootContainer.classList.contains('is-mobile-preview');
        const wrappers = rootContainer.querySelectorAll('.meros-navigation-wrapper.meros-has-mobile-menu');
        wrappers.forEach(wrapper => {
            setMobileMenu(doc, wrapper, isMobile);
        });
    });

    rootObserver.observe(rootContainer);
    rootContainer.dataset.merosRootObserverInitialised = 'true';
}

function enableWrapperObserver(doc, rootContainer, wrapper) {
    const wrapperObserver = new MutationObserver(() => {
        const isMobile = rootContainer.classList.contains('is-mobile-preview');
        const mobileActive = wrapper.classList.contains('meros-mobile-menu-active');

        if (!mobileActive && isMobile) {
            setMobileMenu(doc, wrapper, isMobile, true);
        }
    });

    wrapperObserver.observe(wrapper, {
        attributes: true,
        attributeFilter: ['class']
    });

    wrapper.dataset.merosWrapperObserverId = Math.random().toString(36).substring(2, 11);
    merosNavWrapperObservers[wrapper.dataset.merosWrapperObserverId] = wrapperObserver;

    return wrapperObserver;
}

export function initMobileMenu(doc, wrapper) {
    if (wrapper.dataset.merosMobileMenuInitialised === 'true') return;
    const rootContainer = doc.querySelector('.is-root-container');

    const navEl = wrapper.querySelector('nav');
    if (!navEl) return;

    const container = navEl.querySelector('.wp-block-navigation__container');
    if (!container) return;

    const mobileToggle = wrapper.querySelector('.meros-navigation-mobile-toggle');
    if (!mobileToggle) return;

    mobileToggle.addEventListener('click', () => {
        const isOpen = wrapper.classList.contains('meros-mobile-menu-open');
        const isUnderHeader = wrapper.classList.contains('meros-mobile-menu-under-header');
        
        let overlay = rootContainer.querySelector('.meros-mobile-menu-overlay');

        if (isOpen) {
            if (overlay) {
                overlay.classList.remove('active');
            }

            if (isUnderHeader) {
                wrapper.classList.remove('meros-mobile-menu-open');
                wrapper.classList.add('meros-mobile-menu-closing');
                mobileToggle.classList.remove('open');

                setTimeout(() => {
                    wrapper.classList.remove('meros-mobile-menu-closing');
                }, 400);

                return;
            }
            return;
        }

        if (!overlay) {
            overlay = doc.createElement('div');
            overlay.classList.add('meros-mobile-menu-overlay');
            rootContainer.appendChild(overlay);
        }

        overlay.classList.add('active');

        const navBtns = container.querySelector('.meros-navigation-btns');
        if (!navBtns) {
            const btnsContainer = document.createElement('div');
            btnsContainer.classList.add('meros-navigation-btns');

            const backBtn = document.createElement('div');
            backBtn.className = 'meros-navigation-back-btn meros-navigation-btn';
            backBtn.setAttribute('aria-label', 'Back to Menu');
            backBtn.setAttribute('title', 'Back to Menu');
            backBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15px" height="15px" aria-label="Back Icon" style="transform: rotate(180deg);">
                            <path d="M 9.9989971 4.9999848 A 1.0001 1.0001 0 1 0 8.5857864 6.4141935 L 13.171572 11 L 8.5857864 15.585807 A 1.0001 1.0001 0 1 0 10.000001 17 L 16.999998 11 L 10.000001 5 A 1.0001 1.0001 0 0 0 9.9989971 4.9999848 z"/>
                        </svg>
                    `;

            const closeBtn = document.createElement('div');
            closeBtn.className = 'meros-navigation-close-btn meros-navigation-btn';
            closeBtn.setAttribute('aria-label', 'Close Menu');
            closeBtn.setAttribute('title', 'Close Menu');
            closeBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15px" height="15px" aria-label="Close Icon">
                            <path d="M 4.7070312 3.2929688 A 1.0001 1.0001 0 0 0 3.2929688 4.7070312 L 10.585938 12 L 3.2929688 19.292969 A 1.0001 1.0001 0 1 0 4.7070312 20.707031 L 12 13.414062 L 19.292969 20.707031 A 1.0001 1.0001 0 1 0 20.707031 19.292969 L 13.414062 12 L 20.707031 4.7070312 A 1.0001 1.0001 0 0 0 19.292969 3.2929688 L 12 10.585938 L 4.7070312 3.2929688 z"/>
                        </svg>
                    `;

            btnsContainer.appendChild(backBtn);
            btnsContainer.appendChild(closeBtn);
            container.prepend(btnsContainer);

            backBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const openSubmenu = wrapper.querySelector('.meros-submenu-open');
                if (!openSubmenu) return;

                openSubmenu.classList.remove('meros-submenu-open');
                wrapper.classList.remove('meros-submenu-open');
            });

            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (wrapper.classList.contains('meros-mobile-menu-open')) {
                    wrapper.classList.remove('meros-mobile-menu-open');
                    wrapper.classList.add('meros-mobile-menu-closing');
                    mobileToggle.classList.remove('open');

                    if (overlay) {
                        overlay.classList.remove('active');
                    }

                    setTimeout(() => {
                        wrapper.classList.remove('meros-mobile-menu-closing');
                    }, 400);
                }
            });
        }

        mobileToggle.classList.add('open');
        wrapper.classList.add('meros-mobile-menu-open');

        if (rootContainer.classList.contains('is-mobile-preview')) {
            const { selectBlock } = dispatch('core/block-editor');
            const clientId = wrapper.querySelector('.wp-block-navigation')?.id?.replace('block-', '');

            if (clientId) {
                selectBlock(clientId);
            }
        }
    });

    enableWrapperObserver(doc, rootContainer, wrapper);
    wrapper.dataset.merosMobileMenuInitialised = 'true';

    enableRootObserver(doc, rootContainer);
}

export function cleanUpMobileMenu(doc, wrapper) {
    if (wrapper.classList.contains('meros-has-mobile-menu')) return;

    const forcedOpenSubmenusOnClick = wrapper.dataset.forcedSubmenuOpenOnClick === 'true';

    if (forcedOpenSubmenusOnClick) {
        disableSubmenuOpenOnClick(doc, wrapper);
    }

    wrapper.classList.remove('meros-mobile-menu-open');
    wrapper.classList.remove('meros-mobile-menu-active');
    delete wrapper.dataset.merosMobileMenuInitialised;

    if (wrapper.dataset.merosWrapperObserverId) {
        const observerId = wrapper.dataset.merosWrapperObserverId;
        const observer = merosNavWrapperObservers[observerId];
        if (observer) {
            observer.disconnect();
            delete merosNavWrapperObservers[observerId];
        }
        delete wrapper.dataset.merosWrapperObserverId;
    }
}