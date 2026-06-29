import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';

import { useFxAttributes } from './hooks/fxAttributes.js';

import { AnimationControls } from './components/AnimationControls.js';
import { AnimationWrapper } from './components/AnimationWrapper.js';
import { StickyElementWrapper } from './components/StickyElementWrapper.js';

import { saveFxStyles } from './hooks/saveFxStyles.js';
import { saveStickyStyles } from './hooks/saveStickyStyles.js';

import { merosResolveLogoWidths, merosUpdateHeaderFxOnScroll } from '../helpers.js';

import { initEditorScripts } from '../../utils/editor.js';

import './style.scss';

wp.domReady(() => {
    // Add attributes
    addFilter('blocks.registerBlockType', 'meros/block-attributes', useFxAttributes);

    // Add controls to the inspector
    addFilter('editor.BlockEdit', 'meros/block-controls', AnimationControls);

    // Editor wrappers for fx previews and sticky blocks
    addFilter('editor.BlockListBlock', 'meros/block-animation-editor-wrapper', AnimationWrapper);
    addFilter('editor.BlockListBlock', 'meros/sticky-element-editor-style', StickyElementWrapper);

    // Add classes to saved content for compatible block types
    addFilter('blocks.getSaveContent.extraProps', 'meros/block-classes', saveFxStyles);
    addFilter('blocks.getSaveContent.extraProps', 'meros/block-sticky-classes', saveStickyStyles);

    // Process fx in the editor
    function processHeaderFxAnimations(headerEl, win) {
        if (headerEl.dataset.merosFxProcessed === 'true') return;
        headerEl.dataset.merosFxProcessed = 'true';

        // Optional logo (editor)
        const logoImgContainer = headerEl.querySelector(
            '.components-resizable-box__container'
        );
        const logoImg = logoImgContainer?.querySelector('img');

        let ticking = false;
        let isActive = false;
        let logoResolved = false;

        let logoStyleObserver;
        let headerStyleObserver;

        const update = () => {
            if (!isActive) return;
            merosUpdateHeaderFxOnScroll(headerEl, win);
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                win.requestAnimationFrame(update);
                ticking = true;
            }
        };

        const startPreview = () => {
            if (isActive) return;
            isActive = true;

            // Retry logo resolution (bounded)
            let attempts = 0;
            const MAX_ATTEMPTS = 60;

            const tryResolve = () => {
                if (logoResolved || attempts >= MAX_ATTEMPTS) return;
                attempts++;
                if (!merosResolveLogoWidths(logoImgContainer, logoImg, headerEl)) {
                    win.requestAnimationFrame(tryResolve);
                }
            };

            tryResolve();

            win.addEventListener('scroll', onScroll, { passive: true });
            update();
        };

        const stopPreview = () => {
            if (!isActive) return;
            isActive = false;

            win.removeEventListener('scroll', onScroll);

            headerEl.style.removeProperty('--fx-progress');
            headerEl.style.removeProperty('--logo-width-start');
            headerEl.style.removeProperty('--logo-width-end');

            logoResolved = false;

            logoStyleObserver?.disconnect();
            headerStyleObserver?.disconnect();
        };

        /* Initial state */
        if (headerEl.classList.contains('meros-preview-header-fx')) {
            startPreview();
        }

        /* Watch preview toggle */
        const classObserver = new MutationObserver(() => {
            if (headerEl.classList.contains('meros-preview-header-fx')) {
                startPreview();
            } else {
                stopPreview();
            }
        });

        classObserver.observe(headerEl, {
            attributes: true,
            attributeFilter: ['class']
        });

        /* Observe logo width */
        if (logoImgContainer) {
            logoStyleObserver = new MutationObserver(() => {
                if (!isActive) return;

                logoResolved = false;
                merosResolveLogoWidths(logoImgContainer, logoImg, headerEl);
                update();
            });

            logoStyleObserver.observe(logoImgContainer, {
                attributes: true,
                attributeFilter: ['style']
            });
        }

        /* Observe header style changes */
        headerStyleObserver = new MutationObserver(() => {
            if (!isActive) return;

            logoResolved = false;
            merosResolveLogoWidths(logoImgContainer, logoImg, headerEl);
            update();
        });

        headerStyleObserver.observe(headerEl, {
            attributes: true,
            attributeFilter: ['style']
        });

        /* Resize listener */
        win.addEventListener('resize', () => {
            if (isActive && logoImg) {
                logoResolved = false;
                merosResolveLogoWidths(logoImgContainer, logoImg, headerEl);
                update();
            }
        });
    }

    function observeCompatibleHeaderBlocks({ doc, win }) {
        const observer = new MutationObserver(() => {
            const header = doc.querySelector('.meros-has-header-animation');
            if (header) {
                processHeaderFxAnimations(header, win);
            }
        });

        observer.observe(doc, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });

        const initialHeader = doc.querySelector('.meros-has-header-animation');
        if (initialHeader) {
            processHeaderFxAnimations(initialHeader, win);
        }
    }

    function observeCompatibleTriggerBlocks({ doc }) {
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
                        return !triggerable.classList.contains('meros-start-hidden');
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

        const triggerObservers = new WeakMap();

        const setupTrigger = (trigger) => {
            if (triggerObservers.has(trigger)) return;

            const triggerObserver = new MutationObserver(() => {
                if (trigger.classList.contains('meros-preview-trigger-fx') &&
                    trigger.dataset.merosTriggerPreviewInitialised !== 'true'
                ) {
                    trigger.addEventListener('click', triggerListener);
                    trigger.dataset.merosTriggerPreviewInitialised = 'true';
                }

                else if (
                    !trigger.classList.contains('meros-preview-trigger-fx') &&
                    trigger.dataset.merosTriggerPreviewInitialised === 'true'
                ) {
                    const triggeredIds = trigger.dataset.merosTriggeredIds?.split(' ') || [];
                    const triggerables = getTriggerables(triggeredIds);

                    triggerables.forEach(triggerable => {
                        triggerable.dataset.merosAnimated = 'false';
                    });

                    trigger.classList.remove('meros-active');
                    trigger.removeEventListener('click', triggerListener);
                    trigger.dataset.merosTriggerPreviewInitialised = 'false';
                }
            });

            triggerObserver.observe(trigger, {
                attributes: true,
                attributeFilter: ['class']
            });

            triggerObservers.set(trigger, triggerObserver);
        };

        const observer = new MutationObserver(() => {
            const triggers = doc.querySelectorAll('.meros-is-animation-trigger');
            triggers.forEach(setupTrigger);
        });

        observer.observe(doc, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
    }

    initEditorScripts(observeCompatibleHeaderBlocks);
    initEditorScripts(observeCompatibleTriggerBlocks);
});



