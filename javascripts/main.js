//Canvas & Map variables
var road_map = {};
var satellite_map = {};
var road_map_canvas = document.getElementById("road_map");
var satellite_map_canvas = document.getElementById("satellite_map");
var is_save_image = false;
var init_lat = 41.88388330337919;
var init_lng = -87.66031516374511;
var init_zoom = 14;
var generated_size = 512;
var url;
var current_map;

//Modal
var previewModal = document.getElementById('previewModal');
var infoModal = document.getElementById('infoModal');
var body = document.getElementsByTagName('body');
var container = document.getElementById('container');

//Url
var urlSettings = parseQueryString();
if (Object.keys(urlSettings).length === 3) {
    var init_lat = parseFloat(urlSettings.lat);
    var init_lng = parseFloat(urlSettings.lng);
    var init_zoom = parseInt(urlSettings.zoom);
}

/**
 * change the Map size  and create it
 * @param {int} width width of the map
 */
function changeCanvasSize(width) {
    road_map = {};
    satellite_map = {};

    if (width != 512) {
        //Open the modal
        openModal();
        document.getElementById("mapContainer").style.opacity = 0;
        displayStatus("Generating the map, be patient...");
    }

    //update zoom with the new size
    var delta = Math.log2(width / generated_size);
    if (delta >= 0) {
        delta = Math.floor(delta);
    } else {
        delta = Math.ceil(delta);
    }
    init_zoom = init_zoom + delta;
    generated_size = width;
    height = width;
    document.getElementById('road_map').style.width = width + "px";
    document.getElementById('road_map').style.height = height + "px";
    document.getElementById('satellite_map').style.width = width + "px";
    document.getElementById('satellite_map').style.height = height + "px";
    initMaps();
}

/**
 * Generate the picture
 */
function generatePicture() {
    displayStatus("Fixing the layout...");
    //Google requires clear, visible attribution to both Google and their data providers when the content is shown
    //https://www.google.com/permissions/geoguidelines.html
    nodes2hide = document.getElementsByClassName("gmnoprint");
    for (i = 0; i < nodes2hide.length; i++) {
        nodes2hide[i].style.display = 'none';
    }
    nodes2hide = document.getElementsByClassName("gm-style-cc");
    for (i = 0; i < nodes2hide.length; i++) {
        nodes2hide[i].style.display = 'none';
    }
    nodes2hide = document.querySelectorAll('[src^="http://maps.gstatic.com/mapfiles/api-3/images/google"]');
    for (i = 0; i < nodes2hide.length; i++) {
        nodes2hide[i].style.display = 'none';
    }


    html2canvas(road_map_canvas, {
        useCORS: true
    }).then(function (canvas) {
        image_name = 'R_' + init_zoom + '_' + init_lat + '_' + init_lng;
        canvas.toBlob(function (blob) {
            saveAs(blob, image_name + '.jpg');
        }, "image/jpeg", 1.0);
        html2canvas(satellite_map_canvas, {
            useCORS: true
        }).then(function (canvas) {
            image_name = 'S_' + init_zoom + '_' + init_lat + '_' + init_lng;
            canvas.toBlob(function (blob) {
                saveAs(blob, image_name + '.jpg');
            }, "image/jpeg", 0.9);

            //END
            is_save_image = false;
            changeCanvasSize(512);
            document.getElementById("mapContainer").style.opacity = 1;
            displayStatus('');
            closeModal();
        });

    });
}

function initScript() {
    //The Search Box
    var input = document.getElementById('pac-input');
    searchBox = new google.maps.places.SearchBox(input);
    changeCanvasSize(generated_size);
}

/**
 * Create the maps
 */
function initMaps() {

    var myLatlng = new google.maps.LatLng(init_lat, init_lng);

    //road_map
    var mapOptions = {
        center: myLatlng,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER
        },

        keyboardShortcuts: true,
        zoom: init_zoom,
        styles: [{
            "featureType": "all",
            "elementType": "labels",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "all",
            "elementType": "geometry",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [{
                "color": "#FFFFFF"
            }, {
                "visibility": "on"
            }]
        }, {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [{
                "color": "#00FF00"
            }, {
                "visibility": "on"
            }]
        }, {
            "featureType": "poi.medical",
            "elementType": "geometry",
            "stylers": [{
                "color": "#FF0000"
            }, {
                "visibility": "on"
            }]
        }, {
            "featureType": "transit.line",
            "elementType": "geometry",
            "stylers": [{
                "visibility": "on"
            }, {
                "color": "#FFFF00"
            }, {
                "weight": 3
            }]
        }, {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{
                "visibility": "on"
            }, {
                "color": "#000000"
            }, {
                "weight": 1
            }]
        }, {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [{
                "color": "#0000FF"
            }, {
                "weight": 1
            }]
        }, {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [{
                "color": "#FF00FF"
            }, {
                "weight": 3
            }]
        }, {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "weight": 3
            }]
        }, {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{
                "color": "#00FFFF"
            }, {
                "visibility": "on"
            }]
        }]
    };

    road_map = new google.maps.Map(document.getElementById('road_map'), mapOptions);

    road_map.addListener('drag', function () {
        current_map = 'road';
    });

    road_map.addListener('idle', function () {
        // update the url
        url = '?zoom=' + init_zoom + '&lat=' + init_lat + '&lng=' + init_lng;
        window.history.replaceState("", "", url);
    });

    road_map.addListener('tilesloaded', function () {
        if (is_save_image === true) {
            setTimeout(function () {
                generatePicture();
            }, 100);
        }
    });

    road_map.addListener('bounds_changed', function () {
        init_zoom = road_map.zoom;
        init_lat = road_map.center.lat();
        init_lng = road_map.center.lng();

        myLatlng = new google.maps.LatLng(init_lat, init_lng);
        if (current_map == 'road') {
            satellite_map.setCenter(myLatlng);
            satellite_map.setZoom(init_zoom);
        }
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();
        if (places.length === 0) {
            return;
        }
        // Clear out the old markers.
        markers.forEach(function (marker) {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        road_map.fitBounds(bounds);
        satellite_map.fitBounds(bounds);
    });

    //satellite_map
    mapOptions = {
        zoom: init_zoom,
        center: myLatlng,
        mapTypeId: 'satellite',
        disableDefaultUI: true,
        zoomControl: false,
        keyboardShortcuts: false,
        rotateControl: false,
        scrollwheel: true,
        draggable: true
    };

    satellite_map = new google.maps.Map(document.getElementById('satellite_map'),
        mapOptions);

    satellite_map.addListener('drag', function () {
        current_map = 'satellite';
    });

    satellite_map.addListener('idle', function () {
        // update the url
        url = '?zoom=' + init_zoom + '&lat=' + init_lat + '&lng=' + init_lng;
        window.history.replaceState("", "", url);
    });

    satellite_map.addListener('bounds_changed', function () {
        init_zoom = satellite_map.zoom;
        init_lat = satellite_map.center.lat();
        init_lng = satellite_map.center.lng();

        myLatlng = new google.maps.LatLng(init_lat, init_lng);
        if (current_map == 'satellite') {
            road_map.setCenter(myLatlng);
            road_map.setZoom(init_zoom);
        }
    });
}