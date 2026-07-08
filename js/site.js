// site.js – 全ページ共通の処理（テーマ切替・モバイルナビ・乱数/コピーのヘルパー）
(function () {
  'use strict';

  function safeGetTheme() {
    try {
      return localStorage.getItem('theme');
    } catch (e) {
      return null;
    }
  }

  function safeSetTheme(theme) {
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      /* プライベートブラウジング等では保存不可 */
    }
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
      toggle.setAttribute('aria-label', theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え');
    }
  }

  function initTheme() {
    // <head> のインラインスクリプトが既に data-theme を設定済み。アイコンだけ同期する。
    applyTheme(currentTheme());
    var toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        safeSetTheme(next);
      });
    }
  }

  function initNav() {
    var navToggle = document.getElementById('nav-toggle');
    var header = document.querySelector('.top-nav');
    if (!navToggle || !header) return;
    navToggle.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // 0 以上 max 未満の整数を、剰余バイアスなしの暗号乱数で返す
  function secureRandomInt(max) {
    if (max <= 0) throw new Error('max must be positive');
    var limit = Math.floor(0x100000000 / max) * max; // 棄却サンプリングの上限
    var array = new Uint32Array(1);
    do {
      crypto.getRandomValues(array);
    } while (array[0] >= limit);
    return array[0] % max;
  }

  function secureRandomChar(pool) {
    return pool.charAt(secureRandomInt(pool.length));
  }

  // Fisher–Yates シャッフル（暗号乱数使用）
  function secureShuffle(items) {
    for (var i = items.length - 1; i > 0; i--) {
      var j = secureRandomInt(i + 1);
      var tmp = items[i];
      items[i] = items[j];
      items[j] = tmp;
    }
    return items;
  }

  // クリップボードへコピー（http 環境等では execCommand にフォールバック）
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy') ? resolve() : reject(new Error('execCommand failed'));
      } catch (e) {
        reject(e);
      } finally {
        document.body.removeChild(textarea);
      }
    });
  }

  // コピー用ボタンの共通挙動（成功表示 → 元のラベルに戻す）
  function bindCopyButton(button, getText) {
    button.addEventListener('click', function () {
      copyText(getText()).then(
        function () {
          var original = button.dataset.label || button.textContent;
          button.dataset.label = original;
          button.textContent = 'コピーしました！';
          setTimeout(function () {
            button.textContent = button.dataset.label;
          }, 1500);
        },
        function (err) {
          console.error('Copy failed', err);
        }
      );
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initNav();
  });

  window.SiteUtils = {
    secureRandomInt: secureRandomInt,
    secureRandomChar: secureRandomChar,
    secureShuffle: secureShuffle,
    copyText: copyText,
    bindCopyButton: bindCopyButton
  };
})();
