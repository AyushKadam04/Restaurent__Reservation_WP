// server.js
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the 'public' directory

// CSV Writer Setup
const csvWriter = createCsvWriter({
    path: 'bookings.csv',
    header: [
        { id: 'firstName', title: 'First Name' },
        { id: 'lastName', title: 'Last Name' },
        { id: 'email', title: 'Email' },
        { id: 'tableType', title: 'Table Type' },
        { id: 'guestNumber', title: 'Guest Number' },
        { id: 'placement', title: 'Placement' },
        { id: 'date', title: 'Date' },
        { id: 'time', title: 'Time' },
        { id: 'note', title: 'Note' }
    ],
    append: true // Append to the existing file
});

// Route to serve the booking form
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/booking.html');
});

// Route to handle form submission
app.post('/book', (req, res) => {
    const { firstName, lastName, email, tableType, guestNumber, placement, date, time, note } = req.body;

    // Write to CSV
    const bookingData = {
        firstName,
        lastName,
        email,
        tableType,
        guestNumber,
        placement,
        date,
        time,
        note
    };

    csvWriter.writeRecords([bookingData]) // returns a promise
        .then(() => {
            console.log('Booking data written to CSV file.');

            // Set up Nodemailer transport
            const transporter = nodemailer.createTransport({
                service: 'gmail', // Use your email service
                auth: {
                    user: 'your-email@gmail.com', // Your email
                    pass: 'your-email-password' // Your email password
                }
            });

            const mailOptions = {
                from: 'your-email@gmail.com',
                to: email,
                subject: 'Booking Confirmation',
                text: `Hello ${firstName} ${lastName},\n\nThank you for your booking!\n\nHere are your booking details:\n- Table Type: ${tableType}\n- Number of Guests: ${guestNumber}\n- Placement: ${placement}\n- Date: ${date}\n- Time: ${time}\n- Note: ${note}\n\nWe look forward to serving you!\n\nBest regards,\nYour Restaurant`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.status(500).json({ message: 'Error sending email' });
                }
                res.status(200).json({ message: 'Booking confirmed! A confirmation email has been sent.' });
            });
        })
        .catch((error) => {
            console.error('Error writing to CSV file:', error);
            res.status(500).json({ message: 'Error saving booking data' });
        });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
