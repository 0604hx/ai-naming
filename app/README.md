# uniapp + vite6 + vue3 + wot-design-uni 模板
> 基于[snail-uni](https://github.com/hu-snail/snail-uni)修改而来😄，完美适配黑暗模式（随系统切换）

## ⭐️ 特性

- 💡 使用 `Vue3` + `Vite6` 等最新技术栈构建
- 📦  采用 `pnpm` + `Monorepo` 模式构建
- ⚡️ 路由自动注册，无需手动配置路由，同时集成了`Uni Mini Router`路由插件系统
- 🛠️ 宇宙最强编辑器`Vscode`，告别HBuilderX
- 💻 支持`uni-app`、`vue3`、`pinia`、`uni mini router`自动导入
- 🍞 封装常用页面布局、工具函数
- 🧥 集成 `tailwind-css` 的精简版
- 🚤 依赖简单，学习门槛非常低

## 📷 运行预览

<table style="border: none;">
  <tr>
    <td style="border: none;"><img src="docs/imgs/home-light.webp" width="180" /></td>
    <td style="border: none;"><img src="docs/imgs/home-dark.webp" width="180" /></td>
    <td style="border: none;"><img src="docs/imgs/mine.webp" width="180" /></td>
    <td style="border: none;"><img src="docs/imgs/profile.webp" width="180" /></td>
  </tr>
</table>

## 开发说明

### tabBar
> 底部导航

使用 uni 自带的 tabBar 会出现闪烁情况（黑暗模式下），所以推荐使用自定义（使用 wot-design 的组件）

```json
// 如需使用自带，请在 pages,json 内添加以下信息
"tabBar": {
    "color": "@tabFontColor",
    "selectedColor": "@tabSelectedColor",
    "backgroundColor": "@tabBgColor",
    "borderStyle": "@tabBorderStyle",
    "height": "50px",
    "fontSize": "12px",
    "iconWidth": "24px",
    "spacing": "3px",
    "list": [
        {
            "iconPath": "@iconPath01",
            "selectedIconPath": "@selectedIconPath01",
            "pagePath": "pages/index/index",
            "text": "首页"
        },
        {
            "iconPath": "@iconPath02",
            "selectedIconPath": "@selectedIconPath02",
            "pagePath": "pages/my/index",
            "text": "我的"
        }
    ]
}
```
