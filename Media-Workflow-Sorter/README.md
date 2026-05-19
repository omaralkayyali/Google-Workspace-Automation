# 🎬 Media Workflow Smart Sorter (Google Apps Script)
### سكريبت الترتيب الذكي وتنظيف البيانات لسير العمل الإعلامي

An automated data-engineering solution developed in Google Apps Script (JavaScript) designed to clean, optimize, and dynamically sort high-volume media and content production trackers without damaging active cell references, links, or dropdown chips.

حل هندسي مؤتمت تم تطويره باستخدام جافا سكريبت (Google Apps Script) لتنظيف وتحسين وفرز شيتات تتبع الإنتاج الإعلامي وصناعة المحتوى تلقائياً، مع الحماية الكاملة لتنسيقات الخلايا، الروابط، وشرائح خيارات الحالة المنسدلة.

---

## 🌐 English Documentation

### ⚠️ The Problem
In fast-paced media production pipelines, content tracking sheets suffer from constant manual entry errors, ghost rows left behind by bulk copy-pastes, and out-of-order statuses. Standard Google Sheets sorting logic strips away conditional cell formatting, live links, and smart dropdown chips, ruining data integrity.

### 💡 The Solution & Architecture
This script triggers instantly via the `onEdit(e)` event to handle data pipeline optimization through two core phases:
1. **Automated Data Purging:** Scans the spreadsheet upwards from the absolute bottom index to safely isolate and destroy empty entries where core anchors (such as the Idea Title in Column A) are blank.
2. **Format-Preserving Weighted Sorting:** Instead of traditional structural cell swapping, the script generates a temporary helper column in memory, maps each status to an operational lifecycle weight, executes a clean index sort, and then self-destructs the helper column.

### ⚙️ Operational Priority Lifecycle
Rows are ranked dynamically from highest to lowest operational speed based on this weighted timeline:
$$\text{Done (منتهي)} \rightarrow \text{Scripting} \rightarrow \text{Designing} \rightarrow \text{Editing} \rightarrow \text{Filming} \rightarrow \text{Published}$$

---

## 📥 التوثيق باللغة العربية

### ⚠️ المشكلة
في بيئات صناعة المحتوى والإعلام السريعة، تواجه شيتات المتابعة فوضى مستمرة نتيجة الأخطاء البشرية، وجود أسطر فارغة ناتجة عن عمليات النسخ العشوائي، وعدم ترتيب أولويات العمل. بالإضافة إلى أن ميزة الترتيب الافتراضية في قوقل شيت تقوم بتدمير الروابط الذكية والشرائح المنسدلة (Chips) وتشويه التنسيق الشرطي.

### 💡 الحل وآلية العمل
يعمل الكود بشكل صامت وفوري عند حدوث أي تعديل `onEdit(e)` ليقوم بهندسة البيانات عبر مرحلتين:
1. **الحذف الآلي والتنظيف:** يمسح الشيت عكسياً من الأسفل للأعلى لتحديد وحذف الأسطر العشوائية التي لا تحتوي على عنوان فكرة أساسي في العمود (A).
2. **الترتيب الذكي الآمن للروابط:** يقوم بإنشاء عمود مساعد مخفي في الذاكرة لحساب "الوزن الرقمي" لكل حالة إنتاجية، ثم يفرز الشيت كاملاً بناءً عليه، ويقوم بحذف العمود المساعد فوراً لضمان عدم تأثر الروابط والـ Chips التفاعلية.

### ⚙️ دورة حياة أولويات سير العمل (الترتيب الرقمي)
يتم ترتيب المهام ديناميكياً بناءً على مصفوفة الأولويات التالية:
$$\text{منتهي} \leftarrow \text{يتم كتابة المحتوى} \leftarrow \text{يتم التصميم} \leftarrow \text{يتم المونتاج} \leftarrow \text{يتم التصوير} \leftarrow \text{لم تبدأ} \leftarrow \text{مؤجل} \leftarrow \text{ملغي} \leftarrow \text{تم النشر}$$

---

## 🛠️ Code Specifics & Tech Stack
* **Language:** JavaScript / Google Apps Script (GAS)
* **Trigger Scope:** Event-driven automation via cell interception (`onEdit`).
* **Target Columns:** Monitoring Column 8 (`Column H` - Status).
* **Safe Traversal:** Employs defensive loops (`dataA.length - 1`) to prevent boundary failures during row deletion.