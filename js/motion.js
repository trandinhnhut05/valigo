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
 * VALIGO - Motion & Animation Engine
 * Recreates the signature fluid animations of Japan Post Yu-Pack:
 * - Luxury Cinematic Page Preloader & Refresh Loading Screen
 * - Opening Hero zoom and mascot glide
 * - Scroll-triggered `.anm` animations (fadein, landing, zoomin, listin cascading)
 * - Physics-based cubic-bezier smooth anchor scrolling
 * - Mobile animated hamburger drawer
 */

(function(window) {
  'use strict';

  function initMotionEngine() {
    initPreloader();
    initScrollAnimations();
    initSmoothAnchors();
    initMobileDrawer();
    initHoverBadges();
  }

  // 0. Luxury Page Preloader & Refresh Loading Screen
  function initPreloader() {
    let preloader = document.getElementById('valigo-preloader');
    
    // Auto-inject if not present in markup
    if (!preloader) {
      preloader = document.createElement('div');
      preloader.id = 'valigo-preloader';
      preloader.className = 'valigo-preloader';
      preloader.setAttribute('aria-hidden', 'true');
      preloader.innerHTML = `
        <div class="preloader-backdrop"></div>
        <div class="preloader-content">
          <div class="dribbble-logo-stage">
            <div class="orbital-ring orbital-ring-outer"></div>
            <div class="orbital-ring orbital-ring-inner">
              <div class="orbital-satellite"></div>
            </div>
            <div class="preloader-logo-glow"></div>
            <div class="dribbble-logo-card" id="logoCardContainer">
              <div class="logo-layer logo-layer-base">
                <img src="assets/valigo-logo.png" alt="VALIGO Silhouette" class="preloader-logo-img">
              </div>
              <div class="logo-layer logo-layer-fill" id="logoLayerFill">
                <img src="assets/valigo-logo.png" alt="VALIGO Full Color" class="preloader-logo-img">
              </div>
              <div class="logo-laser-line" id="logoLaserLine"></div>
              <div class="preloader-logo-sheen" id="logoSheen"></div>
            </div>
          </div>
          <div class="preloader-brand-sub">Smart Baggage Mobility • Keep It Safe - Enjoy The Way</div>
          <div class="preloader-route-track">
            <div class="preloader-route-line"></div>
            <div class="preloader-van-marker" id="preloaderVanMarker">🚐</div>
            <div class="preloader-dest-marker">📍</div>
          </div>
          <div class="preloader-progress-box">
            <div class="preloader-progress-track">
              <div class="preloader-progress-bar" id="preloaderProgressBar"></div>
            </div>
            <div class="preloader-status-row">
              <span class="preloader-status-text" id="preloaderStatusText">Đang khởi tạo hệ thống...</span>
              <span class="preloader-percent" id="preloaderPercent">[ 000% ]</span>
            </div>
          </div>
          <div class="preloader-security-badge">
            <span class="preloader-pulse-dot"></span>
            <span>Mạng Lưới Sân Bay & Niêm Phong Số Bảo Mật ValiShield</span>
          </div>
        </div>
      `;
      if (document.body) {
        document.body.prepend(preloader);
      }
    }

    const progressBar = document.getElementById('preloaderProgressBar');
    const percentEl = document.getElementById('preloaderPercent');
    const statusTextEl = document.getElementById('preloaderStatusText');
    const vanMarker = document.getElementById('preloaderVanMarker');
    const logoSheen = document.getElementById('logoSheen');
    const logoCard = document.getElementById('logoCardContainer');
    const laserLine = document.getElementById('logoLaserLine');

    const statusSteps = [
      { at: 10, text: 'Đang kết nối hệ thống giao nhận VALIGO...' },
      { at: 35, text: 'Kết nối mạng lưới trạm sân bay & khách sạn...' },
      { at: 65, text: 'Kích hoạt tem niêm phong số & bảo hiểm ValiShield...' },
      { at: 88, text: 'Đồng bộ hóa lộ trình giao nhận rảnh tay...' },
      { at: 98, text: 'Sẵn sàng trải nghiệm du lịch nhẹ tênh!' }
    ];

    let currentProgress = 0;
    const targetDuration = 1250; // Smooth 1.25s duration for crisp Dribbble reveal
    const startTime = performance.now();

    function updateProgress(now) {
      const elapsed = now - startTime;
      const progressFraction = Math.min(elapsed / targetDuration, 1);
      
      // Ease-out cubic calculation
      const easeVal = 1 - Math.pow(1 - progressFraction, 3);
      currentProgress = Math.min(Math.round(easeVal * 100), 100);

      if (preloader) {
        preloader.style.setProperty('--load-progress', currentProgress + '%');
      }
      if (progressBar) progressBar.style.width = currentProgress + '%';
      if (percentEl) percentEl.textContent = `[ ${currentProgress.toString().padStart(3, '0')}% ]`;
      if (vanMarker) vanMarker.style.left = Math.min(currentProgress * 0.95, 92) + '%';

      // Update status text
      for (let i = statusSteps.length - 1; i >= 0; i--) {
        if (currentProgress >= statusSteps[i].at) {
          if (statusTextEl && statusTextEl.textContent !== statusSteps[i].text) {
            statusTextEl.textContent = statusSteps[i].text;
          }
          break;
        }
      }

      if (currentProgress >= 100) {
        if (logoSheen && !logoSheen.classList.contains('active')) logoSheen.classList.add('active');
        if (logoCard && !logoCard.classList.contains('pop-done')) logoCard.classList.add('pop-done');
        if (laserLine && !laserLine.classList.contains('hidden')) laserLine.classList.add('hidden');
      }

      if (progressFraction < 1) {
        requestAnimationFrame(updateProgress);
      } else {
        // Complete & dismiss
        setTimeout(() => {
          if (preloader) {
            preloader.classList.add('loaded');
          }
          // Fire opening hero animation right as preloader lifts
          initOpeningAnimation();
        }, 220);
      }
    }

    requestAnimationFrame(updateProgress);

    // Re-trigger preloader smoothly when reloading the page
    window.addEventListener('beforeunload', () => {
      if (preloader) {
        preloader.classList.remove('loaded');
        preloader.style.setProperty('--load-progress', '0%');
        if (progressBar) progressBar.style.width = '0%';
        if (percentEl) percentEl.textContent = '[ 000% ]';
        if (logoSheen) logoSheen.classList.remove('active');
        if (logoCard) logoCard.classList.remove('pop-done');
        if (laserLine) laserLine.classList.remove('hidden');
      }
    });
  }

  // Trigger loading animation on demand (e.g. from UI buttons or user actions)
  function triggerValigoLoader(callback) {
    const preloader = document.getElementById('valigo-preloader');
    if (!preloader) {
      initPreloader();
      return;
    }
    preloader.classList.remove('loaded');
    preloader.style.setProperty('--load-progress', '0%');
    const progressBar = document.getElementById('preloaderProgressBar');
    const percentEl = document.getElementById('preloaderPercent');
    const statusTextEl = document.getElementById('preloaderStatusText');
    const vanMarker = document.getElementById('preloaderVanMarker');
    const logoSheen = document.getElementById('logoSheen');
    const logoCard = document.getElementById('logoCardContainer');
    const laserLine = document.getElementById('logoLaserLine');

    if (progressBar) progressBar.style.width = '0%';
    if (percentEl) percentEl.textContent = '[ 000% ]';
    if (statusTextEl) statusTextEl.textContent = 'Đang đồng bộ hóa hệ thống...';
    if (vanMarker) vanMarker.style.left = '0%';
    if (logoSheen) logoSheen.classList.remove('active');
    if (logoCard) logoCard.classList.remove('pop-done');
    if (laserLine) laserLine.classList.remove('hidden');

    let currentProgress = 0;
    const targetDuration = 1250;
    const startTime = performance.now();

    function updateProgress(now) {
      const elapsed = now - startTime;
      const progressFraction = Math.min(elapsed / targetDuration, 1);
      const easeVal = 1 - Math.pow(1 - progressFraction, 3);
      currentProgress = Math.min(Math.round(easeVal * 100), 100);

      preloader.style.setProperty('--load-progress', currentProgress + '%');
      if (progressBar) progressBar.style.width = currentProgress + '%';
      if (percentEl) percentEl.textContent = `[ ${currentProgress.toString().padStart(3, '0')}% ]`;
      if (vanMarker) vanMarker.style.left = Math.min(currentProgress * 0.95, 92) + '%';

      if (currentProgress >= 100) {
        if (logoSheen) logoSheen.classList.add('active');
        if (logoCard) logoCard.classList.add('pop-done');
        if (laserLine) laserLine.classList.add('hidden');
      }

      if (progressFraction < 1) {
        requestAnimationFrame(updateProgress);
      } else {
        setTimeout(() => {
          preloader.classList.add('loaded');
          initOpeningAnimation();
          if (typeof callback === 'function') callback();
        }, 220);
      }
    }

    requestAnimationFrame(updateProgress);
  }

  // 1. Opening animation for Hero Key Visual
  function initOpeningAnimation() {
    const heroVisual = document.querySelector('.bounce-hero-visual img, .kv_img img, .hero-banner-bg');
    const heroCard = document.querySelector('.bounce-search-card, .kv_sec');
    const heroTitle = document.querySelector('.bounce-hero-title, .hero-title');
    const heroPill = document.querySelector('.bounce-hero-tag, .hero-pill');
    const heroMascot = document.querySelector('.valigo-mascot-badge, .posukuma');

    // Initial scale-down animation
    if (heroVisual) {
      heroVisual.style.transition = 'transform 1.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      heroVisual.style.transform = 'scale(1.1)';
      setTimeout(() => {
        heroVisual.style.transform = 'scale(1)';
      }, 50);
    }

    if (heroPill) {
      heroPill.classList.add('anm-hero-ready');
    }

    if (heroTitle) {
      heroTitle.classList.add('anm-hero-ready');
    }

    if (heroMascot) {
      heroMascot.style.opacity = '0';
      heroMascot.style.transform = 'translateX(40px)';
      heroMascot.style.transition = 'all 1.3s cubic-bezier(0.23, 1, 0.32, 1)';
      setTimeout(() => {
        heroMascot.style.opacity = '1';
        heroMascot.style.transform = 'translateX(0)';
      }, 350);
    }

    if (heroCard) {
      heroCard.classList.add('anm-hero-ready');
    }
  }

  // 2. IntersectionObserver for scroll-driven animations
  function initScrollAnimations() {
    const animElements = document.querySelectorAll('.anm');
    if (!animElements.length) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('end');

          // Handle cascading list items (.listin > .anm_list)
          if (el.classList.contains('listin')) {
            const listItems = el.querySelectorAll('.anm_list');
            listItems.forEach((item, idx) => {
              setTimeout(() => {
                item.classList.add('end');
              }, 100 + idx * 120);
            });
          }
        }
      });
    }, observerOptions);

    animElements.forEach(el => observer.observe(el));
  }

  // 3. Smooth anchor scrolling with custom cubic-bezier easing
  function initSmoothAnchors() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#' || targetId.length < 2) return;

        const targetEl = document.querySelector(targetId);
        if (!targetEl) return;

        e.preventDefault();

        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Close mobile drawer if open
        const drawer = document.getElementById('gloval-nav');
        const navToggle = document.getElementById('nav-toggle');
        if (drawer && drawer.classList.contains('open_con')) {
          drawer.classList.remove('open_con');
          if (navToggle) navToggle.classList.remove('open');
        }
      });
    });
  }

  // 4. Mobile hamburger drawer menu
  function initMobileDrawer() {
    const navToggle = document.getElementById('nav-toggle');
    const drawer = document.getElementById('gloval-nav');

    if (navToggle && drawer) {
      navToggle.addEventListener('click', function() {
        this.classList.toggle('open');
        drawer.classList.toggle('open_con');
      });

      // Close when clicking outside
      document.addEventListener('click', function(e) {
        if (!drawer.contains(e.target) && !navToggle.contains(e.target)) {
          navToggle.classList.remove('open');
          drawer.classList.remove('open_con');
        }
      });
    }
  }

  // 5. Interactive anchor navigator buttons hover sync
  function initHoverBadges() {
    const anchorBtns = document.querySelectorAll('.anchor_btn');
    anchorBtns.forEach(btn => {
      const link = btn.querySelector('a');
      if (link) {
        link.addEventListener('mouseenter', () => {
          btn.classList.add('hovered');
        });
        link.addEventListener('mouseleave', () => {
          btn.classList.remove('hovered');
        });
      }
    });
  }

  // Expose globally
  window.ValigoMotion = {
    init: initMotionEngine,
    showLoader: triggerValigoLoader
  };

  // Expose convenient global helper
  window.triggerValigoLoader = triggerValigoLoader;

  document.addEventListener('DOMContentLoaded', initMotionEngine);

})(window);
