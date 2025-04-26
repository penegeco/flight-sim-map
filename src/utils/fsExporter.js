// src/utils/fsExporter.js

export const exportRouteToFS2020 = (rota) => {
  let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xmlContent += '<FPL>\n';
  xmlContent += '  <FlightPlan>\n';
  xmlContent += '    <Route>\n';

  rota.forEach((ponto) => {
    xmlContent += `      <Waypoint ICAO="${ponto.icao}" lat="${ponto.lat}" lon="${ponto.lon}" altitude="${ponto.altitude}" />\n`;
  });

  xmlContent += '    </Route>\n';
  xmlContent += '  </FlightPlan>\n';
  xmlContent += '</FPL>';

  const blob = new Blob([xmlContent], { type: 'application/xml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'plano_de_voo.fpl';
  link.click();
};

