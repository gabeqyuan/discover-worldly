"use client"
import mapboxgl from 'mapbox-gl'
import { useEffect } from 'react';

export default function MapRender() {
    useEffect(() => {
        mapboxgl.accessToken = 'pk.eyJ1IjoicGZpc2giLCJhIjoiY21nY2N4dWE1MG1pbjJpcG03YjAxZXR3aiJ9.LgdHEWWRc36shcetIf4EGQ';
        const map = new mapboxgl.Map({
            container: 'map', // container ID
            center: [0,0], // starting position [lng, lat]. Note that lat must be set between -90 and 90
            zoom: 2 // starting zoom
        });
    }, []);

    return (
        <div id="map" className="absolute top-0 bottom-0 w-[100%]"></div>
    )
}