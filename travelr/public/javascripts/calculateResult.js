async function getResult(json) {
    let resultJson = {};
    let possibleResults = {};
    let makKm = json["max_km"]; // TODO: has to be incorporated!
    let k = json["k"];
    let rangeStart = json["range_start"];
    let rangeEnd = json["range_end"];
    let fixedCost = json["fixed_cost"];
    let cityCost = json["city_cost"];
    let start = json["start"];
    let participantsData = json["data"];
    let cities = json["cities"];
    let participants = new Set();
    participantsData.forEach(d => {
        participants.add(d["name"]); // participant = Franzi;

    });

    // Compute Combinations
    participants_combination = getCombinations(Array.from(participantsData), k); // Arrays der Combinationen in diesem Set
    cities_combination = getCombinations(Array.from(cities), Object.keys(cities).length); // Arrays der Combinationen in diesem Set

    let costs = [];
    let lambda = 2;
    possibleResults["elements"] = [];

    // First For-Loop
    for (let cities_idx in cities_combination) {

        if (cities_idx <= cities_combination.length) {
            let newArray = [start].concat(cities_combination[cities_idx]["values"])

            let distance = await getRouteDistance(newArray);
            cities_combination[cities_idx]["distance"] = distance;
            let routeCost = distance * cityCost;
            costs[cities_idx] = (Math.round(routeCost * 100) / 100).toFixed(2);

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
                "distance": cities_combination[cities_idx].distance,
                "utility": results.utility,
                "budget": results.max_price,
                "tour_cost": parseFloat(costs[cities_idx]),
                "affordable": false
            });

            // sort by utility
            resultJson["elements"].sort(function (a, b) {
                return a.utility - b.utility;
            });
        }

    }

    let sorted_city_combinations = resultJson["elements"];

    // For all sorted combinations
    for (let idx in sorted_city_combinations) {

        let player_combination_name = sorted_city_combinations[idx]["participants"]["name"];
        let city_combination = sorted_city_combinations[idx]["cities"]["name"];
        let percentage = 0;

        // For all players in the player-combination calculate Grooves
        for (let player in sorted_city_combinations[idx]["participants"]["values"]) {

            let current_player_name = sorted_city_combinations[idx]["participants"]["values"][player]["name"];

            let result = calculateGrooves(current_player_name, player_combination_name, city_combination,
                sorted_city_combinations, lambda);

            //Payment per Player also player 1 : 22 , player 2: 21 -> der echte Preis muss außerhalb berechnet werden
            sorted_city_combinations[idx]["participants"]["values"][player].groves = result
            percentage += result;
        }


        let cost = sorted_city_combinations[idx]["tour_cost"];
        let playerCount = sorted_city_combinations[idx]["participants"]["values"].length;

        for (let player in sorted_city_combinations[idx]["participants"]["values"]) {

            let playerJson = JSON.parse(JSON.stringify(sorted_city_combinations[idx]["participants"]["values"][player]));

            let player_cost = 0;
            // maximum budget for the player
            let max_payment_player = playerJson["budget"];
            let max_price = parseInt(max_payment_player.substring(0, max_payment_player.indexOf("€")));
            let groves_value = playerJson.groves
            if(playerCount === 1){
                player_cost = cost;
            }else{
                player_cost = (groves_value / percentage) * cost;
            }
            playerJson.payment = player_cost;
            playerJson.affordable = max_price >= player_cost;

            sorted_city_combinations[idx]["participants"]["values"][player] = JSON.parse(JSON.stringify(playerJson)); // TODO: extract to function (jsonCopy, or sth.)
        }
    }


    for (let index in sorted_city_combinations) {
        sorted_city_combinations[index]["affordable"] = isAffordable(sorted_city_combinations[index]["participants"]["values"])
    }

    // console.log(sorted_city_combinations)

    sorted_city_combinations = sorted_city_combinations.filter(x => x.affordable === true);
    possibleResults["elements"] = sorted_city_combinations;
    possibleResults["elements"].sort(function (a, b) {
        return b.utility - a.utility;
    });
    // console.log(possibleResults)
    console.log(possibleResults["elements"][0]);
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
    let city_combi = sorted_city_combinations.filter(x => x.participants.name === otherplayers);

    let utility = [];
    if (city_combi !== undefined) {
        for(let index in city_combi){
            utility.push(city_combi[index]["utility"])
        }

    }else{
        utility.push(1)
    }
    return Math.max(...utility);
}

function calculateUtilityWithoutCurrentPlayer(currentPlayer, playerCombi, cityCombi, sorted_city_combinations) {

    let otherplayers = playerCombi.replace(currentPlayer, '');
    let city_combi = sorted_city_combinations.filter(x => x.cities.name === cityCombi && x.participants.name === otherplayers)[0];

    let utility = 0;
    if (city_combi !== undefined) {
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

async function getRouteDistance(combination) {
    let waypointsResult = (await arrangeForShortestPath(combination)).results[0];
    return waypointsResult["distance"] / 1000.0;
}

// Function to generate all combinations of cities or participants
function getCombinations(valuesArray, k) {
    var json = [];
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
        }
    }

    return json;
}
