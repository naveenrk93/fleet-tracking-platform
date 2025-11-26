import {useEffect, useRef, useState, useCallback} from "react";
import {
    Box,
    Heading,
    VStack,
    HStack,
    Text,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Spinner,
    useToast,
    Badge,
    Card,
    CardBody,
    Switch,
    FormControl,
    FormLabel,
    Grid,
} from "@chakra-ui/react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {useSelector} from "react-redux";
import {RootState} from "../../../store.ts";
import {
    getShifts,
    getDeliveries,
    getTerminals,
    getOrders,
    getVehicles,
    getHubs,
    updateVehicleLocation,
    addGPSTracking,
    type Shift,
    type Delivery,
    type Terminal,
    type Order,
    type Vehicle,
} from "../../../services/api.ts";
import {MapErrorBoundary} from "../../../components/MapErrorBoundary.tsx";

const MAPBOX_TOKEN = "pk.eyJ1IjoibmF2ZWVucms5MyIsImEiOiJjbWUzcDd3OW4wODdwMmpzOHhrMjhleHM3In0.QNzeHbwZHUucsrXymelg0A";
const ROUTE_COLOR = "#007FFF";

mapboxgl.accessToken = MAPBOX_TOKEN;

interface DeliveryWithDetails extends Delivery {
    order?: Order;
    terminal?: Terminal;
}

// Helper function to style popup close button
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

export const DriverLiveMapPage = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const driverMarker = useRef<mapboxgl.Marker | null>(null);
    const terminalMarkers = useRef<mapboxgl.Marker[]>([]);
    const [mapLoaded, setMapLoaded] = useState(false);
    const toast = useToast();

    const userId = useSelector((state: RootState) => state.user.userId);
    const userRole = useSelector((state: RootState) => state.user.role);

    const [loading, setLoading] = useState(true);
    const [todayShift, setTodayShift] = useState<Shift | null>(null);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [deliveries, setDeliveries] = useState<DeliveryWithDetails[]>([]);
    const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null);
    const [selectedDestination, setSelectedDestination] = useState<Terminal | null>(null);
    const [selectedDelivery, setSelectedDelivery] = useState<DeliveryWithDetails | null>(null);
    const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
    const [autoRouteLoaded, setAutoRouteLoaded] = useState(false);
    const [gpsTrackingEnabled, setGpsTrackingEnabled] = useState(false);
    const gpsIntervalRef = useRef<number | null>(null);
    const [mapKey, setMapKey] = useState(0); // Key to force map remount

    // Get today's date
    const today = (() => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    })();

    // Fetch shift data and reset map when driver changes
    useEffect(() => {
        // Stop GPS tracking if active
        if (gpsIntervalRef.current) {
            clearInterval(gpsIntervalRef.current);
            gpsIntervalRef.current = null;
        }
        setGpsTrackingEnabled(false);

        // Reset map state when driver changes
        if (map.current) {
            map.current.remove();
            map.current = null;
        }
        if (driverMarker.current) {
            driverMarker.current.remove();
            driverMarker.current = null;
        }
        terminalMarkers.current.forEach((marker) => marker.remove());
        terminalMarkers.current = [];

        setMapLoaded(false);
        setDriverLocation(null);
        setSelectedDestination(null);
        setSelectedDelivery(null);
        setRouteCoordinates([]);
        setAutoRouteLoaded(false);
        setMapKey(prev => prev + 1); // Force map remount

        fetchShiftData();
    }, [userId]);

    const fetchShiftData = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Fetch all data
            const [allShifts, allDeliveries, allTerminals, allOrders, allVehicles, allHubs] =
                await Promise.all([
                    getShifts(),
                    getDeliveries(),
                    getTerminals(),
                    getOrders(),
                    getVehicles(),
                    getHubs(),
                ]);

            // Find today's shift for current driver
            const shift = allShifts.find(
                (s) => s.driverId === userId && s.date === today
            );

            setTodayShift(shift || null);

            if (shift) {
                // Fetch vehicle details
                const vehicleData = allVehicles.find((v) => v.id === shift.vehicleId);
                setVehicle(vehicleData || null);

                // Fetch deliveries for this shift
                const shiftDeliveries = allDeliveries.filter((d) => d.shiftId === shift.id);

                // Enrich deliveries with order and terminal details
                const enrichedDeliveries: DeliveryWithDetails[] = shiftDeliveries.map((delivery) => {
                    const order = allOrders.find((o) => o.id === delivery.orderId);
                    const terminal = order
                        ? allTerminals.find((t) => t.id === order.destinationId)
                        : undefined;

                    return {
                        ...delivery,
                        order,
                        terminal,
                    };
                });

                setDeliveries(enrichedDeliveries);

                // Set initial driver location to first hub
                if (allHubs.length > 0 && !driverLocation) {
                    const firstHub = allHubs[0];
                    if (firstHub.coordinates && typeof firstHub.coordinates.lng === 'number' && typeof firstHub.coordinates.lat === 'number') {
                        setDriverLocation([firstHub.coordinates.lng, firstHub.coordinates.lat]);
                    } else {
                        console.warn("First hub is missing valid coordinates");
                    }
                }

                // Auto-select first pending or in-progress delivery as current destination
                const currentDelivery = enrichedDeliveries.find(
                    (d) => d.status === "in-progress" || d.status === "pending"
                );
                if (currentDelivery && currentDelivery.terminal) {
                    setSelectedDelivery(currentDelivery);
                    setSelectedDestination(currentDelivery.terminal);
                }
            }
        } catch (error) {
            console.error("Error fetching shift data:", error);
            toast({
                title: "Error loading shift data",
                description: "Failed to fetch shift information.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    // Initialize map with 3D features
    useEffect(() => {
        if (!mapContainer.current || !driverLocation) return;

        // Don't initialize if map already exists for this key
        if (map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: driverLocation,
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
    }, [driverLocation, mapKey]);

    // Apply 3D styling
    const apply3DStyling = () => {
        if (!map.current || !map.current.isStyleLoaded()) return;

        try {
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
    };

    // Setup route layers
    const setupRouteLayers = () => {
        if (!map.current) return;

        try {
            if (!map.current.getSource("route-line")) {
                map.current.addSource("route-line", {
                    type: "geojson",
                    data: {type: "Feature", properties: {}, geometry: {type: "LineString", coordinates: []}},
                });
            }

            if (!map.current.getLayer("route-line-layer")) {
                map.current.addLayer({
                    id: "route-line-layer",
                    type: "line",
                    source: "route-line",
                    paint: {"line-width": 6, "line-color": ROUTE_COLOR},
                });
            }
        } catch (error) {
            console.error("Error setting up route layers:", error);
        }
    };

    // Re-center map when driver location changes (after initial load)
    useEffect(() => {
        if (!map.current || !mapLoaded || !driverLocation) return;

        // Fly to new driver location
        map.current.flyTo({
            center: driverLocation,
            zoom: 13,
            duration: 1500,
        });
    }, [driverLocation, mapLoaded]);

    // Add driver marker
    useEffect(() => {
        if (!map.current || !mapLoaded || !driverLocation) return;

        // Remove old marker
        if (driverMarker.current) {
            driverMarker.current.remove();
        }

        // Create driver car marker with 3D styling
        const el = document.createElement("div");
        el.style.width = "60px";
        el.style.height = "80px";
        el.style.cursor = "pointer";
        el.innerHTML = `
      <div style="
        width: 60px;
        height: 80px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
      ">
        <div style="
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #48BB78 0%, #38A169 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          border: 4px solid white;
          box-shadow: 0 8px 24px rgba(72, 187, 120, 0.6);
          position: relative;
          animation: driverPulse 2s infinite;
        ">
          🚗
        </div>
        <div style="
          width: 5px;
          height: 30px;
          background: linear-gradient(180deg, #48BB78 0%, transparent 100%);
          margin-top: -5px;
        "></div>
      </div>
      <style>
        @keyframes driverPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 24px rgba(72, 187, 120, 0.6); }
          50% { transform: scale(1.08); box-shadow: 0 8px 32px rgba(72, 187, 120, 0.8); }
        }
      </style>
    `;

        const popup = new mapboxgl.Popup({
            offset: 40,
            className: 'custom-popup',
            maxWidth: '320px'
        }).setHTML(`
      <div style="padding: 16px; min-width: 260px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: 24px;">🚗</span>
          <h3 style="margin: 0; font-size: 17px; font-weight: 600; color: #48BB78;">
            Your Location
          </h3>
        </div>
        <div style="font-size: 14px; color: #2D3748; line-height: 1.8;">
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E2E8F0;">
            <span style="color: #718096;">Vehicle:</span>
            <span style="font-weight: 600;">${vehicle?.registration || "N/A"}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E2E8F0;">
            <span style="color: #718096;">Type:</span>
            <span style="font-weight: 600;">${vehicle?.type || "N/A"}</span>
          </div>
          <div style="margin-top: 12px; padding: 10px; background: linear-gradient(135deg, #E6FFFA 0%, #C6F6D5 100%); border-radius: 8px; text-align: center;">
            <span style="color: #38A169; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">● Active</span>
          </div>
        </div>
      </div>
    `);

        // Style the close button
        stylePopupCloseButton(popup);

        driverMarker.current = new mapboxgl.Marker(el, {anchor: "bottom"})
            .setLngLat(driverLocation)
            .setPopup(popup)
            .addTo(map.current);
    }, [driverLocation, mapLoaded, vehicle]);

    // Add terminal markers
    useEffect(() => {
        if (!map.current || !mapLoaded || deliveries.length === 0) return;

        // Clear existing markers
        terminalMarkers.current.forEach((marker) => marker.remove());
        terminalMarkers.current = [];

        deliveries.forEach((delivery) => {
            if (!delivery.terminal) return;

            const terminal = delivery.terminal;

            // Skip terminals without valid coordinates
            if (!terminal.coordinates || typeof terminal.coordinates.lng !== 'number' || typeof terminal.coordinates.lat !== 'number') {
                console.warn(`Terminal "${terminal.name}" is missing valid coordinates`);
                return;
            }

            const isCurrentDestination = selectedDestination?.id === terminal.id;

            // Create terminal marker with 3D styling
            const el = document.createElement("div");
            el.style.width = "50px";
            el.style.height = "70px";
            el.style.cursor = "pointer";

            // Use different colors for current destination vs other terminals
            const markerColor = isCurrentDestination
                ? "linear-gradient(135deg, #48BB78 0%, #38A169 100%)" // Green for current destination
                : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"; // Pink for other terminals
            const shadowColor = isCurrentDestination
                ? "rgba(72, 187, 120, 0.6)"
                : "rgba(245, 87, 108, 0.5)";
            const pinColor = isCurrentDestination ? "#38A169" : "#f5576c";

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
            background: ${markerColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            border: 3px solid white;
            box-shadow: 0 6px 20px ${shadowColor};
            position: relative;
            animation: terminalPulse 2s infinite;
          ">
            ⛽
          </div>
          <div style="
            width: 4px;
            height: 30px;
            background: linear-gradient(180deg, ${pinColor} 0%, transparent 100%);
            margin-top: -5px;
          "></div>
        </div>
        <style>
          @keyframes terminalPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        </style>
      `;

            const statusColor = delivery.status === "completed" ? "#48BB78" :
                delivery.status === "in-progress" ? "#3182CE" : "#ED8936";
            const statusBg = delivery.status === "completed" ? "#C6F6D5" :
                delivery.status === "in-progress" ? "#BEE3F8" : "#FEEBC8";

            const headerColor = isCurrentDestination ? "#38A169" : "#f5576c";
            const badgeHtml = isCurrentDestination
                ? '<div style="background: #38A169; color: white; padding: 6px 12px; margin-left: 48px; border-radius: 6px; font-size: 11px; font-weight: 700; display: inline-block; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">📍 Current Destination</div>'
                : '';

            const actionHtml = !isCurrentDestination
                ? '<button id="show-route-to-' + terminal.id + '" style="margin-top: 14px; background: linear-gradient(135deg, #007FFF 0%, #0066CC 100%); border: none; color: white; padding: 12px 16px; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 13px; width: 100%; box-shadow: 0 2px 8px rgba(0, 127, 255, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">🗺️ Switch to This Destination</button>'
                : '<div style="margin-top: 14px; padding: 12px; text-align: center; background: linear-gradient(135deg, #E6FFFA 0%, #C6F6D5 100%); border-radius: 8px; color: #38A169; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">✓ Active Route</div>';

            const popup = new mapboxgl.Popup({
                offset: 35,
                className: 'custom-popup',
                maxWidth: '340px'
            }).setHTML(`
        <div style="padding: 4px; min-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          ${badgeHtml}
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <span style="font-size: 24px;">⛽</span>
            <h3 style="margin: 0; font-size: 17px; font-weight: 600; color: ${headerColor};">
              ${terminal.name}
            </h3>
          </div>
          <div style="font-size: 14px; color: #2D3748; line-height: 1.8;">
            <div style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">
              <div style="color: #718096; font-size: 12px; margin-bottom: 4px;">Address</div>
              <div style="font-weight: 500;">${terminal.address}</div>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E2E8F0;">
              <span style="color: #718096;">Product Quantity:</span>
              <span style="font-weight: 700; color: #667eea;">${delivery.order?.quantity.toLocaleString() || 0} units</span>
            </div>
            <div style="margin-top: 12px; padding: 6px; background: ${statusBg}; border-radius: 8px; text-align: center; border: 2px solid ${statusColor};">
              <span style="color: ${statusColor}; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                ${delivery.status.toUpperCase()}
              </span>
            </div>
          </div>
          ${actionHtml}
        </div>
      `);

            popup.on("open", () => {
                const btn = document.getElementById(`show-route-to-${terminal.id}`);
                if (btn) {
                    btn.addEventListener("click", () => {
                        showRouteToTerminal(terminal, delivery);
                        setAutoRouteLoaded(true); // Mark as manually loaded
                    });
                }
            });

            // Style the close button
            stylePopupCloseButton(popup);

            const marker = new mapboxgl.Marker(el, {anchor: "bottom"})
                .setLngLat([terminal.coordinates.lng, terminal.coordinates.lat])
                .setPopup(popup)
                .addTo(map.current!);

            terminalMarkers.current.push(marker);
        });

        // Open popup for current destination automatically
        if (selectedDestination && !autoRouteLoaded) {
            const currentMarker = terminalMarkers.current.find(
                (_, idx) => deliveries[idx]?.terminal?.id === selectedDestination.id
            );
            if (currentMarker) {
                setTimeout(() => {
                    currentMarker.togglePopup();
                }, 1500);
            }
        }

        // Fit bounds to show all markers
        if (driverLocation && deliveries.length > 0) {
            const bounds = new mapboxgl.LngLatBounds();
            bounds.extend(driverLocation);
            deliveries.forEach((delivery) => {
                if (delivery.terminal && delivery.terminal.coordinates &&
                    typeof delivery.terminal.coordinates.lng === 'number' &&
                    typeof delivery.terminal.coordinates.lat === 'number') {
                    bounds.extend([
                        delivery.terminal.coordinates.lng,
                        delivery.terminal.coordinates.lat,
                    ]);
                }
            });

            map.current!.fitBounds(bounds, {padding: 100, maxZoom: 14});
        }
    }, [deliveries, mapLoaded, driverLocation]);

    // Auto-load route when destination is selected and map is ready
    useEffect(() => {
        if (
            mapLoaded &&
            selectedDestination &&
            driverLocation &&
            !autoRouteLoaded &&
            routeCoordinates.length === 0
        ) {
            // Small delay to ensure map is fully initialized
            const timer = setTimeout(() => {
                showRouteToTerminal(selectedDestination);
                setAutoRouteLoaded(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [mapLoaded, selectedDestination, driverLocation, autoRouteLoaded]);

    // Show route to terminal
    const showRouteToTerminal = async (terminal: Terminal, delivery?: DeliveryWithDetails) => {
        if (!map.current || !driverLocation) return;

        // Check if terminal has valid coordinates
        if (!terminal.coordinates || typeof terminal.coordinates.lng !== 'number' || typeof terminal.coordinates.lat !== 'number') {
            console.warn(`Terminal "${terminal.name}" is missing valid coordinates`);
            toast({
                title: "Invalid Destination",
                description: "This terminal is missing valid location coordinates",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            setSelectedDestination(terminal);
            if (delivery) {
                setSelectedDelivery(delivery);
            }

            const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${driverLocation.join(
                ","
            )};${terminal.coordinates.lng},${terminal.coordinates.lat}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

            const response = await fetch(url);
            const data = await response.json();

            const route = data.routes?.[0]?.geometry?.coordinates || [];
            const distance = data.routes?.[0]?.distance || 0;
            const duration = data.routes?.[0]?.duration || 0;

            if (route.length > 0) {
                setRouteCoordinates(route);

                // Draw the full route
                const source = map.current.getSource("route-line") as mapboxgl.GeoJSONSource;
                if (source) {
                    source.setData({
                        type: "Feature",
                        properties: {},
                        geometry: {type: "LineString", coordinates: route},
                    });
                }

                toast({
                    title: "Route Loaded",
                    description: `${(distance / 1000).toFixed(2)} km • ~${Math.round(duration / 60)} min`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
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
    };

    // Send GPS Update - saves current location to backend
    const sendGPSUpdate = useCallback(async () => {
        if (!vehicle || !userId || !driverLocation) {
            toast({
                title: "Error",
                description: "Vehicle or driver information not available",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            // Get current driver location
            const [lng, lat] = driverLocation;

            // **PERSIST TO DATABASE** - Save current location to backend
            await Promise.all([
                updateVehicleLocation(vehicle.id, {lat, lng}),
                addGPSTracking({
                    vehicleId: vehicle.id,
                    driverId: userId,
                    coordinates: {lat, lng},
                }),
            ]);

            toast({
                title: "GPS Location Saved",
                description: "Current location updated in tracking system",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error updating GPS location:", error);
            toast({
                title: "GPS Update Failed",
                description: "Failed to save location to tracking system",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }

    }, [vehicle, userId, driverLocation]);

    // Toggle GPS tracking on/off
    const handleToggleGPSTracking = (enabled: boolean) => {
        setGpsTrackingEnabled(enabled);

        if (enabled) {
            // Start GPS tracking
            if (!driverLocation) {
                toast({
                    title: "Location Not Available",
                    description: "Driver location not initialized yet",
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                });
                setGpsTrackingEnabled(false);
                return;
            }

            toast({
                title: "GPS Tracking Started",
                description: "Current location will be saved to tracking system every 30 seconds",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            // Send first update immediately
            sendGPSUpdate();

            // Set up interval for automatic updates every 30 seconds
            gpsIntervalRef.current = setInterval(() => {
                sendGPSUpdate();
            }, 30000);
        } else {
            // Stop GPS tracking
            if (gpsIntervalRef.current) {
                clearInterval(gpsIntervalRef.current);
                gpsIntervalRef.current = null;
            }

            toast({
                title: "GPS Tracking Stopped",
                description: "Automatic location updates have been disabled",
                status: "info",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // Cleanup interval on unmount or when route changes
    useEffect(() => {
        return () => {
            if (gpsIntervalRef.current) {
                clearInterval(gpsIntervalRef.current);
            }
        };
    }, []);

    // Note: GPS tracking continues regardless of route status
    // It just saves the current location every 30 seconds

    // If not in driver role, don't show anything (prevents flash of alerts when switching modes)
    if (userRole !== "driver") {
        return null;
    }

    // Loading state
    if (loading) {
        return (
            <Box p={6} display="flex" justifyContent="center" alignItems="center" minH="400px">
                <VStack spacing={4}>
                    <Spinner size="xl" color="blue.500" thickness="4px"/>
                    <Text color="text.secondary">Loading map data...</Text>
                </VStack>
            </Box>
        );
    }

    // No user ID
    if (!userId) {
        return (
            <Box p={6}>
                <Alert status="warning" borderRadius="md">
                    <AlertIcon/>
                    <Box>
                        <AlertTitle>No Driver ID</AlertTitle>
                        <AlertDescription>Please log in to view the live map.</AlertDescription>
                    </Box>
                </Alert>
            </Box>
        );
    }

    // No shift allocated
    if (!todayShift) {
        return (
            <Box p={6}>
                <Heading size="lg" mb={4}>
                    Live Map
                </Heading>
                <Alert
                    status="info"
                    variant="subtle"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    textAlign="center"
                    minH="200px"
                    borderRadius="md"
                >
                    <AlertIcon boxSize="40px" mr={0}/>
                    <AlertTitle mt={4} mb={1} fontSize="lg">
                        No Shift Allocated
                    </AlertTitle>
                    <AlertDescription maxWidth="sm">
                        You don't have a shift allocated for today ({today}). The live map is only
                        available when you have an active shift.
                    </AlertDescription>
                </Alert>
            </Box>
        );
    }

    // Shift not started
    if (todayShift.status !== "active") {
        return (
            <Box p={6}>
                <Heading size="lg" mb={4}>
                    Live Map
                </Heading>
                <Alert
                    status="warning"
                    variant="subtle"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    textAlign="center"
                    minH="200px"
                    borderRadius="md"
                >
                    <AlertIcon boxSize="40px" mr={0}/>
                    <AlertTitle mt={4} mb={1} fontSize="lg">
                        Shift Not Started
                    </AlertTitle>
                    <AlertDescription maxWidth="sm">
                        Please start your shift first to access the live map. Go to the Shift View
                        page and click "Start Shift".
                    </AlertDescription>
                </Alert>
            </Box>
        );
    }

    return (
        <Box>
            <VStack align="stretch" spacing={6}>
                {/* Page Header */}
                <HStack justify="space-between" flexWrap="wrap" gap={4}>
                    <Box>
                        <Heading size="lg" color="text.primary">
                            🗺️ Live Map (3D Mode)
                        </Heading>
                        <Text color="text.secondary" mt={1}>
                            Track your deliveries and navigate to destinations
                        </Text>
                    </Box>
                    <Badge colorScheme="green" fontSize="lg" px={4} py={2}>
                        Shift Active
                    </Badge>
                </HStack>

                {/* Info Card */}
                <Card>
                    <CardBody>
                        <Grid gridTemplateColumns={"1fr 1fr 1fr 1fr"} alignItems={"center"}>
                            <VStack align="start" spacing={1}>
                                <Text fontSize="sm" color="text.secondary">
                                    Vehicle
                                </Text>
                                <Text fontSize="lg" fontWeight="bold">
                                    {vehicle?.registration || "N/A"}
                                </Text>
                            </VStack>
                            <VStack align="start" spacing={1}>
                                <Text fontSize="sm" color="text.secondary">
                                    Deliveries
                                </Text>
                                <Text fontSize="lg" fontWeight="bold" color="blue.500">
                                    {deliveries.length} total
                                </Text>
                            </VStack>
                            <VStack align="start" spacing={1}>
                                <Text fontSize="sm" color="text.secondary">
                                    Current Destination
                                </Text>
                                <Text fontSize="lg" fontWeight="bold" color="purple.500">
                                    {selectedDestination?.name || "No active delivery"}
                                </Text>
                                {selectedDelivery && (
                                    <Badge colorScheme={selectedDelivery.status === "in-progress" ? "blue" : "yellow"}
                                           fontSize="xs">
                                        {selectedDelivery.status.toUpperCase()}
                                    </Badge>
                                )}
                            </VStack>
                            <VStack align="stretch" spacing={2} marginLeft={"auto"}>
                                <FormControl display="flex" alignItems="center" justifyContent="center">
                                    <FormLabel htmlFor="gps-tracking" mb="0" mr={3} fontWeight="bold">
                                        {gpsTrackingEnabled ? "📡 GPS Tracking ON" : "📍 GPS Tracking OFF"}
                                    </FormLabel>
                                    <Switch
                                        id="gps-tracking"
                                        size="lg"
                                        colorScheme="green"
                                        isChecked={gpsTrackingEnabled}
                                        onChange={(e) => handleToggleGPSTracking(e.target.checked)}
                                    />
                                </FormControl>
                                {gpsTrackingEnabled && (
                                    <Badge colorScheme="green" fontSize="sm" textAlign="center" py={1}>
                                        Saving location every 30 seconds
                                    </Badge>
                                )}
                            </VStack>
                        </Grid>
                    </CardBody>
                </Card>

                {/* Instructions */}
                <Alert status="info" borderRadius="md">
                    <AlertIcon/>
                    <Box flex="1">
                        <AlertTitle>Your current delivery route:</AlertTitle>
                        <AlertDescription>
                            • The route to your next destination is automatically loaded<br/>
                            • Toggle "GPS Tracking" ON to save your current location to the system every 30 seconds<br/>
                            • Your location will be visible to admin on the Live Fleet Map<br/>
                            • Click on terminal markers (⛽) to view delivery details or switch destination
                        </AlertDescription>
                    </Box>
                </Alert>

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
                            key={mapKey}
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
                                        Initializing your navigation
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
                            <Box w="12px" h="12px" bg="#48BB78" borderRadius="full"/>
                            <Text fontSize="sm" color="text.secondary">
                                Your Vehicle
                            </Text>
                        </HStack>
                        <HStack>
                            <Box w="12px" h="12px" bg="#48BB78" borderRadius="full"/>
                            <Text fontSize="sm" color="text.secondary">
                                Current Destination
                            </Text>
                        </HStack>
                        <HStack>
                            <Box w="12px" h="12px" bg="#f5576c" borderRadius="full"/>
                            <Text fontSize="sm" color="text.secondary">
                                Other Deliveries
                            </Text>
                        </HStack>
                        <HStack>
                            <Box w="20px" h="3px" bg={ROUTE_COLOR}/>
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
