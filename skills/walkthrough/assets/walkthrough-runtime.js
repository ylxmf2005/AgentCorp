(() => {
  const diagrams = Array.from(document.querySelectorAll(".mermaid"));
  if (!diagrams.length || !window.mermaid) return;

  const language = (document.documentElement.lang || "zh").toLowerCase();
  const defaults = language.startsWith("en")
    ? { enter: "View fullscreen", exit: "Exit fullscreen" }
    : { enter: "全屏查看", exit: "退出全屏" };

  const prepareDiagram = (diagram) => {
    let container = diagram.closest(".walkthrough-diagram");
    if (!container) {
      container = document.createElement("figure");
      container.className = "walkthrough-diagram";
      diagram.parentNode.insertBefore(container, diagram);
      container.appendChild(diagram);
    }

    if (!container.querySelector(".walkthrough-diagram__fullscreen")) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "walkthrough-diagram__fullscreen";
      button.dataset.enterLabel = container.dataset.fullscreenLabel || defaults.enter;
      button.dataset.exitLabel = container.dataset.exitFullscreenLabel || defaults.exit;
      button.setAttribute("aria-label", button.dataset.enterLabel);
      button.setAttribute("aria-pressed", "false");
      button.title = button.dataset.enterLabel;
      const icon = document.createElement("span");
      icon.className = "walkthrough-diagram__fullscreen-icon";
      icon.setAttribute("aria-hidden", "true");
      button.appendChild(icon);
      if (!container.requestFullscreen) button.hidden = true;
      container.insertBefore(button, container.firstChild);
    }
    return container;
  };

  const containers = diagrams.map(prepareDiagram);

  document.addEventListener("click", async (event) => {
    const button = event.target.closest(".walkthrough-diagram__fullscreen");
    if (!button) return;
    const container = button.closest(".walkthrough-diagram");
    try {
      if (document.fullscreenElement === container) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch (error) {
      console.warn("Walkthrough fullscreen failed", error);
    }
  });

  document.addEventListener("fullscreenchange", () => {
    containers.forEach((container) => {
      const button = container.querySelector(".walkthrough-diagram__fullscreen");
      const active = document.fullscreenElement === container;
      const label = active ? button.dataset.exitLabel : button.dataset.enterLabel;
      button.setAttribute("aria-label", label);
      button.setAttribute("aria-pressed", String(active));
      button.title = label;
    });
  });

  const config = Object.assign(
    { startOnLoad: false, securityLevel: "strict", theme: "neutral" },
    window.WALKTHROUGH_MERMAID_CONFIG || {}
  );
  window.mermaid.initialize(config);
  window.mermaid.run({ nodes: diagrams });
})();
