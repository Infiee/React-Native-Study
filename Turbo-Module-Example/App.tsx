import React, {useState} from 'react';
import type {PropsWithChildren} from 'react';
import {
  Alert,
  Button,
  EventSubscription,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import RTNCalculator from 'rtn-calculator/js/NativeRTNCalculator';
import RTNLocalStorage from 'rtn-localstorage/js/NativeRTNLocalStorage';

function LocalStorageView() {
  const [value, setValue] = React.useState<string | null>(null);

  const [editingValue, setEditingValue] = React.useState<string | null>(null);

  React.useEffect(() => {
    const storedValue = RTNLocalStorage?.getItem('myKey');
    setValue(storedValue ?? '');
  }, []);

  function saveValue() {
    RTNLocalStorage?.setItem(editingValue ?? '', 'myKey');
    setValue(editingValue);
  }

  function clearAll() {
    RTNLocalStorage?.clear();
    setValue('');
  }

  function deleteValue() {
    RTNLocalStorage?.removeItem('myKey');
    setValue('');
  }

  return (
    <View style={{marginTop: 30, justifyContent: 'center', alignItems: 'center'}}>
      <View style={{
        flexDirection: 'row',
        marginBottom: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
      }}>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#333',
          marginRight: 10,
        }}>
          store value:
        </Text>
        <Text style={{
          fontSize: 20,
          color: '#ff0000',
          textAlign: 'center',
        }}>
          {value ?? 'No Value'}
        </Text>
      </View>
      <TextInput
        placeholder="Enter the text you want to store"
        style={{borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, width: 200, textAlign: 'center'}}
        onChangeText={setEditingValue}
      />
      <Button title="Save" onPress={saveValue} />
      <Button title="Delete" onPress={deleteValue} />
      <Button title="Clear" onPress={clearAll} />
    </View>
  );
}

function App(): React.JSX.Element {
  const [num1, setNum1] = useState<string>('3');
  const [num2, setNum2] = useState<string>('7');
  const [result, setResult] = useState<number | null>(null);
  const listenerSubscription = React.useRef<null | EventSubscription>(null);

  React.useEffect(() => {
    listenerSubscription.current = RTNCalculator.onValueChanged(data => {
      Alert.alert(`Result: ${data}`);
    });

    return () => {
      listenerSubscription.current?.remove();
      listenerSubscription.current = null;
    };
  }, []);

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={num1}
          onChangeText={setNum1}
          keyboardType="numeric"
          placeholder="Enter first number"
        />
        <Text style={styles.operator}>+</Text>
        <TextInput
          style={styles.input}
          value={num2}
          onChangeText={setNum2}
          keyboardType="numeric"
          placeholder="Enter second number"
        />
        <Text style={styles.operator}>={result}</Text>
      </View>

      <Button
        title="Calculate"
        onPress={async () => {
          const value1 = parseFloat(num1) || 0;
          const value2 = parseFloat(num2) || 0;
          const value = await RTNCalculator.add(value1, value2);
          setResult(value ?? null);
        }}
      />

      <LocalStorageView />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    width: 100,
    textAlign: 'center',
  },
  operator: {
    fontSize: 24,
    marginHorizontal: 10,
  },
  result: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default App;
