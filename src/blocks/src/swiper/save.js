import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { NavigationSets } from './navigation/navigation-sets.js';

export default function Save({ attributes }) {
    const navigationSet = NavigationSets[attributes.navigationStyle.icon] || NavigationSets['default'];
    const PrevIcon = navigationSet.prev;
    const NextIcon = navigationSet.next;

    const {
        dynamic,
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
        breakpoints
    } = attributes;

    const navigationData = {
        ...navigation,
        enabled: showNavigation === true
    };

    const paginationData = {
        ...pagination,
        enabled: showPagination === true
    };

    const navStyle = showNavigation ? {
        '--swiper-navigation-color': navigationStyle.color || '#000000',
        '--swiper-navigation-size': `${navigationStyle.size || 44}px`,
    } : {};

    const pagStyle = showPagination ? {
        '--swiper-pagination-color': paginationStyle.activeColor || '#000000',
        '--swiper-pagination-bullet-inactive-color': paginationStyle.inactiveColor || '#888888',
        '--swiper-pagination-fraction-color': paginationStyle.activeColor || '#000000',
    } : {};

    const blockProps = useBlockProps.save({ className: 'meros-swiper swiper' });
    const wrapperProps = useInnerBlocksProps.save({ className: 'swiper-wrapper' });

    return (
        <div {...blockProps}
            data-dynamic={dynamic ? 'true' : 'false'}
            data-slides-per-view={parseFloat(slidesPerView)}
            data-space-between={spaceBetween}
            data-speed={speed}
            data-loop={loop ? 'true' : 'false'}
            data-centered={centeredSlides ? 'true' : 'false'}
            data-initial-slide={initialSlide}
            data-autoplay={autoplay ? 'true' : 'false'}
            data-autoplay-delay={autoplayDelay}
            data-free-mode={JSON.stringify(freeMode)}
            data-mousewheel={JSON.stringify(mousewheel)}
            data-navigation={JSON.stringify(navigationData)}
            data-pagination={JSON.stringify(paginationData)}
            data-breakpoints={JSON.stringify(breakpoints)}
        >
            <div {...wrapperProps} />
            { showNavigation && (
                <>
                    <div className="swiper-button-prev" style={navStyle}>
                        <PrevIcon />
                    </div>
                    <div className="swiper-button-next" style={navStyle}>
                        <NextIcon />
                    </div>
                </>
            )}
            { showPagination && (
                <div className="swiper-pagination" style={pagStyle}></div>
            )}
        </div>
    );
}