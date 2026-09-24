/*
 * Copyright (c) 2026 VALIGO Platform
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
 * VALIGO - Booking Engine & Itinerary Scheduling Assistant (Phiên bản Việt Nam)
 * Xử lý tính toán xếp lịch thông minh, định giá VNĐ, và thanh toán số.
 */

(function(window) {
  'use strict';

  // Định giá hành lý theo tiền đồng Việt Nam (VNĐ)
  const LUGGAGE_PRICING = {
    cabin: { name: 'Vali Xách Tay 20" (Dưới 7kg)', price: 80000, count: 1 },
    standard: { name: 'Vali Ký Gửi Tiêu Chuẩn 24"-26" (Dưới 23kg)', price: 120000, count: 1 },
    large: { name: 'Vali Cỡ Lớn / Nặng 28"-32" (Dưới 32kg)', price: 180000, count: 0 },
    special: { name: 'Túi Gậy Golf / Ván Lướt / Hàng Dễ Vỡ', price: 220000, count: 0 }
  };

  const TIER_PRICING = {
    standard: 0,
    priority: 60000,
    scheduled: 30000
  };

  let selectedTier = 'priority';
  let insuranceEnabled = true;
  const INSURANCE_FEE = 25000; // Bảo hiểm ValiShield 25.000.000 VNĐ

  function formatVnd(amount) {
    return `${amount.toLocaleString('vi-VN')} đ`;
  }

  function initBookingModule() {
    setupItineraryCalculator();
    setupLuggageCounters();
    setupTierSelection();
    setupInsuranceToggle();
    setupCheckoutHandlers();
    updatePriceSummary();
  }

  // Thuật toán tính toán xếp lịch theo hành trình (Itinerary-Based Scheduling)
  function setupItineraryCalculator() {
    const checkoutInput = document.getElementById('itinCheckoutTime');
    const flightInput = document.getElementById('itinFlightTime');
    const calcBtn = document.getElementById('calcItineraryBtn');
    const resultBox = document.getElementById('itineraryResultBox');
    const pickupTimeField = document.getElementById('bookingPickupTime');
    const deliveryTimeField = document.getElementById('bookingDeliveryTime');

    if (!calcBtn) return;

    calcBtn.addEventListener('click', () => {
      const checkoutVal = checkoutInput.value || '11:00';
      const flightVal = flightInput.value || '19:30';

      const [chH, chM] = checkoutVal.split(':').map(Number);
      const [flH, flM] = flightVal.split(':').map(Number);

      const chTotal = chH * 60 + chM;
      const flTotal = flH * 60 + flM;

      let diffMinutes = flTotal - chTotal;
      if (diffMinutes < 0) diffMinutes += 24 * 60;

      const diffHours = (diffMinutes / 60).toFixed(1);

      // Đề xuất giờ lấy hành lý: trước giờ check-out 30 phút
      let recPickupH = chH;
      let recPickupM = chM - 30;
      if (recPickupM < 0) {
        recPickupM += 60;
        recPickupH = (recPickupH - 1 + 24) % 24;
      }
      const recPickupStr = `${String(recPickupH).padStart(2, '0')}:${String(recPickupM).padStart(2, '0')}`;

      // Đề xuất giờ giao: trước giờ bay 2 tiếng 15 phút
      let recDelivH = flH - 2;
      let recDelivM = flM - 15;
      if (recDelivM < 0) {
        recDelivM += 60;
        recDelivH -= 1;
      }
      recDelivH = (recDelivH + 24) % 24;
      const recDelivStr = `${String(recDelivH).padStart(2, '0')}:${String(recDelivM).padStart(2, '0')}`;

      if (pickupTimeField) pickupTimeField.value = `Hôm nay, ${recPickupStr}`;
      if (deliveryTimeField) deliveryTimeField.value = `Hôm nay, ${recDelivStr} (Ga đi Sân Bay / Khách Sạn)`;

      if (resultBox) {
        resultBox.style.display = 'flex';
        resultBox.innerHTML = `
          <div>
            <strong>✨ Khuyến nghị AI Đã Áp Dụng:</strong> Nhận lúc <strong>${recPickupStr}</strong> (Sảnh Lễ Tân) & Giao lúc <strong>${recDelivStr}</strong> (Quầy Sân Bay / Tủ Khóa).
          </div>
          <div class="freedom-hours">
            🎒 +${diffHours} giờ Du Lịch Rảnh Tay!
          </div>
        `;
      }

      window.ValigoApp.showToast(`Đã đồng bộ lịch trình: +${diffHours}h du lịch thảnh thơi không lo vướng bận!`, 'info');
    });
  }

  function setupLuggageCounters() {
    document.querySelectorAll('.counter-control').forEach(ctrl => {
      const type = ctrl.dataset.type;
      const decBtn = ctrl.querySelector('.btn-dec');
      const incBtn = ctrl.querySelector('.btn-inc');
      const valSpan = ctrl.querySelector('.counter-val');

      if (!type || !LUGGAGE_PRICING[type]) return;

      decBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (LUGGAGE_PRICING[type].count > 0) {
          LUGGAGE_PRICING[type].count--;
          valSpan.textContent = LUGGAGE_PRICING[type].count;
          updatePriceSummary();
        }
      });

      incBtn.addEventListener('click', (e) => {
        e.preventDefault();
        LUGGAGE_PRICING[type].count++;
        valSpan.textContent = LUGGAGE_PRICING[type].count;
        updatePriceSummary();
      });
    });
  }

  function setupTierSelection() {
    const cards = document.querySelectorAll('.tier-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedTier = card.dataset.tier;
        updatePriceSummary();
      });
    });
  }

  function setupInsuranceToggle() {
    const chk = document.getElementById('insuranceToggle');
    if (chk) {
      chk.addEventListener('change', () => {
        insuranceEnabled = chk.checked;
        updatePriceSummary();
      });
    }
  }

  function updatePriceSummary() {
    let baseTotal = 0;
    let totalItems = 0;
    const itemNames = [];

    Object.keys(LUGGAGE_PRICING).forEach(key => {
      const item = LUGGAGE_PRICING[key];
      if (item.count > 0) {
        baseTotal += item.price * item.count;
        totalItems += item.count;
        itemNames.push(`${item.count}x ${item.name}`);
      }
    });

    const tierFee = TIER_PRICING[selectedTier] || 0;
    const insFee = insuranceEnabled ? INSURANCE_FEE : 0;
    const finalTotal = baseTotal + tierFee + insFee;

    const bagCountEl = document.getElementById('summaryBagCount');
    const bagSubtotalEl = document.getElementById('summaryBagSubtotal');
    const tierLabelEl = document.getElementById('summaryTierLabel');
    const tierPriceEl = document.getElementById('summaryTierPrice');
    const insPriceEl = document.getElementById('summaryInsurancePrice');
    const finalTotalEl = document.getElementById('summaryFinalTotal');

    let tierDisplayName = 'Giao Tiêu Chuẩn';
    if (selectedTier === 'priority') tierDisplayName = 'Hỏa Tốc 2 Giờ';
    if (selectedTier === 'scheduled') tierDisplayName = 'Khung Giờ Chính Xác';

    if (bagCountEl) bagCountEl.textContent = `${totalItems} Kiện`;
    if (bagSubtotalEl) bagSubtotalEl.textContent = formatVnd(baseTotal);
    if (tierLabelEl) tierLabelEl.textContent = tierDisplayName;
    if (tierPriceEl) tierPriceEl.textContent = tierFee > 0 ? `+${formatVnd(tierFee)}` : 'Đã bao gồm';
    if (insPriceEl) insPriceEl.textContent = insuranceEnabled ? `+${formatVnd(INSURANCE_FEE)}` : '0 đ (Không chọn)';
    if (finalTotalEl) finalTotalEl.textContent = formatVnd(finalTotal);

    return {
      totalItems,
      baseTotal,
      finalTotal,
      itemNames,
      tierFee,
      insuranceEnabled
    };
  }

  function setupCheckoutHandlers() {
    const openCheckoutBtn = document.getElementById('openCheckoutBtn');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');

    if (openCheckoutBtn && checkoutModal) {
      openCheckoutBtn.addEventListener('click', () => {
        const summary = updatePriceSummary();
        if (summary.totalItems === 0) {
          window.ValigoApp.showToast('Vui lòng chọn ít nhất 1 kiện hành lý.', 'warning');
          return;
        }

        const modalTotal = document.getElementById('modalCheckoutTotal');
        if (modalTotal) modalTotal.textContent = formatVnd(summary.finalTotal);

        checkoutModal.classList.add('open');
      });
    }

    if (closeCheckoutBtn && checkoutModal) {
      closeCheckoutBtn.addEventListener('click', () => {
        checkoutModal.classList.remove('open');
      });
    }

    document.querySelectorAll('.pay-method-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.pay-method-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const method = pill.dataset.method;
        const cardSection = document.getElementById('cardPaySection');
        const qrSection = document.getElementById('qrPaySection');
        if (method === 'card' || method === 'apple') {
          if (cardSection) cardSection.style.display = 'block';
          if (qrSection) qrSection.style.display = 'none';
        } else {
          if (cardSection) cardSection.style.display = 'none';
          if (qrSection) qrSection.style.display = 'block';
        }
      });
    });

    if (confirmPaymentBtn) {
      confirmPaymentBtn.addEventListener('click', () => {
        const pickupLoc = document.getElementById('bookingPickupLocation').value;
        const destLoc = document.getElementById('bookingDestination').value;
        const customerName = document.getElementById('customerFullName').value || 'Nguyễn Minh Tuấn';
        const customerPhone = document.getElementById('customerPhone').value || '+84 905 123 456';
        const customerEmail = document.getElementById('customerEmail').value || 'tuan.nguyen@vietnamtravel.vn';
        const pickupTime = document.getElementById('bookingPickupTime').value;
        const deliveryTime = document.getElementById('bookingDeliveryTime').value;

        const summary = updatePriceSummary();

        const newOrder = window.ValigoState.addOrder({
          customerName: customerName,
          phone: customerPhone,
          email: customerEmail,
          pickupLocation: pickupLoc,
          destination: destLoc,
          pickupTime: pickupTime,
          deliveryTime: deliveryTime,
          luggageCount: summary.totalItems,
          luggageTypes: summary.itemNames,
          serviceTier: selectedTier === 'priority' ? 'HỎA TỐC 2H' : 'TIÊU CHUẨN',
          totalAmount: summary.finalTotal,
          insuranceIncluded: insuranceEnabled
        });

        if (checkoutModal) checkoutModal.classList.remove('open');

        window.ValigoApp.showToast(`🎉 Thanh toán thành công! Đơn hàng #${newOrder.id} đã khởi tạo với Tem Niêm Phong #${newOrder.sealId}`, 'success');

        const trackingTabBtn = document.getElementById('navTrackingTab');
        if (trackingTabBtn) trackingTabBtn.click();
      });
    }
  }

  window.ValigoBooking = {
    init: initBookingModule,
    updatePriceSummary: updatePriceSummary,
    formatVnd: formatVnd
  };

})(window);
