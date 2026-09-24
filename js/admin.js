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
 * VALIGO - Admin Operations Dashboard & Fleet Telemetry
 * Provides command center view: live KPIs, dispatch table, driver reassignment, and audit ledger.
 */

(function(window) {
  'use strict';

  let currentFilter = 'all';

  function initAdminModule() {
    renderAdminDashboard();
    setupTableFilters();

    window.ValigoState.subscribe(() => {
      renderAdminDashboard();
    });
  }

  function setupTableFilters() {
    const filterBtns = document.querySelectorAll('.admin-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderOrdersTable();
      });
    });
  }

  function renderAdminDashboard() {
    renderKpiMetrics();
    renderOrdersTable();
    renderAuditLedger();
  }

  function renderKpiMetrics() {
    const state = window.ValigoState.getState();
    const orders = state.orders;
    const lockers = state.lockers;
    const drivers = state.drivers;

    const activeOrders = orders.filter(o => o.status !== 'delivered').length;
    const inTransitCount = orders.filter(o => o.status === 'in-transit').length;
    const occupiedLockers = lockers.filter(l => l.status === 'occupied').length;
    const lockerOccupancyPct = Math.round((occupiedLockers / lockers.length) * 100);
    const activeDrivers = drivers.filter(d => d.activeJobs > 0).length;

    const metricActiveEl = document.getElementById('adminKpiActive');
    const metricTransitEl = document.getElementById('adminKpiTransit');
    const metricOnTimeEl = document.getElementById('adminKpiOnTime');
    const metricLockerEl = document.getElementById('adminKpiLocker');
    const metricFleetEl = document.getElementById('adminKpiFleet');

    if (metricActiveEl) metricActiveEl.textContent = activeOrders;
    if (metricTransitEl) metricTransitEl.textContent = inTransitCount;
    if (metricOnTimeEl) metricOnTimeEl.textContent = '99.6%';
    if (metricLockerEl) metricLockerEl.textContent = `${lockerOccupancyPct}% (${occupiedLockers}/${lockers.length})`;
    if (metricFleetEl) metricFleetEl.textContent = `${activeDrivers}/${drivers.length} Tài xế`;
  }

  function renderOrdersTable() {
    const state = window.ValigoState.getState();
    let orders = state.orders;
    const tableBody = document.getElementById('adminOrdersTableBody');

    if (!tableBody) return;

    if (currentFilter !== 'all') {
      orders = orders.filter(o => o.status === currentFilter);
    }

    tableBody.innerHTML = orders.map(order => {
      let statusBadgeClass = 'status-in-transit';
      if (order.status === 'stored-locker') statusBadgeClass = 'status-locker';
      if (order.status === 'delivered') statusBadgeClass = 'status-delivered';

      return `
        <tr>
          <td>
            <strong style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.9rem;">#${order.id}</strong>
            <div style="font-size: 0.72rem; color: var(--text-dim);">${order.recipientCode}</div>
          </td>
          <td>
            <div style="font-weight: 600; color: #fff;">${order.customerName}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${order.phone}</div>
          </td>
          <td>
            <div style="font-size: 0.8rem; color: #cbd5e1;">📍 ${order.pickupLocation}</div>
            <div style="font-size: 0.8rem; color: #94a3b8;">🎯 ${order.destination}</div>
          </td>
          <td>
            <span style="font-size: 0.75rem; background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px;">
              ${order.luggageCount} kiện
            </span>
          </td>
          <td>
            <span class="tracking-status-pill ${statusBadgeClass}" style="font-size: 0.75rem; padding: 2px 8px;">
              ${order.statusLabel || order.status}
            </span>
          </td>
          <td>
            <span style="font-family: var(--font-mono); font-size: 0.78rem; color: #fbbf24;">
              ${order.sealId}
            </span>
          </td>
          <td>
            <div style="font-size: 0.8rem; color: #fff;">${order.driverName}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">${order.vehicle}</div>
          </td>
          <td>
            <div style="display: flex; gap: 0.4rem;">
              <button class="btn-secondary" onclick="window.ValigoAdmin.quickSelect('${order.id}')" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">
                🔍 Theo Dõi
              </button>
              <button class="btn-secondary" onclick="window.ValigoAdmin.advanceDemo('${order.id}')" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; background: rgba(79, 70, 229, 0.2);">
                ⚡ Đổi Trạng Thái
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderAuditLedger() {
    const state = window.ValigoState.getState();
    const ledgerContainer = document.getElementById('adminAuditStreamList');
    if (!ledgerContainer) return;

    ledgerContainer.innerHTML = state.custodyLedger.map(log => `
      <div class="audit-entry">
        <div>
          <span style="color: var(--accent-cyan); font-weight: 700; margin-right: 0.5rem;">[${log.event}]</span>
          <span style="color: #fff; margin-right: 0.5rem;">Đơn #${log.orderId}</span>
          <span style="color: #cbd5e1;">- ${log.details}</span>
        </div>
        <div style="color: var(--text-dim); font-size: 0.75rem;">
          ${log.timestamp} • ${log.actor}
        </div>
      </div>
    `).join('');
  }

  function quickSelect(orderId) {
    window.ValigoState.selectOrder(orderId);
    window.ValigoApp.switchRole('customer');
    const trackTab = document.getElementById('navTrackingTab');
    if (trackTab) trackTab.click();
  }

  function advanceDemo(orderId) {
    const order = window.ValigoState.getOrder(orderId);
    if (!order) return;

    if (order.status === 'confirmed') {
      window.ValigoState.advanceOrderStatus(orderId, 'picked-up');
      window.ValigoApp.showToast(`Đơn #${orderId} đã chuyển sang Đã Nhận & Niêm Phong!`, 'success');
    } else if (order.status === 'picked-up') {
      window.ValigoState.advanceOrderStatus(orderId, 'in-transit');
      window.ValigoApp.showToast(`Đơn #${orderId} hiện đang được Vận Chuyển.`, 'info');
    } else if (order.status === 'in-transit') {
      window.ValigoState.advanceOrderStatus(orderId, 'stored-locker', { compartment: '106', otp: '749215' });
      window.ValigoApp.showToast(`Đơn #${orderId} đã chuyển lưu vào Tủ thông minh #106.`, 'info');
    } else if (order.status === 'stored-locker') {
      window.ValigoState.advanceOrderStatus(orderId, 'delivered');
      window.ValigoApp.showToast(`Đơn #${orderId} đã Giao Thành Công & Ký Nhận.`, 'success');
    } else {
      window.ValigoApp.showToast(`Đơn #${orderId} đã hoàn tất toàn bộ quy trình giao!`, 'info');
    }
  }

  window.ValigoAdmin = {
    init: initAdminModule,
    render: renderAdminDashboard,
    quickSelect: quickSelect,
    advanceDemo: advanceDemo
  };

})(window);
