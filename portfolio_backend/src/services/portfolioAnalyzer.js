export function analyzePortfolio(positions = []) {
  if (!Array.isArray(positions) || positions.length === 0) {
    return {
      totalValue: 0,
      diversification: 0,
      concentration: 0,
      riskScore: 0,
      sectors: {},
      notes: ["No se recibieron posiciones en el portafolio."],
    };
  }

  const totalValue = positions.reduce((acc, p) => acc + (p.value || 0), 0);

  const sectors = positions.reduce((acc, p) => {
    const sector = p.sector || "Sin sector";
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

  const notes = [];
  if (concentration > 0.4) notes.push("Alta concentración (>40%).");
  if (diversification < 4) notes.push("Poca diversificación.");
  if (!notes.length) notes.push("Buen balance general.");

  return {
    totalValue,
    diversification,
    concentration,
    riskScore,
    sectors,
    notes,
  };
}
