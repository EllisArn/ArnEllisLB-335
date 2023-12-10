import React, { useState, useEffect } from 'react'
import {
  View,
  Button,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import * as MediaLibrary from 'expo-media-library'
import MetadataScreen from './MetadataScreen' // Passe den Importpfad an
import AsyncStorage from '@react-native-async-storage/async-storage'

const GalleryScreen = () => {
  const [albumPhotos, setAlbumPhotos] = useState([])
  const [metadataVisible, setMetadataVisible] = useState(false)
  const [selectedMetadata, setSelectedMetadata] = useState(null)

  const [savedImages, setSavedImages] = useState([]) // Hier speichern wir die Bilder und Metadaten aus AsyncStorage

  useEffect(() => {
    // Hier rufen wir die gespeicherten Bilder/Metadaten beim Laden der Galerieseite ab
    getImagesFromDatabase()
  }, [])

  useEffect(() => {
    ;(async () => {
      const album = await MediaLibrary.getAlbumAsync('Momentograph')
      if (album) {
        const photos = await MediaLibrary.getAssetsAsync({
          album: album,
          mediaType: 'photo',
        })
        console.log('Photos from album:', photos)
        setAlbumPhotos(photos.assets)
      }
    })()
  }, [])

  const getImagesFromDatabase = async () => {
    try {
      const images = await AsyncStorage.getItem('images')
      if (images) {
        console.log('Images from database:', images)
        const imagesArray = JSON.parse(images)
        setSavedImages(imagesArray)
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
      )
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
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={albumPhotos.concat(savedImages.map((item) => item.metadata))}
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
        metadata={selectedMetadata} // Beachte, dass die Metadaten jetzt von selectedMetadata kommen
        onClose={closeMetadataModal}
      />
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
  image: {
    width: 150,
    height: 150,
    margin: 5,
  },
})

export default GalleryScreen
