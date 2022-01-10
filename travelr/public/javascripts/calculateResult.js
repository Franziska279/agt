function getResult(json) {
    let resultJson = {};
    let makKm = json["max_km"];
    let k = json["k"];
    let rangeStart = json["range_start"];
    let rangeEnd = json["range_end"];
    let fixedCost = json["fixed_cost"];
    let cityCost = json["city_cost"];
    let start = json["start"];
    let participantsData = json["data"];
    let cities = new Set();
    participantsData.forEach(d => {
        for(let p in d["preferences"]) {
            cities.add(p); // city = Cosenza;87100
        }
    });

    // TODO: IMPLEMENT ALGORITHM HERE!

    console.log(resultJson);
    return resultJson;
}