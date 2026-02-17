const depthTiers = [
  {
    name: "Common",
    key: "common",
    min: 0,
    max: 100,
    weight: 0.55,
    value: [8, 16],
    fish: ["Silver Minnow", "Well Carp", "Pebble Pike"],
  },
  {
    name: "Uncommon",
    key: "uncommon",
    min: 100,
    max: 300,
    weight: 0.25,
    value: [22, 44],
    fish: ["Blue Lantern Eel", "Glassfin", "Drift Koi"],
  },
  {
    name: "Rare",
    key: "rare",
    min: 300,
    max: 700,
    weight: 0.12,
    value: [70, 130],
    fish: ["Starscale Ray", "Moonbarb", "Needle Shark"],
  },
  {
    name: "Epic",
    key: "epic",
    min: 700,
    max: 1500,
    weight: 0.055,
    value: [220, 380],
    fish: ["Aether Sturgeon", "Dusk Leviathan", "Cathedral Eel"],
  },
  {
    name: "Legendary",
    key: "legendary",
    min: 1500,
    max: 3000,
    weight: 0.02,
    value: [700, 1200],
    fish: ["Sunken Crownfish", "Throne Seraph", "Ancient Hollowscale"],
  },
  {
    name: "Mythic",
    key: "mythic",
    min: 3000,
    max: Infinity,
    weight: 0.005,
    value: [2100, 4200],
    fish: ["Phantom Abyssal", "Void Oracle", "Secret Witness"],
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
  },
  activeEvent: null,
  eventTimer: 0,
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

let frame = null;
let lastTick = performance.now();

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function randRange([min, max]) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function currentRod() {
  return rods[state.rodIndex];
}

function getDepthEligibleTiers(depth) {
  return depthTiers.filter((tier) => depth >= tier.min);
}

function getRarityRank(key) {
  return depthTiers.findIndex((tier) => tier.key === key);
}

function maybeTriggerEvent() {
  if (state.activeEvent || Math.random() > 0.11) {
    return;
  }

  const roll = Math.random();
  if (roll < 0.45) {
    state.activeEvent = { type: "Depth Surge", duration: 18 };
  } else if (roll < 0.85) {
    state.activeEvent = { type: "Echo Pull", duration: 1 };
  } else {
    state.activeEvent = { type: "Phantom Fish", duration: 1 };
  }

  state.eventTimer = state.activeEvent.duration;
}

function chooseTier(depth) {
  const tiers = getDepthEligibleTiers(depth);
  const rod = currentRod();
  const effectiveLuck = state.luck + rod.luckBonus;

  const adjusted = tiers.map((tier, i) => {
    const depthFactor = clamp((depth - tier.min) / 1000, 0, 1.6);
    const luckFactor = 1 + effectiveLuck * 0.025 * (i + 1);
    let weight = tier.weight * (1 + depthFactor) * luckFactor;

    if (state.activeEvent?.type === "Depth Surge") {
      weight *= 1 + i * 0.2;
    }

    return { tier, weight };
  });

  if (state.activeEvent?.type === "Echo Pull" && tiers.length > 1) {
    adjusted[adjusted.length - 1].weight *= 2;
  }

  const total = adjusted.reduce((sum, t) => sum + t.weight, 0);
  let roll = Math.random() * total;

  for (const item of adjusted) {
    roll -= item.weight;
    if (roll <= 0) {
      return item.tier;
    }
  }

  return tiers[0];
}

function catchFish() {
  maybeTriggerEvent();

  let tier;
  if (state.activeEvent?.type === "Phantom Fish" && Math.random() < 0.18) {
    tier = depthTiers[depthTiers.length - 1];
  } else {
    tier = chooseTier(state.maxDepthReached);
  }

  const name = tier.fish[Math.floor(Math.random() * tier.fish.length)];
  let value = randRange(tier.value);
  let flags = [];

  if (Math.random() < 0.06) {
    value *= 2;
    flags.push("Golden Catch");
  }

  if (state.activeEvent?.type === "Phantom Fish") {
    flags.push("Phantom");
  }

  const catchItem = { name, tier: tier.name, key: tier.key, value, flags };
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

  const flagText = flags.length ? ` (${flags.join(", ")})` : "";
  recentCatch.innerHTML = `<span class="rarity-${catchItem.key}">${catchItem.tier}</span> · ${catchItem.name} · ₵ ${catchItem.value}${flagText}`;

  if (["epic", "legendary", "mythic"].includes(catchItem.key)) {
    pulseRareEffect();
  }

  if (state.activeEvent) {
    state.eventTimer -= 1;
    if (state.eventTimer <= 0) {
      state.activeEvent = null;
    }
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

function render() {
  const rod = currentRod();
  currency.textContent = `₵ ${Math.floor(state.currency)}`;
  luckInfo.textContent = `${state.luck} (+${rod.luckBonus} rod)`;

  const nextRod = rods[state.rodIndex + 1];
  const rodUpgradeText = nextRod ? `Upgrade: ₵ ${nextRod.price}` : "Max tier reached";
  upgradeRodBtn.textContent = nextRod ? `Upgrade Rod (${rodUpgradeText})` : "Upgrade Rod (MAX)";
  upgradeRodBtn.disabled = !nextRod;

  const luckPrice = 120 + state.luck * 85;
  upgradeLuckBtn.textContent = `Increase Luck (₵ ${luckPrice})`;

  rodInfo.innerHTML = `${rod.name}<br><small>${rod.style}</small><br>Depth speed ${rod.castSpeed}/s · Max ${rod.maxDepth}m`;

  const meterCap = Math.max(rod.maxDepth, 3500);
  depthValue.textContent = `${Math.floor(state.depth)}m`;
  depthFill.style.height = `${(state.depth / meterCap) * 100}%`;

  line.style.height = `${(state.depth / meterCap) * 100}%`;
  hook.style.top = `${(state.depth / meterCap) * 100}%`;

  stats.innerHTML = [
    `Deepest cast: ${Math.floor(state.stats.deepestCast)}m`,
    `Rarest catch: ${state.stats.rarestCatch}`,
    `Total fish: ${state.stats.totalFishCaught}`,
    `Total earnings: ₵ ${Math.floor(state.stats.totalCurrencyEarned)}`,
  ]
    .map((item) => `<li>${item}</li>`)
    .join("");

  eventInfo.textContent = state.activeEvent ? `${state.activeEvent.type} active` : "None active.";

  updateZone();
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

  // Optional idle mechanic at highest tier
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
