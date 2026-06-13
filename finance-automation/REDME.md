# 🧾 Automated Financial Workspace Ecosystem

<div align="center">

![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google-apps-script&logoColor=white)
![Google Sheets](https://img.shields.io/badge/Google%20Sheets-34A853?style=for-the-badge&logo=google-sheets&logoColor=white)
![Google Forms](https://img.shields.io/badge/Google%20Forms-742092?style=for-the-badge&logo=google-forms&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

</div>

---

An advanced, production-ready financial management and automation system powered by **Google Apps Script (GAS)**, **Google Sheets**, and **Google Forms**. This pipeline fully digitizes corporate and organizational workflows for handling diverse financial documents with zero manual intervention.

---

## 🚀 Core Features

* **🔢 Multi-Series Auto-Numbering:** Generates independent, sequential, and customizable serial configurations across different voucher types ($6800+$ series, $2639+$ series, and base $1+$ sequences).
* **📂 Dynamic Month-Based Routing:** Automatically parses submission timestamps and distributes entries into specific monthly spreadsheets (e.g., `دخل يناير`, `مصاريف فبراير`).
* **🛡️ Production-Safe Architecture:** Designed to fully abstract sensitive Google Spreadsheet IDs using deployment environment placeholders, preventing credential leaks in public repositories.
* **🛠️ Fault-Tolerant Schema Enforcement:** Automatically detects missing tracking structures and appends column headers dynamically on the fly.

---

## 📁 Repository Structure

```text
├── src/
│   ├── PaymentVoucher.gs         # 💸 Outgoing Expense Voucher Automation (6800+ Series)
│   ├── ReceiptVoucher.gs         # 💰 Incoming Revenue Voucher Sorting (2639+ Series)
│   └── DisbursementRequest.gs    # 📝 Internal Funds Approval & Routing (1+ Base Series)
└── README.md                     # 📖 System Documentation & Deployment Guide