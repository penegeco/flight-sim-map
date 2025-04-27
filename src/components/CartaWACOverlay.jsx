import { ImageOverlay } from "react-leaflet";

function CartaWACOverlay({ visible }) {
  if (!visible) return null;

  const bounds = [
    [-24.0, -50.0],
    [-19.8167, -43.834]
  ];

  return (
    <ImageOverlay
      url="/cartas/CartaWAC_SP.jpg"
      bounds={bounds}
      opacity={1.0}
    />
  );
}

export default CartaWACOverlay;
