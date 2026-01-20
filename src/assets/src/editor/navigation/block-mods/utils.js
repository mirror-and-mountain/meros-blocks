export function getAttributes(attributes) {
    const {
        merosMobileMenu,
        merosDesktopMenu
    } = attributes;

    const mobileMenuAttributes = {
        enabled: merosMobileMenu?.enabled ?? true,
        preview: merosMobileMenu?.preview ?? true,
        breakpoint: merosMobileMenu?.breakpoint ?? 768,
        itemsGap: merosMobileMenu?.itemsGap ?? 0,
        direction: merosMobileMenu?.direction ?? 'left',
        underHeader: merosMobileMenu?.underHeader ?? false,
        icon: merosMobileMenu?.icon ?? 'hamburger-1',
        iconColor: merosMobileMenu?.iconColor ?? '#000000',
        showLogo: merosMobileMenu?.showLogo ?? true,
        bgColor: merosMobileMenu?.bgColor ?? '#FFFFFF',
        textColor: merosMobileMenu?.textColor ?? '#000000',
        textHoverColor: merosMobileMenu?.textHoverColor ?? '#f0f0f0',
        itemPaddingX: merosMobileMenu?.itemPaddingX ?? 10,
        itemPaddingY: merosMobileMenu?.itemPaddingY ?? 10,
        itemBgColor: merosMobileMenu?.itemBgColor ?? '#FFFFFF',
        itemHoverBgColor: merosMobileMenu?.itemHoverBgColor ?? '#f0f0f0',
        submenuBgColor: merosMobileMenu?.submenuBgColor ?? '#FFFFFF',
        submenuItemBgColor: merosMobileMenu?.submenuItemBgColor ?? '#FFFFFF',
        submenuHoverBgColor: merosMobileMenu?.submenuHoverBgColor ?? '#f0f0f0',
        submenuTextColor: merosMobileMenu?.submenuTextColor ?? '#000000',
        submenuTextHoverColor: merosMobileMenu?.submenuTextHoverColor ?? '#f0f0f0',
    };

    const desktopMenuAttributes = {
        enabled: merosDesktopMenu?.enabled ?? false,
        bgColor: merosDesktopMenu?.bgColor ?? '#FFFFFF',
        textColor: merosDesktopMenu?.textColor ?? '#000000',
        textHoverColor: merosDesktopMenu?.textHoverColor ?? '#f0f0f0',
        itemPadding: merosDesktopMenu?.itemPadding ?? { top: 10, right: 15, bottom: 10, left: 15 },
        itemBgColor: merosDesktopMenu?.itemBgColor ?? '#FFFFFF',
        itemHoverBgColor: merosDesktopMenu?.itemHoverBgColor ?? '#f0f0f0',
        submenuBgColor: merosDesktopMenu?.submenuBgColor ?? '#FFFFFF',
        submenuHoverBgColor: merosDesktopMenu?.submenuHoverBgColor ?? '#f0f0f0',
        submenuTextColor: merosDesktopMenu?.submenuTextColor ?? '#000000',
        submenuTextHoverColor: merosDesktopMenu?.submenuTextHoverColor ?? '#f0f0f0',
    };

    return {
        merosMobileMenu: mobileMenuAttributes,
        merosDesktopMenu: desktopMenuAttributes
    };
}