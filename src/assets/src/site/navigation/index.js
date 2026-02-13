import './styles.scss';

// Allow submenu roots to navigate on second click
const navigateOnClick = (e) => {
    const button = e.currentTarget;
    if (button.classList.contains('wp-block-navigation-submenu__toggle')) {
        const parent = button.parentElement;
        if (parent && parent.classList.contains('meros-submenu-wrapper')) {
            parent.classList.remove('meros-submenu-open');
            
            const wrapper = parent.closest('.meros-navigation-wrapper');
            if (wrapper) {
                wrapper.classList.remove('meros-submenu-open'); 
            }
        }

        const action = button.getAttribute('data-action');
        if (action) {
            eval(action);
        }
    }
};

const closeMenuOnClickOutside = (submenu, doc) => {
    const handleClickOutside = (event) => {
        if (!submenu.contains(event.target)) {
            const button = submenu.querySelector('button');
            if (button.classList.contains('wp-block-navigation-submenu__toggle')) {
                button.removeEventListener('click', navigateOnClick);
            }

            submenu.classList.remove('meros-submenu-open');
            
            const wrapper = submenu.closest('.meros-navigation-wrapper');
            if (wrapper) {
                wrapper.classList.remove('meros-submenu-open'); 
            }
        }
    };

    doc.removeEventListener('click', handleClickOutside);
    doc.addEventListener('click', handleClickOutside);
};

// Open submenu on click
const openSubmenuOnClick = (e) => {
    const submenu = e.currentTarget;
    const wrapper = submenu.closest('.meros-navigation-wrapper');
    if (!wrapper) return;

    if (!submenu.classList.contains('meros-submenu-open')) {
        const button = submenu.querySelector('button');
        if (button.classList.contains('wp-block-navigation-submenu__toggle')) {
            button.addEventListener('click', navigateOnClick);
        }

        submenu.classList.add('meros-submenu-open');
        wrapper.classList.add('meros-submenu-open');
    } 
};

// Enable open on click for submenus
export const enableSubmenuOpenOnClick = (wrapper, doc, force = false) => {
    if (!wrapper.classList.contains('meros-open-submenus-on-click') && force) {
        wrapper.classList.add('meros-open-submenus-on-click');
        wrapper.dataset.forcedOpenOnClick = 'true';
    }

    if (wrapper.classList.contains('meros-open-submenus-on-click')) {
        const submenus = wrapper.querySelectorAll('.meros-submenu-wrapper');

        submenus.forEach((submenu) => {
            submenu.addEventListener('click', openSubmenuOnClick);

            // Close submenu on click outside
            closeMenuOnClickOutside(submenu, doc);
        });
    }
};

// Disable open on click for submenus
export const disableSubmenuOpenOnClick = (wrapper) => {
    if (wrapper.dataset.forcedOpenOnClick === 'true') {
        wrapper.classList.remove('meros-open-submenus-on-click');
        delete wrapper.dataset.forcedOpenOnClick;

        const submenus = wrapper.querySelectorAll('.meros-submenu-wrapper');

        submenus.forEach((submenu) => {
            submenu.removeEventListener('click', openSubmenuOnClick);
        });
    }
};

const stripWPDataAttributes = (element) => {
    const wpDataAttributes = [
        'data-wp-context',
        'data-wp-on--focusout',
        'data-wp-on--keydown',
        'data-wp-on--mouseenter',
        'data-wp-on--mouseleave',
        'data-wp-watch',
        'data-wp-bind--aria-expanded',
        'data-wp-on--click',
        'data-wp-on--focus',
    ];

    wpDataAttributes.forEach((attr) => {
        if (element.hasAttribute(attr)) {
            element.removeAttribute(attr);
        }
    });
};

// Init submenu elements, behaviour and navigation
export const initSubmenus = (submenus, doc, editor = false) => {
    submenus.forEach(submenu => {
        if (submenu.dataset.merosInitialised === 'true') return;
        
        const wrapper = submenu.closest('.meros-navigation-wrapper');
        if (!wrapper) return;

        // Remove wp data attributes
        if (!editor) {
            stripWPDataAttributes(submenu);
            const panel = submenu.querySelector('.wp-block-navigation__submenu-container');
            if (panel) {
                stripWPDataAttributes(panel);
            }
        }

        // Handle on click behaviour
        if (wrapper.classList.contains('meros-open-submenus-on-click')) {
            submenu.addEventListener('click', openSubmenuOnClick);
            // Close submenu on click outside
            const handleClickOutside = (event) => {
                if (!submenu.contains(event.target)) {
                    const button = submenu.querySelector('button');
                    if (button.classList.contains('wp-block-navigation-submenu__toggle')) {
                        button.removeEventListener('click', navigateOnClick);
                    }

                    submenu.classList.remove('meros-submenu-open');
                    
                    const wrapper = submenu.closest('.meros-navigation-wrapper');
                    if (wrapper) {
                        wrapper.classList.remove('meros-submenu-open'); 
                    }
                }
            };

            doc.addEventListener('click', handleClickOutside);
        }

        // Triggers editor observers
        if (editor) {
            setTimeout(() => {
                submenu.dataset.merosInitialised = 'true';
            }, 200);
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const subMenus = document.querySelectorAll('.meros-submenu-wrapper');
    initSubmenus(subMenus, document);
});
