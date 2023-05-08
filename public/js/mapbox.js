/*eslint-disable*/

export function displayMap(locations) {
    mapboxgl.accessToken =
        'pk.eyJ1Ijoic2FpcmFta3Jpc2huYSIsImEiOiJja25tM2lxZWkwbnlkMnFtcG1wb2Zic2V2In0.a_3CKgAtPMcPQVOBG-WG1Q';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/sairamkrishna/cknm3zkur3cgn17mgd1lpq5w5',
        scrollZoom: false
        // center: [-118, 34],
        //zoom : 4,
        // interactive: false
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        // 1) create div element
        const el = document.createElement('div');
        el.className = 'marker';

        // 2)create marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
            .setLngLat(loc.coordinates)
            .addTo(map);
        // 3)create popup
        new mapboxgl.Popup({
            offset: 30
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);
        // 4)extend bounds
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 200,
            right: 200,
            left: 200
        }
    });
}
