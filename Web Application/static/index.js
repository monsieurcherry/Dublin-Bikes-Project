var map;
function initMap()
{   
    fetchCurrentInfo();
    const dublin = {lat: 53.346057, lng: -6.268001}

    map = new google.maps.Map(document.getElementById("map"),
    {
        center: dublin , zoom: 13.5
    });
    
};
window.initMap = initMap();


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
        const space = '&nbsp'
        currentinfo.forEach(stn=>{
            if (stn.number == station.number){
                availableBikes = stn.available_bikes;
                var bike_icon;
                var parking_icon;
                if (stn.available_bikes == 0){bike_icon = "<i class='fas fa-person-biking' style = 'color:red'></i>"}
                else {bike_icon = "<i class='fas fa-person-biking' style = 'color:navy'></i>"};

                if (stn.available_bike_stands == 0){parking_icon = "<i class='fas fa-square-parking' style = 'color:red'></i>"}
                else {parking_icon = "<i class='fas fa-square-parking' style = 'color:navy'></i>"};

                contentStr += "<p> Available bikes &nbsp &nbsp" + bike_icon + space + space + stn.available_bikes +
                "</p><p> Available stands &nbsp" + parking_icon + space + space + stn.available_bike_stands + '</p>';
                
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
                '<h1 style = "font-size: small">' + bike_marker.getTitle() + '</h1>' 
                + contentStr);
            infowindow.open(bike_marker.getMap(), bike_marker);
        });
    });
};

function fetchCurrentInfo() {
    const static_stations_info_url = '/stations';           //need to fetch the stations json
    const current_station_info_url = '/currentstations';    //then also need to fetch the current station information json
    const current_weather_info_url = '/currentweather';

    const request1 = fetch(static_stations_info_url).then(response => response.json());
    const request2 = fetch(current_station_info_url).then(response => response.json());
    const request3 = fetch(current_weather_info_url).then(response => response.json());

    return Promise.all([request1, request2, request3]).then(data => {
        const jsonData1 = data[0];
        const jsonData2 = data[1];
        const jsonData3 = data[2];
        // call add markers
        addMarkers(jsonData1, jsonData2);
        displayWeather(jsonData3)}
    );
}

fetchCurrentInfo()

function displayWeather(weather_json){
    weather_data = weather_json[0]
    const space = '&nbsp'
    const temperature = weather_data.temperature;
    const windSpeed = weather_data.windspeed;
    const cloudiness = weather_data.cloudiness;
    const description = weather_data.description;
    const updatedTime = weather_data.time;
    const pressure = weather_data.pressure;
    var toBeShown = '<p>' + description + '</p>'
    + '<br> <i class="fas fa-cloud"></i>' + space + space + cloudiness 
    + ' % cloudy <br>  <i class="fas fa-temperature-half"></i> ' + space + space + space + temperature + '°C'
    + ' <br> <i class="fas fa-wind"></i>' + space + space + windSpeed 
    + ' m/s<br> <i class="fas fa-arrows-down-to-people"></i> ' + space + pressure + ' hPa <br>'
    + '<i class="fas fa-clock"></i>  ' + updatedTime; 
    document.getElementById("weather").innerHTML = toBeShown;
}





