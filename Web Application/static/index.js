var map;
function initMap()
{  
    const dublin = {lat: 53.347212, lng: -6.259217}

    map = new google.maps.Map(document.getElementById("map"),
    {
        center: dublin , zoom: 13
    });
};
window.initMap = initMap;


function addMarkers(stations) 
{
    stations.forEach(station=>{
        const bike_marker = new google.maps.Marker({
            position: {
                lat: station.position_lat,
                lng: station.position_lng
            },
            map: map,
            title: station.name,
            station_number: station.number,
            
        });        
        bike_marker.addListener("click", () => {
            console.log("Marker is clicked.")
            map.setZoom(8);
            map.setCenter(bike_marker.getPosition());
        })
    } 
    );

};

function getStations() 
{
    fetch('/stations')
        .then((response) => response.json())
        .then((data) => {console.log("fetch response", typeof data);
        addMarkers(data)})
};
getStations();

// function getCurrentStationsInfo() 
// {
//     fetch('/currentstations')
//         .then((response) => response.json())
//         .then((data) => {console.log("fetch response", typeof data);
//         addStationInfo(data)})
// };
// getCurrentStationsInfo();




