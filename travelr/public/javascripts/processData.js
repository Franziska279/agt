document.addEventListener("DOMContentLoaded", function() {
    let data = document.getElementById("result-data").innerHTML;
    let dataJson = JSON.parse(data);
    let participants = [];
    let cities = new Set();
    dataJson.data.forEach(d => {
        participants.push(d["name"]);
        for(let p in d["preferences"]) {
            cities.add(p); // city = Cosenza;87100
        }
    });
    let resultDiv = document.getElementById("result-participant-div");
    // TODO: costs for each participant is missing
    participants.forEach(p => {
        let pEl = document.createElement("p");
        pEl.innerHTML = p + ': 200€';
        resultDiv.appendChild(pEl);
    });

    let tourDiv = document.getElementById("route-text-div");
    let tourPElem = tourDiv.getElementsByTagName("p")[0];
    // console.log(dataJson);
    let startingCity = getCityName(dataJson["start"]);
    tourPElem.innerHTML = startingCity;
    cities.forEach(c => {
        tourPElem.innerHTML += " - " + getCityName(c);
    });
    tourPElem.innerHTML += " - " + startingCity;

    cities = addStartToSet(cities, dataJson["start"]);

    set_map(cities);
});

function addStartToSet(cities, startingPoint) {
    var citiesArray = Array.from(cities);
    citiesArray.splice(0, 0, startingPoint);
    cities = new Set(citiesArray);
    return cities;
}

function getCityName(c) {
    return c.substring(0, c.lastIndexOf(";"));
}