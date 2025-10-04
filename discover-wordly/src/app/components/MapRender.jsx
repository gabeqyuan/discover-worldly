"use client"
import mapboxgl from 'mapbox-gl'
import { useEffect, useRef, useState } from 'react';

export default function MapRender({ onMapClick } = {}) {
    const mapRef = useRef(null);
    const [coords, setCoords] = useState(null); // { lng, lat }

    useEffect(() => {
        mapboxgl.accessToken = 'pk.eyJ1IjoicGZpc2giLCJhIjoiY21nY2N4dWE1MG1pbjJpcG03YjAxZXR3aiJ9.LgdHEWWRc36shcetIf4EGQ';
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [0, 20], // Slightly north to account for controls
            zoom: 2,
            maxZoom: 4,
            minZoom: 2,
            padding: { top: 100, bottom: 100, left: 50, right: 50 },
        });

        mapRef.current = map;

        // Click handler to store coords and place/update a marker
        const handleClick = (e) => {
            // e.lngLat is a Mapbox LngLat object with lng and lat properties
            const lng = e.lngLat.lng;
            const lat = e.lngLat.lat;
            setCoords({ lng, lat });

            console.log(lng, lat);
            // call optional callback
            if (typeof onMapClick === 'function') {
                try { onMapClick({ lng, lat }); } catch (err) { /* ignore callback errors */ }
            }
        };

        map.on('click', handleClick);
    }, []);

    return (
        <div id="map" className="absolute inset-0 z-0"></div>
    )
}