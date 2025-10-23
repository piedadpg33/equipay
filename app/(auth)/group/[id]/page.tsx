import LuckyWheel from '@/components/LuckyWheel';
import { useAuth } from '@/providers/AuthProvider';
import { Balance, Expense, expenseService, Group, groupService } from '@/services';
import { globalStyles } from '@/styles/globalStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const GroupDetailPage = () => {
    const [showWheel, setShowWheel] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);
    const { id } = useLocalSearchParams();
    const { session, nameUser } = useAuth();
    const [grupo, setGrupo] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'Balances' | 'Expenses'>('Expenses');
    const [listExpenses, setListExpenses] = useState<Expense[]>([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [nextPayer, setNextPayer] = useState<Balance | null>(null); //who must pay next
    const [balances, setBalances] = useState<Balance[]>([]);
    const [yourBalance, setYourBalance] = useState<number>(0);

    const getExpenses = async () => {
        if (!id || !session?.user?.id) return;

        try {
            const groupId = parseInt(String(id));

            // Get group data
            const grupoData = await groupService.getGroupById(groupId);
            if (!grupoData) {
                setGrupo(null);
                setLoading(false);
                return;
            }

            setGrupo(grupoData);

            // Get group expenses
            const expenses = await expenseService.getExpensesByGroupId(groupId);
            setListExpenses(expenses);

            // Calculate totals and balances
            const total = expenseService.getTotalExpenses(expenses);
            setTotalExpenses(total);

            const miembros = Array.isArray(grupoData.members) ? grupoData.members : [];
            const calculatedBalances = expenseService.calculateBalances(miembros, expenses);
            setBalances(calculatedBalances);

            // Determine who should pay
            setNextPayer(expenseService.getWhoPays(calculatedBalances));

            // Get current user's balance
            if (nameUser) {
                const userBalance = calculatedBalances.find(b => b.nombre === nameUser);
                setYourBalance(userBalance ? userBalance.balance : 0);
            }

        } catch (error) {
            console.error('Error in getExpenses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getExpenses();
    }, []);

    // Pastel colors for PieChart
    const pastelColors = useMemo(() => [
        '#FFD1DC', '#B5EAD7', '#C7CEEA', '#FFDAC1', '#E2F0CB', '#B5ADEA', '#FFB7B2', '#B2F7EF', '#E0BBE4', '#FFDFD3',
        '#FFFACD', '#D1F2EB', '#F3E5AB', '#F7CAC9', '#BFD8B8', '#F6E3B4', '#C2B9B0', '#F9E79F', '#D6EAF8', '#FAD7A0',
        '#F5CBA7', '#D5F5E3', '#FDEDEC', '#D2B4DE', '#F9E79F', '#A9DFBF', '#F6DDCC', '#FDEBD0', '#D4E6F1', '#F7F9F9'
    ], []);

    // Calculate user payments for PieChart
    const userPayments = useMemo(() => {
        if (!grupo?.members || !Array.isArray(grupo.members)) return [];

        return grupo.members.map((member: string) => {
            const memberExpenses = listExpenses.filter(exp => exp.sender === member);
            const totalPaid = memberExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
            return {
                name: member,
                paid: totalPaid,
                percentage: totalExpenses > 0 ? (totalPaid / totalExpenses) * 100 : 0
            };
        });
    }, [grupo?.members, listExpenses, totalExpenses]);

    // Dates for PieChart
    const pieData = useMemo(() => {
        const usersWithPayments = userPayments.filter(user => user.paid > 0);

        return usersWithPayments.map((user, idx) => ({
            name: `${user.name} (${user.percentage.toFixed(1)}%)`,
            population: user.paid,
            color: pastelColors[idx % pastelColors.length],
            legendFontColor: '#333',
            legendFontSize: 12,
            legendFontFamily: 'SpaceMono-Regular'
        }));
    }, [userPayments, pastelColors]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!grupo) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Group not found</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, width: Platform.OS === 'web' ? '75%' : '100%', alignSelf: 'center', backgroundColor: '#fffcfcc4', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 16 }}>


            {/* LuckyWheel modal */}
            <Modal
                visible={showWheel && Array.isArray(grupo.members)}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowWheel(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
                    <LinearGradient
                        colors={['#ffffffff', '#938fafff', '#fff']}
                        start={[0, 0]}
                        end={[1, 1]}
                        style={{ borderRadius: 24, padding: 24, alignItems: 'center', width: '95%', maxWidth: 420, elevation: 8, position: 'relative' }}
                    >
                        <TouchableOpacity
                            onPress={() => setShowWheel(false)}
                            style={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                justifyContent: 'center',
                                alignItems: 'center',
                                zIndex: 10
                            }}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>×</Text>
                        </TouchableOpacity>
                        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12, color: '#322e3fff' }}>Who Pays Next?</Text>
                        <LuckyWheel
                            segments={grupo.members}
                            onFinish={(winnerName) => {
                                setWinner(winnerName);
                            }}
                        />
                    </LinearGradient>
                </View>
            </Modal>

            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                Total spent: {totalExpenses.toFixed(2)} €
            </Text>
            <Text style={{ fontSize: 16, marginBottom: 16 }}>
                Balance: {yourBalance >= 0 ? `you are owed ${yourBalance.toFixed(2)}` : `you should pay ${Math.abs(yourBalance).toFixed(2)}`} €
            </Text>

            {/* Info de quién paga y ruleta */}
            {Array.isArray(grupo.members) && nextPayer && (

                <LinearGradient
                    colors={['#5e58d2ff', '#aabdd7ff', '#fbfffbff']}
                    start={[0, 0]}
                    end={[1, 1]}
                    style={{
                        borderRadius: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        marginBottom: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        maxWidth: 400,
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#ffffffff' }}>
                            Next to Pay:
                        </Text>
                        <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#ffffffff' }}>
                            {nextPayer.nombre}
                        </Text>
                        <Text style={{ fontSize: 13, color: '#faf6ffff' }}>
                            {Math.abs(nextPayer.balance).toFixed(2)} €
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowWheel(true)}
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: '#6c47ff',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text style={{ color: '#fff', fontSize: 28 }}>🎰</Text>
                    </TouchableOpacity>
                </LinearGradient>
            )}

            {/* Pestañas */}
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                <TouchableOpacity
                    onPress={() => setActiveTab('Expenses')}
                    style={{ flex: 1, alignItems: 'center' }}
                >
                    <Text style={{
                        fontSize: 16,
                        color: activeTab === 'Expenses' ? '#007AFF' : '#888',
                        paddingVertical: 8,
                        fontWeight: activeTab === 'Expenses' ? 'bold' : 'normal'
                    }}>
                        Expenses
                    </Text>
                    <View style={{
                        height: 2,
                        backgroundColor: activeTab === 'Expenses' ? '#007AFF' : 'transparent',
                        width: '100%'
                    }} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveTab('Balances')}
                    style={{ flex: 1, alignItems: 'center' }}
                >
                    <Text style={{
                        fontSize: 16,
                        color: activeTab === 'Balances' ? '#007AFF' : '#888',
                        paddingVertical: 8,
                        fontWeight: activeTab === 'Balances' ? 'bold' : 'normal'
                    }}>
                        Balances
                    </Text>
                    <View style={{
                        height: 2,
                        backgroundColor: activeTab === 'Balances' ? '#007AFF' : 'transparent',
                        width: '100%'
                    }} />
                </TouchableOpacity>
            </View>


            {activeTab === 'Expenses' ? (
                <>
                    <ScrollView style={{ maxHeight: '50%' }} showsVerticalScrollIndicator={false}>
                        {listExpenses.length === 0 ? (
                            <Text style={{ color: '#888', textAlign: 'center', marginVertical: 20 }}>
                                No expenses recorded yet.
                            </Text>
                        ) : (
                            listExpenses.map((exp) => (
                                <View key={exp.id} style={{
                                    backgroundColor: '#fff',
                                    borderRadius: 8,
                                    padding: 12,
                                    marginBottom: 8,
                                    elevation: 1,
                                }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#5a5080ff' }}>
                                            {Number(exp.amount).toFixed(2)} €
                                        </Text>
                                        <Text style={{ fontSize: 14, color: '#666' }}>
                                            {exp.sender}
                                        </Text>
                                    </View>
                                    <Text style={{ fontSize: 14, color: '#787070ff', marginTop: 4 }}>
                                        {exp.description}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                                        {new Date(exp.created_at).toLocaleDateString()}
                                    </Text>
                                </View>
                            ))
                        )}
                    </ScrollView>
                    <View style={{ justifyContent: 'center', alignItems: 'center', marginVertical: 24 }}>
                        <TouchableOpacity style={globalStyles.button}
                            onPress={() => router.push(`/(auth)/group/${id}/addExpense` as any)}
                        >
                            <Text style={globalStyles.buttonText}>Add Expense</Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : null}

            {activeTab === 'Balances' && Array.isArray(grupo.members) ? (
                <ScrollView style={{ marginTop: 16,  maxHeight: '70%' }} showsVerticalScrollIndicator={false}>
                    {/* Graphical representation of user contributions */}
                    {pieData.length > 0 ? (
                        <>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' }}>
                                Contribution by User (% of Total Paid)
                            </Text>
                            <PieChart
                                data={pieData}
                                width={Platform.OS === 'web' ? Dimensions.get('window').width * 0.5 : Dimensions.get('window').width * 0.95}
                                height={220}
                                chartConfig={{
                                    color: () => '#333',
                                    labelColor: () => '#333',
                                    propsForLabels: { fontFamily: 'SpaceMono-Regular' }
                                }}
                                accessor={'population'}
                                backgroundColor={'transparent'}
                                paddingLeft={'10'}
                                absolute
                                hasLegend={true}
                            />
                            {/* Detailed Breakdown */}
                            <ScrollView style={{ marginTop: 16, width: '100%', maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                                {userPayments.map((user, idx) => (
                                    <View key={user.name} style={{
                                        backgroundColor: '#f7f7fa',
                                        borderRadius: 12,
                                        padding: 12,
                                        marginBottom: 8,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderLeftWidth: 4,
                                        borderLeftColor: user.paid > 0 ? pastelColors[idx % pastelColors.length] : '#e0e0e0'
                                    }}>
                                        <View>
                                            <Text style={{ fontSize: 16, color: '#333', fontWeight: '600' }}>{user.name}</Text>
                                            <Text style={{ fontSize: 12, color: '#666' }}>
                                                Paid: {user.paid.toFixed(2)} €
                                            </Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#5540cbff' }}>
                                                {user.percentage.toFixed(1)}%
                                            </Text>
                                            {user.paid === 0 && (
                                                <Text style={{ fontSize: 12, color: '#999', fontStyle: 'italic' }}>
                                                    No payments made
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                        </>
                    ) : (
                        <Text style={{ color: '#888' }}>There are no expenses recorded to display the chart.</Text>
                    )}

                    {/* List of final balances */}
                    <View style={{ marginTop: 24, width: '100%', maxHeight: 300 }} >
                        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' }}>
                            Final Balances:
                        </Text>
                        {balances.map(b => (
                            <View key={b.nombre} style={{
                                backgroundColor: '#f7f7fa',
                                borderRadius: 12,
                                padding: 12,
                                marginBottom: 10,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <Text style={{ fontSize: 16, color: '#333' }}>{b.nombre}</Text>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: b.balance < 0 ? '#d32f2f' : '#388e3c' }}>
                                    {b.balance < 0 ? `owes ${Math.abs(b.balance).toFixed(2)} €` : `is owed ${b.balance.toFixed(2)} €`}
                                </Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            ) : null}




        </View>
    );
};

export default GroupDetailPage;