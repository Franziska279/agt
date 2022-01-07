function add_tour_data() {
    let data = document.getElementById('participant-list').getElementsByTagName('p');
    let startingPoint = document.getElementById('start').value;
    let postalCode = document.getElementById('postal_code').value;
    let json = {"start": startingPoint + ";" + postalCode, "data": []};
    Array.from(data).forEach(p => {
        let name = p.getElementsByClassName('name')[0].innerHTML;
        let budget = p.getElementsByClassName('budget')[0].innerHTML;
        let preferences = p.getElementsByClassName('preferences')[0].innerHTML;
        let prefSplit = preferences.split(", ");
        let prefMap = new Map();
        prefSplit.forEach(pref => {
            let prefUtility = pref.split(": ");
            let citySplit = prefUtility[0].split("(");
            let city = citySplit[0].substring(0, citySplit[0].length);
            let postalCode = citySplit[1].substring(0, citySplit[1].length);
            let utility = prefUtility[1];
            prefMap.set(city + ";" + postalCode, utility);
        });
        let pJson = {"name": name, "budget": budget, "preferences": Object.fromEntries(prefMap)};
        json.data.push(pJson);
    });
    document.getElementById('tourData').value = JSON.stringify(json);
    return true;
}