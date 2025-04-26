import L from "leaflet";
import { crsLambert } from "./map/crsLambert";
import { MapContainer, TileLayer } from "react-leaflet";
import { useState } from "react";
import { Layers, List } from "lucide-react";
import CartaREAOverlay from "./components/CartaREAOverlay";
import Navegacao from "./components/Navegacao";

export default function MapView() {
  const [showREA, setShowREA] = useState(false);
  const [showPanel, setShowPanel] = useState(true);

  return (
    <div style={{ position: 'relative' }}>
      {/* Botão Carta REA */}
      <button
        onClick={() => setShowREA(prev => !prev)}
        title={showREA ? "Ocultar Carta REA" : "Mostrar Carta REA"}
        aria-label={showREA ? "Ocultar Carta REA" : "Mostrar Carta REA"}
        style={{
          position: "absolute",
          top: "150px",
          left: "10px",
          zIndex: 1000,
          padding: "8px",
          background: showREA ? "#0066cc" : "#444",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          cursor: "pointer"
        }}
      >
        <Layers size={20} />
      </button>

      {/* Botão Toggle do Painel de Rota */}
      <button
        onClick={() => setShowPanel(prev => !prev)}
        title={showPanel ? "Ocultar painel de rota" : "Mostrar painel de rota"}
        aria-label={showPanel ? "Ocultar painel de rota" : "Mostrar painel de rota"}
        style={{
          position: "absolute",
          top: "100px",
          left: "10px",
          zIndex: 1000,
          padding: "8px",
          background: showPanel ? "#0066cc" : "#444",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          cursor: "pointer"
        }}
      >
        <List size={20} />
      </button>

 <MapContainer
  center={[-23.2, -46.5]}
  zoom={8}
  style={{ height: "100vh", width: "100%" }}
  whenCreated={(mapInstance) => {
    window._leaflet_map = mapInstance;
  }}
>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution="© OpenStreetMap contributors"
  />


        <CartaREAOverlay visible={showREA} />

        {/* Mantém Navegacao sempre montado, mas oculta visualmente quando necessário */}
        <div style={{ display: showPanel ? 'block' : 'none' }}>
          <Navegacao />
        </div>

      </MapContainer>
    </div>
  );
}
