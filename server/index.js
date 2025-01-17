const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
const express = require('express');
const PORT = 4040;
const cors = require('cors');
const app = express();
const fs = require('fs');
const multer = require('multer');
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(express.json());
app.use(cors('*'))

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

const upload = multer({ storage: storage }).single('file');

app.post('/upload', (req, res) => {
    try {
        upload(req, res, (err) => {
            if (err) {
                return res.status(500).json(err)
            }
            filePath = req.file.path
            res.status(200).json({message: "Uploaded successfully"})
        })
    } catch (error) {
        res.send(500).json({err: 'Something went wrong'});
        console.error(error)
    }
})

app.post('/gemini', async (req, res) => {
    try {
        function fileToGenerativePart(path, mimeType) {
            return {
                inlineData: {
                    data: Buffer.from(fs.readFileSync(path)).toString('base64'), mimeType
                }
            }
        }
        const prompt = req.body.message
        const result = await model.generateContent([prompt, fileToGenerativePart(filePath, "image/jpeg")]);
        const text = result.response.text();
        res.send(text)
    } catch (err) {
        console.error(err)
    }
})

app.listen(PORT, () => {
    console.log(`App is listening to PORT: ${PORT}`)
})
