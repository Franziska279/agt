let tourDebug = [];

async function getResult(json) {
    let maxKm = parseInt(json["max_km"]);
    let k = parseInt(json["k"]);
    let fixedCost = parseInt(json["fixed_cost"]);
    let cityCost = parseInt(json["city_cost"]);
    let start = json["start"];
    let playerData = json["data"];
    let cities = json["cities"];
    let playerNames = new Set();
    playerData.forEach(d => {
        playerNames.add(d["name"]);
    });
    const lambda = 2;

    let playerCombinations = getCombinations(Array.from(playerData), k);
    let cityCombinations = await getCityCombinationsWithDistance(Array.from(cities), start);

    let citiesWithStart = copyJson(cities);
    citiesWithStart.push(start);
    tourDebug.push({"cities": citiesWithStart});
    tourDebug.push({"players": copyJson(playerData)});
    tourDebug.push({"playerCombinations" : copyJson(playerCombinations)});
    tourDebug.push({"cityCombinations" : copyJson(cityCombinations)});

    cityCombinations = filterByMaxRouteLength(cityCombinations, maxKm);
    calculateCosts(cityCombinations, cityCost, fixedCost);
    let combinations = getCombinationsWithUtilities(playerCombinations, cityCombinations);
    calculatePaymentsWithGroovesForCombinations(combinations, lambda);
    combinations = filterByBudget(combinations);

    let tourAndPlayerResults = {};
    tourAndPlayerResults["elements"] = combinations;
    tourAndPlayerResults["elements"].sort((a, b) => b.utility - a.utility);
    let bestTour = tourAndPlayerResults["elements"][0];
    tourDebug.push({"bestThree" : tourAndPlayerResults["elements"].slice(0, 3)})
    tourDebug.push({"bestTour" : bestTour});
    return bestTour;
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
    let debugObj = [];
    let filteredCombinations = combinations.filter(c => {
        c.affordable = isAffordable(c.participants.values);
        let participantCombinationName = c.participants.name;
        let debugParticipants = [];
        for (let p in c.participants.values) {
            let participant = c.participants.values[p];
            debugParticipants.push({
                "name": participant.name,
                "budget": participant.budget,
                "payment" : participant.payment
            });
        }
        debugObj.push({
            "combination" : `${c.cities.name}-${participantCombinationName}`,
            "affordable" : c.affordable,
            "participants" : debugParticipants
        });
        return c.affordable;
    });
    tourDebug.push({"isAffordable" : debugObj.sort((a, b) => b.affordable - a.affordable)});
    return filteredCombinations;
}

function calculatePaymentsWithGroovesForCombinations(combinations, lambda) {
    let debugObj = [];
    for (let idx in combinations) {
        let maxGrooves = 0;
        let playerCombinationName = combinations[idx].participants.name;
        let players = combinations[idx].participants.values;
        let cityCombinationName = combinations[idx].cities.name;

        let debugId = `${cityCombinationName}-${playerCombinationName}`;
        let combinationJson = {"id": `${cityCombinationName}-${playerCombinationName}`};

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
            combinations[idx]["participants"]["values"][player] = copyJson(playerJson);

            combinationJson[playerJson.name] = {
                "grooves": {
                    "value": grooves,
                    "calculation": tourDebug[debugId]
                },
                "payment" : 0
            };

            delete tourDebug[debugId];
        }

        combinationJson.maxGrooves = maxGrooves;
        combinationJson.tourCost = combinations[idx].tourCost;

        combinations[idx].participants.values =
            calculatePlayerPaymentForGrooves(combinations[idx].tourCost, copyJson(players), maxGrooves);

        for (let player in players) {
            combinationJson[players[player].name].payment = tourDebug.payments[players[player].name].payment;
        }
        delete tourDebug.payments;
        debugObj.push(combinationJson);
    }
    tourDebug.push({"paymentsByGrooves" : debugObj});
}

function calculatePlayerPaymentForGrooves(tourCost, playersCopy, maxGrooves) {
    let debugObj = [];
    let resultPlayers = [];
    for (let p in playersCopy) {
        let player = playersCopy[p];
        let payment = 0;
        let budget = parseInt(player["budget"]);
        let grooves = player.grooves
        debugObj[`${player.name}`] = {
            "payment": {
                "budget": budget
            }
        };
        if (playersCopy.length === 1) {
            payment = tourCost;
        } else {
            payment = (grooves / maxGrooves) * tourCost;
            debugObj[`${player.name}`].payment.calculation = `(${grooves} / ${maxGrooves}) * ${tourCost}`;
        }
        player.payment = payment;
        player.affordable = budget >= payment;

        debugObj[`${player.name}`].payment.value = payment;
        tourDebug["payments"] = debugObj;

        resultPlayers.push(player);
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

    tourDebug[`${cityCombinationName}-${playerCombinationName}`] = [];
    tourDebug[`${cityCombinationName}-${playerCombinationName}`].push(
        `${utilityOfOtherPlayersWithOtherRoutes} * ${lambda} - ${utilityOfOtherPlayersForThisRouteWithoutPlayer}`);
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
    let maxUtility = Math.max(...utility);
    return maxUtility === -Infinity ? 0 : maxUtility;
}

function calculateUtilityWithoutCurrentPlayer(player, playerCombination, cityCombinationName, cityCombinations) {
    let otherPlayers = playerCombination.replace(player, '');
    let cityCombination = cityCombinations.filter(x => x.cities.name === cityCombinationName && x.participants.name === otherPlayers)[0];

    let utility;
    if (cityCombination !== undefined) {
        utility = cityCombination.utility;
    } else {
        utility = 0;
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
    let debugObj = [];
    for (let idx in cityCombinations) {
        let routeCost = cityCombinations[idx].distance * cityCost + fixedCost;
        cityCombinations[idx].cost = (Math.round(routeCost * 100) / 100).toFixed(2);
        debugObj.push({
            "city": `${cityCombinations[idx].name}`,
            "cost" : cityCombinations[idx].cost,
            "calculation" : `${cityCombinations[idx].distance} * ${cityCost} + ${fixedCost}`
        });
    }
    tourDebug.push({"costCalculation" : debugObj});
}

function filterByMaxRouteLength(cityCombinations, maxKm) {
    let debugObj = [];
    for (let idx in cityCombinations) {
        let distance = cityCombinations[idx].distance;
        cityCombinations[idx].belowDistanceLimit = distance <= maxKm;
        debugObj.push({"city": `${cityCombinations[idx].name}`, "isBelow": cityCombinations[idx].belowDistanceLimit});
    }
    tourDebug.push({"isBelowMaxRouteLength" : debugObj});
    return cityCombinations.filter(c => c.belowDistanceLimit === true)
}

function getCombinationsWithUtilities(playerCombinations, cityCombinations) {
    let debugObj = [];
    let combinations = [];
    for (let playerIdx in playerCombinations) {
        for (let cityIdx in cityCombinations) {
            let playerCombination = playerCombinations[playerIdx];
            let cityCombinationName = cityCombinations[cityIdx].name;
            let utility = calculateUtility(playerCombination, cityCombinationName);

            let playerCityCombination = {
                "participants": copyJson(playerCombination),
                "cities": copyJson(cityCombinations[cityIdx]),
                "distance": cityCombinations[cityIdx].distance,
                "utility": utility,
                "tourCost": cityCombinations[cityIdx].cost,
            };
            combinations.push(playerCityCombination);
            let debugId = `${cityCombinationName}-${playerCombination.name}`;
            debugObj.push({
                "combination" : debugId,
                "utility" : utility,
                "calculation" : tourDebug[debugId]
            });
            delete tourDebug[debugId];
        }
    }
    tourDebug.push({"playerCityCombinationsWithUtilities" : debugObj.sort((a, b) => b.utility - a.utility)});
    return combinations.sort((a, b) => b.utility - a.utility);
}

function calculateUtility(playerCombination, cityCombinationName) {
    let debugId = `${cityCombinationName}-${playerCombination.name}`;
    tourDebug[debugId] = [];
    let players = playerCombination.values;
    let utility = 0;
    for (let player in players) {
        let playerJson = {"player" : players[player].name};
        let preferences = players[player].preferences;
        for (let p in preferences) {
            let city = p.substring(0, p.indexOf(";"));
            if (cityCombinationName.includes(city)) {
                utility += preferences[p];
                playerJson[city] = preferences[p];
            }
        }
        tourDebug[debugId].push(playerJson);
    }
    return utility;
}