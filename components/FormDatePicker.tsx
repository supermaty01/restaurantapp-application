import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Controller, Control } from 'react-hook-form';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parse } from 'date-fns';

interface FormDatePickerProps {
  control: Control<any>;
  name: string;
  label?: string;
}

const FormDatePicker: React.FC<FormDatePickerProps> = ({ control, name, label }) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const formattedDate = value
          ? format(parse(value, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')
          : "Selecciona una fecha";

        return (
          <View className="mb-4">
            {label && <Text className="text-base mb-2 text-gray-800">{label}</Text>}

            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              className="w-full min-h-12 px-4 border border-gray-200 rounded-lg bg-white flex justify-center"
            >
              <Text className="text-gray-800">{formattedDate}</Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={value ? parse(value, 'yyyy-MM-dd', new Date()) : new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setShowPicker(Platform.OS === "ios");
                  if (selectedDate && event.type !== 'dismissed') {
                    // Usar format de date-fns para evitar problemas de zona horaria
                    onChange(format(selectedDate, 'yyyy-MM-dd'));
                  }
                }}
              />
            )}

            {error && <Text className="text-red-600 mt-1">{error.message}</Text>}
          </View>
        );
      }}
    />
  );
};

export default FormDatePicker;
