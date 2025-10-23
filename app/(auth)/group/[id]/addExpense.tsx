import { useAuth } from '@/providers/AuthProvider';
import { CreateExpenseData, expenseService } from '@/services';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { globalStyles } from '../../../../styles/globalStyles';

const AddExpensePage = () => {
    const { id } = useLocalSearchParams();
    const { session } = useAuth();
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const { nameUser } = useAuth();

    const addExpense = async () => {
        if (!amount || !description.trim() || !session?.user?.id) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        setLoading(true);

        try {
            // Get current user's name
            if (!nameUser) {
                Alert.alert('Error', 'Could not identify user');
                return;
            }

            // Create expense data
            const expenseData: CreateExpenseData = {
                groupId: parseInt(String(id)),
                amount: numAmount,
                description: description.trim(),
                sender: nameUser
            };

            // Create the expense
            const result = await expenseService.createExpense(expenseData);

            if (!result.success) {
                Alert.alert('Error', result.error || 'Could not add expense');
                return;
            }

            Toast.show({
                type: 'success',
                text1: 'Expense added successfully',
                text2: 'Refresh the group page to see the new expense.',
            });
            setTimeout(() => {
                router.back();
            }, 1200);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'An error occurred while adding the expense.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, width: Platform.OS === 'web' ? '75%' : '100%', alignSelf: 'center', backgroundColor: '#fffcfcc4', borderRadius: 12, paddingVertical: 8 }}>
            <View style={{ padding: 16 }}>
                <View style={globalStyles.inputContainer}>
                    <Text style={globalStyles.label}>Amount (€)</Text>
                    <View style={globalStyles.inputWrapper}>
                        <TextInput
                            style={globalStyles.input}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0.00"
                            placeholderTextColor="#999"
                            keyboardType="decimal-pad"
                        />
                    </View>
                </View>

                <View style={globalStyles.inputContainer}>
                    <Text style={globalStyles.label}>Description</Text>
                    <View style={globalStyles.inputWrapper}>
                        <TextInput
                            style={[globalStyles.input, { minHeight: 80 }]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="What was the expense for?"
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                </View>

                <View style={{ justifyContent: 'center', alignItems: 'center' }} >
                    <TouchableOpacity
                        style={[globalStyles.button, loading && globalStyles.disabledButton]}
                        onPress={addExpense}
                        disabled={loading}
                    >
                        <Text style={globalStyles.buttonText}>
                            {loading ? 'Adding...' : 'Add Expense'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={globalStyles.button}
                        onPress={() => router.back()}
                    >
                        <Text style={globalStyles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};


export default AddExpensePage;