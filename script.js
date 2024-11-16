const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/whitelist', async (req, res) => {
    const { username } = req.body;

    try {
        const response = await fetch(`https://api.github.com/repos/YOUR_GITHUB_USERNAME/h4x-ss-wl/contents/whitelisted`, {
            headers: {
                'Authorization': `token ${process.env.GITHUB_TOKEN}`
            }
        });

        const data = await response.json();
        const content = Buffer.from(data.content, 'base64').toString('utf8');
        const whitelisted = JSON.parse(content);

        if (!whitelisted.includes(username)) {
            whitelisted.push(username);
            const newContent = Buffer.from(JSON.stringify(whitelisted, null, 2)).toString('base64');

            await fetch(`https://api.github.com/repos/YOUR_GITHUB_USERNAME/h4x-ss-wl/contents/whitelisted`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Added ${username} to whitelist`,
                    content: newContent,
                    sha: data.sha
                })
            });

            res.status(200).json({ message: `User ${username} has been whitelisted!` });
        } else {
            res.status(200).json({ message: `User ${username} is already whitelisted!` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while processing your request.' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
