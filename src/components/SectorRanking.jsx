import React from "react";
import { Card, List, Tag } from "antd";

export default function SectorRanking({ positions }) {
  if (!positions || positions.length === 0) return null;

  const sectorMap = {};

  positions.forEach((p) => {
    if (!sectorMap[p.sector]) {
      sectorMap[p.sector] = { totalROI: 0, count: 0, totalValue: 0 };
    }
    sectorMap[p.sector].totalROI += p.roi || 0;
    sectorMap[p.sector].count += 1;
    sectorMap[p.sector].totalValue += p.value;
  });

  const result = Object.entries(sectorMap).map(([sector, d]) => ({
    sector,
    avgROI: d.totalROI / d.count,
    positions: d.count,
    value: d.totalValue,
  }));

  const sorted = result.sort((a, b) => b.avgROI - a.avgROI);

  return (
    <div style={{ marginTop: 32 }}>
      <Card title="Ranking por Sector (ROI Promedio)" bordered>
        <List
          dataSource={sorted}
          renderItem={(item) => (
            <List.Item>
              <b>{item.sector}</b>
              <Tag color={item.avgROI >= 0 ? "green" : "red"}>
                {(item.avgROI * 100).toFixed(2)}%
              </Tag>
              <span>({item.positions} activos)</span>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
