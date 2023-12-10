import React, { useState, useEffect, useRef } from 'react'
import { View, TouchableOpacity, StyleSheet, Image, Text } from 'react-native'
import * as MediaLibrary from 'expo-media-library'
import * as Location from 'expo-location'
import { Accelerometer } from 'expo-sensors'
import { Camera } from 'expo-camera'
import AsyncStorage from '@react-native-async-storage/async-storage'

const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState(null)
  const [type, setType] = useState(Camera.Constants.Type.back)
  const cameraRef = useRef(null)

  useEffect(() => {
    ;(async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync()
      const accelerometerPermission =
        await Accelerometer.requestPermissionsAsync()
      const locationPermission =
        await Location.requestForegroundPermissionsAsync()
      const mediaLibraryPermission =
        await MediaLibrary.requestPermissionsAsync()

      if (
        cameraPermission.status === 'granted' &&
        accelerometerPermission.status === 'granted' &&
        locationPermission.status === 'granted' &&
        mediaLibraryPermission.status === 'granted'
      ) {
        setHasPermission(true)
      } else {
        setHasPermission(false)
      }
    })()
  }, [])
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        // Erfassen der Sensordaten

        // Erfassen der Wetterdaten
        const { coords } = await getLocation()
        const { latitude, longitude } = coords

        // Reverse Geocoding, um die Adresse zu erhalten
        const address = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        })

        const weatherData = await getWeather(latitude, longitude)

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

        // Aufnehmen des Bildes
        const photo = await cameraRef.current.takePictureAsync()

        const asset = await MediaLibrary.createAssetAsync(photo.uri)
        await MediaLibrary.createAlbumAsync('Momentograph', asset, false)

        // Extrahiere den Dateinamen aus der URI
        const filename = asset.uri.split('/').pop()

        const metadata = {
          filename: filename,
          address,
          latitude: weatherData.lat.toString() + '°',
          longitude: weatherData.lon.toString() + '°',
          timezone: `${weatherData.timezone.toString().replace('_', ' ')} (${
            timezoneOffsetHours > 0 ? '+' : ''
          }${timezoneOffsetHours}h)`,
          date: currentDate.toLocaleDateString(),
          time: currentTime,
          weather: {
            temperature: `${currentWeather.temp}°C`,
            feelsLike: `${currentWeather.feels_like}°C`,
            sunrise: sunriseTime,
            sunset: sunsetTime,
            pressure: `${currentWeather.pressure} hPa`,
            humidity: `${currentWeather.humidity}%`,
            dewPoint: `${currentWeather.dew_point}°C`,
            uvIndex: currentWeather.uvi.toString(),
            clouds: `${currentWeather.clouds}%`,
            visibility: `${currentWeather.visibility} meters`,
            windSpeed: `${currentWeather.wind_speed} m/s`,
            windDegree: `${currentWeather.wind_deg}°`,
            weatherDescription: currentWeather.weather[0].description,
          },
        }
        await saveImageToDatabase(asset, metadata)
      } catch (error) {
        console.error('Error capturing photo with metadata:', error)
      }
    }
  }

  // Funktion zum Speichern des Bilds und der Metadaten in der Datenbank
  const saveImageToDatabase = async (imageAsset, metadata) => {
    try {
      // Bildreferenz und Metadaten in der Datenbank speichern
      const images = await AsyncStorage.getItem('images')
      const imagesArray = images ? JSON.parse(images) : []
      imagesArray.push({ asset: imageAsset, metadata: metadata })
      await AsyncStorage.setItem('images', JSON.stringify(imagesArray))
    } catch (error) {
      console.error('Error saving image to database:', error)
    }
  }

  return (
    <View style={styles.container}>
      {hasPermission === null ? (
        <View />
      ) : hasPermission === false ? (
        <Text>No access to camera</Text>
      ) : (
        <View style={styles.cameraContainer}>
          <Camera
            style={styles.camera}
            type={type}
            ratio={'16:9'}
            ref={(ref) => {
              cameraRef.current = ref
            }}
          >
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => takePicture()}
              ></TouchableOpacity>
            </View>
          </Camera>
        </View>
      )}
    </View>
  )
}

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
    return data
  } catch (error) {
    console.error('Error fetching weather data:', error)
    throw error
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    marginHorizontal: 15,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
})

export default CameraScreen
