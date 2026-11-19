import './style.scss';
import { masonrySelector, observeMasonry } from './layout';

const instances = new Map();
function init() {
    for (const [root, cleanup] of instances) {
        if (root.isConnected) continue;
        cleanup();
        instances.delete(root);
    }
    for (const root of document.querySelectorAll(masonrySelector)) {
        if (!instances.has(root)) instances.set(root, observeMasonry(root));
    }
}

function start() {
    init();
    const mutations = new MutationObserver((records) => {
        if (records.some(({ addedNodes, removedNodes }) => [...addedNodes, ...removedNodes].some(
            (node) => node.nodeType === 1 && (node.matches(masonrySelector) || node.querySelector(masonrySelector))
        ))) init();
    });
    mutations.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
document.addEventListener('livewire:navigated', init);
