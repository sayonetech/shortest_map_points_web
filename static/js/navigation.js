var map = L.map('mapid', {
  // Set latitude and longitude of the map center (required)
  center: [
    44.404096,
    8.93136,
  ],
  // Set the initial zoom level, values 0-18, where 0 is most zoomed-out (required)
  zoom: 13
});
var OpenStreetMap_Mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var markerGroup = L.layerGroup().addTo(map)

function drawShortestPath(path) {
  var traceGeojson = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "LineString",
          "coordinates": [...path.spheriche]
        },
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "MultiPoint",
          "coordinates": [...path.spheriche]
        },
      }
    ]
  };
  L.geoJson(traceGeojson, {
      onEachFeature: function (feature, layer) {
        if (feature.properties != undefined) {
          layer.bindPopup("Shortest path Trace"); 
        }
      }
  }).addTo(markerGroup);
}
function getCookie(name) {
  var dc = document.cookie;
  var prefix = name + "=";
  var begin = dc.indexOf("; " + prefix);
  if (begin == -1) {
      begin = dc.indexOf(prefix);
      if (begin != 0) return null;
  }
  else
  {
      begin += 2;
      var end = document.cookie.indexOf(";", begin);
      if (end == -1) {
      end = dc.length;
      }
  }
  // because unescape has been deprecated, replaced with decodeURI
  //return unescape(dc.substring(begin + prefix.length, end));
  return decodeURI(dc.substring(begin + prefix.length, end));
}
var theMarker = {};
var theSecondMarker = {};
var csrftoken = getCookie('csrftoken')
map.on('click',function(e){
  lat = e.latlng.lat;
  lon = e.latlng.lng;

  //Add a marker to show where you clicked.
  if (jQuery.isEmptyObject(theMarker) || theMarker._map == null){
    console.log("You clicked 1st");
    theMarker = L.marker([lat,lon]).addTo(markerGroup);
  }  else if (jQuery.isEmptyObject(theSecondMarker)|| theSecondMarker._map == null){
    console.log("You clicked 2st");
    theSecondMarker = L.marker([lat,lon]).addTo(markerGroup);
    var settings = {
      "url": "http://127.0.0.1:8000/map/",
      "method": "POST",
      "timeout": 0,
      "headers": {
        "Content-Type": "application/json",
        'X-CSRFToken': csrftoken
      },
      "data": JSON.stringify({
        "Pois": [
          {
            "Id_poi": 1,
            "Lat": theMarker._latlng.lat,
            "Long": theMarker._latlng.lng
          },
          {
            "Id_poi": 2,
            "Lat": theSecondMarker._latlng.lat,
            "Long": theSecondMarker._latlng.lng
          }
        ]
      }),
    };
    
    $.ajax(settings).done(function (response) {
      console.log(response);
      drawShortestPath(response)
    });
  } else {
    markerGroup.clearLayers()
  }
});

