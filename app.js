const container = document.getElementById('fields-container');
const barColors = ['#f59e0b', '#eab308', '#d97706', '#b45309', '#92400e', '#78350f', '#3b82f6'];

// --- TAB MANAGEMENT ---
function switchTab(tabName) {
  // Hide all tabs
  document.getElementById('tab-calculator').classList.remove('active');
  document.getElementById('tab-history').classList.remove('active');
  
  // Deactivate all nav buttons
  document.getElementById('nav-calc').classList.remove('active');
  document.getElementById('nav-hist').classList.remove('active');
  
  // Show selected tab & activate button
  if (tabName === 'calculator') {
    document.getElementById('tab-calculator').classList.add('active');
    document.getElementById('nav-calc').classList.add('active');
  } else if (tabName === 'history') {
    document.getElementById('tab-history').classList.add('active');
    document.getElementById('nav-hist').classList.add('active');
    loadHistory(); // Refresh history when opened
  }
}

// --- THEME MANAGEMENT ---
function changeTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('calc_theme', theme);
}

// --- STATE & RETENTION MANAGEMENT ---
function handleRetentionChange() {
  const select = document.getElementById('retention-selector');
  const customWrapper = document.getElementById('custom-retention-wrapper');
  
  if (select.value === 'custom') {
    customWrapper.style.display = 'flex';
  } else {
    customWrapper.style.display = 'none';
  }
  saveState();
  loadHistory(); 
}

function saveState() {
  const purchaseRate = document.getElementById('purchaseRate').value;
  const expenses = document.getElementById('expenses').value;
  
  const retentionSelect = document.getElementById('retention-selector').value;
  const customRetention = document.getElementById('custom-retention').value;

  const rows = container.querySelectorAll('.row');
  const fields = [];
  
  rows.forEach(row => {
    const id = row.id;
    fields.push({
      id: id,
      name: document.getElementById(`name-${id}`).value,
      rate: document.getElementById(`rate-${id}`).value,
      yield: document.getElementById(`yield-${id}`).value,
      checked: document.getElementById(`check-${id}`).checked,
      unit: document.getElementById(`unit-${id}`).value
    });
  });

  const state = { purchaseRate, expenses, fields, retentionSelect, customRetention };
  localStorage.setItem('calc_state', JSON.stringify(state));
}

function loadState() {
  const savedTheme = localStorage.getItem('calc_theme') || 'amber';
  document.getElementById('theme-selector').value = savedTheme;
  changeTheme(savedTheme);

  const savedState = JSON.parse(localStorage.getItem('calc_state'));
  
  if (savedState) {
    document.getElementById('purchaseRate').value = savedState.purchaseRate || '';
    document.getElementById('expenses').value = savedState.expenses || '';
    
    if(savedState.retentionSelect) {
      document.getElementById('retention-selector').value = savedState.retentionSelect;
      if (savedState.retentionSelect === 'custom') {
        document.getElementById('custom-retention-wrapper').style.display = 'flex';
        document.getElementById('custom-retention').value = savedState.customRetention || '';
      }
    }

    if (savedState.fields && savedState.fields.length > 0) {
      savedState.fields.forEach(field => createRowElement(field.id, field.name, field.rate, field.yield, field.unit, field.checked));
    }
  } else {
    createRowElement('row-1', 'Fatka', '', '', 'quintal', true);
    createRowElement('row-2', 'Sava No.', '', '', 'quintal', true);
    createRowElement('row-3', 'Chunni', '', '', 'quintal', true);
  }
  
  loadHistory();
}

// --- ROW MANAGEMENT ---
function createRowElement(id, name, rate, yieldPct, unit, checked) {
  const div = document.createElement('div');
  div.className = 'row';
  div.id = id;
  const isChecked = checked ? 'checked' : '';
  const isQtl = unit === 'quintal' || !unit ? 'selected' : '';
  const isKg = unit === 'kg' ? 'selected' : '';
  
  div.innerHTML = `
    <div class="row-top">
      <input type="checkbox" id="check-${id}" ${isChecked} onchange="saveState()">
      <input type="text" id="name-${id}" value="${name}" placeholder="Item Name" oninput="saveState()">
      <button class="btn btn-remove" onclick="removeRow('${id}')" title="Remove">X</button>
    </div>
    
    <div class="row-bottom">
      <div class="input-wrapper">
        <span>₹</span>
        <input type="number" id="rate-${id}" value="${rate}" placeholder="Rate" oninput="saveState()">
      </div>

      <select id="unit-${id}" class="row-unit" onchange="saveState()">
        <option value="quintal" ${isQtl}>Qtl</option>
        <option value="kg" ${isKg}>Kg</option>
      </select>

      <div class="input-wrapper right">
        <input type="number" id="yield-${id}" value="${yieldPct}" placeholder="Yield" oninput="saveState()">
        <span>%</span>
      </div>
    </div>
  `;
  container.appendChild(div);
}

function addNewRow() {
  const id = `row-${Date.now()}`;
  createRowElement(id, '', '', '', 'quintal', true);
  saveState();
}

function removeRow(rowId) {
  const row = document.getElementById(rowId);
  if (row) row.remove();
  saveState();
}

// --- CALCULATION & HISTORY VISUALS ---
function calculate() {
  const purchaseRate = parseFloat(document.getElementById('purchaseRate').value) || 0;
  const expenses = parseFloat(document.getElementById('expenses').value) || 0;
  
  let totalYield = 0;
  let finalOutputValue = 0;
  
  let barHTML = '';
  let legendHTML = '';
  let colorIndex = 0;
  
  let activeDetails = []; 
  
  const rows = container.querySelectorAll('.row');
  rows.forEach(row => {
    const id = row.id;
    const isChecked = document.getElementById(`check-${id}`).checked;
    
    if (isChecked) {
      const name = document.getElementById(`name-${id}`).value || 'Unnamed';
      const enteredRate = parseFloat(document.getElementById(`rate-${id}`).value) || 0;
      const yieldPct = parseFloat(document.getElementById(`yield-${id}`).value) || 0;
      const rowUnit = document.getElementById(`unit-${id}`).value;
      
      const ratePerQuintal = (rowUnit === 'kg') ? enteredRate * 100 : enteredRate;
      
      totalYield += yieldPct;
      finalOutputValue += (ratePerQuintal * (yieldPct / 100));

      activeDetails.push({ name, enteredRate, rowUnit, yieldPct });

      if(yieldPct > 0) {
        const color = barColors[colorIndex % barColors.length];
        barHTML += `<div class="yield-segment" style="width: ${yieldPct}%; background-color: ${color};" title="${name}: ${yieldPct}%"></div>`;
        legendHTML += `<div class="legend-item"><div class="legend-color" style="background-color: ${color};"></div>${name} (${yieldPct}%)</div>`;
        colorIndex++;
      }
    }
  });
  
  finalOutputValue -= expenses;
  const profit = finalOutputValue - purchaseRate;
  
  document.getElementById('yield-visualizer').style.display = 'block';
  document.getElementById('yield-bar').innerHTML = barHTML;
  document.getElementById('yield-legend').innerHTML = legendHTML;

  document.getElementById('result-box').style.display = 'block';
  document.getElementById('yield-total').innerText = totalYield.toFixed(2);
  document.getElementById('final-output').innerText = finalOutputValue.toFixed(2);
  document.getElementById('net-profit').innerText = profit.toFixed(2);
  
  const warning = document.getElementById('yield-warning');
  warning.innerText = (totalYield !== 100) ? `Warning: Yields add up to ${totalYield}%, not 100%.` : '';
  
  saveToHistory(purchaseRate, expenses, profit, activeDetails);
}

// --- HISTORY LOGIC ---
function saveToHistory(buyRate, expenses, profit, details) {
  let history = JSON.parse(localStorage.getItem('calc_history')) || [];
  const now = new Date();
  
  const dateStr = now.toLocaleString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  history.unshift({ 
    timestamp: now.getTime(), 
    date: dateStr, 
    buyRate, 
    expenses, 
    profit, 
    details 
  });
  
  localStorage.setItem('calc_history', JSON.stringify(history));
}

function loadHistory() {
  let history = JSON.parse(localStorage.getItem('calc_history')) || [];
  
  const retentionVal = document.getElementById('retention-selector').value;
  if (retentionVal !== 'unlimited') {
    let daysToKeep = retentionVal === 'custom' ? parseInt(document.getElementById('custom-retention').value) || 30 : parseInt(retentionVal);
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    history = history.filter(item => item.timestamp >= cutoffTime);
    localStorage.setItem('calc_history', JSON.stringify(history)); 
  }

  const tbody = document.getElementById('history-body');
  tbody.innerHTML = '';
  
  if (history.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:gray;">No history found.</td></tr>`;
    return;
  }
  
  // SVG Icons for buttons
  const infoIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  const trashIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;

  history.forEach((item, index) => {
    const profitColor = item.profit >= 0 ? 'color: #10b981;' : 'color: #ef4444;';
    tbody.innerHTML += `
      <tr>
        <td style="font-size: 0.85rem;">${item.date}</td>
        <td>₹${item.buyRate}</td>
        <td style="${profitColor} font-weight:bold;">₹${item.profit.toFixed(2)}</td>
        <td>
          <div style="display: flex; gap: 15px; justify-content: center; align-items: center;">
            <button class="action-btn info" title="View Details" onclick="showModal(${index})">${infoIcon}</button>
            <button class="action-btn delete" title="Delete" onclick="deleteHistoryItem(${index})">${trashIcon}</button>
          </div>
        </td>
      </tr>
    `;
  });
}

function deleteHistoryItem(index) {
  let history = JSON.parse(localStorage.getItem('calc_history')) || [];
  history.splice(index, 1);
  localStorage.setItem('calc_history', JSON.stringify(history));
  loadHistory();
}

function clearHistory() {
  localStorage.removeItem('calc_history');
  loadHistory();
}

// --- MODAL LOGIC ---
function showModal(index) {
  let history = JSON.parse(localStorage.getItem('calc_history')) || [];
  const item = history[index];
  if(!item) return;

  let modalHTML = `
    <div class="detail-row"><strong>Purchase Rate:</strong> <span>₹${item.buyRate} /Qtl</span></div>
    <div class="detail-row"><strong>Expenses:</strong> <span>₹${item.expenses} /Qtl</span></div>
    <hr style="border-top: 1px solid var(--border); border-bottom: none; margin: 15px 0;">
    <h4 style="margin: 0 0 10px 0;">Items Included:</h4>
  `;

  item.details.forEach(field => {
    modalHTML += `
      <div class="detail-row">
        <span><strong>${field.name}</strong> (${field.yieldPct}%)</span>
        <span>₹${field.enteredRate} /${field.rowUnit === 'kg' ? 'Kg' : 'Qtl'}</span>
      </div>
    `;
  });

  const profitColor = item.profit >= 0 ? '#10b981' : '#ef4444';
  modalHTML += `
    <hr style="border-top: 1px solid var(--border); border-bottom: none; margin: 15px 0;">
    <div style="font-size: 1.2rem; display:flex; justify-content:space-between;">
      <strong>Net Profit:</strong> 
      <strong style="color: ${profitColor};">₹${item.profit.toFixed(2)}</strong>
    </div>
  `;

  document.getElementById('modal-body').innerHTML = modalHTML;
  document.getElementById('history-modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('history-modal').style.display = 'none';
}

// --- PWA LOGIC ---
let deferredPrompt;
const installBtn = document.getElementById('installAppBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'block';
});

installBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') installBtn.style.display = 'none';
    deferredPrompt = null;
  }
});

window.addEventListener('appinstalled', () => {
  installBtn.style.display = 'none';
  deferredPrompt = null;
  console.log('App successfully installed!');
});

// Init
loadState();
