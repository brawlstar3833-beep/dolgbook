import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert
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

  const loadDebts = useCallback(() => {
    getDebtsByPerson(personName).then(setDebts);
  }, [personName]);

  useFocusEffect(loadDebts);

  const total = debts.reduce((sum, d) => sum + d.amount, 0);

  const handleRepay = (debt: Debt) => {
    Alert.prompt(
      '💵 Оплата',
      `Долг: ${debt.amount} ₽\nВведите сумму оплаты:`,
      async (input) => {
        const amount = parseFloat(input?.replace(',', '.') ?? '');
        if (!amount || amount <= 0) {
          Alert.alert('Ошибка', 'Введите правильную сумму');
          return;
        }
        await repayDebt(debt.id, amount);
        loadDebts();
      },
      'plain-text',
      String(debt.amount),
      'numeric'
    );
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
                  onPress={() => handleRepay(item)}
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
