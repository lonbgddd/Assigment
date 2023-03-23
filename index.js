const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User } = require("./model/use.js");
const { Clothes } = require("./model/Clothes.js");
const e = require('express');
var app = express();


// chuyển đổi file sang String với multer


// connect with mongooeDB
dotenv.config();
mongoose.connect(process.env.MONGOSEDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(console.log('connect to mongooDB'))
.catch(error => console.log(error));

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())

app.engine('.ejs', exphbs.engine({ extname: ".ejs",
defaultLayout: false,
layoutsDir: "views/"}));
// app.use(exphbs);
// app.set('layout');
app.set('view engine', 'ejs');



// login logic
app.get('/login', (req, res)=> {
    res.render('login');
});

app.get('/home',async (req, res)=> {
    const data = await User.find();
    const dataProduct = await Clothes.find();
    res.render(
        'home',
        {titile:"Long",users: data.map(user => user.toJSON()), products: dataProduct.map(product => product.toJSON())}
    );
});

app.post('/login', (req, res)=> {
    var email = req.body.email;
    var password = req.body.password;
    User.findOne({
        email:email,
        password: password
    })
    .then(data=> {
        res.redirect('home', data);
    })
    .catch(err=>
        console.log(err)
    );
});




// đăng ký tài khoản
app.get('/signup', (req, res)=> {
    res.render('signup');
});



app.post('/signup', async (req, res)=> {
        User.create(req.body).then(data=> {
            res.json("Tạo tài khoản thành công");
        });
        res.redirect('login');
});

// thêm sản phẩm bán hàng
app.get('/addnewProduct', (req, res)=> {
    res.render('addnewProduct');
});

app.post('/addnewProduct',async (req, res)=> {
    if (req.body.id == '') {
        try {
            Clothes.create(req.body)
                .then(data=> {
                    res.redirect('addnewProduct');
                })
                .catch(err=> console.log(err));
        } catch (error) {
            console.log(error);
        }
        res.render('addnewProduct');
    } else {
        await Clothes.findOneAndUpdate({_id:req.body.id}, req.body, {new: true});
        res.redirect('home');
    }
    
});
 
app.get('/update/:id', async (req, res)=> {
    const cloth =await Clothes.findById(req.params.id);
    res.render('addnewProduct', {object: cloth.toJSON(), titile: "Cập nhật sản phẩm"});
});

app.get('/delete/:id', async (req, res)=> {
    try {
        await Clothes.findByIdAndDelete(req.params.id, req.body);
        res.redirect('home');
    } catch (error) {
        res.sendStatus(500);
    }
});
// app.post('/user', async (req, res)=> {
//     try {
//         const user = new User(req.body);
//         await user.save();
//         res.sendStatus(200).json(user);
//     } catch (error) {
//         res.sendStatus(500).json(error);
//     }
// });



app.listen(process.env.PORT, ()=>{
    console.log('Hello you');
})