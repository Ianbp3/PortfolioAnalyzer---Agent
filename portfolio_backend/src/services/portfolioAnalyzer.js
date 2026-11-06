// Index-tracking funds.
// Holding any of these is NOT a single-stock bet, it is a basket of many
// companies, so the analyzer treats it as diversification, not concentration,
// and "looks through" it into its real sector mix.
// To support a new index later, add one more object here (tickers + holdings
// count + sector weights) and its constituent weights in PortfolioCharts.jsx.
// Sector weights are cap-weighted approximations (mid-2026) and should be
// refreshed periodically. They do not need to sum to exactly 1.
const INDEX_FUNDS = [
  {
    key: "SP500",
    benchmark: true,
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
    holdings: 150,
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
    holdings: 100,
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

// ticker (uppercase) -> its index fund object
const FUND_BY_TICKER = new Map();
INDEX_FUNDS.forEach((fund) => {
  fund.tickers.forEach((ticker) => FUND_BY_TICKER.set(ticker, fund));
});

// Backward-compatible exports of the S&P 500 benchmark
const SP500_FUND = INDEX_FUNDS.find((f) => f.benchmark);
const SP500_SECTOR_WEIGHTS = SP500_FUND.sectorWeights;

function stdDev(values) {
  if (values.length === 0) return 0;
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  const variance =
    values.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function emptyResult() {
  return {
    totalValue: 0,
    diversification: 0,
    concentration: 0,
    riskScore: 0,
    riskBreakdown: {},
    sectors: {},
    blendedSectors: {},
    sectorVsSP500: {},
    sectorExposure: {},
    sp500Weight: 0,
    deadWeight: [],
    noteKeys: ["note_no_positions"],
  };
}

export function analyzePortfolio(positions = []) {
  if (!Array.isArray(positions) || positions.length === 0) {
    return emptyResult();
  }

  const totalValue = positions.reduce((acc, p) => acc + (p.value || 0), 0);
  if (totalValue === 0) {
    return emptyResult();
  }

  // Tag each position
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

  const sp500Weight = tagged
    .filter((p) => p.isSP500)
    .reduce((s, p) => s + p.weight, 0);

  const indexFundWeight = tagged
    .filter((p) => p.fund)
    .reduce((s, p) => s + p.weight, 0);

  // Direct sectors (excludes S&P 500 ETFs only)
  const sectors = {};
  tagged
    .filter((p) => !p.isSP500)
    .forEach((p) => {
      const sector = p.sector || "Other";
      if (!sectors[sector]) sectors[sector] = { value: 0, positions: 0 };
      sectors[sector].value += p.value || 0;
      sectors[sector].positions++;
    });

  // Blended sectors (direct + implied via S&P 500 ETFs)
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

  // TRUE sector exposure, looking through EVERY index fund
  const directExposure = {};
  tagged
    .filter((p) => !p.fund)
    .forEach((p) => {
      const sector = p.sector || "Other";
      directExposure[sector] = (directExposure[sector] || 0) + (p.value || 0);
    });

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

  // Sector vs S&P 500 benchmark comparison
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

  // Risk Score (continuous 0-100)

  // Component 1: concentration via modified HHI (40%)
  let hhi = 0;
  tagged.forEach((p) => {
    const effectiveHoldings = p.fund ? p.fund.holdings : 1;
    hhi += (p.weight * p.weight) / effectiveHoldings;
  });
  const concentrationScore = Math.min(100, hhi * 100);

  // Component 2: top-sector concentration (30%)
  const exposurePcts = Object.values(sectorExposure).map((s) => s.userPct);
  const topSectorPct = exposurePcts.length ? Math.max(...exposurePcts) : 0;
  const sectorScore = Math.min(100, (topSectorPct / 40) * 100);

  // Component 3: breadth, how many GICS sectors covered (20%)
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

  // Component 4: ROI volatility across individual positions (10%)
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

  // Breakdown of the score: points contributed by each component vs its max.
  const riskBreakdown = {
    concentration: { points: +(concentrationScore * 0.4).toFixed(1), max: 40 },
    sector: { points: +(sectorScore * 0.3).toFixed(1), max: 30 },
    breadth: { points: +(breadthScore * 0.2).toFixed(1), max: 20 },
    volatility: { points: +(volatilityScore * 0.1).toFixed(1), max: 10 },
  };

  // Legacy fields
  const nonIndexPositions = tagged.filter((p) => !p.fund);
  const maxNonIndexValue = nonIndexPositions.length
    ? Math.max(...nonIndexPositions.map((p) => p.value || 0))
    : 0;
  const concentration = maxNonIndexValue / totalValue;
  const diversification = new Set(positions.map((p) => p.symbol)).size;

  // Dead weight: losing individual assets with significant weight
  const deadWeight = tagged
    .filter(
      (p) =>
        !p.fund &&
        p.roi !== null &&
        p.roi !== undefined &&
        p.roi < 0 &&
        p.weight > 0.08,
    )
    .map((p) => ({
      symbol: p.symbol,
      roi: Number((p.roi * 100).toFixed(1)),
      weight: Number((p.weight * 100).toFixed(1)),
    }));

  // Notes
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
    riskBreakdown,
    sectors,
    blendedSectors,
    sectorVsSP500,
    sectorExposure,
    sp500Weight,
    deadWeight,
    noteKeys,
  };
}
