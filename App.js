import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import SettingsScreen from './screens/SettingsScreen'
import CameraScreen from './screens/CameraScreen'
import GalleryScreen from './screens/GalleryScreen'

const Stack = createStackNavigator()

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Camera">
        <Stack.Screen
          options={{
            headerStyle: {
              backgroundColor: '#5e5e5e',
            },
            headerTintColor: '#eee',
          }}
          name="Camera"
          component={CameraScreen}
        />
        <Stack.Screen
          options={{
            headerStyle: {
              backgroundColor: '#5e5e5e',
            },
            headerTintColor: '#eee',
          }}
          name="Gallery"
          component={GalleryScreen}
        />
        <Stack.Screen
          options={{
            headerStyle: {
              backgroundColor: '#5e5e5e',
            },
            headerTintColor: '#eee',
          }}
          name="Settings"
          component={SettingsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App
