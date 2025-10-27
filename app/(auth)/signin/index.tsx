
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { authService } from '@/services';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Image, Text, TextInput, View } from 'react-native';
import styles from '../../../styles/globalStyles';

import {
    TouchableOpacity
} from 'react-native';

export default function SignIn() {
    const { t } = useTranslation();


    const signInSchema = z.object({
        email: z.string().email({ message: t('signin.emailInvalid') }),
        password: z
            .string()
            .min(6, { message: t('signin.passwordMin') })
            .max(50, { message: t('signin.passwordMax') })
    });

    type SignInForm = z.infer<typeof signInSchema>;

    const [loading, setLoading] = React.useState(false);
    const [googleLoading, setGoogleLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const { control, handleSubmit, formState: { errors } } = useForm<SignInForm>({
        resolver: zodResolver(signInSchema)
    });


    const onSubmit = async (data: SignInForm) => {
        try {
            setLoading(true);
            setError(null);

            //if there is no error, we will sign in the user

            const result = await authService.signIn(data.email, data.password);
              if (!result.success) {
                if (result.error === 'INVALID_CREDENTIALS') {
                    setError(t('signin.invalidCredentials'));
                } else {
                    setError(result.error || t('signin.errorOccurred'));
                }
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : t('signin.errorOccurred'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Image
                source={require('../../../assets/images/Logo2.png')}
                style={{ maxWidth: 250, height: 250, marginBottom: 20 }}
                resizeMode="contain"
            />

            <View style={{justifyContent: 'center', width: '90%'}}>

                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, value } }) => (
                        <View style={styles.inputContainer}>
                            <Text>{t('signin.email')}</Text>
                            <View style={styles.inputWrapper} >
                                <Ionicons name="mail" size={24} color="black" />
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('signin.emailPlaceholder')}
                                    placeholderTextColor={"#999"}
                                    onChangeText={onChange}
                                    value={value ?? ''}
                                />
                            </View>
                        </View>
                    )}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

                <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, value } }) => (
                        <View style={styles.inputContainer}>
                            <Text>{t('signin.password')}</Text>
                            <View style={styles.inputWrapper} >
                                <Ionicons name="lock-closed" size={24} color="black" />
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('signin.passwordPlaceholder')}
                                    placeholderTextColor={"#999"}
                                    secureTextEntry
                                    onChangeText={onChange}
                                    value={value ?? ''}
                                />

                            </View>
                        </View>
                    )}
                />

            </View>

            <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
                <Text style={styles.buttonText}>{loading ? t('signin.loading') : t('signin.submit')}</Text>
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
                style={[styles.button, styles.googleButton]}
                onPress={async () => {
                    try {
                        setGoogleLoading(true);
                        setError(null);
                        const result = await authService.signWithGoogle();
                        if (!result.success && result.error) {
                            setError(result.error);
                        }
                    } catch (err) {
                        setError(err instanceof Error ? err.message : t('signin.googleError'));
                    } finally {
                        setGoogleLoading(false);
                    }
                }}
                disabled={googleLoading}
            >
                <Ionicons name="logo-google" size={20} color="white" style={styles.googleIcon} />
                <Text style={styles.buttonText}>
                    {googleLoading ? t('signin.connecting') : t('signin.google')}
                </Text>
            </TouchableOpacity>
            <Text style={styles.linkText}>
                {t('signin.noAccount')}{' '}
                <Text
                    style={styles.linkHighlight}
                    onPress={() => router.push("/signup")}
                >
                    {t('signin.createAccount')}
                </Text>
            </Text>


        </View>


    );



}

