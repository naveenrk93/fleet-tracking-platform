import { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Select,
  IconButton,
  useToast,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  Tooltip,
  Switch,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchFleetLocations,
  setDriverFilter,
  setVehicleFilter,
  setStatusFilter,
  clearFilters,
  toggleAutoRefresh,
} from "../../../store/fleetTrackingSlice";
import { fetchDrivers } from "../../../store/driversSlice";
import { fetchVehicles } from "../../../store/vehiclesSlice";
import { fetchHubs } from "../../../store/hubsSlice";
import { fetchTerminals } from "../../../store/terminalsSlice";
import { MapErrorBoundary } from "../../../components/MapErrorBoundary";

const MAPBOX_TOKEN = "pk.eyJ1IjoibmF2ZWVucms5MyIsImEiOiJjbWUzcDd3OW4wODdwMmpzOHhrMjhleHM3In0.QNzeHbwZHUucsrXymelg0A";

mapboxgl.accessToken = MAPBOX_TOKEN;

const ROUTE_COLOR = "#007FFF";

const stylePopupCloseButton = (popup: mapboxgl.Popup) => {
  popup.on('open', () => {
    const closeButton = document.querySelector('.mapboxgl-popup-close-button') as HTMLElement;
    if (closeButton) {
      Object.assign(closeButton.style, {
        fontSize: '20px',
        width: '24px',
        height: '24px',
        padding: '0',
        margin: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#2D3748',
        background: 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)',
        border: '2px solid #E2E8F0',
        borderRadius: '50%',
        position: 'absolute',
        right: '16px',
        top: '16px',
        zIndex: '10',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        fontWeight: '400',
        lineHeight: '1'
      });
      closeButton.onmouseenter = () => {
        Object.assign(closeButton.style, {
          background: 'linear-gradient(135deg, #F56565 0%, #E53E3E 100%)',
          color: 'white',
          borderColor: '#E53E3E',
          transform: 'scale(1.15) rotate(90deg)',
          boxShadow: '0 4px 16px rgba(245, 101, 101, 0.4)'
        });
      };
      closeButton.onmouseleave = () => {
        Object.assign(closeButton.style, {
          background: 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)',
          color: '#2D3748',
          borderColor: '#E2E8F0',
          transform: 'scale(1)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        });
      };
    }
  });
};

export const LiveFleetMapPage = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const hubMarkers = useRef<mapboxgl.Marker[]>([]);
  const terminalMarkers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [enable3D, setEnable3D] = useState(false);
  const [selectedVehicleRoute, setSelectedVehicleRoute] = useState<string | null>(null);
  const activePopup = useRef<mapboxgl.Popup | null>(null);
  const animationFrame = useRef<number | null>(null);
  const toast = useToast();

  const dispatch = useAppDispatch();
  const { filteredLocations, filters, loading, error, lastUpdated, autoRefresh } =
    useAppSelector((state) => state.fleetTracking);
  const { drivers } = useAppSelector((state) => state.drivers);
  const { vehicles } = useAppSelector((state) => state.vehicles);
  const { hubs } = useAppSelector((state) => state.hubs);
  const { terminals } = useAppSelector((state) => state.terminals);

  const activeCount = filteredLocations.filter((loc) => loc.status === "active").length;
  const idleCount = filteredLocations.filter((loc) => loc.status === "idle").length;
  const offlineCount = filteredLocations.filter((loc) => loc.status === "offline").length;

  const apply3DStyling = useCallback(() => {
    if (!map.current) return;

    try {
      if (!map.current.isStyleLoaded()) {
        console.warn("Style not loaded yet, skipping 3D styling");
        return;
      }

      map.current.setConfigProperty("basemap", "lightPreset", "dusk");

      const buildingLayerId = map.current
        .getStyle()
        .layers.find(
          (layer) => layer.id.includes("building") && layer.type === "fill-extrusion"
        )?.id;

      if (buildingLayerId) {
        map.current.setPaintProperty(buildingLayerId, "fill-extrusion-color", "#aaaaaa");
        map.current.setPaintProperty(buildingLayerId, "fill-extrusion-opacity", 0.7);
      }

      const backgroundLayer = map.current.getStyle().layers.find((l) => l.id === "background");
      if (backgroundLayer) {
        map.current.setPaintProperty("background", "background-color", "#1c546e");
      }

      map.current.getStyle().layers.forEach((layer) => {
        if (
          layer.id.includes("park") ||
          layer.id.includes("green") ||
          layer.id.includes("grass")
        ) {
          if (layer.type === "fill" && layer.paint && "fill-color" in layer.paint) {
            map.current!.setPaintProperty(layer.id, "fill-color", "#806f5b");
          }
        }

        if (layer.id.includes("place-label") && layer.type === "symbol" && layer.paint && "text-color" in layer.paint) {
          map.current!.setPaintProperty(layer.id, "text-color", "#ccc4b9");
        }
        if (layer.id.includes("road-label") && layer.type === "symbol" && layer.paint && "text-color" in layer.paint) {
          map.current!.setPaintProperty(layer.id, "text-color", "#ccc4b9");
        }

        if (layer.id.includes("water")) {
          if (layer.type === "fill" && layer.paint && "fill-color" in layer.paint) {
            map.current!.setPaintProperty(layer.id, "fill-color", "#889399");
          }
        }
      });
    } catch (error) {
      console.error("Error applying 3D styling:", error);
    }
  }, []);

  const setupRouteLayers = useCallback(() => {
    if (!map.current) return;

    try {
      if (!map.current.getSource("route-line")) {
        map.current.addSource("route-line", {
          type: "geojson",
          data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } },
        });
      }

      if (!map.current.getLayer("route-line-layer")) {
        map.current.addLayer({
          id: "route-line-layer",
          type: "line",
          source: "route-line",
          paint: { "line-width": 6, "line-color": ROUTE_COLOR },
        });
      }
    } catch (error) {
      console.error("Error setting up route layers:", error);
    }
  }, []);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const defaultCenter: [number, number] = hubs[0]
      ? [hubs[0].coordinates.lng, hubs[0].coordinates.lat]
      : [-74.006, 40.712];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: defaultCenter,
      zoom: 13,
      pitch: 60,
      bearing: -30,
      antialias: true,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
      apply3DStyling();
      setupRouteLayers();
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [apply3DStyling, setupRouteLayers]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    map.current.easeTo({
      pitch: enable3D ? 60 : 0,
      bearing: enable3D ? -30 : 0,
      duration: 1000,
    });

    if (enable3D) {
      apply3DStyling();
    }
  }, [enable3D, mapLoaded, apply3DStyling]);

  useEffect(() => {
    dispatch(fetchFleetLocations());
    dispatch(fetchDrivers());
    dispatch(fetchVehicles());
    dispatch(fetchHubs());
    dispatch(fetchTerminals());
  }, [dispatch]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      dispatch(fetchFleetLocations());
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, dispatch]);

  useEffect(() => {
    if (!map.current || !mapLoaded || hubs.length === 0) return;

    hubMarkers.current.forEach((marker) => marker.remove());
    hubMarkers.current = [];

    hubs.forEach((hub) => {
      if (!hub.coordinates || typeof hub.coordinates.lng !== 'number' || typeof hub.coordinates.lat !== 'number') {
        console.warn(`Hub "${hub.name}" is missing valid coordinates`);
        return;
      }

      const el = document.createElement("div");
      el.style.width = "50px";
      el.style.height = "70px";
      el.style.cursor = "pointer";
      el.innerHTML = `
        <div style="
          width: 50px;
          height: 70px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
        ">
          <div style="
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            border: 3px solid white;
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
            position: relative;
            animation: pulse 2s infinite;
          ">
            🏢
          </div>
          <div style="
            width: 4px;
            height: 30px;
            background: linear-gradient(180deg, #667eea 0%, transparent 100%);
            margin-top: -5px;
          "></div>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        </style>
      `;

      const popup = new mapboxgl.Popup({ 
        offset: 35,
        className: 'custom-popup',
        maxWidth: '320px'
      }).setHTML(`
        <div style="padding: 16px; min-width: 260px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <span style="font-size: 24px;">🏢</span>
            <h3 style="margin: 0; font-size: 17px; font-weight: 600; color: #667eea;">
              ${hub.name}
            </h3>
          </div>
          <div style="font-size: 14px; color: #2D3748; line-height: 1.8;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E2E8F0;">
              <span style="color: #718096;">Type:</span>
              <span style="font-weight: 600; color: #667eea;">Hub</span>
            </div>
            <div style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">
              <div style="color: #718096; font-size: 12px; margin-bottom: 4px;">Address</div>
              <div style="font-weight: 500;">${hub.address}</div>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0;">
              <span style="color: #718096;">Products:</span>
              <span style="font-weight: 700; color: #667eea;">${hub.products?.length || 0} items</span>
            </div>
          </div>
        </div>
      `);

      stylePopupCloseButton(popup);

      const marker = new mapboxgl.Marker(el, { anchor: 'bottom' })
        .setLngLat([hub.coordinates.lng, hub.coordinates.lat])
        .setPopup(popup)
        .addTo(map.current!);

      hubMarkers.current.push(marker);
    });
  }, [hubs, mapLoaded]);

  useEffect(() => {
    if (!map.current || !mapLoaded || terminals.length === 0) return;

    terminalMarkers.current.forEach((marker) => marker.remove());
    terminalMarkers.current = [];

    terminals.forEach((terminal) => {
      if (!terminal.coordinates || typeof terminal.coordinates.lng !== 'number' || typeof terminal.coordinates.lat !== 'number') {
        console.warn(`Terminal "${terminal.name}" is missing valid coordinates`);
        return;
      }

      const el = document.createElement("div");
      el.style.width = "50px";
      el.style.height = "70px";
      el.style.cursor = "pointer";
      el.innerHTML = `
        <div style="
          width: 50px;
          height: 70px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
        ">
          <div style="
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            border: 3px solid white;
            box-shadow: 0 6px 20px rgba(245, 87, 108, 0.5);
            position: relative;
            animation: pulse 2s infinite;
          ">
            ⛽
          </div>
          <div style="
            width: 4px;
            height: 30px;
            background: linear-gradient(180deg, #f5576c 0%, transparent 100%);
            margin-top: -5px;
          "></div>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        </style>
      `;

      const popup = new mapboxgl.Popup({ 
        offset: 35,
        className: 'custom-popup',
        maxWidth: '320px'
      }).setHTML(`
        <div style="padding: 16px; min-width: 260px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <span style="font-size: 24px;">⛽</span>
            <h3 style="margin: 0; font-size: 17px; font-weight: 600; color: #f5576c;">
              ${terminal.name}
            </h3>
          </div>
          <div style="font-size: 14px; color: #2D3748; line-height: 1.8;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E2E8F0;">
              <span style="color: #718096;">Type:</span>
              <span style="font-weight: 600; color: #f5576c;">Terminal</span>
            </div>
            <div style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">
              <div style="color: #718096; font-size: 12px; margin-bottom: 4px;">Address</div>
              <div style="font-weight: 500;">${terminal.address}</div>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0;">
              <span style="color: #718096;">Products:</span>
              <span style="font-weight: 700; color: #f5576c;">${terminal.products?.length || 0} items</span>
            </div>
          </div>
        </div>
      `);

      stylePopupCloseButton(popup);

      const marker = new mapboxgl.Marker(el, { anchor: 'bottom' })
        .setLngLat([terminal.coordinates.lng, terminal.coordinates.lat])
        .setPopup(popup)
        .addTo(map.current!);

      terminalMarkers.current.push(marker);
    });
  }, [terminals, mapLoaded]);

  const animateRoute = useCallback((coords: [number, number][], targetName: string) => {
    if (!map.current) return;

    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }

    let index = 0;
    const ANIMATION_SPEED = 2;

    const frame = () => {
      index += ANIMATION_SPEED;
      if (index > coords.length - 1) index = coords.length - 1;

      const partial = coords.slice(0, Math.floor(index) + 1);
      const lineFeature = {
        type: "Feature" as const,
        properties: {},
        geometry: { type: "LineString" as const, coordinates: partial },
      };

      const source = map.current?.getSource("route-line") as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(lineFeature);
      }

      if (index < coords.length - 1) {
        animationFrame.current = requestAnimationFrame(frame);
      } else {
        toast({
          title: "Route Complete",
          description: `Route to ${targetName} displayed`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
    };

    animationFrame.current = requestAnimationFrame(frame);
  }, [toast]);

  const getRoute = useCallback(async (
    start: [number, number],
    end: [number, number],
    targetName: string
  ) => {
    if (!map.current) return;

    try {
      const source = map.current.getSource("route-line") as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: [] },
        });
      }

      if (activePopup.current) {
        activePopup.current.remove();
        activePopup.current = null;
      }

      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.join(
        ","
      )};${end.join(",")}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

      const response = await fetch(url);
      const data = await response.json();

      const route = data.routes?.[0]?.geometry?.coordinates || [];
      const distance = data.routes?.[0]?.distance || 0;
      const duration = data.routes?.[0]?.duration || 0;

      if (route.length > 0) {
        animateRoute(route, targetName);

        const popup = new mapboxgl.Popup({ 
          closeOnClick: true,
          className: 'custom-popup',
          maxWidth: '300px'
        })
          .setLngLat(end)
          .setHTML(
            `
          <div style="padding: 16px; min-width: 240px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
              <span style="font-size: 24px;">📍</span>
              <h3 style="margin: 0; font-size: 17px; font-weight: 600; color: #007FFF;">
                ${targetName}
              </h3>
            </div>
            <div style="background: linear-gradient(135deg, #EBF4FF 0%, #C3DAFE 100%); border-left: 4px solid #007FFF; padding: 14px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 127, 255, 0.1);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="color: #2D3748; font-weight: 500;">Distance</span>
                <span style="color: #007FFF; font-weight: 700; font-size: 16px;">${(distance / 1000).toFixed(
                  2
                )} km</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #2D3748; font-weight: 500;">Drive Time</span>
                <span style="color: #007FFF; font-weight: 700; font-size: 16px;">~${Math.round(
                  duration / 60
                )} min</span>
              </div>
            </div>
          </div>
        `
          )
          .addTo(map.current);

        stylePopupCloseButton(popup);

        activePopup.current = popup;
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      toast({
        title: "Route Error",
        description: "Could not fetch route",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [animateRoute, toast]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    Object.values(markers.current).forEach((marker) => marker.remove());
    markers.current = {};

    filteredLocations.forEach((location) => {
      if (!location.currentLocation || typeof location.currentLocation.lng !== 'number' || typeof location.currentLocation.lat !== 'number') {
        console.warn(`Vehicle "${location.vehicleRegistration}" is missing valid coordinates`);
        return;
      }

      let bgColor = '#48BB78'; // Green for active
      let icon = '🚗';
      if (location.status === 'idle') {
        bgColor = '#ED8936'; // Orange for idle
        icon = '⏸️';
      } else if (location.status === 'offline') {
        bgColor = '#F56565'; // Red for offline
        icon = '❌';
      }

      const el = document.createElement("div");
      el.style.width = "50px";
      el.style.height = "50px";
      el.style.cursor = "pointer";
      el.innerHTML = `
        <div style="
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 45px;
            height: 45px;
            background: ${bgColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            border: 3px solid white;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
          ">
            ${icon}
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ 
        offset: 25,
        className: 'custom-popup',
        maxWidth: '340px'
      }).setHTML(`
        <div style="padding: 4px; min-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <span style="font-size: 24px;">🚗</span>
            <h3 style="margin: 0; font-size: 17px; font-weight: 600; color: #2D3748;">
              ${location.vehicleRegistration}
            </h3>
          </div>
          <div style="font-size: 14px; color: #2D3748; line-height: 1.8;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E2E8F0;">
              <span style="color: #718096;">Driver:</span>
              <span style="font-weight: 600;">${location.driverName}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E2E8F0;">
              <span style="color: #718096;">Phone:</span>
              <span style="font-weight: 600;">${location.driverPhone}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E2E8F0;">
              <span style="color: #718096;">Type:</span>
              <span style="font-weight: 600;">${location.vehicleType}</span>
            </div>
            <div style="margin-top: 12px; padding: 10px; background: ${
              location.status === "active"
                ? "#C6F6D5"
                : location.status === "idle"
                ? "#FEEBC8"
                : "#FED7D7"
            }; border-radius: 8px; text-align: center; border: 2px solid ${
              location.status === "active"
                ? "#48BB78"
                : location.status === "idle"
                ? "#ED8936"
                : "#F56565"
            };">
              <span style="color: ${
                location.status === "active"
                  ? "#22543D"
                  : location.status === "idle"
                  ? "#7C2D12"
                  : "#742A2A"
              }; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                ${location.status.toUpperCase()}
              </span>
            </div>
            <div style="margin-top: 10px; padding: 8px; background: #F7FAFC; border-radius: 6px; font-size: 12px; color: #718096; text-align: center;">
              <strong>Last Updated:</strong> ${new Date(location.lastUpdated).toLocaleTimeString()}
            </div>
            <button 
              id="show-route-${location.id}"
              style="
                margin-top: 14px;
                background: linear-gradient(135deg, #007FFF 0%, #0066CC 100%);
                border: none;
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 700;
                font-size: 13px;
                width: 100%;
                box-shadow: 0 2px 8px rgba(0, 127, 255, 0.3);
                text-transform: uppercase;
                letter-spacing: 0.5px;
              "
            >
              📍 Show Route to Nearest Hub
            </button>
          </div>
        </div>
      `);

      popup.on("open", () => {
        const btn = document.getElementById(`show-route-${location.id}`);
        if (btn) {
          btn.addEventListener("click", () => {
            if (hubs.length > 0) {
              const nearestHub = hubs[0];
              if (nearestHub.coordinates && typeof nearestHub.coordinates.lng === 'number' && typeof nearestHub.coordinates.lat === 'number') {
                getRoute(
                  [location.currentLocation.lng, location.currentLocation.lat],
                  [nearestHub.coordinates.lng, nearestHub.coordinates.lat],
                  nearestHub.name
                );
                setSelectedVehicleRoute(location.id);
              } else {
                console.warn(`Hub "${nearestHub.name}" is missing valid coordinates`);
              }
            }
          });
        }
      });

      stylePopupCloseButton(popup);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.currentLocation.lng, location.currentLocation.lat])
        .setPopup(popup)
        .addTo(map.current!);

      markers.current[location.id] = marker;
    });

    if (filteredLocations.length > 0 || hubs.length > 0 || terminals.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      let hasValidBounds = false;

      filteredLocations.forEach((location) => {
        if (location.currentLocation && typeof location.currentLocation.lng === 'number' && typeof location.currentLocation.lat === 'number') {
          bounds.extend([location.currentLocation.lng, location.currentLocation.lat]);
          hasValidBounds = true;
        }
      });
      
      hubs.forEach((hub) => {
        if (hub.coordinates && typeof hub.coordinates.lng === 'number' && typeof hub.coordinates.lat === 'number') {
          bounds.extend([hub.coordinates.lng, hub.coordinates.lat]);
          hasValidBounds = true;
        }
      });
      
      terminals.forEach((terminal) => {
        if (terminal.coordinates && typeof terminal.coordinates.lng === 'number' && typeof terminal.coordinates.lat === 'number') {
          bounds.extend([terminal.coordinates.lng, terminal.coordinates.lat]);
          hasValidBounds = true;
        }
      });

      if (hasValidBounds) {
        map.current!.fitBounds(bounds, { padding: 100, maxZoom: 14 });
      }
    }
  }, [filteredLocations, mapLoaded, hubs, terminals, getRoute]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  const handleManualRefresh = () => {
    dispatch(fetchFleetLocations());
    toast({
      title: "Refreshing",
      description: "Fleet locations updated",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const clearRoute = () => {
    if (map.current) {
      const source = map.current.getSource("route-line") as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: [] },
        });
      }
    }
    if (activePopup.current) {
      activePopup.current.remove();
      activePopup.current = null;
    }
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    setSelectedVehicleRoute(null);
  };

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Page Header */}
        <HStack justify="space-between" flexWrap="wrap" gap={4}>
          <Heading size="lg" color="text.primary">
            🗺️ Live Fleet Tracking {enable3D && "(3D Mode)"}
          </Heading>
          <HStack spacing={4} flexWrap="wrap">
            <HStack>
              <Box w="12px" h="12px" bg="green.400" borderRadius="full" />
              <Text fontSize="sm" color="text.secondary">
                Active: {activeCount}
              </Text>
            </HStack>
            <HStack>
              <Box w="12px" h="12px" bg="orange.400" borderRadius="full" />
              <Text fontSize="sm" color="text.secondary">
                Idle: {idleCount}
              </Text>
            </HStack>
            <HStack>
              <Box w="12px" h="12px" bg="red.400" borderRadius="full" />
              <Text fontSize="sm" color="text.secondary">
                Offline: {offlineCount}
              </Text>
            </HStack>
          </HStack>
        </HStack>

        {/* Stats Cards */}
        <Flex gap={4} flexWrap="wrap">
          <Box
            bg="bg.card"
            borderRadius="lg"
            border="1px solid"
            borderColor="border.default"
            p={4}
            flex="1"
            minW="200px"
          >
            <Stat>
              <StatLabel color="text.secondary">Total Vehicles</StatLabel>
              <StatNumber color="text.primary">{filteredLocations.length}</StatNumber>
              <Text fontSize="sm" color="text.secondary" mt={2}>
                {loading
                  ? "Updating..."
                  : `Updated ${lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "Never"}`}
              </Text>
            </Stat>
          </Box>
          <Box
            bg="bg.card"
            borderRadius="lg"
            border="1px solid"
            borderColor="border.default"
            p={4}
            flex="1"
            minW="200px"
          >
            <Stat>
              <StatLabel color="text.secondary">Infrastructure</StatLabel>
              <StatNumber color="text.primary">
                {hubs.length + terminals.length}
              </StatNumber>
              <Text fontSize="sm" color="text.secondary" mt={2}>
                {hubs.length} Hubs, {terminals.length} Terminals
              </Text>
            </Stat>
          </Box>
          <Box
            bg="bg.card"
            borderRadius="lg"
            border="1px solid"
            borderColor="border.default"
            p={4}
            flex="1"
            minW="200px"
          >
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="3d-mode" mb="0" color="text.secondary">
                3D Mode
              </FormLabel>
              <Switch
                id="3d-mode"
                colorScheme="blue"
                isChecked={enable3D}
                onChange={(e) => setEnable3D(e.target.checked)}
              />
            </FormControl>
            <Text fontSize="sm" color="text.secondary" mt={2}>
              {autoRefresh ? "Auto-refresh: ON (30s)" : "Auto-refresh: OFF"}
            </Text>
          </Box>
        </Flex>

        {/* Filters & Controls */}
        <Box
          bg="bg.card"
          borderRadius="lg"
          border="1px solid"
          borderColor="border.default"
          p={4}
        >
          <Flex spacing={4} flexWrap="wrap" w="100%" gap={4} alignItems="center">
            <HStack spacing={4} flexWrap="wrap" flex="1">
              <Text fontWeight="600" color="text.primary" minW="80px">
                Filters:
              </Text>
              <Select
                placeholder="All Drivers"
                value={filters.driverId || ""}
                onChange={(e) => dispatch(setDriverFilter(e.target.value || null))}
                maxW="200px"
                size="sm"
              >
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </Select>
              <Select
                placeholder="All Vehicles"
                value={filters.vehicleId || ""}
                onChange={(e) => dispatch(setVehicleFilter(e.target.value || null))}
                maxW="200px"
                size="sm"
              >
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.registration}
                  </option>
                ))}
              </Select>
              <Select
                placeholder="All Status"
                value={filters.status || ""}
                onChange={(e) => dispatch(setStatusFilter(e.target.value || null))}
                maxW="200px"
                size="sm"
              >
                <option value="active">Active</option>
                <option value="idle">Idle</option>
                <option value="offline">Offline</option>
              </Select>
              <Button size="sm" variant="ghost" onClick={handleClearFilters}>
                Clear Filters
              </Button>
              {selectedVehicleRoute && (
                <Button size="sm" colorScheme="red" onClick={clearRoute}>
                  Clear Route
                </Button>
              )}
            </HStack>
            <HStack spacing={2}>
              <Tooltip label="Refresh Now">
                <IconButton
                  aria-label="Refresh"
                  icon={<RepeatIcon />}
                  size="sm"
                  onClick={handleManualRefresh}
                  isLoading={loading}
                  colorScheme="blue"
                />
              </Tooltip>
              <Button
                size="sm"
                colorScheme={autoRefresh ? "green" : "gray"}
                onClick={() => dispatch(toggleAutoRefresh())}
              >
                Auto-Refresh: {autoRefresh ? "ON" : "OFF"}
              </Button>
            </HStack>
          </Flex>
        </Box>

        {/* Map Container */}
        <MapErrorBoundary>
          <Box
            bg="bg.card"
            borderRadius="lg"
            border="1px solid"
            borderColor="border.default"
            overflow="hidden"
            position="relative"
          >
            <div
              ref={mapContainer}
              style={{
                height: "700px",
                width: "100%",
              }}
            />
            {!mapLoaded && (
              <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                bottom="0"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="bg.card"
              >
                <VStack spacing={4}>
                  <Text fontSize="xl" color="text.primary">
                    🗺️ Loading 3D Map...
                  </Text>
                  <Text fontSize="sm" color="text.secondary">
                    Initializing Mapbox GL with 3D features
                  </Text>
                </VStack>
              </Box>
            )}
          </Box>
        </MapErrorBoundary>

        {/* Legend */}
        <Box
          bg="bg.card"
          borderRadius="lg"
          border="1px solid"
          borderColor="border.default"
          p={4}
        >
          <HStack spacing={6} flexWrap="wrap">
            <Text fontWeight="600" color="text.primary">
              Map Legend:
            </Text>
            <HStack>
              <Box w="12px" h="12px" bg="#48BB78" borderRadius="full" />
              <Text fontSize="sm" color="text.secondary">
                Vehicle (Active)
              </Text>
            </HStack>
            <HStack>
              <Box w="12px" h="12px" bg="#ED8936" borderRadius="full" />
              <Text fontSize="sm" color="text.secondary">
                Vehicle (Idle)
              </Text>
            </HStack>
            <HStack>
              <Box w="12px" h="12px" bg="#F56565" borderRadius="full" />
              <Text fontSize="sm" color="text.secondary">
                Vehicle (Offline)
              </Text>
            </HStack>
            <HStack>
              <Box w="12px" h="12px" bg="#667eea" borderRadius="full" />
              <Text fontSize="sm" color="text.secondary">
                Hub (Tower)
              </Text>
            </HStack>
            <HStack>
              <Box w="12px" h="12px" bg="#f5576c" borderRadius="full" />
              <Text fontSize="sm" color="text.secondary">
                Terminal (Tower)
              </Text>
            </HStack>
            <HStack>
              <Box w="20px" h="3px" bg={ROUTE_COLOR} />
              <Text fontSize="sm" color="text.secondary">
                Route
              </Text>
            </HStack>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
};
