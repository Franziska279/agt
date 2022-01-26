async function getResult(json) {
    let resultJson = {};
    let makKm = json["max_km"]; // TODO: has to be incorporated!
    let k = json["k"];
    let rangeStart = json["range_start"];
    let rangeEnd = json["range_end"];
    let fixedCost = json["fixed_cost"];
    let cityCost = json["city_cost"];
    let start = json["start"];
    let playerData = json["data"];
    let cities = json["cities"];
    let players = new Set();
    playerData.forEach(d => {
        players.add(d["name"]);
    });

    console.log("Finding best route for", Array.from(players).join(", "), "and cities", cities)

    // Compute Combinations
    let playerCombinations = getCombinations(Array.from(playerData), k);
    console.log("Player combinations:", playerCombinations)
    let cityCombinations = getCombinations(Array.from(cities), Object.keys(cities).length);
    console.log("City combinations:", cityCombinations)

    // Calculate costs for each participant
    console.log("Computing costs...")
    for (let idx in cityCombinations) {
        let citiesCombinationsWithStart = [start].concat(cityCombinations[idx]["values"])
        let distance = await getRouteDistance(citiesCombinationsWithStart);
        cityCombinations[idx]["distance"] = distance;
        let routeCost = (distance * cityCost) + fixedCost;
        cityCombinations[idx]["cost"] = (Math.round(routeCost * 100) / 100).toFixed(2);
        console.log("Cost for", cityCombinations[idx].name, ":", cityCombinations[idx].cost)
    }

    console.log(cityCombinations)

    resultJson["elements"] = [];
    console.log("Calculating utilities...")
    // Calculate Utilities
    for (let participant_idx in playerCombinations) {
        for (let cities_idx in cityCombinations) {

            let results = calculateUtilities(
                playerCombinations[participant_idx].values,
                cityCombinations[cities_idx].values)

            console.log(playerCombinations[participant_idx].name, "for", cityCombinations[cities_idx].name, ":", results.utility)

            resultJson["elements"].push({
                "participants": playerCombinations[participant_idx],
                "cities": cityCombinations[cities_idx],
                "distance": cityCombinations[cities_idx].distance,
                "utility": results.utility,
                "budget": results.maxPrice,
                "tour_cost": parseFloat(cityCombinations[cities_idx].cost),
                "affordable": false
            });
        }
    }

    let cityCombinationsWithUtility = resultJson["elements"];

    console.log(cityCombinationsWithUtility.sort((a, b) => b.utility - a.utility))

    // Calculate Grooves - payment
    const lambda = 2;
    console.log("Calculate Grooves with lambda", lambda)
    for (let idx in cityCombinationsWithUtility) {
        let playerCombinationName = cityCombinationsWithUtility[idx]["participants"]["name"];
        let cityCombinationName = cityCombinationsWithUtility[idx]["cities"]["name"];
        let maxGrooves = 0;

        // For all players in the city-combination
        for (let player in cityCombinationsWithUtility[idx]["participants"]["values"]) {
            let currentPlayerName = cityCombinationsWithUtility[idx]["participants"]["values"][player]["name"];
            let result = calculateGrooves(
                currentPlayerName, playerCombinationName, cityCombinationName, cityCombinationsWithUtility, lambda);

            // Grooves-values is sth. like 22, 21
            // real payment value has to be determined outside of the loop
            cityCombinationsWithUtility[idx]["participants"]["values"][player].grooves = result
            maxGrooves += result;
            console.log("Grooves for player", currentPlayerName, ":", result)
        }

        let tourCost = cityCombinationsWithUtility[idx]["tour_cost"];
        let playerCount = cityCombinationsWithUtility[idx]["participants"]["values"].length;

        console.log("Calculate payment according to Grooves...")
        for (let player in cityCombinationsWithUtility[idx]["participants"]["values"]) { // TODO: same loop as before?
            let playerJson = JSON.parse(JSON.stringify(cityCombinationsWithUtility[idx]["participants"]["values"][player]));
            let playerCost = 0;
            // maximum budget for the player
            let budgetText = playerJson["budget"];
            let maxBudget = parseInt(budgetText.substring(0, budgetText.indexOf("€")));
            let groovesValue = playerJson.grooves
            if (playerCount === 1) {
                playerCost = tourCost;
            } else {
                playerCost = (groovesValue / maxGrooves) * tourCost; // TODO: groovesValue can be null and maxGrooves can be -Infinity
            }
            playerJson.payment = playerCost;
            playerJson.affordable = maxBudget >= playerCost;

            cityCombinationsWithUtility[idx]["participants"]["values"][player] = JSON.parse(JSON.stringify(playerJson)); // TODO: extract to function (jsonCopy, or sth.)
            console.log(playerJson.name, "must pay", playerCost, "(", groovesValue, "/", maxGrooves, ") *", tourCost);
        }
    }

    console.log("Checking if city combination is affordable...")
    for (let idx in cityCombinationsWithUtility) {
        cityCombinationsWithUtility[idx]["affordable"] = isAffordable(cityCombinationsWithUtility[idx]["participants"]["values"])
        console.log(cityCombinationsWithUtility[idx].cities.name, cityCombinationsWithUtility[idx].affordable);
    }

    let tourAndPlayerResults = {};
    tourAndPlayerResults["elements"] = cityCombinationsWithUtility.filter(x => x.affordable === true); // keep only affordable solutions
    tourAndPlayerResults["elements"].sort((a, b) => b.utility - a.utility);
    console.log("RESULT:", tourAndPlayerResults["elements"][0]);
    return tourAndPlayerResults["elements"][0];
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

function calculateGrooves(playerName, playerCombinationName, cityCombinationName, cityCombinations, lambda) {
    let utilityOfOtherPlayersForThisRouteWithoutPlayer = calculateUtilityWithoutCurrentPlayer(
        playerName,
        playerCombinationName,
        cityCombinationName,
        cityCombinations);

    let utilityOfOtherPlayersWithOtherRoutes = calculateUtilityWithoutPlayerAndAnotherRoute(
        playerName,
        playerCombinationName,
        cityCombinations);

    return utilityOfOtherPlayersWithOtherRoutes * lambda -
        utilityOfOtherPlayersForThisRouteWithoutPlayer;
}

function calculateUtilityWithoutPlayerAndAnotherRoute(player, playerCombination, cityCombinations) {

    let otherPlayers = playerCombination.replace(player, '');
    // cityCombinations with the other players, but without given player
    let otherPlayersCityCombinationWithoutPlayer = cityCombinations.filter(x => x.participants.name === otherPlayers);

    let utility = [];
    if (otherPlayersCityCombinationWithoutPlayer !== undefined) {
        for(let idx in otherPlayersCityCombinationWithoutPlayer) {
            utility.push(otherPlayersCityCombinationWithoutPlayer[idx]["utility"]);
        }
    } else {
        utility.push(1); // because it will get multiplied later in Grooves
    }
    return Math.max(...utility);
}

function calculateUtilityWithoutCurrentPlayer(player, playerCombination, cityCombinationName, cityCombinations) {

    let otherPlayers = playerCombination.replace(player, '');
    let cityCombination = cityCombinations.filter(x => x.cities.name === cityCombinationName && x.participants.name === otherPlayers)[0];

    let utility;
    if (cityCombination !== undefined) {
        utility = JSON.parse(cityCombination.utility);
    } else {
        utility = 0;
    }
    return utility;
}

// Calculate Utilities
// TODO: split - mixed purposes!
function calculateUtilities(playerCombinationValues, cityCombinationValues) {
    let utility = 0;
    let maxPrice = 0;
    for (let playerIdx in playerCombinationValues) {
        // maximum budget for the group
        let budget = playerCombinationValues[playerIdx]["budget"];
        maxPrice += parseInt(budget.substring(0, budget.indexOf("€")));
        let values = playerCombinationValues[playerIdx]["preferences"];

        for (let cityIdx in cityCombinationValues) {
            let city = cityCombinationValues[cityIdx]["name"];
            for (let p in values) {
                let cityName = p.substring(0, p.indexOf(";"));
                if (city.includes(cityName)) {
                    utility += parseInt(values[p])
                }
            }
        }
    }
    return {utility, maxPrice};
}

async function getRouteDistance(combination) {
    let waypointsResult = (await arrangeForShortestPath(combination)).results[0];
    return waypointsResult["distance"] / 1000.0;
}

function getCombinations(valuesArray, k) {
    let json = [];
    const powLen = Math.pow(2, valuesArray.length);

    for (let i = 0; i < powLen; i++) {
        let temp = [];
        let combination = {};

        for (let j = 0; j < valuesArray.length; j++) {
            if ((i & Math.pow(2, j))) {
                temp.push(valuesArray[j]);
            }
        }
        if (temp.length > 0 && temp.length <= k) {
            combination["name"] = "";
            for (let idx in temp) {
                combination["name"] += temp[idx]["name"];
            }
            combination["values"] = temp;

            json.push(combination);
        }
    }

    return json;
}
