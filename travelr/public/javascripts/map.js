const HERE_API_KEY = 'IbLuSWOk8u4G011cI7N8QM1vIZXHHGbBNBwbZ8VkXpc';
// document.addEventListener("DOMContentLoaded", function() {
async function set_map(cities) {
    var platform = new H.service.Platform({
        'apikey': HERE_API_KEY
    });
    var coordinates = await getCitiesCoordinates(platform, cities);
    var map = createMap(platform, document.getElementById('map-div'));
    // markCities(coordinates, map); // also done in route itself
    markRoute(platform, map, getRoutingParameters(coordinates));
}

async function getCitiesCoordinates(platform, cities) {
    // add start as ending point
    cities.add(Array.from(cities)[0]);
    var coordinates = [];
    var service = platform.getSearchService();
    for (const c of cities) {
        await addCityCoordinatesToList(coordinates, service, c);
    }
    return coordinates;
}

async function addCityCoordinatesToList(coordinates, service, c) {
    let name = c.substring(0, c.lastIndexOf(";"));
    let postalCode = c.substring(c.lastIndexOf(";"));
    await service.geocode({
        q: postalCode + ", " + name
    }, (result) => {
        // Add a marker for each location found
        result.items.forEach((item) => {
            //map.addObject(new H.map.Marker(item.position));
            coordinates.push([item.position.lat, item.position.lng]);
        });
    }, alert);
}

function createMap(platform, mapDiv) {
    // Obtain the default map types from the platform object:
    var defaultLayers = platform.createDefaultLayers();

    // Instantiate (and display) a map object:
    var map = new H.Map(
        mapDiv,
        defaultLayers.vector.normal.map,
        {
            zoom: 8,
            center: { lat: 38.72807471947513, lng: 16.539936297329433 }
        });

    // Create the default UI:
    var ui = H.ui.UI.createDefault(map, defaultLayers);
    //Step 3: make the map interactive
    // MapEvents enables the event system
    // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
    var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

    return map;
}

function markCities(coordinates, map) {
    coordinates.forEach(c => {
        // Create an icon, an object holding the latitude and longitude, and a marker:
        let icon = new H.map.Icon("images/marker_map_icon.png", {size: {w: 30, h: 30}}),
            coords = {lat: c[0], lng: c[1]},
            marker = new H.map.Marker(coords, {icon: icon});

        // Add the marker to the map and center the map at the location of the marker:
        map.addObject(marker);
        //map.setCenter(coords);
    });
}

function convertCoordinatesToWaypoints(coordinates) {
    var waypoints = [];
    coordinates.forEach(c => {
        waypoints.push('' + c[0] + ',' + c[1]);
    });
    return waypoints;
}

function markRoute(platform, map, routingParameters) {
    // Define a callback function to process the routing response:
    var onResult = function (result) {
        // ensure that at least one route was found
        if (result.routes.length) {
            result.routes[0].sections.forEach((section) => {
                // Create a linestring to use as a point source for the route line
                let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);

                // Create a polyline to display the route:
                // let routeLine = new H.map.Polyline(linestring, {
                //     style: { strokeColor: 'red', lineWidth: 3 }
                // });

                // Create an outline for the route polyline:
                var routeOutline = new H.map.Polyline(linestring, {
                    style: {
                        lineWidth: 8,
                        strokeColor: 'red',
                        lineTailCap: 'arrow-tail',
                        lineHeadCap: 'arrow-head'
                    }
                });
                // Create a patterned polyline:
                var routeArrows = new H.map.Polyline(linestring, {
                        style: {
                            lineWidth: 10,
                            fillColor: 'white',
                            strokeColor: 'rgba(255, 255, 255, 1)',
                            lineDash: [0, 2],
                            lineTailCap: 'arrow-tail',
                            lineHeadCap: 'arrow-head'
                        }
                    }
                );
                // create a group that represents the route line and contains
                // outline and the pattern
                var routeLine = new H.map.Group();
                routeLine.addObjects([routeOutline, routeArrows]);

                // Create a marker for the start point:
                let icon = new H.map.Icon("images/marker_map_icon.png", {size: {w: 30, h: 30}}),
                    startMarker = new H.map.Marker(section.departure.place.location, {icon: icon});
                // let startMarker = new H.map.Marker(section.departure.place.location);

                // Create a marker for the end point:
                //let endMarker = new H.map.Marker(section.arrival.place.location);

                // Add the route polyline and the two markers to the map:
                map.addObjects([routeLine, startMarker]); //, endMarker]);
                // console.log(routeLine)
                // TODO: set map viewpoint to whole route
                // Set the map's viewport to make the whole route visible:
                // map.getViewModel().setLookAtData({bounds: routeLine.getBoundingBox()});
                //console.log(result.routes[0])
                // TODO: calculate distance by getting distances between each waypoint
            });
        }
    };

    // Get an instance of the routing service version 8:
    var router = platform.getRoutingService(null, 8);

    // Call calculateRoute() with the routing parameters,
    // the callback and an error callback function (called if a
    // communication error occurs):
    router.calculateRoute(routingParameters, onResult,
        function (error) {
            alert(error.message);
        });
}

function getRoutingParameters(coordinates) {
    var start = '' + coordinates[0][0] + ',' + coordinates[0][1];
    var waypoints = convertCoordinatesToWaypoints(coordinates);
    // Create the parameters for the routing request:
    return {
        'routingMode': 'short',
        'transportMode': 'car',
        // The start point of the route:
        'origin': start,
        'via': new H.service.Url.MultiValueQueryParameter(waypoints),
        // The end point of the route:
        'destination': start,
        // Include the route shape in the response
        'return': 'polyline',
        'routeAttributes': 'summary'
    };
}