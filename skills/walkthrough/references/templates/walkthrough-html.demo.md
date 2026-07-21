# Walkthrough HTML 产物 Demo

这份文件是 `walkthrough/walkthrough.html` 的唯一结构来源。它规定离线、自包含和语义骨架，不规定视觉风格；正文结构仍按对象和读者的理解路径调整。

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><对象名称> Walkthrough</title>
  <style>
    /* 根据对象和读者设计页面；不依赖远程字体、CDN 或网络样式。 */
  </style>
</head>
<body>
  <main>
    <header>
      <h1><对象名称> Walkthrough</h1>
      <p><对象版本、Task revision、读者需要作出的判断和真相边界></p>
    </header>

    <section aria-labelledby="background">
      <h2 id="background">背景与核心关系</h2>
      <p><对象为什么存在、原来怎样工作，以及后文需要的局部概念></p>
    </section>

    <section aria-labelledby="main-path">
      <h2 id="main-path"><沿对象组织的连续主线></h2>
      <p><从入口或前提连续走到最终结果；按理解需要增加相邻 section></p>

      <!-- 只有关系或时序明显更清楚时使用 Mermaid。 -->
      <pre class="mermaid">
flowchart LR
  A[入口] --> B[关键关系] --> C[结果]
      </pre>
    </section>

    <section aria-labelledby="evidence">
      <h2 id="evidence">证据与理解边界</h2>
      <p><关键证据、未覆盖表面、开放决定和下一步></p>
    </section>

    <!-- 只有支撑高代价决定时增加理解检查。 -->
  </main>

  <!-- LONGREIN_WALKTHROUGH_RUNTIME -->
</body>
</html>
```

生成正文后运行 `python3 scripts/embed_html_runtime.py walkthrough.html` 内联 Mermaid 与全屏运行时。最终文件不得依赖 CDN、远程字体或网络脚本；外部图片或附件不能内联时，必须使用稳定本地路径并明确它不再是单文件交付。
