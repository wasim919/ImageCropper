const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');

const app = express();

app.use(fileUpload());

app.use(cors());

// Upload Endpoint
app.post('/upload', (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }

  const file = req.files.file;
  const filename = `${Date.now()}_${file.name}`;
  file.mv(`${__dirname}/client/public/uploads/${filename}.jpg`, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }

    res.json({
      fileName: `${filename}`,
      filePath: `/uploads/${filename}`,
    });
  });
});

app.listen(5000, () => console.log('Server Started...'));
