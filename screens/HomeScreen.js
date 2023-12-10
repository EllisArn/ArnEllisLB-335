import React from 'react'
import { View, Text, Button } from 'react-native'
import { useNavigation } from '@react-navigation/native'

const HomeScreen = () => {
  const navigation = useNavigation()

  const goToCameraScreen = () => {
    navigation.navigate('Camera')
  }

  const goToGalleryScreen = () => {
    navigation.navigate('Gallery')
  }

  return (
    <View>
      <Text>Home Screen</Text>
      <Button title="Go to Camera Screen" onPress={goToCameraScreen} />
      <Button title="Go to Gallery Screen" onPress={goToGalleryScreen} />
    </View>
  )
}

export default HomeScreen
