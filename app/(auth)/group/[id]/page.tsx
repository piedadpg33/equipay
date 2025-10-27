import LuckyWheel from '@/components/LuckyWheel';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Balance, Expense, Group, groupService } from '@/services';
import { globalStyles } from '@/styles/globalStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Dimensions, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const GroupDetailPage = () => {
    const [showWheel, setShowWheel] = useState(false);
    const { t } = useTranslation();
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

        const data = await groupService.getGroupSummary(groupId);

        setListExpenses(data.expenses);
        setTotalExpenses(data.total);
        setBalances(data.balances);

        //Next payer
        setNextPayer(data.balances.find((b: any) => b.nombre === data.next_payer) || null);

        // Your balance
        if (nameUser) {
            const userBalance = data.balances.find((b: any) => b.nombre === nameUser);
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

        // Set up real-time subscription to expenses table
        const channel = supabase
            .channel('expenses-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'expenses',
                    filter: `group_id=eq.${id}`
                },
                (payload) => {
                    getExpenses();
                }
            )
            .subscribe();

        // Clean up subscription on unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, [id, session?.user?.id, nameUser]);

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
                <Text>{t('groupDetail.notFound')}</Text>
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
                        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12, color: '#322e3fff' }}>{t('groupDetail.whoPaysNext')}</Text>
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
                {t('groupDetail.totalSpent', { amount: totalExpenses.toFixed(2) })}
            </Text>
            <Text style={{ fontSize: 16, marginBottom: 16 }}>
                {t('groupDetail.balance', {
                    balance: yourBalance >= 0
                        ? t('groupDetail.youAreOwed', { amount: yourBalance.toFixed(2) })
                        : t('groupDetail.youShouldPay', { amount: Math.abs(yourBalance).toFixed(2) })
                })} €
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
                            {t('groupDetail.nextToPay')}
                        </Text>
                        <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#ffffffff' }}>
                            {nextPayer.nombre}
                        </Text>
                        <Text style={{ fontSize: 13, color: '#faf6ffff' }}>
                            {t('groupDetail.amountToPay', { amount: Math.abs(nextPayer.balance).toFixed(2) })} €
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
                        {t('groupDetail.expensesTab')}
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
                        {t('groupDetail.balancesTab')}
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
                                {t('groupDetail.noExpenses')}
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
                            <Text style={globalStyles.buttonText}>{t('groupDetail.addExpense')}</Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : null}

            {activeTab === 'Balances' && Array.isArray(grupo.members) ? (
                <ScrollView style={{ marginTop: 16 }} showsVerticalScrollIndicator={false}>
                    {/* Graphical representation of user contributions */}
                    {pieData.length > 0 ? (
                        <>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' }}>
                                {t('groupDetail.contributionByUser')}
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
                            <View style={{ marginTop: 16, width: '100%' }} >
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
                                                {t('groupDetail.paid', { amount: user.paid.toFixed(2) })} €
                                            </Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#5540cbff' }}>
                                                {user.percentage.toFixed(1)}%
                                            </Text>
                                            {user.paid === 0 && (
                                                <Text style={{ fontSize: 12, color: '#999', fontStyle: 'italic' }}>
                                                    {t('groupDetail.noPaymentsMade')}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </>
                    ) : (
                        <Text style={{ color: '#888' }}>{t('groupDetail.noExpensesChart')}</Text>
                    )}

                    {/* List of final balances */}
                    <View style={{ marginTop: 24, width: '100%' }} >
                        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' }}>
                            {t('groupDetail.finalBalances')}
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
                                    {b.balance < 0
                                        ? t('groupDetail.owes', { amount: Math.abs(b.balance).toFixed(2) })
                                        : t('groupDetail.isOwed', { amount: b.balance.toFixed(2) })
                                    } €
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