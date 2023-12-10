import React, { useState, useEffect, useRef } from 'react'
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native'
import * as MediaLibrary from 'expo-media-library'
import * as Location from 'expo-location'
import { DeviceMotion } from 'expo-sensors'
import { Camera } from 'expo-camera'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'

const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState(null)
  const [type, setType] = useState(Camera.Constants.Type.back)
  const cameraRef = useRef(null)
  const [isTakingPicture, setIsTakingPicture] = useState(false)

  useEffect(() => {
    ;(async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync()
      const DeviceMotionPermission =
        await DeviceMotion.requestPermissionsAsync()
      const locationPermission =
        await Location.requestForegroundPermissionsAsync()
      const mediaLibraryPermission =
        await MediaLibrary.requestPermissionsAsync()

      if (
        cameraPermission.status === 'granted' &&
        DeviceMotionPermission.status === 'granted' &&
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
    if (isTakingPicture) return
    setIsTakingPicture(true)
    DeviceMotion.setUpdateInterval(1)
    let acceleration = {}
    let accelerationIncludingGravity = {}
    let rotation = {}
    let rotationRate = {}
    DeviceMotion.addListener((data) => {
      acceleration = data.acceleration
      accelerationIncludingGravity = data.accelerationIncludingGravity
      rotation = data.rotation
      rotationRate = data.rotationRate
    })

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

        console.log('Taking picture...')
        const photo = await cameraRef.current.takePictureAsync()

        const asset = await MediaLibrary.createAssetAsync(photo.uri)

        const filename = asset.uri.split('/').pop()

        acceleration = Math.sqrt(
          Math.pow(acceleration.x, 2) +
            Math.pow(acceleration.y, 2) +
            Math.pow(acceleration.z, 2)
        )
        accelerationIncludingGravity = Math.sqrt(
          Math.pow(accelerationIncludingGravity.x, 2) +
            Math.pow(accelerationIncludingGravity.y, 2) +
            Math.pow(accelerationIncludingGravity.z, 2)
        )

        const metadata = {
          filename: filename,
          address: `${address[0].street} ${address[0].streetNumber} ${address[0].isoCountryCode}-${address[0].postalCode} ${address[0].city} ${address[0].region} ${address[0].country}`,
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
            humidity: `${currentWeather.humidity}%`,
            weatherDescription: currentWeather.weather[0].description,
            clouds: `${currentWeather.clouds}%`,
            visibility: `${currentWeather.visibility} meters`,
            windSpeed: `${currentWeather.wind_speed} m/s`,
            windDegree: `${currentWeather.wind_deg}°`,
            isDay:
              currentWeather.dt > currentWeather.sunrise &&
              currentWeather.dt < currentWeather.sunset,
            sunrise: sunriseTime,
            sunset: sunsetTime,
            pressure: `${currentWeather.pressure} hPa`,
            dewPoint: `${currentWeather.dew_point}°C`,
            uvIndex: currentWeather.uvi.toString(),
          },
          sensors: [
            { acceleration: `${acceleration} m/s^2` },
            {
              accelerationIncludingGravity: `${accelerationIncludingGravity} m/s^2`,
            },
            {
              rotation: {
                alpha: rotation.alpha,
                beta: rotation.beta,
                gamma: rotation.gamma,
              },
            },
            {
              rotationRate: {
                alpha: `${rotationRate.alpha} deg/s`,
                beta: `${rotationRate.beta} deg/s`,
                gamma: `${rotationRate.gamma} deg/s`,
              },
            },
          ],
        }
        await saveImageToDatabase(asset, metadata)
      } catch (error) {
        console.error('Error capturing photo with metadata:', error)
      } finally {
        DeviceMotion.removeAllListeners()
        setIsTakingPicture(false)
      }
    }
  }

  const saveImageToDatabase = async (imageAsset, metadata) => {
    try {
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
      <View style={styles.footer}>
        <CustomTabBar />
      </View>
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

const CustomTabBar = () => {
  const navigation = useNavigation()

  const goToHomeScreen = () => {
    navigation.navigate('Home')
  }

  const goToGalleryScreen = () => {
    navigation.navigate('Gallery')
  }

  return (
    <View style={styles.tabBar}>
      <TouchableOpacity style={styles.tabItem} onPress={goToHomeScreen}>
        <Text>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tabItem} onPress={goToGalleryScreen}>
        <Text>Gallery</Text>
      </TouchableOpacity>
    </View>
  )
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
    bottom: 60,
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#eee',
    height: 50,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default CameraScreen
