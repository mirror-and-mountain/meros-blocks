import { merosSetHeaderHeight } from '../../utils/general.js';
import { initEditorScripts } from '../../utils/editor.js';

wp.domReady(() => {
    initEditorScripts(merosSetHeaderHeight, { selector: 'header' });
});