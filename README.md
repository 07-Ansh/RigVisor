# RigVisor - The Ultimate PC Builder

RigVisor is a modern, web-based PC building and compatibility checking tool designed for enthusiasts. It simplifies the process of planning a custom PC build by providing real-time compatibility verification and performance estimation

## 🚀 Features

-   **Smart Compatibility Engine**: Automatically checks for:
    -   CPU & Motherboard Socket matching
    -   RAM Type (DDR4/DDR5) compatibility
    -   Physical dimensions (Case vs GPU length, Case vs Motherboard form factor)
-   **Performance Estimator**: Get instant "Gaming" and "Workstation" scores based on your selected components.
-   **Interactive Builder**: Visual interface to select components category by category.
-   **Pre-Builds**: Curated lists of components for various budgets and use cases.
-   **Local Storage**: Your cart and current build are saved automatically to your browser's local storage.
-   **Export & Share**: Generate a text summary of your build to share with friends or communities.

## 🛠️ Tech Stack

-   **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
-   **Styling**: Custom CSS with responsive design (Mobile-first approach)
-   **Data**: JSON-based component database
-   **Icons**: FontAwesome 6
-   **Fonts**: Inter (Google Fonts)

## 📂 Project Structure

```
RigVisor/
├── index.html          # Landing page
├── builder.html        # Main PC builder interface
├── shop.html           # Component browsing page
├── cart.html           # Shopping cart
├── prebuilds.html      # Pre-configured build lists
├── guides.html         # Hardware guides
├── contact.html        # Contact form
├── css/
│   └── style.css       # Main stylesheet
├── js/
│   ├── app.js          # Core logic (Builder, Compatibility, Scoring)
│   └── shop.js         # Shop page specific logic
├── data/               # JSON databases for components
│   ├── cpus.json
│   ├── gpus.json
│   ├── motherboards.json
│   └── ...
└── assets/             # Images and media
```

## ⚠️ Disclaimer & Usage Policy

**This project is for personal demonstration purposes only.**

You are **NOT** allowed to:
-   Reproduce, copy, or clone this website for public or commercial use.
-   Redistribute the code or assets.
-   Use this project as a base for your own commercial product.

All rights reserved.
