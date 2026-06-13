/**
 * Google Apps Script - Payment Voucher Automation (Series 6800)
 * * Description:
 * Automatically triggers upon Google Form submission to assign a unique,
 * sequential serial number to each payment voucher starting from 6800.
 * It dynamically tracks or creates a column named "رقم سند القبض" as per setup.
 * * Author: Omar Al-Kayyali
 * Date: June 2026
 */

function onPaymentVoucherSubmit(e) {
  // Target data-entry sheet for expense form responses
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form responses 1");

  if (!sheet) {
    Logger.log("Error: 'Form responses 1' sheet not found. Please verify the sheet name.");
    return;
  }

  var lastRow = sheet.getLastRow();
  
  // Validate that lastRow contains actual form data, skipping the header row
  if (lastRow < 2) {
    Logger.log("Insufficient data rows to generate a payment serial number.");
    return;
  }

  // The column header name where the serial number will be logged
  var serialColumnName = "رقم سند القبض";

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var serialColIndex = headers.indexOf(serialColumnName);

  // If the serial number column does not exist, dynamically append it to the sheet
  if (serialColIndex === -1) {
    sheet.insertColumnAfter(sheet.getLastColumn());
    sheet.getRange(1, sheet.getLastColumn()).setValue(serialColumnName);
    serialColIndex = sheet.getLastColumn() - 1; // Adjust index pointing to the new column
    Logger.log("Created a new column for serial numbers: '" + serialColumnName + "' inside: " + sheet.getName());
  }

  /**
   * Serial number sequential calculation logic:
   * Base starting index is set to 6800.
   * Formula: (lastRow - 1) + 6799 ensures row 2 evaluates exactly to 6800.
   */
  var serialNumber = (lastRow - 1) + 6799; 

  // Write the calculated unique serial number to the respective row and column
  sheet.getRange(lastRow, serialColIndex + 1).setValue(serialNumber);

  Logger.log("Successfully assigned Serial Number: " + serialNumber + " to Row: " + lastRow + " in " + sheet.getName());
}