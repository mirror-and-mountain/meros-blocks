    // Ensures open on click preferences are reset on iframe resize
    const removeOpenOnClickOnResize = ({ iframe, doc }) => {
        const observer = new ResizeObserver(() => {
            const isMobile = doc
                .querySelector('.is-root-container')
                ?.classList.contains('is-mobile-preview');

            doc.querySelectorAll('.meros-navigation-wrapper').forEach((wrapper) => {
                if (!isMobile) {
                    disableSubmenuOpenOnClick(wrapper);
                    wrapper.classList.remove('meros-mobile-menu-open');
                    wrapper.classList.remove('meros-mobile-menu-active');
                } else {
                    wrapper.classList.add('meros-mobile-menu-active');
                }
            });
        });

        observer.observe(iframe);
    };

    // Handle mobile menu toggle functionality
    const mobileMenuHandler = ({ doc }) => {
        const wrappers = doc.querySelectorAll('.meros-navigation-wrapper');
        wrappers.forEach((wrapper) => {
            const container = wrapper.querySelector('nav');
            if (!container) return;

            const innerContainer = container.querySelector('.wp-block-navigation__container');
            if (!innerContainer) return;

            const mobileIcon = wrapper.querySelector('.meros-navigation-mobile-icon');
            if (!mobileIcon) return;

            // Toggle mobile menu open class on click
            mobileIcon.addEventListener('click', () => {
                const isOpen = wrapper.classList.contains('meros-mobile-menu-open');
                const openOnClickEnabled = wrapper.classList.contains('meros-open-submenus-on-click');

                if (isOpen) {
                    mobileIcon.classList.remove('open');
                    wrapper.classList.remove('meros-mobile-menu-open');
                    wrapper.classList.add('meros-mobile-menu-closing');

                    setTimeout(() => {
                        wrapper.classList.remove('meros-mobile-menu-closing');
                    }, 400);
                } else {
                    const navIcons = innerContainer.querySelector('.meros-navigation-icons');
                    if (!navIcons) {
                        const iconsContainer = document.createElement('div');
                        iconsContainer.className = 'meros-navigation-icons';

                        const backIcon = document.createElement('div');
                        backIcon.className = 'meros-navigation-back-icon meros-navigation-icon';
                        backIcon.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px" style="transform: rotate(180deg);">
                                <path d="M 9.9989971 4.9999848 A 1.0001 1.0001 0 1 0 8.5857864 6.4141935 L 13.171572 11 L 8.5857864 15.585807 A 1.0001 1.0001 0 1 0 10.000001 17 L 16.999998 11 L 10.000001 5 A 1.0001 1.0001 0 0 0 9.9989971 4.9999848 z"/>
                            </svg>
                        `;

                        const menuIcon = document.createElement('div');
                        menuIcon.className = 'meros-navigation-mobile-icon meros-navigation-icon';
                        menuIcon.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20px" height="20px" aria-label="Close Icon">
                                <path d="M 4.7070312 3.2929688 A 1.0001 1.0001 0 0 0 3.2929688 4.7070312 L 10.585938 12 L 3.2929688 19.292969 A 1.0001 1.0001 0 1 0 4.7070312 20.707031 L 12 13.414062 L 19.292969 20.707031 A 1.0001 1.0001 0 1 0 20.707031 19.292969 L 13.414062 12 L 20.707031 4.7070312 A 1.0001 1.0001 0 0 0 19.292969 3.2929688 L 12 10.585938 L 4.7070312 3.2929688 z"/>
                            </svg>
                        `;

                        iconsContainer.appendChild(backIcon);
                        iconsContainer.appendChild(menuIcon);
                        innerContainer.prepend(iconsContainer);
                    }

                    mobileIcon.classList.add('open');

                    if (!openOnClickEnabled) {
                        enableSubmenuOpenOnClick(wrapper, true);
                    }

                    wrapper.classList.add('meros-mobile-menu-open');
                }
            });
        });

    };

    // Helper to remove megamenu columns
    const removeMegaMenuColumns = (submenuContainer) => {
        const columns = submenuContainer.querySelectorAll('.meros-mega-menu-column');
        let removedItems = 0;
        columns.forEach(column => {
            column.remove();
            removedItems++;
        });

        return removedItems;
    };

    // Initialises megamenu features on a submenu when enabled
    const initMegaMenu = (submenu) => {
        const submenuContainer = submenu.querySelector('.wp-block-navigation__submenu-container');
        if (!submenuContainer) return;
        const addWrapper = !submenuContainer?.parentElement?.classList.contains('meros-mega-menu-submenu-container');

        if (addWrapper) {
            // Add meros mega menu container
            const merosContainer = document.createElement('div');
            merosContainer.className = 'meros-mega-menu-submenu-container';

            // Move existing submenu content into new container
            const submenuInner = submenu.querySelector('.wp-block-navigation-item');
            if (!submenuInner) return;

            merosContainer.appendChild(submenuContainer);
            submenuInner.appendChild(merosContainer);
        }

        // Remove existing Columns
        const existingItems = [];
        const items = submenuContainer.querySelectorAll('.meros-submenu-item');
        items.forEach(item => {
            const copy = item.cloneNode(true);
            existingItems.push(copy);
        });

        const removedColumns = removeMegaMenuColumns(submenuContainer);
        let itemsToReAdd = removedColumns > 0 ? existingItems : items;

        // Add updated columns
        const columns = parseInt(submenu.style.getPropertyValue('--meros-mega-menu-columns')) || 3;
        const titles = JSON.parse(submenu.dataset.merosMegaMenuTitles || '{}');

        for (let i = 1; i <= columns; i++) {
            const column = document.createElement('div');
            column.className = 'meros-mega-menu-column';
            column.style.setProperty('--meros-mega-menu-item-column', i);

            const columnTitle = document.createElement('div');
            columnTitle.className = 'meros-mega-menu-column-title';
            columnTitle.textContent = titles['column' + i] || __('Column ' + i, 'meros-editor');
            column.appendChild(columnTitle);

            itemsToReAdd.forEach(item => {
                const itemColumn = parseInt(item.style.getPropertyValue('--meros-mega-menu-item-column')) || 1;
                if (itemColumn === i) {
                    column.appendChild(item);
                }
            });

            submenuContainer.appendChild(column);
        };
    };

    // Destroys a megamenu and resets the submenu when megamenu disabled
    const destroyMegaMenu = (submenu) => {
        const submenuContainer = submenu.querySelector('.meros-mega-menu-submenu-container');
        if (!submenuContainer) return;

        // Find the original submenu container
        const originalContainer = submenuContainer.querySelector('.wp-block-navigation__submenu-container');
        if (!originalContainer) return;

        // Move submenu content back to original container
        const submenuInner = submenu.querySelector('.wp-block-navigation-item');
        if (!submenuInner) return;

        const items = submenuContainer.querySelectorAll('.meros-submenu-item');
        items.forEach(item => {
            originalContainer.appendChild(item);
        });

        submenuInner.appendChild(originalContainer);
        submenuContainer.remove();

        // Remove mega menu columns
        removeMegaMenuColumns(originalContainer);
    };

    // Observes and initialises/removes navigation behaviours
    let navigationObserver = null;
    const observeNavigationWrappers = (doc) => {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                // Handle open on click toggle
                if (
                    mutation.type === 'attributes' &&
                    mutation.target.classList?.contains('meros-navigation-wrapper')
                ) {
                    const openOnClickEnabled = mutation.target.classList.contains('meros-open-submenus-on-click');

                    if (openOnClickEnabled) {
                        enableSubmenuOpenOnClick(mutation.target, doc);
                    } else {
                        disableSubmenuOpenOnClick(mutation.target);
                    }
                }

                // Handle mega menu toggle
                else if (
                    mutation.type === 'attributes' &&
                    mutation.target.classList?.contains('meros-submenu-wrapper')
                ) {
                    const init = mutation.target.classList.contains('meros-mega-menu-wrapper');
                    if (init) {
                        initMegaMenu(mutation.target);
                    } else {
                        destroyMegaMenu(mutation.target);
                    }
                }

                // Handle drag and drop of navigation block
                else if (mutation.type === 'attributes' &&
                    mutation.target.classList?.contains('is-dragging') &&
                    (mutation.target.tagName === 'NAV' || mutation.target.querySelector('nav'))
                ) {
                    observer.disconnect();
                    observer.observe(doc.body, {
                        subtree: true,
                        attributes: true,
                        attributeFilter: [
                            'class',
                            'style',
                            'data-meros-mega-menu-titles',
                            'data-meros-initialised'
                        ],
                    });

                    const submenus = doc.querySelectorAll('.meros-submenu-wrapper');
                    submenus.forEach(submenu => {
                        submenu.dataset.merosInitialised = 'false';
                    });

                    initSubmenus(submenus, doc, true);

                    navigationObserver = observer;
                }
            }
        });

        observer.observe(doc.body, {
            subtree: true,
            attributes: true,
            attributeFilter: [
                'class',
                'style',
                'data-meros-mega-menu-titles',
                'data-meros-initialised'
            ],
        });

        return observer;
    };

    // Reinitialise navigation elements on save
    const observeEditor = (doc) => {
        const editor = wp.data.select('core/editor');
        const blockEditor = wp.data.select('core/block-editor');
        let wasSaving = false;
        let timeoutId = null;

        wp.data.subscribe(() => {
            // Handle mega menu item label and column changes
            const selectedBlock = blockEditor.getSelectedBlock();
            const isMegaMenuItem = selectedBlock?.name === 'core/navigation-link' &&
                selectedBlock?.attributes?.merosMenuItem?.type === 'mega-menu-item';

            if (isMegaMenuItem) {
                const attrs = selectedBlock.attributes || {};
                const blockElement = doc.getElementById(`block-${selectedBlock.clientId}`);
                if (blockElement) {
                    const linkContent = blockElement.querySelector('.wp-block-navigation-item__label');
                    const label = attrs?.label;

                    const currentColumnIndex = parseInt(blockElement.style.getPropertyValue('--meros-mega-menu-item-column')) || 1;
                    const savedColumnIndex = attrs?.merosMenuItem?.megaMenu?.columnIndex || 1;
                    
                    if (linkContent && label) {
                        if (linkContent.textContent !== label) {
                            linkContent.textContent = label;
                        }
                    }

                    if (currentColumnIndex !== savedColumnIndex) {
                        blockElement.style.setProperty('--meros-mega-menu-item-column', savedColumnIndex);
                    }
                }
            }

            const isSavingEditor = editor.isSavingNonPostEntityChanges();
            const isSavingPost = editor.isSavingPost();
            const isSaving = isSavingEditor || isSavingPost;

            // Detect Saves and reinit navigation elements
            if (isSaving && !wasSaving) {
                clearTimeout(timeoutId);

                // Reinit editor elements
                timeoutId = setTimeout(() => {
                    initEditor({ doc: doc });
                    if (navigationObserver) {
                        navigationObserver.disconnect();
                    }
                    navigationObserver = observeNavigationWrappers(doc);
                }, 500);
            }

            wasSaving = isSaving;
        });
    };

    // Initialise editor scripts
    const initEditor = ({ doc }) => {
        const subMenus = doc.querySelectorAll('.meros-submenu-wrapper');
        initSubmenus(subMenus, doc, true); // From site script
        navigationObserver = observeNavigationWrappers(doc);
        observeEditor(doc);
    };

    initEditorScripts(initEditor);
    initEditorScripts(mobileMenuHandler);
    initEditorScripts(removeOpenOnClickOnResize);