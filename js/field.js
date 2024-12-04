let selectedRow = null;

document.addEventListener("DOMContentLoaded", () => {
    getAllFields();
});

// Save new field
function saveField() {
    const fieldData = getFieldData();

    if (fieldData && selectedRow === null) {
        const formData = new FormData();

        // Append regular form data
        formData.append('fieldCode', fieldData.fieldCode);
        formData.append('fieldName', fieldData.fieldName);
        formData.append('fieldSize', fieldData.fieldSize);
        formData.append('latitude', fieldData.latitude); // Latitude for fieldLocation
        formData.append('longitude', fieldData.longitude); // Longitude for fieldLocation
        formData.append('equipmentCode', fieldData.equipmentCode);

        // Append image files if available
        const img1 = $('#fieldImage1')[0].files[0];
        const img2 = $('#fieldImage2')[0].files[0];

        if (img1) formData.append('fieldImage1', img1);
        if (img2) formData.append('fieldImage2', img2);

        $.ajax({
            url: "http://localhost:5050/cropMonitor/api/v1/field",
            method: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function () {
                alert("Field added successfully.");
                resetForm();
                getAllFields();
            },
            error: function () {
                alert("Error adding field.");
            }
        });
    } else {
        alert("Please ensure all fields are correctly filled out.");
    }
}

// Update existing field
function updateField() {
    const fieldData = getFieldData();

    if (fieldData && selectedRow !== null) {
        const formData = new FormData();
        const fieldCode = $(selectedRow).find("td:eq(1)").text(); // Get field code for the update

        // Append regular form data
        formData.append('fieldCode', fieldData.fieldCode);
        formData.append('fieldName', fieldData.fieldName);
        formData.append('fieldSize', fieldData.fieldSize);
        formData.append('latitude', fieldData.latitude); // Latitude for fieldLocation
        formData.append('longitude', fieldData.longitude); // Longitude for fieldLocation
        formData.append('equipmentCode', fieldData.equipmentCode);

        // Append image files if available
        const img1 = $('#fieldImage1')[0].files[0];
        const img2 = $('#fieldImage2')[0].files[0];

        if (img1) formData.append('fieldImage1', img1);
        if (img2) formData.append('fieldImage2', img2);

        $.ajax({
            url: `http://localhost:5050/cropMonitor/api/v1/field/${fieldCode}`,
            method: "PATCH",
            data: formData,
            processData: false,
            contentType: false,
            success: function () {
                alert("Field updated successfully.");
                resetForm();
                getAllFields();
                $('#addFieldModal').modal('hide');
            },
            error: function () {
                alert("Error updating field.");
            }
        });
    }
}

// Fetch all fields data
function getAllFields() {
    $.ajax({
        url: "http://localhost:5050/cropMonitor/api/v1/field",
        method: "GET",
        success: function (response) {
            const tbody = $('table tbody');
            tbody.empty();

            response.forEach(field => {
                const fieldLocation = field.fieldLocation
                    ? `${field.fieldLocation.x}, ${field.fieldLocation.y}`
                    : 'N/A';

                const row = `
                    <tr data-id="${field.fieldCode}">
                        <td><input type="checkbox"></td>
                        <td>${field.fieldCode}</td>
                        <td>${field.fieldName}</td>
                        <td>${field.fieldSize}</td>
                        <td>${fieldLocation}</td>
                        <td>${field.fieldImage1 ? `<img src="${field.fieldImage1}" alt="Image 1" width="50" height="50">` : 'N/A'}</td>
                        <td>${field.fieldImage2 ? `<img src="${field.fieldImage2}" alt="Image 2" width="50" height="50">` : 'N/A'}</td>
                        <td>${field.equipmentCode}</td>
                        <td>
                            <button class="btn btn-warning btn-sm" onclick="editField('${field.fieldCode}')">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteField('${field.fieldCode}')">Delete</button>
                        </td>
                    </tr>
                `;
                tbody.append(row);
            });
        },
        error: function (error) {
            console.error("Error:", error);
            alert("Failed to fetch fields data.");
        }
    });
}

// Edit Field (populate form with data for editing)
function editField(fieldCode) {
    $.ajax({
        url: `http://localhost:5050/cropMonitor/api/v1/field/${fieldCode}`,
        method: "GET",
        success: function (field) {
            $('#fieldCode').val(field.fieldCode);
            $('#fieldName').val(field.fieldName);
            $('#fieldSize').val(field.fieldSize);
            $('#latitude').val(field.fieldLocation ? field.fieldLocation.x : '');
            $('#longitude').val(field.fieldLocation ? field.fieldLocation.y : '');
            $('#equipmentCode').val(field.equipmentCode);

            $('#fieldImage1').val('');
            $('#fieldImage2').val('');

            if (field.fieldImage1) {
                $('#img1Preview').html(`<img src="${field.fieldImage1}" alt="Image 1" width="100" height="100">`);
            } else {
                $('#img1Preview').html('');
            }

            if (field.fieldImage2) {
                $('#img2Preview').html(`<img src="${field.fieldImage2}" alt="Image 2" width="100" height="100">`);
            } else {
                $('#img2Preview').html('');
            }

            $('#addFieldModal').modal('show');
        },
        error: function (error) {
            console.error("Error:", error);
            alert("Failed to fetch field details.");
        }
    });
}

// Delete Field
function deleteField(fieldCode) {
    if (confirm("Are you sure you want to delete this field?")) {
        $.ajax({
            url: `http://localhost:5050/cropMonitor/api/v1/field/${fieldCode}`,
            method: "DELETE",
            success: function () {
                alert("Field deleted successfully!");
                getAllFields();
            },
            error: function (error) {
                console.error("Error:", error);
                alert("Failed to delete field.");
            }
        });
    }
}

// Get data from the form
function getFieldData() {
    let fieldSizeInput = $('#fieldSize').val().trim();  // Remove spaces
    const fieldSize = parseFloat(fieldSizeInput);

    // Validate if the fieldSize is a valid number and greater than 0
    if (isNaN(fieldSize) || fieldSize <= 0) {
        alert("Please enter a valid field size.");
        return null;
    }

    return {
        fieldCode: $('#fieldCode').val(),
        fieldName: $('#fieldName').val(),
        fieldSize: fieldSize,  // now it's validated
        latitude: parseFloat($('#latitude').val()),
        longitude: parseFloat($('#longitude').val()),
        equipmentCode: $('#equipmentCode').val()
    };
}

// Reset form
function resetForm() {
    $('#fieldForm')[0].reset();
    selectedRow = null;
    $('#img1Preview').html('');
    $('#img2Preview').html('');
}

// Initialize the application
$(document).ready(function () {
    getAllFields();
});
