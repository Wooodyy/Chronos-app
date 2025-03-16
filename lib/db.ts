import { Pool } from "pg"
import bcrypt from "bcryptjs"

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
        lastName: newUser.lastName,
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

