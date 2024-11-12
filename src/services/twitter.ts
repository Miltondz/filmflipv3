import { TwitterApi } from 'twitter-api-v2';

const TWITTER_API_KEY = import.meta.env.VITE_TWITTER_API_KEY;
const TWITTER_API_SECRET = import.meta.env.VITE_TWITTER_API_SECRET;
const TWITTER_ACCESS_TOKEN = import.meta.env.VITE_TWITTER_ACCESS_TOKEN;
const TWITTER_ACCESS_SECRET = import.meta.env.VITE_TWITTER_ACCESS_SECRET;

const client = new TwitterApi({
  appKey: TWITTER_API_KEY,
  appSecret: TWITTER_API_SECRET,
  accessToken: TWITTER_ACCESS_TOKEN,
  accessSecret: TWITTER_ACCESS_SECRET,
});

export const uploadImageAndTweet = async (imageData: string, text: string) => {
  try {
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageData.split(',')[1], 'base64');
    
    // Upload media
    const mediaId = await client.v1.uploadMedia(imageBuffer, { type: 'png' });
    
    // Create tweet with media
    const tweet = await client.v2.tweet({
      text,
      media: { media_ids: [mediaId] }
    });

    return tweet;
  } catch (error) {
    console.error('Error posting to Twitter:', error);
    throw error;
  }
};