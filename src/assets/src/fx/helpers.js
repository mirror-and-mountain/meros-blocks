export function merosResolveLogoWidths(logoContainer, logoImg, headerElement) {
    if (!logoContainer || !logoImg) return false;
    
    const endWidthPx = logoContainer.style?.width
        ? parseFloat(logoContainer.style.width)
        : parseFloat(logoImg.getAttribute('width')) || null;

    if (!endWidthPx) return false;

    const startValue =
        headerElement.style.getPropertyValue('--meros-header-animated-logo-width') ||
        getComputedStyle(headerElement).getPropertyValue(
            '--meros-header-animated-logo-width'
        );

    if (!startValue) return false;
    const startWidthPx = parseFloat(startValue) * endWidthPx;

    headerElement.style.setProperty(
        '--logo-width-start', `${startWidthPx}px`
    );
    headerElement.style.setProperty(
        '--logo-width-end', `${endWidthPx}px`
    );

    return true;
}

export function merosUpdateHeaderFxOnScroll(headerElement, win) {
    if (!headerElement) return;
    const scrollY = win.scrollY || win.pageYOffset;
    const headerHeight = headerElement.offsetHeight || 1;
    const t = Math.min(scrollY / headerHeight, 1);

    headerElement.style.setProperty('--fx-progress', t);
}