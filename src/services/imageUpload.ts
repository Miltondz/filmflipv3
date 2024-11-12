import axios from 'axios';

const API_KEY = 'c5a091e9e89b1c7c1a1e80fe42977c89'; // ImgBB API key
const API_URL = 'https://api.imgbb.com/1/upload';

interface ImgBBResponse {
  data: {
    url: string;
    display_url: string;
    delete_url: string;
  };
  success: boolean;
  status: number;
}

export const uploadImage = async (imageDataUrl: string): Promise<string> => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('key', API_KEY);
    formData.append('image', imageDataUrl);

    const response = await axios.post<ImgBBResponse>(API_URL, formData);

    if (!response.data.success) {
      throw new Error('Upload failed');
    }

    return response.data.data.display_url;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Upload error:', error.response?.data || error.message);
      throw new Error(`Failed to upload image: ${error.response?.data?.error?.message || error.message}`);
    }
    throw new Error('Failed to upload image. Please try again.');
  }
};