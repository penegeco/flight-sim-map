import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { aeroportosBrasileiros } from '../../aeroportosBrasileiros';
import { aeroportosBrasileiros } from '../data/aeroportos';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Define o ícone padrão dos marcadores
const defaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

export default function MapaComRotas() {
  // Gerar rotas entre os aeroportos em sequência
  const rotas = aeroportosBrasileiros.map((aeroporto) => [
    aeroporto.Latitude,
    aeroporto.Longitude,
  ]);

  return (
    <MapContainer center={[-15.78, -47.93]} zoom={4} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
      />

      {aeroportosBrasileiros.map((aeroporto, index) => (
        <Marker
          key={index}
          position={[aeroporto.Latitude, aeroporto.Longitude]}
        >
          <Popup>
            <strong>{aeroporto.Nome_Aeroporto}</strong><br />
            ICAO: {aeroporto.ICAO} | IATA: {aeroporto.IATA}<br />
            Cidade: {aeroporto.Cidade}
          </Popup>
        </Marker>
      ))}

      {/* Linha conectando os aeroportos */}
      <Polyline positions={rotas} color="blue" />
    </MapContainer>
  );
}
