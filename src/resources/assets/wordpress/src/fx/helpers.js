export function merosResolveLogoWidths(logoContainer, logoImg, headerElement) {
    if (!logoContainer || !logoImg) return false;

    const animationClass = 'meros-has-animated-logo-width';
    const hadAnimationClass = headerElement.classList.contains(animationClass);

    // Measure the logo's natural/rendered width without the animation width override.
    if (hadAnimationClass) {
        headerElement.classList.remove(animationClass);
    }

    let baseWidthPx = null;
    try {
        const imageRectWidth = logoImg.getBoundingClientRect?.().width || 0;
        const imageComputedWidth = parseFloat(getComputedStyle(logoImg).width) || 0;
        const containerStyleWidth = parseFloat(logoContainer.style?.width) || 0;
        const containerRectWidth = logoContainer.getBoundingClientRect?.().width || 0;
        const containerComputedWidth = parseFloat(getComputedStyle(logoContainer).width) || 0;
        const imageAttrWidth = parseFloat(logoImg.getAttribute('width')) || 0;

        baseWidthPx =
            imageRectWidth ||
            imageComputedWidth ||
            containerStyleWidth ||
            containerRectWidth ||
            containerComputedWidth ||
            imageAttrWidth ||
            null;
    } finally {
        if (hadAnimationClass) {
            headerElement.classList.add(animationClass);
        }
    }

    if (!baseWidthPx) return false;

    const startValue =
        headerElement.style.getPropertyValue('--meros-header-animated-logo-width') ||
        getComputedStyle(headerElement).getPropertyValue(
            '--meros-header-animated-logo-width'
        );

    if (!startValue) return false;

    const parsedStart = parseFloat(startValue);
    if (!Number.isFinite(parsedStart) || parsedStart <= 0) return false;

    const endFactor = parsedStart > 10 ? parsedStart / 100 : parsedStart;
    const startWidthPx = baseWidthPx;
    const endWidthPx = baseWidthPx * endFactor;

    headerElement.style.setProperty(
        '--logo-width-start', `${startWidthPx}px`
    );
    headerElement.style.setProperty(
        '--logo-width-end', `${endWidthPx}px`
    );

    return true;
}

export function merosUpdateHeaderHeightVar(headerElement, doc) {
    if (!headerElement || !doc?.documentElement) return;

    doc.documentElement.style.setProperty(
        '--meros-header-height',
        `${headerElement.offsetHeight}px`
    );
}

export function merosUpdateHeaderFxOnScroll(headerElement, win) {
    if (!headerElement) return;
    const scrollY = win.scrollY || win.pageYOffset;
    const headerHeight = headerElement.offsetHeight || 1;
    const t = Math.min(scrollY / headerHeight, 1);

    headerElement.style.setProperty('--fx-progress', t);
}