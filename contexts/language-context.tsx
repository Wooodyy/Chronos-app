"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Типы для языковых данных
type LanguageType = "ru" | "kz" | "en"

// Интерфейс для контекста языка
interface LanguageContextType {
  language: LanguageType
  setLanguage: (lang: LanguageType) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

// Создаем контекст
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Расширим объект переводов, добавив все необходимые строки для страницы календаря
const translations = {
  ru: {
    // Sidebar items
    "menu.calendar": "Календарь",
    "menu.reminders": "Напоминания",
    "menu.notes": "Заметки",
    "menu.profile": "Профиль",
    "menu.voice": "Голосовой ввод",

    // Mobile FAB items
    "fab.note": "Заметка",
    "fab.task": "Задача",
    "fab.reminder": "Напоминание",

    // Calendar
    "calendar.weekView": "Недельный просмотр",
    "calendar.monthView": "Месячный просмотр",
    "calendar.today": "Сегодня",
    "calendar.week": "Неделя",
    "calendar.month": "Месяц",
    "calendar.swipeToNavigate": "Свайпните для навигации",

    // Dashboard page
    "dashboard.title": "Календарь",
    "dashboard.welcome": "Добро пожаловать",
    "dashboard.all": "Все",
    "dashboard.tasks": "Задачи",
    "dashboard.reminders": "Напоминания",
    "dashboard.notes": "Заметки",
    "dashboard.eventsFor": "События на",

    // Events count
    "events.count.one": "событие",
    "events.count.few": "события",
    "events.count.many": "событий",

    // Empty state
    "events.empty.title": "Событий не найдено",
    "events.empty.description": 'На выбранную дату нет событий. Создайте новое событие, нажав на кнопку "Создать".',
    "events.create": "Создать",

    // Add Entry Button
    "addEntry.create": "Создать",
    "addEntry.newTask": "Новая задача",
    "addEntry.newNote": "Новая заметка",
    "addEntry.newReminder": "Новое напоминание",

    // Months
    "month.january": "январь",
    "month.february": "февраль",
    "month.march": "март",
    "month.april": "апрель",
    "month.may": "май",
    "month.june": "июнь",
    "month.july": "июль",
    "month.august": "август",
    "month.september": "сентябрь",
    "month.october": "октябрь",
    "month.november": "ноябрь",
    "month.december": "декабрь",

    // Days of week
    "day.monday": "Пн",
    "day.tuesday": "Вт",
    "day.wednesday": "Ср",
    "day.thursday": "Чт",
    "day.friday": "Пт",
    "day.saturday": "Сб",
    "day.sunday": "Вс",

    // Short days
    "day.short.monday": "П",
    "day.short.tuesday": "В",
    "day.short.wednesday": "С",
    "day.short.thursday": "Ч",
    "day.short.friday": "П",
    "day.short.saturday": "С",
    "day.short.sunday": "В",

    // Reminders page
    "reminders.title": "Напоминания",
    "reminders.new": "Новое напоминание",
    "reminders.search": "Поиск напоминаний...",
    "reminders.loading": "Загрузка напоминаний...",
    "reminders.error.title": "Ошибка загрузки",
    "reminders.error.description": "Не удалось загрузить напоминания. Пожалуйста, попробуйте обновить страницу.",
    "reminders.error.refresh": "Обновить страницу",
    "reminders.empty.title": "Нет напоминаний",
    "reminders.empty.description":
      "У вас пока нет напоминаний. Создайте новое напоминание, чтобы не забыть о важных событиях.",
    "reminders.empty.search": "Не найдено напоминаний, соответствующих вашему запросу",
    "reminders.create": "Создать напоминание",
    "reminders.today": "Сегодня",
    "reminders.tomorrow": "Завтра",
    "reminders.yesterday": "Вчера",

    // Notes page
    "notes.title": "Заметки",
    "notes.new": "Новая заметка",
    "notes.search": "Поиск заметок...",
    "notes.loading": "Загрузка заметок...",
    "notes.error.title": "Ошибка загрузки",
    "notes.error.description": "Не удалось загрузить заметки. Пожалуйста, попробуйте обновить страницу.",
    "notes.error.refresh": "Обновить страницу",
    "notes.empty.title": "Нет заметок",
    "notes.empty.description": "У вас пока нет заметок. Создайте новую заметку, чтобы сохранить важную информацию.",
    "notes.empty.search": "Не найдено заметок, соответствующих вашему запросу",
    "notes.create": "Создать заметку",
    "notes.today": "Сегодня",
    "notes.tomorrow": "Завтра",
    "notes.yesterday": "Вчера",

    // Profile page
    "profile.title": "Профиль",
    "profile.user": "Пользователь",
    "profile.activity": "Активность за последний год",
    "profile.activityOverview": "Обзор активности",
    "profile.tasksCreated": "Создано {count} задач",
    "profile.tasksCompleted": "Завершено {count} задач",
    "profile.remindersCreated": "Создано {count} напоминаний",
    "profile.lastMonth": "За последний месяц",
    "profile.popularTags": "Популярные теги",
    "profile.tag.work": "работа",
    "profile.tag.important": "важное",
    "profile.tag.urgent": "срочно",
    "profile.tag.meeting": "встреча",
    "profile.tag.personal": "личное",
    "profile.tag.project": "проект",
    "profile.overview": "Обзор",
    "profile.account": "Аккаунт",
    "profile.settings": "Настройки",
    "profile.logout": "Выйти",
    "profile.joined": "Присоединился {date}",
    "profile.recently": "недавно",
    "profile.profileInfo": "Информация профиля",
    "profile.profileInfoDesc": "Управление личной информацией",
    "profile.firstName": "Имя",
    "profile.lastName": "Фамилия",
    "profile.email": "Email",
    "profile.cancel": "Отмена",
    "profile.save": "Сохранить",
    "profile.saving": "Сохранение...",
    "profile.edit": "Редактировать",
    "profile.systemSettings": "Настройки системы",
    "profile.systemSettingsDesc": "Управление настройками приложения",
    "profile.emailNotifications": "Email уведомления",
    "profile.emailNotificationsDesc": "Получать уведомления по электронной почте",
    "profile.taskReminders": "Напоминания о задачах",
    "profile.taskRemindersDesc": "Получать напоминания о предстоящих задачах",
    "profile.darkTheme": "Темная тема",
    "profile.darkThemeDesc": "Переключение между светлой и темной темой",
    "profile.language": "Язык интерфейса",
    "profile.languageDesc": "Изменить язык меню",
    "profile.less": "Меньше",
    "profile.more": "Больше",
    "profile.avatarUpdated": "Аватар успешно обновлен",
    "profile.avatarUpdateError": "Не удалось обновить аватар",
    "profile.avatarUploadError": "Произошла ошибка при загрузке аватара",
    "profile.profileUpdated": "Данные профиля успешно обновлены",
    "profile.profileUpdateError": "Произошла ошибка при обновлении профиля",
    "profile.password": "Пароль",
    "profile.passwordChange": "Изменение пароля",
    "profile.currentPassword": "Текущий пароль",
    "profile.newPassword": "Новый пароль",
    "profile.confirmPassword": "Подтвердите пароль",
    "profile.passwordUpdated": "Пароль успешно обновлен",
    "profile.passwordUpdateError": "Ошибка при обновлении пароля",
    "profile.passwordMismatch": "Пароли не совпадают",
    "profile.passwordRequired": "Пожалуйста, введите пароль",
    "profile.cropAvatar": "Обрезка аватара",
    "profile.cropAvatarDesc": "Обрежьте изображение, чтобы оно лучше подходило для вашего профиля",
    "profile.passwordMinLength": "Пароль должен содержать минимум 6 символов",
  },
  kz: {
    "menu.calendar": "Күнтізбе",
    "menu.reminders": "Еске салғыштар",
    "menu.notes": "Жазбалар",
    "menu.profile": "Профиль",
    "menu.voice": "Дауыспен енгізу",

    "fab.note": "Жазба",
    "fab.task": "Тапсырма",
    "fab.reminder": "Еске салғыш",

    // Calendar
    "calendar.weekView": "Апталық көрініс",
    "calendar.monthView": "Айлық көрініс",
    "calendar.today": "Бүгін",
    "calendar.week": "Апта",
    "calendar.month": "Ай",
    "calendar.swipeToNavigate": "Навигация үшін сырғытыңыз",

    // Dashboard page
    "dashboard.title": "Күнтізбе",
    "dashboard.welcome": "Қош келдіңіз",
    "dashboard.all": "Барлығы",
    "dashboard.tasks": "Тапсырмалар",
    "dashboard.reminders": "Еске салғыштар",
    "dashboard.notes": "Жазбалар",
    "dashboard.eventsFor": "Оқиғалар",

    // Events count
    "events.count.one": "оқиға",
    "events.count.few": "оқиға",
    "events.count.many": "оқиға",

    // Empty state
    "events.empty.title": "Оқиғалар табылмады",
    "events.empty.description": 'Таңдалған күнге оқиғалар жоқ. "Жасау" түймесін басу арқылы жаңа оқиға жасаңыз.',
    "events.create": "Жасау",

    // Add Entry Button
    "addEntry.create": "Жасау",
    "addEntry.newTask": "Жаңа тапсырма",
    "addEntry.newNote": "Жаңа жазба",
    "addEntry.newReminder": "Жаңа еске салғыш",

    // Months
    "month.january": "қаңтар",
    "month.february": "ақпан",
    "month.march": "наурыз",
    "month.april": "сәуір",
    "month.may": "мамыр",
    "month.june": "маусым",
    "month.july": "шілде",
    "month.august": "тамыз",
    "month.september": "қыркүйек",
    "month.october": "қазан",
    "month.november": "қараша",
    "month.december": "желтоқсан",

    // Days of week
    "day.monday": "Дс",
    "day.tuesday": "Сс",
    "day.wednesday": "Ср",
    "day.thursday": "Бс",
    "day.friday": "Жм",
    "day.saturday": "Сб",
    "day.sunday": "Жк",

    // Short days
    "day.short.monday": "Д",
    "day.short.tuesday": "С",
    "day.short.wednesday": "С",
    "day.short.thursday": "Б",
    "day.short.friday": "Ж",
    "day.short.saturday": "С",
    "day.short.sunday": "Ж",

    // Reminders page
    "reminders.title": "Еске салғыштар",
    "reminders.new": "Жаңа еске салғыш",
    "reminders.search": "Еске салғыштарды іздеу...",
    "reminders.loading": "Еске салғыштар жүктелуде...",
    "reminders.error.title": "Жүктеу қатесі",
    "reminders.error.description": "Еске салғыштарды жүктеу мүмкін болмады. Бетті жаңартып көріңіз.",
    "reminders.error.refresh": "Бетті жаңарту",
    "reminders.empty.title": "Еске салғыштар жоқ",
    "reminders.empty.description":
      "Сізде әлі еске салғыштар жоқ. Маңызды оқиғаларды ұмытпау үшін жаңа еске салғыш жасаңыз.",
    "reminders.empty.search": "Сұранысыңызға сәйкес келетін еске салғыштар табылмады",
    "reminders.create": "Еске салғыш жасау",
    "reminders.today": "Бүгін",
    "reminders.tomorrow": "Ертең",
    "reminders.yesterday": "Кеше",

    // Notes page
    "notes.title": "Жазбалар",
    "notes.new": "Жаңа жазба",
    "notes.search": "Жазбаларды іздеу...",
    "notes.loading": "Жазбалар жүктелуде...",
    "notes.error.title": "Жүктеу қатесі",
    "notes.error.description": "Жазбаларды жүктеу мүмкін болмады. Бетті жаңартып көріңіз.",
    "notes.error.refresh": "Бетті жаңарту",
    "notes.empty.title": "Жазбалар жоқ",
    "notes.empty.description": "Сізде әлі жазбалар жоқ. Маңызды ақпаратты сақтау үшін жаңа жазба жасаңыз.",
    "notes.empty.search": "Сұранысыңызға сәйкес келетін жазбалар табылмады",
    "notes.create": "Жазба жасау",
    "notes.today": "Бүгін",
    "notes.tomorrow": "Ертең",
    "notes.yesterday": "Кеше",

    // Profile page
    "profile.title": "Профиль",
    "profile.user": "Пайдаланушы",
    "profile.activity": "Соңғы жылдағы белсенділік",
    "profile.activityOverview": "Белсенділік шолуы",
    "profile.tasksCreated": "{count} тапсырма жасалды",
    "profile.tasksCompleted": "{count} тапсырма аяқталды",
    "profile.remindersCreated": "{count} еске салғыш жасалды",
    "profile.lastMonth": "Соңғы айда",
    "profile.popularTags": "Танымал тегтер",
    "profile.tag.work": "жұмыс",
    "profile.tag.important": "маңызды",
    "profile.tag.urgent": "шұғыл",
    "profile.tag.meeting": "кездесу",
    "profile.tag.personal": "жеке",
    "profile.tag.project": "жоба",
    "profile.overview": "Шолу",
    "profile.account": "Аккаунт",
    "profile.settings": "Параметрлер",
    "profile.logout": "Шығу",
    "profile.joined": "{date} қосылды",
    "profile.recently": "жақында",
    "profile.profileInfo": "Профиль ақпараты",
    "profile.profileInfoDesc": "Жеке ақпаратты басқару",
    "profile.firstName": "Аты",
    "profile.lastName": "Тегі",
    "profile.email": "Email",
    "profile.cancel": "Болдырмау",
    "profile.save": "Сақтау",
    "profile.saving": "Сақталуда...",
    "profile.edit": "Өңдеу",
    "profile.systemSettings": "Жүйе параметрлері",
    "profile.systemSettingsDesc": "Қолданба параметрлерін басқару",
    "profile.emailNotifications": "Email хабарландырулар",
    "profile.emailNotificationsDesc": "Электрондық пошта арқылы хабарландырулар алу",
    "profile.taskReminders": "Тапсырмалар туралы еске салғыштар",
    "profile.taskRemindersDesc": "Алдағы тапсырмалар туралы еске салғыштар алу",
    "profile.darkTheme": "Қараңғы тақырып",
    "profile.darkThemeDesc": "Жарық және қараңғы тақырыптар арасында ауысу",
    "profile.language": "Интерфейс тілі",
    "profile.languageDesc": "Мәзір тілін өзгерту",
    "profile.less": "Азырақ",
    "profile.more": "Көбірек",
    "profile.avatarUpdated": "Аватар сәтті жаңартылды",
    "profile.avatarUpdateError": "Аватарды жаңарту мүмкін болмады",
    "profile.avatarUploadError": "Аватарды жүктеу кезінде қате орын алды",
    "profile.profileUpdated": "Профиль деректері сәтті жаңартылды",
    "profile.profileUpdateError": "Профильді жаңарту кезінде қате орын алды",
    "profile.password": "Құпия сөз",
    "profile.passwordChange": "Құпия сөзді өзгерту",
    "profile.currentPassword": "Ағымдағы құпия сөз",
    "profile.newPassword": "Жаңа құпия сөз",
    "profile.confirmPassword": "Құпия сөзді растаңыз",
    "profile.passwordUpdated": "Құпия сөз сәтті жаңартылды",
    "profile.passwordUpdateError": "Құпия сөзді жаңарту кезінде қате",
    "profile.passwordMismatch": "Құпия сөздер сәйкес келмейді",
    "profile.passwordRequired": "Құпия сөзді енгізіңіз",
    "profile.cropAvatar": "Аватарды қию",
    "profile.cropAvatarDesc": "Суретті профиліңізге жақсы сәйкес келу үшін қиыңыз",
    "profile.passwordMinLength": "Құпия сөз кемінде 6 таңбадан тұруы керек",
  },
  en: {
    "menu.calendar": "Calendar",
    "menu.reminders": "Reminders",
    "menu.notes": "Notes",
    "menu.profile": "Profile",
    "menu.voice": "Voice Input",

    "fab.note": "Note",
    "fab.task": "Task",
    "fab.reminder": "Reminder",

    // Calendar
    "calendar.weekView": "Week View",
    "calendar.monthView": "Month View",
    "calendar.today": "Today",
    "calendar.week": "Week",
    "calendar.month": "Month",
    "calendar.swipeToNavigate": "Swipe to navigate",

    // Dashboard page
    "dashboard.title": "Calendar",
    "dashboard.welcome": "Welcome",
    "dashboard.all": "All",
    "dashboard.tasks": "Tasks",
    "dashboard.reminders": "Reminders",
    "dashboard.notes": "Notes",
    "dashboard.eventsFor": "Events for",

    // Events count
    "events.count.one": "event",
    "events.count.few": "events",
    "events.count.many": "events",

    // Empty state
    "events.empty.title": "No events found",
    "events.empty.description":
      'There are no events for the selected date. Create a new event by clicking the "Create" button.',
    "events.create": "Create",

    // Add Entry Button
    "addEntry.create": "Create",
    "addEntry.newTask": "New Task",
    "addEntry.newNote": "New Note",
    "addEntry.newReminder": "New Reminder",

    // Months
    "month.january": "January",
    "month.february": "February",
    "month.march": "March",
    "month.april": "April",
    "month.may": "May",
    "month.june": "June",
    "month.july": "July",
    "month.august": "August",
    "month.september": "September",
    "month.october": "October",
    "month.november": "November",
    "month.december": "December",

    // Days of week
    "day.monday": "Mon",
    "day.tuesday": "Tue",
    "day.wednesday": "Wed",
    "day.thursday": "Thu",
    "day.friday": "Fri",
    "day.saturday": "Sat",
    "day.sunday": "Sun",

    // Short days
    "day.short.monday": "M",
    "day.short.tuesday": "T",
    "day.short.wednesday": "W",
    "day.short.thursday": "T",
    "day.short.friday": "F",
    "day.short.saturday": "S",
    "day.short.sunday": "S",

    // Reminders page
    "reminders.title": "Reminders",
    "reminders.new": "New Reminder",
    "reminders.search": "Search reminders...",
    "reminders.loading": "Loading reminders...",
    "reminders.error.title": "Loading Error",
    "reminders.error.description": "Failed to load reminders. Please try refreshing the page.",
    "reminders.error.refresh": "Refresh Page",
    "reminders.empty.title": "No Reminders",
    "reminders.empty.description":
      "You don't have any reminders yet. Create a new reminder to keep track of important events.",
    "reminders.empty.search": "No reminders found matching your search",
    "reminders.create": "Create Reminder",
    "reminders.today": "Today",
    "reminders.tomorrow": "Tomorrow",
    "reminders.yesterday": "Yesterday",

    // Notes page
    "notes.title": "Notes",
    "notes.new": "New Note",
    "notes.search": "Search notes...",
    "notes.loading": "Loading notes...",
    "notes.error.title": "Loading Error",
    "notes.error.description": "Failed to load notes. Please try refreshing the page.",
    "notes.error.refresh": "Refresh Page",
    "notes.empty.title": "No Notes",
    "notes.empty.description": "You don't have any notes yet. Create a new note to save important information.",
    "notes.empty.search": "No notes found matching your search",
    "notes.create": "Create Note",
    "notes.today": "Today",
    "notes.tomorrow": "Tomorrow",
    "notes.yesterday": "Yesterday",

    // Profile page
    "profile.title": "Profile",
    "profile.user": "User",
    "profile.activity": "Activity over the last year",
    "profile.activityOverview": "Activity Overview",
    "profile.tasksCreated": "{count} tasks created",
    "profile.tasksCompleted": "{count} tasks completed",
    "profile.remindersCreated": "{count} reminders created",
    "profile.lastMonth": "In the last month",
    "profile.popularTags": "Popular Tags",
    "profile.tag.work": "work",
    "profile.tag.important": "important",
    "profile.tag.urgent": "urgent",
    "profile.tag.meeting": "meeting",
    "profile.tag.personal": "personal",
    "profile.tag.project": "project",
    "profile.overview": "Overview",
    "profile.account": "Account",
    "profile.settings": "Settings",
    "profile.logout": "Logout",
    "profile.joined": "Joined {date}",
    "profile.recently": "recently",
    "profile.profileInfo": "Profile Information",
    "profile.profileInfoDesc": "Manage your personal information",
    "profile.firstName": "First Name",
    "profile.lastName": "Last Name",
    "profile.email": "Email",
    "profile.cancel": "Cancel",
    "profile.save": "Save",
    "profile.saving": "Saving...",
    "profile.edit": "Edit",
    "profile.systemSettings": "System Settings",
    "profile.systemSettingsDesc": "Manage application settings",
    "profile.emailNotifications": "Email Notifications",
    "profile.emailNotificationsDesc": "Receive notifications via email",
    "profile.taskReminders": "Task Reminders",
    "profile.taskRemindersDesc": "Receive reminders about upcoming tasks",
    "profile.darkTheme": "Dark Theme",
    "profile.darkThemeDesc": "Switch between light and dark themes",
    "profile.language": "Interface Language",
    "profile.languageDesc": "Change the menu language",
    "profile.less": "Less",
    "profile.more": "More",
    "profile.avatarUpdated": "Avatar successfully updated",
    "profile.avatarUpdateError": "Failed to update avatar",
    "profile.avatarUploadError": "An error occurred while uploading avatar",
    "profile.profileUpdated": "Profile data successfully updated",
    "profile.profileUpdateError": "An error occurred while updating profile",
    "profile.password": "Password",
    "profile.passwordChange": "Change Password",
    "profile.currentPassword": "Current Password",
    "profile.newPassword": "New Password",
    "profile.confirmPassword": "Confirm Password",
    "profile.passwordUpdated": "Password successfully updated",
    "profile.passwordUpdateError": "Error updating password",
    "profile.passwordMismatch": "Passwords do not match",
    "profile.passwordRequired": "Please enter a password",
    "profile.cropAvatar": "Crop Avatar",
    "profile.cropAvatarDesc": "Crop the image to better fit your profile",
    "profile.passwordMinLength": "Password must contain at least 6 characters",
  },
}

// Провайдер языка
export function LanguageProvider({ children }: { children: ReactNode }) {
  // Инициализируем язык из localStorage или используем русский по умолчанию
  const [language, setLanguageState] = useState<LanguageType>("ru")

  // Загружаем сохраненный язык при первом рендере
  useEffect(() => {
    const savedLanguage = localStorage.getItem("app-language") as LanguageType
    if (savedLanguage && ["ru", "kz", "en"].includes(savedLanguage)) {
      setLanguageState(savedLanguage)
    }
  }, [])

  // Функция для изменения языка
  const setLanguage = (lang: LanguageType) => {
    setLanguageState(lang)
    localStorage.setItem("app-language", lang)
  }

  // Функция для получения перевода
  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[language][key as keyof (typeof translations)[typeof language]] || key

    // Если есть параметры для подстановки, заменяем их в строке перевода
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{${paramKey}}`, String(paramValue))
      })
    }

    return translation
  }

  // Слушаем событие изменения языка
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent<LanguageType>) => {
      setLanguage(event.detail)
    }

    window.addEventListener("changeLanguage", handleLanguageChange as EventListener)

    return () => {
      window.removeEventListener("changeLanguage", handleLanguageChange as EventListener)
    }
  }, [])

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

// Хук для использования языка
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage должен использоваться внутри LanguageProvider")
  }
  return context
}
