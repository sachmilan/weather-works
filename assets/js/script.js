const tempElement = $("#temperature");
const humElement = $("#humidity");
const citynameelement = $("#city-name");
const winSElement = $("#wind-speed");
const uvElement = $("#UV-index");
const weatElement = $("#weather-icon");
const datesElement = $("#date");
const futforcasterElement = $("#five-day-forecast-boxes");
const cityelement = $("#city-input");
const historyelement = $("#history");
const timesElement = $("#time");
const searchbutton = $("#search-button");
const removebutton = $("#clear-history-button");

// my unique api key
const apiKey = "1291db61f641ff72ce7519899878bf5a";

// storing search hist for cities
let settimedate = null;
let citiessaved = JSON.parse(localStorage.getItem("city-search-history")) || [];

// fetch the response
const primecity = (event) => {

    // prevent refresh
    event.preventDefault();

    // creating variables for user input
    const city = cityelement.val().trim();
    const weaturl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${apiKey}`;

    // alert for empty
    if (!city) {
        window.alert("Please enter the name of a city");
        return;
    }

    // fetch data from the respective source
    fetch(weaturl)
        .then(function (response) {

            if (response.status >= 400 && response.status < 500) {
                window.alert("Could not find that city. Please try again!");
                return;
            }
            // pulls JSON response
            return response.json();
        })
        .then(function (data) {

        
            renderWeather(data);
            
            
            const city = data.name;
            const country = data.sys.country;

            
            savedhist(city, country);

        });

};


const oldCity = (event) => {

    event.preventDefault();

    const city = $(event.target).val();

    // URL for query
    const weaturl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${apiKey}`;

    fetch(weaturl)
        .then(function (response) {
            return response.json();
        })
        .then(renderWeather);

};


const renderWeather = (data) => {

    // saving as var
    const weatherIcon = data.weather[0].icon;
    const cityName = data.name;
    const timezonevalue = data.timezone;
    const kelvin = data.main.temp;
    const weatdesc = data.weather[0].description;
    const lon = data.coord.lon;
    const humidity = data.main.humidity;
    const windMPS = data.wind.speed;
    const lat = data.coord.lat;
    const country = data.sys.country;

   // units conversion
    const celsius = keltocel(kelvin);
    const fahrenheit = keltofer(kelvin);
    const mph = mphfromms(windMPS);

    timeanddate(timezonevalue);

    // appends to HTML
    citynameelement.text(`${cityName}, ${country}`);
    tempElement.text(`Temperature: ${celsius}\xB0C (${fahrenheit}\xB0F)`);
    humElement.text(`Humidity: ${humidity}%`);
    winSElement.text(`Wind Speed: ${windMPS} m/s (${mph} MPH)`);
    weatElement.attr("src", `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`);
    weatElement.attr("alt", weatdesc);
    weatElement.attr("title", weatdesc);

    fetchUV(lat, lon);
    fetchForecast(lat, lon);

};

const fetchForecast = (lat, lon) => {

    const forecastURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${apiKey}`;

    fetch(forecastURL)
        .then(function (response) {

            return response.json();

        })
        .then(renderForecast);
};

// data extraction
const renderForecast = (data) => {
    
    const forecasttimezonevalue = data.timezone_offset;
    const forecastList = data.daily;

    //checking for empty elements
    futforcasterElement.empty();

    for (let i = 1; i < 6; i++) {

        // fetch info and save into var
        const iconforc = forecastList[i].weather[0].icon;
        const descforc = forecastList[i].weather[0].description;
        const tempkforecast = forecastList[i].temp.day;
        const humforec = forecastList[i].humidity;
        const forecastWind = forecastList[i].wind_speed;

        const forcasterdate = calcforcdate(forecasttimezonevalue, (24 * i));
        const forecastTempC = keltocel(tempkforecast);
        const forecastWindMPH = mphfromms(forecastWind);
        const forecastTempF = keltofer(tempkforecast);

        const boxforc = $('<div class="five-day-forecast-box pt-2 col-lg-2 bg-primary text-white m-2 rounded">');
        const datett = $("<p>");
        const iconweather = $("<img>");
        const temptt = $("<p>");
        const humdd = $("<p>");
        const windspeeed = $("<p>");

        datett.text(forcasterdate);
        iconweather.attr("src", `https://openweathermap.org/img/wn/${iconforc}@2x.png`);
        iconweather.attr("alt", descforc);
        iconweather.attr("title", descforc);
        temptt.text(`Temperature: ${forecastTempC}\xB0C (${forecastTempF}\xB0F)`);
        humdd.text(`Humidity: ${humforec}%`);
        windspeeed.text(`Wind Speed: ${forecastWind} m/s (${forecastWindMPH} MPH)`);

        futforcasterElement.append(boxforc);
        boxforc.append(datett);
        boxforc.append(iconweather);
        boxforc.append(temptt);
        boxforc.append(humdd);
        boxforc.append(windspeeed);
    }

};

const fetchUV = (lat, lon) => {

    //uses the lat and long
    const uvURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    fetch(uvURL)
        .then(function (response) {
            return response.json();
        })
        .then(uvData)

};

const uvData = (data) => {

    const uv = data.current.uvi;

    const ultraEl = $('<span class="p-1" id="UV-value">');

    uvElement.empty();

    // change the Ultravoilet Index
    if (uv < 3) {
        ultraEl.addClass("bg-success text-white");
        ultraEl.attr("title", "Low");
    } else if (uv >= 3 && uv < 6) {
        ultraEl.addClass("bg-warning");
        ultraEl.attr("title", "Medium");
    } else if (uv >= 6 && uv < 8) {
        ultraEl.addClass("bg-danger text-white");
        ultraEl.attr("title", "High");
    } else if (uv >= 8 && uv < 11) {
        ultraEl.addClass("bg-vhigh text-white");
        ultraEl.attr("title", "Very High");
    } else {
        ultraEl.addClass("bg-extreme text-white");
        ultraEl.attr("title", "Extremely High");
    }

    uvElement.text("UV Index: ");
    ultraEl.text(` ${uv} `);

    uvElement.append(ultraEl);
};

//temp conversion
const keltofer = (K) => {
    return Number((K - 273.15) * (9/5) + 32).toFixed(2);
};

const keltocel = (K) => {
    return Number(K - 273.15).toFixed(2);
};

// calculate the speed of wind
const mphfromms = (m) => {
    return Number(m * 2.237).toFixed(2);
};


const calcforcdate = (timezonevalue, hours) => {

    const utc = moment.utc()
    const zoneoff = utc.add(timezonevalue, "s");
    const zoneoddhour = zoneoff.add(hours, "h");
    const forcasterdate = zoneoddhour.format("MMMM Do, YYYY");

    return forcasterdate;

};

const timeanddate = (timezonevalue) => {

    clearInterval(settimedate);

    settimedate = setInterval(function() {

        const utc = moment.utc()
        const zoneoff = utc.add(timezonevalue, "s");
        const localDate = zoneoff.format("MMMM Do, YYYY");
        const localTime = zoneoff.format("h:mm:ss A");

        datesElement.text(`Local Date: ${localDate}`);
        timesElement.text(`Local Time: ${localTime}`);

    }, 1000);
    
};

const savedhist = (cityName, countryName) => {

    const beginsearch = {
        city: cityName,
        country: countryName
    };

    const checkduplicate = preventDuplicate(beginsearch, citiessaved);

    if (checkduplicate) {
        return;
    }

    citiessaved.push(beginsearch);

    citiessaved.sort((a,b) => (a.city > b.city) ? 1 : ((b.city > a.city) ? -1 : 0));

    localStorage.setItem("city-search-history", JSON.stringify((citiessaved)));

    renderHistory();

};

const renderHistory = () => {

    citiessaved = JSON.parse(localStorage.getItem("city-search-history")) || [];
    citiessaved.sort((a,b) => (a.city > b.city) ? 1 : ((b.city > a.city) ? -1 : 0));

    historyelement.empty();

    for (let i = 0; i < citiessaved.length; i++) {

        const createBtn = $(`<button class="history-btn list-group-item list-group-item-action text-center" value="${citiessaved[i].city}, ${citiessaved[i].country}">`);
        createBtn.text(`${citiessaved[i].city}, ${citiessaved[i].country}`);

        historyelement.append(createBtn);

    };

};
//clear 
const clearHistory = () => {

    if (citiessaved.length === 0) {
        return;
    }

    // ask for confirmation
    if (window.confirm("Do you want to clear history?")) {

        localStorage.removeItem("city-search-history");
        
        renderHistory();

    }

};

// duplicate prevention
const preventDuplicate = (obj, list) => {

    for (let i = 0; i < list.length; i++) {

        if (JSON.stringify(list[i]) === JSON.stringify(obj)) {

            return true;

        }

    }

    return false;
};

const init = () => {

    renderHistory();
    
    cityelement.select();

};

// calling the functions
searchbutton.click(primecity);
removebutton.click(clearHistory);
historyelement.on("click", ".history-btn", oldCity);
init();

