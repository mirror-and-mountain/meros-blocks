import { merosSetHeaderHeight } from '../../utils/general.js';

document.addEventListener('DOMContentLoaded', () => {
    merosSetHeaderHeight({
        doc: document,
        win: window,
        selector: 'header',
    });
});

document.addEventListener('livewire:navigated', () => {
    requestAnimationFrame(() => {
        merosSetHeaderHeight({
            doc: document,
            win: window,
            selector: 'header',
        });
    });
});