import { useState, useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax

import { getViewport } from "./utils/viewportUtils";

export function useMap(init_viewport, access_token, theme) {
  mapboxgl.accessToken = access_token;
  const [viewport, setViewport] = useState(init_viewport);
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const flyToViewport = useCallback((viewport) => {
    const viewport_formatted = {
      center: [viewport.longitude, viewport.latitude],
      zoom: viewport.zoom,
      bearing: viewport.bearing,
      pitch: viewport.pitch,
      transitionDuration: viewport.transitionDuration,
    };
    map?.flyTo(viewport_formatted);
  }, []);

  const flyToBounds = useCallback((bounds) => {
    map?.fitBounds(bounds);
  }, []);

  useEffect(() => {
    const _map = new mapboxgl.Map({
      container: mapContainer.current,
      style: theme,
      center: [viewport.longitude, viewport.latitude],
      bearing: viewport.bearing,
      pitch: viewport.pitch,
      zoom: viewport.zoom,
      boxZoom: false,
    });

    // set map.current event listeners
    _map.on("load", () => {
      setMapLoaded(true);
      _map.setRenderWorldCopies(true);
      _map.on("move", () => {
        setViewport(getViewport(_map));
      });
    });

    // set custom map.current methods
    _map.flyToViewport = flyToViewport;
    _map.flyToBounds = flyToBounds;

    setMap(_map)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- don't need to reinitialize for viewport updates
  }, []);

  // update custom map.current methods
  useEffect(() => {
    if (map) {
      map.flyToViewport = flyToViewport;
      map.flyToBounds = flyToBounds;
    }
  }, [flyToBounds, flyToViewport]);

  return {
    map,
    mapContainer,
    mapLoaded,
    viewport,
    setViewport,
    flyToViewport,
    flyToBounds,
  };
}
