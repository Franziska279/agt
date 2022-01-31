function showHideDebugLog() {
    let debugDiv = document.getElementById("debug-log");
    if (debugDiv.style.display === "block") {
        debugDiv.style.display = "none";
    } else {
        debugDiv.style.display = "block";
    }
}