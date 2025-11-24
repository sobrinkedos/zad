import { useState, useCallback } from 'react'
import { Alert, FlatList, RefreshControl } from 'react-native'
import { View, Text, Button, YStack, XStack, Card, Spinner } from 'tamagui'
import { useRouter, useFocusEffect } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { Vehicle } from '../../lib/types'
import { useAuth } from '../../context/auth'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { useThemeMode } from '../../app/theme/ThemeContext'

export default function VehiclesScreen() {
    const router = useRouter()
    const { session } = useAuth()
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const { isDarkMode } = useThemeMode()

    const loadVehicles = async () => {
        if (!session?.user) {
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
            setVehicles(data || [])
        } catch (error: any) {
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
        <Card
            elevate
            size="$4"
            bordered
            marginBottom="$3"
            padding="$4"
            backgroundColor={isDarkMode ? '#1A1A1A' : 'white'}
            borderColor={isDarkMode ? '#333333' : '$gray8'}
        >
            <XStack space="$4" alignItems="center">
                {/* Car Icon */}
                <View
                    backgroundColor={isDarkMode ? '#333333' : '#E0F2FE'}
                    padding="$3"
                    borderRadius="$4"
                    alignItems="center"
                    justifyContent="center"
                >
                    <IconSymbol name="car.fill" size={24} color={isDarkMode ? '#60A5FA' : '#0284C7'} />
                </View>

                {/* Vehicle Details */}
                <YStack flex={1}>
                    <View
                        backgroundColor={isDarkMode ? '#333333' : '#F3F4F6'}
                        alignSelf="flex-start"
                        paddingHorizontal="$2"
                        paddingVertical="$1"
                        borderRadius="$2"
                        marginBottom="$1"
                        borderWidth={1}
                        borderColor={isDarkMode ? '#4B5563' : '#E5E7EB'}
                    >
                        <Text
                            fontSize="$5"
                            fontWeight="bold"
                            fontFamily="monospace"
                            color={isDarkMode ? '#FFFFFF' : '#111827'}
                            letterSpacing={1}
                        >
                            {item.placa}
                        </Text>
                    </View>
                    <Text
                        fontSize="$4"
                        fontWeight="600"
                        color={isDarkMode ? '#E5E5E5' : '#374151'}
                    >
                        {item.modelo}
                    </Text>
                    <Text fontSize="$3" color={isDarkMode ? '#9CA3AF' : '#6B7280'}>{item.marca} • {item.cor}</Text>
                </YStack>

                {/* Delete Button */}
                <Button
                    size="$3"
                    onPress={() => handleDelete(item.id)}
                    backgroundColor={isDarkMode ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2'}
                    paddingHorizontal="$3"
                >
                    <XStack space="$2" alignItems="center">
                        <IconSymbol name="trash.fill" size={16} color={isDarkMode ? '#F87171' : '#DC2626'} />
                        <Text fontSize="$3" color={isDarkMode ? '#F87171' : '#DC2626'} fontWeight="600">Excluir</Text>
                    </XStack>
                </Button>
            </XStack>
        </Card>
    )

    return (
        <View flex={1} backgroundColor={isDarkMode ? "#000000" : "#F2F2F7"} padding="$4" paddingTop="$8">
            <XStack justifyContent="space-between" alignItems="center" marginBottom="$6">
                <Text fontSize="$8" fontWeight="bold" color={isDarkMode ? "white" : "black"}>Meus Veículos</Text>
                <Button
                    size="$3"
                    backgroundColor="#2563EB" // Blue 600
                    onPress={() => router.push('/vehicles/new')}
                    pressStyle={{ opacity: 0.8 }}
                    paddingHorizontal="$3"
                >
                    <XStack space="$2" alignItems="center">
                        <IconSymbol name="plus" size={18} color="white" />
                        <Text color="white" fontWeight="bold">Adicionar</Text>
                    </XStack>
                </Button>
            </XStack>

            {loading ? (
                <View flex={1} justifyContent="center" alignItems="center">
                    <Spinner size="large" color="#2563EB" />
                </View>
            ) : (
                <FlatList
                    data={vehicles}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); loadVehicles(); }}
                            tintColor={isDarkMode ? 'white' : 'black'}
                        />
                    }
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={
                        <YStack marginTop="$10" alignItems="center" space="$4">
                            <View backgroundColor={isDarkMode ? '#333333' : '#E5E7EB'} padding="$6" borderRadius="$10">
                                <IconSymbol name="car" size={48} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                            </View>
                            <Text color={isDarkMode ? '#9CA3AF' : '#6B7280'} textAlign="center" fontSize="$4">
                                Você ainda não tem veículos cadastrados.
                            </Text>
                            <Button
                                onPress={() => router.push('/vehicles/new')}
                                backgroundColor="#2563EB"
                                marginTop="$2"
                                pressStyle={{ opacity: 0.8 }}
                            >
                                <Text color="white" fontWeight="bold">Cadastrar Primeiro Veículo</Text>
                            </Button>
                        </YStack>
                    }
                />
            )}
        </View>
    )
}
