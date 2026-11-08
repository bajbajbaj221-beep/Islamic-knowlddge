 import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, Alert, Share, Switch,
  Platform, ActivityIndicator
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';

import {
  PrayerTimes,
  Coordinates,
  CalculationMethod,
  Madhab
} from 'adhan';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

const COLORS = {
  background: '#101713',
  card: '#1B2921',
  card2: '#24352A',
  gold: '#D6B56D',
  goldLight: '#F0DDAA',
  green: '#315C43',
  white: '#F5F0E4',
  muted: '#B9B6A9',
  red: '#B85C50',
  border: '#526044'
};

const SCHOLARS = [
  'شیخ القرآن علامه سید عبدالسلام رستمي رحمه الله',
  'شیخ القرآن أبو محمد أمين الله البشاوري حفظه الله',
  'شیخ القرآن أبو محمد سردارولي ثاقب رحمه الله',
  'شیخ القرآن أبو عبيدالله متوكل رحمه الله',
  'شیخ القرآن أبو عمر عبدالمنان محمدي حفظه الله'
];

const SECTIONS = [
  'د قرآن کریم زده کړې',
  'د احادیثو زده کړې',
  'تاریخ او سیرت',
  'اسلامي علوم او فنون',
  'سوالونه او ځوابونه',
  'عمومي درسونه او کتابونه'
];

const LANGUAGES = ['پښتو', 'عربي', 'اردو', 'فارسي', 'English'];

const CALC_METHODS = [
  { label: 'ام القری', value: 'UmmAlQura' },
  { label: 'کراچۍ', value: 'Karachi' },
  { label: 'مسلم ورلډ لیګ', value: 'MuslimWorldLeague' },
  { label: 'مصري طریقه', value: 'Egyptian' },
  { label: 'شمالي امریکا ISNA', value: 'NorthAmerica' }
];

const DEFAULT_SETTINGS = {
  language: 'پښتو',
  fontFamily: 'sans-serif',
  headingColor: COLORS.goldLight,
  textColor: COLORS.white,
  calculationMethod: 'UmmAlQura',
  madhab: 'Hanafi',
  prayerAdjustments: {
    fajr: 0, sunrise: 0, dhuhr: 0,
    asr: 0, maghrib: 0, isha: 0
  },
  latitude: null,
  longitude: null,
  city: '',
  notificationsEnabled: false
};

const STORAGE = {
  settings: 'app_settings',
  books: 'library_books',
  notes: 'library_notes',
  global: 'global_library',
  reminders: 'lesson_reminders',
  adhkar: 'adhkar_data',
  favorites: 'library_favorites'
};

const makeId = () =>
  Date.now().toString() + Math.random().toString(36).slice(2, 7);

export default function App() {
  const [screen, setScreen] = useState('home');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const [books, setBooks] = useState({});
  const [notes, setNotes] = useState([]);
  const [globalItems, setGlobalItems] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [adhkar, setAdhkar] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [ready, setReady] = useState(false);
  const [loadingPrayer, setLoadingPrayer] = useState(false);

  const [selectedScholar, setSelectedScholar] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDhikr, setSelectedDhikr] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formText, setFormText] = useState('');
  const [formTranslation, setFormTranslation] = useState('');
  const [formSource, setFormSource] = useState('');
  const [formCount, setFormCount] = useState('3');
  const [formScholar, setFormScholar] = useState(SCHOLARS[1]);
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formAudio, setFormAudio] = useState('');
  const [formCategory, setFormCategory] = useState('قرآن');
  const [formFolder, setFormFolder] = useState('Lessons');

  const [prayerTimes, setPrayerTimes] = useState(null);
  const [prayerDate, setPrayerDate] = useState('');

  // Load all saved information without deleting old library data.
  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      const [
        oldSettings, oldBooks, oldNotes, savedGlobal,
        savedReminders, savedAdhkar, savedFavorites
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE.settings),
        AsyncStorage.getItem(STORAGE.books),
        AsyncStorage.getItem(STORAGE.notes),
        AsyncStorage.getItem(STORAGE.global),
        AsyncStorage.getItem(STORAGE.reminders),
        AsyncStorage.getItem(STORAGE.adhkar),
        AsyncStorage.getItem(STORAGE.favorites)
      ]);

      if (oldSettings) {
        const parsed = JSON.parse(oldSettings);
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
          prayerAdjustments: {
            ...DEFAULT_SETTINGS.prayerAdjustments,
            ...(parsed.prayerAdjustments || {})
          }
        });
        if (parsed.prayerTimes) setPrayerTimes(parsed.prayerTimes);
      }

      if (oldBooks) setBooks(JSON.parse(oldBooks));
      if (oldNotes) setNotes(JSON.parse(oldNotes));
      if (savedGlobal) setGlobalItems(JSON.parse(savedGlobal));
      if (savedReminders) setReminders(JSON.parse(savedReminders));
      if (savedAdhkar) setAdhkar(JSON.parse(savedAdhkar));
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    } catch (error) {
      Alert.alert('خبرتیا', 'د معلوماتو د لوستلو پر مهال ستونزه رامنځته شوه.');
    } finally {
      setReady(true);
    }
  }

  useEffect(() => {
    if (!ready) return;
    saveData(STORAGE.settings, settings);
  }, [settings, ready]);

  useEffect(() => {
    if (!ready) return;
    saveData(STORAGE.books, books);
  }, [books, ready]);

  useEffect(() => {
    if (!ready) return;
    saveData(STORAGE.notes, notes);
  }, [notes, ready]);

  useEffect(() => {
    if (!ready) return;
    saveData(STORAGE.global, globalItems);
  }, [globalItems, ready]);

  useEffect(() => {
    if (!ready) return;
    saveData(STORAGE.reminders, reminders);
  }, [reminders, ready]);

  useEffect(() => {
    if (!ready) return;
    saveData(STORAGE.adhkar, adhkar);
  }, [adhkar, ready]);

  useEffect(() => {
    if (!ready) return;
    saveData(STORAGE.favorites, favorites);
  }, [favorites, ready]);

  async function saveData(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      Alert.alert('ستونزه', 'معلومات خوندي نه شول.');
    }
  }

  function updateSetting(name, value) {
    setSettings(old => ({ ...old, [name]: value }));
  }

  function goBack() {
    if (screen === 'home') return;

    const parents = {
      settings: 'home',
      scholars: 'home',
      scholar: 'scholars',
      oldCategory: 'scholar',
      oldBook: 'oldCategory',
      section: 'home',
      sectionFolder: 'section',
      itemDetails: 'sectionFolder',
      notes: 'home',
      noteEditor: 'notes',
      reminders: 'home',
      reminderEditor: 'reminders',
      adhkarHome: 'home',
      adhkarFolder: 'adhkarHome',
      dhikrDetails: 'adhkarFolder',
      dhikrEditor: 'adhkarFolder',
      prayer: 'home',
      search: 'home',
      favorites: 'home'
    };

    setScreen(parents[screen] || 'home');
  }

  function header(title) {
    return (
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backText}>‹ شاته</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
    );
  }

  function card(title, subtitle, onPress, icon = '✦') {
    return (
      <TouchableOpacity
        key={title}
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.cardIcon}>{icon}</Text>
        <View style={styles.cardWords}>
          <Text style={styles.cardTitle}>{title}</Text>
          {!!subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
        </View>
        <Text style={styles.arrow}>‹</Text>
      </TouchableOpacity>
    );
  }

  function smallButton(label, onPress, color = COLORS.green) {
    return (
      <TouchableOpacity
        style={[styles.smallButton, { backgroundColor: color }]}
        onPress={onPress}
      >
        <Text style={styles.smallButtonText}>{label}</Text>
      </TouchableOpacity>
    );
  }

  function field(label, value, onChangeText, placeholder = '') {
    return (
      <View style={styles.fieldBox}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.muted}
          style={styles.input}
          multiline
          textAlignVertical="top"
        />
      </View>
    );
  }

  function openScholar(scholar) {
    setSelectedScholar(scholar);
    setScreen('scholar');
  }

  function openSection(section) {
    setSelectedSection(section);
    setScreen('section');
  }

  function openGlobalFolder(folder) {
    setSelectedFolder(folder);
    setScreen('sectionFolder');
  }

  function getSectionItems(section, folder) {
    return globalItems.filter(item =>
      item.section === section && item.folder === folder
    );
  }

  function addGlobalItem() {
    if (!formTitle.trim()) {
      Alert.alert('خبرتیا', 'د کتاب یا درس نوم ولیکه.');
      return;
    }

    const item = {
      id: makeId(),
      title: formTitle.trim(),
      text: formText,
      section: selectedSection,
      folder: selectedFolder,
      scholar: formScholar,
      audio: formAudio,
      createdAt: new Date().toISOString()
    };

    setGlobalItems(old => [item, ...old]);
    clearForm();
    Alert.alert('بریالی شو', 'معلومات په کتابتون کې ثبت شول.');
  }

  function clearForm() {
    setFormTitle('');
    setFormText('');
    setFormTranslation('');
    setFormSource('');
    setFormCount('3');
    setFormDate('');
    setFormTime('');
    setFormAudio('');
  }

  function deleteGlobalItem(id) {
    Alert.alert('حذف کول', 'ایا دا معلومات حذف کړې؟', [
      { text: 'نه', style: 'cancel' },
      {
        text: 'هو، حذف یې کړه',
        style: 'destructive',
        onPress: () => {
          setGlobalItems(old => old.filter(item => item.id !== id));
          setScreen('sectionFolder');
        }
      }
    ]);
  }

  function addNote() {
    if (!formTitle.trim() && !formText.trim()) {
      Alert.alert('خبرتیا', 'د یادښت متن ولیکه.');
      return;
    }

    const note = {
      id: makeId(),
      title: formTitle || 'بې نومه یادښت',
      text: formText,
      date: new Date().toLocaleString()
    };

    setNotes(old => [note, ...old]);
    clearForm();
    setScreen('notes');
  }

  function deleteNote(id) {
    Alert.alert('حذف کول', 'دا یادښت حذف شي؟', [
      { text: 'نه', style: 'cancel' },
      {
        text: 'هو',
        style: 'destructive',
        onPress: () => setNotes(old => old.filter(n => n.id !== id))
      }
    ]);
  }

  async function shareText(title, text) {
    try {
      await Share.share({ title, message: `${title}\n\n${text || ''}` });
    } catch (error) {
      Alert.alert('ستونزه', 'شریکول ترسره نه شول.');
    }
  }

  async function pickAudio() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true
      });
      if (!result.canceled && result.assets?.length) {
        setFormAudio(result.assets[0].uri);
        Alert.alert('غږیز فایل', 'فایل وټاکل شو.');
      }
    } catch (error) {
      Alert.alert('ستونزه', 'غږیز فایل نه شو ټاکل کېدای.');
    }
  }

  async function pickPDF() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true
      });
      if (!result.canceled && result.assets?.length) {
        const asset = result.assets[0];
        setFormText(old => `${old}\n\nPDF: ${asset.name}\n${asset.uri}`);
        Alert.alert('PDF', 'د PDF فایل پته د معلوماتو سره ثبت شوه.');
      }
    } catch (error) {
      Alert.alert('ستونزه', 'PDF فایل نه شو ټاکل کېدای.');
    }
  }

  async function shareFile(uri) {
    if (!uri) {
      Alert.alert('خبرتیا', 'د شریکولو لپاره فایل نشته.');
      return;
    }
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('خبرتیا', 'په دې وسیله کې د فایل شریکول فعال نه دي.');
      }
    } catch (error) {
      Alert.alert('ستونزه', 'فایل شریک نه شو.');
    }
  }

  // Prayer time calculation using the selected method and madhhab.
  function getCalculationParameters() {
    switch (settings.calculationMethod) {
      case 'Karachi':
        return CalculationMethod.Karachi();
      case 'MuslimWorldLeague':
        return CalculationMethod.MuslimWorldLeague();
      case 'Egyptian':
        return CalculationMethod.Egyptian();
      case 'NorthAmerica':
        return CalculationMethod.NorthAmerica();
      case 'UmmAlQura':
      default:
        return CalculationMethod.UmmAlQura();
    }
  }

  function formatTime(date, adjustment = 0) {
    if (!date) return '--:--';
    const adjusted = new Date(date.getTime() + adjustment * 60000);
    return adjusted.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async function calculatePrayerTimes() {
    setLoadingPrayer(true);
    try {
      let latitude = settings.latitude;
      let longitude = settings.longitude;

      if (latitude == null || longitude == null) {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
          Alert.alert(
            'د ځای اجازه',
            'د لمانځه د وختونو لپاره د موبایل د موقعیت اجازه ورکړه.'
          );
          setLoadingPrayer(false);
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });

        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

        updateSetting('latitude', latitude);
        updateSetting('longitude', longitude);
      }

      const coordinates = new Coordinates(latitude, longitude);
      const params = getCalculationParameters();
      params.madhab = settings.madhab === 'Hanafi'
        ? Madhab.Hanafi
        : Madhab.Shafi;

      const today = new Date();
      const times = new PrayerTimes(coordinates, today, params);

      const adjustments = settings.prayerAdjustments || {};

      const result = {
        fajr: formatTime(times.fajr, adjustments.fajr),
        sunrise: formatTime(times.sunrise, adjustments.sunrise),
        dhuhr: formatTime(times.dhuhr, adjustments.dhuhr),
        asr: formatTime(times.asr, adjustments.asr),
        maghrib: formatTime(times.maghrib, adjustments.maghrib),
        isha: formatTime(times.isha, adjustments.isha)
      };

      setPrayerTimes(result);
      setPrayerDate(today.toLocaleDateString());
      updateSetting('prayerTimes', result);
      Alert.alert('بریالي شو', 'د لمانځه وختونه تازه شول.');
    } catch (error) {
      Alert.alert(
        'د وختونو ستونزه',
        'وختونه محاسبه نه شول. د موقعیت اجازه او تنظیمات وګوره.'
      );
    } finally {
      setLoadingPrayer(false);
    }
  }

  function updatePrayerAdjustment(name, value) {
    const number = parseInt(value, 10);
    setSettings(old => ({
      ...old,
      prayerAdjustments: {
        ...old.prayerAdjustments,
        [name]: Number.isNaN(number) ? 0 : number
      }
    }));
  }

  async function enableNotifications() {
    try {
      const permission = await Notifications.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('اجازه', 'د خبرتیاوو اجازه فعاله نه شوه.');
        return false;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('lessons', {
          name: 'د درسونو خبرتیاوې',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default'
        });
      }

      updateSetting('notificationsEnabled', true);
      return true;
    } catch (error) {
      Alert.alert('ستونزه', 'خبرتیاوې فعالې نه شوې.');
      return false;
    }
  }

  async function addReminder() {
    if (!formTitle.trim() || !formDate.trim() || !formTime.trim()) {
      Alert.alert(
        'نا بشپړ معلومات',
        'د درس نوم، نېټه او وخت ولیکه. د نېټې بڼه: 2026-12-25 او وخت: 18:30'
      );
      return;
    }

    const date = new Date(`${formDate}T${formTime}:00`);
    if (Number.isNaN(date.getTime()) || date <= new Date()) {
      Alert.alert('ناسم وخت', 'راتلونکې سمه نېټه او وخت ولیکه.');
      return;
    }

    const permitted = await enableNotifications();
    if (!permitted) return;

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'د درس یادونه: ' + formTitle,
          body: formText || 'ستاسو د درس وخت راورسېد.',
          sound: 'default'
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date
        }
      });

      const reminder = {
        id: makeId(),
        title: formTitle,
        text: formText,
        date: formDate,
        time: formTime,
        notificationId
      };

      setReminders(old => [reminder, ...old]);
      clearForm();
      setScreen('reminders');
      Alert.alert('بریالي شو', 'د درس خبرتیا ثبت شوه.');
    } catch (error) {
      Alert.alert('ستونزه', 'خبرتیا ثبت نه شوه.');
    }
  }

  function deleteReminder(reminder) {
    Alert.alert('حذف کول', 'دا خبرتیا حذف شي؟', [
      { text: 'نه', style: 'cancel' },
      {
        text: 'هو',
        style: 'destructive',
        onPress: async () => {
          if (reminder.notificationId) {
            try {
              await Notifications.cancelScheduledNotificationAsync(
                reminder.notificationId
              );
            } catch (error) {}
          }
          setReminders(old => old.filter(item => item.id !== reminder.id));
        }
      }
    ]);
  }

  function addDhikr() {
    if (!formTitle.trim() || !formText.trim()) {
      Alert.alert('خبرتیا', 'د دعا نوم او عربي متن ولیکه.');
      return;
    }

    const item = {
      id: makeId(),
      folder: selectedFolder || 'سهار',
      title: formTitle,
      arabic: formText,
      translation: formTranslation,
      source: formSource,
      count: Math.max(1, parseInt(formCount, 10) || 1),
      audio: formAudio
    };

    setAdhkar(old => [item, ...old]);
    clearForm();
    setScreen('adhkarFolder');
    Alert.alert('بریالي شو', 'ذکر ثبت شو.');
  }

  function deleteDhikr(id) {
    Alert.alert('حذف کول', 'دا ذکر حذف شي؟', [
      { text: 'نه', style: 'cancel' },
      {
        text: 'هو',
        style: 'destructive',
        onPress: () => {
          setAdhkar(old => old.filter(item => item.id !== id));
          setScreen('adhkarFolder');
        }
      }
    ]);
  }

  function toggleFavorite(item) {
    const exists = favorites.some(f => f.id === item.id);
    setFavorites(old =>
      exists
        ? old.filter(f => f.id !== item.id)
        : [...old, item]
    );
  }

  function isFavorite(id) {
    return favorites.some(item => item.id === id);
  }

  // Existing scholar library data is retained under its original storage key.
  const oldKey = selectedScholar && selectedSection
    ? `${selectedScholar}|${selectedSection}`
    : '';

  const oldBooksForCategory = books[oldKey] || [];

  function addOldBook() {
    if (!formTitle.trim()) {
      Alert.alert('خبرتیا', 'د کتاب نوم ولیکه.');
      return;
    }

    const newBook = {
      id: makeId(),
      title: formTitle,
      chapters: [],
      pdf: ''
    };

    setBooks(old => ({
      ...old,
      [oldKey]: [...(old[oldKey] || []), newBook]
    }));

    clearForm();
  }

  function deleteOldBook(bookId) {
    Alert.alert('حذف کول', 'دا کتاب حذف شي؟', [
      { text: 'نه', style: 'cancel' },
      {
        text: 'هو',
        style: 'destructive',
        onPress: () => {
          setBooks(old => ({
            ...old,
            [oldKey]: (old[oldKey] || []).filter(b => b.id !== bookId)
          }))
        }
      }
    ]);
  }

  function addOldChapter(bookId, chapterTitle) {
    if (!chapterTitle.trim()) return;

    setBooks(old => ({
      ...old,
      [oldKey]: (old[oldKey] || []).map(book =>
        book.id === bookId
          ? {
              ...book,
              chapters: [
                ...(book.chapters || []),
                { id: makeId(), title: chapterTitle, lessons: [] }
              ]
            }
          : book
      )
    }));
  }

  function addOldLesson(bookId, chapterId, lessonTitle) {
    if (!lessonTitle.trim()) return;

    setBooks(old => ({
      ...old,
      [oldKey]: (old[oldKey] || []).map(book =>
        book.id === bookId
          ? {
              ...book,
              chapters: (book.chapters || []).map(chapter =>
                chapter.id === chapterId
                  ? {
                      ...chapter,
                      lessons: [
                        ...(chapter.lessons || []),
                        { id: makeId(), title: lessonTitle }
                      ]
                    }
                  : chapter
              )
            }
          : book
      )
    }));
  }
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="light-content" />

      {!ready ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>مهرباني وکړئ، اپلیکیشن چمتو کېږي...</Text>
        </View>
      ) : (
        <>
          {screen !== 'home' && header(
            screen === 'settings' ? 'تنظیمات' :
            screen === 'scholars' ? 'د علماوو کتابتون' :
            screen === 'scholar' ? 'د عالم کتابتون' :
            screen === 'oldCategory' ? selectedSection :
            screen === 'oldBook' ? (selectedItem?.title || 'کتاب') :
            screen === 'section' ? selectedSection :
            screen === 'sectionFolder' ? selectedFolder :
            screen === 'itemDetails' ? (selectedItem?.title || 'معلومات') :
            screen === 'notes' ? 'زما یادښتونه' :
            screen === 'noteEditor' ? 'نوی یادښت' :
            screen === 'reminders' ? 'د درسونو خبرتیاوې' :
            screen === 'reminderEditor' ? 'نوې خبرتیا' :
            screen === 'adhkarHome' ? 'اذکار' :
            screen === 'adhkarFolder' ? selectedFolder :
            screen === 'dhikrDetails' ? (selectedDhikr?.title || 'ذکر') :
            screen === 'dhikrEditor' ? 'نوی ذکر' :
            screen === 'prayer' ? 'د لمانځه وختونه' :
            screen === 'search' ? 'لټون' :
            screen === 'favorites' ? 'خوښې شوې برخې' : 'میراث اسلام'
          )}

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >

            {/* HOME */}
            {screen === 'home' && (
              <>
                <View style={styles.hero}>
                  <Text style={styles.logo}>میراث اسلام</Text>
                  <Text style={styles.heroSubtitle}>اسلامي علمي کتابتون</Text>
                  <Text style={styles.heroLine}>
                    د قرآن، حدیث، سیرت او اسلامي علومو خزانه
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.searchBox}
                  onPress={() => setScreen('search')}
                >
                  <Text style={styles.searchPlaceholder}>⌕  کتابونه، درسونه او علما ولټوه...</Text>
                </TouchableOpacity>

                <Text style={styles.sectionHeading}>اصلي برخې</Text>

                {card('د علماوو کتابتون', 'د پنځو علماوو علمي آثار او درسونه', () => setScreen('scholars'), '۞')}
                {card('قرآن کریم', 'تفسیر، ترجمه، کتابونه او درسونه', () => openSection(SECTIONS[0]), '﷽')}
                {card('حدیث شریف', 'د احادیثو کتابونه او درسونه', () => openSection(SECTIONS[1]), '۞')}
                {card('تاریخ او سیرت', 'د انبیاوو، صحابه‌وو او اسلامي تاریخ', () => openSection(SECTIONS[2]), '◈')}
                {card('اسلامي علوم او فنون', 'فقه، عقیده، اصول، نحو او نور علوم', () => openSection(SECTIONS[3]), '✧')}
                {card('سوالونه او ځوابونه', 'علمي پوښتنې او مستند ځوابونه', () => openSection(SECTIONS[4]), '؟')}
                {card('عمومي درسونه او کتابونه', 'نورې علمي لیکنې او ګټور درسونه', () => openSection(SECTIONS[5]), '▤')}

                <Text style={styles.sectionHeading}>شخصي او ورځني خدمتونه</Text>
                {card('زما یادښتونه', 'خپل علمي یادښتونه وساته', () => setScreen('notes'), '✎')}
                {card('د درسونو خبرتیاوې', 'د بیانونو او درسونو وختونه وټاکه', () => setScreen('reminders'), '◷')}
                {card('سهار او ماښام اذکار', 'دعاوې، ژباړه او د حدیث تخریج', () => setScreen('adhkarHome'), '۞')}
                {card('د لمانځه وختونه', 'د خپل ځای مطابق د لمانځه وختونه', () => setScreen('prayer'), '☾')}
                {card('خوښې شوې برخې', 'خپل غوره شوي کتابونه او درسونه', () => setScreen('favorites'), '★')}
                {card('تنظیمات', 'ژبه، فونټ، رنګونه او د لمانځه طریقه', () => setScreen('settings'), '⚙')}

                <View style={styles.footer}>
                  <Text style={styles.footerTitle}>میراث اسلام</Text>
                  <Text style={styles.footerText}>الله تعالی دې دا علمي هڅه قبوله کړي</Text>
                </View>
              </>
            )}

            {/* SCHOLARS */}
            {screen === 'scholars' && (
              <>
                <Text style={styles.introText}>د عالم د کتابتون د پرانیستلو لپاره نوم وټاکه.</Text>
                {SCHOLARS.map((scholar, index) =>
                  card(scholar, `د عالم علمي آثار او درسونه`, () => openScholar(scholar), '۞')
                )}
              </>
            )}

            {screen === 'scholar' && (
              <>
                <Text style={styles.introText}>{selectedScholar}</Text>
                {[
                  'د شیخ تعارف او علمي آثار',
                  'د قرآن کریم تفسیر او ترجمه',
                  'د احادیثو درسونه',
                  'د تاریخ درسونه',
                  'د فنونو درسونه',
                  'د جمعې او عام خطبات',
                  'د سوالات او جوابات'
                ].map(category =>
                  card(category, 'کتابونه او درسونه', () => {
                    setSelectedSection(category);
                    setScreen('oldCategory');
                  }, '▤')
                )}
              </>
            )}

            {/* OLD SCHOLAR LIBRARY */}
            {screen === 'oldCategory' && (
              <>
                <Text style={styles.introText}>
                  {selectedScholar}
                </Text>
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>نوی کتاب ورزیات کړه</Text>
                  {field('د کتاب نوم', formTitle, setFormTitle, 'د کتاب نوم ولیکه')}
                  {smallButton('＋ کتاب ثبت کړه', addOldBook)}
                </View>

                {oldBooksForCategory.map(book =>
                  card(book.title, `${(book.chapters || []).length} څپرکي`, () => {
                    setSelectedItem(book);
                    setScreen('oldBook');
                  }, '▤')
                )}

                {oldBooksForCategory.length === 0 && (
                  <Text style={styles.emptyText}>تر اوسه کتاب نه دی ثبت شوی.</Text>
                )}
              </>
            )}

            {screen === 'oldBook' && selectedItem && (
              <>
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>{selectedItem.title}</Text>
                  <Text style={styles.mutedText}>د کتاب څپرکي او درسونه</Text>
                  {smallButton('＋ نوی څپرکی', () => {
                    Alert.prompt
                      ? Alert.prompt('نوی څپرکی', 'د څپرکي نوم ولیکه', value => {
                          addOldChapter(selectedItem.id, value || '');
                          setSelectedItem(old => ({
                            ...old,
                            chapters: [
                              ...(old.chapters || []),
                              { id: makeId(), title: value || '', lessons: [] }
                            ]
                          }));
                        })
                      : Alert.alert('یادونه', 'د څپرکي د نوم لپاره لاندې د کتابتون د ادارې برخه وکاروه.');
                  })}
                  {smallButton('حذف کتاب', () => deleteOldBook(selectedItem.id), COLORS.red)}
                </View>

                {(selectedItem.chapters || []).map(chapter => (
                  <View style={styles.panel} key={chapter.id}>
                    <Text style={styles.panelTitle}>{chapter.title}</Text>
                    {(chapter.lessons || []).map(lesson => (
                      <Text style={styles.listText} key={lesson.id}>• {lesson.title}</Text>
                    ))}
                    {smallButton('＋ نوی درس', () => {
                      if (Platform.OS === 'ios' && Alert.prompt) {
                        Alert.prompt('نوی درس', 'د درس نوم ولیکه', value => {
                          addOldLesson(selectedItem.id, chapter.id, value || '');
                        });
                      } else {
                        Alert.alert('یادونه', 'د دې برخې د درسونو د زیاتولو فورم په راتلونکې نسخه کې پراخېدای شي.');
                      }
                    })}
                  </View>
                ))}
              </>
            )}

            {/* GLOBAL SECTIONS */}
            {screen === 'section' && (
              <>
                <Text style={styles.introText}>
                  {selectedSection} — د ټولو علماوو ګډ علمي کتابتون
                </Text>
                {card('کتابونه', 'تفسیرونه، ژباړې، PDF او نور کتابونه', () => {
                  setSelectedFolder('Books');
                  setScreen('sectionFolder');
                }, '▤')}
                {card('درسونه', 'غږیز او لیکلي درسونه د ټولو علماوو', () => {
                  setSelectedFolder('Lessons');
                  setScreen('sectionFolder');
                }, '♫')}
              </>
            )}

            {screen === 'sectionFolder' && (
              <>
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>نوی معلومات ورزیات کړه</Text>
                  {field('د کتاب یا درس نوم', formTitle, setFormTitle, 'نوم ولیکه')}
                  <Text style={styles.fieldLabel}>عالم وټاکه</Text>
                  {SCHOLARS.map(scholar => (
                    <TouchableOpacity
                      key={scholar}
                      style={[styles.choice, formScholar === scholar && styles.choiceActive]}
                      onPress={() => setFormScholar(scholar)}
                    >
                      <Text style={styles.choiceText}>
                        {formScholar === scholar ? '✓ ' : '○ '}{scholar}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {field('تفصیل، متن یا د PDF فایل پته', formText, setFormText, 'د کتاب یا درس معلومات')}
                  {smallButton('د PDF فایل ټاکل', pickPDF)}
                  {smallButton('غږیز فایل ټاکل', pickAudio)}
                  {!!formAudio && <Text style={styles.mutedText}>غږیز فایل ټاکل شوی دی.</Text>}
                  {smallButton('＋ ثبتول', addGlobalItem)}
                </View>

                <Text style={styles.sectionHeading}>ثبت شوي معلومات</Text>
                {getSectionItems(selectedSection, selectedFolder).map(item =>
                  <View key={item.id} style={styles.panel}>
                    <TouchableOpacity onPress={() => {
                      setSelectedItem(item);
                      setScreen('itemDetails');
                    }}>
                      <Text style={styles.panelTitle}>{item.title}</Text>
                      <Text style={styles.mutedText}>{item.scholar}</Text>
                    </TouchableOpacity>
                    <View style={styles.buttonRow}>
                      {smallButton('کتل', () => {
                        setSelectedItem(item);
                        setScreen('itemDetails');
                      })}
                      {smallButton('★', () => toggleFavorite(item), COLORS.card2)}
                      {smallButton('شریکول', () => shareText(item.title, item.text))}
                    </View>
                  </View>
                )}

                {getSectionItems(selectedSection, selectedFolder).length === 0 && (
                  <Text style={styles.emptyText}>تر اوسه معلومات نه دي ثبت شوي.</Text>
                )}
              </>
            )}

            {screen === 'itemDetails' && selectedItem && (
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>{selectedItem.title}</Text>
                <Text style={styles.mutedText}>لیکوال / عالم: {selectedItem.scholar}</Text>
                <Text style={styles.detailText}>{selectedItem.text || 'تفصیل نه دی لیکل شوی.'}</Text>
                <View style={styles.buttonRow}>
                  {smallButton('شریکول', () => shareText(selectedItem.title, selectedItem.text))}
                  {smallButton(
                    isFavorite(selectedItem.id) ? 'له خوښو لرې کول' : '★ خوښې ته زیاتول',
                    () => toggleFavorite(selectedItem),
                    COLORS.card2
                  )}
                  {smallButton('حذف', () => deleteGlobalItem(selectedItem.id), COLORS.red)}
                </View>
                {!!selectedItem.audio && (
                  <Text style={styles.mutedText}>
                    غږیز فایل ثبت دی؛ د غږ اورېدو ځانګړی پلیر په دې نسخه کې نشته.
                  </Text>
                )}
              </View>
            )}

            {/* NOTES */}
            {screen === 'notes' && (
              <>
                {smallButton('＋ نوی یادښت', () => {
                  clearForm();
                  setScreen('noteEditor');
                })}
                {notes.map(note => (
                  <View style={styles.panel} key={note.id}>
                    <Text style={styles.panelTitle}>{note.title}</Text>
                    <Text style={styles.detailText}>{note.text}</Text>
                    <Text style={styles.mutedText}>{note.date}</Text>
                    <View style={styles.buttonRow}>
                      {smallButton('شریکول', () => shareText(note.title, note.text))}
                      {smallButton('حذف', () => deleteNote(note.id), COLORS.red)}
                    </View>
                  </View>
                ))}
                {notes.length === 0 && <Text style={styles.emptyText}>تر اوسه یادښت نشته.</Text>}
              </>
            )}

            {screen === 'noteEditor' && (
              <View style={styles.panel}>
                {field('د یادښت سرلیک', formTitle, setFormTitle, 'سرلیک')}
                {field('د یادښت متن', formText, setFormText, 'خپل یادښت ولیکه')}
                {smallButton('یادښت خوندي کړه', addNote)}
              </View>
            )}

            {/* REMINDERS */}
            {screen === 'reminders' && (
              <>
                {smallButton('＋ نوې خبرتیا', () => {
                  clearForm();
                  setScreen('reminderEditor');
                })}
                {reminders.map(item => (
                  <View style={styles.panel} key={item.id}>
                    <Text style={styles.panelTitle}>{item.title}</Text>
                    <Text style={styles.detailText}>{item.text}</Text>
                    <Text style={styles.mutedText}>{item.date} — {item.time}</Text>
                    {smallButton('خبرتیا حذف کړه', () => deleteReminder(item), COLORS.red)}
                  </View>
                ))}
                {reminders.length === 0 && <Text style={styles.emptyText}>خبرتیا نه ده جوړه شوې.</Text>}
              </>
            )}

            {screen === 'reminderEditor' && (
              <View style={styles.panel}>
                {field('د درس نوم', formTitle, setFormTitle, 'د بیان یا درس نوم')}
                {field('د خبرتیا متن', formText, setFormText, 'اختیاري تفصیل')}
                {field('نېټه (YYYY-MM-DD)', formDate, setFormDate, '2026-12-25')}
                {field('وخت (24 ساعته)', formTime, setFormTime, '18:30')}
                {smallButton('خبرتیا ثبت کړه', addReminder)}
                <Text style={styles.mutedText}>
                  د خبرتیا لپاره د موبایل د Notifications اجازه اړینه ده.
                </Text>
              </View>
            )}

            {/* ADHKAR */}
            {screen === 'adhkarHome' && (
              <>
                {card('د سهار اذکار', 'د سهار دعاوې او اذکار', () => {
                  setSelectedFolder('سهار');
                  setScreen('adhkarFolder');
                }, '☀')}
                {card('د ماښام اذکار', 'د ماښام دعاوې او اذکار', () => {
                  setSelectedFolder('ماښام');
                  setScreen('adhkarFolder');
                }, '☾')}
              </>
            )}

            {screen === 'adhkarFolder' && (
              <>
                {smallButton('＋ نوی ذکر ورزیات کړه', () => {
                  clearForm();
                  setScreen('dhikrEditor');
                })}
                {adhkar.filter(item => item.folder === selectedFolder).map(item =>
                  card(item.title, `تکرار: ${item.count} ځله`, () => {
                    setSelectedDhikr(item);
                    setScreen('dhikrDetails');
                  }, '۞')
                )}
                {adhkar.filter(item => item.folder === selectedFolder).length === 0 && (
                  <Text style={styles.emptyText}>تر اوسه ذکر نه دی ثبت شوی.</Text>
                )}
              </>
            )}

            {screen === 'dhikrEditor' && (
              <View style={styles.panel}>
                <Text style={styles.fieldLabel}>د ذکر برخه</Text>
                <View style={styles.buttonRow}>
                  {['سهار', 'ماښام'].map(folder => (
                    <TouchableOpacity
                      key={folder}
                      style={[styles.choice, selectedFolder === folder && styles.choiceActive]}
                      onPress={() => setSelectedFolder(folder)}
                    >
                      <Text style={styles.choiceText}>{folder}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {field('د ذکر نوم', formTitle, setFormTitle, 'د ذکر نوم')}
                {field('عربي متن', formText, setFormText, 'عربي دعا ولیکه')}
                {field('پښتو ژباړه', formTranslation, setFormTranslation, 'ژباړه ولیکه')}
                {field('د حدیث تخریج او سرچینه', formSource, setFormSource, 'کتاب، حدیث شمېره او درجه')}
                {field('د تکرار شمېر', formCount, setFormCount, '۳')}
                {smallButton('غږیز فایل ټاکل', pickAudio)}
                {smallButton('ذکر خوندي کړه', addDhikr)}
              </View>
            )}

            {screen === 'dhikrDetails' && selectedDhikr && (
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>{selectedDhikr.title}</Text>
                <Text style={styles.arabicText}>{selectedDhikr.arabic}</Text>
                <Text style={styles.fieldLabel}>ژباړه</Text>
                <Text style={styles.detailText}>{selectedDhikr.translation || 'ژباړه نه ده ثبت شوې.'}</Text>
                <Text style={styles.fieldLabel}>تکرار</Text>
                <Text style={styles.detailText}>{selectedDhikr.count} ځله</Text>
                <Text style={styles.fieldLabel}>تخریج او سرچینه</Text>
                <Text style={styles.detailText}>{selectedDhikr.source || 'سرچینه نه ده ثبت شوې.'}</Text>
                <View style={styles.buttonRow}>
                  {smallButton('شریکول', () => shareText(selectedDhikr.title,
                    `${selectedDhikr.arabic}\n${selectedDhikr.translation}\n${selectedDhikr.source}`))}
                  {smallButton('حذف', () => deleteDhikr(selectedDhikr.id), COLORS.red)}
                </View>
              </View>
            )}

            {/* PRAYER TIMES */}
            {screen === 'prayer' && (
              <>
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>د لمانځه وختونه</Text>
                  <Text style={styles.mutedText}>
                    نېټه: {prayerDate || new Date().toLocaleDateString()}
                  </Text>

                  {[
                    ['فجر', 'fajr'],
                    ['لمر خاته', 'sunrise'],
                    ['ماسپښین', 'dhuhr'],
                    ['مازدیګر', 'asr'],
                    ['ماښام', 'maghrib'],
                    ['ماخوستن', 'isha']
                  ].map(([label, key]) => (
                    <View style={styles.prayerRow} key={key}>
                      <Text style={styles.prayerName}>{label}</Text>
                      <Text style={styles.prayerTime}>{prayerTimes?.[key] || '--:--'}</Text>
                    </View>
                  ))}

                  <Text style={styles.mutedText}>
                    د وختونو د تازه کولو لپاره د موبایل موقعیت ته اجازه ورکړه.
                  </Text>
                  <TouchableOpacity
                    style={styles.mainButton}
                    onPress={calculatePrayerTimes}
                    disabled={loadingPrayer}
                  >
                    {loadingPrayer
                      ? <ActivityIndicator color={COLORS.white} />
                      : <Text style={styles.mainButtonText}>د ځای له مخې وختونه تازه کړه</Text>}
                  </TouchableOpacity>
                </View>

                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>د وختونو د محاسبې طریقه</Text>
                  {CALC_METHODS.map(method => (
                    <TouchableOpacity
                      key={method.value}
                      style={[styles.choice, settings.calculationMethod === method.value && styles.choiceActive]}
                      onPress={() => updateSetting('calculationMethod', method.value)}
                    >
                      <Text style={styles.choiceText}>
                        {settings.calculationMethod === method.value ? '✓ ' : '○ '}
                        {method.label}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  <Text style={styles.fieldLabel}>د عصر د لمانځه طریقه</Text>
                  {['Hanafi', 'Shafi'].map(value => (
                    <TouchableOpacity
                      key={value}
                      style={[styles.choice, settings.madhab === value && styles.choiceActive]}
                      onPress={() => updateSetting('madhab', value)}
                    >
                      <Text style={styles.choiceText}>
                        {settings.madhab === value ? '✓ ' : '○ '}
                        {value === 'Hanafi' ? 'حنفي' : 'شافعي، مالکي او حنبلي'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>د وختونو دقیق تنظیم (+ یا - دقیقې)</Text>
                  {[
                    ['فجر', 'fajr'],
                    ['لمر خاته', 'sunrise'],
                    ['ماسپښین', 'dhuhr'],
                    ['مازدیګر', 'asr'],
                    ['ماښام', 'maghrib'],
                    ['ماخوستن', 'isha']
                  ].map(([label, key]) => (
                    <View style={styles.adjustRow} key={key}>
                      <Text style={styles.adjustLabel}>{label}</Text>
                      <TextInput
                        style={styles.adjustInput}
                        keyboardType="numeric"
                        value={String(settings.prayerAdjustments?.[key] ?? 0)}
                        onChangeText={value => updatePrayerAdjustment(key, value)}
                      />
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* SETTINGS */}
            {screen === 'settings' && (
              <>
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>د اپلیکیشن ژبه</Text>
                  {LANGUAGES.map(language => (
                    <TouchableOpacity
                      key={language}
                      style={[styles.choice, settings.language === language && styles.choiceActive]}
                      onPress={() => updateSetting('language', language)}
                    >
                      <Text style={styles.choiceText}>
                        {settings.language === language ? '✓ ' : '○ '}{language}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <Text style={styles.mutedText}>
                    یادونه: د ژبې ټاکل خوندي کېږي؛ د اپلیکیشن د ټولو لیکنو بشپړه ژباړه لا جلا کار غواړي.
                  </Text>
                </View>

                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>د لیکلو فونټ</Text>
                  {[
                    'sans-serif',
                    'serif',
                    'sans-serif-medium',
                    'sans-serif-condensed',
                    'sans-serif-light',
                    'monospace'
                  ].map(font => (
                    <TouchableOpacity
                      key={font}
                      style={[styles.choice, settings.fontFamily === font && styles.choiceActive]}
                      onPress={() => updateSetting('fontFamily', font)}
                    >
                      <Text style={[styles.choiceText, { fontFamily: font }]}>
                        {settings.fontFamily === font ? '✓ ' : '○ '}{font}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <Text style={styles.mutedText}>
                    د ځانګړو پښتو، عربي او نستعلیق فونټونو لپاره د فونټ فایلونه باید جلا اپلیکیشن ته ورزیات شي.
                  </Text>
                </View>

                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>د لیکنو رنګونه</Text>
                  {[
                    ['طلایي', '#D6B56D'],
                    ['سپین', '#F5F0E4'],
                    ['شین', '#8DBB91'],
                    ['روښانه طلایي', '#F0DDAA']
                  ].map(([label, color]) => (
                    <TouchableOpacity
                      key={color}
                      style={styles.choice}
                      onPress={() => updateSetting('textColor', color)}
                    >
                      <Text style={[styles.choiceText, { color }]}>
                        {label} {settings.textColor === color ? '✓' : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>د خبرتیاوو اجازه</Text>
                  <View style={styles.switchRow}>
                    <Text style={styles.choiceText}>خبرتیاوې فعالې کړه</Text>
                    <Switch
                      value={!!settings.notificationsEnabled}
                      onValueChange={async value => {
                        if (value) await enableNotifications();
                        else updateSetting('notificationsEnabled', false);
                      }}
                      trackColor={{ true: COLORS.green, false: COLORS.muted }}
                      thumbColor={COLORS.gold}
                    />
                  </View>
                </View>

                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>د معلوماتو ساتنه</Text>
                  <Text style={styles.mutedText}>
                    کتابونه، یادښتونه، اذکار او تنظیمات د موبایل په داخلي ذخیره کې ساتل کېږي.
                  </Text>
                </View>
              </>
            )}

            {/* SEARCH */}
            {screen === 'search' && (
              <>
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="د کتاب، درس یا عالم نوم ولیکه..."
                  placeholderTextColor={COLORS.muted}
                  style={styles.input}
                />
                {globalItems
                  .filter(item =>
                    `${item.title} ${item.text} ${item.scholar} ${item.section}`
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  )
                  .map(item =>
                    card(item.title, item.scholar, () => {
                      setSelectedItem(item);
                      setSelectedSection(item.section);
                      setSelectedFolder(item.folder);
                      setScreen('itemDetails');
                    }, '⌕')
                  )}
                {searchQuery.length > 0 && globalItems.filter(item =>
                  `${item.title} ${item.text} ${item.scholar} ${item.section}`
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                ).length === 0 && (
                  <Text style={styles.emptyText}>پایله ونه موندل شوه.</Text>
                )}
              </>
            )}

            {/* FAVORITES */}
            {screen === 'favorites' && (
              <>
                {favorites.map(item =>
                  card(item.title, item.scholar || 'خوښې شوې برخه', () => {
                    setSelectedItem(item);
                    setScreen(item.arabic ? 'dhikrDetails' : 'itemDetails');
                    if (item.arabic) setSelectedDhikr(item);
                  }, '★')
                )}
                {favorites.length === 0 && (
                  <Text style={styles.emptyText}>تر اوسه خوښې شوې برخه نشته.</Text>
                )}
              </>
            )}

          </ScrollView>

          {screen !== 'home' && (
            <TouchableOpacity style={styles.homeButton} onPress={() => setScreen('home')}>
              <Text style={styles.homeButtonText}>⌂ کورپاڼه</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scroll: {
    flex: 1
  },
  content: {
    padding: 14,
    paddingBottom: 35
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: COLORS.gold,
    marginTop: 15,
    fontSize: 16
  },
  header: {
    minHeight: 58,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14
  },
  backButton: {
    padding: 8
  },
  backText: {
    color: COLORS.gold,
    fontSize: 16
  },
  headerTitle: {
    color: COLORS.goldLight,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right'
  },
  hero: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 15
  },
  logo: {
    color: COLORS.goldLight,
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  heroSubtitle: {
    color: COLORS.gold,
    fontSize: 18,
    marginTop: 7
  },
  heroLine: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center'
  },
  searchBox: {
    backgroundColor: COLORS.card2,
    borderRadius: 12,
    padding: 15,
    marginBottom: 17,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  searchPlaceholder: {
    color: COLORS.muted,
    fontSize: 15,
    textAlign: 'right'
  },
  sectionHeading: {
    color: COLORS.gold,
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 15,
    marginBottom: 10
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 9,
    minHeight: 68
  },
  cardIcon: {
    color: COLORS.gold,
    fontSize: 24,
    width: 38,
    textAlign: 'center'
  },
  cardWords: {
    flex: 1,
    paddingHorizontal: 8
  },
  cardTitle: {
    color: COLORS.goldLight,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'right'
  },
  cardSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 5
  },
  arrow: {
    color: COLORS.gold,
    fontSize: 24
  },
  introText: {
    color: COLORS.goldLight,
    fontSize: 15,
    textAlign: 'right',
    marginBottom: 15,
    lineHeight: 25
  },
  panel: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    padding: 14,
    marginBottom: 13
  },
  panelTitle: {
    color: COLORS.goldLight,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 10
  },
  mutedText: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'right',
    marginVertical: 5,
    lineHeight: 21
  },
  detailText: {
    color: COLORS.white,
    fontSize: 15,
    textAlign: 'right',
    lineHeight: 27,
    marginVertical: 9
  },
  arabicText: {
    color: COLORS.goldLight,
    fontSize: 25,
    textAlign: 'right',
    lineHeight: 48,
    marginVertical: 15
  },
  listText: {
    color: COLORS.white,
    fontSize: 14,
    textAlign: 'right',
    paddingVertical: 6
  },
  fieldBox: {
    marginBottom: 12
  },
  fieldLabel: {
    color: COLORS.gold,
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 7,
    marginTop: 8
  },
  input: {
    backgroundColor: '#0D1510',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 9,
    padding: 12,
    color: COLORS.white,
    fontSize: 15,
    minHeight: 45,
    textAlign: 'right',
    marginBottom: 8
  },
  smallButton: {
    backgroundColor: COLORS.green,
    borderRadius: 9,
    paddingVertical: 11,
    paddingHorizontal: 13,
    marginTop: 8,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  smallButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  mainButton: {
    backgroundColor: COLORS.green,
    borderRadius: 11,
    padding: 15,
    alignItems: 'center',
    marginTop: 14
  },
  mainButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold'
  },
  choice: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 11,
    marginTop: 6,
    backgroundColor: '#152019'
  },
  choiceActive: {
    borderColor: COLORS.gold,
    backgroundColor: '#304332'
  },
  choiceText: {
    color: COLORS.white,
    textAlign: 'right',
    fontSize: 14
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 5,
    marginTop: 7
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 12
  },
  prayerName: {
    color: COLORS.white,
    fontSize: 15
  },
  prayerTime: {
    color: COLORS.goldLight,
    fontSize: 18,
    fontWeight: 'bold'
  },
  adjustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  adjustLabel: {
    color: COLORS.white,
    fontSize: 14
  },
  adjustInput: {
    backgroundColor: '#0D1510',
    color: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 7,
    minWidth: 65,
    padding: 7,
    textAlign: 'center'
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  emptyText: {
    color: COLORS.muted,
    textAlign: 'center',
    padding: 25,
    fontSize: 14
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
    padding: 20,
    marginTop: 20
  },
  footerTitle: {
    color: COLORS.gold,
    fontSize: 20,
    fontWeight: 'bold'
  },
  footerText: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 7
  },
  homeButton: {
    backgroundColor: COLORS.green,
    borderTopWidth: 1,
    borderTopColor: COLORS.gold,
    padding: 13,
    alignItems: 'center'
  },
  homeButtonText: {
    color: COLORS.goldLight,
    fontSize: 15,
    fontWeight: 'bold'
  }
});
