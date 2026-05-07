import { merosSetHeaderHeight } from '../../utils/general.js';
import { initEditorScripts } from '../../utils/editor.js';
import './styles.scss';

/**
 * Injects Tom Select library into the editor iframe for use in the Advanced Select field type (Forms)
 * @param {*} param0 
 */
function injectTomSelect({ win, doc }) {
    const TS_SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/tom-select/dist/js/tom-select.complete.min.js';
    const TS_STYLE_URL = 'https://cdn.jsdelivr.net/npm/tom-select/dist/css/tom-select.css';

    const injectScript = () => {
        const script = doc.head.querySelector(`script[src="${TS_SCRIPT_URL}"]`);
        if (script) return;

        const newScript = doc.createElement('script');
        newScript.src = TS_SCRIPT_URL;
        newScript.onload = () => {
            if (win.TomSelect && !win.MerosTomSelect) {
                win.MerosTomSelect = win.TomSelect;
            }
        };
        doc.head.appendChild(newScript);
    }

    const injectStyle = () => {
        const style = doc.querySelector(`link[href="${TS_STYLE_URL}"]`);
        if (style) return;

        const newStyle = doc.createElement('link');
        newStyle.rel = 'stylesheet';
        newStyle.href = TS_STYLE_URL;
        doc.head.appendChild(newStyle);
    }

    if (!win.MerosTomSelect) {
        injectStyle();
        injectScript();
    }
}

wp.domReady(() => {
    initEditorScripts(merosSetHeaderHeight, { selector: 'header' });
    initEditorScripts(injectTomSelect);
});