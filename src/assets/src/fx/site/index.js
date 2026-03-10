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
            if (!triggerable) return;

            triggerables.push(triggerable);
        });
        return triggerables;
    };

    const getReversableTriggers = (currentTrigger) => {
        const reversables = doc.querySelectorAll(
            '[data-meros-trigger-reverse-on-new-selection="true"]'
        );

        return Array.from(reversables).filter(reversable => {
            return reversable !== currentTrigger && reversable.dataset.merosTriggerActive === 'true';
        });
    };

    const filterElementList = (elements, condition) => {
        return Array.from(elements).filter(el => condition(el));
    };

    const getOpacityDuration = (triggerable) => {
        const duration = parseFloat(
            getComputedStyle(triggerable).getPropertyValue('--meros-triggered-opacity-duration')
        ) || 0.3;
        return duration * 1000;
    };

    const triggerableHasDelay = (triggerable) => {
        return triggerable.classList.contains('meros-start-hidden') &&
            !triggerable.classList.contains('meros-occupy-space');
    };

    const triggerListener = (e) => {
        const trigger = e.currentTarget;
        if (!trigger.classList.contains('meros-is-animation-trigger')) return;

        const toggle = trigger.dataset.merosTriggerType === 'toggle';
        const active = trigger.dataset.merosTriggerActive === 'true';
        const triggerableIds = trigger.dataset.merosTriggeredIds?.split(' ') || [];
        const triggerables = getTriggerables(triggerableIds);

        let transitioning = false;

        const animateNewTriggerables = (triggerables, delay = 0) => {
            const animate = (triggerable) => {
                const hasDelay = triggerableHasDelay(triggerable);

                if (toggle && active) {
                    triggerable.dataset.merosAnimated = 'false';

                    if (hasDelay) {
                        const transitionDuration = getOpacityDuration(triggerable);

                        setTimeout(() => {
                            triggerable.style.height = "0px";

                            setTimeout(() => {
                                triggerable.style.display = 'none';
                            }, 300);
                        }, transitionDuration);
                    }
                }

                else if (!active) {

                    if (hasDelay) {
                        triggerable.style.display = 'block';
                    }

                    requestAnimationFrame(() => {
                        const scrollHeight = triggerable.scrollHeight;
                        triggerable.style.height = scrollHeight + 'px';

                        if (transitioning) {
                            triggerable.dataset.merosAnimated = 'true';
                        }

                        else if (hasDelay) {
                            setTimeout(() => {
                                triggerable.dataset.merosAnimated = 'true';
                            }, 300);
                        }

                        else {
                            triggerable.dataset.merosAnimated = 'true';

                        }
                    });
                }
            };

            triggerables.forEach(triggerable => {
                if (delay > 0) {
                    setTimeout(() => animate(triggerable), delay);
                } else {
                    animate(triggerable);
                }
            });

            if (toggle && active) {
                trigger.dataset.merosTriggerActive = 'false';
            } else if (!active) {
                trigger.dataset.merosTriggerActive = 'true';
            }
        };

        const animateReversables = (reversables, triggerables) => {
            let maxDuration = 0;

            const animate = (reversable) => {
                transitioning = true;

                const triggerableIds = reversable.dataset.merosTriggeredIds?.split(' ') || [];
                const triggerables = getTriggerables(triggerableIds);

                triggerables.forEach(triggerable => {
                    triggerable.dataset.merosAnimated = 'false';

                    if (triggerableHasDelay(triggerable)) {
                        const transitionDuration = getOpacityDuration(triggerable);
                        maxDuration = Math.max(maxDuration, transitionDuration);

                        setTimeout(() => {
                            triggerable.style.display = 'none';
                            triggerable.style.height = '0px';
                        }, transitionDuration);
                    }
                });

                reversable.dataset.merosTriggerActive = 'false';
            };

            reversables.forEach(reversable => animate(reversable));

            animateNewTriggerables(triggerables, maxDuration);
        };

        if (!active) {
            const reversableTriggers = getReversableTriggers(trigger);

            if (reversableTriggers.length > 0) {
                const delayedTriggerables = filterElementList(triggerables, triggerable => {
                    return triggerable.classList.contains('meros-start-hidden') && !triggerable.classList.contains('meros-occupy-space');
                });

                const immediateTriggerables = filterElementList(triggerables, triggerable => {
                    return triggerable.classList.contains('meros-occupy-space') || !triggerable.classList.contains('meros-start-hidden');
                });

                animateNewTriggerables(immediateTriggerables);
                animateReversables(reversableTriggers, delayedTriggerables);
            }

            else {
                animateNewTriggerables(triggerables);
            }

        } else {
            animateNewTriggerables(triggerables);
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

    /* Process Scroll FX - move to separate function at some point */
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
