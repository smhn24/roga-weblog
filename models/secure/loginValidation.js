const Yup = require("yup");

exports.loginValidation = Yup.object().shape({
  email: Yup.string().email("ایمیل معتبر نیست").required("ایمیل الزامی است"),
  password: Yup.string()
    .required("کلمه عبور وارد نشده است")
    .min(4, "کلمه عبور نباید کمتر از 4 کاراکتر باشد")
    .max(255, "کلمه عبور طولانی است"),
});
