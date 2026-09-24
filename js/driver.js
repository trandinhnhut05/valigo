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
 * VALIGO - Driver Management & Custody Handover App
 * Provides mobile courier workflows: job execution, QR scan simulation, seal verification, and signature capture.
 */

(function(window) {
  'use strict';

  let isDrawing = false;
  let canvas, ctx;

  function initDriverModule() {
    renderDriverView();
    setupCustodyFlow();
    setupSignatureCanvas();

    window.ValigoState.subscribe(() => {
      renderDriverView();
    });
  }

  function renderDriverView() {
    const state = window.ValigoState.getState();
    const activeOrder = state.orders.find(o => o.driverId === 'DRV-402' && o.status !== 'delivered') || state.orders[0];
    const taskContainer = document.getElementById('driverTasksList');

    if (!taskContainer) return;

    if (!activeOrder) {
      taskContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          <p>Không có nhiệm vụ nào cần xử lý. Bạn đã hoàn thành tất cả!</p>
        </div>
      `;
      return;
    }

    const isPickupDone = activeOrder.status !== 'confirmed';
    const isDelivered = activeOrder.status === 'delivered';

    taskContainer.innerHTML = `
      <div class="driver-task-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <span class="task-type-badge ${isPickupDone ? 'task-delivery' : 'task-pickup'}">
            ${isPickupDone ? 'Chặng Giao Hàng' : 'Chặng Lấy Hành Lý'}
          </span>
          <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-cyan);">#${activeOrder.id}</span>
        </div>

        <h4 style="font-size: 1.1rem; color: #fff; margin-bottom: 0.25rem;">${activeOrder.customerName}</h4>
        <p style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 0.75rem;">${activeOrder.phone}</p>

        <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 0.75rem; font-size: 0.8rem; margin-bottom: 1rem;">
          <div style="margin-bottom: 0.4rem;">📍 <strong>Nơi lấy:</strong> ${activeOrder.pickupLocation}</div>
          <div style="margin-bottom: 0.4rem;">🎯 <strong>Nơi giao:</strong> ${activeOrder.destination}</div>
          <div>🧳 <strong>Số kiện:</strong> ${activeOrder.luggageCount} kiện (${activeOrder.luggageTypes.join(', ')})</div>
        </div>

        ${!isPickupDone ? `
          <button class="btn-primary" id="driverStartCustodyBtn" style="font-size: 0.9rem;">
            📸 Bắt Đầu Lấy Hàng & Ký Nhận Chuỗi Bàn Giao Số
          </button>
        ` : !isDelivered ? `
          <div style="display: flex; gap: 0.5rem; flex-direction: column;">
            <button class="btn-primary" id="driverCompleteDeliveryBtn" style="background: #10b981; font-size: 0.9rem;">
              ✍️ Bàn Giao & Thu Ký Nhận Của Người Nhận
            </button>
            <button class="btn-secondary" id="driverDropLockerBtn" style="justify-content: center; font-size: 0.85rem;">
              📦 Chuyển Hướng Lưu Vào Tủ Khóa Thông Minh
            </button>
          </div>
        ` : `
          <div style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; border-radius: 8px; padding: 0.75rem; text-align: center; color: #34d399; font-weight: 700; font-size: 0.85rem;">
            ✓ Nhiệm Vụ Đã Hoàn Thành Xuất Sắc
          </div>
        `}
      </div>
    `;

    // Button event listeners
    const startCustodyBtn = document.getElementById('driverStartCustodyBtn');
    if (startCustodyBtn) {
      startCustodyBtn.addEventListener('click', () => {
        openCustodyWizard(activeOrder);
      });
    }

    const completeDeliveryBtn = document.getElementById('driverCompleteDeliveryBtn');
    if (completeDeliveryBtn) {
      completeDeliveryBtn.addEventListener('click', () => {
        openSignatureModal(activeOrder);
      });
    }

    const dropLockerBtn = document.getElementById('driverDropLockerBtn');
    if (dropLockerBtn) {
      dropLockerBtn.addEventListener('click', () => {
        window.ValigoApp.switchRole('locker');
        window.ValigoApp.showToast(`Đã chuyển sang Trạm Tủ Khóa Thông Minh cho đơn #${activeOrder.id}`, 'info');
      });
    }
  }

  function setupCustodyFlow() {
    const custodyModal = document.getElementById('driverCustodyWizardModal');
    const closeBtn = document.getElementById('closeDriverWizardBtn');
    const scanSimBtn = document.getElementById('simulateSealScanBtn');
    const finishPickupBtn = document.getElementById('finishPickupCustodyBtn');

    if (closeBtn && custodyModal) {
      closeBtn.addEventListener('click', () => {
        custodyModal.classList.remove('open');
      });
    }

    if (scanSimBtn) {
      scanSimBtn.addEventListener('click', () => {
        const state = window.ValigoState.getState();
        const activeOrder = state.orders.find(o => o.driverId === 'DRV-402' && o.status === 'confirmed') || state.orders[0];

        scanSimBtn.innerHTML = '🔍 Đang Quét Tem Niêm Phong QR/NFC...';
        scanSimBtn.style.borderColor = '#06b6d4';

        setTimeout(() => {
          scanSimBtn.innerHTML = `✅ Đã Xác Thực Tem: #${activeOrder.sealId}`;
          scanSimBtn.style.background = 'rgba(16, 185, 129, 0.2)';
          scanSimBtn.style.borderColor = '#10b981';

          const sealInput = document.getElementById('driverInputSealSerial');
          if (sealInput) sealInput.value = activeOrder.sealId;

          window.ValigoApp.showToast(`Tem niêm phong #${activeOrder.sealId} đã được khóa và ký số bảo mật!`, 'success');
        }, 900);
      });
    }

    if (finishPickupBtn) {
      finishPickupBtn.addEventListener('click', () => {
        const state = window.ValigoState.getState();
        const activeOrder = state.orders.find(o => o.driverId === 'DRV-402' && o.status === 'confirmed') || state.orders[0];

        window.ValigoState.advanceOrderStatus(activeOrder.id, 'picked-up');
        if (custodyModal) custodyModal.classList.remove('open');

        window.ValigoApp.showToast(`Đơn #${activeOrder.id} đã lấy & niêm phong xong! Bắt đầu vận chuyển.`, 'success');

        setTimeout(() => {
          window.ValigoState.advanceOrderStatus(activeOrder.id, 'in-transit');
        }, 1500);
      });
    }
  }

  function openCustodyWizard(order) {
    const modal = document.getElementById('driverCustodyWizardModal');
    if (!modal) return;

    const bagCountEl = document.getElementById('wizardOrderBags');
    const customerEl = document.getElementById('wizardCustomerName');
    const sealSerialInput = document.getElementById('driverInputSealSerial');

    if (bagCountEl) bagCountEl.textContent = `${order.luggageCount} kiện (${order.luggageTypes.join(', ')})`;
    if (customerEl) customerEl.textContent = order.customerName;
    if (sealSerialInput) sealSerialInput.value = order.sealId;

    modal.classList.add('open');
  }

  function setupSignatureCanvas() {
    canvas = document.getElementById('signatureCanvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#38bdf8';

    // Mouse handlers
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Touch handlers for mobile/trackpad
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      startDrawing({ clientX: touch.clientX, clientY: touch.clientY });
    });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      draw({ clientX: touch.clientX, clientY: touch.clientY });
    });
    canvas.addEventListener('touchend', stopDrawing);

    const clearBtn = document.getElementById('clearSignatureBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      });
    }

    const confirmDeliveryBtn = document.getElementById('confirmDeliverySignBtn');
    const signModal = document.getElementById('signatureModal');

    if (confirmDeliveryBtn) {
      confirmDeliveryBtn.addEventListener('click', () => {
        const state = window.ValigoState.getState();
        const activeOrder = state.orders.find(o => o.driverId === 'DRV-402' && o.status !== 'delivered') || state.orders[0];

        window.ValigoState.advanceOrderStatus(activeOrder.id, 'delivered');
        if (signModal) signModal.classList.remove('open');
        window.ValigoApp.showToast(`Giao hàng hoàn tất! Đã lưu chữ ký khách hàng và xác thực tem niêm phong.`, 'success');
      });
    }

    const closeSignBtn = document.getElementById('closeSignatureModalBtn');
    if (closeSignBtn && signModal) {
      closeSignBtn.addEventListener('click', () => {
        signModal.classList.remove('open');
      });
    }
  }

  function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  function draw(e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }

  function stopDrawing() {
    isDrawing = false;
  }

  function openSignatureModal(order) {
    const modal = document.getElementById('signatureModal');
    if (!modal) return;
    modal.classList.add('open');

    // Simulate sample signature curve
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(30, 60);
      ctx.bezierCurveTo(80, 20, 120, 90, 180, 50);
      ctx.bezierCurveTo(210, 30, 250, 70, 300, 45);
      ctx.stroke();
    }
  }

  window.ValigoDriver = {
    init: initDriverModule,
    render: renderDriverView
  };

})(window);
