   
import React, { useState, useEffect, useRef } from 'react';

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
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import Pdf from 'react-native-pdf';
import { Ionicons } from '@expo/vector-icons';

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
  background: '#17231B',
  background2: '#1B2B20',
  card: '#20372A',
  card2: '#2A4934',
  card3: '#35583E',
  gold: '#E4C879',
  goldLight: '#F5E5B1',
  green: '#3D704D',
  greenLight: '#56865D',
  white: '#FFF8E8',
  muted: '#D0C9B5',
  red: '#C56A5B',
  border: '#718052',
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
  favorites: 'library_favorites',
  audioMarks: 'audio_bookmarks_v1',
  pdfMarks: 'pdf_bookmarks_v1',
  audioProgress: 'audio_playback_progress_v1',
  pdfProgress: 'pdf_reading_progress_v1'
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

// د کورپاڼې د ډیزاین د شخصي تنظیماتو اصلي ارزښتونه
const DEFAULT_HOME_DESIGN = {
  pageBackground: '#E8EEE8',
  headerBackground: '#064027',
  prayerBackground: '#08452C',
  navBackground: '#022417',
  folderBackground: '#075033',
  folderTextColor: '#FFFFFF',
  folderIconColor: '#E4C879',
  folderBorderColor: '#E4C879',
  folderBorderWidth: 2,
  folderBorderStyle: 'solid',
  folderRadius: 14,
  folderHeight: 58,
  titleSize: 12,
  iconSize: 22,
  fontFamily: 'System',
  gap: 2,
  navOffset: 48,
  perFolder: {}
};

const HOME_FOLDER_OPTIONS = [
  { key: 'section_0', label: 'د قرآن کریم زده کړې' },
  { key: 'section_1', label: 'د احادیثو زده کړې' },
  { key: 'section_2', label: 'تاریخ او سیرت' },
  { key: 'section_3', label: 'اسلامي علوم او فنون' },
  { key: 'section_4', label: 'سوالونه او ځوابونه' },
  { key: 'section_5', label: 'عمومي درسونه او کتابونه' },
  { key: 'scholars', label: 'دروس المشایخ' },
  { key: 'shortcut_0', label: 'خوښ شوي فایلونه' },
  { key: 'shortcut_1', label: 'سوالات او جوابات' },
  { key: 'shortcut_2', label: 'الکتب' },
  { key: 'shortcut_3', label: 'د زده کړې مسیر' },
  { key: 'wide_0', label: 'د سهار او ماښام اذکار' },
  { key: 'wide_1', label: 'زما نوټونه' }
];

const HOME_COLOR_OPTIONS = [
  '#075033', '#064027', '#123D68', '#4A286B', '#743B22', '#303C49',
  '#7A2638', '#315B42', '#E8EEE8', '#17231B', '#FFFFFF', '#F1E4C5',
  '#FFFFFF', '#F5E5B1', '#E4C879', '#B8D8C0', '#222222', '#8BD3FF',
  '#D66B6B', '#A88BE8', '#79B98A', '#C7A2A2'
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
  const [designFolderKey, setDesignFolderKey] = useState('section_0');
  const [designCustomColor, setDesignCustomColor] = useState('#E4C879');

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
  const [audioMarks, setAudioMarks] = useState([]);
  const [pdfMarks, setPdfMarks] = useState([]);
  const [audioStatus, setAudioStatus] = useState({ isLoaded: false, isPlaying: false, positionMillis: 0, durationMillis: 0, rate: 1 });
  const [audioBookmarkText, setAudioBookmarkText] = useState('');
  const [audioTrackWidth, setAudioTrackWidth] = useState(1);
  const [pdfBookmarkText, setPdfBookmarkText] = useState('');
  const [pdfCurrentPage, setPdfCurrentPage] = useState(1);
  const [pdfTotalPages, setPdfTotalPages] = useState(0);
  const [pdfInitialPage, setPdfInitialPage] = useState(1);
  const audioSoundRef = useRef(null);
  const audioQueueRef = useRef([]);
  const audioItemRef = useRef(null);
  const audioStartAtRef = useRef(null);
  const lastProgressSaveRef = useRef(0);
  const pendingAudioSeekRef = useRef(null);
  const audioFinishHandledRef = useRef(false);

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
        AsyncStorage.getItem(STORAGE.favorites),
        AsyncStorage.getItem(STORAGE.audioMarks),
        AsyncStorage.getItem(STORAGE.pdfMarks)
      ]);

      const [
        savedSettings,
        savedBooks,
        savedNotes,
        savedGlobal,
        savedReminders,
        savedAdhkar,
        savedFavorites,
        savedAudioMarks,
        savedPdfMarks
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
      if (savedAudioMarks) setAudioMarks(JSON.parse(savedAudioMarks));
      if (savedPdfMarks) setPdfMarks(JSON.parse(savedPdfMarks));

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

  const homeDesign = { ...DEFAULT_HOME_DESIGN, ...(settings.homeDesign || {}) };

  function getHomeFolderDesign(key) {
    return { ...homeDesign, ...(homeDesign.perFolder?.[key] || {}) };
  }

  async function updateHomeDesign(patch, folderKey = null) {
    const current = { ...DEFAULT_HOME_DESIGN, ...(settings.homeDesign || {}) };
    let next;
    if (folderKey) {
      next = {
        ...current,
        perFolder: {
          ...(current.perFolder || {}),
          [folderKey]: { ...(current.perFolder?.[folderKey] || {}), ...patch }
        }
      };
    } else {
      next = { ...current, ...patch };
    }
    await updateSettings({ homeDesign: next });
  }

  function homeFolderCardStyle(key, baseStyle) {
    const d = getHomeFolderDesign(key);
    return [baseStyle, {
      backgroundColor: d.folderBackground,
      borderColor: d.folderBorderColor,
      borderWidth: d.folderBorderWidth,
      borderStyle: d.folderBorderStyle,
      borderRadius: d.folderRadius,
      minHeight: d.folderHeight,
      marginBottom: d.gap
    }];
  }

  function homeFolderTitleStyle(key, baseStyle) {
    const d = getHomeFolderDesign(key);
    return [baseStyle, { color: d.folderTextColor, fontSize: d.titleSize, fontFamily: d.fontFamily }];
  }

  function homeFolderIconStyle(key, baseStyle) {
    const d = getHomeFolderDesign(key);
    return [baseStyle, { color: d.folderIconColor, fontSize: d.iconSize }];
  }

  function applyCustomHomeColor(target, folderKey = null) {
    const color = designCustomColor.trim();
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      Alert.alert('ناسم رنګ', 'مهرباني وکړئ رنګ د #RRGGBB په بڼه ولیکئ، لکه #12A4EF.');
      return;
    }
    updateHomeDesign({ [target]: color }, folderKey);
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

  async function saveAudioMarks(updated) {
    setAudioMarks(updated);
    await saveData(STORAGE.audioMarks, updated);
  }

  async function savePdfMarks(updated) {
    setPdfMarks(updated);
    await saveData(STORAGE.pdfMarks, updated);
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
      favorites: 'home',
      audioPlayer: 'itemDetails',
      pdfReader: 'itemDetails',
      audioMarks: 'notes',
      pdfMarks: 'notes'
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
  // د انتخاب شويو آډیو او PDF فایلونو دایمي کاپي
  // ==================================================

  async function keepPickedFile(file, kind) {
    if (!file?.uri) return file?.uri || '';
    try {
      const base = FileSystem.documentDirectory;
      if (!base) return file.uri;
      const safeName = (file.name || `${kind}-${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, '_');
      const destination = `${base}${kind}-${Date.now()}-${safeName}`;
      await FileSystem.copyAsync({ from: file.uri, to: destination });
      return destination;
    } catch (error) {
      // که کاپي ممکنه نه وه، د DocumentPicker URI وساتئ.
      return file.uri;
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

        const stableUri = await keepPickedFile(file, 'audio');
        setFormAudio(stableUri);

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

        const stableUri = await keepPickedFile(file, 'pdf');
        setFormPDF(stableUri);

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
  // 20.1 - پرمختللی آډیو پلیر او د نقطو نښه کول
  // ==================================================

  function getAudioQueue() {
    return globalItems.filter(item => !!item.audio);
  }

  async function persistAudioProgress(item, positionMillis) {
    if (!item?.id) return;
    try {
      await AsyncStorage.setItem(STORAGE.audioProgress, JSON.stringify({
        resourceId: item.id,
        title: item.title || '',
        uri: item.audio,
        positionMillis: Math.max(0, Math.floor(positionMillis || 0)),
        updatedAt: new Date().toISOString()
      }));
    } catch (error) {}
  }

  async function startAudio(item, requestedPosition) {
    if (!item?.audio) {
      Alert.alert('آډیو نشته', 'د دې درس لپاره آډیو فایل نه دی ثبت شوی.');
      return;
    }
    try {
      if (audioSoundRef.current) {
        try { audioSoundRef.current.pause(); audioSoundRef.current.clearLockScreenControls(); audioSoundRef.current.remove(); } catch (error) {}
        audioSoundRef.current = null;
      }
      audioItemRef.current = item;
      audioQueueRef.current = getAudioQueue();
      audioFinishHandledRef.current = false;
      let startAt = Number.isFinite(requestedPosition) ? requestedPosition : 0;
      if (!Number.isFinite(requestedPosition)) {
        const saved = await AsyncStorage.getItem(STORAGE.audioProgress);
        if (saved) {
          const progress = JSON.parse(saved);
          if (progress.resourceId === item.id && progress.uri === item.audio) {
            startAt = progress.positionMillis || 0;
          }
        }
      }
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'doNotMix'
      });
      pendingAudioSeekRef.current = startAt;
      const player = createAudioPlayer(item.audio, { updateInterval: 500, downloadFirst: false });
      audioSoundRef.current = player;
      player.addListener('playbackStatusUpdate', status => {
        if (!status.isLoaded) return;
        const mapped = {
          isLoaded: status.isLoaded,
          isPlaying: status.playing,
          positionMillis: Math.floor((status.currentTime || 0) * 1000),
          durationMillis: Math.floor((status.duration || 0) * 1000),
          rate: status.playbackRate || 1
        };
        setAudioStatus(mapped);
        if (pendingAudioSeekRef.current !== null) {
          const pending = pendingAudioSeekRef.current;
          pendingAudioSeekRef.current = null;
          if (pending > 0) player.seekTo(pending / 1000).then(() => player.play()).catch(() => player.play());
          else player.play();
          player.setActiveForLockScreen(true, {
            title: item.title || 'میراث اسلام',
            artist: item.scholar || 'میراث اسلام',
            albumTitle: item.section || 'د علمي بیانونو کتابتون'
          }, { showSeekBackward: true, showSeekForward: true });
        }
        if (mapped.positionMillis - lastProgressSaveRef.current >= 5000) {
          lastProgressSaveRef.current = mapped.positionMillis;
          persistAudioProgress(audioItemRef.current, mapped.positionMillis);
        }
        if (status.didJustFinish && !audioFinishHandledRef.current) {
          audioFinishHandledRef.current = true;
          persistAudioProgress(audioItemRef.current, 0);
          playNextAudio(false);
        }
      });
      setAudioStatus({ isLoaded: false, isPlaying: false, positionMillis: startAt, durationMillis: 0, rate: 1 });
      setScreen('audioPlayer');
    } catch (error) {
      Alert.alert('د غږ ستونزه', 'آډیو پرانیستل نه شوه. د فایل شتون او اجازه وګورئ.');
    }
  }

  async function toggleAudioPlayback() {
    try {
      const player = audioSoundRef.current;
      if (!player) return;
      if (audioStatus.isPlaying) player.pause();
      else player.play();
    } catch (error) {
      Alert.alert('ستونزه', 'د غږ حالت بدل نه شو.');
    }
  }

  async function seekAudio(deltaMillis) {
    try {
      const player = audioSoundRef.current;
      if (!player) return;
      const next = Math.max(0, Math.min(audioStatus.durationMillis || 0, audioStatus.positionMillis + deltaMillis));
      await player.seekTo(next / 1000);
      await persistAudioProgress(audioItemRef.current, next);
    } catch (error) {}
  }

  async function seekAudioToFraction(fraction) {
    try {
      const duration = audioStatus.durationMillis || 0;
      if (audioSoundRef.current && duration > 0) {
        const next = Math.max(0, Math.min(duration, duration * fraction));
        await audioSoundRef.current.seekTo(next / 1000);
        await persistAudioProgress(audioItemRef.current, next);
      }
    } catch (error) {}
  }

  async function changeAudioRate(rate) {
    try {
      if (audioSoundRef.current) {
        audioSoundRef.current.setPlaybackRate(rate);
        setAudioStatus(old => ({ ...old, rate }));
      }
    } catch (error) {
      Alert.alert('خبرتیا', 'دا فایل د غږ د سرعت بدلون نه ملاتړ کوي.');
    }
  }

  async function playNextAudio(previous = false) {
    const queue = audioQueueRef.current.length ? audioQueueRef.current : getAudioQueue();
    const current = audioItemRef.current;
    const index = queue.findIndex(item => item.id === current?.id);
    const nextIndex = previous ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= queue.length) {
      if (audioSoundRef.current) {
        try { await audioSoundRef.current.stopAsync(); } catch (error) {}
      }
      return;
    }
    await startAudio(queue[nextIndex], 0);
  }

  async function saveAudioBookmark() {
    const item = audioItemRef.current || selectedItem;
    if (!item?.audio) return;
    const position = audioStatus.positionMillis || 0;
    const mark = {
      id: `audio-${Date.now()}`,
      resourceId: item.id,
      resourceTitle: item.title || 'بې نومه بیان',
      uri: item.audio,
      positionMillis: Math.floor(position),
      note: audioBookmarkText.trim(),
      scholar: item.scholar || '',
      section: item.section || '',
      createdAt: new Date().toISOString()
    };
    await saveAudioMarks([mark, ...audioMarks]);
    setAudioBookmarkText('');
    Alert.alert('خوندي شو', `د بیان ${formatDuration(position)} ځای او یادښت خوندي شول.`);
  }

  async function openAudioMark(mark) {
    const item = globalItems.find(value => value.id === mark.resourceId) || {
      id: mark.resourceId, title: mark.resourceTitle, audio: mark.uri,
      scholar: mark.scholar, section: mark.section
    };
    setSelectedItem(item);
    await startAudio(item, mark.positionMillis || 0);
  }

  async function deleteAudioMark(id) {
    Alert.alert('نښه حذف', 'دا د آډیو نښه حذف کړئ؟', [
      { text: 'نه', style: 'cancel' },
      { text: 'هو، حذف', style: 'destructive', onPress: () => saveAudioMarks(audioMarks.filter(mark => mark.id !== id)) }
    ]);
  }

  async function openPdf(item, page = null) {
    if (!item?.pdf) {
      Alert.alert('PDF نشته', 'د دې درس لپاره PDF فایل نه دی ثبت شوی.');
      return;
    }
    let targetPage = page;
    if (!targetPage) {
      try {
        const saved = await AsyncStorage.getItem(STORAGE.pdfProgress);
        if (saved) {
          const progress = JSON.parse(saved);
          if (progress.resourceId === item.id) targetPage = progress.page;
        }
      } catch (error) {}
    }
    targetPage = Math.max(1, targetPage || 1);
    setSelectedItem(item);
    setPdfInitialPage(targetPage);
    setPdfCurrentPage(targetPage);
    setPdfBookmarkText('');
    setScreen('pdfReader');
  }

  async function savePdfBookmark() {
    if (!selectedItem?.pdf) return;
    const mark = {
      id: `pdf-${Date.now()}`,
      resourceId: selectedItem.id,
      resourceTitle: selectedItem.title || 'بې نومه کتاب',
      uri: selectedItem.pdf,
      page: Math.max(1, pdfCurrentPage || 1),
      note: pdfBookmarkText.trim(),
      scholar: selectedItem.scholar || '',
      section: selectedItem.section || '',
      createdAt: new Date().toISOString()
    };
    await savePdfMarks([mark, ...pdfMarks]);
    setPdfBookmarkText('');
    Alert.alert('خوندي شو', `د کتاب ${mark.page} مخ او یادښت خوندي شول.`);
  }

  async function openPdfMark(mark) {
    const item = globalItems.find(value => value.id === mark.resourceId) || {
      id: mark.resourceId, title: mark.resourceTitle, pdf: mark.uri,
      scholar: mark.scholar, section: mark.section
    };
    openPdf(item, mark.page || 1);
  }

  async function deletePdfMark(id) {
    Alert.alert('نښه حذف', 'دا د کتاب نښه حذف کړئ؟', [
      { text: 'نه', style: 'cancel' },
      { text: 'هو، حذف', style: 'destructive', onPress: () => savePdfMarks(pdfMarks.filter(mark => mark.id !== id)) }
    ]);
  }

  function formatDuration(milliseconds) {
    const total = Math.max(0, Math.floor((milliseconds || 0) / 1000));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return hours > 0
      ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  async function exportManualBackup() {
    try {
      const payload = {
        app: 'ميراث اسلام', version: 1, exportedAt: new Date().toISOString(),
        audioMarks, pdfMarks, notes
      };
      const uri = `${FileSystem.cacheDirectory}mirath-islam-bookmarks-${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(uri, JSON.stringify(payload, null, 2));
      await shareFile(uri, 'application/json');
    } catch (error) {
      Alert.alert('Backup ستونزه', 'د یادښتونو Backup جوړ نه شو.');
    }
  }

  async function importManualBackup() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/*'], copyToCacheDirectory: true, multiple: false
      });
      if (result.canceled || !result.assets?.length) return;
      const raw = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const backup = JSON.parse(raw);
      if (!backup || backup.app !== 'ميراث اسلام') throw new Error('ناسم Backup');
      const mergedAudio = [...(backup.audioMarks || []), ...audioMarks];
      const mergedPdf = [...(backup.pdfMarks || []), ...pdfMarks];
      const mergedNotes = [...(backup.notes || []), ...notes];
      const unique = list => Array.from(new Map(list.map(item => [item.id, item])).values());
      await saveAudioMarks(unique(mergedAudio));
      await savePdfMarks(unique(mergedPdf));
      await saveNotes(unique(mergedNotes));
      Alert.alert('بریالی شو', 'Backup معلومات بېرته ورزیات شول.');
    } catch (error) {
      Alert.alert('Backup ستونزه', 'دا فایل سم Backup نه دی یا لوستل نه شو.');
    }
  }

  useEffect(() => {
    return () => {
      if (audioSoundRef.current) { try { audioSoundRef.current.pause(); audioSoundRef.current.clearLockScreenControls(); audioSoundRef.current.remove(); } catch (error) {} }
    };
  }, []);

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
          <View style={[styles.homeScreen, { backgroundColor: homeDesign.pageBackground }]}>
            <ScrollView style={styles.homeContent} contentContainerStyle={styles.homeScrollContent} showsVerticalScrollIndicator={false}>
              {/* د سرپاڼې ښکلی اسلامي سرلیک */}
              <View style={[styles.homeHeroHeader, { backgroundColor: homeDesign.headerBackground }]}>
                <View style={styles.headerTopActions}>
                  <TouchableOpacity
                    style={styles.headerActionButton}
                    onPress={() => setScreen('settings')}
                    accessibilityLabel="تنظیمات"
                  >
                    <Ionicons name="settings-outline" size={18} color={COLORS.gold} />
                  </TouchableOpacity>
                  <View style={styles.headerTopSpacer} />
                  <TouchableOpacity
                    style={styles.headerActionButton}
                    onPress={() => setScreen('reminders')}
                    accessibilityLabel="خبرتیاوې"
                  >
                    <Ionicons name="notifications-outline" size={18} color={COLORS.gold} />
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
              <View style={[styles.prayerCard, { backgroundColor: homeDesign.prayerBackground }]}>
                <View style={styles.prayerSearchRow}>
                  <TouchableOpacity
                    style={styles.homeSearchButton}
                    onPress={() => setScreen('search')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="search-outline" size={19} color={COLORS.gold} />
                    <Text style={styles.homeSearchPlaceholder}>پلټون...</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.prayerHeadingButton}
                    onPress={() => setScreen('prayer')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.prayerHeadingText}>اوقات الصلاة</Text>
                    <Ionicons name="time-outline" size={18} color={COLORS.goldLight} />
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
                      {settings.city || 'خپل موقعیت وټاکئ'}  ·  ⟳ وختونه تازه کړئ
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* علمي برخې؛ سرلیک لرې شوی، د برخو تڼۍ له پخواني سیستم سره تړلې دي */}
              <View style={styles.homeCategoriesGrid}>
                {SECTIONS.map((section, index) => {
                  const icons = ['book-outline', 'library-outline', 'time-outline', 'school-outline', 'help-circle-outline', 'albums-outline'];
                  return (
                    <TouchableOpacity
                      key={section}
                      style={homeFolderCardStyle(`section_${index}`, styles.homeCategoryCard)}
                      onPress={() => openSection(section)}
                      activeOpacity={0.82}
                    >
                      <Ionicons name={icons[index]} color={getHomeFolderDesign(`section_${index}`).folderIconColor} size={getHomeFolderDesign(`section_${index}`).iconSize} />
                      <Text style={homeFolderTitleStyle(`section_${index}`, styles.homeCategoryTitle)}>{section}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* د علماوو او مشایخو درسونه */}
              <TouchableOpacity
                style={homeFolderCardStyle('scholars', styles.homeLessonsCard)}
                onPress={() => setScreen('scholars')}
                activeOpacity={0.88}
              >
                <View style={styles.homeLessonsArtwork}>
                  <Text style={styles.homeBookGlow}>✧</Text>
                  <Ionicons name="book-outline" color={getHomeFolderDesign('scholars').folderIconColor} size={getHomeFolderDesign('scholars').iconSize + 8} />
                  <Text style={styles.homeBookStand}>⌁</Text>
                </View>
                <View style={styles.homeLessonsText}>
                  <Text style={homeFolderTitleStyle('scholars', styles.homeLessonsTitle)}>دروس المشایخ</Text>
                  <Text style={[styles.homeLessonsSubtitle, { color: getHomeFolderDesign('scholars').folderTextColor, fontSize: Math.max(9, getHomeFolderDesign('scholars').titleSize - 2), fontFamily: getHomeFolderDesign('scholars').fontFamily }]}>
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
                  style={homeFolderCardStyle('shortcut_0', styles.homeShortcutCard)}
                  onPress={() => setScreen('favorites')}
                  activeOpacity={0.82}
                >
                  <Ionicons name="heart-outline" color={getHomeFolderDesign('shortcut_0').folderIconColor} size={getHomeFolderDesign('shortcut_0').iconSize} />
                  <Text style={homeFolderTitleStyle('shortcut_0', styles.homeShortcutTitle)}>خوښ شوي فایلونه</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={homeFolderCardStyle('shortcut_1', styles.homeShortcutCard)}
                  onPress={() => openSection('سوالونه او ځوابونه')}
                  activeOpacity={0.82}
                >
                  <Ionicons name="help-circle-outline" color={getHomeFolderDesign('shortcut_1').folderIconColor} size={getHomeFolderDesign('shortcut_1').iconSize} />
                  <Text style={homeFolderTitleStyle('shortcut_1', styles.homeShortcutTitle)}>سوالات او جوابات</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={homeFolderCardStyle('shortcut_2', styles.homeShortcutCard)}
                  onPress={() => openSection('عمومي درسونه او کتابونه')}
                  activeOpacity={0.82}
                >
                  <Ionicons name="library-outline" color={getHomeFolderDesign('shortcut_2').folderIconColor} size={getHomeFolderDesign('shortcut_2').iconSize} />
                  <Text style={homeFolderTitleStyle('shortcut_2', styles.homeShortcutTitle)}>الکتب</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={homeFolderCardStyle('shortcut_3', styles.homeShortcutCard)}
                  onPress={() => setScreen('search')}
                  activeOpacity={0.82}
                >
                  <Ionicons name="school-outline" color={getHomeFolderDesign('shortcut_3').folderIconColor} size={getHomeFolderDesign('shortcut_3').iconSize} />
                  <Text style={homeFolderTitleStyle('shortcut_3', styles.homeShortcutTitle)}>د زده کړې مسیر</Text>
                </TouchableOpacity>
              </View>

              {/* اذکار او یادښتونه */}
              <View style={styles.homeWideCardsRow}>
                <TouchableOpacity
                  style={homeFolderCardStyle('wide_0', styles.homeWideCard)}
                  onPress={() => setScreen('adhkarHome')}
                  activeOpacity={0.82}
                >
                  <Ionicons name="moon-outline" color={getHomeFolderDesign('wide_0').folderIconColor} size={getHomeFolderDesign('wide_0').iconSize} />
                  <View style={styles.homeWideTextBox}>
                    <Text style={homeFolderTitleStyle('wide_0', styles.homeWideTitle)}>د سهار او ماښام اذکار</Text>
                    <Text style={homeFolderTitleStyle('wide_0', styles.homeWideSubtitle)}>ورځني اذکار</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={homeFolderCardStyle('wide_1', styles.homeWideCard)}
                  onPress={() => setScreen('notes')}
                  activeOpacity={0.82}
                >
                  <Ionicons name="document-text-outline" color={getHomeFolderDesign('wide_1').folderIconColor} size={getHomeFolderDesign('wide_1').iconSize} />
                  <View style={styles.homeWideTextBox}>
                    <Text style={homeFolderTitleStyle('wide_1', styles.homeWideTitle)}>زما نوټونه</Text>
                    <Text style={homeFolderTitleStyle('wide_1', styles.homeWideSubtitle)}>شخصي یادښتونه</Text>
                  </View>
                </TouchableOpacity>
              </View>



            </ScrollView>

            {/* ثابت لاندې مینو؛ یوازې په کورپاڼه کې ښکاري */}
            <View style={[styles.homeBottomNav, { marginBottom: homeDesign.navOffset, backgroundColor: homeDesign.navBackground }]}>
              <TouchableOpacity style={styles.homeNavItem} activeOpacity={0.75} onPress={() => setScreen('scholars')}>
                <Ionicons name="library-outline" size={20} color={COLORS.goldLight} />
                <Text style={styles.homeNavLabel}>کتابتون</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.homeNavItem} activeOpacity={0.75} onPress={() => setScreen('adhkarHome')}>
                <Ionicons name="moon-outline" size={20} color={COLORS.goldLight} />
                <Text style={styles.homeNavLabel}>اذکار</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.homeNavItem} activeOpacity={0.75} onPress={() => setScreen('notes')}>
                <Ionicons name="document-text-outline" size={20} color={COLORS.goldLight} />
                <Text style={styles.homeNavLabel}>نوټونه</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.homeNavItem} activeOpacity={0.75} onPress={() => setScreen('settings')}>
                <Ionicons name="settings-outline" size={20} color={COLORS.goldLight} />
                <Text style={styles.homeNavLabel}>تنظیمات</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.homeNavItem, styles.homeNavItemActive]} activeOpacity={0.75} onPress={() => setScreen('home')}>
                <Ionicons name="home" size={22} color={COLORS.gold} />
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
              <>
                <GoldButton title="▶ بیان واوره" onPress={() => startAudio(selectedItem)} />
                <GoldButton title="♫ آډیو شریکول" secondary onPress={() => shareFile(selectedItem.audio, 'audio/*')} />
              </>
            ) : null}

            {selectedItem?.pdf ? (
              <>
                <GoldButton title="▤ PDF کتاب ولوله" onPress={() => openPdf(selectedItem, 1)} />
                <GoldButton title="PDF شریکول" secondary onPress={() => shareFile(selectedItem.pdf, 'application/pdf')} />
              </>
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

            <View style={styles.bookmarkToolsRow}>
              <TouchableOpacity style={styles.bookmarkTool} onPress={() => setScreen('audioMarks')}>
                <Text style={styles.bookmarkToolTitle}>♫ د آډیو نښې ({audioMarks.length})</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bookmarkTool} onPress={() => setScreen('pdfMarks')}>
                <Text style={styles.bookmarkToolTitle}>▤ د کتاب نښې ({pdfMarks.length})</Text>
              </TouchableOpacity>
            </View>
            <GoldButton title="⬆ Backup صادرول" secondary onPress={exportManualBackup} />
            <GoldButton title="⬇ Backup بېرته راوستل" secondary onPress={importManualBackup} />

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
            د آډیو پلیر سکرین
        ================================================== */}
        {screen === 'audioPlayer' && (
          <ScrollView contentContainerStyle={styles.pageContent}>
            <PageHeader title="د بیان اورېدل" subtitle={audioItemRef.current?.scholar || 'آډیو پلیر'} onBack={goBack} />
            <View style={styles.audioPlayerCard}>
              <Text style={styles.audioPlayerTitle}>{audioItemRef.current?.title || selectedItem?.title || 'بیان'}</Text>
              <Text style={styles.audioPlayerMeta}>{audioItemRef.current?.scholar || ''}</Text>
              <TouchableOpacity
                activeOpacity={1}
                onLayout={event => setAudioTrackWidth(Math.max(1, event.nativeEvent.layout.width))}
                onPress={event => seekAudioToFraction(event.nativeEvent.locationX / audioTrackWidth)}
                style={styles.audioProgressTrack}
              >
                <View style={[styles.audioProgressFill, { width: `${audioStatus.durationMillis ? Math.min(100, audioStatus.positionMillis / audioStatus.durationMillis * 100) : 0}%` }]} />
              </TouchableOpacity>
              <View style={styles.audioTimeRow}>
                <Text style={styles.audioTime}>{formatDuration(audioStatus.positionMillis)}</Text>
                <Text style={styles.audioTime}>{formatDuration(audioStatus.durationMillis)}</Text>
              </View>
              <View style={styles.audioControlsRow}>
                <TouchableOpacity style={styles.audioSmallControl} onPress={() => playNextAudio(true)}><Text style={styles.audioControlText}>|◀</Text></TouchableOpacity>
                <TouchableOpacity style={styles.audioSmallControl} onPress={() => seekAudio(-15000)}><Text style={styles.audioControlText}>↶ 15</Text></TouchableOpacity>
                <TouchableOpacity style={styles.audioPlayButton} onPress={toggleAudioPlayback}><Text style={styles.audioPlayText}>{audioStatus.isPlaying ? 'Ⅱ' : '▶'}</Text></TouchableOpacity>
                <TouchableOpacity style={styles.audioSmallControl} onPress={() => seekAudio(15000)}><Text style={styles.audioControlText}>15 ↷</Text></TouchableOpacity>
                <TouchableOpacity style={styles.audioSmallControl} onPress={() => playNextAudio(false)}><Text style={styles.audioControlText}>▶|</Text></TouchableOpacity>
              </View>
              <View style={styles.audioRateRow}>
                {[0.75, 1, 1.25, 1.5, 2].map(rate => (
                  <TouchableOpacity key={rate} style={[styles.audioRateButton, audioStatus.rate === rate && styles.audioRateActive]} onPress={() => changeAudioRate(rate)}>
                    <Text style={styles.audioRateText}>{rate}x</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.bookmarkCard}>
              <Text style={styles.cardHeading}>دا ځای نښه او یادښت کړه</Text>
              <Text style={styles.bookmarkPosition}>اوسنی وخت: {formatDuration(audioStatus.positionMillis)}</Text>
              <Field label="شخصي یادښت (اختیاري)" value={audioBookmarkText} onChangeText={setAudioBookmarkText} placeholder="مهمه خبره دلته ولیکئ..." multiline />
              <GoldButton title="★ دا نقطه خوندي کړه" onPress={saveAudioBookmark} />
            </View>
            <GoldButton title={`د دې بیان ټولې نښې (${audioMarks.filter(mark => mark.resourceId === audioItemRef.current?.id).length})`} secondary onPress={() => setScreen('audioMarks')} />
          </ScrollView>
        )}

        {/* د PDF لوستلو سکرین */}
        {screen === 'pdfReader' && (
          <View style={styles.pdfScreen}>
            <View style={styles.pdfHeader}>
              <TouchableOpacity onPress={goBack} style={styles.pdfHeaderButton}><Text style={styles.pdfHeaderButtonText}>→ شاته</Text></TouchableOpacity>
              <Text numberOfLines={1} style={styles.pdfHeaderTitle}>{selectedItem?.title || 'کتاب'}</Text>
              <Text style={styles.pdfPageCounter}>{pdfCurrentPage}/{pdfTotalPages || '—'}</Text>
            </View>
            <View style={styles.pdfViewerWrap}>
              {selectedItem?.pdf ? (
                <Pdf
                  key={`${selectedItem.id}-${pdfInitialPage}`}
                  source={{ uri: selectedItem.pdf, cache: true }}
                  page={pdfInitialPage}
                  onLoadComplete={(numberOfPages) => setPdfTotalPages(numberOfPages)}
                  onPageChanged={(page) => {
                    setPdfCurrentPage(page);
                    AsyncStorage.setItem(STORAGE.pdfProgress, JSON.stringify({ resourceId: selectedItem.id, page })).catch(() => {});
                  }}
                  onError={() => Alert.alert('PDF ستونزه', 'کتاب پرانیستل نه شو. د فایل URI او د PDF ماډیول نصب وګورئ.')}
                  style={styles.pdfViewer}
                  enablePaging={false}
                  horizontal={false}
                  fitPolicy={0}
                  spacing={8}
                />
              ) : <Text style={styles.emptyText}>PDF فایل نشته.</Text>}
            </View>
            <View style={styles.pdfBookmarkPanel}>
              <Text style={styles.pdfBookmarkTitle}>مخ {pdfCurrentPage} نښه کړه</Text>
              <TextInput style={styles.bookmarkInput} value={pdfBookmarkText} onChangeText={setPdfBookmarkText} placeholder="د دې مخ شخصي یادښت (اختیاري)" placeholderTextColor={COLORS.muted} multiline />
              <View style={styles.pdfActionRow}>
                <TouchableOpacity style={styles.pdfActionButton} onPress={savePdfBookmark}><Text style={styles.pdfActionText}>★ نښه خوندي کړه</Text></TouchableOpacity>
                <TouchableOpacity style={styles.pdfActionButton} onPress={() => shareFile(selectedItem?.pdf, 'application/pdf')}><Text style={styles.pdfActionText}>شریکول</Text></TouchableOpacity>
                <TouchableOpacity style={styles.pdfActionButton} onPress={() => setScreen('pdfMarks')}><Text style={styles.pdfActionText}>نښې ({pdfMarks.length})</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* د آډیو خوندي نښې - له PDF نښو جلا */}
        {screen === 'audioMarks' && (
          <ScrollView contentContainerStyle={styles.pageContent}>
            <PageHeader title="د آډیو نښې" subtitle="خوندي شوي دقیق وختونه او شخصي یادښتونه" onBack={goBack} />
            {audioMarks.map(mark => (
              <View key={mark.id} style={styles.bookmarkListCard}>
                <TouchableOpacity style={styles.flexText} onPress={() => openAudioMark(mark)}>
                  <Text style={styles.lessonTitle}>{mark.resourceTitle}</Text>
                  <Text style={styles.bookmarkPosition}>{formatDuration(mark.positionMillis)}</Text>
                  {!!mark.note && <Text style={styles.smallMuted}>{mark.note}</Text>}
                  <Text style={styles.bookmarkOpenText}>▶ له همدې ځایه واوره</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteAudioMark(mark.id)}><Text style={styles.deleteIcon}>حذف</Text></TouchableOpacity>
              </View>
            ))}
            {!audioMarks.length && <Text style={styles.emptyText}>تر اوسه د آډیو کومه نښه نه ده خوندي شوې.</Text>}
          </ScrollView>
        )}

        {/* د PDF خوندي نښې - له آډیو نښو جلا */}
        {screen === 'pdfMarks' && (
          <ScrollView contentContainerStyle={styles.pageContent}>
            <PageHeader title="د کتابونو نښې" subtitle="خوندي شوي مخونه او شخصي یادښتونه" onBack={goBack} />
            {pdfMarks.map(mark => (
              <View key={mark.id} style={styles.bookmarkListCard}>
                <TouchableOpacity style={styles.flexText} onPress={() => openPdfMark(mark)}>
                  <Text style={styles.lessonTitle}>{mark.resourceTitle}</Text>
                  <Text style={styles.bookmarkPosition}>مخ {mark.page}</Text>
                  {!!mark.note && <Text style={styles.smallMuted}>{mark.note}</Text>}
                  <Text style={styles.bookmarkOpenText}>▤ همدا مخ پرانیزه</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deletePdfMark(mark.id)}><Text style={styles.deleteIcon}>حذف</Text></TouchableOpacity>
              </View>
            ))}
            {!pdfMarks.length && <Text style={styles.emptyText}>تر اوسه د کتاب کوم مخ نه دی نښه شوی.</Text>}
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
                د کورپاڼې ډیزاین او شخصي اختیارونه
              </Text>
              <Text style={styles.mutedText}>د فولډرونو اندازه، رنګونه، لیکدود، چوکاټ او د کورپاڼې عمومي بڼه پخپله تنظیم کړئ.</Text>
              <GoldButton title="د کورپاڼې ډیزاین تنظیمول" onPress={() => setScreen('homeDesign')} />
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

        {screen === 'homeDesign' && (
          <ScrollView contentContainerStyle={styles.pageContent}>
            <PageHeader title="د کورپاڼې ډیزاین" subtitle="ټول رنګونه او فولډرونه په خپل اختیار برابر کړئ" onBack={() => setScreen('settings')} />

            <View style={styles.formCard}>
              <Text style={styles.cardHeading}>د کورپاڼې عمومي شالید</Text>
              <View style={styles.designColorGrid}>
                {['#E8EEE8', '#17231B', '#FFFFFF', '#F1E4C5', '#DCE8F1', '#242B35'].map(color => (
                  <TouchableOpacity key={color} onPress={() => updateHomeDesign({ pageBackground: color })} style={[styles.designColorButton, { backgroundColor: color, borderColor: homeDesign.pageBackground === color ? COLORS.gold : COLORS.border }]} />
                ))}
              </View>
              <Text style={styles.designLabel}>خپل خوښ رنګ ولیکئ (HEX)</Text>
              <TextInput value={designCustomColor} onChangeText={setDesignCustomColor} autoCapitalize="characters" placeholder="#12A4EF" placeholderTextColor={COLORS.muted} style={styles.designColorInput} />
              <View style={styles.designOptionRow}>
                {[{ key: 'pageBackground', label: 'د پاڼې شالید' }, { key: 'headerBackground', label: 'سرلیک' }, { key: 'prayerBackground', label: 'د لمانځه کارت' }, { key: 'navBackground', label: 'لاندې مینو' }, { key: 'folderBackground', label: 'د فولډر شالید' }, { key: 'folderTextColor', label: 'لیکل' }, { key: 'folderIconColor', label: 'نښې' }, { key: 'folderBorderColor', label: 'چوکاټ' }].map(item => (
                  <TouchableOpacity key={item.key} onPress={() => applyCustomHomeColor(item.key)} style={styles.designChoice}><Text style={styles.designChoiceText}>{item.label}</Text></TouchableOpacity>
                ))}
              </View>
              <Text style={styles.designLabel}>د سرلیک شالید</Text>
              <View style={styles.designColorGrid}>
                {HOME_COLOR_OPTIONS.slice(0, 12).map(color => (
                  <TouchableOpacity key={color} onPress={() => updateHomeDesign({ headerBackground: color })} style={[styles.designColorButton, { backgroundColor: color, borderColor: homeDesign.headerBackground === color ? COLORS.gold : COLORS.border }]} />
                ))}
              </View>
              <Text style={styles.designLabel}>د لمانځه کارت شالید</Text>
              <View style={styles.designColorGrid}>
                {HOME_COLOR_OPTIONS.slice(0, 12).map(color => (
                  <TouchableOpacity key={color} onPress={() => updateHomeDesign({ prayerBackground: color })} style={[styles.designColorButton, { backgroundColor: color, borderColor: homeDesign.prayerBackground === color ? COLORS.gold : COLORS.border }]} />
                ))}
              </View>
              <Text style={styles.designLabel}>د لاندې مینو شالید</Text>
              <View style={styles.designColorGrid}>
                {HOME_COLOR_OPTIONS.slice(0, 12).map(color => (
                  <TouchableOpacity key={color} onPress={() => updateHomeDesign({ navBackground: color })} style={[styles.designColorButton, { backgroundColor: color, borderColor: homeDesign.navBackground === color ? COLORS.gold : COLORS.border }]} />
                ))}
              </View>
              <Text style={styles.cardHeading}>ټول فولډرونه – عمومي بڼه</Text>
              <Text style={styles.designLabel}>د فولډر شالید رنګ</Text>
              <View style={styles.designColorGrid}>
                {HOME_COLOR_OPTIONS.slice(0, 12).map(color => (
                  <TouchableOpacity key={color} onPress={() => updateHomeDesign({ folderBackground: color })} style={[styles.designColorButton, { backgroundColor: color, borderColor: homeDesign.folderBackground === color ? COLORS.gold : COLORS.border }]} />
                ))}
              </View>
              <Text style={styles.designLabel}>د لیکلو رنګ</Text>
              <View style={styles.designColorGrid}>
                {HOME_COLOR_OPTIONS.slice(12).map(color => (
                  <TouchableOpacity key={color} onPress={() => updateHomeDesign({ folderTextColor: color })} style={[styles.designColorButton, { backgroundColor: color, borderColor: homeDesign.folderTextColor === color ? COLORS.gold : COLORS.border }]} />
                ))}
              </View>
              <Text style={styles.designLabel}>د نښو رنګ</Text>
              <View style={styles.designColorGrid}>
                {HOME_COLOR_OPTIONS.slice(12).map(color => (
                  <TouchableOpacity key={color} onPress={() => updateHomeDesign({ folderIconColor: color })} style={[styles.designColorButton, { backgroundColor: color, borderColor: homeDesign.folderIconColor === color ? COLORS.gold : COLORS.border }]} />
                ))}
              </View>
              <Text style={styles.designLabel}>د چوکاټ رنګ</Text>
              <View style={styles.designColorGrid}>
                {HOME_COLOR_OPTIONS.slice(0, 12).map(color => (
                  <TouchableOpacity key={color} onPress={() => updateHomeDesign({ folderBorderColor: color })} style={[styles.designColorButton, { backgroundColor: color, borderColor: homeDesign.folderBorderColor === color ? '#FFFFFF' : COLORS.border, borderWidth: homeDesign.folderBorderColor === color ? 3 : 1 }]} />
                ))}
              </View>
              <Text style={styles.designLabel}>د چوکاټ بڼه</Text>
              <View style={styles.designOptionRow}>
                {[{ value: 'solid', label: 'پرله‌پسې' }, { value: 'dashed', label: 'کرښې' }, { value: 'dotted', label: 'ټکي' }].map(item => (
                  <TouchableOpacity key={item.value} onPress={() => updateHomeDesign({ folderBorderStyle: item.value })} style={[styles.designChoice, homeDesign.folderBorderStyle === item.value && styles.designChoiceActive]}>
                    <Text style={styles.designChoiceText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.designLabel}>د لیکلو فونټ</Text>
              <View style={styles.designOptionRow}>
                {['System', 'sans-serif', 'serif', 'monospace'].map(font => (
                  <TouchableOpacity key={font} onPress={() => updateHomeDesign({ fontFamily: font })} style={[styles.designChoice, homeDesign.fontFamily === font && styles.designChoiceActive]}>
                    <Text style={styles.designChoiceText}>{font === 'System' ? 'اصلي' : font}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.designLabel}>د لیکلو اندازه: {homeDesign.titleSize}</Text>
              <View style={styles.designOptionRow}>
                <TouchableOpacity style={styles.designStepButton} onPress={() => updateHomeDesign({ titleSize: Math.max(8, homeDesign.titleSize - 1) })}><Text style={styles.designStepText}>− کوچنی</Text></TouchableOpacity>
                <TouchableOpacity style={styles.designStepButton} onPress={() => updateHomeDesign({ titleSize: Math.min(24, homeDesign.titleSize + 1) })}><Text style={styles.designStepText}>+ غټ</Text></TouchableOpacity>
              </View>
              <Text style={styles.designLabel}>د نښې اندازه: {homeDesign.iconSize}</Text>
              <View style={styles.designOptionRow}>
                <TouchableOpacity style={styles.designStepButton} onPress={() => updateHomeDesign({ iconSize: Math.max(12, homeDesign.iconSize - 1) })}><Text style={styles.designStepText}>− کوچنۍ</Text></TouchableOpacity>
                <TouchableOpacity style={styles.designStepButton} onPress={() => updateHomeDesign({ iconSize: Math.min(42, homeDesign.iconSize + 1) })}><Text style={styles.designStepText}>+ غټه</Text></TouchableOpacity>
              </View>
              <Text style={styles.designLabel}>د فولډر لوړوالی: {homeDesign.folderHeight}</Text>
              <View style={styles.designOptionRow}>
                <TouchableOpacity style={styles.designStepButton} onPress={() => updateHomeDesign({ folderHeight: Math.max(38, homeDesign.folderHeight - 3) })}><Text style={styles.designStepText}>− کوچنی</Text></TouchableOpacity>
                <TouchableOpacity style={styles.designStepButton} onPress={() => updateHomeDesign({ folderHeight: Math.min(130, homeDesign.folderHeight + 3) })}><Text style={styles.designStepText}>+ غټ</Text></TouchableOpacity>
              </View>
              <Text style={styles.designLabel}>د چوکاټ پلنوالی: {homeDesign.folderBorderWidth}</Text>
              <View style={styles.designOptionRow}>
                <TouchableOpacity style={styles.designStepButton} onPress={() => updateHomeDesign({ folderBorderWidth: Math.max(0, homeDesign.folderBorderWidth - 1) })}><Text style={styles.designStepText}>− نری</Text></TouchableOpacity>
                <TouchableOpacity style={styles.designStepButton} onPress={() => updateHomeDesign({ folderBorderWidth: Math.min(7, homeDesign.folderBorderWidth + 1) })}><Text style={styles.designStepText}>+ پلن</Text></TouchableOpacity>
              </View>
              <Text style={styles.designLabel}>د چوکاټ ګردوالی: {homeDesign.folderRadius}</Text>
              <View style={styles.designOptionRow}>
                <TouchableOpacity style={styles.designStepButton} onPress={() => updateHomeDesign({ folderRadius: Math.max(0, homeDesign.folderRadius - 2) })}><Text style={styles.designStepText}>− مربع</Text></TouchableOpacity>
                <TouchableOpacity style={styles.designStepButton} onPress={() => updateHomeDesign({ folderRadius: Math.min(40, homeDesign.folderRadius + 2) })}><Text style={styles.designStepText}>+ ګرد</Text></TouchableOpacity>
              </View>
              <Text style={styles.designLabel}>د فولډرونو ترمنځ فاصله: {homeDesign.gap}</Text>
              <View style={styles.designOptionRow}>
                <TouchableOpacity style={styles.designStepButton} onPress={() => updateHomeDesign({ gap: Math.max(0, homeDesign.gap - 1) })}><Text style={styles.designStepText}>− فاصله کمه</Text></TouchableOpacity>
                <TouchableOpacity style={styles.designStepButton} onPress={() => updateHomeDesign({ gap: Math.min(16, homeDesign.gap + 1) })}><Text style={styles.designStepText}>+ فاصله زیاته</Text></TouchableOpacity>
              </View>
              <Text style={styles.designLabel}>د لاندې مینو لوړوالی/پورته کېدل: {homeDesign.navOffset}</Text>
              <View style={styles.designOptionRow}>
                <TouchableOpacity style={styles.designStepButton} onPress={() => updateHomeDesign({ navOffset: Math.max(20, homeDesign.navOffset - 4) })}><Text style={styles.designStepText}>− ښکته</Text></TouchableOpacity>
                <TouchableOpacity style={styles.designStepButton} onPress={() => updateHomeDesign({ navOffset: Math.min(90, homeDesign.navOffset + 4) })}><Text style={styles.designStepText}>+ پورته</Text></TouchableOpacity>
              </View>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.cardHeading}>د هر فولډر جلا تنظیم</Text>
              <Text style={styles.designLabel}>هغه فولډر وټاکئ چې ډیزاین یې بدلول غواړئ</Text>
              <View style={styles.designFolderList}>
                {HOME_FOLDER_OPTIONS.map(item => (
                  <TouchableOpacity key={item.key} onPress={() => setDesignFolderKey(item.key)} style={[styles.designFolderChoice, designFolderKey === item.key && styles.designChoiceActive]}>
                    <Text style={styles.designChoiceText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.designLabel}>د ټاکلي فولډر شالید رنګ</Text>
              <View style={styles.designColorGrid}>
                {HOME_COLOR_OPTIONS.slice(0, 12).map(color => (
                  <TouchableOpacity key={color} onPress={() => updateHomeDesign({ folderBackground: color }, designFolderKey)} style={[styles.designColorButton, { backgroundColor: color, borderColor: getHomeFolderDesign(designFolderKey).folderBackground === color ? '#FFFFFF' : COLORS.border, borderWidth: getHomeFolderDesign(designFolderKey).folderBackground === color ? 3 : 1 }]} />
                ))}
              </View>
              <Text style={styles.designLabel}>د ټاکلي فولډر د لیکلو رنګ</Text>
              <View style={styles.designColorGrid}>
                {HOME_COLOR_OPTIONS.slice(12).map(color => (
                  <TouchableOpacity key={color} onPress={() => updateHomeDesign({ folderTextColor: color }, designFolderKey)} style={[styles.designColorButton, { backgroundColor: color, borderColor: COLORS.border }]} />
                ))}
              </View>
              <Text style={styles.designLabel}>د ټاکلي فولډر د نښو رنګ</Text>
              <View style={styles.designColorGrid}>
                {HOME_COLOR_OPTIONS.slice(12).map(color => (
                  <TouchableOpacity key={color} onPress={() => updateHomeDesign({ folderIconColor: color }, designFolderKey)} style={[styles.designColorButton, { backgroundColor: color, borderColor: COLORS.border }]} />
                ))}
              </View>
              <Text style={styles.designLabel}>د ټاکلي فولډر لپاره ځانګړی رنګ (HEX)</Text>
              <TextInput value={designCustomColor} onChangeText={setDesignCustomColor} autoCapitalize="characters" placeholder="#12A4EF" placeholderTextColor={COLORS.muted} style={styles.designColorInput} />
              <View style={styles.designOptionRow}>
                {[{ key: 'folderBackground', label: 'شالید' }, { key: 'folderTextColor', label: 'لیکل' }, { key: 'folderIconColor', label: 'نښې' }, { key: 'folderBorderColor', label: 'چوکاټ' }].map(item => (
                  <TouchableOpacity key={item.key} onPress={() => applyCustomHomeColor(item.key, designFolderKey)} style={styles.designChoice}><Text style={styles.designChoiceText}>{item.label}</Text></TouchableOpacity>
                ))}
              </View>
              <Text style={styles.designLabel}>د ټاکلي فولډر چوکاټ جلا رنګ</Text>
              <View style={styles.designColorGrid}>
                {HOME_COLOR_OPTIONS.slice(0, 12).map(color => (
                  <TouchableOpacity key={color} onPress={() => updateHomeDesign({ folderBorderColor: color }, designFolderKey)} style={[styles.designColorButton, { backgroundColor: color, borderColor: COLORS.border }]} />
                ))}
              </View>
              <Text style={styles.designLabel}>د ټاکلي فولډر د لیکلو اندازه: {getHomeFolderDesign(designFolderKey).titleSize}</Text>
              <View style={styles.designOptionRow}>
                <TouchableOpacity style={styles.designStepButton} onPress={() => updateHomeDesign({ titleSize: Math.max(8, getHomeFolderDesign(designFolderKey).titleSize - 1) }, designFolderKey)}><Text style={styles.designStepText}>− کوچنی</Text></TouchableOpacity>
                <TouchableOpacity style={styles.designStepButton} onPress={() => updateHomeDesign({ titleSize: Math.min(24, getHomeFolderDesign(designFolderKey).titleSize + 1) }, designFolderKey)}><Text style={styles.designStepText}>+ غټ</Text></TouchableOpacity>
              </View>
              <Text style={styles.designLabel}>د ټاکلي فولډر د نښې اندازه: {getHomeFolderDesign(designFolderKey).iconSize}</Text>
              <View style={styles.designOptionRow}>
                <TouchableOpacity style={styles.designStepButton} onPress={() => updateHomeDesign({ iconSize: Math.max(12, getHomeFolderDesign(designFolderKey).iconSize - 1) }, designFolderKey)}><Text style={styles.designStepText}>− کوچنۍ</Text></TouchableOpacity>
                <TouchableOpacity style={styles.designStepButton} onPress={() => updateHomeDesign({ iconSize: Math.min(42, getHomeFolderDesign(designFolderKey).iconSize + 1) }, designFolderKey)}><Text style={styles.designStepText}>+ غټه</Text></TouchableOpacity>
              </View>
              <Text style={styles.designLabel}>د ټاکلي فولډر لوړوالی: {getHomeFolderDesign(designFolderKey).folderHeight}</Text>
              <View style={styles.designOptionRow}>
                <TouchableOpacity style={styles.designStepButton} onPress={() => updateHomeDesign({ folderHeight: Math.max(38, getHomeFolderDesign(designFolderKey).folderHeight - 3) }, designFolderKey)}><Text style={styles.designStepText}>− کوچنی</Text></TouchableOpacity>
                <TouchableOpacity style={styles.designStepButton} onPress={() => updateHomeDesign({ folderHeight: Math.min(130, getHomeFolderDesign(designFolderKey).folderHeight + 3) }, designFolderKey)}><Text style={styles.designStepText}>+ غټ</Text></TouchableOpacity>
              </View>
              <Text style={styles.designLabel}>د ټاکلي فولډر د چوکاټ بڼه</Text>
              <View style={styles.designOptionRow}>
                {[{ value: 'solid', label: 'پرله‌پسې' }, { value: 'dashed', label: 'کرښې' }, { value: 'dotted', label: 'ټکي' }].map(item => (
                  <TouchableOpacity key={item.value} onPress={() => updateHomeDesign({ folderBorderStyle: item.value }, designFolderKey)} style={[styles.designChoice, getHomeFolderDesign(designFolderKey).folderBorderStyle === item.value && styles.designChoiceActive]}>
                    <Text style={styles.designChoiceText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.designLabel}>د ټاکلي فولډر د چوکاټ پلنوالی: {getHomeFolderDesign(designFolderKey).folderBorderWidth}</Text>
              <View style={styles.designOptionRow}>
                <TouchableOpacity style={styles.designStepButton} onPress={() => updateHomeDesign({ folderBorderWidth: Math.max(0, getHomeFolderDesign(designFolderKey).folderBorderWidth - 1) }, designFolderKey)}><Text style={styles.designStepText}>− نری</Text></TouchableOpacity>
                <TouchableOpacity style={styles.designStepButton} onPress={() => updateHomeDesign({ folderBorderWidth: Math.min(7, getHomeFolderDesign(designFolderKey).folderBorderWidth + 1) }, designFolderKey)}><Text style={styles.designStepText}>+ پلن</Text></TouchableOpacity>
              </View>
              <Text style={styles.designLabel}>د ټاکلي فولډر د چوکاټ ګردوالی: {getHomeFolderDesign(designFolderKey).folderRadius}</Text>
              <View style={styles.designOptionRow}>
                <TouchableOpacity style={styles.designStepButton} onPress={() => updateHomeDesign({ folderRadius: Math.max(0, getHomeFolderDesign(designFolderKey).folderRadius - 2) }, designFolderKey)}><Text style={styles.designStepText}>− مربع</Text></TouchableOpacity>
                <TouchableOpacity style={styles.designStepButton} onPress={() => updateHomeDesign({ folderRadius: Math.min(40, getHomeFolderDesign(designFolderKey).folderRadius + 2) }, designFolderKey)}><Text style={styles.designStepText}>+ ګرد</Text></TouchableOpacity>
              </View>
              <Text style={styles.designLabel}>د ټاکلي فولډر فونټ</Text>
              <View style={styles.designOptionRow}>
                {['System', 'sans-serif', 'serif', 'monospace'].map(font => (
                  <TouchableOpacity key={font} onPress={() => updateHomeDesign({ fontFamily: font }, designFolderKey)} style={[styles.designChoice, getHomeFolderDesign(designFolderKey).fontFamily === font && styles.designChoiceActive]}>
                    <Text style={styles.designChoiceText}>{font === 'System' ? 'اصلي' : font}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <GoldButton title="د ټولو فولډرونو جلا تنظیمات پاکول" secondary onPress={() => updateHomeDesign({ perFolder: {} })} />
              <GoldButton title="اصلي ډیزاین ته ستنېدل" secondary onPress={() => updateSettings({ homeDesign: DEFAULT_HOME_DESIGN })} />
            </View>
            <GoldButton title="کورپاڼې ته ستنېدل" onPress={() => setScreen('home')} />
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
    backgroundColor: '#E8EEE8'
  },

  homeContent: {
    flex: 1,
  },

  homeScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 7,
    paddingTop: 2,
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
    backgroundColor: '#064027',
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
    color: '#FFFFFF',
    fontSize: 11,
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
    backgroundColor: '#08452C',
    borderWidth: 3,
    borderColor: COLORS.gold,
    borderRadius: 27,
    padding: 4,
    marginBottom: 5,
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
    minHeight: 25,
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
    color: '#FFFFFF',
    fontSize: 11
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
    paddingVertical: 1,
    borderRightWidth: 1.5,
    borderRightColor: COLORS.gold
  },

  homePrayerIcon: {
    color: COLORS.gold,
    fontSize: 13,
    marginBottom: 0
  },

  homePrayerName: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 0
  },

  homePrayerTime: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold'
  },

  homePrayerRefresh: {
    alignItems: 'center',
    paddingTop: 1,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },

  homePrayerRefreshText: {
    color: '#FFFFFF',
    fontSize: 8
  },

  homeLessonsCard: {
    minHeight: 65,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#075033',
    borderWidth: 3,
    borderColor: COLORS.gold,
    borderRadius: 31,
    padding: 5,
    marginTop: 2,
    marginBottom: 2,
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
    color: '#FFFFFF',
    fontSize: 10,
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
    gap: 3,
    marginTop: 1,
    marginBottom: 2
  },

  homeShortcutCard: {
    flex: 1,
    minHeight: 56,
    backgroundColor: '#075033',
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
    fontSize: 23,
    marginBottom: 1
  },

  homeShortcutTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center'
  },

  homeWideCardsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 3,
    marginTop: 1,
    marginBottom: 1
  },

  homeWideCard: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#075033',
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
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'right'
  },

  homeWideSubtitle: {
    color: '#F4F7F4',
    fontSize: 8,
    marginTop: 1,
    textAlign: 'right'
  },

  homeSectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 0,
    marginBottom: 1
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
    marginTop: 0,
    marginBottom: 0
  },

  homeCategoryCard: {
    width: '32%',
    minHeight: 48,
    backgroundColor: '#105239',
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
    fontSize: 20,
    marginBottom: 0
  },

  homeCategoryTitle: {
    color: '#FFFFFF',
    fontSize: 11,
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
    minHeight: 54,
    // مینو د سور نښه شوي حد څخه پورته ساتل کېږي؛ لاندې د سیستم navigation لپاره تشه پاتې ده
    marginBottom: Platform.OS === 'android' ? 48 : 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#022417',
    borderTopWidth: 3,
    borderTopColor: COLORS.gold,
    paddingTop: 2,
    paddingBottom: Platform.OS === 'ios' ? 7 : 2,
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
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold'
  },

  homeNavLabelActive: {
    color: COLORS.gold,
    fontSize: 9,
    fontWeight: 'bold'
  },

  mutedText: { color: COLORS.muted, fontSize: 11, textAlign: 'right', marginBottom: 8 },
  designColorGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 8, justifyContent: 'flex-start'
  },
  designColorButton: { width: 34, height: 34, borderRadius: 18, borderWidth: 2 },
  designColorInput: { backgroundColor: COLORS.card2, borderColor: COLORS.gold, borderWidth: 1, borderRadius: 9, color: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 9, textAlign: 'left', fontSize: 14 },
  designLabel: { color: COLORS.goldLight, fontSize: 13, fontWeight: 'bold', textAlign: 'right', marginTop: 12, marginBottom: 5 },
  designOptionRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 7, marginVertical: 5 },
  designChoice: { backgroundColor: COLORS.card2, borderColor: COLORS.border, borderWidth: 1, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8 },
  designChoiceActive: { borderColor: COLORS.gold, borderWidth: 2, backgroundColor: '#315B42' },
  designChoiceText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  designStepButton: { flex: 1, minWidth: 100, backgroundColor: COLORS.card2, borderWidth: 1, borderColor: COLORS.gold, borderRadius: 10, padding: 10, alignItems: 'center' },
  designStepText: { color: COLORS.goldLight, fontSize: 12, fontWeight: 'bold' },
  designFolderList: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6, marginVertical: 8 },
  designFolderChoice: { backgroundColor: COLORS.card2, borderWidth: 1, borderColor: COLORS.border, borderRadius: 9, paddingHorizontal: 9, paddingVertical: 8 },

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
  },

  bookmarkToolsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  bookmarkTool: { flex: 1, backgroundColor: COLORS.card, borderColor: COLORS.gold, borderWidth: 1, borderRadius: 12, padding: 13, alignItems: 'center' },
  bookmarkToolTitle: { color: COLORS.goldLight, fontSize: 12, fontWeight: 'bold' },
  audioPlayerCard: { backgroundColor: '#FDFCF9', borderRadius: 24, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: '#E7E1D5', elevation: 3 },
  audioPlayerTitle: { color: '#1B2921', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  audioPlayerMeta: { color: '#77766F', fontSize: 12, textAlign: 'center', marginTop: 5, marginBottom: 24 },
  audioProgressTrack: { height: 7, borderRadius: 8, backgroundColor: '#D5DED8', overflow: 'hidden' },
  audioProgressFill: { height: 7, borderRadius: 8, backgroundColor: '#176149' },
  audioTimeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  audioTime: { color: '#59645E', fontSize: 12 },
  audioControlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, marginBottom: 22 },
  audioSmallControl: { minWidth: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  audioControlText: { color: '#234A3B', fontSize: 15, fontWeight: 'bold' },
  audioPlayButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#176149', alignItems: 'center', justifyContent: 'center', elevation: 5 },
  audioPlayText: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
  audioRateRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#E4E0D7', paddingTop: 14 },
  audioRateButton: { borderRadius: 18, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: '#DDD8CC' },
  audioRateActive: { backgroundColor: '#176149', borderColor: '#176149' },
  audioRateText: { color: '#4D5B53', fontSize: 11 },
  bookmarkCard: { backgroundColor: COLORS.card, borderColor: COLORS.gold, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 14 },
  bookmarkPosition: { color: COLORS.gold, fontSize: 13, fontWeight: 'bold', textAlign: 'right', marginVertical: 5 },
  bookmarkListCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 13, padding: 13, marginBottom: 9, gap: 10 },
  bookmarkOpenText: { color: COLORS.gold, fontSize: 12, fontWeight: 'bold', textAlign: 'right', marginTop: 7 },
  pdfScreen: { flex: 1, backgroundColor: '#EAE7DF' },
  pdfHeader: { minHeight: 52, backgroundColor: COLORS.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, borderBottomWidth: 1, borderColor: COLORS.gold },
  pdfHeaderButton: { padding: 8 },
  pdfHeaderButtonText: { color: COLORS.gold, fontWeight: 'bold' },
  pdfHeaderTitle: { color: COLORS.white, flex: 1, textAlign: 'center', fontWeight: 'bold', marginHorizontal: 8 },
  pdfPageCounter: { color: COLORS.goldLight, minWidth: 45, textAlign: 'right' },
  pdfViewerWrap: { flex: 1 },
  pdfViewer: { flex: 1, width: '100%', backgroundColor: '#EAE7DF' },
  pdfBookmarkPanel: { backgroundColor: COLORS.card, borderTopWidth: 2, borderColor: COLORS.gold, padding: 10 },
  pdfBookmarkTitle: { color: COLORS.gold, textAlign: 'right', fontWeight: 'bold', marginBottom: 5 },
  bookmarkInput: { minHeight: 42, maxHeight: 76, color: COLORS.white, borderColor: COLORS.border, borderWidth: 1, borderRadius: 9, padding: 9, textAlign: 'right', marginBottom: 8 },
  pdfActionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  pdfActionButton: { flex: 1, backgroundColor: COLORS.green, borderRadius: 8, padding: 10, alignItems: 'center' },
  pdfActionText: { color: COLORS.goldLight, fontSize: 11, fontWeight: 'bold' }

});
  // ==================================================
