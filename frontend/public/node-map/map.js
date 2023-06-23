
//Get JSON from Gist
var clipBorder = JSON.parse(Get('./node-map/world.json'));
var jsonFile = JSON.parse(Get('https://raw.githubusercontent.com/ibp-network/config/main/members.json'));
var memberKeys = Object.entries(jsonFile.members);

//Arrays containing data for marker and popups
var locations = [];
var markerData = [];

//Parameters for map zoom
const maxZoom = 4;
const minZoom = 1.5;

for(var i = 0; i < memberKeys.length; i++){

  //If latitude key contains no value, then builder has no node
  if( memberKeys[i][1].latitude ){

    //Syntax of each object pushed onto respective arrays
    var value = {lat: 0, lng: 0, count: 6};
    var mData = {name: '', website:'', logo: 'logo', level: 1, address: 0, member: "PRO", status: 'ONLINE'};

    //Latitude and longitude parameters to be pushed onto locations array
    value.lat = parseFloat(memberKeys[i][1].latitude);
    value.lng = parseFloat(memberKeys[i][1].longitude);

    //Data needed for the popup of each marker, pushed onto markerData array
    mData.name      = memberKeys[i][1].name;
    mData.logo      = memberKeys[i][1].logo;
    mData.level     = memberKeys[i][1].current_level;
    mData.address   = memberKeys[i][1].services_address;
    mData.website   = memberKeys[i][1].website;

    //If the member is a hobbyist member, then change to hobbyist
    if(memberKeys[i][1].member == 'hobbyist') mData.member = 'HOBBYIST';

    //If status is inactive, show the node as offline
    if(memberKeys[i][1].active == "0") mData.status = 'OFFLINE';

    //Push respective data onto respective arrays
    locations.push(value);
    markerData.push(mData);
  }

}

var mData = {name: '', website:'', logo: 'logo', level: 1, address: 0, member: "PRO", status: 'ONLINE'};
mData.name      = memberKeys[1][1].name;
mData.logo      = memberKeys[1][1].logo;
mData.level     = memberKeys[1][1].current_level;
mData.address   = memberKeys[1][1].services_address;
mData.website   = memberKeys[1][1].website;

locations.push({lat: 15.8700, lng: 100.9925, count: 6});
locations.push({lat: 19.0760, lng: 72.8777, count: 6});
locations.push({lat: -40.9006, lng: 174.8860, count: 6});
locations.push({lat: 34.0489, lng: -111.0937, count: 6});

for(var i = 0; i < 4; i++){
  markerData.push(mData);
}

//Object storing data of locations of each node
var locationData = {
  data: locations
};

//Baselayer of the map using a free OSM tile layer
var baseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: maxZoom,
            minZoom: minZoom
            });

//Map object that has default baselayer and initialized options. Additional layers are added to this object
var map = new L.Map('map', {
  layers: [baseLayer],
  center: new L.LatLng(25.6586, -80.3568),
  zoom: minZoom,
  preferCanvas: true,
  maxBounds: L.latLngBounds(L.latLng(90, -200), L.latLng(-90, 200)),
  worldCopyJump: false,
  maxBoundsViscosity: 1,
  zoomControl: false
});

var zoom  = L.control.zoom({position: 'bottomright'});
zoom.addTo(map);

//Configuration of the heatmap settings.
var heatmapCfg = {
  radius: 36,
  maxOpacity: 0.3,
  scaleRadius: true,
  useLocalExtrema: false,
  latField: 'lat',
  lngField: 'lng',
  valueField: 'count',
  blur: 0.75,
  gradient: {
    '.05': 'blue',
    '.9': 'green',
    '1': 'yellow'
  }
};

//Add Heatmap Overlay object to map
var clippedHeatmapLayer = new HeatmapOverlay(heatmapCfg);
clippedHeatmapLayer.addTo(map);

//Heatmap Overlay pre-clip add to map
var heatmapLayer = new HeatmapOverlay(heatmapCfg);
heatmapLayer.addTo(map);
heatmapLayer.setData(locationData);

var overlayPane = map.getPanes().overlayPane;
var heatmapCanvas = overlayPane.childNodes[1].childNodes[0];
heatmapCanvas.style.display = 'none';

var clippedHeatmapCanvas = overlayPane.childNodes[0].childNodes[0];
var clipPane = map.createPane('clip-pane');
clipPane.style.zIndex = 350;
clipPane.style.display = 'none';

var clipLayer = L.geoJSON(clipBorder, {
  pane: 'clip-pane',
  style: {
    stroke: false,
    fill: true,
    fillColor: '#ffffff',
    fillOpacity: 1
  }
});
clipLayer.addTo(map);

// Create a layer group to hold the markers
var markers = L.layerGroup();

//Default icon settings
var icon = L.icon({
  iconUrl: 'image/Node.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [25, -10]
});

//Icon when clicked
var clickedIcon = L.icon({
  iconUrl: 'image/pinkNode.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [25, -10]
});

//Iterate through number of valid locations and assign a marker + popup
for (var i = 0; i < locationData.data.length; i++) {

  //Markup for popup
  var popup =
  `<div class='popup-container'>
    <div>
      <img class='map-logo' src=${markerData[i].logo}>
      <div>
        <p class='map-classifier'>Builder:</p>
        <div class="row">
          <p class='map-name'>${markerData[i].name} </p> <p class='map-level'>&nbsp;${markerData[i].member}&nbsp;${markerData[i].level}</p>
        </div>
        <p class='map-classifier'>Website:</p>
        <a class='map-name' href='${markerData[i].website}' target='_blank'>${markerData[i].website} </a>
      </div>
    </div>
    <p class='map-status'>${markerData[i].status} </p>
  </div>`;

  //Bind popup to marker then add to LayerGroup object
  var marker = L.marker([locationData.data[i].lat, locationData.data[i].lng], {icon: icon}).bindPopup(popup).openPopup();
  markers.addLayer(marker);
}

//Event listener for when a marker is clicked and unclicked
markers.eachLayer(function(marker){
  marker.on('popupopen', function(){
    marker.setIcon(clickedIcon);

    markers.eachLayer(function(otherMarker){
      if(otherMarker !== marker.target){
        otherMarker.setOpacity(0.25);
      }
    });

    marker.setOpacity(1);

  });

  marker.on('popupclose', function(){
    marker.setIcon(icon);

    markers.eachLayer(function(otherMarker){
      if(otherMarker !== marker.target){
        otherMarker.setOpacity(1);
      }
    });

  });
});
markers.addTo(map);

//Show heatmap after clipping. Normally redrawn when map is moved as clip region needs to be redrawn.
map.on('moveend', function() {
  setTimeout(showClippedCanvas, 25);
});
setTimeout(showClippedCanvas, 25);

//Function that shows the final clipping of the heatmap
function showClippedCanvas() {
  var workCanvas = document.createElement('canvas');
  var workCtx = workCanvas.getContext('2d');

  workCanvas.width  = heatmapCanvas.width;
  workCanvas.height = heatmapCanvas.height;

  var clipCanvas = clipPane.childNodes[0];
  var clipCanvasW = parseInt(clipCanvas.style.width, 10);
  var clipCanvasH = parseInt(clipCanvas.style.height, 10);
  var xOffset = (clipCanvasW - heatmapCanvas.width) / 2;
  var yOffset = (clipCanvasH - heatmapCanvas.height) / 2;

  workCtx.drawImage(clipCanvas, -xOffset, -yOffset, clipCanvasW, clipCanvasH);
  workCtx.globalCompositeOperation = 'source-in';
  workCtx.drawImage(heatmapCanvas, 0, 0);

  var targetCtx = clippedHeatmapCanvas.getContext('2d');
  targetCtx.clearRect(0, 0, heatmapCanvas.width, heatmapCanvas.height);
  targetCtx.drawImage(workCanvas, 0, 0);
}

//Helper function to GET files from a given URL
function Get(url){
    var Httpreq = new XMLHttpRequest(); // a new request
        Httpreq.open("GET",url,false);
        Httpreq.send(null);

    return Httpreq.responseText;
}

L.control.scale().addTo(map);
