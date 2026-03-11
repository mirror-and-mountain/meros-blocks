import { useSelect } from '@wordpress/data';
import { useBlockProps, useInnerBlocksProps, InnerBlocks } from '@wordpress/block-editor';
import { useEffect, useRef } from '@wordpress/element';

import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay, FreeMode, Mousewheel} from 'swiper/modules';

import { SwiperControls } from './components/controls.js';
import { NavigationSets } from './navigation/navigation-sets.js';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './editor.scss';

// Utility to wait for an element to appear in the DOM
function waitForElement(selector, root = document, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        function check() {
            const el = root.querySelector(selector);
            if (el) return resolve(el);
            if (Date.now() - start > timeout) return reject(new Error('Element not found: ' + selector));
            setTimeout(check, 50);
        }
        check();
    });
}

export default function Edit({ attributes, setAttributes, clientId }) {
    const containerRef = useRef(null);
    const swiperRef = useRef(null);

    const {
        dynamic,
        fixHeight,
        height,
        slidesPerView,
        spaceBetween,
        speed,
        centeredSlides,
        initialSlide,
        loop,
        autoplay,
        autoplayDelay,
        freeMode,
        mousewheel,
        showNavigation,
        showPagination,
        navigation,
        pagination,
        navigationStyle,
        paginationStyle,
        enableBreakPoints,
        breakpoints,
        breakPointDesktopWidth,
        breakPointTabletWidth,
        breakPointMobileWidth
    } = attributes;

    const navigationSet = NavigationSets[navigationStyle.icon] || NavigationSets['default'];
    const PrevIcon = navigationSet.prev;
    const NextIcon = navigationSet.next;
    const allowedBlocks = dynamic ? ['meros/swiper-dynamic-slide'] : ['meros/swiper-slide'];

    const { slides, showSwiper, showEditor } = useSelect((select) => {
        const editor = select('core/block-editor');
        const selectedBlockId = editor.getSelectedBlockClientId();
        const slides = editor.getBlocks(clientId);

        // Check if a slide or any inner block of a slide is selected
        const slideSelected = () => {
            if (!selectedBlockId) return false;

            let current = selectedBlockId;
            while (current) {
                const parent = editor.getBlockRootClientId(current);
                if (parent === clientId) {
                    return true;
                }
                current = parent;
            }
            return false;
        }

        return {
            slides,
            showSwiper: slideSelected() === false,
            showEditor: slideSelected() === true,
        }
    }, [clientId]);

    // Root block wrapper
    const blockProps = useBlockProps({
        className: 'meros-swiper-editor swiper'
    });

    // Swiper wrapper
    const wrapperProps = useInnerBlocksProps(
        { className: 'swiper-wrapper' },
        {
            allowedBlocks: allowedBlocks,
            renderAppender: false
        }
    );

    // Update slides
    const updateSlides = async () => {
        const root = containerRef.current;
        const slideSelector = dynamic ? '.wp-block-post' : '.meros-swiper-slide';
        let slideElements;
        try {
            // Wait for at least one slide to appear
            await waitForElement(slideSelector, root);
            slideElements = root.querySelectorAll(slideSelector);
        } catch (e) {
            slideElements = [];
        }

        let wrapper;
        try {
            wrapper = await waitForElement('.swiper-wrapper', root);
        } catch (e) {
            wrapper = null;
        }
        if (wrapper && slideElements.length > 0) {
            wrapper.innerHTML = '';
            slideElements.forEach((slideEl) => {
                if (slideEl.style.display === 'none') return;
                slideEl.classList.add('swiper-slide');
                wrapper.appendChild(slideEl);
            });
        }
    };

    // Update slide heights
    const updateSlideHeights = async (fixHeight, height) => {
        let slideElements;
        const slideSelector = dynamic ? '.wp-block-post' : '.meros-swiper-slide';
        try {
            await waitForElement(slideSelector, containerRef.current);
            slideElements = containerRef.current.querySelectorAll(slideSelector);
        } catch (e) {
            slideElements = [];
        }
        slideElements.forEach(el => {
            el.style.height = fixHeight ? `${height}px` : 'auto';
        });
    };

    // Initialise or update Swiper
    const initialiseSwiper = async (el, update = false, destroy = false) => {
        if (destroy && swiperRef.current) {
            swiperRef.current.destroy();
            swiperRef.current = null;
        }

        const params = {
            slidesPerView: slidesPerView || 1,
            spaceBetween: `${spaceBetween || '0'}px`,
            speed: speed || 800,
            centeredSlides: centeredSlides === true,
            centeredSlidesBounds: centeredSlides === true,
            initialSlide: initialSlide || 0,
            loop: loop === true,
            grabCursor: false,
            autoplay: autoplay ? {
                delay: autoplayDelay || 3000,
            } : false,
            freeMode: freeMode,
            mousewheel: mousewheel,
            breakpointsBase: 'container',
            breakpoints: enableBreakPoints ? breakpoints : {},
        };

        if (update && swiperRef.current) {
            swiperRef.current.params = {
                ...swiperRef.current.params,
                ...params
            };

            swiperRef.current.update();
            await updateSlideHeights(fixHeight, height);
            return;
        }

        swiperRef.current = new Swiper(el, {
            modules: [Navigation, Pagination, Autoplay, FreeMode, Mousewheel],
            navigation: {
                ...navigation || {},
                prevEl: el !== null ? el.querySelector('.swiper-button-prev') : null,
                nextEl: el !== null ? el.querySelector('.swiper-button-next') : null
            },
            pagination: {
                ...pagination || {},
                el: el !== null ? el.querySelector('.swiper-pagination') : null
            },
            ...params
        });

        await updateSlideHeights(fixHeight, height);
    };

    // (Re)initialise swiper on showSwiper or slides change
    useEffect(() => {
        if (!containerRef.current || !showSwiper) return;
        (async () => {
            if (dynamic) await updateSlides();
            await initialiseSwiper(containerRef.current, false, true);
        })();
    }, [
        slides, 
        showSwiper, 
        pagination, 
        navigation,
        centeredSlides,
        loop,
        freeMode, 
        mousewheel, 
        breakpoints, 
        enableBreakPoints
    ]);

    // Update swiper on attribute changes
    useEffect(() => {
        if (!containerRef.current || !showSwiper || !swiperRef.current) return;
        const el = containerRef.current;
        (async () => {
            if (dynamic) {
                await updateSlides();
                await initialiseSwiper(el, false, true);
                return;
            }
            await updateSlides();
            await initialiseSwiper(el, true, false);
        })();
    }, [
        fixHeight, 
        height, 
        slidesPerView, 
        spaceBetween, 
        initialSlide,
        speed, 
        autoplay, 
        autoplayDelay,
        paginationStyle,
        navigationStyle,
    ]);

    const navDisplay = showNavigation
        ? { display: 'block' }
        : { display: 'none' };

    const pagDisplay = showPagination
        ? { display: 'block', bottom: dynamic ? '' : '50px' }
        : { display: 'none' };

    const navStyle = {
        '--swiper-navigation-color': navigationStyle.color || '#000000',
        '--swiper-navigation-size': `${navigationStyle.size || 44}px`,
    }

    const pagStyle = {
        '--swiper-pagination-color': paginationStyle.activeColor || '#000000',
        '--swiper-pagination-bullet-inactive-color': paginationStyle.inactiveColor || '#888888',
        '--swiper-pagination-fraction-color': paginationStyle.activeColor || '#000000',
        '--swiper-pagination-top': paginationStyle.top || 'auto',
    };

    return (
        <>
            <SwiperControls 
                attributes={attributes} 
                setAttributes={setAttributes} 
                slideCount={containerRef.current?.querySelectorAll('.swiper-slide, .wp-block-post').length || 0} 
            />

            <div {...blockProps} ref={containerRef}>
                {showSwiper && (
                    <>
                        <div {...wrapperProps} />
                        <div className="swiper-button-prev" style={navStyle}>
                            <PrevIcon 
                                className="swiper-button-prev-icon"
                                style={navDisplay}
                            />
                        </div>
                        <div className="swiper-button-next" style={navStyle}>
                            <NextIcon 
                                className="swiper-button-next-icon"
                                style={navDisplay}
                            />
                        </div>
                        <div 
                            className="swiper-pagination"
                            style={{ ...pagStyle, ...pagDisplay }}
                        />

                        {dynamic === false && (
                            <div className="meros-swiper-appender">
                                <InnerBlocks.ButtonBlockAppender />
                            </div>
                        )}
                    </>
                )}

                {showEditor && (
                    <InnerBlocks
                        allowedBlocks={allowedBlocks}
                    />
                )}
            </div>
        </>
    );
}
