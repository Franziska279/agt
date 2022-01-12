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
    console.log(json)

    // let cities = new Set();
    // participantsData.forEach(d => {
    //     for(let p in d["preferences"]) {
    //         cities.add(p); // city = Cosenza;87100
    //     }
    // });
    let cities = json["cities"]

    let participants = new Set();
    participantsData.forEach(d => {
        participants.add(d["name"]); // participant = Franzi;

    });

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
    // Compute Combinations
    participants_combination = new Set(getCombinations(Array.from(participants), k));
    cities_combination = new Set(getCombinations(Array.from(cities), cities.size));

    // Check with logging
    console.log(participants)
    console.log(cities)
    console.log(participants_combination)
    console.log(cities_combination)

    // First For-Loop


    console.log(resultJson);
    return resultJson;
}


// Function to generate all combinations of cities or participants
function getCombinations(valuesArray, k)
{
    var combi = [];
    var temp = [];
    var slent = Math.pow(2, valuesArray.length);

    for (var i = 0; i < slent; i++)
    {
        temp = [];
        for (var j = 0; j < valuesArray.length; j++)
        {
            if ((i & Math.pow(2, j)))
            {
                temp.push(valuesArray[j]);
            }
        }
        if (temp.length > 0 &&  temp.length <= k )
        {
            combi.push(temp);
        }
    }

    combi.sort((a, b) => a.length - b.length);
    //console.log(combi.join("\n"));
    return combi;
}
