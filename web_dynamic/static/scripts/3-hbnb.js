$(document).ready(function () {
    // Request to check API status
    $.get("http://0.0.0.0:5001/api/v1/status/", function (data) {
        if (data.status === "OK") {
            $('#api_status').addClass('available');
        } else {
            $('#api_status').removeClass('available');
        }
    });

    // Handle amenity selection
    const selectedAmenities = {};

    $('input[type="checkbox"]').change(function () {
        const amenityId = $(this).attr('data-id');
        const amenityName = $(this).attr('data-name');

        if ($(this).is(':checked')) {
            selectedAmenities[amenityId] = amenityName;
        } else {
            delete selectedAmenities[amenityId];
        }

        const amenitiesList = Object.values(selectedAmenities).join(', ');
        $('.amenities h4').text(amenitiesList);
    });

    // Send POST request to /places_search/ to fetch places
    $.ajax({
        url: "http://0.0.0.0:5001/api/v1/places_search",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({}),  // Send an empty dictionary in the body
        success: function (places) {
            // Clear previous places
            $('section.places').empty();

            // Loop through the list of places and create article tags
            places.forEach(function (place) {
                const article = $('<article>');

                // Create and append the title box
                const titleBox = $('<div>').addClass('title_box');
                const name = $('<h2>').text(place.name);
                const priceByNight = $('<div>').addClass('price_by_night').text(`$${place.price_by_night}`);
                titleBox.append(name, priceByNight);
                article.append(titleBox);

                // Create and append the information box
                const information = $('<div>').addClass('information');
                const maxGuest = $('<div>').addClass('max_guest').text(`${place.max_guest} Guests`);
                const numberRooms = $('<div>').addClass('number_rooms').text(`${place.number_rooms} Bedrooms`);
                const numberBathrooms = $('<div>').addClass('number_bathrooms').text(`${place.number_bathrooms} Bathrooms`);
                information.append(maxGuest, numberRooms, numberBathrooms);
                article.append(information);

                // Create and append the description
                const description = $('<div>').addClass('description').html(place.description);
                article.append(description);

                // Append the article to the section.places
                $('section.places').append(article);
            });
        },
        error: function (error) {
            console.error('Error:', error);
        }
    });
});
