import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

export interface OfflineMapRef {
  zoomIn: () => void;
  zoomOut: () => void;
  toggleLayer: () => void;
  setUserLocation: (lat: number, lng: number) => void;
}

interface Props {
  onMapReady?: () => void;
  onHazardClick?: (zoneName: string) => void;
}

export const OfflineMap = forwardRef<OfflineMapRef, Props>(({ onMapReady, onHazardClick }, ref) => {
  const webViewRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      webViewRef.current?.injectJavaScript(`if(window.nerMap) window.nerMap.zoomIn(); true;`);
    },
    zoomOut: () => {
      webViewRef.current?.injectJavaScript(`if(window.nerMap) window.nerMap.zoomOut(); true;`);
    },
    toggleLayer: () => {
      webViewRef.current?.injectJavaScript(`if(window.toggleLayer) window.toggleLayer(); true;`);
    },
    setUserLocation: (lat: number, lng: number) => {
      webViewRef.current?.injectJavaScript(`if(window.setUserLoc) window.setUserLoc(${lat}, ${lng}); true;`);
    },
  }));

  const mapHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body, #map { width:100%; height:100%; background:#131315; overflow:hidden; }
    .dark-popup .leaflet-popup-content-wrapper {
      background: #1f1f21;
      color: #e4e2e4;
      border: 1px solid #334155;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.6);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      font-weight: 600;
    }
    .dark-popup .leaflet-popup-tip { background: #1f1f21; }
    .pulse-ring {
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { r: 18; opacity: 1; }
      100% { r: 36; opacity: 0; }
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    let currentTileLayer = null;
    let isSatellite = false;
    let userMarker = null;

    const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    const satTiles = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

    const map = L.map('map', {
      center: [26.2, 92.8], // Northeast India
      zoom: 8,
      zoomControl: false,
      attributionControl: false
    });
    window.nerMap = map;

    currentTileLayer = L.tileLayer(darkTiles, { maxZoom: 19, subdomains: 'abcd' }).addTo(map);

    window.toggleLayer = function() {
      if (!map) return;
      if (currentTileLayer) map.removeLayer(currentTileLayer);
      isSatellite = !isSatellite;
      currentTileLayer = L.tileLayer(isSatellite ? satTiles : darkTiles, { maxZoom: 19, subdomains: 'abcd' }).addTo(map);
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'TOAST', message: isSatellite ? 'Satellite Layer' : 'Dark Map Layer' }));
    };

    window.setUserLoc = function(lat, lng) {
      if (!map) return;
      map.setView([lat, lng], 13, { animate: true });
      if (userMarker) userMarker.remove();
      userMarker = L.circleMarker([lat, lng], {
        radius: 9,
        color: '#bec6e0',
        fillColor: '#38bdf8',
        fillOpacity: 1,
        weight: 3
      }).addTo(map).bindPopup('<div style="color:#e4e2e4;">📍 Your Location</div>').openPopup();
    };

    // Hazard Zones
    const zones = [
      { id: 'LS-204', latlng: [27.1, 93.6], label: 'Zone LS-204 // Critical Landslide', risk: 'critical', color: '#ffb4ab' },
      { id: 'RF-102', latlng: [26.7, 92.3], label: 'Sector 2 // High Inflow Runoff', risk: 'high', color: '#fdba74' },
      { id: 'SM-701', latlng: [25.9, 93.1], label: 'Sector 7 // Soil Saturation', risk: 'medium', color: '#fde047' },
    ];

    zones.forEach(z => {
      const marker = L.circleMarker(z.latlng, {
        radius: z.risk === 'critical' ? 18 : 12,
        color: z.color,
        fillColor: z.color,
        fillOpacity: 0.3,
        weight: 2
      }).addTo(map).bindPopup('<div style="padding:4px 6px;">' + z.label + '</div>', { className: 'dark-popup' });

      marker.on('click', () => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'HAZARD_CLICK', zone: z.id }));
      });

      if (z.risk === 'critical') {
        L.circleMarker(z.latlng, {
          radius: 28,
          color: z.color,
          fillColor: 'transparent',
          weight: 1.5,
          dashArray: '4 4',
          opacity: 0.8
        }).addTo(map);
      }
    });

    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
  </script>
</body>
</html>
`;

  return (
    <View style={styles.container}>
      {React.createElement(WebView as any, {
        ref: webViewRef,
        originWhitelist: ['*'],
        source: { html: mapHtml },
        style: styles.webView,
        javaScriptEnabled: true,
        domStorageEnabled: true,
        startInLoadingState: true,
        renderLoading: () => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#bec6e0" />
          </View>
        ),
        onMessage: (event: any) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'READY' && onMapReady) onMapReady();
            if (data.type === 'HAZARD_CLICK' && onHazardClick) onHazardClick(data.zone);
          } catch (e) {
            // Ignore non-json messages
          }
        },
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131315',
  },
  webView: {
    flex: 1,
    backgroundColor: '#131315',
  },
  loader: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#131315',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
