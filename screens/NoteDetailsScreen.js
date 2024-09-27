import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { GestureHandlerRootView, PinchGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { RichEditor } from 'react-native-pell-rich-editor';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NoteDetailsScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { note: initialNote } = route.params;
    const [note, setNote] = useState(initialNote);
    const richEditorRef = useRef(null);

    const [fontSize, setFontSize] = useState(16);
    const scale = useSharedValue(1);
    const baseScale = useSharedValue(1);

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
            const scaleFactor = Math.pow(newScale, 0.6); // Adjust this value to control zoom sensitivity
            const newSize = 16 * scaleFactor;
            return Math.max(10, Math.min(newSize, 85)); // Only limit the minimum font size
       });
   }, []);



  const pinchHandler = useAnimatedGestureHandler({
      onStart: () => {
          baseScale.value = scale.value;
      },
      onActive: (event) => {
          scale.value = baseScale.value * event.scale;
          runOnJS(updateFontSize)(event.scale);
      },
      onEnd: () => {
          baseScale.value = scale.value;
      },
  });


    const getScaledContent = useCallback(() => {
        return `
            <style>
                body, p, div, span, h1, h2, h3, h4, h5, h6 {
                    font-size: ${fontSize}px !important;
                    line-height: 1.5 !important;
                    color: #333 !important;
                }
                h1 {
                    font-size: ${fontSize * 1.5}px !important;
                    color: #1F2544 !important;
                    margin-bottom: 10px !important;
                }
                .category {
                    font-size: ${fontSize * 1.125}px !important;
                    color: #474F7A !important;
                    margin-bottom: 15px !important;
                }
            </style>
            <h1>${note.title}</h1>
            <div class="category">${note.category}</div>
            <div class="note-content">${note.formattedText}</div>
        `;
    }, [fontSize, note]);

    useEffect(() => {
        if (richEditorRef.current) {
            richEditorRef.current.setContentHTML(getScaledContent());
        }
    }, [fontSize, getScaledContent]);

    return (
        <GestureHandlerRootView style={styles.root}>
            <ScrollView style={styles.container}>
                <PinchGestureHandler onGestureEvent={pinchHandler}>
                    <Animated.View style={styles.textContainer}>
                        <RichEditor
                            ref={richEditorRef}
                            initialContentHTML={getScaledContent()}
                            disabled={true}
                            scrollEnabled={true}
                            containerStyle={styles.richEditor}
                        />
                    </Animated.View>
                </PinchGestureHandler>

            </ScrollView>
            <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
                                <Icon name="edit" size={24} color="white" />
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
        backgroundColor: 'white',
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
        backgroundColor: '#474F7A',
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