// from http://stackoverflow.com/questions/523266/how-can-i-get-a-specific-parameter-from-location-search
function parseQueryString() {
    var str = window.location.search;
    var objURL = {};
    str.replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
        function ($0, $1, $2, $3) {
            objURL[$1] = $3;
        }
    );
    return objURL;
}

function pairSave(width) {
    is_save_image = true;
    changeCanvasSize(width);
}

function areaSet(setscale) {
    scale = setscale;
    //let slice the area
    var bounds = road_map.getBounds();
    //Web Mercator not really relevant for lat/lng values, kiss
    intervalLng = (bounds.b.f - bounds.b.b) / (scale * 2);
    intervalLat = (bounds.f.f - bounds.f.b) / (scale * 2);
    var datasetZoom = road_map.zoom + Math.log2(scale);
    dataset = 0;
    for (y = 0; y < scale; y++) {
        for (x = 0; x < scale; x++) {
            setCenter[dataset] = [bounds.f.b + intervalLat + (intervalLat * y * 2), bounds.b.b + intervalLng + (intervalLng * x * 2), datasetZoom];
            dataset++;
        }
    }
    areaSave();
}

function areaStatus(message) {
    document.getElementById("areamessages_" + scale).innerHTML = message;
}

function displayStatus(message) {
    document.getElementById("messages").innerHTML = message;
}

function openModal() {
    infoModal.className = "Modal is-visuallyHidden";
    setTimeout(function () {
        container.className = "MainContainer is-blurred";
        infoModal.className = "Modal";
    }, 50);
    container.parentElement.className = "ModalOpen";
}

function closeModal() {
    infoModal.className = "Modal is-hidden is-visuallyHidden";
    body.className = "";
    container.className = "MainContainer";
    container.parentElement.className = "";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == infoModal) {
        closeModal();
        document.getElementById("messages").innerHTML = "";
    }
};

/**
 * URL sharing with is.gd
 */
function share() {
    openModal();
    //load thejsonp
    var s = document.createElement('script');
    var url = encodeURIComponent(window.location.href);
    s.type = 'text/javascript';
    s.src = 'https://is.gd/create.php?format=json&callback=short_url&url=' + url + '&logstats=0';
    var h = document.getElementsByTagName('script')[0];
    h.parentNode.insertBefore(s, h);
}

//the JSONP function for is.gd shortener
function short_url() {
    var shorturl = '';
    if (arguments[0].shorturl === undefined) {
        shorturl = 'error';
    } else {
        shorturl = arguments[0].shorturl;
    }
    document.getElementById("messages").innerHTML = '<input value="' + shorturl + '" onclick="this.select();" class="share" readonly="" type="text">';
}