# Bitwarden Deduplicator

A high-performance, secure, and modern web-based tool for cleaning up duplicate entries in your Bitwarden vault. This tool runs entirely in your browser—your sensitive data never leaves your computer.

## 🚀 Key Features

-   **Zero-Knowledge Privacy**: No server-side processing. All JSON parsing and deduplication happen locally in your browser.
-   **Intelligent Scrubbing**: Choose from 6 different "Delete Strategies" to find duplicates based on your specific needs.
-   **Modern Dashboard**: A premium, accessible UI with dark mode, sticky headers, and smooth animations.
-   **Bulk Management**: Quickly select multiple items and perform batch deletes or restores.
-   **Domain Grouping**: Automatically groups vault items by domain for easy navigation.
-   **Performance Optimized**: Designed to handle vaults with thousands of entries using GPU-accelerated animations and localized UI updates.
-   **Security First**: Passwords are masked by default. Supports individual reveal or global "Reveal All" for quick auditing.

## 🛠️ Delete Strategies

The tool provides granular control over how duplicates are identified:

| Strategy | Description |
| :--- | :--- |
| **Domain + User + Pass** | Matches entries with the same base domain (e.g., github.com) and credentials. |
| **Full URL + User + Pass** | Precise matching based on the exact URI path. |
| **Site Name + User + Pass** | Matches based on the display name of the vault item. |
| **User + Pass (Global)** | Finds identical credentials shared across any site. |
| **Username Only** | Audits all locations where a specific username is used. |
| **Incomplete** | Flags any entries missing either a username or a password. |

## 📖 How to Use

1.  **Export Your Vault**: In Bitwarden, go to *Tools* > *Export Vault* and select **.json** format.
2.  **Import**: Drag and drop your `.json` file into the Deduplicator or click "Choose File".
3.  **Audit**: Use the sidebar to browse by domain or use "Run auto-delete" with your preferred strategy.
4.  **Review**: Manually restore or delete items as needed. You can use the "Reveal all passwords" button to compare secrets.
5.  **Export**: Click **Export deduped** to download your cleaned JSON file.
6.  **Import to Bitwarden**: (Optional) You can clear your vault and import the cleaned file, or use it as a reference for manual cleanup.

## 💻 Tech Stack

-   **Frontend**: Vanilla HTML5, CSS3, and JavaScript (ES6+).
-   **Typography**: Google Fonts (Inter, Outfit).
-   **Aesthetics**: Glassmorphism, CSS Transitions, and SVG icons.
-   **Performance**: DocumentFragment rendering and CSS Transform-based animations.

## 🔒 Security Note

This tool is a static HTML file. It does not use any third-party tracking, cookies, or analytics. Your vault data is processed in memory and is lost as soon as the tab is closed.

---
*Created with focus on privacy, speed, and clean UX.*
