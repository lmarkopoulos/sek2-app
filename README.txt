# sek2-app (Union app for Android)

## How to run (dev)

1. cd sek2-app
2. npm install
3. npm start

## How to build for Android

1. npm run build
2. npx cap sync android
3. npx cap open android
   (then build/run from Android Studio)

## App Features
- News page (category: 'private-news' from headless WP)
- Header: logo, login/register buttons
- Register: name, surname, business name, mobile, email, password
- SMS and email validation
- Dashboard: Account, Voting (only phone-verified can vote), Union payments (Woo + Peiraius), Private news
- Voting: via headless WP Voting CPT + REST endpoints

## WordPress plugin
- Place plugin in `/wp-content/plugins/wp-plugin-sek-headless/`
- Activate in WP admin.
- Needs WooCommerce and JWT Auth for REST login.
