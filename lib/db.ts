import { Pool } from "pg"
import bcrypt from "bcryptjs"
import type { Entry } from "@/types/entry"

// Создаем пул соединений с базой данных
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false, // Для Aiven часто требуется SSL
    ca: process.env.DB_SSL_CA,
  },
})

// Проверяем соединение при запуске
pool.query("SELECT NOW()", (err) => {
  if (err) {
    console.error("Ошибка подключения к базе данных:", err)
  } else {
    console.log("Успешное подключение к базе данных")
  }
})

// Функция для аутентификации пользователя
export async function authenticateUser(login: string, password: string) {
  try {
    const result = await pool.query(
      "SELECT id, login, first_name, last_name, email, password_hash, role, avatar, created_at FROM users WHERE login = $1",
      [login],
    )

    if (result.rows.length === 0) {
      return null
    }

    const user = result.rows[0]
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      return null
    }

    // Обновляем время последнего входа
    await pool.query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [user.id])

    // Преобразуем аватар из bytea в base64 строку, если он есть
    let avatarBase64 = null
    if (user.avatar) {
      avatarBase64 = Buffer.from(user.avatar).toString("base64")
    }

    return {
      id: user.id,
      login: user.login,
      name: `${user.first_name} ${user.last_name}`.trim(),
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      avatar: avatarBase64 ? `data:image/jpeg;base64,${avatarBase64}` : null,
      created_at: user.created_at,
    }
  } catch (error) {
    console.error("Ошибка аутентификации:", error)
    throw error
  }
}

// Функция для регистрации нового пользователя
export async function registerUser(userData: {
  login: string
  firstName: string
  lastName: string
  email: string
  password: string
  role?: string
}) {
  try {
    // Проверяем, существует ли пользователь с таким логином или email
    const existingUser = await pool.query("SELECT id FROM users WHERE login = $1 OR email = $2", [
      userData.login,
      userData.email,
    ])

    if (existingUser.rows.length > 0) {
      return { success: false, message: "Пользователь с таким логином или email уже существует" }
    }

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(userData.password, 10)

    // Вставляем нового пользователя
    const result = await pool.query(
      `INSERT INTO users 
      (login, first_name, last_name, email, password_hash, role, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
      RETURNING id, login, first_name, last_name, email, role, created_at`,
      [userData.login, userData.firstName, userData.lastName, userData.email, passwordHash, userData.role || "user"],
    )

    const newUser = result.rows[0]

    return {
      success: true,
      user: {
        id: newUser.id,
        login: newUser.login,
        name: `${newUser.first_name} ${newUser.last_name}`.trim(),
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        email: newUser.email,
        role: newUser.role,
        avatar: null,
        created_at: newUser.created_at,
      },
    }
  } catch (error) {
    console.error("Ошибка регистрации:", error)
    return { success: false, message: "Ошибка при регистрации пользователя" }
  }
}

// Функция для получения пользователя по ID
export async function getUserById(userId: number) {
  try {
    const result = await pool.query(
      "SELECT id, login, first_name, last_name, email, role, avatar, created_at FROM users WHERE id = $1",
      [userId],
    )

    if (result.rows.length === 0) {
      return null
    }

    const user = result.rows[0]

    // Преобразуем аватар из bytea в base64 строку, если он есть
    let avatarBase64 = null
    if (user.avatar) {
      avatarBase64 = Buffer.from(user.avatar).toString("base64")
    }

    return {
      id: user.id,
      login: user.login,
      name: `${user.first_name} ${user.last_name}`.trim(),
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      avatar: avatarBase64 ? `data:image/jpeg;base64,${avatarBase64}` : null,
      created_at: user.created_at,
    }
  } catch (error) {
    console.error("Ошибка получения пользователя:", error)
    return null
  }
}

// Функция для обновления данных пользователя
export async function updateUser(
  userId: number,
  userData: {
    firstName?: string
    lastName?: string
    email?: string
  },
) {
  try {
    const { firstName, lastName, email } = userData

    const result = await pool.query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name), 
           last_name = COALESCE($2, last_name), 
           email = COALESCE($3, email),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, login, first_name, last_name, email, role, avatar, created_at`,
      [firstName, lastName, email, userId],
    )

    if (result.rows.length === 0) {
      return { success: false, message: "Пользователь не найден" }
    }

    const user = result.rows[0]

    // Преобразуем аватар из bytea в base64 строку, если он есть
    let avatarBase64 = null
    if (user.avatar) {
      avatarBase64 = Buffer.from(user.avatar).toString("base64")
    }

    return {
      success: true,
      user: {
        id: user.id,
        login: user.login,
        name: `${user.first_name} ${user.last_name}`.trim(),
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        avatar: avatarBase64 ? `data:image/jpeg;base64,${avatarBase64}` : null,
        created_at: user.created_at,
      },
    }
  } catch (error) {
    console.error("Ошибка обновления пользователя:", error)
    return { success: false, message: "Ошибка при обновлении пользователя" }
  }
}

// Функция для обновления аватара пользователя
export async function updateUserAvatar(userId: number, avatarBuffer: Buffer): Promise<boolean> {
  try {
    const result = await pool.query("UPDATE users SET avatar = $1, updated_at = NOW() WHERE id = $2", [
      avatarBuffer,
      userId,
    ])

    return result.rowCount === 1
  } catch (error) {
    console.error("Ошибка при обновлении аватара:", error)
    return false
  }
}

// Функция для создания новой задачи
export async function createTask(taskData: {
  login: string
  title: string
  description?: string
  date: Date
  priority?: string
  tags?: string[]
}): Promise<{ success: boolean; task?: Entry; message?: string }> {
  try {
    const { login, title, description, date, priority, tags } = taskData

    // Проверяем, существует ли пользователь с таким логином
    const userCheck = await pool.query("SELECT id FROM users WHERE login = $1", [login])
    if (userCheck.rows.length === 0) {
      return { success: false, message: "Пользователь не найден" }
    }

    // Вставляем новую задачу
    const result = await pool.query(
      `INSERT INTO tasks 
      (login, title, description, date, priority, tags) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id, login, title, description, date, completed, priority, tags, created_at`,
      [login, title, description || "", date, priority || "medium", tags || []],
    )

    if (result.rows.length === 0) {
      return { success: false, message: "Ошибка при создании задачи" }
    }

    const task = result.rows[0]

    // Преобразуем данные в формат Entry
    const newTask: Entry = {
      id: task.id.toString(),
      title: task.title,
      description: task.description,
      date: new Date(task.date),
      type: "task",
      completed: task.completed,
      priority: task.priority,
      tags: task.tags,
    }

    return { success: true, task: newTask }
  } catch (error) {
    console.error("Ошибка создания задачи:", error)
    return { success: false, message: "Ошибка при создании задачи" }
  }
}

// Функция для получения всех задач пользователя
export async function getUserTasks(login: string): Promise<Entry[]> {
  try {
    const result = await pool.query(
      `SELECT id, login, title, description, date, completed, priority, tags
       FROM tasks 
       WHERE login = $1 
       ORDER BY date DESC`,
      [login],
    )

    // Преобразуем данные в формат Entry
    return result.rows.map((task) => ({
      id: task.id.toString(),
      title: task.title,
      description: task.description,
      date: new Date(task.date),
      type: "task",
      completed: task.completed,
      priority: task.priority,
      tags: task.tags,
    }))
  } catch (error) {
    console.error("Ошибка получения задач:", error)
    return []
  }
}

// Функция для получения задачи по ID
export async function getTaskById(id: string): Promise<Entry | null> {
  try {
    const result = await pool.query(
      `SELECT id, login, title, description, date, completed, priority, tags
       FROM tasks 
       WHERE id = $1`,
      [id],
    )

    if (result.rows.length === 0) {
      return null
    }

    const task = result.rows[0]

    // Преобразуем данные в формат Entry
    return {
      id: task.id.toString(),
      title: task.title,
      description: task.description,
      date: new Date(task.date),
      type: "task",
      completed: task.completed,
      priority: task.priority,
      tags: task.tags,
    }
  } catch (error) {
    console.error("Ошибка получения задачи по ID:", error)
    return null
  }
}

// Функция для удаления задачи
export async function deleteTask(id: string): Promise<boolean> {
  try {
    const result = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING id", [id])

    return result.rowCount !== null && result.rowCount > 0
  } catch (error) {
    console.error("Ошибка удаления задачи:", error)
    return false
  }
}

// Функция для обновления статуса выполнения задачи
export async function updateTaskCompletion(id: string, completed: boolean): Promise<boolean> {
  try {
    const result = await pool.query("UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING id", [completed, id])

    return result.rowCount !== null && result.rowCount > 0
  } catch (error) {
    console.error("Ошибка обновления статуса задачи:", error)
    return false
  }
}

// Функция для обновления задачи
export async function updateTask(
  id: string,
  taskData: {
    title?: string
    description?: string
    date?: Date
    priority?: string
    tags?: string[]
  },
): Promise<boolean> {
  try {
    const { title, description, date, priority, tags } = taskData

    const result = await pool.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           date = COALESCE($3, date),
           priority = COALESCE($4, priority),
           tags = COALESCE($5, tags),
           updated_at = NOW()
       WHERE id = $6
       RETURNING id`,
      [title, description, date, priority, tags, id],
    )

    return result.rowCount !== null && result.rowCount > 0
  } catch (error) {
    console.error("Ошибка обновления задачи:", error)
    return false
  }
}

// Функция для создания новой заметки
export async function createNote(noteData: {
  login: string
  title: string
  content: string
  tags?: string[]
}): Promise<{ success: boolean; note?: Entry; message?: string }> {
  try {
    const { login, title, content, tags } = noteData

    // Проверяем, существует ли пользователь с таким логином
    const userCheck = await pool.query("SELECT id FROM users WHERE login = $1", [login])
    if (userCheck.rows.length === 0) {
      return { success: false, message: "Пользователь не найден" }
    }

    // Вставляем новую заметку
    const result = await pool.query(
      `INSERT INTO notes 
      (login, title, content, tags, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, NOW(), NOW()) 
      RETURNING id, login, title, content, tags, created_at`,
      [login, title, content, tags || []],
    )

    if (result.rows.length === 0) {
      return { success: false, message: "Ошибка при создании заметки" }
    }

    const note = result.rows[0]

    // Преобразуем данные в формат Entry
    const newNote: Entry = {
      id: note.id.toString(),
      title: note.title,
      description: note.content,
      date: new Date(note.created_at),
      type: "note",
      tags: note.tags,
    }

    return { success: true, note: newNote }
  } catch (error) {
    console.error("Ошибка создания заметки:", error)
    return { success: false, message: "Ошибка при создании заметки" }
  }
}

// Функция для получения всех заметок пользователя
export async function getUserNotes(login: string): Promise<Entry[]> {
  try {
    const result = await pool.query(
      `SELECT id, login, title, content, tags, created_at, updated_at
       FROM notes 
       WHERE login = $1 
       ORDER BY updated_at DESC`,
      [login],
    )

    // Преобразуем данные в формат Entry
    return result.rows.map((note) => ({
      id: note.id.toString(),
      title: note.title,
      description: note.content,
      date: new Date(note.created_at),
      type: "note",
      tags: note.tags,
    }))
  } catch (error) {
    console.error("Ошибка получения заметок:", error)
    return []
  }
}

// Функция для получения заметки по ID
export async function getNoteById(id: string): Promise<Entry | null> {
  try {
    const result = await pool.query(
      `SELECT id, login, title, content, tags, created_at, updated_at
       FROM notes 
       WHERE id = $1`,
      [id],
    )

    if (result.rows.length === 0) {
      return null
    }

    const note = result.rows[0]

    // Преобразуем данные в формат Entry
    return {
      id: note.id.toString(),
      title: note.title,
      description: note.content,
      date: new Date(note.created_at),
      type: "note",
      tags: note.tags,
    }
  } catch (error) {
    console.error("Ошибка получения заметки по ID:", error)
    return null
  }
}

// Функция для удаления заметки
export async function deleteNote(id: string): Promise<boolean> {
  try {
    const result = await pool.query("DELETE FROM notes WHERE id = $1 RETURNING id", [id])

    return result.rowCount !== null && result.rowCount > 0
  } catch (error) {
    console.error("Ошибка удаления заметки:", error)
    return false
  }
}

// Функция для обновления заметки
export async function updateNote(
  id: string,
  noteData: {
    title?: string
    content?: string
    tags?: string[]
  },
): Promise<boolean> {
  try {
    const { title, content, tags } = noteData

    const result = await pool.query(
      `UPDATE notes 
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           tags = COALESCE($3, tags),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id`,
      [title, content, tags, id],
    )

    return result.rowCount !== null && result.rowCount > 0
  } catch (error) {
    console.error("Ошибка обновления заметки:", error)
    return false
  }
}

