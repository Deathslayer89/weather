import moment from 'moment';

const API_KEY = process.env.REACT_APP_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/";
const getWeatherData = (infoType, searchParams) => {
  const url = new URL(BASE_URL + infoType);
  url.search = new URLSearchParams({ ...searchParams, appid: API_KEY });
  return fetch(url).then((res) => res.json());
};

const formatCurrentWeather = (data) => {
  const {
    coord: { lat, lon },
    main: { temp, feels_like, temp_min, temp_max, humidity },
    name,
    dt,
    sys: { country, sunrise, sunset },
    weather,
    wind: { speed },
  } = data;

  const { main: details, icon } = weather[0];

  return {
    curr_dt: Date.now(),
    lat,
    lon,
    temp,
    feels_like,
    temp_min,
    temp_max,
    humidity,
    name,
    dt,
    country,
    sunrise,
    sunset,
    details,
    icon,
    speed,
  };
};

const formatForecastWeather = (data) => {
  console.log(data);
  let { city, list } = data;

  let timezone = city.timezone;

  let three_hour = list.slice(1, 6).map((d) => {
    return {
      title: formatToLocalTime(d.dt*1000, timezone, "hh:mm a"),
      temp: d.main.temp,
      icon: d.weather[0].icon,
    };
  })

  let daily = [];
  for (let i = 1; i < 40; i += 8) {
    let d = list[i];
    daily.push(
      {
        title: formatToLocalTime(d.dt*1000, timezone, "hh:mm a"),
        temp: d.main.temp,
        icon: d.weather[0].icon,
      }
    )
  }

  return { timezone, three_hour, daily };

};

const getFormattedWeatherData = async (searchParams) => {
  const formattedCurrentWeather = await getWeatherData(
    "weather",
    searchParams
  ).then(formatCurrentWeather);

  const { lat, lon } = formattedCurrentWeather;

  const formattedForecastWeather = await getWeatherData("forecast", {
    lat,
    lon,
    units: searchParams.units,
  }).then(formatForecastWeather);

  return { ...formattedCurrentWeather, ...formattedForecastWeather };
}

function formatToLocalTime(sec, timezone, format = "dddd, MMM Do YYYY [Local time:] hh:mm A") {
   let x=moment.utc(sec+timezone*1000).format(format);
   return x;
}

const iconUrlFromCode = (code) =>
  `http://openweathermap.org/img/wn/${code}@2x.png`;

export default getFormattedWeatherData;

export { formatToLocalTime, iconUrlFromCode };
