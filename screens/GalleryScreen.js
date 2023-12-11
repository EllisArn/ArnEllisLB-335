import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native'
import * as MediaLibrary from 'expo-media-library'
import MetadataScreen from './MetadataScreen'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation, useIsFocused } from '@react-navigation/native'

const GalleryScreen = () => {
  const [albumPhotos, setAlbumPhotos] = useState([])
  const [metadataVisible, setMetadataVisible] = useState(false)
  const [selectedMetadata, setSelectedMetadata] = useState(null)
  const [savedImages, setSavedImages] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedImageUri, setSelectedImageUri] = useState(null)

  const loadDarkModeState = async () => {
    const darkModeValue = await AsyncStorage.getItem('darkMode')
    if (darkModeValue !== null) {
      setIsDarkMode(JSON.parse(darkModeValue))
    }
  }

  const isFocused = useIsFocused()

  useEffect(() => {
    if (isFocused) {
      loadDarkModeState()
    }
  }, [isFocused])

  useEffect(() => {
    if (isFocused) {
      getImagesFromDatabase()
    }
  }, [isFocused, refreshKey])

  useEffect(() => {
    if (isFocused) {
      ;(async () => {
        const album = await MediaLibrary.getAlbumAsync('DCIM')
        if (album) {
          const photos = await MediaLibrary.getAssetsAsync({
            album: album,
            mediaType: 'photo',
          })
          setAlbumPhotos(photos.assets)
        }
      })()
    }
  }, [isFocused, refreshKey])

  const getImagesFromDatabase = async () => {
    try {
      const images = await AsyncStorage.getItem('images')
      if (images) {
        console.log('Images from database:', images)
        const imagesArray = JSON.parse(images)
        setSavedImages(imagesArray)
        if (imagesArray.length === 0) {
          setAlbumPhotos([])
        }
      }
    } catch (error) {
      console.error('Error getting images from database:', error)
    }
  }

  const showMetadata = async (photo) => {
    try {
      const asset = await MediaLibrary.getAssetInfoAsync(photo)
      setSelectedImageUri(photo.uri)
      const filename = asset.filename
      const images = await AsyncStorage.getItem('images')
      const imagesArray = images ? JSON.parse(images) : []
      const metadata = imagesArray.find(
        (item) => item.asset.filename === filename
      ).metadata
      console.log('Metadata:', metadata)
      setMetadataVisible(true)
      setSelectedMetadata(metadata)
    } catch (error) {
      console.error('Error getting asset metadata:', error)
    }
  }
  const closeMetadataModal = () => {
    setMetadataVisible(false)
    setSelectedMetadata(null)
    getImagesFromDatabase()
    setRefreshKey((prevKey) => prevKey + 1)
  }

  const filteredAlbumPhotos = albumPhotos.filter(
    (photo) => photo.uri !== null && photo.uri !== undefined
  )
  const filteredSavedImages = savedImages.filter(
    (item) =>
      item.metadata &&
      item.metadata.uri !== null &&
      item.metadata.uri !== undefined
  )

  const CustomTabBar = () => {
    const navigation = useNavigation()

    const goToSettingsScreen = () => {
      navigation.navigate('Settings')
    }

    const goToCameraScreen = () => {
      navigation.navigate('Camera')
    }

    return (
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={goToCameraScreen}>
          <Text style={styles.text}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.text}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={goToSettingsScreen}>
          <Text style={styles.text}>Settings</Text>
        </TouchableOpacity>
      </View>
    )
  }
  const windowWidth = useWindowDimensions().width
  const numColumns = 3
  const imageWidth = (windowWidth - 20) / numColumns - 10

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#000' : '#fff',
    },
    image: {
      width: imageWidth,
      height: imageWidth,
      margin: 5,
    },
    tabBar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#1a1a1a' : '#eee',
      height: 50,
    },
    tabItem: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#1a1a1a' : '#eee',
    },
    text: {
      color: isDarkMode ? '#fff' : '#000',
    },
  })
  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <FlatList
          style={{ flex: 1 }}
          data={filteredAlbumPhotos.concat(
            filteredSavedImages.map((item, index) => ({
              ...item.metadata,
              id: `saved-${index}`,
            }))
          )}
          numColumns={numColumns}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => showMetadata(item)}>
              <Image source={{ uri: item.uri }} style={styles.image} />
            </TouchableOpacity>
          )}
        />
      </View>
      <CustomTabBar />
      <MetadataScreen
        visible={metadataVisible}
        metadata={selectedMetadata}
        onClose={closeMetadataModal}
        selectedImageUri={selectedImageUri}
      />
    </View>
  )
}

export default GalleryScreen
