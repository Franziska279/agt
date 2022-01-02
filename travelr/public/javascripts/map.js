document.addEventListener("DOMContentLoaded", function() {
    var platform = new H.service.Platform({
        'apikey': 'IbLuSWOk8u4G011cI7N8QM1vIZXHHGbBNBwbZ8VkXpc'
    });

    // Obtain the default map types from the platform object:
    var defaultLayers = platform.createDefaultLayers();

    // Instantiate (and display) a map object:
    var map = new H.Map(
        document.getElementById('map-div'),
        defaultLayers.vector.normal.map,
        {
            zoom: 8,
            center: { lat: 38.72807471947513, lng: 16.539936297329433 }
        });

    // TODO: test data
    var coordinates = [[39.298403014978675, 16.258142827309133],
        [38.67694273628852, 15.895550990399894],
        [38.09394081111101, 15.642539653630289],
        [38.91023583099221, 16.579782783050636]];
    coordinates.forEach(c => {
        // Create an icon, an object holding the latitude and longitude, and a marker:
        let icon = new H.map.Icon("images/marker_map_icon.png", {size: {w: 30, h: 30}}),
            coords = {lat: c[0], lng: c[1]},
            marker = new H.map.Marker(coords, {icon: icon});

        // Add the marker to the map and center the map at the location of the marker:
        map.addObject(marker);
        //map.setCenter(coords);
    });
});