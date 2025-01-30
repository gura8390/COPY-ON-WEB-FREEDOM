// ==UserScript==
// @name        自动复制选中文本和解除复制限制
// @name:zh     自动复制选中文本和解除复制限制
// @name:en     Auto-Copy Selected Text and Remove Website Copy Restrictions
// @name:ja     自動選択テキストコピーとウェブコピー制限解除
// @name:es     Copiar texto seleccionado automáticamente y eliminar restricciones de copia en la web
// @namespace   http://tampermonkey.net/
// @version     3.1
// @description 在任意网站选中任意文本时自动复制,并提供设置选项以启用/禁用解除网站的复制限制和自动复制功能,以及显示/隐藏按钮
// @description:en Automatically copy selected text on any website and provide settings to enable/disable unlocking copy restrictions, auto-copy functionality, and show/hide button
// @description:ja 任意のウェブサイトで選択したテキストを自動的にコピーし、コピー制限を解除する設定を提供
// @description:es Copia automáticamente el texto seleccionado en cualquier sitio web y proporciona opciones para habilitar/deshabilitar la eliminación de restricciones de copia y la función de auto-copia
// @author      lbihhe
// @license     MIT
// @icon        https://img.icons8.com/nolan/64/password1.png
// @match       *://*/*
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_registerMenuCommand
// @grant       GM_xmlhttpRequest
// @run-at      document-end
// @downloadURL https://update.greasyfork.org/scripts/497808/%E8%87%AA%E5%8A%A8%E5%A4%8D%E5%88%B6%E9%80%89%E4%B8%AD%E6%96%87%E6%9C%AC%E5%92%8C%E8%A7%A3%E9%99%A4%E5%A4%8D%E5%88%B6%E9%99%90%E5%88%B6.user.js
// @updateURL https://update.greasyfork.org/scripts/497808/%E8%87%AA%E5%8A%A8%E5%A4%8D%E5%88%B6%E9%80%89%E4%B8%AD%E6%96%87%E6%9C%AC%E5%92%8C%E8%A7%A3%E9%99%A4%E5%A4%8D%E5%88%B6%E9%99%90%E5%88%B6.meta.js
// ==/UserScript==

(function() {
    'use strict';

    let path = "";
    const TEXT_PLAIN = "text/plain";
    const TEXT_HTML = "text/html";
    const COPY = "copy";

    // 定义处理doc88.com的对象
    const website_rule_doc88 = {
        regexp: /.*doc88\.com\/.+/,
        init: () => {
            const style = document.createElement('style');
            style.id = "copy-element-hide";
            style.innerHTML = "#left-menu{display: none !important;}";
            document.head.appendChild(style);

            GM_xmlhttpRequest({
                method: "GET",
                url: "https://res3.doc88.com/resources/js/modules/main-v2.min.js?v=2.56",
                onload: function(response) {
                    const result = /\("#cp_textarea"\).val\(([\S]*?)\);/.exec(response.responseText);
                    if (result) {
                        path = result[1];
                    }
                }
            });

            window.addEventListener("load", () => {
                const cpFn = unsafeWindow.copyText.toString();
                const fnResult = /<textarea[\s\S]*?>'\+([\S]*?)\+"<\/textarea>/.exec(cpFn);
                if (fnResult) {
                    path = fnResult[1];
                }
            });
        },
        getSelectedText: () => {
            let select = unsafeWindow;
            path.split(".")
                .forEach((v) => {
                    select = select[v];
                });
            if (!select) {
                unsafeWindow.Config.vip = 1;
                unsafeWindow.Config.logined = 1;
                document.getElementById("copy-element-hide").remove();
            }
            return select;
        }
    };

    // 判断当前页面是否为doc88.com
    if (website_rule_doc88.regexp.test(window.location.href)) {
        website_rule_doc88.init();
    }
// 先判定用户语言
var userLanguage = navigator.language || navigator.userLanguage;
var language = userLanguage.startsWith('zh') ? 'zh' : (userLanguage.startsWith('ja') ? 'ja' : (userLanguage.startsWith('es') ? 'es' : 'en'));

// 然后定义文本对象，根据已判定的语言来选择对应的文本
var text = {
    enableCopy: {
        'zh': '🔓解除复制限制并启用自动复制',
        'en': '🔓Enable Copy Restrictions and Auto Copy',
        'ja': '🔓コピー制限を解除し、自動コピーを有効化',
        'es': '🔓Habilitar restricciones de copia y auto-copia'
  }[language],
    disableCopy: {
        'zh': '🔒禁用复制功能及复制限制',
        'en': '🔒Disable Copy Restrictions and Auto Copy',
        'ja': '🔒コピー制限と自動コピーを無効にする',
        'es': '🔒Deshabilitar restricciones de copia y auto-copia'
  }[language],
    copyTextAlert: {
        'zh': '选中文本已复制到剪贴板',
        'en': 'Selected text copied to clipboard',
        'ja': '選択したテキストがクリップボードにコピーされました',
        'es': 'Texto seleccionado copiado al portapapeles'
  }[language] || '成功',
    copyHTMLAlert: {
        'zh': '选中的 HTML 已复制到剪贴板',
        'en': 'Selected HTML copied to clipboard',
        'ja': '選択したHTMLがクリップボードにコピーされました',
        'es': 'HTML seleccionado copiado al portapapeles'
    }[language],
    copyFailureAlert: {
        'zh': '复制失败',
        'en': 'Copy failed',
        'ja': 'コピー失敗',
        'es': 'Error al copiar'
    }[language],
    copyExceptionAlert: {
        'zh': '复制过程中出现异常: ',
        'en': 'Exception during copy: ',
        'ja': 'コピー中に例外が発生しました: ',
        'es': 'Excepción durante la copia: '
    }[language],
    invalidCopyFormatAlert: {
        'zh': '无效的复制格式，保留当前设置。',
        'en': 'Invalid copy format, retaining current settings.',
        'ja': '無効なコピー形式です。現在の設定を保持します。',
        'es': 'Formato de copia no válido, se mantienen los ajustes actuales.'
    }[language],
    copyFormatPrompt: {
        'zh': '请选择复制格式（text: 纯文本, html: HTML, link: 链接和文本）:',
        'en': 'Please select copy format (text: Plain text, html: HTML, link: Link and text):',
        'ja': 'コピー形式を選択してください（text: プレーンテキスト, html: HTML, link: リンクとテキスト）:',
        'es': 'Seleccione el formato de copia (text: Texto plano, html: HTML, link: Enlace y texto):'
    }[language]
};

// 输出选择的语言对应的文本
console.log(text.enableCopy); // 输出适合用户语言的文本

    // 读取存储的设置
    var copyState = {
        enabled: GM_getValue('enabled', false),
        showButton: GM_getValue('showButton', true),
        copyFormat: GM_getValue('copyFormat', 'text'),
        showAlert: GM_getValue('showAlert', true)
    };

    // 创建按钮
    var button = createButton();
    copyState.button = button;

    // 停止事件传播的处理函数
    function stopPropagation(e) {
        e.stopPropagation();
    }

    // 自动复制选中文本的处理函数
    function autoCopyHandler() {
        var selectedText;
        if (website_rule_doc88.regexp.test(window.location.href)) {
            selectedText = website_rule_doc88.getSelectedText();
        } else {
            selectedText = window.getSelection().toString().trim();
        }

        if (selectedText) {
            if (copyState.copyFormat === 'text') {
                copyTextToClipboard(selectedText);
            } else if (copyState.copyFormat === 'html') {
                copyHTMLToClipboard(selectedText);
            } else if (copyState.copyFormat === 'link') {
                var url = window.location.href;
                copyTextToClipboard(`${selectedText}\n${url}`);
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
                showAlert(text.copyTextAlert);
            } else {
                showAlert(text.copyFailureAlert);
            }
        } catch (err) {
            showAlert(text.copyExceptionAlert + err);
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
                showAlert(text.copyHTMLAlert);
            } else {
                showAlert(text.copyFailureAlert);
            }
        } catch (err) {
            showAlert(text.copyExceptionAlert + err);
        }
        document.body.removeChild(tempDiv);
    }

   // 显示提示信息
function showAlert(message) {
    if (copyState.showAlert) {
        var userLanguage = navigator.language || navigator.userLanguage;
        var language = userLanguage.startsWith('zh') ? 'zh' :
                       (userLanguage.startsWith('ja') ? 'ja' :
                       (userLanguage.startsWith('es') ? 'es' : 'en'));

        // 根据语言设置 message
        var alertMessage = '';
        switch(language) {
            case 'zh':
                alertMessage = '选中文本已复制到剪贴板';
                break;
            case 'en':
                alertMessage = 'Selected text copied to clipboard';
                break;
            case 'ja':
                alertMessage = '選択したテキストがクリップボードにコピーされました';
                break;
            case 'es':
                alertMessage = 'Texto seleccionado copiado al portapapeles';
                break;
            default:
                alertMessage = 'Selected text copied to clipboard'; // 默认英文
                break;
        }

        var alertBox = document.createElement('div');
        alertBox.innerText = alertMessage; // 使用上面设置的 alertMessage
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
        var styles = document.getElementsByTagName('style');
        for (var i = 0; i < styles.length; i++) {
            if (styles[i].innerHTML.includes('-webkit-user-select: auto !important')) {
                styles[i].parentNode.removeChild(styles[i]);
            }
        }

        // 移除鼠标抬起事件监听器
        document.removeEventListener('mouseup', autoCopyHandler, true);
    }

    // 创建按钮的函数
    function createButton() {
        var button = document.createElement('button');
        button.innerHTML = text.enableCopy;
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
        button.addEventListener('click', function() {
            toggleCopyState();
        });
        if (copyState.showButton) {
            document.body.appendChild(button);
        }
        return button;
    }

    // 切换复制状态的函数
    function toggleCopyState() {
        if (copyState.enabled) {
            disableCopy();
            copyState.button.innerHTML = text.enableCopy;
        } else {
            enableCopy();
            copyState.button.innerHTML = text.disableCopy;
        }
        copyState.enabled = !copyState.enabled;
        GM_setValue('enabled', copyState.enabled);
    }

    // 设置自动复制功能开关
    GM_registerMenuCommand(text.enableCopy, function() {
        toggleCopyState();
    });

   // 设置按钮显示开关
GM_registerMenuCommand({
    zh: '设置显示解除复制限制按钮',
    en: 'Toggle Show Copy Restrictions Button',
    ja: 'コピー制限ボタンの表示を切り替え',
    es: 'Alternar botón de restricciones de copia'
}[language], function() {
    copyState.showButton = !copyState.showButton;
    GM_setValue('showButton', copyState.showButton);
    if (copyState.showButton) {
        document.body.appendChild(button);
    } else {
        if (button.parentNode) {
            button.parentNode.removeChild(button);
        }
    }
});

// 设置复制格式
GM_registerMenuCommand({
    zh: '设置复制格式',
    en: 'Set Copy Format',
    ja: 'コピー形式を設定',
    es: 'Establecer formato de copia'
}[language], function() {
    var copyFormatOptions = ['text', 'html', 'link'];
    var copyFormat = prompt(text.copyFormatPrompt, copyState.copyFormat);

    if (copyFormatOptions.includes(copyFormat)) {
        copyState.copyFormat = copyFormat;
        GM_setValue('copyFormat', copyState.copyFormat);
    } else {
        alert(text.invalidCopyFormatAlert);
    }
});

console.log(text.copyTextAlert);


    // 初始状态禁用自动复制功能
    disableCopy();
})();
