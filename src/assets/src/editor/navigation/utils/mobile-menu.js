export function initMobileMenu(iframe, rootContainer) {
    const navWrappers = rootContainer.querySelectorAll('.meros-navigation-wrapper');

    navWrappers.forEach(wrapper => {
        const navEl = wrapper.querySelector('nav');
        if (!navEl) return;

        const container = navEl.querySelector('.wp-block-navigation__container');
        if (!container) return;

        const mobileToggle = wrapper.querySelector('.meros-navigation-mobile-toggle');
        if (!mobileToggle) return;

        mobileToggle.addEventListener('click', () => {
            const isOpen = wrapper.classList.contains('meros-mobile-menu-open');
            const openOnClickEnabled = wrapper.classList.contains('meros-open-submenus-on-click');

            if (isOpen) return;

            const navBtns = container.querySelector('.meros-navigation-btns');
            
            if (!navBtns) {
                const btnsContainer = document.createElement('div');
                btnsContainer.classList.add('meros-navigation-btns');

                const backBtn = document.createElement('div');
                backBtn.className = 'meros-navigation-back-btn meros-navigation-btn';
                backBtn.setAttribute('aria-label', 'Back to Menu');
                backBtn.setAttribute('title', 'Back to Menu');
                backBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px" style="transform: rotate(180deg);">
                            <path d="M 9.9989971 4.9999848 A 1.0001 1.0001 0 1 0 8.5857864 6.4141935 L 13.171572 11 L 8.5857864 15.585807 A 1.0001 1.0001 0 1 0 10.000001 17 L 16.999998 11 L 10.000001 5 A 1.0001 1.0001 0 0 0 9.9989971 4.9999848 z"/>
                        </svg>
                    `;

                const closeBtn = document.createElement('div');
                closeBtn.className = 'meros-navigation-close-btn meros-navigation-btn';
                closeBtn.setAttribute('aria-label', 'Close Menu');
                closeBtn.setAttribute('title', 'Close Menu');
                closeBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20px" height="20px" aria-label="Close Icon">
                            <path d="M 4.7070312 3.2929688 A 1.0001 1.0001 0 0 0 3.2929688 4.7070312 L 10.585938 12 L 3.2929688 19.292969 A 1.0001 1.0001 0 1 0 4.7070312 20.707031 L 12 13.414062 L 19.292969 20.707031 A 1.0001 1.0001 0 1 0 20.707031 19.292969 L 13.414062 12 L 20.707031 4.7070312 A 1.0001 1.0001 0 0 0 19.292969 3.2929688 L 12 10.585938 L 4.7070312 3.2929688 z"/>
                        </svg>
                    `;

                btnsContainer.appendChild(backBtn);
                btnsContainer.appendChild(closeBtn);
                container.prepend(btnsContainer);

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
            }

            mobileToggle.classList.add('open');
            wrapper.classList.add('meros-mobile-menu-open');
        });
    });

    const observer = new ResizeObserver(() => {
        const isMobile = rootContainer.classList.contains('is-mobile-preview');
        setMobileMenu(rootContainer, isMobile);
    });

    observer.observe(iframe);
}

function setMobileMenu(rootContainer, isMobile) {
    const navWrappers = rootContainer.querySelectorAll('.meros-navigation-wrapper');

    navWrappers.forEach(wrapper => {
        if (!isMobile) {
            wrapper.classList.remove('meros-mobile-menu-open');
            wrapper.classList.remove('meros-mobile-menu-active');
        } else {
            wrapper.classList.add('meros-mobile-menu-active');
        }
    });
}