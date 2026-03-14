// Store all data in localStorage
let dashboardData = JSON.parse(localStorage.getItem("dashboardData")) || [];

// Function to save attendance
function saveAttendance(){
    const hostel = document.getElementById("hostelName").value.trim();
    const totalStrength = document.getElementById("totalStrength").value;
    const studentsPresent = document.getElementById("studentsPresent").value;
    const date = new Date().toLocaleDateString();

    if(!hostel || !totalStrength || !studentsPresent){
        alert("Please fill all attendance fields");
        return;
    }

    const attendanceEntry = {
        date,
        hostel,
        totalStrength,
        studentsPresent,
        foodItem:'',
        cooked:'',
        wasted:'',
        wastagePercent:''
    };

    dashboardData.push(attendanceEntry);
    localStorage.setItem("dashboardData", JSON.stringify(dashboardData));
    alert(`Attendance saved for ${hostel} on ${date}`);
    updateDashboard();
}

// Function to save wastage
function saveWastage(){
    const hostel = document.getElementById("hostelName").value.trim();
    const cooked = parseFloat(document.getElementById("cooked").value);
    const wasted = parseFloat(document.getElementById("wasted").value);
    const menuSelect = document.getElementById("menuItems");
    const selectedItems = Array.from(menuSelect.selectedOptions).map(opt => opt.value);
    const date = new Date().toLocaleDateString();

    if(!hostel || selectedItems.length === 0 || isNaN(cooked) || isNaN(wasted)){
        alert("Please fill all wastage fields and select at least one menu item");
        return;
    }

    const wastagePercent = (wasted / cooked) * 100;

    selectedItems.forEach(item=>{
        const wastageEntry = {
            date,
            hostel,
            totalStrength:'',
            studentsPresent:'',
            foodItem: item,
            cooked,
            wasted,
            wastagePercent: wastagePercent.toFixed(2)
        };
        dashboardData.push(wastageEntry);
    });

    localStorage.setItem("dashboardData", JSON.stringify(dashboardData));
    document.getElementById("result").innerText = `Wastage Recorded: ${wastagePercent.toFixed(2)}%`;
    updateDashboard();
}

// Function to update dashboard
function updateDashboard(){
    const tbody = document.getElementById("dashboardTable").querySelector("tbody");
    tbody.innerHTML = '';

    dashboardData.forEach(entry=>{
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${entry.date}</td>
            <td>${entry.hostel}</td>
            <td>${entry.totalStrength || '-'}</td>
            <td>${entry.studentsPresent || '-'}</td>
            <td>${entry.foodItem || '-'}</td>
            <td>${entry.cooked || '-'}</td>
            <td>${entry.wasted || '-'}</td>
            <td>${entry.wastagePercent || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Load dashboard on page load
updateDashboard();