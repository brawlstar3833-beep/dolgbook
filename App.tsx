import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import AddDebtScreen from './src/screens/AddDebtScreen';
import PersonScreen from './src/screens/PersonScreen';
import { RootStackParamList } from './src/types';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#2E7D32' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontSize: 22, fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: '📒 Книга долгов' }}
        />
        <Stack.Screen
          name="AddDebt"
          component={AddDebtScreen}
          options={{ title: '➕ Добавить долг' }}
        />
        <Stack.Screen
          name="Person"
          component={PersonScreen}
          options={({ route }) => ({ title: `👤 ${route.params.personName}` })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
