# 📊 PortfolioAnalyzer — AI Financial Assistant

Un MVP que permite cargar un portafolio en Excel, analizar su estructura, visualizarlo y obtener recomendaciones generadas por un agente AI no-agentic. Incluye frontend en React, backend en Node/Express y un LLM para generar insights financieros personalizados.

---

# 🚀 Características principales
- Carga de archivos Excel (.xlsx) con holdings del usuario.  
- Normalización automática de columnas (ticker, sector, cantidad, costo, etc.).  
- Procesamiento del portafolio en el backend.  
- Chat con agente AI para obtener recomendaciones basadas en el portafolio.  
- Arquitectura lista para análisis más complejos (scatter plot, rankings, métricas, etc.).  
- Integrado con modelos LLM

---

# 📂 Estructura General del proyecto

```
PortfolioAnalyzer/
│
├── frontend/       → React + Vite
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/        → Node + Express API
│   ├── src/
│   └── package.json
│
└── README.md
```

---

# 🛠️ Requisitos previos
- Node.js 18+
- npm o yarn

---

# 🔧 Configuración

## 1️⃣ Clona el repositorio
```bash
git clone https://github.com/Ianbp3/PortfolioAnalyzer---Agent.git
```

---

# 📌 Backend (Node + Express)

## 2️⃣ Instalar dependencias
```bash
cd backend
npm install
```

## 4️⃣ Iniciar backend
```bash
npm start
```

Servidor en:

```
http://localhost:4000
```

---

# 💻 Frontend (React + Vite)

## 5️⃣ Instalar dependencias
```bash
cd ../frontend
npm install
```

## 6️⃣ Iniciar frontend
```bash
npm run dev
```

Interfaz en:

```
http://localhost:5173/
```

---

# 🌐 Flujo de funcionamiento

### 1. Cargar portafolio
El usuario sube un archivo Excel.  
El frontend lo procesa y lo envía al backend.

### 📁 Ejemplo de archivo de portafolio a subir

La aplicación acepta archivos en formato **CSV** o **Excel (.xlsx)**.  
El archivo debe contener las columnas básicas del portafolio, como:

- **symbol** → símbolo del activo (AAPL, MSFT, NVDA, VOO, etc.)
- **shares** → cantidad de acciones o unidades
- **price** → precio promedio de compra
- **sector** → sector del activo (opcional)
- **roi** → retorno del capital invertido (opcional)
  
### 2. Análisis en backend
El backend:
- Valida columnas
- Calcula métricas simples
- Prepara el contexto para el LLM

### 3. Agente AI
El modelo devuelve:
- Insights financieros
- Recomendaciones
- Sugerencias de diversificación

### 4. Visualizaciones
- Scatter plot  
- Ranking por sector  
- Ranking por activos  

---

# 🤖 Agente AI (No-Agentic)
El sistema usa un agente no-agentic:  
analiza, razona y recomienda, pero no ejecuta acciones autónomas.

---

# 📦 Scripts

### Backend
```bash
npm start
npm run dev
```

### Frontend
```bash
npm run dev
npm run build
npm run preview
```

---

# 📝 Licencia
MIT — Libre para usar, modificar y mejorar.
