// MapaComRotas.jsx
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import { aeroportosBrasileiros } from '../data/aeroportos';

const MapaComRotas = () => {
  // Definimos a posição inicial do mapa
  const center = [-15.7797, -47.9297]; // Brasília como ponto central

  // Geramos as rotas entre todos os aeroportos (ligando cada um ao próximo)
  const rotas = aeroportosBrasileiros.slice(1).map((aeroporto, index) => [
    [aeroportosBrasileiros[index].Latitude, aeroportosBrasileiros[index].Longitude],
    [aeroporto.Latitude, aeroporto.Longitude],
  ]);

  return (
    <MapContainer center={center} zoom={5} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {aeroportosBrasileiros.map((aeroporto, idx) => (
        <Marker
          key={idx}
          position={[aeroporto.Latitude, aeroporto.Longitude]}
        >
          <Popup>
            <strong>{aeroporto.Nome_Aeroporto}</strong><br />
            Cidade: {aeroporto.Cidade}<br />
            ICAO: {aeroporto.ICAO}<br />
            IATA: {aeroporto.IATA}
          </Popup>
        </Marker>
      ))}

      {rotas.map((rota, idx) => (
        <Polyline key={idx} positions={rota} color="blue" />
      ))}
    </MapContainer>
  );
};

export default MapaComRotas;
