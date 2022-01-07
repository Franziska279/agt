function addParticipant() {
    // TODO: should we validate user input?
    let name = document.getElementById("name").value.trim();
    let budget = document.getElementById("budget").value.trim();
    let preferences = document.getElementById("preferences").value.trim();

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