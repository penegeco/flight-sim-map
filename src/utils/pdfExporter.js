import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts?.default?.pdfMake?.vfs || pdfFonts?.pdfMake?.vfs;

export const exportRouteToPDF = (rota, trechos) => {
  // Monta o corpo da tabela com cabeçalho
  const tableBody = [
    [
      { text: '#', bold: true, fillColor: '#eeeeee' },
      { text: 'ICAO', bold: true, fillColor: '#eeeeee' },
      { text: 'Nome', bold: true, fillColor: '#eeeeee' },
      { text: 'Lat', bold: true, fillColor: '#eeeeee' },
      { text: 'Lon', bold: true, fillColor: '#eeeeee' },
      { text: 'Alt (ft)', bold: true, fillColor: '#eeeeee' },
      { text: 'Heading', bold: true, fillColor: '#eeeeee' },
      { text: 'Declinação', bold: true, fillColor: '#eeeeee' },
      { text: 'Distância (NM)', bold: true, fillColor: '#eeeeee' },
      { text: 'Tempo (min)', bold: true, fillColor: '#eeeeee' },
      { text: 'Acumulado (min)', bold: true, fillColor: '#eeeeee' }
    ]
  ];

  // Adiciona cada waypoint e seus dados
  rota.forEach((ponto, i) => {
    const trecho = trechos[i - 1] || {};
    tableBody.push([
      i + 1,
      ponto.icao || '—',
      ponto.nome || '—',
      ponto.lat?.toFixed(4) || '—',
      ponto.lon?.toFixed(4) || '—',
      ponto.altitude ? `${ponto.altitude}` : '—',
      trecho.heading ? `${trecho.heading}°` : '—',
      trecho.decl ? `${trecho.decl}°` : '—',
      trecho.dist ? `${trecho.dist}` : '—',
      trecho.tempo ? `${trecho.tempo}` : '—',
      trecho.tempoAcumulado ? `${trecho.tempoAcumulado}` : '—'
    ]);
  });

  const docDefinition = {
    content: [
      { text: 'Plano de Voo', style: 'header', margin: [0, 0, 0, 20] },
      {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: tableBody
        },
        layout: {
          fillColor: (rowIndex) => (rowIndex % 2 === 0 ? null : '#f5f5f5')
        }
      }
    ],
    styles: {
      header: { fontSize: 22, bold: true, alignment: 'center' }
    },
    defaultStyle: { fontSize: 10 },
    pageMargins: [40, 60, 40, 60]
  };

  pdfMake.createPdf(docDefinition).download('plano_de_voo.pdf');
};
