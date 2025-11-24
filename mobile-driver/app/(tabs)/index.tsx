import { useState, useEffect, useCallback } from 'react'
import { Alert, Modal, ScrollView, RefreshControl } from 'react-native'
import { View, Text, Button, YStack, XStack, Spinner, Card } from 'tamagui'
import { supabase } from '../../lib/supabase'
import { Zone, Vehicle } from '../../lib/types'
import { useAuth } from '../../context/auth'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { useRouter } from 'expo-router'
import { APP_VERSION } from '../../app/version'
import { useThemeMode } from '../../app/theme/ThemeContext'

interface ActiveSession {
  id: string
  inicio: string
  fim: string
  status: string
  zone: Zone
  vehicle: Vehicle
}

export default function HomeScreen() {
  const { session } = useAuth()
  const router = useRouter()
  const [zones, setZones] = useState<Zone[]>([])
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null)
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<string>('')
  const [duration, setDuration] = useState<number>(1)
  const [balance, setBalance] = useState<number>(0)
  const [creatingSession, setCreatingSession] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string>('')
  const { isDarkMode, toggleTheme } = useThemeMode()

  const loadData = async () => {
    setLoading(true)
    await Promise.all([loadZones(), loadVehicles(), loadBalance(), loadActiveSession()])
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Timer for active session
  useEffect(() => {
    if (!activeSession) return

    const timer = setInterval(() => {
      const now = new Date()
      const end = new Date(activeSession.fim)
      const diff = end.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft('Expirado')
        // Optionally reload to check if status changed
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [activeSession])

  const loadActiveSession = async () => {
    if (!session?.user) return

    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          zone:zones(*),
          vehicle:vehicles(*)
        `)
        .eq('user_id', session.user.id)
        .eq('status', 'ativa')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error loading active session:', error)
      }

      if (data) {
        setActiveSession(data as unknown as ActiveSession)
      } else {
        setActiveSession(null)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

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

  const handleEndSession = async () => {
    if (!activeSession || !session?.user) return

    Alert.alert(
      'Encerrar Estacionamento',
      'Deseja realmente encerrar sua sessão e liberar a vaga? O tempo não utilizado será reembolsado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Encerrar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true)
              const now = new Date()
              const originalEnd = new Date(activeSession.fim)

              // Calculate refund if applicable
              let refundAmount = 0
              if (now < originalEnd) {
                const diffMs = originalEnd.getTime() - now.getTime()
                const diffHours = diffMs / (1000 * 60 * 60)
                // Refund proportional to remaining time
                refundAmount = diffHours * activeSession.zone.valor_hora
              }

              // Update session
              const { error: sessionError } = await supabase
                .from('sessions')
                .update({ status: 'finalizada', fim: now.toISOString() })
                .eq('id', activeSession.id)

              if (sessionError) throw sessionError

              // Process refund if amount > 0
              if (refundAmount > 0) {
                // Create refund transaction
                const { error: trxError } = await supabase
                  .from('transactions')
                  .insert({
                    user_id: session.user.id,
                    tipo: 'estorno',
                    valor: refundAmount,
                    session_id: activeSession.id,
                    status: 'concluido'
                  })

                if (trxError) throw trxError

                // Fetch current balance to ensure accuracy
                const { data: profileData } = await supabase
                  .from('profiles')
                  .select('saldo_creditos')
                  .eq('user_id', session.user.id)
                  .single()

                const currentBalance = profileData?.saldo_creditos || 0

                // Update balance
                const { error: balanceError } = await supabase
                  .from('profiles')
                  .update({ saldo_creditos: currentBalance + refundAmount })
                  .eq('user_id', session.user.id)

                if (balanceError) throw balanceError
              }

              Alert.alert('Sucesso', `Estacionamento encerrado.${refundAmount > 0 ? ` Reembolso de R$ ${refundAmount.toFixed(2)} creditado.` : ''}`)
              loadData() // Reload everything
            } catch (error: any) {
              Alert.alert('Erro', error.message)
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
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
      loadData() // Reload to show active session
    } catch (error: any) {
      Alert.alert('Erro', error.message)
    } finally {
      setCreatingSession(false)
    }
  }

  const estimatedCost = selectedZone ? selectedZone.valor_hora * duration : 0

  return (
    <View flex={1} backgroundColor={isDarkMode ? "$black" : "$background"} padding="$4" paddingTop="$8">
      <View flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="$4">
        <Text fontSize="$8" fontWeight="bold" color={isDarkMode ? "white" : "black"}>Estacionar</Text>
        <Button size="$2" backgroundColor="transparent" onPress={toggleTheme} chromeless>
          <Text fontSize="$4">{isDarkMode ? "🌙" : "☀️"}</Text>
        </Button>
      </View>

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
          <YStack space="$4" paddingBottom="$10">

            {/* Active Session Card */}
            {activeSession && (
              <Card elevate size="$4" bordered padding="$4" backgroundColor="$blue2" borderColor="$blue8" borderWidth={1}>
                <YStack space="$3">
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="$5" fontWeight="bold" color="$blue10">Estacionamento Ativo</Text>
                    <View backgroundColor="$green8" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2">
                      <Text color="white" fontSize="$2" fontWeight="bold">EM ANDAMENTO</Text>
                    </View>
                  </XStack>

                  <YStack alignItems="center" marginVertical="$4">
                    <Text fontSize="$9" fontWeight="bold" color="$blue10">{timeLeft}</Text>
                    <Text color="$gray10">Tempo Restante</Text>
                  </YStack>

                  <YStack space="$2" backgroundColor="white" padding="$3" borderRadius="$3">
                    <XStack justifyContent="space-between">
                      <Text color="#666" fontWeight="600">Zona:</Text>
                      <Text fontWeight="bold" color="black">{activeSession.zone?.nome}</Text>
                    </XStack>
                    <XStack justifyContent="space-between">
                      <Text color="#666" fontWeight="600">Veículo:</Text>
                      <Text fontWeight="bold" color="black">{activeSession.vehicle?.placa}</Text>
                    </XStack>
                    <XStack justifyContent="space-between">
                      <Text color="#666" fontWeight="600">Término:</Text>
                      <Text fontWeight="bold" color="black">{new Date(activeSession.fim).toLocaleTimeString()}</Text>
                    </XStack>
                  </YStack>

                  <Button backgroundColor="$red10" onPress={handleEndSession} marginTop="$2">
                    <Text color="white" fontWeight="bold">Encerrar e Sair da Vaga</Text>
                  </Button>
                </YStack>
              </Card>
            )}

            {/* Dashboard Header - Only show if no active session */}
            {!activeSession && (
              <YStack space="$4" marginBottom="$2">
                {/* Balance Card */}
                <Card bordered padding="$4" backgroundColor="$blue2" borderColor="$blue8">
                  <XStack justifyContent="space-between" alignItems="center">
                    <YStack>
                      <Text fontSize="$3" color="$gray11">Seu Saldo</Text>
                      <Text fontSize="$8" fontWeight="bold" color="$blue10">R$ {balance.toFixed(2)}</Text>
                    </YStack>
                    <Button size="$3" backgroundColor="white" onPress={() => router.push('/(tabs)/wallet')}>
                      <Text color="$blue10" fontWeight="bold">Recarregar</Text>
                    </Button>
                  </XStack>
                </Card>

                {/* Vehicle Quick View */}
                <XStack space="$3" overflow="hidden">
                  {vehicles.length > 0 ? (
                    <Card bordered padding="$3" flex={1} backgroundColor="white">
                      <YStack>
                        <Text fontSize="$2" color="$gray10">Veículo Principal</Text>
                        <Text fontSize="$5" fontWeight="bold" color="black">{vehicles[0].placa}</Text>
                        <Text fontSize="$3" color="$gray11">{vehicles[0].modelo}</Text>
                      </YStack>
                    </Card>
                  ) : (
                    <Card bordered padding="$3" flex={1} backgroundColor="white" onPress={() => router.push('/(tabs)/vehicles')}>
                      <XStack alignItems="center" space="$2">
                        <View backgroundColor="$gray4" padding="$2" borderRadius="$10">
                          <IconSymbol name="plus" size={20} color="black" />
                        </View>
                        <Text fontWeight="bold" color="black">Cadastrar Veículo</Text>
                      </XStack>
                    </Card>
                  )}
                </XStack>

                <Text fontSize="$5" fontWeight="bold" marginTop="$2">Zonas Disponíveis</Text>
              </YStack>
            )}

            {/* Zone List */}
            {!activeSession && (
              <YStack space="$3">
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
                        <Button size="$2" backgroundColor="$blue10" marginTop="$2" onPress={() => handleSelectZone(zone)}>
                          <Text color="white" fontWeight="bold">Escolher</Text>
                        </Button>
                      </YStack>
                    </XStack>
                  </Card>
                ))}

                {zones.length === 0 && (
                  <Text textAlign="center" color="$gray10" marginTop="$4">Nenhuma zona de estacionamento encontrada.</Text>
                )}
              </YStack>
            )}

            {activeSession && (
              <Text textAlign="center" color="$gray8" fontSize="$2" marginTop="$4">
                Você já possui um estacionamento ativo. Encerre-o para iniciar outro.
              </Text>
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
                  <Text fontSize="$3" fontWeight="bold" marginBottom="$2" color="black">Tempo de Estacionamento</Text>
                  <XStack space="$2">
                    {[1, 2, 3, 4].map(h => (
                      <Button
                        key={h}
                        flex={1}
                        onPress={() => setDuration(h)}
                        theme={duration === h ? 'active' : undefined}
                        backgroundColor={duration === h ? '$blue10' : 'white'}
                        borderColor="$gray8"
                        borderWidth={1}
                      >
                        <Text color={duration === h ? 'white' : 'black'} fontWeight="bold">{h}h</Text>
                      </Button>
                    ))}
                  </XStack>
                </YStack>

                <View backgroundColor="white" padding="$3" borderRadius="$2" borderWidth={1} borderColor="$gray8">
                  <XStack justifyContent="space-between" marginBottom="$2">
                    <Text color="black">Custo estimado:</Text>
                    <Text fontWeight="bold" color="black">R$ {estimatedCost.toFixed(2)}</Text>
                  </XStack>
                  <XStack justifyContent="space-between">
                    <Text color="black">Seu saldo:</Text>
                    <Text fontWeight="bold" color={balance >= estimatedCost ? '$green10' : '$red10'}>
                      R$ {balance.toFixed(2)}
                    </Text>
                  </XStack>
                </View>

                <Button
                  backgroundColor="$blue10"
                  size="$5"
                  onPress={confirmSession}
                  disabled={creatingSession || balance < estimatedCost}
                  opacity={balance < estimatedCost ? 0.5 : 1}
                >
                  {creatingSession ? <Spinner color="white" /> : <Text color="white" fontWeight="bold">Confirmar e Estacionar</Text>}
                </Button>

                <Button
                  chromeless
                  onPress={() => setSheetOpen(false)}
                  marginTop="$2"
                >
                  <Text color="$gray11">Cancelar</Text>
                </Button>
              </YStack>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}
