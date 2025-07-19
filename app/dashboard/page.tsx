'use client';

import { useState } from 'react';

export default function Dashboard() {
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const takeScreenshot = async () => {
    if (!url) return;
    setLoading(true);
    setImageUrl('');
    try {
      const res = await fetch(`/api/screenshot?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const blob = await res.blob();
        setImageUrl(URL.createObjectURL(blob));
      } else {
        console.error('Failed to take screenshot');
      }
    } catch (error) {
      console.error('Error taking screenshot:', error);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Website Screenshot</h1>
      <div className="flex items-center mb-4">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL"
          className="border p-2 rounded-l-md w-full"
        />
        <button
          onClick={takeScreenshot}
          disabled={loading}
          className="bg-blue-500 text-white p-2 rounded-r-md disabled:bg-gray-400"
        >
          {loading ? 'Loading...' : 'Take Screenshot'}
        </button>
      </div>
      {imageUrl && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Screenshot Preview:</h2>
          <img src={imageUrl} alt="Website screenshot" className="border" />
        </div>
      )}
    </div>
  );
}