import { useAuth } from "@/providers/AuthProvider";
import { authService, SignUpData } from "@/services/authService";
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { z } from "zod";
import styles from "../../../styles/globalStyles";

export default function RegisterNameScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  const {nameUser,setNameUser} = useAuth();

    const signUpSchema = z.object({
        name: z.string()
            .min(2, { message: 'Name must be at least 2 characters' })
            .max(30, { message: 'Name must be at most 30 characters' })
            .nonempty({ message: 'Name is required' })
            .regex(/^[a-z0-9_-]+$/, { message: 'Name can only contain letters, numbers, underscores, and hyphens' }),
    });

    type SignUpForm = z.infer<typeof signUpSchema>;
    const { control, handleSubmit, formState: { errors } } = useForm<SignUpForm>({
        resolver: zodResolver(signUpSchema),
    });

    
    const onSubmit = async (data: SignUpForm) => {
            try {
            setLoading(true);
            setError(null);

            const signUpData: SignUpData = {
                name: data.name,
                email: session?.user.email || '',
            };

            const result = await authService.signUpWithGoogle(signUpData,session);
            if (result.success) {
                setNameUser?.(data.name);
            } else {
                setError(result.error || 'Sign up failed. Please try again.');
            }
        } catch (error) {
            setError('Error during sign up. Please try again.');
            
        } finally {

            setLoading(false);
        }
    }

  return (
    <View style={styles.container}>
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
                            value={value ?? ''}
                        />
                    </View>
                    {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
                    {error === 'Name is already taken' && <Text style={styles.errorText}>Name is already taken</Text>}
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
