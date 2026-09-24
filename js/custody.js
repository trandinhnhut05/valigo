/*
 * Copyright (c) 2026 VALIGO Platform
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * VALIGO - Digital Chain of Custody & Security Certificate
 * Handles tamper seal verification, luggage photo inspection, cryptographic ledger, and proof-of-delivery.
 */

(function(window) {
  'use strict';

  function initCustodyModule() {
    setupModalTriggers();
    setupNfcSimulation();
  }

  function setupModalTriggers() {
    const openBtn = document.getElementById('viewCustodyBtn');
    const modal = document.getElementById('custodyModal');
    const closeBtn = document.getElementById('closeCustodyBtn');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => {
        renderCertificateDetails();
        modal.classList.add('open');
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('open');
      });
    }
  }

  function setupNfcSimulation() {
    const nfcBtn = document.getElementById('simulateNfcTapBtn');
    if (nfcBtn) {
      nfcBtn.addEventListener('click', () => {
        const state = window.ValigoState.getState();
        const order = window.ValigoState.getOrder(state.selectedOrderId);
        
        nfcBtn.innerHTML = '📶 Đang Đọc Chip NFC...';
        nfcBtn.style.background = 'rgba(6, 182, 212, 0.4)';

        setTimeout(() => {
          nfcBtn.innerHTML = '✅ Xác Thực NFC Thành Công!';
          nfcBtn.style.background = 'rgba(16, 185, 129, 0.3)';
          window.ValigoApp.showToast(`Xác thực NFC: Chip UID #04:5F:77:2B khớp hoàn toàn với Tem #${order.sealId}`, 'success');

          setTimeout(() => {
            nfcBtn.innerHTML = '📲 Chạm Để Quét Chip NFC';
            nfcBtn.style.background = '';
          }, 3000);
        }, 800);
      });
    }
  }

  function renderCertificateDetails() {
    const state = window.ValigoState.getState();
    const order = window.ValigoState.getOrder(state.selectedOrderId);
    if (!order) return;

    const certOrderId = document.getElementById('certOrderId');
    const certSealId = document.getElementById('certSealId');
    const certCustodyStatus = document.getElementById('certCustodyStatus');
    const certLedgerTimeline = document.getElementById('certLedgerTimeline');

    if (certOrderId) certOrderId.textContent = `#${order.id}`;
    if (certSealId) certSealId.textContent = order.sealId;
    if (certCustodyStatus) certCustodyStatus.textContent = order.sealStatus;

    // Filter relevant custody ledger logs
    const relevantLogs = state.custodyLedger.filter(l => l.orderId === order.id);

    if (certLedgerTimeline) {
      if (relevantLogs.length === 0) {
        certLedgerTimeline.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">Chưa có sự kiện bàn giao nào được ghi nhận.</p>`;
      } else {
        certLedgerTimeline.innerHTML = relevantLogs.map(log => `
          <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 0.75rem; font-size: 0.82rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
              <span style="font-weight: 700; color: var(--accent-cyan); font-family: var(--font-mono);">${log.event}</span>
              <span style="color: var(--text-muted); font-family: var(--font-mono);">${log.timestamp}</span>
            </div>
            <div style="color: #cbd5e1; margin-bottom: 0.25rem;">${log.details}</div>
            <div style="font-size: 0.7rem; color: #64748b; font-family: var(--font-mono);">Chủ thể: ${log.actor} | Hash: ${log.hash}</div>
          </div>
        `).join('');
      }
    }
  }

  window.ValigoCustody = {
    init: initCustodyModule,
    render: renderCertificateDetails
  };

})(window);
