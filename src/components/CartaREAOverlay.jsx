import { ImageOverlay } from "react-leaflet";

function CartaREAOverlay({ visible }) {
  if (!visible) return null;

const bounds = [
  [-24.90, -48.0],  // Ajuste para baixo e mais à esquerda
  [-22.00, -43.80]  // Ajuste para cima e mais à direita
];

  return (
    <ImageOverlay
      url="/cartas/CCV_REA_TMA_SP_VALE_DO_PARAIBA_20_MAIO.png"
      bounds={bounds}
      opacity={0.6}
    />
  );
}

export default CartaREAOverlay;
