import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

export default function CartaREAOverlay({ visible }) {
  const map = useMap();

  useEffect(() => {
    if (!visible) return;

    // Novo bounds estimado mais preciso
    const bounds = [
      [-25.09, -48.75], // Sudoeste
      [-22.05, -43.95], // Nordeste
    ];

    const overlay = L.imageOverlay(
      "/cartas/CCV_REA_TMA_SP_VALE_DO_PARAIBA_20_MAIO.png",
      bounds,
      { opacity: 0.6 }
    );

    overlay.addTo(map);

    return () => {
      map.removeLayer(overlay);
    };
  }, [map, visible]);

  return null;
}
