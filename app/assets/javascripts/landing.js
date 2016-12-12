$(document).on('ready', initialize);

function initialize() {
	$('#search-button').on('click', fetchTrips);
}

function fetchTrips(event) {
	event.preventDefault();
	$('.map-area').css('visibility', 'visible');
  var country = {country: $('#country').val()};

  $.ajax({
    type: "POST",
    url: "/api/search",
    data: country,
    success: initMap,
    error: handleError
  });
}

function initMap(response) {
	var tripsArray = response;
	console.log(tripsArray.country);

	if (tripsArray.country) {//sets map on country if no results for API query

		var map = new google.maps.Map(document.getElementById('map'), {
			zoom: 5,
			center: {lat: -34.397, lng: 150.644}
		});

		var geocoder = new google.maps.Geocoder();

		geocoder.geocode( {'address' : tripsArray.country}, function(results, status) {
	    if (status == google.maps.GeocoderStatus.OK) {
	        map.setCenter(results[0].geometry.location);
	    }
		});

		swal({
		  title: 'No trips here yet!',
		  html: $('<div>')
		    .addClass('some-class')
		    .text('Want to create one?'),
		  animation: false,
		  customClass: 'animated tada'
		})
	};

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 5,
    center: new google.maps.LatLng(tripsArray[0].origin_lat, tripsArray[0].origin_lng)
  });

	tripsArray.forEach(function(trip) {
		var flightPlanCoordinates = [];
		var originCoordinates = {
			lat: trip.origin_lat,
			lng: trip.origin_lng
		};
		var destinationCoordinates = {
			lat: trip.destination_lat,
			lng: trip.destination_lng
		};

		flightPlanCoordinates.unshift(originCoordinates);
		flightPlanCoordinates.push(destinationCoordinates);

	  var flightPath = new google.maps.Polyline({
	    path: flightPlanCoordinates,
	    geodesic: true,
	    strokeColor: colorTrip(trip),
	    strokeOpacity: 1.0,
	    strokeWeight: 2
	  });

		var marker = new google.maps.Marker({
	    position: destinationCoordinates,
	    map: map,
			title: 'Surftrip'
	  });
		marker.addListener('click', function swalAlert() {

			swal({
			  title: 'Trip to ' + trip.destination,
			  input: 'text',
				html:
				'<div class="row created-trips">' +
		    '<div class="panel panel-default panel-primary">' +
				'<div class="panel-heading">Trip Details' +
		    '<div class="panel-body">' +
          '<p><b>Leaving from: </b>' + trip.origin + '</p>' +
					'<p><b>Kind of trip: </b>' + trip.kind_of_trip + '</p>' +
					'<p><b>Level: </b>' + trip.level + '</p>' +
					'<p><b>Price: </b>' + trip.price + '</p>' +
					'<p><b>Departing: </b>' + trip.start_date + '</p>' +
					'<p><b>Coming back: </b>' + trip.finish_date + '</p>' +
					'<p><b>Empty seats: </b>' + trip.max_users + '</p>' +
					'<p><b>Board Space: </b>' + trip.space_material + '</p>' +
					'<p><b>Description: </b>' + trip.description + '</p>' +
	        '</div>' +
				'</div>' +
			'</div>' +
			'<div class="row created-trips">' +
				"<p>Want to join?</p>" +
				"Message:" +
			'</div>',
			  showCancelButton: true,
			  confirmButtonText: 'Send Request',
			  showLoaderOnConfirm: true,
			  preConfirm: function (comment) {
			    return new Promise(function (resolve) {
						var tripData = {trip_id: trip.id, comment: comment};
							$.ajax({
								type: "POST",
								url: "/requests/create",
								data: tripData,
								success: function(response){
									resolve(response);
								}
							});
						})
			    }
			}).then(function (response) {
				console.log(response);
				if (response.status === 5) {
					swal({
					  title: 'You have already requested to join this trip',
						type: 'warning',
					  text: "",
					  timer: 2000
					})
				}
				else if (response.status === 4) {
					swal({
					  title: 'Trip Full!',
						type: 'warning',
					  text: "Sorry but it looks like they're ready to go..",
					  timer: 2000
					}).then(
					  function () {},
					  // handling the promise rejection
					  function (dismiss) {
					    if (dismiss === 'timer') {
					      console.log('I was closed by the timer')
					    }
						}
					)
				}
				else if (response.status === 3)
				  swal({
				    type: 'success',
				    title: 'Successfully requested to join this trip!',
				    html: 'Once accepted he will get in touch with you.'
				  })
				else if (response.status === 2) {
					swal({
					  title: '<u>Please Log In</u>',
					  type: 'info',
					  html:
					    'You must be logged in to join a trip!<br><br> ' +
							'Not registered yet? ' +
							'<a href="/users/sign_up">Register</a>',
					  showCloseButton: true,
					  showCancelButton: true,
					  confirmButtonText:
					    '<a class="fa fa-thumbs-up"></a> Log In!',
					  cancelButtonText:
					    '<i class="fa fa-thumbs-down">Not now</i>'
					}).then(function () {
						window.location = '/users/sign_in';
					})
				} else {
					swal({
					  title: 'You are the owner of this trip!',
						type: 'warning',
					  text: 'We know you want to surf, but give others a chance...',
					  timer: 2000
					}).then(
					  function () {},
					  // handling the promise rejection
					  function (dismiss) {
					    if (dismiss === 'timer') {
					      console.log('I was closed by the timer')
					    }
					  }
					)
				}
			})
		});
	  flightPath.setMap(map);
	});
}

function handleError (error) {
    console.log(error);
    console.log("error", error.responseText);
};

function colorTrip(trip) {
	if (trip.level === "Beginner") {
		return "rgb(39, 139, 31)"
	}
	else if (trip.level === "Intermediate") {
		return "rgb(230, 110, 29)"
	}
	else if (trip.level === "Advanced") {
		return "rgb(181, 9, 9)"
	}
	else {
		return "rgb(0, 0, 0)"
	}
}



// function getLatLng(response){
//
//   var tripsArray = response;//assign response to variable
//   var geocoder   = new google.maps.Geocoder();
// 	var countryCoordinatesArray = [];
//
// 	tripsArray.forEach(function(trip) {//loop over trip array
// 		var origin = new Promise(function (resolve, reject) {//Promise1
// 			geocoder.geocode( { //get origin coordinates for trip
// 		    'address': trip.origin},
// 		    function(results, status) {
// 					if (status == google.maps.GeocoderStatus.OK) {
// 						var latLng = {
// 							lat: results[0].geometry.location.lat(),
// 							lng: results[0].geometry.location.lng(),
// 						};
//
// 						resolve(latLng);
// 					} else {
// 						reject(status);
// 					}
// 		  });
// 		});
//
// 		var destination = new Promise(function (resolve, reject) {//save in a promise
// 			geocoder.geocode( { //get origin coordinates for trip
// 		    'address': trip.destination},
// 		    function(results, status) {
// 					if (status == google.maps.GeocoderStatus.OK) {
// 						var latLng = {
// 							lat: results[0].geometry.location.lat(),
// 							lng: results[0].geometry.location.lng(),
// 						};
//
// 						resolve(latLng);
// 					} else {
// 						reject(status);
// 					}
// 		  });
// 		});
//
// 		Promise.all([
// 			origin,//promise 1
// 			destination//promise 2
// 		]).then(function([origin, destination]) {
// 			var tripCoordinates = {
// 				origin: origin,
// 				destination: destination
// 			};
// 			countryCoordinatesArray.push(tripCoordinates);
// 			initMap(countryCoordinatesArray);
// 		}).catch(function (error) {
// 			console.log("Promise error", error);
// 		});
// 	});
// };
