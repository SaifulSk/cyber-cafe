# SevaDesk | Digital Seva Kendra & Cyber Cafe Operations Portal

A modern, high-aesthetic operational platform and management suite built with **React**, **TypeScript**, **Vite**, and **Firebase** for Digital Seva Kendras, CSC Common Service Centres, and Cyber Cafes.

---

## 🌟 Key Features

### 1. 🔐 Multi-Tenant Authentication & Operator Scoping
- **Email & Password Authentication**: Secure sign up and login powered by Firebase Auth.
- **Data Isolation**: Each operator maintains their own separate customer list, transaction ledger, and service configurations.
- **Kendra Profile Customization**: Operator can configure their Seva Kendra name, CSC / VLE ID, helpline number, and physical center address.
- **Instant Demo Mode**: One-click demo operator session for immediate offline or testing access.

### 2. ⚡ Master Menus
- **Services Master Menu**:
  - Pre-seeded with common Indian CSC & Cyber Cafe operations:
    - Mobile & DTH Recharge (Jio, Airtel, Vi, BSNL, Tata Play)
    - AEPS (Aadhaar Cash Withdrawal, Deposit & Balance Enquiry)
    - State Electricity Bill Payments (WBSEDCL, etc.)
    - Ration Card (New Apply, Member Add, e-Ration)
    - Voter ID Card (Form 6, Form 8, Epic Download & Print)
    - PAN Card (UTIITSL / NSDL New Application & Correction)
    - Domestic Money Remittance (DMT)
    - Aadhaar PVC Card Orders & e-Aadhaar Prints
    - Government Certificates (Caste, Income, Domicile)
    - Xerox, Document Scanning & Lamination
    - IRCTC Railway & Bus Ticket Reservations
    - PM-Kisan Samman Nidhi e-KYC & Status
  - Add custom services with predefined default operator cost and customer fee rates.
- **Customer Master Directory**:
  - Customer contact directory with Phone / WhatsApp, Aadhaar last 4 digits, village / area, and notes.
  - Automatically registers new customers whenever an operator enters a task.

### 3. 🧮 Smart Task Data Entry & Dynamic Profit Matrix
- **Service Selector**: Choosing a service from the Master Menu auto-fills standard costs and customer charges.
- **Customer Auto-Suggest**: Searchable customer picker that displays real-time pending dues.
- **Live Calculations**:
  - **Incurred Amount (Cost)**: Gateway or operator expense
  - **Amount Charged**: Total fee billed to the customer
  - **Profit**: Auto-calculated dynamically (`Amount Charged - Amount Incurred`)
  - **Amount Paid**: Collected amount (Cash, UPI, Bank Transfer)
  - **Due Amount**: Auto-calculated credit balance (`Amount Charged - Amount Paid`)
- **One-Click Actions**: "+ Set Fully Paid" button to settle charges instantly.
- **Reference & Remarks**: Track transaction IDs, ack tokens, and consumer numbers.

### 4. 📅 Three Dedicated Time & Ledger Views
- **Calendar View**:
  - Interactive monthly calendar with month/year navigation.
  - Daily badges showing total task count, daily net profit (`+₹...`), and pending dues (`Due: ₹...`).
  - Color-coded service category dots.
  - Click any day to view its detailed transaction drawer.
- **Day View (Daily Cash Drawer & Day-Book)**:
  - Daily financial summary: Total Billed, Total Costs, Net Operator Profit, Cash Drawer physical count, UPI receipts, and new dues.
  - Category breakdown pills showing volume and profit per service.
  - Chronological transaction log.
  - **Print Daily Day-Book**: One-click printable closing report.
- **Customer Khata View & Ledger**:
  - Searchable directory of clients with total transactions, lifetime billed, and pending dues.
  - **Customer Ledger Modal**: Complete transaction history for any customer.
  - **Record Due Payment**: Clear partial or full credit balances with payment mode logging.
  - **WhatsApp Due Reminder**: 1-click WhatsApp message generator with pre-filled balance reminder.

### 5. 🖨️ Printable Customer Slip
- Clean, official receipt slip with center branding, customer details, transaction token, amounts, balance due, and operator signature box.

---

## 🛠️ Technology Stack
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Backend & Auth**: Firebase (Authentication, Cloud Firestore, Firebase Analytics)
- **Styling**: Vanilla CSS Design System with dark fintech palette, glassmorphism, and responsive layout
- **Icons**: Lucide React
- **Deployment**: GitHub Pages (`gh-pages` + GitHub Actions)

---

## 🚀 Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

3. **Build for Production**:
   ```bash
   npm run build
   ```

4. **Deploy to GitHub Pages**:
   ```bash
   npm run deploy
   ```

---

## 📄 License
MIT License. Created for Digital Seva Kendra & Cyber Cafe operators.
