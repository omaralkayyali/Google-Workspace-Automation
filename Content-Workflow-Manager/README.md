# 🎯 Content Workflow Manager (Google Sheets & Apps Script)
### نظام إدارة وجدولة سير عمل المحتوى مع لوحة كانبان وتصفية ذكية آمنة للروابط

An advanced content-engineering and project management solution built with **Google Apps Script** and **HTML/CSS/JS**. It provides dynamic, safe sorting for content production pipelines and integrates a fully responsive **Kanban Board** directly inside Google Sheets.

نظام متقدم لإدارة وجدولة سير إنتاج المحتوى تم تطويره باستخدام **Google Apps Script** و **HTML/CSS/JS**، ويوفر ميزة الفرز التلقائي الآمن للمصفوفات وحفظ التنسيقات والروابط مع لوحة **Kanban** تفاعلية بالكامل تعمل من داخل الشيت.

---

## 🌐 English Documentation

### 💡 Key Features
1. **Dynamic Format-Preserving Sorter:** Auto-repositions rows based on status changes. It targets only affected segments and utilizes `copyTo` to preserve Rich Text, hyperlinks, Drive paths, Notes, and Data Validation dropdowns.
2. **Static vs. Moveable Columns:** Allows separating moveable data columns (Title, Writer, Platform, Status) from static ones (Formulas calculating Delays/Remaining days, Row Indices).
3. **Interactive Kanban Board:** Drag-and-drop posts between workflow stages with instant updates to the spreadsheet and live stat tracking (Total Content, Published, Delayed).
4. **Stable Backup & Operations Log:** Built-in manual/automated backups (updating the same hidden sheet to avoid sheet cluttering) and detailed execution logs.

### ⚙️ Sheet Architecture
The workflow expects the following columns:
* **Static Columns:** `Column A` (ID), `Column E` (Static Category/Anchor), `Column L` (Formula: Delay), `Column M` (Formula: Remaining Days).
* **Moveable Columns:** `Columns B:D` (Metadata), `Columns F:K` (Platform, Type, Date, Status), `Column N` (Notes).
* **Status Column:** `Column K` (Column 11).

---

## 📥 التوثيق باللغة العربية

### 💡 الميزات الرئيسية
1. **الترتيب الذكي والآمن للروابط:** يقوم السكربت بإعادة ترتيب الصف المتأثر فقط عند تغيير الحالة تلقائياً (أسرع بكثير من فرز الجدول بالكامل) باستخدام دالة `copyTo` للحفاظ على الروابط التشعبية، روابط Drive، الملاحظات، وتنسيق الخلايا وقوائم الاختيار المنسدلة (Dropdown Chips).
2. **حماية الأعمدة الثابتة:** يفصل السكربت بين الأعمدة المتحركة مع المحتوى والأعمدة الثابتة (مثل معادلات حساب الأيام المتبقية والتأخير، أو الترقيم التلقائي).
3. **لوحة كانبان تفاعلية مدمجة:** واجهة مستخدم HTML متكاملة تتيح للمستخدم سحب وإفلات منشورات المحتوى بين الحالات المختلفة وتحديث الشيت تلقائياً مع لوحة إحصائيات فورية (إجمالي المحتوى، المنشور، المتأخر).
4. **نظام النسخ الاحتياطي والسجلات:** يوفر إمكانية عمل نسخة احتياطية يدوية وتلقائية للشيت في تبويب مخفي موحد لمنع تراكم الملفات، مع تسجيل كل العمليات في شيت خاص بالعمليات وتفاصيلها.

### ⚙️ هيكلية أعمدة الشيت المعتمدة
* **الأعمدة الثابتة (لا تتحرك):** العمود `A` (المعرف)، العمود `E` (القسم الثابت)، العمود `L` (معادلة التأخير)، العمود `M` (معادلة متبقي الأيام).
* **الأعمدة المتحركة (تتحرك مع الحالة):** الأعمدة من `B` إلى `D` (بيانات المحتوى)، الأعمدة من `F` إلى `K` (المنصة، النوع، تاريخ النشر، الحالة)، العمود `N` (الملاحظات).
* **عمود الحالة الرئيسي:** العمود `K` (العمود رقم 11).

---

## 🛠️ Installation & Setup | طريقة التركيب والتشغيل

1. Open your Google Sheet. (افتح شيت جوجل الخاص بك).
2. Click on **Extensions** -> **Apps Script**. (اضغط على **الامتدادات** -> **Apps Script**).
3. Create a new script file called `Code.gs` and paste the content of [Code.gs](file:///c:/Users/omara/Google-Workspace-Automation/Content-Workflow-Manager/Code.gs).
   (أنشئ ملفاً جديداً باسم `Code.gs` والصق فيه محتويات ملف `Code.gs`).
4. Create a new HTML file called `Kanban.html` and paste the content of [Kanban.html](file:///c:/Users/omara/Google-Workspace-Automation/Content-Workflow-Manager/Kanban.html).
   (أنشئ ملف HTML جديد باسم `Kanban` والصق فيه محتويات ملف `Kanban.html`).
5. Save the project and refresh your Google Sheet. A new menu **🧹 تنظيف الشيت** will appear at the top.
   (احفظ المشروع وأعد تحميل الشيت، ستظهر لك قائمة جديدة في الأعلى باسم **🧹 تنظيف الشيت** تحتوي على زر لفتح لوحة الكانبان وعمليات التنظيف).
