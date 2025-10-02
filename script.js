// Dynamic Weather Dashboard - Built with passion for clean code and great UX
// Author: Weather App Developer (IBM Project)
// Last updated: 2024

// ========== API SETUP ==========
// My OpenWeatherMap API key - got this from their website after creating a free account
const WEATHER_API_KEY = '528b615e72610e314ab1c8a9a5758369';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// ========== APP STATE ==========
// Keeping track of user preferences and current data
let temperatureUnit = 'celsius'; // 'celsius' or 'fahrenheit'
let currentWeatherInfo = null; // Stores the current weather data object
let temperatureChart = null; // Chart.js instance for 5-day chart

// ========== DOM REFERENCES ==========
// Grabbing all the elements I need to manipulate - organized by function
const domElements = {
    // Search functionality
    citySearchInput: document.getElementById('searchInput'),
    searchButton: document.getElementById('searchBtn'),
    locationButton: document.getElementById('locationBtn'),

    // Loading and error states
    loadingIndicator: document.getElementById('loadingSpinner'),
    errorDisplay: document.getElementById('errorMessage'),
    errorMessageText: document.getElementById('errorText'),

    // Main weather display
    weatherDisplay: document.getElementById('mainContent'),
    cityNameDisplay: document.getElementById('cityName'),
    currentDateDisplay: document.getElementById('currentDate'),
    weatherIcon: document.getElementById('mainWeatherIcon'),
    temperatureDisplay: document.getElementById('mainTemp'),
    weatherDescription: document.getElementById('weatherCondition'),
    feelsLikeTemp: document.getElementById('feelsLike'),

    // Weather details grid
    windSpeedDisplay: document.getElementById('windSpeed'),
    humidityDisplay: document.getElementById('humidity'),
    pressureDisplay: document.getElementById('pressure'),
    visibilityDisplay: document.getElementById('visibility'),
    uvIndexDisplay: document.getElementById('uvIndex'),
    cloudinessDisplay: document.getElementById('cloudiness'),

    // Sun times
    sunriseDisplay: null, // Removed as requested
    sunsetDisplay: null,   // Removed as requested

    // Temperature unit toggle buttons
    celsiusButton: document.getElementById('celsiusBtn'),
    fahrenheitButton: document.getElementById('fahrenheitBtn'),

    // Forecast containers
    hourlyForecastContainer: document.getElementById('hourlyContainer'),
    dailyForecastContainer: document.getElementById('dailyContainer'),
    // Chart element
    temperatureChartCanvas: document.getElementById('temperatureChart')
};

// ========== APP INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    try {
        setupApp();
        attachEventListeners();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});

// Initialize the application
function setupApp() {
    // Double-check we have our API key
    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
        showErrorMessage('API key is missing! Please add your OpenWeatherMap API key.');
        return;
    }

    // Try to get the user's location automatically
    requestUserLocation();
}

// Attach all the event listeners for user interactions
function attachEventListeners() {
    try {
        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');

        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', handleCitySearch);
            searchInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    handleCitySearch();
                }
            });
        }

        // Location button
        const locationBtn = document.getElementById('locationBtn');
        if (locationBtn) {
            locationBtn.addEventListener('click', requestUserLocation);
        }

        // Temperature unit toggles
        const celsiusBtn = document.getElementById('celsiusBtn');
        const fahrenheitBtn = document.getElementById('fahrenheitBtn');

        if (celsiusBtn) {
            celsiusBtn.addEventListener('click', () => changeTemperatureUnit('celsius'));
        }
        if (fahrenheitBtn) {
            fahrenheitBtn.addEventListener('click', () => changeTemperatureUnit('fahrenheit'));
        }
    } catch (error) {
        console.error('Error attaching event listeners:', error);
    }
}

// ========== LOCATION SERVICES ==========
// Get the user's current location using the browser's geolocation API
function requestUserLocation() {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
        showErrorMessage('Your browser doesn\'t support location services.');
        // Fall back to a default city
        loadWeatherForCity('New York');
        return;
    }

    showLoadingIndicator();

    // Request location with success and error callbacks
    navigator.geolocation.getCurrentPosition(
        // Success callback - got the coordinates
        (position) => {
            const { latitude, longitude } = position.coords;
            loadWeatherForCoordinates(latitude, longitude);
        },
        // Error callback - couldn't get location
        (error) => {
            hideLoadingIndicator();
            showErrorMessage('Couldn\'t access your location. Please search for a city instead.');
            // Show weather for a major city as fallback
            loadWeatherForCity('London');
        }
    );
}

// ========== SEARCH HANDLING ==========
// Handle when user searches for a city
function handleCitySearch() {
    const searchTerm = domElements.citySearchInput.value.trim();

    if (!searchTerm) {
        showErrorMessage('Please enter a city name to search.');
        return;
    }

    loadWeatherForCity(searchTerm);
}

// ========== WEATHER API CALLS ==========
// Load weather data for a specific city
async function loadWeatherForCity(cityName) {
    try {
        showLoadingIndicator();
        hideErrorMessage();

        // First, get the city's coordinates from the name
        const coordinatesResponse = await fetch(
            `${WEATHER_BASE_URL}/weather?q=${encodeURIComponent(cityName)}&appid=${WEATHER_API_KEY}&units=metric`
        );

        if (!coordinatesResponse.ok) {
            throw new Error(`Couldn\'t find weather for "${cityName}". Try a different city name.`);
        }

        const cityData = await coordinatesResponse.json();
        const { lat, lon } = cityData.coord;

        // Now get the full weather data using coordinates
        await loadWeatherForCoordinates(lat, lon, cityData.name);

    } catch (error) {
        hideLoadingIndicator();
        showErrorMessage(error.message || 'Failed to load weather data. Please try again.');
    }
}

// ========== WEATHER API CALLS ==========
async function loadWeatherForCoordinates(latitude, longitude, cityNameOverride = null) {
    try {
        showLoadingIndicator();
        hideErrorMessage();

        // If we don't have a city name, get it from coordinates
        let finalCityName = cityNameOverride;
        if (!finalCityName) {
            try {
                const cityResponse = await fetch(
                    `${WEATHER_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
                );
                if (cityResponse.ok) {
                    const cityData = await cityResponse.json();
                    finalCityName = cityData.name;
                }
            } catch (error) {
                console.log('Could not get city name from coordinates, using coordinates only');
            }
        }

        // Get the forecast data (5-day, 3-hour intervals)
        const forecastResponse = await fetch(
            `${WEATHER_BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
        );

        // Also get current weather data
        const currentWeatherResponse = await fetch(
            `${WEATHER_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
        );

        // Check if both requests succeeded
        if (!forecastResponse.ok || !currentWeatherResponse.ok) {
            throw new Error('Weather service is temporarily unavailable.');
        }

        const forecastData = await forecastResponse.json();
        const currentData = await currentWeatherResponse.json();

        // Validate API response structure
        if (!currentData || !currentData.sys || !forecastData || !forecastData.list) {
            throw new Error('Invalid response from weather service.');
        }

        // Store the data for later use
        currentWeatherInfo = {
            current: currentData,
            forecast: forecastData,
            location: finalCityName
        };

        // Debug: Log the sunrise and sunset data
        console.log('Raw API data - Sunrise:', currentData.sys.sunrise, 'Sunset:', currentData.sys.sunset, 'Timezone:', currentData.timezone);

        // Display everything on the page
        updateWeatherDisplay(currentWeatherInfo);
        hideLoadingIndicator();

    } catch (error) {
        hideLoadingIndicator();
        console.error('Error loading weather data:', error);
        showErrorMessage(error.message || 'Something went wrong loading the weather data.');
    }
}

// ========== DISPLAY FUNCTIONS ==========
function updateWeatherDisplay(weatherData) {
    try {
        const { current, forecast, location } = weatherData;

        if (!current || !forecast) {
            throw new Error('Invalid weather data provided');
        }

        // Show current weather conditions
        showCurrentWeather(current, location);

        // Create 5-day temperature chart
        if (forecast.list && forecast.list.length > 0) {
            create5DayChart(forecast.list);
        }

        // Show next 8 hours of forecast
        if (forecast.list && forecast.list.length >= 8) {
            showHourlyForecast(forecast.list.slice(0, 8));
        }

        // Show 7-day forecast
        if (forecast.list && forecast.list.length > 0) {
            showDailyForecast(forecast.list);
        }

        // Make the main content visible
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.classList.add('active');
        }

    } catch (error) {
        console.error('Error updating weather display:', error);
        showErrorMessage('Error displaying weather data');
    }
}

// Display current weather in the original layout
function showCurrentWeather(weatherData, cityName) {
    try {
        if (!weatherData || !weatherData.main) {
            throw new Error('Invalid weather data');
        }

        // Location and date
        const cityNameElement = document.getElementById('cityName');
        const currentDateElement = document.getElementById('currentDate');

        if (cityNameElement) cityNameElement.textContent = cityName;
        if (currentDateElement) currentDateElement.textContent = formatCurrentDate(new Date());

        // Main temperature
        const currentTemp = temperatureUnit === 'celsius' ? weatherData.main.temp : convertToFahrenheit(weatherData.main.temp);
        const feelsLikeTemp = temperatureUnit === 'celsius' ? weatherData.main.feels_like : convertToFahrenheit(weatherData.main.feels_like);

        const mainTempElement = document.getElementById('mainTemp');
        const feelsLikeElement = document.getElementById('feelsLike');
        const weatherConditionElement = document.getElementById('weatherCondition');

        if (mainTempElement) mainTempElement.textContent = `${Math.round(currentTemp)}°`;
        if (feelsLikeElement) feelsLikeElement.textContent = `${Math.round(feelsLikeTemp)}°`;
        if (weatherConditionElement) weatherConditionElement.textContent = weatherData.weather[0].description;

        // Weather icon
        const weatherIconElement = document.getElementById('mainWeatherIcon');
        if (weatherIconElement && weatherData.weather && weatherData.weather[0]) {
            const iconClass = getWeatherIconClass(weatherData.weather[0].id, weatherData.weather[0].icon);
            weatherIconElement.className = iconClass;
        }

        // Weather metrics (with safe access)
        const elements = {
            windSpeed: document.getElementById('windSpeed'),
            humidity: document.getElementById('humidity'),
            pressure: document.getElementById('pressure'),
            visibility: document.getElementById('visibility'),
            uvIndex: document.getElementById('uvIndex'),
            cloudiness: document.getElementById('cloudiness')
        };

        if (elements.windSpeed) elements.windSpeed.textContent = `${weatherData.wind.speed} m/s`;
        if (elements.humidity) elements.humidity.textContent = `${weatherData.main.humidity}%`;
        if (elements.pressure) elements.pressure.textContent = `${weatherData.main.pressure} hPa`;
        if (elements.visibility) elements.visibility.textContent = `${(weatherData.visibility / 1000).toFixed(1)} km`;
        if (elements.uvIndex) elements.uvIndex.textContent = '--'; // Not available in free tier
        if (elements.cloudiness) elements.cloudiness.textContent = `${weatherData.clouds.all}%`;

        // Skip sunrise/sunset display (removed as requested)
        console.log('Sunrise/sunset feature disabled');

        // Update background based on weather
        updatePageBackground(weatherData.weather[0].id);

    } catch (error) {
        console.error('Error displaying current weather:', error);
    }
}

// Display the hourly forecast
function showHourlyForecast(hourlyWeatherData) {
    try {
        const container = document.getElementById('hourlyContainer');
        if (!container) {
            console.error('Hourly forecast container not found');
            return;
        }

        if (!hourlyWeatherData || !Array.isArray(hourlyWeatherData)) {
            console.error('Invalid hourly weather data');
            return;
        }

        container.innerHTML = '';

        hourlyWeatherData.forEach(hourData => {
            try {
                if (!hourData || !hourData.main || !hourData.weather || !hourData.weather[0]) {
                    return; // Skip invalid data points
                }

                const hourTemp = temperatureUnit === 'celsius' ? hourData.main.temp : convertToFahrenheit(hourData.main.temp);
                const hourTime = new Date(hourData.dt * 1000);

                const hourElement = document.createElement('div');
                hourElement.className = 'hourly-card';
                hourElement.innerHTML = `
                    <p class="hourly-time">${formatHourDisplay(hourTime)}</p>
                    <i class="${getWeatherIconClass(hourData.weather[0].id, hourData.weather[0].icon)}"></i>
                    <p class="hourly-temp">${Math.round(hourTemp)}°</p>
                    <p class="hourly-desc">${hourData.weather[0].description}</p>
                `;

                container.appendChild(hourElement);
            } catch (error) {
                console.error('Error processing hourly data point:', error);
            }
        });

    } catch (error) {
        console.error('Error displaying hourly forecast:', error);
    }
}

// Display the daily forecast for the next 7 days
function showDailyForecast(forecastList) {
    try {
        const container = document.getElementById('dailyContainer');
        if (!container) {
            console.error('Daily forecast container not found');
            return;
        }

        if (!forecastList || !Array.isArray(forecastList)) {
            console.error('Invalid daily forecast data');
            return;
        }

        container.innerHTML = '';

        // Group forecast data by day using proper date handling
        const weatherByDay = {};
        forecastList.forEach(forecastItem => {
            try {
                if (!forecastItem || !forecastItem.dt) return;

                const date = new Date(forecastItem.dt * 1000);
                const dayKey = date.toDateString();
                if (!weatherByDay[dayKey]) {
                    weatherByDay[dayKey] = [];
                }
                weatherByDay[dayKey].push(forecastItem);
            } catch (error) {
                console.error('Error processing forecast item:', error);
            }
        });

        // Get the next 7 days starting from today
        const today = new Date();
        const next7Days = [];

        for (let i = 0; i < 7; i++) {
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + i);
            const dateKey = futureDate.toDateString();

            if (weatherByDay[dateKey]) {
                next7Days.push({
                    date: futureDate,
                    data: weatherByDay[dateKey],
                    isToday: i === 0
                });
            }
        }

        // Process each day's data
        next7Days.forEach((dayInfo, dayIndex) => {
            try {
                const dayWeatherData = dayInfo.data;
                const dailyTemperatures = dayWeatherData.map(item => item.main.temp);
                const highTemp = Math.max(...dailyTemperatures);
                const lowTemp = Math.min(...dailyTemperatures);

                // Find the most common weather condition for the day
                const weatherTypeCounts = {};
                dayWeatherData.forEach(item => {
                    if (item.weather && item.weather[0]) {
                        const weatherType = item.weather[0].id;
                        weatherTypeCounts[weatherType] = (weatherTypeCounts[weatherType] || 0) + 1;
                    }
                });

                const mostCommonWeatherType = dayWeatherData.find(
                    item => item.weather && item.weather[0] && item.weather[0].id === parseInt(Object.keys(weatherTypeCounts).reduce((a, b) =>
                        weatherTypeCounts[a] > weatherTypeCounts[b] ? a : b
                    ))
                );

                if (!mostCommonWeatherType || !mostCommonWeatherType.weather || !mostCommonWeatherType.weather[0]) {
                    return; // Skip if no valid weather data
                }

                const displayHighTemp = temperatureUnit === 'celsius' ? highTemp : convertToFahrenheit(highTemp);
                const displayLowTemp = temperatureUnit === 'celsius' ? lowTemp : convertToFahrenheit(lowTemp);

                // Format the day name and date correctly
                const dayName = dayInfo.isToday ? 'Today' : dayInfo.date.toLocaleDateString('en-US', { weekday: 'long' });
                const dayDate = dayInfo.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                const dayElement = document.createElement('div');
                dayElement.className = 'daily-card';
                dayElement.innerHTML = `
                    <div class="daily-date">
                        <div>${dayName}</div>
                        <div class="daily-day">${dayDate}</div>
                    </div>
                    <div class="daily-icon">
                        <i class="${getWeatherIconClass(mostCommonWeatherType.weather[0].id, mostCommonWeatherType.weather[0].icon)}"></i>
                    </div>
                    <div class="daily-desc">
                        <div class="daily-desc-main">${mostCommonWeatherType.weather[0].main}</div>
                        <div class="daily-desc-detail">${mostCommonWeatherType.weather[0].description}</div>
                    </div>
                    <div class="daily-temp">
                        <div class="daily-temp-high">${Math.round(displayHighTemp)}°</div>
                        <div class="daily-temp-low">${Math.round(displayLowTemp)}°</div>
                    </div>
                `;

                container.appendChild(dayElement);
            } catch (error) {
                console.error('Error processing daily forecast data:', error);
            }
        });

    } catch (error) {
        console.error('Error displaying daily forecast:', error);
    }
}

// ========== 5-DAY TEMPERATURE CHART ==========
function create5DayChart(forecastData) {
    try {
        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded. Chart will not be displayed.');
            return;
        }

        // Check if canvas element exists
        const canvas = domElements.temperatureChartCanvas;
        if (!canvas) {
            console.error('Temperature chart canvas element not found');
            return;
        }

        // Destroy existing chart if it exists
        if (temperatureChart) {
            temperatureChart.destroy();
        }

        // Group forecast data by day (5 days)
        const dailyData = {};
        forecastData.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateKey = date.toDateString();
            if (!dailyData[dateKey]) {
                dailyData[dateKey] = [];
            }
            dailyData[dateKey].push(item);
        });

        // Get 5 days of data starting from today
        const today = new Date();
        const next5Days = [];

        for (let i = 0; i < 5; i++) {
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + i);
            const dateKey = futureDate.toDateString();

            if (dailyData[dateKey]) {
                next5Days.push({
                    date: futureDate,
                    data: dailyData[dateKey]
                });
            }
        }

        // Need at least 2 days of data for a meaningful chart
        if (next5Days.length < 2) {
            console.log('Not enough forecast data for temperature chart');
            return;
        }

        // Create labels for the next 5 days
        const labels = next5Days.map(day => {
            const today = new Date();
            const isToday = day.date.toDateString() === today.toDateString();

            if (isToday) {
                return 'Today';
            } else {
                return day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            }
        });

        // Calculate high and low temperatures for each day
        const highTemps = next5Days.map(day => {
            const temps = day.data.map(d => temperatureUnit === 'celsius' ? d.main.temp : convertToFahrenheit(d.main.temp));
            return Math.round(Math.max(...temps));
        });

        const lowTemps = next5Days.map(day => {
            const temps = day.data.map(d => temperatureUnit === 'celsius' ? d.main.temp : convertToFahrenheit(d.main.temp));
            return Math.round(Math.min(...temps));
        });

        const ctx = canvas.getContext('2d');

        temperatureChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: `High Temperature (°${temperatureUnit === 'celsius' ? 'C' : 'F'})`,
                        data: highTemps,
                        borderColor: '#FFD700',
                        backgroundColor: 'rgba(255, 215, 0, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        pointBackgroundColor: '#FFD700',
                        pointBorderColor: '#000000',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    },
                    {
                        label: `Low Temperature (°${temperatureUnit === 'celsius' ? 'C' : 'F'})`,
                        data: lowTemps,
                        borderColor: '#00D4FF',
                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        pointBackgroundColor: '#00D4FF',
                        pointBorderColor: '#000000',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#FFFFFF',
                            font: {
                                family: 'Poppins',
                                size: 12,
                                weight: 500
                            },
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(20, 20, 20, 0.95)',
                        titleColor: '#FFFFFF',
                        bodyColor: '#E0E0E0',
                        borderColor: '#00D4FF',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#FFFFFF',
                            font: {
                                family: 'Poppins',
                                size: 11
                            },
                            callback: function(value) {
                                return value + '°' + (temperatureUnit === 'celsius' ? 'C' : 'F');
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#FFFFFF',
                            font: {
                                family: 'Poppins',
                                size: 11
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });

        console.log('Temperature chart created successfully');

    } catch (error) {
        console.error('Error creating temperature chart:', error);
    }
}

// ========== UTILITY FUNCTIONS ==========
// Get the appropriate FontAwesome icon class for weather conditions
function getWeatherIconClass(weatherCode, iconCode) {
    // Thunderstorms
    if (weatherCode >= 200 && weatherCode < 300) return 'fas fa-bolt';

    // Drizzle
    if (weatherCode >= 300 && weatherCode < 400) return 'fas fa-cloud-rain';

    // Rain
    if (weatherCode >= 500 && weatherCode < 600) return 'fas fa-cloud-showers-heavy';

    // Snow
    if (weatherCode >= 600 && weatherCode < 700) return 'fas fa-snowflake';

    // Atmospheric conditions (fog, mist, etc.)
    if (weatherCode >= 700 && weatherCode < 800) return 'fas fa-smog';

    // Clear sky - different icons for day/night
    if (weatherCode === 800) {
        return iconCode.includes('d') ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Few clouds
    if (weatherCode === 801) return 'fas fa-cloud-sun';

    // Lots of clouds
    if (weatherCode > 801) return 'fas fa-cloud';

    // Default fallback
    return 'fas fa-cloud';
}

// Format date for display
function formatCurrentDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format time for hourly display
function formatHourDisplay(date) {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true
    });
}

// Format day name for daily forecast
function formatDayOfWeek(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
}

// Temperature conversion utility
function convertToFahrenheit(celsiusTemp) {
    return (celsiusTemp * 9/5) + 32;
}

// Change temperature display unit
function changeTemperatureUnit(newUnit) {
    if (temperatureUnit === newUnit) return;

    temperatureUnit = newUnit;

    // Update button styling
    if (newUnit === 'celsius') {
        domElements.celsiusButton.classList.add('active');
        domElements.fahrenheitButton.classList.remove('active');
    } else {
        domElements.fahrenheitButton.classList.add('active');
        domElements.celsiusButton.classList.remove('active');
    }

    // Redisplay weather data with new unit
    if (currentWeatherInfo) {
        updateWeatherDisplay(currentWeatherInfo);
    }
}

// Update the page background based on weather conditions - Professional Black Theme
function updatePageBackground(weatherCode) {
    const bodyElement = document.body;

    // Clear any existing classes
    bodyElement.className = '';

    // Set professional black gradient variations based on weather
    if (weatherCode >= 200 && weatherCode < 300) {
        // Thunderstorms - deep black with purple hints
        bodyElement.style.background = 'linear-gradient(135deg, #000000 0%, #1a0a1a 50%, #2a1a2a 100%)';
    } else if (weatherCode >= 500 && weatherCode < 600) {
        // Rain - black with blue undertones
        bodyElement.style.background = 'linear-gradient(135deg, #000000 0%, #0a1a2a 50%, #1a2a3a 100%)';
    } else if (weatherCode >= 600 && weatherCode < 700) {
        // Snow - black with silver hints
        bodyElement.style.background = 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2a2a2a 100%)';
    } else if (weatherCode === 800) {
        // Clear skies - professional black with gold accent
        bodyElement.style.background = 'linear-gradient(135deg, #0a0a0a 0%, #1a1a0a 50%, #2a2a1a 100%)';
    } else if (weatherCode > 800) {
        // Cloudy - standard professional black
        bodyElement.style.background = 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2a2a2a 100%)';
    } else {
        // Default professional black
        bodyElement.style.background = 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2a2a2a 100%)';
    }
}

// ========== UI STATE MANAGEMENT ==========
// Show the loading spinner
function showLoadingIndicator() {
    domElements.loadingIndicator.classList.add('active');
    domElements.weatherDisplay.classList.remove('active');
    hideErrorMessage();
}

// Hide the loading spinner
function hideLoadingIndicator() {
    domElements.loadingIndicator.classList.remove('active');
}

// Show an error message to the user
function showErrorMessage(message) {
    domElements.errorMessageText.textContent = message;
    domElements.errorDisplay.classList.add('active');
}

// Hide the error message
function hideErrorMessage() {
    domElements.errorDisplay.classList.remove('active');
}

// ========== END OF WEATHER DASHBOARD ==========
// Built with ❤️ for providing accurate, beautiful weather information
