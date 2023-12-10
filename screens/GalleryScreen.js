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
import { useNavigation } from '@react-navigation/native'

const GalleryScreen = () => {
  const [albumPhotos, setAlbumPhotos] = useState([])
  const [metadataVisible, setMetadataVisible] = useState(false)
  const [selectedMetadata, setSelectedMetadata] = useState(null)
  const [savedImages, setSavedImages] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    getImagesFromDatabase()
  }, [refreshKey])

  useEffect(() => {
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
  }, [refreshKey])

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

  const windowWidth = useWindowDimensions().width
  const numColumns = 3
  const imageWidth = (windowWidth - 20) / numColumns - 10

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000',
      paddingHorizontal: 5,
    },
    image: {
      width: imageWidth,
      height: imageWidth,
      margin: 5,
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

    const goToHomeScreen = () => {
      navigation.navigate('Home')
    }

    const goToCameraScreen = () => {
      navigation.navigate('Camera')
    }

    return (
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={goToHomeScreen}>
          <Text>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={goToCameraScreen}>
          <Text>Camera</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        style={{ flex: 1 }}
        data={filteredAlbumPhotos.concat(
          filteredSavedImages.map((item, index) => ({
            ...item.metadata,
            id: `saved-${index}`,
          }))
        )}
        numColumns={3}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => showMetadata(item)}>
            <Image source={{ uri: item.uri }} style={styles.image} />
          </TouchableOpacity>
        )}
      />
      <MetadataScreen
        visible={metadataVisible}
        metadata={selectedMetadata}
        onClose={closeMetadataModal}
      />
      <View style={styles.footer}>
        <CustomTabBar />
      </View>
    </View>
  )
}

export default GalleryScreen
