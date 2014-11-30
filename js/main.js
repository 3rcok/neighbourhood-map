/**
 * Created by cornelia on 29/11/14.
 */
function initialize() {


    var AucklandBeaches = function (name, latLng) {
        this.name = name;
        this.latLng = latLng;
        var self = this;
        var jsonFeed = "http://api.flickrat.com/services/feeds/photos_public.gne?format=json&tags="+this.name+"&jsoncallback=?";
        var req = $.ajax({
            tags: this.name,
            url : jsonFeed,
            dataType : "jsonp",
            timeout : 10000
        });
        req.error(function(HTMLimage) {
            self.HTMLimage = HTMLimage;
            self.HTMLimage = 'No image available';
            self.setContentString();
            console.log('Oh noes!');
            console.log(self.contentString);
        });
        req.success(function(data) {
            console.log('Yes! Success!');
            var images = data.items;
                if(images.length > 0) {
                    var image = images[Math.floor(Math.random() * images.length)];
                    console.log(data);
                    var imageUrl = image.media.m;
                    self.HTMLimage = '<img class="media" src="' + imageUrl + '">';
                }
                else {
                    self.HTMLimage = 'No image available';
                }
            self.setContentString();
        });



        $.getJSON("http://en.wikipedia.org/w/api.php?callback=?",
            {
                srsearch: this.name,
                action: "query",
                list: "search",
                format: "json"
            }).fail(function () {
                self.contentString = 'couldnt get';
                console.log('oh no!')
            })
            .done(function (data) {
                console.log(data);
                var header = data.query.search[0].title;
                var info = data.query.search[0].snippet;
                var timestamp = data.query.search[0].timestamp;
                self.HTMLinfo = '<b>' + header + '</b>, ' + info + '';
                self.HTMLtimestamp = '(last visited ' + timestamp + ')';
                self.HTMLUrl = header;
                self.setContentString();
            });

        this.setContentString = function () {
                self.contentString = '<div id="content">' + '<div id="siteNotice">' + '</div>' + '<h1 id="firstHeading" class="firstHeading">' + this.name + '</h1>' +
                    '<div id="bodyContent">' + '<div id="img">' + self.HTMLimage + '</div>' + '<p id="info" class="info">' + self.HTMLinfo + '</p>' +
                    '<p class="info">Attribution Wikipedia: <a href="http://en.wikipedia.org/w/index.php?title=' + self.HTMLUrl + '" target="_blank">' + this.name + '</a> ' + self.HTMLtimestamp +
                    '</p>' + '</div>' + '</div>';
             };


    };

    var beaches = [];
    beaches.push(new AucklandBeaches('Piha Beach', new google.maps.LatLng(-36.956340, 174.468096)));
    beaches.push(new AucklandBeaches('Bethells Beach', new google.maps.LatLng(-36.892240, 174.444851)));
    beaches.push(new AucklandBeaches('Waipiro Bay', new google.maps.LatLng(-38.016134, 178.335799)));
    beaches.push(new AucklandBeaches('Muriwai Beach', new google.maps.LatLng(-36.888409, 174.441127)));
    beaches.push(new AucklandBeaches('Karioitahi Beach', new google.maps.LatLng(-37.283244, 174.654781)));
    beaches.push(new AucklandBeaches('Maraetai Beach', new google.maps.LatLng(-36.877417, 175.041399)));
    beaches.push(new AucklandBeaches('Mission Bay Beach', new google.maps.LatLng(-36.850158, 174.844482)));


    var markers = [];
    var mapOptions = {
        center: { lat: -36.892728, lng: 174.924193},
        zoom: 9
    };
    var map = new google.maps.Map(document.getElementById('map-container'),
        mapOptions);


    $('#drop').on('click', function () {
        for (var i = 0, len = beaches.length; i < len; i++) {
            var beach = beaches[i];
            (function (beach) {
                setTimeout(function () {
                    addMarker(beach);
                }, i * 200);
            })(beach);
        }
    });

    var addMarker = function (beach) {
        //for (var i = 0; i < beaches.length; i++) {
        var marker = new google.maps.Marker({
            position: beach.latLng,
            map: map,
            draggable: false,
            title: beach.name,
            animation: google.maps.Animation.DROP
        });
        markers.push(marker);
        // }

//        for (var j = 0, len = markers.length; j < len; j++) {
//            var marker = markers[j];
//            google.maps.event.addListener(marker, 'click', function () {
//                infoWindow.open(map, marker);
//                console.log(marker);
//            });
//        }
//    };
        var bindClick = function (marker) {
            return function () {
                infoWindow.open(map, marker);
            };
        };

//        for (var j = 0, len = markers.length; j < len; j++) {
        //  var marker = markers[j];
        google.maps.event.addListener(marker, 'click', bindClick(marker));
//        }

        var infoWindow = new google.maps.InfoWindow({
            content: beach.contentString,
            maxWidth: 220
        });
    };

    var weatherLayer = new google.maps.weather.WeatherLayer({
        temperatureUnits: google.maps.weather.TemperatureUnit.CELSIUS
    });
    weatherLayer.setMap(map);

    var cloudLayer = new google.maps.weather.CloudLayer();
    cloudLayer.setMap(map);


}
google.maps.event.addDomListener(window, 'load', initialize);