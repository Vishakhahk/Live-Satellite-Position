// === Enhanced SatTrack: Real-Time Satellite Tracker ===

const apiBase = "https://api.wheretheiss.at/v1/satellites/";

const satellites = {
  "25544": "ISS",
  "43553": "Tiangong",
  "20580": "Hubble",
};

let currentSatelliteId = "25544";

const map = L.map("map").setView([0, 0], 2);

const markerIcon = L.icon({
  iconUrl: "satellite.png", // Local icon
  iconSize: [50, 50],
  iconAnchor: [25, 25]
});

const marker = L.marker([0, 0], { icon: markerIcon }).addTo(map);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const dropdown = document.getElementById("satelliteSelect");
const satelliteNameLabel = document.getElementById("satelliteName");

for (const id in satellites) {
  const option = document.createElement("option");
  option.value = id;
  option.text = satellites[id];
  dropdown.appendChild(option);
}

dropdown.value = currentSatelliteId;
dropdown.addEventListener("change", (e) => {
  currentSatelliteId = e.target.value;
  satelliteNameLabel.textContent = satellites[currentSatelliteId];
  getSatelliteData();
});

function checkOverIndia(lat, lon) {
  const indiaLatMin = 6.5;
  const indiaLatMax = 37.5;
  const indiaLonMin = 68.7;
  const indiaLonMax = 97.25;

  return lat >= indiaLatMin && lat <= indiaLatMax && lon >= indiaLonMin && lon <= indiaLonMax;
}

async function getSatelliteData() {
  try {
    const response = await fetch(apiBase + currentSatelliteId);
    const data = await response.json();

    const { latitude, longitude, velocity, altitude } = data;

    marker.setLatLng([latitude, longitude]);
    map.setView([latitude, longitude], 3);

    document.getElementById("lat").textContent = latitude.toFixed(2);
    document.getElementById("lon").textContent = longitude.toFixed(2);
    document.getElementById("time").textContent = new Date().toLocaleTimeString();
    document.getElementById("speed").textContent = velocity.toFixed(2) + " km/h";
    document.getElementById("altitude").textContent = altitude.toFixed(2) + " km";

    if (checkOverIndia(latitude, longitude)) {
      document.getElementById("alert").textContent = "🚨 Satellite is passing over India!";
    } else {
      document.getElementById("alert").textContent = "";
    }
  } catch (error) {
    console.error("Error fetching satellite data:", error);
  }
}

getSatelliteData();
setInterval(getSatelliteData, 5000);
