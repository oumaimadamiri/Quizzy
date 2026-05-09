import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
   ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

const AccessCodeModal = ({ visible, onClose, onVerify, quizTitle }) => {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!accessCode.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le code d\'accès');
      return;
    }

    setLoading(true);
    try {
      await onVerify(accessCode);
      onClose();
    } catch (error) {
      Alert.alert('Erreur', 'Code d\'accès incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.modalHeader}
          >
            <Icon name="lock" size={40} color="#FFF" />
            <Text style={styles.modalTitle}>Code d'Accès Requis</Text>
          </LinearGradient>

          <View style={styles.modalBody}>
            <Text style={styles.quizName}>{quizTitle}</Text>
            <Text style={styles.instruction}>
              Ce quiz est protégé par un code d'accès.
              Veuillez entrer le code fourni par votre professeur.
            </Text>

            <View style={styles.inputContainer}>
              <Icon name="key" size={24} color="#667eea" />
              <TextInput
                style={styles.input}
                placeholder="Entrez le code d'accès"
                placeholderTextColor="rgba(0,0,0,0.4)"
                value={accessCode}
                onChangeText={setAccessCode}
                autoCapitalize="characters"
                maxLength={10}
                autoFocus
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleVerify}
                disabled={loading || !accessCode.trim()}
              >
                <LinearGradient
                  colors={['#11998e', '#38ef7d']}
                  style={[
                    styles.verifyButton,
                    (!accessCode.trim() || loading) && styles.verifyButtonDisabled
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Icon name="check" size={20} color="#FFF" />
                      <Text style={styles.verifyButtonText}>Vérifier</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 10,
  },
  modalBody: {
    padding: 25,
  },
  quizName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 10,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#1a1a2e',
    paddingVertical: 15,
    paddingHorizontal: 10,
    letterSpacing: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  verifyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccessCodeModal;