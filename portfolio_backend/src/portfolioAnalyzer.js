function analyzePortfolio(portfolio) {
  const totalPeso = portfolio.reduce((sum, p) => sum + (p.peso || 0), 0);
  const numActivos = portfolio.length;

  const maxPos = portfolio.reduce(
    (max, p) => ((p.peso || 0) > (max.peso || 0) ? p : max),
    { peso: 0 }
  );

  const sectorMap = {};
  for (const p of portfolio) {
    const sector = p.sector || "Desconocido";
    sectorMap[sector] = (sectorMap[sector] || 0) + (p.peso || 0);
  }

  const sectores = Object.entries(sectorMap).map(([sector, peso]) => ({
    sector,
    peso,
  }));

  const activosConRend = portfolio.filter(
    (p) => typeof p.rendimientoYTD === "number"
  );
  let rendimientoPromedio = null;
  if (activosConRend.length > 0) {
    rendimientoPromedio =
      activosConRend.reduce((a, p) => a + p.rendimientoYTD, 0) /
      activosConRend.length;
  }

  const insights = [];

  if (numActivos < 5) {
    insights.push({
      id: "diversificacion-baja",
      nivel: "warning",
      categoria: "Diversificación",
      mensaje: "Tu portafolio parece poco diversificado (menos de 5 activos).",
    });
  }

  if (maxPos.peso > 20) {
    insights.push({
      id: "concentracion-activo",
      nivel: "alert",
      categoria: "Concentración",
      mensaje: `Alta concentración en ${maxPos.ticker} (${maxPos.peso}%).`,
    });
  }

  for (const s of sectores) {
    if (s.peso > 40) {
      insights.push({
        id: `sector-${s.sector}`,
        nivel: "warning",
        categoria: "Sectores",
        mensaje: `El sector ${s.sector} representa ${s.peso}% del portafolio.`,
      });
    }
  }

  if (rendimientoPromedio !== null) {
    insights.push({
      id: "rendimiento-promedio",
      nivel: "info",
      categoria: "Rendimiento",
      mensaje: `El rendimiento promedio YTD es ${rendimientoPromedio.toFixed(
        2
      )}%.`,
    });
  }

  return {
    resumen: {
      totalPeso,
      numActivos,
      mayorPosicion: maxPos,
      sectores,
      rendimientoPromedio,
    },
    insights,
  };
}

module.exports = { analyzePortfolio };
