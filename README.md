# 自动复制选中文本并解除网页复制限制  
Auto Copy Selected Text and Remove Copy Restrictions

[中文版](#中文版) | [English Version](#english-version)

## 中文版

### 简介
这是一个用户脚本，用于在任意网页上实现：

- 选中文本后**自动复制**到剪贴板（带短暂延迟避免误触）
- 解除大部分网站的**复制限制**（禁止选中、禁止右键复制、禁止复制等）
- 右下角提供一个**可拖动的小面板**，可一键开关功能、切换复制格式
- 复制成功/失败会有气泡提示

安装后右下角会出现控制小面板，**可拖动**，位置会记住。  
也可以通过 Tampermonkey 菜单完全隐藏面板或关闭功能。

### 主要功能
- 选中文本后约 0.3 秒自动复制（可关闭）
- 强制解除常见的网页复制限制（user-select、oncopy、contextmenu 等）
- 支持三种复制格式（可切换）：
  - 纯文本（默认）
  - 文本 + 当前网页链接
  - HTML 片段（保留格式）
- 复制成功/失败显示跟随面板的提示气泡（1.6秒自动消失）
- 界面支持：简体中文、英文、日文、韩文（自动根据浏览器语言）
- 小面板支持拖拽、点击开关、琥珀色主题、毛玻璃风格
- Tampermonkey 菜单可快速切换：功能开关、面板显隐、格式循环

极个别使用了多层Shadow DOM + 复杂事件穿透的网站可能仍有限制。

### 安装方法
1. 安装 Tampermonkey 扩展  
   - Chrome / Edge：[Tampermonkey](https://www.tampermonkey.net/)  
   - Firefox：[Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/)

2. 点击下面链接直接安装最新版（v5.2）：
   https://update.greasyfork.org/scripts/497808/%E8%87%AA%E5%8A%A8%E5%A4%8D%E5%88%B6%E9%80%89%E4%B8%AD%E6%96%87%E6%9C%AC%E5%92%8C%E8%A7%A3%E9%99%A4%E5%A4%8D%E5%88%B6%E9%99%90%E5%88%B6.user.js

3. Greasy Fork 页面（可看历史版本、反馈）：  
   https://greasyfork.org/zh-CN/scripts/497808

### 使用说明
- 安装后右下角会出现一个小控制面板
- **点击面板** → 开/关整个功能
- **拖动面板** → 移动位置（自动保存）
- **右键 Tampermonkey 图标 → 用户脚本命令** 可快速：
  - 功能启用/停用
  - 面板显示/隐藏
  - 复制格式循环切换（TXT → URL → HTML）

### 最近更新（v5.2）
- 提示从固定位置 toast 改为跟随面板的 speech-bubble 气泡
- 完整重做界面：毛玻璃 + 琥珀金色调 + 点击涟漪 + 出现/状态动画
- 气泡显示成功（绿色调）/失败（红色调），1.6秒自动消失

---

## English Version

### Introduction
This userscript automatically copies selected text on any webpage and removes most copy restrictions.  
It provides a small draggable panel at the bottom-right corner for toggling features and changing copy formats.

### Main Features
- Auto copy selected text to clipboard (~0.3s delay)
- Bypass common copy protections (user-select, oncopy, contextmenu, etc.)
- Three copy formats (cycle via menu):
  - Plain text (default)
  - Text + current page URL
  - HTML fragment (preserves formatting)
- Success/failure feedback bubble (follows the panel, disappears after 1.6s)
- UI languages: Simplified Chinese, English, Japanese, Korean (auto-detect)
- Draggable frosted-glass panel with amber accent
- Tampermonkey menu to toggle: feature on/off, panel visibility, format

### Installation
1. Install Tampermonkey extension  
   - Chrome/Edge: https://www.tampermonkey.net/  
   - Firefox: https://addons.mozilla.org/firefox/addon/tampermonkey/

2. Install the script directly:  
   https://update.greasyfork.org/scripts/497808/%E8%87%AA%E5%8A%A8%E5%A4%8D%E5%88%B6%E9%80%89%E4%B8%AD%E6%96%87%E6%9C%AC%E5%92%8C%E8%A7%A3%E9%99%A4%E5%A4%8D%E5%88%B6%E9%99%90%E5%88%B6.user.js

3. Greasy Fork page:  
   https://greasyfork.org/en/scripts/497808

### Usage
- A small control panel appears at bottom-right after installation
- **Click the panel** → toggle feature on/off
- **Drag the panel** → move and remember position
- Via Tampermonkey menu → quick toggle:
  - Enable/disable script
  - Show/hide floating button
  - Cycle copy format (TXT → URL → HTML)

### Recent Update (v5.2)
- Replaced fixed toast with speech-bubble anchored above panel
- Full UI redesign: glassmorphism, amber-gold theme, ripple click, entrance animations
- Bubble shows green (success) or red (fail) state, auto-dismiss after 1.6s
