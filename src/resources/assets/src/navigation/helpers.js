export function merosSetHeaderHeight({ doc, win, selector }) {
    selector = selector || 'header';

    const header = doc.querySelector(selector);
    if (!header) return;

    const setHeaderHeight = (height) => {
        doc.documentElement.style.setProperty(
            '--meros-header-height',
            `${height}px`
        );
    };

    setHeaderHeight(header.offsetHeight);

    win.addEventListener('resize', () => {
        setHeaderHeight(header.offsetHeight);
    });
}