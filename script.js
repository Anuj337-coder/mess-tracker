function saveAttendance(){

let date = document.getElementById("date").value
let meal = document.getElementById("meal").value
let students = document.getElementById("students").value

alert("Attendance Saved\nDate: "+date+"\nMeal: "+meal+"\nStudents: "+students)

}

function calculateWaste(){

let cooked = document.getElementById("cooked").value
let wasted = document.getElementById("wasted").value

let wastePercent = (wasted / cooked) * 100

document.getElementById("result").innerHTML =
"Wastage Percentage: " + wastePercent.toFixed(2) + "%"

}