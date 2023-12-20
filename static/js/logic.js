const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

function chooseColor(depth) {
    // Determine marker color based on earthquake depth
    if (depth > 90) {
        return "red";
    } else if (depth > 70) {
        return "orangered";
    } else if (depth > 50) {
        return "orange";
    } else if (depth > 30) {
        return "gold";
    } else if (depth > 10) {
        return "yellow";
    } else if (depth > -10) {
        return "green";
    } else {
        return "blue";
    }
}

function createMap() {
    // Create the background tile layer
    let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    // Initialize layer groups
    let layers = {
        EARTHQUAKES: new L.LayerGroup()
    };
    // Create the map with layers
    let map = L.map("map", {
        center: [37, -97],
        zoom: 5,
        layers: [
            layers.EARTHQUAKES
        ]
    });
    // Add our "streetmap" tile layer to the map
    streetmap.addTo(map);
    // Create a legend
    let legend = L.control({
        position: "bottomright"
    });
    // When layer control is added, insert div with class "legend"
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "legend");
        // Code adapted from example at https://leafletjs.com/examples/choropleth/
        depth = [-10, 10, 30, 50, 70, 90];
        for (let i=0; i < depth.length; i++) {
            div.innerHTML += '<i style="background:' + chooseColor(depth[i] + 10) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }
        return div;
    };
    // Add the info legend to the map
    legend.addTo(map);
    // Perform API call
    d3.json(url).then(function(data) {
        // Log data in console
        console.log(data);
        // Define features
        let features = data.features;
        // Loop through each earthquake
        for (let i=0; i < features.length; i++) {
            // Get important data
            let longitude = features[i].geometry.coordinates[0];
            let latitude = features[i].geometry.coordinates[1];
            let depth = features[i].geometry.coordinates[2];
            let magnitude = features[i].properties.mag;
            // Create markers for each quake
            let newMarker = L.circle([latitude, longitude], {
                radius: magnitude*10000,
                fillColor: chooseColor(depth),
                fillOpacity: 0.75,
                stroke: true,
                color: "black",
                weight: 0.25
            });
            // Add marker to map
            newMarker.addTo(layers.EARTHQUAKES);
            // Bind popup to marker with info about the earthquake
            newMarker.bindPopup(features[i].properties.place + "<br> Magnitude: " + magnitude + "<br> Depth: " + depth);
        }
    });
}

// Run the function
createMap();
