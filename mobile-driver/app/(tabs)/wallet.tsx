import { useState, useCallback } from 'react'
import { Alert, FlatList, RefreshControl } from 'react-native'
import { View, Text, Button, YStack, XStack, Card, Spinner } from 'tamagui'
import { useFocusEffect } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { Transaction } from '../../lib/types'
import { useAuth } from '../../context/auth'
import { IconSymbol } from '@/components/ui/icon-symbol'

export default function WalletScreen() {
    const { session } = useAuth()
    const [balance, setBalance] = useState(0)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const loadData = async () => {
        if (!session?.user) return
        try {
            // Load balance
            const { data: profile } = await supabase
                .from('profiles')
                .select('saldo_creditos')
                .eq('user_id', session.user.id)
                .single()

            if (profile) setBalance(profile.saldo_creditos)

            // Load transactions
            const { data: trxs } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })
                .limit(20)

            setTransactions(trxs || [])
        } catch (error: any) {
            // Silent error for profile not found (first login)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useFocusEffect(
        useCallback(() => {
            loadData()
        }, [])
    )

    const handleAddCredits = () => {
        Alert.alert('Em breve', 'Funcionalidade de compra de créditos via PIX será implementada na próxima fase.')
    }

    const renderItem = ({ item }: { item: Transaction }) => {
        const isPositive = item.tipo === 'compra' || item.tipo === 'estorno'
        return (
            <XStack justifyContent="space-between" alignItems="center" paddingVertical="$3" borderBottomWidth={1} borderColor="$gray5">
                <YStack>
                    <Text fontWeight="bold" textTransform="capitalize">{item.tipo}</Text>
                    <Text color="$gray10" fontSize="$2">{new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString()}</Text>
                </YStack>
                <Text
                    fontWeight="bold"
                    color={isPositive ? '$green10' : '$red10'}
                >
                    {isPositive ? '+' : '-'} R$ {item.valor.toFixed(2)}
                </Text>
            </XStack>
        )
    }

    return (
        <View flex={1} backgroundColor="$background" padding="$4" paddingTop="$8">
            <Text fontSize="$8" fontWeight="bold" marginBottom="$4">Carteira</Text>

            <Card elevate size="$4" bordered padding="$4" backgroundColor="$blue10" marginBottom="$6">
                <YStack space="$2">
                    <Text color="white" fontSize="$4" opacity={0.8}>Saldo Disponível</Text>
                    <Text color="white" fontSize="$9" fontWeight="bold">R$ {balance.toFixed(2)}</Text>
                    <Button
                        marginTop="$2"
                        backgroundColor="white"
                        color="$blue10"
                        onPress={handleAddCredits}
                        icon={<IconSymbol name="plus.circle.fill" size={18} color="#007AFF" />}
                    >
                        Adicionar Créditos
                    </Button>
                </YStack>
            </Card>

            <Text fontSize="$5" fontWeight="bold" marginBottom="$2">Histórico Recente</Text>

            {loading ? (
                <View flex={1} justifyContent="center" alignItems="center">
                    <Spinner size="large" color="$blue10" />
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />
                    }
                    ListEmptyComponent={
                        <View marginTop="$4" alignItems="center">
                            <Text color="$gray10">Nenhuma transação encontrada.</Text>
                        </View>
                    }
                />
            )}
        </View>
    )
}
