import { useAuth } from '@/providers/AuthProvider';
import { groupService } from '@/services/groupService';
import { userService } from '@/services/userService';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { globalStyles } from '../../../styles/globalStyles';

const CrearGrupoPage = () => {
    const { t } = useTranslation();
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
                alert(t('newgroup.enterGroupName'));
                return;
            }
            if (selectedMembers.length === 0) {
                alert(t('newgroup.selectMember'));
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
                setCreatingGroup(false);
                return;
            }

            const newGroup = result.group;

            // Add the group to the creator's groups
            setAddingMembers([nameUser || '']);
            const userAddedToGroup = await userService.addUserToGroup(session?.user?.id || '', newGroup.id);

            if (!userAddedToGroup) {
                setCreatingGroup(false);
                return;
            }


            // Update groups array for all selected members
            for (const memberName of selectedMembers) {
                try {
                    setAddingMembers(prev => [...prev, memberName]);

                    // Get current user data by username
                    // Need to get user ID to add group to user's groups
                    const memberData = users.find(u => u.user_name === memberName);
                    //const memberData = await userService.getUserByUsername(memberName);

                    if (!memberData) {
                        console.error(`Error fetching member ${memberName}`);
                        continue; // Skip this member but continue with others
                    }

                    // Add the member to the group using userService
                    const memberAddedToGroup = await userService.addUserToGroup(memberData.user_id, newGroup.id);
                } catch (error) {
                    console.error(`Error processing member ${memberName}:`, error);
                }
            }

            setgroupName('');
            setselectedMembers([]);
            setCreatingGroup(false);
            setAddingMembers([]);
            Toast.show({
                type: 'success',
                text1: t('newgroup.created'),
            });
            setTimeout(() => {
                router.replace({ pathname: '/', params: { refresh: Date.now().toString() } });
            }, 1500);
        } catch (e) {
            Toast.show({
                type: 'error',
                text1: t('newgroup.error'),
                text2: t('newgroup.errorCreating'),
            });

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
        <View style={{ flex: 1, width: Platform.OS === 'web' ? '75%' : '100%', alignSelf: 'center', backgroundColor: '#fffcfcc4', borderRadius: 12, paddingVertical: 8 }}>
            <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#f9f9f9' }}>
                <Text style={globalStyles.label}>{t('newgroup.nameLabel')}</Text>
                <View style={globalStyles.inputContainer}>
                    <View style={globalStyles.inputWrapper}>
                        <TextInput
                            style={globalStyles.input}
                            value={groupName}
                            onChangeText={setgroupName}
                            placeholder={t('newgroup.namePlaceholder')}
                            placeholderTextColor="#999"
                        />
                    </View>
                </View>
                <Text style={{ marginTop: 16, fontWeight: 'bold' }}>{t('newgroup.searchMembers')}</Text>
                <View style={globalStyles.inputContainer}>
                    <View style={globalStyles.inputWrapper}>
                        <TextInput
                            style={globalStyles.input}
                            value={searchText}
                            onChangeText={setSearchText}
                            placeholder={t('newgroup.searchPlaceholder')}
                            placeholderTextColor="#999"
                        />
                    </View>
                </View>

                {/* Mostrar miembros seleccionados */}
                {selectedMembers.length > 0 && (
                    <View style={{ marginVertical: 8 }}>
                        <Text style={globalStyles.label}>
                            {t('newgroup.selectedMembers', { count: selectedMembers.length })}
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

                <ScrollView style={{ maxHeight: 100, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, backgroundColor: '#adabb24a', marginVertical: 8 }} showsHorizontalScrollIndicator={false}>
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
                            <Text>{u.user_name || ''}</Text>
                        </View>
                    ))}
                </ScrollView>
                {searchText && filteredusers.length === 0 ? (
                    <Text style={{ textAlign: 'center', marginVertical: 8, color: '#666' }}>{t('newgroup.noResults')}</Text>
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
                            ⚙️ {t('newgroup.creating', { groupName })}
                        </Text>
                        <Text style={{ color: '#2E8B57', marginBottom: 8 }}>
                            {t('newgroup.addingMembers')}
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
                            {creatingGroup ? t('newgroup.creatingButton') : t('newgroup.createButton')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ ...globalStyles.button, backgroundColor: 'rgba(255, 0, 0, 0.25)' }}
                        onPress={() => router.back()}
                    >
                        <Text style={globalStyles.buttonText}>{t('newgroup.cancel')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );

};
export default CrearGrupoPage;