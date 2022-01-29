async function getResult(json) {
    let maxKm = json["max_km"];
    let k = json["k"];
    let fixedCost = json["fixed_cost"];
    let cityCost = json["city_cost"];
    let start = json["start"];
    let playerData = json["data"];
    let cities = json["cities"];
    let playerNames = new Set();
    playerData.forEach(d => {
        playerNames.add(d["name"]);
    });

    console.log("Finding best route for", Array.from(playerNames).join(", "), "and cities", cities)

    // Compute Combinations
    let playerCombinations = getCombinations(Array.from(playerData), k);
    console.log("Player combinations:", playerCombinations)
    let cityCombinations = await getCityCombinationsWithDistance(Array.from(cities), start);
    console.log("City combinations:", cityCombinations)

    console.log("Computing costs...")
    calculateCosts(cityCombinations, cityCost, fixedCost);
    cityCombinations = filterForMaxRouteLength(cityCombinations, maxKm);
    // console.log(cityCombinations)

    console.log("Calculating utilities...")
    // Calculate Utilities
    let cityCombinationsWithUtility = getCityCombinationsWithUtilities(playerCombinations, cityCombinations);
    console.log(cityCombinationsWithUtility)

    // Calculate Grooves - payment
    const lambda = 2;
    console.log("Calculate Grooves with lambda", lambda)
    for (let idx in cityCombinationsWithUtility) {
        let playerCombinationName = cityCombinationsWithUtility[idx]["participants"]["name"];
        let cityCombinationName = cityCombinationsWithUtility[idx]["cities"]["name"];
        // let players = cityCombinationsWithUtility[idx]["participants"]["values"];
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
            let budget = playerJson["budget"];
            let groovesValue = playerJson.grooves
            if (playerCount === 1) {
                playerCost = tourCost;
            } else {
                playerCost = (groovesValue / maxGrooves) * tourCost; // TODO: groovesValue can be null and maxGrooves can be -Infinity
            }
            playerJson.payment = playerCost;
            playerJson.affordable = budget >= playerCost;

            cityCombinationsWithUtility[idx]["participants"]["values"][player] = JSON.parse(JSON.stringify(playerJson)); // TODO: extract to function (jsonCopy, or sth.)
            console.log(playerJson.name, "must pay", playerCost, "(", groovesValue, "/", maxGrooves, ") *", tourCost);
        }
    }

    console.log("Checking if city combination is affordable...")
    for (let idx in cityCombinationsWithUtility) {
        cityCombinationsWithUtility[idx].affordable = isAffordable(cityCombinationsWithUtility[idx]["participants"]["values"])
        console.log(cityCombinationsWithUtility[idx].cities.name, cityCombinationsWithUtility[idx].affordable);
    }

    let tourAndPlayerResults = {};
    // TODO: find a way to put also this step together with the checking for affordability into a function
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

function calculateUtility(playerCombinationValues, cityCombinationValues) {
    let utility = 0;
    for (let playerIdx in playerCombinationValues) {
        let preferences = playerCombinationValues[playerIdx]["preferences"];
        for (let cityIdx in cityCombinationValues) {
            let cityOfCombination = cityCombinationValues[cityIdx]["name"];
            for (let p in preferences) {
                let cityOfPlayerPreferences = p.substring(0, p.indexOf(";"));
                if (cityOfCombination === cityOfPlayerPreferences) {
                    utility += parseInt(preferences[p])
                }
            }
        }
    }
    return utility;
}

async function getRouteDistance(combination) {
    let waypointsResult = (await arrangeForShortestPath(combination, 10)).results[0];
    return waypointsResult["distance"] / 1000.0;
}

async function getCityCombinationsWithDistance(cities, startCity) {
    let combinations = getCombinations(cities, cities.length)
    for (let idx in combinations) {
        let combinationsWithStart = [startCity].concat(combinations[idx]["values"])
        combinations[idx].distance = await getRouteDistance(combinationsWithStart);
    }
    return combinations;
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

function calculateCosts(cityCombinations, cityCost, fixedCost) {
    for (let idx in cityCombinations) {
        let routeCost = (cityCombinations[idx].distance * cityCost) + fixedCost;
        cityCombinations[idx].cost = (Math.round(routeCost * 100) / 100).toFixed(2);
        console.log("Cost for", cityCombinations[idx].name, ":", cityCombinations[idx].cost)
    }
}

function filterForMaxRouteLength(cityCombinations, maxKm) {
    for (let idx in cityCombinations) {
        let distance = cityCombinations[idx].distance;
        cityCombinations[idx].belowDistanceLimit = distance <= maxKm;
    }
    return cityCombinations.filter(c => c.belowDistanceLimit === true)
}

// TODO: refactor
function getCityCombinationsWithUtilities(playerCombinations, cityCombinations) {
    let cityCombinationsWithUtilities = [];
    for (let playerIdx in playerCombinations) {
        for (let cityIdx in cityCombinations) {
            let utility = calculateUtility(
                playerCombinations[playerIdx].values,
                cityCombinations[cityIdx].values);

            console.log(playerCombinations[playerIdx].name, "for", cityCombinations[cityIdx].name, ":", utility);

            cityCombinationsWithUtilities.push({
                "participants": playerCombinations[playerIdx],
                "cities": cityCombinations[cityIdx],
                "distance": cityCombinations[cityIdx].distance,
                "utility": utility,
                "tour_cost": parseFloat(cityCombinations[cityIdx].cost),
                //"affordable": false
            });
        }
    }
    return cityCombinationsWithUtilities.sort((a, b) => b.utility - a.utility);
}