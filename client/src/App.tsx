import React, { useEffect, useState } from 'react';

const App = () => {
  // State to hold the server message
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Fetch data from the server when the component mounts
  useEffect(() => {
    fetch('/api/hello')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json(); // Parse response as JSON
      })
      .then((data) => {
        if (data && data.message) {
          setMessage(data.message); // Set the server message
        } else {
          throw new Error('Unexpected response format');
        }
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setError(err.message); // Set the error message
      });
  }, []);

  return (
    <div>
      <h1>Welcome to Tiers2gether!</h1>
      {/* Display the message or an error */}
      {error ? (
        <p style={{ color: 'red' }}>Error: {error}</p>
      ) : (
        <p>Server says: {message}</p>
      )}
    </div>
  );
};

export default App;

