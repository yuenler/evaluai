// pages/api/parse-pdf.js
import 'dotenv/config'
import { IncomingForm } from 'formidable';
import OpenAI from 'openai';
import fs from 'fs';
import pdfParse from 'pdf-parse';

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'],
  });

  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) return reject(err);
      const filePath = files.file[0].filepath;
      try {

        const fileBuffer = fs.readFileSync(filePath); // Read the file into a buffer
        pdfParse(fileBuffer).then(async function (data) {
          // Here you would typically parse the PDF content to extract text
          // For demonstration, assume `fileContent` is directly usable or has been converted to text
          console.log('Parsed file content:', data.text);
          const response = await openai.chat.completions.create({
            messages: [{
              role: 'user', content: `Given this blank test, please create a rubric for grading the test. The rubric should include the following sections:

              Please return the rubric as a JSON object with the question number as the keys. 
              The values should be an object with the criteria as the keys and the maximum possible score as the value.
              If a question has multiple parts (e.g. 1a, 1b), please do not include the parts as sub-keys and instead have each part as a separate key.

              Example:
              {
                "1a" : [
                  {
                    "criteria": "Correct answer",
                    "maxPoints": 1
                  },
                  {
                    "criteria": "Shows work",
                    "maxPoints": 1
                  },
                  {
                    "criteria": "Uses formula",
                    "maxPoints": 1
                  }
                ],
                "1b" : [
                  {
                    "criteria": "Correct answer",
                    "maxPoints": 1
                  },
                  {
                    "criteria": "Shows work",
                    "maxPoints": 1
                  },
                ]
              }
              
              
              
            
            ${data.text}`
            }],
            model: 'gpt-4-0125-preview',
          });
          const responseText = response.choices[0].message.content
          console.log('OpenAI response:', responseText);
          // parse response for first and last bracket
          const firstBracketIndex = responseText.indexOf('{');
          const lastBracketIndex = responseText.lastIndexOf('}');
          const jsonContent = responseText.slice(firstBracketIndex, lastBracketIndex + 1);
          // convert to JSON
          const json = JSON.parse(jsonContent);
          resolve(json);
        });
      } catch (error) {
        reject(error);
      }
    });
  });

  res.status(200).json(data);
}
