import L from "leaflet";
import "proj4leaflet";

export const crsLambert = new L.Proj.CRS(
  "EPSG:LAMBERT_REA",
  "+proj=lcc +lat_1=-33 +lat_2=-45 +lat_0=-40 +lon_0=-60 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs",
  {
    origin: [-5120000, 5120000],
    resolutions: [8192, 4096, 2048, 1024, 512, 256, 128],
    bounds: L.bounds([-5120000, -5120000], [5120000, 5120000])
  }
);
