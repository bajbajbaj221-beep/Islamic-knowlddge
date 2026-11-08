
 
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, StatusBar, Alert
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { WebView } from 'react-native-webview';
 import AsyncStorage from '@react-native-async-storage/async-storage';
const scholars = [
  'شیخ عبدالسلام رستمي رحمه الله',
  'شیخ أبو محمد أمين الله البشاوري حفظه الله',
  'شیخ سردارولي ثاقب رحمه الله',
  'شیخ عبیدالله متوکل علی الله رحمه الله',
];

const categories = [
  'د قرآن کریم درسونه',
  'د احادیثو درسونه',
  'د تاریخ درسونه',
  'د فنونو درسونه',
  'د جمعې ورځې او عامې خطبې',
];

export default function App() {
  const [scholar, setScholar] = useState(null);
  const [category, setCategory] = useState(null);
  const [bookId, setBookId] = useState(null);
const [screen, setScreen] = useState('home');
const [language, setLanguage] = useState('پښتو');
const [searchQuery, setSearchQuery] = useState('');
const [prayerTimes, setPrayerTimes] = useState({
  fajr: '05:00',
  dhuhr: '12:30',
  asr: '15:30',
  maghrib: '17:30',
  isha: '19:00',
});
  const [books, setBooks] = useState({});
const [storageReady, setStorageReady] = useState(false);

useEffect(() => {
  async function loadBooks() {
    try {
      const saved = await AsyncStorage.getItem('library_books');
      if (saved) setBooks(JSON.parse(saved));
    } catch (error) {
      Alert.alert('خبرتیا', 'د کتابونو معلومات نه شول لوستل کېدای');
    } finally {
      setStorageReady(true);
    }
  }
  loadBooks();
}, []);

useEffect(() => {
  if (storageReady) {
    AsyncStorage.setItem('library_books', JSON.stringify(books));
  }
}, [books, storageReady]);
  const [newBook, setNewBook] = useState('');
  const [newChapter, setNewChapter] = useState('');
  const [newBab, setNewBab] = useState('');
  const [newLesson, setNewLesson] = useState('');
const [pdfFile, setPdfFile] = useState(null);
const [pdfData, setPdfData] = useState(null);

async function choosePDF() {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: true,
  });

  if (!result.canceled) {
    setPdfFile(result.assets[0]);
    Alert.alert('بریالی شو', 'PDF فایل انتخاب شو');
  }
}
  const key = scholar && category ? scholar + '|' + category : '';
  const currentBooks = books[key] || [];
  const currentBook = currentBooks.find(b => b.id === bookId);
 async function openPDF() {
  try {
    if (!pdfFile || !pdfFile.uri) {
      Alert.alert('خبرتیا', 'لومړی PDF انتخاب کړه');
      return;
    }

    Alert.alert('PDF', 'د PDF د پرانیستلو هڅه روانه ده');

    const available = await Sharing.isAvailableAsync();

    if (!available) {
      Alert.alert('خبرتیا', 'په دې وسیله کې د PDF شریکول فعال نه دي');
      return;
    }

    await Sharing.shareAsync(pdfFile.uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: 'PDF کتاب پرانیزئ',
    });

  } catch (error) {
    Alert.alert(
      'د PDF تېروتنه',
      String(error)
    );
  }
}
  function updateBooks(list) {
    setBooks(old => ({ ...old, [key]: list }));
  }

  function addBook() {
    if (!newBook.trim()) {
      Alert.alert('خبرتیا', 'د کتاب نوم ولیکئ');
      return;
    }
    updateBooks([
      ...currentBooks,
      {
        id: String(Date.now()),
        name: newBook.trim(),
        pdf: null,
        chapters: [],
      },
    ]);
    setNewBook('');
  }

  function updateBook(updated) {
    updateBooks(currentBooks.map(b => b.id === updated.id ? updated : b));
  }

  function addChapter() {
    if (!newChapter.trim()) {
      Alert.alert('خبرتیا', 'د فصل نوم ولیکئ');
      return;
    }
    updateBook({
      ...currentBook,
      chapters: [
        ...currentBook.chapters,
        { id: String(Date.now()), name: newChapter.trim(), babs: [] },
      ],
    });
    setNewChapter('');
  }

  function addBab(chapterId) {
    if (!newBab.trim()) {
      Alert.alert('خبرتیا', 'د باب نوم ولیکئ');
      return;
    }
    const chapters = currentBook.chapters.map(ch =>
      ch.id === chapterId
        ? { ...ch, babs: [...ch.babs, {
            id: String(Date.now()), name: newBab.trim(), lessons: []
          }] }
        : ch
    );
    updateBook({ ...currentBook, chapters });
    setNewBab('');
  }

  function addLesson(chapterId, babId) {
    if (!newLesson.trim()) {
      Alert.alert('خبرتیا', 'د درس نوم ولیکئ');
      return;
    }
    const chapters = currentBook.chapters.map(ch => {
      if (ch.id !== chapterId) return ch;
      return {
        ...ch,
        babs: ch.babs.map(b =>
          b.id === babId
            ? { ...b, lessons: [...b.lessons, {
                id: String(Date.now()), name: newLesson.trim()
              }] }
            : b
        ),
      };
    });
    updateBook({ ...currentBook, chapters });
    setNewLesson('');
  }

  function removeBook(id) {
    Alert.alert('د کتاب حذفول', 'ایا دا کتاب حذف کړئ؟', [
      { text: 'نه', style: 'cancel' },
      {
        text: 'هو، حذف یې کړه',
        style: 'destructive',
        onPress: () => {
          updateBooks(currentBooks.filter(b => b.id !== id));
          setBookId(null);
        },
      },
    ]);
  }

  function back() {
    if (bookId) setBookId(null);
    else if (category) setCategory(null);
    else if (scholar) setScholar(null);
  }

  function card(title, subtitle, action) {
    return (
      <TouchableOpacity style={styles.card} onPress={action}>
        <Text style={styles.cardTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.sub}>{subtitle}</Text>}
        <Text style={styles.arrow}>←</Text>
      </TouchableOpacity>
    );
  }

  function addBox(label, value, setValue, placeholder, action, buttonText) {
    return (
      <View style={styles.addBox}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor="#8A9B90"
          textAlign="right"
        />
        <TouchableOpacity style={styles.addButton} onPress={action}>
          <Text style={styles.addText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071B16" />

      <View style={styles.header}>
        <Text style={styles.logo}>میراث اسلام</Text>
        <Text style={styles.headerSub}>اسلامي علمي کتابتون</Text>
      </View>

      {(scholar || category || bookId) && (
        <TouchableOpacity style={styles.back} onPress={back}>
          <Text style={styles.backText}>→ شاته تګ</Text>
        </TouchableOpacity>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {!scholar && (
          <>
            <Text style={styles.heading}>د علماوو کتابتون</Text>
            <Text style={styles.description}>یو عالم انتخاب کړئ</Text>
            {scholars.map(item =>
              card(item, 'کتابونه او درسونه', () => setScholar(item))
            )}
          </>
        )}

        {scholar && !category && (
          <>
            <Text style={styles.heading}>د عالم کتابتون</Text>
            <Text style={styles.description}>{scholar}</Text>
            {categories.map(item =>
              card(item, 'د دې برخې کتابونه', () => setCategory(item))
            )}
          </>
        )}

        {scholar && category && !bookId && (
          <>
            <Text style={styles.heading}>{category}</Text>
            <Text style={styles.description}>{scholar}</Text>

            {addBox(
              'نوی کتاب (اختیاري)',
              newBook,
              setNewBook,
              'د کتاب نوم ولیکئ',
              addBook,
              '＋ کتاب اضافه کړه'
            )}

            <Text style={styles.sectionTitle}>کتابونه</Text>
            {currentBooks.length === 0
              ? <Text style={styles.empty}>تر اوسه کتاب نه دی اضافه شوی. دا برخه تشه هم پاتې کېدای شي.</Text>
              : currentBooks.map(item => (
                <View style={styles.bookRow} key={item.id}>
                  <TouchableOpacity
                    style={styles.bookName}
                    onPress={() => setBookId(item.id)}
                  >
                    <Text style={styles.cardTitle}>📚 {item.name}</Text>
                    <Text style={styles.sub}>د کتاب جزئیات پرانیزئ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeBook(item.id)}>
                    <Text style={styles.delete}>حذف</Text>
                  </TouchableOpacity>
                </View>
              ))
            }
          </>
        )}

        {currentBook && (
          <>
            <Text style={styles.heading}>{currentBook.name}</Text>
            <Text style={styles.description}>{category}</Text>

          <View style={styles.addBox}>
  <Text style={styles.label}>د کتاب PDF (اختیاري)</Text>

  <TouchableOpacity
    style={styles.addButton}
    onPress={choosePDF}
  >
    <Text style={styles.addText}>
      📄 د PDF کتاب انتخابول
    </Text>
  </TouchableOpacity>

  <Text style={styles.empty}>
    {pdfFile ? pdfFile.name : 'تر اوسه PDF نه دی انتخاب شوی'}
  </Text>

  <TouchableOpacity
    style={styles.smallButton}
    onPress={openPDF}
  >
    <Text style={styles.addText}>
      📖 PDF کتاب پرانیزئ
    </Text>
  </TouchableOpacity>
</View> 
            {addBox(
              'نوی فصل (اختیاري)',
              newChapter,
              setNewChapter,
              'د فصل نوم ولیکئ',
              addChapter,
              '＋ فصل اضافه کړه'
            )}

            <Text style={styles.sectionTitle}>فصلونه</Text>

            {currentBook.chapters.length === 0 && (
              <Text style={styles.empty}>
                فصلونه نشته. کتاب بې له فصله هم کار کوي.
              </Text>
            )}

            {currentBook.chapters.map(chapter => (
              <View style={styles.chapterBox} key={chapter.id}>
                <Text style={styles.chapterTitle}>📖 {chapter.name}</Text>

                <Text style={styles.label}>نوی باب (اختیاري)</Text>
                <TextInput
                  style={styles.input}
                  value={newBab}
                  onChangeText={setNewBab}
                  placeholder="د باب نوم ولیکئ"
                  placeholderTextColor="#8A9B90"
                  textAlign="right"
                />
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => addBab(chapter.id)}
                >
                  <Text style={styles.addText}>＋ باب اضافه کړه</Text>
                </TouchableOpacity>

                {chapter.babs.length === 0 && (
                  <Text style={styles.empty}>بابونه نشته؛ دا فصل همداسې پاتې کېدای شي.</Text>
                )}

                {chapter.babs.map(bab => (
                  <View style={styles.babBox} key={bab.id}>
                    <Text style={styles.babTitle}>📁 {bab.name}</Text>

                    <Text style={styles.label}>نوی آډیو درس (اختیاري)</Text>
                    <TextInput
                      style={styles.input}
                      value={newLesson}
                      onChangeText={setNewLesson}
                      placeholder="د درس نوم ولیکئ"
                      placeholderTextColor="#8A9B90"
                      textAlign="right"
                    />
                    <TouchableOpacity
                      style={styles.smallButton}
                      onPress={() => addLesson(chapter.id, bab.id)}
                    >
                      <Text style={styles.addText}>＋ درس اضافه کړه</Text>
                    </TouchableOpacity>

                    {bab.lessons.length === 0 && (
                      <Text style={styles.empty}>آډیو درس نشته؛ باب تش هم پاتې کېدای شي.</Text>
                    )}

                    {bab.lessons.map(lesson => (
                      <Text style={styles.lesson} key={lesson.id}>
                        🎧 {lesson.name}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>میراث اسلام • اسلامي علمي کتابتون</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07130F' },
  header: {
    backgroundColor: '#0B2B20', paddingTop: 18, paddingBottom: 18,
    alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#B99545',
  },
  logo: { color: '#E5C36B', fontSize: 27, fontWeight: 'bold' },
  headerSub: { color: '#D8D0B8', fontSize: 13, marginTop: 5 },
  back: { padding: 13, alignItems: 'flex-end' },
  backText: { color: '#E5C36B', fontSize: 15 },
  content: { padding: 16, paddingBottom: 35 },
  heading: {
    color: '#E5C36B', fontSize: 22, fontWeight: 'bold',
    textAlign: 'center', marginTop: 8, marginBottom: 10,
  },
  description: { color: '#B9C9BE', textAlign: 'center', fontSize: 13, marginBottom: 18 },
  card: {
    backgroundColor: '#10271E', borderWidth: 1, borderColor: '#806B3C',
    borderRadius: 12, padding: 17, marginBottom: 11,
  },
  cardTitle: { color: '#F0D58A', fontSize: 16, fontWeight: 'bold', textAlign: 'right' },
  sub: { color: '#AAB9AE', fontSize: 12, textAlign: 'right', marginTop: 6 },
  arrow: { color: '#D7B65E', fontSize: 17, marginTop: 5, textAlign: 'left' },
  addBox: {
    backgroundColor: '#10271E', borderRadius: 12, padding: 15,
    borderWidth: 1, borderColor: '#806B3C', marginBottom: 18,
  },
  label: { color: '#E5C36B', fontSize: 15, textAlign: 'right', marginBottom: 9, marginTop: 8 },
  input: { backgroundColor: '#F1F0E8', color: '#17231C', borderRadius: 8, padding: 11, fontSize: 14 },
  addButton: { backgroundColor: '#B99545', borderRadius: 8, padding: 12, marginTop: 10, alignItems: 'center' },
  smallButton: { backgroundColor: '#806B3C', borderRadius: 8, padding: 10, marginTop: 8, alignItems: 'center' },
  addText: { color: '#102016', fontSize: 14, fontWeight: 'bold' },
  sectionTitle: { color: '#E5C36B', fontSize: 17, textAlign: 'right', marginBottom: 12 },
  empty: { color: '#B9C9BE', textAlign: 'center', padding: 10, fontSize: 13 },
  bookRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10271E', borderRadius: 10, borderWidth: 1, borderColor: '#806B3C', padding: 12, marginBottom: 10 },
  bookName: { flex: 1, padding: 5 },
  delete: { color: '#F18B80', padding: 8 },
  chapterBox: { backgroundColor: '#10271E', borderRadius: 12, borderWidth: 1, borderColor: '#806B3C', padding: 13, marginBottom: 14 },
  chapterTitle: { color: '#E5C36B', fontSize: 17, fontWeight: 'bold', textAlign: 'right', marginBottom: 8 },
  babBox: { backgroundColor: '#18352A', borderRadius: 9, padding: 11, marginTop: 12 },
  babTitle: { color: '#F0D58A', fontSize: 15, fontWeight: 'bold', textAlign: 'right' },
  lesson: { color: '#D8E3D9', textAlign: 'right', padding: 9, borderBottomWidth: 1, borderBottomColor: '#52685A' },
  footer: { padding: 12, borderTopWidth: 1, borderTopColor: '#806B3C', alignItems: 'center' },
  footerText: { color: '#B99545', fontSize: 12 },
});
