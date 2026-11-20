import './style.scss';

const selector = '[data-meros-live-query]';
const instances = new Map();

function observeQuery(root) {
    const own = (query) => [...root.querySelectorAll(query)].filter((node) => node.closest(selector) === root);
    const forms = own('form[data-meros-live-query-search]');
    if (!forms.length) return () => {};
    const status = root.ownerDocument.createElement('p');
    status.setAttribute('data-meros-live-query-status', '');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    if (root.dataset.merosLiveQuerySpinnerPosition === 'below') forms[0].append(status);
    else forms[0].prepend(status);
    let timer;
    let controller;
    let revision = 0;
    let composing = false;
    const inputs = forms.map((form) => form.querySelector('input[name="s"]')).filter(Boolean);
    let term = inputs[0]?.value ?? '';
    function regionContents(start) {
        const nodes = [];
        let end = start.nextSibling;
        while (end && !(end.nodeType === 1 && end.matches('template[data-meros-live-query-end]')
            && end.dataset.merosLiveQueryEnd === start.dataset.merosLiveQuerySlot)) {
            nodes.push(end);
            end = end.nextSibling;
        }
        if (!end) throw new Error(root.dataset.merosLiveQueryError);
        return { nodes, end };
    }
    const message = (text, error = false) => {
        status.textContent = text;
        status.toggleAttribute('data-error', error);
    };
    const loading = (active) => {
        if (active) root.setAttribute('aria-busy', 'true');
        else root.removeAttribute('aria-busy');
        status.toggleAttribute('data-loading', active);
    };
    const cancel = () => {
        clearTimeout(timer);
        controller?.abort();
        revision++;
        loading(false);
    };

    async function search(page = 1) {
        cancel();
        const current = revision;
        controller = new AbortController();
        loading(true);
        message(root.dataset.merosLiveQueryLoading);
        try {
            const response = await fetch(root.dataset.merosLiveQueryEndpoint, {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({ token: root.dataset.merosLiveQueryToken, search: term, page }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || root.dataset.merosLiveQueryError);
            if (current !== revision || !root.isConnected) return;
            if (typeof data.html !== 'string') throw new Error(root.dataset.merosLiveQueryError);
            const document = new DOMParser().parseFromString(data.html, 'text/html');
            const updatedRoot = document.querySelector(selector);
            if (!updatedRoot) throw new Error(root.dataset.merosLiveQueryError);
            const regions = own('[data-meros-live-query-slot]');
            if (!regions.length) throw new Error(root.dataset.merosLiveQueryError);
            const replacements = regions.map((region) => {
                const replacement = [...updatedRoot.querySelectorAll('[data-meros-live-query-slot]')].find((node) =>
                    node.closest(selector) === updatedRoot && node.dataset.merosLiveQuerySlot === region.dataset.merosLiveQuerySlot);
                if (!replacement) throw new Error(root.dataset.merosLiveQueryError);
                return { existing: regionContents(region), replacement: regionContents(replacement) };
            });
            for (const { existing, replacement } of replacements) {
                for (const node of existing.nodes) node.remove();
                for (const node of replacement.nodes) existing.end.before(node);
            }
            message(root.dataset.merosLiveQueryComplete);
            root.dispatchEvent(new CustomEvent('meros:query-updated', { bubbles: true }));
        } catch (error) {
            if (error.name !== 'AbortError' && current === revision) {
                console.error('Meros query search failed:', error);
                message(error.message || root.dataset.merosLiveQueryError, true);
            }
        } finally {
            if (current === revision) loading(false);
        }
    }

    function input(event) {
        if (!inputs.includes(event.target)) return;
        cancel();
        term = event.target.value;
        for (const other of inputs) if (other !== event.target) other.value = term;
        if (!composing) timer = setTimeout(() => search(), 300);
    }
    function compositionStart(event) {
        if (!inputs.includes(event.target)) return;
        composing = true;
        cancel();
    }
    function compositionEnd(event) { composing = false; input(event); }
    function submit(event) {
        if (!forms.includes(event.target)) return;
        event.preventDefault();
        term = event.target.querySelector('input[name="s"]').value;
        search();
    }
    function paginate(event) {
        const link = event.target.closest('a');
        if (!link || link.closest(selector) !== root || !link.closest('.wp-block-query-pagination')
            || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const url = new URL(link.href, location.href);
        if (url.origin !== location.origin) return;
        const page = Number(link.dataset.merosLiveQueryPage ?? url.searchParams.get(root.dataset.merosLiveQueryPageKey) ?? '1');
        if (!Number.isInteger(page) || page < 1 || page > 10000) return;
        event.preventDefault();
        search(page);
    }
    root.addEventListener('input', input);
    root.addEventListener('compositionstart', compositionStart);
    root.addEventListener('compositionend', compositionEnd);
    root.addEventListener('submit', submit);
    root.addEventListener('click', paginate);
    return () => {
        cancel();
        root.removeEventListener('input', input);
        root.removeEventListener('compositionstart', compositionStart);
        root.removeEventListener('compositionend', compositionEnd);
        root.removeEventListener('submit', submit);
        root.removeEventListener('click', paginate);
        status.remove();
    };
}

function init() {
    for (const [root, cleanup] of instances) {
        if (root.isConnected) continue;
        cleanup();
        instances.delete(root);
    }
    for (const root of document.querySelectorAll(selector)) {
        if (!instances.has(root)) instances.set(root, observeQuery(root));
    }
}

function start() {
    init();
    new MutationObserver((records) => {
        if (records.some(({ addedNodes, removedNodes }) => [...addedNodes, ...removedNodes].some((node) =>
            node.nodeType === 1 && (node.matches(selector) || node.querySelector(selector))))) init();
    }).observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
document.addEventListener('livewire:navigated', init);
