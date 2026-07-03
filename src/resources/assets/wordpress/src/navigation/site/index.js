import { 
    enableSubmenuOpenOnClick, 
    disableSubmenuOpenOnClick, 
    enableSubmenuOpenOnHover, 
    disableSubmenuOpenOnHover 
} from '../listeners.js';

import { merosSetHeaderHeight } from '../helpers.js';
import './styles.scss';

function setMobileMenus(width) {
    const navWrappers = document.querySelectorAll('.meros-navigation-wrapper.meros-has-mobile-menu');
    navWrappers.forEach(wrapper => {
        const breakpoint = parseInt(wrapper.dataset.merosMobileMenuBreakpoint) || 768;

        if (width < breakpoint) {
            document.documentElement.classList.add('meros-mobile-menu-active');
            wrapper.classList.add('meros-mobile-menu-active');
            if (!wrapper.classList.contains('meros-open-submenus-on-click')) {
                disableSubmenuOpenOnHover(wrapper);
                enableSubmenuOpenOnClick(document, wrapper, true);
            }
        } else {
            wrapper.classList.remove('meros-mobile-menu-active');
            wrapper.classList.remove('meros-mobile-menu-open');
            document.documentElement.classList.remove('meros-mobile-menu-active');
            if (wrapper.dataset.forcedSubmenuOpenOnClick === 'true') {
                disableSubmenuOpenOnClick(document, wrapper);
                enableSubmenuOpenOnHover(document, wrapper);
            }
        }
    });
}

function initMobileMenu(wrapper, livewireNavigated = false) {
    const navEl = wrapper.querySelector('nav');
    if (!navEl) return;

    const container = navEl.querySelector('.wp-block-navigation__container');
    if (!container) return;

    const mobileToggle = wrapper.querySelector('.meros-navigation-mobile-toggle');
    if (!mobileToggle) return;

    const isPersisted = wrapper.closest('header')?.parentElement?.hasAttribute('x-persist') || false;
    if (isPersisted && livewireNavigated) return;

    mobileToggle.addEventListener('click', () => {
        const isActive = wrapper.classList.contains('meros-mobile-menu-active');
        if (!isActive) return;

        const isOpen = wrapper.classList.contains('meros-mobile-menu-open');
        const isUnderHeader = wrapper.classList.contains('meros-mobile-menu-under-header');
        let overlay = document.querySelector('.meros-mobile-menu-overlay');

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
            overlay = document.createElement('div');
            overlay.classList.add('meros-mobile-menu-overlay');
            document.body.prepend(overlay);
        }

        overlay.classList.add('active');

        const navBtns = container.querySelector('.meros-navigation-btns');
        if (!navBtns) return; 

        const backBtn = navBtns.querySelector('.meros-navigation-back-btn');
        const closeBtn = navBtns.querySelector('.meros-navigation-close-btn');

        if (!backBtn || !closeBtn) return;

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
        
        mobileToggle.classList.add('open');
        wrapper.classList.add('meros-mobile-menu-open');
    });
}

function resetCurrentMenuItem(wrapper) {
    requestAnimationFrame(() => {
        const navLinks = wrapper.querySelectorAll('.wp-block-navigation-item');
        navLinks.forEach(link => {
            link.classList.remove('current-menu-item');
            const a = link.querySelector('a');
            if (!a) return;
            
            const href = a.getAttribute('href');
            if (href === window.location.href || href === window.location.pathname) {
                link.classList.add('current-menu-item');
            }
        });
    });
}

function initNavigationBlocks(livewireNavigated = false) {
    const wrappers = document.querySelectorAll('.meros-navigation-wrapper');

    wrappers.forEach(wrapper => {
        const isPersisted = wrapper.closest('header')?.parentElement?.hasAttribute('x-persist') || false;

        if (livewireNavigated && isPersisted) {
            resetCurrentMenuItem(wrapper);
            return;
        }

        if (wrapper.classList.contains('meros-open-submenus-on-click')) {
            enableSubmenuOpenOnClick(document, wrapper);
        } else {
            enableSubmenuOpenOnHover(document, wrapper);
        }

        // Init mobile menu if the wrapper has the class
        if (wrapper.classList.contains('meros-has-mobile-menu')) {
            initMobileMenu(wrapper, livewireNavigated);
        }
    });
}

function initAdvancedNav(livewireNavigated = false) {
    merosSetHeaderHeight({
        doc: document,
        win: window
    });
    const width = window.innerWidth;
    initNavigationBlocks(livewireNavigated);
    setMobileMenus(width);

    if (!livewireNavigated) {
        window.addEventListener('resize', () => {
            const newWidth = window.innerWidth;
            if (newWidth !== width) {
                setMobileMenus(newWidth);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => initAdvancedNav());
document.addEventListener('livewire:navigated', () => initAdvancedNav(true));

// Ensure menus are closed when navigating with Livewire
document.addEventListener('livewire:navigating', () => {
    const navWrappers = document.querySelectorAll('.meros-navigation-wrapper');
    navWrappers.forEach(wrapper => {
        if (wrapper.classList.contains('meros-mobile-menu-active')) {
            const mobileToggle = wrapper.querySelector('.meros-navigation-mobile-toggle');
            if (mobileToggle) {
                mobileToggle.classList.remove('open');
            }
            wrapper.classList.remove('meros-mobile-menu-open');
        }

        const submenus = wrapper.querySelectorAll('.meros-submenu-wrapper');
        requestAnimationFrame(() => {
            submenus.forEach(submenu => {
                submenu.classList.remove('meros-submenu-open');
            });
            wrapper.classList.remove('meros-submenu-open');
        });
    });

    // Remove active class from mobile menu overlay
    const overlay = document.querySelector('.meros-mobile-menu-overlay.active');
    if (overlay) {
        overlay.classList.remove('active');
    }
});
