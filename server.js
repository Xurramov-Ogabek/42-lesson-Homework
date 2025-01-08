const express = require('express');
const fs = require(`node:fs`)
const app = express();
const port = 3000;

app.use(express.json());

const usersFile = `./users.json`;
const blogsFile = `./blog.json`;

app.post(`/register`, (req, res) => {
    const { username, password, fullname, age, email, gender } = req.body;
    if (!username && username.length < 3) {
        return res.status(400).send(`Usernamee 3 ta belgidan kop bolishi kerak`);
    }
    if (!password && password.length < 5) {
        return res.status(400).send(`Parol 5 ta belgidan kop bolishi kerak`);
    }
    if (age < 10) {
        return res.status(400).send(`Yoshingiz 10 dan katta bolishi kerak`);
    }
    if (!email) {
        return res.status(400).send(`Emailni kiriting`);
    }
    const users = JSON.parse(fs.readFileSync(usersFile, `utf-8`) || `[]`);
    if (users.find(user => user.username === username)) {
        return res.status(400).send(`Bunday foydalanuvchi bor`);
    }

    const newUser = { id: users.length + 1, username, password, fullname, age, email, gender };
    users.push(newUser);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 4));
    res.status(201).send(`Foydalanuvchi muvaffaqiyatli ro'yxattan o'tdi`);
});

app.post(`/login`, (req, res) => {
    const { username, password, email } = req.body;

    const users = JSON.parse(fs.readFileSync(usersFile, `utf-8`) || `[]`);
    const user = users.find(user => user.username === username && user.password === password && user.email === email);

    if (!user) {
        return res.status(400).send(`username yoki parol xato`);
    }
    res.status(200).send(`foydalanuvchi topildi`);
});

app.get(`/users`, (req, res) => {
    const users = JSON.parse(fs.readFileSync(usersFile, `utf-8`) || `[]`);
    res.status(200).send(users);
})

app.get(`/users/:id`, (req, res) => {
    const { id } = req.params;
    const users = JSON.parse(fs.readFileSync(usersFile, `utf-8`) || `[]`);
    const user = users[id - 1]

    if (!user) {
        return res.status(404).send(`Foydalanuvchi topilmadi`)
    }
    res.status(200).send(user);
});

app.put("/users/:id", (request, response) => {
    let users = JSON.parse(fs.readFileSync(usersFile, 'utf-8') || '[]');
    const { id } = request.params;
    const body = request.body;

    const userIndex = users.findIndex((user) => user.id === +id);
    const user = users.filter((user) => user.id === +id);

    users.splice(userIndex, 1, { ...user[0], ...body });

    response.send(users);
});

app.delete("/users/:id", (request, response) => {
    const { id } = request.params;
    let users = JSON.parse(fs.readFileSync(usersFile, 'utf-8') || '[]');
    const userIndex = users.findIndex((user) => user.id === +id);
    if (userIndex !== -1) {
        users.splice(userIndex, 1);
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf-8');
        return response.status(200).send(`fodalanuvchi o'chirildi`)
    } else {
        return response.status(404).send(`foydalanuvchi topilmadi`);
    }
});

app.post('/blog', (req, res) => {
    const { title, author, content, tags } = req.body;
    if (!title || !author || !content) return res.status(400).send(`barcha malumotlarni to'ldiring.`);

    const blogs = JSON.parse(fs.readFileSync(blogsFile, 'utf-8') || '[]');
    const newBlog = { id: blogs.length + 1, title, author, content, tags: tags || [], comments: [] };
    blogs.push(newBlog);
    fs.writeFileSync(blogsFile, JSON.stringify(blogs, null, 2));
    res.status(201).send('blog muvaffaqiyatli yaratildi.');
});

app.get('/blog', (req, res) => {
    const blogs = JSON.parse(fs.readFileSync(blogsFile, 'utf-8') || '[]');
    res.status(200).json(blogs);
});

app.put('/blog/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const blogs = JSON.parse(fs.readFileSync(blogsFile, 'utf-8') || '[]');
    const blogIndex = blogs.findIndex(blog => blog.id === parseInt(id));
    if (blogIndex === -1) return res.status(404).send('blog topilmadi.');

    blogs[blogIndex] = { ...blogs[blogIndex], ...updates };
    fs.writeFileSync(blogsFile, JSON.stringify(blogs, null, 2));
    res.status(200).send('blog muvaffaqiyatli yangilandi.');
});

app.delete('/blog/:id', (req, res) => {
    const { id } = req.params;
    let blogs = JSON.parse(fs.readFileSync(blogsFile, 'utf-8') || '[]');
    const blogIndex = blogs.findIndex(blog => blog.id === parseInt(id));
    if (blogIndex === -1) return res.status(404).send('blog topilmadi.');

    blogs = blogs.filter(blog => blog.id !== parseInt(id));
    fs.writeFileSync(blogsFile, JSON.stringify(blogs, null, 2));
    res.status(200).send(`blog muvaffaqiyatli o'chirildi.`);
});

app.post('/blog/:id/comment', (req, res) => {
    const { id } = req.params;
    const { user_id, comment } = req.body;

    const blogs = JSON.parse(fs.readFileSync(blogsFile, 'utf-8') || '[]');
    const blog = blogs.find(blog => blog.id === parseInt(id));
    if (!blog) return res.status(404).send('bunday blog topilmadi.');

    blog.comments.push({ user_id, comment });
    fs.writeFileSync(blogsFile, JSON.stringify(blogs, null, 2));
    res.status(201).send(`comment qo'shildi.`);
});

app.listen(port, () => {
    console.log(`server ishga tushdi http://localhost:${port}`);
});
