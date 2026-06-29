export function useNavigationLinkWrapperClasses(linkType) {
    const classes = [];

    if (linkType === 'dropdown-item' || linkType === 'default-item') {
        classes.push('meros-dropdown-item');
        classes.push('meros-submenu-item');

        return classes.join(' ');
    } else {
        const dropDownIndex = classes.indexOf('meros-dropdown-item');
        if (dropDownIndex !== -1) {
            classes.splice(dropDownIndex, 1);
        }
        const submenuItemIndex = classes.indexOf('meros-submenu-item');
        if (submenuItemIndex !== -1) {
            classes.splice(submenuItemIndex, 1);
        }
    }

    if (linkType === 'mega-menu-item') {
        classes.push('meros-mega-menu-item');
        classes.push('meros-submenu-item');

        return classes.join(' ');
    } else {
        const megaMenuIndex = classes.indexOf('meros-mega-menu-item');
        if (megaMenuIndex !== -1) {
            classes.splice(megaMenuIndex, 1);
        }
        const submenuItemIndex = classes.indexOf('meros-submenu-item');
        if (submenuItemIndex !== -1) {
            classes.splice(submenuItemIndex, 1);
        }
    }

    if (linkType === 'top-level-item') {
        classes.push('meros-top-level-item');

        return classes.join(' ');
    } else {
        const topLevelIndex = classes.indexOf('meros-top-level-item');
        if (topLevelIndex !== -1) {
            classes.splice(topLevelIndex, 1);
        }
        if (classes.includes('meros-submenu-item')) {
            const submenuItemIndex = classes.indexOf('meros-submenu-item');
            classes.splice(submenuItemIndex, 1);
        }
    }

    return classes.join(' ');
}