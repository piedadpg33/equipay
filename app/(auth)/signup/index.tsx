
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Ionicons } from '@expo/vector-icons';
import { Controller } from 'react-hook-form';

import { useTranslation } from 'react-i18next';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { authService, SignInData } from '../../../services';
import styles from '../../../styles/globalStyles';


export default function SignUp() {
    const { t } = useTranslation();

    const signUpSchema = z.object({
        // name: z.string()
        //     .min(2, { message: 'Name must be at least 2 characters' })
        //     .max(30, { message: 'Name must be at most 30 characters' })
        //     .nonempty({ message: 'Name is required' })
        //     .regex(/^[a-z0-9_-]+$/, { message: 'Name can only contain letters, numbers, underscores, and hyphens' }),
        email: z.string().email({ message: t('signup.emailInvalid') }),
        password: z
            .string()
            .min(6, { message: t('signup.passwordMin') })
            .max(50, { message: t('signup.passwordMax') })
    });

    type SignUpForm = z.infer<typeof signUpSchema>;

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const { control, handleSubmit, formState: { errors } } = useForm<SignUpForm>({
        resolver: zodResolver(signUpSchema)
    });

    const onSubmit = async (data: SignUpForm) => {
        setLoading(true);
        setError(null);

        const signInData: SignInData = {
            email: data.email,
            password: data.password
        };

        const result = await authService.signUp(signInData);

        if (!result.success) {
            setError(result.error || t('signup.errorOccurred'));
            alert(result.error || t('signup.errorOccurred'));
        }

        setLoading(false);
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('signup.title')}</Text>
            <View style={{ width: '90%' }}>
                {/* <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, value } }) => (
                        <View style={styles.inputContainer}>
                            <Text>{t('signup.name', 'Name')}</Text>
                            <View style={styles.inputWrapper} >
                                <Ionicons name="person" size={24} color="black" />
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('signup.namePlaceholder', 'Piedad')}
                                    placeholderTextColor={"#999"}
                                    onChangeText={onChange}
                                    value={value ?? ''}
                                />
                            </View>
                            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
                            {error === 'Name is already taken' && <Text style={styles.errorText}>{t('signup.nameTaken', 'Name is already taken')}</Text>}
                        </View>
                    )}
                /> */}

                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, value } }) => (
                        <View style={styles.inputContainer}>
                            <Text>{t('signup.email')}</Text>
                            <View style={styles.inputWrapper} >
                                <Ionicons name="mail" size={24} color="black" />
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('signup.emailPlaceholder')}
                                    placeholderTextColor={"#999"}
                                    onChangeText={onChange}
                                    value={value ?? ''}
                                />
                            </View>
                            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
                        </View>
                    )}
                />

                <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, value } }) => (
                        <View style={styles.inputContainer}>
                            <Text>{t('signup.password')}</Text>
                            <View style={styles.inputWrapper} >
                                <Ionicons name="lock-closed" size={24} color="black" />
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('signup.passwordPlaceholder')}
                                    placeholderTextColor={"#999"}
                                    secureTextEntry
                                    onChangeText={onChange}
                                    value={value ?? ''}
                                />

                            </View>
                            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
                        </View>
                    )}
                />
            </View>

            <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
            >
                <Text style={styles.buttonText}>{loading ? t('signup.loading') : t('signup.submit')}</Text>
            </TouchableOpacity>
        </View>
    );
}

