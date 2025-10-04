"use client"
import mapboxgl from 'mapbox-gl'
import { useEffect, useRef, useState } from 'react';

export default function MapRender({ coordnates }) {
    const mapRef = useRef(null);
    const [coords, setCoords] = useState(null); // { lng, lat }

    useEffect(() => {
        mapboxgl.accessToken = 'pk.eyJ1IjoicGZpc2giLCJhIjoiY21nY2N4dWE1MG1pbjJpcG03YjAxZXR3aiJ9.LgdHEWWRc36shcetIf4EGQ';
        const map = new mapboxgl.Map({
            container: 'map', // container ID
            style: 'mapbox://styles/pfish/cmgcfynxg00ec01qw6ji591zs',
            center: [0,0], // starting position [lng, lat]
            zoom: 2, // starting zoom
            maxZoom: 4,
            minZoom: 2,
        });

        mapRef.current = map;

        // click handler to store coords
        const handleClick = (e) => {
            const lng = e.lngLat.lng;
            const lat = e.lngLat.lat;
            setCoords({ lng, lat });

            // call optional callback
            if (typeof onMapClick === 'function') {
                try { onMapClick({ lng, lat }); } catch (err) { /* ignore callback errors */ }
            }
        };

        map.on('click', handleClick);
    }, []);

    return (
        <div id="map" className="absolute inset-0"></div>
    )
}