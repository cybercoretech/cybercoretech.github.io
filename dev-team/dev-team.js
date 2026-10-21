const THEME_SCHEMA_URL = "../data/cybergrid.json";
const API_URL = "https://cybercoretech.net/api/dev-team/apply";
const root = document.documentElement;
const themeSelect = document.querySelector("#teamThemeSelect");
const themeButton = document.querySelector("#teamThemeButton");
const themeMenu = document.querySelector("#teamThemeMenu");
const displayTheme = (name) => name.replaceAll("-", " ").toUpperCase();
const colorMap = {
  bg: "--bg", white: "--white", acid_green: "--acid", hot_pink: "--pink",
  purple: "--purple", cyan: "--cyan", orange: "--orange", panel: "--panel",
  line: "--line", muted: "--muted",
};
let themeSchema;
let activeWidgetId;
let turnstileToken = "";

async function getTheme(name, family) {
  const response = await fetch(`../data/themes/${encodeURIComponent(family)}/${encodeURIComponent(name)}.json`);
  if (!response.ok) throw new Error("Palette unavailable");
  return response.json();
}

async function applyTheme(name, family, replaceUrl = false) {
  const palette = await getTheme(name, family);
  for (const [key, variable] of Object.entries(colorMap)) {
    if (typeof palette[key] === "string") root.style.setProperty(variable, `#${palette[key]}`);
  }
  root.dataset.theme = name;
  themeSelect.value = name;
  themeButton.textContent = displayTheme(name);
  themeMenu.querySelectorAll(".theme-option").forEach((option) => {
    option.setAttribute("aria-selected", String(option.dataset.value === name));
  });
  try { localStorage.setItem("cybercore-theme", name); } catch { /* private browsing can disable storage */ }
  if (replaceUrl) history.replaceState(null, "", `?theme=${encodeURIComponent(name)}`);
}

async function initThemePicker() {
  const response = await fetch(THEME_SCHEMA_URL);
  if (!response.ok) throw new Error("Theme catalog unavailable");
  themeSchema = await response.json();
  const labels = {
    "cybercore-tech": "CYBERCORE TECH / MASTER MIX", cyberdyne: "CYBERDYNE",
    cyberpunk: "CYBERPUNK", default: "DEFAULT / CLASSICS", dystopian: "DYSTOPIAN",
    neosynth: "NEOSYNTH", synthwave: "SYNTHWAVE", "omarchy-live": "OMARCHY LIVE",
  };
  for (const [family, names] of Object.entries(themeSchema.families)) {
    const group = document.createElement("optgroup");
    group.label = labels[family] || family.toUpperCase();
    const heading = document.createElement("div");
    heading.className = "theme-group-label";
    heading.textContent = group.label;
    themeMenu.append(heading);
    for (const name of names) {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = displayTheme(name);
      option.dataset.family = family;
      group.append(option);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "theme-option";
      button.dataset.value = name;
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", "false");
      button.textContent = displayTheme(name);
      button.addEventListener("click", () => {
        applyTheme(name, family, true).catch(() => {});
        closeThemeMenu();
      });
      themeMenu.append(button);
    }
    themeSelect.append(group);
  }
  const params = new URLSearchParams(location.search);
  let saved = "";
  try { saved = localStorage.getItem("cybercore-theme") || ""; } catch { /* optional preference */ }
  const requested = params.get("theme") || saved || themeSchema.active;
  const family = Object.keys(themeSchema.families).find((key) => themeSchema.families[key].includes(requested));
  const name = family ? requested : themeSchema.active;
  const activeFamily = family || Object.keys(themeSchema.families).find((key) => themeSchema.families[key].includes(name));
  await applyTheme(name, activeFamily);
  themeSelect.addEventListener("change", () => {
    const selected = themeSelect.selectedOptions[0];
    applyTheme(selected.value, selected.parentElement.label, true).catch(() => {});
  });
  themeButton.addEventListener("click", () => {
    const open = themeMenu.hidden;
    themeMenu.hidden = !open;
    themeButton.setAttribute("aria-expanded", String(open));
    if (open) themeMenu.querySelector('[aria-selected="true"]')?.focus();
  });
  document.addEventListener("pointerdown", (event) => {
    if (!event.target.closest(".theme-picker")) closeThemeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !themeMenu.hidden) {
      closeThemeMenu();
      themeButton.focus();
    }
  });
}

function closeThemeMenu() {
  themeMenu.hidden = true;
  themeButton.setAttribute("aria-expanded", "false");
}

function initTurnstile() {
  const target = document.querySelector("#team-turnstile");
  const form = document.querySelector("#devTeamApplication");
  const sitekey = target.dataset.sitekey;
  if (!sitekey || sitekey === "PENDING_TURNSTILE_SITEKEY") return;
  window.onDevTeamTurnstileLoad = () => {
    activeWidgetId = window.turnstile.render(target, {
      sitekey,
      action: "dev-team-apply",
      callback: (token) => { turnstileToken = token; },
      "expired-callback": () => { turnstileToken = ""; },
      "error-callback": () => { turnstileToken = ""; },
    });
  };
  const script = document.createElement("script");
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onDevTeamTurnstileLoad&render=explicit";
  script.async = true;
  script.defer = true;
  document.head.append(script);
  form.dataset.turnstileReady = "pending";
}

function initApplicationForm() {
  const form = document.querySelector("#devTeamApplication");
  const status = document.querySelector("#applicationStatus");
  const roleError = document.querySelector("[data-role-error]");
  const submit = form.querySelector("[type=submit]");
  form.addEventListener("change", (event) => {
    if (event.target.matches('input[name="roles"]') && form.querySelectorAll('input[name="roles"]:checked').length) {
      roleError.hidden = true;
    }
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "";
    status.dataset.state = "";
    if (!form.reportValidity()) return;
    const roles = [...form.querySelectorAll('input[name="roles"]:checked')].map((input) => input.value);
    if (!roles.length) {
      roleError.hidden = false;
      form.querySelector('input[name="roles"]')?.focus();
      return;
    }
    if (!turnstileToken) {
      status.textContent = "Complete the bot check before sending your application.";
      status.dataset.state = "error";
      return;
    }
    const fields = new FormData(form);
    const payload = {
      name: fields.get("name"), email: fields.get("email"), profile: fields.get("profile"),
      roles, projects: fields.get("projects"), experience: fields.get("experience"),
      contribution: fields.get("contribution"), availability: fields.get("availability"),
      privacyConsent: fields.get("privacyConsent") === "on", website: fields.get("website"),
      turnstileToken,
    };
    submit.disabled = true;
    submit.textContent = "SENDING…";
    status.textContent = "Transmitting privately to the contributor inbox…";
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error(result.error || "The application could not be sent.");
      form.reset();
      turnstileToken = "";
      status.textContent = result.message || "Application received. Thanks for sending your signal.";
    } catch (error) {
      status.dataset.state = "error";
      status.textContent = `${error.message} You can also email contributors@cybercoretech.net.`;
    } finally {
      turnstileToken = "";
      if (activeWidgetId !== undefined) window.turnstile?.reset(activeWidgetId);
      submit.disabled = false;
      submit.textContent = "SEND PRIVATE APPLICATION ↗";
    }
  });
}

initThemePicker().catch(() => { themeButton.textContent = "THEMES OFFLINE"; });
initApplicationForm();
initTurnstile();
