// pages/api/requirements-fulfillment.js
import 'dotenv/config'
import OpenAI from 'openai';

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'],
  });

  const { year, subject, additionalInfo, url, rubric } = req.body;

  const data = await new Promise(async (resolve, reject) => {
    try {
      const response = await openai.chat.completions.create({
        messages: [{
          role: 'user',
          content:
            [
              {
                "type": "text", "text":
                  `
              You are a teacher teaching a class of ${year ? year : ''} students. 
              ${subject ? `The subject is ${subject}.` : ''}
    
              ${additionalInfo ? `Additional information: ${additionalInfo}` : ''}
    
              Based on the following rubric and the uploaded image of the student's test, please provide a JSON object with the student's score for each criteria in the rubric. Do not provide any explanation besides the JSON object.
    
              Rubric: ${JSON.stringify(rubric)}
    
              For example:
    
              [
                {
                  "criteria": "Shows work",
                  "score": 1
                },
                {
                  "criteria": "Uses correct formula",
                  "score": 0
                },
                {
                  "criteria": "Correct answer",
                  "score": 2
                }
              ]
              `
              },
              {
                "type": "image_url",
                "image_url": {
                  "url": `${url}`,
                },
              },
            ],


        }],
        model: 'gpt-4-vision-preview',
      });
      const responseText = response.choices[0].message.content
      console.log('OpenAI response:', responseText);
      // parse response for first and last bracket
      const firstBracketIndex = responseText.indexOf('[');
      const lastBracketIndex = responseText.lastIndexOf(']');
      const jsonContent = responseText.slice(firstBracketIndex, lastBracketIndex + 1);
      // convert to JSON
      const json = JSON.parse(jsonContent);
      resolve(json);

    } catch (error) {
      reject(error);
    }
  });

  res.status(200).json(data);
}
