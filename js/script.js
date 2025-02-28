const searchCity = document.getElementById("loc");
const suggestionsContainer = document.getElementById("suggestion-container");
const form = document.getElementById("form");
const celsiusRadio = document.getElementById("cel");
const fahrenheitRadio = document.getElementById("fahr");

// Store the coordinates of the selected location
let selectedLatitude = null;
let selectedLongitude = null;

const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
        suggestionsContainer.innerHTML = "";
        suggestionsContainer.style.display = "none";
        return;
    }

    try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("API Response:", data); // Debugging

        suggestionsContainer.innerHTML = "";

        if (data.results) {
            data.results.forEach(item => {
                const suggestionItem = document.createElement("div");
                suggestionItem.classList.add("suggestion-item");
                suggestionItem.textContent = `${item.name}, ${item.country}`;
                
                // Store coordinates in the element's dataset
                suggestionItem.dataset.latitude = item.latitude;
                suggestionItem.dataset.longitude = item.longitude;

                suggestionItem.addEventListener("click", () => {
                    searchCity.value = suggestionItem.textContent;
                    
                    // Ensure coordinates are updated correctly
                    selectedLatitude = parseFloat(suggestionItem.dataset.latitude);
                    selectedLongitude = parseFloat(suggestionItem.dataset.longitude);

                    console.log(`Selected Location: ${searchCity.value} | Lat: ${selectedLatitude}, Lon: ${selectedLongitude}`); // Debugging

                    suggestionsContainer.innerHTML = "";
                    suggestionsContainer.style.display = "none";
                });

                suggestionsContainer.appendChild(suggestionItem);
            });

            suggestionsContainer.style.display = "block";
        } else {
            console.warn("No results found.");
            suggestionsContainer.style.display = "none";
        }
    } catch (error) {
        console.error("Error fetching suggestions:", error);
    }
};

// Attach event listener to input
searchCity.addEventListener("input", () => {
    const query = searchCity.value.trim();
    fetchSuggestions(query);
});

const fetchWeather = async (latitude, longitude, temperatureUnit) => {
    try {
        const unitParam = temperatureUnit === "celsius" ? "celsius" : "fahrenheit"; 
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&temperature_unit=${unitParam}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const data = await response.json();
        console.log("Weather API Response:", data);
        
        return data;
    } catch (error) {
        console.error("Error fetching weather:", error);
        return null;
    }
};

const displayWeather = (weatherData, unit) => {
    let weatherDisplay = document.getElementById("weather-display");
    
    if (!weatherDisplay) {
        weatherDisplay = document.createElement("div");
        weatherDisplay.id = "weather-display";
        document.body.appendChild(weatherDisplay);
        weatherDisplay.classList.add("arriving");

    }
    
    if (weatherData && weatherData.current) {
        const temperature = weatherData.current.temperature_2m;
        const unitSymbol = unit === "celsius" ? "°C" : "°F";
        
        weatherDisplay.innerHTML = `
            <div class="weather-result">
                <h2>Current Weather</h2>
                <p>Location: ${searchCity.value}</p>
                <p>Temperature: ${temperature}${unitSymbol}</p>
            </div>
        `;
    } else {
        weatherDisplay.innerHTML = `<p class="error">Could not retrieve weather data. Please try again.</p>`;
    }
};

// Handle form submission
form.addEventListener("submit", async (event) => {
    event.preventDefault(); 
    
    console.log(`Submitting with Lat: ${selectedLatitude}, Lon: ${selectedLongitude}`); // Debugging

    // Validate if the user has selected a location
    if (!selectedLatitude || !selectedLongitude) {
        alert("Please select a location from the suggestions.");
        return;
    }
    
    const temperatureUnit = celsiusRadio.checked ? "celsius" : "fahrenheit";
    const weatherData = await fetchWeather(selectedLatitude, selectedLongitude, temperatureUnit);
    
    displayWeather(weatherData, temperatureUnit);
});

// Set default selection for temperature unit (Celsius)
celsiusRadio.checked = true;

