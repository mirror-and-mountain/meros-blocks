import { merosSetHeaderHeight } from '../../utils/general.js';

document.addEventListener('DOMContentLoaded', () => {
    merosSetHeaderHeight({
        doc: document,
        win: window,
        selector: 'header',
    });
});