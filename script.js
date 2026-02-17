const GAME_VERSION = "0.5.0";

const changelogEntries = [
  {
    version: "0.5.0",
    date: "2026-02-17",
    title: "Line & Tension",
    sections: {
      Added: [
        "Hold-and-release casting with power zones and sweet-spot timing bonus luck.",
        "Dedicated bite reaction phase with rarity-scaled reaction windows.",
        "Skill-based tension minigame plus optional Focused Reeling Mode (+15% value).",
      ],
      Changed: [
        "Fishing flow is now Throw → Wait → Bite → Tension Fight → Catch/Fail.",
        "Rod passives include soft-capped minigame assistance stats.",
      ],
      Balance: [
        "Skill improves consistency and value bonuses, not direct rarity tier skipping.",
        "Minigame assistance caps: safe zone +20%, reaction window +30%, fish speed slow -20%.",
      ],
    },
  },
  {
    version: "0.4.2",
    date: "2026-02-17",
    title: "Abyssal Bloom",
    sections: {
      Added: [
        "Depth-based biome layers with unique fish pools, visuals, and ambience labels.",
        "Mutation system with rare variants from Shiny to Abyss-Touched.",
        "Eight-rod progression curve with tuned passives and transparent caps tooltip.",
      ],
      Changed: [
        "Fishing EV curve smoothed: early rods feel strong, late rods gain with diminishing returns.",
        "Rarity rolls now respect depth unlocks first, then apply biome/rod weight bias.",
      ],
      Fixed: [
        "Prevented luck and mutation effects from exceeding configured soft caps.",
        "Improved save recovery when local data is missing or malformed.",
      ],
      Balance: [
        "Luck effectiveness hard cap stays at +20% rarity improvement.",
        "Mutation relative odds bonus hard cap stays at +10%.",
        "Biome and rod tier biases are clamped within ±10% weight impact.",
      ],
    },
  },
];

const rarityTiers = [
  { name: "Common", key: "common", minDepth: 0, odds: 2, value: [8, 16], reaction: [1.2, 1.1], fight: [2, 3], fishSpeed: 0.55, safeZone: 0.26 },
  { name: "Uncommon", key: "uncommon", minDepth: 100, odds: 5, value: [24, 44], reaction: [1.1, 1.0], fight: [3, 4], fishSpeed: 0.62, safeZone: 0.24 },
  { name: "Rare", key: "rare", minDepth: 300, odds: 15, value: [72, 130], reaction: [1.0, 0.92], fight: [4, 5], fishSpeed: 0.7, safeZone: 0.22 },
  { name: "Epic", key: "epic", minDepth: 700, odds: 75, value: [220, 380], reaction: [0.92, 0.86], fight: [5, 6], fishSpeed: 0.8, safeZone: 0.2 },
  { name: "Legendary", key: "legendary", minDepth: 1500, odds: 400, value: [700, 1200], reaction: [0.86, 0.8], fight: [6, 8], fishSpeed: 0.92, safeZone: 0.18 },
  { name: "Mythic", key: "mythic", minDepth: 3000, odds: 2000, value: [2100, 4200], reaction: [0.82, 0.75], fight: [8, 10], fishSpeed: 1.03, safeZone: 0.16 },
  { name: "Abyssal", key: "abyssal", minDepth: 3000, odds: 25000, value: [7000, 14000], reaction: [0.78, 0.7], fight: [10, 12], fishSpeed: 1.18, safeZone: 0.14 },
  { name: "??? Tier", key: "unknown", minDepth: 5000, odds: 1000000, value: [50000, 50000], hidden: true, reaction: [0.72, 0.65], fight: [12, 13], fishSpeed: 1.25, safeZone: 0.13 },
];

const biomes = [
  { key: "shallows", title: "Shallows", min: 0, max: 99, className: "zone-shallows", ambience: "Calm surface water", rarityBias: {}, biteBias: 1, fishPools: { common: ["Pebblefin", "Rustscale", "Mud Carp", "Drift Minnow"], uncommon: ["Silver Dart", "Ripple Trout"] } },
  { key: "kelp", title: "Kelp Veil", min: 100, max: 299, className: "zone-kelp", ambience: "Kelp sway and softened current", rarityBias: { uncommon: 0.08, common: -0.06 }, biteBias: 1.03, fishPools: { common: ["Kelp Nibbler", "Verdant Guppy"], uncommon: ["Frond Eel", "Mossback Eel", "Bluegill Shade", "Hollow Perch"], rare: ["Veil Snapper"] } },
  { key: "twilight", title: "Twilight Shelf", min: 300, max: 699, className: "zone-twilight", ambience: "Drifting particles in deep blue", rarityBias: { rare: 0.06, uncommon: -0.05 }, biteBias: 1.05, fishPools: { uncommon: ["Slate Gazer", "Twilight Perch"], rare: ["Lantern Koi", "Blackwater Bass", "Ironjaw Catfish", "Shelf Runner"], epic: ["Abyss Runner"] } },
  { key: "lantern", title: "Lantern Deep", min: 700, max: 1499, className: "zone-lantern", ambience: "Bioluminescent hum", rarityBias: { epic: 0.08, rare: -0.08 }, biteBias: 1.08, fishPools: { rare: ["Lantern Koi", "Night Veil Snapper"], epic: ["Glowfin Serpent", "Phantom Ray", "Obsidian Koi", "Shardscale Levi"], legendary: ["Midnight Hydra"] } },
  { key: "trench", title: "Abyssal Trench", min: 1500, max: 2999, className: "zone-trench", ambience: "Pressure creaks and dark fog", rarityBias: { legendary: 0.06, epic: -0.04 }, biteBias: 1.12, fishPools: { epic: ["Trench Manta", "Rift Lurker"], legendary: ["Depth Tyrant", "Ancient Wellkeeper", "Midnight Hydra", "Crowned Angler"], mythic: ["Gravity Wyrm"] } },
  { key: "voidwell", title: "Voidwell", min: 3000, max: Infinity, className: "zone-voidwell", ambience: "Ominous low drone and depth dust", rarityBias: { mythic: 0.04, legendary: -0.03 }, biteBias: 1.18, fishPools: { legendary: ["Voidfin Monarch", "Null Angler"], mythic: ["Celestial Leviathan", "Oracle of the Deep", "The Gilded Maw", "Starbound Eel"], abyssal: ["The Nameless One", "Primordial Echo", "Deepwell Core", "Wellheart Entity"], unknown: ["The Endless Below"] } },
];

const mutationTable = [
  { name: "Abyss-Touched", key: "abyssTouched", odds: 50000, multiplier: 60, minDepth: 3000 },
  { name: "Ethereal", key: "ethereal", odds: 10000, multiplier: 25, minDepth: 0 },
  { name: "Corrupted", key: "corrupted", odds: 2500, multiplier: 10, minDepth: 0 },
  { name: "Gilded", key: "gilded", odds: 1000, multiplier: 6, minDepth: 0 },
  { name: "Iridescent", key: "iridescent", odds: 250, multiplier: 2.5, minDepth: 0 },
  { name: "Shiny", key: "shiny", odds: 50, multiplier: 1.5, minDepth: 0 },
  { name: "None", key: "none", odds: 1, multiplier: 1, minDepth: 0 },
];

const rods = [
  { name: "Starter Reed", depthSpeed: 8, maxDepth: 250, castTime: 8.0, passives: ["No passive"], passivesMeta: {}, price: 0 },
  { name: "Spoolwood", depthSpeed: 10, maxDepth: 400, castTime: 7.5, passives: ["+2% luck effectiveness", "+4% safe zone width"], passivesMeta: { luckEffectiveness: 0.02, safeZoneBonus: 0.04 }, price: 200 },
  { name: "Deepline", depthSpeed: 12, maxDepth: 650, castTime: 7.0, passives: ["+5% sell value for Uncommon+", "-6% fish movement speed"], passivesMeta: { sellBoostUncommonPlus: 0.05, fishSpeedSlow: 0.06 }, price: 440 },
  { name: "Lantern Rod", depthSpeed: 14, maxDepth: 1100, castTime: 6.6, passives: ["+3% Epic weight in Lantern Deep", "+0.15s bite reaction window"], passivesMeta: { biomeBias: { biome: "lantern", tier: "epic", value: 0.03 }, reactionWindowBonus: 0.15 }, price: 1056 },
  { name: "Trenchpiercer", depthSpeed: 16, maxDepth: 1900, castTime: 6.3, passives: ["+4% luck effectiveness", "+3% tension stability"], passivesMeta: { luckEffectiveness: 0.04, tensionStability: 0.03 }, price: 2745 },
  { name: "Obsidian Reel", depthSpeed: 18, maxDepth: 2900, castTime: 6.1, passives: ["+2% mutation relative odds", "+7% safe zone width"], passivesMeta: { mutationRelative: 0.02, safeZoneBonus: 0.07 }, price: 7686 },
  { name: "Voidspindle", depthSpeed: 20, maxDepth: 4200, castTime: 6.0, passives: ["+5% Legendary sell value", "+1% Mythic weight in Voidwell", "-8% fish movement speed"], passivesMeta: { legendaryValueBoost: 0.05, biomeBias: { biome: "voidwell", tier: "mythic", value: 0.01 }, fishSpeedSlow: 0.08 }, price: 23058 },
  { name: "Deepwell Core Rod", depthSpeed: 22, maxDepth: 6000, castTime: 6.0, passives: ["Echo Pull: 1 in 250 cast rolls pool at +15% depth", "+2% luck effectiveness", "+0.2s bite reaction window"], passivesMeta: { luckEffectiveness: 0.02, echoPull: { chance: 250, depthGain: 0.15 }, reactionWindowBonus: 0.2 }, price: 76091 },
];

const SAVE_KEY = "deepwell-save-v3";
const LUCK_EFFECTIVENESS_CAP = 0.2;
const MUTATION_RELATIVE_CAP = 0.1;
const BIAS_LIMIT = 0.1;
const SAFE_ZONE_CAP = 0.2;
const REACTION_WINDOW_CAP = 0.3;
const FISH_SLOW_CAP = 0.2;

const PHASES = {
  idle: "idle",
  charging: "charging",
  waiting: "waiting",
  bite: "bite",
  fight: "fight",
};

const state = {
  currency: 0,
  luck: 0,
  rodIndex: 0,
  depth: 0,
  maxDepthReached: 0,
  catches: [],
  lastSeenVersion: "",
  fishDex: {},
  focusedMode: false,
  quickTab: "dex",
  catchLog: [],
  changelogTab: "Added",
  changelogPage: 0,
  castData: { power: 0, marker: 0, markerDir: 1, sweetHit: false, zone: "Weak", depthBonus: 0, backlash: 1, tempLuckBonus: 0 },
  fishing: { phase: PHASES.idle, biteWindow: 0, biteTimer: 0, biteElapsed: 0, descensionSpeed: 0, pendingFish: null, fightProgress: 0, fishPos: 0.5, fishVel: 0.2, fishTimer: 0, tension: 0.44, inputHeld: false, cleanEligible: false, mistakes: 0, maxTensionSeen: 0 },
  stats: {
    deepestCast: 0,
    rarestCatch: "None",
    totalFishCaught: 0,
    totalCurrencyEarned: 0,
    mutationCounts: {},
    rarestMutation: "None",
    bestSingleSell: 0,
  },
};

const $ = (id) => document.getElementById(id);
const app = $("app");
const castBtn = $("castBtn");
const reelBtn = $("reelBtn");
const openRodShopBtn = $("openRodShopBtn");
const focusedModeToggle = $("focusedModeToggle");
const depthFill = $("depthFill");
const depthNeedle = $("depthNeedle");
const depthMarkers = $("depthMarkers");
const depthValue = $("depthValue");
const rodInfo = $("rodInfo");
const rodPassives = $("rodPassives");
const rodDepthGauge = $("rodDepthGauge");
const rodSpeedDial = $("rodSpeedDial");
const rodStabilityGauge = $("rodStabilityGauge");
const rodDepthValue = $("rodDepthValue");
const rodSpeedValue = $("rodSpeedValue");
const rodStabilityValue = $("rodStabilityValue");
const luckMeter = $("luckMeter");
const mutationMeter = $("mutationMeter");
const luckInfo = $("luckInfo");
const recentCatch = $("recentCatch");
const catchLog = $("catchLog");
const currency = $("currency");
const sessionEarned = $("sessionEarned");
const line = $("line");
const hook = $("hook");
const splash = $("splash");
const rodCharacter = $("rodCharacter");
const zoneLabel = $("zoneLabel");
const biomeEmblem = $("biomeEmblem");
const eventInfo = $("eventInfo");
const biomeInfo = $("biomeInfo");
const pressureValue = $("pressureValue");
const capsInfo = $("capsInfo");
const changelogBtn = $("changelogBtn");
const versionNewGem = $("versionNewGem");
const phaseInfo = $("phaseInfo");
const castPowerFill = $("castPowerFill");
const castMarker = $("castMarker");
const castSweetSpot = $("castSweetSpot");
const castInfo = $("castInfo");
const biteInfo = $("biteInfo");
const biteWindowFill = $("biteWindowFill");
const tensionWrap = $("tensionWrap");
const tensionInfo = $("tensionInfo");
const safeZone = $("safeZone");
const fishIndicator = $("fishIndicator");

const changelogModal = $("changelogModal");
const changelogStatus = $("changelogStatus");
const changelogContainer = $("changelogContainer");
const changelogTabs = $("changelogTabs");
const changePrev = $("changePrev");
const changeNext = $("changeNext");
const changePage = $("changePage");
const closeChangelogBtn = $("closeChangelogBtn");
const quickTabBody = $("quickTabBody");
const quickTabs = document.querySelectorAll(".quick-tab");

const rodModal = $("rodModal");
const rodShopContent = $("rodShopContent");
const closeRodShopBtn = $("closeRodShopBtn");
const buyRodBtn = $("buyRodBtn");

let frame = null;
let lastTick = performance.now();

function clamp(num, min, max) { return Math.max(min, Math.min(max, num)); }
function randRange([min, max]) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function formatOdds(odds) { return `1 in ${Math.round(odds).toLocaleString()}`; }
function currentRod() { return rods[state.rodIndex]; }
function getRarityRank(key) { return rarityTiers.findIndex((tier) => tier.key === key); }
function getBiome(depth) { return biomes.find((b) => depth >= b.min && depth <= b.max) || biomes[0]; }
function getDepthEligibleTiers(depth) { return rarityTiers.filter((tier) => depth >= tier.minDepth); }

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    state.currency = Number.isFinite(data.currency) ? data.currency : 0;
    state.luck = Number.isFinite(data.luck) ? data.luck : 0;
    state.rodIndex = Number.isFinite(data.rodIndex) ? clamp(data.rodIndex, 0, rods.length - 1) : 0;
    state.lastSeenVersion = typeof data.lastSeenVersion === "string" ? data.lastSeenVersion : "";
    state.focusedMode = Boolean(data.focusedMode);
    state.fishDex = data.fishDex && typeof data.fishDex === "object" ? data.fishDex : {};
    state.catchLog = Array.isArray(data.catchLog) ? data.catchLog.slice(0, 6) : [];
    if (data.stats && typeof data.stats === "object") {
      state.stats = { ...state.stats, ...data.stats, mutationCounts: data.stats.mutationCounts && typeof data.stats.mutationCounts === "object" ? data.stats.mutationCounts : {} };
    }
  } catch {
    state.lastSeenVersion = "";
  }
}

function saveGame() {
  const data = { currency: state.currency, luck: state.luck, rodIndex: state.rodIndex, lastSeenVersion: state.lastSeenVersion, fishDex: state.fishDex, stats: state.stats, focusedMode: state.focusedMode, catchLog: state.catchLog };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function semverToTuple(v) { return String(v || "0.0.0").split(".").map((part) => Number.parseInt(part, 10) || 0).slice(0, 3); }
function isVersionGreater(a, b) { const [am, ai, ap] = semverToTuple(a); const [bm, bi, bp] = semverToTuple(b); if (am !== bm) return am > bm; if (ai !== bi) return ai > bi; return ap > bp; }
function entriesSinceVersion(version) { if (!version) return changelogEntries.filter((entry) => entry.version === GAME_VERSION); return changelogEntries.filter((entry) => isVersionGreater(entry.version, version)); }

function renderChangelogTabs() {
  const sections = ["Added", "Changed", "Fixed", "Balance"];
  changelogTabs.innerHTML = sections.map((section) => `<button class="ghost ${state.changelogTab === section ? "active" : ""}" data-change-tab="${section}">${section}</button>`).join("");
  changelogTabs.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.changelogTab = btn.dataset.changeTab;
      state.changelogPage = 0;
      renderChangelogPage();
    });
  });
}

function renderChangelogPage() {
  const entries = changelogEntries.filter((entry) => entry.sections[state.changelogTab]);
  const allItems = entries.flatMap((entry) => entry.sections[state.changelogTab].map((note) => ({ note, entry })));
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(allItems.length / pageSize));
  state.changelogPage = clamp(state.changelogPage, 0, totalPages - 1);
  const pageItems = allItems.slice(state.changelogPage * pageSize, state.changelogPage * pageSize + pageSize);
  changelogContainer.innerHTML = pageItems.map(({ note, entry }) => `<article class="entry"><h3>${entry.title}</h3><div class="entry-meta">v${entry.version} · ${entry.date}</div><p>${note}</p></article>`).join("");
  changePage.textContent = `${state.changelogPage + 1}/${totalPages}`;
}

function openChangelog(auto = false) {
  changelogStatus.textContent = auto ? `NEW VERSION · v${GAME_VERSION}` : `Current Version v${GAME_VERSION}`;
  state.changelogTab = "Added";
  state.changelogPage = 0;
  renderChangelogTabs();
  renderChangelogPage();
  changelogModal.classList.add("show");
  state.lastSeenVersion = GAME_VERSION;
  versionNewGem.classList.add("hidden");
  saveGame();
}

function closeChangelog() {
  changelogModal.classList.remove("show");
}

function getLuckEffectiveness() {
  const rodLuck = currentRod().passivesMeta.luckEffectiveness || 0;
  const baseFromLuck = state.luck * 0.02;
  return clamp(baseFromLuck + rodLuck + state.castData.tempLuckBonus, 0, LUCK_EFFECTIVENESS_CAP);
}

function getMutationRelativeBonus() { return clamp(currentRod().passivesMeta.mutationRelative || 0, 0, MUTATION_RELATIVE_CAP); }
function getMinigameSafeZoneBonus() { return clamp(currentRod().passivesMeta.safeZoneBonus || 0, 0, SAFE_ZONE_CAP); }
function getReactionWindowScale() { return 1 + clamp((currentRod().passivesMeta.reactionWindowBonus || 0) / 0.7, 0, REACTION_WINDOW_CAP); }
function getFishSpeedSlow() { return clamp(currentRod().passivesMeta.fishSpeedSlow || 0, 0, FISH_SLOW_CAP); }
function getTensionStability() { return clamp(currentRod().passivesMeta.tensionStability || 0, 0, 0.2); }

function buildTierWeights(depth) {
  const biome = getBiome(depth);
  const eligible = getDepthEligibleTiers(depth);
  const weights = {};
  eligible.forEach((tier) => { weights[tier.key] = 1 / tier.odds; });
  for (const [key, bias] of Object.entries(biome.rarityBias || {})) {
    if (weights[key]) weights[key] *= 1 + clamp(bias, -BIAS_LIMIT, BIAS_LIMIT);
  }
  const rodBias = currentRod().passivesMeta.biomeBias;
  if (rodBias && rodBias.biome === biome.key && weights[rodBias.tier]) weights[rodBias.tier] *= 1 + clamp(rodBias.value, -BIAS_LIMIT, BIAS_LIMIT);
  return { weights, biome };
}

function rollTier(depth) {
  const { weights, biome } = buildTierWeights(depth);
  const luckImprovement = getLuckEffectiveness();
  const keys = Object.keys(weights);
  keys.forEach((key) => {
    const tier = rarityTiers.find((t) => t.key === key);
    const adjustedOdds = Math.max(1, tier.odds * (1 - luckImprovement));
    weights[key] *= tier.odds / adjustedOdds;
  });
  const total = keys.reduce((sum, key) => sum + weights[key], 0);
  let roll = Math.random() * total;
  for (const key of keys) {
    roll -= weights[key];
    if (roll <= 0) return { tier: rarityTiers.find((t) => t.key === key), biome, luckImprovement };
  }
  return { tier: rarityTiers[0], biome, luckImprovement };
}

function fishPoolForTier(tierKey, biome) {
  const biomePool = biome.fishPools[tierKey] || [];
  if (biomePool.length) return biomePool;
  const fallbackPools = {
    common: ["Pebblefin", "Rustscale", "Mud Carp", "Drift Minnow", "Well Guppy"],
    uncommon: ["Silver Dart", "Mossback Eel", "Ripple Trout", "Bluegill Shade", "Hollow Perch"],
    rare: ["Deep Pike", "Lantern Koi", "Blackwater Bass", "Ironjaw Catfish", "Veil Snapper"],
    epic: ["Glowfin Serpent", "Abyss Runner", "Shardscale Levi", "Phantom Ray", "Obsidian Koi"],
    legendary: ["Crowned Angler", "Depth Tyrant", "Voidfin Monarch", "Ancient Wellkeeper", "Midnight Hydra"],
    mythic: ["Celestial Leviathan", "Starbound Eel", "Gravity Wyrm", "Oracle of the Deep", "The Gilded Maw"],
    abyssal: ["The Nameless One", "Primordial Echo", "Wellheart Entity", "The Silent Colossus", "Deepwell Core"],
    unknown: ["The Endless Below"],
  };
  return fallbackPools[tierKey] || ["Nameless Fish"];
}

function rollMutation(depth) {
  const relativeBonus = getMutationRelativeBonus();
  for (const mutation of mutationTable) {
    if (mutation.key === "none" || depth < mutation.minDepth) continue;
    const adjustedOdds = Math.max(1, mutation.odds / (1 + relativeBonus));
    if (Math.random() < 1 / adjustedOdds) return { ...mutation, adjustedOdds };
  }
  const none = mutationTable.find((m) => m.key === "none");
  return { ...none, adjustedOdds: 1 };
}

function playMutationEffect(mutationKey) {
  if (mutationKey === "none") return;
  app.classList.remove("mutation-shiny", "mutation-iridescent", "mutation-gilded", "mutation-corrupted", "mutation-ethereal", "mutation-abyssTouched");
  app.classList.add(`mutation-${mutationKey}`);
  setTimeout(() => app.classList.remove(`mutation-${mutationKey}`), 1100);
}

function trackDex(name, mutationKey) {
  if (!state.fishDex[name]) state.fishDex[name] = { catches: 0, bestMutation: "none" };
  state.fishDex[name].catches += 1;
  const oldRank = mutationTable.findIndex((m) => m.key === state.fishDex[name].bestMutation);
  const newRank = mutationTable.findIndex((m) => m.key === mutationKey);
  if (newRank >= 0 && oldRank >= 0 && newRank < oldRank) state.fishDex[name].bestMutation = mutationKey;
}

function evaluateCastZone(power) {
  if (power <= 0.3) return { zone: "Weak", depthBonus: 0, backlash: 1 };
  if (power <= 0.8) return { zone: "Good", depthBonus: 0.05, backlash: 1 };
  if (power <= 0.95) return { zone: "Perfect", depthBonus: 0.12, backlash: 1 };
  return { zone: "Overcharge", depthBonus: -0.1, backlash: 1.35 };
}

function startCharge() {
  if (state.fishing.phase !== PHASES.idle) return;
  state.fishing.phase = PHASES.charging;
  state.castData.power = 0;
  state.castData.marker = Math.random();
  state.castData.markerDir = 1;
  state.castData.tempLuckBonus = 0;
  phaseInfo.textContent = "Charging cast power...";
  castBtn.textContent = "Release to Throw";
}

function releaseCharge() {
  if (state.fishing.phase !== PHASES.charging) return;
  const cast = evaluateCastZone(state.castData.power);
  const sweetStart = 0.56;
  const sweetEnd = 0.68;
  const sweetHit = state.castData.marker >= sweetStart && state.castData.marker <= sweetEnd;
  state.castData.sweetHit = sweetHit;
  state.castData.zone = cast.zone;
  state.castData.depthBonus = cast.depthBonus;
  state.castData.backlash = cast.backlash;
  state.castData.tempLuckBonus = sweetHit ? 0.02 : 0;

  rodCharacter.classList.add("throwing");
  setTimeout(() => rodCharacter.classList.remove("throwing"), 180);
  splash.classList.remove("show");
  void splash.offsetWidth;
  splash.classList.add("show");

  beginWaitingPhase();
}

function beginWaitingPhase() {
  const rod = currentRod();
  const castDepthStart = clamp(rod.maxDepth * state.castData.depthBonus, 0, rod.maxDepth);
  state.depth = castDepthStart;
  state.maxDepthReached = castDepthStart;
  state.fishing.phase = PHASES.waiting;
  state.fishing.cleanEligible = state.castData.zone === "Perfect";
  state.fishing.mistakes = 0;
  state.fishing.maxTensionSeen = 0;
  state.fishing.descensionSpeed = rod.depthSpeed * 27;
  state.fishing.biteElapsed = 0;
  state.fishing.pendingFish = null;

  const biome = getBiome(state.depth);
  const depthFactor = clamp(state.depth / rod.maxDepth, 0.08, 1);
  const base = 2.1 - depthFactor * 1.25;
  const rodFactor = clamp(10 / rod.depthSpeed, 0.55, 1.2);
  const delay = clamp(base * rodFactor * state.castData.backlash / biome.biteBias, 0.35, 3);
  state.fishing.biteTimer = delay;

  castBtn.disabled = true;
  reelBtn.disabled = false;
  castBtn.textContent = "Hold to Cast";
}

function triggerBite() {
  const depthReached = Math.floor(state.maxDepthReached);
  const { tier, biome, luckImprovement } = rollTier(depthReached);
  const windowBase = tier.reaction[0] - Math.random() * (tier.reaction[0] - tier.reaction[1]);
  const window = windowBase * getReactionWindowScale();
  state.fishing.pendingFish = { tier, biome, depthReached, luckImprovement };
  state.fishing.biteWindow = window;
  state.fishing.biteElapsed = 0;
  state.fishing.phase = PHASES.bite;
  hook.classList.add("biting");
}

function onReelAction() {
  if (state.fishing.phase === PHASES.waiting) {
    failBite("false");
    return;
  }
  if (state.fishing.phase === PHASES.bite) {
    startFightPhase();
  }
}

function failBite(type) {
  const pendingTier = state.fishing.pendingFish?.tier || rarityTiers[0];
  const depth = Math.floor(state.maxDepthReached);
  state.fishing.phase = PHASES.waiting;
  state.fishing.mistakes += 1;
  state.fishing.cleanEligible = false;
  hook.classList.remove("biting");

  const penalty = type === "false" ? 1.24 : 1.12;
  state.fishing.biteTimer = clamp((0.8 + Math.random() * 0.9) * penalty, 0.5, 2.6);
  state.fishing.biteElapsed = 0;

  const reason = type === "false" ? "False hook!" : "Too late!";
  recentCatch.innerHTML = `<div class="catch-name">${reason}</div><div class="catch-sub">Something ${pendingTier.name} slipped away…</div><div class="catch-sub">Depth: ${depth.toLocaleString()}m</div><div class="catch-sub">Stay focused and try again.</div>`;
  addCatchLog(`${reason} · ${pendingTier.name} escaped`, pendingTier.key);
}

function startFightPhase() {
  const pending = state.fishing.pendingFish;
  if (!pending) return;
  const tier = pending.tier;
  state.fishing.phase = PHASES.fight;
  state.fishing.fightProgress = 0;
  state.fishing.fishPos = 0.5;
  state.fishing.fishVel = (Math.random() > 0.5 ? 1 : -1) * tier.fishSpeed;
  state.fishing.fishTimer = 0;
  state.fishing.tension = 0.45;
  state.fishing.maxTensionSeen = 0;
  state.fishing.cleanEligible = state.fishing.cleanEligible && state.fishing.mistakes === 0;
  hook.classList.remove("biting");
}

function completeCatch() {
  const rod = currentRod();
  const pending = state.fishing.pendingFish;
  const depthReached = pending.depthReached;
  const tier = pending.tier;
  const biome = pending.biome;
  const fishPool = fishPoolForTier(tier.key, biome);
  const name = fishPool[Math.floor(Math.random() * fishPool.length)];
  const mutation = rollMutation(depthReached);
  let value = randRange(tier.value);

  if ((rod.passivesMeta.sellBoostUncommonPlus || 0) > 0 && getRarityRank(tier.key) >= getRarityRank("uncommon")) value *= 1 + rod.passivesMeta.sellBoostUncommonPlus;
  if ((rod.passivesMeta.legendaryValueBoost || 0) > 0 && tier.key === "legendary") value *= 1 + rod.passivesMeta.legendaryValueBoost;
  const focusedMultiplier = state.focusedMode ? 1.15 : 1;
  let cleanBonus = 1;
  if (state.fishing.cleanEligible && state.fishing.maxTensionSeen < 0.8 && state.castData.zone === "Perfect") cleanBonus = 1.05;

  value = Math.round(value * mutation.multiplier * focusedMultiplier * cleanBonus);

  const catchItem = { name, tier: tier.name, key: tier.key, mutation: mutation.name, mutationKey: mutation.key, value, biome: biome.title, depthReached, luckApplied: Math.round(pending.luckImprovement * 100), mutationOddsText: mutation.key === "none" ? "None" : formatOdds(mutation.odds), finalMultiplierText: `${mutation.multiplier.toFixed(mutation.multiplier % 1 ? 1 : 0)}x` };
  state.catches.push(catchItem);
  state.stats.totalFishCaught += 1;
  state.stats.mutationCounts[mutation.key] = (state.stats.mutationCounts[mutation.key] || 0) + 1;
  if (depthReached > state.stats.deepestCast) state.stats.deepestCast = depthReached;
  const oldRank = getRarityRank(state.stats.rarestCatch.toLowerCase());
  const newRank = getRarityRank(catchItem.key);
  if (state.stats.rarestCatch === "None" || newRank > oldRank) state.stats.rarestCatch = catchItem.tier;
  const rarestMutation = mutationTable.find((m) => m.name === state.stats.rarestMutation)?.key || "none";
  const oldMutationRank = mutationTable.findIndex((m) => m.key === rarestMutation);
  const newMutationRank = mutationTable.findIndex((m) => m.key === mutation.key);
  if (state.stats.rarestMutation === "None" || (newMutationRank >= 0 && newMutationRank < oldMutationRank)) state.stats.rarestMutation = mutation.name;

  trackDex(name, mutation.key);
  playMutationEffect(mutation.key);

  const cleanText = cleanBonus > 1 ? `<div class="catch-sub">Clean Catch Bonus: +5% value</div>` : "";
  const focusText = state.focusedMode ? `<div class="catch-sub">Focused Reeling Bonus: +15% value</div>` : "";
  recentCatch.innerHTML = `<div class="catch-name">${catchItem.name}</div><div><span class="rarity-${catchItem.key}">${catchItem.tier}</span> – ${formatOdds(tier.odds)}</div><div class="catch-sub">Mutation: ${catchItem.mutation} ${catchItem.mutationKey === "none" ? "" : `– ${catchItem.mutationOddsText}`}</div><div class="catch-sub">Depth: ${catchItem.depthReached.toLocaleString()}m · Biome: ${catchItem.biome}</div>${cleanText}${focusText}`;
  addCatchLog(`${catchItem.name} +₵${catchItem.value.toLocaleString()}`, catchItem.key);

  resetToIdle();
  saveGame();
}

function loseFight(reason) {
  const pendingTier = state.fishing.pendingFish?.tier || rarityTiers[0];
  recentCatch.innerHTML = `<div class="catch-name">${reason}</div><div class="catch-sub">Something ${pendingTier.name} slipped away…</div><div class="catch-sub">Depth: ${Math.floor(state.maxDepthReached).toLocaleString()}m</div><div class="catch-sub">Retry and keep tension centered.</div>`;
  addCatchLog(`${reason}`, pendingTier.key);
  state.fishing.cleanEligible = false;
  resetToIdle();
}

function resetToIdle() {
  state.fishing.phase = PHASES.idle;
  state.fishing.pendingFish = null;
  state.fishing.inputHeld = false;
  state.depth = 0;
  state.maxDepthReached = 0;
  state.castData.tempLuckBonus = 0;
  hook.classList.remove("biting");
  castBtn.disabled = false;
  reelBtn.disabled = true;
}

function sellAll() {
  if (!state.catches.length) return;
  const total = state.catches.reduce((sum, fish) => sum + fish.value, 0);
  state.currency += total;
  state.stats.totalCurrencyEarned += total;
  state.stats.bestSingleSell = Math.max(state.stats.bestSingleSell, total);
  state.catches = [];
  recentCatch.textContent = `Sold haul for ₵ ${total.toLocaleString()}. Cast again.`;
  addCatchLog(`Sold basket +₵${total.toLocaleString()}`, "uncommon");
  saveGame();
}

function addCatchLog(text, rarity = "common") {
  state.catchLog.unshift({ text, rarity });
  state.catchLog = state.catchLog.slice(0, 6);
}

function renderQuickTab() {
  quickTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === state.quickTab));
  if (state.quickTab === "dex") {
    const entries = Object.entries(state.fishDex);
    quickTabBody.innerHTML = entries.length
      ? entries.slice(0, 6).map(([name, data]) => `<div>${name} · ${data.catches} caught</div>`).join("")
      : "<div>No fish logged yet.</div>";
  } else if (state.quickTab === "sell") {
    const basket = state.catches.slice(0, 8).map((fish) => `<div>${fish.name} · ₵ ${fish.value.toLocaleString()}</div>`).join("");
    quickTabBody.innerHTML = `<button id="sellAllBtn" class="primary">Sell All</button>${basket || "<div>Basket empty.</div>"}`;
    const sellButton = $("sellAllBtn");
    if (sellButton) sellButton.addEventListener("click", sellAll);
  } else {
    quickTabBody.innerHTML = "<div>Market telemetry online.</div><div>Buy/sell pricing lens coming soon.</div>";
  }
}

function updateZone() {
  const biome = getBiome(state.maxDepthReached || state.depth || 0);
  app.classList.remove("zone-shallows", "zone-kelp", "zone-twilight", "zone-lantern", "zone-trench", "zone-voidwell");
  app.classList.add(biome.className);
  zoneLabel.textContent = biome.title;
  biomeInfo.textContent = biome.ambience;
  biomeEmblem.textContent = ["◈", "✶", "◉", "⬢", "⬣", "✹"][biomes.findIndex((b) => b.key === biome.key)] || "◈";
}

function render() {
  const rod = currentRod();
  const globalMaxDepth = rods[rods.length - 1].maxDepth;
  currency.textContent = `₵ ${Math.floor(state.currency).toLocaleString()}`;
  sessionEarned.textContent = `₵ ${Math.floor(state.stats.totalCurrencyEarned).toLocaleString()}`;
  luckInfo.textContent = `${Math.round(getLuckEffectiveness() * 100)}% / ${Math.round(LUCK_EFFECTIVENESS_CAP * 100)}% cap`;
  capsInfo.textContent = `${Math.round(getMutationRelativeBonus() * 100)}% / ${Math.round(MUTATION_RELATIVE_CAP * 100)}% cap`;
  luckMeter.style.width = `${(getLuckEffectiveness() / LUCK_EFFECTIVENESS_CAP) * 100}%`;
  mutationMeter.style.width = `${(getMutationRelativeBonus() / MUTATION_RELATIVE_CAP) * 100}%`;

  rodInfo.innerHTML = `<strong>${rod.name}</strong><br><small>Tier ${state.rodIndex + 1} assembly</small>`;
  rodPassives.innerHTML = rod.passives.map((passive) => `<span class="chip" title="Passive effect">${passive}</span>`).join("");
  rodDepthGauge.style.width = `${(rod.maxDepth / globalMaxDepth) * 100}%`;
  rodSpeedDial.style.width = `${(rod.depthSpeed / rods[rods.length - 1].depthSpeed) * 100}%`;
  rodStabilityGauge.style.width = `${(getTensionStability() / 0.2) * 100}%`;
  rodDepthValue.textContent = `${rod.maxDepth}m`;
  rodSpeedValue.textContent = `${rod.depthSpeed.toFixed(1)} m/s`;
  rodStabilityValue.textContent = `${Math.round(getTensionStability() * 100)}%`;

  depthValue.textContent = `${Math.floor(state.depth)}m`;
  const meterHeight = clamp((state.depth / globalMaxDepth) * 100, 0, 100);
  depthFill.style.height = `${meterHeight}%`;
  depthNeedle.style.top = `${100 - meterHeight}%`;
  line.style.height = `${meterHeight}%`;
  hook.style.top = `${clamp(4 + meterHeight, 4, 98)}%`;
  pressureValue.textContent = `${Math.round((state.depth / globalMaxDepth) * 100).toString().padStart(2, "0")}%`;

  depthMarkers.innerHTML = biomes.map((biome) => {
    const pos = clamp((biome.min / globalMaxDepth) * 100, 0, 100);
    return `<span style="position:absolute;left:6px;right:6px;top:${100 - pos}%;height:1px;background:rgba(190,220,245,0.2)"></span>`;
  }).join("");

  catchLog.innerHTML = state.catchLog.map((item, idx) => `<div class="log-pill rarity-${item.rarity}" style="opacity:${1 - idx * 0.1}">${item.text}</div>`).join("") || "<div class='catch-sub'>No events yet.</div>";

  focusedModeToggle.checked = state.focusedMode;
  castPowerFill.style.width = `${(state.castData.power * 100).toFixed(1)}%`;
  castMarker.style.left = `${(state.castData.marker * 100).toFixed(1)}%`;

  const safeWidth = clamp((0.2 + getMinigameSafeZoneBonus()) * 100, 8, 70);
  safeZone.style.width = `${safeWidth}%`;
  safeZone.style.left = `${clamp((state.fishing.tension - (safeWidth / 200)) * 100, 0, 100 - safeWidth)}%`;
  fishIndicator.style.left = `${clamp(state.fishing.fishPos * 100, 1, 98)}%`;

  if (state.fishing.phase === PHASES.idle) {
    phaseInfo.textContent = "Hold cast to charge.";
    biteWindowFill.style.width = "0%";
    biteInfo.textContent = "Sonar idle. Awaiting contact.";
    tensionInfo.textContent = "Pressure stabilizer idle.";
  } else if (state.fishing.phase === PHASES.charging) {
    phaseInfo.textContent = `Charging: ${Math.round(state.castData.power * 100)}% (${state.castData.zone})`;
    castInfo.textContent = state.castData.sweetHit ? "Sweet spot ready (+2% cast luck)." : "Release in sweet spot for +2% cast luck.";
  } else if (state.fishing.phase === PHASES.waiting) {
    phaseInfo.textContent = `Waiting at ${Math.floor(state.depth)}m — sonar pinging.`;
    biteInfo.textContent = "Click too early causes a false hook.";
  } else if (state.fishing.phase === PHASES.bite) {
    phaseInfo.textContent = "BITE SIGNATURE DETECTED";
    biteWindowFill.style.width = `${(1 - state.fishing.biteElapsed / state.fishing.biteWindow) * 100}%`;
    biteInfo.textContent = `Reaction window: ${state.fishing.biteWindow.toFixed(2)}s`;
  } else if (state.fishing.phase === PHASES.fight) {
    phaseInfo.textContent = "LINE STRAIN ACTIVE";
    tensionInfo.textContent = `Progress ${(state.fishing.fightProgress * 100).toFixed(0)}% · Tension ${(state.fishing.tension * 100).toFixed(0)}%`;
  }

  eventInfo.innerHTML = `<span class="chip">Focused ${state.focusedMode ? "ON" : "OFF"}</span><span class="chip">Biome bias active</span>`;
  renderQuickTab();
  updateZone();
}

function updateLoop(now) {
  const delta = (now - lastTick) / 1000;
  lastTick = now;

  if (state.fishing.phase === PHASES.charging) {
    state.castData.power = clamp(state.castData.power + delta * 0.5, 0, 1);
    const cast = evaluateCastZone(state.castData.power);
    state.castData.zone = cast.zone;
    state.castData.depthBonus = cast.depthBonus;
    state.castData.backlash = cast.backlash;
    state.castData.marker += state.castData.markerDir * delta * 0.85;
    if (state.castData.marker >= 1 || state.castData.marker <= 0) {
      state.castData.marker = clamp(state.castData.marker, 0, 1);
      state.castData.markerDir *= -1;
    }
  }

  if (state.fishing.phase === PHASES.waiting) {
    const rod = currentRod();
    state.depth = clamp(state.depth + state.fishing.descensionSpeed * delta, 0, rod.maxDepth);
    state.maxDepthReached = Math.max(state.maxDepthReached, state.depth);
    state.fishing.biteElapsed += delta;
    if (state.fishing.biteElapsed >= state.fishing.biteTimer) triggerBite();
  }

  if (state.fishing.phase === PHASES.bite) {
    state.fishing.biteElapsed += delta;
    biteWindowFill.style.width = `${(1 - state.fishing.biteElapsed / state.fishing.biteWindow) * 100}%`;
    if (state.fishing.biteElapsed > state.fishing.biteWindow) failBite("late");
  }

  if (state.fishing.phase === PHASES.fight) {
    const tier = state.fishing.pendingFish.tier;
    const focusedScale = state.focusedMode ? 1.22 : 1;
    const fishSpeed = tier.fishSpeed * (1 - getFishSpeedSlow()) * focusedScale;
    state.fishing.fishTimer += delta;
    if (state.fishing.fishTimer >= 0.48) {
      state.fishing.fishTimer = 0;
      if (Math.random() < (tier.key === "abyssal" ? 0.5 : 0.28)) state.fishing.fishVel *= -1;
      state.fishing.fishVel += (Math.random() - 0.5) * 0.4;
    }

    state.fishing.fishPos += state.fishing.fishVel * fishSpeed * delta;
    if (state.fishing.fishPos <= 0 || state.fishing.fishPos >= 1) {
      state.fishing.fishPos = clamp(state.fishing.fishPos, 0, 1);
      state.fishing.fishVel *= -1;
    }

    const safeWidth = clamp(tier.safeZone + getMinigameSafeZoneBonus(), 0.08, 0.5);
    const safeMin = clamp(state.fishing.tension - safeWidth / 2, 0, 1);
    const safeMax = clamp(state.fishing.tension + safeWidth / 2, 0, 1);
    const fishInside = state.fishing.fishPos >= safeMin && state.fishing.fishPos <= safeMax;

    const pullRate = 0.48;
    const releaseRate = 0.36;
    state.fishing.tension += (state.fishing.inputHeld ? pullRate : -releaseRate) * delta;
    state.fishing.tension += (fishInside ? -0.07 : 0.09) * delta;
    state.fishing.tension *= 1 - getTensionStability() * 0.2;
    state.fishing.tension = clamp(state.fishing.tension, 0, 1);
    state.fishing.maxTensionSeen = Math.max(state.fishing.maxTensionSeen, state.fishing.tension);

    if (fishInside) state.fishing.fightProgress += delta / randRange(tier.fight);
    else state.fishing.fightProgress -= delta * 0.18;
    state.fishing.fightProgress = clamp(state.fishing.fightProgress, 0, 1);

    if (state.fishing.tension >= 0.995) loseFight("Line snapped!");
    if (state.fishing.tension <= 0.005) loseFight("Fish escaped!");
    if (state.fishing.fightProgress >= 1) completeCatch();
  }

  render();
  frame = requestAnimationFrame(updateLoop);
}

function holdCastStart(e) {
  e.preventDefault();
  startCharge();
}

function holdCastEnd(e) {
  e.preventDefault();
  releaseCharge();
}

castBtn.addEventListener("mousedown", holdCastStart);
castBtn.addEventListener("touchstart", holdCastStart, { passive: false });
window.addEventListener("mouseup", holdCastEnd);
window.addEventListener("touchend", holdCastEnd, { passive: false });
reelBtn.addEventListener("click", onReelAction);
openRodShopBtn.addEventListener("click", openRodShop);
focusedModeToggle.addEventListener("change", () => { state.focusedMode = focusedModeToggle.checked; saveGame(); });
changelogBtn.addEventListener("click", () => openChangelog(false));
closeChangelogBtn.addEventListener("click", () => closeChangelog());
changePrev.addEventListener("click", () => { state.changelogPage -= 1; renderChangelogPage(); });
changeNext.addEventListener("click", () => { state.changelogPage += 1; renderChangelogPage(); });
quickTabs.forEach((tab) => tab.addEventListener("click", () => { state.quickTab = tab.dataset.tab; renderQuickTab(); }));
closeRodShopBtn.addEventListener("click", () => rodModal.classList.remove("show"));
buyRodBtn.addEventListener("click", buyNextRod);

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    if (state.fishing.phase === PHASES.idle) startCharge();
    else if (state.fishing.phase === PHASES.charging) releaseCharge();
    else onReelAction();
  }
  if (e.key.toLowerCase() === "f") state.fishing.inputHeld = true;
  if (e.key.toLowerCase() === "c") openChangelog(false);
});
window.addEventListener("keyup", (e) => {
  if (e.key.toLowerCase() === "f") state.fishing.inputHeld = false;
});

tensionWrap.addEventListener("mousedown", () => { state.fishing.inputHeld = true; });
window.addEventListener("mouseup", () => { state.fishing.inputHeld = false; });
window.addEventListener("touchstart", () => { if (state.fishing.phase === PHASES.fight) state.fishing.inputHeld = true; }, { passive: true });
window.addEventListener("touchend", () => { state.fishing.inputHeld = false; }, { passive: true });

function openRodShop() {
  const current = currentRod();
  const next = rods[state.rodIndex + 1];
  if (!next) {
    rodShopContent.innerHTML = `<p>You already own the final rod: <strong>${current.name}</strong>.</p>`;
    buyRodBtn.disabled = true;
  } else {
    const canAfford = state.currency >= next.price;
    rodShopContent.innerHTML = `<div class="rod-compare-grid"><div><h4>Current: ${current.name}</h4><ul><li>DepthSpeed: ${current.depthSpeed} m/s</li><li>MaxDepth: ${current.maxDepth}m</li><li>${current.passives.join(" · ")}</li></ul></div><div><h4>Next: ${next.name}</h4><ul><li>DepthSpeed: ${next.depthSpeed} m/s</li><li>MaxDepth: ${next.maxDepth}m</li><li>${next.passives.join(" · ")}</li></ul><p>Cost: ₵ ${next.price.toLocaleString()}</p></div></div>`;
    buyRodBtn.disabled = !canAfford;
    buyRodBtn.textContent = canAfford ? `Buy ${next.name}` : `Need ₵ ${(next.price - state.currency).toLocaleString()} more`;
  }
  rodModal.classList.add("show");
}

function buyNextRod() {
  const next = rods[state.rodIndex + 1];
  if (!next || state.currency < next.price) return;
  state.currency -= next.price;
  state.rodIndex += 1;
  recentCatch.textContent = `${next.name} equipped.`;
  addCatchLog(`${next.name} equipped`, "rare");
  saveGame();
  rodModal.classList.remove("show");
}

loadSave();
changelogBtn.firstChild.textContent = `v${GAME_VERSION} `;
if (state.lastSeenVersion !== GAME_VERSION) versionNewGem.classList.remove("hidden");
render();
frame = requestAnimationFrame(updateLoop);
window.addEventListener("beforeunload", saveGame);
