
let form, inputLat, inputLon, submitButton, errorPopUpContainer, map, popup, clearButton;

async function postLocation() {
    try {
        let res = await fetch('/city', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ latitude: inputLat.value, longitude: inputLon.value })
        });
        // The server will do serverside validation and return any messsage via json.
        // Cover all possible return cases, RIGHT HERE!

        if (!res.ok) {
            let jsonRes = await res.json();
            throw jsonRes;
        }
        // This innerHTML is sketchy, will need to re-examine for a better solution!

        let htmlString = await res.text();
        document.body.innerHTML = htmlString;
    }
    catch (e) {
        // Check what kind of error, then display based on that, RIGHT HERE!
        inputLat.value = "";
        inputLon.value = "";
        let errorPopUpContainer = document.querySelector('#errorPopUpContainer');

        let errorMessage = errorPopUpContainer.firstElementChild.children[2];
        errorMessage.innerText = e.msg;

        errorPopUpContainer.classList.add('show')
    }
}

function submitFetch(event) {
    event.preventDefault(); // prevent default form submit behavior, use fetch() instead!
    postLocation();
}


function onMapClickLoc(e) {
    inputLat.value = e.latlng.lat;
    inputLon.value = e.latlng.lng;
    popup
        .setLatLng(e.latlng)
        .setContent("You want the weather at " + e.latlng.toString())
        .openOn(map);
}

function removeErrorPopUpContainer(e) {
    errorPopUpContainer.classList.remove('show');
}

function initialize() {
    inputLat = document.getElementById('latitude');
    inputLon = document.getElementById('longitude');
    form = document.querySelector('form');
    errorPopUpContainer = document.getElementById('errorPopUpContainer');
    clearButton = document.querySelector("#clearButton");

    map = L.map('map').setView([0, 0], 1);
    popup = L.popup();

    /* Let's instantiate and set up the leaflet map here ! */
    const OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    map.on('click', onMapClickLoc);
    clearButton.addEventListener('click', removeErrorPopUpContainer);
    form.addEventListener('submit', submitFetch);
}

initialize();