$(document).ready(function(){
    mapView();
    getLines();
});


// leaflet map view
function mapView() {

    // [60.45,22.27] is basically the city center of turku
    map = L.map('map').setView([60.45,22.27], 11);
    L.tileLayer(
        'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiaXNtYWlsZWxuYWdnYXIiLCJhIjoiY2szaGJxMTNxMDEwbjNwbjJidjh1ajltOCJ9.p_LZLPyBOWY01k5K46E3lw',
        {attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 22,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiaXNtYWlsZWxuYWdnYXIiLCJhIjoiY2szaGJxMTNxMDEwbjNwbjJidjh1ajltOCJ9.p_LZLPyBOWY01k5K46E3lw'
    }).addTo(map);
} // accessToken using mapbox Default public token



/*  Get all bus lines from list */

function getLines() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "https://data.foli.fi/gtfs/routes", true);

    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4) {
            let routedata = JSON.parse(xhttp.responseText);
            let routeArray = [];
            // Go through all routes: append short route name and route id
            for (route of routedata) {
                routeArray.push(route.route_short_name + " " + route.route_id);
            }

            // Sort Array
            routeArray.sort();
            let busline = document.getElementById("busline");
            // step through array, split rout name as text and id as value
            for (route of routeArray) {
                splitstrings = route.split(" ");
                option = document.createElement("option");
                option.text = splitstrings[0];
                option.value = splitstrings[1];
                busline.add(option);
            }
        }
    };
    xhttp.send();
}


/*  Create the route on the map selected by the user */

function createRoute() {
    map.remove();
    mapView();
    // get bus line
    var selector = document.getElementById("busline");
    var route_id = selector[selector.selectedIndex].value;
    var xhttpRoute = new XMLHttpRequest();
    var shape_id = "";

    xhttpRoute.open("GET", "https://data.foli.fi/gtfs/trips/route/" + route_id, true);
    xhttpRoute.onreadystatechange = function () {
        if (xhttpRoute.readyState === 4) {
            if (xhttpRoute.status === 404){
                alert("Couldn't find route for the selected bus line.");
            }
            // Get shape_id and use it forming the wanted url
            var obj = JSON.parse(xhttpRoute.responseText);
            shape_id = obj[0].shape_id;
            var xhttpShape = new XMLHttpRequest();
            xhttpShape.open("GET", "https://data.foli.fi/gtfs/shapes/" + shape_id, true);
            xhttpShape.onreadystatechange = function () {
                if (xhttpShape.readyState === 4) {
                    var o = JSON.parse(xhttpShape.responseText);
                    var latlonList = [];

                    // step through points and append latitude and longitude of each point to latlonlist
                    for (point of o) {
                        point = new L.LatLng(point.lat, point.lon);
                        latlonList.push(point);
                    }

                    // use elements from latlonlist to create the line
                    var line = new L.Polyline(latlonList, {
                        color: 'black',
                        weight: 3,
                        opacity: 0.5,
                        smoothFactor: 1
                    });

                    line.addTo(map);
                }
            };

            xhttpShape.send();
        }
    };

    xhttpRoute.send();
}


/*  Display the location of the selected bus */

function busLocation() {
    var selector = document.getElementById("busline");
    var route_name = selector[selector.selectedIndex].text;
    var xhttp = new XMLHttpRequest();

    xhttp.open("GET", "https://data.foli.fi/siri/vm/", true);
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4) {
            var obj = JSON.parse(xhttp.responseText);
            buses = obj.result.vehicles;

            //step through buses and check if the name is same as selected in drop-down-list
            for (bus in buses) {
                // add all buses from the selected line to map
                if (buses[bus].publishedlinename === route_name) {
                    lat = buses[bus].latitude;
                    lon = buses[bus].longitude;
                    marker = L.marker([lat, lon], {icon: busIcon}).addTo(map);
                }
            }
        }

    };
    xhttp.send();
}



/*  refresh function to be able to refresh the page so buses locations are updated on the route */

function refresh() {
    map.remove();
    mapView();
    createRoute();
    busLocation();
}



/* leaflet marker icon and marker shadow
https://leafletjs.com/examples/custom-icons/ */

var busIcon = L.icon({
    iconUrl: 'images/marker-icon.png',
    shadowUrl: 'images/marker-shadow.png',
    iconSize:     [40, 60],
    shadowSize:   [50, 60],
    iconAnchor:   [22, 64],
    shadowAnchor: [4, 62],
    popupAnchor:  [-3, -76]
});