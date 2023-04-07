let map;
let infowindow1;
let service;
let bikeMarkers = [];

function initMap()
{   
    fetchCurrentInfo();
    const dublin = {lat: 53.346057, lng: -6.268001}

    map = new google.maps.Map(document.getElementById("map"),
    {
        center: dublin , zoom: 13.5
    });
    routeMaker();
};
window.initMap = initMap;

function addMarkers(stations, currentinfo) 
{   
    const infowindow = new google.maps.InfoWindow();
    stations.forEach(station=>{

        var availableBikes = '';
        var contentStr = '';
        var totalStand = '';
    
        const blue_icon = "https://images2.imgbox.com/8b/64/Twifkt4W_o.png"
        const space = '&nbsp'
        currentinfo.forEach(stn=>{
            if (stn.number == station.number){
                availableBikes = stn.available_bikes;
                totalStand = availableBikes + stn.available_bike_stands
                var bike_icon;
                var parking_icon;
                if (stn.available_bikes == 0){bike_icon = "<i class='fas fa-person-biking' style = 'color:red'></i>"}
                else {bike_icon = "<i class='fas fa-person-biking' style = 'color:navy'></i>"};

                if (stn.available_bike_stands == 0){parking_icon = "<i class='fas fa-square-parking' style = 'color:red'></i>"}
                else {parking_icon = "<i class='fas fa-square-parking' style = 'color:navy'></i>"};

                contentStr += "<p style = 'color: #000'> Available bikes &nbsp &nbsp" + bike_icon + space + space + stn.available_bikes +
                "</p><p style = 'color: #000'> Available stands &nbsp" + parking_icon + space + space + stn.available_bike_stands + '</p>';
                
                //if a station has 0 available bikes, it shows red marker
                //if its between 1 and 5, the marker is orange
                //else it is blue
            }});

        const bike_marker = new google.maps.Marker({
            position: {
                lat: station.position_lat,
                lng: station.position_lng
            },
            map: map,
            title: station.name + ' Station No.  ' + station.number,
            //the marker display's each station's available bikes count
            label: {text: availableBikes + '', color: "white"}, 
            icon: {url: blue_icon},
            opacity: 1,
        });
        bikeMarkers.push(bike_marker);
        
        bike_marker.addListener("click", () => {
            
            stationNumber = parseInt(bike_marker.getTitle().slice(bike_marker.getTitle().length - 3, bike_marker.getTitle().length))
            stationAvgOccupancyGetter(stationNumber, totalStand)
            console.log(infowindow.getContent())
            if(startflag == true){
                startingStationPosition = []
                startingStationPosition.push(bike_marker.getPosition().lat())
                startingStationPosition.push(bike_marker.getPosition().lng())
                startingStationName = (bike_marker.getTitle())
                // console.log({startingStationName})
                routeMaker()
                
            } else if (endflag == true) {
                endStationPosition = []
                endStationPosition.push(bike_marker.getPosition().lat())
                endStationPosition.push(bike_marker.getPosition().lng())
                endStationName = (bike_marker.getTitle())
                // console.log({endStationName})
                routeMaker()
            }

            //if the map is too zoomed out, clicking on a marker sets the zoom to 15
            //if the map is zoomed in close, clicking on a marker does not change the zoom level
            if(map.getZoom() < 15){map.setZoom(15)}
            else {map.setZoom(map.getZoom())};

            map.panTo(bike_marker.getPosition());
            infowindow.close();
            infowindow.setContent(
                '<h1 style = "font-size: small; color: #000">' + bike_marker.getTitle() + '</h1>' 
                + contentStr);
            infowindow.open();
            
            if(startflag == false && endflag == false){infowindow.open(bike_marker.getMap(), bike_marker)}
        })
        
        bike_marker.addListener("mouseover", () => {
            if (map.getZoom() > 14.9){
            infowindow.close();
            infowindow.setContent(
                '<h1 style = "font-size: small; color: #000">' + bike_marker.getTitle() + '</h1>' 
                + contentStr);
            
            if(startflag == false && endflag == false){infowindow.open(bike_marker.getMap(), bike_marker)}}
        });

        if (startflag == true || endflag == false) {bike_marker.addListener("mouseout", () => {
            infowindow.close();
        })}
    })
};

function fetchCurrentInfo() {
    const static_stations_info_url = '/stations';           //need to fetch the stations json
    const current_station_info_url = '/currentstations';    //then also need to fetch the current station information json
    const current_weather_info_url = '/currentweather';
    const current_weather_icon = 
'https://api.openweathermap.org/data/2.5/weather?lat=53.35&lon=-6.26&appid=b7d6a55bc0fff59fb0d5f7c3c1668417&units=metric';


    const request1 = fetch(static_stations_info_url).then(response => response.json());
    const request2 = fetch(current_station_info_url).then(response => response.json());
    const request3 = fetch(current_weather_info_url).then(response => response.json());
    const request4 = fetch(current_weather_icon).then(res => res.json()).then((out) => getIconId(out.weather[0].icon));

    
    return Promise.all([request1, request2, request3, request4]).then(data => {
        const jsonData1 = data[0];
        const jsonData2 = data[1];
        const jsonData3 = data[2];
        const jsonData4 = data[4];
        // call add markers
        addMarkers(jsonData1, jsonData2);
        displayWeather(jsonData3)}
    );
}
fetchCurrentInfo()

var iconid;
function getIconId(info) {
    iconid = info
    return iconid
}

function displayWeather(weather_json){

    weather_data = weather_json[0]
    const space = '&nbsp'
    const temperature = weather_data.temperature;
    const windSpeed = weather_data.windspeed;
    const cloudiness = weather_data.cloudiness;
    const description = weather_data.description;
    const updatedTime = weather_data.time;
    const pressure = weather_data.pressure;
    var toBeShown = '<img src = "https://openweathermap.org/img/wn/' + iconid + '@4x.png" style="width:64px;height:64px;"><p>' + description + '</p>'
    + '<br>  <i class="fas fa-temperature-half"></i> ' + space + space + space + temperature + '°C'
    + ' <br> <i class="fas fa-wind"></i>' + space + space + windSpeed 
    + ' m/s<br>'
    document.getElementById("weather-data").innerHTML = toBeShown;
}

let startingStationPosition = []
let endStationPosition = []
let startingStationName;
let endStationName;
let startflag = false
let endflag = false
let directionsArray = [];

function startStationSelector(){
    startflag = true
    endflag = false    
}

function endStationSelector(){
    endflag = true
    startflag = false    
}

function routeMaker(){
    const start_input  = document.getElementById("starting_location");
    const end_input  = document.getElementById("destination_location");
    const directionsRenderer = new google.maps.DirectionsRenderer();
    const directionsService = new google.maps.DirectionsService();

    const start_searchItem = new google.maps.places.SearchBox(start_input);
    const end_searchItem = new google.maps.places.SearchBox(end_input);

    if(startflag == true){
        document.getElementById("starting_location").value = startingStationName
        startflag = false
    }

    if(endflag == true){
        document.getElementById("destination_location").value = endStationName;
        displayRouteAutofill(directionsService , directionsRenderer)
        console.log(directionsArray)
        endflag = false
    }


    directionsRenderer.setMap(map);

    map.addListener("bounds_changed", ()=>{
        start_searchItem.setBounds(map.getBounds());
        end_searchItem.setBounds(map.getBounds());
    });

    start_searchItem.addListener("places_changed", ()=> {
        const startingPlace = start_searchItem.getPlaces();

        if(startingPlace.length == 0){
            return;
        }
        startingPlace.forEach((startingPlace) => {
            if(!startingPlace.geometry || !startingPlace.geometry.location) {
                console.log("Places contain no geometry...")
                return;
            }
            
            startmarker = new google.maps.Marker({
                    map,
                    title: startingPlace.name,
                    position: startingPlace.geometry.location,
                    opacity: 0,
                })
        });
        map.setZoom(13)
        map.panTo(startmarker.getPosition());
        displayRoute(directionsService , directionsRenderer)
    })

    end_searchItem.addListener("places_changed", ()=> {
        console.log({end_searchItem})
        const destinationPlace = end_searchItem.getPlaces();
        
        if(destinationPlace.length == 0){
            return;
        }
        destinationPlace.forEach((destinationPlace) => {
            if(!destinationPlace.geometry || !destinationPlace.geometry.location) {
                console.log("Places contain no geometry...")
                return;
            }
           
        endmarker = new google.maps.Marker({
                    map,
                    title: destinationPlace.name,
                    position: destinationPlace.geometry.location,
                    opacity: 0,
                })
        });
        map.setZoom(13)
        map.panTo(endmarker.getPosition());
        displayRoute(directionsService , directionsRenderer)
    })

    document.getElementById("travel-mode").addEventListener("change", () => {
        displayRoute(directionsService, directionsRenderer);
      });

    function displayRoute( directionsService , directionsRenderer){
        const selectedValue = document.querySelector('input[name="mode"]:checked').value; 
        
        if (selectedValue == "WALKING") {
            travelmode = google.maps.TravelMode.WALKING;
        }
        if (selectedValue == "DRIVING") {
            travelmode = google.maps.TravelMode.DRIVING;
        }
        if (selectedValue == "TRANSIT") {
            travelmode = google.maps.TravelMode.TRANSIT;
        }
        if (selectedValue == "BICYCLING") {
            travelmode = google.maps.TravelMode.BICYCLING;
        }
        directionsService.route({
            origin: startmarker.getPosition(),
            destination: endmarker.getPosition(),
            travelMode: travelmode,
        }).then((response) => {directionsRenderer.setDirections(response);
        }).catch((error) => window.alert("Direction request failed: " + error));
    }

    function displayRouteAutofill(directionsService , directionsRenderer){
        if (directionsArray.length != 0){directionsArray.forEach(route => {
            route.setMap(null)
        })}

        directionsService.route({
            origin: {lat: startingStationPosition[0], lng: startingStationPosition[1]},
            destination: {lat: endStationPosition[0] ,lng: endStationPosition[1]},
            travelMode: google.maps.TravelMode.BICYCLING,
        }).then((response) => {directionsRenderer.setDirections(response);
        directionsArray.push(directionsRenderer)}).catch((error) => window.alert("Direction request failed: " + error));
    }
}

function stationAvgOccupancyGetter(station_id, stationStands){
    const stations_data_getter_url = '/station_avg_data/' + station_id;           
    const request1 = fetch(stations_data_getter_url).then(response => response.json())
    .then(data => {
        const jsonData1 = data;
        stationDataProcessor(jsonData1, station_id, stationStands);}
    )    
}

var charFlag = false;
var dummyCounter = 0

async function stationDataProcessor(jsonData, station_id, stationStands){
    dummyCounter ++; 
    let timeList = await jsonData.index
    let dailyAvgOccupancy = await jsonData.data
    document.getElementById('graph1').innerHTML = '<canvas id="myDailyChart' + dummyCounter + '" style="width: 480px; height: 200px">Graph daily</canvas>';

    GraphDrawer(stationStands);

    // console.log({stationStands})
    async function GraphDrawer(stationStands)
    { 
    
    const chartid = 'myDailyChart' + dummyCounter

    const ctx = document.getElementById(chartid).getContext("2d"); 
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, "rgba(216, 27, 96, 0.85)");   
        gradient.addColorStop(1, "rgba(216, 27, 96, 0.10)");
    
    
    
    DailyAvg = new Chart(ctx, {
    type: 'line',
    data: {
    labels: timeList,
    datasets: [{
        label: 'Average Daily Bike Availability At Station ' + station_id,
        labelColor: '#fff',
        data: dailyAvgOccupancy,
        fill: true,
        backgroundColor: gradient,
        }]
    },
    options: {
        tension: 0.1,
        
       
    scales: {
        x: {
            ticks: {
                color: "#fff"
              },
            
        },
        y: {
            min: 0,
            max: stationStands,
            ticks: {
                color: "#fff"
              }
        }
    }
}
}
);
}}

//load a default station at the start
stationAvgOccupancyGetter(1,31);













