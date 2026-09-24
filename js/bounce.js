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
 * VALIGO VIỆT NAM - CONTROLLER GIAO NHẬN HÀNH LÝ
 * Quản lý tính giá tiền VNĐ/USD, bộ tìm kiếm lộ trình, popup đặt chỗ và FAQ.
 */

(function() {
  'use strict';

  let currentCurrency = 'VND'; // 'VND' hoặc 'USD'
  const VND_USD_RATE = 1 / 25400; // 1 USD ≈ 25.400 VNĐ
  let bagCount = 2;

  // Dữ liệu các tuyến giao nhận hành lý phổ biến tại Việt Nam
  const ROUTES_DATA = {
    'noibai-hanoi': {
      origin: 'Sân bay Nội Bài (HAN) T1 & T2',
      destination: 'Phố Cổ Hà Nội (Hoàn Kiếm / Tây Hồ)',
      basePriceVnd: 120000,
      duration: 'Hỏa tốc 2 - 3 giờ',
      bags: 1
    },
    'danang-hoian': {
      origin: 'Sân bay Đà Nẵng / Khách sạn Mỹ Khê',
      destination: 'Phố Cổ Hội An / Resort Cẩm An',
      basePriceVnd: 99000,
      duration: 'Giao trong 3 - 4 giờ',
      bags: 1
    },
    'tansonnhat-quan1': {
      origin: 'Sân bay Tân Sơn Nhất (SGN)',
      destination: 'Quận 1 / Thảo Điền TP. Hồ Chí Minh',
      basePriceVnd: 140000,
      duration: 'Hỏa tốc 2 giờ',
      bags: 1
    },
    'hanoi-danang': {
      origin: 'Khách sạn tại Hà Nội',
      destination: 'Khách sạn / Resort tại Đà Nẵng',
      basePriceVnd: 250000,
      duration: 'Giao qua đêm 24 giờ',
      bags: 2
    },
    'saigon-vungtau': {
      origin: 'TP. Hồ Chí Minh (Trung tâm)',
      destination: 'Resort / Khách sạn Bãi Sau Vũng Tàu',
      basePriceVnd: 180000,
      duration: 'Giao trong ngày (4-5h)',
      bags: 2
    },
    'phuquoc-airport': {
      origin: 'Sân bay Phú Quốc (PQC)',
      destination: 'Resort Bãi Trường / Grand World Phú Quốc',
      basePriceVnd: 150000,
      duration: 'Giao trong 2 giờ',
      bags: 1
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    initCurrencyToggle();
    initBagCounter();
    initUsecaseTabs();
    initFaqAccordion();
    initBookingWidget();
    initRouteButtons();
  });

  // Chuyển đổi tiền tệ VNĐ vs USD
  function initCurrencyToggle() {
    const currencyBtn = document.getElementById('currencyToggleBtn');
    if (!currencyBtn) return;

    currencyBtn.addEventListener('click', () => {
      currentCurrency = currentCurrency === 'VND' ? 'USD' : 'VND';
      currencyBtn.textContent = currentCurrency === 'VND' ? '🇻🇳 VNĐ (đ)' : '💵 USD ($)';
      updateAllPrices();
    });
  }

  function formatPrice(vndAmount) {
    if (currentCurrency === 'VND') {
      return `${vndAmount.toLocaleString('vi-VN')} đ`;
    } else {
      const usd = Math.round(vndAmount * VND_USD_RATE);
      return `$${usd}`;
    }
  }

  function updateAllPrices() {
    document.querySelectorAll('.dynamic-price').forEach(el => {
      const vnd = parseInt(el.dataset.vnd, 10);
      if (!isNaN(vnd)) {
        el.textContent = formatPrice(vnd);
      }
    });

    const heroSubtitle = document.getElementById('heroSubtitlePrice');
    if (heroSubtitle) {
      heroSubtitle.textContent = formatPrice(99000);
    }
  }

  function initBagCounter() {
    const bagSelect = document.getElementById('searchBagsSelect');
    if (bagSelect) {
      bagSelect.addEventListener('change', () => {
        bagCount = parseInt(bagSelect.value, 10);
      });
    }
  }

  // Chuyển đổi kịch bản du lịch Việt Nam
  function initUsecaseTabs() {
    const tabs = document.querySelectorAll('.usecase-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const usecase = tab.dataset.usecase;
        updateUsecaseContent(usecase);
      });
    });
  }

  function updateUsecaseContent(usecase) {
    const titleEl = document.getElementById('usecaseTitle');
    const descEl = document.getElementById('usecaseDesc');
    const route1El = document.getElementById('usecaseRoute1');
    const route2El = document.getElementById('usecaseRoute2');

    if (usecase === 'train') {
      if (titleEl) titleEl.textContent = 'Trải nghiệm tàu Thống Nhất & Đèo Hải Vân thảnh thơi';
      if (descEl) descEl.textContent = 'Bạn muốn đi chuyến tàu di sản qua đèo Hải Vân ngắm biển Lăng Cô xanh ngắt và nhâm nhi cà phê sữa đá. Việc vác vali cồng kềnh qua các bậc thang ga tàu không còn là nỗi lo. Gửi vali từ Hà Nội hoặc Đà Nẵng thẳng đến Hội An / Huế, bạn chỉ cần mang balo nhỏ dạo chơi!';
      if (route1El) route1El.textContent = 'Khách sạn Hà Nội → Khách sạn Đà Nẵng';
      if (route2El) route2El.textContent = 'Ga Đà Nẵng → Homestay Phố Cổ Hội An';
    } else if (usecase === 'resort') {
      if (titleEl) titleEl.textContent = 'Chuyển hành lý mượt mà giữa khách sạn phố & resort biển';
      if (descEl) descEl.textContent = 'Sau khi tham quan trung tâm Sài Gòn hoặc Đà Nẵng, bạn muốn chuyển xuống resort ven biển Hội An, Mũi Né hoặc Phú Quốc. VALIGO nhận hành lý lúc bạn check-out và giao sẵn trong phòng resort trước giờ nhận phòng.';
      if (route1El) route1El.textContent = 'Khách sạn Quận 1 → Resort Mũi Né';
      if (route2El) route2El.textContent = 'Khách sạn biển Mỹ Khê → Resort Hội An';
    } else if (usecase === 'dalat') {
      if (titleEl) titleEl.textContent = 'Du lịch Đà Lạt & Tây Nguyên không lo hành lý';
      if (descEl) descEl.textContent = 'Đà Lạt nhiều đồi dốc và bậc thang thang đá quanh co. Hãy để đội xe giao nhận VALIGO đưa hành lý và áo ấm đến thẳng homestay/khách sạn, giúp bạn tự do lái xe máy ngắm đồi thông và săn mây.';
      if (route1El) route1El.textContent = 'Sân bay Liên Khương → Khách sạn Đà Lạt';
      if (route2El) route2El.textContent = 'TP. Hồ Chí Minh → Homestay Đà Lạt';
    } else if (usecase === 'island') {
      if (titleEl) titleEl.textContent = 'Tour đảo Phú Quốc, Côn Đảo & vịnh Nha Trang';
      if (descEl) descEl.textContent = 'Đi tour cano tham quan 4 đảo hay lặn ngắm san hô? Gửi toàn bộ vali cồng kềnh từ sân bay về resort hoặc ngược lại ra quầy gửi hành lý sân bay, thỏa sức vui chơi cả ngày.';
      if (route1El) route1El.textContent = 'Sân bay Phú Quốc → Resort Bãi Trường';
      if (route2El) route2El.textContent = 'Sân bay Cam Ranh → Khách sạn Nha Trang';
    }
  }

  function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const q = item.querySelector('.faq-question');
      if (q) {
        q.addEventListener('click', () => {
          const isOpen = item.classList.contains('open');
          faqItems.forEach(i => i.classList.remove('open'));
          if (!isOpen) {
            item.classList.add('open');
          }
        });
      }
    });
  }

  function initBookingWidget() {
    const searchBtn = document.getElementById('mainSearchBtn');
    const modal = document.getElementById('bounceBookingModal');
    const closeModalBtn = document.getElementById('closeBounceModal');
    const confirmBookingBtn = document.getElementById('confirmBounceBooking');

    if (searchBtn && modal) {
      searchBtn.addEventListener('click', () => {
        const origin = document.getElementById('searchOriginInput').value || 'Sân bay Đà Nẵng (DAD)';
        const dest = document.getElementById('searchDestInput').value || 'Resort Phố Cổ Hội An';
        const date = document.getElementById('searchDateInput').value || 'Hôm nay';
        const bags = document.getElementById('searchBagsSelect').value || '2';

        openBookingModal({
          origin,
          destination: dest,
          date,
          bags: parseInt(bags, 10),
          priceVnd: 99000 * parseInt(bags, 10)
        });
      });
    }

    if (closeModalBtn && modal) {
      closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    if (confirmBookingBtn) {
      confirmBookingBtn.addEventListener('click', () => {
        const modalBody = document.getElementById('bounceModalBody');
        const modalFooter = document.getElementById('bounceModalFooter');
        
        modalBody.innerHTML = `
          <div style="text-align:center; padding:2rem 1rem;">
            <div style="font-size:3rem; margin-bottom:1rem;">🎉</div>
            <h3 style="font-size:1.4rem; font-weight:800; color:#0a0a1e; margin-bottom:0.5rem;">Đặt Dịch Vụ Thành Công!</h3>
            <p style="color:#6c6c85; font-size:0.95rem; margin-bottom:1.5rem;">
              Mã theo dõi hành lý của bạn là <strong style="color:#454ced; font-family:monospace; font-size:1.1rem;">VLG-VN-8892</strong>.
            </p>
            <div style="background:#f7f7fc; border-radius:12px; padding:1.25rem; text-align:left; font-size:0.88rem; margin-bottom:1.5rem;">
              <p style="margin-bottom:0.4rem;">📍 <strong>Giao nhận:</strong> Tài xế VALIGO tiếp nhận tại sảnh lễ tân hoặc sân bay kèm tem niêm phong số.</p>
              <p style="margin-bottom:0.4rem;">🚚 <strong>Bảo quản:</strong> Giao thẳng đến phòng khách sạn điểm đến trước giờ check-in.</p>
              <p>🛡️ <strong>Bảo hiểm:</strong> Gói bảo hiểm ValiShield tới 25.000.000 VNĐ đã kích hoạt.</p>
            </div>
            <button class="btn-bounce-primary" onclick="document.getElementById('bounceBookingModal').style.display='none'" style="width:100%; justify-content:center;">
              Xong / Quay lại trang
            </button>
          </div>
        `;
        if (modalFooter) modalFooter.style.display = 'none';
      });
    }
  }

  function initRouteButtons() {
    document.querySelectorAll('.btn-book-route').forEach(btn => {
      btn.addEventListener('click', () => {
        const routeKey = btn.dataset.route;
        const route = ROUTES_DATA[routeKey];
        if (route) {
          openBookingModal({
            origin: route.origin,
            destination: route.destination,
            date: 'Hôm nay / Sáng mai',
            bags: route.bags,
            priceVnd: route.basePriceVnd
          });
        }
      });
    });
  }

  function openBookingModal(data) {
    const modal = document.getElementById('bounceBookingModal');
    if (!modal) return;

    const originEl = document.getElementById('modalOriginText');
    const destEl = document.getElementById('modalDestText');
    const dateEl = document.getElementById('modalDateText');
    const bagsEl = document.getElementById('modalBagsText');
    const totalEl = document.getElementById('modalPriceTotal');

    if (originEl) originEl.textContent = data.origin;
    if (destEl) destEl.textContent = data.destination;
    if (dateEl) dateEl.textContent = data.date;
    if (bagsEl) bagsEl.textContent = `${data.bags} Kiện Hành Lý`;
    if (totalEl) totalEl.textContent = formatPrice(data.priceVnd);

    modal.style.display = 'flex';
  }

})();
