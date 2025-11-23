import { useState, useCallback } from 'react'
import { Alert, FlatList, RefreshControl } from 'react-native'
import { View, Text, Button, YStack, XStack, Card, Spinner } from 'tamagui'
import { useRouter, useFocusEffect } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { Vehicle } from '../../lib/types'
import { useAuth } from '../../context/auth'
import { IconSymbol } from '@/components/ui/icon-symbol'

export default function VehiclesScreen() {
    const router = useRouter()
    const { session } = useAuth()
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const loadVehicles = async () => {
        console.log('Vehicles: loading vehicles...', session?.user?.id)
        if (!session?.user) {
            console.log('Vehicles: no session, stopping load')
            setLoading(false)
            setRefreshing(false)
            return
        }
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            console.log('Vehicles: loaded', data?.length)
            setVehicles(data || [])
        } catch (error: any) {
            console.error('Vehicles: error', error.message)
            Alert.alert('Erro', error.message)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useFocusEffect(
        useCallback(() => {
            loadVehicles()
        }, [])
    )

    const handleDelete = async (id: string) => {
        Alert.alert(
            'Confirmar exclusão',
            'Deseja realmente excluir este veículo?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase.from('vehicles').delete().eq('id', id)
                            if (error) throw error
                            loadVehicles()
                        } catch (error: any) {
                            Alert.alert('Erro', error.message)
                        }
                    }
                }
            ]
        )
    }

    const renderItem = ({ item }: { item: Vehicle }) => (
        <Card elevate size="$4" bordered marginBottom="$3" padding="$4">
            <XStack justifyContent="space-between" alignItems="center">
                <YStack>
                    <Text fontSize="$6" fontWeight="bold">{item.placa}</Text>
                    <Text color="$gray10">{item.marca} {item.modelo} • {item.cor}</Text>
                </YStack>
                <Button
                    size="$3"
                    chromeless
                    icon={<IconSymbol name="trash.fill" size={20} color="#ff4444" />}
                    onPress={() => handleDelete(item.id)}
                />
            </XStack>
        </Card>
    )

    return (
        <View flex={1} backgroundColor="$background" padding="$4" paddingTop="$8">
            <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
                <Text fontSize="$8" fontWeight="bold">Meus Veículos</Text>
                <Button
                    size="$3"
                    themeInverse
                    icon={<IconSymbol name="plus" size={20} color="white" />}
                    onPress={() => router.push('/vehicles/new')}
                >
                    Adicionar
                </Button>
            </XStack>

            {loading ? (
                <View flex={1} justifyContent="center" alignItems="center">
                    <Spinner size="large" color="$blue10" />
                </View>
            ) : (
                <FlatList
                    data={vehicles}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadVehicles(); }} />
                    }
                    ListEmptyComponent={
                        <View marginTop="$10" alignItems="center">
                            <Text color="$gray10">Nenhum veículo cadastrado.</Text>
                        </View>
                    }
                />
            )}
        </View>
    )
}
