# Yield Calculator App 🧮

A modern, mobile-friendly Progressive Web App (PWA) designed to calculate output realizations, yield percentages, and net profit margins for processing raw materials (such as Toor Dal). 

Built entirely with **vanilla HTML, CSS, and JavaScript**, this app runs 100% on the client side—meaning no data is sent to a server, calculations are instantaneous, and it works completely offline once installed.

---

## 🌟 Key Features

* **📱 Progressive Web App (PWA):** Can be installed directly onto your mobile Home Screen (iOS & Android) with a built-in install prompt.
* **🎨 Multiple Color Themes:** Switch seamlessly between Light (White), Dark, Grey, and Amber themes. Your preference is automatically saved.
* **⚡ Smart Memory & Persistence:** Automatically saves your input fields, checkboxes, rates, and yields to your browser's local storage. Reopening the app restores your exact setup.
* **🔄 Flexible Unit Conversions:** Enter rates per **Quintal (100 kg)** or per **Kg** on a per-item basis. The app handles all conversions automatically in the background.
* **📊 Visual Yield Bar:** Includes a dynamic visual progress bar and color-coded legend to represent output contributions relative to 100%.
* **📅 Configurable History Tracking:** 
  * Save calculations with full timestamps (12-hour AM/PM format including year).
  * Set retention limits (**1 Week, 30 Days, 60 Days, 90 Days, Unlimited, or Custom Days**).
  * View detailed calculation breakdowns via an **Info (ℹ️)** modal.
  * Delete individual history items using the **Trash (🗑️)** button.
* **📱 Tabbed Bottom Navigation:** Separate **Calculator** and **History** tabs designed for a native mobile app feel.

---

## 📂 File Structure

```text
├── index.html       # Main HTML interface, themes, and layout structure
├── app.js           # Core business math, memory, history, and theme handlers
├── manifest.json    # PWA configuration file for mobile installation
├── sw.js            # Service worker for offline caching
└── icon.png         # App icon (512x512 PNG)
