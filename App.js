  
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
  Switch,
  Platform,
  ActivityIndicator,
  BackHandler,
  KeyboardAvoidingView
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

// ==================================================
// 01 - د خبرتیاوو تنظیمات
// ==================================================

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

// ==================================================
// 02 - د اپلیکیشن رنګونه
// ==================================================

const COLORS = {
  background: '#101713',
  background2: '#141E18',
  card: '#1B2921',
  card2: '#24352A',
  card3: '#2B3D30',
  gold: '#D6B56D',
  goldLight: '#F0DDAA',
  green: '#315C43',
  greenLight: '#497451',
  white: '#F5F0E4',
  muted: '#B9B6A9',
  red: '#B85C50',
  border: '#526044',
  black: '#090D0A'
};

// ==================================================
// 03 - د ذخیره کولو ثابت نومونه
// دا نومونه د پخوانیو معلوماتو د ساتلو لپاره دي
// ==================================================

const STORAGE = {
  settings: 'app_settings',
  books: 'library_books',
  notes: 'library_notes',
  global: 'global_library',
  reminders: 'lesson_reminders',
  adhkar: 'adhkar_data',
  favorites: 'library_favorites'
};

// ==================================================
// 04 - د علماوو نومونه
// ==================================================

const SCHOLARS = [
  'شیخ القرآن علامه سید عبدالسلام رستمي رحمه الله',
  'شیخ القرآن أبو محمد أمين الله البشاوري حفظه الله',
  'شیخ القرآن أبو محمد سردارولي ثاقب رحمه الله',
  'شیخ القرآن أبو عبيدالله متوكل رحمه الله',
  'شیخ القرآن أبو عمر عبدالمنان محمدي حفظه الله'
];

// ==================================================
// 05 - د علمي برخو نومونه
// ==================================================

const SECTIONS = [
  'د قرآن کریم زده کړې',
  'د احادیثو زده کړې',
  'تاریخ او سیرت',
  'اسلامي علوم او فنون',
  'سوالونه او ځوابونه',
  'عمومي درسونه او کتابونه'
];

// ==================================================
// 06 - د ژبو نومونه
// ==================================================

const LANGUAGES = [
  'پښتو',
  'العربية',
  'اردو',
  'فارسی',
  'English'
];

// ==================================================
// 07 - د لمانځه د محاسبې طریقې
// ==================================================

const PRAYER_METHODS = [
  { label: 'ام القری', value: 'UmmAlQura' },
  { label: 'کراچي', value: 'Karachi' },
  { label: 'اسلامي نړۍ', value: 'MuslimWorldLeague' },
  { label: 'مصر', value: 'Egyptian' },
  { label: 'شمالي امریکا', value: 'NorthAmerica' }
];

// ==================================================
// 08 - د لمانځه نومونه
// ==================================================

const PRAYERS = [
  { key: 'fajr', title: 'سهار', icon: '🌅' },
  { key: 'sunrise', title: 'لمر ختل', icon: '☀️' },
  { key: 'dhuhr', title: 'ماسپښین', icon: '🌤️' },
  { key: 'asr', title: 'مازدیګر', icon: '🌇' },
  { key: 'maghrib', title: 'ماښام', icon: '🌆' },
  { key: 'isha', title: 'ماخستن', icon: '🌙' }
];

// ==================================================
// 09 - د اذکارو کټګورۍ
// ==================================================

const DHIKR_CATEGORIES = [
  'د سهار اذکار',
  'د ماښام اذکار',
  'د خوب اذکار',
  'له لمانځه وروسته اذکار',
  'عمومي اذکار'
];

// ==================================================
// 10 - د اصلي اپلیکیشن پیل
// ==================================================

export default function App() {

  // ------------------------------------------------
  // 10.1 - د سکرینونو حالت
  // ------------------------------------------------

  const [screen, setScreen] = useState('home');
  const [previousScreen, setPreviousScreen] = useState('home');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ------------------------------------------------
  // 10.2 - د انتخاب شویو برخو معلومات
  // ------------------------------------------------

  const [selectedScholar, setSelectedScholar] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDhikr, setSelectedDhikr] = useState(null);

  // ------------------------------------------------
  // 10.3 - د کتابونو او نورو معلوماتو حالت
  // ------------------------------------------------

  const [books, setBooks] = useState({});
  const [notes, setNotes] = useState([]);
  const [globalItems, setGlobalItems] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [adhkar, setAdhkar] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // ------------------------------------------------
  // 10.4 - د اپلیکیشن تنظیمات
  // ------------------------------------------------

  const [settings, setSettings] = useState({
    language: 'پښتو',
    fontFamily: 'System',
    headingColor: '#F0DDAA',
    textColor: '#F5F0E4',
    calculationMethod: 'Karachi',
    madhab: 'Hanafi',

    prayerAdjustments: {
      fajr: 0,
      sunrise: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0
    },

    latitude: null,
    longitude: null,
    city: '',
    notificationsEnabled: true
  });

  // ------------------------------------------------
  // 10.5 - د فورمونو معلومات
  // ------------------------------------------------

  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formText, setFormText] = useState('');
  const [formAudio, setFormAudio] = useState('');
  const [formPDF, setFormPDF] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formCount, setFormCount] = useState('');

  const [searchText, setSearchText] = useState('');
  const [noteSearch, setNoteSearch] = useState('');

  // ------------------------------------------------
  // 10.6 - د کتابونو د څپرکو او درسونو فورمونه
  // ------------------------------------------------

  const [chapterName, setChapterName] = useState('');
  const [lessonName, setLessonName] = useState('');
  const [editorType, setEditorType] = useState('');

  // ------------------------------------------------
  // 10.7 - د لمانځه معلومات
  // ------------------------------------------------

  const [prayerTimes, setPrayerTimes] = useState(null);
  const [prayerDate, setPrayerDate] = useState(new Date());
  const [locationLoading, setLocationLoading] = useState(false);

  // ==================================================
  // 11 - د معلوماتو لوستل
  // ==================================================

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      setLoading(true);

      const results = await Promise.all([
        AsyncStorage.getItem(STORAGE.settings),
        AsyncStorage.getItem(STORAGE.books),
        AsyncStorage.getItem(STORAGE.notes),
        AsyncStorage.getItem(STORAGE.global),
        AsyncStorage.getItem(STORAGE.reminders),
        AsyncStorage.getItem(STORAGE.adhkar),
        AsyncStorage.getItem(STORAGE.favorites)
      ]);

      const [
        savedSettings,
        savedBooks,
        savedNotes,
        savedGlobal,
        savedReminders,
        savedAdhkar,
        savedFavorites
      ] = results;

      if (savedSettings) {
        setSettings(old => ({
          ...old,
          ...JSON.parse(savedSettings)
        }));
      }

      if (savedBooks) setBooks(JSON.parse(savedBooks));
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      if (savedGlobal) setGlobalItems(JSON.parse(savedGlobal));
      if (savedReminders) setReminders(JSON.parse(savedReminders));
      if (savedAdhkar) setAdhkar(JSON.parse(savedAdhkar));
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

    } catch (error) {
      Alert.alert('خبرتیا', 'د معلوماتو په لوستلو کې ستونزه رامنځته شوه.');
    } finally {
      setLoading(false);
    }
  }

  // ==================================================
  // 12 - د معلوماتو خوندي کول
  // ==================================================

  async function saveData(key, value) {
    try {
      setSaving(true);

      await AsyncStorage.setItem(
        key,
        JSON.stringify(value)
      );

      return true;

    } catch (error) {
      Alert.alert('ستونزه', 'معلومات خوندي نه شول.');
      return false;

    } finally {
      setSaving(false);
    }
  }

  async function updateSettings(newSettings) {
    const updated = {
      ...settings,
      ...newSettings
    };

    setSettings(updated);
    await saveData(STORAGE.settings, updated);
  }

  async function saveBooks(updated) {
    setBooks(updated);
    await saveData(STORAGE.books, updated);
  }

  async function saveNotes(updated) {
    setNotes(updated);
    await saveData(STORAGE.notes, updated);
  }

  async function saveGlobalItems(updated) {
    setGlobalItems(updated);
    await saveData(STORAGE.global, updated);
  }

  async function saveReminders(updated) {
    setReminders(updated);
    await saveData(STORAGE.reminders, updated);
  }

  async function saveAdhkar(updated) {
    setAdhkar(updated);
    await saveData(STORAGE.adhkar, updated);
  }

  async function saveFavorites(updated) {
    setFavorites(updated);
    await saveData(STORAGE.favorites, updated);
  }

  // ==================================================
  // 13 - د سکرینونو بدلول
  // ==================================================

  function navigate(nextScreen) {
    setPreviousScreen(screen);
    setScreen(nextScreen);
  }

  function goBack() {
    const parents = {
      scholars: 'home',
      scholar: 'scholars',
      oldCategory: 'scholar',
      oldBook: 'oldCategory',
      section: 'home',
      sectionFolder: 'section',
      itemDetails: 'sectionFolder',
      lessonEditor: 'sectionFolder',
      notes: 'home',
      noteEditor: 'notes',
      reminders: 'home',
      reminderEditor: 'reminders',
      adhkarHome: 'home',
      adhkarFolder: 'adhkarHome',
      dhikrDetails: 'adhkarFolder',
      dhikrEditor: 'adhkarFolder',
      prayer: 'home',
      settings: 'home',
      search: 'home',
      favorites: 'home'
    };

    setScreen(parents[screen] || 'home');
  }

  useEffect(() => {
    const backAction = () => {
      if (screen !== 'home') {
        goBack();
        return true;
      }

      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => subscription.remove();
  }, [screen]);

  // ==================================================
  // 14 - د فورمونو پاکول
  // ==================================================

  function clearForm() {
    setFormTitle('');
    setFormDescription('');
    setFormText('');
    setFormAudio('');
    setFormPDF('');
    setFormDate('');
    setFormTime('');
    setFormCount('');
  }

  // ==================================================
  // 15 - د نوټونو سیستم
  // ==================================================

  function openNewNote() {
    clearForm();
    setSelectedItem(null);
    navigate('noteEditor');
  }

  function openNote(note) {
    setSelectedItem(note);
    setFormTitle(note.title || '');
    setFormText(note.text || '');
    navigate('noteEditor');
  }

  async function saveNote() {
    if (!formTitle.trim() && !formText.trim()) {
      Alert.alert('خبرتیا', 'د نوټ متن ولیکئ.');
      return;
    }

    let updated;

    if (selectedItem?.id) {
      updated = notes.map(note =>
        note.id === selectedItem.id
          ? {
              ...note,
              title: formTitle,
              text: formText,
              updatedAt: new Date().toISOString()
            }
          : note
      );
    } else {
      updated = [
        {
          id: Date.now().toString(),
          title: formTitle.trim() || 'بې نومه نوټ',
          text: formText,
          createdAt: new Date().toISOString()
        },
        ...notes
      ];
    }

    await saveNotes(updated);

    clearForm();
    setSelectedItem(null);
    setScreen('notes');
  }

  async function deleteNote(id) {
    Alert.alert('د نوټ حذف', 'ایا دا نوټ حذف کول غواړئ؟', [
      { text: 'نه', style: 'cancel' },
      {
        text: 'هو، حذف یې کړه',
        style: 'destructive',
        onPress: async () => {
          await saveNotes(
            notes.filter(note => note.id !== id)
          );
        }
      }
    ]);
  }

  // ==================================================
  // 16 - د شریکولو سیستم
  // ==================================================

  async function shareText(title, text) {
    try {
      await Share.share({
        title: title || 'میراث اسلام',
        message: `${title || 'میراث اسلام'}\n\n${text || ''}`
      });
    } catch (error) {
      Alert.alert('ستونزه', 'شریکول ترسره نه شول.');
    }
  }

  async function shareFile(uri, mimeType) {
    try {
      if (!uri) {
        Alert.alert('خبرتیا', 'لومړی فایل وټاکئ.');
        return;
      }

      const available = await Sharing.isAvailableAsync();

      if (!available) {
        Alert.alert('خبرتیا', 'د فایل شریکول فعال نه دي.');
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: mimeType || undefined,
        dialogTitle: 'د میراث اسلام فایل شریکول'
      });

    } catch (error) {
      Alert.alert('ستونزه', 'فایل شریک نه شو.');
    }
  }

  // ==================================================
  // 17 - د آډیو فایل ټاکل
  // ==================================================

  async function pickAudio() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
        multiple: false
      });

      if (!result.canceled && result.assets?.length) {
        const file = result.assets[0];

        setFormAudio(file.uri);

        if (!formDescription) {
          setFormDescription(file.name || '');
        }
      }

    } catch (error) {
      Alert.alert('ستونزه', 'آډیو فایل انتخاب نه شو.');
    }
  }

  // ==================================================
  // 18 - د PDF فایل ټاکل
  // ==================================================

  async function pickPDF() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false
      });

      if (!result.canceled && result.assets?.length) {
        const file = result.assets[0];

        setFormPDF(file.uri);

        if (!formDescription) {
          setFormDescription(file.name || '');
        }
      }

    } catch (error) {
      Alert.alert('ستونزه', 'PDF فایل انتخاب نه شو.');
    }
  }

  // ==================================================
  // 19 - د عمومي درسونو اضافه کول
  // ==================================================

  async function addGlobalItem() {
    if (!formTitle.trim()) {
      Alert.alert('خبرتیا', 'د درس نوم ولیکئ.');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      title: formTitle.trim(),
      description: formDescription,
      text: formText,
      audio: formAudio,
      pdf: formPDF,
      scholar: selectedScholar,
      section: selectedSection,
      folder: selectedFolder,
      createdAt: new Date().toISOString()
    };

    await saveGlobalItems([
      newItem,
      ...globalItems
    ]);

    clearForm();
    setScreen('sectionFolder');
  }

  async function deleteGlobalItem(id) {
    Alert.alert('د درس حذف', 'ایا دا درس حذف کول غواړئ؟', [
      { text: 'نه', style: 'cancel' },
      {
        text: 'هو',
        style: 'destructive',
        onPress: async () => {
          await saveGlobalItems(
            globalItems.filter(item => item.id !== id)
          );
        }
      }
    ]);
  }

  // ==================================================
  // 20 - د خوښې درسونه
  // ==================================================

  function isFavorite(id) {
    return favorites.some(item => item.id === id);
  }

  async function toggleFavorite(item) {
    if (!item?.id) return;

    let updated;

    if (isFavorite(item.id)) {
      updated = favorites.filter(
        favorite => favorite.id !== item.id
      );
    } else {
      updated = [
        ...favorites,
        {
          ...item,
          savedAt: new Date().toISOString()
        }
      ];
    }

    await saveFavorites(updated);
  }

  // ==================================================
  // 21 - د لمانځه محاسبه
  // ==================================================

  function getCalculationParams() {
    switch (settings.calculationMethod) {
      case 'UmmAlQura':
        return CalculationMethod.UmmAlQura();

      case 'MuslimWorldLeague':
        return CalculationMethod.MuslimWorldLeague();

      case 'Egyptian':
        return CalculationMethod.Egyptian();

      case 'NorthAmerica':
        return CalculationMethod.NorthAmerica();

      default:
        return CalculationMethod.Karachi();
    }
  }

  async function calculatePrayerTimes(latitude, longitude) {
    try {
      const coordinates = new Coordinates(
        latitude,
        longitude
      );

      const params = getCalculationParams();

      params.madhab =
        settings.madhab === 'Shafi'
          ? Madhab.Shafi
          : Madhab.Hanafi;

      const date = new Date();

      const times = new PrayerTimes(
        coordinates,
        date,
        params
      );

      const adjustments = settings.prayerAdjustments || {};

      function adjustTime(value, minutes) {
        const result = new Date(value);
        result.setMinutes(
          result.getMinutes() + (minutes || 0)
        );
        return result;
      }

      const result = {
        fajr: adjustTime(times.fajr, adjustments.fajr),
        sunrise: adjustTime(times.sunrise, adjustments.sunrise),
        dhuhr: adjustTime(times.dhuhr, adjustments.dhuhr),
        asr: adjustTime(times.asr, adjustments.asr),
        maghrib: adjustTime(times.maghrib, adjustments.maghrib),
        isha: adjustTime(times.isha, adjustments.isha)
      };

      setPrayerTimes(result);
      setPrayerDate(new Date());

      return result;

    } catch (error) {
      Alert.alert('ستونزه', 'د لمانځه وختونه محاسبه نه شول.');
      return null;
    }
  }

  // ==================================================
  // 22 - د موقعیت ترلاسه کول
  // ==================================================

  async function getPrayerLocation() {
    try {
      setLocationLoading(true);

      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        Alert.alert(
          'اجازه اړینه ده',
          'د لمانځه د وختونو لپاره د موقعیت اجازه ورکړئ.'
        );
        return;
      }

      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });

      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;

      const address = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      const cityName =
        address?.[0]?.city ||
        address?.[0]?.district ||
        address?.[0]?.region ||
        '';

      await updateSettings({
        latitude,
        longitude,
        city: cityName
      });

      await calculatePrayerTimes(
        latitude,
        longitude
      );

    } catch (error) {
      Alert.alert('ستونزه', 'موقعیت ترلاسه نه شو.');
    } finally {
      setLocationLoading(false);
    }
  }

  async function refreshPrayerTimes() {
    if (
      settings.latitude !== null &&
      settings.longitude !== null
    ) {
      await calculatePrayerTimes(
        settings.latitude,
        settings.longitude
      );
    } else {
      await getPrayerLocation();
    }
  }

  // ==================================================
  // 23 - د خبرتیاوو اجازه
  // ==================================================

  async function requestNotificationPermission() {
    try {
      const permission =
        await Notifications.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'اجازه اړینه ده',
          'د خبرتیاوو لپاره اجازه فعاله کړئ.'
        );
        return false;
      }

      return true;

    } catch (error) {
      return false;
    }
  }

  // ==================================================
  // 24 - د خبرتیا اضافه کول
  // ==================================================

  async function addReminder() {
    if (
      !formTitle.trim() ||
      !formDate.trim() ||
      !formTime.trim()
    ) {
      Alert.alert(
        'خبرتیا',
        'د خبرتیا نوم، نېټه او وخت ولیکئ.'
      );
      return;
    }

    const allowed =
      await requestNotificationPermission();

    if (!allowed) return;

    const dateTime = new Date(
      `${formDate}T${formTime}:00`
    );

    if (
      Number.isNaN(dateTime.getTime()) ||
      dateTime <= new Date()
    ) {
      Alert.alert(
        'ناسم وخت',
        'راتلونکې نېټه او سم وخت ولیکئ.'
      );
      return;
    }

    try {
      const notificationId =
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'میراث اسلام',
            body: formTitle,
            sound: true
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: dateTime
          }
        });

      const newReminder = {
        id: Date.now().toString(),
        title: formTitle,
        date: formDate,
        time: formTime,
        notificationId
      };

      await saveReminders([
        newReminder,
        ...reminders
      ]);

      clearForm();
      setScreen('reminders');

      Alert.alert('بریالی شو', 'خبرتیا ثبت شوه.');

    } catch (error) {
      Alert.alert('ستونزه', 'خبرتیا ثبت نه شوه.');
    }
  }

  async function deleteReminder(id) {
    const reminder = reminders.find(
      item => item.id === id
    );

    try {
      if (reminder?.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(
          reminder.notificationId
        );
      }

      await saveReminders(
        reminders.filter(item => item.id !== id)
      );

    } catch (error) {
      Alert.alert('ستونزه', 'خبرتیا حذف نه شوه.');
    }
  }

  // ==================================================
  // 25 - د اذکارو سیستم
  // ==================================================

  async function addDhikr() {
    if (!formTitle.trim() || !formText.trim()) {
      Alert.alert(
        'خبرتیا',
        'د ذکر نوم او متن ولیکئ.'
      );
      return;
    }

    const newDhikr = {
      id: Date.now().toString(),
      title: formTitle.trim(),
      text: formText.trim(),
      translation: formDescription,
      count: Number(formCount) || 1,
      category: selectedFolder || 'عمومي اذکار',
      createdAt: new Date().toISOString()
    };

    await saveAdhkar([
      newDhikr,
      ...adhkar
    ]);

    clearForm();
    setScreen('adhkarFolder');
  }

  async function deleteDhikr(id) {
    Alert.alert('حذف', 'دا ذکر حذف کړئ؟', [
      { text: 'نه', style: 'cancel' },
      {
        text: 'هو',
        style: 'destructive',
        onPress: async () => {
          await saveAdhkar(
            adhkar.filter(item => item.id !== id)
          );
        }
      }
    ]);
  }

  // ==================================================
  // 26 - د علماوو کتابونه
  // ==================================================

  function getBookKey() {
    return `${selectedScholar}|${selectedSection}`;
  }

  function getOldBooks() {
    return books[getBookKey()] || [];
  }

  function openScholar(name) {
    setSelectedScholar(name);
    setSelectedSection('');
    setScreen('scholar');
  }

  function openOldCategory(section) {
    setSelectedSection(section);
    setScreen('oldCategory');
  }

  function openOldBook(book) {
    setSelectedItem(book);
    setScreen('oldBook');
  }

  async function addOldBook() {
    if (!formTitle.trim()) {
      Alert.alert('خبرتیا', 'د کتاب نوم ولیکئ.');
      return;
    }

    const key = getBookKey();
    const current = books[key] || [];

    const newBook = {
      id: Date.now().toString(),
      title: formTitle.trim(),
      chapters: []
    };

    await saveBooks({
      ...books,
      [key]: [
        ...current,
        newBook
      ]
    });

    clearForm();
  }

  async function deleteOldBook(bookId) {
    Alert.alert('حذف', 'دا کتاب حذف کړئ؟', [
      { text: 'نه', style: 'cancel' },
      {
        text: 'هو',
        style: 'destructive',
        onPress: async () => {
          const key = getBookKey();

          await saveBooks({
            ...books,
            [key]: (books[key] || []).filter(
              item => item.id !== bookId
            )
          });
        }
      }
    ]);
  }

  // ==================================================
  // 27 - د کتاب څپرکي اضافه کول
  // ==================================================

  async function addOldChapter() {
    if (!chapterName.trim() || !selectedItem) {
      Alert.alert(
        'خبرتیا',
        'د څپرکي نوم ولیکئ.'
      );
      return;
    }

    const key = getBookKey();

    const updatedBooks = (books[key] || []).map(book =>
      book.id === selectedItem.id
        ? {
            ...book,
            chapters: [
              ...(book.chapters || []),
              {
                id: Date.now().toString(),
                title: chapterName.trim(),
                lessons: []
              }
            ]
          }
        : book
    );

    await saveBooks({
      ...books,
      [key]: updatedBooks
    });

    setSelectedItem(
      updatedBooks.find(
        book => book.id === selectedItem.id
      )
    );

    setChapterName('');
    setEditorType('');
  }

  // ==================================================
  // 28 - د کتاب درس اضافه کول
  // ==================================================

  async function addOldLesson(chapterId) {
    if (!lessonName.trim() || !selectedItem) {
      Alert.alert(
        'خبرتیا',
        'د درس نوم ولیکئ.'
      );
      return;
    }

    const key = getBookKey();

    const updatedBooks = (books[key] || []).map(book => {
      if (book.id !== selectedItem.id) {
        return book;
      }

      return {
        ...book,
        chapters: (book.chapters || []).map(chapter =>
          chapter.id === chapterId
            ? {
                ...chapter,
                lessons: [
                  ...(chapter.lessons || []),
                  {
                    id: Date.now().toString(),
                    title: lessonName.trim()
                  }
                ]
              }
            : chapter
        )
      };
    });

    await saveBooks({
      ...books,
      [key]: updatedBooks
    });

    setSelectedItem(
      updatedBooks.find(
        book => book.id === selectedItem.id
      )
    );

    setLessonName('');
    setEditorType('');
  }

  // ==================================================
  // 29 - د کتاب څپرکي حذف
  // ==================================================

  async function deleteOldChapter(chapterId) {
    if (!selectedItem) return;

    const key = getBookKey();

    const updatedBooks = (books[key] || []).map(book =>
      book.id === selectedItem.id
        ? {
            ...book,
            chapters: (book.chapters || []).filter(
              chapter => chapter.id !== chapterId
            )
          }
        : book
    );

    await saveBooks({
      ...books,
      [key]: updatedBooks
    });

    setSelectedItem(
      updatedBooks.find(
        book => book.id === selectedItem.id
      )
    );
  }

  // ==================================================
  // 30 - د لټون سیستم
  // ==================================================

  function getSearchResults() {
    const query = searchText.trim().toLowerCase();

    if (!query) return [];

    return globalItems.filter(item =>
      `${item.title || ''} ${item.description || ''} ${item.text || ''} ${item.scholar || ''} ${item.section || ''}`
        .toLowerCase()
        .includes(query)
    );
  }

  function openItem(item) {
    setSelectedItem(item);
    setScreen('itemDetails');
  }

  // ==================================================
  // 31 - د علمي برخو پرانیستل
  // ==================================================

  function openSection(section) {
    setSelectedSection(section);
    setSelectedFolder('');
    setScreen('section');
  }

  function openFolder(folder) {
    setSelectedFolder(folder);
    setScreen('sectionFolder');
  }

  function openAddLesson() {
    clearForm();
    setScreen('lessonEditor');
  }

  function getFolderItems() {
    return globalItems.filter(item =>
      item.section === selectedSection &&
      item.folder === selectedFolder
    );
  }

  // ==================================================
  // 32 - د وخت ښودلو
  // ==================================================

  function formatTime(date) {
    if (!date) return '--:--';

    return new Date(date).toLocaleTimeString(
      'en-US',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }
    );
  }

  // ==================================================
  // 33 - د متن او کارتونو مرستندویه برخې
  // ==================================================

  function ActionCard({
    title,
    subtitle,
    icon,
    onPress
  }) {
    return (
      <TouchableOpacity
        style={styles.actionCard}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.actionIcon}>
          {icon}
        </Text>

        <Text style={styles.actionTitle}>
          {title}
        </Text>

        {subtitle ? (
          <Text style={styles.actionSubtitle}>
            {subtitle}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  }

  function SectionTitle({
    title,
    action,
    onAction
  }) {
    return (
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        {action ? (
          <TouchableOpacity onPress={onAction}>
            <Text style={styles.goldLink}>
              {action}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  function Field({
    label,
    value,
    onChangeText,
    placeholder,
    multiline = false,
    keyboardType = 'default'
  }) {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          {label}
        </Text>

        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || ''}
          placeholderTextColor={COLORS.muted}
          multiline={multiline}
          textAlign="right"
          keyboardType={keyboardType}
        />
      </View>
    );
  }

  function GoldButton({
    title,
    onPress,
    secondary = false
  }) {
    return (
      <TouchableOpacity
        style={[
          styles.goldButton,
          secondary && styles.secondaryButton
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.goldButtonText,
            secondary && styles.secondaryButtonText
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  // ==================================================
  // د لومړۍ برخې پای
  // دوهمه برخه به له همدې ځایه اد
  // ==================================================
  // 34 - د سکرینونو اصلي ډیزاین
  // ==================================================

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <StatusBar
          backgroundColor={COLORS.background}
          barStyle="light-content"
        />

        <Text style={styles.loadingLogo}>میراث اسلام</Text>

        <ActivityIndicator
          size="large"
          color={COLORS.gold}
        />

        <Text style={styles.loadingText}>
          مهرباني وکړئ، لږ انتظار وکړئ
        </Text>
      </View>
    );
  }

  // ==================================================
  // 35 - د کورپاڼې سکرین
  // ==================================================

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={COLORS.background}
        barStyle="light-content"
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >

        {screen === 'home' && (
          <View style={styles.homeScreen}>
            <View style={styles.homeContent}>
              {/* د سرپاڼې ښکلی اسلامي سرلیک */}
              <View style={styles.homeHeroHeader}>
                <View style={styles.headerTopActions}>
                  <TouchableOpacity
                    style={styles.headerActionButton}
                    onPress={() => setScreen('settings')}
                    accessibilityLabel="تنظیمات"
                  >
                    <Text style={styles.headerActionIcon}>⚙</Text>
                  </TouchableOpacity>
                  <View style={styles.headerTopSpacer} />
                  <TouchableOpacity
                    style={styles.headerActionButton}
                    onPress={() => setScreen('reminders')}
                    accessibilityLabel="خبرتیاوې"
                  >
                    <Text style={styles.headerActionIcon}>♟</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.headerBismillah}>
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </Text>
                <Text style={styles.logoTitle}>میراث اسلام</Text>
                <Text style={styles.headerSubtitle}>
                  د قرآن او سنت د علمونو مرکز
                </Text>
                <View style={styles.headerOrnamentLine}>
                  <Text style={styles.headerOrnament}>✦ ۞ ✦</Text>
                </View>
              </View>

              {/* د لمانځه وختونه او لټون */}
              <View style={styles.prayerCard}>
                <View style={styles.prayerSearchRow}>
                  <TouchableOpacity
                    style={styles.homeSearchButton}
                    onPress={() => setScreen('search')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.homeSearchIcon}>⌕</Text>
                    <Text style={styles.homeSearchPlaceholder}>پلټون...</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.prayerHeadingButton}
                    onPress={() => setScreen('prayer')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.prayerHeadingText}>اوقات الصلاة</Text>
                    <Text style={styles.prayerHeadingIcon}>◷</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.homePrayerDivider} />
                <View style={styles.homePrayerList}>
                  {PRAYERS.filter(prayer => prayer.key !== 'sunrise').map(prayer => (
                    <TouchableOpacity
                      key={prayer.key}
                      style={styles.homePrayerItem}
                      onPress={() => setScreen('prayer')}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.homePrayerIcon}>{prayer.icon}</Text>
                      <Text style={styles.homePrayerName}>{prayer.title}</Text>
                      <Text style={styles.homePrayerTime}>
                        {prayerTimes ? formatTime(prayerTimes[prayer.key]) : '--:--'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  onPress={refreshPrayerTimes}
                  style={styles.homePrayerRefresh}
                  activeOpacity={0.8}
                >
                  {locationLoading ? (
                    <ActivityIndicator color={COLORS.gold} />
                  ) : (
                    <Text style={styles.homePrayerRefreshText}>
                      {settings.city || 'خپل موقعیت وټاکئ'}  ·  ↻ وختونه تازه کړئ
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* د علماوو او مشایخو درسونه */}
              <TouchableOpacity
                style={styles.homeLessonsCard}
                onPress={() => setScreen('scholars')}
                activeOpacity={0.88}
              >
                <View style={styles.homeLessonsArtwork}>
                  <Text style={styles.homeBookGlow}>✧</Text>
                  <Text style={styles.homeBookIcon}>📖</Text>
                  <Text style={styles.homeBookStand}>⌁</Text>
                </View>
                <View style={styles.homeLessonsText}>
                  <Text style={styles.homeLessonsTitle}>دروس المشایخ</Text>
                  <Text style={styles.homeLessonsSubtitle}>
                    د علماوو او مشایخو علمي درسونه
                  </Text>
                  <View style={styles.homeLessonsButton}>
                    <Text style={styles.homeLessonsButtonText}>درسونو ته داخل شئ  ▶</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* د کتابتون اړوند چټکې برخې */}
              <View style={styles.homeShortcutGrid}>
                <TouchableOpacity
                  style={styles.homeShortcutCard}
                  onPress={() => setScreen('favorites')}
                  activeOpacity={0.82}
                >
                  <Text style={styles.homeShortcutIcon}>♥</Text>
                  <Text style={styles.homeShortcutTitle}>خوښ شوي فایلونه</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.homeShortcutCard}
                  onPress={() => openSection('سوالونه او ځوابونه')}
                  activeOpacity={0.82}
                >
                  <Text style={styles.homeShortcutIcon}>▤</Text>
                  <Text style={styles.homeShortcutTitle}>سوالات او جوابات</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.homeShortcutCard}
                  onPress={() => openSection('عمومي درسونه او کتابونه')}
                  activeOpacity={0.82}
                >
                  <Text style={styles.homeShortcutIcon}>▰</Text>
                  <Text style={styles.homeShortcutTitle}>الکتب</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.homeShortcutCard}
                  onPress={() => setScreen('search')}
                  activeOpacity={0.82}
                >
                  <Text style={styles.homeShortcutIcon}>➤</Text>
                  <Text style={styles.homeShortcutTitle}>د زده کړې مسیر</Text>
                </TouchableOpacity>
              </View>

              {/* اذکار او یادښتونه */}
              <View style={styles.homeWideCardsRow}>
                <TouchableOpacity
                  style={styles.homeWideCard}
                  onPress={() => setScreen('adhkarHome')}
                  activeOpacity={0.82}
                >
                  <Text style={styles.homeWideIcon}>☾</Text>
                  <View style={styles.homeWideTextBox}>
                    <Text style={styles.homeWideTitle}>د سهار او ماښام اذکار</Text>
                    <Text style={styles.homeWideSubtitle}>ورځني اذکار</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.homeWideCard}
                  onPress={() => setScreen('notes')}
                  activeOpacity={0.82}
                >
                  <Text style={styles.homeWideIcon}>▤</Text>
                  <View style={styles.homeWideTextBox}>
                    <Text style={styles.homeWideTitle}>زما نوټونه</Text>
                    <Text style={styles.homeWideSubtitle}>شخصي یادښتونه</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* ټولې علمي برخې هماغسې له پخواني سیستم سره تړلې دي */}
              <View style={styles.homeSectionHeading}>
                <Text style={styles.homeSectionHeadingText}>علمي برخې</Text>
                <Text style={styles.homeSectionHeadingLine}>ــــــــــــــــــــــــ</Text>
              </View>
              <View style={styles.homeCategoriesGrid}>
                {SECTIONS.map((section, index) => {
                  const icons = ['۞', '◈', '⌘', '✧', '؟', '▤'];
                  return (
                    <TouchableOpacity
                      key={section}
                      style={styles.homeCategoryCard}
                      onPress={() => openSection(section)}
                      activeOpacity={0.82}
                    >
                      <Text style={styles.homeCategoryIcon}>{icons[index]}</Text>
                      <Text style={styles.homeCategoryTitle}>{section}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

            </View>

            {/* ثابت لاندې مینو؛ یوازې په کورپاڼه کې ښکاري */}
            <View style={styles.homeBottomNav}>
              <TouchableOpacity style={styles.homeNavItem} onPress={() => setScreen('scholars')}>
                <Text style={styles.homeNavIcon}>◎</Text>
                <Text style={styles.homeNavLabel}>کتابتون</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.homeNavItem} onPress={() => setScreen('adhkarHome')}>
                <Text style={styles.homeNavIcon}>☾</Text>
                <Text style={styles.homeNavLabel}>اذکار</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.homeNavItem} onPress={() => setScreen('notes')}>
                <Text style={styles.homeNavIcon}>▤</Text>
                <Text style={styles.homeNavLabel}>نوټونه</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.homeNavItem} onPress={() => setScreen('settings')}>
                <Text style={styles.homeNavIcon}>⚙</Text>
                <Text style={styles.homeNavLabel}>تنظیمات</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.homeNavItem, styles.homeNavItemActive]} onPress={() => setScreen('home')}>
                <Text style={styles.homeNavIconActive}>⌂</Text>
                <Text style={styles.homeNavLabelActive}>کور</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ==================================================
            36 - د علماوو لست
        ================================================== */}

        {screen === 'scholars' && (
          <ScrollView contentContainerStyle={styles.pageContent}>
            <PageHeader
              title="د علماوو کتابتون"
              subtitle="د علماوو علمي آثار او درسونه"
              onBack={goBack}
            />

            {SCHOLARS.map((scholar, index) => (
              <TouchableOpacity
                key={scholar}
                style={styles.scholarCard}
                onPress={() => openScholar(scholar)}
              >
                <Text style={styles.scholarNumber}>
                  {String(index + 1).padStart(2, '0')}
                </Text>

                <View style={styles.flexText}>
                  <Text style={styles.scholarName}>
                    {scholar}
                  </Text>

                  <Text style={styles.smallMuted}>
                    کتابونه او علمي بیانونه
                  </Text>
                </View>

                <Text style={styles.lessonArrow}>‹</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ==================================================
            37 - د یوه عالم سکرین
        ================================================== */}

        {screen === 'scholar' && (
          <ScrollView contentContainerStyle={styles.pageContent}>
            <PageHeader
              title="د عالم کتابتون"
              subtitle={selectedScholar}
              onBack={goBack}
            />

            {SECTIONS.map(section => (
              <TouchableOpacity
                key={section}
                style={styles.listCard}
                onPress={() => openOldCategory(section)}
              >
                <Text style={styles.listCardIcon}>▤</Text>

                <Text style={styles.listCardTitle}>
                  {section}
                </Text>

                <Text style={styles.lessonArrow}>‹</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ==================================================
            38 - د عالم د کتابونو برخه
        ================================================== */}

        {screen === 'oldCategory' && (
          <ScrollView contentContainerStyle={styles.pageContent}>
            <PageHeader
              title={selectedSection}
              subtitle={selectedScholar}
              onBack={goBack}
            />

            <Field
              label="د نوي کتاب نوم"
              value={formTitle}
              onChangeText={setFormTitle}
              placeholder="د کتاب نوم ولیکئ"
            />

            <GoldButton
              title="＋ نوی کتاب اضافه کړئ"
              onPress={addOldBook}
            />

            {getOldBooks().map(book => (
              <View
                key={book.id}
                style={styles.listCard}
              >
                <TouchableOpacity
                  style={styles.flexText}
                  onPress={() => openOldBook(book)}
                >
                  <Text style={styles.listCardTitle}>
                    {book.title}
                  </Text>

                  <Text style={styles.smallMuted}>
                    {(book.chapters || []).length} څپرکي
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => deleteOldBook(book.id)}
                >
                  <Text style={styles.deleteIcon}>حذف</Text>
                </TouchableOpacity>
              </View>
            ))}

            {getOldBooks().length === 0 && (
              <Text style={styles.emptyText}>
                تر اوسه کتاب نه دی اضافه شوی.
              </Text>
            )}
          </ScrollView>
        )}

        {/* ==================================================
            39 - د یوه کتاب دننه
        ================================================== */}

        {screen === 'oldBook' && (
          <ScrollView contentContainerStyle={styles.pageContent}>
            <PageHeader
              title={selectedItem?.title || 'کتاب'}
              subtitle="څپرکي او درسونه"
              onBack={goBack}
            />

            <View style={styles.formCard}>
              <Text style={styles.cardHeading}>
                نوی څپرکی
              </Text>

              <Field
                label="د څپرکي نوم"
                value={chapterName}
                onChangeText={setChapterName}
                placeholder="د څپرکي نوم ولیکئ"
              />

              <GoldButton
                title="＋ څپرکی اضافه کړئ"
                onPress={addOldChapter}
              />
            </View>

            {(selectedItem?.chapters || []).map((chapter, index) => (
              <View
                key={chapter.id}
                style={styles.chapterCard}
              >
                <View style={styles.chapterHeader}>
                  <Text style={styles.chapterTitle}>
                    {index + 1}. {chapter.title}
                  </Text>

                  <TouchableOpacity
                    onPress={() => deleteOldChapter(chapter.id)}
                  >
                    <Text style={styles.deleteIcon}>حذف</Text>
                  </TouchableOpacity>
                </View>

                {(chapter.lessons || []).map((lesson, lessonIndex) => (
                  <View
                    key={lesson.id}
                    style={styles.lessonRow}
                  >
                    <Text style={styles.lessonTitle}>
                      {lessonIndex + 1}. {lesson.title}
                    </Text>
                  </View>
                ))}

                <Field
                  label="د نوي درس نوم"
                  value={editorType === chapter.id ? lessonName : ''}
                  onChangeText={value => {
                    setEditorType(chapter.id);
                    setLessonName(value);
                  }}
                  placeholder="د درس نوم ولیکئ"
                />

                <GoldButton
                  title="＋ درس اضافه کړئ"
                  secondary
                  onPress={() => {
                    setSelectedFolder(chapter.id);
                    addOldLesson(chapter.id);
                  }}
                />
              </View>
            ))}
          </ScrollView>
        )}

        {/* ==================================================
            40 - علمي برخې
        ================================================== */}

        {screen === 'section' && (
          <ScrollView contentContainerStyle={styles.pageContent}>
            <PageHeader
              title={selectedSection}
              subtitle="د زده کړې برخې"
              onBack={goBack}
            />

            {['تفسیر', 'ژباړه', 'بیانونه', 'کتابونه', 'نور درسونه'].map(
              folder => (
                <TouchableOpacity
                  key={folder}
                  style={styles.listCard}
                  onPress={() => openFolder(folder)}
                >
                  <Text style={styles.listCardIcon}>▤</Text>

                  <Text style={styles.listCardTitle}>
                    {folder}
                  </Text>

                  <Text style={styles.lessonArrow}>‹</Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>
        )}

        {/* ==================================================
            41 - د یوې برخې دننه درسونه
        ================================================== */}

        {screen === 'sectionFolder' && (
          <ScrollView contentContainerStyle={styles.pageContent}>
            <PageHeader
              title={selectedFolder}
              subtitle={selectedSection}
              onBack={goBack}
            />

            <GoldButton
              title="＋ نوی درس اضافه کړئ"
              onPress={openAddLesson}
            />

            {getFolderItems().map(item => (
              <View
                key={item.id}
                style={styles.lessonCard}
              >
                <TouchableOpacity
                  style={styles.flexText}
                  onPress={() => openItem(item)}
                >
                  <Text style={styles.lessonTitle}>
                    {item.title}
                  </Text>

                  <Text style={styles.smallMuted}>
                    {item.description}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => deleteGlobalItem(item.id)}
                >
                  <Text style={styles.deleteIcon}>حذف</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* ==================================================
            42 - نوی درس
        ================================================== */}

        {screen === 'lessonEditor' && (
          <ScrollView contentContainerStyle={styles.pageContent}>
            <PageHeader
              title="نوی درس"
              subtitle="د درس معلومات ثبت کړئ"
              onBack={goBack}
            />

            <Field
              label="د درس نوم"
              value={formTitle}
              onChangeText={setFormTitle}
              placeholder="د درس نوم"
            />

            <Field
              label="لنډ معلومات"
              value={formDescription}
              onChangeText={setFormDescription}
              placeholder="د درس په اړه معلومات"
              multiline
            />

            <Field
              label="د درس متن"
              value={formText}
              onChangeText={setFormText}
              placeholder="د درس متن ولیکئ"
              multiline
            />

            <View style={styles.formCard}>
              <Text style={styles.cardHeading}>د فایلونو ټاکل</Text>

              <GoldButton
                title="♫ آډیو فایل وټاکئ"
                secondary
                onPress={pickAudio}
              />

              {formAudio ? (
                <Text style={styles.fileSelected}>
                  آډیو فایل انتخاب شو ✓
                </Text>
              ) : null}

              <GoldButton
                title="▤ PDF کتاب وټاکئ"
                secondary
                onPress={pickPDF}
              />

              {formPDF ? (
                <Text style={styles.fileSelected}>
                  PDF فایل انتخاب شو ✓
                </Text>
              ) : null}
            </View>

            <GoldButton
              title="درس خوندي کړئ"
              onPress={addGlobalItem}
            />
          </ScrollView>
        )}

        {/* ==================================================
            43 - د درس معلومات
        ================================================== */}

        {screen === 'itemDetails' && (
          <ScrollView contentContainerStyle={styles.pageContent}>
            <PageHeader
              title={selectedItem?.title || 'درس'}
              subtitle={selectedItem?.scholar || ''}
              onBack={goBack}
            />

            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>
                {selectedItem?.title}
              </Text>

              <Text style={styles.detailText}>
                {selectedItem?.description}
              </Text>

              <Text style={styles.bodyText}>
                {selectedItem?.text}
              </Text>
            </View>

            {selectedItem?.audio ? (
              <GoldButton
                title="آډیو شریکول"
                secondary
                onPress={() => shareFile(selectedItem.audio, 'audio/*')}
              />
            ) : null}

            {selectedItem?.pdf ? (
              <GoldButton
                title="PDF شریکول"
                secondary
                onPress={() => shareFile(selectedItem.pdf, 'application/pdf')}
              />
            ) : null}

            <GoldButton
              title={
                isFavorite(selectedItem?.id)
                  ? '♡ له خوښې لرې کول'
                  : '♡ خوښې ته اضافه کول'
              }
              onPress={() => toggleFavorite(selectedItem)}
            />

            <GoldButton
              title="درس شریکول"
              secondary
              onPress={() =>
                shareText(
                  selectedItem?.title,
                  selectedItem?.text || selectedItem?.description
                )
              }
            />
          </ScrollView>
        )}

        {/* ==================================================
            44 - نوټونه
        ================================================== */}

        {screen === 'notes' && (
          <ScrollView contentContainerStyle={styles.pageContent}>
            <PageHeader
              title="زما نوټونه"
              subtitle="شخصي یادښتونه"
              onBack={goBack}
            />

            <GoldButton
              title="＋ نوی نوټ"
              onPress={openNewNote}
            />

            <Field
              label="د نوټونو لټون"
              value={noteSearch}
              onChangeText={setNoteSearch}
              placeholder="نوټ ولټوئ"
            />

            {notes
              .filter(note =>
                `${note.title} ${note.text}`
                  .toLowerCase()
                  .includes(noteSearch.toLowerCase())
              )
              .map(note => (
                <View
                  key={note.id}
                  style={styles.lessonCard}
                >
                  <TouchableOpacity
                    style={styles.flexText}
                    onPress={() => openNote(note)}
                  >
                    <Text style={styles.lessonTitle}>
                      {note.title}
                    </Text>

                    <Text style={styles.smallMuted}>
                      {note.text}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => deleteNote(note.id)}
                  >
                    <Text style={styles.deleteIcon}>حذف</Text>
                  </TouchableOpacity>
                </View>
              ))}
          </ScrollView>
        )}

        {/* ==================================================
            45 - د نوټ لیکلو سکرین
        ================================================== */}

        {screen === 'noteEditor' && (
          <ScrollView contentContainerStyle={styles.pageContent}>
            <PageHeader
              title="د نوټ لیکل"
              subtitle="خپل معلومات خوندي کړئ"
              onBack={goBack}
            />

            <Field
              label="سرلیک"
              value={formTitle}
              onChangeText={setFormTitle}
              placeholder="د نوټ سرلیک"
            />

            <Field
              label="متن"
              value={formText}
              onChangeText={setFormText}
              placeholder="خپل یادښت ولیکئ"
              multiline
            />

            <GoldButton
              title="نوټ خوندي کړئ"
              onPress={saveNote}
            />

            <GoldButton
              title="له نورو سره شریکول"
              secondary
              onPress={() => shareText(formTitle, formText)}
            />
          </ScrollView>
        )}

        {/* ==================================================
            46 - د خبرتیاوو سکرین
        ================================================== */}

        {screen === 'reminders' && (
          <ScrollView contentContainerStyle={styles.pageContent}>
            <PageHeader
              title="خبرتیاوې"
              subtitle="د بیانونو او درسونو یادونې"
              onBack={goBack}
            />

            <GoldButton
              title="＋ نوې خبرتیا"
              onPress={() => {
                clearForm();
                setScreen('reminderEditor');
              }}
            />

            {reminders.map(item => (
              <View
                key={item.id}
                style={styles.listCard}
              >
                <View style={styles.flexText}>
                  <Text style={styles.listCardTitle}>
                    {item.title}
                  </Text>

                  <Text style={styles.smallMuted}>
                    {item.date} - {item.time}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => deleteReminder(item.id)}
                >
                  <Text style={styles.deleteIcon}>حذف</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* ==================================================
            47 - د نوې خبرتیا جوړول
        ================================================== */}

        {screen === 'reminderEditor' && (
          <ScrollView contentContainerStyle={styles.pageContent}>
            <PageHeader
              title="نوې خبرتیا"
              subtitle="د یادونې وخت وټاکئ"
              onBack={goBack}
            />

            <Field
              label="د خبرتیا نوم"
              value={formTitle}
              onChangeText={setFormTitle}
              placeholder="د بیان یا درس نوم"
            />

            <Field
              label="نېټه (YYYY-MM-DD)"
              value={formDate}
              onChangeText={setFormDate}
              placeholder="2026-12-25"
            />

            <Field
              label="وخت (24 ساعته)"
              value={formTime}
              onChangeText={setFormTime}
              placeholder="18:30"
            />

            <GoldButton
              title="خبرتیا ثبت کړئ"
              onPress={addReminder}
            />
          </ScrollView>
        )}

        {/* ==================================================
            48 - د اذکارو کورپاڼه
        ================================================== */}

        {screen === 'adhkarHome' && (
          <ScrollView contentContainerStyle={styles.pageContent}>
            <PageHeader
              title="ورځني اذکار"
              subtitle="د سهار او ماښام اذکار"
              onBack={goBack}
            />

            {DHIKR_CATEGORIES.map(category => (
              <TouchableOpacity
                key={category}
                style={styles.listCard}
                onPress={() => {
                  setSelectedFolder(category);
                  setScreen('adhkarFolder');
                }}
              >
                <Text style={styles.listCardIcon}>۞</Text>

                <Text style={styles.listCardTitle}>
                  {category}
                </Text>

                <Text style={styles.lessonArrow}>‹</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ==================================================
            49 - د اذکارو لست
        ================================================== */}

        {screen === 'adhkarFolder' && (
          <ScrollView contentContainerStyle={styles.pageContent}>
            <PageHeader
              title={selectedFolder}
              subtitle="ذکرونه"
              onBack={goBack}
            />

            <GoldButton
              title="＋ نوی ذکر اضافه کړئ"
              onPress={() => {
                clearForm();
                setScreen('dhikrEditor');
              }}
            />

            {adhkar
              .filter(item => item.category === selectedFolder)
              .map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.listCard}
                  onPress={() => {
                    setSelectedDhikr(item);
                    setScreen('dhikrDetails');
                  }}
                >
                  <Text style={styles.listCardTitle}>
                    {item.title}
                  </Text>

                  <Text style={styles.lessonArrow}>‹</Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        )}

        {/* ==================================================
            50 - د ذکر اضافه کول
        ================================================== */}

        {screen === 'dhikrEditor' && (
          <ScrollView contentContainerStyle={styles.pageContent}>
            <PageHeader
              title="نوی ذکر"
              subtitle={selectedFolder}
              onBack={goBack}
            />

            <Field
              label="د ذکر نوم"
              value={formTitle}
              onChangeText={setFormTitle}
              placeholder="نوم"
            />

            <Field
              label="د ذکر متن"
              value={formText}
              onChangeText={setFormText}
              placeholder="عربي ذکر ولیکئ"
              multiline
            />

            <Field
              label="ژباړه او تشریح"
              value={formDescription}
              onChangeText={setFormDescription}
              placeholder="ژباړه"
              multiline
            />

            <Field
              label="د تکرار شمېر"
              value={formCount}
              onChangeText={setFormCount}
              placeholder="33"
              keyboardType="numeric"
            />

            <GoldButton
              title="ذکر خوندي کړئ"
              onPress={addDhikr}
            />
          </ScrollView>
        )}

        {/* ==================================================
            51 - د ذکر تفصیل
        ================================================== */}

        {screen === 'dhikrDetails' && (
          <ScrollView contentContainerStyle={styles.pageContent}>
            <PageHeader
              title={selectedDhikr?.title || 'ذکر'}
              subtitle="د ذکر متن"
              onBack={goBack}
            />

            <View style={styles.detailCard}>
              <Text style={styles.arabicText}>
                {selectedDhikr?.text}
              </Text>

              <View style={styles.headerLine} />

              <Text style={styles.bodyText}>
                {selectedDhikr?.translation}
              </Text>

              <Text style={styles.smallMuted}>
                د تکرار شمېر: {selectedDhikr?.count || 1}
              </Text>
            </View>

            <GoldButton
              title="ذکر شریکول"
              onPress={() =>
                shareText(
                  selectedDhikr?.title,
                  selectedDhikr?.text
                )
              }
            />

            <GoldButton
              title="ذکر حذف کول"
              secondary
              onPress={() => deleteDhikr(selectedDhikr?.id)}
            />
          </ScrollView>
        )}

        {/* ==================================================
            52 - د لمانځه تفصیلي تنظیمات
        ================================================== */}

        {screen === 'prayer' && (
          <ScrollView contentContainerStyle={styles.pageContent}>
            <PageHeader
              title="د لمانځه وختونه"
              subtitle="موقعیت او د محاسبې طریقه"
              onBack={goBack}
            />

            <View style={styles.formCard}>
              <Text style={styles.cardHeading}>
                اوسنی موقعیت
              </Text>

              <Text style={styles.bodyText}>
                {settings.city || 'موقعیت نه دی ټاکل شوی'}
              </Text>

              <GoldButton
                title="زما موقعیت ترلاسه کړه"
                onPress={getPrayerLocation}
              />
            </View>

            <Text style={styles.fieldLabel}>
              د محاسبې طریقه
            </Text>

            {PRAYER_METHODS.map(method => (
              <TouchableOpacity
                key={method.value}
                style={styles.optionRow}
                onPress={() =>
                  updateSettings({
                    calculationMethod: method.value
                  })
                }
              >
                <Text style={styles.optionText}>
                  {method.label}
                </Text>

                <Text style={styles.optionCheck}>
                  {settings.calculationMethod === method.value ? '✓' : '○'}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.fieldLabel}>
              د عصر طریقه
            </Text>

            {[
              { label: 'حنفي', value: 'Hanafi' },
              { label: 'شافعي', value: 'Shafi' }
            ].map(item => (
              <TouchableOpacity
                key={item.value}
                style={styles.optionRow}
                onPress={() =>
                  updateSettings({ madhab: item.value })
                }
              >
                <Text style={styles.optionText}>
                  {item.label}
                </Text>

                <Text style={styles.optionCheck}>
                  {settings.madhab === item.value ? '✓' : '○'}
                </Text>
              </TouchableOpacity>
            ))}

            <GoldButton
              title="وختونه بیا محاسبه کړه"
              onPress={refreshPrayerTimes}
            />
          </ScrollView>
        )}

        {/* ==================================================
            53 - د اپلیکیشن تنظیمات
        ================================================== */}

        {screen === 'settings' && (
          <ScrollView contentContainerStyle={styles.pageContent}>
            <PageHeader
              title="تنظیمات"
              subtitle="د میراث اسلام شخصي تنظیمات"
              onBack={goBack}
            />

            <Text style={styles.cardHeading}>
              د اپلیکیشن ژبه
            </Text>

            {LANGUAGES.map(language => (
              <TouchableOpacity
                key={language}
                style={styles.optionRow}
                onPress={() => updateSettings({ language })}
              >
                <Text style={styles.optionText}>
                  {language}
                </Text>

                <Text style={styles.optionCheck}>
                  {settings.language === language ? '✓' : '○'}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.formCard}>
              <Text style={styles.cardHeading}>
                د متن رنګ
              </Text>

              {[
                { label: 'سپین', value: '#F5F0E4' },
                { label: 'طلایي', value: '#D6B56D' },
                { label: 'روښانه شین', value: '#A9C6A7' }
              ].map(color => (
                <TouchableOpacity
                  key={color.value}
                  style={styles.optionRow}
                  onPress={() =>
                    updateSettings({ textColor: color.value })
                  }
                >
                  <Text style={styles.optionText}>
                    {color.label}
                  </Text>

                  <View
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color.value }
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formCard}>
              <Text style={styles.cardHeading}>
                خبرتیاوې
              </Text>

              <View style={styles.optionRow}>
                <Text style={styles.optionText}>
                  خبرتیاوې فعالې وي
                </Text>

                <Switch
                  value={settings.notificationsEnabled}
                  onValueChange={value =>
                    updateSettings({
                      notificationsEnabled: value
                    })
                  }
                  trackColor={{
                    false: COLORS.border,
                    true: COLORS.greenLight
                  }}
                  thumbColor={COLORS.gold}
                />
              </View>
            </View>

            <GoldButton
              title="د لمانځه تنظیمات"
              onPress={() => setScreen('prayer')}
            />

            <GoldButton
              title="کورپاڼې ته ستنېدل"
              secondary
              onPress={() => setScreen('home')}
            />
          </ScrollView>
        )}

        {/* ==================================================
            54 - لټون
        ================================================== */}

        {screen === 'search' && (
          <ScrollView contentContainerStyle={styles.pageContent}>
            <PageHeader
              title="لټون"
              subtitle="په درسونو کې پلټنه"
              onBack={goBack}
            />

            <Field
              label="د درس نوم یا متن"
              value={searchText}
              onChangeText={setSearchText}
              placeholder="دلته ولیکئ..."
            />

            {getSearchResults().map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.lessonCard}
                onPress={() => openItem(item)}
              >
                <View style={styles.flexText}>
                  <Text style={styles.lessonTitle}>
                    {item.title}
                  </Text>

                  <Text style={styles.smallMuted}>
                    {item.scholar}
                  </Text>
                </View>

                <Text style={styles.lessonArrow}>‹</Text>
              </TouchableOpacity>
            ))}

            {searchText.trim() && getSearchResults().length === 0 && (
              <Text style={styles.emptyText}>
                د لټون پایله ونه موندل شوه.
              </Text>
            )}
          </ScrollView>
        )}

        {/* ==================================================
            55 - خوښ شوي درسونه
        ================================================== */}

        {screen === 'favorites' && (
          <ScrollView contentContainerStyle={styles.pageContent}>
            <PageHeader
              title="خوښ شوي درسونه"
              subtitle="ستاسو غوره درسونه"
              onBack={goBack}
            />

            {favorites.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.lessonCard}
                onPress={() => openItem(item)}
              >
                <View style={styles.flexText}>
                  <Text style={styles.lessonTitle}>
                    {item.title}
                  </Text>

                  <Text style={styles.smallMuted}>
                    {item.scholar || item.section}
                  </Text>
                </View>

                <Text style={styles.lessonArrow}>‹</Text>
              </TouchableOpacity>
            ))}

            {favorites.length === 0 && (
              <Text style={styles.emptyText}>
                تر اوسه کوم درس خوښې ته نه دی اضافه شوی.
              </Text>
            )}
          </ScrollView>
        )}

      </KeyboardAvoidingView>
    </View>
  );
}

// ==================================================
// 56 - د سکرین سرلیک
// ==================================================

function PageHeader({ title, subtitle, onBack }) {
  return (
    <View style={styles.pageHeader}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
      >
        <Text style={styles.backButtonText}>
          → شاته
        </Text>
      </TouchableOpacity>

      <Text style={styles.pageTitle}>
        {title}
      </Text>

      {subtitle ? (
        <Text style={styles.pageSubtitle}>
          {subtitle}
        </Text>
      ) : null}

      <View style={styles.headerLine} />
    </View>
  );
}

// ==================================================
// 57 - د اپلیکیشن ټول ډیزاینونه
// ==================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18
  },

  loadingLogo: {
    color: COLORS.gold,
    fontSize: 30,
    fontWeight: 'bold'
  },

  loadingText: {
    color: COLORS.muted,
    fontSize: 14
  },

  homeScreen: {
    flex: 1,
    backgroundColor: COLORS.background
  },

  homeContent: {
    flex: 1,
    justifyContent: 'space-evenly',
    paddingHorizontal: 7,
    paddingTop: 3,
    paddingBottom: 3
  },

  homeHeroHeader: {
    minHeight: 92,
    marginTop: 0,
    marginBottom: 4,
    paddingHorizontal: 10,
    paddingTop: 3,
    paddingBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#032D1B',
    borderWidth: 3,
    borderColor: COLORS.gold,
    borderTopLeftRadius: 145,
    borderTopRightRadius: 145,
    borderBottomLeftRadius: 27,
    borderBottomRightRadius: 27,
    overflow: 'hidden',
    elevation: 9,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.42,
    shadowRadius: 7
  },

  headerTopActions: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },

  headerActionButton: {
    width: 27,
    height: 27,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A4A2D',
    borderWidth: 1,
    borderColor: COLORS.gold
  },

  headerActionIcon: {
    color: COLORS.gold,
    fontSize: 17,
    fontWeight: 'bold'
  },

  headerTopSpacer: { flex: 1 },

  headerBismillah: {
    color: COLORS.goldLight,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 0
  },

  logoTitle: {
    color: COLORS.gold,
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 5
  },

  headerSubtitle: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 1,
    textAlign: 'center'
  },

  headerOrnamentLine: {
    width: '76%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.gold,
    marginTop: 3,
    paddingVertical: 0,
    alignItems: 'center'
  },

  headerOrnament: {
    color: COLORS.gold,
    fontSize: 13
  },

  prayerCard: {
    backgroundColor: '#032F1D',
    borderWidth: 3,
    borderColor: COLORS.gold,
    borderRadius: 27,
    padding: 5,
    marginBottom: 4,
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5
  },

  prayerSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },

  homeSearchButton: {
    flex: 1,
    minHeight: 28,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.gold,
    backgroundColor: '#0A4A2D',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12
  },

  homeSearchIcon: {
    color: COLORS.gold,
    fontSize: 19,
    marginRight: 5
  },

  homeSearchPlaceholder: {
    color: COLORS.muted,
    fontSize: 10
  },

  prayerHeadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4
  },

  prayerHeadingText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: 'bold'
  },

  prayerHeadingIcon: {
    color: COLORS.goldLight,
    fontSize: 18,
    marginLeft: 4
  },

  homePrayerDivider: {
    height: 1,
    backgroundColor: COLORS.gold,
    opacity: 0.8,
    marginTop: 3,
    marginBottom: 2
  },

  homePrayerList: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'stretch'
  },

  homePrayerItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
    borderRightWidth: 1.5,
    borderRightColor: COLORS.gold
  },

  homePrayerIcon: {
    color: COLORS.gold,
    fontSize: 15,
    marginBottom: 0
  },

  homePrayerName: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 0
  },

  homePrayerTime: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold'
  },

  homePrayerRefresh: {
    alignItems: 'center',
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },

  homePrayerRefreshText: {
    color: COLORS.goldLight,
    fontSize: 8
  },

  homeLessonsCard: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#034126',
    borderWidth: 3,
    borderColor: COLORS.gold,
    borderRadius: 31,
    padding: 5,
    marginBottom: 4,
    overflow: 'hidden',
    elevation: 7,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6
  },

  homeLessonsArtwork: {
    flex: 0.95,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#063720',
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    borderRadius: 75,
    overflow: 'hidden'
  },

  homeBookGlow: {
    color: COLORS.gold,
    fontSize: 30,
    position: 'absolute',
    top: 8
  },

  homeBookIcon: {
    fontSize: 30
  },

  homeBookStand: {
    color: COLORS.gold,
    fontSize: 20,
    marginTop: -10
  },

  homeLessonsText: {
    flex: 1.25,
    alignItems: 'flex-end',
    paddingHorizontal: 7
  },

  homeLessonsTitle: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right'
  },

  homeLessonsSubtitle: {
    color: COLORS.white,
    fontSize: 9,
    textAlign: 'right',
    marginTop: 2,
    marginBottom: 3
  },

  homeLessonsButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 25,
    paddingHorizontal: 8,
    paddingVertical: 4
  },

  homeLessonsButtonText: {
    color: COLORS.black,
    fontSize: 8,
    fontWeight: 'bold'
  },

  homeShortcutGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 4,
    marginBottom: 3
  },

  homeShortcutCard: {
    flex: 1,
    minHeight: 47,
    backgroundColor: '#034126',
    borderWidth: 3,
    borderColor: COLORS.gold,
    borderRadius: 13,
    paddingHorizontal: 2,
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.32,
    shadowRadius: 4
  },

  homeShortcutIcon: {
    color: COLORS.gold,
    fontSize: 17,
    marginBottom: 1
  },

  homeShortcutTitle: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center'
  },

  homeWideCardsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 5,
    marginBottom: 3
  },

  homeWideCard: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#034126',
    borderWidth: 3,
    borderColor: COLORS.gold,
    borderRadius: 13,
    padding: 4,
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.32,
    shadowRadius: 4
  },

  homeWideIcon: {
    color: COLORS.gold,
    fontSize: 22
  },

  homeWideTextBox: {
    flex: 1,
    alignItems: 'flex-end',
    paddingHorizontal: 5
  },

  homeWideTitle: {
    color: COLORS.goldLight,
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'right'
  },

  homeWideSubtitle: {
    color: COLORS.muted,
    fontSize: 7,
    marginTop: 1,
    textAlign: 'right'
  },

  homeSectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 2
  },

  homeSectionHeadingText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: 'bold'
  },

  homeSectionHeadingLine: {
    color: COLORS.border,
    fontSize: 12
  },

  homeCategoriesGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 0
  },

  homeCategoryCard: {
    width: '32%',
    minHeight: 35,
    backgroundColor: '#0A3D29',
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 9,
    padding: 3,
    marginBottom: 3,
    alignItems: 'center',
    justifyContent: 'center'
  },

  homeCategoryIcon: {
    color: COLORS.gold,
    fontSize: 13,
    marginBottom: 0
  },

  homeCategoryTitle: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center'
  },

  homeSeeAll: {
    color: COLORS.goldLight,
    fontSize: 12
  },

  homeFooter: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gold
  },

  homeFooterTitle: {
    color: COLORS.gold,
    fontSize: 22,
    fontWeight: 'bold'
  },

  homeFooterText: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5
  },

  homeBottomNav: {
    minHeight: 57,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#022417',
    borderTopWidth: 3,
    borderTopColor: COLORS.gold,
    paddingTop: 2,
    paddingBottom: Platform.OS === 'ios' ? 7 : 3,
    elevation: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 6
  },

  homeNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 49,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.gold
  },

  homeNavItemActive: {
    backgroundColor: '#0A3D29'
  },

  homeNavIcon: {
    color: COLORS.goldLight,
    fontSize: 18,
    marginBottom: 0
  },

  homeNavIconActive: {
    color: COLORS.gold,
    fontSize: 20,
    marginBottom: 0
  },

  homeNavLabel: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: 'bold'
  },

  homeNavLabelActive: {
    color: COLORS.gold,
    fontSize: 9,
    fontWeight: 'bold'
  },

  actionCard: {
    width: '48%',
    minHeight: 105,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionIcon: {
    color: COLORS.gold,
    fontSize: 25,
    marginBottom: 7
  },
  actionSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 5,
    textAlign: 'center'
  },
  actionTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  cardHeading: {
    color: COLORS.gold,
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 10
  },
  flexText: {
    flex: 1
  },
  goldLink: {
    color: COLORS.goldLight,
    fontSize: 12
  },
  headerLine: {
    height: 1,
    backgroundColor: COLORS.border,
    width: '75%',
    alignSelf: 'center',
    marginVertical: 13
  },
  lessonArrow: {
    color: COLORS.gold,
    fontSize: 24,
    marginLeft: 10
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 13,
    marginBottom: 9
  },
  lessonDescription: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: 'right',
    marginTop: 5
  },
  lessonTextBox: {
    flex: 1
  },
  lessonTitle: {
    color: COLORS.white,
    fontSize: 14,
    textAlign: 'right',
    fontWeight: 'bold'
  },
  pageContent: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 40
  },
  sectionTitle: {
    color: COLORS.gold,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right'
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 13,
    marginBottom: 12
  },
  smallMuted: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4
  },

  pageHeader: {
    marginBottom: 20,
    alignItems: 'center'
  },

  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.card2,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 13,
    marginBottom: 14
  },

  backButtonText: {
    color: COLORS.gold,
    fontSize: 13
  },

  pageTitle: {
    color: COLORS.gold,
    fontSize: 23,
    fontWeight: 'bold',
    textAlign: 'center'
  },

  pageSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 7
  },

  scholarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    padding: 14,
    marginBottom: 10
  },

  scholarNumber: {
    color: COLORS.gold,
    fontSize: 19,
    fontWeight: 'bold',
    marginRight: 13
  },

  scholarName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right'
  },

  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10
  },

  listCardIcon: {
    color: COLORS.gold,
    fontSize: 23,
    marginRight: 12
  },

  listCardTitle: {
    color: COLORS.white,
    fontSize: 14,
    textAlign: 'right',
    flex: 1
  },

  deleteIcon: {
    color: COLORS.red,
    fontSize: 12,
    paddingHorizontal: 7
  },

  chapterCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    padding: 13,
    marginBottom: 13
  },

  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },

  chapterTitle: {
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'right',
    flex: 1
  },

  lessonRow: {
    backgroundColor: COLORS.card2,
    padding: 10,
    borderRadius: 8,
    marginBottom: 7
  },

  formCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    padding: 14,
    marginBottom: 15
  },

  fieldContainer: {
    marginBottom: 13
  },

  fieldLabel: {
    color: COLORS.goldLight,
    fontSize: 13,
    textAlign: 'right',
    marginBottom: 7
  },

  input: {
    backgroundColor: COLORS.card2,
    color: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    textAlign: 'right',
    minHeight: 45
  },

  multilineInput: {
    minHeight: 110,
    textAlignVertical: 'top'
  },

  goldButton: {
    backgroundColor: COLORS.gold,
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 9,
    marginBottom: 9
  },

  goldButtonText: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: 'bold'
  },

  secondaryButton: {
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.gold
  },

  secondaryButtonText: {
    color: COLORS.goldLight
  },

  fileSelected: {
    color: COLORS.greenLight,
    fontSize: 12,
    textAlign: 'right',
    marginVertical: 7
  },

  detailCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    padding: 17,
    marginBottom: 15
  },

  detailTitle: {
    color: COLORS.gold,
    fontSize: 21,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15
  },

  detailText: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'right',
    marginBottom: 15
  },

  bodyText: {
    color: COLORS.white,
    fontSize: 15,
    lineHeight: 28,
    textAlign: 'right'
  },

  arabicText: {
    color: COLORS.goldLight,
    fontSize: 25,
    lineHeight: 48,
    textAlign: 'center',
    marginVertical: 15
  },

  emptyText: {
    color: COLORS.muted,
    textAlign: 'center',
    padding: 25,
    fontSize: 13
  },

  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
    marginBottom: 8
  },

  optionText: {
    color: COLORS.white,
    fontSize: 13,
    textAlign: 'right'
  },

  optionCheck: {
    color: COLORS.gold,
    fontSize: 19
  },

  colorCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.gold
  }

});
  // ==================================================
