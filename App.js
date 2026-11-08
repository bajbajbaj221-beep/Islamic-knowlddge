 
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, StatusBar, Alert, Share
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

const scholars = [
  'شیخ القرآن علامه سید عبدالسلام رستمي رحمه الله',
  'شیخ القرآن أبو محمد أمين الله البشاوري حفظه الله',
  'شیخ القرآن أبو محمد سردارولي ثاقب رحمه الله',
  'شیخ القرآن أبو عبيدالله متوكل رحمه الله',
  'شیخ القرآن أبو عمر عبدالمنان محمدي حفظه الله',
];

const categories = [
  'د شیخ تعارف او علمي آثار',
  'د قرآن کریم تفسیر او ترجمه',
  'د احادیثو درسونه',
  'د تاریخ درسونه',
  'د فنونو درسونه',
  'د جمعې او عام خطبات',
  'د سوالات او جوابات',
];

const fonts = [
  { name: 'معیاري / Standard', family: 'sans-serif' },
  { name: 'کلاسیک / Serif', family: 'serif' },
  { name: 'منځنی / Medium', family: 'sans-serif-medium' },
  { name: 'تنګ / Condensed', family: 'sans-serif-condensed' },
  { name: 'روښانه / Light', family: 'sans-serif-light' },
  { name: 'مونو / Mono', family: 'monospace' },
];

const translations = {
  'پښتو': {
    settings: 'تنظیمات', language: 'د اپلیکیشن ژبه',
    font: 'د لیکلو فونټ', scholars: 'علماء کرام',
    library: 'د علماؤ کرامو کتابتون',
    search: 'عالم، کتاب یا درس ولټوئ',
    works: 'علمي او د مطالعې برخې',
    audio: 'غږیز درسونه', books: 'کتابونه او PDF',
    quran: 'قرآن او تفسیر', hadith: 'حدیثونه',
    history: 'اسلامي تاریخ', notes: 'زما یادښتونه',
    social: 'زموږ انټرنېټي پاڼې',
    socialHint: 'د ټولنیزو پاڼو لینکونه به په راتلونکي اپډېټ کې فعال شي',
    adhkar: 'اذکار او عبادت',
    morning: 'سهار او ماښام اذکار',
    prayer: 'د لمانځه وختونه',
    choose: 'د خپلې خوښې فونټ وټاکئ',
    save: 'ستاسو انتخاب په موبایل کې خوندي کېږي',
    back: 'بېرته کورپاڼې ته',
  },
  'العربية': {
    settings: 'الإعدادات', language: 'لغة التطبيق',
    font: 'نوع الخط', scholars: 'العلماء',
    library: 'مكتبة العلماء',
    search: 'ابحث عن عالم أو كتاب أو درس',
    works: 'أقسام العلم والمطالعة',
    audio: 'الدروس الصوتية', books: 'الكتب و PDF',
    quran: 'القرآن والتفسير', hadith: 'الأحاديث',
    history: 'التاريخ الإسلامي', notes: 'ملاحظاتي',
    social: 'صفحاتنا على الإنترنت',
    socialHint: 'ستضاف روابط الصفحات في تحديث قادم',
    adhkar: 'الأذكار والعبادة',
    morning: 'أذكار الصباح والمساء',
    prayer: 'أوقات الصلاة',
    choose: 'اختر الخط المناسب',
    save: 'يُحفظ اختيارك على الهاتف',
    back: 'العودة للرئيسية',
  },
  'اردو': {
    settings: 'ترتیبات', language: 'ایپ کی زبان',
    font: 'فونٹ کا انتخاب', scholars: 'علمائے کرام',
    library: 'علماء کی لائبریری',
    search: 'عالم، کتاب یا سبق تلاش کریں',
    works: 'علمی اور مطالعے کے حصے',
    audio: 'آڈیو دروس', books: 'کتابیں اور PDF',
    quran: 'قرآن اور تفسیر', hadith: 'احادیث',
    history: 'اسلامی تاریخ', notes: 'میرے نوٹس',
    social: 'ہمارے انٹرنیٹ صفحات',
    socialHint: 'سوشل صفحات کے لنکس اگلی اپ ڈیٹ میں شامل ہوں گے',
    adhkar: 'اذکار اور عبادت',
    morning: 'صبح و شام کے اذکار',
    prayer: 'نماز کے اوقات',
    choose: 'اپنی پسند کا فونٹ منتخب کریں',
    save: 'آپ کا انتخاب فون میں محفوظ ہوگا',
    back: 'ہوم واپس جائیں',
  },
  'فارسي': {
    settings: 'تنظیمات', language: 'زبان برنامه',
    font: 'انتخاب قلم', scholars: 'علمای کرام',
    library: 'کتابخانه علمای کرام',
    search: 'نام عالم، کتاب یا درس را جستجو کنید',
    works: 'بخش‌های علمی و مطالعه',
    audio: 'درس‌های صوتی', books: 'کتاب‌ها و PDF',
    quran: 'قرآن و تفسیر', hadith: 'حدیث‌ها',
    history: 'تاریخ اسلام', notes: 'یادداشت‌های من',
    social: 'صفحه‌های اینترنتی ما',
    socialHint: 'پیوند صفحه‌ها در به‌روزرسانی آینده افزوده می‌شود',
    adhkar: 'اذکار و عبادت',
    morning: 'اذکار صبح و شام',
    prayer: 'اوقات نماز',
    choose: 'قلم دلخواه خود را انتخاب کنید',
    save: 'انتخاب شما در تلفن ذخیره می‌شود',
    back: 'بازگشت به خانه',
  },
  'English': {
    settings: 'Settings', language: 'App language',
    font: 'Font style', scholars: 'Scholars',
    library: 'Scholars Library',
    search: 'Search scholar, book or lesson',
    works: 'Learning & Reading',
    audio: 'Audio lessons', books: 'Books & PDF',
    quran: 'Quran & Tafsir', hadith: 'Hadith',
    history: 'Islamic history', notes: 'My notes',
    social: 'Our social pages',
    socialHint: 'Social page links will be activated in a future update',
    adhkar: 'Adhkar & Worship',
    morning: 'Morning & evening adhkar',
    prayer: 'Prayer times',
    choose: 'Choose your preferred font',
    save: 'Your choice is saved on this phone',
    back: 'Back to home',
  },
};

export default function App() {
  const [scholar, setScholar] = useState(null);
  const [category, setCategory] = useState(null);
  const [bookId, setBookId] = useState(null);
  const [screen, setScreen] = useState('home');
  const [language, setLanguage] = useState('پښتو');
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState({});
  const [notes, setNotes] = useState({});
  const [pdfFile, setPdfFile] = useState(null);
  const [noteTarget, setNoteTarget] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [newBook, setNewBook] = useState('');
  const [newChapter, setNewChapter] = useState('');
  const [newBab, setNewBab] = useState('');
  const [newLesson, setNewLesson] = useState('');
  const [settingsReady, setSettingsReady] = useState(false);
  const [booksReady, setBooksReady] = useState(false);
  const [notesReady, setNotesReady] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState({
    fajr: '05:00',
    dhuhr: '12:30',
    asr: '15:30',
    maghrib: '17:30',
    isha: '19:00',
  });

  const tr = key =>
    (translations[language] && translations[language][key]) ||
    translations['پښتو'][key] || key;

  useEffect(() => {
    async function load() {
      try {
        const s = await AsyncStorage.getItem('app_settings');
        if (s) {
          const d = JSON.parse(s);
          if (d.language) setLanguage(d.language);
          if (d.fontFamily) setFontFamily(d.fontFamily);
          if (d.prayerTimes) setPrayerTimes(d.prayerTimes);
        }
      } catch (e) {
        Alert.alert('خبرتیا', 'تنظیمات ونه لوستل شول');
      } finally {
        setSettingsReady(true);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (settingsReady) {
      AsyncStorage.setItem(
        'app_settings',
        JSON.stringify({ language, fontFamily, prayerTimes })
      ).catch(() => {});
    }
  }, [language, fontFamily, prayerTimes, settingsReady]);

  useEffect(() => {
    async function load() {
      try {
        const s = await AsyncStorage.getItem('library_books');
        if (s) setBooks(JSON.parse(s));
      } catch (e) {
        Alert.alert('خبرتیا', 'کتابونه ونه لوستل شول');
      } finally {
        setBooksReady(true);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (booksReady) {
      AsyncStorage.setItem('library_books', JSON.stringify(books))
        .catch(() => {});
    }
  }, [books, booksReady]);

  useEffect(() => {
    async function load() {
      try {
        const s = await AsyncStorage.getItem('library_notes');
        if (s) setNotes(JSON.parse(s));
      } catch (e) {
        Alert.alert('خبرتیا', 'نوټونه ونه لوستل شول');
      } finally {
        setNotesReady(true);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (notesReady) {
      AsyncStorage.setItem('library_notes', JSON.stringify(notes))
        .catch(() => {});
    }
  }, [notes, notesReady]);

  const key = scholar && category ? scholar + '|' + category : '';
  const currentBooks = books[key] || [];
  const currentBook = currentBooks.find(b => b.id === bookId);

  function updateBooks(list) {
    setBooks(old => ({ ...old, [key]: list }));
  }

  function addBook() {
    if (!newBook.trim()) {
      Alert.alert('خبرتیا', 'د کتاب نوم ولیکئ');
      return;
    }
    updateBooks([...currentBooks, {
      id: String(Date.now()),
      name: newBook.trim(),
      chapters: [],
    }]);
    setNewBook('');
  }

  function updateBook(updated) {
    updateBooks(currentBooks.map(b =>
      b.id === updated.id ? updated : b
    ));
  }

  function addChapter() {
    if (!newChapter.trim() || !currentBook) {
      Alert.alert('خبرتیا', 'د فصل نوم ولیکئ');
      return;
    }
    updateBook({
      ...currentBook,
      chapters: [...(currentBook.chapters || []), {
        id: String(Date.now()),
        name: newChapter.trim(),
        babs: [],
      }],
    });
    setNewChapter('');
  }

  function addBab(chapterId) {
    if (!newBab.trim() || !currentBook) {
      Alert.alert('خبرتیا', 'د باب نوم ولیکئ');
      return;
    }
    const chapters = (currentBook.chapters || []).map(ch =>
      ch.id === chapterId
        ? {
            ...ch,
            babs: [...(ch.babs || []), {
              id: String(Date.now()),
              name: newBab.trim(),
              lessons: [],
            }],
          }
        : ch
    );
    updateBook({ ...currentBook, chapters });
    setNewBab('');
  }

  function addLesson(chapterId, babId) {
    if (!newLesson.trim() || !currentBook) {
      Alert.alert('خبرتیا', 'د درس نوم ولیکئ');
      return;
    }
    const chapters = (currentBook.chapters || []).map(ch => {
      if (ch.id !== chapterId) return ch;
      return {
        ...ch,
        babs: (ch.babs || []).map(b =>
          b.id === babId
            ? {
                ...b,
                lessons: [...(b.lessons || []), {
                  id: String(Date.now()),
                  name: newLesson.trim(),
                }],
              }
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

  async function choosePDF() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        setPdfFile(result.assets[0]);
        Alert.alert('بریالی شو', 'PDF فایل انتخاب شو');
      }
    } catch (e) {
      Alert.alert('تېروتنه', String(e));
    }
  }

  async function openPDF() {
    if (!pdfFile || !pdfFile.uri) {
      Alert.alert('خبرتیا', 'لومړی PDF انتخاب کړه');
      return;
    }
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfFile.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'PDF کتاب پرانیزئ یا شریک کړئ',
        });
      } else {
        Alert.alert('خبرتیا', 'شریکول په دې وسیله کې فعال نه دي');
      }
    } catch (e) {
      Alert.alert('PDF تېروتنه', String(e));
    }
  }

  async function shareText(title, details = '') {
    try {
      await Share.share({
        message: `${title}${details ? '\n' + details : ''}\n\nد اسلامي علمي کتابتون له لارې`,
      });
    } catch (e) {
      Alert.alert('شریکول', String(e));
    }
  }

  function openNote(id, title) {
    setNoteTarget({ id, title });
    setNoteText(notes[id] || '');
    setScreen('note');
  }

  function saveNote() {
    if (!noteTarget) return;
    setNotes(old => ({ ...old, [noteTarget.id]: noteText }));
    setScreen('notes');
    Alert.alert('خوندي شو', 'ستاسو نوټ خوندي شو');
  }

  function deleteNote(id) {
    Alert.alert('د نوټ حذفول', 'ایا دا نوټ حذف کړئ؟', [
      { text: 'نه', style: 'cancel' },
      {
        text: 'هو، حذف یې کړه',
        style: 'destructive',
        onPress: () => setNotes(old => {
          const copy = { ...old };
          delete copy[id];
          return copy;
        }),
      },
    ]);
  }

  function back() {
    if (screen === 'note') setScreen('notes');
    else if (screen === 'notes' || screen === 'settings') setScreen('home');
    else if (bookId) setBookId(null);
    else if (category) setCategory(null);
    else if (scholar) setScholar(null);
  }

  const AppText = ({ style, ...props }) => (
    <Text {...props} style={[{ fontFamily }, style]} />
  );

  function card(title, subtitle, action) {
    return (
      <TouchableOpacity style={styles.card} onPress={action}>
        <AppText style={styles.cardTitle}>{title}</AppText>
        <AppText style={styles.sub}>{subtitle}</AppText>
        <AppText style={styles.arrow}>←</AppText>
      </TouchableOpacity>
    );
  }

  function addBox(label, value, setValue, placeholder, action, buttonText) {
    return (
      <View style={styles.addBox}>
        <AppText style={styles.label}>{label}</AppText>
        <TextInput
          style={[styles.input, { fontFamily }]}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor="#8A9B90"
          textAlign="right"
        />
        <TouchableOpacity style={styles.addButton} onPress={action}>
          <AppText style={styles.addText}>{buttonText}</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      { direction: language === 'English' ? 'ltr' : 'rtl' }
    ]}>
      <StatusBar barStyle="light-content" backgroundColor="#071B16" />

      <View style={styles.header}>
        <AppText style={styles.logo}>میراث اسلام</AppText>
        <AppText style={styles.headerSub}>اسلامي علمي کتابتون</AppText>
      </View>

      <View style={styles.topActions}>
        <TouchableOpacity style={styles.topButton} onPress={() => setScreen('settings')}>
          <AppText style={styles.topButtonText}>⚙️ تنظیمات</AppText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.topButton} onPress={() => setScreen('notes')}>
          <AppText style={styles.topButtonText}>📝 نوټونه</AppText>
        </TouchableOpacity>
      </View>

      {(scholar || category || bookId || screen !== 'home') && (
        <TouchableOpacity style={styles.back} onPress={back}>
          <AppText style={styles.backText}>→ شاته تګ</AppText>
        </TouchableOpacity>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {screen === 'settings' && (
          <View>
            <AppText style={styles.heading}>⚙️ {tr('settings')}</AppText>

            <View style={styles.panel}>
              <AppText style={styles.panelTitle}>🌐 {tr('language')}</AppText>
              <View style={styles.languageGrid}>
                {['پښتو', 'العربية', 'اردو', 'فارسي', 'English'].map(lang => (
                  <TouchableOpacity
                    key={lang}
                    style={[
                      styles.languageChip,
                      language === lang && styles.selectedChip
                    ]}
                    onPress={() => setLanguage(lang)}
                  >
                    <AppText style={[
                      styles.languageText,
                      language === lang && styles.selectedText
                    ]}>
                      {language === lang ? '✓ ' : ''}{lang}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.panel}>
              <AppText style={styles.panelTitle}>Aa {tr('font')}</AppText>
              <AppText style={styles.hint}>{tr('choose')}</AppText>
              {fonts.map(item => (
                <TouchableOpacity
                  key={item.family}
                  style={[
                    styles.fontOption,
                    fontFamily === item.family && styles.fontSelected
                  ]}
                  onPress={() => setFontFamily(item.family)}
                >
                  <View style={{ flex: 1 }}>
                    <AppText style={styles.fontName}>{item.name}</AppText>
                    <Text style={[
                      styles.fontSample,
                      { fontFamily: item.family }
                    ]}>
                      میراث اسلام — اسلامي علمي کتابتون
                    </Text>
                  </View>
                  <AppText style={styles.fontCheck}>
                    {fontFamily === item.family ? '✓' : '○'}
                  </AppText>
                </TouchableOpacity>
              ))}
              <AppText style={styles.hint}>{tr('save')}</AppText>
            </View>

            <View style={styles.panel}>
              <AppText style={styles.panelTitle}>🌅 {tr('adhkar')}</AppText>
              <AppText style={styles.label}>{tr('morning')}</AppText>
              {[
                'آیت الکرسي',
                'سورة الإخلاص',
                'سورة الفلق',
                'سورة الناس',
                'أصبحنا وأصبح الملك لله',
                'سبحان الله وبحمده',
              ].map((item, i) => (
                <AppText key={i} style={styles.lesson}>
                  {i + 1}. {item}
                </AppText>
              ))}
              <AppText style={styles.label}>🌙 ماښامني اذکار</AppText>
              {[
                'آیت الکرسي',
                'سورة الإخلاص',
                'سورة الفلق',
                'سورة الناس',
                'أمسينا وأمسى الملك لله',
                'أستغفر الله وأتوب إليه',
              ].map((item, i) => (
                <AppText key={i} style={styles.lesson}>
                  {i + 1}. {item}
                </AppText>
              ))}
            </View>

            <View style={styles.panel}>
              <AppText style={styles.panelTitle}>🕌 {tr('prayer')}</AppText>
              {[
                ['فجر', 'fajr'],
                ['ظهر', 'dhuhr'],
                ['عصر', 'asr'],
                ['مغرب', 'maghrib'],
                ['عشاء', 'isha'],
              ].map(([name, id]) => (
                <View key={id}>
                  <AppText style={styles.label}>{name}</AppText>
                  <TextInput
                    style={[styles.input, { fontFamily }]}
                    value={prayerTimes[id]}
                    onChangeText={v =>
                      setPrayerTimes(old => ({ ...old, [id]: v }))
                    }
                    placeholder="05:00"
                  />
                </View>
              ))}
              <AppText style={styles.hint}>
                دا وختونه په لاس تنظیمېږي؛ اتومات د لمانځه وختونه نه دي.
              </AppText>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={back}>
              <AppText style={styles.addText}>{tr('back')}</AppText>
            </TouchableOpacity>
          </View>
        )}

        {screen === 'notes' && (
          <View>
            <AppText style={styles.heading}>📝 زما خوندي شوي نوټونه</AppText>
            {Object.entries(notes).filter(([, v]) => v && v.trim()).length === 0 ? (
              <AppText style={styles.empty}>تر اوسه کوم نوټ نه دی ساتل شوی.</AppText>
            ) : (
              Object.entries(notes)
                .filter(([, v]) => v && v.trim())
                .map(([id, value]) => (
                  <View key={id} style={styles.noteCard}>
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={() => openNote(id, 'خوندي شوی نوټ')}
                    >
                      <AppText style={styles.cardTitle}>📝 یادښت</AppText>
                      <AppText style={styles.sub} numberOfLines={3}>
                        {value}
                      </AppText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteNote(id)}>
                      <AppText style={styles.delete}>حذف</AppText>
                    </TouchableOpacity>
                  </View>
                ))
            )}
          </View>
        )}

        {screen === 'note' && noteTarget && (
          <View style={styles.panel}>
            <AppText style={styles.heading}>📝 نوټ لیکل</AppText>
            <AppText style={styles.description}>{noteTarget.title}</AppText>
            <TextInput
              style={[styles.input, styles.noteInput, { fontFamily }]}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="خپل نوټ دلته ولیکئ..."
              multiline
              textAlign="right"
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.addButton} onPress={saveNote}>
              <AppText style={styles.addText}>💾 نوټ خوندي کړه</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => shareText(noteTarget.title, noteText)}
            >
              <AppText style={styles.addText}>↗️ نوټ شریک کړه</AppText>
            </TouchableOpacity>
          </View>
        )}

        {screen === 'home' && !scholar && (
          <View>
            <View style={styles.welcome}>
              <AppText style={styles.eyebrow}>✦ {tr('library')} ✦</AppText>
              <AppText style={styles.welcomeTitle}>میراث اسلام</AppText>
              <AppText style={styles.welcomeSub}>
                د علم، معرفت او اسلامي تاریخ خزانه
              </AppText>
              <TextInput
                style={[styles.searchInput, { fontFamily }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={tr('search')}
                placeholderTextColor="#9FAE9F"
                textAlign="right"
              />
            </View>

            <View style={styles.mainLibrary}>
              <AppText style={styles.eyebrow}>✧ {tr('scholars')} ✧</AppText>
              <AppText style={styles.mainTitle}>{tr('library')}</AppText>
              <AppText style={styles.mainSub}>
                د علماؤ کرامو درسونه، کتابونه او علمي آثار
              </AppText>

              {scholars
                .filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item, index) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.scholarTile}
                    onPress={() => {
                      setScholar(item);
                      setCategory(null);
                      setBookId(null);
                      setSearchQuery('');
                    }}
                  >
                    <AppText style={styles.scholarNumber}>
                      {String(index + 1).padStart(2, '0')}
                    </AppText>
                    <AppText style={styles.scholarName}>{item}</AppText>
                    <AppText style={styles.scholarOpen}>
                      کتابتون پرانیزئ ←
                    </AppText>
                  </TouchableOpacity>
                ))}
            </View>

            <AppText style={styles.sectionTitle}>{tr('works')}</AppText>
            <View style={styles.featureGrid}>
              {[
                ['🎧', tr('audio'), 'د علماؤ غږیز بیانونه'],
                ['📚', tr('books'), 'کتابونه او د مطالعې برخه'],
                ['📖', tr('quran'), 'قرآن کریم او تفسیر'],
                ['۞', tr('hadith'), 'حدیثونه او شرح'],
                ['🏛', tr('history'), 'د اسلامي تاریخ درسونه'],
                ['📝', tr('notes'), 'شخصي یادښتونه'],
              ].map(([symbol, title, sub], i) => (
                <TouchableOpacity
                  key={title}
                  style={styles.featureCard}
                  onPress={() => {
                    if (i === 5) setScreen('notes');
                    else Alert.alert(
                      title,
                      'دا برخه د علماء کرامو د کتابتون له لارې پرانیزئ.'
                    );
                  }}
                >
                  <AppText style={styles.featureIcon}>{symbol}</AppText>
                  <AppText style={styles.featureTitle}>{title}</AppText>
                  <AppText style={styles.featureSub}>{sub}</AppText>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.socialPanel}>
              <AppText style={styles.socialTitle}>{tr('social')}</AppText>
              <AppText style={styles.socialHint}>{tr('socialHint')}</AppText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.socialRow}
              >
                {[
                  ['♪', 'TikTok'],
                  ['f', 'Facebook'],
                  ['𝕏', 'X'],
                  ['➤', 'Telegram'],
                  ['◎', 'Instagram'],
                  ['▶', 'YouTube'],
                ].map(([symbol, name]) => (
                  <View key={name} style={styles.socialItem}>
                    <View style={styles.socialCircle}>
                      <AppText style={styles.socialSymbol}>{symbol}</AppText>
                    </View>
                    <AppText style={styles.socialName}>{name}</AppText>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {screen === 'home' && scholar && !category && (
          <View>
            <AppText style={styles.heading}>د عالم کتابتون</AppText>
            <AppText style={styles.description}>{scholar}</AppText>
            {categories.map(item =>
              card(item, 'د دې برخې کتابونه', () => setCategory(item))
            )}
          </View>
        )}

        {screen === 'home' && scholar && category && !bookId && (
          <View>
            <AppText style={styles.heading}>{category}</AppText>
            <AppText style={styles.description}>{scholar}</AppText>
            {addBox(
              'نوی کتاب',
              newBook,
              setNewBook,
              'د کتاب نوم ولیکئ',
              addBook,
              '＋ کتاب اضافه کړه'
            )}
            <AppText style={styles.sectionTitle}>کتابونه</AppText>
            {currentBooks.length === 0 ? (
              <AppText style={styles.empty}>تر اوسه کتاب نه دی اضافه شوی.</AppText>
            ) : currentBooks.map(item => (
              <View style={styles.bookRow} key={item.id}>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => setBookId(item.id)}
                >
                  <AppText style={styles.cardTitle}>📚 {item.name}</AppText>
                  <AppText style={styles.sub}>جزئیات پرانیزئ</AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => openNote('book|' + item.id, item.name)}
                >
                  <AppText style={styles.actionText}>📝 نوټ</AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => shareText(item.name, scholar)}
                >
                  <AppText style={styles.actionText}>↗️ شیر</AppText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeBook(item.id)}>
                  <AppText style={styles.delete}>حذف</AppText>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {screen === 'home' && currentBook && (
          <View>
            <AppText style={styles.heading}>{currentBook.name}</AppText>
            <AppText style={styles.description}>{category}</AppText>

            <View style={styles.panel}>
              <AppText style={styles.label}>د کتاب PDF</AppText>
              <TouchableOpacity style={styles.addButton} onPress={choosePDF}>
                <AppText style={styles.addText}>📄 PDF انتخاب کړه</AppText>
              </TouchableOpacity>
              <AppText style={styles.empty}>
                {pdfFile ? pdfFile.name : 'PDF لا نه دی انتخاب شوی'}
              </AppText>
              <TouchableOpacity style={styles.smallButton} onPress={openPDF}>
                <AppText style={styles.addText}>📖 PDF پرانیزئ یا شریک کړئ</AppText>
              </TouchableOpacity>
            </View>

            <View style={styles.inlineActions}>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={() => openNote('book|' + currentBook.id, currentBook.name)}
              >
                <AppText style={styles.addText}>📝 د کتاب نوټ</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={() => shareText(currentBook.name, scholar)}
              >
                <AppText style={styles.addText}>↗️ کتاب شریک کړه</AppText>
              </TouchableOpacity>
            </View>

            {addBox(
              'نوی فصل',
              newChapter,
              setNewChapter,
              'د فصل نوم ولیکئ',
              addChapter,
              '＋ فصل اضافه کړه'
            )}

            <AppText style={styles.sectionTitle}>فصلونه</AppText>
            {(currentBook.chapters || []).map(chapter => (
              <View style={styles.chapterBox} key={chapter.id}>
                <AppText style={styles.chapterTitle}>📖 {chapter.name}</AppText>
                <AppText style={styles.label}>نوی باب</AppText>
                <TextInput
                  style={[styles.input, { fontFamily }]}
                  value={newBab}
                  onChangeText={setNewBab}
                  placeholder="د باب نوم ولیکئ"
                  textAlign="right"
                />
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => addBab(chapter.id)}
                >
                  <AppText style={styles.addText}>＋ باب اضافه کړه</AppText>
                </TouchableOpacity>

                {(chapter.babs || []).map(bab => (
                  <View style={styles.babBox} key={bab.id}>
                    <AppText style={styles.babTitle}>📁 {bab.name}</AppText>
                    <AppText style={styles.label}>نوی درس</AppText>
                    <TextInput
                      style={[styles.input, { fontFamily }]}
                      value={newLesson}
                      onChangeText={setNewLesson}
                      placeholder="د درس نوم ولیکئ"
                      textAlign="right"
                    />
                    <TouchableOpacity
                      style={styles.smallButton}
                      onPress={() => addLesson(chapter.id, bab.id)}
                    >
                      <AppText style={styles.addText}>＋ درس اضافه کړه</AppText>
                    </TouchableOpacity>

                    {(bab.lessons || []).map(lesson => (
                      <View style={styles.lessonRow} key={lesson.id}>
                        <AppText style={[styles.lesson, { flex: 1 }]}>
                          🎧 {lesson.name}
                        </AppText>
                        <TouchableOpacity
                          onPress={() => openNote('lesson|' + lesson.id, lesson.name)}
                        >
                          <AppText style={styles.actionText}>📝</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => shareText(lesson.name, scholar)}
                        >
                          <AppText style={styles.actionText}>↗️</AppText>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <AppText style={styles.footerText}>
          میراث اسلام • اسلامي علمي کتابتون
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07130F' },
  header: {
    backgroundColor: '#0B2B20',
    paddingTop: 18,
    paddingBottom: 18,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#B99545',
  },
  logo: { color: '#E5C36B', fontSize: 27, fontWeight: 'bold' },
  headerSub: { color: '#D8D0B8', fontSize: 13, marginTop: 5 },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
  },
  topButton: {
    backgroundColor: '#B99545',
    padding: 10,
    borderRadius: 9,
    marginHorizontal: 4,
    flex: 1,
    alignItems: 'center',
  },
  topButtonText: { color: '#07130F', fontWeight: 'bold', fontSize: 12 },
  back: { padding: 12, alignItems: 'flex-end' },
  backText: { color: '#E5C36B', fontSize: 15 },
  content: { padding: 15, paddingBottom: 35 },
  heading: {
    color: '#E5C36B',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 12,
  },
  description: {
    color: '#B9C9BE',
    textAlign: 'center',
    fontSize: 13,
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#10271E',
    borderWidth: 1,
    borderColor: '#806B3C',
    borderRadius: 12,
    padding: 17,
    marginBottom: 11,
  },
  cardTitle: {
    color: '#F0D58A',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  sub: { color: '#AAB9AE', fontSize: 12, textAlign: 'right', marginTop: 6 },
  arrow: { color: '#D7B65E', fontSize: 17, marginTop: 5 },
  panel: {
    backgroundColor: '#10271E',
    borderRadius: 13,
    padding: 14,
    borderWidth: 1,
    borderColor: '#806B3C',
    marginBottom: 14,
  },
  addBox: {
    backgroundColor: '#10271E',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#806B3C',
    marginBottom: 15,
  },
  label: {
    color: '#E5C36B',
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F1F0E8',
    color: '#17231C',
    borderRadius: 8,
    padding: 11,
    fontSize: 14,
  },
  noteInput: { minHeight: 180, textAlignVertical: 'top' },
  addButton: {
    backgroundColor: '#B99545',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  smallButton: {
    backgroundColor: '#806B3C',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 3,
  },
  addText: { color: '#102016', fontSize: 13, fontWeight: 'bold' },
  sectionTitle: {
    color: '#E5C36B',
    fontSize: 17,
    textAlign: 'right',
    marginBottom: 12,
    marginTop: 12,
  },
  empty: { color: '#B9C9BE', textAlign: 'center', padding: 10, fontSize: 13 },
  welcome: {
    backgroundColor: '#10271E',
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: '#806B3C',
    marginBottom: 14,
  },
  eyebrow: { color: '#D7B65E', fontSize: 11, textAlign: 'center' },
  welcomeTitle: {
    color: '#E5C36B',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 6,
  },
  welcomeSub: {
    color: '#C6CDBF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 14,
  },
  searchInput: {
    backgroundColor: '#F1F0E8',
    color: '#17231C',
    borderRadius: 10,
    padding: 11,
    fontSize: 13,
  },
  mainLibrary: {
    backgroundColor: '#122D21',
    borderWidth: 1.5,
    borderColor: '#B99545',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  mainTitle: {
    color: '#F0D58A',
    fontSize: 21,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 6,
  },
  mainSub: {
    color: '#B9C9BE',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 12,
  },
  scholarTile: {
    backgroundColor: '#1B392A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#5F603B',
    padding: 12,
    marginBottom: 9,
  },
  scholarNumber: { color: '#D7B65E', fontSize: 11, textAlign: 'left' },
  scholarName: {
    color: '#F0DDB2',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 7,
  },
  scholarOpen: {
    color: '#B8C7B9',
    fontSize: 10,
    textAlign: 'right',
    marginTop: 7,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48.5%',
    backgroundColor: '#17291F',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#665735',
    padding: 13,
    marginBottom: 10,
    minHeight: 112,
  },
  featureIcon: { color: '#E5C36B', fontSize: 23, textAlign: 'center' },
  featureTitle: {
    color: '#F0D58A',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 7,
  },
  featureSub: {
    color: '#B9C9BE',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  socialPanel: {
    backgroundColor: '#171F18',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#806B3C',
    padding: 12,
    marginTop: 5,
  },
  socialTitle: {
    color: '#E5C36B',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  socialHint: {
    color: '#AEB9A8',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 12,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  socialItem: { width: 52, alignItems: 'center', marginHorizontal: 2 },
  socialCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#293B2B',
    borderWidth: 1.2,
    borderColor: '#D7B65E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialSymbol: { color: '#E5C36B', fontSize: 21, fontWeight: 'bold' },
  socialName: {
    color: '#E0D6BB',
    fontSize: 9,
    marginTop: 5,
    textAlign: 'center',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  languageChip: {
    width: '48.5%',
    backgroundColor: '#1C392A',
    borderWidth: 1,
    borderColor: '#665735',
    borderRadius: 9,
    padding: 11,
    marginBottom: 8,
    alignItems: 'center',
  },
  selectedChip: { backgroundColor: '#B99545', borderColor: '#E5C36B' },
  languageText: { color: '#F0DDB2', fontSize: 13, fontWeight: 'bold' },
  selectedText: { color: '#102016' },
  panelTitle: {
    color: '#E5C36B',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 10,
  },
  hint: {
    color: '#AAB9AE',
    fontSize: 11,
    textAlign: 'right',
    marginVertical: 7,
  },
  fontOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A3528',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#435340',
    padding: 10,
    marginBottom: 8,
  },
  fontSelected: { borderColor: '#E5C36B', backgroundColor: '#2B3C29' },
  fontName: { color: '#D7CBAA', fontSize: 11, textAlign: 'right' },
  fontSample: {
    color: '#F0D58A',
    fontSize: 17,
    textAlign: 'right',
    marginTop: 4,
  },
  fontCheck: { color: '#E5C36B', fontSize: 22, paddingHorizontal: 8 },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10271E',
    borderWidth: 1,
    borderColor: '#806B3C',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10271E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#806B3C',
    padding: 12,
    marginBottom: 10,
  },
  actionText: { color: '#E5C36B', fontSize: 12, padding: 5 },
  chapterBox: {
    backgroundColor: '#10271E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#806B3C',
    padding: 13,
    marginBottom: 14,
  },
  chapterTitle: {
    color: '#E5C36B',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 8,
  },
  babBox: {
    backgroundColor: '#18352A',
    borderRadius: 9,
    padding: 11,
    marginTop: 12,
  },
  babTitle: {
    color: '#F0D58A',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  lesson: {
    color: '#D8E3D9',
    textAlign: 'right',
    padding: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#52685A',
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#52685A',
  },
  inlineActions: { flexDirection: 'row', marginBottom: 12 },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#806B3C',
    alignItems: 'center',
  },
  footerText: { color: '#B99545', fontSize: 12 },
});
