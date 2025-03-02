import { ImageDTO } from "@/types/image-dto";
import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Modal, Dimensions, Image, Text } from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";

const screenWidth = Dimensions.get('window').width;

interface ImageDisplayProps {
  images: ImageDTO[];
}

export function ImageDisplay({ images }: ImageDisplayProps) {
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <>
      {/* Carrusel de imágenes */}
      <View>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const offsetX = e.nativeEvent.contentOffset.x;
            const index = Math.round(offsetX / screenWidth);
            setCurrentImageIndex(index);
          }}
          scrollEventThrottle={16}
        >
          {images.length > 0 ? (
            images.map((img, index) => (
              <TouchableOpacity
                key={img.id}
                activeOpacity={0.8}
                onPress={() => {
                  setCurrentImageIndex(index);
                  setIsImageViewerVisible(true);
                }}
              >
                <Image
                  source={{ uri: img.url }}
                  className="h-56"
                  style={{ width: screenWidth }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))
          ) : (
            <View
              className="bg-gray-400 justify-center items-center h-56"
              style={{ width: screenWidth }}
            >
              <Text className="text-white mt-20">Sin imágenes</Text>
            </View>
          )}
        </ScrollView>

        {/* Puntos de paginación del carrusel */}
        <View className="flex-row justify-center items-center my-2">
          {images.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${currentImageIndex === index ? 'bg-black' : 'bg-gray-300'
                }`}
            />
          ))}
        </View>
      </View>

      {/* Visualizador de imágenes expandido con react-native-image-zoom-viewer */}
      <Modal visible={isImageViewerVisible} transparent={true}>
        <ImageViewer
          imageUrls={images.map((img) => ({ url: img.url }))}
          index={currentImageIndex}
          onCancel={() => setIsImageViewerVisible(false)}
          enableSwipeDown={true}
          onSwipeDown={() => setIsImageViewerVisible(false)}
          saveToLocalByLongPress={false}
          backgroundColor='rgba(0, 0, 0, 0.9)'
        />
      </Modal>
    </>
  );
}