import "dotenv/config"
import express from "express"
import cors from "cors"
import { Configuration, OpenAIApi } from "openai"

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const app = express()

app.use(cors())
app.use(express.json())

const systemPrompt = `You will be using a comment generator tool that creates comments about products. To generate comments, you will need to provide the product name, a positive or negative sentiment value, the number of comments you want to generate, and the language of the comment. If no language is specified, the default language will be English.
The generated comments must be at least 300 characters long and contain real information about the specified product. Spelling mistakes, non-capitalized sentences, abbreviations, emojis, and slang words must be used most of the time to make the comments sound natural, as if written by a human.

Each comment will be in the following format:

author: [Name Surname]
comment: [Comment about the product]
---
author: [Name Surname]
comment: [Comment about the product]

If any of the following conditions are met, the generator will return "NO_COMMENT":

The product is not real
The generator has no knowledge of the product
The product is unavailable on e-commerce platforms
The product name includes the name of a city`

app.get('/', (req, res) => {
	res.send('api calisiyor!')
})

app.post('/create-fake-comments', async (req, res) => {

	const response = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages: [
			{
				role: "system",
				content: systemPrompt
			},
			{
				role: "user",
				content: `Product name: ${req.body.productName}\nComment type: ${req.body.commentType}\nCount: ${req.body.commentCount}\nComment Language: ${req.body.language}`
			}
		],
		stream: true,
	}, { responseType: 'stream' });
	
	const stream = response.data
	
	stream.on('data', (chunk) => {
	   // Messages in the event stream are separated by a pair of newline characters.
	   const payloads = chunk.toString().split("\n\n")
	   for (const payload of payloads) {
		   if (payload.includes('[DONE]')) return;
		   if (payload.startsWith("data:")) {
			   const data = payload.replaceAll(/(\n)?^data:\s*/g, ''); // in case there's multiline data event
			   try {
				   const delta = JSON.parse(data.trim())
				   res.write(delta.choices[0].delta?.content)
			   } catch (error) {
				   console.log(`Error with JSON.parse and ${payload}.\n${error}`)
			   }
		   }
	   }
	})
	
	stream.on('end', () => res.end())
	stream.on('error', (e) => console.error(e))
})

app.listen(3000, () => console.log('3000 portundan dinleniyor!'))
