document.addEventListener("DOMContentLoaded", function() {
    let data = document.getElementById("result-data").innerHTML;
    let dataJson = JSON.parse(data);
    console.log(dataJson);

});