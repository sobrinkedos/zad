import { useState, useEffect, useCallback } from 'react'
import { Alert, Modal, ScrollView, RefreshControl } from 'react-native'
import { View, Text, Button, YStack, XStack, Spinner, Card } from 'tamagui'
import { supabase } from '../../lib/supabase'
import { Zone, Vehicle } from '../../lib/types'
import { useAuth } from '../../context/auth'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { useRouter } from 'expo-router'

export default function HomeScreen() {
  const { session } = useAuth()
  const router = useRouter()
  const [zones, setZones] = useState<Zone[]>([])
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<string>('')
  const [duration, setDuration] = useState<number>(1)
  const [balance, setBalance] = useState<number>(0)
  const [creatingSession, setCreatingSession] = useState(false)

  const loadData = async () => {
    setLoading(true)
    await Promise.all([loadZones(), loadVehicles(), loadBalance()])
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadZones = async () => {
    try {
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .eq('status', 'ativa')
        .order('nome')

      if (error) throw error
      setZones(data || [])
    } catch (error: any) {
      Alert.alert('Erro ao carregar zonas', error.message)
    }
  }

  const loadVehicles = async () => {
    if (!session?.user) return
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false })
    setVehicles(data || [])
    if (data && data.length > 0) {
      setSelectedVehicle(data[0].id)
    }
  }

  const loadBalance = async () => {
    if (!session?.user) return
    const { data } = await supabase
      .from('profiles')
      .select('saldo_creditos')
      .eq('user_id', session.user.id)
      .single()

    if (data) {
      setBalance(data.saldo_creditos)
    } else {
      // Create profile if doesn't exist
      await supabase.from('profiles').insert({
        user_id: session.user.id,
        saldo_creditos: 0
      })
      setBalance(0)
    }
  }

  const handleSelectZone = (zone: Zone) => {
    setSelectedZone(zone)
    if (vehicles.length === 0) {
      Alert.alert('Nenhum veículo', 'Cadastre um veículo antes de estacionar.', [
        { text: 'Ir para Veículos', onPress: () => router.push('/(tabs)/vehicles') },
        { text: 'Cancelar', style: 'cancel' }
      ])
      return
    }
    setSheetOpen(true)
  }

  const confirmSession = async () => {
    if (!selectedZone || !selectedVehicle || !session?.user) return

    const cost = selectedZone.valor_hora * duration
    if (balance < cost) {
      Alert.alert('Saldo insuficiente', `Você precisa de R$ ${cost.toFixed(2)} mas tem apenas R$ ${balance.toFixed(2)}. Adicione créditos na aba Carteira.`)
      return
    }

    setCreatingSession(true)
    try {
      const now = new Date()
      const fim = new Date(now.getTime() + duration * 60 * 60 * 1000)

      // Create session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          user_id: session.user.id,
          vehicle_id: selectedVehicle,
          zone_id: selectedZone.id,
          inicio: now.toISOString(),
          fim: fim.toISOString(),
          status: 'ativa',
          tarifa_aplicada: selectedZone.valor_hora,
          creditos_utilizados: cost
        })
        .select()
        .single()

      if (sessionError) throw sessionError

      // Create transaction
      const { error: trxError } = await supabase
        .from('transactions')
        .insert({
          user_id: session.user.id,
          tipo: 'uso',
          valor: cost,
          session_id: sessionData.id,
          status: 'concluido'
        })

      if (trxError) throw trxError

      // Update balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ saldo_creditos: balance - cost })
        .eq('user_id', session.user.id)

      if (balanceError) throw balanceError

      Alert.alert('Sessão iniciada!', `Estacionamento ativo até ${fim.toLocaleTimeString()}.`)
      setSheetOpen(false)
      setSelectedZone(null)
      loadBalance()
    } catch (error: any) {
      Alert.alert('Erro', error.message)
    } finally {
      setCreatingSession(false)
    }
  }

  const estimatedCost = selectedZone ? selectedZone.valor_hora * duration : 0

  return (
    <View flex={1} backgroundColor="$background" padding="$4" paddingTop="$8">
      <Text fontSize="$8" fontWeight="bold" marginBottom="$4">Estacionar</Text>

      {loading && !refreshing ? (
        <View flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" color="$blue10" />
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />
          }
        >
          <YStack space="$3" paddingBottom="$10">
            {zones.map(zone => (
              <Card key={zone.id} elevate size="$4" bordered padding="$4" onPress={() => handleSelectZone(zone)}>
                <XStack justifyContent="space-between" alignItems="center">
                  <YStack flex={1}>
                    <Text fontSize="$6" fontWeight="bold">{zone.nome}</Text>
                    <Text color="$gray10" fontSize="$3">{zone.localizacao}</Text>
                    <XStack marginTop="$2" space="$3">
                      <Text fontSize="$2" color="$gray10">Vagas: {zone.vagas}</Text>
                      <Text fontSize="$2" color="$gray10">{zone.horario_inicio.substring(0, 5)} - {zone.horario_fim.substring(0, 5)}</Text>
                    </XStack>
                  </YStack>
                  <YStack alignItems="flex-end">
                    <Text fontSize="$5" fontWeight="bold" color="$blue10">R$ {zone.valor_hora.toFixed(2)}</Text>
                    <Text fontSize="$2" color="$gray10">/hora</Text>
                    <Button size="$2" themeInverse marginTop="$2" onPress={() => handleSelectZone(zone)}>
                      <Text color="white">Escolher</Text>
                    </Button>
                  </YStack>
                </XStack>
              </Card>
            ))}

            {zones.length === 0 && (
              <Text textAlign="center" color="$gray10" marginTop="$4">Nenhuma zona de estacionamento encontrada.</Text>
            )}
          </YStack>
        </ScrollView>
      )}

      <Modal
        visible={sheetOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setSheetOpen(false)}
      >
        <View flex={1} backgroundColor="rgba(0,0,0,0.5)" justifyContent="flex-end">
          <View backgroundColor="white" borderTopLeftRadius="$6" borderTopRightRadius="$6" padding="$4" maxHeight="80%">
            <ScrollView>
              <YStack space="$4">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="$7" fontWeight="bold">Confirmar Estacionamento</Text>
                  <Button size="$3" circular icon={<IconSymbol name="xmark" size={16} color="black" />} onPress={() => setSheetOpen(false)} chromeless />
                </XStack>

                {selectedZone && (
                  <View backgroundColor="$blue2" padding="$3" borderRadius="$2">
                    <Text fontWeight="bold" fontSize="$5">{selectedZone.nome}</Text>
                    <Text color="$gray11">{selectedZone.localizacao}</Text>
                  </View>
                )}

                <YStack space="$2">
                  <Text fontSize="$3" fontWeight="bold" marginBottom="$2">Selecione o Veículo</Text>
                  {vehicles.length > 0 ? (
                    vehicles.map((v) => (
                      <Button
                        key={v.id}
                        theme={selectedVehicle === v.id ? 'active' : undefined}
                        backgroundColor={selectedVehicle === v.id ? '$blue10' : '$gray5'}
                        onPress={() => setSelectedVehicle(v.id)}
                        justifyContent="flex-start"
                      >
                        <Text color={selectedVehicle === v.id ? 'white' : 'black'}>
                          {v.placa} - {v.marca} {v.modelo}
                        </Text>
                      </Button>
                    ))
                  ) : (
                    <Button onPress={() => { setSheetOpen(false); router.push('/(tabs)/vehicles'); }}>
                      <Text>Cadastrar Veículo</Text>
                    </Button>
                  )}
                </YStack>

                <YStack>
                  <Text fontSize="$3" fontWeight="bold" marginBottom="$2">Tempo de Estacionamento</Text>
                  <XStack space="$2">
                    {[1, 2, 3, 4].map(h => (
                      <Button
                        key={h}
                        flex={1}
                        onPress={() => setDuration(h)}
                        theme={duration === h ? 'active' : undefined}
                        backgroundColor={duration === h ? '$blue10' : '$gray5'}
                      >
                        <Text color={duration === h ? 'white' : 'black'}>{h}h</Text>
                      </Button>
                    ))}
                  </XStack>
                </YStack>

                <View backgroundColor="$gray3" padding="$3" borderRadius="$2">
                  <XStack justifyContent="space-between" marginBottom="$2">
                    <Text>Custo estimado:</Text>
                    <Text fontWeight="bold">R$ {estimatedCost.toFixed(2)}</Text>
                  </XStack>
                  <XStack justifyContent="space-between">
                    <Text>Seu saldo:</Text>
                    <Text fontWeight="bold" color={balance >= estimatedCost ? '$green10' : '$red10'}>
                      R$ {balance.toFixed(2)}
                    </Text>
                  </XStack>
                </View>

                <Button
                  themeInverse
                  size="$5"
                  onPress={confirmSession}
                  disabled={creatingSession || balance < estimatedCost}
                  opacity={balance < estimatedCost ? 0.5 : 1}
                >
                  {creatingSession ? <Spinner color="white" /> : <Text color="white">Confirmar e Estacionar</Text>}
                </Button>
              </YStack>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}
