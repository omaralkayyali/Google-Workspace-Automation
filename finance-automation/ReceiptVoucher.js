/**
 * Google Apps Script - Receipt Voucher Automation (Series 2639)
 * * Description:
 * This script runs automatically when a Google Form is submitted. It assigns a unique
 * sequential serial number to each receipt and splits/organizes the data into a secondary
 * spreadsheet, separating entries into specific sheets based on the month of submission.
 * * Author: Omar Al-Kayyali
 * Date: June 2026
 */

function onReceiptVoucherSubmit(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet(); 
  var sourceSheet = ss.getSheetByName("Form responses 1"); 
  if (!sourceSheet) return;

  var lastRow = sourceSheet.getLastRow();
  var headers = sourceSheet
    .getRange(1, 1, 1, sourceSheet.getLastColumn())
    .getValues()[0]
    .map(h => h.toString().trim());

  // Check or create the Serial Number column ("الرقم التسلسلي")
  var serialColIndex = headers.indexOf("الرقم التسلسلي");
  if (serialColIndex === -1) {
    sourceSheet.insertColumnAfter(sourceSheet.getLastColumn());
    serialColIndex = sourceSheet.getLastColumn() - 1;
    sourceSheet.getRange(1, serialColIndex + 1).setValue("الرقم التسلسلي");
    headers.push("الرقم التسلسلي");
  }

  // Calculate and set the serial number starting from base 2639
  var serialNumber = (lastRow - 1) + 2639 - 1; 
  sourceSheet.getRange(lastRow, serialColIndex + 1).setValue(serialNumber); 

  // Proceed to distribute data based on the month
  organizeReceiptResponsesByMonth(e);
}

function organizeReceiptResponsesByMonth(e) {
  var sourceSpreadsheet = SpreadsheetApp.getActiveSpreadsheet(); 
  var sourceSheet = sourceSpreadsheet.getSheetByName("Form responses 1"); 
  if (!sourceSheet) return;

  var headers = sourceSheet
    .getRange(1, 1, 1, sourceSheet.getLastColumn())
    .getValues()[0]
    .map(h => h.toString().trim());

  // ⚠️ SECURITY NOTICE: Replace placeholder with your external Spreadsheet ID.
  var targetSpreadsheetId = "YOUR_RECEIPT_TARGET_SPREADSHEET_ID_HERE";
  
  if (targetSpreadsheetId === "YOUR_RECEIPT_TARGET_SPREADSHEET_ID_HERE") {
    Logger.log("Error: Please configure your targetSpreadsheetId first.");
    return;
  }

  var targetSpreadsheet = SpreadsheetApp.openById(targetSpreadsheetId); 

  // Column Index mapping
  var dateColIndex = headers.indexOf("التاريخ");
  var serialNumberColIndex = headers.indexOf("الرقم التسلسلي"); 
  var valueColIndex = headers.indexOf("القيمة");
  var monthColIndex = headers.indexOf("الشهر");

  // Validate required columns exist
  if (dateColIndex === -1 || serialNumberColIndex === -1 || valueColIndex === -1 || monthColIndex === -1) {
    Logger.log("Error: One or more required columns are missing.");
    return;
  }

  var lastRowOfSourceSheet = sourceSheet.getLastRow();
  var rowData = sourceSheet.getRange(lastRowOfSourceSheet, 1, 1, sourceSheet.getLastColumn()).getValues()[0]; 

  var dateValue = rowData[dateColIndex];
  var serialNumberValue = rowData[serialNumberColIndex]; 
  var valueValue = rowData[valueColIndex];
  var monthNumber = parseInt(rowData[monthColIndex]); 

  // Validate month number range
  if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) return;

  // Arabic Month names translation array
  var monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  var monthName = monthNames[monthNumber - 1]; 
  var newSheetName = "دخل " + monthName;

  // Check if the month sheet exists in target spreadsheet, create if not
  var targetSheet = targetSpreadsheet.getSheetByName(newSheetName); 
  if (!targetSheet) { 
    targetSheet = targetSpreadsheet.insertSheet(newSheetName); 
    var newHeaders = ["التاريخ", "الرقم التسلسلي", "القيمة"]; 
    targetSheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
  }

  // Transfer data row
  var dataToTransfer = [dateValue, serialNumberValue, valueValue]; 
  targetSheet.appendRow(dataToTransfer);
}