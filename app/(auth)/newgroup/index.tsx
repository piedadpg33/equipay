import { useAuth } from '@/providers/AuthProvider';
import { groupService } from '@/services/groupService';
import { userService } from '@/services/userService';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { globalStyles } from '../../../styles/globalStyles';

const CrearGrupoPage = () => {
    const [groupName, setgroupName] = useState('');
    const [selectedMembers, setselectedMembers] = useState<string[]>([]);
    const [users, setusers] = useState<any[]>([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [creatingGroup, setCreatingGroup] = useState(false);
    const [addingMembers, setAddingMembers] = useState<string[]>([]);
    const { session, nameUser } = useAuth();


    useEffect(() => {
        const getUsersNames = async () => {
            try {
                setLoading(true);
                const users = await userService.getAllUsersExcept(nameUser || '');
                setusers(users);
            } catch (e) {
                console.error('Error fetching users:', e);
                alert('Error fetching users');
            } finally {
                setLoading(false);
            }
        }
        getUsersNames();

    }, []);
    

        /**
         * Crea un nuevo grupo 
         * @returns 
         */
    const crearGrupo = async () => {
        try {
            setLoading(true);
            if (!groupName) {
                alert('Please enter a group name.');
                return;
            }
            if (selectedMembers.length === 0) {
                alert('Select at least one member.');
                return;
            }

            setCreatingGroup(true);
            setAddingMembers([]);

            // Creating the group with the owner included in members
            const result = await groupService.createGroup({
                name: groupName.trim(),
                members: [nameUser || '', ...selectedMembers]
            });

            if (!result.success || !result.group) {
                console.error('Error creating group:', result.error);
                alert('Error al crear el grupo');
                setCreatingGroup(false);
                return;
            }

            const newGroup = result.group;

            // Add the current user to the group
            setAddingMembers([nameUser || '']);
            const userAddedToGroup = await userService.addUserToGroup(session?.user?.id || '', newGroup.id);
            
            if (!userAddedToGroup) {
                console.error('Error adding user to group');
                alert('Error updating user groups');
                setCreatingGroup(false);
                return;
            }

            // Update groups array for all selected members
            for (const memberName of selectedMembers) {
                try {
                    setAddingMembers(prev => [...prev, memberName]);
                    
                    // Get current user data by username
                    const memberData = await userService.getUserByUsername(memberName);

                    if (!memberData) {
                        console.error(`Error fetching member ${memberName}`);
                        continue; // Skip this member but continue with others
                    }

                    // Add the member to the group using userService
                    const memberAddedToGroup = await userService.addUserToGroup(memberData.user_id, newGroup.id);

                    if (!memberAddedToGroup) {
                        console.error(`Error updating groups for member ${memberName}`);
                    }
                } catch (error) {
                    console.error(`Error processing member ${memberName}:`, error);
                }
            }

            console.log('Grupo creado con ID:', newGroup.id);

            setgroupName('');
            setselectedMembers([]);
            setCreatingGroup(false);
            setAddingMembers([]);
            alert('Group created successfully!');
            router.replace({ pathname: '/', params: { refresh: Date.now().toString() } });
        } catch (e) {
            console.error('Error creating group: ', e);
            setCreatingGroup(false);
            setAddingMembers([]);
        } finally {
            setLoading(false);
        }
    };

    // Filtra los users según el texto de búsqueda
    const filteredusers = searchText ? users.filter(u =>
        u.user_name?.toLowerCase().includes(searchText.toLowerCase())
    ) : [];

    return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#f9f9f9' }}>
        <Text style={globalStyles.label}>Name of group:</Text>
        <View style={globalStyles.inputContainer}>
            <View style={globalStyles.inputWrapper}>
                <TextInput
                    style={globalStyles.input}
                    value={groupName}
                    onChangeText={setgroupName}
                    placeholder="Enter group name"
                    placeholderTextColor="#999"
                />
            </View>
        </View>
        <Text style={{ marginTop: 16, fontWeight: 'bold' }}>Search members:</Text>
        <View style={globalStyles.inputContainer}>
            <View style={globalStyles.inputWrapper}>
                <TextInput
                    style={globalStyles.input}
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="Search by username"
                    placeholderTextColor="#999"
                />
            </View>
        </View>

        {/* Mostrar miembros seleccionados */}
        {selectedMembers.length > 0 && (
            <View style={{ marginVertical: 8 }}>
                <Text style={globalStyles.label}>
                    Selected members ({selectedMembers.length}):
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {selectedMembers.map((member) => (
                        <View 
                            key={member} 
                            style={{ 
                                backgroundColor: '#E3F2FD', 
                                paddingHorizontal: 12, 
                                paddingVertical: 6, 
                                borderRadius: 16,
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ color: '#1976D2', fontSize: 14 }}>{member}</Text>
                            <TouchableOpacity
                                onPress={() => setselectedMembers(selectedMembers.filter(name => name !== member))}
                                style={{ marginLeft: 8 }}
                            >
                                <Text style={{ color: '#1976D2', fontSize: 16, fontWeight: 'bold' }}>×</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>
        )}

        <View style={{ maxHeight: 200, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, backgroundColor: '#fff', marginVertical: 8 }}>
            {filteredusers.map((u) => (
                <View key={u.user_name} style={{ flexDirection: 'row', alignItems: 'center', padding: 8, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                    <Switch
                        value={selectedMembers.includes(u.user_name)}
                        onValueChange={() => {
                            if (selectedMembers.includes(u.user_name)) {
                                setselectedMembers(selectedMembers.filter(name => name !== u.user_name));
                            } else {
                                setselectedMembers([...selectedMembers, u.user_name]);
                            }
                        }}
                        style={{ marginRight: 8 }}
                    />
                    <Text>{u.user_name||''}</Text>
                </View>
            ))}
        </View>
        {searchText && filteredusers.length === 0 ? (
            <Text style={{ textAlign: 'center', marginVertical: 8, color: '#666' }}>No results</Text>
        ) : null}

        {/* Show group creation progress */}
        {creatingGroup && (
            <View style={{ 
                backgroundColor: '#F0F8FF', 
                padding: 16, 
                borderRadius: 8, 
                marginVertical: 8,
                borderWidth: 1,
                borderColor: '#B0E0E6'
            }}>
                <Text style={{ fontWeight: 'bold', color: '#2E8B57', marginBottom: 8 }}>
                    ⚙️ Creating group "{groupName}"...
                </Text>
                <Text style={{ color: '#2E8B57', marginBottom: 8 }}>
                    Adding members to the group:
                </Text>
                {addingMembers.map((member, index) => (
                    <Text key={index} style={{ color: '#2E8B57', marginLeft: 16 }}>
                        ✓ {member}
                    </Text>
                ))}
            </View>
        )}

        <View style={{ justifyContent: 'center', alignItems: 'center' }} >

            <TouchableOpacity
                style={globalStyles.button}
                onPress={crearGrupo}
                disabled={creatingGroup}
            >
                <Text style={globalStyles.buttonText}>
                    {creatingGroup ? 'Creating group...' : 'Create group'}
                </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
                style={{ ...globalStyles.button, backgroundColor: 'rgba(255, 0, 0, 0.25)' }}
                onPress={() => router.back()}
            >
                <Text style={globalStyles.buttonText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    </ScrollView>
);

};
export default CrearGrupoPage;