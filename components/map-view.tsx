"use client";

import React, { useState } from 'react';
import Map, { Marker, MapProps, ViewStateChangeEvent, ViewState } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewProps {
  latitude: number;
  longitude: number;
  zoom?: number;
}

// Define a simpler state interface excluding width/height
interface MapViewportState {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

const MapView: React.FC<MapViewProps> = ({ latitude, longitude, zoom = 8 }) => {
  // Use the simpler interface for useState
  const [viewState, setViewState] = useState<MapViewportState>({
    latitude: latitude,
    longitude: longitude,
    zoom: zoom,
    bearing: 0,
    pitch: 0,
    // No padding needed here if not directly managed
    // No width/height needed here
  });

  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!mapboxAccessToken) {
    console.error('Mapbox access token is not configured.');
    return <div className="p-4 text-red-500 bg-red-100 border border-red-400 rounded">Mapbox token missing. Please configure NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in .env.local</div>;
  }

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border">
      <Map
        {...viewState} // Spread the simpler state
        mapboxAccessToken={mapboxAccessToken}
        // Directly use evt.viewState which matches ViewState type
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)} 
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        <Marker longitude={longitude} latitude={latitude} anchor="bottom" >
          <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
        </Marker>
      </Map>
    </div>
  );
};

export default MapView; 