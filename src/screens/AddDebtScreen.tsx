import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import { saveDebt } from '../storage/storage';
import { RootStackParamList } from '../types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'AddDebt'>;
  route: RouteProp<RootStackParamList, 'AddDebt'>;
};

export default function AddDebtScreen({ navigation, route }: Props) {
  const [name, setName] = useState(route.params?.personName ?? '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Введите имя человека');
      return;
    }
    const sum = parseFloat(amount.replace(',', '.'));
    if (!sum || sum <= 0) {
      Alert.alert('Ошибка', 'Введите правильную сумму');
      return;
    }

    await saveDebt({
      id: uuidv4(),
      personName: name.trim(),
      amount: sum,
      description: description.trim(),
      date: new Date().toISOString(),
      isPaid: false,
    });

    Alert.alert('✅ Сохранено', `Долг ${name} на ${sum} ₽ записан`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>👤 Имя*</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Например: Иван Петров"
          placeholderTextColor="#aaa"
          autoCapitalize="words"
        />

        <Text style={styles.label}>💰 Сумма (₽)*</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="500"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
        />

        <Text style={styles.label}>📝 Что взял (необязательно)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Хлеб, молоко, сахар..."
          placeholderTextColor="#aaa"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.dateNote}>
          📅 Дата: {new Date().toLocaleDateString('ru-RU')}
        </Text>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>💾 ЗАПИСАТЬ ДОЛГ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Отмена</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  label: { fontSize: 20, fontWeight: '600', color: '#333', marginTop: 16, marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    color: '#111',
  },
  multiline: { height: 100, textAlignVertical: 'top' },
  dateNote: { fontSize: 18, color: '#666', marginTop: 16, marginBottom: 8 },
  saveButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  cancelButton: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 32,
  },
  cancelButtonText: { color: '#888', fontSize: 18 },
});
