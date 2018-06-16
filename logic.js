// Store our API endpoint inside earthquakeURL
var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
var earthquakeURL ="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"


// Perform a GET request to the query URL
d3.json(earthquakeURL, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  
  function onEachFeature(feature, layer) {  
   layer.bindPopup("<h3>Magnitude: " + feature.properties.mag + "</h3><h3>Location: "+ feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }
 
  function pointToLayer(feature, latlng){
    return new L.circle(latlng,
      {radius: getRadius(feature.properties.mag),
      fillColor: getColor(feature.properties.mag),
      fillOpacity: .6,
      color: "#000",
      stroke: true,
      weight: .8
    }) 
  }

  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer
 
  });
  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoibmV3bGFuY2VhbG90IiwiYSI6ImNqaHhudDE5czBkb2czcXA4ZjNkaThnamIifQ.Nhg0lwxu85h1jZ1yRvTpRw");

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoibmV3bGFuY2VhbG90IiwiYSI6ImNqaHhudDE5czBkb2czcXA4ZjNkaThnamIifQ.Nhg0lwxu85h1jZ1yRvTpRw");


  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  //Declaring Tectonic Plates layer
  var tectonicPlates =new L.LayerGroup();

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
     // 37.09, -95.71
     36.56, 3.35
    ],
    zoom: 2.1,
    layers: [streetmap, earthquakes, tectonicPlates]
  });


    // fault lines data, geoJSON data, style information
    d3.json(tectonicPlatesURL, function(plateData) {
      L.geoJson(plateData, {
        color: "black",
        weight: 3
      })
      .addTo(tectonicPlates);
    });




  // Create a layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // legend in the bottom right
  var legend = L.control({position: 'bottomright'});

    legend.onAdd = function(myMap){
      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

    // looping through our density
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };

    legend.addTo(myMap);

}

  // color ranges for circle  
  function getColor(d){
    return d > 5 ? "red":
    d  > 4 ? "darkorange":
    d > 3 ? "orange":
    d > 2 ? "yellow":
    d > 1 ? "yellowgreen":
             "green";
  }

  // maginutde factor of 45,000 for circles. 
  function getRadius(value){
    return value*45000
  }


