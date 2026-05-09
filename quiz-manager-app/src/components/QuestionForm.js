import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

const QuestionForm = ({ question, onSave, onCancel, categories }) => {
  const [formData, setFormData] = useState({
    id: question?.id || Date.now(),
    text: question?.text || '',
    category: question?.category || '',
    points: question?.points?.toString() || '1',
    type: question?.type || 'MULTIPLE_CHOICE',
    explanation: question?.explanation || '',
    options: question?.options || [
      { id: Date.now() + 1, text: '', isCorrect: true, order: 1 },
      { id: Date.now() + 2, text: '', isCorrect: false, order: 2 },
    ],
  });

  const [showAddOption, setShowAddOption] = useState(false);
  const [newOptionText, setNewOptionText] = useState('');

  const questionTypes = [
    { 
      id: 'MULTIPLE_CHOICE', 
      label: 'Choix unique', 
      icon: 'checkbox-marked-circle-outline',
      gradient: ['#667eea', '#764ba2']
    },
    { 
      id: 'TRUE_FALSE', 
      label: 'Vrai/Faux', 
      icon: 'check-circle-outline',
      gradient: ['#11998e', '#38ef7d']
    },
    { 
      id: 'MULTIPLE_ANSWER', 
      label: 'Choix multiples', 
      icon: 'checkbox-multiple-marked',
      gradient: ['#f093fb', '#f5576c']
    },
    { 
      id: 'SHORT_ANSWER', 
      label: 'Réponse courte', 
      icon: 'text-short',
      gradient: ['#FA8BFF', '#2BD2FF']
    },
  ];

  const handleAddOption = () => {
    if (!newOptionText.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un texte pour l\'option');
      return;
    }

    const newOption = {
      id: Date.now(),
      text: newOptionText.trim(),
      isCorrect: false,
      order: formData.options.length + 1,
    };

    setFormData(prev => ({
      ...prev,
      options: [...prev.options, newOption],
    }));

    setNewOptionText('');
    setShowAddOption(false);
  };

  const handleRemoveOption = (optionId) => {
    if (formData.options.length <= 2) {
      Alert.alert('Erreur', 'Une question doit avoir au moins deux options');
      return;
    }

    setFormData(prev => ({
      ...prev,
      options: prev.options.filter(opt => opt.id !== optionId),
    }));
  };

  const handleOptionTextChange = (optionId, text) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map(opt =>
        opt.id === optionId ? { ...opt, text } : opt
      ),
    }));
  };

  const handleCorrectOptionChange = (optionId) => {
    if (formData.type === 'MULTIPLE_ANSWER') {
      setFormData(prev => ({
        ...prev,
        options: prev.options.map(opt =>
          opt.id === optionId ? { ...opt, isCorrect: !opt.isCorrect } : opt
        ),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        options: prev.options.map(opt =>
          opt.id === optionId
            ? { ...opt, isCorrect: true }
            : { ...opt, isCorrect: false }
        ),
      }));
    }
  };

  const handleSave = () => {
    if (!formData.text.trim()) {
      Alert.alert('Erreur', 'Le texte de la question est requis');
      return;
    }

    if (formData.options.length < 2) {
      Alert.alert('Erreur', 'Au moins deux options sont requises');
      return;
    }

    if (!formData.options.some(opt => opt.isCorrect)) {
      Alert.alert('Erreur', 'Au moins une option doit être marquée comme correcte');
      return;
    }

    onSave(formData);
  };

  const renderOption = (option, index) => (
    <View key={option.id} style={styles.optionItem}>
      <TouchableOpacity
        style={styles.optionSelector}
        onPress={() => handleCorrectOptionChange(option.id)}
      >
        <LinearGradient
          colors={option.isCorrect ? ['#11998e', '#38ef7d'] : ['#2a2a3e', '#2a2a3e']}
          style={[
            styles.optionCheckbox,
            formData.type !== 'MULTIPLE_ANSWER' && styles.optionRadio,
          ]}
        >
          {option.isCorrect && (
            <Icon name="check" size={16} color="#FFF" />
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TextInput
        style={styles.optionInput}
        placeholder={`Option ${index + 1}`}
        placeholderTextColor="rgba(255,255,255,0.3)"
        value={option.text}
        onChangeText={(text) => handleOptionTextChange(option.id, text)}
        multiline
      />

      <TouchableOpacity
        style={styles.removeOptionButton}
        onPress={() => handleRemoveOption(option.id)}
      >
        <Icon name="close-circle" size={24} color="#f5576c" />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {question ? 'Modifier la question' : 'Nouvelle question'}
          </Text>
          <TouchableOpacity onPress={onCancel}>
            <Icon name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Question *</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Entrez votre question"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={formData.text}
              onChangeText={(text) => setFormData(prev => ({ ...prev, text }))}
              multiline
              numberOfLines={3}
              maxLength={2000}
            />
          </View>
          <Text style={styles.inputCounter}>
            {formData.text.length}/2000
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Points</Text>
          <View style={styles.pointsContainer}>
            <Icon name="star" size={20} color="#FFCC00" />
            <TextInput
              style={styles.pointsInput}
              placeholder="1"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={formData.points}
              onChangeText={(text) => setFormData(prev => ({ ...prev, points: text }))}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Type de question</Text>
          <View style={styles.typeButtons}>
            {questionTypes.map(type => (
              <TouchableOpacity
                key={type.id}
                style={styles.typeButton}
                onPress={() => {
                  const newFormData = { ...formData, type: type.id };
                  if (type.id === 'TRUE_FALSE') {
                    newFormData.options = [
                      { id: Date.now() + 1, text: 'Vrai', isCorrect: false, order: 1 },
                      { id: Date.now() + 2, text: 'Faux', isCorrect: true, order: 2 },
                    ];
                  }
                  setFormData(newFormData);
                }}
              >
                <LinearGradient
                  colors={formData.type === type.id ? type.gradient : ['#2a2a3e', '#2a2a3e']}
                  style={styles.typeButtonGradient}
                >
                  <Icon
                    name={type.icon}
                    size={20}
                    color="#FFF"
                  />
                  <Text style={styles.typeButtonText}>
                    {type.label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {formData.type !== 'SHORT_ANSWER' && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Options *</Text>
            <Text style={styles.optionHelpText}>
              {formData.type === 'MULTIPLE_ANSWER'
                ? 'Sélectionnez toutes les bonnes réponses'
                : 'Sélectionnez la bonne réponse'}
            </Text>
            
            {formData.options.map((option, index) => renderOption(option, index))}

            {showAddOption ? (
              <View style={styles.addOptionForm}>
                <TextInput
                  style={styles.addOptionInput}
                  placeholder="Nouvelle option"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={newOptionText}
                  onChangeText={setNewOptionText}
                  autoFocus
                />
                <View style={styles.addOptionButtons}>
                  <TouchableOpacity
                    style={styles.addOptionCancelButton}
                    onPress={() => setShowAddOption(false)}
                  >
                    <Text style={styles.addOptionCancelText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleAddOption}
                  >
                    <LinearGradient
                      colors={['#11998e', '#38ef7d']}
                      style={styles.addOptionSaveButton}
                    >
                      <Text style={styles.addOptionSaveText}>Ajouter</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addOptionButton}
                onPress={() => setShowAddOption(true)}
              >
                <Icon name="plus-circle-outline" size={20} color="#667eea" />
                <Text style={styles.addOptionButtonText}>Ajouter une option</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Explication (optionnelle)</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Explication de la réponse (visible après le quiz)"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={formData.explanation}
              onChangeText={(text) => setFormData(prev => ({ ...prev, explanation: text }))}
              multiline
              numberOfLines={3}
              maxLength={1000}
            />
          </View>
          <Text style={styles.inputCounter}>
            {formData.explanation.length}/1000
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
          >
            <LinearGradient
              colors={['#11998e', '#38ef7d']}
              style={styles.saveButton}
            >
              <Icon name="check" size={20} color="#FFF" />
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  inputGroup: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 10,
  },
  textAreaContainer: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 15,
  },
  textArea: {
    color: '#FFF',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputCounter: {
    textAlign: 'right',
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    width: 120,
    gap: 10,
  },
  pointsInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    minWidth: '48%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  typeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    gap: 8,
  },
  typeButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  optionHelpText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 15,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  optionSelector: {
    padding: 4,
  },
  optionCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRadio: {
    borderRadius: 14,
  },
  optionInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFF',
    padding: 0,
  },
  removeOptionButton: {
    padding: 4,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#667eea',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  addOptionButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  addOptionForm: {
    marginTop: 8,
  },
  addOptionInput: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFF',
    marginBottom: 12,
  },
  addOptionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  addOptionCancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    alignItems: 'center',
  },
  addOptionCancelText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  addOptionSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  addOptionSaveText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QuestionForm;