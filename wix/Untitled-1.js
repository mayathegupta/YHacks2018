<html>
<head>
    <title>Wix Code / Google Maps :: Multiple Markers</title>
</head>
<body>
    <div id="map" style="height: 100%; width: 100%;" />
    <script type="text/javascript">

    let barcelona = {lat: 41.38506389999999, lng: 2.1734035};

     /**
       * The RestoreControl adds a control to the map that resets the zoom,
       * and recenters the map on Barcelona.
       * This constructor takes the control DIV as an argument.
       * @constructor
       */
       function RestoreControl(controlDiv, map) {
            // Set CSS for the control border.
            var controlUI = document.createElement('div');
            controlUI.style.backgroundColor = '#fff';
            controlUI.style.border = '2px solid #fff';
            controlUI.style.borderRadius = '3px';
            controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
            controlUI.style.cursor = 'pointer';
            controlUI.style.marginBottom = '22px';
            controlUI.style.textAlign = 'center';
            controlUI.title = 'Click to reset the map';
            controlDiv.appendChild(controlUI);

            // Set CSS for the control interior.
            var controlText = document.createElement('div');
            controlText.style.color = 'rgb(25,25,25)';
            controlText.style.fontFamily = 'Helvetic Light,sans-serif';
            controlText.style.fontSize = '12px';
            controlText.style.lineHeight = '20px';
            controlText.style.paddingLeft = '5px';
            controlText.style.paddingRight = '5px';
            controlText.innerHTML = 'Restore Map';
            controlUI.appendChild(controlText);

            // Setup the click event listeners: simply set the map to Chicago.
            controlUI.addEventListener('click', function() {
                map.setCenter(barcelona);
                map.setZoom(2);
            });
        }

        let locations = null;
        function init() {
            if(locations === null) { // if no locations, let page know
                window.parent.postMessage("hello", "*");
            }
            window.onmessage = (event) => {
                if (event.data) {
                    locations = event.data.markers;
                    let infowindow = new google.maps.InfoWindow();
                    let map = new google.maps.Map(document.getElementById('map'), {
                        zoom: 2,
                        streetViewControl: false,
                        center: barcelona   //{lat: 41.38506389999999, lng: 2.1734035}    // Barcelona is a good center point
                    });

                    // Add the markers to the map.
                    // Note: The code uses the JavaScript Array.prototype.map() method to
                    // create an array of markers based on a given "locations" array.
                    // The map() method here has nothing to do with the Google Maps API.
                    var markers = locations.map(function (location) {
                        let marker = new google.maps.Marker({
                            position: location.position,
                            map: map
                        })
                        google.maps.event.addListener(marker, 'mouseover', (function (marker) {
                            return function () {
                                infowindow.setContent(location.title);
                                infowindow.open(map, marker);
                            }
                        })(marker));
                        google.maps.event.addListener(marker, 'mouseout', (function (marker) {
                            return function () {
                                infowindow.close();
                            }
                        })(marker));
                        google.maps.event.addListener(marker, 'click', (function (marker) {
                            window.parent.postMessage(location.title, "*");
                        }));
                        return marker;
                    });

                    // Add a marker clusterer to manage the markers.
                    var markerCluster = new MarkerClusterer(map, markers,
                        { gridSize: 20, maxZoom: 3, imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });

                    // Create the DIV to hold the control and call the CenterControl()
                    // constructor passing in this DIV.
                    var restoreControlDiv = document.createElement('div');
                    var restoreControl = new RestoreControl(restoreControlDiv, map);

                    restoreControlDiv.index = 1;
                    map.controls[google.maps.ControlPosition.TOP_CENTER].push(restoreControlDiv);                        
                }
            }
        }
    </script>
    <script src="https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js">
    </script>    
    <script async defer src="https://maps.googleapis.com/maps/api/js?key=GOOGLE_MAP_API_KEY&callback=init">
    </script>
</body>
</html>