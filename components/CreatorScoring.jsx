import { useState } from "react";
import Head from "next/head";

// Dual gate: BOTH smart followers AND median impressions must be met
const TIER_GATES = [
  { tier: "Inner Circle", sfMin: 1500, impMin: 6000,  color: "#059669", bg: "#ECFDF5", payment: 1000 },
  { tier: "Advanced",     sfMin: 900,  impMin: 3000,  color: "#D97706", bg: "#FFFBEB", payment: 600  },
  { tier: "Established",  sfMin: 500,  impMin: 1500,  color: "#7C3AED", bg: "#F5F3FF", payment: 450  },
  { tier: "Emerging",     sfMin: 250,  impMin: 700,   color: "#2563EB", bg: "#EFF6FF", payment: 250  },
  { tier: "Beginner",     sfMin: 70,   impMin: 300,   color: "#6B7280", bg: "#F3F4F6", payment: 150  },
];

// Median impressions boosted to 35% (from 25%) to prioritise CPM efficiency
// Smart engagement reduced to 20% (from 30%) to compensate
const WEIGHTS = {
  smartEngagement:   0.20,
  medianImpressions: 0.35,
  engagementRate:    0.20,
  cookieScore:       0.15,
  smartFollowersPct: 0.10,
};

const POINTS_TABLE = {
  engagementRate:    [1, 2, 3, 4, 5, 6],
  cookieScore:       [1000, 2000, 3500, 5000, 6000, 7000],
  smartEngagement:   [100, 200, 350, 600, 800, 1200],
  smartFollowersPct: [2, 3, 4, 6, 7, 8],
  medianImpressions: [1500, 3000, 5000, 6000, 8000, 10000],
};

function getPoints(metric, value) {
  const t = POINTS_TABLE[metric]; let pts = 0;
  for (let i = 0; i < t.length; i++) { if (value >= t[i]) pts = i + 1; }
  return Math.min(pts, 5);
}

function getTier(sf, imp) {
  for (const g of TIER_GATES) {
    if (sf >= g.sfMin && imp >= g.impMin) return g;
  }
  return { tier: "Unqualified", color: "#EF4444", bg: "#FEF2F2", payment: 0, sfMin: 70, impMin: 300 };
}

function calcPerformance(c) {
  const raw = {
    smartEngagement:   getPoints("smartEngagement",   c.smartEngagement),
    medianImpressions: getPoints("medianImpressions", c.medianImpressions),
    engagementRate:    getPoints("engagementRate",    c.engagementRate),
    cookieScore:       getPoints("cookieScore",       c.cookieScore),
    smartFollowersPct: getPoints("smartFollowersPct", c.smartFollowersPct),
  };
  const score =
    raw.smartEngagement   * WEIGHTS.smartEngagement   * 6 +
    raw.medianImpressions * WEIGHTS.medianImpressions * 6 +
    raw.engagementRate    * WEIGHTS.engagementRate    * 6 +
    raw.cookieScore       * WEIGHTS.cookieScore       * 6 +
    raw.smartFollowersPct * WEIGHTS.smartFollowersPct * 6;
  return { raw, score: Math.round(score) };
}

function getPerfLabel(score) {
  if (score >= 24) return { label: "Top Performer",  color: "#059669" };
  if (score >= 18) return { label: "High Performer", color: "#2563EB" };
  if (score >= 12) return { label: "Mid Performer",  color: "#7C3AED" };
  if (score >= 6)  return { label: "Low Performer",  color: "#D97706" };
  return                  { label: "Developing",     color: "#6B7280" };
}

function getPayoutStatus(prior, newRate) {
  if (prior === null) return { label: "No Prior Data", color: "#6B7280", bg: "#F3F4F6", icon: "—" };
  const diff = newRate - prior;
  if (Math.abs(diff) <= 50) return { label: "Aligned",   color: "#059669", bg: "#ECFDF5", icon: "✓", diff };
  if (diff > 0)              return { label: "Underpaid", color: "#DC2626", bg: "#FEF2F2", icon: "↑", diff };
  return                            { label: "Overpaid",  color: "#D97706", bg: "#FFFBEB", icon: "↓", diff };
}

// Combined roster from both campaigns
const SHEET_DATA = [
  { handle: "@Nick_Researcher", display: "Nick Research",       cookieScore: 4095.74, followers: 10499,  smartFollowers: 349,  smartEngagement: 504, smartFollowersPct: parseFloat((349/10499*100).toFixed(2)),   medianImpressions: 6455,  engagementRate: 1.96,  priorPayout: 50   },
  { handle: "@Vanieofweb3",     display: "Hermes",              cookieScore: 3692.30, followers: 36119,  smartFollowers: 314,  smartEngagement: 180, smartFollowersPct: parseFloat((314/36119*100).toFixed(2)),   medianImpressions: 7858,  engagementRate: 1.24,  priorPayout: 25   },
  { handle: "@Matrixonchain",   display: "Matrix Onchain",      cookieScore: 3033.77, followers: 5510,   smartFollowers: 178,  smartEngagement: 8,   smartFollowersPct: parseFloat((178/5510*100).toFixed(2)),    medianImpressions: 1817,  engagementRate: 3.49,  priorPayout: null },
  { handle: "@ibcig",           display: "IBCIG",               cookieScore: 5647.05, followers: 520044, smartFollowers: 852,  smartEngagement: 212, smartFollowersPct: parseFloat((852/520044*100).toFixed(2)),  medianImpressions: 9668,  engagementRate: 2.65,  priorPayout: 100  },
  { handle: "@gomtu_xyz",       display: "Gomtu",               cookieScore: 5223.28, followers: 15317,  smartFollowers: 677,  smartEngagement: 100, smartFollowersPct: parseFloat((677/15317*100).toFixed(2)),   medianImpressions: 1095,  engagementRate: 3.45,  priorPayout: null },
  { handle: "@CryptoFloki",     display: "Floki",               cookieScore: 5901.31, followers: 22886,  smartFollowers: 1533, smartEngagement: 100, smartFollowersPct: parseFloat((1533/22886*100).toFixed(2)),  medianImpressions: 1397,  engagementRate: 9.55,  priorPayout: 100  },
  { handle: "@CryptoOHungry",   display: "CryptoHungry",        cookieScore: 4525.08, followers: 26983,  smartFollowers: 607,  smartEngagement: 261, smartFollowersPct: parseFloat((607/26983*100).toFixed(2)),   medianImpressions: 1347,  engagementRate: 7.10,  priorPayout: 100  },
  { handle: "@Haylesdefi",      display: "HAYLΞS.eth ➕",      cookieScore: 3926.23, followers: 44439,  smartFollowers: 445,  smartEngagement: 20,  smartFollowersPct: parseFloat((445/44439*100).toFixed(2)),   medianImpressions: 1892,  engagementRate: 1.81,  priorPayout: 100  },
  { handle: "@LamzEth",         display: "Lamz",                cookieScore: 3280.16, followers: 3136,   smartFollowers: 310,  smartEngagement: 35,  smartFollowersPct: parseFloat((310/3136*100).toFixed(2)),    medianImpressions: 898,   engagementRate: 5.57,  priorPayout: 25   },
  { handle: "@web3Lyra",        display: "Lyra",                cookieScore: 4966.39, followers: 33339,  smartFollowers: 683,  smartEngagement: 19,  smartFollowersPct: parseFloat((683/33339*100).toFixed(2)),   medianImpressions: 4644,  engagementRate: 5.35,  priorPayout: null },
  { handle: "@uniswap12",       display: "唐华斑竹🦅🔶BNB",    cookieScore: 4619.02, followers: 73973,  smartFollowers: 578,  smartEngagement: 171, smartFollowersPct: parseFloat((578/73973*100).toFixed(2)),   medianImpressions: 16215, engagementRate: 0.38,  priorPayout: 50   },
  { handle: "@JohnNakamoto_",   display: "JohnNakamoto",        cookieScore: 3111.15, followers: 35207,  smartFollowers: 394,  smartEngagement: 14,  smartFollowersPct: parseFloat((394/35207*100).toFixed(2)),   medianImpressions: 9018,  engagementRate: 0.94,  priorPayout: null },
  { handle: "@Alaouicapital",   display: "Alaoui Capital",      cookieScore: 6834.59, followers: 69948,  smartFollowers: 1417, smartEngagement: 890, smartFollowersPct: parseFloat((1417/69948*100).toFixed(2)),  medianImpressions: 2911,  engagementRate: 3.73,  priorPayout: null },
  { handle: "@TrycVerrse",      display: "TrycVerse🦋",         cookieScore: 4033.93, followers: 9883,   smartFollowers: 397,  smartEngagement: 6,   smartFollowersPct: parseFloat((397/9883*100).toFixed(2)),    medianImpressions: 1313,  engagementRate: 1.69,  priorPayout: null },
  { handle: "@Kaffchad",        display: "Kaff 📊",             cookieScore: 4797.54, followers: 19902,  smartFollowers: 601,  smartEngagement: 644, smartFollowersPct: parseFloat((601/19902*100).toFixed(2)),   medianImpressions: 8608,  engagementRate: 2.20,  priorPayout: 100  },
  { handle: "@XBukkyExplorer",  display: "Bukky (Builder Arc)", cookieScore: 3977.21, followers: 7500,   smartFollowers: 415,  smartEngagement: 124, smartFollowersPct: parseFloat((415/7500*100).toFixed(2)),    medianImpressions: 1850,  engagementRate: 3.30,  priorPayout: null },
  { handle: "@WYdaGOAT",        display: "Kenny Wy",            cookieScore: 6468.03, followers: 21003,  smartFollowers: 1300, smartEngagement: 686, smartFollowersPct: parseFloat((1300/21003*100).toFixed(2)),  medianImpressions: 1713,  engagementRate: 6.68,  priorPayout: 100  },
  { handle: "@AidenWgmi",       display: "Aiden",               cookieScore: 7041.48, followers: 93892,  smartFollowers: 1470, smartEngagement: 317, smartFollowersPct: parseFloat((1470/93892*100).toFixed(2)),  medianImpressions: 2382,  engagementRate: 7.79,  priorPayout: null },
  { handle: "@CryptoGirlNova",  display: "Crypto Nova",         cookieScore: 7231.48, followers: 146889, smartFollowers: 1344, smartEngagement: 189, smartFollowersPct: parseFloat((1344/146889*100).toFixed(2)), medianImpressions: 13164, engagementRate: 1.14,  priorPayout: null },
  { handle: "@omarfade_",       display: "Omar | Fade",         cookieScore: 3242.79, followers: 5845,   smartFollowers: 215,  smartEngagement: 317, smartFollowersPct: parseFloat((215/5845*100).toFixed(2)),    medianImpressions: 2108,  engagementRate: 3.38,  priorPayout: null },
  { handle: "@shredder_tegg",   display: "SHREDDER",            cookieScore: 5862.03, followers: 14364,  smartFollowers: 788,  smartEngagement: 452, smartFollowersPct: parseFloat((788/14364*100).toFixed(2)),   medianImpressions: 2377,  engagementRate: 7.32,  priorPayout: 50   },
  { handle: "@quanm2831",       display: "Minh Quan",           cookieScore: 3892.13, followers: 13826,  smartFollowers: 297,  smartEngagement: 2,   smartFollowersPct: parseFloat((297/13826*100).toFixed(2)),   medianImpressions: 1693,  engagementRate: 0.85,  priorPayout: 50   },
  { handle: "@0xxNathan",       display: "Nathan",              cookieScore: 6459.84, followers: 25114,  smartFollowers: 1104, smartEngagement: 400, smartFollowersPct: parseFloat((1104/25114*100).toFixed(2)),  medianImpressions: 1612,  engagementRate: 12.67, priorPayout: 100  },
  { handle: "@WorldOfMercek",   display: "Mercek",              cookieScore: 7823.77, followers: 116874, smartFollowers: 3083, smartEngagement: 160, smartFollowersPct: parseFloat((3083/116874*100).toFixed(2)), medianImpressions: 8729,  engagementRate: 3.05,  priorPayout: null },
  { handle: "@Jai0xCrypto",     display: "Jay.eth, CFA",        cookieScore: 4905.74, followers: 18117,  smartFollowers: 846,  smartEngagement: 562, smartFollowersPct: parseFloat((846/18117*100).toFixed(2)),   medianImpressions: 1352,  engagementRate: 12.44, priorPayout: null },
  { handle: "@bledi_ai",        display: "BLEDI",               cookieScore: 5732.62, followers: 51087,  smartFollowers: 991,  smartEngagement: 127, smartFollowersPct: parseFloat((991/51087*100).toFixed(2)),   medianImpressions: 6546,  engagementRate: 4.00,  priorPayout: 100  },
  { handle: "@DukeD_Defi",      display: "DukeD | Defi",        cookieScore: 2917.21, followers: 6483,   smartFollowers: 134,  smartEngagement: 179, smartFollowersPct: parseFloat((134/6483*100).toFixed(2)),    medianImpressions: 1917,  engagementRate: 5.70,  priorPayout: 25   },
  { handle: "@0xALTF4",         display: "ALTF4",               cookieScore: 6900.33, followers: 70447,  smartFollowers: 1326, smartEngagement: 192, smartFollowersPct: parseFloat((1326/70447*100).toFixed(2)),  medianImpressions: 6776,  engagementRate: 4.81,  priorPayout: 150  },
  { handle: "@0xfrigg",         display: "Frigg 🌸",            cookieScore: 6881.48, followers: 63251,  smartFollowers: 1668, smartEngagement: 280, smartFollowersPct: parseFloat((1668/63251*100).toFixed(2)),  medianImpressions: 1854,  engagementRate: 8.41,  priorPayout: 150  },
  { handle: "@OnlyHades_",      display: "0xHades",             cookieScore: 4354.26, followers: 21423,  smartFollowers: 629,  smartEngagement: 330, smartFollowersPct: parseFloat((629/21423*100).toFixed(2)),   medianImpressions: 3530,  engagementRate: 2.54,  priorPayout: null },
  { handle: "@abgweb3",         display: "ABG",                 cookieScore: 7627.70, followers: 87384,  smartFollowers: 1458, smartEngagement: 339, smartFollowersPct: parseFloat((1458/87384*100).toFixed(2)),  medianImpressions: 4744,  engagementRate: 4.00,  priorPayout: 100  },
  { handle: "@alphabatcher",    display: "Alpha Batcher",       cookieScore: 4681.64, followers: 52254,  smartFollowers: 712,  smartEngagement: 196, smartFollowersPct: parseFloat((712/52254*100).toFixed(2)),   medianImpressions: 1793,  engagementRate: 3.45,  priorPayout: 100  },
  { handle: "@SebyCore",        display: "SebyG",               cookieScore: 7373.44, followers: 20120,  smartFollowers: 1930, smartEngagement: 271, smartFollowersPct: parseFloat((1930/20120*100).toFixed(2)),  medianImpressions: 1511,  engagementRate: 15.20, priorPayout: 150  },
  { handle: "@0xD0M_",          display: "Dominic",             cookieScore: 3376.89, followers: 36802,  smartFollowers: 327,  smartEngagement: 12,  smartFollowersPct: parseFloat((327/36802*100).toFixed(2)),   medianImpressions: 496,   engagementRate: 3.92,  priorPayout: 50   },
  { handle: "@0xyukiyuki",      display: "Yuki 🍓",             cookieScore: 4530.16, followers: 37970,  smartFollowers: 621,  smartEngagement: 8,   smartFollowersPct: parseFloat((621/37970*100).toFixed(2)),   medianImpressions: 3059,  engagementRate: 2.04,  priorPayout: 100  },
  { handle: "@Defi_Rocketeer",  display: "Defi Rocketeer",      cookieScore: 4229.51, followers: 167488, smartFollowers: 494,  smartEngagement: 402, smartFollowersPct: parseFloat((494/167488*100).toFixed(2)),  medianImpressions: 6838,  engagementRate: 3.09,  priorPayout: 100  },
  { handle: "@yawaradoteth",    display: "Yawara",              cookieScore: 4827.70, followers: 7593,   smartFollowers: 649,  smartEngagement: 639, smartFollowersPct: parseFloat((649/7593*100).toFixed(2)),    medianImpressions: 1229,  engagementRate: 6.64,  priorPayout: 100  },
  { handle: "@JefferyCrypt",    display: "JÎFFÐ§¸",             cookieScore: 4860.33, followers: 40698,  smartFollowers: 818,  smartEngagement: 450, smartFollowersPct: parseFloat((818/40698*100).toFixed(2)),   medianImpressions: 3709,  engagementRate: 3.24,  priorPayout: 100  },
  { handle: "@ghcryptoguy",     display: "GH Crypto Guy",       cookieScore: 5100.56, followers: 17059,  smartFollowers: 419,  smartEngagement: 6,   smartFollowersPct: parseFloat((419/17059*100).toFixed(2)),   medianImpressions: 571,   engagementRate: 2.42,  priorPayout: 100  },
  { handle: "@YusufGemz",       display: "Yusuf",               cookieScore: 5258.03, followers: 38494,  smartFollowers: 965,  smartEngagement: 892, smartFollowersPct: parseFloat((965/38494*100).toFixed(2)),   medianImpressions: 3703,  engagementRate: 3.21,  priorPayout: 150  },
  { handle: "@0x0Nova",         display: "Nova",                cookieScore: 4221.97, followers: 20553,  smartFollowers: 462,  smartEngagement: 14,  smartFollowersPct: parseFloat((462/20553*100).toFixed(2)),   medianImpressions: 1244,  engagementRate: 3.50,  priorPayout: 50   },
  { handle: "@ken_w3b3",        display: "Ken 🌊",              cookieScore: 4332.30, followers: 17292,  smartFollowers: 525,  smartEngagement: 317, smartFollowersPct: parseFloat((525/17292*100).toFixed(2)),   medianImpressions: 824,   engagementRate: 15.22, priorPayout: 50   },
  { handle: "@AdriansCryptoo",  display: "Adrian",              cookieScore: 4501.15, followers: 16135,  smartFollowers: 614,  smartEngagement: 923, smartFollowersPct: parseFloat((614/16135*100).toFixed(2)),   medianImpressions: 1022,  engagementRate: 13.80, priorPayout: 50   },
  { handle: "@defi_blackjoker", display: "BLACK JOKER",         cookieScore: 3228.85, followers: 8227,   smartFollowers: 223,  smartEngagement: 37,  smartFollowersPct: parseFloat((223/8227*100).toFixed(2)),    medianImpressions: 4060,  engagementRate: 1.45,  priorPayout: 25   },
  { handle: "@levithefirst",    display: "LΞVI",                cookieScore: 3088.69, followers: 4866,   smartFollowers: 224,  smartEngagement: 45,  smartFollowersPct: parseFloat((224/4866*100).toFixed(2)),    medianImpressions: 788,   engagementRate: 4.79,  priorPayout: 25   },
  { handle: "@Baheet_",         display: "Baheet",              cookieScore: 3200.82, followers: 5462,   smartFollowers: 212,  smartEngagement: 108, smartFollowersPct: parseFloat((212/5462*100).toFixed(2)),    medianImpressions: 743,   engagementRate: 2.13,  priorPayout: 50   },
  { handle: "@lechriss17",      display: "lechris",             cookieScore: 5062.95, followers: 7425,   smartFollowers: 743,  smartEngagement: 326, smartFollowersPct: parseFloat((743/7425*100).toFixed(2)),    medianImpressions: 1351,  engagementRate: 8.68,  priorPayout: 50   },
  { handle: "@huseyin1tekin",   display: "Sennin",              cookieScore: 7514.43, followers: 44739,  smartFollowers: 1623, smartEngagement: 298, smartFollowersPct: parseFloat((1623/44739*100).toFixed(2)),  medianImpressions: 2142,  engagementRate: 3.28,  priorPayout: null },
  { handle: "@primenic_eth",    display: "PrimeNic",            cookieScore: 4184.43, followers: 6087,   smartFollowers: 696,  smartEngagement: 131, smartFollowersPct: parseFloat((696/6087*100).toFixed(2)),    medianImpressions: 526,   engagementRate: 9.68,  priorPayout: 100  },
  { handle: "@RiddlerNFT",      display: "RIDDLΞR",             cookieScore: 7452.13, followers: 36189,  smartFollowers: 2386, smartEngagement: 668, smartFollowersPct: parseFloat((2386/36189*100).toFixed(2)),  medianImpressions: 2069,  engagementRate: 4.60,  priorPayout: 150  },
  { handle: "@Yar0ukPRMR",      display: "Yar0uk🥷",            cookieScore: 3305.89, followers: 2529,   smartFollowers: 168,  smartEngagement: 62,  smartFollowersPct: parseFloat((168/2529*100).toFixed(2)),    medianImpressions: 199,   engagementRate: 5.28,  priorPayout: 25   },
  { handle: "@evgen_by",        display: "Evgen",               cookieScore: 4808.85, followers: 8991,   smartFollowers: 735,  smartEngagement: 255, smartFollowersPct: parseFloat((735/8991*100).toFixed(2)),    medianImpressions: 844,   engagementRate: 6.63,  priorPayout: 100  },
  { handle: "@Va77ss",          display: "Vass",                cookieScore: 6750.33, followers: 56780,  smartFollowers: 1378, smartEngagement: 335, smartFollowersPct: parseFloat((1378/56780*100).toFixed(2)),  medianImpressions: 1338,  engagementRate: 5.96,  priorPayout: 100  },
  { handle: "@0xNeodallas",     display: "Neo",                 cookieScore: 3366.23, followers: 4316,   smartFollowers: 361,  smartEngagement: 114, smartFollowersPct: parseFloat((361/4316*100).toFixed(2)),    medianImpressions: 750,   engagementRate: 8.66,  priorPayout: 50   },
  { handle: "@BagCalls",        display: "BagCalls 🎒",         cookieScore: 7295.46, followers: 105755, smartFollowers: 1170, smartEngagement: 917, smartFollowersPct: parseFloat((1170/105755*100).toFixed(2)), medianImpressions: 6191,  engagementRate: 2.14,  priorPayout: 100  },
  { handle: "@cnvrweb3",        display: "CNVR",                cookieScore: 5254.15, followers: 10801,  smartFollowers: 424,  smartEngagement: 113, smartFollowersPct: parseFloat((424/10801*100).toFixed(2)),   medianImpressions: 6497,  engagementRate: 1.49,  priorPayout: 25   },
  { handle: "@mayamaster",      display: "Mayamaster",          cookieScore: 6504.92, followers: 16457,  smartFollowers: 1754, smartEngagement: 150, smartFollowersPct: parseFloat((1754/16457*100).toFixed(2)),  medianImpressions: 695,   engagementRate: 5.59,  priorPayout: 150  },
  { handle: "@holly_web3",      display: "Holly",               cookieScore: 5945.08, followers: 52583,  smartFollowers: 963,  smartEngagement: 276, smartFollowersPct: parseFloat((963/52583*100).toFixed(2)),   medianImpressions: 2377,  engagementRate: 6.32,  priorPayout: 100  },
  { handle: "@Michigan409",     display: "Michigan 🏅",         cookieScore: 3873.77, followers: 21948,  smartFollowers: 520,  smartEngagement: 342, smartFollowersPct: parseFloat((520/21948*100).toFixed(2)),   medianImpressions: 1402,  engagementRate: 5.44,  priorPayout: 25   },
  { handle: "@0xDvox",          display: "Dvox",                cookieScore: 5564.75, followers: 18742,  smartFollowers: 798,  smartEngagement: 130, smartFollowersPct: parseFloat((798/18742*100).toFixed(2)),   medianImpressions: 11696, engagementRate: 6.51,  priorPayout: 100  },
  { handle: "@1Kaiweb3",        display: "Kai 🎯",              cookieScore: 6755.26, followers: 46167,  smartFollowers: 1133, smartEngagement: 381, smartFollowersPct: parseFloat((1133/46167*100).toFixed(2)),  medianImpressions: 2114,  engagementRate: 9.22,  priorPayout: 100  },
  { handle: "@dilaw006",        display: "Dilaw 🤌",            cookieScore: 5212.95, followers: 17330,  smartFollowers: 1027, smartEngagement: 62,  smartFollowersPct: parseFloat((1027/17330*100).toFixed(2)),  medianImpressions: 780,   engagementRate: 2.98,  priorPayout: 100  },
  { handle: "@wiliams0x",       display: "Wiliams",             cookieScore: 3930.16, followers: 6690,   smartFollowers: 318,  smartEngagement: 101, smartFollowersPct: parseFloat((318/6690*100).toFixed(2)),    medianImpressions: 1336,  engagementRate: 9.70,  priorPayout: 25   },
  { handle: "@Web3Pikachu",     display: "Pikachu⚡",           cookieScore: 7406.07, followers: 84912,  smartFollowers: 1630, smartEngagement: 263, smartFollowersPct: parseFloat((1630/84912*100).toFixed(2)),  medianImpressions: 1390,  engagementRate: 8.56,  priorPayout: 100  },
  { handle: "@lovaniceth",      display: "Lovanic",             cookieScore: 5540.98, followers: 14345,  smartFollowers: 1542, smartEngagement: 129, smartFollowersPct: parseFloat((1542/14345*100).toFixed(2)),  medianImpressions: 75,    engagementRate: 9.91,  priorPayout: 100  },
  { handle: "@erequendi",       display: "Erequendi",           cookieScore: 7450.16, followers: 81370,  smartFollowers: 2345, smartEngagement: 918, smartFollowersPct: parseFloat((2345/81370*100).toFixed(2)),  medianImpressions: 2826,  engagementRate: 3.19,  priorPayout: 150  },
  { handle: "@heroman0x",       display: "The Heroman",         cookieScore: 5344.43, followers: 14684,  smartFollowers: 1171, smartEngagement: 64,  smartFollowersPct: parseFloat((1171/14684*100).toFixed(2)),  medianImpressions: 308,   engagementRate: 13.60, priorPayout: 100  },
  { handle: "@PinnacleCrypt",   display: "Pinnacle Crypt",      cookieScore: 3306.39, followers: 11247,  smartFollowers: 256,  smartEngagement: 15,  smartFollowersPct: parseFloat((256/11247*100).toFixed(2)),   medianImpressions: 512,   engagementRate: 2.80,  priorPayout: 25   },
  { handle: "@Jaxon0x",         display: "Jaxon",               cookieScore: 3508.52, followers: 25090,  smartFollowers: 357,  smartEngagement: 51,  smartFollowersPct: parseFloat((357/25090*100).toFixed(2)),   medianImpressions: 697,   engagementRate: 17.20, priorPayout: 50   },
  { handle: "@TweetByGerald",   display: "GeraldCrypt 🦅",      cookieScore: 3476.89, followers: 36095,  smartFollowers: 312,  smartEngagement: 57,  smartFollowersPct: parseFloat((312/36095*100).toFixed(2)),   medianImpressions: 1532,  engagementRate: 2.23,  priorPayout: 50   },
  { handle: "@AlphaFrog13",     display: "Alpha Frog",          cookieScore: 3386.56, followers: 29457,  smartFollowers: 432,  smartEngagement: 3,   smartFollowersPct: parseFloat((432/29457*100).toFixed(2)),   medianImpressions: 430,   engagementRate: 2.44,  priorPayout: 100  },
  { handle: "@quan_eth",        display: "Quan",                cookieScore: 7263.11, followers: 24121,  smartFollowers: 2647, smartEngagement: 537, smartFollowersPct: parseFloat((2647/24121*100).toFixed(2)),  medianImpressions: 1232,  engagementRate: 7.34,  priorPayout: 150  },
  { handle: "@Anas1BTC",        display: "Anas",                cookieScore: 4758.52, followers: 14480,  smartFollowers: 884,  smartEngagement: 317, smartFollowersPct: parseFloat((884/14480*100).toFixed(2)),   medianImpressions: 535,   engagementRate: 11.70, priorPayout: 50   },
  { handle: "@raxthealpha",     display: "Rax Alpha",           cookieScore: 5240.16, followers: 77145,  smartFollowers: 821,  smartEngagement: 462, smartFollowersPct: parseFloat((821/77145*100).toFixed(2)),   medianImpressions: 2781,  engagementRate: 9.52,  priorPayout: 50   },
  { handle: "@thekuchh",        display: "Kuch",                cookieScore: 4783.44, followers: 50150,  smartFollowers: 737,  smartEngagement: 186, smartFollowersPct: parseFloat((737/50150*100).toFixed(2)),   medianImpressions: 876,   engagementRate: 4.41,  priorPayout: 100  },
  { handle: "@smartcoded",      display: "Smartcoded",          cookieScore: 3880.00, followers: 5726,   smartFollowers: 278,  smartEngagement: 22,  smartFollowersPct: parseFloat((278/5726*100).toFixed(2)),    medianImpressions: 1562,  engagementRate: 4.39,  priorPayout: 25   },
  { handle: "@Montiweb3",       display: "Monti",               cookieScore: 6105.41, followers: 28410,  smartFollowers: 1316, smartEngagement: 960, smartFollowersPct: parseFloat((1316/28410*100).toFixed(2)),  medianImpressions: 2489,  engagementRate: 5.94,  priorPayout: 100  },
  { handle: "@MeshClans",       display: "Mesh",                cookieScore: 3798.85, followers: 4802,   smartFollowers: 373,  smartEngagement: 71,  smartFollowersPct: parseFloat((373/4802*100).toFixed(2)),    medianImpressions: 1684,  engagementRate: 3.02,  priorPayout: 100  },
  { handle: "@Ifeanyi_gmi",     display: "Ifeanyi🛡",           cookieScore: 3175.25, followers: 14022,  smartFollowers: 221,  smartEngagement: 67,  smartFollowersPct: parseFloat((221/14022*100).toFixed(2)),   medianImpressions: 1806,  engagementRate: 1.74,  priorPayout: 25   },
  { handle: "@Amandyks",        display: "Amandyks",            cookieScore: 5237.70, followers: 6804,   smartFollowers: 970,  smartEngagement: 70,  smartFollowersPct: parseFloat((970/6804*100).toFixed(2)),    medianImpressions: 264,   engagementRate: 5.63,  priorPayout: 100  },
  { handle: "@edoweb3",         display: "Edo",                 cookieScore: 4442.46, followers: 5053,   smartFollowers: 404,  smartEngagement: 373, smartFollowersPct: parseFloat((404/5053*100).toFixed(2)),    medianImpressions: 2831,  engagementRate: 6.67,  priorPayout: 50   },
  { handle: "@0x99Gohan",       display: "Gohan 🧬",            cookieScore: 5184.92, followers: 43743,  smartFollowers: 754,  smartEngagement: 330, smartFollowersPct: parseFloat((754/43743*100).toFixed(2)),   medianImpressions: 11472, engagementRate: 2.42,  priorPayout: 100  },
  { handle: "@CryptoGideon_",   display: "Crypto Gideon",       cookieScore: 5209.02, followers: 36796,  smartFollowers: 898,  smartEngagement: 36,  smartFollowersPct: parseFloat((898/36796*100).toFixed(2)),   medianImpressions: 1247,  engagementRate: 1.90,  priorPayout: 150  },
  { handle: "@moneyfet1sh",     display: "Moneyfet1sh",         cookieScore: 3473.93, followers: 5967,   smartFollowers: 239,  smartEngagement: 66,  smartFollowersPct: parseFloat((239/5967*100).toFixed(2)),    medianImpressions: 1396,  engagementRate: 2.48,  priorPayout: 50   },
  { handle: "@GemBooster",      display: "Froggy 🐸",           cookieScore: 6495.74, followers: 53698,  smartFollowers: 1332, smartEngagement: 253, smartFollowersPct: parseFloat((1332/53698*100).toFixed(2)),  medianImpressions: 4008,  engagementRate: 3.19,  priorPayout: 150  },
  { handle: "@0xchainBob",      display: "Bobby",               cookieScore: 3816.39, followers: 14129,  smartFollowers: 370,  smartEngagement: 192, smartFollowersPct: parseFloat((370/14129*100).toFixed(2)),   medianImpressions: 635,   engagementRate: 11.32, priorPayout: 25   },
  { handle: "@Skuullls",        display: "SkullZ",              cookieScore: 3175.25, followers: 5770,   smartFollowers: 248,  smartEngagement: 104, smartFollowersPct: parseFloat((248/5770*100).toFixed(2)),    medianImpressions: 286,   engagementRate: 19.07, priorPayout: 25   },
  { handle: "@katexbt",         display: "Katexbt",             cookieScore: 7633.28, followers: 28733,  smartFollowers: 2000, smartEngagement: 512, smartFollowersPct: parseFloat((2000/28733*100).toFixed(2)),  medianImpressions: 2743,  engagementRate: 1.10,  priorPayout: 200  },
  { handle: "@uiuxweb",         display: "Sarwar",              cookieScore: 3140.66, followers: 3616,   smartFollowers: 171,  smartEngagement: 21,  smartFollowersPct: parseFloat((171/3616*100).toFixed(2)),    medianImpressions: 3558,  engagementRate: 0.87,  priorPayout: 25   },
  { handle: "@VaveylaCrypto",   display: "Vav Crypto 🌊",       cookieScore: 4304.92, followers: 17367,  smartFollowers: 492,  smartEngagement: 158, smartFollowersPct: parseFloat((492/17367*100).toFixed(2)),   medianImpressions: 2502,  engagementRate: 6.51,  priorPayout: 50   },
  { handle: "@crazino87",       display: "Crazino.eth",         cookieScore: 4017.21, followers: 5217,   smartFollowers: 444,  smartEngagement: 149, smartFollowersPct: parseFloat((444/5217*100).toFixed(2)),    medianImpressions: 917,   engagementRate: 3.67,  priorPayout: 50   },
  { handle: "@YuliWho",         display: "YuliWho",             cookieScore: 3500.00, followers: 8000,   smartFollowers: 200,  smartEngagement: 50,  smartFollowersPct: parseFloat((200/8000*100).toFixed(2)),    medianImpressions: 1400,  engagementRate: 5.00,  priorPayout: 100  },
  { handle: "@Yaki_fomoArt",    display: "Yaki",                cookieScore: 3230.16, followers: 6561,   smartFollowers: 171,  smartEngagement: 160, smartFollowersPct: parseFloat((171/6561*100).toFixed(2)),    medianImpressions: 3991,  engagementRate: 2.03,  priorPayout: 25   },
  { handle: "@Mostangrybull",   display: "Mostangrybull",       cookieScore: 4000.00, followers: 15000,  smartFollowers: 450,  smartEngagement: 120, smartFollowersPct: parseFloat((450/15000*100).toFixed(2)),   medianImpressions: 1500,  engagementRate: 4.50,  priorPayout: 100  },
  { handle: "@Dashke",          display: "Dashke",              cookieScore: 4200.00, followers: 12000,  smartFollowers: 380,  smartEngagement: 95,  smartFollowersPct: parseFloat((380/12000*100).toFixed(2)),   medianImpressions: 900,   engagementRate: 5.00,  priorPayout: 100  },
  { handle: "@0xBreyn",         display: "Clutcheer",           cookieScore: 19.51,   followers: 60,     smartFollowers: 2,    smartEngagement: 0,   smartFollowersPct: 3.33,                                    medianImpressions: 0,     engagementRate: 0,     priorPayout: 100  },
  { handle: "@0xVanxyrus",      display: "0xVanxyrus",          cookieScore: 3300.00, followers: 8000,   smartFollowers: 280,  smartEngagement: 40,  smartFollowersPct: parseFloat((280/8000*100).toFixed(2)),    medianImpressions: 350,   engagementRate: 4.50,  priorPayout: 50   },
];

// Deduplicate by handle
const seen = new Set();
const CREATORS = SHEET_DATA.filter(c => {
  if (seen.has(c.handle.toLowerCase())) return false;
  seen.add(c.handle.toLowerCase()); return true;
});

// CSV Export utility
function exportToCSV(data) {
  const headers = [
    "Handle", "Display Name", "Followers", "Smart Followers", "Smart Followers %",
    "Smart Engagement", "Median Impressions", "Engagement Rate (%)", "Cookie Score",
    "Tier", "Base Rate ($)", "Performance Score", "Performance Label",
    "Prior Payout ($)", "Payout Status", "Est. CPM ($)"
  ];

  const rows = data.map(c => {
    const tier = getTier(c.smartFollowers, c.medianImpressions);
    const { score } = calcPerformance(c);
    const perf = getPerfLabel(score);
    const status = getPayoutStatus(c.priorPayout, tier?.payment || 0);
    const cpm = c.medianImpressions > 0
      ? ((tier?.payment || 0) / c.medianImpressions * 1000).toFixed(2)
      : "N/A";
    return [
      c.handle,
      `"${c.display.replace(/"/g, '""')}"`,
      c.followers,
      c.smartFollowers,
      c.smartFollowersPct,
      c.smartEngagement,
      c.medianImpressions,
      c.engagementRate,
      c.cookieScore.toFixed(2),
      tier?.tier || "Unqualified",
      tier?.payment || 0,
      score,
      perf.label,
      c.priorPayout !== null ? c.priorPayout : "",
      status.label,
      cpm
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `creator_roster_v5_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const MetricRow = ({ label, value, points, weight, gate, highlight }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F3F4F6", background: highlight ? "rgba(37,99,235,0.03)" : "transparent", borderRadius: 4 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 13, color: "#374151", fontWeight: highlight ? 700 : 500 }}>{label}</span>
      {weight && <span style={{ fontSize: 10, color: highlight ? "#2563EB" : "#9CA3AF", marginLeft: 6, fontWeight: highlight ? 700 : 400 }}>{(weight * 100).toFixed(0)}% wt</span>}
      {gate && <span style={{ fontSize: 10, color: "#7C3AED", marginLeft: 6, fontWeight: 600 }}>GATE</span>}
      {highlight && !gate && <span style={{ fontSize: 9, color: "#2563EB", marginLeft: 4, fontWeight: 700, background: "#EFF6FF", padding: "1px 5px", borderRadius: 10 }}>CPM FOCUS</span>}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 13, color: "#6B7280" }}>{value}</span>
      {!gate && <div style={{ display: "flex", gap: 3 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < points ? (highlight ? "#2563EB" : "#1D4ED8") : "#E5E7EB" }} />
        ))}
      </div>}
      {!gate && <span style={{ fontSize: 12, color: highlight ? "#2563EB" : "#1D4ED8", fontWeight: 600, minWidth: 20, textAlign: "right" }}>{points}/5</span>}
    </div>
  </div>
);

export default function CreatorScoring() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [adjustment, setAdjustment] = useState(0);
  const [activeView, setActiveView] = useState("search");
  const [exportMsg, setExportMsg] = useState("");

  const handleInput = (val) => {
    setQuery(val); setError(""); setResult(null);
    if (val.length < 2) { setSuggestions([]); return; }
    const q = val.toLowerCase().replace("@", "");
    setSuggestions(CREATORS.filter(c =>
      c.handle.toLowerCase().replace("@", "").includes(q) ||
      c.display.toLowerCase().includes(q)
    ).slice(0, 6));
  };

  const runSearch = (creator) => {
    const tier = getTier(creator.smartFollowers, creator.medianImpressions);
    const { raw, score } = calcPerformance(creator);
    const perf = getPerfLabel(score);
    setResult({ creator, tier, raw, score, perf });
    setAdjustment(0); setError(""); setSuggestions([]);
  };

  const handleSearch = () => {
    setError(""); setResult(null); setSuggestions([]);
    if (!query.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const h = query.trim().startsWith("@") ? query.trim().toLowerCase() : `@${query.trim().toLowerCase()}`;
      const creator = CREATORS.find(c => c.handle.toLowerCase() === h);
      creator ? runSearch(creator) : setError("No creator found with that handle.");
      setLoading(false);
    }, 400);
  };

  const handleExport = () => {
    exportToCSV(CREATORS);
    setExportMsg("Exported successfully!");
    setTimeout(() => setExportMsg(""), 3000);
  };

  const allResults = CREATORS.map(c => {
    const tier = getTier(c.smartFollowers, c.medianImpressions);
    const { score } = calcPerformance(c);
    const perf = getPerfLabel(score);
    const status = getPayoutStatus(c.priorPayout, tier?.payment || 0);
    const cpm = c.medianImpressions > 0
      ? ((tier?.payment || 0) / c.medianImpressions * 1000).toFixed(2)
      : null;
    return { ...c, tier, score, perf, status, cpm };
  }).sort((a, b) => (b.tier?.payment || 0) - (a.tier?.payment || 0) || b.score - a.score);

  const withPrior = allResults.filter(c => c.priorPayout !== null);
  const avgPrior = Math.round(withPrior.reduce((s, c) => s + c.priorPayout, 0) / withPrior.length);
  const avgNew = Math.round(allResults.reduce((s, c) => s + (c.tier?.payment || 0), 0) / allResults.length);
  const qualifiedResults = allResults.filter(c => c.tier?.tier !== "Unqualified" && c.cpm !== null);
  const avgCPM = qualifiedResults.length > 0
    ? (qualifiedResults.reduce((s, c) => s + parseFloat(c.cpm), 0) / qualifiedResults.length).toFixed(2)
    : "N/A";

  const tierCounts = {};
  TIER_GATES.forEach(g => { tierCounts[g.tier] = allResults.filter(c => c.tier?.tier === g.tier).length; });
  tierCounts["Unqualified"] = allResults.filter(c => c.tier?.tier === "Unqualified").length;

  const finalRate = result ? (result.tier?.payment || 0) + adjustment : 0;
  const status = result ? getPayoutStatus(result.creator.priorPayout, result.tier?.payment || 0) : null;
  const resultCPM = result && result.creator.medianImpressions > 0
    ? ((finalRate / result.creator.medianImpressions) * 1000).toFixed(2)
    : null;

  const getNextTier = (sf, imp) => {
    const current = getTier(sf, imp);
    const idx = TIER_GATES.findIndex(g => g.tier === current?.tier);
    if (idx <= 0) return null;
    return TIER_GATES[idx - 1];
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", fontFamily: "'Inter', sans-serif", padding: "24px 16px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        <div style={{ marginBottom: 20, textAlign: "center" }}>
          <div style={{ display: "inline-flex", background: "#1D4ED8", borderRadius: 12, padding: "6px 14px", marginBottom: 10 }}>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>CREATOR SCORING SYSTEM V5</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>Creator Tier Lookup</h1>
          <p style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
            {CREATORS.length} creators · Median Impressions weighted at <strong style={{ color: "#2563EB" }}>35%</strong> for CPM efficiency · Avg new rate: <strong style={{ color: "#059669" }}>${avgNew}</strong> · Avg prior: <strong>${avgPrior}</strong> · Avg CPM: <strong style={{ color: "#7C3AED" }}>${avgCPM}</strong>
          </p>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 20, background: "#F3F4F6", borderRadius: 10, padding: 4 }}>
          {["search", "overview", "legend"].map(v => (
            <button key={v} onClick={() => setActiveView(v)} style={{ flex: 1, padding: "8px", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", background: activeView === v ? "#fff" : "transparent", color: activeView === v ? "#111827" : "#6B7280", boxShadow: activeView === v ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
              {v === "search" ? "🔍 Search" : v === "overview" ? "📊 Overview" : "📋 System"}
            </button>
          ))}
        </div>

        {activeView === "search" && (
          <>
            <div style={{ position: "relative", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", fontSize: 14 }}>@</span>
                  <input value={query} onChange={e => handleInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} placeholder="Search handle or display name"
                    style={{ width: "100%", padding: "12px 12px 12px 28px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, outline: "none", background: "#fff", boxSizing: "border-box", color: "#111827" }} />
                </div>
                <button onClick={handleSearch} style={{ padding: "12px 22px", background: "#1D4ED8", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  {loading ? "..." : "Search"}
                </button>
              </div>
              {suggestions.length > 0 && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 60, background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 10, marginTop: 4, zIndex: 10, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                  {suggestions.map(c => (
                    <div key={c.handle} onClick={() => { setQuery(c.handle); runSearch(c); }}
                      style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", background: "#fff" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#F9FAFB"}
                      onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{c.handle}</span>
                      <span style={{ fontSize: 12, color: "#6B7280" }}>{c.display}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 16px", color: "#DC2626", fontSize: 14, marginBottom: 16 }}>{error}</div>}

            {result && (() => {
              const nextTier = getNextTier(result.creator.smartFollowers, result.creator.medianImpressions);
              const sfNeeded = nextTier ? Math.max(0, nextTier.sfMin - result.creator.smartFollowers) : 0;
              const impNeeded = nextTier ? Math.max(0, nextTier.impMin - result.creator.medianImpressions) : 0;
              return (
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div style={{ background: result.tier?.bg || "#F3F4F6", borderBottom: `3px solid ${result.tier?.color || "#6B7280"}`, padding: "18px 24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, letterSpacing: 1, marginBottom: 2 }}>X HANDLE</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>{result.creator.handle}</div>
                        <div style={{ fontSize: 13, color: "#6B7280" }}>{result.creator.display}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, letterSpacing: 1, marginBottom: 2 }}>TIER</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: result.tier?.color }}>{result.tier?.tier}</div>
                        <div style={{ fontSize: 12, color: "#6B7280" }}>Base: <strong style={{ color: "#111827" }}>${result.tier?.payment}</strong></div>
                      </div>
                    </div>
                    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                      <div style={{ flex: 1, background: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "8px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: "#6B7280", fontWeight: 600 }}>SMART FOLLOWERS</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: result.tier?.color }}>{result.creator.smartFollowers.toLocaleString()}</div>
                        <div style={{ fontSize: 10, color: "#6B7280" }}>Gate: {result.tier?.sfMin?.toLocaleString()}+</div>
                      </div>
                      <div style={{ flex: 1, background: "rgba(37,99,235,0.08)", borderRadius: 8, padding: "8px 12px", textAlign: "center", border: "1.5px solid rgba(37,99,235,0.15)" }}>
                        <div style={{ fontSize: 10, color: "#2563EB", fontWeight: 700 }}>MEDIAN IMPRESSIONS ★</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: result.tier?.color }}>{result.creator.medianImpressions.toLocaleString()}</div>
                        <div style={{ fontSize: 10, color: "#6B7280" }}>Gate: {result.tier?.impMin?.toLocaleString()}+</div>
                      </div>
                      <div style={{ flex: 1, background: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "8px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: "#6B7280", fontWeight: 600 }}>PERF SCORE</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: result.perf.color }}>{result.score}/30</div>
                        <div style={{ fontSize: 10, color: result.perf.color, fontWeight: 600 }}>{result.perf.label}</div>
                      </div>
                    </div>
                    {nextTier && (sfNeeded > 0 || impNeeded > 0) && (
                      <div style={{ marginTop: 10, background: "rgba(255,255,255,0.6)", borderRadius: 8, padding: "8px 12px", fontSize: 11, color: "#374151" }}>
                        <strong>Next tier ({nextTier.tier}):</strong>{sfNeeded > 0 ? ` +${sfNeeded.toLocaleString()} smart followers` : " ✓ SF met"}{impNeeded > 0 ? ` · +${impNeeded.toLocaleString()} median impressions` : " · ✓ Impressions met"}
                      </div>
                    )}
                  </div>

                  {status && (
                    <div style={{ padding: "10px 24px", background: status.bg, borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 10, color: "#6B7280", fontWeight: 600, letterSpacing: 1 }}>PRIOR PAYOUT</div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{result.creator.priorPayout !== null ? `$${result.creator.priorPayout}` : "—"}</div>
                        </div>
                        <span style={{ color: "#9CA3AF" }}>→</span>
                        <div>
                          <div style={{ fontSize: 10, color: "#6B7280", fontWeight: 600, letterSpacing: 1 }}>NEW BASE RATE</div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: result.tier?.color }}>${result.tier?.payment}</div>
                        </div>
                        {resultCPM && (
                          <>
                            <span style={{ color: "#9CA3AF" }}>→</span>
                            <div>
                              <div style={{ fontSize: 10, color: "#2563EB", fontWeight: 700, letterSpacing: 1 }}>EST. CPM</div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: "#2563EB" }}>${resultCPM}</div>
                            </div>
                          </>
                        )}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: status.color, border: `1px solid ${status.color}`, borderRadius: 20, padding: "3px 10px" }}>
                        {status.icon} {status.label}{status.diff ? ` ($${Math.abs(status.diff)})` : ""}
                      </span>
                    </div>
                  )}

                  <div style={{ padding: "14px 24px", borderBottom: "1px solid #F3F4F6" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: 1, marginBottom: 10 }}>PERFORMANCE BREAKDOWN</div>
                    <MetricRow label="Median Impressions" value={result.creator.medianImpressions.toLocaleString()} points={result.raw.medianImpressions} weight={WEIGHTS.medianImpressions} highlight={true} />
                    <MetricRow label="Smart Engagement"   value={result.creator.smartEngagement.toLocaleString()} points={result.raw.smartEngagement}   weight={WEIGHTS.smartEngagement} />
                    <MetricRow label="Engagement Rate"    value={`${result.creator.engagementRate}%`}              points={result.raw.engagementRate}    weight={WEIGHTS.engagementRate} />
                    <MetricRow label="Cookie Score"       value={result.creator.cookieScore.toFixed(0)}            points={result.raw.cookieScore}       weight={WEIGHTS.cookieScore} />
                    <MetricRow label="Smart Followers %"  value={`${result.creator.smartFollowersPct}%`}           points={result.raw.smartFollowersPct}  weight={WEIGHTS.smartFollowersPct} />
                    <MetricRow label="Smart Followers (gate)"          value={result.creator.smartFollowers.toLocaleString()}          points={0} gate={true} />
                    <MetricRow label="Median Impressions (gate)" value={result.creator.medianImpressions.toLocaleString()} points={0} gate={true} />
                  </div>

                  <div style={{ padding: "14px 24px" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: 1, marginBottom: 10 }}>MANUAL ADJUSTMENT</div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                      {[-100, -50, 0, 50, 100].map(v => (
                        <button key={v} onClick={() => setAdjustment(v)}
                          style={{ flex: 1, padding: "7px 0", border: `1.5px solid ${adjustment === v ? "#1D4ED8" : "#E5E7EB"}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", background: adjustment === v ? "#EFF6FF" : "#fff", color: adjustment === v ? "#1D4ED8" : "#6B7280" }}>
                          {v > 0 ? `+$${v}` : v < 0 ? `-$${Math.abs(v)}` : "Base"}
                        </button>
                      ))}
                    </div>
                    <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>Final Recommended Rate</span>
                        {resultCPM && <div style={{ fontSize: 11, color: "#2563EB", marginTop: 2 }}>Est. CPM at this rate: <strong>${((finalRate / result.creator.medianImpressions) * 1000).toFixed(2)}</strong></div>}
                      </div>
                      <span style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>${finalRate}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        )}

        {activeView === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", padding: "14px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#6B7280", fontWeight: 600, letterSpacing: 1 }}>AVG NEW RATE</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#059669" }}>${avgNew}</div>
              </div>
              <div style={{ flex: 1, background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", padding: "14px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#6B7280", fontWeight: 600, letterSpacing: 1 }}>AVG PRIOR</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#6B7280" }}>${avgPrior}</div>
              </div>
              <div style={{ flex: 1, background: "#EFF6FF", borderRadius: 12, border: "1.5px solid #BFDBFE", padding: "14px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#2563EB", fontWeight: 700, letterSpacing: 1 }}>AVG CPM</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#2563EB" }}>${avgCPM}</div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "center" }}>
              {exportMsg && <span style={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>{exportMsg}</span>}
              <button onClick={handleExport} style={{ padding: "9px 18px", background: "#059669", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                ⬇ Export CSV ({CREATORS.length} creators)
              </button>
            </div>

            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", padding: "12px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: 1, marginBottom: 10 }}>TIER DISTRIBUTION</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[...TIER_GATES, { tier: "Unqualified", color: "#EF4444", bg: "#FEF2F2" }].map(g => (
                  <div key={g.tier} style={{ flex: 1, background: g.bg, borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: g.color }}>{tierCounts[g.tier] || 0}</div>
                    <div style={{ fontSize: 9, color: g.color, fontWeight: 600, lineHeight: 1.2 }}>{g.tier}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#F9FAFB" }}>
                      {["Handle", "Smart F.", "Med. Imp.", "Tier", "Score", "New $", "Prior $", "Est. CPM", "Status"].map(h => (
                        <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 10, fontWeight: 600, color: h === "Med. Imp." || h === "Est. CPM" ? "#2563EB" : "#6B7280", borderBottom: "1px solid #F3F4F6", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allResults.map((c, i) => (
                      <tr key={c.handle} style={{ borderBottom: "1px solid #F9FAFB", background: i % 2 === 0 ? "#fff" : "#FAFAFA", cursor: "pointer" }}
                        onClick={() => { setActiveView("search"); setQuery(c.handle); runSearch(c); }}>
                        <td style={{ padding: "8px 10px", fontWeight: 600, color: "#111827", whiteSpace: "nowrap" }}>{c.handle}</td>
                        <td style={{ padding: "8px 10px", color: "#374151" }}>{c.smartFollowers.toLocaleString()}</td>
                        <td style={{ padding: "8px 10px", color: "#2563EB", fontWeight: 600 }}>{c.medianImpressions.toLocaleString()}</td>
                        <td style={{ padding: "8px 10px" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: c.tier?.color, background: c.tier?.bg, padding: "2px 7px", borderRadius: 20, whiteSpace: "nowrap" }}>{c.tier?.tier}</span>
                        </td>
                        <td style={{ padding: "8px 10px" }}><span style={{ fontSize: 11, color: c.perf.color, fontWeight: 600 }}>{c.score}/30</span></td>
                        <td style={{ padding: "8px 10px", fontWeight: 700, color: c.tier?.color }}>${c.tier?.payment}</td>
                        <td style={{ padding: "8px 10px", color: "#6B7280" }}>{c.priorPayout !== null ? `$${c.priorPayout}` : "—"}</td>
                        <td style={{ padding: "8px 10px", color: "#2563EB", fontWeight: 600 }}>{c.cpm ? `$${c.cpm}` : "—"}</td>
                        <td style={{ padding: "8px 10px" }}><span style={{ fontSize: 10, fontWeight: 600, color: c.status.color, whiteSpace: "nowrap" }}>{c.status.icon} {c.status.label}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeView === "legend" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "#EFF6FF", borderRadius: 12, border: "1.5px solid #BFDBFE", padding: "12px 16px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1D4ED8", marginBottom: 4 }}>V5 Change: CPM Optimisation</div>
              <p style={{ fontSize: 11, color: "#374151", margin: 0 }}>Median Impressions weight increased from <strong>25%</strong> to <strong>35%</strong>. Smart Engagement reduced from 30% to 20%. Creators with higher reach per dollar are now scored higher, lowering your average CPM across campaigns.</p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={handleExport} style={{ padding: "9px 18px", background: "#059669", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                ⬇ Export Full Roster CSV
              </button>
            </div>

            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", background: "#F9FAFB", borderBottom: "1px solid #F3F4F6" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>Dual Gate System · Both thresholds must be met</span>
              </div>
              {TIER_GATES.slice().reverse().map(g => (
                <div key={g.tier} style={{ padding: "12px 16px", borderBottom: "1px solid #F9FAFB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: g.color, background: g.bg, padding: "3px 10px", borderRadius: 20, minWidth: 80, textAlign: "center" }}>{g.tier}</span>
                    <div>
                      <div style={{ fontSize: 12, color: "#374151" }}>{g.sfMin.toLocaleString()}+ smart followers</div>
                      <div style={{ fontSize: 11, color: "#6B7280" }}>{g.impMin.toLocaleString()}+ median impressions</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: g.color }}>${g.payment}</span>
                </div>
              ))}
            </div>

            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", background: "#F9FAFB", borderBottom: "1px solid #F3F4F6" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>Performance Score Weights (V5)</span>
              </div>
              {Object.entries(WEIGHTS).map(([k, w]) => {
                const labels = { smartEngagement: "Smart Engagement", medianImpressions: "Median Impressions ★", engagementRate: "Engagement Rate", cookieScore: "Cookie Score", smartFollowersPct: "Smart Followers %" };
                const isHighlight = k === "medianImpressions";
                return (
                  <div key={k} style={{ padding: "10px 16px", borderBottom: "1px solid #F9FAFB", display: "flex", justifyContent: "space-between", alignItems: "center", background: isHighlight ? "#EFF6FF" : "transparent" }}>
                    <span style={{ fontSize: 12, color: isHighlight ? "#1D4ED8" : "#374151", fontWeight: isHighlight ? 700 : 400 }}>{labels[k]}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 80, height: 6, background: "#E5E7EB", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${w * 100}%`, background: isHighlight ? "#2563EB" : "#1D4ED8", borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: isHighlight ? "#2563EB" : "#1D4ED8", minWidth: 28 }}>{(w * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
