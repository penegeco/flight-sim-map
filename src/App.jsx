import { useEffect, useState } from 'react';
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
  const [airports, setAirports] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [mapCenter, setMapCenter] = useState([-23.4318, -46.4695]);

  useEffect(() => {
    fetch("/airports.json")
      .then((res) => res.json())
      .then((data) => {
        setAirports(data);
        setFiltered(data);
      });
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    const results = airports.filter(
      (a) =>
        a.icao.toLowerCase().includes(term) ||
        a.iata.toLowerCase().includes(term) ||
        a.name.toLowerCase().includes(term) ||
        a.city.toLowerCase().includes(term)
    );
    setFiltered(results);
  }, [search, airports]);

  return (
    <div className="h-screen flex flex-col">
      <div className="p-2 bg-gray-100">
        <input
          type="text"
          placeholder="Buscar por ICAO, IATA, cidade ou nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 rounded border border-gray-300"
        />
        {search && (
          <ul className="bg-white border border-gray-300 rounded mt-2 max-h-40 overflow-auto z-10 absolute">
            {filtered.map((airport) => (
              <li
                key={airport.icao}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setMapCenter([airport.lat, airport.lon]);
                  setSearch("");
                }}
              >
                {airport.icao} / {airport.iata} - {airport.name} ({airport.city})
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex-1">
        <MapContainer center={mapCenter} zoom={5} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {airports.map((airport) => (
            <Marker key={airport.icao} position={[airport.lat, airport.lon]}>
              <Popup>
                <strong>{airport.icao} / {airport.iata}</strong><br />
                {airport.name}<br />
                {airport.city}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;