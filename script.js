const GAME_VERSION = "0.4.2";

const changelogEntries = [
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
  {
    version: "0.4.1",
    date: "2026-01-29",
    title: "Pressurelines",
    sections: {
      Added: ["Expanded fish roster and rarity guide improvements."],
      Changed: ["Well ambience and particle rendering polish."],
      Fixed: ["Reel timing jitter in low FPS situations."],
      Balance: ["Mid-depth values nudged up slightly for smoother economy."],
    },
  },
  {
    version: "0.4.0",
    date: "2026-01-17",
    title: "Cold Wake",
    sections: {
      Added: ["Core fishing loop, sell flow, and base progression."],
      Changed: ["Rarity math now clearly surfaced in HUD."],
      Fixed: ["General UI readability updates."],
      Balance: ["Base odds table standardized around global 1-in-X identity."],
    },
  },
];

const rarityTiers = [
  { name: "Common", key: "common", minDepth: 0, odds: 2, value: [8, 16] },
  { name: "Uncommon", key: "uncommon", minDepth: 100, odds: 5, value: [24, 44] },
  { name: "Rare", key: "rare", minDepth: 300, odds: 15, value: [72, 130] },
  { name: "Epic", key: "epic", minDepth: 700, odds: 75, value: [220, 380] },
  { name: "Legendary", key: "legendary", minDepth: 1500, odds: 400, value: [700, 1200] },
  { name: "Mythic", key: "mythic", minDepth: 3000, odds: 2000, value: [2100, 4200] },
  { name: "Abyssal", key: "abyssal", minDepth: 3000, odds: 25000, value: [7000, 14000] },
  {
    name: "??? Tier",
    key: "unknown",
    minDepth: 5000,
    odds: 1000000,
    value: [50000, 50000],
    hidden: true,
  },
];

const biomes = [
  {
    key: "shallows",
    title: "Shallows",
    min: 0,
    max: 99,
    className: "zone-shallows",
    ambience: "Calm surface water",
    rarityBias: {},
    fishPools: {
      common: ["Pebblefin", "Rustscale", "Mud Carp", "Drift Minnow"],
      uncommon: ["Silver Dart", "Ripple Trout"],
    },
  },
  {
    key: "kelp",
    title: "Kelp Veil",
    min: 100,
    max: 299,
    className: "zone-kelp",
    ambience: "Kelp sway and softened current",
    rarityBias: { uncommon: 0.08, common: -0.06 },
    fishPools: {
      common: ["Kelp Nibbler", "Verdant Guppy"],
      uncommon: ["Frond Eel", "Mossback Eel", "Bluegill Shade", "Hollow Perch"],
      rare: ["Veil Snapper"],
    },
  },
  {
    key: "twilight",
    title: "Twilight Shelf",
    min: 300,
    max: 699,
    className: "zone-twilight",
    ambience: "Drifting particles in deep blue",
    rarityBias: { rare: 0.06, uncommon: -0.05 },
    fishPools: {
      uncommon: ["Slate Gazer", "Twilight Perch"],
      rare: ["Lantern Koi", "Blackwater Bass", "Ironjaw Catfish", "Shelf Runner"],
      epic: ["Abyss Runner"],
    },
  },
  {
    key: "lantern",
    title: "Lantern Deep",
    min: 700,
    max: 1499,
    className: "zone-lantern",
    ambience: "Bioluminescent hum",
    rarityBias: { epic: 0.08, rare: -0.08 },
    fishPools: {
      rare: ["Lantern Koi", "Night Veil Snapper"],
      epic: ["Glowfin Serpent", "Phantom Ray", "Obsidian Koi", "Shardscale Levi"],
      legendary: ["Midnight Hydra"],
    },
  },
  {
    key: "trench",
    title: "Abyssal Trench",
    min: 1500,
    max: 2999,
    className: "zone-trench",
    ambience: "Pressure creaks and dark fog",
    rarityBias: { legendary: 0.06, epic: -0.04 },
    fishPools: {
      epic: ["Trench Manta", "Rift Lurker"],
      legendary: ["Depth Tyrant", "Ancient Wellkeeper", "Midnight Hydra", "Crowned Angler"],
      mythic: ["Gravity Wyrm"],
    },
  },
  {
    key: "voidwell",
    title: "Voidwell",
    min: 3000,
    max: Infinity,
    className: "zone-voidwell",
    ambience: "Ominous low drone and depth dust",
    rarityBias: { mythic: 0.04, legendary: -0.03 },
    fishPools: {
      legendary: ["Voidfin Monarch", "Null Angler"],
      mythic: ["Celestial Leviathan", "Oracle of the Deep", "The Gilded Maw", "Starbound Eel"],
      abyssal: ["The Nameless One", "Primordial Echo", "Deepwell Core", "Wellheart Entity"],
      unknown: ["The Endless Below"],
    },
  },
];

const mutationTable = [
  { name: "Abyss-Touched", key: "abyssTouched", odds: 50000, multiplier: 60, minDepth: 3000, fx: "Abyssal bass hit" },
  { name: "Ethereal", key: "ethereal", odds: 10000, multiplier: 25, minDepth: 0, fx: "Faint glow + airy chime" },
  { name: "Corrupted", key: "corrupted", odds: 2500, multiplier: 10, minDepth: 0, fx: "Dark particles + low rumble" },
  { name: "Gilded", key: "gilded", odds: 1000, multiplier: 6, minDepth: 0, fx: "Gold rim + coin ring" },
  { name: "Iridescent", key: "iridescent", odds: 250, multiplier: 2.5, minDepth: 0, fx: "Shifting outline glow" },
  { name: "Shiny", key: "shiny", odds: 50, multiplier: 1.5, minDepth: 0, fx: "Subtle sparkle trail" },
  { name: "None", key: "none", odds: 1, multiplier: 1, minDepth: 0, fx: "No mutation" },
];

const rods = [
  {
    name: "Starter Reed",
    depthSpeed: 8,
    maxDepth: 250,
    castTime: 8.0,
    passives: ["No passive"],
    passivesMeta: {},
    price: 0,
  },
  {
    name: "Spoolwood",
    depthSpeed: 10,
    maxDepth: 400,
    castTime: 7.5,
    passives: ["+2% luck effectiveness"],
    passivesMeta: { luckEffectiveness: 0.02 },
    price: 200,
  },
  {
    name: "Deepline",
    depthSpeed: 12,
    maxDepth: 650,
    castTime: 7.0,
    passives: ["+5% sell value for Uncommon+"],
    passivesMeta: { sellBoostUncommonPlus: 0.05 },
    price: 440,
  },
  {
    name: "Lantern Rod",
    depthSpeed: 14,
    maxDepth: 1100,
    castTime: 6.6,
    passives: ["+3% Epic weight in Lantern Deep"],
    passivesMeta: { biomeBias: { biome: "lantern", tier: "epic", value: 0.03 } },
    price: 1056,
  },
  {
    name: "Trenchpiercer",
    depthSpeed: 16,
    maxDepth: 1900,
    castTime: 6.3,
    passives: ["+4% luck effectiveness"],
    passivesMeta: { luckEffectiveness: 0.04 },
    price: 2745,
  },
  {
    name: "Obsidian Reel",
    depthSpeed: 18,
    maxDepth: 2900,
    castTime: 6.1,
    passives: ["+2% mutation relative odds"],
    passivesMeta: { mutationRelative: 0.02 },
    price: 7686,
  },
  {
    name: "Voidspindle",
    depthSpeed: 20,
    maxDepth: 4200,
    castTime: 6.0,
    passives: ["+5% Legendary sell value", "+1% Mythic weight in Voidwell"],
    passivesMeta: {
      legendaryValueBoost: 0.05,
      biomeBias: { biome: "voidwell", tier: "mythic", value: 0.01 },
    },
    price: 23058,
  },
  {
    name: "Deepwell Core Rod",
    depthSpeed: 22,
    maxDepth: 6000,
    castTime: 6.0,
    passives: ["Echo Pull: 1 in 250 cast rolls pool at +15% depth", "+2% luck effectiveness"],
    passivesMeta: { luckEffectiveness: 0.02, echoPull: { chance: 250, depthGain: 0.15 } },
    price: 76091,
  },
];

const SAVE_KEY = "deepwell-save-v2";
const LUCK_EFFECTIVENESS_CAP = 0.2;
const MUTATION_RELATIVE_CAP = 0.1;
const CAST_TIME_FLOOR = 6.0;
const BIAS_LIMIT = 0.1;

const state = {
  currency: 0,
  luck: 0,
  rodIndex: 0,
  depth: 0,
  maxDepthReached: 0,
  isCasting: false,
  castElapsed: 0,
  catches: [],
  lastSeenVersion: "",
  changelogDismissedThisSession: false,
  fishDex: {},
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
const sellAllBtn = $("sellAllBtn");
const openRodShopBtn = $("openRodShopBtn");
const depthFill = $("depthFill");
const depthValue = $("depthValue");
const rodInfo = $("rodInfo");
const luckInfo = $("luckInfo");
const recentCatch = $("recentCatch");
const statsList = $("stats");
const currency = $("currency");
const line = $("line");
const hook = $("hook");
const zoneLabel = $("zoneLabel");
const eventInfo = $("eventInfo");
const rarityList = $("rarityList");
const biomeInfo = $("biomeInfo");
const capsInfo = $("capsInfo");
const dexInfo = $("dexInfo");
const changelogBtn = $("changelogBtn");

const changelogModal = $("changelogModal");
const changelogStatus = $("changelogStatus");
const changelogContainer = $("changelogContainer");
const closeChangelogBtn = $("closeChangelogBtn");
const dontShowVersion = $("dontShowVersion");

const rodModal = $("rodModal");
const rodShopContent = $("rodShopContent");
const closeRodShopBtn = $("closeRodShopBtn");
const buyRodBtn = $("buyRodBtn");

let frame = null;
let lastTick = performance.now();

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function randRange([min, max]) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatOdds(odds) {
  return `1 in ${Math.round(odds).toLocaleString()}`;
}

function currentRod() {
  return rods[state.rodIndex];
}

function getRarityRank(key) {
  return rarityTiers.findIndex((tier) => tier.key === key);
}

function getBiome(depth) {
  return biomes.find((b) => depth >= b.min && depth <= b.max) || biomes[0];
}

function getDepthEligibleTiers(depth) {
  return rarityTiers.filter((tier) => depth >= tier.minDepth);
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return;

    state.currency = Number.isFinite(data.currency) ? data.currency : 0;
    state.luck = Number.isFinite(data.luck) ? data.luck : 0;
    state.rodIndex = Number.isFinite(data.rodIndex) ? clamp(data.rodIndex, 0, rods.length - 1) : 0;
    state.lastSeenVersion = typeof data.lastSeenVersion === "string" ? data.lastSeenVersion : "";
    state.fishDex = data.fishDex && typeof data.fishDex === "object" ? data.fishDex : {};

    if (data.stats && typeof data.stats === "object") {
      state.stats = {
        ...state.stats,
        ...data.stats,
        mutationCounts: data.stats.mutationCounts && typeof data.stats.mutationCounts === "object" ? data.stats.mutationCounts : {},
      };
    }
  } catch {
    // corrupted saves are treated as new player state
    state.lastSeenVersion = "";
  }
}

function saveGame() {
  const data = {
    currency: state.currency,
    luck: state.luck,
    rodIndex: state.rodIndex,
    lastSeenVersion: state.lastSeenVersion,
    fishDex: state.fishDex,
    stats: state.stats,
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function semverToTuple(v) {
  return String(v || "0.0.0")
    .split(".")
    .map((part) => Number.parseInt(part, 10) || 0)
    .slice(0, 3);
}

function isVersionGreater(a, b) {
  const [am, ai, ap] = semverToTuple(a);
  const [bm, bi, bp] = semverToTuple(b);
  if (am !== bm) return am > bm;
  if (ai !== bi) return ai > bi;
  return ap > bp;
}

function entriesSinceVersion(version) {
  if (!version) {
    return changelogEntries.filter((entry) => entry.version === GAME_VERSION);
  }
  return changelogEntries.filter((entry) => isVersionGreater(entry.version, version));
}

function openChangelog(auto = false) {
  const unseenEntries = entriesSinceVersion(state.lastSeenVersion);
  const entries = auto ? unseenEntries : changelogEntries;
  const isNewPlayer = !state.lastSeenVersion;

  changelogStatus.innerHTML = auto
    ? `<span class="badge">NEW VERSION!</span> v${GAME_VERSION}${isNewPlayer ? " · Welcome to Deepwell." : ""}`
    : `Deepwell changelog · current v${GAME_VERSION}`;

  changelogContainer.innerHTML = entries
    .map((entry) => {
      const sections = Object.entries(entry.sections)
        .map(
          ([section, notes]) => `<details open>
            <summary>${section}</summary>
            <ul>${notes.map((note) => `<li>${note}</li>`).join("")}</ul>
          </details>`
        )
        .join("");
      return `<article class="entry">
        <h3>${entry.title}</h3>
        <div class="entry-meta">v${entry.version} · ${entry.date}</div>
        ${sections}
      </article>`;
    })
    .join("");

  changelogModal.classList.add("show");
  if (auto) {
    eventInfo.textContent = "Since you last played: changelog available.";
  }
}

function closeChangelog(markSeen = true) {
  changelogModal.classList.remove("show");
  if (markSeen || dontShowVersion.checked) {
    state.lastSeenVersion = GAME_VERSION;
    saveGame();
  }
}

function getLuckEffectiveness() {
  const rodLuck = currentRod().passivesMeta.luckEffectiveness || 0;
  const baseFromLuck = state.luck * 0.02;
  return clamp(baseFromLuck + rodLuck, 0, LUCK_EFFECTIVENESS_CAP);
}

function getMutationRelativeBonus() {
  const rodBonus = currentRod().passivesMeta.mutationRelative || 0;
  return clamp(rodBonus, 0, MUTATION_RELATIVE_CAP);
}

function buildTierWeights(depth) {
  const biome = getBiome(depth);
  const eligible = getDepthEligibleTiers(depth);
  const weights = {};

  eligible.forEach((tier) => {
    weights[tier.key] = 1 / tier.odds;
  });

  for (const [key, bias] of Object.entries(biome.rarityBias || {})) {
    if (weights[key]) {
      weights[key] *= 1 + clamp(bias, -BIAS_LIMIT, BIAS_LIMIT);
    }
  }

  const rodBias = currentRod().passivesMeta.biomeBias;
  if (rodBias && rodBias.biome === biome.key && weights[rodBias.tier]) {
    weights[rodBias.tier] *= 1 + clamp(rodBias.value, -BIAS_LIMIT, BIAS_LIMIT);
  }

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
    if (roll <= 0) {
      return { tier: rarityTiers.find((t) => t.key === key), biome, luckImprovement };
    }
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
    if (mutation.key === "none") continue;
    if (depth < mutation.minDepth) continue;

    const adjustedOdds = Math.max(1, mutation.odds / (1 + relativeBonus));
    if (Math.random() < 1 / adjustedOdds) {
      return {
        ...mutation,
        adjustedOdds,
      };
    }
  }
  const none = mutationTable.find((m) => m.key === "none");
  return { ...none, adjustedOdds: 1 };
}

function playMutationEffect(mutationKey) {
  if (mutationKey === "none") return;
  app.classList.remove("mutation-shiny", "mutation-iridescent", "mutation-gilded", "mutation-corrupted", "mutation-ethereal", "mutation-abyssTouched");
  app.classList.add(`mutation-${mutationKey}`);
  setTimeout(() => {
    app.classList.remove(`mutation-${mutationKey}`);
  }, 1100);
}

function trackDex(name, mutationKey) {
  if (!state.fishDex[name]) {
    state.fishDex[name] = { catches: 0, bestMutation: "none" };
  }
  state.fishDex[name].catches += 1;
  const oldRank = mutationTable.findIndex((m) => m.key === state.fishDex[name].bestMutation);
  const newRank = mutationTable.findIndex((m) => m.key === mutationKey);
  if (newRank >= 0 && oldRank >= 0 && newRank < oldRank) {
    state.fishDex[name].bestMutation = mutationKey;
  }
}

function catchFish() {
  const rod = currentRod();
  const depthReached = Math.floor(state.maxDepthReached);
  const echoPull = rod.passivesMeta.echoPull;
  let effectiveDepth = state.maxDepthReached;
  let echoApplied = false;

  if (echoPull && Math.random() < 1 / echoPull.chance) {
    effectiveDepth = Math.min(rod.maxDepth, state.maxDepthReached * (1 + echoPull.depthGain));
    echoApplied = true;
  }

  const { tier, biome, luckImprovement } = rollTier(effectiveDepth);
  const fishPool = fishPoolForTier(tier.key, biome);
  const name = fishPool[Math.floor(Math.random() * fishPool.length)];
  const mutation = rollMutation(depthReached);

  let value = randRange(tier.value);
  if ((rod.passivesMeta.sellBoostUncommonPlus || 0) > 0 && getRarityRank(tier.key) >= getRarityRank("uncommon")) {
    value *= 1 + rod.passivesMeta.sellBoostUncommonPlus;
  }
  if ((rod.passivesMeta.legendaryValueBoost || 0) > 0 && tier.key === "legendary") {
    value *= 1 + rod.passivesMeta.legendaryValueBoost;
  }

  value *= mutation.multiplier;
  value = Math.round(value);

  const catchItem = {
    name,
    tier: tier.name,
    key: tier.key,
    mutation: mutation.name,
    mutationKey: mutation.key,
    value,
    biome: biome.title,
    depthReached,
    luckApplied: Math.round(luckImprovement * 100),
    mutationOddsText: mutation.key === "none" ? "None" : formatOdds(mutation.odds),
    finalMultiplierText: `${mutation.multiplier.toFixed(mutation.multiplier % 1 ? 1 : 0)}x`,
    echoApplied,
  };

  state.catches.push(catchItem);
  state.stats.totalFishCaught += 1;
  state.stats.mutationCounts[mutation.key] = (state.stats.mutationCounts[mutation.key] || 0) + 1;

  if (state.maxDepthReached > state.stats.deepestCast) {
    state.stats.deepestCast = Math.floor(state.maxDepthReached);
  }

  const oldRank = getRarityRank(state.stats.rarestCatch.toLowerCase());
  const newRank = getRarityRank(catchItem.key);
  if (state.stats.rarestCatch === "None" || newRank > oldRank) {
    state.stats.rarestCatch = catchItem.tier;
  }

  const rarestMutation = mutationTable.find((m) => m.name === state.stats.rarestMutation)?.key || "none";
  const oldMutationRank = mutationTable.findIndex((m) => m.key === rarestMutation);
  const newMutationRank = mutationTable.findIndex((m) => m.key === mutation.key);
  if (state.stats.rarestMutation === "None" || (newMutationRank >= 0 && newMutationRank < oldMutationRank)) {
    state.stats.rarestMutation = mutation.name;
  }

  trackDex(name, mutation.key);
  playMutationEffect(mutation.key);

  const echoLine = catchItem.echoApplied ? `<div class="catch-sub">Echo Pull activated this cast.</div>` : "";

  recentCatch.innerHTML = `
    <div class="catch-name">${catchItem.name}</div>
    <div><span class="rarity-${catchItem.key}">${catchItem.tier}</span> – ${formatOdds(tier.odds)}</div>
    <div class="catch-sub">Mutation: ${catchItem.mutation} ${catchItem.mutationKey === "none" ? "" : `– ${catchItem.mutationOddsText}`}</div>
    <div class="catch-sub">Final Value Multiplier: ${catchItem.finalMultiplierText}</div>
    <div class="catch-sub">Biome: ${catchItem.biome} · Depth: ${catchItem.depthReached.toLocaleString()}m</div>
    ${echoLine}
  `;

  saveGame();
  render();
}

function sellAll() {
  if (!state.catches.length) return;
  const total = state.catches.reduce((sum, fish) => sum + fish.value, 0);
  state.currency += total;
  state.stats.totalCurrencyEarned += total;
  state.stats.bestSingleSell = Math.max(state.stats.bestSingleSell, total);
  state.catches = [];
  recentCatch.textContent = `Sold haul for ₵ ${total.toLocaleString()}. Cast again.`;
  saveGame();
  render();
}

function cast() {
  if (state.isCasting) return;
  state.isCasting = true;
  state.castElapsed = 0;
  state.depth = 0;
  state.maxDepthReached = 0;
  castBtn.disabled = true;
  reelBtn.disabled = false;
}

function reelIn() {
  if (!state.isCasting) return;
  state.isCasting = false;
  catchFish();
  castBtn.disabled = false;
  reelBtn.disabled = true;
  state.depth = 0;
  state.maxDepthReached = 0;
}

function openRodShop() {
  const current = currentRod();
  const next = rods[state.rodIndex + 1];
  if (!next) {
    rodShopContent.innerHTML = `<p>You already own the final rod: <strong>${current.name}</strong>.</p>`;
    buyRodBtn.disabled = true;
  } else {
    const canAfford = state.currency >= next.price;
    rodShopContent.innerHTML = `
      <div class="rod-compare-grid">
        <div>
          <h4>Current: ${current.name}</h4>
          <ul>
            <li>DepthSpeed: ${current.depthSpeed} m/s</li>
            <li>MaxDepth: ${current.maxDepth}m</li>
            <li>CastTime: ${current.castTime.toFixed(1)}s</li>
            <li>${current.passives.join(" · ")}</li>
          </ul>
        </div>
        <div>
          <h4>Next: ${next.name}</h4>
          <ul>
            <li>DepthSpeed: ${next.depthSpeed} m/s</li>
            <li>MaxDepth: ${next.maxDepth}m</li>
            <li>CastTime: ${next.castTime.toFixed(1)}s</li>
            <li>${next.passives.join(" · ")}</li>
          </ul>
          <p>Cost: ₵ ${next.price.toLocaleString()}</p>
        </div>
      </div>
    `;
    buyRodBtn.disabled = !canAfford;
    buyRodBtn.textContent = canAfford ? `Buy ${next.name}` : `Need ₵ ${(next.price - state.currency).toLocaleString()} more`;
  }
  rodModal.classList.add("show");
}

function buyNextRod() {
  const next = rods[state.rodIndex + 1];
  if (!next) return;
  if (state.currency < next.price) return;
  state.currency -= next.price;
  state.rodIndex += 1;
  recentCatch.textContent = `${next.name} equipped.`;
  saveGame();
  rodModal.classList.remove("show");
  render();
}

function updateZone() {
  const biome = getBiome(state.maxDepthReached || state.depth || 0);
  app.classList.remove("zone-shallows", "zone-kelp", "zone-twilight", "zone-lantern", "zone-trench", "zone-voidwell");
  app.classList.add(biome.className);
  zoneLabel.textContent = biome.title;
  biomeInfo.textContent = `${biome.title} · ${biome.ambience}`;
}

function renderRarityGuide() {
  const depthForGuide = Math.max(state.maxDepthReached, state.depth);
  const eligible = getDepthEligibleTiers(depthForGuide).map((t) => t.key);
  rarityList.innerHTML = rarityTiers
    .filter((tier) => !tier.hidden)
    .map((tier) => {
      const lock = eligible.includes(tier.key) ? "" : " 🔒";
      return `<li><div><span class="rarity-${tier.key}">${tier.name}</span> · ${formatOdds(tier.odds)}${lock}</div></li>`;
    })
    .join("");
}

function renderDex() {
  const entries = Object.entries(state.fishDex);
  if (!entries.length) {
    dexInfo.innerHTML = "No fish logged yet.";
    return;
  }

  dexInfo.innerHTML = entries
    .slice(0, 6)
    .map(([name, data]) => {
      const bestMutation = mutationTable.find((m) => m.key === data.bestMutation)?.name || "None";
      return `<div>${name} · best mutation: ${bestMutation}</div>`;
    })
    .join("");
}

function render() {
  const rod = currentRod();
  currency.textContent = `₵ ${Math.floor(state.currency).toLocaleString()}`;
  luckInfo.textContent = `${state.luck} base · effective cap ${Math.round(getLuckEffectiveness() * 100)}%`;
  rodInfo.innerHTML = `${rod.name}<br><small>DepthSpeed ${rod.depthSpeed} m/s · Max ${rod.maxDepth}m · Cast ${rod.castTime.toFixed(1)}s</small><br><small>${rod.passives.join(" · ")}</small>`;

  capsInfo.textContent = `Caps: Luck max +20% rarity improvement, mutation odds max +10% relative, cast time floor ${CAST_TIME_FLOOR.toFixed(1)}s.`;

  depthValue.textContent = `${Math.floor(state.depth)}m`;
  depthFill.style.height = `${(state.depth / rods[rods.length - 1].maxDepth) * 100}%`;
  line.style.height = depthFill.style.height;
  hook.style.top = depthFill.style.height;

  statsList.innerHTML = [
    `Deepest cast: ${Math.floor(state.stats.deepestCast)}m`,
    `Rarest catch: ${state.stats.rarestCatch}`,
    `Total fish: ${state.stats.totalFishCaught}`,
    `Total earnings: ₵ ${Math.floor(state.stats.totalCurrencyEarned).toLocaleString()}`,
    `Total Shiny catches: ${state.stats.mutationCounts.shiny || 0}`,
    `Rarest mutation: ${state.stats.rarestMutation}`,
    `Best single sell value: ₵ ${Math.floor(state.stats.bestSingleSell).toLocaleString()}`,
  ]
    .map((item) => `<li>${item}</li>`)
    .join("");

  eventInfo.textContent = `Current version: v${GAME_VERSION} · Changelog button opens anytime.`;

  renderRarityGuide();
  renderDex();
  updateZone();
}

function updateLoop(now) {
  const delta = (now - lastTick) / 1000;
  lastTick = now;

  if (state.isCasting) {
    const rod = currentRod();
    const castDuration = Math.max(CAST_TIME_FLOOR, rod.castTime);
    const speedFromTime = rod.maxDepth / castDuration;
    const effectiveDepthSpeed = Math.min(rod.depthSpeed * 30, speedFromTime);

    state.castElapsed += delta;
    state.depth += effectiveDepthSpeed * delta;
    state.depth = clamp(state.depth, 0, rod.maxDepth);
    state.maxDepthReached = Math.max(state.maxDepthReached, state.depth);

    if (state.castElapsed >= castDuration || state.depth >= rod.maxDepth) {
      reelIn();
    }
  }

  render();
  frame = requestAnimationFrame(updateLoop);
}

castBtn.addEventListener("click", cast);
reelBtn.addEventListener("click", reelIn);
sellAllBtn.addEventListener("click", sellAll);
openRodShopBtn.addEventListener("click", openRodShop);
changelogBtn.addEventListener("click", () => openChangelog(false));
closeChangelogBtn.addEventListener("click", () => closeChangelog(true));
closeRodShopBtn.addEventListener("click", () => rodModal.classList.remove("show"));
buyRodBtn.addEventListener("click", buyNextRod);

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    if (!state.isCasting) cast();
    else reelIn();
  }
  if (e.key.toLowerCase() === "c") {
    openChangelog(false);
  }
});

loadSave();
render();

if (state.lastSeenVersion !== GAME_VERSION) {
  openChangelog(true);
}

frame = requestAnimationFrame(updateLoop);
window.addEventListener("beforeunload", saveGame);
