const GAME_VERSION = "0.7.0";
const SAVE_KEY = "deepwell-redesign-v1";

const rods = [
  { name: "Starter Reed", maxDepth: 300, depthSpeed: 1, luck: 0 },
  { name: "Trenchpiercer", maxDepth: 1600, depthSpeed: 1.15, luck: 6 },
  { name: "Voidspindle", maxDepth: 4200, depthSpeed: 1.3, luck: 12 },
];

const fishTable = [
  { name: "Pebblefin", rarity: "Common", depth: 0, value: [8, 16], pull: [0.09, 0.14], stamina: [3.5, 4.8], aggression: [1.0, 1.15] },
  { name: "Lantern Koi", rarity: "Rare", depth: 300, value: [70, 120], pull: [0.11, 0.17], stamina: [4.2, 5.6], aggression: [1.1, 1.35] },
  { name: "Depth Tyrant", rarity: "Legendary", depth: 1500, value: [650, 1100], pull: [0.14, 0.22], stamina: [5.2, 6.8], aggression: [1.25, 1.55] },
  { name: "Abyss Wyrm", rarity: "Abyssal", depth: 3000, value: [5500, 9800], pull: [0.2, 0.29], stamina: [6.0, 8.1], aggression: [1.4, 1.85] },
];

const changelog = [{ version: "0.7.0", title: "Depth Struggle Update", sections: { Added: ["Vertical depth struggle system inside the water chamber.", "Submarine-style layout with top strip, central well, and subtle context strip.", "Version plate changelog overlay with tabs and pagination."], Changed: ["Replaced horizontal tension bar with hook-vs-fish tug in the water column."], Fixed: ["Cleaned up cluttered side stats and button-heavy flow."], Balance: ["Clean Capture now grants +5% sell value for skillful fights."] } }];

const state = {
  currency: 0,
  rodIndex: 0,
  luck: 0,
  biome: "Shallows",
  depth: 0,
  phase: "idle",
  hold: false,
  lineTension: 0.28,
  hookY: 0.5,
  fishY: 0.58,
  fishVel: 0.03,
  fishStats: null,
  controlTimer: 0,
  struggleTimer: 0,
  spikeCount: 0,
  cleanRhythm: 0,
  releaseRhythm: 0,
  lastToggleAt: 0,
  eventLog: [],
  recentCatch: null,
  changelogTab: "Added",
  changelogPage: 0,
  lastSeenVersion: "",
};

const $ = (id) => document.getElementById(id);
const currencyEl = $("currency");
const rodNameEl = $("rodName");
const luckEl = $("luckValue");
const biomeEl = $("biomeLabel");
const waterContainer = $("waterContainer");
const hookNode = $("hookNode");
const fishShadow = $("fishShadow");
const energyLine = $("energyLine");
const tensionRing = $("tensionRing");
const controlZone = $("controlZone");
const waterMessage = $("waterMessage");
const stateText = $("stateText");
const sonar = $("sonar");
const recentCatchEl = $("recentCatch");
const eventLogEl = $("eventLog");
const app = $("app");
const depthMarks = $("depthMarks");

const versionPlate = $("versionPlate");
const versionText = $("versionText");
const versionDot = $("versionDot");
const changelogOverlay = $("changelogOverlay");
const closeChangelog = $("closeChangelog");
const changelogTabs = $("changelogTabs");
const changelogBody = $("changelogBody");
const prevPage = $("prevPage");
const nextPage = $("nextPage");
const pageInfo = $("pageInfo");

let last = performance.now();

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function rand(min, max) { return min + Math.random() * (max - min); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    currency: state.currency,
    rodIndex: state.rodIndex,
    luck: state.luck,
    eventLog: state.eventLog,
    recentCatch: state.recentCatch,
    lastSeenVersion: state.lastSeenVersion,
  }));
}

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
    state.currency = Number(data.currency) || 0;
    state.rodIndex = clamp(Number(data.rodIndex) || 0, 0, rods.length - 1);
    state.luck = Number(data.luck) || 0;
    state.eventLog = Array.isArray(data.eventLog) ? data.eventLog.slice(0, 3) : [];
    state.recentCatch = data.recentCatch || null;
    state.lastSeenVersion = String(data.lastSeenVersion || "");
  } catch {}
}

function pushEvent(text) {
  state.eventLog.unshift(text);
  state.eventLog = state.eventLog.slice(0, 3);
}

function biomeFromDepth(depth) {
  if (depth >= 3000) return "Abyss";
  if (depth >= 1500) return "Trench";
  if (depth >= 700) return "Lantern Deep";
  if (depth >= 250) return "Twilight";
  return "Shallows";
}

function setPhase(phase) {
  state.phase = phase;
  if (phase === "idle") {
    stateText.textContent = "Idle · Hold to Cast";
    sonar.classList.remove("pulse");
    waterMessage.textContent = "Hold inside the well to cast.";
  } else if (phase === "waiting") {
    stateText.textContent = "Waiting · Sonar pulse";
    sonar.classList.add("pulse");
    waterMessage.textContent = "Silence... something is below.";
  } else if (phase === "fight") {
    stateText.textContent = "Reeling · Rhythm hold/release";
    sonar.classList.remove("pulse");
    waterMessage.textContent = "Depth Struggle active.";
  }
}

function rollFish(depth) {
  const rod = rods[state.rodIndex];
  const eligible = fishTable.filter((f) => depth >= f.depth);
  const fish = pick(eligible);
  const pull = rand(fish.pull[0], fish.pull[1]) * rand(fish.aggression[0], fish.aggression[1]);
  const stamina = rand(fish.stamina[0], fish.stamina[1]);
  return { ...fish, pull, stamina };
}

function startCast() {
  if (state.phase !== "idle") return;
  state.depth = 0;
  setPhase("waiting");
  pushEvent("Line cast into the well.");
}

function beginFight() {
  state.fishStats = rollFish(state.depth);
  state.hookY = 0.54;
  state.fishY = 0.6;
  state.fishVel = rand(-0.05, 0.05);
  state.lineTension = 0.28;
  state.controlTimer = 0;
  state.struggleTimer = 0;
  state.spikeCount = 0;
  state.cleanRhythm = 0;
  state.releaseRhythm = 0;
  state.lastToggleAt = performance.now();
  setPhase("fight");
  pushEvent(`${state.fishStats.rarity} signature detected.`);
}

function finishFight(successReason) {
  if (!state.fishStats) return;
  const fish = state.fishStats;
  const base = Math.round(rand(fish.value[0], fish.value[1]));
  const fastWin = state.struggleTimer < fish.stamina * 0.9;
  const stable = state.spikeCount < 2 && state.releaseRhythm > 2 && state.cleanRhythm > 2;
  const cleanCapture = fastWin && stable && successReason === "caught";
  const bonus = cleanCapture ? 1.05 : 1;
  const earned = Math.round(base * bonus);
  state.currency += earned;
  state.luck += cleanCapture ? 1 : 0;
  const tag = cleanCapture ? " · Clean Capture +5%" : "";
  state.recentCatch = `${fish.name} (${fish.rarity}) · ₵${earned}${tag}`;
  pushEvent(`Caught ${fish.name}${cleanCapture ? " with a clean rhythm" : ""}.`);
  setPhase("idle");
  state.fishStats = null;
  save();
}

function failFight(reason) {
  pushEvent(reason);
  state.recentCatch = `Lost contact · ${reason}`;
  state.fishStats = null;
  setPhase("idle");
}

function updateWaiting(dt) {
  const rod = rods[state.rodIndex];
  state.depth += dt * 280 * rod.depthSpeed;
  state.depth = clamp(state.depth, 0, rod.maxDepth);
  state.biome = biomeFromDepth(state.depth);
  if (Math.random() < dt * 0.6) beginFight();
}

function applyAbyssEvent(dt) {
  if (!state.fishStats || state.fishStats.rarity !== "Abyssal") return;
  if (Math.random() < dt * 0.18) {
    waterContainer.style.filter = "brightness(0.62) saturate(0.8)";
    setTimeout(() => (waterContainer.style.filter = ""), 180);
  }
  if (Math.random() < dt * 0.08) {
    state.hold = !state.hold;
    pushEvent("Abyss inversion pulse disrupted controls.");
  }
}

function updateFight(dt) {
  const fish = state.fishStats;
  if (!fish) return;
  state.struggleTimer += dt;
  applyAbyssEvent(dt);

  const toggleGap = performance.now() - state.lastToggleAt;
  if ((state.hold && toggleGap < 540) || (!state.hold && toggleGap < 540)) {
    if (state.hold) state.cleanRhythm += dt;
    else state.releaseRhythm += dt;
  }

  const upForce = state.hold ? 0.36 : -0.2;
  const fishDrag = fish.pull * (0.9 + Math.sin(state.struggleTimer * 1.7) * 0.35);
  state.hookY -= upForce * dt;
  state.hookY += fishDrag * dt;

  const surgeChance = fish.rarity === "Abyssal" ? 0.4 : fish.rarity === "Legendary" ? 0.24 : 0.12;
  if (Math.random() < dt * surgeChance) {
    state.hookY += rand(0.02, 0.06);
    state.lineTension += 0.08;
  }

  state.fishVel += rand(-0.08, 0.08) * dt;
  state.fishVel = clamp(state.fishVel, -0.12, 0.12);
  state.fishY += state.fishVel;
  state.fishY = clamp(state.fishY, 0.2, 0.95);

  state.lineTension += state.hold ? 0.38 * dt : -0.25 * dt;
  if (state.hookY < 0.24) state.lineTension += 0.26 * dt;
  if (state.hookY > 0.85) state.lineTension -= 0.2 * dt;
  state.lineTension = clamp(state.lineTension, 0, 1);

  const zoneTop = 0.44;
  const zoneBottom = 0.58;
  if (state.hookY >= zoneTop && state.hookY <= zoneBottom) state.controlTimer += dt;
  else state.controlTimer -= dt * 0.75;
  state.controlTimer = clamp(state.controlTimer, 0, fish.stamina);

  if (state.lineTension > 0.87) state.spikeCount += dt;

  if (state.controlTimer >= fish.stamina) finishFight("caught");
  if (state.hookY > 0.98) failFight("Fish dragged the line into the abyss.");
  if (state.lineTension >= 1) failFight("Line snapped under pressure.");
}

function renderDepthMarks() {
  const marks = [];
  for (let i = 0; i <= 10; i += 1) marks.push(`<div style="position:absolute;top:${i * 10}%;left:0;font-size:11px;opacity:.8;">${i * 100}m</div>`);
  depthMarks.innerHTML = marks.join("");
}

function renderChangelog() {
  const tabs = ["Added", "Changed", "Fixed", "Balance"];
  changelogTabs.innerHTML = tabs.map((tab) => `<button data-tab="${tab}" ${tab === state.changelogTab ? "style='outline:1px solid #9edbff'" : ""}>${tab}</button>`).join("");
  changelogTabs.querySelectorAll("button").forEach((btn) => btn.addEventListener("click", () => { state.changelogTab = btn.dataset.tab; state.changelogPage = 0; renderChangelog(); }));

  const notes = changelog.flatMap((entry) => (entry.sections[state.changelogTab] || []).map((note) => ({ note, entry })));
  const pageSize = 4;
  const pages = Math.max(1, Math.ceil(notes.length / pageSize));
  state.changelogPage = clamp(state.changelogPage, 0, pages - 1);
  pageInfo.textContent = `${state.changelogPage + 1}/${pages}`;
  const start = state.changelogPage * pageSize;
  const page = notes.slice(start, start + pageSize);
  changelogBody.innerHTML = page.map((item) => `<article class="entry"><strong>${item.entry.title}</strong><div>v${item.entry.version}</div><p>${item.note}</p></article>`).join("");
}

function render() {
  const rod = rods[state.rodIndex];
  currencyEl.textContent = state.currency.toLocaleString();
  rodNameEl.textContent = rod.name;
  luckEl.textContent = state.luck;
  biomeEl.textContent = state.biome;
  app.classList.toggle("biome-abyss", state.biome === "Abyss");

  recentCatchEl.textContent = state.recentCatch || "Nothing yet.";
  eventLogEl.innerHTML = state.eventLog.map((item) => `<div class="log-item">${item}</div>`).join("");

  const hookPct = state.hookY * 100;
  const fishPct = state.fishY * 100;
  hookNode.style.top = `${hookPct}%`;
  fishShadow.style.top = `${fishPct}%`;

  const lineTop = Math.min(hookPct, fishPct);
  const lineHeight = Math.max(2, Math.abs(hookPct - fishPct));
  energyLine.style.top = `${lineTop}%`;
  energyLine.style.height = `${lineHeight}%`;

  const heat = Math.round(state.lineTension * 100);
  tensionRing.style.borderColor = `rgba(255, ${180 - heat}, ${120 - heat * 0.4}, .7)`;
  tensionRing.style.boxShadow = `0 0 ${8 + heat * 0.2}px rgba(255,120,90,.5)`;

  waterContainer.style.setProperty("--my", `${hookPct}%`);
}

function frame(now) {
  const dt = (now - last) / 1000;
  last = now;

  if (state.phase === "waiting") updateWaiting(dt);
  if (state.phase === "fight") updateFight(dt);

  render();
  requestAnimationFrame(frame);
}

waterContainer.addEventListener("pointerdown", () => {
  state.hold = true;
  state.lastToggleAt = performance.now();
  if (state.phase === "idle") startCast();
});

window.addEventListener("pointerup", () => {
  state.hold = false;
  state.lastToggleAt = performance.now();
});

waterContainer.addEventListener("pointermove", (e) => {
  const rect = waterContainer.getBoundingClientRect();
  waterContainer.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
  waterContainer.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
});

versionText.textContent = GAME_VERSION;
if (state.lastSeenVersion !== GAME_VERSION) versionDot.classList.remove("hidden");
versionPlate.addEventListener("click", () => {
  changelogOverlay.classList.add("show");
  state.lastSeenVersion = GAME_VERSION;
  versionDot.classList.add("hidden");
  renderChangelog();
  save();
});
closeChangelog.addEventListener("click", () => changelogOverlay.classList.remove("show"));
prevPage.addEventListener("click", () => { state.changelogPage -= 1; renderChangelog(); });
nextPage.addEventListener("click", () => { state.changelogPage += 1; renderChangelog(); });

load();
renderDepthMarks();
setPhase("idle");
render();
requestAnimationFrame(frame);
window.addEventListener("beforeunload", save);
