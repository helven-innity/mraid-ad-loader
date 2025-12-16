const CURRENT_SCRIPT = document.currentScript;
const APP_NAME = 'MRAID Ad Tester';
const BASE_URL = CURRENT_SCRIPT.src.substring(0, CURRENT_SCRIPT.src.lastIndexOf('/') + 1);
const TEST_ADID = '';
const MRAID = window.mraid ?? null;
const PRESET_AD_IDS = [
    {id: 357981, label: '300x250 3D Post'},
    {id: 342260, label: '300x250 3D Post+'},
    {id: 367101, label: '300x250 Cards'},
    {id: 361372, label: '300x250 Cards'},
    {id: 365152, label: '300x250 AFX'},
    {id: 367038, label: '300x250 Revolver Lite'},
    {id: 366230, label: '300x250 Land to Whatsapp'},
    {id: 366122, label: '300x600 IAB'},
    {id: 366129, label: '300x600 AFX'},
    {id: 366240, label: '300x600 Video'},
    {id: 360841, label: '300x600 3D Post'},
    {id: 360993, label: '300x600 3D Post+'},
    {id: 367003, label: '300x600 Shoppable'},
    {id: 366982, label: '300x600 Cube'},
    {id: 366203, label: 'In-Read 3D Post'},
    {id: 362588, label: 'In-Read 3D Post+'},
];

innity_intelligent_scaling = true;

// Load Tailwind CSS
const tailwindLink = document.createElement('script');
tailwindLink.src = 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4';
tailwindLink.onload = () => {
    const container = document.getElementById('app-container');
    if (container) {
        container.style.opacity = '1';
    }
};
document.head.appendChild(tailwindLink);

// Set Favicon
const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.href = 'assets/favicon.ico';
document.head.appendChild(favicon);

// Add Custom Styles for Spinner and Transitions
const style = document.createElement('style');
style.textContent = `
    .loader {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    .hidden { display: none !important; }
    .fade-in { animation: fadeIn 0.5s; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    .modal-box {
        background: white;
        padding: 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        max-width: 400px;
        width: 90%;
        text-align: center;
        animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }

    #ad-container [id^="innity_mraid_wrapper_"] {
      position: relative !important;
      height: auto !important;
      width: auto !important;
    }
`;
document.head.appendChild(style);

// --- UI Components ---
const tabBtnClass = 'flex-1 py-3 font-medium text-sm focus:outline-none transition-colors duration-200 rounded-lg';
const activeTabBtnClass = 'bg-cyan-600 text-white border-cyan-600';
const inactiveTabBtnClass = 'bg-white text-gray-500 hover:text-gray-700';

// Main App Container
const appContainer = document.createElement('div');
appContainer.id = 'app-container';
appContainer.className = 'min-h-screen bg-gray-100 relative flex flex-col items-center justify-center p-5 py-10 font-sans'; 
appContainer.style.opacity = '0';
appContainer.style.transition = 'opacity 0.5s ease-in-out';
document.body.appendChild(appContainer);

// Top Bar (Refresh Button)
const topBar = document.createElement('div');
topBar.id = 'top-bar';
topBar.className = 'max-w-md bg-white shadow-md rounded-lg p-2 fixed z-2147483647 top-3 left-3 justify-between items-center hidden'; // Hidden initially
appContainer.appendChild(topBar);

const refreshBtn = document.createElement('button');
refreshBtn.id = 'refresh-btn';
refreshBtn.className = 'text-blue-500 hover:text-blue-700 font-semibold flex items-center';
refreshBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
`;
refreshBtn.onclick = resetApp;
topBar.appendChild(refreshBtn);

// Logo
const logo = document.createElement('h1');
logo.id = 'app-logo';
logo.textContent = APP_NAME;
logo.className = 'text-3xl font-bold text-gray-800 mb-5';
appContainer.appendChild(logo);

// Main Content Area (Tabs & Forms)
const mainContent = document.createElement('div');
mainContent.id = 'main-content';
mainContent.className = 'w-full max-w-md';
appContainer.appendChild(mainContent);

// Tabs Header
const tabsHeader = document.createElement('div');
tabsHeader.className = 'flex gap-3';
mainContent.appendChild(tabsHeader);

const tabBtn1 = createTabBtn({
  id: 'tab-btn-1',
  label: 'Load Ad from Advenue'
}, true);
const tabBtn2 = createTabBtn({
  id: 'tab-btn-2',
  label: 'Load Script'
}, false);
tabBtn1.onclick = () => switchTab('tab-1');
tabBtn2.onclick = () => switchTab('tab-2');
tabsHeader.appendChild(tabBtn1);
tabsHeader.appendChild(tabBtn2);

const placementTypeSeparator = document.createElement('div');
placementTypeSeparator.className = 'text-left text-gray-500 my-1 mt-3 text-sm font-normal';
placementTypeSeparator.textContent = 'Placement Type';
mainContent.appendChild(placementTypeSeparator);

const placementTypeContainer = document.createElement('div');
placementTypeContainer.className = 'flex gap-2';
mainContent.appendChild(placementTypeContainer);

const btnInline = document.createElement('button');
btnInline.id = 'btn-inline';
btnInline.textContent = 'Inline Placement';
btnInline.className = 'flex-1 py-2 rounded-md text-sm font-semibold transition-colors duration-200 bg-cyan-600 text-white';
btnInline.setAttribute('data-selected', 'true');
placementTypeContainer.appendChild(btnInline);

const btnInterstitial = document.createElement('button');
btnInterstitial.id = 'btn-interstitial';
btnInterstitial.textContent = 'Interstitial Placement';
btnInterstitial.className = 'flex-1 py-2 rounded-md text-sm font-semibold transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300';
btnInterstitial.setAttribute('data-selected', 'false');
placementTypeContainer.appendChild(btnInterstitial);

const placementSizeSeparator = document.createElement('div');
placementSizeSeparator.className = 'text-left text-gray-500 my-1 mt-3 text-sm font-normal';
placementSizeSeparator.textContent = 'Placement Size';
mainContent.appendChild(placementSizeSeparator);

const placementSizeContainer = document.createElement('div');
placementSizeContainer.className = 'flex gap-2';
mainContent.appendChild(placementSizeContainer);

const btn300x250 = document.createElement('button');
btn300x250.id = 'btn300x250';
btn300x250.textContent = '300x250';
btn300x250.className = 'flex-1 py-2 rounded-md text-sm font-semibold transition-colors duration-200 bg-cyan-600 text-white';
btn300x250.setAttribute('data-selected', 'true');
btn300x250.dataset.size = '300x250';
placementSizeContainer.appendChild(btn300x250);

const btn300x600 = document.createElement('button');
btn300x600.id = 'btn300x600';
btn300x600.textContent = '300x600';
btn300x600.className = 'flex-1 py-2 rounded-md text-sm font-semibold transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300';
btn300x600.setAttribute('data-selected', 'false');
btn300x600.dataset.size = '300x600';
placementSizeContainer.appendChild(btn300x600);

const btn320x480 = document.createElement('button');
btn320x480.id = 'btn320x480';
btn320x480.textContent = '320x480';
btn320x480.className = 'flex-1 py-2 rounded-md text-sm font-semibold transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300';
btn320x480.setAttribute('data-selected', 'false');
btn320x480.dataset.size = '320x480';
placementSizeContainer.appendChild(btn320x480);

btn300x250.onclick = () => {
  btn300x250.className = 'flex-1 py-2 rounded-md text-sm font-semibold transition-colors duration-200 bg-cyan-600 text-white';
  btn300x250.setAttribute('data-selected', 'true');
  btn300x600.className = 'flex-1 py-2 rounded-md text-sm font-semibold transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300';
  btn300x600.setAttribute('data-selected', 'false');
  btn320x480.className = 'flex-1 py-2 rounded-md text-sm font-semibold transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300';
  btn320x480.setAttribute('data-selected', 'false');
};

btn300x600.onclick = () => {
  btn300x600.className = 'flex-1 py-2 rounded-md text-sm font-semibold transition-colors duration-200 bg-cyan-600 text-white';
  btn300x600.setAttribute('data-selected', 'true');
  btn300x250.className = 'flex-1 py-2 rounded-md text-sm font-semibold transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300';
  btn300x250.setAttribute('data-selected', 'false');
  btn320x480.className = 'flex-1 py-2 rounded-md text-sm font-semibold transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300';
  btn320x480.setAttribute('data-selected', 'false');
};

btn320x480.onclick = () => {
  btn320x480.className = 'flex-1 py-2 rounded-md text-sm font-semibold transition-colors duration-200 bg-cyan-600 text-white';
  btn320x480.setAttribute('data-selected', 'true');
  btn300x250.className = 'flex-1 py-2 rounded-md text-sm font-semibold transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300';
  btn300x250.setAttribute('data-selected', 'false');
  btn300x600.className = 'flex-1 py-2 rounded-md text-sm font-semibold transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300';
  btn300x600.setAttribute('data-selected', 'false');
};

btnInline.onclick = () => {
  btnInline.className = 'flex-1 py-2 rounded-md text-sm font-semibold transition-colors duration-200 bg-cyan-600 text-white';
  btnInline.setAttribute('data-selected', 'true');
  btnInterstitial.className = 'flex-1 py-2 rounded-md text-sm font-semibold transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300';
  btnInterstitial.setAttribute('data-selected', 'false');
  placementSizeSeparator.style.display = 'block';
  placementSizeContainer.style.display = 'flex';
};

btnInterstitial.onclick = () => {
  btnInterstitial.className = 'flex-1 py-2 rounded-md text-sm font-semibold transition-colors duration-200 bg-cyan-600 text-white';
  btnInterstitial.setAttribute('data-selected', 'true');
  btnInline.className = 'flex-1 py-2 rounded-md text-sm font-semibold transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300';
  btnInline.setAttribute('data-selected', 'false');
  placementSizeSeparator.style.display = 'none';
  placementSizeContainer.style.display = 'none';
};

// Tab Content Container
const tabContent = document.createElement('div');
tabContent.className = 'bg-white shadow-lg rounded-xl mt-5 p-4 overflow-hidden';
mainContent.appendChild(tabContent);

// Form 1: Load Ad
const form1 = document.createElement('div');
form1.id = 'tab-1';
tabContent.appendChild(form1);

const inputAdId = document.createElement('input');
inputAdId.type = 'text';
inputAdId.value = TEST_ADID;
inputAdId.placeholder = 'Enter Ad ID (e.g., 12345)';
inputAdId.className = 'w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
form1.appendChild(inputAdId);

const separator = document.createElement('div');
separator.className = 'text-center text-gray-500 my-3 text-sm font-normal';
separator.textContent = 'or select from presets';
form1.appendChild(separator);

const presetContainer = document.createElement('div');
presetContainer.className = 'flex flex-wrap gap-2 mb-4 justify-center';
form1.appendChild(presetContainer);

let selectedPresetBtn = null;

PRESET_AD_IDS.forEach(preset => {
    const btn = document.createElement('button');
    btn.textContent = preset.label;
    // Default style (grey)
    btn.className = 'px-3 py-2 rounded-md text-xs font-semibold transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300';
    
    btn.onclick = () => {
        // Update Input
        inputAdId.value = preset.id;
        
        // Update Visuals
        if (selectedPresetBtn) {
            // Reset previous button to grey
            selectedPresetBtn.className = 'px-3 py-2 rounded-md text-xs font-semibold transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300';
        }
        // Set current button to light blue
        btn.className = 'px-3 py-2 rounded-md text-xs font-semibold transition-colors duration-200 bg-cyan-100 text-cyan-800 border border-cyan-300';
        selectedPresetBtn = btn;
    };
    presetContainer.appendChild(btn);
});

// Clear selection on manual input
inputAdId.addEventListener('input', () => {
    if (selectedPresetBtn) {
        selectedPresetBtn.className = 'px-3 py-2 rounded-md text-xs font-semibold transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300';
        selectedPresetBtn = null;
    }
});

const btnLoadAd = createPrimaryBtn('Load Ad');
btnLoadAd.onclick = handleLoadAd;
form1.appendChild(btnLoadAd);

// Form 2: Load Script
const form2 = document.createElement('div');
form2.id = 'tab-2';
form2.className = 'hidden';
tabContent.appendChild(form2);

const inputScript = document.createElement('textarea');
inputScript.placeholder = '<script>...</script>';
inputScript.rows = 20;
inputScript.className = 'w-full p-3 border border-blue-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm';
form2.appendChild(inputScript);

const btnLoadScript = createPrimaryBtn('Load Script');
btnLoadScript.onclick = handleLoadScript;
form2.appendChild(btnLoadScript);
// Ad Container (Centered)
const adContainer = document.createElement('div');
adContainer.id = 'ad-container';
adContainer.className = 'bg-white shadow-2xl hidden overflow-hidden';
appContainer.appendChild(adContainer);

// Loading Overlay
const loaderOverlay = document.createElement('div');
loaderOverlay.className = 'fixed inset-0 flex items-center justify-center z-50 hidden';
loaderOverlay.innerHTML = '<div class="loader"></div>';
document.body.appendChild(loaderOverlay);

// Modal Overlay
const modalOverlay = document.createElement('div');
modalOverlay.className = 'modal-overlay hidden';
document.body.appendChild(modalOverlay);

const modalBox = document.createElement('div');
modalBox.className = 'modal-box';
modalOverlay.appendChild(modalBox);

const modalMessage = document.createElement('p');
modalMessage.className = 'text-gray-800 text-lg mb-6';
modalBox.appendChild(modalMessage);

const modalOkBtn = createPrimaryBtn('OK');
modalOkBtn.onclick = hideModal;
modalBox.appendChild(modalOkBtn);

// --- Functions ---
function createTabBtn(option, isActive) {
  const btn = document.createElement('button');
  btn.className = `${tabBtnClass} ${isActive ? activeTabBtnClass : inactiveTabBtnClass}`;;
  btn.id = option.id;
  btn.textContent = option.label;
  return btn;
}

function createPrimaryBtn(text) {
  const btn = document.createElement('button');
  btn.className = 'w-full bg-cyan-500 text-white font-bold py-3 rounded-lg hover:bg-cyan-700 transition duration-300 shadow-md';
  btn.textContent = text;
  return btn;
}

function switchTab(tabId) {
  [form1, form2].forEach(form => form.classList.add('hidden'));
  document.getElementById(tabId).classList.remove('hidden');
  tabBtn1.className = `${tabBtnClass} ${tabId === 'tab-1' ? activeTabBtnClass : inactiveTabBtnClass}`;
  tabBtn2.className = `${tabBtnClass} ${tabId === 'tab-2' ? activeTabBtnClass : inactiveTabBtnClass}`;
}

function showLoader() {
  loaderOverlay.classList.remove('hidden');
}

function hideLoader() {
  loaderOverlay.classList.add('hidden');
}

function showModal(message) {
  modalMessage.textContent = message;
  modalOverlay.classList.remove('hidden');
}

function hideModal() {
  modalOverlay.classList.add('hidden');
}

function switchToAdView() {
  mainContent.style.display = 'none';
  logo.style.display = 'none';
  topBar.classList.remove('hidden'); // Tailwind hidden
  topBar.style.display = 'flex'; // Ensure flex is restored
  adContainer.classList.remove('hidden');
  adContainer.style.display = 'block';
  adContainer.innerHTML = ''; // Clear previous ad
  
  // Set size constraints only for Inline placement
  if (btnInline.getAttribute('data-selected') === 'true') {
    let width;
    let height;

    btnSize = document.querySelectorAll('#btn300x250, #btn300x600, #btn320x480');
    btnSize.forEach((btn) => {console.log(btn)
        if (btn.dataset.selected === 'true') {
            size = btn.dataset.size.split('x');
            width = `${size[0]}px`;
            height = `${size[1]}px`;
        }
    });

    adContainer.style.setProperty('width', width);
    adContainer.style.setProperty('height', height);
    adContainer.style.setProperty('max-width', width);
    adContainer.style.setProperty('max-height', height);

  } else {
    adContainer.style.removeProperty('width');
    adContainer.style.removeProperty('height');
    adContainer.style.removeProperty('max-width');
    adContainer.style.removeProperty('max-height');
  }
}

function resetApp() {
  adContainer.innerHTML = '';
  adContainer.style.display = 'none';
  topBar.style.display = 'none';
  mainContent.style.display = 'block'; // Restore block
  logo.style.display = 'block'; // Restore block
  inputAdId.value = '';
  inputScript.value = '';
  if (selectedPresetBtn) {
    selectedPresetBtn.className = 'px-3 py-2 rounded-md text-xs font-semibold transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300';
    selectedPresetBtn = null;
  }
}

async function handleLoadAd() {
  const adId = inputAdId.value.trim();
  if(!adId) {
    showModal('Please enter an Ad ID');
    return;
  }

  showLoader();

  try {
    const response = await fetch(`${BASE_URL}/ad.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ad_id: adId })
    });

    const text = await response.text();
    let result;
    try {
        result = JSON.parse(text);
    } catch (e) {
        console.error('Failed to parse JSON:', text);
        throw new Error('Invalid server response: ' + (text.substring(0, 100) || 'Empty response'));
    }

    if(result.success) {
      switchToAdView();
      injectHtml(result.data.html);
    } else {
      showModal('Error: ' + (result.message || 'Unknown error'));
    }
  } catch(error) {
    console.error(error);
    showModal('Failed to load ad. Check console for details.');
  } finally {
    hideLoader();
  }
}

function handleLoadScript() {
  const code = inputScript.value.trim();
  if(!code) {
    showModal('Please enter HTML/Script code');
    return;
  }

  showLoader();
  // Simulate a small delay for UX
  setTimeout(() => {
    switchToAdView();
    injectHtml(code);
    hideLoader();
  }, 500);
}

function injectHtml(html) {
  // Create a range to parse the HTML string into a document fragment
  // This executes scripts automatically in most modern browsers when appended
  const range = document.createRange();
  range.selectNode(document.body);
  const fragment = range.createContextualFragment(html);
  adContainer.appendChild(fragment);
}
