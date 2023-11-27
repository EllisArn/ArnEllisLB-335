import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'
import { useState, useRef } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as MediaLibrary from 'expo-media-library'
import { captureRef } from 'react-native-view-shot'
import domtoimage from 'dom-to-image'
import * as Sensors from 'expo-sensors'
import * as Location from 'expo-location'

export default function App() {
  return (
    <View style={styles.container}>
      <h1 style={styles.text}>Momentograph</h1>
      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    backgroundColor: '#000',
    color: '#fff',
  },
})
