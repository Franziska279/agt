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
    const lambda = 2;

    console.log("Finding best route for", Array.from(playerNames).join(", "), "and cities", cities)

    // Compute Combinations
    let playerCombinations = getCombinations(Array.from(playerData), k);
    console.log("Player combinations:", playerCombinations)
    let cityCombinations = await getCityCombinationsWithDistance(Array.from(cities), start);
    console.log("City combinations:", cityCombinations)

    console.log("Computing costs...")
    calculateCosts(cityCombinations, cityCost, fixedCost);
    cityCombinations = filterByMaxRouteLength(cityCombinations, maxKm);
    // console.log(cityCombinations)

    console.log("Calculating utilities...")
    // Calculate Utilities and merge combinations
    let combinations = getCombinationsWithUtilities(playerCombinations, cityCombinations);
    console.log(combinations)

    console.log("Calculate Grooves with lambda", lambda)
    // Calculate Grooves - payment
    calculatePaymentsWithGroovesForCombinations(combinations, lambda);

    console.log("Checking if city combination is affordable...")
    combinations = filterByBudget(combinations);

    let tourAndPlayerResults = {};
    tourAndPlayerResults["elements"] = combinations;
    tourAndPlayerResults["elements"].sort((a, b) => b.utility - a.utility);
    console.log("RESULT:", tourAndPlayerResults["elements"][0]);
    return tourAndPlayerResults["elements"][0];
}

function isAffordable(players) {
    for (let player in players) {
        if (!players[player].affordable) {
            return false;
        }
    }
    return true;
}

function filterByBudget(combinations) {
    return combinations.filter(c => {
        c.affordable = isAffordable(c.participants.values);
        console.log(c.cities.name, c.affordable);
        return c.affordable;
    });
}

function calculatePaymentsWithGroovesForCombinations(combinations, lambda) {
    for (let idx in combinations) {
        let playerCombinationName = combinations[idx]["participants"]["name"];
        let cityCombinationName = combinations[idx]["cities"]["name"];
        let players = combinations[idx]["participants"]["values"];
        let maxGrooves = 0;

        // For all players in the combination
        for (let player in players) {
            let playerJson = copyJson(players[player]);
            let currentPlayerName = playerJson.name;
            let grooves = calculateGroovesForPlayer(
                currentPlayerName, playerCombinationName, cityCombinationName, combinations, lambda);
            // Grooves-values is sth. like 22, 21
            // real payment value has to be determined outside the loop
            playerJson.grooves = grooves
            maxGrooves += grooves;
            console.log("Grooves for player", currentPlayerName, ":", grooves)
            combinations[idx]["participants"]["values"][player] = copyJson(playerJson);
        }

        console.log("Calculate payment according to Grooves...")
        combinations[idx]["participants"]["values"] =
            calculatePlayerPaymentForGrooves(combinations[idx]["tour_cost"], players, maxGrooves);
    }
}

function calculatePlayerPaymentForGrooves(tourCost, players, maxGrooves) {
    let resultPlayers = [];
    for (let player in players) {
        let playerJson = copyJson(players[player]);
        let payment = 0;
        let budget = playerJson["budget"];
        let grooves = playerJson.grooves
        if (players.length === 1) {
            payment = tourCost;
        } else {
            payment = (grooves / maxGrooves) * tourCost; // TODO: grooves can be null and maxGrooves can be -Infinity
        }
        playerJson.payment = payment;
        playerJson.affordable = budget >= payment;

        resultPlayers.push(playerJson);
        console.log(playerJson.name, "must pay", payment, "(", grooves, "/", maxGrooves, ") *", tourCost);
    }
    return copyJson(resultPlayers);
}

function copyJson(original) {
    return JSON.parse(JSON.stringify(original));
}

function calculateGroovesForPlayer(playerName, playerCombinationName, cityCombinationName, cityCombinations, lambda) {
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

function filterByMaxRouteLength(cityCombinations, maxKm) {
    for (let idx in cityCombinations) {
        let distance = cityCombinations[idx].distance;
        cityCombinations[idx].belowDistanceLimit = distance <= maxKm;
    }
    return cityCombinations.filter(c => c.belowDistanceLimit === true)
}

function getCombinationsWithUtilities(playerCombinations, cityCombinations) {
    let combinations = [];
    for (let playerIdx in playerCombinations) {
        for (let cityIdx in cityCombinations) {
            let utility = calculateUtility(
                playerCombinations[playerIdx].values,
                cityCombinations[cityIdx].values);

            console.log(playerCombinations[playerIdx].name, "for", cityCombinations[cityIdx].name, ":", utility);

            combinations.push({
                "participants": playerCombinations[playerIdx],
                "cities": cityCombinations[cityIdx],
                "distance": cityCombinations[cityIdx].distance,
                "utility": utility,
                "tour_cost": parseFloat(cityCombinations[cityIdx].cost),
            });
        }
    }
    return combinations.sort((a, b) => b.utility - a.utility);
}