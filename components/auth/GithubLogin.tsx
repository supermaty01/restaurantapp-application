import { Ionicons } from '@expo/vector-icons';
import { FC } from 'react';
import { TouchableOpacity, View } from 'react-native';

const GithubLogin: FC = () => {
    return (
        <View className="flex items-center">
            <TouchableOpacity
                onPress={() => console.log('/')}
                className="border border-gray-300 rounded-lg p-4"
            >
                <Ionicons name="logo-github" size={28} color="gray" />
            </TouchableOpacity>
        </View>
    );
};

export default GithubLogin;
