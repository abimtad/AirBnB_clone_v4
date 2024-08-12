$(document).ready(function () {
    // Check API status
    $.get("http://0.0.0.0:5001/api/v1/status/", function (data) {
        if (data.status === "OK") {
            $('#api_status').addClass('available');
        } else {
            $('#api_status').removeClass('available');
        }
    });

    const selectedAmenities = {};
    const selectedLocations = {
        states: {},
        cities: {}
    };

    // Handle amenity selection
    $('input[type="checkbox"][data-type="amenity"]').change(function () {
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

    // Handle state and city selection
    $('input[type="checkbox"][data-type="state"], input[type="checkbox"][data-type="city"]').change(function () {
        const locationId = $(this).attr('data-id');
        const locationName = $(this).attr('data-name');
        const locationType = $(this).attr('data-type');

        if ($(this).is(':checked')) {
            selectedLocations[locationType + 's'][locationId] = locationName;
        } else {
            delete selectedLocations[locationType + 's'][locationId];
        }

        const statesList = Object.values(selectedLocations.states).join(', ');
        const citiesList = Object.values(selectedLocations.cities).join(', ');
        const locationList = statesList + (statesList && citiesList ? ', ' : '') + citiesList;
        $('.locations h4').text(locationList);
    });

    // Function to fetch and display places based on selected filters
    function fetchPlaces(data) {
        $.ajax({
            url: "http://0.0.0.0:5001/api/v1/places_search",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (places) {
                $('section.places').empty();

                places.forEach(function (place) {
                    const article = $('<article>');

                    const titleBox = $('<div>').addClass('title_box');
                    const name = $('<h2>').text(place.name);
                    const priceByNight = $('<div>').addClass('price_by_night').text(`$${place.price_by_night}`);
                    titleBox.append(name, priceByNight);
                    article.append(titleBox);

                    const information = $('<div>').addClass('information');
                    const maxGuest = $('<div>').addClass('max_guest').text(`${place.max_guest} Guests`);
                    const numberRooms = $('<div>').addClass('number_rooms').text(`${place.number_rooms} Bedrooms`);
                    const numberBathrooms = $('<div>').addClass('number_bathrooms').text(`${place.number_bathrooms} Bathrooms`);
                    information.append(maxGuest, numberRooms, numberBathrooms);
                    article.append(information);

                    const description = $('<div>').addClass('description').html(place.description);
                    article.append(description);

                    $('section.places').append(article);
                });
            },
            error: function (error) {
                console.error('Error:', error);
            }
        });
    }

    // Initial fetch of all places
    fetchPlaces({});

    // Handle the Search button click
    $('button').click(function () {
        const data = {
            amenities: Object.keys(selectedAmenities),
            states: Object.keys(selectedLocations.states),
            cities: Object.keys(selectedLocations.cities)
        };

        fetchPlaces(data);
    });

    // Handle Reviews toggle
    $('#toggle_reviews').click(function () {
        const reviewList = $('#review_list');

        if ($(this).text() === 'show') {
            // Fetch and display reviews
            $.get("http://0.0.0.0:5001/api/v1/reviews", function (reviews) {
                reviewList.empty();  // Clear any existing reviews
                reviews.forEach(function (review) {
                    const reviewElement = $('<li>');
                    reviewElement.html(`
                        <strong>${review.user}</strong> - ${review.date}<br>
                        ${review.text}
                    `);
                    reviewList.append(reviewElement);
                });
                reviewList.show();
                $('#toggle_reviews').text('hide');
            });
        } else {
            // Hide reviews and clear them from the DOM
            reviewList.hide();
            reviewList.empty();
            $('#toggle_reviews').text('show');
        }
    });
});
