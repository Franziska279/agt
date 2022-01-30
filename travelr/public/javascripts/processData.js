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

    let bestTour;
    try {
        bestTour = await getResult(dataJson);
        console.log(tourDebug);
    } catch (e) {
        alert("Sorry! We are experiencing technical difficulties! Please try again later!")
        console.log(e)
        return;
    }

    if (bestTour === undefined) {
        alert("We could not find a suitable route!")
        return;
    }

    // structure:
    // distance (in km)
    // tourCost
    // cities
    //      values (array)
    //          name, lat, lng
    // participants
    //      values (array)
    //          name, budget, preferences, groves, payment
    // affordable

    let participants = bestTour.participants.values;

    let resultParticipantDiv = document.getElementById("result-participant-div");
    participants.forEach(p => {
        let pEl = document.createElement("p");
        pEl.innerHTML = `${p.name}: ${p.payment.toFixed(2)}€`;
        resultParticipantDiv.appendChild(pEl);
    });
    document.getElementById("total-cost").innerHTML = bestTour.tourCost + ' €';
    document.getElementById("distance").innerHTML = bestTour.distance + ' km';

    let resultCities = dataJson.start.name;
    bestTour.cities.values.forEach(c => {
        resultCities += ' - ' + c.name;
    });
    document.getElementById('route-text-div').getElementsByTagName("p")[0].innerHTML = resultCities;

    let tourCoordinates = bestTour.cities.values;
    tourCoordinates.unshift(dataJson.start);

    setMap(tourCoordinates);
});

function addStartToArray(cities, startingPoint) {
    cities.splice(0, 0, startingPoint);
    return cities;
}