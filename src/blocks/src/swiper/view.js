import Swiper from 'swiper';
import { Navigation, Pagination, Scrollbar, Autoplay, FreeMode, Mousewheel} from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ANIMATED = 'meros-animated';
const REANIMATE = 'meros-animate-on-slide-change';

function restartAnimation(el) {
    el.classList.remove(ANIMATED);
    void el.offsetWidth;

    el.classList.add(ANIMATED);
}

function animateVisibleSlideElements(swiper) {
    swiper.slides.forEach(slide => {
        const isActive =
            slide.classList.contains('swiper-slide-active') ||
            slide.classList.contains('swiper-slide-visible');

        slide.querySelectorAll('.meros-has-block-animation').forEach(el => {
            const wrapper = el.closest('.meros-animation-wrapper');
            const shouldReanimate = wrapper ? wrapper.classList.contains(REANIMATE) : false;

            if (isActive) {
                if (shouldReanimate) {
                    restartAnimation(el);
                } else if (!el.classList.contains(ANIMATED)) {
                    el.classList.add(ANIMATED);
                }
            } else {
                if (shouldReanimate) {
                    el.classList.remove(ANIMATED);
                }
            }
        });
    });
}

function getMerosSwiperInstance(el, params) {
    return new Swiper(el, {
        modules: [Navigation, Pagination, Scrollbar, Autoplay, FreeMode, Mousewheel],
        ...params
    });

}

function setDynamicSlides(swiperEl) {
    const wrapper = swiperEl.querySelector('.swiper-wrapper');
    if (!wrapper) return false;
    const slides = swiperEl.querySelectorAll('.wp-block-post');
    if (slides.length === 0) return false;
    wrapper.innerHTML = '';
    slides.forEach(slide => {
        slide.classList.add('swiper-slide');
        wrapper.appendChild(slide);
    });
    return true;
}

function initMerosSwipers(livewireNavigated = false) {
    const swipers = document.querySelectorAll('.meros-swiper');

    swipers.forEach((swiperEl) => {
        const isPersisted = swiperEl.hasAttribute('x-persist');
        if (isPersisted && livewireNavigated) return;

        if (swiperEl.dataset.dynamic === 'true') {
            const dynamicSet = setDynamicSlides(swiperEl);
            if (!dynamicSet) return;
        }

        const navigation = JSON.parse(swiperEl.dataset.navigation || '{}');
        const pagination = JSON.parse(swiperEl.dataset.pagination || '{}');
        const scrollbar = JSON.parse(swiperEl.dataset.scrollbar || '{}');
        const breakpoints = JSON.parse(swiperEl.dataset.breakpoints || '{}');

        const navPrevEl = swiperEl.querySelector('.swiper-button-prev');
        const navNextEl = swiperEl.querySelector('.swiper-button-next');
        if (navPrevEl && navNextEl) {
            navigation.prevEl = navPrevEl;
            navigation.nextEl = navNextEl;
        } else {
            navigation.enabled = false;
        }

        const pagEl = swiperEl.querySelector('.swiper-pagination');
        if (pagEl) {
            pagination.el = pagEl;
        } else {
            pagination.enabled = false;
        }

        const scrollEl = swiperEl.querySelector('.swiper-scrollbar');
        if (scrollEl) {
            scrollbar.el = scrollEl;
        } else {
            scrollbar.enabled = false;
        }

        const centeredSlides = swiperEl.dataset.centered === 'true';
        const initialSlide = parseInt(swiperEl.dataset.initialSlide) || 0;
        const mousewheel = JSON.parse(swiperEl.dataset.mousewheel || 'false');
        const freeMode = JSON.parse(swiperEl.dataset.freeMode || 'false');
        const autoplay = (swiperEl.dataset.autoplay === 'true' && mousewheel.enabled !== true && freeMode.enabled !== true)
            ? {
                delay: Number(swiperEl.dataset.autoplayDelay) || 3000,
                disableOnInteraction: true,
                pauseOnMouseEnter: false,
            }
            : false;

        const params = {
            slidesPerView: swiperEl.dataset.slidesPerView || 1,
            spaceBetween: swiperEl.dataset.spaceBetween || 0,
            speed: swiperEl.dataset.speed || 800,
            centeredSlides: centeredSlides,
            centeredSlidesBounds: centeredSlides,
            initialSlide: initialSlide,
            loop: swiperEl.dataset.loop === 'true',
            autoplay: autoplay,
            freeMode: freeMode,
            mousewheel: mousewheel,
            centeredSlides: centeredSlides,
            centeredSlidesBounds: centeredSlides,
            initialSlide: initialSlide,

            navigation: navigation,
            pagination: pagination,
            scrollbar: scrollbar,
            breakpoints: breakpoints,
            watchSlidesProgress: true
        };

        const swiper = getMerosSwiperInstance(swiperEl, params);

        // Animate elements in visible slides on init
        requestAnimationFrame(() => {
            animateVisibleSlideElements(swiper);
        });

        // Re-check whenever slide visibility changes
        swiper.on('slideChangeTransitionStart', () => {
            animateVisibleSlideElements(swiper);
        });

        if ( params.loop === false ) {
            swiper.on('reachEnd', () => {
                animateVisibleSlideElements(swiper);
            });
        }

        if ( params.loop === true) {
            swiper.on('loopFix', () => {
                animateVisibleSlideElements(swiper);
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', () => initMerosSwipers(false));
document.addEventListener('livewire:navigated', () => initMerosSwipers(true));
