document.addEventListener("DOMContentLoaded", () => {
    addParticipant("Franzi", "340€", "Tropea (89861): 8, Scilla (89058): 3, Reggio (89135): -2");
    addParticipant("Kerstin", "420€", "Scilla (89058): 7, Catanzaro (88100): 2, Tropea (89861): 1");
    addParticipant("Ruth", "370€", "Tropea (89861): 7, Reggio (89135): 5, Scilla (89058): -3");
})

function addParticipant(name = null, budget = null, preferences = null) {
    if (name === null || budget === null || preferences === null) {
        name = document.getElementById("name").value.trim();
        budget = document.getElementById("budget").value.trim();
        preferences = document.getElementById("preferences").value.trim();
    }
    let participantP = document.createElement("p");
    let nameSpan = document.createElement("span");
    nameSpan.innerHTML = name;
    nameSpan.className = "name";
    let budgetSpan = document.createElement("span");
    budgetSpan.innerHTML = budget;
    budgetSpan.className = "budget";
    let prefSpan = document.createElement("span");
    prefSpan.innerHTML = preferences;
    prefSpan.className = "preferences";
    participantP.appendChild(nameSpan);
    participantP.appendChild(document.createTextNode(" ("));
    participantP.appendChild(budgetSpan);
    participantP.appendChild(document.createTextNode(") - {"));
    participantP.appendChild(prefSpan);
    participantP.appendChild(document.createTextNode("}"));

    let participantListDiv = document.getElementById("participant-list");

    let deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "X";
    deleteBtn.className = "small-action";
    deleteBtn.addEventListener('click',() => participantListDiv.removeChild(participantDiv));

    let participantDiv = document.createElement("div");
    participantDiv.appendChild(participantP);
    participantDiv.appendChild(deleteBtn);

    participantListDiv.appendChild(participantDiv);
}

function clearList() {
    let participantListDiv = document.getElementById("participant-list");
    while (participantListDiv.firstChild) {
        participantListDiv.removeChild(participantListDiv.lastChild);
    }
}