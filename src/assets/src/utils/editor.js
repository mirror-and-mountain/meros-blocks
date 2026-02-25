/**
 * Utility to get the editor iframe element.
 * @returns {HTMLIFrameElement|null} The iframe element or null if not found.
 */
const getIframe = () => {
    return document.querySelector('iframe');
};

/**
 * Checks if the target iframe is ready by verifying the presence of the editor body.
 * @returns {boolean} True if the iframe is ready, false otherwise.
 */
const isIframeReady = () => {
    const iframe = getIframe();
    const doc = iframe?.contentDocument;
    const editorBody = doc?.querySelector('.editor-styles-wrapper');

    return editorBody !== undefined && editorBody !== null;
};


/**
 * Initialises editor scripts when the target iframe is ready.
 * Executes the provided callback with  references to the iframe, document, and window.
 * If the iframe is not ready, observes the DOM and waits for it to become available.
 *
 * @param {Function} callback - The function to execute once the iframe is ready. Receives an object with { iframe, doc, win, ...args }.
 * @param {Object} [args={}] - Optional additional arguments to pass to the callback.
 */
export function initEditorScripts(callback, args = {}) {
    const init = () => {
        const iframe = getIframe();
        if (!iframe) return;

        const doc = iframe?.contentDocument;
        const win = iframe?.contentWindow;
        if (!doc || !win) return;

        const params = { 
            ...(typeof args === 'object' && !Array.isArray(args) ? args : {}), 
            iframe,
            doc,
            win
        };
        callback(params);
    }

    if (!isIframeReady()) {
        const observer = new MutationObserver(() => {
            if (!isIframeReady()) return;

            init();
            observer.disconnect();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    } else {
        init();
    }
}

/**
 * Checks if a block is a child of a specified parent block type.
 *
 * @param {string} clientId - The client ID of the block to check.
 * @param {string|string[]} parentNames - The name(s) of the parent block to check against.
 * @param {Function|null} logicalTest - Optional function to apply additional logic on the parent block.
 * @returns {boolean} True if the block is a child of the specified parent, false otherwise.
 */
export function isChildOf(clientId, parentNames, logicalTest = null) {
    const { getBlock, getBlockParents } = wp.data.select('core/block-editor');
    const parents = getBlockParents(clientId);

    for (const parentId of parents) {
        const parentBlock = getBlock(parentId);
        
        if (Array.isArray(parentNames)) {
            if (parentBlock && parentNames.includes(parentBlock.name) &&
                (typeof logicalTest !== 'function' || logicalTest(parentBlock) === true)
            ) {
                return true;
            }


        } else if (parentBlock &&
            parentBlock.name === parentNames &&
            (typeof logicalTest !== 'function' || logicalTest(parentBlock) === true)
        ) {
            return true;
        }
    }

    return false;
}

/**
 * Checks if a block is directly within a specified parent block type (i.e., the specified parent is its immediate parent).
 *
 * @param {string|string[]} parentNames - The name(s) of the parent block to check against.
 * @param {string} clientId - The client ID of the block to check.
 * @param {Function|null} logicalTest - Optional function to apply additional logic on the parent block.
 * @returns {boolean} True if the block is directly within the specified parent, false otherwise.
 */
export function isDirectChildOf(clientId, parentNames, logicalTest = null) {
    const { getBlock, getBlockParents } = wp.data.select('core/block-editor');
    const parents = getBlockParents(clientId);

    for (const parentId of parents) {
        const parentBlock = getBlock(parentId);
        
        if (Array.isArray(parentNames)) {
            if (parentBlock && parentNames.includes(parentBlock.name) &&
                (typeof logicalTest !== 'function' || logicalTest(parentBlock) === true)
            ) {
                if (parentId === parents[parents.length - 1]) {
                    return true;
                } else {
                    return false;
                }
            }
        }

        else if (parentBlock &&
            parentBlock.name === parentNames &&
            (typeof logicalTest !== 'function' || logicalTest(parentBlock) === true)
        ) {
            if (parentId === parents[parents.length - 1]) {
                return true;
            } else {
                return false;
            }
        }
    }
    return false;
}

/**
 * Checks if a given attribute value matches its default value.
 *
 * @param {*} value - The current value of the attribute.
 * @param {*} defaultValue - The default value of the attribute.
 * @returns {boolean} True if the value matches the default, false otherwise.
 */
export function attributeIsDefault(value, defaultValue) {
    if (typeof defaultValue === 'object' && defaultValue !== null) {
        return JSON.stringify(value) === JSON.stringify(defaultValue);
    }
    return value === defaultValue;
}

/**
 * Retrieves the nearest parent block of a specified type.
 *
 * @param {string} clientId - The client ID of the block to check.
 * @param {string} parentName - The name of the parent block type to find.
 * @returns {Object|null} The parent block object if found, otherwise null.
 */
export function getParentBlockOfType(clientId, parentName) {
    const { getBlock, getBlockParents } = wp.data.select('core/block-editor');
    const parents = getBlockParents(clientId);

    for (const parentId of parents) {
        const parentBlock = getBlock(parentId);
        if (parentBlock && parentBlock.name === parentName) {
            return parentBlock;
        }
    }
    return null;
}

/**
 * Retrieves the child blocks of a given block.
 *
 * @param {string} clientId - The client ID of the parent block.
 * @returns {Array} An array of child block objects.
 */
export function getChildBlocks(clientId) {
    const { getBlocks } = wp.data.select('core/block-editor');
    return getBlocks(clientId);
}

/**
 * Retrieves a specific attribute from the nearest parent block of a specified type.
 *
 * @param {string} clientId - The client ID of the block to check.
 * @param {string} parentName - The name of the parent block type to find.
 * @param {string} attribute - The attribute name to retrieve from the parent block.
 * @param {*} [defaultValue=null] - The default value to return if the attribute is not found.
 * @returns {*} The value of the attribute from the parent block, or the default value if not found.
 */
export function getParentBlockAttribute(clientId, parentName, attribute, defaultValue = null) {
    const parentBlock = getParentBlockOfType(clientId, parentName);
    if (parentBlock && parentBlock.attributes) {
        if (attribute.includes('.')) {
            const keys = attribute.split('.');
            let value = parentBlock.attributes;
            for (const key of keys) {
                if (value && key in value) {
                    value = value[key];
                } else {
                    return defaultValue;
                }
            }
            return value;
        } else if (attribute in parentBlock.attributes) {
            return parentBlock.attributes[attribute];
        }
    }
    return defaultValue;
}
