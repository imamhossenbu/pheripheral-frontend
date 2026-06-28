"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import L from "leaflet";

const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface TrackingPoint {
    id: string;
    latitude: number;
    longitude: number;
    stage: string;
    note?: string;
}

export default function LiveMap({ tracking }: { tracking: TrackingPoint | null }) {
    if (!tracking || !tracking.latitude || !tracking.longitude) {
        return (
            <div className="h-52 w-full flex items-center justify-center bg-surface-50 text-xs text-text-muted border-b border-surface-200">
                No geographic coordinates transmitted yet.
            </div>
        );
    }

    return (
        <div className="h-52 w-full border-b border-surface-200 relative z-10">
            <MapContainer
                center={[tracking.latitude, tracking.longitude]}
                zoom={14}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[tracking.latitude, tracking.longitude]} icon={defaultIcon}>
                    <Popup>
                        <div className="text-xs font-sans">
                            <p className="font-bold text-brand-600">{tracking.stage}</p>
                            {tracking.note && <p className="text-text-secondary mt-0.5">{tracking.note}</p>}
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}