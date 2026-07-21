# HTML 产物：稳定底座，不固定视觉风格

HTML 适合承载连续讲解、按需展开、图表和理解检查。它应当是一个可以离线打开的自包含文件，但页面风格仍根据对象和读者决定，不套用统一视觉模板。

页面的信息结构沿用 [comprehension-structure.md](comprehension-structure.md)。本文件只规定选择 HTML 后的离线运行和嵌入边界。

最终 HTML 的语义骨架和运行时占位遵循 [Walkthrough HTML demo](templates/walkthrough-html.demo.md)。该 Demo 不规定视觉风格；本文件不维护第二份产物模板。

## Mermaid 与全屏底座

Skill 自带 Mermaid 11.15.0 和一个很小的 Walkthrough 运行时：

- `assets/mermaid.min.js`：MIT 许可的 Mermaid 浏览器包；
- `assets/walkthrough-runtime.js`：渲染 `.mermaid`，并为图自动加入全屏按钮；
- `assets/walkthrough-runtime.css`：只提供全屏和按钮所需的基础样式，可由页面覆盖；
- `scripts/embed_html_runtime.py`：把这些资源内联进 HTML。

保留 [Walkthrough HTML demo](templates/walkthrough-html.demo.md) 中 `</body>` 前的运行时占位，然后运行：

```bash
python3 scripts/embed_html_runtime.py walkthrough.html
```

脚本默认原地写回，也可以把第二个路径作为输出文件。页面中的 Mermaid 使用普通写法：

```html
<pre class="mermaid">
flowchart LR
  A[开始] --> B[结果]
</pre>
```

运行时会自动创建图容器和半透明的全屏图标按钮；按钮保留本地化的无障碍标签，支持键盘操作，浏览器原生 `Escape` 退出全屏。页面可以通过 CSS 变量调整功能样式，也可以在运行时加载前设置 `window.WALKTHROUGH_MERMAID_CONFIG` 覆盖 Mermaid 配置。

图用于减少理解成本。图太大时拆成相邻的几张图，不靠缩小字号维持“只有一张图”的形式完整。

## 自包含边界

最终文件不依赖 CDN、远程字体或网络脚本。图片若必须随文件移动，使用内联数据或同时交付的稳定本地路径，并明确说明不是单文件。

不设置强制自动检查。页面重要或交互复杂时，实际打开它，按当前任务风险检查 Mermaid 是否渲染、全屏是否可用、文字是否清楚、目录是否可导航，以及从头滚动到尾能否走完整条链路；简单页面不为流程完整而制造额外验证。
