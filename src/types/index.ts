export interface Debt {
  id: string;
  personName: string;
  amount: number;
  description: string;
  date: string; // ISO строка
  isPaid: boolean;
}

export type RootStackParamList = {
  Home: undefined;
  AddDebt: { personName?: string };
  Person: { personName: string };
};
