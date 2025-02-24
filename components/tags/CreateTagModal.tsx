// components/CreateTagModal.tsx
import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FormInput from '@/components/FormInput';
import clsx from 'clsx';

const { width: screenWidth } = Dimensions.get('window');

// Definimos el esquema para validar el nombre con zod
const schema = z.object({
  name: z.string().nonempty({ message: 'El nombre es requerido' }),
});

type FormData = z.infer<typeof schema>;

// 36 colores de ejemplo
const ALL_COLORS = [
  // 12 colores vivos
  '#F44336', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
  '#009688', '#4CAF50', '#FF9800', '#FF5722',
  // 12 colores pastel
  '#FFB6C1', '#AEC6CF', '#D8BFD8', '#77DD77',
  '#FFFF99', '#FFCC99', '#AAF0D1', '#E6E6FA',
  '#FF9999', '#FFDAB9', '#B2FFFF', '#E0BBE4',
  // 12 colores neutros
  '#FFFFFF', '#F0F0F0', '#E0E0E0', '#CCCCCC',
  '#B3B3B3', '#999999', '#7F7F7F', '#666666',
  '#4C4C4C', '#333333', '#1A1A1A', '#000000',
];

const chunkSize = 12;
const colorPages: Array<string[]> = [];
for (let i = 0; i < ALL_COLORS.length; i += chunkSize) {
  colorPages.push(ALL_COLORS.slice(i, i + chunkSize));
}

interface CreateTagModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (tag: { name: string; color: string }) => void;
}

export default function CreateTagModal({
  visible,
  onClose,
  onAdd,
}: CreateTagModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });
  const [selectedColor, setSelectedColor] = useState(ALL_COLORS[0]);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  React.useEffect(() => {
    if (visible) {
      reset();
      setSelectedColor(ALL_COLORS[0]);
      setCurrentPage(0);
      scrollRef.current?.scrollTo({ x: 0, animated: false });
    }
  }, [visible, reset]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / screenWidth);
    setCurrentPage(pageIndex);
  };

  const onSubmit: SubmitHandler<FormData> = (data) => {
    if (data.name.trim() && selectedColor) {
      onAdd({ name: data.name.trim(), color: selectedColor });
    }
  };

  // Calculamos el ancho de cada círculo para 6 columnas
  // Restamos 60 para el ancho total del contenedor y 16 en total para los márgenes (m-2: 8px aprox cada uno)
  const circleWidth = (screenWidth - 60) / 6 - 16;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-muted w-11/12 rounded-md p-4">
          <Text className="text-lg font-bold text-gray-800 mb-2">
            Crear Tag
          </Text>
          {/* Campo de texto usando FormInput con validación de zod */}
          <FormInput
            control={control}
            name="name"
            placeholder="Nombre del Tag"
            autoFocus
            inputClassName="border border-gray-300 rounded-md px-3 py-2 text-base text-gray-800 mb-4"
          />
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            className="mb-2"
          >
            {colorPages.map((colors, pageIndex) => (
              <View
                key={pageIndex}
                className="flex-row flex-wrap justify-center"
                style={{ width: screenWidth - 60 }}
              >
                {colors.map((color) => {
                  const isSelected = color === selectedColor;
                  return (
                    <TouchableOpacity
                      key={color}
                      onPress={() => setSelectedColor(color)}
                      className={clsx(
                        'm-2 rounded-full border-2 aspect-square justify-center items-center',
                        isSelected ? 'border-black' : 'border-black/30'
                      )}
                      style={{ backgroundColor: color, width: circleWidth, height: circleWidth }}
                    />
                  );
                })}
              </View>
            ))}
          </ScrollView>

          <View className="flex-row justify-center items-center mb-4">
            {colorPages.map((_, index) => (
              <View
                key={index}
                className={clsx(
                  'w-2 h-2 rounded-full mx-1',
                  currentPage === index ? 'bg-black' : 'bg-gray-300'
                )}
              />
            ))}
          </View>

          <View className="flex-row justify-end mt-2">
            <TouchableOpacity
              onPress={onClose}
              className="px-4 py-2 rounded-md bg-gray-300 mr-2"
            >
              <Text className="text-gray-800 font-semibold">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              className="px-4 py-2 rounded-md bg-primary"
            >
              <Text className="text-white font-semibold">Añadir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
