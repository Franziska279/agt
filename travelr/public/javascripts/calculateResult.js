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
    participants_combination = getCombinations(Array.from(participantsData), k); // Arrays der Combinationen in diesem Set
    cities_combination = getCombinations(Array.from(cities), Object.keys(cities).length); // Arrays der Combinationen in diesem Set

    // Check with logging
 /*   console.log(participants)
    console.log(cities)
    console.log(participants_combination)
    console.log(cities_combination)*/

    let costs = [];
    let best_tour = [];

    function calculateTourCosts(element, cityCost, fixedCost) {

       // console.log(element) // TODO: Get the coordinates of elements and compute the shortest path
        return undefined;
    }

    // First For-Loop
    for(let cities_idx in cities_combination){
        costs[cities_idx] =  calculateTourCosts(cities_combination[cities_idx], cityCost, fixedCost);
    }

    // Calculate Utilities
    function calculateUtilities(player_combination_idx, city_combination_idx) {
        let player_combi = participants_combination[player_combination_idx]["values"]
        let city_combi = cities_combination[city_combination_idx]["values"]

        let utility = 0;
        for (let participant_idx in player_combi) {
            // Für einen Spliele z.B. Franzi

            let values = player_combi[participant_idx]["preferences"];

            //console.log(values)
            for (let cities_idx in city_combi) {

                // Jede Stadt der Combination z.B. Tropea, Scilla , ...
                let city = city_combi[cities_idx]["name"];
                //console.log(city)
                for (let p in values) {
                    var cityname = p.substring(0, p.indexOf(";"));
                    if (city.includes(cityname)) {
                        utility += parseInt(values[p])
                    }
                }
            }
        }

        return utility;
    }

    for(let participant_idx in participants_combination){

        best_tour[participant_idx] = [null,0];

        let group_utility = [];

        for(let cities_idx in cities_combination){

            group_utility[cities_idx] = calculateUtilities(participant_idx, cities_idx)

            //console.log(utility)
        }
        //group_utility.sort();
        console.log(group_utility)
    }

    //console.log(best_tour)
    //console.log(resultJson);
    return resultJson;
}


// Function to generate all combinations of cities or participants
function getCombinations(valuesArray, k)
{
    var json = [];
    var elements = [];
    var slent = Math.pow(2, valuesArray.length);

    for (var i = 0; i < slent; i++)
    {
        var temp = [];
        var combination = {};


        for (var j = 0; j < valuesArray.length; j++)
        {
            if ((i & Math.pow(2, j)))
            {
                temp.push(valuesArray[j]);
            }
        }
        if (temp.length > 0 &&  temp.length <= k )
        {
            combination["name"] = "";
            for(let p in temp) {
                combination["name"] += temp[p]["name"];
            }
            combination["values"] = temp;
            json.push(combination);
            //elements.push(temp);

        }
    }

    //elements.sort((a, b) => a.length - b.length);
    //console.log(elements.join("\n"));

    console.log(json)
    return json;
}
