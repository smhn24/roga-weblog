const passport = require('passport')
const fetch = require('node-fetch')
const jwt = require('jsonwebtoken')

const User = require('../models/User')
const { sendEmail } = require('../utils/mailer')
const { get404 } = require('./errorController')
const { loginValidation } = require('../models/secure/loginValidation')

exports.login = (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
  res.render('auth/login', {
    pageTitle: 'ورود به بخش مدیریت',
    path: '/login',
    success: req.flash('success')
  })
}

exports.handleLogin = async (req, res, next) => {
  // const errors = [];
  // const secretKey = process.env.CAPTCHA_SECRET;
  // const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body["g-recaptcha-response"]}&remoteip=${req.connection.remoteAddress}`;

  // try {
  //   await loginValidation.validate(req.body, { abortEarly: false });

  //   const response = await fetch(verifyUrl, {
  //     method: "POST",
  //     headers: {
  //       Accept: "application/json",
  //       contentType: "application/x-www-form-urlencoded; charset=utf-8",
  //     },
  //   });
  //   const json = await response.json();
  //   if (json.success) {
  passport.authenticate(
    'local',
    {
      failureRedirect: '/users/login'
    }
    // (err, user, info) => {
    //   if (err) {
    //     errors.push({
    //       field: "global",
    //       message: info.message,
    //     });
    //     res.render("auth/login", {
    //       pageTitle: "ورود به بخش مدیریت",
    //       path: "/login",
    //       errors,
    //     });
    //   }
    //   if (!user) {
    //     errors.push({
    //       field: "global",
    //       message: info.message,
    //     });
    //     res.render("auth/login", {
    //       pageTitle: "ورود به بخش مدیریت",
    //       path: "/login",
    //       errors,
    //     });
    //   }
    // }
  )(req, res, next)
  //   } else {
  //     errors.push({
  //       field: "global",
  //       message: "مشکلی در کپچا وجود دارد",
  //     });
  //     res.render("auth/login", {
  //       pageTitle: "ورود به بخش مدیریت",
  //       path: "/login",
  //       success: req.flash("success"),
  //       errors,
  //     });
  //   }
  // } catch (err) {
  //   if (err.inner) {
  //     err.inner.forEach((e) => {
  //       errors.push({ field: e.path, message: e.message });
  //     });
  //   } else {
  //     errors.push({ field: "global", message: "مشکلی روی داده است" });
  //   }
  //   res.render("auth/login", {
  //     pageTitle: "ورود به بخش مدیریت",
  //     path: "/login",
  //     errors,
  //   });
  // }
}

exports.rememberMe = (req, res) => {
  if (req.body.remember) {
    req.session.cookie.originalMaxAge = 24 * 60 * 60 * 1000
  } else {
    req.session.cookie.expire = null
  }

  res.redirect('/dashboard')
}

exports.logout = (req, res) => {
  req.session.destroy(() => {
    req.logout()
    res.setHeader('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
    res.redirect('/users/login')
  })
}

exports.register = (req, res) => {
  res.render('auth/register', {
    pageTitle: 'ثبت نام کاربر جدید',
    path: '/register'
  })
}

exports.createUser = async (req, res) => {
  const errors = []

  const secretKey = process.env.CAPTCHA_SECRET
  const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body['g-recaptcha-response']}&remoteip=${req.connection.remoteAddress}`

  try {
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        contentType: 'application/x-www-form-urlencoded; charset=utf-8'
      }
    })
    const json = await response.json()
    if (!json.success) {
      errors.push({ field: 'global', message: 'مشکلی در کپچا وجود دارد' })
      return res.render('auth/register', {
        pageTitle: 'ثبت نام کاربر جدید',
        path: '/register',
        errors
      })
    }
  } catch (err) {
    errors.push({ field: 'global', message: 'مشکلی به جود آمده است' })
    return res.render('auth/register', {
      pageTitle: 'ثبت نام کاربر جدید',
      path: '/register',
      errors
    })
  }

  try {
    await User.userValidation(req.body)
    const { fullname, password, email } = req.body
    const user = await User.findOne({ email })
    if (user) {
      errors.push({
        field: 'global',
        message: 'کاربری با این ایمیل وجود دارد'
      })
      return res.render('auth/register', {
        pageTitle: 'ثبت نام کاربر جدید',
        path: '/register',
        errors
      })
    }

    await User.create({ fullname, email, password })

    //? Send welcome email
    sendEmail(email, fullname, 'به سایت وبلاگ خوش آمدید', 'خیلی خوشحالیم که به جمع ما پیوستید. امیدوارم وبلاگ های زیبایی توسط شما منتشر بشه.')

    req.flash('success', 'ثبت نام با موفقیت انجام شد')
    res.redirect('/users/login')
  } catch (err) {
    err.inner.forEach(e => {
      errors.push({ field: e.path, message: e.message })
    })
    return res.render('auth/register', {
      pageTitle: 'ثبت نام کاربر جدید',
      path: '/register',
      errors
    })
  }
}

exports.forgetPassword = async (req, res) => {
  res.render('auth/forgetPassword', {
    pageTitle: 'فراموشی رمز عبور',
    path: '/forget-password',
    success: req.flash('success')
  })
}

exports.handleForgetPassword = async (req, res) => {
  let errors = []
  const { email } = req.body

  if (!email.length > 0) {
    errors.push({ field: 'email', message: 'ایمیل را وارد کنید' })
    res.render('auth/forgetPassword', {
      pageTitle: 'فراموشی رمز عبور',
      path: '/forget-password',
      errors
    })
  }

  try {
    const user = await User.findOne({ email })
    if (!user) {
      errors.push({ field: 'email', message: 'کاربری با این ایمیل وجود ندارد' })
      res.render('auth/forgetPassword', {
        pageTitle: 'فراموشی رمز عبور',
        path: '/forget-password',
        errors
      })
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    })

    const resetLink = `http://weblog.nabavi.dev/users/reset-password/${token}`
    sendEmail(user.email, user.fullname, 'فراموشی رمز عبور', `<h1>برای تغییر رمز عبور روی لینک زیر کلیک کنید</h1> <a href="${resetLink}">لینک تغییر رمز عبور</a>`)

    req.flash('success', 'لینک تغییر رمز عبور به ایمیل شما ارسال شد')
    res.redirect('/users/forget-password')
  } catch (err) {
    errors.push({ field: 'email', message: 'مشکلی به جود آمده است' })
    res.render('auth/forgetPassword', {
      pageTitle: 'فراموشی رمز عبور',
      path: '/forget-password',
      errors
    })
  }
}

exports.resetPassword = async (req, res) => {
  const token = req.params.token

  let decodedToken
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET)
  } catch (err) {
    if (!decodedToken) {
      return get404(req, res)
    }
  }

  res.render('auth/resetPassword', {
    pageTitle: 'تغییر رمز عبور',
    path: '/reset-password',
    userId: decodedToken.userId
  })
}

exports.handleResetPassword = async (req, res) => {
  let errors = []
  const { password, confirmPassword } = req.body

  if (password !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'رمز عبور با تکرار آن مطابقت ندارد' })
    return res.render('auth/resetPassword', {
      pageTitle: 'تغییر رمز عبور',
      path: '/reset-password',
      userId: req.params.id,
      errors
    })
  }
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return get404(req, res)
    }

    user.password = password
    await user.save()

    req.flash('success', 'رمز عبور با موفقیت به روز رسانی شد')
    res.redirect('/users/login')
  } catch (err) {
    errors.push({ field: 'confirmPassword', message: 'مشکلی به جود آمده است' })
    return res.render('auth/resetPassword', {
      pageTitle: 'تغییر رمز عبور',
      path: '/reset-password',
      userId: req.params.id,
      errors
    })
  }
}
