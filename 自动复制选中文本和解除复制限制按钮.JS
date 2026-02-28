// ==UserScript==
// @name         自动复制选中文本和解除复制限制
// @name:zh-CN  自动复制选中文本和解除复制限制
// @name:zh-TW  自動複製選中文本和解除複製限制
// @name:en     Auto Copy Selected Text and Remove Copy Restrictions
// @name:ja     選択したテキストを自動コピーし、コピー制限を解除
// @name:ko     선택한 텍스트 자동 복사 및 복사 제한 해제
// @description  在任意网站选中任意文本时自动复制, 并提供设置选项以启用/禁用解除网站的复制限制和自动复制功能, 以及显示/隐藏按钮
// @description:zh-CN  在任意网站选中任意文本时自动复制, 并提供设置选项以启用/禁用解除网站的复制限制和自动复制功能, 以及显示/隐藏按钮
// @description:zh-TW  在任何網站選中任意文本時自動複製, 並提供設置選項以啟用/禁用解除網站的複製限制和自動複製功能, 以及顯示/隱藏按鈕
// @description:en     Automatically copy selected text on any website and provide options to enable/disable removal of copy restrictions and auto copy functionality, as well as show/hide button
// @description:ja     任意のウェブサイトで選択したテキストを自動的にコピーし、コピー制限の解除と自動コピー機能の有効/無効、表示/非表示ボタンの設定オプションを提供します
// @description:ko     모든 웹사이트에서 선택한 텍스트를 자동 복사하며, 웹사이트의 복사 제한 해제 및 자동 복사 기능 활성화/비활성화, 버튼 표시/숨기기 설정 옵션을 제공합니다
// @author       lbihhe
// @license      MIT
// @icon         https://img.icons8.com/nolan/64/password1.png
// @version      5.2
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @run-at       document-start
// @namespace http://tampermonkey.net/
// @downloadURL https://update.greasyfork.org/scripts/497808/%E8%87%AA%E5%8A%A8%E5%A4%8D%E5%88%B6%E9%80%89%E4%B8%AD%E6%96%87%E6%9C%AC%E5%92%8C%E8%A7%A3%E9%99%A4%E5%A4%8D%E5%88%B6%E9%99%90%E5%88%B6.user.js
// @updateURL https://update.greasyfork.org/scripts/497808/%E8%87%AA%E5%8A%A8%E5%A4%8D%E5%88%B6%E9%80%89%E4%B8%AD%E6%96%87%E6%9C%AC%E5%92%8C%E8%A7%A3%E9%99%A4%E5%A4%8D%E5%88%B6%E9%99%90%E5%88%B6.meta.js
// ==/UserScript==

// Changelog:
// v5.2 - Replace fixed-position toast with a speech-bubble anchored above the panel
//        card; bubble travels with the draggable panel; shows green (ok) or red (fail)
//        state; auto-dismisses after 1.6 s; toastFail locale key added to all locales.
// v5.1 - Full UI redesign: white-glass panel, amber/gold accent system,
//        kinetic entrance / state-change animations, format badge, ripple on click,
//        draggable panel.

(function () {
    'use strict';

    // =====================
    // Config keys
    // =====================
    const CONFIG = {
        ENABLED:  'fusion_enabled',
        SHOW_BTN: 'fusion_show_btn',
        FORMAT:   'fusion_format',
        POS_X:    'fusion_pos_x',
        POS_Y:    'fusion_pos_y',
    };

    // =====================
    // Locale system
    // =====================
    const LOCALES = {
        zh: {
            on:          "已解鎖",
            off:         "已停用",
            subOn:       "自動複製 & 解除限制",
            subOff:      "點擊以啟用功能",
            toast:       "已複製到剪貼簿",
            toastFail:   "複製失敗",
            menuToggle:  "切換功能啟用/停用",
            menuBtn:     "切換按鈕顯示",
            menuFormat:  (f) => `切換複製格式（當前：${f}）`,
        },
        en: {
            on:          "Unlocked",
            off:         "Disabled",
            subOn:       "Auto-copy & restrictions lifted",
            subOff:      "Click to enable",
            toast:       "Copied to clipboard",
            toastFail:   "Copy failed",
            menuToggle:  "Toggle Enable/Disable",
            menuBtn:     "Toggle Button Visibility",
            menuFormat:  (f) => `Cycle Copy Format (current: ${f})`,
        },
        ja: {
            on:          "有効",
            off:         "無効",
            subOn:       "自動コピー & 制限解除",
            subOff:      "クリックして有効化",
            toast:       "クリップボードにコピー済み",
            toastFail:   "コピー失敗",
            menuToggle:  "有効/無効を切り替え",
            menuBtn:     "ボタン表示を切り替え",
            menuFormat:  (f) => `コピー形式を切り替え（現在：${f}）`,
        },
        ko: {
            on:          "활성화됨",
            off:         "비활성화됨",
            subOn:       "자동 복사 & 제한 해제",
            subOff:      "클릭하여 활성화",
            toast:       "클립보드에 복사됨",
            toastFail:   "복사 실패",
            menuToggle:  "기능 켜기/끄기",
            menuBtn:     "버튼 표시 토글",
            menuFormat:  (f) => `복사 형식 전환 (현재: ${f})`,
        },
    };

    function resolveLocale() {
        const lang = navigator.language || '';
        for (const key of Object.keys(LOCALES)) {
            if (lang.toLowerCase().startsWith(key)) return LOCALES[key];
        }
        return LOCALES.en;
    }
    const t = resolveLocale();

    // =====================
    // State
    // =====================
    let isEnabled  = GM_getValue(CONFIG.ENABLED,  true);
    let showBtn    = GM_getValue(CONFIG.SHOW_BTN, true);
    let copyFormat = GM_getValue(CONFIG.FORMAT,   'text');

    const FORMAT_CYCLE  = ['text', 'link', 'html'];
    const FORMAT_LABELS = { text: 'TXT', link: 'URL', html: 'HTML' };
    const FORMAT_ICONS  = { text: '¶', link: '⌁', html: '</>' };

    // =====================
    // Styles — dark-glass obsidian aesthetic with amber accents
    // =====================
    GM_addStyle(`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');

        /* ── Keyframes ── */
        @keyframes lf-enter {
            0%   { opacity: 0; transform: translateY(16px) scale(0.92); }
            60%  { transform: translateY(-3px) scale(1.01); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes lf-pulse-ring {
            0%   { box-shadow: 0 0 0 0 rgba(251,180,60,0.45); }
            70%  { box-shadow: 0 0 0 10px rgba(251,180,60,0); }
            100% { box-shadow: 0 0 0 0 rgba(251,180,60,0); }
        }
        @keyframes lf-shake {
            0%,100% { transform: translateX(0); }
            20%     { transform: translateX(-4px); }
            40%     { transform: translateX(4px); }
            60%     { transform: translateX(-3px); }
            80%     { transform: translateX(3px); }
        }
        @keyframes lf-ripple {
            0%   { transform: scale(0); opacity: 0.5; }
            100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes lf-toast-in {
            0%   { opacity: 0; transform: translateY(10px) scale(0.95); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes lf-toast-out {
            0%   { opacity: 1; transform: translateY(0) scale(1); }
            100% { opacity: 0; transform: translateY(-6px) scale(0.95); }
        }
        @keyframes lf-orb-idle {
            0%,100% { opacity: 0.7; transform: scale(1); }
            50%     { opacity: 1;   transform: scale(1.15); }
        }
        @keyframes lf-badge-flip {
            0%   { transform: rotateX(90deg); opacity: 0; }
            100% { transform: rotateX(0deg);  opacity: 1; }
        }

        /* ── Panel root ── */
        #lf-panel-root {
            all: initial !important;
            position: fixed !important;
            bottom: 28px !important;
            right: 28px !important;
            z-index: 2147483647 !important;
            cursor: pointer !important;
            font-family: 'DM Sans', system-ui, sans-serif !important;
            user-select: none !important;
            animation: lf-enter 0.55s cubic-bezier(0.34,1.56,0.64,1) both !important;
        }
        #lf-panel-root.lf-dragging {
            cursor: grabbing !important;
            transition: none !important;
        }

        /* ── Glass card ── */
        .lf-card {
            position: relative !important;
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            padding: 11px 16px 11px 14px !important;
            /* Clean white glass */
            background: linear-gradient(135deg,
                rgba(255,255,255,0.92) 0%,
                rgba(245,246,250,0.96) 100%) !important;
            backdrop-filter: blur(28px) saturate(160%) !important;
            -webkit-backdrop-filter: blur(28px) saturate(160%) !important;
            border-radius: 16px !important;
            border-top: 1px solid rgba(255,255,255,0.95) !important;
            border-left: 1px solid rgba(255,255,255,0.85) !important;
            border-right: 1px solid rgba(180,185,200,0.35) !important;
            border-bottom: 1px solid rgba(180,185,200,0.45) !important;
            box-shadow:
                0 2px 0 rgba(255,255,255,0.8) inset,
                0 24px 48px rgba(100,110,140,0.18),
                0 6px 16px rgba(100,110,140,0.12) !important;
            transition: box-shadow 0.3s ease, transform 0.2s ease !important;
            overflow: hidden !important;
            min-width: 180px !important;
        }
        .lf-card:hover {
            box-shadow:
                0 2px 0 rgba(255,255,255,0.9) inset,
                0 28px 56px rgba(100,110,140,0.24),
                0 8px 20px rgba(100,110,140,0.16) !important;
            transform: translateY(-1px) !important;
        }
        .lf-card:active {
            transform: translateY(1px) scale(0.99) !important;
        }

        /* enabled state: amber glow on border */
        .lf-card.lf-on {
            border-top-color: rgba(255,255,255,0.95) !important;
            border-left-color: rgba(251,180,60,0.30) !important;
            box-shadow:
                0 2px 0 rgba(255,255,255,0.8) inset,
                0 24px 48px rgba(100,110,140,0.18),
                0 6px 16px rgba(100,110,140,0.12),
                0 0 0 1px rgba(251,180,60,0.18) !important;
        }
        .lf-card.lf-on:hover {
            box-shadow:
                0 2px 0 rgba(255,255,255,0.9) inset,
                0 28px 56px rgba(100,110,140,0.24),
                0 8px 20px rgba(100,110,140,0.16),
                0 0 0 1px rgba(251,180,60,0.30) !important;
        }

        /* ── Status orb ── */
        .lf-orb-wrap {
            position: relative !important;
            width: 28px !important;
            height: 28px !important;
            flex-shrink: 0 !important;
        }
        .lf-orb {
            width: 28px !important;
            height: 28px !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 13px !important;
            line-height: 1 !important;
            transition: background 0.4s ease, box-shadow 0.4s ease !important;
        }
        .lf-orb.lf-on {
            background: radial-gradient(circle at 35% 35%,
                rgba(255,210,100,0.95),
                rgba(230,145,20,0.9)) !important;
            box-shadow:
                0 0 12px rgba(251,180,60,0.7),
                0 0 4px rgba(255,220,120,0.9) inset !important;
            animation: lf-orb-idle 2.8s ease-in-out infinite !important;
        }
        .lf-orb.lf-off {
            background: radial-gradient(circle at 35% 35%,
                rgba(80,80,90,0.9),
                rgba(40,40,48,0.95)) !important;
            box-shadow: 0 0 4px rgba(0,0,0,0.5) inset !important;
            animation: none !important;
        }
        /* pulse ring only when enabled */
        .lf-orb.lf-on::after {
            content: '' !important;
            position: absolute !important;
            inset: 0 !important;
            border-radius: 50% !important;
            animation: lf-pulse-ring 2.4s ease-out infinite !important;
        }

        /* ── Text block ── */
        .lf-text {
            display: flex !important;
            flex-direction: column !important;
            gap: 1px !important;
            flex: 1 !important;
            min-width: 0 !important;
        }
        .lf-label {
            font-size: 13px !important;
            font-weight: 600 !important;
            letter-spacing: 0.01em !important;
            white-space: nowrap !important;
            transition: color 0.3s ease !important;
        }
        .lf-on  .lf-label { color: #b8830a !important; }
        .lf-off .lf-label { color: rgba(90,95,115,0.9) !important; }

        .lf-sub {
            font-size: 10.5px !important;
            font-weight: 400 !important;
            color: rgba(130,135,155,0.85) !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            letter-spacing: 0.01em !important;
        }
        .lf-on .lf-sub { color: rgba(180,130,40,0.7) !important; }

        /* ── Format badge ── */
        .lf-badge {
            font-family: 'DM Mono', monospace !important;
            font-size: 9px !important;
            font-weight: 500 !important;
            letter-spacing: 0.06em !important;
            padding: 2px 6px !important;
            border-radius: 5px !important;
            flex-shrink: 0 !important;
            transition: all 0.25s ease !important;
            animation: lf-badge-flip 0.3s ease both !important;
        }
        .lf-on .lf-badge {
            background: rgba(251,180,60,0.12) !important;
            color: rgba(180,120,10,0.95) !important;
            border: 1px solid rgba(251,180,60,0.35) !important;
        }
        .lf-off .lf-badge {
            background: rgba(180,185,200,0.15) !important;
            color: rgba(120,125,145,0.85) !important;
            border: 1px solid rgba(180,185,200,0.35) !important;
        }

        /* ── Ripple ── */
        .lf-ripple {
            position: absolute !important;
            border-radius: 50% !important;
            width: 60px !important;
            height: 60px !important;
            background: rgba(251,180,60,0.3) !important;
            pointer-events: none !important;
            transform: scale(0) !important;
            animation: lf-ripple 0.55s ease-out forwards !important;
            margin-top: -30px !important;
            margin-left: -30px !important;
        }

        /* ── Shake animation class ── */
        .lf-shake { animation: lf-shake 0.35s ease !important; }

        /* ── Copy-feedback bubble (anchored above the panel card) ── */
        #lf-bubble {
            position: absolute !important;
            bottom: calc(100% + 10px) !important;
            right: 0 !important;
            display: flex !important;
            align-items: center !important;
            gap: 7px !important;
            padding: 7px 13px 7px 10px !important;
            border-radius: 10px !important;
            font-family: 'DM Sans', system-ui, sans-serif !important;
            font-size: 12px !important;
            font-weight: 500 !important;
            white-space: nowrap !important;
            pointer-events: none !important;
            /* tail pointing down-right */
            filter: drop-shadow(0 4px 12px rgba(100,110,140,0.18)) !important;
            opacity: 0 !important;
            transform: translateY(4px) scale(0.96) !important;
            transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.34,1.56,0.64,1) !important;
        }
        #lf-bubble.lf-bubble-ok {
            background: linear-gradient(135deg,
                rgba(255,255,255,0.97) 0%,
                rgba(245,246,250,0.99) 100%) !important;
            border: 1px solid rgba(251,180,60,0.35) !important;
            color: rgba(140,95,10,0.95) !important;
        }
        #lf-bubble.lf-bubble-fail {
            background: linear-gradient(135deg,
                rgba(255,255,255,0.97) 0%,
                rgba(250,245,245,0.99) 100%) !important;
            border: 1px solid rgba(220,80,80,0.30) !important;
            color: rgba(170,50,50,0.95) !important;
        }
        /* speech-bubble tail */
        #lf-bubble::after {
            content: '' !important;
            position: absolute !important;
            bottom: -6px !important;
            right: 18px !important;
            width: 10px !important;
            height: 6px !important;
            clip-path: polygon(0 0, 100% 0, 50% 100%) !important;
        }
        #lf-bubble.lf-bubble-ok::after {
            background: rgba(245,246,250,0.99) !important;
        }
        #lf-bubble.lf-bubble-fail::after {
            background: rgba(250,245,245,0.99) !important;
        }
        #lf-bubble.lf-bubble-visible {
            opacity: 1 !important;
            transform: translateY(0) scale(1) !important;
        }
        .lf-bubble-icon {
            width: 15px !important;
            height: 15px !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
            font-size: 9px !important;
            font-style: normal !important;
        }
        #lf-bubble.lf-bubble-ok   .lf-bubble-icon {
            background: rgba(251,180,60,0.15) !important;
            border: 1px solid rgba(251,180,60,0.35) !important;
            color: #c87d0a !important;
        }
        #lf-bubble.lf-bubble-fail .lf-bubble-icon {
            background: rgba(220,80,80,0.12) !important;
            border: 1px solid rgba(220,80,80,0.30) !important;
            color: #b03030 !important;
        }

        /* ── Unlock override ── */
        .lf-unlocked * {
            user-select: auto !important;
            -webkit-user-select: auto !important;
        }
    `);

    // =====================
    // Copy-feedback bubble (lives inside the panel card, floats above it)
    // =====================
    let bubbleEl = null;
    let bubbleHideTimer = null;

    function getBubble() {
        // The bubble lives inside #lf-panel-root so it moves with the draggable panel.
        if (!bubbleEl || !panel?.contains(bubbleEl)) {
            bubbleEl = document.createElement('div');
            bubbleEl.id = 'lf-bubble';
            // Insert as first child so it sits in the stacking context of the card wrapper
            // but is absolutely positioned above it via CSS.
            panel?.insertBefore(bubbleEl, panel.firstChild);
        }
        return bubbleEl;
    }

    /**
     * Show the feedback bubble above the panel card.
     * @param {'ok'|'fail'} kind
     * @param {string} [customText]
     */
    function showBubble(kind, customText) {
        if (!panel) return;
        const bubble = getBubble();
        const isOk = kind !== 'fail';
        const icon  = isOk ? '✓' : '✕';
        const text  = customText ?? (isOk ? t.toast : t.toastFail);

        bubble.className = `lf-bubble-${isOk ? 'ok' : 'fail'}`;
        bubble.innerHTML = `<i class="lf-bubble-icon">${icon}</i><span>${text}</span>`;

        clearTimeout(bubbleHideTimer);
        // Force reflow to restart the transition when called in quick succession.
        void bubble.offsetWidth;
        bubble.classList.add('lf-bubble-visible');

        bubbleHideTimer = setTimeout(() => {
            bubble.classList.remove('lf-bubble-visible');
        }, 1600);
    }

    // =====================
    // Clipboard
    // =====================
    async function execAutoCopy(content) {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            try {
                await navigator.clipboard.writeText(content);
                showBubble('ok');
                return;
            } catch (_) {}
        }
        try {
            const ta = document.createElement('textarea');
            ta.value = content;
            ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            showBubble(ok ? 'ok' : 'fail');
        } catch (_) {
            showBubble('fail');
        }
    }

    // =====================
    // Core restriction-removal
    // =====================
    const eventsToBlock = ['contextmenu', 'copy', 'selectstart', 'cut', 'dragstart'];
    const preventAction = (e) => { if (isEnabled) e.stopPropagation(); };
    let copyTimer = null;

    const mouseUpListener = (e) => {
        if (!isEnabled) return;
        if (panel && panel.contains(e.target)) return;
        clearTimeout(copyTimer);
        copyTimer = setTimeout(() => {
            const sel = (e.target?.ownerDocument || document).getSelection();
            if (!sel) return;
            const text = sel.toString().trim();
            if (!text) return;

            let finalStr = text;
            if (copyFormat === 'link') {
                finalStr = `${text}\n${location.href}`;
            } else if (copyFormat === 'html') {
                const frag = document.createDocumentFragment();
                for (let i = 0; i < sel.rangeCount; i++) frag.appendChild(sel.getRangeAt(i).cloneContents());
                const wrapper = document.createElement('div');
                wrapper.appendChild(frag);
                finalStr = wrapper.innerHTML;
            }
            execAutoCopy(finalStr);
        }, 300);
    };

    const updateFunctionalState = (active) => {
        const html = document.documentElement;
        if (active) {
            html.classList.add('lf-unlocked');
            eventsToBlock.forEach(ev => document.addEventListener(ev, preventAction, true));
            document.addEventListener('mouseup', mouseUpListener);
        } else {
            html.classList.remove('lf-unlocked');
            eventsToBlock.forEach(ev => document.removeEventListener(ev, preventAction, true));
            document.removeEventListener('mouseup', mouseUpListener);
        }
    };

    // =====================
    // Drag-to-reposition
    // =====================
    function makeDraggable(el) {
        let startX, startY, startRight, startBottom, dragged = false;

        const savedX = GM_getValue(CONFIG.POS_X, null);
        const savedY = GM_getValue(CONFIG.POS_Y, null);
        if (savedX !== null) { el.style.right = savedX + 'px'; el.style.bottom = savedY + 'px'; }

        el.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            startX = e.clientX; startY = e.clientY;
            const r = el.getBoundingClientRect();
            startRight  = window.innerWidth  - r.right;
            startBottom = window.innerHeight - r.bottom;
            dragged = false;

            const onMove = (ev) => {
                const dx = ev.clientX - startX;
                const dy = ev.clientY - startY;
                if (Math.abs(dx) + Math.abs(dy) > 3) {
                    dragged = true;
                    el.classList.add('lf-dragging');
                    el.style.right  = Math.max(0, startRight  - dx) + 'px';
                    el.style.bottom = Math.max(0, startBottom + dy) + 'px';
                }
            };
            const onUp = (ev) => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                el.classList.remove('lf-dragging');
                if (dragged) {
                    GM_setValue(CONFIG.POS_X, parseFloat(el.style.right));
                    GM_setValue(CONFIG.POS_Y, parseFloat(el.style.bottom));
                    ev.stopPropagation();
                }
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });

        // Prevent click from firing after a drag
        el.addEventListener('click', (e) => { if (dragged) { e.stopImmediatePropagation(); dragged = false; } }, true);
    }

    // =====================
    // Panel UI
    // =====================
    let panel = null;
    let panelMounted = false;

    const renderPanel = () => {
        if (!showBtn) {
            panel?.remove(); panel = null; panelMounted = false; return;
        }
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'lf-panel-root';

            panel.addEventListener('click', (e) => {
                e.preventDefault(); e.stopPropagation();

                // Spawn ripple at click position
                const rect = panel.querySelector('.lf-card')?.getBoundingClientRect();
                if (rect) {
                    const ripple = document.createElement('div');
                    ripple.className = 'lf-ripple';
                    ripple.style.left = (e.clientX - rect.left) + 'px';
                    ripple.style.top  = (e.clientY - rect.top)  + 'px';
                    panel.querySelector('.lf-card').appendChild(ripple);
                    setTimeout(() => ripple.remove(), 600);
                }

                isEnabled = !isEnabled;
                GM_setValue(CONFIG.ENABLED, isEnabled);
                updateFunctionalState(isEnabled);
                refreshPanelUI();

                // Brief shake on disable
                if (!isEnabled) {
                    const card = panel.querySelector('.lf-card');
                    card?.classList.add('lf-shake');
                    setTimeout(() => card?.classList.remove('lf-shake'), 400);
                }
            });

            makeDraggable(panel);
        }

        const root = document.body || document.documentElement;
        if (!panelMounted || !root.contains(panel)) {
            root.appendChild(panel);
            panelMounted = true;
        }
        refreshPanelUI();
    };

    const refreshPanelUI = () => {
        if (!panel) return;
        const stateClass = isEnabled ? 'lf-on' : 'lf-off';
        const icon = isEnabled ? '🔓' : '🔒';
        const badgeLabel = FORMAT_LABELS[copyFormat] || copyFormat.toUpperCase();

        panel.innerHTML = `
            <div class="lf-card ${stateClass}">
                <div class="lf-orb-wrap">
                    <div class="lf-orb ${stateClass}">${icon}</div>
                </div>
                <div class="lf-text">
                    <span class="lf-label">${isEnabled ? t.on : t.off}</span>
                    <span class="lf-sub">${isEnabled ? t.subOn : t.subOff}</span>
                </div>
                <div class="lf-badge">${badgeLabel}</div>
            </div>
        `;
    };

    // =====================
    // Tampermonkey menu
    // =====================
    GM_registerMenuCommand(t.menuToggle, () => {
        isEnabled = !isEnabled;
        GM_setValue(CONFIG.ENABLED, isEnabled);
        updateFunctionalState(isEnabled);
        refreshPanelUI();
    });

    GM_registerMenuCommand(t.menuBtn, () => {
        showBtn = !showBtn;
        GM_setValue(CONFIG.SHOW_BTN, showBtn);
        renderPanel();
    });

    GM_registerMenuCommand(t.menuFormat(copyFormat), () => {
        const idx = FORMAT_CYCLE.indexOf(copyFormat);
        copyFormat = FORMAT_CYCLE[(idx + 1) % FORMAT_CYCLE.length];
        GM_setValue(CONFIG.FORMAT, copyFormat);
        refreshPanelUI();
        showBubble('ok', `Format → ${FORMAT_LABELS[copyFormat]}`);
    });

    // =====================
    // Bootstrap
    // =====================
    updateFunctionalState(isEnabled);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderPanel);
    } else {
        renderPanel();
    }
})();
