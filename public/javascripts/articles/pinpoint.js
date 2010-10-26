// Global Variables.
var map;
var markersArray = [];
var geocoder;
var mCluster;
var biomarkers = [];
var infowindows = new Array();
var addresses = [];
var markerImage;
// Grayscale map
var miniStyle = 
[
	{
	    featureType: "landscape",
	    elementType: "all",
	    stylers: [
	      { hue: "#ffa200" },
	      { lightness: -20 },
		  { visibility: "off" }
	    ]	
	},
	{
		featureType: "landscape.natural",
		elementType: "all",
		stylers: [
			{lightness: -50},
			{hue: "#5E2605"}
		]
	},
	{
		featureType: "road",
		elementType: "all",
		stylers: [
			{visibility: "off"}
		]
	},
	{
		featureType: "transit",
		elementType: "all",
		stylers: [
			{visibility: "off"}
		]
	},
	{
		featureType: "poi",
		elementType: "all",
		stylers: [
			{visibility: "off"}
		]
	}
];

function initializep() {
	// Initialize GeoCoder.
    geocoder = new google.maps.Geocoder();
	// Initialize Google Maps.
    var center = new google.maps.LatLng(47.471944, 19.050278);
    var myOptions = {
        zoom: 4,
        center: center,
	    mapTypeControlOptions: {
	      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
	    },
	    navigationControl: true
    }
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

	// Customizing Map
	var styledMapOptions = { 
		name: "No-Road"
	}
    //var noRoadMapType = new google.maps.StyledMapType(style, styledMapOptions);

	var noRoadMapType = new google.maps.StyledMapType(miniStyle, styledMapOptions);
    map.mapTypes.set('noroad', noRoadMapType);
	map.setMapTypeId('noroad');

    google.maps.event.addListener(map, 'click', function (event) {
        //createMarker(event.latLng);
		codeLatLng(event.latLng);
    });

	// Initialize Reading of Markers XML
	markerImage = new google.maps.MarkerImage('http://localhost:3000/images/micos/icons/administration.png');
	var data = document.getElementById('geo_xml').value;
	parseBioXml(data);

	// Initialize Marker cluster Utility.
	mCluster = new MarkerClusterer(map,biomarkers);
}

/**
 * Geocoding given Address and put a place mark on it.
 */
function codeAddress() {
    clearOverlays();
	var str = "";
	$("#geocode-info").html(str);
	$("#lat").html(str);
	$('#lng').html(str);

    var address = document.getElementById("address").value;
    geocoder.geocode({
        'address': address
    }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
			addresses = results;
			var str = "";
			$.each(results, function(index,value) {
				str += "<a onclick='jumpToAddress("+index+")'>"+this.formatted_address+"</a><br/>";
                str += "types: "+this.types.join(", ")+"<br />";
                str += "address components: <ul>"
                $.each(this.address_components, function(){
                    str +="<li>"+this.types.join(", ")+": "+this.long_name+"</li>";
                });
                str +="</ul>";
			});
			$('#geocode-result').html(str);
			
            result = results[0];
            map.setCenter(result.geometry.location);
            map.fitBounds(result.geometry.viewport);
			createMarker(result.geometry.location);
			document.getElementById("geotag_address").value = result.formatted_address;
        } else {
            alert("There is no data related to your given:" + address + " address");
        }
    });
}

/**
 * Jump to location
 */
function jumpToAddress(index){
	result = addresses[index];
	map.setCenter(result.geometry.location);
	map.fitBounds(result.geometry.viewport);
	createMarker(result.geometry.location);
	document.getElementById("geotag_address").value = result.formatted_address;
}

/**
 * Jump to given location and opens infowindow.
 */
function jumpToLocation(lat,lng){
    var center = new google.maps.LatLng(lat, lng);
	map.setCenter(center);
	$.each(biomarkers, function(index, value){
		if( this.getPosition().equals(center)){
			infoWindow.open(map,value);
		}
	})
}

/**
 * Reverse Geocoding.
 */
function codeLatLng(latlng) {
    clearOverlays();
	var str = "";
	$('#geocode-result').html(str);
    if (geocoder) {
        geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                $("#lat").html("<strong>Lat:</strong> "+latlng.lat());
                $("#lng").html("<strong>Lng:</strong> "+latlng.lng())
                var str = "";
                $.each(results, function(){
                    str += "<u>"+this.formatted_address+"</u><br/>";
                    str += "types: "+this.types.join(", ")+"<br/>";
                    str += "address components: <ul>"
                    $.each(this.address_components, function(){
                        str +="<li>"+this.types.join(", ")+": "+this.long_name+"</li>";
                    });
                    str +="</ul>";
                });
                $("#geocode-info").html(str);
	            map.setCenter(latlng);
				createMarker(latlng);
				document.getElementById("geotag_address").value = results[0].formatted_address;
            } else {
                alert("Geocoder could not find any address corresponding to: [" + latlng.lat() + "," + latlng.lng() + "]");
            }
        });
    }
}

//////////////////////////////////////////////////////////////////////
//////////////////// HELPER FUNCTIONS ////////////////////////////////
//////////////////////////////////////////////////////////////////////

/**
 * Clear all markers
 */
function clearOverlays() {
    if (markersArray) {
        for (i in markersArray) {
            markersArray[i].setMap(null);
        }
    }
}

/**
 * Add Marker to Map.
 */
function createMarker(location) {
	clearOverlays();
	var marker = new google.maps.Marker({position: location,map: map,icon: markerImage});
	google.maps.event.addListener(marker, 'click', function() {
		if (infowindow) infowindow.close();
		var infowindow = new google.maps.InfoWindow({
			content: '<center><a onclick="return dummy();" title="Man are made by events" class="header-link">Add Description</a></center>'
		});
		infowindow.open(map, marker);
	});
	
	markersArray.push(marker);
	document.getElementById("geotag_location").value = location.lat() + "," + location.lng();
	return marker;
}

/**
 * Invoking Fancybox.
 */
function dummy() {
	$('#cevent').click();
}

/**
 * Add Marker with Info window to Map.
 */
function createInfoMarker(location, html) {
    var marker = new google.maps.Marker({position: location, map: map, icon: markerImage});

    google.maps.event.addListener(marker, "click", function() {
      if (infowindow) infowindow.close();
      var infowindow = new google.maps.InfoWindow({content: html});
      infowindow.open(map, marker);
    });
	infowindows.push(new google.maps.InfoWindow({content: html}));
    return marker;
  }

/**
 * Creating a Label on given location.
 */
function createLabel(location) {
	var labelText = "City Hall";

	var myOptions = {
		 content: labelText
		,boxStyle: {
		   border: "1px solid black"
		  ,textAlign: "center"
		  ,fontSize: "8pt"
		  ,width: "50px"
		 }
		,disableAutoPan: true
		,pixelOffset: new google.maps.Size(-25, 0)			
		,position: location
		,closeBoxURL: ""
		,isHidden: false
		,pane: "mapPane"
		,enableEventPropagation: true
	};

	var ibLabel = new InfoBox(myOptions);		
	ibLabel.open(map);
}

/**
 * Parsing XML.
 */
function parseBioXml(data) {
  var xml = GXml.parse(data);
  var markers = xml.documentElement.getElementsByTagName("geotag");
  for (var i = 0; i < markers.length; i++) {
	var locations = markers[i].getElementsByTagName("location");
	var descriptions = markers[i].getElementsByTagName("description");
	for(var j = 0; j < locations.length; j++){
		var coords = GXml.value(locations[j]).split(",");
		var point = new google.maps.LatLng(parseFloat(coords[0]),parseFloat(coords[1]));
		var contentStr = GXml.value(descriptions[j]);
		biomarkers.push(createInfoMarker(point,contentStr));
	}
  }
}


