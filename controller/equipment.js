let selectedEquipmentId = null;

function getJwtToken() {
    return localStorage.getItem('token');
}

function getFormData() {
    return {
        equipmentCode: $('#equipmentCode').val(),
        equipmentName: $('#equipmentName').val(),
        status: $('#status').val(),
        type: $('#type').val()
    };
}

function resetForm() {
    $('#equipmentForm')[0].reset();
    selectedEquipmentId = null; // Reset selected ID
}

function validateFormData(data) {
    if (!data.equipmentCode || !data.equipmentName || !data.status || !data.type) {
        alert("All fields are required.");
        return false;
    }
    return true;
}

function saveEquipment() {
    const equipmentData = getFormData();
    if (!validateFormData(equipmentData)) return;

    apiRequest(
        "http://localhost:5050/cropMonitor/api/v1/equipment",
        "POST",
        equipmentData,
        function () {
            alert("Equipment added successfully.");
            resetForm();
            getAllEquipment();
            $('#addEquipmentModal').modal('hide');
        },
        function (xhr) {
            alert(`Error adding equipment: ${xhr.responseText}`);
        }
    );
}

function updateEquipment() {
    const equipmentData = getFormData();
    if (!validateFormData(equipmentData)) return;
    const equipmentId = $('#equipmentId').val(); 

    apiRequest(
        `http://localhost:5050/cropMonitor/api/v1/equipment/${equipmentId}`,
        "PATCH",
        equipmentData,
        function () {
            alert("Equipment updated successfully.");
            resetForm();
            getAllEquipment();
            $('#addEquipmentModal').modal('hide');
        },
        function (xhr) {
            alert(`Error updating equipment: ${xhr.responseText}`);
        }
    );
}

function getAllEquipment() {
    apiRequest(
        "http://localhost:5050/cropMonitor/api/v1/equipment",
        "GET",
        null,
        function (response) {
            const tbody = $('.tBody');
            tbody.empty();
            response.forEach(equipment => {
                const row = `
                    <tr data-id="${equipment.id}">
                        <td><input type="checkbox"></td>
                        <td>${equipment.equipmentCode}</td>
                        <td>${equipment.equipmentName}</td>
                        <td>${equipment.status}</td>
                        <td>${equipment.type}</td>
                        <td>
                            <button class="btn btn-warning btn-sm" onclick="openModalForEdit(${equipment.id})">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteEquipment(${equipment.id})">Delete</button>
                        </td>
                    </tr>
                `;
                tbody.append(row);
            });
        },
        function (xhr) {
            alert(`Failed to fetch equipment: ${xhr.responseText}`);
        }
    );
}

function deleteEquipment(id) {
   
    console.log("Deleting equipment with id: " + id);  // Debugging log
    $.ajax({
        url: `http://localhost:5050/cropMonitor/api/v1/equipment/${id}`,
        type: 'DELETE',
        success: function(response) {
            console.log("Equipment deleted successfully");
        },
        error: function(xhr, status, error) {
            console.log("Error: " + error);
        }
    });
}

function openModalForEdit(id) {
    apiRequest(
        `http://localhost:5050/cropMonitor/api/v1/equipment/${id}`,
        "GET",
        null,
        function (response) {
            $('#equipmentCode').val(response.equipmentCode);
            $('#equipmentName').val(response.equipmentName);
            $('#status').val(response.status);
            $('#type').val(response.type);

            selectedEquipmentId = id;
            $('#addEquipmentModal').modal('show');
        },
        function (xhr) {
            alert(`Failed to fetch equipment details: ${xhr.responseText}`);
        }
    );
}

function apiRequest(url, method, data, successCallback, errorCallback) {
    const token = getJwtToken();
    if (!token) {
        alert("JWT token missing or invalid.");
        return;
    }

    $.ajax({
        url: url,
        method: method,
        contentType: "application/json",
        headers: { Authorization: `Bearer ${token}` },
        data: JSON.stringify(data),
        success: successCallback,
        error: errorCallback
    });
}

$(document).ready(function () {
    getAllEquipment();

    $('#addEquipmentModal').on('show.bs.modal', function () {
        if (selectedEquipmentId) {
            $('.btn-primary').hide();
            $('.btn-info').show();
        } else {
            $('.btn-primary').show();
            $('.btn-info').hide();
        }
    });
});
