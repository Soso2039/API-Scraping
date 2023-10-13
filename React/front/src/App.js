import React, { useState, useEffect } from 'react';
import './App.css'; 
import { HiMiniMagnifyingGlass as Glass } from 'react-icons/hi2';

function App() {
  const [jsonData, setJsonData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const apiUrl = 'http://localhost:3001';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setJsonData(data);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchData();
  }, []);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % jsonData.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + jsonData.length) % jsonData.length);
  };

  const filteredData = jsonData.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentIndex(0);
  };

  return (
    <div>
      {jsonData.length > 0 ? (
        <div className="min-h-screen p-4 flex flex-col items-center">
          <div className="relative"> 
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={handleSearch}
              className="bg-gray-200 p-2 pl-10 mb-4 rounded-md"
            />
            <Glass className="absolute top-3 left-3 text-500" /> 
          </div>
          {filteredData.length > 0 ? (
            <div className="w-1/2">
              <div className="text-3xl text-center mb-4 font-bold">Results</div>
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray overflow-auto">
                  <pre className="indented-text text-left">
                    <code className="whitespace-pre-wrap text-sm">
{`[ 
  {
    "title": "${filteredData[currentIndex].title}",
    "short_description": "${filteredData[currentIndex].short_description}",
    "image": "${filteredData[currentIndex].image}",
    "category": "${filteredData[currentIndex].area}",
    "words": ${filteredData[currentIndex].words},
    "sentiment":${filteredData[currentIndex].sentiment},
    "date": "${filteredData[currentIndex].time}",
    "href": "${filteredData[currentIndex].href}"
  }
]`}
                    </code>
                  </pre>
                  <br />
                  <div className="flex justify-between">
                    <button
                      onClick={handlePrevious}
                      disabled={filteredData.length === 1 || currentIndex === 0}
                      className="bg-blue-500 hover-bg-blue-700 text-white font-bold py-2 px-4 rounded-l"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={filteredData.length === 1 || currentIndex === filteredData.length - 1}
                      className="bg-blue-500 hover-bg-blue-700 text-white font-bold py-2 px-4 rounded-r"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
          ) : (
            <p>No results found.</p>
          )}
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center">
          <div className="bg-gray-200 p-4 rounded-lg w-1/2 h-96">
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
