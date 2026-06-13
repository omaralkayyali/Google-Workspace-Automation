/**
 * Google Apps Script - Disbursement Request Automation (Series 1)
 * * Description:
 * Automatically generates a sequential serial number starting from 1 for 
 * disbursement requests and transfers structural financial data to a master external log.
 * * Author: Omar Al-Kayyali
 * Date: June 2026
 */

function onDisbursementFormSubmit(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = ss.getSheetByName("Form responses 1");
 
  if (!sourceSheet) {
    Logger.log("Error: 'Form responses 1' sheet not found in source spreadsheet.");
    return;
  }

  var lastRow = sourceSheet.getLastRow();
  var headers = sourceSheet.getRange(1, 1, 1, sourceSheet.getLastColumn()).getValues()[0];

  // The column header name where the serial number will be logged
  var serialColumnName = "رقم طلب الصرف";
  var serialColIndex = headers.indexOf(serialColumnName);

  // If missing, dynamically create the column
  if (serialColIndex === -1) {
    sourceSheet.insertColumnAfter(sourceSheet.getLastColumn());
    serialColIndex = sourceSheet.getLastColumn() - 1;
    sourceSheet.getRange(1, serialColIndex + 1).setValue(serialColumnName);
  }

  // Sequential index logic starting from base 1
  var serialNumber = lastRow - 1;
  sourceSheet.getRange(lastRow, serialColIndex + 1).setValue(serialNumber);
 
  // Call transfer function
  transferExpensesData(e);
}

function transferExpensesData(e) {
  var sourceSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = sourceSpreadsheet.getSheetByName("Form responses 1");
 
  if (!sourceSheet) {
    Logger.log("Error: 'Form responses 1' sheet not found during transfer sequence.");
    return;
  }

  var headers = sourceSheet.getRange(1, 1, 1, sourceSheet.getLastColumn()).getValues()[0];

  // ⚠️ SECURITY NOTICE: Replace placeholder with your shared master Spreadsheet ID.
  var targetSpreadsheetId = "YOUR_MASTER_FINANCIAL_SPREADSHEET_ID_HERE";
  
  if (targetSpreadsheetId === "YOUR_MASTER_FINANCIAL_SPREADSHEET_ID_HERE") {
    Logger.log("Error: Please configure targetSpreadsheetId for disbursements first.");
    return;
  }
  
  var targetSpreadsheet = SpreadsheetApp.openById(targetSpreadsheetId);

  // Standardized Arabic column configurations (including exact whitespaces from form structure)
  var totalAmountColumnName = " المجموع بالأرقام ";
  var dateColumnName = "التاريخ ";
  var serialNumberColumnName = "رقم طلب الصرف";
  var activityNameColumnName = "اسم النشاط ";
  var monthColumnName = "الشهر ";  

  // Locate column offsets
  var totalAmountColIndex = headers.indexOf(totalAmountColumnName);
  var dateColIndex = headers.indexOf(dateColumnName);
  var serialNumberColIndex = headers.indexOf(serialNumberColumnName);
  var activityNameColIndex = headers.indexOf(activityNameColumnName);
  var monthColIndex = headers.indexOf(monthColumnName);

  // Validate presence of essential structures
  if (totalAmountColIndex === -1 || dateColIndex === -1 || serialNumberColIndex === -1 || activityNameColIndex === -1 || monthColIndex === -1) {
    Logger.log("Error: Essential columns are missing from the configuration mapping.");
    return;
  }

  var lastRowOfSourceSheet = sourceSheet.getLastRow();
  var rowData = sourceSheet.getRange(lastRowOfSourceSheet, 1, 1, sourceSheet.getLastColumn()).getValues()[0];

  var totalAmountValue = rowData[totalAmountColIndex];
  var dateValue = rowData[dateColIndex];
  var serialNumberValue = rowData[serialNumberColIndex];
  var activityNameValue = rowData[activityNameColIndex];
  var monthNumber = parseInt(rowData[monthColIndex]);

  if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    Logger.log("Error: Invalid month index value submitted.");
    return;
  }

  var monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  var monthName = monthNames[monthNumber - 1];
 
  // Dynamic sheet name construction
  var newSheetName = "مصاريف " + monthName;

  var targetSheet = targetSpreadsheet.getSheetByName(newSheetName);
  if (!targetSheet) {
    targetSheet = targetSpreadsheet.insertSheet(newSheetName);
    var newHeaders = [dateColumnName, serialNumberColumnName, totalAmountColumnName, activityNameColumnName];
    targetSheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
  }

  var dataToTransfer = [dateValue, serialNumberValue, totalAmountValue, activityNameValue];
  targetSheet.appendRow(dataToTransfer);
}