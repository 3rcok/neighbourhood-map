/**
 * Created by cornelia on 29/11/14.
 */
function initialize() {
/**
* Beach class that defines the information that is being collected from Flickr and Wikipedia,
 * which is being displayed on the markers
 */
    var AucklandBeaches = function (name, lat, lng) {
        this.name = name;
        this.lat = ko.observable(lat);
        this.lng = ko.observable(lng);
        var self = this;
        self.marker = new google.maps.Marker( {
            position: new google.maps.LatLng(this.lat(), this.lng()),
            title: this.name,
            animation: google.maps.Animation.DROP
        });
        self.HTMLimage = ko.observable();
        this.infoWindow = new google.maps.InfoWindow({
            maxWidth: 220
        });
        var flickrUrl = 'http://api.flickr.com/services/feeds/photos_public.gne?format=json&tags=@@searchstring@@&jsoncallback=?';
        var flickr = $.ajax({
            tags: this.name,
            url: flickrUrl.replace('@@searchstring@@', this.name),
            dataType: "jsonp",
            timeout: 20000
        });
        flickr.error(function () {
            self.HTMLimage('http://nancyharmonjenkins.com/wp-content/plugins/nertworks-all-in-one-social-share-tools/images/no_image.png');
            self.setContentString();
        });
        flickr.success(function (data) {
            var images = data.items;
            if (images.length > 0) {
                var image = images[Math.floor(Math.random() * images.length)];
                var imageUrl = image.media.m;
                self.HTMLimage(imageUrl);
            }
            else {
                self.HTMLimage('http://nancyharmonjenkins.com/wp-content/plugins/nertworks-all-in-one-social-share-tools/images/no_image.png');
            }
            self.setContentString();
        });

    var wikiUrl = 'http://en.wikipedia.org/w/api.php?format=json&action=query&prop=images&rvprop=content&list=search&srsearch=@@searchstring@@';
    $.ajax({
        crossOrigin: true,
        url: wikiUrl.replace('@@searchstring@@', this.name),
        dataType: 'jsonp',
        timeout: 8000
    }).fail(function () {
        self.HTMLinfo = 'Unfortunately we could not find any information on Wikipedia.';
        self.HTMLtimestamp = '';
        self.HTMLUrl = 'Please try <a href="http://www.google.com/" target="_blank">Google</a>';
        self.setContentString();
    }).error(function() {
        self.HTMLinfo = 'Unfortunately we could not find any information on Wikipedia.';
        self.HTMLtimestamp = '';
        self.HTMLUrl = 'Please try <a href="http://www.google.com/" target="_blank">Google</a>';
        self.setContentString();
    }).success(function(data) {
        console.log(data);
        if(data.query.search.length > 0) {
                console.log(data.query.search[0]);
                var header = data.query.search[0].title;
                var info = data.query.search[0].snippet;
                var timestamp = data.query.search[0].timestamp;
                self.HTMLinfo = '<b>' + header + '</b>, ' + info + '';
                self.HTMLtimestamp = '(last visited ' + timestamp + ')';
                self.HTMLUrl = 'Attribution Wikipedia: <a href="http://en.wikipedia.org/w/index.php?title=' + header + '"target="_blank"> Read full Article </a>';
        }
        else {
            self.HTMLinfo = 'Unfortunately we could not find any information on Wikipedia.';
            self.HTMLtimestamp = '';
            self.HTMLUrl = 'Please try Google <a href="http://www.google.com/';
        }
        self.setContentString();
        clearTimeout(wikiRequestTimeout);
    });

        this.setContentString = function () {
            self.contentString = '<div id="content">' + '<div id="siteNotice">' + '</div>' + '<h1 id="firstHeading" class="firstHeading">' + this.name + '</h1>' +
                '<div id="bodyContent">' + '<div id="img"><img class="media" src="' + self.HTMLimage() + '"/></div>' + '<p id="info" class="info">' + self.HTMLinfo + '</p>' +
                '<p class="info">' + self.HTMLUrl +  self.HTMLtimestamp +
                '</p>' + '</div>' + '</div>';
        };

        this.setContentString();
    };
/**
* Instantiate objects
 */
    var beaches = [];
    beaches.push(new AucklandBeaches('Piha Beach', -36.956340, 174.468096));
    beaches.push(new AucklandBeaches('Bethells Beach', -36.892240, 174.444851));
    beaches.push(new AucklandBeaches('Muriwai Beach', -36.888409, 174.441127));
    beaches.push(new AucklandBeaches('Karioitahi Beach', -37.283244, 174.654781));
    beaches.push(new AucklandBeaches('Maraetai Beach', -36.877417, 175.041399));
    beaches.push(new AucklandBeaches('Mission Bay Beach', -36.850158, 174.844482));
    beaches.push(new AucklandBeaches('Medlands Beach', -36.265824, 175.492885));
    beaches.push(new AucklandBeaches('Oneroa Beach', -36.784393, 175.017927));
    beaches.push(new AucklandBeaches('Orewa Beach', -36.585241, 174.696352));
    beaches.push(new AucklandBeaches('Pakiri Beach', -36.246427, 174.731396));
    beaches.push(new AucklandBeaches('Takapuna Beach', -36.784514, 174.776405));
    beaches.push(new AucklandBeaches('Point Chevalier Beach', -36.851243, 174.703640));
    beaches.push(new AucklandBeaches('Kaitarakihi Bay', -37.007079, 174.584742));
    beaches.push(new AucklandBeaches('Beach Haven', -36.802488, 174.687014));
    beaches.push(new AucklandBeaches('Mercer Bay', -36.978575, 174.470000));
    beaches.push(new AucklandBeaches('Snells Beach', -36.416980, 174.729525));

    window.mapBounds = new google.maps.LatLngBounds();

    var viewModel = {
        beaches: ko.observableArray(beaches),
        query: ko.observable(),
        chosenBeachId: ko.observable()
    };

    var infoWindow = new google.maps.InfoWindow({
        maxWidth: 220
    });

// add all markers
    var addAllMarkers = function () {
        for(var i = 0, len = beaches.length; i < len; i++) {
            beaches[i].marker.setMap(map);
        }
    };

//remove all markers from the map
    var removeAllMarkers = function() {
        for(var i = 0, len = beaches.length; i < len; i++) {
            beaches[i].marker.setMap(null);
        }
    };

    var closeOpenInfoWindows = function() {
        for(var i = 0, len = beaches.length; i < len; i ++){
            beaches[i].infoWindow.close();
        }
    };
/**
* Watch the search box for input and update the listbox accordingly
 */
    viewModel.filteredBeaches = ko.computed(function () {
        closeOpenInfoWindows();
        if (!viewModel.query()) {
            addAllMarkers();
            return viewModel.beaches();
        } else {
            removeAllMarkers();
            return ko.utils.arrayFilter(viewModel.beaches(), function (beach) {
                if(beach.name.toLowerCase().indexOf(viewModel.query().toLowerCase()) > -1) {
                    addMarker(beach);
                    return beach.name;
                }
            });
        }
    });
/**
* Update the list and map when the "show all" button is clicked
 */
    viewModel.showAllBeaches = (function() {
        closeOpenInfoWindows();
        viewModel.query('');
        var addMarkers = function(beach) {
            setTimeout(function() {
                addMarker(beach);
            });
        }(beach);
        for (var i = 0, len = beaches.length; i < len; i++) {
            var beach = beaches[i];
            beach.infoWindow.close();
            addMarker(beach);
        }
            return viewModel.beaches();
    });
/**
* Update the list and map when the user clicks on a beach image
 */
    viewModel.getName = (function(beach) {
        removeAllMarkers();
        addMarker(beach);
        return ko.utils.arrayFilter(viewModel.beaches(), function() {
            if(beach.name.toLowerCase().indexOf(this.name.toLowerCase()) > -1){
                viewModel.query(beach.name);
                return beach.name;
            }
        });
    });

    ko.applyBindings(viewModel);
/**
* Set up the map to be displayed
 */
    var mapOptions = {
        center: { lat: -36.847639, lng: 174.867529},
        zoom: 9,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.BOTTOM_CENTER
        },
        panControl: true,
        panControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
        },
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE,
            position: google.maps.ControlPosition.LEFT_CENTER
        },
        scaleControl: true,  // fixed to BOTTOM_RIGHT
        streetViewControl: true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.LEFT_TOP
        }
    };
    var map = new google.maps.Map(document.getElementById('map-container'),
        mapOptions);

/**
 * Add markers to the map
  */
    var addMarker = function (beach) {
        beach.marker.setMap(map);


// open info window when a marker is being clicked on
        var bindClick = function () {
            return function () {
                for(var i = 0, len = beaches.length; i < len; i ++){
                    beaches[i].infoWindow.close();
                }
                beach.infoWindow.setContent(beach.contentString);
                beach.infoWindow.open(map, this);
                map.panTo(this.position);
            };
        };
        google.maps.event.addListener(beach.marker, 'click', bindClick(beach.marker));

    };
/**
 * Add weather info to the map
  */
    var weatherLayer = new google.maps.weather.WeatherLayer({
        temperatureUnits: google.maps.weather.TemperatureUnit.CELSIUS
    });
    weatherLayer.setMap(map);

    var cloudLayer = new google.maps.weather.CloudLayer();
    cloudLayer.setMap(map);

    $(window).on('resize', function(){
        map.fitBounds(mapBounds);
    });
}

if(google){
    google.maps.event.addDomListener(window, 'load', initialize);
}
else {
    console.log('Error loading map');
}
