/**
 * Created by cornelia on 2/12/14.
 */

function initialize() {
    var AucklandBeaches = function (name, lat, lng) {
        this.name = name;
        this.lat = ko.observable(lat);
        this.lng = ko.observable(lng);
        var self = this;
        self.contentString = this.name + this.lat + this.lng + 'some more info here';
        HTMLimage = ko.observable();
        self.marker = new google.maps.Marker({
            position: new google.maps.LatLng(this.lat(), this.lng()),
            title: this.name
        });
    };

    var mapOptions = {
        zoom: 10,
        center: new google.maps.LatLng(-36.917793, 174.453252)
    };
    var map = new google.maps.Map(document.getElementById('map-container'), mapOptions);


    var beaches = [];
    beaches.push(new AucklandBeaches('Piha Beach', -36.956340, 174.468096));
    beaches.push(new AucklandBeaches('Bethells Beach', -36.892240, 174.444851));
    beaches.push(new AucklandBeaches('Muriwai Beach', -36.888409, 174.441127));

    var addMarkers = function () {
        for (var i = 0, len = beaches.length; i < len; i++) {
            beaches[i].marker.setMap(map);
        }
    };
    addMarkers();

    var removeMarkers = function () {
        for (var i = 0, len = beaches.length; i < len; i++) {
            beaches[i].marker.setMap(null);
        }
    };
    document.getElementById('removebtn').addEventListener("click", removeMarkers);
    document.getElementById('addbtn').addEventListener("click", addMarkers);

    var infowindow = new google.maps.InfoWindow({
        maxWidth: 150
    });

    for(var i = 0; i < beaches.length; i++){
        var marker = beaches[i].marker;
        google.maps.event.addListener(marker, 'click', function (e) {
            infowindow.setContent('Marker position: ' + this.getPosition());
            infowindow.open(map, this);
        });
    }

}
google.maps.event.addDomListener(window, 'load', initialize);