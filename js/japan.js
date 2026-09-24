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
 * VALIGO JAPAN - CONTROLLER GIAO NHẬN HÀNH LÝ TUYẾN NHẬT BẢN
 * Quản lý tính giá tiền JPY / VNĐ / USD, mạng lưới Yamato Transport & Shinkansen,
 * bộ tìm kiếm lộ trình, kịch bản du lịch và popup đặt chỗ xác thực QR.
 */

(function() {
  'use strict';

  // Chế độ tiền tệ: 'JPY' (mặc định), 'VND', 'USD'
  let currentCurrency = 'JPY';
  const JPY_TO_VND = 170;     // 1 JPY ≈ 170 VNĐ
  const JPY_TO_USD = 1 / 150; // 150 JPY ≈ 1 USD
  let bagCount = 2;

  // Dữ liệu các tuyến vận chuyển hành lý trọng điểm tại Nhật Bản
  const JAPAN_ROUTES_DATA = {
    'tokyo-kyoto': {
      origin: 'Tokyo Station / Khách sạn Trung Tâm Tokyo',
      destination: 'Kyoto Station / Ryokan Phố Cổ Gion',
      basePriceJpy: 2090,
      duration: 'Giao trong ngày hoặc 24 giờ qua đêm',
      bags: 2,
      desc: 'Tuyến Shinkansen Tokaido - Thảnh thơi ngắm núi Phú Sĩ không lo vali kẹt lối đi'
    },
    'osaka-hiroshima': {
      origin: 'Osaka Station / Khách sạn Namba Dotonbori',
      destination: 'Hiroshima Station / Đảo thần Miyajima',
      basePriceJpy: 2949,
      duration: 'Giao trong 22 giờ',
      bags: 2,
      desc: 'Tuyến Sanyo Shinkansen - Tự do tham quan Công viên Hòa Bình và cổng Torii trên biển'
    },
    'sapporo-tokyo': {
      origin: 'Sân bay New Chitose (CTS) / Niseko Ski Resort',
      destination: 'Ga Tokyo / Khách sạn Shinjuku',
      basePriceJpy: 5886,
      duration: 'Giao trong 48 giờ',
      bags: 2,
      desc: 'Chuyên dụng vận chuyển vali lớn, đồ trượt tuyết Ski & Snowboard từ Hokkaido'
    },
    'haneda-shinjuku': {
      origin: 'Sân bay Haneda (HND) - Ga Quốc Tế T3',
      destination: 'Khách sạn Quận Shinjuku / Shibuya / Ginza',
      basePriceJpy: 2500,
      duration: 'Hỏa tốc trong 3 - 4 giờ',
      bags: 1,
      desc: 'Hạ cánh buổi sáng, gửi vali tại quầy và bắt đầu vui chơi ngay lập tức'
    },
    'kyoto-osaka': {
      origin: 'Ryokan Kyoto (Gion / Arashiyama)',
      destination: 'Khách sạn Osaka (Dotonbori / Umeda)',
      basePriceJpy: 2100,
      duration: 'Hỏa tốc trong 4 - 5 giờ',
      bags: 2,
      desc: 'Tuyến Kansai Express - Dành cả ngày ghé thăm Nara ngắm hươu rảnh tay'
    },
    'narita-tokyo': {
      origin: 'Sân bay Quốc tế Narita (NRT) T1 / T2',
      destination: 'Trung tâm Thủ đô Tokyo (Chiyoda / Minato / Shibuya)',
      basePriceJpy: 2800,
      duration: 'Giao trước giờ check-in khách sạn',
      bags: 1,
      desc: 'Đi tàu tốc hành Skyliner / Narita Express nhẹ tênh không cần bưng bê vali'
    }
  };

  // Kịch bản du lịch Nhật Bản
  const JAPAN_USECASES = {
    'railpass': {
      title: 'Hành trình Shinkansen & Vé JR Pass thảnh thơi',
      desc: 'Bạn sở hữu vé tàu JR Pass và muốn khám phá từ Tokyo đến Kyoto, Osaka và Hiroshima. Bưng bê vali cồng kềnh qua các cầu thang ga đông đúc và nhét vali vào khoang tàu hẹp là nỗi ám ảnh. Gửi vali từ khách sạn Tokyo đến thẳng khách sạn Osaka, bạn chỉ cần mang balo nhỏ ngắm núi Phú Sĩ và thưởng thức cơm hộp Ekiben trên tàu Shinkansen!',
      route1: 'Khách sạn Tokyo ➔ Khách sạn Osaka Dotonbori',
      route2: 'Ga Kyoto ➔ Ryokan truyền thống Hiroshima',
      highlight: '✓ Giao cùng ngày & qua đêm bảo đảm 100%'
    },
    'ryokan': {
      title: 'Chuyển hành lý mượt mà giữa Ryokan onsen & Khách sạn phố',
      desc: 'Trải nghiệm suối nước nóng Onsen tại Hakone hay phố cổ Gion Kyoto cần không gian tĩnh lặng, tinh tế. VALIGO kết nối mạng lưới Kuroneko Yamato nhận hành lý lúc bạn trả phòng và đưa sẵn vào phòng khách sạn hiện đại tại Tokyo hoặc Osaka trước khi bạn check-in.',
      route1: 'Onsen Ryokan Hakone ➔ Khách sạn Ginza Tokyo',
      route2: 'Machiya Cổ Kính Kyoto ➔ Căn hộ cao cấp Osaka',
      highlight: '✓ Nhân viên bản địa nói tiếng Nhật & hỗ trợ tiếng Việt'
    },
    'ski': {
      title: 'Du lịch trượt tuyết Hokkaido Niseko & Nagano',
      desc: 'Túi đựng ván trượt tuyết, gậy ski và quần áo mùa đông cực kỳ nặng nề. Dịch vụ vận chuyển chuyên biệt cho phép bạn gửi toàn bộ dụng cụ trượt tuyết thẳng từ sân bay Chitose về khu nghỉ dưỡng tuyết Niseko, Rusutsu hoặc Hakuba.',
      route1: 'Sân bay New Chitose (CTS) ➔ Resort tuyết Niseko',
      route2: 'Ga Tokyo ➔ Khu nghỉ dưỡng trượt tuyết Hakuba',
      highlight: '✓ Chấp nhận túi trượt tuyết quá khổ & đồ thể thao'
    },
    'island': {
      title: 'Khám phá Okinawa & Các hòn đảo phía Nam',
      desc: 'Du hí biển đảo nhiệt đới Okinawa, đảo Ishigaki hay vi vu quanh biển Seto rực nắng. Gửi toàn bộ vali cồng kềnh tại điểm đối tác quầy sân bay Naha, tự do thuê xe máy hoặc ô tô vi vu dọc bờ biển ngắm hoàng hôn.',
      route1: 'Sân bay Naha (OKA) ➔ Resort ven biển Onna Village',
      route2: 'Khách sạn Fukuoka ➔ Bến phà đảo Kyushu',
      highlight: '✓ Bảo hiểm bồi thường tới ¥1,000,000 (~170 triệu VNĐ)'
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    initCurrencyToggle();
    initBagCounter();
    initServiceToggles();
    initUsecaseTabs();
    initFaqAccordion();
    initBookingWidget();
    initRouteButtons();
  });

  // Chuyển đổi linh hoạt giữa 3 loại tiền tệ: JPY (¥) -> VNĐ (đ) -> USD ($)
  function initCurrencyToggle() {
    const currencyBtn = document.getElementById('currencyToggleBtn');
    if (!currencyBtn) return;

    currencyBtn.addEventListener('click', () => {
      if (currentCurrency === 'JPY') {
        currentCurrency = 'VND';
        currencyBtn.textContent = '🇻🇳 VNĐ (đ)';
      } else if (currentCurrency === 'VND') {
        currentCurrency = 'USD';
        currencyBtn.textContent = '💵 USD ($)';
      } else {
        currentCurrency = 'JPY';
        currencyBtn.textContent = '🇯🇵 JPY (¥)';
      }
      updateAllPrices();
    });
  }

  function formatPrice(jpyAmount) {
    if (currentCurrency === 'JPY') {
      return `¥${jpyAmount.toLocaleString('ja-JP')}`;
    } else if (currentCurrency === 'VND') {
      const vnd = Math.round(jpyAmount * JPY_TO_VND);
      return `${vnd.toLocaleString('vi-VN')} đ`;
    } else {
      const usd = Math.round(jpyAmount * JPY_TO_USD);
      return `$${usd}`;
    }
  }

  function updateAllPrices() {
    document.querySelectorAll('.dynamic-price').forEach(el => {
      const jpy = parseInt(el.dataset.jpy, 10);
      if (!isNaN(jpy)) {
        el.textContent = formatPrice(jpy);
      }
    });

    const heroSubtitle = document.getElementById('heroSubtitlePrice');
    if (heroSubtitle) {
      heroSubtitle.textContent = formatPrice(2090);
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

  // Toggle hình thức dịch vụ tại Nhật
  function initServiceToggles() {
    const serviceBtns = document.querySelectorAll('.service-toggle-btn');
    const originInput = document.getElementById('searchOriginInput');
    const destInput = document.getElementById('searchDestInput');

    serviceBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        serviceBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const mode = btn.dataset.serviceMode || btn.textContent.trim();
        if (mode.includes('Khách sạn') || mode.includes('Hotel')) {
          if (originInput) originInput.value = 'Ga Tokyo / Khách sạn Shinjuku';
          if (destInput) destInput.value = 'Ryokan Phố Cổ Gion Kyoto';
        } else if (mode.includes('Sân bay') || mode.includes('Airport')) {
          if (originInput) originInput.value = 'Sân bay Haneda (HND) - Ga T3';
          if (destInput) destInput.value = 'Khách sạn Trung Tâm Ginza / Shibuya';
        } else {
          if (originInput) originInput.value = 'Tủ Khóa Ga JR Kyoto';
          if (destInput) destInput.value = 'Ga Osaka Umeda (Station Hub)';
        }
      });
    });
  }

  // Chuyển đổi kịch bản du lịch Nhật Bản
  function initUsecaseTabs() {
    const tabs = document.querySelectorAll('.usecase-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const usecaseKey = tab.dataset.usecase;
        const data = JAPAN_USECASES[usecaseKey];
        if (!data) return;

        const titleEl = document.getElementById('usecaseTitle');
        const descEl = document.getElementById('usecaseDesc');
        const route1El = document.getElementById('usecaseRoute1');
        const route2El = document.getElementById('usecaseRoute2');

        if (titleEl) titleEl.textContent = data.title;
        if (descEl) descEl.textContent = data.desc;
        if (route1El) route1El.textContent = data.route1;
        if (route2El) route2El.textContent = data.route2;
      });
    });
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
        const origin = document.getElementById('searchOriginInput')?.value || 'Tokyo Station / Hotel';
        const dest = document.getElementById('searchDestInput')?.value || 'Kyoto Ryokan / Hotel';
        const date = document.getElementById('searchDateInput')?.value || 'Sáng mai';
        const bags = parseInt(document.getElementById('searchBagsSelect')?.value || '2', 10);

        openBookingModal({
          origin,
          destination: dest,
          date,
          bags,
          priceJpy: 2090 * bags
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
        
        if (modalBody) {
          modalBody.innerHTML = `
            <div style="text-align:center; padding:1.5rem 0.5rem;">
              <div style="font-size:3rem; margin-bottom:0.75rem;">🗾 🎉</div>
              <h3 style="font-size:1.35rem; font-weight:800; color:#0a0a1e; margin-bottom:0.5rem;">Đặt Tuyến Nhật Bản Thành Công!</h3>
              <p style="color:#6c6c85; font-size:0.92rem; margin-bottom:1.25rem;">
                Mã vận đơn đối tác Yamato Transport: <strong style="color:#454ced; font-family:monospace; font-size:1.15rem;">VLG-JP-7729</strong>
              </p>
              <div style="background:#f7f7fc; border-radius:12px; padding:1.2rem; text-align:left; font-size:0.86rem; margin-bottom:1.25rem; line-height:1.6;">
                <p style="margin-bottom:0.4rem;">🏨 <strong>Giao nhận tại sảnh:</strong> Xuất trình mã QR trên điện thoại cho lễ tân khách sạn hoặc quầy Yamato tại ga.</p>
                <p style="margin-bottom:0.4rem;">🚅 <strong>Vận chuyển Shinkansen:</strong> Hành lý được chuyển phát hỏa tốc an toàn tới khách sạn kế tiếp.</p>
                <p>🛡️ <strong>Bảo hiểm:</strong> Bảo hiểm hàng hóa Nhật Bản bồi hoàn tới ¥1,000,000 (~170.000.000 VNĐ) đã kích hoạt.</p>
              </div>
              <button class="btn-bounce-primary" onclick="document.getElementById('bounceBookingModal').style.display='none'" style="width:100%; justify-content:center;">
                Hoàn tất & Tiếp tục khám phá
              </button>
            </div>
          `;
        }
        if (modalFooter) modalFooter.style.display = 'none';
      });
    }
  }

  function initRouteButtons() {
    document.querySelectorAll('.btn-book-route').forEach(btn => {
      btn.addEventListener('click', () => {
        const routeKey = btn.dataset.route;
        const route = JAPAN_ROUTES_DATA[routeKey];
        if (route) {
          openBookingModal({
            origin: route.origin,
            destination: route.destination,
            date: 'Hôm nay / Sáng mai',
            bags: route.bags,
            priceJpy: route.basePriceJpy
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
    if (totalEl) totalEl.textContent = formatPrice(data.priceJpy);

    // Reset modal content if was previously completed
    const modalBody = document.getElementById('bounceModalBody');
    const modalFooter = document.getElementById('bounceModalFooter');
    if (modalFooter) modalFooter.style.display = 'flex';

    modal.style.display = 'flex';
  }

  // Phơi hàm global nếu cần gọi từ ngoài
  window.triggerJapanBooking = openBookingModal;

})();
