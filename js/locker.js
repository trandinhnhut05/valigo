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
 * VALIGO - Smart Locker Integration (ValiLocker Network Simulator)
 * Simulates physical locker terminal keypad, door actuation, OTP verification, and buffer workflows.
 */

(function(window) {
  'use strict';

  let currentInput = '';
  let terminalMode = 'pickup'; // 'pickup' | 'deposit'
  let activeOpenCompartment = null;

  function initLockerModule() {
    renderLockerGrid();
    setupKeypad();
    setupQuickActions();

    // Subscribe to state changes
    window.ValigoState.subscribe(() => {
      renderLockerGrid();
    });
  }

  function renderLockerGrid() {
    const container = document.getElementById('lockerDoorsGrid');
    if (!container) return;

    const state = window.ValigoState.getState();
    const lockers = state.lockers;

    container.innerHTML = lockers.map(locker => {
      const isOpen = activeOpenCompartment === locker.id;
      return `
        <div class="locker-door ${isOpen ? 'open' : ''}" data-id="${locker.id}" id="lockerDoor_${locker.id}">
          <div class="locker-door-num">${locker.id}</div>
          <span class="locker-status-indicator status-${locker.status}"></span>
          
          <div class="locker-interior-content">
            ${isOpen ? '🚪 <strong style="color:#34d399">ĐÃ MỞ KHÓA</strong>' : 
              locker.status === 'occupied' ? '🎒 Đang lưu' : 
              locker.status === 'reserved' ? '⏳ Đã đặt' : '🟢 Sẵn sàng'}
          </div>
        </div>
      `;
    }).join('');

    // Attach click listener for doors
    document.querySelectorAll('.locker-door').forEach(door => {
      door.addEventListener('click', () => {
        const id = door.dataset.id;
        const locker = lockers.find(l => l.id === id);
        if (locker) {
          if (locker.status === 'occupied' && locker.otp) {
            setTerminalDisplay(locker.otp, `Đã điền tự động OTP cho tủ #${id}`);
          } else {
            setTerminalDisplay(id, `Đã chọn ngăn tủ #${id}`);
          }
        }
      });
    });
  }

  function setupKeypad() {
    const screenDisplay = document.getElementById('terminalDisplayCode');
    const screenMsg = document.getElementById('terminalMsg');
    const screenTitle = document.getElementById('terminalTitle');

    // Number keys
    document.querySelectorAll('.keypad-num').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.val;
        if (currentInput.length < 6) {
          currentInput += val;
          updateScreen();
        }
      });
    });

    // Clear key
    const clearBtn = document.getElementById('keypadClear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        currentInput = '';
        updateScreen();
      });
    }

    // Enter key
    const enterBtn = document.getElementById('keypadEnter');
    if (enterBtn) {
      enterBtn.addEventListener('click', () => {
        processTerminalInput();
      });
    }

    // Mode toggles
    const pickupModeBtn = document.getElementById('terminalModePickup');
    const depositModeBtn = document.getElementById('terminalModeDeposit');

    if (pickupModeBtn && depositModeBtn) {
      pickupModeBtn.addEventListener('click', () => {
        terminalMode = 'pickup';
        pickupModeBtn.classList.add('active');
        depositModeBtn.classList.remove('active');
        currentInput = '';
        if (screenTitle) screenTitle.textContent = 'KHÁCH HÀNG TỰ LẤY HÀNH LÝ • NHẬP MÃ OTP 6 CHỮ SỐ';
        updateScreen();
      });

      depositModeBtn.addEventListener('click', () => {
        terminalMode = 'deposit';
        depositModeBtn.classList.add('active');
        pickupModeBtn.classList.remove('active');
        currentInput = '';
        if (screenTitle) screenTitle.textContent = 'TÀI XẾ GỬI HÀNG • NHẬP SỐ NGĂN TỦ ĐƯỢC CHỈ ĐỊNH';
        updateScreen();
      });
    }
  }

  function updateScreen() {
    const screenDisplay = document.getElementById('terminalDisplayCode');
    const screenMsg = document.getElementById('terminalMsg');

    if (screenDisplay) {
      screenDisplay.textContent = currentInput || '------';
    }
    if (screenMsg) {
      screenMsg.textContent = currentInput.length === 6 ? 'Nhấn ENTER để mở khóa' : 'Nhập mã an toàn trên bàn phím';
      screenMsg.style.color = '#94a3b8';
    }
  }

  function setTerminalDisplay(code, msg) {
    currentInput = code;
    const screenDisplay = document.getElementById('terminalDisplayCode');
    const screenMsg = document.getElementById('terminalMsg');
    if (screenDisplay) screenDisplay.textContent = code;
    if (screenMsg) {
      screenMsg.textContent = msg;
      screenMsg.style.color = '#34d399';
    }
  }

  function processTerminalInput() {
    const screenMsg = document.getElementById('terminalMsg');
    const state = window.ValigoState.getState();

    if (terminalMode === 'pickup') {
      if (currentInput.length !== 6) {
        if (screenMsg) {
          screenMsg.textContent = 'Lỗi: Mã OTP phải đủ 6 chữ số';
          screenMsg.style.color = '#ef4444';
        }
        return;
      }

      // Look up locker by OTP
      const locker = state.lockers.find(l => l.otp === currentInput);
      if (locker) {
        openCompartmentDoor(locker.id, locker.orderId, 'pickup');
      } else {
        if (screenMsg) {
          screenMsg.textContent = 'Xác thực thất bại: Mã OTP không đúng';
          screenMsg.style.color = '#ef4444';
        }
        window.ValigoApp.showToast('Mã OTP không hợp lệ. Vui lòng kiểm tra tin nhắn SMS/App.', 'warning');
      }
    } else {
      // Deposit mode (courier deposits into compartment)
      const compartmentId = currentInput || '106';
      const availableLocker = state.lockers.find(l => l.id === compartmentId && l.status === 'available');
      
      if (!availableLocker) {
        if (screenMsg) {
          screenMsg.textContent = `Ngăn tủ #${compartmentId} hiện không sẵn sàng`;
          screenMsg.style.color = '#ef4444';
        }
        return;
      }

      // Choose an order in-transit
      const inTransitOrder = state.orders.find(o => o.status === 'in-transit') || state.orders[0];
      if (inTransitOrder) {
        const depositResult = window.ValigoState.depositToLocker(inTransitOrder.id, availableLocker.id);
        openCompartmentDoor(availableLocker.id, inTransitOrder.id, 'deposit', depositResult.otp);
      }
    }
  }

  function openCompartmentDoor(compartmentId, orderId, actionType, generatedOtp = null) {
    activeOpenCompartment = compartmentId;
    renderLockerGrid();

    const screenMsg = document.getElementById('terminalMsg');
    const screenDisplay = document.getElementById('terminalDisplayCode');

    if (screenDisplay) screenDisplay.textContent = `CỬA #${compartmentId}`;
    if (screenMsg) {
      screenMsg.textContent = actionType === 'pickup' ? 
        `Ngăn tủ #${compartmentId} ĐÃ MỞ. Vui lòng lấy hành lý.` : 
        `Ngăn tủ #${compartmentId} ĐÃ MỞ. Đặt hành lý vào và đóng cửa.`;
      screenMsg.style.color = '#34d399';
    }

    // Modal or Door Control Banner
    const actionBanner = document.getElementById('lockerActionBanner');
    if (actionBanner) {
      actionBanner.style.display = 'block';
      actionBanner.innerHTML = `
        <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%); border: 1px solid #10b981; border-radius: 12px; padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-top: 1.5rem;">
          <div>
            <h4 style="color: #34d399; font-size: 1.1rem; margin-bottom: 0.25rem;">
              🔓 Ngăn tủ #${compartmentId} hiện ĐANG MỞ
            </h4>
            <p style="font-size: 0.85rem; color: #cbd5e1;">
              ${actionType === 'pickup' ? 
                `Hành lý cho đơn #${orderId} đã được lấy thành công. Vui lòng kiểm tra tem niêm phong.` : 
                `Đã đặt hành lý an toàn. Mã OTP cho khách hàng: <strong style="font-family:var(--font-mono); color:#fbbf24">${generatedOtp}</strong>`}
            </p>
          </div>
          <button class="btn-primary" id="closeLockerDoorBtn" style="width: auto; background: #10b981; color: #000; font-weight: 800;">
            ✓ Đóng Khóa Chốt An Toàn Cửa #${compartmentId}
          </button>
        </div>
      `;

      const closeDoorBtn = document.getElementById('closeLockerDoorBtn');
      if (closeDoorBtn) {
        closeDoorBtn.addEventListener('click', () => {
          if (actionType === 'pickup') {
            window.ValigoState.retrieveFromLocker(compartmentId, currentInput);
            window.ValigoApp.showToast(`Đã nhận hành lý từ Tủ khóa #${compartmentId}. Dịch vụ hoàn tất!`, 'success');
          } else {
            window.ValigoApp.showToast(`Tủ khóa #${compartmentId} đã chốt! Đã gửi OTP ${generatedOtp} cho khách.`, 'success');
          }

          activeOpenCompartment = null;
          actionBanner.style.display = 'none';
          currentInput = '';
          updateScreen();
          renderLockerGrid();
        });
      }
    }
  }

  function setupQuickActions() {
    const testPickupBtn = document.getElementById('testPickupBtn');
    const testDepositBtn = document.getElementById('testDepositBtn');

    if (testPickupBtn) {
      testPickupBtn.addEventListener('click', () => {
        // Auto-fills Lê Hoàng Yến's locker code
        const pickupModeBtn = document.getElementById('terminalModePickup');
        if (pickupModeBtn) pickupModeBtn.click();
        setTerminalDisplay('683912', 'Demo: Mã Lấy Hành Lý Của Lê Hoàng Yến');
        setTimeout(() => {
          processTerminalInput();
        }, 500);
      });
    }

    if (testDepositBtn) {
      testDepositBtn.addEventListener('click', () => {
        const depositModeBtn = document.getElementById('terminalModeDeposit');
        if (depositModeBtn) depositModeBtn.click();
        setTerminalDisplay('106', 'Demo: Tài xế gửi hành lý vào #106');
        setTimeout(() => {
          processTerminalInput();
        }, 500);
      });
    }
  }

  window.ValigoLocker = {
    init: initLockerModule,
    render: renderLockerGrid
  };

})(window);
