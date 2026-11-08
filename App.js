 import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Alert,
  Share,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

const COLORS = {
  background: '#07130F',
  card: '#10251C',
  green: '#174B35',
  gold: '#D6AD55',
  white: '#FFFFFF',
  gray: '#A9B5AE',
  red: '#C94C4C',
};

const DEFAULT_SCHOLARS = [
  'شیخ القرآن عبدالسلام رستمي رحمه الله',
  'شیخ القرآن أبو محمد أمین الله البشاوري حفظه الله',
  'شیخ القرآن أبو عبيدالله متوكل رحمه الله',
  'شیخ القرآن سردارولي ثاقب رحمه الله',
  'شیخ القرآن عبدالمنان حفظه الله',
];

const CATEGORIES = [
  'د شیخ تعارف او علمي آثار',
  'د قرآن کریم تفسیر او ترجمه',
  'د احادیثو درسونه',
  'د تاریخ درسونه',
  'د فنونو درسونه',
  'د جمعې او عام خطبات',
  'د سوالات او جوابات',
];

export default function App() {
  const [scholars, setScholars] = useState(DEFAULT_SCHOLARS);
  const [books, setBooks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [settings, setSettings] = useState({});
  const [tasbeeh, setTasbeeh] = useState(0);

  const [page, setPage] = useState('home');
  const [selectedScholar, setSelectedScholar] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedBab, setSelectedBab] = useState(null);

  const [search, setSearch] = useState('');
  const [noteText, setNoteText] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [scholars, books, notes, settings, tasbeeh]);

  const loadData = async () => {
    try {
      const s = await AsyncStorage.getItem('library_scholars');
      const b = await AsyncStorage.getItem('library_books');
      const n = await AsyncStorage.getItem('library_notes');
      const a = await AsyncStorage.getItem('app_settings');
      const t = await AsyncStorage.getItem('library_tasbeeh');

      if (s) setScholars(JSON.parse(s));
      if (b) setBooks(JSON.parse(b));
      if (n) setNotes(JSON.parse(n));
      if (a) setSettings(JSON.parse(a));
      if (t) setTasbeeh(Number(t));
    } catch (error) {
      console.log('Load error:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem(
        'library_scholars',
        JSON.stringify(scholars)
      );

      await AsyncStorage.setItem(
        'library_books',
        JSON.stringify(books)
      );

      await AsyncStorage.setItem(
        'library_notes',
        JSON.stringify(notes)
      );

      await AsyncStorage.setItem(
        'app_settings',
        JSON.stringify(settings)
      );

      await AsyncStorage.setItem(
        'library_tasbeeh',
        String(tasbeeh)
      );
    } catch (error) {
      console.log('Save error:', error);
    }
  };

  const shareText = async (title, content) => {
    try {
      await Share.share({
        title,
        message: `${title}\n\n${content}`,
      });
    } catch (error) {
      Alert.alert('خطا', 'شریکول ترسره نه شو');
    }
  };

  const addScholar = () => {
    const name = newName.trim();

    if (!name) {
      Alert.alert('خبرتیا', 'د عالم نوم ولیکئ');
      return;
    }

    if (scholars.includes(name)) {
      Alert.alert('خبرتیا', 'دا عالم مخکې موجود دی');
      return;
    }

    setScholars(previous => [...previous, name]);
    setNewName('');
  };

  const deleteScholar = name => {
    Alert.alert(
      'د عالم حذف',
      'ایا غواړئ دا عالم له لېست څخه حذف کړئ؟',
      [
        { text: 'نه', style: 'cancel' },
        {
          text: 'هو، حذف یې کړه',
          style: 'destructive',
          onPress: () => {
            setScholars(previous =>
              previous.filter(item => item !== name)
            );
          },
        },
      ]
    );
  };

  const addBook = title => {
    const name = title.trim();

    if (!name) {
      Alert.alert('خبرتیا', 'د کتاب نوم ولیکئ');
      return;
    }

    const newBook = {
      id: Date.now().toString(),
      scholar: selectedScholar,
      category: selectedCategory,
      title: name,
      chapters: [],
    };

    setBooks(previous => [...previous, newBook]);
  };

  const addChapter = (bookId, title) => {
    const name = title.trim();
    if (!name) return;

    const chapter = {
      id: Date.now().toString(),
      title: name,
      babs: [],
    };

    setBooks(previous =>
      previous.map(book =>
        book.id === bookId
          ? { ...book, chapters: [...book.chapters, chapter] }
          : book
      )
    );
  };

  const addBab = (bookId, chapterId, title) => {
    const name = title.trim();
    if (!name) return;

    const bab = {
      id: Date.now().toString(),
      title: name,
      lessons: [],
    };

    setBooks(previous =>
      previous.map(book =>
        book.id === bookId
          ? {
              ...book,
              chapters: book.chapters.map(chapter =>
                chapter.id === chapterId
                  ? { ...chapter, babs: [...chapter.babs, bab] }
                  : chapter
              ),
            }
          : book
      )
    );
  };

  const addLesson = (bookId, chapterId, babId, title) => {
    const name = title.trim();
    if (!name) return;

    const lesson = {
      id: Date.now().toString(),
      title: name,
    };

    setBooks(previous =>
      previous.map(book =>
        book.id === bookId
          ? {
              ...book,
              chapters: book.chapters.map(chapter =>
                chapter.id === chapterId
                  ? {
                      ...chapter,
                      babs: chapter.babs.map(bab =>
                        bab.id === babId
                          ? {
                              ...bab,
                              lessons: [...bab.lessons, lesson],
                            }
                          : bab
                      ),
                    }
                  : chapter
              ),
            }
          : book
      )
    );
  };

  const saveNote = () => {
    const value = noteText.trim();

    if (!value) {
      Alert.alert('خبرتیا', 'نوټ ولیکئ');
      return;
    }

    setNotes(previous => [
      ...previous,
      {
        id: Date.now().toString(),
        text: value,
        date: new Date().toLocaleDateString(),
      },
    ]);

    setNoteText('');
    Alert.alert('بریالی شو', 'نوټ خوندي شو');
  };

  const deleteNote = id => {
    setNotes(previous =>
      previous.filter(note => note.id !== id)
    );
  };

  const pickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length) {
        const file = result.assets[0];

        Alert.alert(
          'PDF انتخاب شو',
          file.name,
          [
            { text: 'سمه ده' },
            {
              text: 'شریکول',
              onPress: async () => {
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(file.uri);
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('خطا', 'PDF انتخاب نه شو');
    }
  };

  const addTasbeeh = () => {
    setTasbeeh(value => value + 1);
  };

  const resetTasbeeh = () => {
    Alert.alert('ذکر صفر کول', 'ایا شمېر صفر کړئ؟', [
      { text: 'نه', style: 'cancel' },
      {
        text: 'هو',
        onPress: () => setTasbeeh(0),
      },
    ]);
  };

  const addPrayerTime = (prayer, time) => {
    setSettings(previous => ({
      ...previous,
      prayerTimes: {
        ...(previous.prayerTimes || {}),
        [prayer]: time,
      },
    }));
  };

  const filteredBooks = books.filter(book => {
    const text = search.toLowerCase();

    return (
      book.title.toLowerCase().includes(text) ||
      book.scholar.toLowerCase().includes(text) ||
      book.category.toLowerCase().includes(text) ||
      book.chapters.some(chapter =>
        chapter.title.toLowerCase().includes(text) ||
        chapter.babs.some(bab =>
          bab.title.toLowerCase().includes(text) ||
          bab.lessons.some(lesson =>
            lesson.title.toLowerCase().includes(text)
          )
        )
      )
    );
  });

  const Button = ({ title, onPress, color = COLORS.green }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, { backgroundColor: color }]}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  const Header = ({ title, back }) => (
    <View style={styles.header}>
      {back ? (
        <TouchableOpacity onPress={back}>
          <Text style={styles.backText}>⬅ شاته</Text>
        </TouchableOpacity>
      ) : null}

      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );

  const Card = ({ title, subtitle, onPress }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.cardTitle}>{title}</Text>

      {subtitle ? (
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      ) : null}
    </TouchableOpacity>
  );
  const homePage = () => (
    <>
      <Header title="اسلامي علمي کتابتون" />

      <View style={styles.intro}>
        <Text style={styles.introTitle}>
          اسلامي علمي کتابتون
        </Text>
        <Text style={styles.introSubtitle}>
          د علماؤ کرامو درسونه او کتابونه
        </Text>
      </View>

      <Text style={styles.sectionTitle}>علماء کرام</Text>

      {scholars.map((scholar, index) => (
        <Card
          key={index}
          title={scholar}
          subtitle="کتابونه، درسونه او علمي آثار"
          onPress={() => {
            setSelectedScholar(scholar);
            setPage('categories');
          }}
        />
      ))}

      <Button
        title="➕ نوی عالم اضافه کړئ"
        onPress={() => setPage('addScholar')}
      />

      <Button
        title="🔍 د کتابتون لټون"
        onPress={() => setPage('search')}
      />

      <Button
        title="📝 زما نوټونه"
        onPress={() => setPage('notes')}
      />

      <Button
        title="📚 PDF کتابونه"
        onPress={() => setPage('pdf')}
      />

      <Button
        title="📿 ذکر او تسبیح"
        onPress={() => setPage('tasbeeh')}
      />

      <Button
        title="🕌 د لمانځه وختونه"
        onPress={() => setPage('prayer')}
      />

      <Button
        title="🌅 سهار او ماښام اذکار"
        onPress={() => setPage('adhkar')}
      />

      <Button
        title="⚙️ تنظیمات"
        onPress={() => setPage('settings')}
      />
    </>
  );

  const categoriesPage = () => (
    <>
      <Header
        title="علمي برخې"
        back={() => setPage('home')}
      />

      <Text style={styles.sectionTitle}>
        {selectedScholar}
      </Text>

      {CATEGORIES.map((category, index) => (
        <Card
          key={index}
          title={category}
          onPress={() => {
            setSelectedCategory(category);
            setPage('books');
          }}
        />
      ))}

      <Button
        title="📤 د عالم نوم شریک کړئ"
        onPress={() => shareText('عالم', selectedScholar)}
      />

      <Button
        title="🗑 عالم حذف کړئ"
        color={COLORS.red}
        onPress={() => deleteScholar(selectedScholar)}
      />
    </>
  );

  const booksPage = () => {
    const list = books.filter(
      book =>
        book.scholar === selectedScholar &&
        book.category === selectedCategory
    );

    return (
      <>
        <Header
          title="کتابونه"
          back={() => setPage('categories')}
        />

        {list.map(book => (
          <Card
            key={book.id}
            title={book.title}
            subtitle="د کتاب فصلونه"
            onPress={() => {
              setSelectedBook(book);
              setPage('chapters');
            }}
          />
        ))}

        <TextInput
          style={styles.input}
          placeholder="د نوي کتاب نوم ولیکئ"
          placeholderTextColor={COLORS.gray}
          value={newName}
          onChangeText={setNewName}
        />

        <Button
          title="➕ کتاب خوندي کړئ"
          onPress={() => {
            addBook(newName);
            setNewName('');
          }}
        />
      </>
    );
  };

  const chaptersPage = () => (
    <>
      <Header
        title={selectedBook?.title || 'فصلونه'}
        back={() => setPage('books')}
      />

      {(selectedBook?.chapters || []).map(chapter => (
        <Card
          key={chapter.id}
          title={chapter.title}
          subtitle="بابونه"
          onPress={() => {
            setSelectedChapter(chapter);
            setPage('babs');
          }}
        />
      ))}

      <TextInput
        style={styles.input}
        placeholder="د نوي فصل نوم"
        placeholderTextColor={COLORS.gray}
        value={newName}
        onChangeText={setNewName}
      />

      <Button
        title="➕ فصل اضافه کړئ"
        onPress={() => {
          if (!newName.trim()) return;

          addChapter(selectedBook.id, newName);
          setNewName('');
        }}
      />
    </>
  );

  const babsPage = () => (
    <>
      <Header
        title="بابونه"
        back={() => setPage('chapters')}
      />

      {(selectedChapter?.babs || []).map(bab => (
        <Card
          key={bab.id}
          title={bab.title}
          subtitle="درسونه"
          onPress={() => {
            setSelectedBab(bab);
            setPage('lessons');
          }}
        />
      ))}

      <TextInput
        style={styles.input}
        placeholder="د نوي باب نوم"
        placeholderTextColor={COLORS.gray}
        value={newName}
        onChangeText={setNewName}
      />

      <Button
        title="➕ باب اضافه کړئ"
        onPress={() => {
          if (!newName.trim()) return;

          addBab(
            selectedBook.id,
            selectedChapter.id,
            newName
          );

          setNewName('');
        }}
      />
    </>
  );

  const lessonsPage = () => (
    <>
      <Header
        title="درسونه"
        back={() => setPage('babs')}
      />

      {(selectedBab?.lessons || []).map((lesson, index) => (
        <View key={lesson.id} style={styles.card}>
          <Text style={styles.cardTitle}>
            {index + 1}. {lesson.title}
          </Text>

          <Button
            title="📤 درس شریک کړئ"
            onPress={() => shareText('درس', lesson.title)}
          />
        </View>
      ))}

      <TextInput
        style={styles.input}
        placeholder="د نوي درس نوم"
        placeholderTextColor={COLORS.gray}
        value={newName}
        onChangeText={setNewName}
      />

      <Button
        title="➕ درس اضافه کړئ"
        onPress={() => {
          if (!newName.trim()) return;

          addLesson(
            selectedBook.id,
            selectedChapter.id,
            selectedBab.id,
            newName
          );

          setNewName('');
        }}
      />
    </>
  );

  const addScholarPage = () => (
    <>
      <Header
        title="نوی عالم"
        back={() => setPage('home')}
      />

      <TextInput
        style={styles.input}
        placeholder="د عالم بشپړ نوم ولیکئ"
        placeholderTextColor={COLORS.gray}
        value={newName}
        onChangeText={setNewName}
      />

      <Button
        title="عالم خوندي کړئ"
        onPress={() => {
          addScholar();
          setPage('home');
        }}
      />
    </>
  );

  const searchPage = () => (
    <>
      <Header
        title="د کتابتون لټون"
        back={() => setPage('home')}
      />

      <TextInput
        style={styles.input}
        placeholder="د عالم، کتاب، فصل یا درس نوم"
        placeholderTextColor={COLORS.gray}
        value={search}
        onChangeText={setSearch}
      />

      {filteredBooks.map(book => (
        <Card
          key={book.id}
          title={book.title}
          subtitle={`${book.scholar} - ${book.category}`}
          onPress={() => {
            setSelectedScholar(book.scholar);
            setSelectedCategory(book.category);
            setSelectedBook(book);
            setPage('chapters');
          }}
        />
      ))}
    </>
  );

  const notesPage = () => (
    <>
      <Header
        title="زما نوټونه"
        back={() => setPage('home')}
      />

      <TextInput
        style={[styles.input, styles.noteInput]}
        placeholder="خپل نوټ دلته ولیکئ..."
        placeholderTextColor={COLORS.gray}
        multiline
        value={noteText}
        onChangeText={setNoteText}
      />

      <Button
        title="💾 نوټ خوندي کړئ"
        onPress={saveNote}
      />

      {notes.map(note => (
        <View key={note.id} style={styles.card}>
          <Text style={styles.cardSubtitle}>{note.date}</Text>

          <Text style={styles.cardTitle}>{note.text}</Text>

          <Button
            title="📤 شریکول"
            onPress={() => shareText('زما نوټ', note.text)}
          />

          <Button
            title="🗑 حذف"
            color={COLORS.red}
            onPress={() => deleteNote(note.id)}
          />
        </View>
      ))}
    </>
  );

  const pdfPage = () => (
    <>
      <Header
        title="PDF کتابونه"
        back={() => setPage('home')}
      />

      <Text style={styles.cardSubtitle}>
        له خپل موبایل څخه PDF کتاب انتخاب او شریک کړئ.
      </Text>

      <Button
        title="📚 PDF انتخاب کړئ"
        onPress={pickPDF}
      />
    </>
  );

  const tasbeehPage = () => (
    <>
      <Header
        title="ذکر او تسبیح"
        back={() => setPage('home')}
      />

      <View style={styles.tasbeehBox}>
        <Text style={styles.sectionTitle}>د ذکر شمېر</Text>

        <Text style={styles.tasbeehNumber}>{tasbeeh}</Text>

        <TouchableOpacity
          style={styles.tasbeehButton}
          onPress={addTasbeeh}
        >
          <Text style={styles.tasbeehButtonText}>ذکر</Text>
        </TouchableOpacity>

        <Button
          title="شمېر صفر کړئ"
          color={COLORS.red}
          onPress={resetTasbeeh}
        />
      </View>
    </>
  );

  const prayerPage = () => (
    <>
      <Header
        title="د لمانځه وختونه"
        back={() => setPage('home')}
      />

      {['سهار', 'ماسپښین', 'مازدیګر', 'ماښام', 'ماخوستن'].map(prayer => (
        <View key={prayer} style={styles.card}>
          <Text style={styles.cardTitle}>{prayer}</Text>

          <TextInput
            style={styles.input}
            placeholder="وخت ولیکئ، لکه 05:30"
            placeholderTextColor={COLORS.gray}
            value={settings.prayerTimes?.[prayer] || ''}
            onChangeText={time => addPrayerTime(prayer, time)}
          />
        </View>
      ))}

      <Text style={styles.cardSubtitle}>
        یادونه: دا وختونه په لاس داخلېږي؛ اتومات محاسبه نه کوي.
      </Text>
    </>
  );

  const adhkarPage = () => (
    <>
      <Header
        title="سهار او ماښام اذکار"
        back={() => setPage('home')}
      />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>سهارني اذکار</Text>

        <Text style={styles.cardSubtitle}>
          سُبْحَانَ اللَّهِ وَبِحَمْدِهِ
        </Text>

        <Text style={styles.cardSubtitle}>
          سُبْحَانَ اللَّهِ الْعَظِيمِ
        </Text>

        <Button
          title="اذکار شریک کړئ"
          onPress={() =>
            shareText(
              'سهارني اذکار',
              'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ\nسُبْحَانَ اللَّهِ الْعَظِيمِ'
            )
          }
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>ماښامني اذکار</Text>

        <Text style={styles.cardSubtitle}>
          أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ
        </Text>

        <Text style={styles.cardSubtitle}>
          لَا إِلَهَ إِلَّا اللَّهُ
        </Text>

        <Button
          title="اذکار شریک کړئ"
          onPress={() =>
            shareText(
              'ماښامني اذکار',
              'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ\nلَا إِلَهَ إِلَّا اللَّهُ'
            )
          }
        />
      </View>
    </>
  );

  const settingsPage = () => (
    <>
      <Header
        title="تنظیمات"
        back={() => setPage('home')}
      />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          اسلامي علمي کتابتون
        </Text>

        <Text style={styles.cardSubtitle}>
          د علماؤ کرامو درسونه او کتابونه
        </Text>

        <Text style={styles.cardSubtitle}>نسخه: 1.0.0</Text>
      </View>

      <Button
        title="📤 اپلیکیشن شریک کړئ"
        onPress={() =>
          shareText(
            'اسلامي علمي کتابتون',
            'د علماؤ کرامو درسونه او کتابونه'
          )
        }
      />
    </>
  );

  const renderPage = () => {
    switch (page) {
      case 'home':
        return homePage();
      case 'categories':
        return categoriesPage();
      case 'books':
        return booksPage();
      case 'chapters':
        return chaptersPage();
      case 'babs':
        return babsPage();
      case 'lessons':
        return lessonsPage();
      case 'addScholar':
        return addScholarPage();
      case 'search':
        return searchPage();
      case 'notes':
        return notesPage();
      case 'pdf':
        return pdfPage();
      case 'tasbeeh':
        return tasbeehPage();
      case 'prayer':
        return prayerPage();
      case 'adhkar':
        return adhkarPage();
      case 'settings':
        return settingsPage();
      default:
        return homePage();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={COLORS.background}
        barStyle="light-content"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {renderPage()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  header: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 18,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gold,
  },

  headerTitle: {
    color: COLORS.gold,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },

  backText: {
    color: COLORS.gold,
    fontSize: 16,
    textAlign: 'left',
  },

  intro: {
    backgroundColor: COLORS.card,
    padding: 22,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },

  introTitle: {
    color: COLORS.gold,
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  introSubtitle: {
    color: COLORS.white,
    fontSize: 15,
    marginTop: 10,
    textAlign: 'center',
  },

  sectionTitle: {
    color: COLORS.gold,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 12,
    textAlign: 'center',
  },

  card: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#315442',
  },

  cardTitle: {
    color: COLORS.gold,
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 6,
  },

  cardSubtitle: {
    color: COLORS.white,
    fontSize: 14,
    textAlign: 'right',
    marginTop: 5,
  },

  button: {
    backgroundColor: COLORS.green,
    padding: 15,
    borderRadius: 10,
    marginVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  input: {
    backgroundColor: '#183126',
    color: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 10,
    padding: 13,
    marginVertical: 8,
    textAlign: 'right',
    fontSize: 16,
  },

  noteInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },

  tasbeehBox: {
    backgroundColor: COLORS.card,
    padding: 22,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },

  tasbeehNumber: {
    color: COLORS.gold,
    fontSize: 55,
    fontWeight: 'bold',
    marginVertical: 20,
  },

  tasbeehButton: {
    backgroundColor: COLORS.green,
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.gold,
    marginBottom: 20,
  },

  tasbeehButtonText: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: 'bold',
  },
});
