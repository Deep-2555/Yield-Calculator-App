const container = document.getElementById('fields-container');
let rowCount = 0;

// Initialize with a few default fields
function init() {
  addRow('Fatka');
  addRow('Sava No.');
  addRow('Chunni');
}

function addRow(defaultName = '') {
  rowCount++;
  const rowId = `row-${rowCount}`;
  const div = document.createElement('div');
  div.className = 'row';
  div.id = rowId;
  
  div.innerHTML = `
    <input type="checkbox" id="check-${rowId}" checked title="Include in calculation">
    <input type="text" id="name-${rowId}" value="${defaultName}" placeholder="Item Name">
    <input type="number" id="rate-${rowId}" placeholder="Rate (₹)">
    <input type="number" id="yield-${rowId}" placeholder="Yield (%)">
    <button class="btn btn-remove" onclick="removeRow('${rowId}')" title="Remove Field">−</button>
  `;
  container.appendChild(div);
}

function removeRow(rowId) {
  const row = document.getElementById(rowId);
  if (row) row.remove();
}

function calculate() {
  const purchaseRate = parseFloat(document.getElementById('purchaseRate').value) || 0;
  const expenses = parseFloat(document.getElementById('expenses').value) || 0;
  
  let totalYield = 0;
  let finalOutputValue = 0;
  
  // Find all rows currently on the screen
  const rows = container.querySelectorAll('.row');
  
  rows.forEach(row => {
    const id = row.id;
    const isChecked = document.getElementById(`check-${id}`).checked;
    
    // Only calculate if the tick mark is checked
    if (isChecked) {
      const rate = parseFloat(document.getElementById(`rate-${id}`).value) || 0;
      const yieldPct = parseFloat(document.getElementById(`yield-${id}`).value) || 0;
      
      totalYield += yieldPct;
      finalOutputValue += (rate * (yieldPct / 100));
    }
  });
  
  // Deduct expenses
  finalOutputValue -= expenses;
  const profit = finalOutputValue - purchaseRate;
  
  // Update UI
  document.getElementById('result-box').style.display = 'block';
  document.getElementById('yield-total').innerText = totalYield.toFixed(2);
  document.getElementById('final-output').innerText = finalOutputValue.toFixed(2);
  document.getElementById('net-profit').innerText = profit.toFixed(2);
  
  const warning = document.getElementById('yield-warning');
  if (totalYield !== 100) {
    warning.innerText = `Warning: Your ticked yields add up to ${totalYield}%, not 100%.`;
  } else {
    warning.innerText = '';
  }
}

// Run init on load
init();
// PWA Install Button Logic
let deferredPrompt;
const installBtn = document.getElementById('installAppBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome from showing the mini-infobar automatically
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can install the PWA
  installBtn.style.display = 'block';
});

installBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      installBtn.style.display = 'none'; // Hide button after install
    }
    // Clear the deferred prompt variable
    deferredPrompt = null;
  }
});
