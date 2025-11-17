import React, { useState } from "react";
import {
  Layout,
  Typography,
  Card,
  Spin,
  Descriptions,
  Tag,
  Button,
} from "antd";
import { MessageOutlined, CloseOutlined } from "@ant-design/icons";

import FileUploader from "./components/FileUploader";
import Chat from "./components/chat";
import PortfolioCharts from "./components/PortfolioCharts";
import SectorPieChart from "./components/SectorPieChart";
import PortfolioRadar from "./components/PortfolioRadar";
import SectorRanking from "./components/SectorRanking";
import AssetRanking from "./components/AssetRanking";
import ScatterRiskReturn from "./components/ScatterRiskReturn";

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

function riskColor(score) {
  if (score >= 70) return "red";
  if (score >= 40) return "orange";
  return "green";
}

function formatPercent(value) {
  return (value * 100).toFixed(1) + "%";
}

function App() {
  const [positions, setPositions] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);

  const handlePortfolioParsed = async (parsedPositions) => {
    setPositions(parsedPositions);
    setAnalysis(null);
    setLoadingAnalysis(true);

    try {
      const res = await fetch("http://localhost:4000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positions: parsedPositions }),
      });

      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          background: "#001529",
          display: "flex",
          alignItems: "center",
          paddingInline: 24,
        }}
      >
        <Title level={3} style={{ color: "white", margin: 0 }}>
          PortfolioAnalyzer
        </Title>
      </Header>

      <Button
        type="primary"
        shape="circle"
        icon={chatOpen ? <CloseOutlined /> : <MessageOutlined />}
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          position: "fixed",
          bottom: 30,
          right: 30,
          zIndex: 999,
          width: 60,
          height: 60,
          fontSize: 24,
        }}
      />

      <Content style={{ padding: 24 }}>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          <div style={{ flex: 3 }}>
            <Card>
              <Title level={4}>1. Sube tu portafolio</Title>
              <Paragraph type="secondary">
                Sube un archivo Excel con columnas como: <b>symbol</b>,{" "}
                <b>shares</b>, <b>price</b>, <b>sector</b> y opcionalmente{" "}
                <b>ROI</b>.
              </Paragraph>

              <FileUploader onPortfolioParsed={handlePortfolioParsed} />

              {loadingAnalysis && (
                <div style={{ marginTop: 16 }}>
                  <Spin /> Analizando portafolio...
                </div>
              )}

              {analysis && (
                <div style={{ marginTop: 16 }}>
                  <Title level={4}>2. Resumen del análisis</Title>

                  <Descriptions bordered size="small" column={1}>
                    <Descriptions.Item label="Valor total">
                      ${analysis.totalValue.toFixed(2)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Diversificación (n° de activos)">
                      {analysis.diversification}
                    </Descriptions.Item>
                    <Descriptions.Item label="Concentración máxima">
                      {formatPercent(analysis.concentration)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Riesgo (0-100)">
                      <Tag color={riskColor(analysis.riskScore)}>
                        {analysis.riskScore}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>

                  <Title level={5} style={{ marginTop: 16 }}>
                    Sectores
                  </Title>
                  {Object.entries(analysis.sectors || {}).map(
                    ([sector, info]) => (
                      <Tag key={sector}>
                        {sector}: {info.positions} pos. – $
                        {info.value.toFixed(2)}
                      </Tag>
                    )
                  )}

                  <SectorPieChart sectors={analysis.sectors} />
                  <SectorRanking positions={positions} />
                  <Title level={5} style={{ marginTop: 16 }}>
                    Notas
                  </Title>
                  {(analysis.notes || []).map((n, i) => (
                    <Paragraph key={i}>• {n}</Paragraph>
                  ))}
                </div>
              )}
            </Card>
            {positions.length > 0 && (
              <div style={{ marginTop: 32, overflow: "visible" }}>
                <PortfolioCharts data={positions} />
              </div>
            )}
            <div
              style={{
                display: "flex",
                gap: 24,
                marginTop: 32,
                justifyContent: "center",
                alignItems: "flex-start",
                overflow: "visible",
              }}
            >
              <div style={{ flex: 1, overflow: "visible" }}>
                <PortfolioRadar analysis={analysis} />
              </div>

              <div style={{ flex: 1, overflow: "visible" }}>
                <ScatterRiskReturn positions={positions} />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 24,
                marginTop: 32,
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                <AssetRanking positions={positions} />
              </div>
            </div>
          </div>

          {chatOpen && (
            <div
              style={{
                flex: 1,
                maxWidth: 380,
                position: "sticky",
                top: 24,
                height: "calc(100vh - 100px)",
                overflowY: "auto",
                padding: "12px 0",
                borderLeft: "1px solid #f0f0f0",
                background: "white",
              }}
            >
              <Chat analysis={analysis} positions={positions} />
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
}

export default App;
