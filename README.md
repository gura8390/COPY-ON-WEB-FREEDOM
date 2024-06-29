<div id="readme-content">
  <div id="en" style="display:none;">
    # Auto-Copy Selected Text and Remove Webpage Copy Restrictions
    =============================

    ## Introduction
    This code is a script for automatically copying selected text and removing copy restrictions on webpages. It aims to help users quickly copy selected text and enable or disable the removal of copy restrictions and auto-copy features as needed. The button is located at the bottom right corner of the webpage, and you need to refresh the page after installation. The button functionality can be turned off through the Tampermonkey plugin menu bar.

    ### Updates
    - Adjust copy format, button enablement status, and feature enablement status through the console menu bar.
    - Interface adapts to both Chinese and English, with more languages to be supported in future versions.

    ### Compatible Platforms
    Tested platforms include Yuque, QQ Docs, 360 Baidu Wenku, Docin, Tencent Docs, Douban, Wuyoukao, Xuexi.la, Pengbo Essays, SegmentFault, LeetCode, Zhihu, doc, 17k, CSDN, with no incompatible platforms found so far.

    ### Features
    - **Auto-copy selected text**: Automatically copies selected text to the clipboard when the user selects text.
    - **Remove copy restrictions**: Removes webpage copy restrictions, allowing free copying of selected text.
    - **Enable/disable auto-copy**: Enables or disables the auto-copy feature based on user needs.
    - **Auto-detect foreground color**: Automatically detects the foreground color and returns black or white based on brightness.

    ### Usage
    1. Install the GreaseMonkey plugin.
    2. Copy the code into the GreaseMonkey script editor.
    3. Save the script and reload the webpage.
    4. When text is selected on the webpage, the button automatically copies the selected text to the clipboard.

    ### Supported Browsers
    - Firefox
    - Edge
    - Chrome

    ### Download Links
    - **Firefox**: [GreaseMonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/)
    - **Official Website**: [TamperMonkey](https://www.tampermonkey.net/)
    - **Chrome**: [TamperMonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)

    ### Version Updates

    **Version 2.3**
    - **Button Style Optimization**: More harmonious color matching, added rounded corners and hover effects.
    - **Button Position Optimization**: Placed the button at the bottom right or bottom left corner of the page, with added icons.
    - **Prompt Information Optimization**: More user-friendly prompt messages and custom prompt box styles.
    - **Overall Layout Optimization**: Placed the button and prompt messages in a small floating panel.

    **Version 2.1**
    - **Fixed Auto-Copy Logic**: Fixed the issue where auto-copy would not work initially, ensuring the feature works after being enabled.
    - **Added More Copy Restriction Detection**: Added handling for document.oncopy, document.oncut, document.onpaste events.
    - **Added More Framework Support**: Support for object and embed tags.
    - **Added More Style Restriction Detection**: Added handling for pointer-events and -webkit-touch-callout styles.
    - **Custom Copy Behavior**: Allows users to choose the format of the copied text: plain text, HTML, link.
    - **Custom Prompt Messages**: Displays custom prompt messages on copy success or failure.
    - **Auto-Enable Feature**: The script can automatically enable or disable features based on user settings.
    - **Improved Configuration Options**: Manage more configuration options through the copyState.settings object.
    - **Detailed Documentation and Comments**: Added more comments to help other developers understand the script's workings and usage.

    Feedback and suggestions are welcome to further optimize the user experience.
  </div>
  <div id="zh" style="display:none;">
    # 自动复制选中文本并解除网页复制限制
    =============================

    ## 介绍
    本代码是一个自动复制选中文本和解除复制限制按钮的脚本，旨在帮助用户在网页中快速复制选中文本，并且可以根据需要启用或禁用解除复制限制和自动复制功能。按钮位于网页右下角，安装后需刷新页面。按钮功能可通过油猴插件菜单栏关闭。

    ### 更新内容
    - 通过控制台菜单栏调整复制格式、按钮启用状态和功能启用状态。
    - 界面适配中英文，更多语言将在后续版本中支持。

    ### 适用平台
    已测试平台包括语雀、QQ文档、360百度文库、道客巴巴、腾讯文档、豆丁网、无忧考网、学习啦、蓬勃范文、思否社区、力扣、知乎、doc、17k、CSDN，目前未发现不可用平台。

    ### 功能
    - **自动复制选中文本**：用户选中文本时，按钮自动复制到剪贴板。
    - **解除复制限制**：按钮解除网页的复制限制，允许自由复制选中文本。
    - **启用/禁用自动复制**：根据需求启用或禁用自动复制功能。
    - **自动检测前景色**：按钮自动检测前景色，根据亮度返回黑色或白色。

    ### 使用方法
    1. 安装 GreaseMonkey 插件。
    2. 将代码复制到 GreaseMonkey 的脚本编辑器中。
    3. 保存脚本并重新加载网页。
    4. 在网页中选中文本时，按钮自动复制选中文本到剪贴板。

    ### 支持的浏览器
    - Firefox
    - Edge
    - Chrome

    ### 下载地址
    - **Firefox**: [GreaseMonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/)
    - **官网**：[TamperMonkey](https://www.tampermonkey.net/)
    - **Chrome**: [TamperMonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)

    ### 版本更新

    **版本2.3**
    - **按钮样式优化**：使用更加协调的颜色搭配，增加圆角和悬停效果。
    - **按钮位置优化**：将按钮放置在页面右下角或左下角，并添加小图标。
    - **提示信息优化**：使用更加友好的提示信息和自定义提示框样式。
    - **整体布局优化**：将按钮和提示信息放置在一个小的浮动面板中。

    **版本2.1**
    - **修复自动复制逻辑**：修复初始状态下不会自动复制的问题，确保启用功能后能够自动复制。
    - **添加更多的复制限制检测**：增加对 document.oncopy、document.oncut、document.onpaste 等事件的处理。
    - **添加更多的框架支持**：支持 object 和 embed 标签的处理。
    - **添加更多的样式限制检测**：增加对 pointer-events 和 -webkit-touch-callout 样式的处理。
    - **自定义复制行为**：允许用户选择复制文本的格式：纯文本、HTML、链接。
    - **自定义提示信息**：在复制成功或失败时显示自定义的提示信息。
    - **自动启用功能**：根据用户设置，脚本可以自动启用或禁用功能。
    - **改进的配置选项**：通过 copyState.settings 对象管理更多配置选项。
    - **详细的文档和注释**：增加了更多注释，帮助其他开发者理解脚本的工作原理和使用方法。

    欢迎反馈和建议，以进一步优化用户体验。
  </div>
</div>

<script>
  document.addEventListener("DOMContentLoaded", function() {
    var userLang = navigator.language || navigator.userLanguage;
    if (userLang.startsWith('zh')) {
      document.getElementById('zh').style.display = 'block';
    } else {
      document.getElementById('en').style.display = 'block';
    }
  });
</script>
