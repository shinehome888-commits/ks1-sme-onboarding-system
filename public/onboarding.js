// DOM Elements
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const step4 = document.getElementById('step4');

const next1 = document.getElementById('next1');
const next2 = document.getElementById('next2');
const next3 = document.getElementById('next3');
const back2 = document.getElementById('back2');
const back3 = document.getElementById('back3');
const submitBtn = document.getElementById('submitBtn');

// State
let currentStep = 1;
let userId = null;
let smeId = null;

// Initialize
function init() {
  showStep(1);
  setupEventListeners();
  addDevModeBanner();
}

// Show current step
function showStep(step) {
  if (step1) step1.style.display = 'none';
  if (step2) step2.style.display = 'none';
  if (step3) step3.style.display = 'none';
  if (step4) step4.style.display = 'none';

  switch (step) {
    case 1:
      if (step1) step1.style.display = 'block';
      break;
    case 2:
      if (step2) step2.style.display = 'block';
      break;
    case 3:
      if (step3) step3.style.display = 'block';
      break;
    case 4:
      if (step4) step4.style.display = 'block';
      break;
  }
  currentStep = step;
}

// Set up event listeners safely
function setupEventListeners() {
  if (next1) next1.addEventListener('click', handleNext1);
  if (next2) next2.addEventListener('click', handleNext2);
  if (next3) next3.addEventListener('click', handleNext3);
  if (back2) back2.addEventListener('click', () => showStep(1));
  if (back3) back3.addEventListener('click', () => showStep(2));
  if (submitBtn) submitBtn.addEventListener('click', handleSubmit);
}

// Step 1: Create Account
async function handleNext1() {
  const fullName = document.getElementById('fullName')?.value;
  const phone = document.getElementById('phone')?.value;
  const wallet = document.getElementById('wallet')?.value;
  const password = document.getElementById('password')?.value;

  if (!fullName || !phone || !password) {
    alert('Please fill in all required fields.');
    return;
  }

  try {
    const res = await fetch('/api/onboarding/create-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, phone, wallet, password })
    });

    const data = await res.json();
    if (res.ok) {
      userId = data.userId;
      showStep(2);
    } else {
      alert(data.message || 'Failed to create account.');
    }
  } catch (err) {
    console.error('Create account error:', err);
    alert('Network error. Please try again.');
  }
}

// Step 2: Business Profile
async function handleNext2() {
  const businessName = document.getElementById('businessName')?.value;
  const businessType = document.getElementById('businessType')?.value;
  const industry = document.getElementById('industry')?.value;
  const country = document.getElementById('country')?.value;
  const city = document.getElementById('city')?.value;
  const address = document.getElementById('address')?.value;

  if (!businessName || !businessType || !country || !city) {
    alert('Please fill in all required fields.');
    return;
  }

  try {
    const res = await fetch('/api/onboarding/create-sme-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        businessName,
        businessType,
        industry,
        country,
        city,
        address
      })
    });

    const data = await res.json();
    if (res.ok) {
      smeId = data.smeId;
      showStep(3);
    } else {
      alert(data.message || 'Failed to create business profile.');
    }
  } catch (err) {
    console.error('Create SME profile error:', err);
    alert('Network error. Please try again.');
  }
}

// Step 3: Upload Document
async function handleNext3() {
  const fileInput = document.getElementById('idDocument');
  if (!fileInput || !fileInput.files[0]) {
    alert('Please upload an ID document.');
    return;
  }

  const formData = new FormData();
  formData.append('document', fileInput.files[0]);

  try {
    const res = await fetch('/api/onboarding/upload-document', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (res.ok) {
      showStep(4);
    } else {
      alert('Failed to upload document.');
    }
  } catch (err) {
    console.error('Upload error:', err);
    alert('Network error during upload.');
  }
}

// Step 4: Submit Onboarding
async function handleSubmit() {
  if (!smeId) {
    alert('Missing SME ID. Please restart onboarding.');
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
  }

  try {
    const res = await fetch('/api/onboarding/submit-onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ smeId })
    });

    const data = await res.json();
    if (res.ok) {
      alert('✅ Onboarding submitted successfully! Your application is now under review.');
      if (submitBtn) submitBtn.textContent = 'Submitted';
    } else {
      alert('❌ Application not submitted. Please try again later.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Application';
      }
    }
  } catch (err) {
    console.error('Submit error:', err);
    alert('Network error. Please check your connection.');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Application';
    }
  }
}

// ✅ SAFE Dev Mode Banner — NO MORE onclick ERRORS
function addDevModeBanner() {
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return;
  }

  let banner = document.getElementById('dev-mode-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'dev-mode-banner';
    banner.innerHTML = `
      <div style="background:#ffeb3b;padding:8px;text-align:center;font-size:14px;color:#000;position:fixed;top:0;left:0;right:0;z-index:1000;">
        🧪 DEV MODE – Not production
        <button class="close-dev-banner" style="float:right;background:none;border:none;font-weight:bold;font-size:18px;cursor:pointer;">×</button>
      </div>
    `;
    document.body.appendChild(banner);
  }

  const closeBtn = banner.querySelector('.close-dev-banner');
  if (closeBtn) {
    closeBtn.onclick = () => {
      banner.style.display = 'none';
    };
  }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
