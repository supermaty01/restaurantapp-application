import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

interface Dish {
  id: number;
  name: string;
}

interface DishSelectorModalProps {
  visible: boolean;
  dishes: Dish[];
  onSelect: (dish: Dish) => void;
  onClose: () => void;
}

const DishSelectorModal: React.FC<DishSelectorModalProps> = ({ visible, dishes, onSelect, onClose }) => {
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  const handleSelect = (dish: Dish) => {
    setSelectedDish(dish);
    onSelect(dish);
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Select a Dish</Text>
          <FlatList
            data={dishes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.dishItem} onPress={() => handleSelect(item)}>
                <Text style={styles.dishName}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dishItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dishName: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default DishSelectorModal;