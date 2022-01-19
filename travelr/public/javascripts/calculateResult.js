async function getResult(json) {
    let resultJson = {};
    let possibleResults = {};
    let zwischenErgebnis = {};
    let makKm = json["max_km"];
    let k = json["k"];
    let rangeStart = json["range_start"];
    let rangeEnd = json["range_end"];
    let fixedCost = json["fixed_cost"];
    let cityCost = json["city_cost"];
    let start = json["start"];
    let participantsData = json["data"];
    let cost = 390;
    let cities = json["cities"];
    let participants = new Set();
    participantsData.forEach(d => {
        participants.add(d["name"]); // participant = Franzi;

    });

    // LOGGING
    //console.log(json)
    // TODO: IMPLEMENT ALGORITHM HERE!

    // Compute Combinations
    participants_combination = getCombinations(Array.from(participantsData), k); // Arrays der Combinationen in diesem Set
    cities_combination = getCombinations(Array.from(cities), Object.keys(cities).length); // Arrays der Combinationen in diesem Set

    let costs = [];
    let best_tour = [];
    let lambda = 2;
    possibleResults["elements"] = [];

    // First For-Loop
    for (let cities_idx in cities_combination) {

        if (cities_idx <= cities_combination.length) {
            let newArray = [start].concat(cities_combination[cities_idx]["values"])

            costs[cities_idx] = calculateTourCosts(newArray, cities_combination[cities_idx]["name"] );
        }
    }

    resultJson["elements"] = [];
    // Second For-Loop: Calculate Utilities and ...
    for (let participant_idx in participants_combination) {
        // Not one Person alone allowed
        for (let cities_idx in cities_combination) {

            let results = calculateUtilities(participant_idx, cities_idx)

            resultJson["elements"].push({
                "participants": participants_combination[participant_idx],
                "cities": cities_combination[cities_idx],
                "utility": results.utility,
                "budget": results.max_price,
                "affordable": false
            });

            // sort by utility
            resultJson["elements"].sort(function (a, b) {
                return a.utility - b.utility;
            });
        }

    }

    let sorted_city_combinations = resultJson["elements"];
    zwischenErgebnis["elements"] = [];
    let zwischenErgebnis_Array = zwischenErgebnis["elements"];

    // For all sorted combinations

    for (let idx in sorted_city_combinations) {

        let player_combination_name = sorted_city_combinations[idx]["participants"]["name"];
        let city_combination = sorted_city_combinations[idx]["cities"]["name"];
        let percentage = 0;
        let payments = [];

        // For all players in the player-combination calculate Grooves
        for (let player in sorted_city_combinations[idx]["participants"]["values"]) {

            let current_player_name = sorted_city_combinations[idx]["participants"]["values"][player]["name"];

            //Payment per Player also player 1 : 22 , player 2: 21 -> der echte Preis muss außerhalb berechnet werden
            payments[player] = calculateGrooves(current_player_name, player_combination_name, city_combination,
                sorted_city_combinations, lambda);

            percentage += payments[player];
        }


        for (let player in sorted_city_combinations[idx]["participants"]["values"]) {

            // maximum budget for the player
            let max_payment_player = sorted_city_combinations[idx]["participants"]["values"][player]["budget"];
            let max_price = parseInt(max_payment_player.substring(0, max_payment_player.indexOf("€")));
            //let tour_costs = resultJson.filter(x => x.cities.name === city_combination );
            //console.log("Kosten = " + tour_costs)
            costs[player] = (payments[player] / percentage) * cost;
            sorted_city_combinations[idx]["participants"]["values"][player].payment = costs[player]
            //console.log("Die letzte Kombination ist affordable : " + sorted_city_combinations[idx]["participants"]["values"][player - 1])
            if (max_price < sorted_city_combinations[idx]["participants"]["values"][player].payment) {
                sorted_city_combinations[idx]["participants"]["values"][player].affordable = false
                //break
            } else {
                sorted_city_combinations[idx]["participants"]["values"][player].affordable = true
            }

        }

    }



    for (let index in sorted_city_combinations) {
        sorted_city_combinations[index]["affordable"] = isAffordable(sorted_city_combinations[index]["participants"]["values"])
    }

    sorted_city_combinations = sorted_city_combinations.filter(x => x.affordable === true);
    possibleResults["elements"] = sorted_city_combinations;
    possibleResults["elements"].sort(function (a, b) {
        return b.utility - a.utility;
    });
    console.log(possibleResults)
    console.log( possibleResults["elements"][0]);
    return possibleResults["elements"][0];
}

function isAffordable(players) {
    let affordable = true
    for (let player in players) {
        if (players[player]["affordable"] === false) {
            affordable = false
        }
    }
    return affordable
}

function calculatePaymentForPlayerCombination(paymentsArray, percentage) {

    let result = [];
    paymentsArray.forEach(function (item, index) {
        console.log(item, index);
    });
    for (let i = 0; i < paymentsArray.length; i++) {
        console.log(paymentsArray[i]);
        result[i] = paymentsArray[i] / percentage;
        console.log("Player Combi  finalPaymentPercentage = " + result[i])
        //Do something
    }

    return result;
}

function calculateGrooves(current_player_name, player_combination_name, city_combination, sorted_city_combinations, lambda) {

    let utility_of_other_players_with_this_route_without_current_player = calculateUtilityWithoutCurrentPlayer(
        current_player_name,
        player_combination_name,
        city_combination,
        sorted_city_combinations);

    let utility_of_other_players_with_other_routes = calculateUtilityWithoutCurrentPlayerAndAnotherRoute(
        current_player_name,
        player_combination_name,
        sorted_city_combinations);

    let groves = utility_of_other_players_with_other_routes * lambda -
        utility_of_other_players_with_this_route_without_current_player;

    return groves;
}

function calculateUtilityWithoutCurrentPlayerAndAnotherRoute(currentPlayer, playerCombi, sorted_city_combinations) {

    let otherplayers = playerCombi.replace(currentPlayer, '');
    const city_combi = sorted_city_combinations.filter(x => x.participants.name === otherplayers)[0];

    let utility = [];
    if (city_combi !== undefined) {
        utility.push(city_combi["utility"])
    }
    let max = Math.max(...utility);

    return max;
}

function calculateUtilityWithoutCurrentPlayer(currentPlayer, playerCombi, cityCombi, sorted_city_combinations) {


    let otherplayers = playerCombi.replace(currentPlayer, '');
    let city_combi = sorted_city_combinations.filter(x => x.cities.name === cityCombi && x.participants.name === otherplayers)[0];


    let utility = 0;
    if (city_combi != undefined) {
        utility = JSON.parse(city_combi.utility);
    } else {
        utility = 0;
    }


    return utility;
}

// Calculate Utilities
function calculateUtilities(player_combination_idx, city_combination_idx) {
    let player_combi = participants_combination[player_combination_idx]["values"]
    let city_combi = cities_combination[city_combination_idx]["values"]

    let utility = 0;
    let max_price = 0;
    for (let participant_idx in player_combi) {
        // Für einen Spliele z.B. Franzi

        // maximum budget for the group
        var budget = player_combi[participant_idx]["budget"];
        max_price += parseInt(budget.substring(0, budget.indexOf("€")));


        let values = player_combi[participant_idx]["preferences"];

        //console.log(values)
        for (let cities_idx in city_combi) {

            // Jede Stadt der Combination z.B. Tropea, Scilla , ...
            let city = city_combi[cities_idx]["name"];

            for (let p in values) {
                var cityname = p.substring(0, p.indexOf(";"));
                if (city.includes(cityname)) {
                    utility += parseInt(values[p])
                }
            }
        }
    }

    return {utility, max_price};
}

function getBudgetOfPlayer(participants_combination, participants_combination_idx, participant_idx) {

    return participants_combination[participants_combination_idx]["values"][participant_idx]["budget"];

}

async function calculateTourCosts(combination, name) {

    // TODO: Get the coordinates of elements and compute the shortest path
    // If combination just one element z.B Tropea -> calculate distance between Tropea and start ( function already exists)
    // If more than one element -> function to calculate shortest path ( function exists - usage example in map.js)

    let waypointsResult = (await arrangeForShortestPath(combination)).results[0];
    //setTimeout(() => {console.log();}, 200);
    let distance = waypointsResult["distance"] / 1000.0;
    //document.getElementById("distance").innerHTML = distance + "km";
    console.log(name + " = " + distance + " km")
    return distance;
}

// Function to generate all combinations of cities or participants
function getCombinations(valuesArray, k) {
    var json = [];
    var elements = [];
    var slent = Math.pow(2, valuesArray.length);

    for (var i = 0; i < slent; i++) {
        var temp = [];
        var combination = {};


        for (var j = 0; j < valuesArray.length; j++) {
            if ((i & Math.pow(2, j))) {
                temp.push(valuesArray[j]);
            }
        }
        if (temp.length > 0 && temp.length <= k) {
            combination["name"] = "";
            for (let p in temp) {
                combination["name"] += temp[p]["name"];
            }
            combination["values"] = temp;

            json.push(combination);
            //elements.push(temp);

        }
    }

    //console.log(elements.join("\n"));

    console.log(json)
    return json;
}
