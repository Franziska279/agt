document.addEventListener("DOMContentLoaded", async function() {
    let data = document.getElementById("result-data").innerHTML;
    let dataJson = JSON.parse(data);

    let cities = new Set();
    dataJson.data.forEach(d => {
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

    let resultJson;
    try {
        resultJson = await getResult(dataJson);
    } catch (e) {
        alert("Something went wrong! Please submit your data again!")
        console.log(e)
        // TODO: error message
        return;
    }

    if (resultJson === undefined) {
        alert("Something went wrong! Please submit your data again!")
        // TODO: error message
        return;
    }
    // structure:
    // distance (in km)
    // tour_cost
    // cities
    //      values (array)
    //          name, lat, lng
    // participants
    //      values (array)
    //          name, budget, preferences, groves, payment
    // TODO: remove affordable

    let participants = resultJson.participants.values;

    let resultParticipantDiv = document.getElementById("result-participant-div");
    participants.forEach(p => {
        let pEl = document.createElement("p");
        pEl.innerHTML = `${p.name}: ${p.payment.toFixed(2)}€`;
        resultParticipantDiv.appendChild(pEl);
    });
    document.getElementById("total-cost").innerHTML = resultJson.tour_cost + ' €';
    document.getElementById("distance").innerHTML = resultJson.distance + ' km';

    let resultCities = dataJson.start.name;
    resultJson.cities.values.forEach(c => {
        resultCities += ' - ' + c.name;
    });
    document.getElementById('route-text-div').getElementsByTagName("p")[0].innerHTML = resultCities;

    let tourCoordinates = resultJson.cities.values;
    tourCoordinates.unshift(dataJson.start);
    console.log(tourCoordinates);

    setMap(tourCoordinates);
});

function addStartToArray(cities, startingPoint) {
    cities.splice(0, 0, startingPoint);
    return cities;
}