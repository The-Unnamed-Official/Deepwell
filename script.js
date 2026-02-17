const rarityTiers = [
  {
    name: "Common",
    key: "common",
    minDepth: 0,
    odds: 2,
    value: [8, 16],
    fish: ["Pebblefin", "Rustscale", "Mud Carp", "Drift Minnow", "Well Guppy"],
  },
  {
    name: "Uncommon",
    key: "uncommon",
    minDepth: 100,
    odds: 5,
    value: [24, 44],
    fish: ["Silver Dart", "Mossback Eel", "Ripple Trout", "Bluegill Shade", "Hollow Perch"],
  },
  {
    name: "Rare",
    key: "rare",
    minDepth: 300,
    odds: 15,
    value: [72, 130],
    fish: ["Deep Pike", "Lantern Koi", "Blackwater Bass", "Ironjaw Catfish", "Veil Snapper"],
  },
  {
    name: "Epic",
    key: "epic",
    minDepth: 700,
    odds: 75,
    value: [220, 380],
    fish: ["Glowfin Serpent", "Abyss Runner", "Shardscale Levi", "Phantom Ray", "Obsidian Koi"],
  },
  {
    name: "Legendary",
    key: "legendary",
    minDepth: 1500,
    odds: 400,
    value: [700, 1200],
    fish: ["Crowned Angler", "Depth Tyrant", "Voidfin Monarch", "Ancient Wellkeeper", "Midnight Hydra"],
  },
  {
    name: "Mythic",
    key: "mythic",
    minDepth: 3000,
    odds: 2000,
    value: [2100, 4200],
    fish: ["Celestial Leviathan", "Starbound Eel", "Gravity Wyrm", "Oracle of the Deep", "The Gilded Maw"],
  },
  {
    name: "Abyssal",
    key: "abyssal",
    minDepth: 3000,
    odds: 25000,
    value: [7000, 14000],
    fish: ["The Nameless One", "Primordial Echo", "Wellheart Entity", "The Silent Colossus", "Deepwell Core"],
  },
  {
    name: "??? Tier",
    key: "unknown",
    minDepth: 5000,
    odds: 1000000,
    value: [50000, 50000],
    fish: ["The Endless Below"],
    hidden: true,
  },
];

const rods = [
  {
    name: "Basic Rod",
    castSpeed: 110,
    maxDepth: 450,
    reelSpeed: 260,
    luckBonus: 0,
    startDepth: 0,
    price: 0,
    style: "Simple oak finish",
  },
  {
    name: "Reinforced Rod",
    castSpeed: 150,
    maxDepth: 900,
    reelSpeed: 320,
    luckBonus: 1,
    startDepth: 25,
    price: 320,
    style: "Steel spine and weighted line",
  },
  {
    name: "Deepwater Rod",
    castSpeed: 215,
    maxDepth: 1800,
    reelSpeed: 400,
    luckBonus: 3,
    startDepth: 70,
    price: 1350,
    style: "Pressure-resistant alloy",
  },
  {
    name: "Abyssal Rod",
    castSpeed: 290,
    maxDepth: 3200,
    reelSpeed: 510,
    luckBonus: 6,
    startDepth: 130,
    price: 5200,
    style: "Runic core with dark braid",
  },
  {
    name: "Void Rod",
    castSpeed: 380,
    maxDepth: 5200,
    reelSpeed: 700,
    luckBonus: 10,
    startDepth: 240,
    price: 18000,
    style: "Void-forged with spectral line",
    idleUnlocked: true,
  },
];

const zones = [
  { min: 0, className: "zone-shallow", title: "Shallow Waters" },
  { min: 400, className: "zone-dark", title: "Dark Ocean" },
  { min: 900, className: "zone-biolume", title: "Bioluminescent Layer" },
  { min: 1700, className: "zone-abyss", title: "Abyssal Darkness" },
  { min: 3000, className: "zone-void", title: "Void Depth" },
];

const state = {
  currency: 0,
  luck: 0,
  rodIndex: 0,
  depth: 0,
  maxDepthReached: 0,
  isCasting: false,
  catches: [],
  stats: {
    deepestCast: 0,
    rarestCatch: "None",
    totalFishCaught: 0,
    totalCurrencyEarned: 0,
    abyssalCaught: 0,
    unlockedAbyssalBadge: false,
    unknownCaught: 0,
  },
  activeEvent: null,
  eventTimer: 0,
  globalAnnouncement: "",
};

const $ = (id) => document.getElementById(id);
const app = $("app");
const castBtn = $("castBtn");
const reelBtn = $("reelBtn");
const sellAllBtn = $("sellAllBtn");
const upgradeRodBtn = $("upgradeRodBtn");
const upgradeLuckBtn = $("upgradeLuckBtn");
const depthFill = $("depthFill");
const depthValue = $("depthValue");
const rodInfo = $("rodInfo");
const luckInfo = $("luckInfo");
const recentCatch = $("recentCatch");
const stats = $("stats");
const currency = $("currency");
const line = $("line");
const hook = $("hook");
const zoneLabel = $("zoneLabel");
const eventInfo = $("eventInfo");
const rarityList = $("rarityList");

let frame = null;
let lastTick = performance.now();

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function randRange([min, max]) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatOdds(odds) {
  return `1 in ${odds.toLocaleString()}`;
}

function currentRod() {
  return rods[state.rodIndex];
}

function getDepthEligibleTiers(depth) {
  return rarityTiers.filter((tier) => depth >= tier.minDepth);
}

function getRarityRank(key) {
  return rarityTiers.findIndex((tier) => tier.key === key);
}

function getLuckImprovement() {
  const effectiveLuck = state.luck + currentRod().luckBonus;
  return clamp(effectiveLuck * 0.02, 0, 0.2);
}

function rollTier(depth) {
  const eligibleTiers = getDepthEligibleTiers(depth)
    .filter((tier) => tier.key !== "common")
    .sort((a, b) => b.odds - a.odds);

  const luckImprovement = getLuckImprovement();

  for (const tier of eligibleTiers) {
    const adjustedOdds = Math.max(1, Math.round(tier.odds * (1 - luckImprovement)));
    if (Math.random() < 1 / adjustedOdds) {
      return { tier, luckImprovement, adjustedOdds };
    }
  }

  const commonTier = rarityTiers[0];
  const commonOdds = Math.max(1, Math.round(commonTier.odds * (1 - luckImprovement)));
  return { tier: commonTier, luckImprovement, adjustedOdds: commonOdds };
}

function triggerAbyssalEffects() {
  app.classList.add("abyssal-distortion");
  setTimeout(() => app.classList.remove("abyssal-distortion"), 1500);

  app.animate(
    [
      { transform: "translateX(0) scale(1)", filter: "brightness(1)" },
      { transform: "translateX(-6px) scale(1.01)", filter: "brightness(1.4)" },
      { transform: "translateX(6px) scale(1.01)", filter: "brightness(1.2)" },
      { transform: "translateX(0) scale(1)", filter: "brightness(1)" },
    ],
    { duration: 1200, easing: "ease-out" }
  );

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    return;
  }

  const context = new AudioCtx();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(60, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(20, context.currentTime + 1.3);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.15, context.currentTime + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.4);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 1.4);
}

function catchFish() {
  const depthReached = Math.floor(state.maxDepthReached);
  const { tier, luckImprovement, adjustedOdds } = rollTier(state.maxDepthReached);

  const name = tier.fish[Math.floor(Math.random() * tier.fish.length)];
  let value = randRange(tier.value);
  const flags = [];

  if (Math.random() < 0.06) {
    value *= 2;
    flags.push("Golden Catch");
  }

  const catchItem = {
    name,
    tier: tier.name,
    key: tier.key,
    value,
    flags,
    oddsText: formatOdds(tier.odds),
    adjustedOddsText: formatOdds(adjustedOdds),
    depthReached,
    luckApplied: Math.round(luckImprovement * 100),
  };

  if (tier.key === "abyssal") {
    state.stats.abyssalCaught += 1;
    state.stats.unlockedAbyssalBadge = true;
    flags.push("Abyssal Signature");
    triggerAbyssalEffects();
  }

  if (tier.key === "unknown") {
    state.stats.unknownCaught += 1;
    state.globalAnnouncement = "SERVER ALERT: The Endless Below has emerged at 5000m+!";
  }

  state.catches.push(catchItem);
  state.stats.totalFishCaught += 1;

  if (state.maxDepthReached > state.stats.deepestCast) {
    state.stats.deepestCast = Math.floor(state.maxDepthReached);
  }

  const oldRank = getRarityRank(state.stats.rarestCatch.toLowerCase());
  const newRank = getRarityRank(catchItem.key);
  if (state.stats.rarestCatch === "None" || newRank > oldRank) {
    state.stats.rarestCatch = catchItem.tier;
  }

  const flagText = flags.length ? `<div class="catch-flags">${flags.join(" · ")}</div>` : "";

  recentCatch.innerHTML = `
    <div class="catch-name">${catchItem.name}</div>
    <div><span class="rarity-${catchItem.key}">${catchItem.tier}</span> – ${catchItem.oddsText}</div>
    <div class="catch-sub">Depth reached: ${catchItem.depthReached.toLocaleString()}m</div>
    <div class="catch-sub">Luck applied: +${catchItem.luckApplied}%</div>
    ${flagText}
  `;

  if (["epic", "legendary", "mythic", "abyssal", "unknown"].includes(catchItem.key)) {
    pulseRareEffect();
  }

  render();
}

function pulseRareEffect() {
  app.animate(
    [
      { filter: "brightness(1)" },
      { filter: "brightness(1.25)" },
      { filter: "brightness(1)" },
    ],
    { duration: 650, easing: "ease-out" }
  );
}

function sellAll() {
  if (!state.catches.length) {
    return;
  }

  const total = state.catches.reduce((sum, fish) => sum + fish.value, 0);
  state.currency += total;
  state.stats.totalCurrencyEarned += total;
  state.catches = [];
  recentCatch.textContent = `Sold haul for ₵ ${total}. Cast again.`;
  render();
}

function cast() {
  if (state.isCasting) {
    return;
  }

  state.isCasting = true;
  state.depth = currentRod().startDepth;
  state.maxDepthReached = state.depth;
  castBtn.disabled = true;
  reelBtn.disabled = false;
}

function reelIn() {
  if (!state.isCasting) {
    return;
  }

  state.isCasting = false;
  catchFish();
  castBtn.disabled = false;
  reelBtn.disabled = true;
  state.depth = 0;
  state.maxDepthReached = 0;
}

function upgradeRod() {
  const nextRod = rods[state.rodIndex + 1];
  if (!nextRod) {
    return;
  }

  if (state.currency < nextRod.price) {
    recentCatch.textContent = `Need ₵ ${nextRod.price - state.currency} more for ${nextRod.name}.`;
    return;
  }

  state.currency -= nextRod.price;
  state.rodIndex += 1;
  recentCatch.textContent = `${nextRod.name} equipped.`;
  render();
}

function upgradeLuck() {
  const price = 120 + state.luck * 85;
  if (state.currency < price) {
    recentCatch.textContent = `Need ₵ ${price - state.currency} more to increase luck.`;
    return;
  }

  state.currency -= price;
  state.luck += 1;
  recentCatch.textContent = `Luck increased to ${state.luck}.`;
  render();
}

function updateZone() {
  const active = [...zones].reverse().find((z) => state.maxDepthReached >= z.min) || zones[0];
  app.classList.remove("zone-shallow", "zone-dark", "zone-biolume", "zone-abyss", "zone-void");
  app.classList.add(active.className);
  zoneLabel.textContent = active.title;
}

function renderRarityGuide() {
  rarityList.innerHTML = rarityTiers
    .filter((tier) => !tier.hidden)
    .map(
      (tier) => `<li>
        <div><span class="rarity-${tier.key}">${tier.name}</span> · ${formatOdds(tier.odds)}</div>
        <small>${tier.fish.join(", ")}</small>
      </li>`
    )
    .join("");
}

function render() {
  const rod = currentRod();
  currency.textContent = `₵ ${Math.floor(state.currency)}`;
  luckInfo.textContent = `${state.luck} (+${rod.luckBonus} rod) · cap ${Math.round(getLuckImprovement() * 100)}%`;

  const nextRod = rods[state.rodIndex + 1];
  const rodUpgradeText = nextRod ? `Upgrade: ₵ ${nextRod.price}` : "Max tier reached";
  upgradeRodBtn.textContent = nextRod ? `Upgrade Rod (${rodUpgradeText})` : "Upgrade Rod (MAX)";
  upgradeRodBtn.disabled = !nextRod;

  const luckPrice = 120 + state.luck * 85;
  upgradeLuckBtn.textContent = `Increase Luck (₵ ${luckPrice})`;

  rodInfo.innerHTML = `${rod.name}<br><small>${rod.style}</small><br>Depth speed ${rod.castSpeed}/s · Max ${rod.maxDepth}m`;

  const meterCap = Math.max(rod.maxDepth, 5200);
  depthValue.textContent = `${Math.floor(state.depth)}m`;
  depthFill.style.height = `${(state.depth / meterCap) * 100}%`;

  line.style.height = `${(state.depth / meterCap) * 100}%`;
  hook.style.top = `${(state.depth / meterCap) * 100}%`;

  stats.innerHTML = [
    `Deepest cast: ${Math.floor(state.stats.deepestCast)}m`,
    `Rarest catch: ${state.stats.rarestCatch}`,
    `Total fish: ${state.stats.totalFishCaught}`,
    `Total earnings: ₵ ${Math.floor(state.stats.totalCurrencyEarned)}`,
    `Abyssal catches: ${state.stats.abyssalCaught}`,
    `Abyssal badge: ${state.stats.unlockedAbyssalBadge ? "Unlocked" : "Locked"}`,
  ]
    .map((item) => `<li>${item}</li>`)
    .join("");

  if (state.globalAnnouncement) {
    eventInfo.textContent = state.globalAnnouncement;
  } else {
    eventInfo.textContent = "No global alerts.";
  }

  updateZone();
  renderRarityGuide();
}

function updateLoop(now) {
  const delta = (now - lastTick) / 1000;
  lastTick = now;

  if (state.isCasting) {
    const rod = currentRod();
    state.depth += rod.castSpeed * delta;

    if (state.depth > rod.maxDepth) {
      state.depth = rod.maxDepth;
    }

    state.maxDepthReached = Math.max(state.maxDepthReached, state.depth);

    if (state.depth >= rod.maxDepth) {
      reelIn();
    }
  }

  if (currentRod().idleUnlocked) {
    state.currency += 0.32 * delta;
    state.stats.totalCurrencyEarned += 0.32 * delta;
  }

  render();
  frame = requestAnimationFrame(updateLoop);
}

castBtn.addEventListener("click", cast);
reelBtn.addEventListener("click", reelIn);
sellAllBtn.addEventListener("click", sellAll);
upgradeRodBtn.addEventListener("click", upgradeRod);
upgradeLuckBtn.addEventListener("click", upgradeLuck);

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    if (!state.isCasting) {
      cast();
    } else {
      reelIn();
    }
  }
});

render();
frame = requestAnimationFrame(updateLoop);
