import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css'; 

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlot, setTimeSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]); 
  const [error, setError] = useState(''); 
  const link = 'http://localhost:8080';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        
        const response = await axios.post(`${link}/checkslot`, { date: formattedDate });
        setAvailableSlots(response.data.data);
        console.log(response.data.data);
        
        setError(''); 
      } catch (error) {
        console.error("Error checking slot:", error);
        setError('Failed to fetch available slots. Please try again later.');
      }
    };

    fetchData();
  }, [selectedDate]); 

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setTimeSlot(''); 
  };

  const handleTimeChange = (event) => {
    setTimeSlot(event.target.value);
  };

  const handleSubmit = async () => {
    const formattedDate = selectedDate.toISOString().split('T')[0]; 
    try {
      const response = await axios.post(`${link}/addslot`, { date: formattedDate, time: timeSlot });
      console.log(response.data);
      setTimeSlot('');
      setAvailableSlots([]);
      setSelectedDate(new Date()); 
      alert('Booking successful!'); 
    } catch (error) {
      console.error("Error booking slot:", error);
      setError('Failed to book the slot. Please try again later.');
    }
  };

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);

  return (
    <div className='container col-7'>
      <h2>Book a Time Slot</h2>
      {error && <div className="alert alert-danger">{error}</div>} 
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        minDate={new Date()} 
        maxDate={maxDate}
      />
      <select
        className="form-select col-3"
        aria-label="Select a time slot"
        value={timeSlot}
        onChange={handleTimeChange}
        disabled={!availableSlots.length} 
      >
        <option value="" disabled>Select a time slot</option>
        {availableSlots.map((slot) => (
          <option key={slot.time} value={slot.time}> 
            {slot.time}
          </option>
        ))}
      </select>
      <input
        type="submit"
        value="Book"
        className='btn btn-success'
        onClick={handleSubmit}
        disabled={!timeSlot}
      />
    </div>
  );
}