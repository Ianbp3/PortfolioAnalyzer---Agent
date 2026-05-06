// ─────────────────────────────────────────────────────────────────────────────
// Known S&P 500 index trackers. Large concentration here is NOT a risk signal
// — it represents broad diversification across ~500 companies.
// ─────────────────────────────────────────────────────────────────────────────
const SP500_ETFS = new Set([
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
]);

// S&P 500 approximate sector weights (as of 2025)
const SP500_SECTOR_WEIGHTS = {
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
};

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

// ─────────────────────────────────────────────────────────────────────────────
// Main analyzer
// ─────────────────────────────────────────────────────────────────────────────
export function analyzePortfolio(positions = []) {
  if (!Array.isArray(positions) || positions.length === 0) {
    return {
      totalValue: 0,
      diversification: 0,
      concentration: 0,
      riskScore: 0,
      sectors: {},
      blendedSectors: {},
      sectorVsSP500: {},
      sp500Weight: 0,
      deadWeight: [],
      noteKeys: ["note_no_positions"],
    };
  }

  const totalValue = positions.reduce((acc, p) => acc + (p.value || 0), 0);
  if (totalValue === 0) {
    return {
      totalValue: 0,
      diversification: 0,
      concentration: 0,
      riskScore: 0,
      sectors: {},
      blendedSectors: {},
      sectorVsSP500: {},
      sp500Weight: 0,
      deadWeight: [],
      noteKeys: ["note_no_positions"],
    };
  }

  // ── Tag each position ────────────────────────────────────────────────────
  const tagged = positions.map((p) => ({
    ...p,
    weight: (p.value || 0) / totalValue,
    isSP500: SP500_ETFS.has((p.symbol || "").toUpperCase()),
  }));

  const sp500Weight = tagged
    .filter((p) => p.isSP500)
    .reduce((s, p) => s + p.weight, 0);

  // ── Direct sectors (non-S&P500 ETF holdings only) ────────────────────────
  const sectors = {};
  tagged
    .filter((p) => !p.isSP500)
    .forEach((p) => {
      const sector = p.sector || "Other";
      if (!sectors[sector]) sectors[sector] = { value: 0, positions: 0 };
      sectors[sector].value += p.value || 0;
      sectors[sector].positions++;
    });

  // ── Blended sectors (direct + implied via S&P 500 ETFs) ─────────────────
  // Deep-copy direct sectors
  const blendedSectors = {};
  Object.entries(sectors).forEach(([k, v]) => {
    blendedSectors[k] = { ...v, implied: 0 };
  });

  // Add implied sector exposure from S&P 500 ETFs
  Object.entries(SP500_SECTOR_WEIGHTS).forEach(([sector, fraction]) => {
    const impliedValue = sp500Weight * totalValue * fraction;
    if (!blendedSectors[sector]) {
      blendedSectors[sector] = { value: 0, positions: 0, implied: 0 };
    }
    blendedSectors[sector].implied =
      (blendedSectors[sector].implied || 0) + impliedValue;
  });

  // ── Sector vs S&P 500 benchmark comparison ───────────────────────────────
  const sectorVsSP500 = {};
  const allSectorNames = new Set([
    ...Object.keys(blendedSectors),
    ...Object.keys(SP500_SECTOR_WEIGHTS),
  ]);

  allSectorNames.forEach((sector) => {
    const directVal = blendedSectors[sector]?.value || 0;
    const impliedVal = blendedSectors[sector]?.implied || 0;
    const userPct = ((directVal + impliedVal) / totalValue) * 100;
    const sp500Pct = (SP500_SECTOR_WEIGHTS[sector] || 0) * 100;
    sectorVsSP500[sector] = {
      userPct: Number(userPct.toFixed(1)),
      sp500Pct: Number(sp500Pct.toFixed(1)),
      delta: Number((userPct - sp500Pct).toFixed(1)),
      directPct: Number(((directVal / totalValue) * 100).toFixed(1)),
      impliedPct: Number(((impliedVal / totalValue) * 100).toFixed(1)),
    };
  });

  // ── Risk Score (continuous 0–100) ────────────────────────────────────────

  // Component 1 — Concentration via modified HHI (40%)
  // S&P 500 ETFs treated as ~500 equally-weighted positions → effective HHI ≈ 1/500 = 0.002
  let hhi = 0;
  tagged.forEach((p) => {
    const effectiveHHI = p.isSP500
      ? p.weight * p.weight * 0.002
      : p.weight * p.weight;
    hhi += effectiveHHI;
  });
  // HHI = 1.0 → single asset. ~0.01 → 100 equal assets. Normalize to 0–100.
  const concentrationScore = Math.min(100, hhi * 100);

  // Component 2 — Blended top-sector concentration (30%)
  // Measures how overloaded your effective exposure is in one sector
  const blendedSectorPcts = Object.values(sectorVsSP500).map((s) => s.userPct);
  const topBlendedSectorPct = blendedSectorPcts.length
    ? Math.max(...blendedSectorPcts)
    : 0;
  // Penalize if top sector > S&P 500's top sector (31% Tech). Above 40% is high.
  const sectorScore = Math.min(100, (topBlendedSectorPct / 40) * 100);

  // Component 3 — Breadth: how many GICS sectors covered (20%)
  // S&P 500 ETFs (if >10% of portfolio) count as covering all 11 sectors
  const directSectorCount = Object.keys(sectors).length;
  const effectiveSectorCount = sp500Weight > 0.1 ? 11 : directSectorCount;
  // Few sectors = high score (risky). All 11 = 0 (max diversification).
  const breadthScore = Math.max(0, ((11 - effectiveSectorCount) / 11) * 100);

  // Component 4 — ROI volatility across individual positions (10%)
  const rois = positions
    .filter((p) => p.roi !== null && p.roi !== undefined)
    .map((p) => p.roi);
  const roiStd = stdDev(rois);
  // A std dev of 0.5 (50% spread) → score of 100
  const volatilityScore = Math.min(100, roiStd * 200);

  const riskScore = Math.round(
    concentrationScore * 0.4 +
      sectorScore * 0.3 +
      breadthScore * 0.2 +
      volatilityScore * 0.1,
  );

  // ── Legacy fields (backward compat with existing components) ────────────
  const nonSP500Positions = tagged.filter((p) => !p.isSP500);
  const maxNonSP500Value = nonSP500Positions.length
    ? Math.max(...nonSP500Positions.map((p) => p.value || 0))
    : 0;
  const concentration = maxNonSP500Value / totalValue;
  const diversification = new Set(positions.map((p) => p.symbol)).size;

  // ── Dead weight: losing assets with significant weight ───────────────────
  const deadWeight = tagged
    .filter(
      (p) =>
        !p.isSP500 &&
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
    sectors, // direct sectors only (used by existing SectorPieChart)
    blendedSectors, // direct + implied (available for future use)
    sectorVsSP500, // comparison table: user blended % vs S&P 500 %
    sp500Weight, // 0–1 fraction of portfolio in S&P 500 ETFs
    deadWeight, // array of { symbol, roi, weight }
    noteKeys,
  };
}
