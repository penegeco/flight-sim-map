import { MapContainer, TileLayer, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const { BaseLayer } = LayersControl;

export default function MapView() {
  return (
    <MapContainer
      center={[-15.793889, -47.882778]} // Brasília
      zoom={5}
      style={{ height: '100vh', width: '100%' }}
    >
      <LayersControl position="topright">
        {/* OpenStreetMap como base */}
        <BaseLayer checked name="OpenStreetMap">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
        </BaseLayer>

        {/* Camada de WAC (exemplo de URL, substitua com a URL correta) */}
        <BaseLayer name="Carta WAC">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // Substitua pela URL real da carta WAC
            attribution="WAC"
          />
        </BaseLayer>

        {/* Camada de REA (exemplo de URL, substitua com a URL correta) */}
        <BaseLayer name="Carta REA">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // Substitua pela URL real da carta REA
            attribution="REA"
          />
        </BaseLayer>
      </LayersControl>
    </MapContainer>
  );
}
