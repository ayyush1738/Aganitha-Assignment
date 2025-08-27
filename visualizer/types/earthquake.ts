//Earthquake Features Type (Contains the properties to locate the affected area)

export interface EarthquakeFeature {
  type: "Feature";
  properties: {
    mag: number;
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
