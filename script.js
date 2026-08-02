/* ==========================================================================
   HOLLOW site logic
   Edit the DATA objects below to change the site's content.
   ========================================================================== */

/* ---- 1. CONTENT DATA — edit this, nothing else required ---------------- */

const FAQ_DATA = [
  {
    q: "What is HOLLOW?",
    a: "HOLLOW is a war game built in Roblox. Expect tight gunplay, squad-based objectives and a tone that doesn't glorify what it depicts."
  },
  {
    q: "When does it release?",
    a: "There's no release date yet. Follow the devblog for real progress instead of a promise we can't keep."
  },
  {
    q: "Is it free?",
    a: "Yes. HOLLOW will be free to play. Support is optional and never buys gameplay advantages."
  },
  {
    q: "Can I join the team?",
    a: "We take on help case by case, mostly through people we already know from the community. The fastest way in is the voice casting call above, or reaching out through the support/contact channel with something you've made."
  },
  {
    q: "Where do I report a bug or leak?",
    a: "Use the contact address in the SUPPORT tab. Include what happened, what you expected, and a way to reproduce it if you can."
  }
];

const ROLE_DATA = [
  {
    code: "CMD-01",
    name: "Squad Commander",
    desc: "Calm, decisive, has made bad calls before and lives with them. Barks orders without theatrics.",
    line: "\u201CHold the line. Nobody moves until I say so \u2014 not even me.\u201D"
  },
  {
    code: "RTO-02",
    name: "Radio Operator",
    desc: "Fast, clipped delivery. Needs to sound clear under pressure, even when panicking.",
    line: "\u201CContact east ridge, taking fire, requesting immediate support!\u201D"
  },
  {
    code: "CIV-03",
    name: "Civilian Broadcast",
    desc: "A voice heard over old radios and intercoms scattered through the world. Worn, tired, human.",
    line: "\u201CIf anyone's still listening \u2014 the water's gone. Don't come this way.\u201D"
  },
  {
    code: "SYS-04",
    name: "System / Interface Voice",
    desc: "Flat, mechanical, no emotion. Announces objectives, warnings and countdowns.",
    line: "\u201CObjective compromised. Reinforcements unavailable.\u201D"
  },
  {
    code: "OTH-05",
    name: "Other / More",
    desc: "Got a voice that doesn't fit the roles above \u2014 an accent, a character, a tone we haven't thought of? Pitch it. Read any line you want, or write your own, and tell us what you had in mind.",
    line: "\u201CRead whatever shows what you can do. Surprise us.\u201D"
  }
];

const DEVLOG_DATA = [
  {
    date: "2026.07.29",
    title: "Reworking the gun system",
    body: "Overhauling weapon feel from the ground up \u2014 recoil, sway, hit feedback and shell ejection are all being retuned for something heavier and more deliberate."
  },
  {
    date: "2026.07.12",
    title: "NPC pathfinding, first pass",
    body: "Enemy AI now navigates real geometry instead of scripted waypoints. Still rough around corners, but it finds you."
  },
  {
    date: "2026.06.30",
    title: "Main menu, cinematic pass",
    body: "New camera behaviour, ambient scene animation and a cleaner window system for menus. Small thing, took forever."
  }
];

/* Credits — shown in the CREDITS window at the bottom of the page */
const CREDITS_DATA = [
  { role: "Music", name: "Mokonzi" },
  { role: "Support", name: "Liumens Studio" },
  { role: "Writing", name: "Mokonzi and Viper" },
  { role: "Scripting", name: "Viper" },
  { role: "3D Models", name: "Viper" },
  { role: "Mapping", name: "Viper" }
];
const CREDITS_NOTE = "Voice actors will be shown here once every role has been cast.";
const SUPPORT_LINKS = {
  kofi: "#",       // e.g. "https://ko-fi.com/yourname"
  discord: "https://discord.gg/fpgtWWqRUB",   // community Discord — NOT the voice casting one
  mail: "hollowdevteam@gmail.com"
};

/* Discord webhook that receives voice casting submissions.
   See the README section "Discord uploads" for how to create this URL.
   Leave empty ("") to keep the form disabled with a config warning. */
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1533411935482020021/T7zVkeeienlZNuN04Dp5pCLVAbmv69iqWYL3SCHxf4qUneYKAxks5v1L18Idq4Jbcr_K";

/* ---- 2. BOOT SEQUENCE ---------------------------------------------------- */

const BOOT_LINES = [
  { text: "> ESTABLISHING SECURE CHANNEL...", cls: "ok" },
  { text: "> AUTHENTICATING CLEARANCE LEVEL...", cls: "ok" },
  { text: "> CLEARANCE GRANTED", cls: "tag" },
  { text: "> LOADING SECTOR DATA [HOLLOW]...", cls: "ok" },
  { text: "> COMPILING FIELD REPORTS...", cls: "ok" },
  { text: "> WARNING: SIGNAL INTEGRITY 94%", cls: "warn" },
  { text: "> STANDBY FOR BRIEFING", cls: "tag" }
];

function typeLine(container, text, cls, speed = 5) {
  return new Promise((resolve) => {
    const span = document.createElement("div");
    if (cls) span.className = cls;
    container.appendChild(span);
    let i = 0;
    const tick = () => {
      span.textContent = text.slice(0, i);
      i++;
      if (i <= text.length) {
        setTimeout(tick, speed);
      } else {
        resolve();
      }
    };
    tick();
  });
}

async function runBoot() {
  const log = document.getElementById("boot-log");
  const bar = document.getElementById("boot-bar");
  const pct = document.getElementById("boot-pct");
  const barWidth = 34;

  for (let i = 0; i < BOOT_LINES.length; i++) {
    await typeLine(log, BOOT_LINES[i].text, BOOT_LINES[i].cls);
    const percent = Math.round(((i + 1) / BOOT_LINES.length) * 100);
    const filled = Math.round((percent / 100) * barWidth);
    bar.textContent = "[" + "#".repeat(filled) + "-".repeat(barWidth - filled) + "]";
    pct.textContent = percent + "%";
    await new Promise((r) => setTimeout(r, 35));
  }

  await new Promise((r) => setTimeout(r, 150));

  const boot = document.getElementById("boot-screen");
  boot.style.opacity = "0";
  setTimeout(() => {
    boot.classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
  }, 500);
}

/* ---- 3. SECTION TRANSITION (short flicker when switching tabs) -------- */

/* Section registry used to fake a directory scan on transition */
const SECTION_FILES = {
  home:      { file: "home.dat",       size: "12 KB" },
  questions: { file: "questions.dat",  size: "8 KB"  },
  auditions: { file: "casting.dat",    size: "21 KB" },
  devblog:   { file: "devblog.dat",    size: "34 KB" },
  support:   { file: "supply.dat",     size: "6 KB"  },
  hollowz:   { file: "hollowz.dat",    size: "0 KB"  }
};

let transitioning = false;

async function switchPane(target) {
  if (transitioning) return;
  transitioning = true;

  const overlay = document.getElementById("transition-screen");
  const log = document.getElementById("transition-log");
  log.innerHTML = "";
  overlay.classList.add("on");

  const meta = SECTION_FILES[target] || { file: target + ".dat", size: "-- KB" };

  await typeLine(log, `> ACCESSING SECTOR: ${target.toUpperCase()}`, "ok", 4);
  await typeLine(log, `> SCANNING C:\\HOLLOW\\SECTORS\\`, "ok", 3);
  await new Promise((r) => setTimeout(r, 60));

  const listDiv = document.createElement("div");
  listDiv.className = "dir-list";
  log.appendChild(listDiv);

  for (const [key, info] of Object.entries(SECTION_FILES)) {
    const row = document.createElement("div");
    row.className = key === target ? "dir-row hit" : "dir-row";
    row.textContent = `  ${info.size.padStart(6, " ")}   ${info.file}`;
    listDiv.appendChild(row);
    await new Promise((r) => setTimeout(r, 22));
  }

  await new Promise((r) => setTimeout(r, 80));
  await typeLine(log, `> TARGET LOCKED: ${meta.file}`, "tag", 4);
  await typeLine(log, `> DECRYPTING...`, "ok", 3);
  await new Promise((r) => setTimeout(r, 120));
  await typeLine(log, `> ACCESS GRANTED`, "tag", 3);
  await new Promise((r) => setTimeout(r, 140));

  document.querySelectorAll(".pane").forEach((p) => p.classList.toggle("active", p.id === target));
  document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.target === target));

  await new Promise((r) => setTimeout(r, 100));
  overlay.classList.remove("on");
  transitioning = false;
}

/* ---- 4. RENDER CONTENT --------------------------------------------------- */

function renderFAQ() {
  const wrap = document.getElementById("faq-list");
  FAQ_DATA.forEach((item) => {
    const el = document.createElement("div");
    el.className = "faq-item";
    el.innerHTML = `
      <button class="faq-q">${item.q}</button>
      <div class="faq-a">${item.a}</div>
    `;
    el.querySelector(".faq-q").addEventListener("click", () => {
      el.classList.toggle("open");
    });
    wrap.appendChild(el);
  });
}

function renderRoles() {
  const wrap = document.getElementById("role-list");
  ROLE_DATA.forEach((role) => {
    const el = document.createElement("div");
    el.className = "role-card";
    el.innerHTML = `
      <div class="role-head">
        <span class="role-name">${role.name}</span>
        <span class="role-code">${role.code}</span>
      </div>
      <div class="role-desc">${role.desc}</div>
      <div class="role-line">${role.line}</div>
    `;
    wrap.appendChild(el);
  });
}

function renderDevlog() {
  const wrap = document.getElementById("devlog-list");
  DEVLOG_DATA.forEach((entry) => {
    const el = document.createElement("div");
    el.className = "devlog-entry";
    el.innerHTML = `
      <div class="devlog-date">${entry.date}</div>
      <div class="devlog-title">${entry.title}</div>
      <div class="devlog-body">${entry.body}</div>
    `;
    wrap.appendChild(el);
  });
}

function applySupportLinks() {
  document.getElementById("support-kofi").href = SUPPORT_LINKS.kofi;
  document.getElementById("support-discord").href = SUPPORT_LINKS.discord;
  document.getElementById("support-mail").href = "mailto:" + SUPPORT_LINKS.mail;
}

function renderCredits() {
  const body = document.getElementById("credits-body");
  CREDITS_DATA.forEach((c) => {
    const row = document.createElement("div");
    row.className = "credit-row";
    row.innerHTML = `<span class="credit-role">${c.role}</span><span class="credit-name">${c.name}</span>`;
    body.appendChild(row);
  });
  const note = document.createElement("div");
  note.className = "credit-note";
  note.textContent = CREDITS_NOTE;
  body.appendChild(note);
}

function setupCreditsModal() {
  const modal = document.getElementById("credits-modal");
  const openBtn = document.getElementById("credits-open");
  const closeBtn = document.getElementById("credits-close");

  const open = () => modal.classList.remove("hidden");
  const close = () => modal.classList.add("hidden");

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function populateRoleSelect() {
  const select = document.getElementById("up-role");
  ROLE_DATA.forEach((role) => {
    const opt = document.createElement("option");
    opt.value = role.code;
    opt.textContent = `${role.code} — ${role.name}`;
    select.appendChild(opt);
  });
}

/* ---- 6. VOICE SAMPLE UPLOAD (direct to Discord webhook) --------------- */

function setupUploadForm() {
  const form = document.getElementById("upload-form");
  const drop = document.getElementById("file-drop");
  const fileInput = document.getElementById("up-file");
  const dropLabel = document.getElementById("file-drop-label");
  const status = document.getElementById("upload-status");
  const submitBtn = document.getElementById("upload-submit");

  if (!DISCORD_WEBHOOK_URL) {
    submitBtn.disabled = true;
    status.className = "upload-status err";
    status.textContent = "Uploads are offline right now — config pending. Use the SUPPORT contact instead.";
  }

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length) {
      drop.classList.add("has-file");
      dropLabel.innerHTML = `selected: <span class="hi">${fileInput.files[0].name}</span>`;
    }
  });

  ["dragover", "dragleave", "drop"].forEach((evt) => {
    drop.addEventListener(evt, (e) => e.preventDefault());
  });
  drop.addEventListener("dragover", () => drop.classList.add("drag"));
  drop.addEventListener("dragleave", () => drop.classList.remove("drag"));
  drop.addEventListener("drop", (e) => {
    drop.classList.remove("drag");
    if (e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      fileInput.dispatchEvent(new Event("change"));
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!DISCORD_WEBHOOK_URL) return;

    const name = document.getElementById("up-name").value.trim();
    const role = document.getElementById("up-role").value;
    const file = fileInput.files[0];

    if (!file) {
      status.className = "upload-status err";
      status.textContent = "No file selected.";
      return;
    }

    const maxBytes = 24 * 1024 * 1024; // keep under typical webhook limits
    if (file.size > maxBytes) {
      status.className = "upload-status err";
      status.textContent = "File too large — compress it and try again.";
      return;
    }

    submitBtn.disabled = true;
    status.className = "upload-status busy";
    status.textContent = "TRANSMITTING...";

    const payload = {
      content: `**New voice casting submission**\n**Role:** ${role}\n**From:** ${name || "unknown"}`
    };

    const body = new FormData();
    body.append("payload_json", JSON.stringify(payload));
    body.append("files[0]", file, file.name);

    try {
      const res = await fetch(DISCORD_WEBHOOK_URL, { method: "POST", body });
      if (!res.ok) throw new Error("bad response " + res.status);
      status.className = "upload-status ok";
      status.textContent = "TRANSMISSION RECEIVED. Thanks — we'll reach out if it's a fit.";
      form.reset();
      drop.classList.remove("has-file");
      dropLabel.innerHTML = 'drop file here, or <span class="hi">click to browse</span>';
    } catch (err) {
      status.className = "upload-status err";
      status.textContent = "TRANSMISSION FAILED. Check your connection or try again in a moment.";
    } finally {
      submitBtn.disabled = false;
    }
  });
}

/* ---- 5. INIT ---------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  renderFAQ();
  renderRoles();
  renderDevlog();
  applySupportLinks();
  populateRoleSelect();
  setupUploadForm();
  renderCredits();
  setupCreditsModal();

  document.getElementById("year").textContent = new Date().getFullYear();

  document.querySelectorAll(".nav-btn[data-target]").forEach((btn) => {
    btn.addEventListener("click", () => switchPane(btn.dataset.target));
  });

  const clock = document.getElementById("clock-status");
  setInterval(() => {
    clock.textContent = "ONLINE";
  }, 300);

  runBoot();
});