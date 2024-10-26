import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'


const App = express()
App.use(cors())
App.use(express.json())

mongoose.connect('mongodb+srv://abinjos307:abinjose123@cluster0.cc6pu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then((data) => { console.log('Database connected') }).catch((data) => { console.log(data) })

const slotSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    slots: {
        type: Array, default: [
            { time: "09:00 AM", booked: false },
            { time: "10:00 AM", booked: false },
            { time: "11:00 AM", booked: false },
            { time: "12:00 PM", booked: false },
            { time: "01:00 PM", booked: false },
            { time: "02:00 PM", booked: false },
            { time: "03:00 PM", booked: false }
        ]
    }
});

const Slot = mongoose.model('Slot', slotSchema);

App.post('/addslot', async (req, res) => {
    const { date, time } = req.body;  

    try {
        const slotDocument = await Slot.findOne({ date, "slots.time": time });
      
        if (slotDocument) {
          if (!slotDocument.slots.find(slot => slot.time === time).booked) {
            await Slot.updateOne({ _id: slotDocument._id, "slots.time": time }, { $set: { "slots.$.booked": true } });
            return res.json({ message: 'Slot booked successfully' });
          } else {
            return res.status(400).json({ message: 'Slot is already booked' });
          }
        } else {
          return res.status(404).json({ message: 'No slots found for the specified date and time' });
        }
      } catch (error) {
        console.error('Error booking slot:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
});


App.post('/checkslot', async (req, res) => {
    const requestedDate = req.body.date;
    try {
      const slotDocument = await Slot.findOne({ date: requestedDate });
  
      if (slotDocument) {
        const availableSlots = slotDocument.slots.filter((slot) => !slot.booked);
        res.json({ message: 'Success', data: availableSlots });
      } else {
        const newSlotDocument = new Slot({
          date: requestedDate,
          slots: [
            { time: "09:00 AM", booked: false },
            { time: "10:00 AM", booked: false },
            { time: "11:00 AM", booked: false },
            { time: "12:00 PM", booked: false },
            { time: "01:00 PM", booked: false },
            { time: "02:00 PM", booked: false },
            { time: "03:00 PM", booked: false },
          ],
        });
  
        await newSlotDocument.save();
        const slotDocument = await Slot.findOne({ date: requestedDate });
        const availableSlots = slotDocument.slots.filter((slot) => !slot.booked);
        res.json({ message: 'Success', data: availableSlots });
      }
    } catch (error) {
      console.error("Error checking slot:", error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

App.listen(8080, () => {
    console.log('Server running');
});