const toggle = document.getElementById('pxToRemToggle');
const baseInput = document.getElementById('basePx');
const baseLabel = document.getElementById('baseLabel');
const baseRow = document.getElementById('baseRow');
const tipsAccordion = document.getElementById('tipsAccordion');
const container = document.querySelector('.container');

const DEFAULT_BASE = 16;

// Updates the visibility of the base input row and the label style.
function updateUIState() {
  const isEnabled = toggle.checked;
  const value = parseInt(baseInput.value);

  // Toggle visibility of the base value row
  baseRow.style.display = isEnabled ? 'flex' : 'none';

  // Update label colors and padding if value is not default
  if (!isNaN(value) && value !== DEFAULT_BASE) {
    baseLabel.style.color = '#a7d1ff';
    baseLabel.style.backgroundColor = '#006acc2e';
    baseLabel.style.padding = '1px 3px';
    baseLabel.style.marginLeft = '-3px';
  } else {
    baseLabel.style.color = '';
    baseLabel.style.backgroundColor = '';
    baseLabel.style.padding = '0';
    baseLabel.style.marginLeft = '0';
  }
}

// 1. Load saved state immediately when popup opens
function loadSettings() {
  chrome.storage.local.get(['pxToRemEnabled', 'basePxValue'], (result) => {
    const isEnabled = result.pxToRemEnabled === true;
    const baseValue = result.basePxValue !== undefined ? result.basePxValue : DEFAULT_BASE;

    toggle.checked = isEnabled;
    baseInput.value = baseValue;
    
    updateUIState();

    // Enable animations ONLY after state is set to prevent opening-animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        container.classList.add('ready');
      });
    });
  });
}

// 2. Save state on toggle change
toggle.addEventListener('change', () => {
  const isEnabled = toggle.checked;
  chrome.storage.local.set({ pxToRemEnabled: isEnabled }, () => {
    updateUIState();
  });
});

// 3. Save base value on input/change
const saveBaseValue = () => {
  const val = parseInt(baseInput.value);
  if (isNaN(val) || val <= 0) return;

  chrome.storage.local.set({ basePxValue: val }, () => {
    updateUIState();
  });
};

// 4. Reset base value on Alt + Click of the label
baseLabel.addEventListener('click', (event) => {
  if (event.altKey) {
    baseInput.value = DEFAULT_BASE;
    saveBaseValue();
  }
});

// 5. Accordion Toggle
tipsAccordion.querySelector('.accordion-header').addEventListener('click', () => {
  tipsAccordion.classList.toggle('active');
});

// 6. Fix for External Links (Website and Feedback)
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const url = link.getAttribute('href');
    if (url) {
      window.open(url, '_blank');
    }
  });
});

baseInput.addEventListener('input', saveBaseValue);
baseInput.addEventListener('change', saveBaseValue);

// Initialize
document.addEventListener('DOMContentLoaded', loadSettings);