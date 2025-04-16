import { ImageOverlay } from "react-leaflet";

function CartaREAOverlay({ visible }) {
  if (!visible) return null;

  const bounds = [
    [-24.667, -48.002], // canto inferior esquerdo (sul/oeste)
    [-22.1667, -44.0]  // canto superior direito (norte/leste)
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
