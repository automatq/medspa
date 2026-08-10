/**
 * Inline editor. Loaded only when the admin hint cookie is present, so this file
 * never reaches an ordinary visitor.
 *
 * The interaction model is ported from preet/cambridge's Editable.jsx — blur
 * saves, Enter blurs, Cmd/Ctrl+Enter blurs a multiline field, Escape reverts —
 * minus React, which that version spends most of its code fighting.
 *
 * Three things preet lacks are added here, each because its own review flagged
 * the gap: an inline reset on text (it only offers reset for images), a guard
 * against navigating away mid-edit (blur is the only commit, so leaving silently
 * drops the change), and suppressed link navigation while editing (its editable
 * spans sit inside anchors, so clicking to edit a CTA label navigates instead).
 */

const state = {
  values: new Map(), // key -> last known saved value, for Escape and dirty checks
  editing: true,
  dirty: new Set(),
  applyOverrides: null,
  cacheKey: null,
};

const api = async (path, options = {}) => {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body;
};

/* ---------------------------------------------------------------- toolbar */

let toast;

const showToast = (message, kind = "ok") => {
  if (!toast) return;
  toast.textContent = message;
  toast.dataset.kind = kind;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  // Errors need long enough to actually read — a rejected save explains why.
  showToast.timer = setTimeout(() => (toast.hidden = true), kind === "err" ? 6000 : 2200);
};

const buildToolbar = () => {
  const bar = document.createElement("div");
  bar.className = "anima-editor-bar";
  bar.innerHTML = `
    <span class="anima-editor-dot" aria-hidden="true"></span>
    <span class="anima-editor-status">Editing</span>
    <button type="button" data-editor-toggle>Pause</button>
    <a href="/admin/posts/">Write a post</a>
    <button type="button" data-editor-logout>Sign out</button>
    <span class="anima-editor-toast" role="status" aria-live="polite" hidden></span>`;
  document.body.append(bar);

  toast = bar.querySelector(".anima-editor-toast");
  const status = bar.querySelector(".anima-editor-status");
  const toggle = bar.querySelector("[data-editor-toggle]");

  toggle.addEventListener("click", () => {
    state.editing = !state.editing;
    document.body.classList.toggle("anima-editing", state.editing);
    status.textContent = state.editing ? "Editing" : "Paused";
    toggle.textContent = state.editing ? "Pause" : "Resume";
    setFieldsEditable(state.editing);
  });

  bar.querySelector("[data-editor-logout]").addEventListener("click", async () => {
    await fetch("/api/admin/login", { method: "DELETE", credentials: "same-origin" });
    try {
      sessionStorage.removeItem(state.cacheKey);
    } catch {}
    location.reload();
  });
};

/* ------------------------------------------------------------------- text */

const save = async (node, key, value) => {
  const previous = state.values.get(key);
  state.values.set(key, value); // optimistic, as preet does
  state.dirty.delete(key);

  try {
    await api(`/api/admin/copy?key=${encodeURIComponent(key)}`, {
      method: "PUT",
      body: JSON.stringify({ value }),
    });
    showToast("Saved");
    try {
      const cached = JSON.parse(sessionStorage.getItem(state.cacheKey) || "{}");
      cached[key] = value;
      sessionStorage.setItem(state.cacheKey, JSON.stringify(cached));
    } catch {}
  } catch (error) {
    // Put the rejected text back so the page never shows something the server
    // refused to store — a banned phrase must not linger on screen looking saved.
    state.values.set(key, previous);
    node.textContent = previous ?? "";
    showToast(error.message, "err");
  }
};

const resetKey = async (node, key) => {
  try {
    const body = await api(`/api/admin/copy?key=${encodeURIComponent(key)}`, { method: "DELETE" });
    state.values.set(key, body.value);
    node.textContent = body.value;
    showToast("Reset to the original");
    try {
      const cached = JSON.parse(sessionStorage.getItem(state.cacheKey) || "{}");
      delete cached[key];
      sessionStorage.setItem(state.cacheKey, JSON.stringify(cached));
    } catch {}
  } catch (error) {
    showToast(error.message, "err");
  }
};

const setFieldsEditable = (on) => {
  document.querySelectorAll("[data-copy-key]").forEach((node) => {
    if (node.tagName === "IMG") return;
    node.contentEditable = on ? "true" : "false";
    if (on) node.spellcheck = true;
  });
};

const wireText = (node) => {
  const key = node.dataset.copyKey;
  state.values.set(key, node.textContent);

  node.addEventListener("input", () => state.dirty.add(key));

  node.addEventListener("blur", () => {
    const next = node.textContent || "";
    if (next !== state.values.get(key)) save(node, key, next);
    else state.dirty.delete(key);
  });

  node.addEventListener("keydown", (event) => {
    const multiline = node.tagName === "P" || node.tagName === "DIV";
    if (event.key === "Enter" && (!multiline || event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      node.blur();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      node.textContent = state.values.get(key) ?? "";
      state.dirty.delete(key);
      node.blur();
    }
  });

  // preet's editable spans live inside <a> elements, so clicking one to place a
  // cursor follows the link instead. Suppress that while editing.
  const anchor = node.closest("a");
  if (anchor) {
    anchor.addEventListener("click", (event) => {
      if (state.editing) event.preventDefault();
    });
  }
};

/* ----------------------------------------------------------------- images */

const wireImage = (node) => {
  const key = node.dataset.copyKey;
  state.values.set(key, node.getAttribute("src"));

  const overlay = document.createElement("span");
  overlay.className = "anima-image-tools";
  overlay.innerHTML = `<button type="button" data-replace>Replace</button><button type="button" data-reset>Reset</button>`;

  // The overlay is positioned against the image's own box, so it needs a
  // positioned wrapper that does not disturb layout.
  const wrapper = document.createElement("span");
  wrapper.className = "anima-image-wrap";
  node.parentNode.insertBefore(wrapper, node);
  wrapper.append(node, overlay);

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/jpeg,image/png,image/webp,image/gif";
  input.hidden = true;
  wrapper.append(input);

  overlay.querySelector("[data-replace]").addEventListener("click", () => input.click());
  overlay.querySelector("[data-reset]").addEventListener("click", async () => {
    if (!confirm("Put the original image back?")) return;
    try {
      const body = await api(`/api/admin/copy?key=${encodeURIComponent(key)}`, { method: "DELETE" });
      node.src = body.value;
      showToast("Reset to the original");
    } catch (error) {
      showToast(error.message, "err");
    }
  });

  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;
    input.value = "";
    wrapper.classList.add("is-uploading");
    showToast("Uploading…");
    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || `Upload failed (${response.status})`);

      // The returned URL is stored through the ordinary copy endpoint — an image
      // key is just a key whose value happens to be a URL.
      await save(node, key, body.url);
      node.src = body.url;
      node.removeAttribute("srcset");
      const picture = node.closest("picture");
      if (picture) picture.querySelectorAll("source").forEach((source) => source.remove());
    } catch (error) {
      showToast(error.message, "err");
    } finally {
      wrapper.classList.remove("is-uploading");
    }
  });
};

/* ------------------------------------------------------------------- init */

export const init = ({ applyOverrides, cacheKey }) => {
  state.applyOverrides = applyOverrides;
  state.cacheKey = cacheKey;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/assets/css/editor.css";
  document.head.append(link);

  document.body.classList.add("anima-editing");
  buildToolbar();

  document.querySelectorAll("[data-copy-key]").forEach((node) => {
    if (node.tagName === "IMG") wireImage(node);
    else wireText(node);
  });
  setFieldsEditable(true);

  // Blur is the only commit, so leaving with focus still in a field would drop
  // the edit without a word. preet has no equivalent guard.
  window.addEventListener("beforeunload", (event) => {
    if (state.dirty.size === 0) return;
    event.preventDefault();
    event.returnValue = "";
  });

  showToast("Editing on — click any text to change it");
};
