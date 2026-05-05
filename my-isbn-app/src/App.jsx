import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isbn, setIsbn] = useState('');
  const [result, setResult] = useState({ message: '', isValid: null });
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(false);

  // دالة الفحص (Logic)
  const validateISBN = (val) => {
    const clean = val.replace(/[- ]/g, "");
    if (clean.length === 13) {
      let sum = 0;
      for (let i = 0; i < 12; i++) sum += parseInt(clean[i]) * (i % 2 === 0 ? 1 : 3);
      return (10 - (sum % 10)) % 10 === parseInt(clean[12]);
    }
    if (clean.length === 10) {
      let sum = 0;
      for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i);
      let last = clean[9].toUpperCase();
      sum += (last === 'X') ? 10 : parseInt(last);
      return sum % 11 === 0;
    }
    return false;
  };

  // دالة جلب البيانات من الإنترنت
  const fetchBookDetails = async (cleanIsbn) => {
    setLoading(true);
    setBookData(null);
    try {
      const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`);
      const data = await response.json();
      const bookInfo = data[`ISBN:${cleanIsbn}`];
      
      if (bookInfo) {
        setBookData({
          title: bookInfo.title,
          author: bookInfo.authors?.[0]?.name || 'مؤلف غير معروف',
          cover: bookInfo.cover?.large || 'https://via.placeholder.com/150?text=No+Cover'
        });
      }
    } catch (error) {
      console.error("خطأ في جلب البيانات", error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setIsbn(value);
    const clean = value.replace(/[- ]/g, "");

    if (clean.length === 10 || clean.length === 13) {
      const isOk = validateISBN(value);
      setResult({ message: isOk ? "الرقم صحيح ✅" : "الرقم غير صحيح ❌", isValid: isOk });
      
      if (isOk) fetchBookDetails(clean); // إذا الرقم صحيح، اجلب البيانات فوراً
    } else {
      setResult({ message: "أدخل 10 أو 13 رقم...", isValid: null });
      setBookData(null);
    }
  };

 return (
  <div className="container">
    <div className="card">
      {/* 1. الكتابة فوق (العنوان) */}
      <div className="card-title">
        <span>📚</span>
        <h1>مستكشف الكتب الذكي</h1>
      </div>
      <p>أدخل رقم الـ ISBN للتأكد من صحة الكتاب وجلب بياناته</p>

      {/* 2. البوكس في المنتصف (Input) */}
      <input 
        className={result.isValid === true ? 'valid' : result.isValid === false ? 'invalid' : ''}
        type="text" 
        placeholder="مثال: 9780141036144" 
        value={isbn}
        onChange={handleChange}
      />

      {/* 3. النتيجة تظهر تحت البوكس */}
      {result.message && (
        <div className={`status-msg ${result.isValid === true ? 'valid-msg' : result.isValid === false ? 'invalid-msg' : ''}`}>
          {result.message}
        </div>
      )}

      {/* تفاصيل الكتاب تظهر في الأسفل عند نجاح الفحص */}
      {bookData && (
        <div className="book-details">
          <img src={bookData.cover} alt="Cover" />
          <h3>{bookData.title}</h3>
          <p>المؤلف: {bookData.author}</p>
        </div>
      )}
    </div>
  </div>
);
  
}

export default App;