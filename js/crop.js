let selectedRow = null; // Global variable to track selected row

document.addEventListener("DOMContentLoaded", () => {
    getAllCrops();
});

// Save new crop
function saveCrop() {
    const cropData = getCropData();

    if (cropData && selectedRow === null) {
        const formData = new FormData();

        // Append regular form data
        formData.append('cropCode', cropData.cropCode);
        formData.append('commonName', cropData.commonName);
        formData.append('scientificName', cropData.scientificName);
        formData.append('category', cropData.category);
        formData.append('cropSeason', cropData.cropSeason);
        formData.append('fieldCode', cropData.fieldCode);

        // Append image files if available
        const imageFile = $('#image')[0].files[0];
        if (imageFile) formData.append('image', imageFile);

        $.ajax({
            url: "http://localhost:5050/cropMonitor/api/v1/crops",  
            method: "POST",
            data: formData,
            processData: false,  // Prevent jQuery from processing the data
            contentType: false,  // Let the browser set the content type for file uploads
            success: function () {
                alert("Crop added successfully.");
                resetForm();
                getAllCrops();
            },
            error: function () {
                alert("Error adding crop.");
            }
        });
    }
}

// Update existing crop
function updateCrop() {
    const cropData = getCropData();

    if (cropData && selectedRow !== null) {
        const formData = new FormData();
        const cropCode = $(selectedRow).find("td:eq(1)").text();  // Get crop code for the update

        // Append regular form data
        formData.append('cropCode', cropData.cropCode);
        formData.append('commonName', cropData.commonName);
        formData.append('scientificName', cropData.scientificName);
        formData.append('category', cropData.category);
        formData.append('cropSeason', cropData.cropSeason);
        formData.append('fieldCode', cropData.fieldCode);

        // Append image files if available
        const imageFile = $('#image')[0].files[0];
        if (imageFile) formData.append('image', imageFile);

        $.ajax({
            url: `http://localhost:5050/cropMonitor/api/v1/crops/${cropCode}`,  
            method: "PATCH",
            data: formData,
            processData: false,  // Prevent jQuery from processing the data
            contentType: false,  // Let the browser set the content type for file uploads
            success: function () {
                alert("Crop updated successfully.");
                resetForm();
                getAllCrops();
                $('#addCropModal').modal('hide');
            },
            error: function () {
                alert("Error updating crop.");
            }
        });
    }
}

// Fetch all crops data
function getAllCrops() {
    $.ajax({
        url: "http://localhost:5050/cropMonitor/api/v1/crops", 
        method: "GET",
        success: function (response) {
            const tbody = $('table tbody');
            tbody.empty();

            response.forEach(crop => {
                const row = `
                <tr data-id="${crop.cropCode}">
                    <td><input type="checkbox"></td>
                    <td>${crop.cropCode}</td>
                    <td>${crop.commonName}</td>
                    <td>${crop.scientificName}</td>
                    <td>${crop.category}</td>
                    <td>${crop.cropSeason || 'N/A'}</td>
                    <td>${crop.fieldCode}</td>
                    <td>${crop.image ? `<img src="${crop.image}" alt="Crop Image" width="50" height="50">` : 'N/A'}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editCrop('${crop.cropCode}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteCrop('${crop.cropCode}')">Delete</button>
                    </td>
                </tr>
            `;
                tbody.append(row);
            });
        },
        error: function (error) {
            console.error("Error:", error);
            alert("Failed to fetch crops data.");
        }
    });
}

// Edit Crop (populate form with data for editing)
function editCrop(cropCode) {
    $.ajax({
        url: `http://localhost:5050/cropMonitor/api/v1/crops/${cropCode}`,
        method: "GET",
        success: function (crop) {
            // Populate form with existing data
            $('#cropCode').val(crop.cropCode);
            $('#commonName').val(crop.commonName);
            $('#scientificName').val(crop.scientificName);
            $('#category').val(crop.category);
            $('#cropSeason').val(crop.cropSeason);
            $('#fieldCode').val(crop.fieldCode);

            // Set the new logCode field value
            $('#logCode').val(crop.logCode || ''); // Set logCode if available, otherwise empty

            // Reset image input and show preview if available
            $('#image').val('');
            if (crop.cropImage) {
                $('#image').html(`<img src="${crop.cropImage}" alt="Crop Image" width="100" height="100">`);
            } else {
                $('#image').html('');
            }

            $('#addCropModal').modal('show');
        },
        error: function (error) {
            console.error("Error:", error);
            alert("Failed to fetch crop details.");
        }
    });
}

// Delete Crop
function deleteCrop(cropCode) {
    if (confirm("Are you sure you want to delete this crop?")) {
        $.ajax({
            url: `http://localhost:5050/cropMonitor/api/v1/crops/${cropCode}`,  
            method: "DELETE",
            success: function () {
                alert("Crop deleted successfully!");
                getAllCrops();
            },
            error: function (error) {
                console.error("Error:", error);
                alert("Failed to delete crop.");
            }
        });
    }
}

// Get data from the form
function getCropData() {
    return {
        cropCode: $('#cropCode').val(),
        commonName: $('#commonName').val(),
        scientificName: $('#scientificName').val(),
        category: $('#category').val(),
        cropSeason: $('#cropSeason').val(),
        fieldCode: $('#fieldCode').val()
    };
}

// Reset form
function resetForm() {
    $('#cropForm')[0].reset();
    selectedRow = null;
    $('#cropImagePreview').html('');
}

// Initialize the application
$(document).ready(function () {
    getAllCrops();
});
