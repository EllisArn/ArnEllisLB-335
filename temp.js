import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import * as Location from 'expo-location'
import { Table, Row, Rows } from 'react-native-table-component'
import * as ImagePicker from 'expo-image-picker'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as MediaLibrary from 'expo-media-library'
import { captureRef } from 'react-native-view-shot'
import domtoimage from 'dom-to-image'
import * as Sensors from 'expo-sensors'

export default function App() {
  const [weatherData, setWeatherData] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const { coords } = await getLocation()
        const { latitude, longitude } = coords
        const data = await getWeather(latitude, longitude)
        setWeatherData(data)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  async function getLocation() {
    try {
      const location = await Location.getCurrentPositionAsync({})
      return location
    } catch (error) {
      console.error('Error getting location:', error)
      throw error
    }
  }

  async function getWeather(latitude, longitude) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,daily,alerts&units=metric&appid=${process.env.EXPO_PUBLIC_WEATHER_API_KEY}`
      )
      const data = await response.json()
      console.log(data)
      return data
    } catch (error) {
      console.error('Error fetching weather data:', error)
      throw error
    }
  }

  function displayWeatherData(weatherData) {
    if (!weatherData) return null

    const currentWeather = weatherData.current
    const timezoneOffsetHours = weatherData.timezone_offset / 3600 // Convert seconds to hours

    const currentDate = new Date(currentWeather.dt * 1000)
    const currentTime = currentDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })

    const sunriseTime = new Date(
      currentWeather.sunrise * 1000
    ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const sunsetTime = new Date(
      currentWeather.sunset * 1000
    ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const tableData = [
      ['Latitude', weatherData.lat.toString() + '°'],
      ['Longitude', weatherData.lon.toString() + '°'],
      [
        'Timezone',
        `${weatherData.timezone.toString().replace('_', ' ')} (${
          timezoneOffsetHours > 0 ? '+' : ''
        }${timezoneOffsetHours}h)`,
      ],
      ['Date', currentDate.toLocaleDateString()],
      ['Time', currentTime],
      ['Sunrise', sunriseTime],
      ['Sunset', sunsetTime],
      ['Temperature', `${currentWeather.temp}°C`],
      ['Feels Like', `${currentWeather.feels_like}°C`],
      ['Pressure', `${currentWeather.pressure} hPa`],
      ['Humidity', `${currentWeather.humidity}%`],
      ['Dew Point', `${currentWeather.dew_point}°C`],
      ['UV Index', currentWeather.uvi.toString()],
      ['Clouds', `${currentWeather.clouds}%`],
      ['Visibility', `${currentWeather.visibility} meters`],
      ['Wind Speed', `${currentWeather.wind_speed} m/s`],
      ['Wind Degree', `${currentWeather.wind_deg}°`],
      ['Weather', currentWeather.weather[0].description],
    ]

    return (
      <View style={styles.weatherContainer}>
        <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
          <Rows data={tableData} textStyle={styles.text} style={styles.row} />
        </Table>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Momentograph</Text>
      <StatusBar style="auto" />
      {weatherData && displayWeatherData(weatherData)}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  text: {
    backgroundColor: '#000',
    color: '#fff',
  },
  weatherContainer: {
    marginTop: 20,
    padding: 10,
    borderColor: '#fff',
    borderWidth: 1,
  },
  row: { height: 40, width: 500, backgroundColor: '#000' },
  text: { textAlign: 'center', color: '#fff' },
})
