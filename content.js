// Auto-REM for Webflow Content Script

const NUMBER_REGEX = /^-?\d*\.?\d+$/;

// Allowed values for input name or data-automation-id (both are checked).
const ALLOWED_STYLE_INPUT_NAMES = [
    'width',
    'height',
    'minWidth',
    'minHeight',
    'maxWidth',
    'maxHeight',
    'position',
    'spacing',
    'sp-columnGap',
    'sp-rowGap',
    'sp-DefaultSizing',
    'sp-MinSizing',
    'sp-MaxSizing',
    'fontSize',
    'lineHeight',
    'letterSpacing',
    'textDecorationThickness',
    'textIndent',
    'textColumnsGap',
    'textStrokeWidth',
    'text-shadow-x',
    'text-shadow-y',
    'text-shadow-blur',
    'borderRadius',
    'borderWidth',
    'outlineWidth',
    'outlineOffset',
    'box-shadow-x',
    'box-shadow-y',
    'box-shadow-blur',
    'box-shadow-size',
    'translate-x-unitinput',
    'translate-y-unitinput',
    'translate-z-unitinput',
    'sp-blur-radius',
    'variable-size-input'
];

function isAllowedInput(target) {
    if (target.getAttribute('data-wf-text-input') !== 'true') return false;

    const name = target.getAttribute('name');
    const automationId = target.getAttribute('data-automation-id');

    return ALLOWED_STYLE_INPUT_NAMES.includes(name) ||
        ALLOWED_STYLE_INPUT_NAMES.includes(automationId);
}

document.addEventListener('keydown', (event) => {
    // 1. Safety Check: If the extension context is invalidated, stop execution 
    // to prevent "Extension context invalidated" errors.
    if (!chrome.runtime?.id) return;

    if (event.key !== ' ' && event.code !== 'Space') return;

    const target = event.target;
    if (target.tagName !== 'INPUT') return;

    if (!isAllowedInput(target)) return;

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