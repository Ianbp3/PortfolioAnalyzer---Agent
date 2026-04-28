import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import "antd/dist/reset.css";
import "./index.css";
import { LangProvider } from "./hooks/useLang";

const theme = {
  token: {
    colorPrimary: "#1a6b4a",
    colorBgContainer: "#ffffff",
    colorBgLayout: "#f7f6f2",
    borderRadius: 12,
    fontFamily: "'DM Sans', sans-serif",
    colorBorder: "#edecea",
    colorBorderSecondary: "#edecea",
    colorText: "#0d1117",
    colorTextSecondary: "#3d4450",
    colorTextTertiary: "#7a8394",
  },
  components: {
    Card: { borderRadius: 20, paddingLG: 28 },
    Button: { borderRadius: 99, fontWeight: 600 },
    Input: { borderRadius: 12 },
    Alert: { borderRadius: 12 },
  },
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConfigProvider theme={theme}>
      <BrowserRouter basename="/dashboard">
        <LangProvider>
          <App />
        </LangProvider>
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
);
