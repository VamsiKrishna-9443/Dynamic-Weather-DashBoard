# 🌤️ Dynamic Weather Dashboard

A modern, professional weather dashboard that provides real-time weather information with a beautiful and intuitive user interface. Built with vanilla JavaScript, HTML5, and CSS3.

![Weather Dashboard](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

### 🎯 Core Features
- **Real-time Weather Data** - Get current weather conditions for any location
- **Geolocation Support** - Automatically detect user's location
- **City Search** - Search for weather by city name
- **7-Day Forecast** - View weather predictions for the week ahead
- **Hourly Forecast** - Detailed hourly weather breakdown (up to 24 hours)
- **Temperature Toggle** - Switch between Celsius and Fahrenheit
- **Dynamic Backgrounds** - Background changes based on weather conditions

### 📊 Weather Information Displayed
- Current temperature and "feels like" temperature
- Weather condition with descriptive icons
- Wind speed and direction
- Humidity percentage
- Atmospheric pressure
- Visibility distance
- Cloud coverage percentage
- Sunrise and sunset times
- High and low temperatures for each day

### 🎨 Design Features
- **Modern UI/UX** - Clean, professional interface
- **Glassmorphism Design** - Beautiful glass-effect cards with backdrop blur
- **Gradient Backgrounds** - Smooth, animated gradient backgrounds
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Smooth Animations** - Elegant transitions and hover effects
- **Weather Icons** - Font Awesome icons for visual representation
- **Loading States** - Professional loading spinner
- **Error Handling** - User-friendly error messages

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- An internet connection
- OpenWeatherMap API key (free tier available)

### Installation

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd weather-dashboard
   ```

2. **Get your free API key**
   - Visit [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Navigate to API Keys section
   - Copy your API key

3. **Configure the API key**
   - Open `script.js` in a text editor
   - Find the line: `const API_KEY = 'YOUR_API_KEY_HERE';`
   - Replace `YOUR_API_KEY_HERE` with your actual API key
   ```javascript
   const API_KEY = 'your_actual_api_key_here';
   ```

4. **Run the application**
   - Simply open `index.html` in your web browser
   - Or use a local server (recommended):
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx http-server
     ```
   - Navigate to `http://localhost:8000` in your browser

## 📖 Usage

### Search for a City
1. Type a city name in the search box
2. Click the "Search" button or press Enter
3. View the weather information for that location

### Use Your Location
1. Click the location icon button (📍)
2. Allow location access when prompted
3. The dashboard will display weather for your current location

### Toggle Temperature Units
- Click the °C button to view temperatures in Celsius
- Click the °F button to view temperatures in Fahrenheit

## 🏗️ Project Structure

```
weather-dashboard/
│
├── index.html          # Main HTML structure
├── styles.css          # CSS styles and animations
├── script.js           # JavaScript functionality and API integration
└── README.md          # Project documentation
```

## 🛠️ Technologies Used

- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with:
  - CSS Grid & Flexbox
  - Glassmorphism effects
  - Gradient backgrounds
  - Keyframe animations
  - Media queries for responsiveness
- **JavaScript (ES6+)** - Core functionality with:
  - Async/Await for API calls
  - Geolocation API
  - DOM manipulation
  - Event handling
- **OpenWeatherMap API** - Weather data provider
- **Font Awesome** - Icon library
- **Google Fonts (Poppins)** - Typography

## 🌐 API Reference

This project uses the OpenWeatherMap API:

- **Current Weather Data**: `/weather` endpoint
- **5-Day Forecast**: `/forecast` endpoint

### API Endpoints Used
```javascript
// Current weather by city
GET https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric

// Current weather by coordinates
GET https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric

// 5-day forecast
GET https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}&units=metric
```

## 📱 Responsive Design

The dashboard is fully responsive and optimized for:
- **Desktop** (1024px and above)
- **Tablet** (768px - 1023px)
- **Mobile** (480px - 767px)
- **Small Mobile** (below 480px)

## ⚡ Performance Features

- Efficient API calls with error handling
- Lazy loading of forecast data
- Optimized animations with CSS transforms
- Minimal JavaScript bundle size (vanilla JS, no frameworks)
- Fast page load times

## 🔒 Privacy & Security

- No user data is stored or collected
- API key is required for the application to function
- Geolocation is only used when explicitly granted by the user
- All API calls are made over HTTPS

## 🐛 Troubleshooting

### Common Issues

1. **"Please add your OpenWeatherMap API key" error**
   - Make sure you've replaced `YOUR_API_KEY_HERE` in `script.js` with your actual API key

2. **"City not found" error**
   - Check the spelling of the city name
   - Try searching with the country name (e.g., "London, UK")

3. **Geolocation not working**
   - Ensure you've granted location permissions in your browser
   - Check if your browser supports geolocation
   - Try searching for a city manually

4. **Weather data not loading**
   - Check your internet connection
   - Verify your API key is valid and active
   - Check the browser console for error messages

## 🚀 Future Enhancements

Potential features for future versions:
- [ ] Air quality index display
- [ ] Weather alerts and warnings
- [ ] Multiple location bookmarks
- [ ] Weather maps integration
- [ ] Dark/Light theme toggle
- [ ] Historical weather data
- [ ] Weather-based recommendations
- [ ] Share weather feature
- [ ] PWA (Progressive Web App) capabilities
- [ ] Offline mode with cached data

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Created with ❤️ as part of the IBM Frontend Project Challenge

## 🙏 Acknowledgments

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Icons from [Font Awesome](https://fontawesome.com/)
- Fonts from [Google Fonts](https://fonts.google.com/)

## 📞 Support

If you encounter any issues or have questions:
1. Check the Troubleshooting section above
2. Review the OpenWeatherMap API documentation
3. Check the browser console for error messages

---

**Note**: This project uses the free tier of OpenWeatherMap API, which has the following limitations:
- 60 calls per minute
- 1,000,000 calls per month
- Current weather and 5-day forecast only

For advanced features like hourly forecast for more days or historical data, consider upgrading to a paid plan.

## 🎯 Project Highlights

This project demonstrates proficiency in:
- ✅ Modern JavaScript (ES6+) with async/await
- ✅ RESTful API integration
- ✅ Responsive web design
- ✅ CSS animations and transitions
- ✅ DOM manipulation
- ✅ Error handling and user feedback
- ✅ Browser APIs (Geolocation)
- ✅ Clean code organization
- ✅ Professional UI/UX design

---

**Made with precision and attention to detail** 🌟
