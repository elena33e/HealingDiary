import React, { useEffect, useState, useRef, useCallback, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { GestureHandlerRootView, PinchGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useSharedValue, runOnJS } from 'react-native-reanimated';
import { RichEditor } from 'react-native-pell-rich-editor';
import { ThemeContext } from '../utilities/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NoteDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { note: initialNote } = route.params;
  const [note, setNote] = useState(initialNote);
  const richEditorRef = useRef(null);
  const { theme } = useContext(ThemeContext);  // Get theme from context

  const [fontSize, setFontSize] = useState(16);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const scale = useSharedValue(1);
  const baseScale = useSharedValue(1);

  // Fetch the note data
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const noteRef = doc(db, 'Notes', initialNote.key);
        const docSnapshot = await getDoc(noteRef);

        if (docSnapshot.exists()) {
          setNote({ id: docSnapshot.id, ...docSnapshot.data() });
        } else {
          console.log('Note no longer exists');
        }
      } catch (error) {
        console.error('Error fetching note:', error);
      }
    };

    fetchNote();
  }, [initialNote.key]);

  const handleEditPress = () => {
    navigation.navigate('EditNoteScreen', { note });
  };

  const updateFontSize = useCallback((newScale) => {
    setFontSize(prevSize => {
      const scaleFactor = Math.pow(newScale, 0.6);
      const newSize = 16 * scaleFactor;
      return Math.max(10, Math.min(newSize, 85));
    });
  }, []);

  const pinchHandler = useAnimatedGestureHandler({
    onStart: () => {
      baseScale.value = scale.value;
    },
    onActive: (event) => {
      scale.value = baseScale.value * event.scale;
      runOnJS(updateFontSize)(event.scale);
      runOnJS(setScrollEnabled)(false);
    },
    onEnd: () => {
      baseScale.value = scale.value;
      runOnJS(setScrollEnabled)(true);
    },
  });

  // Function to apply theme-based styles to the content of the note
  const getScaledContent = useCallback(() => {
    return `
      <style>
        body, p, div, span, h1, h2, h3, h4, h5, h6 {
          font-size: ${fontSize}px !important;
          line-height: 1.5 !important;
          color: ${theme.text} !important;
          background-color: ${theme.background};
        }
        h1 {
          font-size: ${fontSize * 1.5}px !important;
          color: ${theme.text} !important;
          margin-bottom: 10px !important;
        }
        .category {
          font-size: ${fontSize * 1.125}px !important;
          color: ${theme.text} !important;
          margin-bottom: 15px !important;
        }
      </style>
      <h1>${note.title}</h1>
      <div class="category">${note.category}</div>
      <div class="note-content">${note.formattedText}</div>
    `;
  }, [fontSize, note, theme]);

  // Update the RichEditor content when fontSize or theme changes
  useEffect(() => {
    if (richEditorRef.current) {
      richEditorRef.current.setContentHTML(getScaledContent());
    }
  }, [fontSize, getScaledContent]);

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]} 
        scrollEnabled={scrollEnabled}
      >
        <PinchGestureHandler onGestureEvent={pinchHandler} onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === State.END || nativeEvent.state === State.CANCELLED) {
            setScrollEnabled(true);
          }
        }}>
          <Animated.View style={styles.textContainer}>
            <RichEditor
              ref={richEditorRef}
              initialContentHTML={getScaledContent()}
              disabled={true}
              scrollEnabled={true}
              containerStyle={[styles.richEditor, { backgroundColor: theme.background }]} // Update background color for theme
            />
          </Animated.View>
        </PinchGestureHandler>
      </ScrollView>

      {/* Edit Button */}
      <TouchableOpacity
        style={[styles.editButton, { backgroundColor: theme.buttonBackground }]}
        onPress={handleEditPress}
      >
        <Icon name="edit" size={24} color={theme.buttonText} />
      </TouchableOpacity>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  richEditor: {
    flex: 1,
    width: '100%',
  },
  editButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
});

export default NoteDetailsScreen;
