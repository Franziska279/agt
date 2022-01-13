document.addEventListener("DOMContentLoaded", async function() {
    let data = document.getElementById("result-data").innerHTML;
    let dataJson = JSON.parse(data);

    let participants = []; // TODO: once resultJson has values, change to "= resultJson["participants"]

    let cities = new Set();
    dataJson.data.forEach(d => {
        participants.push(d["name"]);
        for(let p in d["preferences"]) {
            cities.add(p); // city = Cosenza;87100
        }
    });
    cities = addStartToArray(Array.from(cities), dataJson["start"]);

    let coordinates = await getCitiesCoordinates(platform, cities)
    dataJson["start"] = coordinates[0];
    let tourCities = coordinates;
    tourCities.splice(0, 1); // remove start
    dataJson["cities"] = tourCities;

    let resultJson = await getResult(dataJson);

    let resultDiv = document.getElementById("result-participant-div");
    participants.forEach(p => {
        let pEl = document.createElement("p");
        pEl.innerHTML = p + ': 200€';
        resultDiv.appendChild(pEl);
    });

    //setMap(coordinates);
});

function addStartToArray(cities, startingPoint) {
    cities.splice(0, 0, startingPoint);
    return cities;
}