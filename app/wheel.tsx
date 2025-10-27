import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LuckyWheel from '../components/LuckyWheel';
import { globalStyles } from '../styles/globalStyles';

const WheelPage = () => {
  const [names, setNames] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  const [showWheel, setShowWheel] = useState(false);
  const { t } = useTranslation();

  const addName = () => {
    if (newName.trim() === '') {
      Alert.alert(t('wheel.errorTitle'), t('wheel.enterName'));
      return;
    }
    if (names.length >= 12) {
      Alert.alert(t('wheel.errorTitle'), t('wheel.maxNames'));
      return;
    }
    setNames([...names, newName.trim()]);
    setNewName('');
  };

  const removeName = (index: number) => {
    const newNames = names.filter((_, i) => i !== index);
    setNames(newNames);
  };

  const clearAllNames = () => {
    setNames([]);
  };

  const spinWheel = () => {
    if (names.length < 2) {
      Alert.alert(t('wheel.errorTitle'), t('wheel.needTwoNames'));
      return;
    }
    setShowWheel(true);
  };


  const closeWheel = () => {
    setShowWheel(false);
  };

  return (
    <View style={{ padding: 30, flex: 1, width: Platform.OS === 'web' ? '75%' : '100%', alignSelf: 'center', backgroundColor: '#fffcfcc4', borderRadius: 12 }}>


      {/* Add Name Section */}
      <View style={globalStyles.inputContainer}>
        <View style={globalStyles.inputWrapper}>
          <TextInput
            style={globalStyles.input}
            value={newName}
            onChangeText={setNewName}
            placeholder={t('wheel.namePlaceholder')}
            placeholderTextColor="#999"
            maxLength={15}
            onSubmitEditing={addName}
          />
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            style={[globalStyles.button, { marginTop: 10 }]}
            onPress={addName}
          >
            <Text style={globalStyles.buttonText}>{t('wheel.addName')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Names List */}
      <View style={{ width: '100%', marginVertical: 20 }}>
        <Text style={[globalStyles.label, { textAlign: 'center', marginBottom: 15 }]}>
          {t('wheel.namesInWheel')} ({names.length}/12)
        </Text>

        {names.length === 0 ? (
          <View style={{
            padding: 20,
            backgroundColor: '#fff',
            borderRadius: 12,
            alignItems: 'center',
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: '#ddd'
          }}>
            <Text style={{ color: '#999', fontSize: 16 }}>
              {t('wheel.noNames')}
            </Text>
            <Text style={{ color: '#999', fontSize: 14, marginTop: 5 }}>
              {t('wheel.addSomeNames')}
            </Text>
          </View>
        ) : (
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 15,
            elevation: 2
          }}>
            {names.map((name, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#fff',
                  borderRadius: 8,
                  marginVertical: 2,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#333' }}>
                  {index + 1}. {name}
                </Text>
                <TouchableOpacity
                  onPress={() => removeName(index)}
                  style={{
                    backgroundColor: '#86779fff',
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 15,
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>
                    {t('wheel.remove')}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={{ width: '100%', alignItems: 'center', marginTop: 20 }}>
        <TouchableOpacity
          style={[
            globalStyles.button,
            {
              backgroundColor: names.length < 2 ? '#ccc' : 'rgba(0, 122, 255, 0.35)',
              marginBottom: 15,
            }
          ]}
          onPress={spinWheel}
          disabled={names.length < 2}
        >
          <Text style={globalStyles.buttonText}>
            🎰 {t('wheel.spin')}
          </Text>

        </TouchableOpacity>

        {names.length > 0 && (
          <TouchableOpacity
            style={[
              globalStyles.button,
              {
                backgroundColor: 'rgba(47, 24, 82, 0.35)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }
            ]}
            onPress={clearAllNames}
          >
            <Text style={globalStyles.buttonText}>{t('wheel.clearAll')}</Text>
          </TouchableOpacity>
        )}
      </View>


      {/* Wheel Modal */}
      <Modal
        visible={showWheel}
        transparent={true}
        animationType="slide"
        onRequestClose={closeWheel}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <LinearGradient
            colors={['#ffffffff', '#938fafff', '#fff']}
            start={[0, 0]}
            end={[1, 1]}
            style={{ borderRadius: 24, padding: 24, alignItems: 'center', width: '95%', maxWidth: 420, elevation: 8, position: 'relative' }}
          >
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              marginBottom: 20,
              textAlign: 'center',
              color: '#333'
            }}>
              {t('wheel.luckyWheel')}
            </Text>

            <LuckyWheel
              segments={names}
              onFinish={() => { }}
            />

            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(0,0,0,0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10
              }}
              onPress={closeWheel}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>×</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
    </View>
  );
};

export default WheelPage;
