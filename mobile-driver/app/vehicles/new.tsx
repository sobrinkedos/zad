import { useState } from 'react'
import { Alert } from 'react-native'
import { View, Text, Button, YStack, Input, Spinner, XStack } from 'tamagui'
import { useRouter, Stack } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/auth'

export default function NewVehicleScreen() {
    const router = useRouter()
    const { session } = useAuth()
    const [loading, setLoading] = useState(false)

    const [placa, setPlaca] = useState('')
    const [marca, setMarca] = useState('')
    const [modelo, setModelo] = useState('')
    const [cor, setCor] = useState('')

    const handleSave = async () => {
        if (!placa) {
            Alert.alert('Erro', 'A placa é obrigatória')
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase.from('vehicles').insert({
                user_id: session?.user?.id,
                placa: placa.toUpperCase(),
                marca,
                modelo,
                cor,
            })

            if (error) throw error

            Alert.alert('Sucesso', 'Veículo cadastrado!')
            router.back()
        } catch (error: any) {
            Alert.alert('Erro', error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <View flex={1} backgroundColor="$background" padding="$4">
            <Stack.Screen options={{ title: 'Novo Veículo', headerBackTitle: 'Voltar' }} />

            <YStack space="$4">
                <YStack>
                    <Text fontSize="$3" fontWeight="bold" marginBottom="$2">Placa</Text>
                    <Input
                        placeholder="ABC1234"
                        value={placa}
                        onChangeText={t => setPlaca(t.toUpperCase())}
                        autoCapitalize="characters"
                        maxLength={7}
                    />
                </YStack>

                <XStack space="$2">
                    <YStack flex={1}>
                        <Text fontSize="$3" fontWeight="bold" marginBottom="$2">Marca</Text>
                        <Input placeholder="Ex: Toyota" value={marca} onChangeText={setMarca} />
                    </YStack>
                    <YStack flex={1}>
                        <Text fontSize="$3" fontWeight="bold" marginBottom="$2">Modelo</Text>
                        <Input placeholder="Ex: Corolla" value={modelo} onChangeText={setModelo} />
                    </YStack>
                </XStack>

                <YStack>
                    <Text fontSize="$3" fontWeight="bold" marginBottom="$2">Cor</Text>
                    <Input placeholder="Ex: Prata" value={cor} onChangeText={setCor} />
                </YStack>

                <Button
                    themeInverse
                    size="$5"
                    onPress={handleSave}
                    disabled={loading}
                    marginTop="$4"
                >
                    {loading ? <Spinner color="white" /> : 'Salvar Veículo'}
                </Button>
            </YStack>
        </View>
    )
}
