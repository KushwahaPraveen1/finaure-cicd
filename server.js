require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors'); 
const app = express();
const port = 8000;
const NodeCache = require('node-cache');
const { Redis } = require('@upstash/redis');
const cache = new NodeCache({ stdTTL: 3000 }); 
const redis = new Redis({
  url:process.env.REDISLINK,
  token: process.env.REDISTOKEN,
})
app.use(express.json()); 
app.use(cors()); 
const callExternalAPI = async (route, queryParams = '') => {
  const baseUrl = process.env.BASE_URL; 

  try {
    const response = await axios.get(`${baseUrl}${route}${queryParams}`, {
      headers: {
        'X-API-Key': process.env.API_KEY,
      },
    });
    return response.data; 
  } catch (error) {
    console.error('Error calling external API:', error);
  }
};
const callExternalAPIPOST = async (route, queryParams = '') => {
  const baseUrl = process.env.BASE_URL; 

  try {
    const response = await axios.post(`${baseUrl}${route}${queryParams}`, null, {
      headers: {
        'X-API-Key': process.env.API_KEY, 
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error calling external API:', error.message);
    throw error;
  }
};

// For fetching particular STOCK DATA
app.get('/api/stock', async (req, res) => {
  const stockName = req.query.name; 
  const queryParams = stockName ? `?name=${stockName}` : ''; 
  try {
    const cachedData = await redis.get(`Stock Details ${stockName}`);

    if (cachedData) {
      console.log('Cache hit');
      return res.json(cachedData);
    }
    console.log('Cache miss');

    const data = await callExternalAPI('/stock', queryParams);
    await redis.set(`Stock Details ${stockName}`, data, { ex: 6000 });
    res.json(data);  
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
});

//for plotting 1week,1month,1year,5year,all time stats of Stock

app.get('/api/historical_data', async (req, res) => {
  const stockName = req.query.stock_name; 
  const period = req.query.period;
  const queryParams = stockName ? `?stock_name=${stockName}&period=${period}&filter=price` : ''; 
  try {
    const cachedData = await redis.get(`stock_name=${stockName}&period=${period}&filter=price`);

    if (cachedData) {
      console.log('Cache hit');
      return res.json(cachedData);
    }
    console.log('Cache miss');
    const data = await callExternalAPI('/historical_data', queryParams);
    await redis.set(`stock_name=${stockName}&period=${period}&filter=price`, data, { ex: 6000 });
    res.json(data);  
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
});

//For getting Logo of stock
app.get('/api/logo', async (req, res) => {
  const stockName = req.query.stock_name; 
  const queryParams = stockName ? `?stock_name=${encodeURIComponent(stockName)}` : ''; 
const cachedLogo = cache.get(stockName); 
if (cachedLogo) {
    console.log('Fetching logo from cache');
    return res.json(cachedLogo);
}return res.json({
  content_type: "",
  base_url: ""
});
// try {
//   const data = await callExternalAPI('', queryParams);
//   cache.set(stockName, data);
//   console.log('cache set');
//   res.json(data); // Send the data back to the frontend
// } catch (error) {
//   // res.status(500).json({ error: 'Failed to fetch data from external API' });
// }
});

//for mutual fund logo.
app.get('/api/logo_mutual_fund', async (req, res) => {
  const stockName = req.query.mutual_fund;  
  const queryParams = stockName ? `?mutual_fund=${encodeURIComponent(stockName)}` : ''; 
return res.json({
  content_type: "",
  base_url: ""
});
// try {
//   const data = await callExternalAPI('/logo', queryParams);
//   res.json(data); // Send the data back to the frontend
// } catch (error) {
//   res.status(500).json({ error: 'Failed to fetch data from external API' });
// }
});


// Stockchart data
app.post('/api/chart', async (req, res) => {
  const stockId = req.query.stock_id;  
  const queryParams = stockId ? `?stock_id=${encodeURIComponent(stockId)}` : '';  
  try {
    const cachedData = await redis.get(`stock_id=${encodeURIComponent(stockId)}`);

    if (cachedData) {
      console.log('Cache hit');
      return res.json(cachedData);
    }
    console.log('Cache miss');
    const data = await callExternalAPIPOST(`/1D_intraday_data${queryParams}`);
    await redis.set(`stock_id=${encodeURIComponent(stockId)}`, data, { ex: 300 });
    res.json(data); 
  } catch (error) {
    console.error("Error fetching data from external API:", error); 
    res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
});


//For fetching trending stocks data
app.get('/api/trending', async (req, res) => {

  try {
    const cachedData = await redis.get(`trending`);

    if (cachedData) {
      console.log('Cache hit');
      return res.json(cachedData);
    }
    console.log('Cache miss');
    const data = await callExternalAPI('/trending');
    await redis.set("trending", data, { ex: 6000 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
});


// For_52_Week_High_Low

app.get('/api/week_high_low', async (req, res) => {
 
  try {
    const cachedData = await redis.get("week_high_low");

    if (cachedData) {
       
      console.log('Cache hit');
      return res.json(cachedData);
    }
    console.log('Cache miss');
    const data = await callExternalAPI('/fetch_52_week_high_low_data');
    await redis.set("week_high_low", data, { ex: 60000 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
});

// For Fetching Mutual Fund List (Debt,floating rate, etc)
app.get('/api/mutual_funds', async (req, res) => {
  try {

    const cachedData = await redis.get("mutual_funds_dashboard");

    if (cachedData) {
      // If data is found in cache, parse and send it
      console.log('Cache hit');
      return res.json(cachedData);
    }
    console.log('Cache miss');
    const data = await callExternalAPI('/mutual_funds');
    await redis.set("mutual_funds_dashboard", data, { ex: 86400 });
    res.json(data); 
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
});

// Indices List
app.get('/api/indices', async (req, res) => {
  try {
    const data = await callExternalAPI('/static/all_stocks.json');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
});


// This Endpoint is used to find the stock id of the stock (it is then used to search the 1D intraday data for stock data)
app.get('/api/stock_id', async (req, res) => {
  try {
    const data = await callExternalAPI('/static/all_stocks.json');
    res.json(data); // Send the data back to the frontend
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
});

const thirdPartyApiUrl = 'https://dev.indianapi.in/static/all_stocks.json';

//Not used
//For Implementing search filter for stock
app.get('/api/search', async (req, res) => {
  const { term } = req.query;
  try {
    const cachedData = await redis.get(`search${term}`);

    if (cachedData) {
      console.log('Cache hit');
      return res.json(cachedData);
    }
    console.log('Cache miss');
    const response = await axios.get(thirdPartyApiUrl);
    const data = response.data;
    const searchResults = data.filter((stock) =>
      stock.name.toLowerCase().includes(term.toLowerCase())
    ).slice(0, 50); 
    await redis.set(`search${term}`, data, { ex: 86400 });
    res.json(searchResults);
  } catch (error) {
    console.error('Error fetching search results:', error);
    res.status(500).json({ error: 'Failed to fetch data from the third-party API' });
  }
});

//Stock Search

app.get('/api/stock_search', async (req, res) => {
  const stockName = req.query.query;  
  const queryParams = stockName ? `?query=${stockName}` : ''; 
  
  try {
    const cachedData = await redis.get(`stock_search ${stockName}`);

    if (cachedData) {
      console.log('Cache hit');
      return res.json(cachedData);
    }
    console.log('Cache miss');

    const data = await callExternalAPI('/industry_search', queryParams);
    await redis.set(`stock_search ${stockName}`, data, { ex: 86400 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
});

//for mutual fund search
app.get('/api/mutual_search', async (req, res) => {
  const stockName = req.query.query;
  const queryParams = stockName ? `?query=${stockName}` : '';

  try {
    const cachedData = await redis.get(`mutual_search ${stockName}`);

    if (cachedData) {
      console.log('Cache hit');
      return res.json(cachedData);
    }
    console.log('Cache miss');
    const data = await callExternalAPI('/mutual_fund_search', queryParams);
    await redis.set(`mutual_search ${stockName}`, data, { ex: 86400 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
});

// Get Mutual fund details by using query

app.get('/api/mutual_fund', async (req, res) => {
  const stockName = req.query.stock_name;
  const queryParams = stockName ? `?stock_name=${stockName}` : '';
  
  try {
    const cachedData = await redis.get(`mutual_fund ${stockName}`);

    if (cachedData) {
      console.log('Cache hit');
      return res.json(cachedData);
    }
    const data = await callExternalAPI('/mutual_funds_details', queryParams);
    await redis.set(`mutual_fund ${stockName}`, data, { ex: 86400 });
    res.json(data); // Send the data back to the frontend
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
});


//news endpoint

app.get('/api/ai_news', async (req, res) => {
  const category = req.query.category;
  const queryParams = category ? `?category=${category}` : '';
  
  try {
    const cachedData = await redis.get(`news ${category}`);

    if (cachedData) { 
      console.log('Cache hit');
      return res.json(cachedData);
    }
    const data = await callExternalAPI('/ai_news', queryParams);
    await redis.set(`news ${category}`, data, { ex: 86400 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
});

// cron.schedule('*/15 * * * *', async () => {
//   console.log('Updating Redis cache for /ai_news every 15 minutes');
//   const categories = ['stock_market', 'mutual_funds', 'ipo', 'investing', 'economy', 'commodities'];
  
//   for (const category of categories) {
//     const queryParams = `?category=${category}`;
//     try {
//       const data = await callExternalAPI('/ai_news', queryParams);
//       await redis.set(`news ${category}`, JSON.stringify(data), { ex: 86400 });
//       console.log(`Updated cache for category: ${category}`);
//     } catch (error) {
//       console.error(`Failed to update cache for category: ${category}`, error);
//     }
//   }
// });

app.get('/api/news/home', async (req, res) => {
  const categories = ['stock_market', 'mutual_funds', 'ipo', 'investing', 'economy', 'commodities'];
  
  try {
    // Check if the home page data is cached
    const cachedHomeData = await redis.get('news_home');
    
    if (cachedHomeData) {
      console.log('Cache hit for home page data');
      return res.json((cachedHomeData));
    }
    
    // Fetch data for all categories in parallel if home cache is not available
    const newsData = await Promise.all(
      categories.map(async (category) => {
        const cachedData = await redis.get(`news ${category}`);
        
        if (cachedData) {
          console.log(`Cache hit for ${category}`);
          return { category, data:(cachedData) };
        } else {
          const data = await callExternalAPI('/ai_news', `?category=${category}`);
          await redis.set(`news ${category}`, (data), { ex: 86400 });
          return { category, data };
        }
      })
    );

    // Format the response data by organizing it by category
    const formattedData = newsData.reduce((acc, { category, data }) => {
      acc[category] = data.articles.map(article => ({
        headline: article.headline,
        summary: article.summary,
        published_at: article.published_at,
        read_time: article.read_time,
        content: article.content
      }));
      return acc;
    }, {});

    // Store the formatted data in cache for the home route
    await redis.set('news_home', (formattedData), { ex: 86400 });

    res.json(formattedData);
  } catch (error) {
    console.error('Failed to fetch data for all categories:', error);
    res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
