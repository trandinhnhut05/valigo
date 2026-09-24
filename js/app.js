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
 * VALIGO - Core Application Controller & Router
 * Initializes modules, manages role-based view switching, toast alerts, and demo presets.
 */

(function(window) {
  'use strict';

  function initApp() {
    setupRoleSwitcher();
    setupCustomerSubnav();
    setupDemoControls();

    // Initialize feature modules
    window.ValigoBooking.init();
    window.ValigoTracking.init();
    window.ValigoCustody.init();
    window.ValigoLocker.init();
    window.ValigoDriver.init();
    window.ValigoAdmin.init();
    window.ValigoSupport.init();

    // Set default or URL-specified role (?role=admin or #admin)
    const state = window.ValigoState.getState();
    const urlParams = new URLSearchParams(window.location.search);
    const hashRole = window.location.hash.replace('#', '').toLowerCase();
    const roleParam = urlParams.get('role');
    const validRoles = ['customer', 'driver', 'locker', 'admin'];
    
    let targetRole = 'customer';
    if (roleParam && validRoles.includes(roleParam.toLowerCase())) {
      targetRole = roleParam.toLowerCase();
    } else if (hashRole && validRoles.includes(hashRole)) {
      targetRole = hashRole;
    } else if (state.currentRole && validRoles.includes(state.currentRole)) {
      targetRole = state.currentRole;
    }

    switchRole(targetRole);

    // Listen for hash navigation
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (validRoles.includes(hash)) {
        switchRole(hash);
      }
    });
  }

  function setupRoleSwitcher() {
    const roleTabs = document.querySelectorAll('.role-tab');
    roleTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const role = tab.dataset.role;
        switchRole(role);
      });
    });

    const brandBtn = document.getElementById('navBrandLogo');
    if (brandBtn) {
      brandBtn.addEventListener('click', () => {
        switchRole('customer');
      });
    }
  }

  function switchRole(role) {
    // Update active tab button
    document.querySelectorAll('.role-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.role === role);
    });

    // Toggle view sections
    document.querySelectorAll('.app-view').forEach(view => {
      view.classList.remove('active');
    });

    const targetView = document.getElementById(`view-${role}`);
    if (targetView) {
      targetView.classList.add('active');
    }

    window.ValigoState.setRole(role);

    // Module-specific re-renders
    if (role === 'customer') {
      window.ValigoTracking.render();
    } else if (role === 'driver') {
      window.ValigoDriver.render();
    } else if (role === 'locker') {
      window.ValigoLocker.render();
    } else if (role === 'admin') {
      window.ValigoAdmin.render();
    }

    showToast(`Đã chuyển sang giao diện ${getRoleDisplayName(role)}`, 'info');
  }

  function getRoleDisplayName(role) {
    switch (role) {
      case 'customer': return 'Khách Hàng';
      case 'driver': return 'Tài Xế Giao Hàng';
      case 'locker': return 'Tủ Khóa Thông Minh';
      case 'admin': return 'Quản Trị Vận Hành';
      default: return role;
    }
  }

  function setupCustomerSubnav() {
    const subnavBtns = document.querySelectorAll('.customer-subnav .subnav-btn');
    const bookingSection = document.getElementById('customerBookingSection');
    const trackingSection = document.getElementById('customerTrackingSection');

    subnavBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        subnavBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tab = btn.dataset.tab;
        if (tab === 'booking') {
          if (bookingSection) bookingSection.style.display = 'block';
          if (trackingSection) trackingSection.style.display = 'none';
        } else if (tab === 'tracking') {
          if (bookingSection) bookingSection.style.display = 'none';
          if (trackingSection) trackingSection.style.display = 'block';
          window.ValigoTracking.render();
        }
      });
    });
  }

  function setupDemoControls() {
    const resetBtn = document.getElementById('resetDemoStateBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Khôi phục dữ liệu demo về trạng thái ban đầu?')) {
          window.ValigoState.resetState();
          showToast('Đã khôi phục dữ liệu mẫu ban đầu thành công.', 'info');
          location.reload();
        }
      });
    }
  }

  // Toast Notification System
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  // Global app handle
  window.ValigoApp = {
    init: initApp,
    switchRole: switchRole,
    showToast: showToast
  };

  document.addEventListener('DOMContentLoaded', initApp);

})(window);
