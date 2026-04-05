import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getDebtorsSummary } from '../storage/storage';
import { RootStackParamList } from '../types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  const [debtors, setDebtors] = useState<{ name: string; total: number }[]>([]);

  // Обновляем список каждый раз при открытии экрана
  useFocusEffect(
    useCallback(() => {
      getDebtorsSummary().then(setDebtors);
    }, [])
  );

  return (
    <View style={styles.container}>
      {debtors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎉</Text>
          <Text style={styles.emptyText}>Долгов нет!</Text>
        </View>
      ) : (
        <>
          <Text style={styles.subtitle}>
            Должников: {debtors.length}
          </Text>
          <FlatList
            data={debtors}
            keyExtractor={item => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate('Person', { personName: item.name })
                }
              >
                <Text style={styles.personName}>{item.name}</Text>
                <Text style={styles.amount}>{item.total} ₽</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      {/* Большая кнопка добавить */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddDebt', {})}
      >
        <Text style={styles.addButtonText}>+ ДОБАВИТЬ ДОЛГ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 12 },
  subtitle: {
    fontSize: 18, color: '#555', marginBottom: 10, marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  personName: { fontSize: 22, fontWeight: '600', color: '#222' },
  amount: { fontSize: 24, fontWeight: 'bold', color: '#C62828' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 80 },
  emptyText: { fontSize: 28, color: '#555', marginTop: 16 },
  addButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
});
