function add_tour_data() {
    let data = document.getElementById('participant-list').getElementsByTagName('p');
    let json = [];
    Array.from(data).forEach(p => {
        let name = p.getElementsByClassName('name')[0].innerHTML;
        let budget = p.getElementsByClassName('budget')[0].innerHTML;
        let preferences = p.getElementsByClassName('preferences')[0].innerHTML;
        let prefSplit = preferences.split(", ");
        let prefMap = new Map();
        prefSplit.forEach(pref => {
            let prefUtility = pref.split(": ");
            let city = prefUtility[0];
            let utility = prefUtility[1];
            prefMap.set(city, utility);
        });
        let pJson = {"name": name, "budget": budget, "preferences": Object.fromEntries(prefMap)};
        json.push(pJson);
    });
    document.getElementById('tourData').value = JSON.stringify(json);
    return true;
}