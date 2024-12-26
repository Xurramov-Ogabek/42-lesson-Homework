const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

const usersFile = './database/users.json';
const blogsFile = './database/blog.json';

const readFile = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf-8'));
const writeFile = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

app.post('/register', (req, res) => {
    const { username, password, fullName, age, email, gender } = req.body;
    const users = readFile(usersFile);

    if (!username || username.length < 3) return res.status(400).json({ message: 'Username is invalid' });
    if (!password || password.length < 5) return res.status(400).json({ message: 'Password is invalid' });
    if (age < 10) return res.status(400).json({ message: 'Age must be at least 10' });

    if (users.some((user) => user.username === username)) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    const newUser = {
        id: users.length + 1,
        username,
        password,
        fullName: fullName || '',
        age,
        email,
    };

    users.push(newUser);
    writeFile(usersFile, users);
    res.status(201).json({ message: 'User registered successfully', user: newUser });
});

app.get('/', (req, res) => {
    res.send('Welcome to the Home Page!');
});

app.post('/login', (req, res) => {
    const { username, email, password } = req.body;
    const users = readFile(usersFile);

    const user = users.find((user) => (user.username === username || user.email === email) && user.password === password);

    if (!user) {
        return res.status(400).json({ message: 'Invalid username/email or password' });
    }

    res.json({ message: 'Login successful', user });
});

app.get('/profile/:identifier', (req, res) => {
    const identifier = req.params.identifier;
    const users = readFile(usersFile);

    const user = users.find((user) => user.username === identifier || user.email === identifier);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
});

app.put('/profile/:identifier', (req, res) => {
    const identifier = req.params.identifier;
    const { fullName, age, gender } = req.body;
    const users = readFile(usersFile);

    const user = users.find((user) => user.username === identifier || user.email === identifier);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.fullName = fullName || user.fullName;
    user.age = age || user.age;
    user.gender = gender || user.gender;

    writeFile(usersFile, users);
    res.json({ message: 'Profile updated', user });
});

app.delete('/profile/:identifier', (req, res) => {
    const identifier = req.params.identifier;
    const users = readFile(usersFile);

    const updatedUsers = users.filter((user) => user.username !== identifier && user.email !== identifier);
    if (users.length === updatedUsers.length) return res.status(404).json({ message: 'User not found' });

    writeFile(usersFile, updatedUsers);
    res.json({ message: 'User deleted' });
});

app.post('/blog', (req, res) => {
    const { title, slug, content, tags } = req.body;
    const blogs = readFile(blogsFile);

    const newBlog = {
        id: blogs.length + 1,
        title,
        slug,
        content,
        tags,
        comments: [],
    };

    blogs.push(newBlog);
    writeFile(blogsFile, blogs);
    res.status(201).json({ message: 'Blog created', blog: newBlog });
});

app.get('/blog', (req, res) => {
    const blogs = readFile(blogsFile);
    res.json(blogs);
});

app.put('/blog/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { title, slug, content, tags } = req.body;
    const blogs = readFile(blogsFile);

    const blog = blogs.find((b) => b.id === id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    blog.title = title || blog.title;
    blog.slug = slug || blog.slug;
    blog.content = content || blog.content;
    blog.tags = tags || blog.tags;

    writeFile(blogsFile, blogs);
    res.json({ message: 'Blog updated', blog });
});

app.delete('/blog/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const blogs = readFile(blogsFile);

    const updatedBlogs = blogs.filter((blog) => blog.id !== id);
    if (blogs.length === updatedBlogs.length) return res.status(404).json({ message: 'Blog not found' });

    writeFile(blogsFile, updatedBlogs);
    res.json({ message: 'Blog deleted' });
});

process.on('SIGINT', () => {
    console.log('Server is shutting down...');
    process.exit();
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

