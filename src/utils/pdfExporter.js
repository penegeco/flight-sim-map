import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts?.default?.pdfMake?.vfs || pdfFonts?.pdfMake?.vfs;

export const exportRouteToPDF = (rota, trechos) => {
  const content = [];

  content.push({ text: "Plano de Voo", style: "header", margin: [0, 0, 0, 20] });

  rota.forEach((ponto, i) => {
    const trecho = trechos[i - 1] || {};
    content.push(
      { text: `Waypoint ${i + 1}`, style: "subheader", margin: [0, 10, 0, 5] },
      {
        table: {
          widths: ["auto", "*"],
          body: [
            ["ICAO", ponto.icao || "—"],
            ["Nome", ponto.nome || "—"],
            ["Latitude", ponto.lat?.toFixed(4) || "—"],
            ["Longitude", ponto.lon?.toFixed(4) || "—"],
            ["Altitude", `${ponto.altitude} ft`],
            ["Tempo acumulado", trecho.tempoAcumulado ? `${trecho.tempoAcumulado} min` : "—"],
            ["Heading MAG", trecho.heading ? `${trecho.heading}°` : "—"],
            ["Declinação", trecho.decl ? `${trecho.decl}°` : "—"],
            ["Distância", trecho.dist ? `${trecho.dist} NM` : "—"]
          ]
        },
        layout: "lightHorizontalLines"
      }
    );
  });

  const docDefinition = {
    content,
    styles: {
      header: { fontSize: 22, bold: true, alignment: "center" },
      subheader: { fontSize: 16, bold: true, color: "#1a1a1a" }
    },
    defaultStyle: { fontSize: 12 },
    pageMargins: [40, 60, 40, 60]
  };

  pdfMake.createPdf(docDefinition).download("plano_de_voo.pdf");
};
