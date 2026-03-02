import { useRef, useState, useEffect } from '@wordpress/element';
import { getIframeObjects } from "../../../../assets/src/utils/editor.js";

export function withAdvancedSelect(attributes, fieldRef, advancedSelectRef) {
    const docRef = useRef();
    const merosTomSelectRef = useRef();
    const tomSelectRef = useRef();

    const { id, options, multiple } = attributes;
    const [tomSelectReady, setTomSelectReady] = useState(false);

    useEffect(() => {
        if (!fieldRef.current || !id) return;

        // Attempt to get TomSelect from the iframe
        if (!tomSelectReady) {
            const maxRetries = 50;
            let retryCount = 0;
            const retryInterval = setInterval(() => {
                const { doc, MerosTomSelect } = getIframeObjects('MerosTomSelect');
                if (doc && MerosTomSelect) {
                    docRef.current = doc;
                    merosTomSelectRef.current = MerosTomSelect;

                    setTomSelectReady(true);
                    clearInterval(retryInterval);
                } else if (retryCount >= maxRetries) {
                    clearInterval(retryInterval);
                }
                retryCount++;
            }, 100);
        }

        // Bail if TomSelect or the iFrame document isn't ready
        if (!docRef.current || !merosTomSelectRef.current) return;

        // Get the select element within the block
        advancedSelectRef.current = getSelectElement(fieldRef);
        if (!advancedSelectRef.current) return;

        // Initialise TomSelect on the select element
        tomSelectRef.current = initTomSelect(
            fieldRef, advancedSelectRef, merosTomSelectRef.current, multiple
        );

        // Cleanup for unmount.
        return () => {
            if (tomSelectRef.current && typeof tomSelectRef.current?.destroy === 'function') {
                tomSelectRef.current.destroy();
                tomSelectRef.current = null;
            }
        }
    }, [id, multiple, tomSelectReady]);

    useEffect(() => {
        if (
            !fieldRef.current || 
            !advancedSelectRef.current || 
            !tomSelectRef.current ||
            !Array.isArray(options) ||
            options.length === 0
        ) {
                return;
            }

        // Update TomSelect options when they change
        tomSelectRef.current.clear();
        tomSelectRef.current.clearOptions();
        tomSelectRef.current.clearCache();
        tomSelectRef.current.sync();
        tomSelectRef.current.refreshOptions(false);

    }, [options]);

    return advancedSelectRef;
}

function initTomSelect(fieldRef, advancedSelectRef, merosTomSelect, multiple) {
    if (advancedSelectRef.current.tomselect) {
        advancedSelectRef.current.tomselect.destroy();
        advancedSelectRef.current = getSelectElement(fieldRef);
    }

    if (!advancedSelectRef.current) return null;
    return new merosTomSelect(`#${advancedSelectRef.current.id}`, {
        plugins: multiple ? {
            remove_button: {
                title: 'Remove',
            }
        } : {},
        create: false,
        sortField: [{ field: '$order' }, { field: '$score' }],
        maxItems: multiple ? null : 1,
        placeholder: 'Select...',
        onChange: () => {
            const input = fieldRef.current.querySelector('.ts-control input');
            if (input) {
                input.blur();
            }
        }
    });
}

function getSelectElement(fieldRef) {
    if (!fieldRef.current) return null;
    return fieldRef.current.querySelector('.meros-advanced-select-control');
}