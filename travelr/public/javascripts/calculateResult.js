async function getResult(json) {
    let resultJson = {};
    let makKm = json["max_km"];
    let k = json["k"];
    let rangeStart = json["range_start"];
    let rangeEnd = json["range_end"];
    let fixedCost = json["fixed_cost"];
    let cityCost = json["city_cost"];
    let start = json["start"];
    let participantsData = json["data"];
    let cities = json["cities"]

    // TODO: IMPLEMENT ALGORITHM HERE!

    // let cityArray =  Array.from(cities)
    // let first = cityArray[0];
    // console.log(cityArray)
    // for (let c in cityArray) {
    //     console.log(c)
    //     if (c !== "0") {
    //         console.log(await getDistance(first, cityArray[c]))
    //         first = cityArray[c]
    //     }
    // }

    // console.log(resultJson);
    return resultJson;
}