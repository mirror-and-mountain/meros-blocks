import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';

import { addMerosAttrs } from './block-mods/add-meros-attrs.js';
import { addMerosControls } from './block-mods/add-meros-controls.js';
import { addEditorAnimationWrapper } from './block-mods/add-editor-animation-wrapper.js';
import { addStickyElementEditorStyle } from './block-mods/add-sticky-element-wrapper.js';
import { applyMerosFxStyles } from './block-mods/apply-meros-fx-styles.js';
import { applyMerosStickyStyles } from './block-mods/apply-meros-sticky-styles.js';
import { merosSetHeaderHeight, merosResolveLogoWidths, merosUpdateHeaderFxOnScroll } from '../../shared/merosFx.js';

import './style.scss';

wp.domReady(() => {
    // Add attributes, controls, and editor wrappers for fx
    addFilter('blocks.registerBlockType', 'meros/block-attributes', addMerosAttrs);
    addFilter('editor.BlockEdit', 'meros/block-controls', addMerosControls);
    addFilter('editor.BlockListBlock', 'meros/block-animation-editor-wrapper', addEditorAnimationWrapper);
    addFilter('editor.BlockListBlock', 'meros/sticky-element-editor-style', addStickyElementEditorStyle);

    // Add classes to saved content for block types
    addFilter('blocks.getSaveContent.extraProps', 'meros/block-classes', applyMerosFxStyles);
    addFilter('blocks.getSaveContent.extraProps', 'meros/block-sticky-classes', applyMerosStickyStyles);
});

wp.domReady(() => {
    // Process fx in the editor
    const getIframe = () => document.querySelector('iframe');

    const isIframeReady = () => {
        const iframe = getIframe();
        const doc = iframe?.contentDocument;
        const editorBody = doc?.querySelector('.editor-styles-wrapper');

        return editorBody !== undefined && editorBody !== null;
    };

    const processFxAnimations = (iframe) => {
        const doc = iframe.contentDocument;
        const win = iframe.contentWindow;

        const editorBody = doc.querySelector('.editor-styles-wrapper');
        if (!editorBody) return;

        const HEADER_FX = 'meros-has-header-animation';
        const headerEl = editorBody.querySelector(`.${HEADER_FX}`);
        if (!headerEl) return;

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
    };

    const init = () => {
        const iframe = getIframe();
        const doc = iframe?.contentDocument;
        const win = iframe?.contentWindow;
        if (!iframe || !doc || !win) return;

        merosSetHeaderHeight(doc, win, 'header');
        processFxAnimations(iframe);
    };

    if (!isIframeReady()) {
        const observer = new MutationObserver(() => {
            if (!isIframeReady()) return;

            init();
            observer.disconnect();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        init();
    }
});



