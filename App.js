 import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, Alert, Share
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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

const colors = [
  '#E5C36B', '#F0F0E8', '#D8E3D9', '#80C995',
  '#72B7FF', '#FF9B8F', '#C6A6FF', '#FFFFFF',
];

const languages = ['پښتو', 'العربية', 'اردو', 'فارسي', 'English'];

const translations = {
  'پښتو': {
    settings: 'تنظیمات', language: 'د اپلیکیشن ژبه',
    font: 'د لیکلو فونټ', library: 'د علماؤ کرامو کتابتون',
    search: 'عالم ولټوئ', prayer: 'د لمانځه وختونه',
    reminders: 'د بیانونو خبرتیاوې', notes: 'زما یادښتونه',
    adhkar: 'سهار او ماښام اذکار', back: 'شاته تګ',
  },
  'العربية': {
    settings: 'الإعدادات', language: 'لغة التطبيق',
    font: 'نوع الخط', library: 'مكتبة العلماء',
    search: 'ابحث عن عالم', prayer: 'أوقات الصلاة',
    reminders: 'تنبيهات الدروس', notes: 'ملاحظاتي',
    adhkar: 'أذكار الصباح والمساء', back: 'رجوع',
  },
  'اردو': {
    settings: 'ترتیبات', language: 'ایپ کی زبان',
    font: 'فونٹ', library: 'علماء کی لائبریری',
    search: 'عالم تلاش کریں', prayer: 'نماز کے اوقات',
    reminders: 'اسباق کی یاددہانیاں', notes: 'میرے نوٹس',
    adhkar: 'صبح و شام کے اذکار', back: 'واپس',
  },
  'فارسي': {
    settings: 'تنظیمات', language: 'زبان برنامه',
    font: 'نوع قلم', library: 'کتابخانه علما',
    search: 'جستجوی عالم', prayer: 'اوقات نماز',
    reminders: 'یادآوری درس‌ها', notes: 'یادداشت‌ها',
    adhkar: 'اذکار صبح و شام', back: 'بازگشت',
  },
  'English': {
    settings: 'Settings', language: 'App language',
    font: 'Font style', library: 'Scholars Library',
    search: 'Search scholar', prayer: 'Prayer times',
    reminders: 'Lesson reminders', notes: 'My notes',
    adhkar: 'Morning & evening adhkar', back: 'Back',
  },
};

export default function App() {
  const [screen, setScreen] = useState('home');
  const [scholar, setScholar] = useState(null);
  const [category, setCategory] = useState(null);
  const [bookId, setBookId] = useState(null);

  const [language, setLanguage] = useState('پښتو');
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [textColor, setTextColor] = useState('#D8E3D9');
  const [headingColor, setHeadingColor] = useState('#E5C36B');
  const [reminderColor, setReminderColor] = useState('#80C995');

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
    fajr: '05:00', dhuhr: '12:30', asr: '15:30',
    maghrib: '17:30', isha: '19:00',
  });

  const [reminders, setReminders] = useState([]);
  const [remindersReady, setRemindersReady] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  const tr = key =>
    (translations[language] && translations[language][key]) ||
    translations['پښتو'][key] || key;

  useEffect(() => {
    async function loadSettings() {
      try {
        const raw = await AsyncStorage.getItem('app_settings');
        if (raw) {
          const data = JSON.parse(raw);
          if (data.language) setLanguage(data.language);
          if (data.fontFamily) setFontFamily(data.fontFamily);
          if (data.prayerTimes) setPrayerTimes(data.prayerTimes);
          if (data.textColor) setTextColor(data.textColor);
          if (data.headingColor) setHeadingColor(data.headingColor);
          if (data.reminderColor) setReminderColor(data.reminderColor);
        }
      } catch (e) {
        Alert.alert('خبرتیا', 'تنظیمات ونه لوستل شول');
      } finally {
        setSettingsReady(true);
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    if (!settingsReady) return;
    AsyncStorage.setItem('app_settings', JSON.stringify({
      language, fontFamily, prayerTimes,
      textColor, headingColor, reminderColor,
    })).catch(() => {});
  }, [
    language, fontFamily, prayerTimes,
    textColor, headingColor, reminderColor, settingsReady,
  ]);

  useEffect(() => {
    async function loadBooks() {
      try {
        const raw = await AsyncStorage.getItem('library_books');
        if (raw) setBooks(JSON.parse(raw));
      } catch (e) {
        Alert.alert('خبرتیا', 'کتابونه ونه لوستل شول');
      } finally {
        setBooksReady(true);
      }
    }
    loadBooks();
  }, []);

  useEffect(() => {
    if (booksReady) {
      AsyncStorage.setItem('library_books', JSON.stringify(books))
        .catch(() => {});
    }
  }, [books, booksReady]);

  useEffect(() => {
    async function loadNotes() {
      try {
        const raw = await AsyncStorage.getItem('library_notes');
        if (raw) setNotes(JSON.parse(raw));
      } catch (e) {
        Alert.alert('خبرتیا', 'نوټونه ونه لوستل شول');
      } finally {
        setNotesReady(true);
      }
    }
    loadNotes();
  }, []);

  useEffect(() => {
    if (notesReady) {
      AsyncStorage.setItem('library_notes', JSON.stringify(notes))
        .catch(() => {});
    }
  }, [notes, notesReady]);

  useEffect(() => {
    async function loadReminders() {
      try {
        const raw = await AsyncStorage.getItem('lesson_reminders');
        if (raw) setReminders(JSON.parse(raw));
      } catch (e) {
        Alert.alert('خبرتیا', 'خبرتیاوې ونه لوستل شوې');
      } finally {
        setRemindersReady(true);
      }
    }
    loadReminders();

    async function prepareNotifications() {
      try {
        await Notifications.setNotificationChannelAsync('lesson-reminders', {
          name: 'د بیانونو خبرتیاوې',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
        });
      } catch (e) {}
    }
    prepareNotifications();
  }, []);

  useEffect(() => {
    if (remindersReady) {
      AsyncStorage.setItem('lesson_reminders', JSON.stringify(reminders))
        .catch(() => {});
    }
  }, [reminders, remindersReady]);

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
    updateBooks(currentBooks.map(b => b.id === updated.id ? updated : b));
  }

  function addChapter() {
    if (!newChapter.trim() || !currentBook) {
      Alert.alert('خبرتیا', 'د فصل نوم ولیکئ');
      return;
    }
    updateBook({
      ...currentBook,
      chapters: [...(currentBook.chapters || []), {
        id: String(Date.now()), name: newChapter.trim(), babs: [],
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
      ch.id === chapterId ? {
        ...ch,
        babs: [...(ch.babs || []), {
          id: String(Date.now()), name: newBab.trim(), lessons: [],
        }],
      } : ch
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
        babs: (ch.babs || []).map(b => b.id === babId ? {
          ...b,
          lessons: [...(b.lessons || []), {
            id: String(Date.now()), name: newLesson.trim(),
          }],
        } : b),
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
    if (!pdfFile?.uri) {
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
        Alert.alert('خبرتیا', 'شریکول فعال نه دي');
      }
    } catch (e) {
      Alert.alert('PDF تېروتنه', String(e));
    }
  }

  async function shareText(title, details = '') {
    try {
      await Share.share({
        message: `${title}${details ? '\n' + details : ''}\n\nد میراث اسلام له لارې`,
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

  function goToScholar(item) {
    setScholar(item);
    setCategory(null);
    setBookId(null);
    setScreen('scholar');
  }

  function back() {
    if (screen === 'note') setScreen('notes');
    else if (screen === 'settings' || screen === 'notes' ||
             screen === 'reminders' || screen === 'scholars') {
      setScreen('home');
    } else if (screen === 'book') {
      setBookId(null);
      setScreen('category');
    } else if (screen === 'category') {
      setCategory(null);
      setScreen('scholar');
    } else if (screen === 'scholar') {
      setScholar(null);
      setScreen('scholars');
    } else {
      setScreen('home');
    }
  }

  async function addReminder() {
    if (!reminderTitle.trim() || !reminderDate.trim() || !reminderTime.trim()) {
      Alert.alert('خبرتیا', 'د بیان نوم، نېټه او وخت ټول ولیکئ');
      return;
    }

    const dateParts = reminderDate.split('-').map(Number);
    const timeParts = reminderTime.split(':').map(Number);

    if (
      dateParts.length !== 3 || timeParts.length !== 2 ||
      dateParts.some(n => !Number.isFinite(n)) ||
      timeParts.some(n => !Number.isFinite(n))
    ) {
      Alert.alert('د نېټې تېروتنه', 'نېټه 2026-12-25 او وخت 18:30 ولیکئ');
      return;
    }

    const [year, month, day] = dateParts;
    const [hour, minute] = timeParts;
    const date = new Date(year, month - 1, day, hour, minute);

    if (
      date.getFullYear() !== year || date.getMonth() !== month - 1 ||
      date.getDate() !== day || hour < 0 || hour > 23 ||
      minute < 0 || minute > 59
    ) {
      Alert.alert('د نېټې تېروتنه', 'سمه نېټه او وخت ولیکئ');
      return;
    }

    if (date.getTime() <= Date.now()) {
      Alert.alert('خبرتیا', 'راتلونکې نېټه او وخت وټاکئ');
      return;
    }

    try {
      let permission = await Notifications.getPermissionsAsync();
      if (!permission.granted) {
        permission = await Notifications.requestPermissionsAsync();
      }
      if (!permission.granted) {
        Alert.alert('اجازه اړینه ده', 'د موبایل له تنظیماتو څخه خبرتیاوې فعالې کړئ');
        return;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'د بیان یادونه — میراث اسلام',
          body: reminderTitle.trim(),
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date,
          channelId: 'lesson-reminders',
        },
      });

      const newReminder = {
        id: String(Date.now()),
        title: reminderTitle.trim(),
        date: date.toISOString(),
        notificationId,
      };

      setReminders(old => [...old, newReminder].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      ));
      setReminderTitle('');
      setReminderDate('');
      setReminderTime('');
      Alert.alert('بریالی شو', 'د بیان خبرتیا جوړه او خوندي شوه');
    } catch (e) {
      Alert.alert('خبرتیا جوړه نه شوه', String(e));
    }
  }

  function deleteReminder(item) {
    Alert.alert('خبرتیا حذفول', 'دا یادونه حذف کړئ؟', [
      { text: 'نه', style: 'cancel' },
      {
        text: 'هو، حذف یې کړه',
        style: 'destructive',
        onPress: async () => {
          try {
            if (item.notificationId) {
              await Notifications.cancelScheduledNotificationAsync(
                item.notificationId
              );
            }
          } catch (e) {}
          setReminders(old => old.filter(r => r.id !== item.id));
        },
      },
    ]);
  }

  const AppText = ({ style, tone = 'normal', ...props }) => {
    const color = tone === 'heading' ? headingColor :
      tone === 'reminder' ? reminderColor : textColor;
    return (
      <Text
        {...props}
        style={[style, { fontFamily, color }]}
      />
    );
  };

  function card(title, subtitle, action) {
    return (
      <TouchableOpacity style={styles.card} onPress={action}>
        <AppText tone="heading" style={styles.cardTitle}>{title}</AppText>
        <AppText style={styles.sub}>{subtitle}</AppText>
        <AppText tone="heading" style={styles.arrow}>←</AppText>
      </TouchableOpacity>
    );
  }

  function addBox(label, value, setValue, placeholder, action, buttonText) {
    return (
      <View style={styles.addBox}>
        <AppText tone="heading" style={styles.label}>{label}</AppText>
        <TextInput
          style={[styles.input, { fontFamily }]}
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

  function colorPicker(title, value, setter) {
    return (
      <View style={{ marginBottom: 12 }}>
        <AppText tone="heading" style={styles.label}>{title}</AppText>
        <View style={styles.colorRow}>
          {colors.map(color => (
            <TouchableOpacity
              key={color}
              onPress={() => setter(color)}
              style={[
                styles.colorCircle,
                { backgroundColor: color },
                value === color && styles.colorSelected,
              ]}
            >
              {value === color && <Text style={styles.colorTick}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
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

      <View style={styles.topActions}>
        <TouchableOpacity style={styles.topButton}
          onPress={() => setScreen('settings')}>
          <Text style={styles.topButtonText}>⚙️ تنظیمات</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.topButton}
          onPress={() => setScreen('notes')}>
          <Text style={styles.topButtonText}>📝 نوټونه</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.topButton}
          onPress={() => setScreen('reminders')}>
          <Text style={styles.topButtonText}>🔔 خبرتیاوې</Text>
        </TouchableOpacity>
      </View>

      {screen !== 'home' && (
        <TouchableOpacity style={styles.back} onPress={back}>
          <AppText tone="heading" style={styles.backText}>→ شاته تګ</AppText>
        </TouchableOpacity>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {screen === 'home' && (
          <View>
            <View style={styles.welcome}>
              <AppText tone="heading" style={styles.eyebrow}>
                ✦ د علم، معرفت او تاریخ خزانه ✦
              </AppText>
              <Text style={styles.welcomeTitle}>میراث اسلام</Text>
              <AppText style={styles.welcomeSub}>
                د قرآن، حدیث او اسلامي علومو کتابتون
              </AppText>
            </View>

            <View style={styles.prayerPanel}>
              <AppText tone="heading" style={styles.prayerTitle}>
                🕌 {tr('prayer')}
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[
                  ['فجر', 'fajr'], ['ظهر', 'dhuhr'], ['عصر', 'asr'],
                  ['مغرب', 'maghrib'], ['عشاء', 'isha'],
                ].map(([name, id]) => (
                  <TouchableOpacity
                    key={id}
                    style={styles.prayerItem}
                    onPress={() => setScreen('settings')}
                  >
                    <AppText style={styles.prayerName}>{name}</AppText>
                    <AppText tone="heading" style={styles.prayerTime}>
                      {prayerTimes[id]}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <AppText style={styles.hint}>د وختونو د بدلولو لپاره دلته کېکاږئ</AppText>
            </View>

            <TouchableOpacity
              style={styles.mainLibrary}
              onPress={() => setScreen('scholars')}
            >
              <AppText tone="heading" style={styles.eyebrow}>✧ د اسلامي علم خزانه ✧</AppText>
              <AppText tone="heading" style={styles.mainTitle}>
                📚 {tr('library')}
              </AppText>
              <AppText style={styles.mainSub}>
                د علماؤ کرامو درسونه، کتابونه او علمي آثار
              </AppText>
              <Text style={styles.openLibrary}>کتابتون ته داخل شئ  ←</Text>
            </TouchableOpacity>

            <View style={styles.featureGrid}>
              <TouchableOpacity style={styles.featureCard}
                onPress={() => setScreen('reminders')}>
                <Text style={styles.featureIcon}>🔔</Text>
                <AppText tone="heading" style={styles.featureTitle}>
                  د بیانونو خبرتیاوې
                </AppText>
                <AppText style={styles.featureSub}>د درس وختونه تنظیم کړئ</AppText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.featureCard}
                onPress={() => setScreen('notes')}>
                <Text style={styles.featureIcon}>📝</Text>
                <AppText tone="heading" style={styles.featureTitle}>
                  زما یادښتونه
                </AppText>
                <AppText style={styles.featureSub}>خپل علمي نوټونه وساتئ</AppText>
              </TouchableOpacity>
            </View>

            <View style={styles.panel}>
              <AppText tone="heading" style={styles.panelTitle}>
                🌅 {tr('adhkar')}
              </AppText>
              {[
                'آیت الکرسي',
                'سورة الإخلاص',
                'سورة الفلق',
                'سورة الناس',
                'سبحان الله وبحمده',
              ].map((item, i) => (
                <AppText key={i} style={styles.lesson}>{i + 1}. {item}</AppText>
              ))}
            </View>
          </View>
        )}

        {screen === 'scholars' && (
          <View>
            <AppText tone="heading" style={styles.heading}>علماء کرام</AppText>
            <TextInput
              style={[styles.searchInput, { fontFamily }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={tr('search')}
              placeholderTextColor="#9FAE9F"
              textAlign="right"
            />
            {scholars.filter(s =>
              s.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((item, index) => (
              <TouchableOpacity key={item} style={styles.scholarTile}
                onPress={() => {
                  goToScholar(item);
                  setSearchQuery('');
                }}>
                <AppText tone="heading" style={styles.scholarNumber}>
                  {String(index + 1).padStart(2, '0')}
                </AppText>
                <AppText style={styles.scholarName}>{item}</AppText>
                <AppText tone="heading" style={styles.scholarOpen}>
                  کتابتون پرانیزئ ←
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {screen === 'scholar' && scholar && (
          <View>
            <AppText tone="heading" style={styles.heading}>د عالم کتابتون</AppText>
            <AppText style={styles.description}>{scholar}</AppText>
            {categories.map(item =>
              card(item, 'د دې برخې کتابونه او درسونه', () => {
                setCategory(item);
                setScreen('category');
              })
            )}
          </View>
        )}

        {screen === 'category' && scholar && category && (
          <View>
            <AppText tone="heading" style={styles.heading}>{category}</AppText>
            <AppText style={styles.description}>{scholar}</AppText>
            {addBox('نوی کتاب', newBook, setNewBook,
              'د کتاب نوم ولیکئ', addBook, '＋ کتاب اضافه کړه')}
            <AppText tone="heading" style={styles.sectionTitle}>کتابونه</AppText>
            {currentBooks.length === 0 ? (
              <AppText style={styles.empty}>تر اوسه کتاب نه دی اضافه شوی.</AppText>
            ) : currentBooks.map(item => (
              <View style={styles.bookRow} key={item.id}>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                  setBookId(item.id);
                  setScreen('book');
                }}>
                  <AppText tone="heading" style={styles.cardTitle}>
                    📚 {item.name}
                  </AppText>
                  <AppText style={styles.sub}>جزئیات پرانیزئ</AppText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() =>
                  openNote('book|' + item.id, item.name)}>
                  <AppText tone="heading" style={styles.actionText}>📝</AppText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => shareText(item.name, scholar)}>
                  <AppText tone="heading" style={styles.actionText}>↗️</AppText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeBook(item.id)}>
                  <Text style={styles.delete}>حذف</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {screen === 'book' && currentBook && (
          <View>
            <AppText tone="heading" style={styles.heading}>{currentBook.name}</AppText>
            <AppText style={styles.description}>{category}</AppText>

            <View style={styles.panel}>
              <AppText tone="heading" style={styles.label}>د کتاب PDF</AppText>
              <TouchableOpacity style={styles.addButton} onPress={choosePDF}>
                <Text style={styles.addText}>📄 PDF انتخاب کړه</Text>
              </TouchableOpacity>
              <AppText style={styles.empty}>
                {pdfFile ? pdfFile.name : 'PDF لا نه دی انتخاب شوی'}
              </AppText>
              <TouchableOpacity style={styles.smallButton} onPress={openPDF}>
                <Text style={styles.addText}>📖 PDF پرانیزئ یا شریک کړئ</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inlineActions}>
              <TouchableOpacity style={styles.smallButton}
                onPress={() => openNote('book|' + currentBook.id, currentBook.name)}>
                <Text style={styles.addText}>📝 د کتاب نوټ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.smallButton}
                onPress={() => shareText(currentBook.name, scholar)}>
                <Text style={styles.addText}>↗️ کتاب شریک کړه</Text>
              </TouchableOpacity>
            </View>

            {addBox('نوی فصل', newChapter, setNewChapter,
              'د فصل نوم ولیکئ', addChapter, '＋ فصل اضافه کړه')}

            <AppText tone="heading" style={styles.sectionTitle}>فصلونه</AppText>
            {(currentBook.chapters || []).map(chapter => (
              <View style={styles.chapterBox} key={chapter.id}>
                <AppText tone="heading" style={styles.chapterTitle}>
                  📖 {chapter.name}
                </AppText>
                <AppText tone="heading" style={styles.label}>نوی باب</AppText>
                <TextInput
                  style={[styles.input, { fontFamily }]}
                  value={newBab}
                  onChangeText={setNewBab}
                  placeholder="د باب نوم ولیکئ"
                  textAlign="right"
                />
                <TouchableOpacity style={styles.smallButton}
                  onPress={() => addBab(chapter.id)}>
                  <Text style={styles.addText}>＋ باب اضافه کړه</Text>
                </TouchableOpacity>

                {(chapter.babs || []).map(bab => (
                  <View style={styles.babBox} key={bab.id}>
                    <AppText tone="heading" style={styles.babTitle}>
                      📁 {bab.name}
                    </AppText>
                    <AppText tone="heading" style={styles.label}>نوی درس</AppText>
                    <TextInput
                      style={[styles.input, { fontFamily }]}
                      value={newLesson}
                      onChangeText={setNewLesson}
                      placeholder="د درس نوم ولیکئ"
                      textAlign="right"
                    />
                    <TouchableOpacity style={styles.smallButton}
                      onPress={() => addLesson(chapter.id, bab.id)}>
                      <Text style={styles.addText}>＋ درس اضافه کړه</Text>
                    </TouchableOpacity>

                    {(bab.lessons || []).map(lesson => (
                      <View style={styles.lessonRow} key={lesson.id}>
                        <AppText style={[styles.lesson, { flex: 1 }]}>
                          🎧 {lesson.name}
                        </AppText>
                        <TouchableOpacity onPress={() =>
                          openNote('lesson|' + lesson.id, lesson.name)}>
                          <AppText tone="heading" style={styles.actionText}>📝</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() =>
                          shareText(lesson.name, scholar)}>
                          <AppText tone="heading" style={styles.actionText}>↗️</AppText>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {screen === 'settings' && (
          <View>
            <AppText tone="heading" style={styles.heading}>⚙️ {tr('settings')}</AppText>

            <View style={styles.panel}>
              <AppText tone="heading" style={styles.panelTitle}>🌐 {tr('language')}</AppText>
              <View style={styles.languageGrid}>
                {languages.map(lang => (
                  <TouchableOpacity key={lang}
                    style={[styles.languageChip,
                      language === lang && styles.selectedChip]}
                    onPress={() => setLanguage(lang)}>
                    <Text style={[styles.languageText,
                      language === lang && styles.selectedText]}>
                      {language === lang ? '✓ ' : ''}{lang}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.panel}>
              <AppText tone="heading" style={styles.panelTitle}>Aa {tr('font')}</AppText>
              <AppText style={styles.hint}>
                دا د Android په موبایل کې موجود سیسټمي فونټونه دي.
              </AppText>
              {fonts.map(item => (
                <TouchableOpacity key={item.family}
                  style={[styles.fontOption,
                    fontFamily === item.family && styles.fontSelected]}
                  onPress={() => setFontFamily(item.family)}>
                  <View style={{ flex: 1 }}>
                    <AppText tone="heading" style={styles.fontName}>{item.name}</AppText>
                    <Text style={[styles.fontSample, { fontFamily: item.family }]}>
                      میراث اسلام — اسلامي علمي کتابتون
                    </Text>
                  </View>
                  <AppText tone="heading" style={styles.fontCheck}>
                    {fontFamily === item.family ? '✓' : '○'}
                  </AppText>
                </TouchableOpacity>
              ))}
              <AppText style={styles.hint}>
                د نستعلیق او نورو ځانګړو فونټونو لپاره باید د فونټ فایلونه جلا اپ ته اضافه شي.
              </AppText>
            </View>

            <View style={styles.panel}>
              <AppText tone="heading" style={styles.panelTitle}>🎨 د لیکنو رنګونه</AppText>
              {colorPicker('د عادي لیکنو رنګ', textColor, setTextColor)}
              {colorPicker('د سرلیکونو رنګ', headingColor, setHeadingColor)}
              {colorPicker('د خبرتیاوو رنګ', reminderColor, setReminderColor)}
              <AppText style={styles.hint}>ستاسو انتخابونه په موبایل کې خوندي کېږي.</AppText>
            </View>

            <View style={styles.panel}>
              <AppText tone="heading" style={styles.panelTitle}>🕌 {tr('prayer')}</AppText>
              {[
                ['فجر', 'fajr'], ['ظهر', 'dhuhr'], ['عصر', 'asr'],
                ['مغرب', 'maghrib'], ['عشاء', 'isha'],
              ].map(([name, id]) => (
                <View key={id}>
                  <AppText tone="heading" style={styles.label}>{name}</AppText>
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
                وختونه لاسي دي؛ دا برخه د لمانځه اتومات حساب نه کوي.
              </AppText>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={back}>
              <Text style={styles.addText}>تنظیمات خوندي دي — بېرته لاړ شئ</Text>
            </TouchableOpacity>
          </View>
        )}

        {screen === 'reminders' && (
          <View>
            <AppText tone="heading" style={styles.heading}>🔔 د بیانونو خبرتیاوې</AppText>
            <View style={styles.panel}>
              <AppText tone="heading" style={styles.panelTitle}>نوې خبرتیا جوړه کړئ</AppText>
              <AppText tone="heading" style={styles.label}>د بیان یا درس نوم</AppText>
              <TextInput
                style={[styles.input, { fontFamily }]}
                value={reminderTitle}
                onChangeText={setReminderTitle}
                placeholder="د بیان نوم ولیکئ"
                textAlign="right"
              />
              <AppText tone="heading" style={styles.label}>نېټه — کال-میاشت-ورځ</AppText>
              <TextInput
                style={[styles.input, { fontFamily }]}
                value={reminderDate}
                onChangeText={setReminderDate}
                placeholder="2026-12-25"
                keyboardType="numbers-and-punctuation"
              />
              <AppText tone="heading" style={styles.label}>وخت — ساعت:دقیقې</AppText>
              <TextInput
                style={[styles.input, { fontFamily }]}
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="18:30"
                keyboardType="numbers-and-punctuation"
              />
              <TouchableOpacity style={styles.addButton} onPress={addReminder}>
                <Text style={styles.addText}>＋ خبرتیا جوړه او خوندي کړه</Text>
              </TouchableOpacity>
              <AppText style={styles.hint}>
                بېلګه: نېټه 2026-12-25 او وخت 18:30 ولیکئ.
              </AppText>
            </View>

            <AppText tone="heading" style={styles.sectionTitle}>ستاسو خبرتیاوې</AppText>
            {reminders.length === 0 ? (
              <AppText style={styles.empty}>تر اوسه خبرتیا نه ده جوړه شوې.</AppText>
            ) : reminders.map(item => (
              <View key={item.id} style={styles.reminderCard}>
                <View style={{ flex: 1 }}>
                  <AppText tone="reminder" style={styles.reminderTitle}>
                    🔔 {item.title}
                  </AppText>
                  <AppText style={styles.sub}>
                    {new Date(item.date).toLocaleString()}
                  </AppText>
                </View>
                <TouchableOpacity onPress={() => deleteReminder(item)}>
                  <Text style={styles.delete}>حذف</Text>
                </TouchableOpacity>
              </View>
            ))}
            <AppText style={styles.hint}>
              یادونه: د خبرتیا د ښکاره کېدو لپاره د موبایل خبرتیاوې اجازه ولري.
              د Android د بیټرۍ محدودیتونه کله ناکله خبرتیا ځنډولی شي.
            </AppText>
          </View>
        )}

        {screen === 'notes' && (
          <View>
            <AppText tone="heading" style={styles.heading}>📝 زما خوندي شوي نوټونه</AppText>
            {Object.entries(notes).filter(([, value]) =>
              value && value.trim()
            ).length === 0 ? (
              <AppText style={styles.empty}>تر اوسه کوم نوټ نه دی ساتل شوی.</AppText>
            ) : Object.entries(notes)
              .filter(([, value]) => value && value.trim())
              .map(([id, value]) => (
                <View key={id} style={styles.noteCard}>
                  <TouchableOpacity style={{ flex: 1 }}
                    onPress={() => openNote(id, 'خوندي شوی نوټ')}>
                    <AppText tone="heading" style={styles.cardTitle}>📝 یادښت</AppText>
                    <AppText style={styles.sub} numberOfLines={3}>{value}</AppText>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteNote(id)}>
                    <Text style={styles.delete}>حذف</Text>
                  </TouchableOpacity>
                </View>
              ))}
          </View>
        )}

        {screen === 'note' && noteTarget && (
          <View style={styles.panel}>
            <AppText tone="heading" style={styles.heading}>📝 نوټ لیکل</AppText>
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
              <Text style={styles.addText}>💾 نوټ خوندي کړه</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.smallButton}
              onPress={() => shareText(noteTarget.title, noteText)}>
              <Text style={styles.addText}>↗️ نوټ شریک کړه</Text>
            </TouchableOpacity>
          </View>
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
  topActions: {
    flexDirection: 'row', justifyContent: 'space-around', padding: 7,
  },
  topButton: {
    backgroundColor: '#B99545', padding: 9, borderRadius: 9,
    marginHorizontal: 3, flex: 1, alignItems: 'center',
  },
  topButtonText: { color: '#07130F', fontWeight: 'bold', fontSize: 11 },
  back: { padding: 10, alignItems: 'flex-end' },
  backText: { fontSize: 15 },
  content: { padding: 14, paddingBottom: 35 },
  heading: {
    fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 12,
  },
  description: {
    color: '#B9C9BE', textAlign: 'center', fontSize: 13, marginBottom: 15,
  },
  welcome: {
    backgroundColor: '#10271E', borderRadius: 17, padding: 17,
    borderWidth: 1, borderColor: '#806B3C', marginBottom: 12,
  },
  welcomeTitle: {
    color: '#E5C36B', fontSize: 30, fontWeight: 'bold',
    textAlign: 'center', marginTop: 7,
  },
  welcomeSub: {
    color: '#C6CDBF', fontSize: 12, textAlign: 'center', marginTop: 7,
  },
  eyebrow: { fontSize: 11, textAlign: 'center' },
  prayerPanel: {
    backgroundColor: '#10271E', borderWidth: 1, borderColor: '#806B3C',
    borderRadius: 13, padding: 11, marginBottom: 12,
  },
  prayerTitle: { fontSize: 15, fontWeight: 'bold', textAlign: 'center', marginBottom: 9 },
  prayerItem: {
    backgroundColor: '#1B392A', borderWidth: 1, borderColor: '#806B3C',
    borderRadius: 9, paddingVertical: 9, paddingHorizontal: 13,
    marginHorizontal: 4, minWidth: 65, alignItems: 'center',
  },
  prayerName: { fontSize: 12 },
  prayerTime: { fontSize: 15, fontWeight: 'bold', marginTop: 4 },
  mainLibrary: {
    backgroundColor: '#122D21', borderWidth: 1.5, borderColor: '#B99545',
    borderRadius: 18, padding: 17, marginBottom: 12,
  },
  mainTitle: {
    fontSize: 21, fontWeight: 'bold', textAlign: 'center', marginTop: 8,
  },
  mainSub: { color: '#B9C9BE', fontSize: 11, textAlign: 'center', marginTop: 7 },
  openLibrary: {
    color: '#07130F', backgroundColor: '#D7B65E', textAlign: 'center',
    padding: 11, borderRadius: 9, marginTop: 14, fontWeight: 'bold',
  },
  featureGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
  },
  featureCard: {
    width: '48.5%', backgroundColor: '#17291F', borderRadius: 13,
    borderWidth: 1, borderColor: '#665735', padding: 12,
    marginBottom: 10, minHeight: 105, alignItems: 'center',
  },
  featureIcon: { fontSize: 23 },
  featureTitle: { fontSize: 13, fontWeight: 'bold', textAlign: 'center', marginTop: 7 },
  featureSub: { color: '#B9C9BE', fontSize: 10, textAlign: 'center', marginTop: 4 },
  panel: {
    backgroundColor: '#10271E', borderRadius: 13, padding: 14,
    borderWidth: 1, borderColor: '#806B3C', marginBottom: 14,
  },
  panelTitle: { fontSize: 17, fontWeight: 'bold', textAlign: 'right', marginBottom: 10 },
  card: {
    backgroundColor: '#10271E', borderWidth: 1, borderColor: '#806B3C',
    borderRadius: 12, padding: 16, marginBottom: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', textAlign: 'right' },
  sub: { color: '#AAB9AE', fontSize: 12, textAlign: 'right', marginTop: 6 },
  arrow: { fontSize: 17, marginTop: 5 },
  scholarTile: {
    backgroundColor: '#1B392A', borderRadius: 12, borderWidth: 1,
    borderColor: '#806B3C', padding: 13, marginTop: 10,
  },
  scholarNumber: { fontSize: 11, textAlign: 'left' },
  scholarName: { fontSize: 13, fontWeight: 'bold', textAlign: 'right', marginTop: 7 },
  scholarOpen: { fontSize: 11, textAlign: 'right', marginTop: 7 },
  searchInput: {
    backgroundColor: '#F1F0E8', color: '#17231C',
    borderRadius: 10, padding: 11, fontSize: 13,
  },
  addBox: {
    backgroundColor: '#10271E', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#806B3C', marginBottom: 14,
  },
  label: { fontSize: 14, textAlign: 'right', marginBottom: 8, marginTop: 8 },
  input: {
    backgroundColor: '#F1F0E8', color: '#17231C',
    borderRadius: 8, padding: 11, fontSize: 14,
  },
  noteInput: { minHeight: 180, textAlignVertical: 'top' },
  addButton: {
    backgroundColor: '#B99545', borderRadius: 8, padding: 12,
    marginTop: 10, alignItems: 'center',
  },
  addText: { color: '#102016', fontSize: 13, fontWeight: 'bold' },
  smallButton: {
    backgroundColor: '#806B3C', borderRadius: 8, padding: 10,
    marginTop: 8, alignItems: 'center',
  },
  sectionTitle: { fontSize: 17, textAlign: 'right', marginBottom: 12, marginTop: 12 },
  empty: { color: '#B9C9BE', textAlign: 'center', padding: 10, fontSize: 13 },
  hint: { color: '#AAB9AE', fontSize: 11, textAlign: 'right', marginVertical: 7 },
  languageGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  languageChip: {
    width: '48.5%', backgroundColor: '#1C392A', borderWidth: 1,
    borderColor: '#665735', borderRadius: 9, padding: 11,
    marginBottom: 8, alignItems: 'center',
  },
  selectedChip: { backgroundColor: '#B99545', borderColor: '#E5C36B' },
  languageText: { color: '#F0DDB2', fontSize: 13, fontWeight: 'bold' },
  selectedText: { color: '#102016' },
  fontOption: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A3528',
    borderRadius: 9, borderWidth: 1, borderColor: '#435340',
    padding: 10, marginBottom: 8,
  },
  fontSelected: { borderColor: '#E5C36B', backgroundColor: '#2B3C29' },
  fontName: { fontSize: 11, textAlign: 'right' },
  fontSample: { color: '#F0D58A', fontSize: 17, textAlign: 'right', marginTop: 4 },
  fontCheck: { fontSize: 22, paddingHorizontal: 8 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end' },
  colorCircle: {
    width: 32, height: 32, borderRadius: 16, margin: 5,
    borderWidth: 1, borderColor: '#B9C9BE', alignItems: 'center', justifyContent: 'center',
  },
  colorSelected: { borderWidth: 3, borderColor: '#FFFFFF' },
  colorTick: { color: '#07130F', fontWeight: 'bold' },
  bookRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#10271E',
    borderRadius: 10, borderWidth: 1, borderColor: '#806B3C',
    padding: 11, marginBottom: 10,
  },
  actionText: { fontSize: 12, padding: 5 },
  delete: { color: '#FF8A80', fontSize: 12, padding: 6 },
  chapterBox: {
    backgroundColor: '#10271E', borderRadius: 12, borderWidth: 1,
    borderColor: '#806B3C', padding: 13, marginBottom: 14,
  },
  chapterTitle: { fontSize: 17, fontWeight: 'bold', textAlign: 'right', marginBottom: 8 },
  babBox: { backgroundColor: '#18352A', borderRadius: 9, padding: 11, marginTop: 12 },
  babTitle: { fontSize: 15, fontWeight: 'bold', textAlign: 'right' },
  lesson: {
    textAlign: 'right', padding: 9,
    borderBottomWidth: 1, borderBottomColor: '#52685A',
  },
  lessonRow: {
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#52685A',
  },
  inlineActions: { flexDirection: 'row', marginBottom: 12 },
  noteCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#10271E',
    borderWidth: 1, borderColor: '#806B3C', borderRadius: 10,
    padding: 12, marginBottom: 10,
  },
  reminderCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#10271E',
    borderWidth: 1, borderColor: '#806B3C', borderRadius: 11,
    padding: 12, marginBottom: 9,
  },
  reminderTitle: { fontSize: 14, fontWeight: 'bold', textAlign: 'right' },
  footer: {
    padding: 12, borderTopWidth: 1, borderTopColor: '#806B3C',
    alignItems: 'center',
  },
  footerText: { color: '#B99545', fontSize: 12 },
});
