function addTourData() {
    let participantData = document.getElementById('participant-list').getElementsByTagName('p');
    let startingPoint = document.getElementById('start').value;
    let postalCode = document.getElementById('postal_code').value;
    let maxKm = document.getElementById('max_km').value;
    let k = document.getElementById('k').value;
    let range = document.getElementById('range').value;
    let fixedCost = document.getElementById('fixed_cost').value;
    let cityCost = document.getElementById('city_cost').value;

    let json = {"start": startingPoint + ";" + postalCode, "data": []};

    addParticipantData(json, participantData);
    json["max_km"] = maxKm;
    json["k"] = k;
    json["range_start"] = range.substring(0, range.indexOf(";"));
    json["range_end"] = range.substring(range.indexOf(";") + 1);
    json["fixed_cost"] = fixedCost;
    json["city_cost"] = cityCost;

    document.getElementById('tourData').value = JSON.stringify(json);
    // console.log(json);
    return true; // change to "false" to prevent submission and for checking data
}

function addParticipantData(json, participantData) {
    Array.from(participantData).forEach(p => {
        let name = p.getElementsByClassName('name')[0].innerHTML;
        let budget = p.getElementsByClassName('budget')[0].innerHTML;
        let preferences = p.getElementsByClassName('preferences')[0].innerHTML;
        let prefSplit = preferences.split(", ");
        let prefMap = new Map();
        prefSplit.forEach(pref => {
            let prefUtility = pref.split(": ");
            let citySplit = prefUtility[0].split("(");
            let city = citySplit[0].trim().substring(0, citySplit[0].length);
            let postalCode = citySplit[1].substring(0, citySplit[1].length-1);
            let utility = prefUtility[1];
            prefMap.set(city + ";" + postalCode, utility);
        });
        let pJson = {"name": name, "budget": budget, "preferences": Object.fromEntries(prefMap)};
        json.data.push(pJson);
    });
}