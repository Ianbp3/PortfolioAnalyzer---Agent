import React from "react";
import { Card, List, Tag } from "antd";

export default function AssetRanking({ positions }) {
  if (!positions || positions.length === 0) return null;

  const sorted = [...positions].sort((a, b) => (b.roi || 0) - (a.roi || 0));

  const top = sorted.slice(0, 5);
  const bottom = sorted.slice(-5).reverse();

  return (
    <div style={{ marginTop: 32 }}>
      <div
        style={{
          display: "flex",
          gap: 24,
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        {/* TOP 5 */}
        <div style={{ flex: 1 }}>
          <Card title="Top 5 Activos por ROI" bordered>
            <List
              dataSource={top}
              renderItem={(item) => (
                <List.Item>
                  <b>{item.symbol}</b>
                  <Tag color="green">{(item.roi * 100).toFixed(2)}%</Tag>
                </List.Item>
              )}
            />
          </Card>
        </div>

        {/* BOTTOM 5 */}
        <div style={{ flex: 1 }}>
          <Card title="Peores 5 Activos por ROI" bordered>
            <List
              dataSource={bottom}
              renderItem={(item) => (
                <List.Item>
                  <b>{item.symbol}</b>
                  <Tag color="red">{(item.roi * 100).toFixed(2)}%</Tag>
                </List.Item>
              )}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
