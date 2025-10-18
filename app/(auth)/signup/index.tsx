
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Ionicons } from '@expo/vector-icons';
import { Controller } from 'react-hook-form';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { authService, SignUpData } from '../../../services';
import styles from '../../../styles/globalStyles';

export default function SignUp() {

    const signUpSchema = z.object({
        name: z.string()
            .min(2, { message: 'Name must be at least 2 characters' })
            .max(30, { message: 'Name must be at most 30 characters' })
            .nonempty({ message: 'Name is required' })
            .regex(/^[a-z0-9_-]+$/, { message: 'Name can only contain letters, numbers, underscores, and hyphens' }),
        email: z.string().email({ message: 'Invalid email address' }),
        password: z
            .string()
            .min(6, { message: 'Password must be at least 6 characters' })
            .max(50, { message: 'Password must be at most 50 characters' })
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

        const signUpData: SignUpData = {
            name: data.name,
            email: data.email,
            password: data.password
        };

        const result = await authService.signUp(signUpData);

        if (!result.success) {
            setError(result.error || 'Ha ocurrido un error');
            alert(result.error || 'Ha ocurrido un error');
        }

        setLoading(false);
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>
        

            <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                    <View style={styles.inputContainer}>
                        <Text>Name</Text>
                        <View style={styles.inputWrapper} >
                            <Ionicons name="person" size={24} color="black" />
                            <TextInput
                                style={styles.input}
                                placeholder="Piedad"
                                placeholderTextColor={"#999"}
                                onChangeText={onChange}
                                value={value}
                            />
                        </View>
                        {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
                        {error === 'Name is already taken' && <Text style={styles.errorText}>Name is already taken</Text>}
                    </View>
                )}
            />

            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (   
                    <View style={styles.inputContainer}>
                        <Text>Email</Text>
                        <View style={styles.inputWrapper} >
                            <Ionicons name="mail" size={24} color="black" />
                            <TextInput
                                style={styles.input}
                                placeholder="you@example.com"
                                placeholderTextColor={"#999"}
                                onChangeText={onChange}
                                value={value}
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
                        <Text>Password</Text>
                        <View style={styles.inputWrapper} >
                            <Ionicons name="lock-closed" size={24} color="black" />
                            <TextInput
                                style={styles.input}
                                placeholder="********"
                                placeholderTextColor={"#999"}
                                secureTextEntry
                                onChangeText={onChange}
                                value={value}
                            />

                        </View>
                        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
                    </View>
                )}
            />


            <TouchableOpacity 
                style={[styles.button, loading && {opacity: 0.7}]}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
            >
            <Text style={styles.buttonText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
            
        </TouchableOpacity>
        </View>


    );

    

}

