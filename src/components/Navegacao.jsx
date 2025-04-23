import geomagnetism from 'geomagnetism';
import { exportRouteToPDF } from "../utils/pdfExporter";
import { useEffect, useState } from "react";
import {
  Marker,
  Polyline,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { Icon } from "leaflet";
import aeroportos from "../data/aeroportosBrasileiros";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";


const icon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function distanciaNM(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c) / 1.852;
}

function getDeclinacao(lat, lon) {
  const model = geomagnetism.model();
  const result = model.point([lat, lon]);
  return result.decl;
}

async function calcularHeadingComDeclinacao(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  const brgTrue = (toDeg(Math.atan2(y, x)) + 360) % 360;
  const decl = await getDeclinacao(lat1, lon1);
  const brgMag = (brgTrue - decl + 360) % 360;
  return { hdgMag: brgMag, decl };
}

function SortableItem({ ponto, tempoAcumulado, onEditNome, onEditAltitude, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: ponto.icao });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    padding: "6px 8px",
    borderBottom: "1px solid #ddd",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    background: "#f9f9f9",
    borderRadius: "4px",
    marginBottom: "4px",
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span
  style={{ width: "60px", fontWeight: "bold", cursor: "grab" }}
  {...listeners}
>
  {ponto.icao}
</span>
        <input type="text" value={ponto.nome} onChange={(e) => onEditNome(ponto.icao, e.target.value)} style={{ flex: 1 }} />
        <input type="number" value={ponto.altitude} onChange={(e) => onEditAltitude(ponto.icao, Number(e.target.value))} style={{ width: "60px" }} placeholder="Alt (ft)" />
        {ponto.tipo !== "origem" && ponto.tipo !== "destino" && (
          <button onClick={() => onDelete(ponto.icao)} style={{ background: "red", color: "white", border: "none", borderRadius: "4px", padding: "4px" }}>✕</button>
        )}
      </div>
      <div style={{ fontSize: "12px", color: "#444" }}>
        ⏱ Acumulado: {tempoAcumulado} min | Altitude: {ponto.altitude} ft
      </div>
    </li>
  );
}

export default function Navegacao() {
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [rota, setRota] = useState([]);
  const [velocidade, setVelocidade] = useState(120);
  const [trechos, setTrechos] = useState([]);
  const map = useMap();
  const sensors = useSensors(useSensor(PointerSensor));

  const excluirWaypoint = (icao) => {
    setRota((prev) => prev.filter((p) => p.icao !== icao));
  };

  function handleOrigemChange(e) {
    const icao = e.target.value;
    setOrigem(icao);
    const ap = aeroportos.find(a => a.icao === icao);
    if (ap) {
      ap.tipo = "origem";
      setRota(prev => [ap, ...prev.filter(p => p.tipo !== "origem")]);
      map.setView([ap.lat, ap.lon], 10);
    }
  }

  function handleDestinoChange(e) {
    const icao = e.target.value;
    setDestino(icao);
    const ap = aeroportos.find(a => a.icao === icao);
    if (ap) {
      ap.tipo = "destino";
      setRota(prev => [...prev.filter(p => p.tipo !== "destino"), ap]);
      map.setView([ap.lat, ap.lon], 10);
    }
  }

  function adicionarPonto(ponto) {
    ponto.tipo = "intermediario";
    setRota(prev => {
      const inicio = prev.find(p => p.tipo === "origem");
      const fim = prev.find(p => p.tipo === "destino");
      const meio = prev.filter(p => p.tipo === "intermediario");
      return [
        ...(inicio ? [inicio] : []),
        ...meio,
        ponto,
        ...(fim ? [fim] : [])
      ];
    });
  }

  function editarNomePonto(icao, novoNome) {
    setRota(prev => prev.map(p => p.icao === icao ? { ...p, nome: novoNome } : p));
  }

  function editarAltitudePonto(icao, novaAlt) {
    setRota(prev => prev.map(p => p.icao === icao ? { ...p, altitude: novaAlt } : p));
  }

  function limparRota() {
    setOrigem("");
    setDestino("");
    setRota([]);
    setTrechos([]);
  }

  useMapEvents({
    click(e) {
      if (e.originalEvent.target.closest(".controle-rota")) return;
      adicionarPonto({
        nome: "",
        icao: `WP${rota.length + 1}`,
        lat: e.latlng.lat,
        lon: e.latlng.lng,
        altitude: 5500,
      });
    }
  });

  function handleDragEnd({ active, over }) {
    if (active.id !== over.id) {
      const oldIndex = rota.findIndex(p => p.icao === active.id);
      const newIndex = rota.findIndex(p => p.icao === over.id);
      setRota(items => arrayMove(items, oldIndex, newIndex));
    }
  }

  useEffect(() => {
    if (rota.length < 2) {
      setTrechos([]);
      return;
    }
    (async () => {
      let acum = 0;
      const novo = [];
      for (let i = 1; i < rota.length; i++) {
        const a = rota[i - 1];
        const b = rota[i];
        const d = distanciaNM(a.lat, a.lon, b.lat, b.lon);
        const t = (d / velocidade) * 60;
        acum += t;
        const { hdgMag, decl } = await calcularHeadingComDeclinacao(a.lat, a.lon, b.lat, b.lon);
        novo.push({ origem: a.icao, destino: b.icao, dist: d.toFixed(1), tempo: t.toFixed(0), tempoAcumulado: acum.toFixed(0), heading: hdgMag.toFixed(0), decl: decl.toFixed(1) });
      }
      setTrechos(novo);
    })();
  }, [rota, velocidade]);

  return (
    <>
      <div className="controle-rota" style={{ position: 'absolute', top: 60, right: 10, zIndex: 1000, background: 'white', padding: 10, borderRadius: 8, width: 340, fontSize: 14 }}>
        <div>
          <label>Origem:</label>
          <select value={origem} onChange={handleOrigemChange} style={{ width: '100%', margin: '4px 0' }}>
            <option value="">-- selecione --</option>
            {aeroportos.map(a => <option key={a.icao} value={a.icao}>{a.icao} - {a.nome}</option>)}
          </select>
        </div>
        <div>
          <label>Destino:</label>
          <select value={destino} onChange={handleDestinoChange} style={{ width: '100%', margin: '4px 0' }}>
            <option value="">-- selecione --</option>
            {aeroportos.map(a => <option key={a.icao} value={a.icao}>{a.icao} - {a.nome}</option>)}
          </select>
        </div>
        <div style={{ margin: '6px 0' }}>
          <label>Velocidade (kt):</label>
          <input type="number" value={velocidade} onChange={e => setVelocidade(Number(e.target.value))} style={{ width: 60, marginLeft: 4 }} />
        </div>
        <button onClick={limparRota}>Limpar rota</button>
	<button
  	onClick={() => exportRouteToPDF(rota, trechos)}
  	style={{
    	marginTop: 10,
    	marginBottom: 10,
    	background: "#007bff",
    	color: "white",
    	border: "none",
    	padding: "6px 10px",
    	borderRadius: 4
  	}}
	>
  	Exportar rota para PDF
	</button>

        <h4 style={{ margin: '10px 0 6px' }}>Rota (arraste):</h4>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rota.map(p => p.icao)} strategy={verticalListSortingStrategy}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 200, overflowY: 'auto' }}>
              {rota.map((p, i) => (
                <SortableItem key={p.icao} ponto={p} tempoAcumulado={trechos[i - 1]?.tempoAcumulado || 0} onEditNome={editarNomePonto} onEditAltitude={editarAltitudePonto} onDelete={excluirWaypoint} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
        {trechos.length > 0 && <>
          <h4>Trechos:</h4>
          <ul style={{ listStyle: 'none', padding: 0, maxHeight: 180, overflowY: 'auto' }}>
            {trechos.map((t, i) => (
              <li key={i} style={{ margin: '4px 0' }}>
                <strong>{t.origem}→{t.destino}</strong> {t.dist}NM • HDG{t.heading}° MAG • ⏱{t.tempo}min • Acum {t.tempoAcumulado}min • Decl {t.decl}°
              </li>
            ))}
          </ul>
        </>}
      </div>
      {rota.map((p, idx) => (
        <Marker key={idx} position={[p.lat, p.lon]} icon={icon} draggable eventHandlers={{
          dragend: e => {
            const { lat, lng } = e.target.getLatLng();
            setRota(prev => prev.map(x => x.icao === p.icao ? { ...x, lat, lon: lng } : x));
          }
        }} />
      ))}
      {rota.length > 1 && <Polyline positions={rota.map(p => [p.lat, p.lon])} color="blue" />}
    </>
  );
}
