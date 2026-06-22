# AuthVault 2FA - Ente Auth OTP 自动填充浏览器扩展

将你的 Ente Auth 2FA 验证码直接带入浏览器，智能识别登录页面并自动填充。

> 本项目是 [ente-auth-extension](https://github.com/aheimowitz/ente-auth-extension) 的修改 fork 版本，基于 AGPL-3.0 协议分发，与 Ente 官方无关。

## 功能特性

- **一键复制** — 从浏览器工具栏直接查看和复制 2FA 验证码
- **智能自动填充** — 自动检测网页上的 MFA 输入框并建议匹配的验证码
- **域名智能匹配** — 根据域名、issuer 和自定义映射推荐正确的验证码
- **自动提交** — 填充后可选自动提交表单
- **创建和管理** — 手动添加或扫描页面二维码创建新验证码，支持编辑和删除
- **标签管理** — 创建、重命名、删除标签，按标签筛选
- **置顶常用** — 将高频使用的验证码固定在顶部
- **多种排序** — 按名称、最近使用、使用次数排序（使用统计跨设备同步）
- **自定义域名映射** — 支持导入/导出 JSON 格式
- **同步** — 与 Ente Auth 账户实时同步
- **Passkey 支持** — 通过 Ente Accounts 进行 WebAuthn 验证
- **自建服务器** — 支持配置自托管 Ente 实例
- **跨浏览器** — 支持 Chrome、Edge、Firefox

## 安装方式

### 从 Edge 扩展商店安装

在 [Edge Add-ons 商店](https://microsoftedge.microsoft.com/addons/) 搜索 **AuthVault 2FA** 直接安装。

> Chrome 也可以安装 Edge 扩展：进入 `chrome://extensions`，开启"允许其他来源的扩展程序"。

### 从 Release 手动安装

1. 从 [Releases 页面](../../releases) 下载最新版本：
   - **Chrome / Edge**：`authvault-chrome-x.x.x.zip`
   - **Firefox**：`authvault-firefox-x.x.x.xpi`（推荐）或 `.zip`

2. 安装扩展：

   **Chrome / Edge：**
   1. 解压 zip 文件
   2. 打开 `chrome://extensions`（Chrome）或 `edge://extensions`（Edge）
   3. 开启右上角"开发者模式"
   4. 点击"加载已解压的扩展程序"
   5. 选择解压后的文件夹

   **Firefox：**
   1. 直接在 Firefox 中打开 `.xpi` 文件，会弹出安装提示
   2. 点击"添加"完成安装

### 从源码构建

```sh
git clone https://github.com/aotemj/ente-auth-extension.git
cd ente-auth-extension
npm install
npm run build        # 同时构建 Chrome 和 Firefox 版本
npm run build:chrome # 仅构建 Chrome/Edge 版本
```

构建产物在 `dist-chrome/` 和 `dist-firefox/` 目录，按上述手动安装步骤加载即可。

## 自动填充原理

1. 内容脚本检测页面上的 MFA/2FA 输入框
2. 根据当前网站域名匹配你的验证码
3. 弹出浮层展示匹配结果，点击即可填充并可选自动提交

支持自定义域名映射，解决自建服务、SSO 等场景下自动匹配不准的问题。

## 隐私说明

详见 [PRIVACY.md](PRIVACY.md)。简单来说：验证码仅在本地解密，不会发送到任何第三方服务器。

## 许可证

AGPL-3.0，基于 [Ente](https://github.com/ente-io/ente) 生态。

## 致谢

- [Ente](https://ente.io) — Ente Auth 应用和开源生态
- [aheimowitz](https://github.com/aheimowitz/ente-auth-extension) — 原始浏览器扩展
