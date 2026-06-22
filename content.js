// Auto-REM for Webflow Content Script

const NUMBER_REGEX = /^-?\d*\.?\d+$/;

document.addEventListener('keydown', (event) => {
    // 1. Safety Check: If the extension context is invalidated, stop execution 
    // to prevent "Extension context invalidated" errors.
    if (!chrome.runtime?.id) return;

    if (event.key !== ' ' && event.code !== 'Space') return;

    const target = event.target;
    if (target.tagName !== 'INPUT') return;

    // EXCEPTION 1: Don't run in the "Custom properties" section (Style Tab).
    const inputType = target.getAttribute('data-input-type');
    if (inputType === 'declaration-property' || inputType === 'declaration-value') {
        return;
    }

    // EXCEPTION 2: Don't run in Settings, Interactions, or custom attributes panels.
    if (target.closest('[data-automation-id="right-sidebar-settings-tab"]') ||
        target.closest('[data-automation-id="right-sidebar-interactions-tab"]') ||
        target.closest('[data-automation-id="custom-attributes-settings"]')) {
        return;
    }

    // EXCEPTION 3: Don't run in the Finder (Global Search bar).
    // Webflow uses data-automation-id="finder-search-input" for the global search.
    if (target.getAttribute('data-automation-id') === 'finder-search-input') {
        return;
    }

    // EXCEPTION 4: Don't run in the Pages panel search (left sidebar).
    if (target.closest('[data-automation-id="pages-search-input-container"]')) {
        return;
    }

    const value = target.value.trim();

    // Check if it's a pure number
    if (NUMBER_REGEX.test(value)) {
        event.preventDefault();

        // Get settings from storage
        try {
            chrome.storage.local.get(['pxToRemEnabled', 'basePxValue'], (result) => {
                // Another safety check inside the async callback
                if (chrome.runtime.lastError) return;

                const isPxToRem = result.pxToRemEnabled === true;
                const baseValue = result.basePxValue || 16;
                let newValue;

                if (isPxToRem) {
                    const numericValue = parseFloat(value);
                    const convertedValue = numericValue / baseValue;
                    newValue = parseFloat(convertedValue.toFixed(4)) + 'rem';
                } else {
                    newValue = value + 'rem';
                }

                target.value = newValue;

                // Trigger events for Webflow/React state management
                target.dispatchEvent(new Event('input', { bubbles: true }));
                target.dispatchEvent(new Event('change', { bubbles: true }));

                // Simulate "Enter" to commit the change in the Webflow UI
                const enterEvent = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13,
                    which: 13,
                    bubbles: true,
                    cancelable: true
                });
                target.dispatchEvent(enterEvent);
            });
        } catch (e) {
            // Silently fail if context is lost
        }
    }
}, true);