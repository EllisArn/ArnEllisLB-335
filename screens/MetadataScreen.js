import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as MediaLibrary from 'expo-media-library'

const MetadataScreen = ({ visible, metadata, onClose }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    loadDarkModeState()
  }, [])

  const loadDarkModeState = async () => {
    const darkModeValue = await AsyncStorage.getItem('darkMode')
    if (darkModeValue !== null) {
      setIsDarkMode(JSON.parse(darkModeValue))
    }
  }
  if (!metadata) {
    return null
  }

  const formattedMetadata = Object.entries(metadata).map(([key, value]) => {
    if (key === 'weather') {
      const subEntries = Object.entries(value).map(([subKey, subValue]) => ({
        key: subKey,
        value: JSON.stringify(subValue).replace('"', ''),
      }))
      return { key, subEntries }
    }
    if (key === 'address' && Array.isArray(value) && value.length === 1) {
      const addressObj = value[0]
      const subEntries = Object.entries(addressObj).map(
        ([subKey, subValue]) => ({
          key: subKey,
          value: JSON.stringify(subValue).replace('"', ''),
        })
      )
      return { key, subEntries }
    }
    if (key === 'sensors' && Array.isArray(value)) {
      const sensorEntries = value.flatMap((sensorObj) =>
        Object.entries(sensorObj).map(([sensorKey, sensorValue]) => {
          if (sensorKey === 'rotation' || sensorKey === 'rotationRate') {
            return Object.entries(sensorValue).map(([subKey, subValue]) => ({
              key: `${sensorKey}.${subKey}`,
              value: JSON.stringify(subValue).replace('"', ''),
            }))
          }
          return {
            key: sensorKey,
            value: JSON.stringify(sensorValue).replace('"', ''),
          }
        })
      )
      return { key, subEntries: sensorEntries.flat() }
    }
    return { key, value: JSON.stringify(value).replace('"', '') }
  })

  const renderSubItem = ({ item }) => {
    return (
      <View style={styles.item}>
        <Text style={styles.label}>{item.key}:</Text>
        <Text style={styles.value}>{item.value.replace('"', '')}</Text>
      </View>
    )
  }

  const renderMetadataItem = ({ item }) => {
    if (item.subEntries) {
      return (
        <View>
          <Text style={styles.text}>{item.key}</Text>
          <FlatList
            data={item.subEntries}
            renderItem={renderSubItem}
            keyExtractor={(subItem, index) => `${item.key}-${index}`}
          />
        </View>
      )
    }
    return (
      <View style={styles.item}>
        <Text style={styles.label}>{item.key}:</Text>
        <Text style={styles.value}>{item.value.replace('"', '')}</Text>
      </View>
    )
  }

  const handleDeleteImage = async () => {
    Alert.alert('Delete Image', 'Are you sure you want to delete this image?', [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => onClose(),
      },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            const filename = metadata.filename
            const images = await AsyncStorage.getItem('images')
            const imagesArray = images ? JSON.parse(images) : []
            const imageIndex = imagesArray.findIndex(
              (item) => item.asset.filename === filename
            )
            if (imageIndex >= 0) {
              const image = imagesArray[imageIndex]
              const asset = image.asset
              imagesArray.splice(imageIndex, 1)
              await AsyncStorage.setItem('images', JSON.stringify(imagesArray))
              await MediaLibrary.deleteAssetsAsync([asset])
              onClose()
            }
          } catch (error) {
            console.error('Error deleting image:', error)
            Alert.alert('Error', 'Error deleting image')
          }
        },
      },
    ])
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#000' : '#fff',
    },
    modal: {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#eee',
      padding: 20,
      borderRadius: 10,
      elevation: 5,
      maxHeight: '80%',
      width: '90%',
    },
    text: {
      fontSize: 25,
      fontWeight: 'bold',
      marginBottom: 10,
      color: isDarkMode ? '#fff' : '#000',
    },
    closeButton: {
      fontSize: 16,
      color: isDarkMode ? 'lightblue' : 'blue',
      marginTop: 20,
    },
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    label: {
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#000',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 5,
      color: isDarkMode ? '#fff' : '#000',
    },
    value: {
      flex: 1,
      marginLeft: 5,
      color: isDarkMode ? '#fff' : '#000',
    },
  })

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.modal}>
          <Text style={styles.text}>Metadata</Text>
          <FlatList
            data={formattedMetadata}
            renderItem={renderMetadataItem}
            keyExtractor={(item, index) => `${item.key}-${index}`}
          />
          <TouchableOpacity onPress={handleDeleteImage}>
            <Text style={styles.closeButton}>Delete Image</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

export default MetadataScreen
