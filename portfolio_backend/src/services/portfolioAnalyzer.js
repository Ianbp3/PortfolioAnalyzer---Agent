export function analyzePortfolio(positions = []) {
  if (!Array.isArray(positions) || positions.length === 0) {
    return {
      totalValue: 0,
      diversification: 0,
      concentration: 0,
      riskScore: 0,
      sectors: {},
      noteKeys: ["note_no_positions"],
    };
  }

  const totalValue = positions.reduce((acc, p) => acc + (p.value || 0), 0);

  const sectors = positions.reduce((acc, p) => {
    const sector = p.sector || "No sector";
    if (!acc[sector]) acc[sector] = { value: 0, positions: 0 };
    acc[sector].value += p.value || 0;
    acc[sector].positions++;
    return acc;
  }, {});

  const maxValue = Math.max(...positions.map((p) => p.value || 0));
  const concentration = totalValue ? maxValue / totalValue : 0;
  const diversification = new Set(positions.map((p) => p.symbol)).size;

  let riskScore = 0;
  if (concentration > 0.4 && diversification <= 4) riskScore = 80;
  else if (concentration > 0.3) riskScore = 60;
  else if (diversification < 3) riskScore = 70;
  else riskScore = 30;

  // noteKeys are translated in the frontend via useLang
  const noteKeys = [];
  if (concentration > 0.4) noteKeys.push("note_high_concentration");
  if (diversification < 4) noteKeys.push("note_low_diversification");
  if (!noteKeys.length) noteKeys.push("note_good_balance");

  return {
    totalValue,
    diversification,
    concentration,
    riskScore,
    sectors,
    noteKeys,
  };
}
