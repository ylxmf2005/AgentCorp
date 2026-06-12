(function () {
  "use strict";

  const CLASSIFICATIONS = new Set([
    "core",
    "supporting",
    "mechanical",
    "suspect-refactor",
    "suspect-residue",
    "untraceable",
  ]);
  const ATTENTION_CLASSES = new Set(["suspect-refactor", "suspect-residue", "untraceable"]);
  const SIDES = ["old", "new"];
  const COMMENT_POLL_INTERVAL_MS = 3000;

  const state = {
    diff: null,
    comments: new Map(),
    commentWarnings: [],
    commentError: "",
    commentText: null,
    commentPollTimer: null,
    commentPollInFlight: false,
    banners: [],
    unitsByFile: new Map(),
    selectedFileId: null,
    attentionOnly: false,
    fileModes: new Map(),
    contentCache: new Map(),
    modeNotices: new Map(),
  };

  const elements = {
    summary: document.getElementById("summary"),
    banners: document.getElementById("banners"),
    fileCount: document.getElementById("file-count"),
    fileList: document.getElementById("file-list"),
    diffView: document.getElementById("diff-view"),
    showAll: document.getElementById("show-all"),
    showAttention: document.getElementById("show-attention"),
  };

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    elements.showAll.addEventListener("click", () => setFilter(false));
    elements.showAttention.addEventListener("click", () => setFilter(true));
    await loadData();
  }

  async function loadData() {
    let diff;
    try {
      diff = await fetchJson("/data/diff.json");
    } catch (error) {
      showFatal(`无法加载 diff.json：${error.message}`);
      return;
    }

    if (!diff || diff.schema_version !== 2 || !Array.isArray(diff.files)) {
      showFatal("diff.json schema_version 必须为 2，且 files 必须是数组。");
      return;
    }

    state.diff = diff;
    indexCoverageUnits(diff);

    try {
      applyCommentSnapshot(await fetchCommentSnapshot("/data/comments.jsonl"));
    } catch (error) {
      applyCommentError(`无法加载 comments.jsonl：${error.message}。全部覆盖单元按缺讲解处理。`);
    }

    chooseInitialFile();
    render();
    startCommentPolling();
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    try {
      return await response.json();
    } catch (error) {
      throw new Error(`JSON 解析失败：${error.message}`);
    }
  }

  async function fetchText(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.text();
  }

  async function fetchCommentSnapshot(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return parseComments(await response.text());
  }

  function parseComments(text) {
    const comments = new Map();
    const warnings = [];
    let invalidLines = 0;
    const rawText = String(text || "");

    rawText.split(/\r?\n/).forEach((line, index) => {
      const lineNumber = index + 1;
      if (line.trim() === "") {
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(line);
      } catch (error) {
        invalidLines += 1;
        warnings.push(`BAD_LINE ${lineNumber}: JSON 解析失败`);
        return;
      }

      const reason = validateComment(parsed);
      if (reason) {
        invalidLines += 1;
        warnings.push(`BAD_LINE ${lineNumber}: ${reason}`);
        return;
      }

      if (comments.has(parsed.id)) {
        warnings.push(`WARN duplicate comment for ${parsed.id}, last one wins`);
      }
      comments.set(parsed.id, parsed);
    });

    if (rawText.trim() !== "" && comments.size === 0 && invalidLines > 0) {
      throw new Error("comments.jsonl 无可解析评论");
    }

    return { comments, warnings, rawText };
  }

  function applyCommentSnapshot(snapshot) {
    state.comments = snapshot.comments;
    state.commentWarnings = snapshot.warnings;
    state.commentError = "";
    state.commentText = snapshot.rawText;
  }

  function applyCommentError(message) {
    state.comments = new Map();
    state.commentWarnings = [];
    state.commentError = message;
    state.commentText = null;
  }

  function startCommentPolling() {
    if (state.commentPollTimer) {
      window.clearInterval(state.commentPollTimer);
    }
    state.commentPollTimer = window.setInterval(refreshComments, COMMENT_POLL_INTERVAL_MS);
  }

  async function refreshComments() {
    if (state.commentPollInFlight) {
      return;
    }
    state.commentPollInFlight = true;
    try {
      const snapshot = await fetchCommentSnapshot("/data/comments.jsonl");
      if (snapshot.rawText !== state.commentText) {
        applyCommentSnapshot(snapshot);
        renderPreservingViewport();
      }
    } catch (error) {
      // Keep the last rendered comments during transient polling failures.
    } finally {
      state.commentPollInFlight = false;
    }
  }

  function validateComment(comment) {
    if (!comment || typeof comment !== "object" || Array.isArray(comment)) {
      return "评论必须是 JSON object";
    }
    if (typeof comment.id !== "string" || comment.id.trim() === "") {
      return "缺少 id";
    }
    if (typeof comment.file !== "string" || comment.file.trim() === "") {
      return "缺少 file";
    }
    if (!CLASSIFICATIONS.has(comment.classification)) {
      return "classification 不在枚举内";
    }
    if (typeof comment.why !== "string" || comment.why.trim() === "") {
      return "why 为空";
    }
    if (!Array.isArray(comment.trace)) {
      return "trace 必须是数组";
    }
    if ("code_refs" in comment) {
      return validateCodeRefs(comment.code_refs);
    }
    return "";
  }

  function validateCodeRefs(refs) {
    if (!Array.isArray(refs)) {
      return "code_refs 必须是数组";
    }
    for (const ref of refs) {
      if (!ref || typeof ref !== "object" || Array.isArray(ref)) {
        return "code_refs 条目必须是 JSON object";
      }
      if (typeof ref.path !== "string" || ref.path.trim() === "") {
        return "code_refs 缺少 path";
      }
      if (ref.side !== "old" && ref.side !== "new") {
        return "code_refs side 不在枚举内";
      }
      if (!Number.isInteger(ref.start_line) || !Number.isInteger(ref.end_line)) {
        return "code_refs 行号必须是整数";
      }
      if (ref.start_line < 1) {
        return "code_refs start_line 小于 1";
      }
      if (ref.end_line < ref.start_line) {
        return "code_refs end_line 小于 start_line";
      }
    }
    return "";
  }

  function indexCoverageUnits(diff) {
    state.unitsByFile = new Map();
    diff.files.forEach((file) => {
      const units = [];
      if (Array.isArray(file.hunks) && file.hunks.length > 0) {
        file.hunks.forEach((hunk) => {
          units.push({
            id: hunk.id,
            file,
            hunk,
            context: hunk.header || "",
          });
        });
      } else {
        units.push({
          id: file.id,
          file,
          hunk: null,
          context: file.status || "file",
        });
      }
      state.unitsByFile.set(file.id, units);
    });
  }

  function chooseInitialFile() {
    const files = visibleFiles();
    state.selectedFileId = files.length > 0 ? files[0].id : null;
  }

  function setFilter(attentionOnly) {
    state.attentionOnly = attentionOnly;
    ensureSelectedFileVisible();
    render();
  }

  function ensureSelectedFileVisible() {
    const files = visibleFiles();
    if (!files.some((file) => file.id === state.selectedFileId)) {
      state.selectedFileId = files.length > 0 ? files[0].id : null;
    }
  }

  async function setFileMode(file, mode) {
    if (mode === "compact") {
      state.fileModes.set(file.id, "compact");
      state.modeNotices.delete(file.id);
      render();
      return;
    }

    state.modeNotices.set(file.id, "正在加载完整内容。");
    render();
    const result = await ensureFullMode(file);
    if (!result.ok) {
      state.fileModes.set(file.id, "compact");
      state.modeNotices.set(file.id, result.message);
      render();
      return;
    }

    state.fileModes.set(file.id, "full");
    state.modeNotices.delete(file.id);
    render();
  }

  async function ensureFullMode(file) {
    const availability = fulltextAvailability(file);
    const omittedSide = SIDES.find((side) => availability[side] === "omitted");
    if (omittedSide) {
      return { ok: false, message: `双栏不可用：${omitReasonLabel(availability.omit_reason)}。` };
    }

    try {
      await Promise.all(SIDES.map((side) => loadContentSide(file, side)));
    } catch (error) {
      return { ok: false, message: `双栏不可用：${contentErrorLabel(error)}。` };
    }
    return { ok: true };
  }

  async function loadContentSide(file, side) {
    const availability = fulltextAvailability(file);
    const status = availability[side];
    const key = contentKey(file, side);
    if (state.contentCache.has(key)) {
      return state.contentCache.get(key);
    }
    if (status === "absent") {
      const value = { text: "", absent: true };
      state.contentCache.set(key, value);
      return value;
    }
    if (status !== "ok") {
      throw new Error(omitReasonLabel(availability.omit_reason));
    }

    let text;
    try {
      text = await fetchText(`/data/contents/${file.id}.${side}`);
    } catch (error) {
      throw new Error(error.message === "HTTP 404" ? "未生成" : error.message);
    }
    const value = { text, absent: false };
    state.contentCache.set(key, value);
    return value;
  }

  function render() {
    updateFilterButtons();
    renderBanners();
    renderSummary();
    renderFileList();
    renderSelectedFile();
  }

  function renderPreservingViewport() {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    render();
    window.requestAnimationFrame(() => {
      window.scrollTo(scrollX, scrollY);
    });
  }

  function updateFilterButtons() {
    elements.showAll.classList.toggle("active", !state.attentionOnly);
    elements.showAttention.classList.toggle("active", state.attentionOnly);
  }

  function renderBanners() {
    elements.banners.replaceChildren();
    state.banners.forEach((banner) => {
      const node = document.createElement("div");
      node.className = `banner ${banner.kind}`;
      node.textContent = banner.text;
      elements.banners.appendChild(node);
    });
    if (state.commentError) {
      const node = document.createElement("div");
      node.className = "banner error";
      node.textContent = state.commentError;
      elements.banners.appendChild(node);
    }
    if (state.commentWarnings.length > 0) {
      const node = document.createElement("div");
      node.className = "banner warning";
      node.textContent = `comments.jsonl 有 ${state.commentWarnings.length} 行被跳过或覆盖，页面只使用可解析的最后一条评论。`;
      elements.banners.appendChild(node);
    }
  }

  function renderSummary() {
    const files = state.diff.files.length;
    const units = allUnits();
    const missing = units.filter((unit) => !state.comments.has(unit.id)).length;
    const attention = units.filter(isAttentionUnit).length;
    elements.summary.textContent = `${files} files, ${units.length} coverage units, ${missing} missing, ${attention} attention`;
  }

  function renderFileList() {
    const files = visibleFiles();
    elements.fileCount.textContent = String(files.length);
    elements.fileList.replaceChildren();

    if (files.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "没有待关注项";
      elements.fileList.appendChild(empty);
      return;
    }

    files.forEach((file) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "file-item";
      if (file.id === state.selectedFileId) {
        button.classList.add("selected");
      }
      button.addEventListener("click", () => {
        state.selectedFileId = file.id;
        render();
      });

      const status = document.createElement("span");
      status.className = `file-status status-${file.status || "unknown"}`;
      status.textContent = statusLabel(file.status);

      const name = document.createElement("span");
      name.className = "file-name";
      name.textContent = displayPath(file);
      name.title = displayPath(file);

      button.append(status, name);
      if (file.is_binary) {
        const binary = document.createElement("span");
        binary.className = "binary-badge";
        binary.textContent = "binary";
        button.appendChild(binary);
      }

      const missingCount = missingUnitsForFile(file).length;
      if (missingCount > 0) {
        const badge = document.createElement("span");
        badge.className = "missing-badge";
        badge.textContent = String(missingCount);
        badge.title = "缺讲解";
        button.appendChild(badge);
      }

      elements.fileList.appendChild(button);
    });
  }

  function renderSelectedFile() {
    elements.diffView.replaceChildren();
    if (!state.selectedFileId) {
      const empty = document.createElement("div");
      empty.className = "diff-empty";
      empty.textContent = state.attentionOnly ? "没有待关注项" : "没有 diff 可展示";
      elements.diffView.appendChild(empty);
      return;
    }

    const file = state.diff.files.find((item) => item.id === state.selectedFileId);
    if (!file) {
      return;
    }

    elements.diffView.appendChild(renderFileHeader(file));

    const units = state.unitsByFile.get(file.id) || [];
    const visibleUnits = state.attentionOnly ? units.filter(isAttentionUnit) : units;
    if (visibleUnits.length === 0) {
      const empty = document.createElement("div");
      empty.className = "diff-empty";
      empty.textContent = "该文件没有待关注项";
      elements.diffView.appendChild(empty);
      return;
    }

    const mode = state.fileModes.get(file.id) || "compact";
    if (mode === "full") {
      renderFullFile(file, visibleUnits);
      return;
    }
    renderCompactFile(file, visibleUnits);
  }

  function renderFileHeader(file) {
    const header = document.createElement("div");
    header.className = "file-header";

    const row = document.createElement("div");
    row.className = "file-header-row";

    const title = document.createElement("div");
    title.className = "file-title";
    const status = document.createElement("span");
    status.className = `file-status status-${file.status || "unknown"}`;
    status.textContent = statusLabel(file.status);
    const path = document.createElement("span");
    path.textContent = displayPath(file);
    title.append(status, path);
    if (file.is_binary) {
      const binary = document.createElement("span");
      binary.className = "binary-badge";
      binary.textContent = "binary";
      title.appendChild(binary);
    }

    const mode = state.fileModes.get(file.id) || "compact";
    const switcher = document.createElement("div");
    switcher.className = "mode-switch";
    switcher.setAttribute("role", "group");
    switcher.setAttribute("aria-label", "View mode");
    const compact = modeButton("紧凑", mode === "compact");
    compact.addEventListener("click", () => setFileMode(file, "compact"));
    const full = modeButton("双栏", mode === "full");
    full.addEventListener("click", () => setFileMode(file, "full"));
    switcher.append(compact, full);

    row.append(title, switcher);
    header.appendChild(row);
    if (file.status === "renamed" && file.old_path && file.new_path) {
      const rename = document.createElement("div");
      rename.className = "rename-line";
      rename.textContent = `${file.old_path} renamed to ${file.new_path}`;
      header.appendChild(rename);
    }
    const notice = state.modeNotices.get(file.id);
    if (notice) {
      const node = document.createElement("div");
      node.className = "mode-notice";
      node.textContent = notice;
      header.appendChild(node);
    }
    return header;
  }

  function modeButton(text, active) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mode-button";
    button.classList.toggle("active", active);
    button.textContent = text;
    return button;
  }

  function renderCompactFile(file, visibleUnits) {
    if (!Array.isArray(file.hunks) || file.hunks.length === 0) {
      renderFileLevelUnit(file, visibleUnits[0]);
      return;
    }

    visibleUnits.forEach((unit) => {
      renderHunk(file, unit.hunk);
      renderCommentCard(unit);
    });
  }

  function renderFullFile(file, visibleUnits) {
    const wrapper = document.createElement("section");
    wrapper.className = "full-mode";

    const panes = document.createElement("div");
    panes.className = "full-panes";
    panes.append(renderFullPane(file, "old", visibleUnits), renderFullPane(file, "new", visibleUnits));
    wrapper.appendChild(panes);
    elements.diffView.appendChild(wrapper);

    const fileLevelUnits = visibleUnits.filter((unit) => !unit.hunk);
    if (fileLevelUnits.length > 0) {
      const comments = document.createElement("div");
      comments.className = "full-comments";
      fileLevelUnits.forEach((unit) => {
        comments.appendChild(buildCommentCard(unit));
      });
      elements.diffView.appendChild(comments);
    }
  }

  function renderFullPane(file, side, visibleUnits) {
    const pane = document.createElement("div");
    pane.className = `full-pane ${side}-pane`;

    const header = document.createElement("div");
    header.className = "full-pane-header";
    header.textContent = side === "old" ? "旧侧" : "新侧";
    pane.appendChild(header);

    const content = document.createElement("div");
    content.className = "full-content";
    const cached = state.contentCache.get(contentKey(file, side)) || { text: "" };
    const lines = splitContentLines(cached.text);
    const changed = changedLines(file, side);
    const anchors = fullModeAnchors(file, visibleUnits, side);

    if (fulltextAvailability(file)[side] === "absent") {
      const empty = document.createElement("div");
      empty.className = "full-empty";
      empty.textContent = "该侧不存在";
      content.appendChild(empty);
      appendFullAnchors(content, anchors, 0);
    } else if (lines.length === 0) {
      const empty = document.createElement("div");
      empty.className = "full-empty";
      empty.textContent = "空文件";
      content.appendChild(empty);
      appendFullAnchors(content, anchors, 0);
    } else {
      lines.forEach((line, index) => {
        const number = index + 1;
        const row = document.createElement("div");
        row.className = "full-line";
        if (changed.has(number)) {
          row.classList.add("full-changed");
        }
        row.dataset.fileId = file.id;
        row.dataset.side = side;
        row.dataset.line = String(number);

        const numberNode = document.createElement("span");
        numberNode.className = "full-line-number";
        numberNode.textContent = String(number);
        const code = document.createElement("span");
        code.className = "full-line-code";
        code.textContent = line;
        row.append(numberNode, code);
        content.appendChild(row);
        appendFullAnchors(content, anchors, number);
      });
    }

    pane.appendChild(content);
    return pane;
  }

  function appendFullAnchors(container, anchors, line) {
    const anchoredUnits = anchors.get(line) || [];
    anchoredUnits.forEach((unit) => {
      const anchor = document.createElement("div");
      anchor.className = "full-comment-anchor";
      anchor.appendChild(buildCommentCard(unit));
      container.appendChild(anchor);
    });
  }

  function fullModeAnchors(file, units, side) {
    const anchors = new Map();
    const lineCount = contentLineCount(file, side);
    units.forEach((unit) => {
      const anchor = anchorForUnit(file, unit);
      if (!anchor || anchor.side !== side) {
        return;
      }
      const line = lineCount > 0 ? Math.min(Math.max(anchor.line, 1), lineCount) : 0;
      if (!anchors.has(line)) {
        anchors.set(line, []);
      }
      anchors.get(line).push(unit);
    });
    return anchors;
  }

  function contentLineCount(file, side) {
    const cached = state.contentCache.get(contentKey(file, side));
    if (!cached || cached.absent) {
      return 0;
    }
    return splitContentLines(cached.text).length;
  }

  function anchorForUnit(file, unit) {
    if (!unit.hunk) {
      return null;
    }

    const preferredSide = file.status === "deleted" ? "old" : "new";
    const preferredLine = firstRenderedLine(unit.hunk, preferredSide);
    if (preferredLine !== null) {
      return { side: preferredSide, line: preferredLine };
    }

    const fallbackSide = preferredSide === "new" ? "old" : "new";
    const fallbackLine = firstRenderedLine(unit.hunk, fallbackSide);
    return fallbackLine === null ? null : { side: fallbackSide, line: fallbackLine };
  }

  function firstRenderedLine(hunk, side) {
    let oldLine = Number(hunk.old_start) || 0;
    let newLine = Number(hunk.new_start) || 0;
    for (const line of hunk.lines || []) {
      if (line.op === " ") {
        return side === "old" ? oldLine : newLine;
      }
      if (line.op === "+" && side === "new") {
        return newLine;
      }
      if (line.op === "-" && side === "old") {
        return oldLine;
      }
      if (line.op === "+") {
        newLine += 1;
      } else if (line.op === "-") {
        oldLine += 1;
      }
    }
    return null;
  }

  function renderFileLevelUnit(file, unit) {
    const panel = document.createElement("section");
    panel.className = "file-level-unit";
    const text = document.createElement("p");
    text.textContent = file.is_binary ? "Binary file change" : "File-level change without hunks";
    panel.appendChild(text);
    elements.diffView.appendChild(panel);
    renderCommentCard(unit);
  }

  function renderHunk(file, hunk) {
    const section = document.createElement("section");
    section.className = "hunk";

    const header = document.createElement("div");
    header.className = "hunk-header";
    header.textContent = `${displayPath(file)} ${hunk.header}`;
    section.appendChild(header);

    const table = document.createElement("table");
    table.className = "diff-table";
    const tbody = document.createElement("tbody");

    let oldLine = Number(hunk.old_start) || 0;
    let newLine = Number(hunk.new_start) || 0;

    (hunk.lines || []).forEach((line) => {
      const row = document.createElement("tr");
      row.className = `line line-${lineClass(line.op)}`;
      row.dataset.fileId = file.id;

      const oldNumber = document.createElement("td");
      oldNumber.className = "line-number old-number";
      const newNumber = document.createElement("td");
      newNumber.className = "line-number new-number";
      const code = document.createElement("td");
      code.className = "line-code";

      if (line.op === " ") {
        oldNumber.textContent = String(oldLine);
        newNumber.textContent = String(newLine);
        row.dataset.oldLine = String(oldLine);
        row.dataset.newLine = String(newLine);
        oldLine += 1;
        newLine += 1;
      } else if (line.op === "+") {
        newNumber.textContent = String(newLine);
        row.dataset.newLine = String(newLine);
        newLine += 1;
      } else if (line.op === "-") {
        oldNumber.textContent = String(oldLine);
        row.dataset.oldLine = String(oldLine);
        oldLine += 1;
      }

      const op = document.createElement("span");
      op.className = "line-op";
      op.textContent = line.op === "\\" ? "\\" : line.op;
      const content = document.createElement("span");
      content.textContent = line.text || "";
      code.append(op, content);

      row.append(oldNumber, newNumber, code);
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    section.appendChild(table);
    elements.diffView.appendChild(section);
  }

  function renderCommentCard(unit) {
    elements.diffView.appendChild(buildCommentCard(unit));
  }

  function buildCommentCard(unit) {
    const comment = state.comments.get(unit.id);
    const card = document.createElement("section");
    card.className = comment ? "comment-card" : "comment-card missing";

    const header = document.createElement("div");
    header.className = "comment-header";

    const id = document.createElement("span");
    id.className = "comment-id";
    id.textContent = unit.id;
    header.appendChild(id);

    if (comment) {
      const badge = document.createElement("span");
      badge.className = `class-badge class-${comment.classification}`;
      badge.textContent = comment.classification;
      header.appendChild(badge);
    } else {
      const badge = document.createElement("span");
      badge.className = "class-badge missing-badge-label";
      badge.textContent = "缺讲解";
      header.appendChild(badge);
    }
    card.appendChild(header);

    if (!comment) {
      const missing = document.createElement("p");
      missing.className = "missing-text";
      missing.textContent = `缺讲解：${displayPath(unit.file)} ${unit.context}`;
      card.appendChild(missing);
      return card;
    }

    const why = document.createElement("div");
    why.className = "comment-body";
    renderMarkdown(why, comment.why, comment, unit);
    card.appendChild(why);

    const refs = normalizedCodeRefs(comment);
    if (refs.length > 0) {
      card.appendChild(renderCodeRefs(refs, unit));
    }

    const trace = document.createElement("ul");
    trace.className = "trace-list";
    if (comment.trace.length === 0) {
      const item = document.createElement("li");
      item.textContent = "trace: []";
      trace.appendChild(item);
    } else {
      comment.trace.forEach((entry) => {
        const item = document.createElement("li");
        item.textContent = entry;
        trace.appendChild(item);
      });
    }
    card.appendChild(trace);
    return card;
  }

  function renderMarkdown(container, text, comment, unit) {
    const lines = String(text || "").split(/\r?\n/);
    let list = null;

    function flushList() {
      if (list) {
        container.appendChild(list);
        list = null;
      }
    }

    lines.forEach((line) => {
      const listMatch = line.match(/^\s*[-*]\s+(.+)$/);
      if (listMatch) {
        if (!list) {
          list = document.createElement("ul");
        }
        const item = document.createElement("li");
        appendInline(item, listMatch[1], comment, unit);
        list.appendChild(item);
        return;
      }

      flushList();
      if (line.trim() !== "") {
        const paragraph = document.createElement("p");
        appendInline(paragraph, line, comment, unit);
        container.appendChild(paragraph);
      }
    });
    flushList();
  }

  function appendInline(parent, text, comment, unit) {
    const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\[\[ref:(\d+)\]\])/g;
    let lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parent.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }
      const token = match[0];
      if (token.startsWith("`")) {
        const code = document.createElement("code");
        code.textContent = token.slice(1, -1);
        parent.appendChild(code);
      } else if (token.startsWith("**")) {
        const strong = document.createElement("strong");
        strong.textContent = token.slice(2, -2);
        parent.appendChild(strong);
      } else {
        const index = Number(match[2]);
        const refs = normalizedCodeRefs(comment);
        const ref = Number.isInteger(index) && index >= 1 ? refs[index - 1] : null;
        if (!ref) {
          parent.appendChild(document.createTextNode(token));
        } else {
          parent.appendChild(codeRefNode(ref, unit, "inline"));
        }
      }
      lastIndex = pattern.lastIndex;
    }
    if (lastIndex < text.length) {
      parent.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
  }

  function renderCodeRefs(refs, unit) {
    const section = document.createElement("div");
    section.className = "code-refs";
    const title = document.createElement("div");
    title.className = "code-refs-title";
    title.textContent = "相关代码";
    section.appendChild(title);

    const list = document.createElement("ul");
    list.className = "code-ref-list";
    refs.forEach((ref) => {
      const item = document.createElement("li");
      item.appendChild(codeRefNode(ref, unit, "list"));
      list.appendChild(item);
    });
    section.appendChild(list);
    return section;
  }

  function codeRefNode(ref, unit, variant) {
    const label = ref.label || defaultRefLabel(ref);
    const target = resolveCodeRef(ref);
    if (!target.clickable) {
      const span = document.createElement("span");
      span.className = `code-ref-text ${variant}`;
      span.textContent = label;
      span.title = target.reason || "不可跳转";
      return span;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = `code-ref-link ${variant}`;
    button.textContent = label;
    button.title = defaultRefLabel(ref);
    button.addEventListener("click", () => jumpToCodeRef(ref, unit));
    return button;
  }

  async function jumpToCodeRef(ref) {
    const target = resolveCodeRef(ref);
    if (!target.clickable) {
      return;
    }

    if (state.attentionOnly && !isAttentionFile(target.file)) {
      state.attentionOnly = false;
    }
    state.selectedFileId = target.file.id;

    if (!lineRangeInCompact(target.file, ref)) {
      const result = await ensureFullMode(target.file);
      if (!result.ok) {
        state.fileModes.set(target.file.id, "compact");
        state.modeNotices.set(target.file.id, result.message);
        render();
        return;
      }
      state.fileModes.set(target.file.id, "full");
      state.modeNotices.delete(target.file.id);
    }

    render();
    window.requestAnimationFrame(() => {
      if (highlightCodeRange(target.file.id, ref.side, ref.start_line, ref.end_line) || !state.attentionOnly) {
        return;
      }
      state.attentionOnly = false;
      render();
      window.requestAnimationFrame(() => highlightCodeRange(target.file.id, ref.side, ref.start_line, ref.end_line));
    });
  }

  function highlightCodeRange(fileId, side, start, end) {
    const rows = Array.from(document.querySelectorAll("[data-file-id]"));
    const matches = rows.filter((row) => row.dataset.fileId === fileId && rowHasLine(row, side, start, end));
    if (matches.length === 0) {
      return false;
    }
    matches.forEach((row) => row.classList.add("target-line"));
    matches[0].scrollIntoView({ block: "center" });
    window.setTimeout(() => {
      matches.forEach((row) => row.classList.remove("target-line"));
    }, 4500);
    return true;
  }

  function rowHasLine(row, side, start, end) {
    const value = row.dataset.side === side ? row.dataset.line : row.dataset[`${side}Line`];
    if (!value) {
      return false;
    }
    const line = Number(value);
    return line >= start && line <= end;
  }

  function normalizedCodeRefs(comment) {
    if (!Array.isArray(comment.code_refs)) {
      return [];
    }
    return comment.code_refs.filter((ref) => (
      ref &&
      typeof ref === "object" &&
      typeof ref.path === "string" &&
      (ref.side === "old" || ref.side === "new") &&
      Number.isInteger(ref.start_line) &&
      Number.isInteger(ref.end_line) &&
      ref.start_line >= 1 &&
      ref.end_line >= ref.start_line
    ));
  }

  function resolveCodeRef(ref) {
    const file = findFileForRef(ref);
    if (!file) {
      return { clickable: false, reason: "不在本次 diff 内" };
    }
    if (fulltextAvailability(file)[ref.side] === "absent") {
      return { clickable: false, reason: "该侧不存在" };
    }
    if (!lineRangeInCompact(file, ref) && !canOpenFullMode(file)) {
      return { clickable: false, reason: `双栏不可用：${omitReasonLabel(fulltextAvailability(file).omit_reason)}` };
    }
    return { clickable: true, file };
  }

  function findFileForRef(ref) {
    return state.diff.files.find((file) => (
      ref.side === "old" ? file.old_path === ref.path : file.new_path === ref.path
    ));
  }

  function lineRangeInCompact(file, ref) {
    const lines = compactLineSet(file, ref.side);
    for (let line = ref.start_line; line <= ref.end_line; line += 1) {
      if (!lines.has(line)) {
        return false;
      }
    }
    return true;
  }

  function compactLineSet(file, side) {
    const lines = new Set();
    (file.hunks || []).forEach((hunk) => {
      let oldLine = Number(hunk.old_start) || 0;
      let newLine = Number(hunk.new_start) || 0;
      (hunk.lines || []).forEach((line) => {
        if (line.op === " ") {
          if (side === "old") lines.add(oldLine);
          if (side === "new") lines.add(newLine);
          oldLine += 1;
          newLine += 1;
        } else if (line.op === "+") {
          if (side === "new") lines.add(newLine);
          newLine += 1;
        } else if (line.op === "-") {
          if (side === "old") lines.add(oldLine);
          oldLine += 1;
        }
      });
    });
    return lines;
  }

  function changedLines(file, side) {
    const lines = new Set();
    (file.hunks || []).forEach((hunk) => {
      let oldLine = Number(hunk.old_start) || 0;
      let newLine = Number(hunk.new_start) || 0;
      (hunk.lines || []).forEach((line) => {
        if (line.op === " ") {
          oldLine += 1;
          newLine += 1;
        } else if (line.op === "+") {
          if (side === "new") lines.add(newLine);
          newLine += 1;
        } else if (line.op === "-") {
          if (side === "old") lines.add(oldLine);
          oldLine += 1;
        }
      });
    });
    return lines;
  }

  function visibleFiles() {
    const files = state.diff ? state.diff.files : [];
    if (!state.attentionOnly) {
      return files;
    }
    return files.filter(isAttentionFile);
  }

  function isAttentionFile(file) {
    return (state.unitsByFile.get(file.id) || []).some(isAttentionUnit);
  }

  function allUnits() {
    return Array.from(state.unitsByFile.values()).flat();
  }

  function isAttentionUnit(unit) {
    const comment = state.comments.get(unit.id);
    return !comment || ATTENTION_CLASSES.has(comment.classification);
  }

  function missingUnitsForFile(file) {
    return (state.unitsByFile.get(file.id) || []).filter((unit) => !state.comments.has(unit.id));
  }

  function displayPath(file) {
    return file.new_path || file.old_path || "(unknown)";
  }

  function statusLabel(status) {
    const labels = {
      added: "A",
      modified: "M",
      deleted: "D",
      renamed: "R",
    };
    return labels[status] || "?";
  }

  function lineClass(op) {
    if (op === "+") return "add";
    if (op === "-") return "delete";
    if (op === "\\") return "note";
    return "context";
  }

  function fulltextAvailability(file) {
    if (file.fulltext && typeof file.fulltext === "object") {
      return {
        old: file.fulltext.old || "omitted",
        new: file.fulltext.new || "omitted",
        omit_reason: file.fulltext.omit_reason || "disabled",
      };
    }
    return { old: "omitted", new: "omitted", omit_reason: "disabled" };
  }

  function canOpenFullMode(file) {
    const availability = fulltextAvailability(file);
    return availability.old !== "omitted" && availability.new !== "omitted";
  }

  function omitReasonLabel(reason) {
    const labels = {
      binary: "二进制文件",
      "too-large": "文件过大",
      disabled: "未生成",
    };
    return labels[reason] || "未生成";
  }

  function contentErrorLabel(error) {
    if (error && error.message === "HTTP 404") {
      return "未生成";
    }
    return error && error.message ? error.message : "未生成";
  }

  function defaultRefLabel(ref) {
    const suffix = ref.start_line === ref.end_line ? String(ref.start_line) : `${ref.start_line}-${ref.end_line}`;
    return `${ref.path}:${suffix}`;
  }

  function contentKey(file, side) {
    return `${file.id}.${side}`;
  }

  function splitContentLines(text) {
    if (text === "") {
      return [];
    }
    const lines = String(text).split(/\r?\n/);
    if (lines[lines.length - 1] === "") {
      lines.pop();
    }
    return lines;
  }

  function showFatal(message) {
    elements.summary.textContent = "加载失败";
    elements.banners.replaceChildren();
    const banner = document.createElement("div");
    banner.className = "banner error";
    banner.textContent = message;
    elements.banners.appendChild(banner);
    elements.fileList.replaceChildren();
    elements.fileCount.textContent = "0";
    elements.diffView.replaceChildren();
    const panel = document.createElement("div");
    panel.className = "diff-empty";
    panel.textContent = message;
    elements.diffView.appendChild(panel);
  }
})();
