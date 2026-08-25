/**
 * ============================================================
 * شيت "المحتوى" - النسخة النهائية السريعة والآمنة
 * ============================================================
 *
 * تلقائيًا عند تعديل الحالة في K:
 * - يعيد ترتيب الجزء المتأثر فقط (أسرع من فرز الشيت كاملًا)
 * - لا يعمل Backup
 * - لا يعمل Log
 * - لا يحذف صفوف
 *
 * يدويًا:
 * - ترتيب سريع كامل
 * - تنظيف وفرز شامل + Backup + حذف الفراغات + Log
 * - Backup يدوي
 *
 * الأعمدة التي تتحرك مع المحتوى:
 * B:D + F:K + N
 *
 * الأعمدة التي لا تتحرك:
 * A + E + L + M
 * وأي عمود غير موجود في MOVEABLE_RANGES
 *
 * مهم:
 * نستخدم copyTo بدل setValues أثناء نقل بيانات المستخدم.
 * الهدف هو الحفاظ على:
 * - روابط Drive
 * - Hyperlinks
 * - Rich Text
 * - Data Validation / Dropdowns
 * - التنسيق
 * - الملاحظات
 *
 * ============================================================
 */


// ============================================================
// الإعدادات العامة للشيت
// ============================================================

var SHEET_NAME = "المحتوى";

var STATUS_COLUMN = 11; // K

var BACKUP_SHEET_NAME = "نسخة احتياطية قبل الفرز";
var LOG_SHEET_NAME = "سجل عمليات الفرز";
var STAGING_SHEET_NAME = "منطقة فرز مؤقتة";


// ============================================================
// إعدادات أعمدة لوحة الكانبان (Kanban Board Columns)
// ============================================================

var KANBAN_CONFIG = {
  idColumn: 1,         // A (المعرف الفريد)
  titleColumn: 2,      // B (العنوان)
  platformColumn: 6,   // F (المنصة)
  typeColumn: 7,       // G (النوع)
  dateColumn: 8,       // H (التاريخ)
  delayColumn: 12,     // L (التأخير - عمود غير متحرك يحتوي على معادلة)
  remainingColumn: 13  // M (المتبقي - عمود غير متحرك يحتوي على معادلة)
};


// ============================================================
// ترتيب الحالات
// ============================================================

var STATUS_ORDER = [
  "فكرة",
  "قيد الكتابة",
  "قيد التصميم",
  "قيد المراجعة",
  "بانتظار النشر",
  "جاهز للنشر",
  "تم النشر",
  "مؤرشف"
];


// ============================================================
// الأعمدة التي تتحرك
// ============================================================

var MOVEABLE_RANGES = [

  {
    start: 2,
    num: 3
  }, // B:D

  {
    start: 6,
    num: 6
  }, // F:K

  {
    start: 14,
    num: 1
  } // N

];


// ============================================================
// التشغيل التلقائي عند تعديل الشيت
// ============================================================

function onEdit(e) {

  // حماية لو شغّلت onEdit يدويًا من Apps Script
  if (!e || !e.range) {
    return;
  }


  try {

    var range = e.range;

    var sheet = range.getSheet();


    // نشتغل فقط على شيت المحتوى
    if (
      sheet.getName() !== SHEET_NAME
    ) {
      return;
    }


    // تجاهل الهيدر
    if (
      range.getLastRow() < 2
    ) {
      return;
    }


    var firstColumn =
      range.getColumn();


    var lastColumn =
      firstColumn +
      range.getNumColumns() -
      1;


    // لا نشتغل إلا إذا التعديل شمل K
    if (
      STATUS_COLUMN < firstColumn ||
      STATUS_COLUMN > lastColumn
    ) {
      return;
    }


    var ss =
      e.source ||
      SpreadsheetApp.getActiveSpreadsheet();


    // ========================================================
    // حالة طبيعية:
    // تعديل حالة صف واحد فقط
    //
    // نحرك فقط الجزء المتأثر
    // ========================================================

    if (
      range.getNumRows() === 1 &&
      range.getRow() >= 2
    ) {

      fastRepositionEditedRow_(
        ss,
        sheet,
        range.getRow()
      );

      return;
    }


    // ========================================================
    // إذا تم لصق / تعديل عدة صفوف دفعة واحدة
    // نعمل فرز كامل سريع
    // بدون Backup
    // بدون حذف
    // بدون Log
    // ========================================================

    fullSort_(
      ss,
      sheet,
      {
        createBackup: false,
        deleteEmptyRows: false,
        writeLog: false
      }
    );


  } catch (err) {

    console.error(
      "onEdit error: " +
      err.stack
    );
  }
}


// ============================================================
// القائمة العلوية
// ============================================================

function onOpen() {

  SpreadsheetApp
    .getUi()

    .createMenu(
      "🧹 تنظيف الشيت"
    )

    .addItem(
      "🎯 فتح لوحة Kanban",
      "openKanbanBoard"
    )

    .addSeparator()

    .addItem(
      "⚡ ترتيب سريع الآن",
      "manualFastSort"
    )

    .addItem(
      "🧹 تنظيف وفرز شامل",
      "manualFullCleanup"
    )

    .addSeparator()

    .addItem(
      "💾 إنشاء نسخة احتياطية",
      "manualBackup"
    )

    .addItem(
      "📝 فتح سجل العمليات",
      "openSortLog"
    )

    .addToUi();
}


// ============================================================
// فتح لوحة الكانبان
// ============================================================

function openKanbanBoard() {
  var html = HtmlService.createHtmlOutputFromFile('Kanban')
      .setTitle('🎯 لوحة Kanban لإدارة سير المحتوى')
      .setWidth(1000)
      .setHeight(650);
  SpreadsheetApp.getUi().showModalDialog(html, 'لوحة Kanban لإدارة سير المحتوى');
}


// ============================================================
// دوال الاتصال بلوحة الكانبان (Kanban API)
// ============================================================

/**
 * جلب البيانات للوحة الكانبان
 */
function getKanbanData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('لم يتم العثور على شيت باسم "' + SHEET_NAME + '"');
  }
  
  var lastRow = sheet.getLastRow();
  var statuses = STATUS_ORDER;
  
  var items = [];
  if (lastRow >= 2) {
    var numRows = lastRow - 1;
    var data = sheet.getRange(2, 1, numRows, sheet.getLastColumn()).getValues();
    
    for (var i = 0; i < data.length; i++) {
      var rowData = data[i];
      var rowNum = i + 2;
      
      var id = rowData[KANBAN_CONFIG.idColumn - 1];
      var title = rowData[KANBAN_CONFIG.titleColumn - 1];
      var platform = rowData[KANBAN_CONFIG.platformColumn - 1];
      var type = rowData[KANBAN_CONFIG.typeColumn - 1];
      var dateValue = rowData[KANBAN_CONFIG.dateColumn - 1];
      var delay = rowData[KANBAN_CONFIG.delayColumn - 1];
      var remaining = rowData[KANBAN_CONFIG.remainingColumn - 1];
      var status = rowData[STATUS_COLUMN - 1];
      
      // تنسيق التاريخ إذا كان كائناً
      var publishDate = "";
      if (dateValue instanceof Date) {
        publishDate = Utilities.formatDate(dateValue, Session.getScriptTimeZone(), "yyyy-MM-dd");
      } else if (dateValue) {
        publishDate = String(dateValue);
      }
      
      // تجنب إدراج الصفوف الفارغة تماماً
      if (String(title).trim() !== "" || String(status).trim() !== "") {
        items.push({
          row: rowNum,
          id: id !== undefined && id !== null ? String(id) : "",
          title: title ? String(title) : "بدون عنوان",
          platform: platform ? String(platform) : "",
          type: type ? String(type) : "",
          publishDate: publishDate,
          delay: delay !== undefined && delay !== null ? String(delay) : "",
          remaining: remaining !== undefined && remaining !== null ? String(remaining) : "",
          status: status ? String(status).trim() : "فكرة"
        });
      }
    }
  }
  
  return {
    statuses: statuses,
    items: items
  };
}

/**
 * تحديث حالة صف معين عند سحب الكارت
 */
function updateContentStatus(row, newStatus) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('لم يتم العثور على شيت باسم "' + SHEET_NAME + '"');
  }
  
  // تحديث الحالة في العمود المحدد
  sheet.getRange(row, STATUS_COLUMN).setValue(newStatus);
  
  // إعادة ترتيب الصف المعدل تلقائياً
  fastRepositionEditedRow_(ss, sheet, row);
  
  return true;
}


// ============================================================
// زر: ترتيب سريع كامل
// ============================================================

function manualFastSort() {

  var ss =
    SpreadsheetApp.getActiveSpreadsheet();


  var sheet =
    ss.getSheetByName(
      SHEET_NAME
    );


  if (!sheet) {

    SpreadsheetApp
      .getUi()
      .alert(
        'لم يتم العثور على شيت باسم "' +
        SHEET_NAME +
        '"'
      );

    return;
  }


  try {

    var result =
      fullSort_(
        ss,
        sheet,
        {
          createBackup: false,
          deleteEmptyRows: false,
          writeLog: false
        }
      );


    if (!result) {

      SpreadsheetApp
        .getUi()
        .alert(
          "تعذر تنفيذ الفرز لأن هناك عملية أخرى تعمل الآن."
        );

      return;
    }


    SpreadsheetApp
      .getUi()
      .alert(

        result.changed

          ? "تم الترتيب السريع بنجاح ⚡✅"

          : "الشيت مرتب أصلًا ✅"

      );


  } catch (err) {

    SpreadsheetApp
      .getUi()
      .alert(
        "حدث خطأ ❌\n\n" +
        err.message
      );
  }
}


// ============================================================
// زر: تنظيف شامل
//
// Backup
// +
// ترتيب
// +
// حذف فراغات
// +
// Log
// ============================================================

function manualFullCleanup() {

  var ss =
    SpreadsheetApp.getActiveSpreadsheet();


  var sheet =
    ss.getSheetByName(
      SHEET_NAME
    );


  if (!sheet) {

    SpreadsheetApp
      .getUi()
      .alert(
        'لم يتم العثور على شيت باسم "' +
        SHEET_NAME +
        '"'
      );

    return;
  }


  try {

    var result =
      fullSort_(
        ss,
        sheet,
        {
          createBackup: true,
          deleteEmptyRows: true,
          writeLog: true
        }
      );


    if (!result) {

      SpreadsheetApp
        .getUi()
        .alert(
          "تعذر تنفيذ العملية لأن هناك عملية أخرى تعمل الآن."
        );

      return;
    }


    SpreadsheetApp
      .getUi()
      .alert(

        "تم التنظيف الشامل بنجاح ✅\n\n" +

        "الصفوف غير الفارغة: " +
        result.validRows +

        "\n" +

        "الصفوف الفارغة المحذوفة: " +
        result.emptyRows +

        "\n\n" +

        "تم إنشاء نسخة احتياطية قبل العملية."

      );


  } catch (err) {


    try {

      writeLog_(
        ss,
        "تنظيف شامل",
        "-",
        "خطأ: " +
        err.message
      );

    } catch (ignore) {}


    SpreadsheetApp
      .getUi()
      .alert(
        "حدث خطأ ❌\n\n" +
        err.message
      );
  }
}


// ============================================================
// أسرع وضع
//
// عند تغيير حالة صف واحد:
//
// لا نفرز الشيت كله.
// نعرف أين يجب أن يذهب الصف.
// ثم نفرز فقط المنطقة بين مكانه القديم والجديد.
// ============================================================

function fastRepositionEditedRow_(
  ss,
  sheet,
  editedRow
) {

  var lock =
    LockService.getDocumentLock();


  // ما نخلي الشيت يعلق إذا عملية ثانية شغالة
  if (
    !lock.tryLock(1500)
  ) {

    return null;
  }


  try {

    var lastRow =
      sheet.getLastRow();


    if (
      lastRow < 2 ||
      editedRow < 2 ||
      editedRow > lastRow
    ) {

      return {
        changed: false
      };
    }


    var numRows =
      lastRow - 1;


    // ========================================================
    // قراءة الحالات فقط
    // ========================================================

    var statuses =
      sheet
        .getRange(
          2,
          STATUS_COLUMN,
          numRows,
          1
        )
        .getDisplayValues();


    var editedIndex =
      editedRow - 2;


    var currentOrder =
      getStatusOrder_(
        statuses[
          editedIndex
        ][0]
      );


    var previousOrder =
      editedIndex > 0

        ? getStatusOrder_(
            statuses[
              editedIndex - 1
            ][0]
          )

        : -1;


    var nextOrder =
      editedIndex < numRows - 1

        ? getStatusOrder_(
            statuses[
              editedIndex + 1
            ][0]
          )

        : 999999;


    // ========================================================
    // إذا الصف بالفعل موجود في مكان صحيح
    // لا نعمل أي شيء
    // ========================================================

    if (
      previousOrder <= currentOrder &&
      currentOrder <= nextOrder
    ) {

      return {
        changed: false
      };
    }


    // ========================================================
    // نحسب المكان الجديد
    // ========================================================

    var otherOrders = [];


    for (
      var i = 0;
      i < numRows;
      i++
    ) {

      if (
        i === editedIndex
      ) {
        continue;
      }


      otherOrders.push(

        getStatusOrder_(
          statuses[i][0]
        )

      );
    }


    var targetIndex = 0;


    // نحطه بعد آخر صف من نفس الحالة
    // وقبل الحالة التالية
    while (

      targetIndex <
      otherOrders.length

      &&

      otherOrders[
        targetIndex
      ] <= currentOrder

    ) {

      targetIndex++;
    }


    // ما في حركة مطلوبة
    if (
      targetIndex ===
      editedIndex
    ) {

      return {
        changed: false
      };
    }


    // ========================================================
    // نحدد فقط الجزء الذي تأثر
    // ========================================================

    var segmentStartIndex =
      Math.min(
        editedIndex,
        targetIndex
      );


    var segmentEndIndex =
      Math.max(
        editedIndex,
        targetIndex
      );


    var segmentStartRow =
      segmentStartIndex + 2;


    var segmentRows =
      segmentEndIndex -
      segmentStartIndex +
      1;


    // ========================================================
    // نفرز هذا الجزء فقط
    // ========================================================

    sortRangeThroughStaging_(
      ss,
      sheet,
      segmentStartRow,
      segmentRows
    );


    return {

      changed: true,

      startRow:
        segmentStartRow,

      rows:
        segmentRows

    };


  } finally {

    lock.releaseLock();
  }
}


// ============================================================
// فرز كامل
// ============================================================

function fullSort_(
  ss,
  sheet,
  options
) {

  options =
    options || {};


  var lock =
    LockService.getDocumentLock();


  if (
    !lock.tryLock(5000)
  ) {

    return null;
  }


  try {

    var lastRow =
      sheet.getLastRow();


    if (
      lastRow < 2
    ) {

      return {

        changed: false,

        validRows: 0,

        emptyRows: 0

      };
    }


    var numRows =
      lastRow - 1;


    // ========================================================
    // تحليل الصفوف
    // ========================================================

    var keysInfo =
      buildSortKeys_(
        sheet,
        2,
        numRows
      );


    var alreadySorted =
      isAlreadySorted_(
        keysInfo.keys
      );


    var needsCleanup =

      options.deleteEmptyRows

      &&

      keysInfo.emptyCount > 0;


    // ========================================================
    // إذا لا يوجد شيء يحتاج تغيير
    // ========================================================

    if (
      alreadySorted &&
      !needsCleanup
    ) {


      if (
        options.writeLog
      ) {

        writeLog_(
          ss,
          "تنظيف شامل",
          0,
          "لا يوجد تعديل مطلوب"
        );
      }


      return {

        changed: false,

        validRows:
          numRows -
          keysInfo.emptyCount,

        emptyRows: 0

      };
    }


    // ========================================================
    // Backup قبل أي تعديل
    // فقط بالتنظيف اليدوي الشامل
    // ========================================================

    if (
      options.createBackup
    ) {

      backupFullSheet_(
        ss,
        sheet
      );
    }


    // ========================================================
    // الفرز
    // ========================================================

    if (
      numRows > 1
    ) {

      sortRangeThroughStaging_(
        ss,
        sheet,
        2,
        numRows,
        keysInfo.keys
      );
    }


    var deletedRows = 0;


    // ========================================================
    // حذف الفراغات
    // ========================================================

    if (
      options.deleteEmptyRows &&
      keysInfo.emptyCount > 0
    ) {

      deletedRows =
        deleteSortedEmptyRows_(
          sheet,
          numRows,
          keysInfo.emptyCount
        );
    }


    // ========================================================
    // Log
    // ========================================================

    if (
      options.writeLog
    ) {

      writeLog_(

        ss,

        "تنظيف شامل",

        deletedRows,

        "تم الفرز والتنظيف بنجاح"

      );
    }


    return {

      changed: true,

      validRows:
        numRows -
        keysInfo.emptyCount,

      emptyRows:
        deletedRows

    };


  } finally {

    lock.releaseLock();
  }
}


// ============================================================
// قلب السكربت
//
// 1) ننسخ البيانات إلى staging بواسطة copyTo
// 2) نفرز هناك
// 3) نرجعها بواسطة copyTo
//
// لا نستخدم setValues لبيانات المستخدم.
//
// هذا مهم للحفاظ على:
//
// - روابط Drive
// - الروابط المخفية داخل النص
// - Dropdown
// - Data Validation
// - التنسيق
// - الملاحظات
//
// A / E / L / M لا تدخل بالنسخ أصلًا.
// ============================================================

function sortRangeThroughStaging_(
  ss,
  sheet,
  sourceStartRow,
  numRows,
  prebuiltKeys
) {

  if (
    numRows <= 1
  ) {

    return;
  }


  var lastDataColumn =
    Math.max(
      sheet.getLastColumn(),
      14
    );


  // عمودان مساعدان بعد آخر عمود مستخدم
  var helperOrderColumn =
    lastDataColumn + 1;


  var helperOriginalColumn =
    lastDataColumn + 2;


  var requiredColumns =
    helperOriginalColumn;


  // ========================================================
  // staging
  // ========================================================

  var staging =
    getOrCreateSheet_(
      ss,
      STAGING_SHEET_NAME,
      true
    );


  ensureSheetSize_(
    staging,
    numRows,
    requiredColumns
  );


  // ========================================================
  // ننظف فقط الجزء المستخدم
  // بدل clear كامل للشيت
  // ========================================================

  staging
    .getRange(
      1,
      1,
      numRows,
      requiredColumns
    )
    .clear();


  // ========================================================
  // نسخ الأعمدة المتحركة
  //
  // copyTo كامل:
  // قيم + روابط + Validation + Formatting...
  // ========================================================

  for (
    var i = 0;
    i <
    MOVEABLE_RANGES.length;
    i++
  ) {

    var cfg =
      MOVEABLE_RANGES[i];


    sheet
      .getRange(
        sourceStartRow,
        cfg.start,
        numRows,
        cfg.num
      )
      .copyTo(

        staging.getRange(
          1,
          cfg.start,
          numRows,
          cfg.num
        )

      );
  }


  // ========================================================
  // مفاتيح الفرز
  // ========================================================

  var keys =
    prebuiltKeys

      ||

    buildSortKeys_(
      sheet,
      sourceStartRow,
      numRows
    ).keys;


  staging
    .getRange(
      1,
      helperOrderColumn,
      numRows,
      2
    )
    .setValues(
      keys
    );


  // ========================================================
  // الفرز
  //
  // المفتاح الأول = ترتيب الحالة
  // المفتاح الثاني = مكان الصف الأصلي
  //
  // وبالتالي Stable Sort
  // ========================================================

  staging
    .getRange(
      1,
      1,
      numRows,
      requiredColumns
    )
    .sort([

      {
        column:
          helperOrderColumn,

        ascending:
          true
      },

      {
        column:
          helperOriginalColumn,

        ascending:
          true
      }

    ]);


  // ========================================================
  // إعادة النتيجة
  // ========================================================

  for (
    var j = 0;
    j <
    MOVEABLE_RANGES.length;
    j++
  ) {

    var outCfg =
      MOVEABLE_RANGES[j];


    staging
      .getRange(
        1,
        outCfg.start,
        numRows,
        outCfg.num
      )
      .copyTo(

        sheet.getRange(
          sourceStartRow,
          outCfg.start,
          numRows,
          outCfg.num
        )

      );
  }


  // ========================================================
  // تنظيف staging
  // ========================================================

  staging
    .getRange(
      1,
      1,
      numRows,
      requiredColumns
    )
    .clear();
}


// ============================================================
// تحديد:
// - حالة كل صف
// - هل الصف فارغ؟
// - مفتاح الفرز
// ============================================================

function buildSortKeys_(
  sheet,
  startRow,
  numRows
) {

  var blocks = [];


  // قراءة B:D + F:K + N
  for (
    var i = 0;
    i <
    MOVEABLE_RANGES.length;
    i++
  ) {

    var cfg =
      MOVEABLE_RANGES[i];


    blocks.push(

      sheet
        .getRange(
          startRow,
          cfg.start,
          numRows,
          cfg.num
        )
        .getDisplayValues()

    );
  }


  var keys = [];

  var emptyCount = 0;


  // ========================================================
  // صف صف داخل الذاكرة فقط
  // لا يوجد getRange داخل اللوب
  // ========================================================

  for (
    var r = 0;
    r < numRows;
    r++
  ) {

    var isEmpty = true;


    for (
      var b = 0;
      b < blocks.length;
      b++
    ) {


      for (
        var c = 0;
        c <
        blocks[b][r].length;
        c++
      ) {


        if (
          normalizeText_(
            blocks[b][r][c]
          ) !== ""
        ) {

          isEmpty = false;

          break;
        }
      }


      if (!isEmpty) {

        break;
      }
    }


    var order;


    if (
      isEmpty
    ) {

      // الصفوف الفارغة دائمًا آخر شيء
      order = 999999;

      emptyCount++;

    } else {

      // ======================================================
      // K داخل البلوك F:K
      //
      // F = index 0
      // G = 1
      // H = 2
      // I = 3
      // J = 4
      // K = 5
      // ======================================================

      var status =
        blocks[1][r][5];


      order =
        getStatusOrder_(
          status
        );
    }


    keys.push([

      order,

      r // ترتيب الصف الأصلي

    ]);
  }


  return {

    keys:
      keys,

    emptyCount:
      emptyCount

  };
}


// ============================================================
// هل الشيت مرتب أصلًا؟
// ============================================================

function isAlreadySorted_(
  keys
) {

  for (
    var i = 1;
    i < keys.length;
    i++
  ) {

    if (
      keys[i - 1][0] >
      keys[i][0]
    ) {

      return false;
    }
  }


  return true;
}


// ============================================================
// حذف الصفوف الفارغة
//
// يتم استدعاؤها بعد الفرز فقط
// لذلك نعرف أن الفراغات موجودة بالأسفل.
// ============================================================

function deleteSortedEmptyRows_(
  sheet,
  numRows,
  emptyCount
) {

  if (
    emptyCount <= 0
  ) {

    return 0;
  }


  var validRows =
    numRows -
    emptyCount;


  var firstRowToDelete =
    validRows + 2;


  // ========================================================
  // لا يمكن حذف كل صفوف الشيت
  // نخلي الهيدر موجود دائمًا
  // ========================================================


  var maxDeletable =
    sheet.getMaxRows() - 1;


  var deleteCount =
    Math.min(
      emptyCount,
      maxDeletable
    );


  if (
    deleteCount <= 0
  ) {

    return 0;
  }


  sheet.deleteRows(
    firstRowToDelete,
    deleteCount
  );


  return deleteCount;
}


// ============================================================
// ترتيب الحالة
// ============================================================

function getStatusOrder_(
  value
) {

  var status =
    normalizeStatus_(
      value
    );


  for (
    var i = 0;
    i <
    STATUS_ORDER.length;
    i++
  ) {

    if (
      normalizeStatus_(
        STATUS_ORDER[i]
      ) === status
    ) {

      return i;
    }
  }


  // أي حالة غير معرفة
  // تذهب بعد الحالات الرسمية
  return STATUS_ORDER.length;
}


// ============================================================
// تنظيف اسم الحالة
// ============================================================

function normalizeStatus_(
  value
) {

  return normalizeText_(
    value
  )
    .replace(
      /ـ/g,
      ""
    );
}


// ============================================================
// تنظيف النص
// ============================================================

function normalizeText_(
  value
) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";
  }


  return String(value)

    .replace(
      /\u00A0/g,
      " "
    )

    .replace(
      /\s+/g,
      " "
    )

    .trim();
}


// ============================================================
// النسخة الاحتياطية الكاملة
//
// تتحدث نفس النسخة كل مرة
// ولا تنشئ عشرات الشيتات.
// ============================================================

function backupFullSheet_(
  ss,
  sheet
) {

  var backup =
    getOrCreateSheet_(
      ss,
      BACKUP_SHEET_NAME,
      true
    );


  var source =
    sheet.getDataRange();


  ensureSheetSize_(
    backup,
    source.getNumRows(),
    source.getNumColumns()
  );


  backup.clear();


  // ========================================================
  // copyTo كامل
  //
  // مهم جدًا للحفاظ على الروابط والتنسيقات
  // داخل النسخة الاحتياطية
  // ========================================================

  source.copyTo(

    backup.getRange(
      1,
      1,
      source.getNumRows(),
      source.getNumColumns()
    )

  );
}


// ============================================================
// Backup يدوي
// ============================================================

function manualBackup() {

  var ss =
    SpreadsheetApp.getActiveSpreadsheet();


  var sheet =
    ss.getSheetByName(
      SHEET_NAME
    );


  if (!sheet) {

    SpreadsheetApp
      .getUi()
      .alert(
        'لم يتم العثور على شيت باسم "' +
        SHEET_NAME +
        '"'
      );

    return;
  }


  try {

    var lock =
      LockService.getDocumentLock();


    if (
      !lock.tryLock(5000)
    ) {

      SpreadsheetApp
        .getUi()
        .alert(
          "هناك عملية أخرى تعمل الآن، جرّب مرة ثانية."
        );

      return;
    }


    try {

      backupFullSheet_(
        ss,
        sheet
      );

    } finally {

      lock.releaseLock();
    }


    SpreadsheetApp
      .getUi()
      .alert(
        "تم إنشاء النسخة الاحتياطية بنجاح ✅"
      );


  } catch (err) {

    SpreadsheetApp
      .getUi()
      .alert(
        "حدث خطأ ❌\n\n" +
        err.message
      );
  }
}


// ============================================================
// سجل العمليات
// ============================================================

function writeLog_(
  ss,
  operation,
  deletedRows,
  result
) {

  var logSheet =
    getOrCreateSheet_(
      ss,
      LOG_SHEET_NAME,
      false
    );


  // ========================================================
  // أول مرة
  // ========================================================

  if (
    logSheet.getLastRow() === 0
  ) {

    logSheet.appendRow([

      "التاريخ والوقت",

      "العملية",

      "الصفوف المحذوفة",

      "النتيجة"

    ]);


    logSheet
      .getRange(
        1,
        1,
        1,
        4
      )
      .setFontWeight(
        "bold"
      );
  }


  logSheet.appendRow([

    new Date(),

    operation,

    deletedRows,

    result

  ]);
}


// ============================================================
// فتح سجل العمليات
// ============================================================

function openSortLog() {

  var ss =
    SpreadsheetApp.getActiveSpreadsheet();


  var logSheet =
    getOrCreateSheet_(
      ss,
      LOG_SHEET_NAME,
      false
    );


  try {

    logSheet.showSheet();

  } catch (ignore) {}


  ss.setActiveSheet(
    logSheet
  );
}


// ============================================================
// إنشاء أو استدعاء شيت
// ============================================================

function getOrCreateSheet_(
  ss,
  name,
  hidden
) {

  var sheet =
    ss.getSheetByName(
      name
    );


  if (!sheet) {

    sheet =
      ss.insertSheet(
        name
      );
  }


  if (
    hidden
  ) {


    try {


      if (
        !sheet.isSheetHidden()
      ) {

        sheet.hideSheet();
      }


    } catch (ignore) {}
  }


  return sheet;
}


// ============================================================
// ضمان حجم الشيت المؤقت / Backup
// ============================================================

function ensureSheetSize_(
  sheet,
  requiredRows,
  requiredColumns
) {

  if (
    sheet.getMaxRows() <
    requiredRows
  ) {


    sheet.insertRowsAfter(

      sheet.getMaxRows(),

      requiredRows -
      sheet.getMaxRows()

    );
  }


  if (
    sheet.getMaxColumns() <
    requiredColumns
  ) {


    sheet.insertColumnsAfter(

      sheet.getMaxColumns(),

      requiredColumns -
      sheet.getMaxColumns()

    );
  }
}
