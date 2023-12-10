import React from 'react'
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native'

const MetadataScreen = ({ visible, metadata, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.modal}>
          <Text style={styles.text}>Metadata:</Text>
          <Text>{JSON.stringify(metadata, null, 2)}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  closeButton: {
    fontSize: 16,
    color: 'blue',
    marginTop: 10,
  },
})

export default MetadataScreen
