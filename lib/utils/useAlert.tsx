// useAlert.tsx
import { Platform, Alert } from 'react-native';
import { useContext } from 'react';
import { WebAlertContext } from '@/contexts/WebAlertProvider'; // We'll define this below

export function useAlert() {
  const webAlert = useContext(WebAlertContext);

  const showAlert = (title: string, message?: string, options?: { onConfirm?: () => void }) => {
    if (Platform.OS === 'web') {
      console.log("web alert")
      webAlert.show({ title, message, onConfirm: options?.onConfirm });
    } else {
      Alert.alert(title, message, [
        { text: 'OK', onPress: options?.onConfirm },
      ]);
    }
  };

  return { showAlert };
}
