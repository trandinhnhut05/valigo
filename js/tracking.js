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
 * VALIGO - Luggage Tracking & Interactive Route Visualization
 * Renders live milestones, GPS pathing, security seal status, and custody triggers.
 */

(function(window) {
  'use strict';

  function initTrackingModule() {
    renderTrackingView();
    setupOrderSearch();

    // Re-render when state changes
    window.ValigoState.subscribe(() => {
      renderTrackingView();
    });
  }

  function setupOrderSearch() {
    const searchInput = document.getElementById('trackingSearchInput');
    const searchBtn = document.getElementById('trackingSearchBtn');

    if (searchBtn && searchInput) {
      searchBtn.addEventListener('click', () => {
        const id = searchInput.value.trim().toUpperCase();
        if (id) {
          const order = window.ValigoState.getOrder(id);
          if (order) {
            window.ValigoState.selectOrder(order.id);
            window.ValigoApp.showToast(`Đang theo dõi đơn hàng #${order.id}`, 'info');
          } else {
            window.ValigoApp.showToast(`Không tìm thấy mã đơn ${id}`, 'warning');
          }
        }
      });

      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchBtn.click();
      });
    }

    // Quick demo order pills
    const quickOrderBtns = document.querySelectorAll('.quick-order-pill');
    quickOrderBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.dataset.order;
        window.ValigoState.selectOrder(orderId);
        window.ValigoApp.showToast(`Đã tải dữ liệu đơn #${orderId}`, 'info');
      });
    });
  }

  function renderTrackingView() {
    const state = window.ValigoState.getState();
    const order = window.ValigoState.getOrder(state.selectedOrderId);
    if (!order) return;

    // Header info
    const idEl = document.getElementById('trackOrderId');
    const statusEl = document.getElementById('trackStatusPill');
    const pickupEl = document.getElementById('trackPickupLoc');
    const destEl = document.getElementById('trackDestLoc');
    const etaEl = document.getElementById('trackEta');
    const sealNumEl = document.getElementById('trackSealNum');
    const sealStatusEl = document.getElementById('trackSealStatus');
    const driverNameEl = document.getElementById('trackDriverName');
    const driverVehicleEl = document.getElementById('trackDriverVehicle');
    const driverPhoneEl = document.getElementById('trackDriverPhone');
    const lockerAlertBox = document.getElementById('trackLockerAlertBox');

    if (idEl) idEl.textContent = `#${order.id}`;
    if (pickupEl) pickupEl.textContent = order.pickupLocation;
    if (destEl) destEl.textContent = order.destination;
    if (etaEl) etaEl.textContent = order.deliveryTime;

    if (sealNumEl) sealNumEl.textContent = order.sealId;
    if (sealStatusEl) {
      sealStatusEl.textContent = order.sealStatus;
      sealStatusEl.style.color = (order.sealStatus.includes('Nguyên vẹn') || order.sealStatus.includes('Intact')) ? '#34d399' : '#fbbf24';
    }

    if (driverNameEl) driverNameEl.textContent = order.driverName;
    if (driverVehicleEl) driverVehicleEl.textContent = order.vehicle;
    if (driverPhoneEl) driverPhoneEl.textContent = order.driverPhone;

    // Status styling
    if (statusEl) {
      statusEl.className = 'tracking-status-pill';
      if (order.status === 'in-transit') {
        statusEl.classList.add('status-in-transit');
        statusEl.innerHTML = `<span class="pulse-dot"></span> Đang Vận Chuyển (Xe Di Chuyển)`;
      } else if (order.status === 'stored-locker') {
        statusEl.classList.add('status-locker');
        statusEl.innerHTML = `<span class="pulse-dot"></span> Đang Lưu Tại Tủ Khóa Thông Minh #${order.lockerCompartment || '104'}`;
      } else if (order.status === 'delivered') {
        statusEl.classList.add('status-delivered');
        statusEl.innerHTML = `✓ Đã Giao Thành Công & Đã Ký Nhận`;
      } else {
        statusEl.classList.add('status-in-transit');
        statusEl.innerHTML = `<span class="pulse-dot"></span> ${order.statusLabel || 'Đang xử lý'}`;
      }
    }

    // Locker Alert Box
    if (lockerAlertBox) {
      if (order.status === 'stored-locker' || order.lockerCompartment) {
        lockerAlertBox.style.display = 'block';
        lockerAlertBox.innerHTML = `
          <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 12px; padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
            <div>
              <h4 style="color: #fbbf24; font-size: 1rem; margin-bottom: 0.25rem;">🔐 Hành Lý Được Bảo Vệ Trong Tủ Khóa Thông Minh</h4>
              <p style="font-size: 0.85rem; color: #cbd5e1;">Vị trí: <strong>Trạm Hub Sân Bay Quốc Tế (Ga T1/T2)</strong> | Ngăn tủ: <strong style="color: #fff; font-size: 1.1rem;">#${order.lockerCompartment || '104'}</strong></p>
              <p style="font-size: 0.85rem; color: #34d399; margin-top: 0.25rem;">Mã OTP Tự Lấy Hành Lý: <strong style="font-family: var(--font-mono); letter-spacing: 0.15em; font-size: 1.2rem; background: rgba(0,0,0,0.4); padding: 2px 8px; border-radius: 4px;">${order.lockerOtp || '683-912'}</strong></p>
            </div>
            <button class="btn-secondary" id="openLockerSimBtn" style="background: #fbbf24; color: #000; font-weight: 700;">
              ⚡ Mở Mô Phỏng Màn Hình Tủ Khóa
            </button>
          </div>
        `;

        const simBtn = document.getElementById('openLockerSimBtn');
        if (simBtn) {
          simBtn.addEventListener('click', () => {
            window.ValigoApp.switchRole('locker');
          });
        }
      } else {
        lockerAlertBox.style.display = 'none';
      }
    }

    // Render Milestones Stepper
    renderMilestones(order.milestones);

    // Render SVG Route Map
    renderRouteSvg(order);
  }

  function renderMilestones(milestones) {
    const container = document.getElementById('milestonesStepper');
    if (!container || !milestones) return;

    container.innerHTML = milestones.map((m, idx) => `
      <div class="milestone-item ${m.status}">
        <div class="milestone-dot">
          ${m.status === 'completed' ? '✓' : ''}
        </div>
        <div class="milestone-content">
          <div class="milestone-title">
            <span>${m.title}</span>
            <span class="milestone-time">${m.time}</span>
          </div>
          <div class="milestone-desc">${m.desc}</div>
        </div>
      </div>
    `).join('');
  }

  function renderRouteSvg(order) {
    const container = document.getElementById('mapRouteVisualizer');
    if (!container) return;

    // Determine courier marker progress based on status
    let markerPercent = 55;
    if (order.status === 'confirmed') markerPercent = 10;
    if (order.status === 'picked-up') markerPercent = 25;
    if (order.status === 'in-transit') markerPercent = 60;
    if (order.status === 'stored-locker') markerPercent = 90;
    if (order.status === 'delivered') markerPercent = 100;

    container.innerHTML = `
      <svg class="svg-route-map" viewBox="0 0 700 220" preserveAspectRatio="none">
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#4f46e5" />
            <stop offset="60%" stop-color="#06b6d4" />
            <stop offset="100%" stop-color="#10b981" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- City Grid Background Lines -->
        <g stroke="rgba(255,255,255,0.04)" stroke-width="1">
          <line x1="0" y1="50" x2="700" y2="50" />
          <line x1="0" y1="110" x2="700" y2="110" />
          <line x1="0" y1="170" x2="700" y2="170" />
          <line x1="140" y1="0" x2="140" y2="220" />
          <line x1="280" y1="0" x2="280" y2="220" />
          <line x1="420" y1="0" x2="420" y2="220" />
          <line x1="560" y1="0" x2="560" y2="220" />
        </g>

        <!-- River Contour Curve (Simulated Han River) -->
        <path d="M 280,0 Q 290,80 270,140 T 290,220" fill="none" stroke="rgba(6, 182, 212, 0.2)" stroke-width="26" stroke-linecap="round" />

        <!-- Actual Route Path -->
        <path id="transitPath" d="M 60,160 C 180,160 220,70 380,70 S 550,140 640,100" 
              fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="5" stroke-linecap="round" />

        <path d="M 60,160 C 180,160 220,70 380,70 S 550,140 640,100" 
              fill="none" stroke="url(#routeGradient)" stroke-width="4" stroke-dasharray="8 4" filter="url(#glow)">
          <animate attributeName="stroke-dashoffset" values="0;-24" dur="1.2s" repeatCount="indefinite" />
        </path>

        <!-- Checkpoint 1: Hotel Pickup -->
        <circle cx="60" cy="160" r="8" fill="#4f46e5" stroke="#fff" stroke-width="2" />
        <text x="60" y="195" fill="#cbd5e1" font-size="11" font-family="'Plus Jakarta Sans', sans-serif" text-anchor="middle" font-weight="600">Điểm Lấy Hành Lý (Resort)</text>

        <!-- Checkpoint 2: City Bridge Waypoint -->
        <circle cx="340" cy="74" r="6" fill="#06b6d4" stroke="#fff" stroke-width="2" />
        <text x="340" y="55" fill="#06b6d4" font-size="10" font-family="'JetBrains Mono', monospace" text-anchor="middle">Trạm GPS Cầu Sông Hàn (38 km/h)</text>

        <!-- Checkpoint 3: Terminal Destination / Locker -->
        <circle cx="640" cy="100" r="9" fill="#10b981" stroke="#fff" stroke-width="2" />
        <text x="640" y="135" fill="#34d399" font-size="11" font-family="'Plus Jakarta Sans', sans-serif" text-anchor="middle" font-weight="600">Sân Bay Ga T2 / Tủ Khóa</text>

        <!-- Active Courier Icon -->
        <g transform="translate(${50 + (markerPercent * 5.7)}, ${160 - (markerPercent > 50 ? 60 : 30)})">
          <circle cx="0" cy="0" r="14" fill="#6366f1" filter="url(#glow)">
            <animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite" />
          </circle>
          <text x="0" y="4" fill="#fff" font-size="10" font-family="sans-serif" text-anchor="middle">🚚</text>
        </g>
      </svg>

      <div class="map-driver-tag">
        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981;"></span>
        <span>Tài xế: <strong>${order.driverName}</strong> (${order.vehicle})</span>
        <span style="margin-left:0.5rem; color:#94a3b8;">• Sai số GPS: 1.5m</span>
      </div>
    `;
  }

  window.ValigoTracking = {
    init: initTrackingModule,
    render: renderTrackingView
  };

})(window);
