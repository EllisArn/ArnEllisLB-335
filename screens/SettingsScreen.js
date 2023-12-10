import React, { useState, useEffect } from 'react'
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'

const SettingsScreen = () => {
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

  const saveDarkModeState = async (value) => {
    try {
      await AsyncStorage.setItem('darkMode', JSON.stringify(value))
      console.log('Dark mode state saved:', value)
    } catch (error) {
      console.error('Error saving dark mode state:', error)
    }
  }

  const toggleSwitch = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    saveDarkModeState(newMode)
  }

  const CustomTabBar = () => {
    const navigation = useNavigation()

    const goToGalleryScreen = () => {
      navigation.navigate('Gallery')
    }

    const goToCameraScreen = () => {
      navigation.navigate('Camera')
    }

    return (
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={goToCameraScreen}>
          <Text style={styles.text}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={goToGalleryScreen}>
          <Text style={styles.text}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.text}>Settings</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#000' : '#fff',
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '80%',
      marginBottom: 20,
      paddingHorizontal: 10,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#eee',
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
      <View style={styles.settingItem}>
        <Text style={styles.text}>Dark Mode</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
          onValueChange={toggleSwitch}
          value={isDarkMode}
        />
      </View>
      <View style={styles.footer}>
        <CustomTabBar />
      </View>
    </View>
  )
}

export default SettingsScreen
