const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json());

const readData = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const writeData = (filePath, data) =>
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

const usersFilePath = './database/users.json';
const blogsFilePath = './database/blogs.json';

app.post('/users', (req, res) => {
  const users = readData(usersFilePath);
  const { username, password, fullName, age, email, gender } = req.body;

  if (!username || username.length < 3)
    return res.status(400).send({ message: 'Username kamida 3 belgidan iborat bo\'lishi kerak.' });
  if (!password || password.length < 5)
    return res.status(400).send({ message: 'Parol kamida 5 belgidan iborat bo\'lishi kerak.' });
  if (users.some(user => user.username === username || user.email === email))
    return res.status(400).send({ message: 'Username yoki email allaqachon mavjud.' });

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

app.put('/users/:identifier', (req, res) => {
  const users = readData(usersFilePath);
  const { identifier } = req.params;
  const { username, password, fullName, age, email, gender } = req.body;

  const userIndex = users.findIndex(
    (u) => u.username === identifier || u.email === identifier
  );
  if (userIndex === -1)
    return res.status(404).send({ message: 'Foydalanuvchi topilmadi.' });

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

app.get('/blogs', (req, res) => {
  const blogs = readData(blogsFilePath);
  res.status(200).send(blogs);
});

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

app.delete('/blogs/:id', (req, res) => {
  const blogs = readData(blogsFilePath);
  const { id } = req.params;

  const newBlogs = blogs.filter((b) => b.id !== parseInt(id));
  if (newBlogs.length === blogs.length)
    return res.status(404).send({ message: 'Blog yozuvi topilmadi.' });

  writeData(blogsFilePath, newBlogs);
  res.status(200).send({ message: 'Blog yozuvi o\'chirildi.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});