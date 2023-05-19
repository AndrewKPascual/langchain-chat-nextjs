import { spawn } from 'child_process';
import pkg from 'busboy';
const { Busboy } = pkg;
import fs from 'fs';
import { promisify } from 'util';

// Promisify the fs.writeFile function

const { Configuration, OpenAIApi } = require("openai");
const writeFile = promisify(fs.writeFile);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (req.method === 'POST') {
    const Busboy = require('busboy');
    const busboy = Busboy({ headers: req.headers });

    let fileData = '';

    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      file.on('data', function(data) {
        // Convert data to a Buffer and append it to fileData
        fileData += data.toString('base64');
      });

      file.on('end', function() {
        // Save file
        const filePath = `/tmp/${filename}`;
        writeFile(filePath, fileData, 'base64').then(() => {
          // After the file has been saved, run the Python script
          const childProcess = spawn('python3', ['transcribe.py', filePath], { env: { ...process.env } });  

          let stdoutData = '';
          let stderrData = '';

          childProcess.stdout.on('data', (data) => {
            stdoutData += data.toString();
          });

          childProcess.stderr.on('data', (data) => {
            stderrData += data.toString();
          });

          childProcess.on('error', (error) => {
            res.status(500).json({ error: `Error in child process: ${error.message}` });
          });

          childProcess.on('exit', (code) => {
            // Delete the file
            fs.unlinkSync(filePath);

            if (code === 0) {
              res.status(200).json({ transcript: stdoutData });
            } else {
              res.status(500).json({ error: stderrData || `Python script exited with code ${code}` });
            }
          });
        });
      });
    });

    req.pipe(busboy);
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}
