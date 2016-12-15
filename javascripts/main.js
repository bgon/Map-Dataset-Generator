//Canvas & Map variables
var road_map = {};
var satellite_map = {};
var road_map_canvas = document.getElementById("road_map");
var satellite_map_canvas = document.getElementById("satellite_map");
var pair_canvas = document.createElement('canvas');
var pair_canvas_ctx = pair_canvas.getContext("2d");
var is_save_image = false;
var init_lat = 41.88388330337919;
var init_lng = -87.66031516374511;
var init_zoom = 14;
var generated_size = 512;
var url;
var current_map;
var scale = 16;
var intervalLng;
var intervalLat;
var setCenter = [];
var areasaveStatus = false;

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

    //Create the pair
    pair_canvas.width = width * 2;
    pair_canvas.height = width;

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
    document.getElementById('road_map').style.width = generated_size + "px";
    document.getElementById('road_map').style.height = generated_size + "px";
    document.getElementById('satellite_map').style.width = generated_size + "px";
    document.getElementById('satellite_map').style.height = generated_size + "px";
    initMaps();
}

/**
 * Generate the picture with html2canvas
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

        pair_canvas_ctx.drawImage(canvas, 0, 0);

        html2canvas(satellite_map_canvas, {
            useCORS: true
        }).then(function (canvas) {

            pair_canvas_ctx.drawImage(canvas, generated_size, 0);

            if (areasaveStatus === true) {
                // split the dataset into training, validation and testing sets 
                var num = Math.random();
                if (num < 1 / 5) set = 'val_'; //validation probability 20%
                else if (num < 10 / 25) set = 'test_'; //testing probability 20%
                else set = 'train_'; //training probability 60%
                index = set + ('0000' + (Math.pow(scale, 2) - setCenter.length)).slice(-4) + '_';
            } else {
                index = '0000_';
            }
            image_name = index + init_zoom + '_' + init_lat.toFixed(5) + '_' + init_lng.toFixed(5);
            pair_canvas.toBlob(function (blob) {
                saveAs(blob, image_name + '.jpg');
            }, "image/jpeg", 0.85);

            if (areasaveStatus === true) {
                setTimeout(function () {
                    areaSave();
                }, 200);
            } else {
                is_save_image = false;
                changeCanvasSize(512);
                document.getElementById("mapContainer").style.opacity = 1;
                displayStatus('');
                closeModal();
            }
        });
    });
}


/**
 * Save the Area as a dataset
 */
function areaSave() {

    mapset = setCenter.shift();
    if (mapset) {
        areasaveStatus = true;
        areaStatus(' Area ' + (Math.pow(scale, 2) - setCenter.length) + '/' + Math.pow(scale, 2));
        init_lat = mapset[0];
        init_lng = mapset[1];
        init_zoom = mapset[2];
        myLatlng = new google.maps.LatLng(init_lat, init_lng);
        road_map.setCenter(myLatlng);
        road_map.setZoom(init_zoom);
        satellite_map.setCenter(myLatlng);
        satellite_map.setZoom(init_zoom);
    } else {
        areasaveStatus = false;
        changeCanvasSize(512);
    }
}

/**
 * Google Map init
 */
function initScript() {
    //The Search Box
    var input = document.getElementById('pac-input');
    searchBox = new google.maps.places.SearchBox(input);
    changeCanvasSize(generated_size);
}


/**
 * Creates the road map and the satellite map
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
        url = '?zoom=' + init_zoom + '&lat=' + init_lat.toFixed(5) + '&lng=' + init_lng.toFixed(5);
        window.history.replaceState("", "", url);
    });

    road_map.addListener('tilesloaded', function () {

        if ((is_save_image === true) || (areasaveStatus === true)) {
            setTimeout(function () {
                generatePicture();
            }, 200);
        }
    });

    road_map.addListener('bounds_changed', function () {

        if (areasaveStatus === false) {
            init_zoom = road_map.zoom;
            init_lat = road_map.center.lat();
            init_lng = road_map.center.lng();

            myLatlng = new google.maps.LatLng(init_lat, init_lng);
            if (current_map == 'road') {
                satellite_map.setCenter(myLatlng);
                satellite_map.setZoom(init_zoom);
            }
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
        url = '?zoom=' + init_zoom + '&lat=' + init_lat.toFixed(5) + '&lng=' + init_lng.toFixed(5);
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