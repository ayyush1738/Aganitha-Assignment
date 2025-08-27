export interface EarthquakeFeature {
  type: "Feature";
  properties: {
    magnitude: number;
    place: string;
    time: number;
    title: string;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number, number];
  };
  id: string;
}

export interface EarthquakeData {
  type: "FeatureCollection";
  features: EarthquakeFeature[];
}
