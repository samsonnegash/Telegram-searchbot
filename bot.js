const Telegraf = require('telegraf');
const axios = require('axios');

const bot = new Telegraf('808328592:AAFFUBCK2g7olBWpncLlfsrLh1AQee_sIzk');
//pixabay's api key
const apikey = `8917289-ba8d5b6d020c63e164b48a942`;

//handler for /start and /help command
bot.command(['start', 'help'], ctx => {
  //set welcome message
  let message = `
Welcome to Search Bot!
Use the inline mode below
@s300bot p <search image>
@s300bot w <search wiki>
`;
  //ctx.reply(text, [extra params])
  ctx.reply(message, {
    reply_markup: {
      inline_keyboard: [
        [
          // Use switch inline query current chat to pre-type "@s300bot p " 
          { text: 'Search Pixabay Image', switch_inline_query_current_chat: 'p ' }
        ],
        [
          // Use switch inline query current chat to pre-type "@s300bot w " 
          { text: 'Search Wiki', switch_inline_query_current_chat: 'w ' }
        ]
      ]
    }
  })
})

bot.inlineQuery(['start', 'help'], ctx => {
  let message = `
Welcome to Search Bot!
Use the inline mode below
@s300bot p <search image>
@s300bot w <search wiki>
  `;

  //results array containing 1 inlinequeryresult article for ctx.answerInlineQuery method
  let results = [
    {
      type: 'article',
      id: '1',
      title: 'Help Reference',
      input_message_content: {
        message_text: message
      },
      description: 'Sends help message on how to use the bot',
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Search Pixabay Image', switch_inline_query_current_chat: 'p ' }
          ],
          [
            { text: 'Search Wiki', switch_inline_query_current_chat: 'w ' }
          ]
        ]
      }
    }
  ]

  ctx.answerInlineQuery(results);
})

bot.inlineQuery(/p\s.+/, async ctx => {
  let input = ctx.inlineQuery.query.split(' '); //split string by spaces into array eg. ['p', 'search', 'term']
  input.shift(); //remove first element in array eg. ['search', 'term']
  let query = input.join(' '); //join elements in array into string separated by spaces eg. "search term"

  //call pixabay api with request using axios
  let res = await axios.get(`https://pixabay.com/api/?key=${apikey}&q=${query}`);
  //main data is stored in hits array in res.data
  let data = res.data.hits;

  //process the data using javascript's array map method to loop each element in array and return something as an element in the results array
  let results = data.map((item, index) => {
    return {
      type: 'photo',
      id: String(index),
      photo_url: item.webformatURL,
      thumb_url: item.previewURL,
      photo_width: 300,
      photo_height: 200,
      caption: `[Source](${item.webformatURL})\n[Large Image](${item.largeImageURL})`,
      parse_mode: 'Markdown'
    }
  })
  ctx.answerInlineQuery(results)
})

bot.inlineQuery(/w\s.+/, async ctx => {
  let input = ctx.inlineQuery.query.split(' ');
  input.shift();
  let query = input.join(' ');

  //call wiki api with get request using axios
  let res = await axios.get(`https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${query}&limit=50`);
  let data = res.data;
  let allTitles = data[1]; //store titles array from data into a variable named allTitles
  let allLinks = data[3]; //store links array from data into a variable named allLinks

  //if user types inline query slow, search query may be empty,
  //this if statement checks if allTitles array is empty, if true then stop the entire inlinequery handler with "return" 
  if (allTitles == undefined) {
    return;
  }

  //process the data using javascript's array map method to loop each element in array and return something as an element in the results array
  let results = allTitles.map((item, index) => {
    return {
      type: 'article',
      id: String(index),
      title: item,
      input_message_content: {
        message_text: `${item}\n${allLinks[index]}`
      },
      description: allLinks[index],
      reply_markup: {
        inline_keyboard: [
          [
            { text: `Share ${item}`, switch_inline_query: `w ${item}` }
          ]
        ]
      }
    }
  })
  ctx.answerInlineQuery(results);
})

bot.launch();