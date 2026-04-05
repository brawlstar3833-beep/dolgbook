import AsyncStorage from '@react-native-async-storage/async-storage';
import { Debt } from '../types';

const DEBTS_KEY = 'debts_v1';

// Получить все долги
export async function getAllDebts(): Promise<Debt[]> {
  try {
    const json = await AsyncStorage.getItem(DEBTS_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

// Сохранить долг
export async function saveDebt(debt: Debt): Promise<void> {
  const all = await getAllDebts();
  all.push(debt);
  await AsyncStorage.setItem(DEBTS_KEY, JSON.stringify(all));
}

// Погасить часть долга (уменьшить сумму)
export async function repayDebt(id: string, amount: number): Promise<void> {
  const all = await getAllDebts();
  const updated = all.map(d => {
    if (d.id !== id) return d;
    const newAmount = d.amount - amount;
    return newAmount <= 0
      ? { ...d, amount: 0, isPaid: true }
      : { ...d, amount: newAmount };
  });
  await AsyncStorage.setItem(DEBTS_KEY, JSON.stringify(updated));
}

// Удалить долг полностью
export async function deleteDebt(id: string): Promise<void> {
  const all = await getAllDebts();
  const filtered = all.filter(d => d.id !== id);
  await AsyncStorage.setItem(DEBTS_KEY, JSON.stringify(filtered));
}

// Получить долги одного человека
export async function getDebtsByPerson(name: string): Promise<Debt[]> {
  const all = await getAllDebts();
  return all.filter(
    d => d.personName.toLowerCase() === name.toLowerCase() && !d.isPaid
  );
}

// Получить список уникальных должников с суммами
export async function getDebtorsSummary(): Promise<
  { name: string; total: number }[]
> {
  const all = await getAllDebts();
  const active = all.filter(d => !d.isPaid);
  const map = new Map<string, number>();
  for (const d of active) {
    map.set(d.personName, (map.get(d.personName) ?? 0) + d.amount);
  }
  return Array.from(map.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
}
