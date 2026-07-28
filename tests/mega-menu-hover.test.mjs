import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(
  new URL("../assets/css/medspa.css", import.meta.url),
  "utf8",
);

test("mega menu keeps a clickable grace period across its visual gap", () => {
  const menu = css.match(/\.mega-menu\s*\{([^}]+)\}/)?.[1] ?? "";
  const activeMenu =
    css.match(
      /\.nav-dropdown:hover \.mega-menu,\s*\.nav-dropdown:focus-within \.mega-menu,\s*\.nav-dropdown\[data-open="true"\] \.mega-menu\s*\{([^}]+)\}/,
    )?.[1] ?? "";

  assert.match(menu, /visibility:\s*hidden/);
  assert.match(menu, /opacity\s+160ms\s+ease-out\s+120ms/);
  assert.match(menu, /visibility\s+0s\s+linear\s+280ms/);
  assert.doesNotMatch(menu, /pointer-events:\s*none/);
  assert.match(activeMenu, /visibility:\s*visible/);
  assert.match(activeMenu, /transition-delay:\s*0s/);
});
