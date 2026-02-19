import { 
    enableSubmenuOpenOnClick, 
    disableSubmenuOpenOnClick, 
    enableSubmenuOpenOnHover, 
    disableSubmenuOpenOnHover 
} from '../editor/utils/listeners';

import './styles.scss';

function stripWPDataAttributes(element) {
    const wpDataAttributes = [
        'data-wp-context',
        'data-wp-on--focusout',
        'data-wp-on--keydown',
        'data-wp-on--mouseenter',
        'data-wp-on--mouseleave',
        'data-wp-watch',
        'data-wp-bind--aria-expanded',
        'data-wp-on--click',
        'data-wp-on--focus',
    ];

    wpDataAttributes.forEach((attr) => {
        if (element.hasAttribute(attr)) {
            element.removeAttribute(attr);
        }
    });
}

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

function initMobileMenu(wrapper) {
    const navEl = wrapper.querySelector('nav');
    if (!navEl) return;

    const container = navEl.querySelector('.wp-block-navigation__container');
    if (!container) return;

    const mobileToggle = wrapper.querySelector('.meros-navigation-mobile-toggle');
    if (!mobileToggle) return;

    mobileToggle.addEventListener('click', () => {
        const isActive = wrapper.classList.contains('meros-mobile-menu-active');
        if (!isActive) return;

        const isOpen = wrapper.classList.contains('meros-mobile-menu-open');
        if (isOpen) return;

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

                setTimeout(() => {
                    wrapper.classList.remove('meros-mobile-menu-closing');
                }, 400);
            }
        });
        
        mobileToggle.classList.add('open');
        wrapper.classList.add('meros-mobile-menu-open');
    });
}

function initNavigationBlocks() {
    const wrappers = document.querySelectorAll('.meros-navigation-wrapper');

    wrappers.forEach(wrapper => {
        // Strip WP data attributes from submenu elements
        const submenus = wrapper.querySelectorAll('.meros-submenu-wrapper');
        submenus.forEach(submenu => {
            stripWPDataAttributes(submenu);

            const button = submenu.querySelector('button');
            const innerContainer = submenu.querySelector('.wp-block-navigation__submenu-container');
            
            if (button) {
                stripWPDataAttributes(button);
            }
            
            if (innerContainer) {
                stripWPDataAttributes(innerContainer);
            }
        });

        // Enable submenu opening behaviour       
        if (wrapper.classList.contains('meros-open-submenus-on-click')) {
            enableSubmenuOpenOnClick(document, wrapper);
        } else {
            enableSubmenuOpenOnHover(document, wrapper);
        }

        // Init mobile menu if the wrapper has the class
        if (wrapper.classList.contains('meros-has-mobile-menu')) {
            initMobileMenu(wrapper);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const width = window.innerWidth;
    initNavigationBlocks();
    setMobileMenus(width);

    window.addEventListener('resize', () => {
        const newWidth = window.innerWidth;
        if (newWidth !== width) {
            setMobileMenus(newWidth);
        }
    });
});
