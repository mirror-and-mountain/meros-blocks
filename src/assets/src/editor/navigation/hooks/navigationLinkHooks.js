export function useNavigationLinkWrapperClasses(linkType) {
    const classes = ['meros-submenu-item'];

    if (linkType === 'dropdown-item') {
        classes.push('meros-dropdown-item');
    } else {
        const index = classes.indexOf('meros-dropdown-item');
        if (index !== -1) {
            classes.splice(index, 1);
        }
    }

    if (linkType === 'mega-menu-item') {
        classes.push('meros-mega-menu-item');
    } else {
        const index = classes.indexOf('meros-mega-menu-item');
        if (index !== -1) {
            classes.splice(index, 1);
        }
    }

    if (linkType === 'top-level-item') {
        classes.push('meros-top-level-item');
    } else {
        const index = classes.indexOf('meros-top-level-item');
        if (index !== -1) {
            classes.splice(index, 1);
        }
    }

    return classes.join(' ');
}

export function useNavigationLinkWrapperStyles(linkType, config) {
    const styles = {};

    if (linkType === 'mega-menu-item') {
        styles['--meros-mega-menu-item-column'] = config.columnIndex || 1;
    } else {
        delete styles['--meros-mega-menu-item-column'];
    }

    return styles;
}