import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './index.css';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

function App() {
  return (
    <div className="h-screen">
      <MapContainer center={[-23.4318, -46.4695]} zoom={10} className="h-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[-23.4318, -46.4695]}>
          <Popup>
            Aeroporto Internacional de Guarulhos (SBGR)
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default App;