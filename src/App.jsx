import { useState } from 'react'
import './App.css'

function App() {
  const [earthData, setEarthData] = useState(null)
  const [bannedDistances, setBannedDistances] = useState([]);
  const API_KEY = import.meta.env.VITE_APP_API_KEY
  
  const getDistanceFromEarth = (position) => {
    const { x, y, z } = position;
    const distanceKm = Math.sqrt(x * x + y * y + z * z);
    const distanceMiles = distanceKm * 0.621371;
    return distanceMiles.toFixed(0);  // Rounded to nearest mile
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`https://api.nasa.gov/EPIC/api/natural?api_key=${API_KEY}`);
      const data = await response.json();

      if (!data || data.length === 0) {
        console.error('No images found.');
        return;
      }

      let selectedData;
      let attempts = 0;
      const maxAttempts = 10;  // Prevents infinite loops

      do {
        const randomIndex = Math.floor(Math.random() * data.length);
        selectedData = data[randomIndex];
        attempts++;
      } while (bannedDistances.includes(getDistanceFromEarth(selectedData.dscovr_j2000_position)) && attempts < maxAttempts);

      setEarthData(selectedData);

    } catch (error) {
      console.error('Failed to fetch EPIC data:', error);
    }
  };

  const banCurrentDistance = () => {
    if (earthData) {
      const currentDistance = getDistanceFromEarth(earthData.dscovr_j2000_position);
      if (!bannedDistances.includes(currentDistance)) {
        setBannedDistances([...bannedDistances, currentDistance]);
      }
    }
  };
  const removeBannedDistance = (distanceToRemove) => {
  setBannedDistances(bannedDistances.filter(dist => dist !== distanceToRemove));
};

  return (
    <>
      <div>
        <h1 className='big-header'>NASA EPIC Imaging</h1>
        <h2 className='description'>Discover unique perspectives of the Earth</h2>
        {earthData && (
          <div className="image-info-container">
            <img 
              src={`https://epic.gsfc.nasa.gov/archive/natural/${earthData.date.split(' ')[0].replaceAll('-', '/')}/png/${earthData.image}.png`} 
              alt="image did not load" 
              className='Earth-Image'
            />
            <div className='info-data'>
              <p>Identifier: {earthData.identifier}</p>
              <p>Date: {earthData.date}</p>
              <p>Caption: {earthData.caption}</p>
              <p>Coords: Lat {earthData.centroid_coordinates.lat}, Lon {earthData.centroid_coordinates.lon}</p>
              <p>Distance from Earth: {getDistanceFromEarth(earthData.dscovr_j2000_position)} miles <button onClick={banCurrentDistance} className='ban-button'>Ban</button></p>
            </div>
          </div>
        )}
        <button onClick={fetchData} className="discover-button">Discover!</button>
        <div className="banned-box">
          <h2>Ban List</h2>
          {bannedDistances.length === 0 ? (
            <p className="banned-list">No banned distances yet.</p>
          ) : (
            <ul className="banned-list">
              {bannedDistances.map((dist, index) => (
                <li key={index}>
                  <button
                    className="ban-item-button"
                    onClick={() => removeBannedDistance(dist)}
                  >
                    {dist} miles ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}

export default App
