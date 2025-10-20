import { useAuth } from '@/providers/AuthProvider';
import { Group, groupService, userService } from '@/services';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

const Page = () => {
	const [gruposUsuario, setGruposUsuario] = useState<Group[]>([]);
	const { session, nameUser } = useAuth();
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		getUserGroups();
	}, []);


	const getUserGroups = async () => {

		if (!session?.user?.id) return;

		try {
			setLoading(true);
			// Get user's group IDs
			const userGroupIds = await userService.getUserGroups(session.user.id);

			if (userGroupIds.length === 0) {
				setGruposUsuario([]);
				return;
			}

			// Get group details
			const groups = await groupService.getGroupsByIds(userGroupIds);
			setGruposUsuario(groups);

		} catch (error) {
			setGruposUsuario([]);
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={{ backgroundColor: '#f0f0f0' }}>
			<ScrollView style={{maxHeight:600, padding: 16, width: '90%', alignSelf: 'center'}} showsVerticalScrollIndicator={false}>
				{gruposUsuario.map((grupo) => (
					<TouchableOpacity
						key={grupo.id}
						style={{
							marginVertical: 8,
							padding: 12,
							backgroundColor: '#fff',
							borderRadius: 8,
							elevation: 2,
							boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
						}}
						onPress={() => router.push({ pathname: `/(auth)/group/${grupo.id}/page` as any })}
					>
						<Text style={{ fontSize: 16 }}>{grupo.name}</Text>
					</TouchableOpacity>
				))}
			</ScrollView>

			<View style={{ justifyContent: 'center', alignItems: 'center' }}>
				<TouchableOpacity
					style={globalStyles.button}
					onPress={() => router.push('/(auth)/newgroup/' as any)}
				>
					<Text style={globalStyles.buttonText}>Create Group</Text>
				</TouchableOpacity>
			</View>

			
		</View>
	);
};
export default Page;