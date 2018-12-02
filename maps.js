function initMap() {

    var styledMapType = new google.maps.StyledMapType(
      [ { "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [ { "color": "#444444" } ] }, { "featureType": "landscape", "elementType": "all", "stylers": [ { "color": "#f2f2f2" } ] }, { "featureType": "poi", "elementType": "all", "stylers": [ { "visibility": "off" } ] }, { "featureType": "road", "elementType": "all", "stylers": [ { "saturation": -100 }, { "lightness": 45 } ] }, { "featureType": "road.highway", "elementType": "all", "stylers": [ { "visibility": "simplified" } ] }, { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [ { "visibility": "off" } ] }, { "featureType": "transit", "elementType": "all", "stylers": [ { "visibility": "off" } ] }, { "featureType": "transit.station.airport", "elementType": "geometry.fill", "stylers": [ { "visibility": "on" } ] }, { "featureType": "water", "elementType": "all", "stylers": [ { "color": "#46bcec" }, { "visibility": "on" } ] } ]  , {name: 'Styled Map'});

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: {lat: 39.8283,  lng: -98.5795}
    });

    // Airports
    const features = [
        {
          position: new google.maps.LatLng(41.938889, -72.683222),
          label: "BDL"
        }, {
          position: new google.maps.LatLng(42.364347, -71.005181), 
          label: "BOS"     
        }, {
          position: new google.maps.LatLng(40.639751, -73.778925),
          label: "JFK",
          string: "jetBlue minted flights: 1, seasonal flights: 1, luxury cars: 16, economy cars: 84"
        }, {
          position: new google.maps.LatLng(39.861656, -104.673178),
          label: "DEN",
          string: "jetBlue minted flights: 1, seasonal flights: 0, luxury cars: 20, economy cars: 80"        
        }, {
          position: new google.maps.LatLng(33.7716325, -116.563947),
          label: "PSP"      
        },{
          position: new google.maps.LatLng(26.072583, -80.15275),
          label: "FLL",
          string: "jetBlue minted flights: 1	seasonal flights: 0,	luxury cars: 1, economy cars:	99"	
        }, {
          position: new google.maps.LatLng(36.080056, -115.15225), 
          label: "LAS"          
        }, {
          position: new google.maps.LatLng(33.942536, -118.408075),
          label: "LAX"           
        },{
          position: new google.maps.LatLng(41.978603, -87.904842),
          label: "ORD"           
        }, {
          position: new google.maps.LatLng(32.733556, -117.189667),
          label: "SAN"            
        }, {
          position: new google.maps.LatLng(47.449, -122.309306),
          label: "SEA"            
        }, {
          position: new google.maps.LatLng(37.618972, -122.374889),
          label: "SFO"            
        }
      ];


      // Create airport markers
      features.forEach(function(feature) {
        
        var infowindow = new google.maps.InfoWindow({
          content: feature.string
        });

        var marker = new google.maps.Marker({
          position: feature.position,
          map: map,
          label: feature.label
        });

        marker.addListener('click', function() {
          infowindow.open(map, marker);
        });
      });


    // ======================== POINT 2 ===================================
        var contentString = 
        '<h3>2017 TESLA Model X</h3>' + 
        '<p>id: a8858399-d3ac-4968-a846-2968b65ce9dc</p>';

    var infowindow2 = new google.maps.InfoWindow({
        content: contentString
    });

    var marker2 = new google.maps.Marker({
        position: {lat: 38.811851501464844, lng: -108.9137191772461},
        map: map
    });

    marker2.addListener('click', function() {
        infowindow2.open(map, marker2);
    });
    // ======================================================================

    document.getElementById('enter').addEventListener('click', function() {
        enterAirportCode(map);
    });

    //Associate the styled map with the MapTypeId and set it to display.
    map.mapTypes.set('styled_map', styledMapType);
    map.setMapTypeId('styled_map');
}

function enterAirportCode(styledMap) {

    var airportCode = document.getElementById('airport-code').value;
    console.log("airportCode===========", airportCode)

    if (airportCode === "DEN") {
      console.log("DEN match");
      styledMap.setCenter({lat: 39.861656, lng: -104.673178});
      styledMap.setZoom(7);
    }

    // if (airportCode === features.label) {
    //       styledMap.setCenter(features[3].geometry.location);
    // }

    var contentString = '<h3>Make: </h3>' +
        '<h3>Model: </h3>';

    // var address = document.getElementById('address').value;
    // geocoder.geocode({'address': address}, function(results, status) {
    //     if (status === 'OK') {
    //         styledMap.setCenter(results[0].geometry.location);
    //         var marker = new google.maps.Marker({
    //             map: styledMap,
    //             position: results[0].geometry.location
    //             // TODO call vehicles endpoint and add points
    //             // CALL GEOFENCING event
    //         });
            // var infowindow = new google.maps.InfoWindow({
            //     content: contentString
            // });
            // marker.addListener('click', function() {
            //     infowindow.open(map, marker);
            // });
        //     var address_lat = marker.getPosition().lat();
        //     var address_lng = marker.getPosition().lng();
        //     console.log("position: ", address_lat,", ", address_lng)
        // } else {
        //     alert('Error:' + status);
        // }
    // });

}


