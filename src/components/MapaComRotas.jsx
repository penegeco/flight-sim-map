import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { useState } from 'react';
import { aeroportosBrasileiros } from '../data/aeroportos';

const MapaComRotas = () => {
  const [rota, setRota] = useState([]);

  const adicionarAeroportoNaRota = (aeroporto) => {
    setRota((rotaAtual) => [...rotaAtual, [aeroporto.Latitude, aeroporto.Longitude]]);
  };

  const limparRota = () => {
    setRota([]);
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer center={[-15.7939, -47.8828]} zoom={4} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Marcadores dos aeroportos */}
        {aeroportosBrasileiros.map((aeroporto, index) => (
          <Marker
            key={index}
            position={[aeroporto.Latitude, aeroporto.Longitude]}
            eventHandlers={{
              click: () => adicionarAeroportoNaRota(aeroporto),
            }}
          >
            <Popup>
              <strong>{aeroporto.Cidade} ({aeroporto.IATA})</strong><br />
              {aeroporto.Nome_Aeroporto}<br />
              <em>Clique para adicionar à rota</em>
            </Popup>
          </Marker>
        ))}

        {/* Linha da rota */}
        {rota.length >= 2 && (
          <Polyline positions={rota} color="blue" />
        )}
      </MapContainer>

      {/* Botão para limpar rota */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1000,
        background: 'white',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
      }}>
        <button onClick={limparRota} style={{ fontSize: '14px', padding: '6px 10px' }}>
          Limpar rota
        </button>
      </div>
    </div>
  );
};

export default MapaComRotas;
