var map = L.map('mapid', {
  // Set latitude and longitude of the map center (required)
  center: [44.40784915911196,8.91870975494385,],
  // Set the initial zoom level, values 0-18, where 0 is most zoomed-out (required)
  zoom: 15
});
var OpenStreetMap_Mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 14,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var markerGroup = L.layerGroup().addTo(map)
var outlineLayer = L.layerGroup().addTo(map)
let counter = 1;
let totalCount;

/*Legend specific*/
var legend = L.control({ position: "bottomleft" });

legend.onAdd = function(map) {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML += "<h4>Legend</h4>";
  div.innerHTML += '<i style="background: #d86287"></i><span>POI</span><br>';
  div.innerHTML += '<i style="background: #2a7bca"></i><span>sferiche POI</span><br>';
  return div;
};

legend.addTo(map);

// Outline code
var states = [{
  "type": "Feature",
  "properties": {"party": "TargetArea"},
  "geometry": {
      "type": "Polygon",
      "coordinates": [[
        [8.93250037596431,44.4001927068866,],
        [8.93251915434896,44.4002114574692,],
        [8.93264102350633,44.4005427227063,],
        [8.93296888551486,44.4016068879066,],
        [8.93353305320102,44.4029207908389,],
        [8.93377140851251,44.4034737308164,],
        [8.93410018431521,44.4044164885861,],
        [8.933416356549,44.4131381389407,],
        [8.92197593613767,44.4178831858091,],
        [8.92142531382144,44.4180851176621,],
        [8.89949943499537,44.4151922533263,],
        [8.89902595484208,44.4148296797884,],
        [8.89724056903776,44.4074085713183,],
        [8.89757822642163,44.4067856557406,],
      ]]
  }
}];

L.geoJSON(states, {
  style: function(feature) {
      switch (feature.properties.party) {
          case 'TargetArea':   return {color: "#0000ff"};
      }
  }
}).addTo(outlineLayer);

// To draw shortest path
function drawShortestPath(path) {
  totalCount = path.spheriche.length;
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
    pointToLayer: (feature, latlng) => {
      if (counter==1||counter == totalCount) {
        counter+=1;
        return new L.Marker([latlng.lat, latlng.lng], 4)
          .bindPopup("<b>Sferica-poi</b><br>Latitude: "+latlng.lat+"<br>Longitude:" + latlng.lng);
      } else {
        counter+=1;
        return new L.Circle([latlng.lat, latlng.lng], 4)
          .bindPopup("Latitude: "+latlng.lat+"<br>Longitude:" + latlng.lng);
      }
    },
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

// Marker specific logic and API call
var theMarker = {};
var theSecondMarker = {};
var csrftoken = getCookie('csrftoken')
map.on('click',function(e){
  lat = e.latlng.lat;
  lon = e.latlng.lng;

  //Add a marker to show where you clicked.
  if (jQuery.isEmptyObject(theMarker) || theMarker._map == null){
    theMarker = L.marker([lat,lon]).addTo(markerGroup).bindPopup("<b>POI</b><br>Latitude: "+lat+"<br>Longitude:" + lon);
    theMarker._icon.style.filter = "hue-rotate(120deg)"
  }  else if (jQuery.isEmptyObject(theSecondMarker)|| theSecondMarker._map == null){
    theSecondMarker = L.marker([lat,lon]).addTo(markerGroup).bindPopup("<b>POI</b><br>Latitude: "+lat+"<br>Longitude:" + lon);
    theSecondMarker._icon.style.filter = "hue-rotate(120deg)"
    var settings = {
      "url": "http://"+window.location.host+"/map/",
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
      drawShortestPath(response)
    });
  } else {
    counter=0
    markerGroup.clearLayers()
  }
});

