import TomSelect from 'tom-select';

function initTomSelect() {
    const selectEls = document.querySelectorAll('.meros-advanced-select-control');
    selectEls.forEach(selectEl => {
        if (selectEl.tomselect) return;
        const multiple = selectEl.hasAttribute('multiple');

        new TomSelect(selectEl, {
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
                selectEl.tomselect.blur();
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', initTomSelect);
document.addEventListener('livewire:navigated', initTomSelect);