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
    initOpeningAnimation();
    initScrollAnimations();
    initSmoothAnchors();
    initMobileDrawer();
    initHoverBadges();
  }

  // Preloader removed per user request: safe no-op helper
  function triggerValigoLoader(callback) {
    if (typeof callback === 'function') callback();
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
