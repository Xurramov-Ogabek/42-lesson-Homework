const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Fayldan ma'lumotlarni o'qish funksiyasi
const readData = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// Faylga ma'lumotlarni yozish funksiyasi
const writeData = (filePath, data) =>
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// Foydalanuvchilar va bloglar uchun fayl yo'llari
const usersFilePath = './database/users.json';
const blogsFilePath = './database/blogs.json';

// ============= Foydalanuvchilar uchun CRUD ============= //

// 1. Foydalanuvchini ro'yxatdan o'tkazish
app.post('/users', (req, res) => {
  const users = readData(usersFilePath);
  const { username, password, fullName, age, email, gender } = req.body;

  // Validation
  if (!username || username.length < 3)
    return res.status(400).send({ message: 'Username kamida 3 belgidan iborat bo\'lishi kerak.' });
  if (!password || password.length < 5)
    return res.status(400).send({ message: 'Parol kamida 5 belgidan iborat bo\'lishi kerak.' });
  if (users.some(user => user.username === username || user.email === email))
    return res.status(400).send({ message: 'Username yoki email allaqachon mavjud.' });

  // Yangi foydalanuvchini qo'shish
  const newUser = {
    id: users.length + 1,
    username,
    password,
    fullName: fullName || '',
    age,
    email,
    gender: gender || null,
  };
  users.push(newUser);
  writeData(usersFilePath, users);

  res.status(201).send({ message: 'Foydalanuvchi ro\'yxatdan o\'tkazildi!', user: newUser });
});

// 2. Foydalanuvchi ma'lumotlarini olish (username yoki email orqali)
app.get('/users/:identifier', (req, res) => {
  const users = readData(usersFilePath);
  const { identifier } = req.params;

  const user = users.find(
    (u) => u.username === identifier || u.email === identifier
  );
  if (!user)
    return res.status(404).send({ message: 'Foydalanuvchi topilmadi.' });

  res.status(200).send(user);
});

// 3. Foydalanuvchi ma'lumotlarini yangilash
app.put('/users/:identifier', (req, res) => {
  const users = readData(usersFilePath);
  const { identifier } = req.params;
  const { username, password, fullName, age, email, gender } = req.body;

  const userIndex = users.findIndex(
    (u) => u.username === identifier || u.email === identifier
  );
  if (userIndex === -1)
    return res.status(404).send({ message: 'Foydalanuvchi topilmadi.' });

  // Ma'lumotlarni yangilash
  users[userIndex] = {
    ...users[userIndex],
    username: username || users[userIndex].username,
    password: password || users[userIndex].password,
    fullName: fullName || users[userIndex].fullName,
    age: age || users[userIndex].age,
    email: email || users[userIndex].email,
    gender: gender || users[userIndex].gender,
  };
  writeData(usersFilePath, users);

  res.status(200).send({ message: 'Ma\'lumotlar yangilandi.', user: users[userIndex] });
});

// 4. Foydalanuvchini o'chirish
app.delete('/users/:identifier', (req, res) => {
  const users = readData(usersFilePath);
  const { identifier } = req.params;

  const newUsers = users.filter(
    (u) => u.username !== identifier && u.email !== identifier
  );
  if (newUsers.length === users.length)
    return res.status(404).send({ message: 'Foydalanuvchi topilmadi.' });

  writeData(usersFilePath, newUsers);
  res.status(200).send({ message: 'Foydalanuvchi o\'chirildi.' });
});

// ============= Bloglar uchun CRUD ============= //

// 1. Blog yozuvi yaratish
app.post('/blogs', (req, res) => {
  const blogs = readData(blogsFilePath);
  const { title, slug, content, tags } = req.body;

  if (!title || !content)
    return res.status(400).send({ message: 'Title va content talab qilinadi.' });

  const newBlog = {
    id: blogs.length + 1,
    title,
    slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
    content,
    tags: tags || [],
    comments: [],
  };
  blogs.push(newBlog);
  writeData(blogsFilePath, blogs);

  res.status(201).send({ message: 'Blog yozuvi yaratildi.', blog: newBlog });
});

// 2. Blog yozuvlarini olish
app.get('/blogs', (req, res) => {
  const blogs = readData(blogsFilePath);
  res.status(200).send(blogs);
});

// 3. Blog yozuvini yangilash
app.put('/blogs/:id', (req, res) => {
  const blogs = readData(blogsFilePath);
  const { id } = req.params;
  const { title, content, tags } = req.body;

  const blogIndex = blogs.findIndex((b) => b.id === parseInt(id));
  if (blogIndex === -1)
    return res.status(404).send({ message: 'Blog yozuvi topilmadi.' });

  blogs[blogIndex] = {
    ...blogs[blogIndex],
    title: title || blogs[blogIndex].title,
    content: content || blogs[blogIndex].content,
    tags: tags || blogs[blogIndex].tags,
  };
  writeData(blogsFilePath, blogs);

  res.status(200).send({ message: 'Blog yozuvi yangilandi.', blog: blogs[blogIndex] });
});

// 4. Blog yozuvini o'chirish
app.delete('/blogs/:id', (req, res) => {
  const blogs = readData(blogsFilePath);
  const { id } = req.params;

  const newBlogs = blogs.filter((b) => b.id !== parseInt(id));
  if (newBlogs.length === blogs.length)
    return res.status(404).send({ message: 'Blog yozuvi topilmadi.' });

  writeData(blogsFilePath, newBlogs);
  res.status(200).send({ message: 'Blog yozuvi o\'chirildi.' });
});

// Serverni ishga tushirish
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});