import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import { aeroportosBrasileiros } from '../../aeroportosBrasileiros'; // ajuste se necessário
import L from 'leaflet';

const MapaComRotas = () => {
  const position = [-15.77972, -47.92972]; // Centro aproximado do Brasil
  const zoom = 4.5;

  // Definição do ícone azul padrão
  const icon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // Criando as rotas entre aeroportos (exemplo: sequencial)
  const rotas = [];
  for (let i = 0; i < aeroportosBrasileiros.length - 1; i++) {
    const origem = aeroportosBrasileiros[i];
    const destino = aeroportosBrasileiros[i + 1];
    rotas.push([
      [origem.Latitude, origem.Longitude],
      [destino.Latitude, destino.Longitude],
    ]);
  }

  return (
    <MapContainer center={position} zoom={zoom} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {aeroportosBrasileiros.map((aeroporto, index) => (
        <Marker
          key={index}
          position={[aeroporto.Latitude, aeroporto.Longitude]}
          icon={icon}
        >
          <Popup>
            <strong>{aeroporto.Nome_Aeroporto}</strong><br />
            ICAO: {aeroporto.ICAO}<br />
            IATA: {aeroporto.IATA}<br />
            Cidade: {aeroporto.Cidade}
          </Popup>
        </Marker>
      ))}
      {rotas.map((rota, index) => (
        <Polyline key={index} positions={rota} color="red" />
      ))}
    </MapContainer>
  );
};

export default MapaComRotas;
