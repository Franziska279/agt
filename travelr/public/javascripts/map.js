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
});