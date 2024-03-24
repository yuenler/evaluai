// pages/api/requirements-fulfillment.js
import 'dotenv/config'
import OpenAI from 'openai';
import getRequirements from './helpers/getRequirements';

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'],
  });

  const { rubric, year, subject, additionalInfo } = req.body;

  const imageURL = 'https://images.unsplash.com/photo-1612838320302-4';


  const data = await new Promise(async (resolve, reject) => {
    const requirements = getRequirements(concentration);
    try {
      const response = await openai.chat.completions.create({
        messages: [{
          role: 'user',
          content:
            [
              {
                "type": "text", "text":
                  `
              You are a teacher teaching a class of ${year} students. You are teaching ${subject}. 
    
              ${additionalInfo ? `Additional information: ${additionalInfo}` : ''}
    
              Based on the following rubric and the uploaded image of the student's test, please provide a JSON object with the student's score for each criteria in the rubric.
    
              Rubric: ${JSON.stringify(rubric)}
    
              For example:
    
              {
                "Showed work": 0,
                "Correct answer": 2,
                "Used formula": 1
              }
              `
              },
              {
                "type": "image_url",
                "image_url": {
                  "url": `${imageURL}`,
                },
              },
            ],


        }],
        model: 'gpt-4-vision-preview',
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

    } catch (error) {
      reject(error);
    }
  });

  res.status(200).json(data);
}
