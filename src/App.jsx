import { useState, useEffect } from 'react';
import './App.css'

const ACCESS_KEY = import.meta.env.VITE_APP_ACCESS_KEY;

const BIBLE_API = "https://labs.bible.org/api/?passage=random&type=json";
const UNSPLASH_API = "https://api.unsplash.com/search/photos";


function App() {
  const [verse, setVerse] = useState(null);
  const [imageURL, setImageURL] = useState('');
  const [banList, setBanList] = useState(() => {
    return JSON.parse(localStorage.getItem("banList")) || [];
  });
  const [history, setHistory] = useState([]);

  const fetchVerse = async () => {
    try {
      let newVerse = null;
      let attempts = 0;

      //finding a new verse that's not on the banned list, up to five times
      do {
        const res = await fetch(BIBLE_API);
        const data = await res.json();
        newVerse = data[0];
        attempts++;
      } while (banList.includes(newVerse.bookname) && attempts < 5);

      if (verse) {
        setHistory(prev => [...prev, verse]);
      }

      setVerse(newVerse);
      fetchImage(newVerse.bookname);
    } catch (err) {
      console.error("fetching verse error:", err);
    }
  }

  const fetchImage = async (query) => {
    try {
      const randomPage = Math.floor(Math.random() * 5) + 1;
      const res = await fetch(
        `${UNSPLASH_API}?query=${query}+bible+verse+landscape&page=${randomPage}&client_id=${ACCESS_KEY}&orientation=landscape`
      );
      const data = await res.json();
      const img = data.results?.[0]?.urls?.regular;
      setImageURL(img || "");
    } catch (err) {
      console.error("error fetching image:", err);
    }
  };

  const banCurrent = () => {
    if (verse?.bookname && !banList.includes(verse.bookname)) {
      const updatedList = [...banList, verse.bookname];
      setBanList(updatedList);
      localStorage.setItem("banList", JSON.stringify(updatedList));
    }
    fetchVerse();
  };
  const removeBan = (bookToRemove) => {
    const updatedList = banList.filter(book => book !== bookToRemove);
    setBanList(updatedList);
    localStorage.setItem("banList", JSON.stringify(updatedList));
  }

  useEffect(() => {
    fetchVerse();
  }, []);

  const resetBanned = () => {
    const updatedList = [];
    setBanList(updatedList);
    localStorage.setItem("banList", JSON.stringify(updatedList));
  }


  return (
    <>
      <h1>Stumble Upon a Verse App</h1>

      <section className='container'>

        <div className="banned-section">
          <h2>Ban List</h2>
          <div className="ban-list">
            {banList.length === 0 ? <p>No banned books.</p> : banList.map((book, idx) => (
              <button className="ban-list-item" onClick={() => removeBan(book)} key={idx}>{book}</button>))
            }
          </div>
        </div>

        <div>
        </div>
        {verse && (
          <div className='verse-image'>
            {imageURL && (
              <img src={imageURL} alt={verse.bookname} />
            )}
            <p>"{verse.text}"</p>
            <p>- {verse.bookname} {verse.chapter}:{verse.verse}</p>

            <div className='button-group'>
              <button onClick={fetchVerse}>Next</button>
              <button onClick={banCurrent}>Ban "{verse.bookname}"</button>
              <button onClick={resetBanned}>Reset</button>
            </div>
          </div>
        )}


        <div className="previous-section">
          <h2>Previously Viewed</h2>
          <div className="previous-list">
            {history.length === 0 ? <p>No history (yet)</p> :
              history.map((v, idx) => (
                <p className="previous-list-item" key={idx}>{v.bookname} {v.chapter} : {v.verse}</p>))
            }
          </div>
        </div>
      </section>
    </>
  )
}

export default App
