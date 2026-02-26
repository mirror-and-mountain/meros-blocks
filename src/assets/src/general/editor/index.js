import { merosSetHeaderHeight } from '../../utils/general.js';
import { initEditorScripts } from '../../utils/editor.js';
import './styles.scss';

wp.domReady(() => {
    initEditorScripts(merosSetHeaderHeight, { selector: 'header' });
});