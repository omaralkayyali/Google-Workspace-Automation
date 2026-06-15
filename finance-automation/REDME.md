# 🧾 Automated Financial Workspace Ecosystem | النظام المالي المؤتمت متكامل الخدمات

<div align="center">

![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google-apps-script&logoColor=white)
![Google Sheets](https://img.shields.io/badge/Google%20Sheets-34A853?style=for-the-badge&logo=google-sheets&logoColor=white)
![Google Forms](https://img.shields.io/badge/Google%20Forms-742092?style=for-the-badge&logo=google-forms&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Financial Report](https://img.shields.io/badge/Financial--Report-Dynamic%20Ledger-0052CC?style=for-the-badge)

</div>

---

## 📖 Overview / نظرة عامة

### [English]
An advanced, production-ready financial management and automation system powered by **Google Apps Script (GAS)**, **Google Sheets**, and **Google Forms**. This pipeline fully digitizes corporate and organizational workflows for handling diverse financial documents with zero manual intervention. It dynamically consolidates income and expenditure responses to compute real-time annual financial balances.

### [العربية]
نظام متقدم وجاهز للعمل الفوري لأتمتة وإدارة العمليات الماليّة والمصاريف، يعتمد بالكامل على **Google Apps Script (GAS)**، **Google Sheets**، و **Google Forms**. يقوم هذا النظام بربط وحوسبة تدفق البيانات الماليّة (سندات القبض، سندات الصرف، وطلبات الصرف) وتنظيمها تلقائياً، بالإضافة إلى دمج ومطابقة المبيعات والمصاريف لتوليد كشوفات الأرباح والتقارير العامة دون أي تدخل يدوي.

---

## 🚀 Core Features / الميزات الأساسية

* **🔢 Multi-Series Auto-Numbering | ترقيم تسلسلي متعدد الفئات:** Generates independent, sequential, and customizable serial configurations across different voucher types ($6800+$ series, $2639+$ series, and base $1+$ sequences).
* **📂 Dynamic Month-Based Routing | توجيه ديناميكي شهري:** Automatically parses submission timestamps and distributes entries into specific monthly spreadsheets (e.g., `دخل يناير`, `مصاريف فبراير`).
* **📊 Automated Ledger Consolidation | احتساب مالي مركزي تلقائي:** Automatically scans historical tabs for both income and expenses across all 12 months to aggregate real-time metrics into a master "التقرير العام" sheet.
* **🛡️ Production-Safe Architecture | بنية برمجية آمنة:** Designed to fully abstract sensitive Google Spreadsheet IDs using deployment environment placeholders, preventing credential leaks in public repositories.
* **🛠️ Fault-Tolerant Schema Enforcement | معالجة تلقائية للأخطاء:** Automatically detects missing tracking structures and appends column headers dynamically on the fly.

---

## 📁 Repository Structure / هيكلية المجلدات

```text
├── src/
│   ├── PaymentVoucher.gs          # 💸 Outgoing Expense Voucher Automation (6800+ Series) / كود سند الصرف
│   ├── ReceiptVoucher.gs          # 💰 Incoming Revenue Voucher Sorting (2639+ Series) / كود سند القبض
│   ├── DisbursementRequest.gs     # 📝 Internal Funds Approval & Routing (1+ Base Series) / كود طلب الصرف
│   └── GeneralFinancialReport.gs  # 📊 Income Routing & Annual Balance Consolidation / التقرير المالي العام والمطابقة
└── README.md                      # 📖 System Documentation & Deployment Guide / ملف الوصف الرئيسي
