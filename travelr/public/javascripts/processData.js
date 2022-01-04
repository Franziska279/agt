document.addEventListener("DOMContentLoaded", function() {
    let data = document.getElementById("result-data").innerHTML;
    let dataJson = JSON.parse(data);
    // console.log(dataJson);
    let participants = [];
    let cities = new Set();
    dataJson.forEach(d => {
        participants.push(d["name"]);
        for(let p in d["preferences"]) {
            cities.add(p);
        }
    });
    // console.log(participants);
    // console.log(cities);
    // TODO: calculate result here!
    let resultDiv = document.getElementById("result-participant-div");
    // TODO: costs for each participant is missing
    participants.forEach(p => {
        let pEl = document.createElement("p");
        pEl.innerHTML = p + ': 200€';
        resultDiv.appendChild(pEl);
    });

    let tourDiv = document.getElementById("route-text-div");
    let tourPElem = tourDiv.getElementsByTagName("p")[0];
    tourPElem.innerHTML = "Cosenza";
    cities.forEach(c => {
        // TODO: also send starting city
        tourPElem.innerHTML += " - " + c.substring(0, c.lastIndexOf(" "));
    });
    tourPElem.innerHTML += " - Cosenza";
    set_map(cities);
});