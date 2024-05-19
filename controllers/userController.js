const User = require("../models/userModel");
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")



const securePassword = async(password) => {
    try {
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}

// for send mail
const sendVerifyMail = async(name, email, user_id) => {

try {
    const transporter = nodemailer.createTransport({
        host:'smtp.gmail.com',
        port:587,
        secure:false,
        requireTLS:true,
        auth:{
            user:'najafnaju1983@gmail.com',
            pass:'uyob vnsn srcy ilkx'
        }
    });
    const mailOptions = {
        from:'najafnaju1983@gmail.com',
        to:email,
        subject:"for verification mail",
        html:'<p>Hii '+name+', please click here to <a href="http://127.0.0.1:3000/verify?id='+user_id+'">Verify </a> your mail.</p>'
    }
    transporter.sendMail(mailOptions,(error,info) =>{
        if (error) {
            console.log(error);
        } else {
            console.log("email has been sent  ",info.response);
        }
    })

} catch (error) {
    console.log(error.message);
}

}

const loadRegister = async(req,res) => {
    try {
        res.render('registration')
    } catch (error) {
        console.log(error.message)
    }
}

const insertUser = async(req,res) => {
    try {
        const spassword = await securePassword(req.body.password);
        const user = new User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mno,
            image:req.file.filename,
            password:spassword,
            is_admin:0
    });

    const userData = await user.save();

    if(userData){
        sendVerifyMail(req.body.name, req.body.email, userData._id)
        res.render('registration',{message:"your registration has been succesfull"});
    }else{
        res.render('registration',{message:"your registration has been failed"});
    }

    } catch (error) {
        console.log(error.message)
    }
}


    const verifyMail = async(req, res)=>{

        try {
            
            const updateInfo = await User.updateOne({_id:req.query.id},{$set: {is_varified: 1}});

            console.log(updateInfo);
            res.render("email-verified")

        } catch (error) {
            console.log(error.message)
        }

    }

// user login

const loginLoad = async(req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async(req, res) => {

    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({email:email});

        if (userData) {
            const passwordMatch = await bcrypt.compare(password,userData.password);
            if (passwordMatch) {
                if (userData.is_varified === 0) {
                    res.render('login',{message:"please verify your mail"})
                } else {
                    req.session.user_id = userData._id;
                    res.redirect('/home');
                }
            } else {
                res.render('login',{message:"email and password is incorrect"})
            }
        } else {
            res.render('login',{message:"email and password is incorrect"})
        }
    } catch (error) {
        console.log(error.message);
    }

}

const loadHome = async(req, res) => {
    try {
        const userData = await User.findById({_id:req.session.user_id});
        res.render('home',{user:userData})
    } catch (error) {
        console.log(error.message)
    }
}

const userLogout = async(req, res) => {
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
}

const editLoad = async(req, res)=>{
    try {
        const id = req.query.id;

        const userData = await User.findById({ _id:id });

        if (userData) {
            res.render('edit',{user:userData});
        } else {
            res.redirect('/home')
        }

    } catch (error) {
        console.log(error.message);
    }
}

const updateProfile = async(req, res)=>{
    try {
        if (req.file) {
            const userData = await User.findByIdAndUpdate({ _id:req.body.user_id },{ $set: { name:req.body.name, email:req.body.email, mobile:req.body.mno, image:req.file.filename } })

        } else {
            const userData = await User.findByIdAndUpdate({ _id:req.body.user_id },{ $set: { name:req.body.name, email:req.body.email, mobile:req.body.mno } })
        }

        res.redirect('/home')

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadRegister,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    editLoad,
    updateProfile
}