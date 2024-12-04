$(document).ready(function() {
    // When the page loads, fetch all equipment data
    getAllEquipment();
});

// Save JWT token to localStorage after successful login
function storeJwtToken(token) {
    localStorage.setItem('jwtToken', token);  
    console.log("JWT token saved:", token);  
}

// Retrieve JWT token from localStorage
function getJwtToken() {
    const token = localStorage.getItem('jwtToken');
    console.log("JWT token retrieved:", token);  
    return token;
}

// Decode JWT token to check expiry
function decodeJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// Check if JWT token exists and is valid (not expired)
function checkJwtToken() {
    const token = getJwtToken();
    console.log("Checking JWT token...");  

    if (!token) {
        alert("JWT token missing or invalid. Please log in.");
        window.location.href = "../pages/index.html";  // Redirect to login page
        return null;
    }

    const decoded = decodeJwt(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
        alert("JWT token expired. Please log in again.");
        localStorage.removeItem('jwtToken');  // Remove expired token
        window.location.href = "../pages/index.html";  
        return null;
    }

    return token;
}

// Save new equipment
function saveEquipment() {
    const equipmentData = getFormData();
    const token = checkJwtToken();  // Ensure token is valid

    if (equipmentData && token) {
        $.ajax({
            url: `http://localhost:5050/cropMonitor/api/v1/equipment`,
            method: "POST",
            contentType: "application/json",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(equipmentData),
            success: function () {
                alert("Equipment added successfully.");
                resetForm();
                getAllEquipment();
                $('#addEquipmentModal').modal('hide');
            },
            error: function () {
                alert("Error adding equipment.");
            }
        });
    }
}

// Update existing equipment
function updateEquipment() {
    const equipmentData = getFormData();
    const equipmentCode = $('#equipmentCode').val(); // Fetch the code or ID

    $.ajax({
        url: `http://localhost:5050/cropMonitor/api/v1/equipment/${equipmentCode}`,
        method: "PATCH",
        contentType: "application/json",
        data: JSON.stringify(equipmentData),
        success: function () {
            alert("Equipment updated successfully.");
        },
        error: function (xhr) {
            console.error("Error updating equipment:", xhr.responseText);
        }
    });
}

// Delete equipment
function deleteEquipment() {
    const equipmentCode = $('#equipmentCode').val(); 
    const token = checkJwtToken();  

    if (equipmentCode && token) {
        $.ajax({
            url: `http://localhost:5050/cropMonitor/api/v1/equipment/${equipmentCode}`,
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            success: function () {
                alert("Equipment deleted successfully.");
                resetForm();
                getAllEquipment();
                $('#addEquipmentModal').modal('hide');
            },
            error: function () {
                alert("Error deleting equipment.");
            }
        });
    }
}

// Fetch all equipment
function getAllEquipment() {
    const token = checkJwtToken();  

    if (token) {
        $.ajax({
            url:"http://localhost:5050/cropMonitor/api/v1/equipment",
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            success: function (data) {
                let tableBody = '';
                data.forEach(equipment => {
                    tableBody += `<tr>
                        <td><input type="checkbox" class="equipment-checkbox" data-id="${equipment.id}"></td>
                        <td>${equipment.equipmentCode}</td>
                        <td>${equipment.equipmentName}</td>
                        <td>${equipment.status}</td>
                        <td>${equipment.type}</td>
                    </tr>`;
                });
                $('.tBody').html(tableBody);
            },
            error: function () {
                alert("Error fetching equipment data.");
            }
        });
    }
}

// Get form data
function getFormData() {
    return {
        equipmentCode: $('#equipmentCode').val(),
        equipmentName: $('#equipmentName').val(),
        status: $('#status').val(),
        type: $('#type').val()
    };
}

// Reset form after save/update
function resetForm() {
    $('#equipmentCode').val('');
    $('#equipmentName').val('');
    $('#status').val('');
    $('#type').val('');
}

// Search equipment
function search() {
    const searchQuery = $('#searchInput').val();
    const token = checkJwtToken();  

    if (searchQuery && token) {
        $.ajax({
            url: `http://localhost:5050/cropMonitor/api/v1/equipment/search?query=${searchQuery}`,
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            success: function (data) {
                let tableBody = '';
                data.forEach(equipment => {
                    tableBody += `<tr>
                        <td><input type="checkbox" class="equipment-checkbox" data-id="${equipment.id}"></td>
                        <td>${equipment.equipmentCode}</td>
                        <td>${equipment.equipmentName}</td>
                        <td>${equipment.status}</td>
                        <td>${equipment.type}</td>
                         <td>
                        <button class="btn btn-warning btn-sm" onclick="editCrop('${equipment.equipmentCode}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteCrop('${equipment.equipmentCode}')">Delete</button>
                    </td>
                    </tr>`;
                });
                $('.tBody').html(tableBody);
            },
            error: function () {
                alert("Error searching equipment.");
            }
        });
    }
}
