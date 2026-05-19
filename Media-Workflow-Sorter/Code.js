/**
 * Media Workflow Smart Sorter & Data Purger
 * Developed by: Omar Muhammad ALKayyali
 * Description: Optimizes and dynamically sorts media production tracking sheets 
 * based on workflow priorities while protecting data chips and cell links.
 */

function onEdit(e) {
    // الحصول على الشيت النشط والخلية التي تم تعديلها
    const sheet = e.source.getActiveSheet();
    const range = e.range;

    // 1. فحص الحارس (Guard Clause): التنفيذ فقط إذا كان التعديل في العمود H (الحالة) وتحت الهيدر
    if (range.getColumn() == 8 && range.getRow() > 1) {

        // ==========================================
        // أولاً: تنظيف البيانات وحذف الصفوف الفارغة
        // ==========================================
        const lastRow = sheet.getLastRow();
        // جلب بيانات العمود A (عمود الفكرة) للتحقق من وجود بيانات حقيقية
        const dataA = sheet.getRange("A1:A" + lastRow).getValues();

        // التكرار العكسي من الأسفل للأعلى لتفادي اختلال ترتيب المؤشرات أثناء الحذف
        for (let i = dataA.length - 1; i >= 1; i--) {
            if (dataA[i][0].toString().trim() === "") {
                sheet.deleteRow(i + 1); // حذف الصف إذا كانت الفكرة فارغة تماماً
            }
        }

        // ==========================================
        // ثانياً: الترتيب الذكي المبني على الأوزان
        // ==========================================
        const newLastRow = sheet.getLastRow();

        // تأمين حالة عدم وجود بيانات بعد التصفية لمنع توقف السكريبت
        if (newLastRow <= 1) return;

        // تحديد عمود مساعد مؤقت بعد آخر عمود يحتوي على بيانات في الشيت
        const helperColumn = sheet.getLastColumn() + 1;
        // جلب حالات سير العمل الحالية من العمود الثامن (H)
        const statuses = sheet.getRange(2, 8, newLastRow - 1).getValues();

        // خريطة الأولويات والأوزان الرقمية المعتمدة لسير العمل الإعلامي
        const priority = {
            "منتهي": 1,
            "يتم كتابة المحتوى": 2,
            "يتم التصميم": 3,
            "يتم المونتاج": 4,
            "يتم التصوير": 5,
            "لم تبدأ": 6,
            "مؤجل": 7,
            "ملغي": 8,
            "تم النشر": 9
        };

        // تحويل الحالات النصية إلى أوزان رقمية (الحالات غير المعرفة تأخذ وزن 99 تلقائياً)
        const weights = statuses.map(row => [priority[row[0]] || 99]);

        // تنفيذ الترتيب الفعلي في الذاكرة دون المساس بالفورمات أو الروابط الأصلية
        sheet.getRange(2, helperColumn, weights.length).setValues(weights); // حقن الأوزان في العمود المساعد
        sheet.getRange(2, 1, newLastRow - 1, helperColumn).sort(helperColumn); // فرز الشيت بناءً على عمود الأوزان
        sheet.deleteColumn(helperColumn); // تدمير العمود المساعد للحفاظ على نظافة الشيت
    }
}