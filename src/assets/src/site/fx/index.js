import { 
    merosSetHeaderHeight, 
    merosResolveLogoWidths, 
    merosUpdateHeaderFxOnScroll 
} from '../../editor/shared/merosFx.js';

import './style.scss';

function merosProcessHeaderFx(headerEl, doc, win) {
    if (!headerEl || !doc || !win) return;

    /* Helpers */
    let ticking = false;
    
    const update = () => {
        merosUpdateHeaderFxOnScroll(headerEl, win);
        ticking = false;
    };

    const onScroll = () => {
        if (!ticking) {
            win.requestAnimationFrame(update);
            ticking = true;
        }
    };

    /* Logo Animation */
    if (headerEl.classList.contains('meros-has-animated-logo-width')) {
        const logoImgContainer = headerEl.querySelector('.wp-block-site-logo');
        const logoImg = logoImgContainer?.querySelector('img');
        const logoResolved = merosResolveLogoWidths(logoImgContainer, logoImg, headerEl);
        if (!logoResolved) {
            headerEl.style.removeProperty('--logo-width-start');
            headerEl.style.removeProperty('--logo-width-end');
            headerEl.classList.remove('meros-has-animated-logo-width');
        }
    }

    /* Set Header Height */
    merosSetHeaderHeight(doc, win, 'header');

    /* Process */
    win.addEventListener('scroll', onScroll, { passive: true });
    update();
}

function merosFxInit() {
    const doc = document;
    const win = window;

    if (!doc || !win) return;

    /* Process Header FX */
    const headerEl = doc.querySelector('.meros-has-header-animation');
    merosProcessHeaderFx(headerEl, doc, win);

    /* Process Scroll FX */
    const SCROLL_FX = 'meros-has-scroll-animation';
    const SCROLL_ANIMATED = 'meros-animated';
    const scrollElements = [...document.querySelectorAll(`.${SCROLL_FX}`)].filter(
        el => !el.closest('.swiper-wrapper')
    );

    /* Respect Reduced Motion */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        scrollElements.forEach(el => el.classList.add(SCROLL_ANIMATED));
    }

    /* Helpers */
    const updateAnimationWrapper = (el, value) => {
        const parent = el.parentElement;
        if (parent?.classList.contains('meros-animation-wrapper')) {
            parent.style.overflow = value;
        }
    };

    const elInViewPort = (el) => {
        const rect = el.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < window.innerHeight * 0.85;
    };

    const resetAnimation = (el) => {
        el.classList.remove(SCROLL_ANIMATED);
        updateAnimationWrapper(el, '');
    };

    const animate = (el) => {
        if (el.classList.contains(SCROLL_ANIMATED)) return;
        el.classList.add(SCROLL_ANIMATED);
        updateAnimationWrapper(el, 'hidden');
    };

    /* Check Loop */
    const check = () => {
        scrollElements.forEach(el => {
            if (!el.classList.contains(SCROLL_ANIMATED) && elInViewPort(el)) {
                animate(el);
            }
        });
    };

    win.addEventListener('load', check);
    win.addEventListener('scroll', check, { passive: true });
    win.addEventListener('resize', check);
}

document.addEventListener('DOMContentLoaded', merosFxInit);
document.addEventListener('livewire:navigated', merosFxInit);
