document.addEventListener("DOMContentLoaded", function() {
    let data = document.getElementById("result-data").innerHTML;
    let dataJson = JSON.parse(data);

    let resultJson = getResult(dataJson);

    let participants = []; // TODO: once resultJson has values, change to "= resultJson["participants"]
    let cities = new Set();
    dataJson.data.forEach(d => { // TODO: adapt further code to resultJson
        participants.push(d["name"]);
        for(let p in d["preferences"]) {
            cities.add(p); // city = Cosenza;87100
        }
    });

    let resultDiv = document.getElementById("result-participant-div");
    participants.forEach(p => {
        let pEl = document.createElement("p");
        pEl.innerHTML = p + ': 200€';
        resultDiv.appendChild(pEl);
    });

    cities = addStartToSet(cities, dataJson["start"]);

    setMap(cities);
});

function addStartToSet(cities, startingPoint) {
    var citiesArray = Array.from(cities);
    citiesArray.splice(0, 0, startingPoint);
    cities = new Set(citiesArray);
    return cities;
}