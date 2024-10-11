import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [image, setImage] = useState(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const uploadImage = async () => {
    try {
      const formData = new FormData();
      formData.append('file', image);

      const response = await axios.post('http://localhost:4040/upload', formData);
      alert(response?.data?.message);
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    }
  };

  useEffect(() => {
    if (!image) {
      console.log('No image selected');
    } else {
      uploadImage();
    }
  }, [image]);

  const analyzeImage = async () => {
    try {
      setLoading(true);
      if (!image) {
        setError('Error! Please add image');
        setLoading(false);
        return;
      } else {
        const response = await axios.post('http://localhost:4040/gemini', JSON.stringify({ message: value }), {
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response?.data;
        setResponse(data);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
      setLoading(false);
    }
  };

  const clear = () => {
    setError('');
    setResponse('');
    setValue('');
    setImage(null);
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <h1>Ahmed's AI Image Recognition Chatbot</h1>
      
      <div className="image-upload-section">
        {image && <img src={URL.createObjectURL(image)} alt="Preview" className="image-preview" />}
        <label htmlFor="files">Upload Image</label>
        <input
          onChange={(e) => setImage(e.target.files[0])}
          id="files"
          accept="image/*"
          type="file"
          hidden
        />
      </div>

      <div>
        <p>What do you want to know about the image?</p>
        <input
          className="chat-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="What is in the image..."
        />
        {!response && !error && (
          <button onClick={analyzeImage}>{loading ? 'Loading...' : 'Ask'}</button>
        )}
        {error && <p className="chat-error">{error}</p>}
        {response && <p className="chat-error">{response}</p>}
        <button onClick={clear}>Clear</button>
      </div>

      {/* User Message */}
      <div className="chat-message user-message">
        <p>{value}</p>
      </div>

      {/* AI Response */}
      <div className="chat-message ai-message">
        <p>{response}</p>
      </div>
    </div>
  );
}

export default App;
