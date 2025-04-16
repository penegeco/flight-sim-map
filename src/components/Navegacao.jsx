import { useEffect, useState } from "react";
import {
  Marker,
  Polyline,
  useMapEvents,
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
import { saveAs } from "file-saver";
import jsPDF from "jspdf";

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
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c) / 1.852;
}

function SortableItem({ ponto, tempoAcumulado, onEditNome, onEditAltitude }) {
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
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ width: "60px", fontWeight: "bold" }}>{ponto.icao}</span>
        <input
          type="text"
          value={ponto.nome}
          onChange={(e) => onEditNome(ponto.icao, e.target.value)}
          style={{ flex: 1 }}
        />
        <input
          type="number"
          value={ponto.altitude}
          onChange={(e) => onEditAltitude(ponto.icao, Number(e.target.value))}
          style={{ width: "60px" }}
          placeholder="Alt (ft)"
        />
      </div>
      <div style={{ fontSize: "12px", color: "#444" }}>
        ⏱ Acumulado: {tempoAcumulado} min | Altitude: {ponto.altitude} ft
      </div>
    </li>
  );
}

export default function Navegacao() {
  const [rota, setRota] = useState([]);
  const [velocidade, setVelocidade] = useState(120);
  const [trechos, setTrechos] = useState([]);

  const adicionarPonto = (ponto) => setRota((prev) => [...prev, ponto]);
  const limparRota = () => { setRota([]); setTrechos([]); };

  const editarNomePonto = (icao, novoNome) => {
    setRota((prev) => prev.map((p) => p.icao === icao ? { ...p, nome: novoNome } : p));
  };
  const editarAltitudePonto = (icao, novaAlt) => {
    setRota((prev) => prev.map((p) => p.icao === icao ? { ...p, altitude: novaAlt } : p));
  };

  const generatePln = () => {
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>`;
    const header = `<SimBase.Document Type="AceXML" version="1,0">
  <Descr>Flight plan</Descr>
  <FlightPlan.FlightPlan>`;
    const footer = `  </FlightPlan.FlightPlan>
</SimBase.Document>`;
    const body = rota.map((ponto, idx) => `
    <ATCWaypoint id="${ponto.icao}">
      <ATCWaypointType>${idx === 0 ? "Departure" : idx === rota.length - 1 ? "Destination" : "Enroute"}</ATCWaypointType>
      <WorldPosition>${ponto.lon.toFixed(6)} ${ponto.lat.toFixed(6)} ${ponto.altitude}</WorldPosition>
      <Altitude>${ponto.altitude}</Altitude>
    </ATCWaypoint>`).join("\n");

    const fullXml = `${xmlHeader}\n${header}\n${body}\n${footer}`;
    const blob = new Blob([fullXml], { type: "text/xml;charset=utf-8" });
    saveAs(blob, "plano-de-voo.pln");
  };

  const generatePdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Briefing de Navegação", 20, 20);
    doc.setFontSize(12);
    rota.forEach((ponto, idx) => {
      const y = 30 + idx * 10;
      doc.text(`${idx+1}. ${ponto.icao} - ${ponto.nome} | Alt: ${ponto.altitude} ft`, 20, y);
    });
    doc.text("\nTrechos:", 20, 30 + rota.length * 10);
    trechos.forEach((t, i) => {
      const y = 40 + rota.length * 10 + i * 10;
      doc.text(`${t.origem} → ${t.destino} | ${t.dist} NM | ${t.tempo} min | Acum: ${t.tempoAcumulado} min`, 20, y);
    });
    doc.save("navegacao.pdf");
  };

  useMapEvents({
    click(e) {
      adicionarPonto({ nome: "Ponto Livre", icao: `WP${rota.length+1}`, lat: e.latlng.lat, lon: e.latlng.lng, altitude: 3000 });
    },
  });

  const sensors = useSensors(useSensor(PointerSensor));
  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over.id) {
      const oldIndex = rota.findIndex((p) => p.icao === active.id);
      const newIndex = rota.findIndex((p) => p.icao === over.id);
      setRota((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  useEffect(() => {
    if (rota.length < 2) return setTrechos([]);
    (async () => {
      let tempoAcumulado = 0;
      const novoTrechos = rota.slice(1).map((atual, i) => {
        const anterior = rota[i];
        const dist = distanciaNM(anterior.lat, anterior.lon, atual.lat, atual.lon);
        const tempo = (dist/velocidade)*60;
        tempoAcumulado += tempo;
        return {
          origem: anterior.icao,
          destino: atual.icao,
          dist: dist.toFixed(1),
          tempo: tempo.toFixed(0),
          tempoAcumulado: tempoAcumulado.toFixed(0),
        };
      });
      setTrechos(novoTrechos);
    })();
  }, [rota, velocidade]);

  return (
    <>
      <div style={{ position: "absolute", top:60, right:10, zIndex:1000, background:"white", padding:"10px", borderRadius:"8px", width:"340px", fontSize:"14px" }}>
        <input type="text" placeholder="Buscar aeroporto..." onChange={(e)=>{
          const termo=e.target.value.toLowerCase();
          const resultado=aeroportos.find(a=>a.icao.toLowerCase().includes(termo)||a.iata.toLowerCase().includes(termo)||a.nome.toLowerCase().includes(termo));
          if(resultado) adicionarPonto({ ...resultado, nome:resultado.nome, altitude:resultado.altitude??3000 });
        }} />

        <div style={{ marginTop:"10px" }}>
          <label>Velocidade (kt): </label>
          <input type="number" value={velocidade} onChange={e=>setVelocidade(Number(e.target.value))} style={{ width:"60px" }} />
        </div>

        <button onClick={limparRota} style={{ marginTop:"10px" }}>Limpar rota</button>
        <button onClick={generatePln} style={{ marginTop:"10px" }}>Exportar .PLN</button>
        <button onClick={generatePdf} style={{ marginTop:"10px" }}>Download PDF</button>

        <h4>Rota (arraste para reordenar):</h4>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rota.map(p=>p.icao)} strategy={verticalListSortingStrategy}>
            <ul style={{ padding:0, margin:0, listStyle:"none" }}>
              {rota.map((ponto, idx) => (
                <SortableItem
                  key={ponto.icao}
                  ponto={ponto}
                  tempoAcumulado={idx===0?0:trechos[idx-1]?.tempoAcumulado||0}
                  onEditNome={editarNomePonto}
                  onEditAltitude={editarAltitudePonto}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>

        {trechos.length>0 && (
          <>
            <h4>Trechos:</h4>
            <ul>
              {trechos.map((t,i)=>(
                <li key={i} style={{ marginBottom:"8px" }}>
                  <strong>{t.origem} → {t.destino}</strong><br />
                  {t.dist} NM | ⏱ {t.tempo} min<br />
                  Acumulado: {t.tempoAcumulado} min<br />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {rota.map((ponto,idx)=>(
        <Marker key={idx} position={[ponto.lat,ponto.lon]} icon={icon} draggable eventHandlers={{ dragend:e=>{
          const { lat, lng }=e.target.getLatLng();
          setRota(prev=>prev.map((p,i)=>i===idx?{...p,lat,lng}:p));
        } }} />
      ))}

      {rota.length>1 && <Polyline positions={rota.map(p=>[p.lat,p.lon])} color="blue" />}
    </>
  );
}
