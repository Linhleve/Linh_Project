require('dotenv').config()
const express = require('express');
const path = require('path');
const session = require('express-session')



const shop_data = require('./routes/shop_data')
const manage_data_router = require('./routes/manage_data')
const manage_router = require('./routes/manage')
const staff_router = require('./routes/staff')
const main_router = require('./routes/main')
const account_router = require('./routes/tai_khoan')
const user_data = require('./routes/user_data')




const app = express();
const port = process.env.PORT

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));


app.use('/user-data', user_data);
app.use('/shop-data', shop_data);
app.use('/manage-data', manage_data_router);
app.use('/tai-khoan', account_router);
app.use('/quan-ly-du-lieu', manage_router);
app.use('/nhan-vien', staff_router);
app.use('/', main_router);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
    console.log(`http://localhost:${port}/trang-chu`);
})

