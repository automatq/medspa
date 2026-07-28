(() => {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const dropdown = document.querySelector("[data-nav-dropdown]");
  const dropdownButton = document.querySelector("[data-dropdown-toggle]");

  const setMobileMenu = (open) => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute("aria-expanded", String(open));
    mobileMenu.hidden = !open;
    document.body.classList.toggle("menu-open", open);
  };

  menuButton?.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    setMobileMenu(open);
  });

  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMobileMenu(false));
  });

  dropdownButton?.addEventListener("click", () => {
    if (!dropdown) return;
    const open = dropdown.dataset.open !== "true";
    dropdown.dataset.open = String(open);
    dropdownButton.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", (event) => {
    if (!dropdown || dropdown.contains(event.target)) return;
    dropdown.dataset.open = "false";
    dropdownButton?.setAttribute("aria-expanded", "false");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    setMobileMenu(false);
    if (dropdown) dropdown.dataset.open = "false";
    dropdownButton?.setAttribute("aria-expanded", "false");
    menuButton?.focus();
  });

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
