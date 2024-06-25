// ==UserScript==
// @name        自动复制选中文本和解除复制限制按钮
// @name:zh     自动复制选中文本和解除复制限制按钮
// @name:en     Automatic Copy Selected Text and Remove Copy Restrictions Button
// @namespace   http://tampermonkey.net/
// @version     2.3
// @description 在任意网站选中任意文本时自动复制，并添加一个按钮以启用/禁用解除网站的复制限制和自动复制功能
// @description:en Automatically copy selected text on any website and add a button to enable/disable unlocking copy restrictions and auto-copy functionality
// @author      lbihhe
// @license     MIT
// @match       *://*/*
// @grant       none
// @downloadURL https://update.greasyfork.org/scripts/497808/%E8%87%AA%E5%8A%A8%E5%A4%8D%E5%88%B6%E9%80%89%E4%B8%AD%E6%96%87%E6%9C%AC%E5%92%8C%E8%A7%A3%E9%99%A4%E5%A4%8D%E5%88%B6%E9%99%90%E5%88%B6%E6%8C%89%E9%92%AE.user.js
// @updateURL https://update.greasyfork.org/scripts/497808/%E8%87%AA%E5%8A%A8%E5%A4%8D%E5%88%B6%E9%80%89%E4%B8%AD%E6%96%87%E6%9C%AC%E5%92%8C%E8%A7%A3%E9%99%A4%E5%A4%8D%E5%88%B6%E9%99%90%E5%88%B6%E6%8C%89%E9%92%AE.meta.js
// ==/UserScript==

(function() {
    'use strict';

    // 定义一个对象来存储状态和按钮
    var copyState = {
        enabled: false,
        button: createButton(),
        settings: {
            copyFormat: 'text',// 复制格式: text, html, link
            showAlert: true,// 是否显示提示信息
            autoEnable: false// 是否自动启用脚本
        }
    };

    // 创建按钮
    function createButton() {
        var button = document.createElement('button');
        button.innerHTML = '解除复制限制并启用自动复制';
        button.style.position = 'fixed';
        button.style.bottom = '20px';
        button.style.right = '20px';
        button.style.zIndex = '9999';
        button.style.padding = '10px 15px';
        button.style.backgroundColor = 'rgba(173, 216, 230, 0.9)';
        button.style.color = '#000';
        button.style.border = 'none';
        button.style.borderRadius = '10px';
        button.style.cursor = 'pointer';
        button.style.fontFamily = '微软雅黑, Arial, sans-serif';
        button.style.fontSize = '14px';
        button.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        button.style.transition = 'background-color 0.3s, transform 0.3s';
        button.onmouseover = function() {
            button.style.backgroundColor = 'rgba(135, 206, 235, 0.9)';
            button.style.transform = 'scale(1.05)';
        };
        button.onmouseout = function() {
            button.style.backgroundColor = 'rgba(173, 216, 230, 0.9)';
            button.style.transform = 'scale(1)';
        };
        var icon = document.createElement('span');
        icon.innerHTML = '🔓';
        icon.style.marginRight = '8px';
        button.prepend(icon);
        document.body.appendChild(button);
        return button;
    }

    // 停止事件传播的处理函数
    function stopPropagation(e) {
        e.stopPropagation();
    }

    // 自动复制选中文本的处理函数
    function autoCopyHandler() {
        if (copyState.enabled) {
            var selectedText = window.getSelection().toString().trim();
            if (selectedText) {
                if (copyState.settings.copyFormat === 'text') {
                    copyTextToClipboard(selectedText);
                } else if (copyState.settings.copyFormat === 'html') {
                    copyHTMLToClipboard(selectedText);
                } else if (copyState.settings.copyFormat === 'link') {
                    var url = window.location.href;
                    copyTextToClipboard(`${selectedText}\n${url}`);
                }
            }
        }
    }

    // 将文本复制到剪贴板
    function copyTextToClipboard(text) {
        var tempTextarea = document.createElement('textarea');
        tempTextarea.style.position = 'fixed';
        tempTextarea.style.top = '0';
        tempTextarea.style.left = '0';
        tempTextarea.style.width = '2em';
        tempTextarea.style.height = '2em';
        tempTextarea.style.padding = '0';
        tempTextarea.style.border = 'none';
        tempTextarea.style.outline = 'none';
        tempTextarea.style.boxShadow = 'none';
        tempTextarea.style.background = 'transparent';
        tempTextarea.value = text;
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        try {
            var successful = document.execCommand('copy');
            if (successful) {
                showAlert('选中文本已复制到剪贴板');
            } else {
                showAlert('复制失败');
            }
        } catch (err) {
            showAlert('复制过程中出现异常: ' + err);
        }
        document.body.removeChild(tempTextarea);
    }

    // 将 HTML 复制到剪贴板
    function copyHTMLToClipboard(html) {
        var tempDiv = document.createElement('div');
        tempDiv.style.position = 'fixed';
        tempDiv.style.top = '0';
        tempDiv.style.left = '0';
        tempDiv.style.width = '2em';
        tempDiv.style.height = '2em';
        tempDiv.style.padding = '0';
        tempDiv.style.border = 'none';
        tempDiv.style.outline = 'none';
        tempDiv.style.boxShadow = 'none';
        tempDiv.style.background = 'transparent';
        tempDiv.innerHTML = html;
        document.body.appendChild(tempDiv);
        var range = document.createRange();
        range.selectNodeContents(tempDiv);
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        try {
            var successful = document.execCommand('copy');
            if (successful) {
                showAlert('选中的 HTML 已复制到剪贴板');
            } else {
                showAlert('复制 HTML 失败');
            }
        } catch (err) {
            showAlert('复制 HTML 过程中出现异常: ' + err);
        }
        document.body.removeChild(tempDiv);
    }

    // 显示提示信息
    function showAlert(message) {
        if (copyState.settings.showAlert) {
            var alertBox = document.createElement('div');
            alertBox.innerText = message;
            alertBox.style.position = 'fixed';
            alertBox.style.bottom = '70px';
            alertBox.style.right = '20px';
            alertBox.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            alertBox.style.color = '#fff';
            alertBox.style.padding = '10px 15px';
            alertBox.style.borderRadius = '10px';
            alertBox.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            alertBox.style.fontFamily = '微软雅黑, Arial, sans-serif';
            alertBox.style.fontSize = '14px';
            alertBox.style.zIndex = '9999';
            document.body.appendChild(alertBox);
            setTimeout(function() {
                document.body.removeChild(alertBox);
            }, 3000);
        }
    }

    // 解除复制限制的函数
    function enableCopy() {
        // 移除常见的禁止复制的事件监听器
        ['copy', 'cut', 'contextmenu', 'selectstart', 'mousedown', 'mouseup', 'keydown', 'keyup', 'keypress', 'oncopy', 'oncut', 'onpaste'].forEach(event => {
            document.addEventListener(event, stopPropagation, true);
        });

        // 解除 CSS 样式限制
        var css = `
            * {
                -webkit-user-select: auto !important;
                -moz-user-select: auto !important;
                -ms-user-select: auto !important;
                user-select: auto !important;
                pointer-events: auto !important;
                -webkit-touch-callout: default !important;
            }
        `;
        var style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);

        // 处理 body 标签的 oncontextmenu 属性
        if (document.body) {
            document.body.oncontextmenu = null;
        }

        // 处理常见的框架
        var frames = [...document.getElementsByTagName('iframe'), ...document.getElementsByTagName('object'), ...document.getElementsByTagName('embed')];
        frames.forEach(frame => {
            try {
                var frameDoc = frame.contentWindow.document;
                ['copy', 'cut', 'contextmenu', 'selectstart', 'mousedown', 'mouseup', 'keydown', 'keyup', 'keypress'].forEach(event => {
                    frameDoc.addEventListener(event, stopPropagation, true);
                });
            } catch (e) {
                console.error('无法访问框架内容:', e);
            }
        });

        // 添加鼠标抬起事件监听器
        document.addEventListener('mouseup', autoCopyHandler, true);
    }

    // 禁用复制功能的函数
    function disableCopy() {
        // 恢复默认事件
        ['copy', 'cut', 'contextmenu', 'selectstart', 'mousedown', 'mouseup', 'keydown', 'keyup', 'keypress', 'oncopy', 'oncut', 'onpaste'].forEach(event => {
            document.removeEventListener(event, stopPropagation, true);
        });

        // 移除 CSS 样式限制
        var style = document.querySelector('style');
        if (style) {
            document.head.removeChild(style);
        }

        // 恢复默认 body 标签的 oncontextmenu 属性
        if (document.body) {
            document.body.oncontextmenu = null;
        }

        // 移除鼠标抬起事件监听器
        document.removeEventListener('mouseup', autoCopyHandler, true);
    }

    // 按钮点击事件 - 启用/禁用解除复制限制和自动复制
    copyState.button.addEventListener('click', function() {
        if (copyState.enabled) {
            disableCopy();
            copyState.button.innerHTML = '解除复制限制并启用自动复制';
            copyState.button.querySelector('span').innerHTML = '🔓';
        } else {
            enableCopy();
            copyState.button.innerHTML = '禁用复制功能';
            copyState.button.querySelector('span').innerHTML = '🔒';
        }
        copyState.enabled = !copyState.enabled;
    });

    // 自动启用功能
    if (copyState.settings.autoEnable) {
        enableCopy();
        copyState.enabled = true;
        copyState.button.innerHTML = '禁用复制功能';
        copyState.button.querySelector('span').innerHTML = '🔒';
    }
})();
