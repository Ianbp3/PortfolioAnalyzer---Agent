// ─────────────────────────────────────────────────────────────────────────────
// Index-tracking funds.
//
// Holding any of these is NOT a single-stock bet, it is a basket of many
// companies, so the analyzer treats it as diversification, not concentration,
// and "looks through" it into its real sector mix.
//
// Each entry groups every ticker (ETF + mutual fund) that tracks the SAME
// underlying index, so SPY / VOO / IVV all behave identically, and so do
// SPYG / VOOG / IVW, and QQQ / QQQM. To support a new index later, just add
// one more object here (tickers + holdings count + sector weights) and, if you
// want it reflected in the per-asset overlap chart, add its constituent weights
// in PortfolioCharts.jsx.
//
// Sector weights are cap-weighted approximations (mid-2026) and should be
// refreshed periodically alongside the constituent tables on the frontend.
// They do not need to sum to exactly 1, any remainder is shown as "Other".
// ─────────────────────────────────────────────────────────────────────────────
const INDEX_FUNDS = [
  {
    key: "SP500",
    benchmark: true, // the one we compare every portfolio against
    holdings: 500,
    tickers: [
      "SPY",
      "VOO",
      "IVV",
      "SPLG",
      "FXAIX",
      "VFIAX",
      "SWPPX",
      "CSPX",
      "WFSPX",
      "BSPIX",
      "SNXFX",
      "MEISX",
      "PREIX",
    ],
    sectorWeights: {
      Technology: 0.31,
      Financials: 0.13,
      Healthcare: 0.12,
      "Consumer Discretionary": 0.1,
      "Communication Services": 0.09,
      Industrials: 0.08,
      "Consumer Staples": 0.06,
      Energy: 0.04,
      Materials: 0.02,
      "Real Estate": 0.02,
      Utilities: 0.02,
    },
  },
  {
    key: "SP500_GROWTH",
    holdings: 150, // S&P 500 Growth holds ~150 of the index's growth names
    tickers: ["SPYG", "VOOG", "IVW"],
    sectorWeights: {
      Technology: 0.46,
      "Consumer Discretionary": 0.15,
      "Communication Services": 0.13,
      Healthcare: 0.08,
      Financials: 0.05,
      Industrials: 0.05,
      "Consumer Staples": 0.03,
      Energy: 0.01,
      Materials: 0.006,
      "Real Estate": 0.005,
      Utilities: 0.004,
    },
  },
  {
    key: "NASDAQ100",
    holdings: 100, // Nasdaq-100: 100 largest non-financial Nasdaq companies
    tickers: ["QQQ", "QQQM"],
    sectorWeights: {
      Technology: 0.51,
      "Communication Services": 0.16,
      "Consumer Discretionary": 0.13,
      Healthcare: 0.06,
      Industrials: 0.05,
      "Consumer Staples": 0.045,
      Utilities: 0.012,
      Energy: 0.006,
      Materials: 0.005,
      "Real Estate": 0.003,
    },
  },
];

// ticker (uppercase) → its index fund object
const FUND_BY_TICKER = new Map();
INDEX_FUNDS.forEach((fund) => {
  fund.tickers.forEach((ticker) => FUND_BY_TICKER.set(ticker, fund));
});

// ── Backward-compatible exports of the S&P 500 benchmark ─────────────────────
// These keep the "blended exposure vs S&P 500" comparison untouched: it still
// looks ONLY at S&P 500 trackers, never at the Growth or Nasdaq-100 funds.
const SP500_FUND = INDEX_FUNDS.find((f) => f.benchmark);
const SP500_ETFS = new Set(SP500_FUND.tickers);
const SP500_SECTOR_WEIGHTS = SP500_FUND.sectorWeights;

// ─────────────────────────────────────────────────────────────────────────────
// Helper: standard deviation of an array of numbers
// ─────────────────────────────────────────────────────────────────────────────
function stdDev(values) {
  if (values.length === 0) return 0;
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  const variance =
    values.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / values.length;
  return Math.sqrt(variance);
}

// Empty / zero-value result shape (kept in one place so it stays consistent)
function emptyResult() {
  return {
    totalValue: 0,
    diversification: 0,
    concentration: 0,
    riskScore: 0,
    sectors: {},
    blendedSectors: {},
    sectorVsSP500: {},
    sectorExposure: {},
    sp500Weight: 0,
    deadWeight: [],
    noteKeys: ["note_no_positions"],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main analyzer
// ─────────────────────────────────────────────────────────────────────────────
export function analyzePortfolio(positions = []) {
  if (!Array.isArray(positions) || positions.length === 0) {
    return emptyResult();
  }

  const totalValue = positions.reduce((acc, p) => acc + (p.value || 0), 0);
  if (totalValue === 0) {
    return emptyResult();
  }

  // ── Tag each position ────────────────────────────────────────────────────
  // `fund`   → the index fund it tracks (or null if it is an individual asset)
  // `isSP500`→ kept for backward compat: true ONLY for S&P 500 trackers
  const tagged = positions.map((p) => {
    const sym = (p.symbol || "").toUpperCase();
    const fund = FUND_BY_TICKER.get(sym) || null;
    return {
      ...p,
      weight: (p.value || 0) / totalValue,
      fund,
      isSP500: fund?.benchmark === true,
    };
  });

  // Fraction of the portfolio sitting in S&P 500 trackers (drives the vs-S&P 500
  // comparison and notes — intentionally NOT affected by Growth / Nasdaq funds).
  const sp500Weight = tagged
    .filter((p) => p.isSP500)
    .reduce((s, p) => s + p.weight, 0);

  // Fraction of the portfolio in ANY index fund (S&P 500 + Growth + Nasdaq-100).
  const indexFundWeight = tagged
    .filter((p) => p.fund)
    .reduce((s, p) => s + p.weight, 0);

  // ── Direct sectors (excludes S&P 500 ETFs only — unchanged) ──────────────
  // Feeds the "blended exposure vs S&P 500" view, which must stay as it was.
  const sectors = {};
  tagged
    .filter((p) => !p.isSP500)
    .forEach((p) => {
      const sector = p.sector || "Other";
      if (!sectors[sector]) sectors[sector] = { value: 0, positions: 0 };
      sectors[sector].value += p.value || 0;
      sectors[sector].positions++;
    });

  // ── Blended sectors (direct + implied via S&P 500 ETFs) — unchanged ──────
  const blendedSectors = {};
  Object.entries(sectors).forEach(([k, v]) => {
    blendedSectors[k] = { ...v, implied: 0 };
  });
  Object.entries(SP500_SECTOR_WEIGHTS).forEach(([sector, fraction]) => {
    const impliedValue = sp500Weight * totalValue * fraction;
    if (!blendedSectors[sector]) {
      blendedSectors[sector] = { value: 0, positions: 0, implied: 0 };
    }
    blendedSectors[sector].implied =
      (blendedSectors[sector].implied || 0) + impliedValue;
  });

  // ── TRUE sector exposure ──────────────────────────────────────────────────
  // Your real sector mix, looking through EVERY index fund you hold (S&P 500,
  // S&P 500 Growth, Nasdaq-100, ...). This single source drives the sector pie,
  // the "you vs S&P 500" comparison, and the sector-concentration part of the
  // risk score, so all three always agree.
  //
  // Direct part: individual assets only (every index fund is excluded here so
  // it is not counted twice — it is added back below via its sector mix).
  const directExposure = {};
  tagged
    .filter((p) => !p.fund)
    .forEach((p) => {
      const sector = p.sector || "Other";
      directExposure[sector] = (directExposure[sector] || 0) + (p.value || 0);
    });

  // Implied part: each index fund spread across its real sectors.
  const impliedExposure = {};
  INDEX_FUNDS.forEach((fund) => {
    const famWeight = tagged
      .filter((p) => p.fund === fund)
      .reduce((s, p) => s + p.weight, 0);
    if (famWeight <= 0) return;
    Object.entries(fund.sectorWeights).forEach(([sector, fraction]) => {
      impliedExposure[sector] =
        (impliedExposure[sector] || 0) + famWeight * totalValue * fraction;
    });
  });

  const sectorExposure = {};
  const exposureSectorNames = new Set([
    ...Object.keys(directExposure),
    ...Object.keys(impliedExposure),
  ]);
  exposureSectorNames.forEach((sector) => {
    const directVal = directExposure[sector] || 0;
    const impliedVal = impliedExposure[sector] || 0;
    const userPct = ((directVal + impliedVal) / totalValue) * 100;
    sectorExposure[sector] = {
      userPct: Number(userPct.toFixed(1)),
      directPct: Number(((directVal / totalValue) * 100).toFixed(1)),
      impliedPct: Number(((impliedVal / totalValue) * 100).toFixed(1)),
    };
  });

  // ── Sector vs S&P 500 benchmark comparison ────────────────────────────────
  // Uses the SAME true exposure as the pie above (so the two never disagree),
  // measured against the S&P 500's own sector weights. The benchmark stays the
  // S&P 500; only YOUR side reflects every index fund you hold. `impliedPct` is
  // the slice of each sector that is hidden inside your ETFs (any index fund),
  // `directPct` is what you hold as individual stocks.
  const sectorVsSP500 = {};
  const allSectorNames = new Set([
    ...Object.keys(sectorExposure),
    ...Object.keys(SP500_SECTOR_WEIGHTS),
  ]);
  allSectorNames.forEach((sector) => {
    const exp = sectorExposure[sector] || {
      userPct: 0,
      directPct: 0,
      impliedPct: 0,
    };
    const sp500Pct = (SP500_SECTOR_WEIGHTS[sector] || 0) * 100;
    sectorVsSP500[sector] = {
      userPct: exp.userPct,
      sp500Pct: Number(sp500Pct.toFixed(1)),
      delta: Number((exp.userPct - sp500Pct).toFixed(1)),
      directPct: exp.directPct,
      impliedPct: exp.impliedPct,
    };
  });

  // ── Risk Score (continuous 0–100) ────────────────────────────────────────

  // Component 1 — Concentration via modified HHI (40%)
  // Index funds count as their many underlying holdings, not as one position:
  // S&P 500 ≈ 1/500, Nasdaq-100 ≈ 1/100, S&P 500 Growth ≈ 1/150.
  let hhi = 0;
  tagged.forEach((p) => {
    const effectiveHoldings = p.fund ? p.fund.holdings : 1;
    hhi += (p.weight * p.weight) / effectiveHoldings;
  });
  const concentrationScore = Math.min(100, hhi * 100);

  // Component 2 — Top-sector concentration (30%)
  // Now based on TRUE sector exposure, so a heavy Nasdaq-100 or Growth position
  // correctly registers as sector concentration (mostly Technology).
  const exposurePcts = Object.values(sectorExposure).map((s) => s.userPct);
  const topSectorPct = exposurePcts.length ? Math.max(...exposurePcts) : 0;
  // S&P 500's own top sector (Tech) is ~31%; above 40% is high.
  const sectorScore = Math.min(100, (topSectorPct / 40) * 100);

  // Component 3 — Breadth: how many GICS sectors covered (20%)
  // When index funds are a meaningful slice, count sectors with >2% true
  // exposure (S&P 500 spreads across all 11; Nasdaq-100 covers far fewer).
  const directSectorCount = Object.keys(sectors).length;
  let effectiveSectorCount;
  if (indexFundWeight > 0.1) {
    const covered = Object.values(sectorExposure).filter(
      (s) => s.userPct >= 2,
    ).length;
    effectiveSectorCount = covered || directSectorCount;
  } else {
    effectiveSectorCount = directSectorCount;
  }
  const breadthScore = Math.max(0, ((11 - effectiveSectorCount) / 11) * 100);

  // Component 4 — ROI volatility across individual positions (10%)
  const rois = positions
    .filter((p) => p.roi !== null && p.roi !== undefined)
    .map((p) => p.roi);
  const roiStd = stdDev(rois);
  const volatilityScore = Math.min(100, roiStd * 200);

  const riskScore = Math.round(
    concentrationScore * 0.4 +
      sectorScore * 0.3 +
      breadthScore * 0.2 +
      volatilityScore * 0.1,
  );

  // ── Legacy fields (backward compat with existing components) ────────────
  // Headline single-asset concentration ignores ALL index funds (each is a
  // basket, not a single bet).
  const nonIndexPositions = tagged.filter((p) => !p.fund);
  const maxNonIndexValue = nonIndexPositions.length
    ? Math.max(...nonIndexPositions.map((p) => p.value || 0))
    : 0;
  const concentration = maxNonIndexValue / totalValue;
  const diversification = new Set(positions.map((p) => p.symbol)).size;

  // ── Dead weight: losing individual assets with significant weight ─────────
  // Index funds are excluded (a losing broad index is not a bad single pick).
  const deadWeight = tagged
    .filter(
      (p) =>
        !p.fund &&
        p.roi !== null &&
        p.roi !== undefined &&
        p.roi < 0 &&
        p.weight > 0.08, // >8% of portfolio and losing money
    )
    .map((p) => ({
      symbol: p.symbol,
      roi: Number((p.roi * 100).toFixed(1)),
      weight: Number((p.weight * 100).toFixed(1)),
    }));

  // ── Notes ─────────────────────────────────────────────────────────────────
  const noteKeys = [];
  if (concentration > 0.4 && sp500Weight < 0.5)
    noteKeys.push("note_high_concentration");
  if (directSectorCount < 4 && sp500Weight < 0.3)
    noteKeys.push("note_low_diversification");
  if (sp500Weight > 0.3) noteKeys.push("note_sp500_anchored");
  if (deadWeight.length > 0) noteKeys.push("note_dead_weight");
  if (!noteKeys.length) noteKeys.push("note_good_balance");

  return {
    totalValue,
    diversification,
    concentration,
    riskScore,
    sectors, // direct sectors only (excludes S&P 500 ETFs) — unchanged
    blendedSectors, // direct + implied via S&P 500 ETFs — unchanged
    sectorVsSP500, // comparison: your blend vs S&P 500 — unchanged
    sectorExposure, // NEW: true sector mix through ALL index funds
    sp500Weight, // 0–1 fraction in S&P 500 trackers
    deadWeight, // array of { symbol, roi, weight }
    noteKeys,
  };
}
