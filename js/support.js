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
 * VALIGO - Customer Support Center & ValiBot AI Assistant
 * Provides floating interactive chatbot, quick help chips, and incident claim reporting workflows.
 */

(function(window) {
  'use strict';

  function initSupportModule() {
    setupValiBot();
    setupClaimModal();
  }

  function setupValiBot() {
    const triggerBtn = document.getElementById('supportWidgetBtn');
    const drawer = document.getElementById('valibotDrawer');
    const closeBtn = document.getElementById('closeValibotBtn');
    const sendBtn = document.getElementById('sendValibotMsgBtn');
    const inputEl = document.getElementById('valibotTextInput');

    if (triggerBtn && drawer) {
      triggerBtn.addEventListener('click', () => {
        drawer.classList.toggle('open');
      });
    }

    if (closeBtn && drawer) {
      closeBtn.addEventListener('click', () => {
        drawer.classList.remove('open');
      });
    }

    if (sendBtn && inputEl) {
      sendBtn.addEventListener('click', () => {
        const text = inputEl.value.trim();
        if (text) {
          handleUserMessage(text);
          inputEl.value = '';
        }
      });

      inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendBtn.click();
      });
    }

    // Quick chips
    document.querySelectorAll('.valibot-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.dataset.query;
        handleUserMessage(query);
      });
    });
  }

  function handleUserMessage(text) {
    const messagesContainer = document.getElementById('valibotMessages');
    if (!messagesContainer) return;

    // Append user bubble
    appendMessage(text, 'user');

    // Bot response logic
    setTimeout(() => {
      const state = window.ValigoState.getState();
      const order = window.ValigoState.getOrder(state.selectedOrderId);
      const lower = text.toLowerCase();

      let reply = '';

      if (lower.includes('ở đâu') || lower.includes('o dau') || lower.includes('trạng thái') || lower.includes('trang thai') || lower.includes('where') || lower.includes('status') || lower.includes('track')) {
        reply = `Hành lý cho đơn <strong>#${order.id}</strong> hiện đang: <strong>${order.statusLabel}</strong>.<br>Dự kiến giao lúc: <strong>${order.deliveryTime}</strong> bởi Tài xế <strong>${order.driverName}</strong> (${order.vehicle}).`;
      } else if (lower.includes('tủ') || lower.includes('tu') || lower.includes('locker') || lower.includes('otp') || lower.includes('code') || lower.includes('mã')) {
        if (order.lockerCompartment) {
          reply = `Hành lý của bạn đang được bảo vệ trong <strong>Tủ khóa thông minh #${order.lockerCompartment}</strong>.<br>Mã PIN tự lấy là <strong style="color:#fbbf24; font-size:1.1rem;">${order.lockerOtp}</strong>. Bạn có thể mở tủ 24/7 tại Trạm Sân Bay Ga T1/T2!`;
        } else {
          reply = `Mạng lưới Tủ Khóa Thông Minh hoạt động 24/7 tại sân bay và ga tàu. Nếu bạn chưa sẵn sàng nhận đồ, tài xế có thể lưu hành lý vào tủ và mã OTP 6 số sẽ tự động gửi tới bạn!`;
        }
      } else if (lower.includes('tem') || lower.includes('seal') || lower.includes('niêm phong') || lower.includes('an toàn') || lower.includes('bảo mật') || lower.includes('custody') || lower.includes('security')) {
        reply = `VALIGO sử dụng tem niêm phong số Holographic chống giả mạo (Mã tem hiện tại: <strong>${order.sealId}</strong>). Tem được bảo chứng chống mở trái phép và bảo hiểm hành lý <strong>25.000.000 VNĐ</strong> đi kèm cho mỗi chuyến đi.`;
      } else if (lower.includes('hư') || lower.includes('hỏng') || lower.includes('rách') || lower.includes('trễ') || lower.includes('khiếu nại') || lower.includes('damage') || lower.includes('delay') || lower.includes('claim') || lower.includes('issue')) {
        reply = `VALIGO cam kết chịu 100% trách nhiệm về hành lý. Bạn có muốn gửi biên bản ghi nhận sự cố? Hãy hoàn thành mẫu yêu cầu bồi thường bên dưới.`;
        openClaimModalTrigger();
      } else {
        reply = `Chào bạn! Tôi là ValiBot - Trợ lý số của VALIGO. Bạn có thể hỏi tôi về vị trí hành lý, kiểm tra mã tem niêm phong, mã OTP tủ khóa hoặc hướng dẫn đặt xe giao vali!`;
      }

      appendMessage(reply, 'bot');
    }, 600);
  }

  function appendMessage(html, sender) {
    const messagesContainer = document.getElementById('valibotMessages');
    if (!messagesContainer) return;

    const div = document.createElement('div');
    div.className = sender === 'user' ? 'user-msg' : 'bot-msg';
    div.innerHTML = html;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function openClaimModalTrigger() {
    const claimModal = document.getElementById('claimModal');
    if (claimModal) {
      setTimeout(() => {
        claimModal.classList.add('open');
      }, 1000);
    }
  }

  function setupClaimModal() {
    const claimModal = document.getElementById('claimModal');
    const closeClaimBtn = document.getElementById('closeClaimModalBtn');
    const submitClaimBtn = document.getElementById('submitClaimBtn');

    if (closeClaimBtn && claimModal) {
      closeClaimBtn.addEventListener('click', () => {
        claimModal.classList.remove('open');
      });
    }

    if (submitClaimBtn) {
      submitClaimBtn.addEventListener('click', () => {
        const category = document.getElementById('claimCategory').value;
        const notes = document.getElementById('claimNotes').value || 'Yêu cầu kiểm tra hiện trạng hành lý.';
        const claimId = 'CLM-' + Math.floor(1000 + Math.random() * 9000);

        const state = window.ValigoState.getState();
        const order = window.ValigoState.getOrder(state.selectedOrderId);

        window.ValigoState.addCustodyLog(order.id, 'CLAIM_FILED', 'Customer Service', `Khiếu nại ${claimId} [${category}]: ${notes}`);

        if (claimModal) claimModal.classList.remove('open');
        window.ValigoApp.showToast(`Phiếu khiếu nại #${claimId} đã được tạo. Chuyên viên xử lý bảo hiểm đang tiếp nhận.`, 'warning');
      });
    }
  }

  window.ValigoSupport = {
    init: initSupportModule,
    handleUserMessage: handleUserMessage
  };

})(window);
