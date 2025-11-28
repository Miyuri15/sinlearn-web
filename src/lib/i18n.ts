import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    common: {
      title: "Welcome Back",
      subtitle: "Sign in to continue to SinLearn",
      signin: "Sign In",
      signup: "Sign Up",
      email: "Email",
      password: "Password",
      button_signin: "Sign In",
      button_signup: "Create Account",
    },
  },
  si: {
    common: {
      title: "ආපසු සාදරයෙන් පිළිගනිමු",
      subtitle: "SinLearn වෙත දිගටම යාමට පුරනය වන්න",
      signin: "පුරනය වන්න",
      signup: "ලියාපදිංචි වන්න",
      email: "විද්‍යුත් තැපෑල",
      password: "මුරපදය",
      button_signin: "පුරනය වන්න",
      button_signup: "ගිණුමක් සාදන්න",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
