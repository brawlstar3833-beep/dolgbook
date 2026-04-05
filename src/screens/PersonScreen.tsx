import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, Modal, TextInput
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { getDebtsByPerson, repayDebt, deleteDebt } from '../storage/storage';
import { Debt, RootStackParamList } from '../types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Person'>;
  route: RouteProp<RootStackParamList, 'Person'>;
};

export default function PersonScreen({ navigation, route }: Props) {
  const { personName } = route.params;
  const [debts, setDebts] = useState<Debt[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [repayAmount, setRepayAmount] = useState('');

  const loadDebts = useCallback(() => {
    getDebtsByPerson(personName).then(setDebts);
  }, [personName]);

  useFocusEffect(loadDebts);

  const total = debts.reduce((sum, d) => sum + d.amount, 0);

  const openRepayModal = (debt: Debt) => {
    setSelectedDebt(debt);
    setRepayAmount(String(debt.amount));
    setModalVisible(true);
  };

  const handleRepayConfirm = async () => {
    if (!selectedDebt) return;
    const amount = parseFloat(repayAmount.replace(',', '.'));
    if (!amount || amount <= 0) {
      Alert.alert('Ошибка', 'Введите правильную сумму');
      return;
    }
    await repayDebt(selectedDebt.id, amount);
    setModalVisible(false);
    setSelectedDebt(null);
    setRepayAmount('');
    loadDebts();
  };

  const handleDelete = (debt: Debt) => {
    Alert.alert(
      '🗑️ Удалить?',
      `Удалить долг ${debt.amount} ₽ от ${new Date(debt.date).toLocaleDateString('ru-RU')}?`,
      [
        { text: 'Нет', style: 'cancel' },
        {
          text: 'Да, удалить',
          style: 'destructive',
          onPress: async () => {
            await deleteDebt(debt.id);
            loadDebts();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>

      {/* Модальное окно оплаты */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>💵 Оплата долга</Text>
            <Text style={styles.modalSubtitle}>
              Долг: {selectedDebt?.amount} ₽
            </Text>
            <Text style={styles.modalLabel}>Введите сумму оплаты:</Text>
            <TextInput
              style={styles.modalInput}
              value={repayAmount}
              onChangeText={setRepayAmount}
              keyboardType="numeric"
              autoFocus
              placeholder="Сумма"
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity
              style={styles.modalConfirmBtn}
              onPress={handleRepayConfirm}
            >
              <Text style={styles.modalConfirmText}>✅ ОПЛАТИТЬ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Итог */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Общий долг:</Text>
        <Text style={styles.totalAmount}>{total} ₽</Text>
      </View>

      {debts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyText}>Долгов нет!</Text>
        </View>
      ) : (
        <FlatList
          data={debts}
          keyExtractor={d => d.id}
          renderItem={({ item }) => (
            <View style={styles.debtCard}>
              <View style={styles.debtInfo}>
                <Text style={styles.debtAmount}>{item.amount} ₽</Text>
                <Text style={styles.debtDate}>
                  {new Date(item.date).toLocaleDateString('ru-RU')}
                </Text>
                {item.description ? (
                  <Text style={styles.debtDesc}>{item.description}</Text>
                ) : null}
              </View>
              <View style={styles.debtActions}>
                <TouchableOpacity
                  style={styles.repayBtn}
                  onPress={() => openRepayModal(item)}
                >
                  <Text style={styles.repayBtnText}>💵 Оплата</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item)}
                >
                  <Text style={styles.deleteBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Добавить ещё долг этому человеку */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddDebt', { personName })}
      >
        <Text style={styles.addButtonText}>+ ЕЩЁ ДОЛГ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 12 },

  // Модальное окно
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 20,
    color: '#C62828',
    fontWeight: '600',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 18,
    color: '#555',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    borderWidth: 2,
    borderColor: '#2E7D32',
    color: '#111',
    marginBottom: 16,
  },
  modalConfirmBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalCancelBtn: {
    padding: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#888',
    fontSize: 18,
  },

  // Основной экран
  totalCard: {
    backgroundColor: '#C62828',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { color: '#fff', fontSize: 20 },
  totalAmount: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
  debtCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  debtInfo: { flex: 1 },
  debtAmount: { fontSize: 24, fontWeight: 'bold', color: '#C62828' },
  debtDate: { fontSize: 16, color: '#888', marginTop: 4 },
  debtDesc: { fontSize: 16, color: '#555', marginTop: 4, fontStyle: 'italic' },
  debtActions: { flexDirection: 'row', gap: 8 },
  repayBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    padding: 12,
  },
  repayBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  deleteBtn: {
    backgroundColor: '#EEE',
    borderRadius: 10,
    padding: 12,
  },
  deleteBtnText: { fontSize: 18 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 60 },
  emptyText: { fontSize: 24, color: '#555', marginTop: 12 },
  addButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
});
