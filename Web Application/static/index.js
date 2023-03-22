var map;
function initMap()
{  
    const dublin = {lat: 53.347212, lng: -6.259217}

    map = new google.maps.Map(document.getElementById("map"),
    {
        center: dublin , zoom: 13.5
    });
};
window.initMap = initMap;


function addMarkers(stations, currentinfo) 
{   
    const infowindow = new google.maps.InfoWindow(); 
    
    stations.forEach(station=>{

        var availableBikes = '';
        var contentStr = '';
        const blue_icon = "https://images2.imgbox.com/19/92/LCkbkhtv_o.png"
        const red_icon = "https://images2.imgbox.com/dc/76/LmVQgitM_o.png"
        const orange_icon = "https://images2.imgbox.com/15/db/4c957QC0_o.png"
        var icon;

        currentinfo.forEach(stn=>{
            if (stn.number == station.number){
                availableBikes = stn.available_bikes;

                contentStr += "<p> Available bikes: " + stn.available_bikes +
                "</p><p> Available stands: " + stn.available_bike_stands + '</p>';
                
                //if a station has 0 available bikes, it shows red marker
                //if its between 1 and 5, the marker is orange
                //else it is blue

                if(stn.available_bikes == 0){
                    icon = red_icon;
                } else if (stn.available_bikes <= 5 && stn.available_bikes > 0){
                    icon = orange_icon
                } else {icon = blue_icon};

            }});

        const bike_marker = new google.maps.Marker({
            position: {
                lat: station.position_lat,
                lng: station.position_lng
            },
            map: map,
            title: station.name + ' Station No.' + station.number,
            //the marker display's each station's available bikes count
            label: {text: availableBikes + '', color: "white"}, 
            icon: {url: icon},
            optimized: false,
        });

        bike_marker.addListener("click", () => {

            //if the map is too zoomed out, clicking on a marker sets the zoom to 15
            //if the map is zoomed in close, clicking on a marker does not change the zoom level
            if(map.getZoom() < 15){map.setZoom(15)}
            else {map.setZoom(map.getZoom())};

            map.panTo(bike_marker.getPosition());
            
            infowindow.close();
            infowindow.setContent(
                '<h1 style = "font-size: medium">' + bike_marker.getTitle() + '</h1>' 
                + contentStr);
            infowindow.open(bike_marker.getMap(), bike_marker);
        });
    });
};

function fetchCurrentInfo() {
    const url1 = '/stations';           //need to fetch the stations json
    const url2 = '/currentstations';    //then also need to fetch the current station information json

    const request1 = fetch(url1).then(response => response.json());
    const request2 = fetch(url2).then(response => response.json());

    return Promise.all([request1, request2]).then(data => {
        const jsonData1 = data[0];
        const jsonData2 = data[1];
        // call add markers
        addMarkers(jsonData1, jsonData2);
    });
}

fetchCurrentInfo()





