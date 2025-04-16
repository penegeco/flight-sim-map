import { MapContainer, TileLayer } from "react-leaflet";
import { useState } from "react";
import CartaREAOverlay from "./components/CartaREAOverlay";
import Navegacao from "./components/Navegacao";

function MapView() {
  const [showREA, setShowREA] = useState(false);

  return (
    <div>
      <button
        onClick={() => setShowREA(!showREA)}
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1000,
          padding: "10px",
        }}
      >
        {showREA ? "Ocultar Carta REA" : "Mostrar Carta REA"}
      </button>

      <MapContainer
        center={[-23.2, -46.5]}
        zoom={8}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        <CartaREAOverlay visible={showREA} />
	<Navegacao />
      </MapContainer>
    </div>
  );
}

export default MapView;
