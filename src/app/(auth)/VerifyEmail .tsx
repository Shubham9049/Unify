import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';

const VerifyEmail = ({ route }: any) => {
  const { token } = route.params;
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null); // Accept both string and null
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`https://app-database.onrender.com/verify/${token}`, {
          method: 'GET',
        });

        const data = await response.json();

        if (data.msg === 'Email verified successfully!') {
          setVerified(true);
          Alert.alert('Success', 'Your email has been verified!');
          router.push('/(auth)');
        } else {
          setError(data.msg || 'Verification failed.');
        }
      } catch (error) {
        setError('An error occurred while verifying your email.');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <Text style={{ color: 'red' }}>{error}</Text>
      ) : (
        <Text>Your email has been verified successfully!</Text>
      )}
    </View>
  );
};

export default VerifyEmail;
