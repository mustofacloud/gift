const axios = require("axios");
require("dotenv").config();

async function scrapeGiftData(slug) {
  const url = `https://api.idn.app/api/v1/gift/livestream/${slug}/top-gifter?n=1`;

  try {
    const response = await axios.get(url, {
      headers: {
        "X-API-KEY": "123f4c4e-6ce1-404d-8786-d17e46d65b5c",
      },
    });

    const rankData = response.data.data
      .map((item) => ({
        image_url: item.image_url,
        rank: item.rank,
        name: item.name,
        gold: `${item.total_gold} Gold`,
        point: `${item.total_point} Point`
      }));

    return rankData;
  } catch (error) {
    throw error;
  }
}

module.exports = {scrapeGiftData};