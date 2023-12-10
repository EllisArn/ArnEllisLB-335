import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'

const CustomTabBar = () => {
  const navigation = useNavigation()

  const goToCameraScreen = () => {
    navigation.navigate('Camera')
  }

  const goToGalleryScreen = () => {
    navigation.navigate('Gallery')
  }

  return (
    <View style={styles.tabBar}>
      <TouchableOpacity style={styles.tabItem} onPress={goToCameraScreen}>
        <Text>Camera</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tabItem} onPress={goToGalleryScreen}>
        <Text>Gallery</Text>
      </TouchableOpacity>
    </View>
  )
}

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Home Screen</Text>
      <View style={styles.footer}>
        <CustomTabBar />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

export default HomeScreen
