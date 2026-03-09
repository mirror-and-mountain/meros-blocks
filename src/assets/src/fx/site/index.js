import { merosResolveLogoWidths, merosUpdateHeaderFxOnScroll } from '../helpers.js';
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

    /* Process */
    win.addEventListener('scroll', onScroll, { passive: true });
    update();
}

function processTriggeredFx(triggers, doc) {
    const getTriggerables = (triggeredIds) => {
        const triggerables = [];
        triggeredIds.forEach(id => {
            const triggerable = doc.querySelector(`[data-meros-trigger-id="${id}"]`);
            if (triggerable) {
                triggerables.push(triggerable);
            }
        });
        return triggerables;
    };

    const getReversables = () => {
        const reversables = doc.querySelectorAll(
            '[data-meros-trigger-reverse-on-new-selection="true"]'
        );
        return reversables;
    };

    const triggerListener = (e) => {
        const trigger = e.currentTarget;
        if (!trigger.classList.contains('meros-is-animation-trigger')) return;

        const toggle = trigger.dataset.merosTriggerType === 'toggle';
        const active = trigger.dataset.merosTriggerActive === 'true';

        if (!active) {
            const reversables = getReversables();
            if (reversables.length > 0) {
                reversables.forEach(trig => {
                    if (trig === trigger) return;

                    const isActive = trig.dataset.merosTriggerActive === 'true';
                    if (!isActive) return;

                    const trigTriggerableIds = trig.dataset.merosTriggeredIds?.split(' ') || [];
                    const trigTriggerables = getTriggerables(trigTriggerableIds);
                    
                    trigTriggerables.forEach(triggerable => {
                        triggerable.dataset.merosAnimated = 'false';
                    });
                    trig.dataset.merosTriggerActive = 'false';
                });
            }
        }

        const triggerableIds = trigger.dataset.merosTriggeredIds?.split(' ') || [];
        const triggerables = getTriggerables(triggerableIds);
        
        triggerables.forEach(triggerable => {
            if (toggle && active) {
                triggerable.dataset.merosAnimated = 'false';
            } else if (!active) {
                triggerable.dataset.merosAnimated = 'true';
            }
        });

        if (toggle && active) {
            trigger.dataset.merosTriggerActive = 'false';
        } else if (!active) {
            trigger.dataset.merosTriggerActive = 'true';
        }
    };

    triggers.forEach(trigger => {
        trigger.addEventListener('click', triggerListener);
    });
}

function merosFxInit() {
    const doc = document;
    const win = window;

    if (!doc || !win) return;

    /* Process Header FX */
    const headerEl = doc.querySelector('.meros-has-header-animation');
    merosProcessHeaderFx(headerEl, doc, win);

    /* Process Trigger FX */
    const triggers = doc.querySelectorAll('.meros-is-animation-trigger');
    if (triggers.length > 0) {
        processTriggeredFx(triggers, doc);
    }

    /* Process Scroll FX */
    const SCROLL_FX = 'meros-has-scroll-animation';
    const SCROLL_ANIMATED = 'meros-animated';
    const scrollElements = [...document.querySelectorAll(`.${SCROLL_FX}`)].filter(
        el => !el.closest('.swiper-wrapper')
    );

    /* Scroll - Respect Reduced Motion */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        scrollElements.forEach(el => el.classList.add(SCROLL_ANIMATED));
    }

    /* Scroll - Helpers */
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

    /* Scroll - Check Loop */
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
