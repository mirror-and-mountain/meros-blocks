import { dispatch } from '@wordpress/data';

let merosNavDoc = null;
let merosNavCursorInsideWrapperOrSubmenu = false;
let merosNavLastClosestElement = null;
let merosNavHoverTimeout = null;
let merosNavActiveInnerWrapper = null;
let merosNavHoverWindowLeaveBindings = 0;
let merosNavHoverScheduleToken = 0;
let merosNavPointerX = null;
let merosNavPointerY = null;
let merosNavPointerLastMoveAt = 0;

function clearHoverTimeout() {
    merosNavHoverScheduleToken += 1;

    if (merosNavHoverTimeout) {
        clearTimeout(merosNavHoverTimeout);
        merosNavHoverTimeout = null;
    }
}

function clearHoverStateOnViewportExit() {
    merosNavCursorInsideWrapperOrSubmenu = false;
    clearHoverTimeout();

    if (merosNavActiveInnerWrapper) {
        resetSubmenuStates(merosNavActiveInnerWrapper);
    }
}

function handleWindowMouseOut(e) {
    if (e.relatedTarget !== null) return;
    clearHoverStateOnViewportExit();
}

function handleWindowBlur() {
    clearHoverStateOnViewportExit();
}

function trackPointerMove(e) {
    merosNavPointerX = e.clientX;
    merosNavPointerY = e.clientY;
    merosNavPointerLastMoveAt = Date.now();
}

function preventClickThrough(e) {
    e.preventDefault();
}

function openSubmenuOnClick(e) {
    const submenu = e.currentTarget;
    const wrapper = submenu.closest('.meros-navigation-wrapper');

    if (!wrapper || !wrapper.classList.contains('meros-open-submenus-on-click')) return;
    const isEditor = submenu.closest('.editor-styles-wrapper') !== null;
    const isMobile = wrapper.classList.contains('meros-mobile-menu-active');

    if (!isMobile &&
        !isEditor &&
        submenu.classList.contains('meros-submenu-open')
    ) {
        const action = submenu.dataset?.action;
        if (action) {
            submenu.classList.remove('meros-submenu-open');
            wrapper.classList.remove('meros-submenu-open');
            eval(action);
            return;
        }
    }

    if (!submenu.classList.contains('meros-submenu-open')) {
        let switchingMegaMenu = false;
        const openSubmenus = wrapper.querySelectorAll('.meros-submenu-open');

        if (openSubmenus.length && submenu.classList.contains('meros-mega-menu-wrapper') && !isMobile) {
            switchingMegaMenu = true;
        }

        openSubmenus.forEach(openSubmenu => {
            if (switchingMegaMenu) {
                openSubmenu.classList.add('meros-mega-menu-switching');
                setTimeout(() => {
                    openSubmenu.classList.remove('meros-mega-menu-switching');
                }, 300);
            }

            openSubmenu.classList.remove('meros-submenu-open');
        });

        if (switchingMegaMenu) {
            submenu.classList.add('meros-mega-menu-switching');
            setTimeout(() => {
                submenu.classList.remove('meros-mega-menu-switching');
            }, 300);
        }

        submenu.classList.add('meros-submenu-open');
        wrapper.classList.add('meros-submenu-open');
    } else {
        if (!isEditor) return;
        const navBlockId = wrapper.querySelector('nav.wp-block-navigation')?.dataset?.block;
        if (!navBlockId) return;

        const { selectBlock } = dispatch('core/block-editor');
        selectBlock(navBlockId);
    }
}

function closeSubmenuOnClick(e) {
    if (e.target.classList.contains('meros-submenu-wrapper')) return;
    if (e.target.closest('.meros-submenu-wrapper') !== null) return;

    const wrapper = e.currentTarget.querySelector(
        '.meros-navigation-wrapper.meros-open-submenus-on-click'
    );
    if (!wrapper) return;
    
    const isMobileActive = wrapper.classList.contains('meros-mobile-menu-active');

    if (isMobileActive) {
        if (
            e.target.tagName === 'BODY' ||
            e.target.classList.contains('wp-block-navigation__container') ||
            e.target.classList.contains('meros-mega-menu-items-container')
        ) {
            return;
        }
    }

    wrapper.classList.remove('meros-submenu-open');

    const openSubmenu = wrapper.querySelector('.meros-submenu-open');
    if (!openSubmenu) return;

    openSubmenu.classList.remove('meros-submenu-open');
}

function wrapperHoverEnter(e) {
    merosNavCursorInsideWrapperOrSubmenu = true;
}

function wrapperHoverLeave(e) {
    const innerWrapper = e.currentTarget;
    const to = e.relatedTarget;

    // moving into a submenu → keep open
    if (to && to.closest('.meros-submenu-wrapper')) return;
    if (to && to.contains(innerWrapper)) return;

    merosNavCursorInsideWrapperOrSubmenu = false;
    clearHoverTimeout();

    // Reset state
    resetSubmenuStates(innerWrapper);
}

function submenuHoverEnter(e) {
    merosNavCursorInsideWrapperOrSubmenu = true;
}

function submenuHoverLeave(e) {
    const innerWrapper = e.currentTarget.closest('.wp-block-navigation__container');
    const to = e.relatedTarget;

    // moving back to wrapper → keep open
    if (to && to.closest('.wp-block-navigation__container')) return;
    if (to && to.contains(innerWrapper)) return;

    merosNavCursorInsideWrapperOrSubmenu = false;
    clearHoverTimeout();

    // Reset state
    resetSubmenuStates(innerWrapper);
}

function scheduleSubmenuOpenOnHover(e) {
    trackPointerMove(e);
    clearHoverTimeout();
    const scheduleToken = merosNavHoverScheduleToken;

    merosNavHoverTimeout = setTimeout(() => {
        if (scheduleToken !== merosNavHoverScheduleToken) return;

        const innerWrapper = merosNavActiveInnerWrapper || e.currentTarget;
        if (!innerWrapper) return;
        if (Date.now() - merosNavPointerLastMoveAt < 300) return;
        if (merosNavPointerX === null || merosNavPointerY === null) return;

        const doc = merosNavDoc || document;
        const currentElements = doc.elementsFromPoint(merosNavPointerX, merosNavPointerY);
        const pointerInsideNavOrSubmenu = currentElements.some(el => {
            if (innerWrapper.contains(el)) return true;
            const submenu = el.closest('.meros-submenu-wrapper');
            return submenu && innerWrapper.contains(submenu);
        });

        if (!pointerInsideNavOrSubmenu) {
            merosNavCursorInsideWrapperOrSubmenu = false;
            resetSubmenuStates(innerWrapper);
            return;
        }

        merosNavCursorInsideWrapperOrSubmenu = true;
        handleSubmenuOpenOnHover({
            clientX: merosNavPointerX,
            clientY: merosNavPointerY,
            currentTarget: innerWrapper,
        });
    }, 300);
}

function handleSubmenuOpenOnHover(e) {
    if (!merosNavCursorInsideWrapperOrSubmenu) return;

    const innerWrapper = e.currentTarget;
    const doc = merosNavDoc || document;
    const elements = doc.elementsFromPoint(e.clientX, e.clientY);

    const hoveredSubmenu = elements
        .map(el => el.closest('.meros-submenu-wrapper'))
        .find(Boolean);

    let closestElement = null;

    if (hoveredSubmenu) {
        closestElement = hoveredSubmenu;
    } else if (!elements.some(el => el.matches('.meros-top-level-item'))) {
        let closestDistance = Infinity;

        const submenus = innerWrapper.querySelectorAll('.meros-submenu-wrapper');
        submenus.forEach(el => {
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;

            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            const dist = dx * dx + dy * dy;

            if (dist < closestDistance) {
                closestDistance = dist;
                closestElement = el;
            }
        });
    }

    if (closestElement !== merosNavLastClosestElement) {
        const isSubmenu = closestElement?.classList.contains('meros-submenu-wrapper');

        if (isSubmenu) {
            let switchingMegaMenu = false;

            if (merosNavLastClosestElement?.classList.contains('meros-submenu-open')) {
                switchingMegaMenu = true;
                merosNavLastClosestElement.classList.add('meros-mega-menu-switching');

                setTimeout(() => {
                    if (merosNavLastClosestElement) {
                        merosNavLastClosestElement.classList.remove('meros-mega-menu-switching');
                    }
                }, 300);

                merosNavLastClosestElement.classList.remove('meros-submenu-open');
            }

            if (switchingMegaMenu) {
                closestElement.classList.add('meros-mega-menu-switching');

                setTimeout(() => {
                    if (closestElement) {
                        closestElement.classList.remove('meros-mega-menu-switching');
                    }
                }, 300);
            }

            closestElement.classList.add('meros-submenu-open');
        } else {
            resetSubmenuStates(innerWrapper);
        }

        merosNavLastClosestElement = closestElement;
    }
}

function resetSubmenuStates(wrapper) {
    const submenus = wrapper.querySelectorAll('.meros-submenu-wrapper');

    submenus.forEach(submenu => {
        submenu.classList.remove('meros-submenu-open');
        submenu.classList.remove('meros-mega-menu-switching');
    });

    merosNavLastClosestElement = null;
}

export function enableSubmenuOpenOnClick(doc, wrapper, force = false) {
    wrapper.classList.add('meros-open-submenus-on-click');
    
    if (force) {
        wrapper.dataset.forcedSubmenuOpenOnClick = 'true';
    }

    const submenus = wrapper.querySelectorAll('.meros-submenu-wrapper');
    submenus.forEach(submenu => {
        if (submenu.tagName === 'LI') {
            submenu.classList.remove('open-on-hover-click');
            submenu.classList.add('open-on-click');
        } else {
            submenu.firstElementChild.classList.remove('open-on-hover-click');
            submenu.firstElementChild.classList.add('open-on-click');
        }

        submenu.addEventListener('click', openSubmenuOnClick);
        const link = submenu.querySelector('a.wp-block-navigation-item__content');
        if (link) {
            link.addEventListener('click', preventClickThrough);
        }
    });

    const rootContainer = doc.querySelector('.is-root-container') || doc.querySelector('body');
    if (!rootContainer) return;

    const rootInitialised = rootContainer.dataset?.merosListeningForSubmenus === 'true';

    if (!rootInitialised) {
        rootContainer.addEventListener('click', closeSubmenuOnClick);
        rootContainer.dataset.merosListeningForSubmenus = 'true';
    }
}

export function disableSubmenuOpenOnClick(doc, wrapper) {
    wrapper.classList.remove('meros-open-submenus-on-click');

    if (wrapper.dataset.forcedSubmenuOpenOnClick === 'true') {
        delete wrapper.dataset.forcedSubmenuOpenOnClick;
    }

    const submenus = wrapper.querySelectorAll('.meros-submenu-wrapper');
    submenus.forEach(submenu => {
        submenu.removeEventListener('click', openSubmenuOnClick);
        if (submenu.tagName === 'LI') {
            submenu.classList.remove('open-on-click');
            submenu.classList.add('open-on-hover-click');
        } else {
            submenu.firstElementChild.classList.remove('open-on-click');
            submenu.firstElementChild.classList.add('open-on-hover-click');
        }

        const link = submenu.querySelector('a.wp-block-navigation-item__content');
        if (link) {
            link.removeEventListener('click', preventClickThrough);
        }
    });

    const rootContainer = doc.querySelector('.is-root-container');
    if (!rootContainer) return;

    const anyOpenOnClick = rootContainer.querySelector(
        '.meros-navigation-wrapper.meros-open-submenus-on-click'
    );

    if (!anyOpenOnClick) {
        rootContainer.removeEventListener('click', closeSubmenuOnClick);
        delete rootContainer.dataset.merosListeningForSubmenus;
    }
}

export function enableSubmenuOpenOnHover(doc, wrapper) {
    merosNavDoc = doc;
    const innerWrapper = wrapper.querySelector('.wp-block-navigation__container');
    if (!innerWrapper) return;
    merosNavActiveInnerWrapper = innerWrapper;

    const submenus = wrapper.querySelectorAll('.meros-submenu-wrapper');
    innerWrapper.addEventListener('mouseenter', wrapperHoverEnter);
    innerWrapper.addEventListener('mouseleave', wrapperHoverLeave);
    innerWrapper.addEventListener('mousemove', scheduleSubmenuOpenOnHover);

    merosNavHoverWindowLeaveBindings += 1;

    if (merosNavHoverWindowLeaveBindings === 1) {
        doc.addEventListener('mousemove', trackPointerMove);
        doc.addEventListener('mouseout', handleWindowMouseOut);
        window.addEventListener('blur', handleWindowBlur);
    }

    submenus.forEach(submenu => {
        if (submenu.classList.contains('open-on-hover-click')) {
            submenu.classList.remove('open-on-hover-click');
        } else {
            submenu.firstElementChild.classList.remove('open-on-hover-click');
        }

        submenu.addEventListener('mouseenter', submenuHoverEnter);
        submenu.addEventListener('mouseleave', submenuHoverLeave);
    });

    document.addEventListener('livewire:navigated', () => {
        clearHoverTimeout();
        merosNavCursorInsideWrapperOrSubmenu = false;
        merosNavLastClosestElement = null;
    });
}

export function disableSubmenuOpenOnHover(wrapper) {
    const innerWrapper = wrapper.querySelector('.wp-block-navigation__container');
    if (!innerWrapper) return;

    const submenus = wrapper.querySelectorAll('.meros-submenu-wrapper');
    innerWrapper.removeEventListener('mouseenter', wrapperHoverEnter);
    innerWrapper.removeEventListener('mouseleave', wrapperHoverLeave);
    innerWrapper.removeEventListener('mousemove', scheduleSubmenuOpenOnHover);
    clearHoverTimeout();

    if (merosNavActiveInnerWrapper === innerWrapper) {
        merosNavActiveInnerWrapper = null;
    }

    merosNavHoverWindowLeaveBindings = Math.max(0, merosNavHoverWindowLeaveBindings - 1);

    if (merosNavHoverWindowLeaveBindings === 0) {
        const doc = merosNavDoc || document;
        doc.removeEventListener('mousemove', trackPointerMove);
        doc.removeEventListener('mouseout', handleWindowMouseOut);
        window.removeEventListener('blur', handleWindowBlur);
    }

    submenus.forEach(submenu => {
        submenu.removeEventListener('mouseenter', submenuHoverEnter);
        submenu.removeEventListener('mouseleave', submenuHoverLeave);
    });
}