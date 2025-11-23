import { useState } from 'react'
import { Alert } from 'react-native'
import { View, Text, Button, YStack, Input, Spinner, XStack } from 'tamagui'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'

export default function Login() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)

    async function signInWithEmail() {
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            Alert.alert('Erro', error.message)
            setLoading(false)
        } else {
            // Auth state change will trigger redirect in index.tsx or we can push
            router.replace('/(tabs)')
        }
    }

    async function signUpWithEmail() {
        setLoading(true)
        const { error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            Alert.alert('Erro', error.message)
        } else {
            Alert.alert('Sucesso', 'Verifique seu email para confirmar o cadastro.')
        }
        setLoading(false)
    }

    return (
        <View flex={1} justifyContent="center" alignItems="center" backgroundColor="$background" padding="$4">
            <YStack space="$4" width="100%" maxWidth={350}>
                <Text fontSize="$9" fontWeight="bold" color="$color" textAlign="center" marginBottom="$4">
                    ZAD
                </Text>

                <Input
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    size="$4"
                />

                <Input
                    placeholder="Senha"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    size="$4"
                />

                <Button
                    size="$5"
                    themeInverse
                    onPress={isSignUp ? signUpWithEmail : signInWithEmail}
                    disabled={loading}
                    marginTop="$2"
                >
                    {loading ? <Spinner color="$color" /> : (isSignUp ? 'Cadastrar' : 'Entrar')}
                </Button>

                <XStack justifyContent="center" marginTop="$4">
                    <Text color="$gray10" fontSize="$3">
                        {isSignUp ? 'Já tem uma conta? ' : 'Não tem conta? '}
                    </Text>
                    <Text
                        color="$blue10"
                        fontWeight="bold"
                        fontSize="$3"
                        onPress={() => setIsSignUp(!isSignUp)}
                    >
                        {isSignUp ? 'Entrar' : 'Cadastre-se'}
                    </Text>
                </XStack>
            </YStack>
        </View>
    )
}
