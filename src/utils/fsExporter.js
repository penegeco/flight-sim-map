// src/utils/fsExporter.js

export function exportRouteToFS2020(rota) {
  if (!rota.length) {
    alert("Rota vazia!");
    return;
  }

  let pln = `<?xml version="1.0" encoding="UTF-8"?>
<SimBase.Document Type="AceXML" version="1,0">
  <Descr>AceXML Flight Plan</Descr>
  <FlightPlan.FlightPlan>
    <Title>${rota[0].icao} to ${rota[rota.length-1].icao}</Title>
    <FPType>VFR</FPType>
    <RouteType>LowAlt</RouteType>
    <CruisingAlt>5500</CruisingAlt>
    <DepartureID>${rota[0].icao}</DepartureID>
    <DepartureLLA>${rota[0].lat.toFixed(6)};${rota[0].lon.toFixed(6)};+${String(rota[0].altitude).padStart(5, '0')}.00</DepartureLLA>
    <DestinationID>${rota[rota.length-1].icao}</DestinationID>
    <DestinationLLA>${rota[rota.length-1].lat.toFixed(6)};${rota[rota.length-1].lon.toFixed(6)};+${String(rota[rota.length-1].altitude).padStart(5, '0')}.00</DestinationLLA>
    <DeparturePosition>RAMP_GA</DeparturePosition>
    <ATCWaypointList>
`;

  rota.forEach((ponto, i) => {
    const tipo = (i === 0 || i === rota.length - 1) ? "Airport" : "Intersection";
    pln += `      <ATCWaypoint id="${ponto.icao}">
        <ATCWaypointType>${tipo}</ATCWaypointType>
        <WorldPosition>${ponto.lat.toFixed(6)} ${ponto.lon.toFixed(6)} +${String(ponto.altitude).padStart(5, '0')}.00</WorldPosition>
        <ICAO>
          <ICAOIdent>${ponto.icao}</ICAOIdent>
        </ICAO>
      </ATCWaypoint>
`;
  });

  pln += `    </ATCWaypointList>
  </FlightPlan.FlightPlan>
</SimBase.Document>`;

  const blob = new Blob([pln], { type: "application/xml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "plano_de_voo.pln";
  link.click();
}
