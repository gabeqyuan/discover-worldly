"use client"
import mapboxgl from 'mapbox-gl'
import { useEffect, useRef, useState } from 'react';

export default function MapRender({ onCountryChange }) {
    const mapRef = useRef(null);

    useEffect(() => {
        mapboxgl.accessToken = 'pk.eyJ1IjoicGZpc2giLCJhIjoiY21nY2N4dWE1MG1pbjJpcG03YjAxZXR3aiJ9.LgdHEWWRc36shcetIf4EGQ';
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/pfish/cmgcfynxg00ec01qw6ji591zs',
            center: [0, 20], // Slightly north to account for controls
            zoom: 2,
            maxZoom: 4,
            minZoom: 2,
            padding: { top: 100, bottom: 100, left: 50, right: 50 },
        });

        mapRef.current = map;

        // click handler to store coords
        const handleClick = async (e) => {
            const lng = e.lngLat.lng;
            const lat = e.lngLat.lat;

            try {
                const response = await fetch(`https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=pk.eyJ1IjoicGZpc2giLCJhIjoiY21nY2N4dWE1MG1pbjJpcG03YjAxZXR3aiJ9.LgdHEWWRc36shcetIf4EGQ`);
                if (!response.ok) {
                    throw new Error('Failed to fetch country');
                }
                const reverse_geocoding = await response.json();
                const country = reverse_geocoding.features[reverse_geocoding.features.length - 1].properties.context.country.country_code;
                
                if (typeof onCountryChange === 'function') onCountryChange(country);
            } catch (error) {
                console.error('Error fetching countries:', error);
            }
        };

        map.on('click', handleClick);
    }, []);

    return (
        <div id="map" className="absolute inset-0 z-0"></div>
    )
}