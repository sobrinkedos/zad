import { Redirect } from 'expo-router';
import { useAuth } from '../context/auth';
import { View, Spinner, Text } from 'tamagui';

export default function Index() {
    const { session, loading } = useAuth();

    console.log('Index: loading=', loading, 'session=', session ? 'exists' : 'null');

    if (loading) {
        return (
            <View flex={1} justifyContent="center" alignItems="center">
                <Spinner size="large" color="$blue10" />
            </View>
        );
    }

    if (!session) {
        console.log('Index: Redirecting to login');
        return <Redirect href="/(auth)/login" />;
    }

    console.log('Index: Redirecting to tabs');
    return <Redirect href="/(tabs)" />;
}
