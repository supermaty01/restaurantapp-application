import { View, Text, TextInput, TextInputProps } from 'react-native';
import { Controller, Control } from 'react-hook-form';
import clsx from 'clsx';
import { FC } from 'react';

interface FormInputProps extends TextInputProps {
  control: Control<any>;
  name: string;
  label?: string;
  containerClassName?: string;
  inputClassName?: string;
}

const FormInput: FC<FormInputProps> = ({
  control,
  name,
  label,
  containerClassName,
  inputClassName,
  ...rest
}) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View className={clsx("mb-4", containerClassName)}>
          {label && <Text className={clsx("text-base mb-2 text-gray-800", error ? "text-red-600" : "")}>{label}</Text>}
          <TextInput
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            className={clsx("w-full min-h-12 px-4 border border-gray-200 rounded-lg bg-white placeholder:text-gray-500", inputClassName)}
            {...rest}
          />
          {error && <Text className="text-red-600 mt-1">{error.message}</Text>}
        </View>
      )}
    />
  );
};

export default FormInput;
