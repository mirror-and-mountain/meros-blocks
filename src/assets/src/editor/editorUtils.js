const getIframe = () => {
    return document.querySelector('iframe');
};

const isIframeReady = () => {
    const iframe = getIframe();
    const doc = iframe?.contentDocument;
    const editorBody = doc?.querySelector('.editor-styles-wrapper');

    return editorBody !== undefined && editorBody !== null;
};

export const initEditorScripts = (callback, args = {}) => {
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