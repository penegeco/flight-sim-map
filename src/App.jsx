import './index.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import MapaComRotas from './components/MapaComRotas';

// Define o ícone padrão para os marcadores
const defaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// Usa o componente de mapa com rotas
function App() {
  return <MapaComRotas />;
}

export default App;
