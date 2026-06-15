
/**
 * Google Apps Script - General Financial Report & Income Router
 * * Description:
 * Core financial engine that routes incoming revenue/income datasets and 
 * automatically recalculates a master dynamic sheet named "التقرير العام".
 * It aggregates totals for both income ("دخل") and expenses ("مصاريف") for all 12 months.
 * * Author: Omar Al-Kayyali
 * Date: June 2026
 */

function onFormSubmit_Income(e) {
  transferIncomeData(e);
  updateGeneralReport(); 
}

function transferIncomeData(e) {
  var sourceSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = sourceSpreadsheet.getSheetByName("Form responses 1");
  if (!sourceSheet) {
    Logger.log("Error: 'Form responses 1' sheet not found in the income source workbook.");
    return;
  }
  
  var headers = sourceSheet.getRange(1, 1, 1, sourceSheet.getLastColumn()).getValues()[0];
  var lastRowOfSourceSheet = sourceSheet.getLastRow();
  var rowData = sourceSheet.getRange(lastRowOfSourceSheet, 1, 1, sourceSheet.getLastColumn()).getValues()[0];
  
  // ⚠️ SECURITY NOTICE: Placeholder for Public Repository Protection
  var targetSpreadsheetId = "YOUR_MASTER_FINANCIAL_SPREADSHEET_ID_HERE";
  if (targetSpreadsheetId === "YOUR_MASTER_FINANCIAL_SPREADSHEET_ID_HERE") {
    Logger.log("Error: Please configure targetSpreadsheetId first.");
    return;
  }
  
  var targetSpreadsheet = SpreadsheetApp.openById(targetSpreadsheetId);
  var valueColumnName = "القيمة";
  var dateColumnName = "التاريخ";
  var monthColumnName = "الشهر";
  
  var valueColIndex = headers.indexOf(valueColumnName);
  var dateColIndex = headers.indexOf(dateColumnName);
  var monthColIndex = headers.indexOf(monthColumnName);
  
  if (valueColIndex === -1 || dateColIndex === -1 || monthColIndex === -1) {
    Logger.log("Error: Missing vital columns in source income sheet. Required: " + valueColumnName + ", " + dateColumnName + ", " + monthColumnName);
    return;
  }
  
  var valueValue = rowData[valueColIndex];
  var dateValue = rowData[dateColIndex];
  var monthNumber = parseInt(rowData[monthColIndex]);
  
  if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    Logger.log("Error: Invalid month numerical entry: " + rowData[monthColIndex]);
    return;
  }
  
  var monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  var monthName = monthNames[monthNumber - 1];
  var newSheetName = "دخل " + monthName;
  
  var targetSheet = targetSpreadsheet.getSheetByName(newSheetName);
  if (!targetSheet) {
    targetSheet = targetSpreadsheet.insertSheet(newSheetName);
    var newHeaders = [dateColumnName, valueColumnName];
    targetSheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
  }
  
  var dataToTransfer = [dateValue, valueValue];
  targetSheet.appendRow(dataToTransfer);
}

function updateGeneralReport() {
  // ⚠️ SECURITY NOTICE: Placeholder for Public Repository Protection
  var targetSpreadsheetId = "YOUR_MASTER_FINANCIAL_SPREADSHEET_ID_HERE";
  if (targetSpreadsheetId === "YOUR_MASTER_FINANCIAL_SPREADSHEET_ID_HERE") return;
  
  var targetSpreadsheet = SpreadsheetApp.openById(targetSpreadsheetId);
  var reportSheetName = "التقرير العام";
  var reportSheet = targetSpreadsheet.getSheetByName(reportSheetName);

  if (!reportSheet) {
    reportSheet = targetSpreadsheet.insertSheet(reportSheetName);
    var monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    // Build Headers
    reportSheet.getRange(1, 1, 1, 3).setValues([["الشهر", "إجمالي الدخل", "إجمالي المصاريف"]]);
    for (var i = 0; i < monthNames.length; i++) {
        reportSheet.getRange(i + 2, 1).setValue(monthNames[i]);
    }
  }
  
  var incomeValueColumnName = "القيمة"; 
  var expensesValueColumnName = " المجموع بالأرقام";
  var monthlyIncomeTotals = new Array(12).fill(0);
  var monthlyExpenseTotals = new Array(12).fill(0);
  var sheets = targetSpreadsheet.getSheets();
  
  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    var sheetName = sheet.getName();
    if (sheetName === reportSheetName) continue;
    
    var monthNumber = -1;
    var isIncomeSheet = false;
    var isExpenseSheet = false;
    var monthNamesArabic = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    
    for (var m = 0; m < monthNamesArabic.length; m++) {
      var currentMonthName = monthNamesArabic[m];
      if (sheetName.startsWith("دخل " + currentMonthName)) {
        isIncomeSheet = true;
        monthNumber = m + 1;
        break;
      } else if (sheetName.startsWith("مصاريف " + currentMonthName)) {
        isExpenseSheet = true;
        monthNumber = m + 1;
        break;
      }
    }
    
    if (monthNumber !== -1) {
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var lastRowWithData = sheet.getLastRow();
      if (lastRowWithData < 2) continue;
      
      var dataRange = sheet.getRange(2, 1, lastRowWithData - 1, sheet.getLastColumn());
      var values = dataRange.getValues();
      var sumColumnIndex = -1;
      
      if (isIncomeSheet) {
        sumColumnIndex = headers.indexOf(incomeValueColumnName);
      } else if (isExpenseSheet) {
        sumColumnIndex = headers.indexOf(expensesValueColumnName);
      }
      
      if (sumColumnIndex !== -1) {
        var currentMonthTotal = 0;
        for (var row = 0; row < values.length; row++) {
          var cellValue = values[row][sumColumnIndex];
          if (typeof cellValue === 'number') {
            currentMonthTotal += cellValue;
          } else if (typeof cellValue === 'string' && !isNaN(parseFloat(cellValue))) {
            currentMonthTotal += parseFloat(cellValue);
          }
        }
        if (isIncomeSheet) {
          monthlyIncomeTotals[monthNumber - 1] += currentMonthTotal;
        } else if (isExpenseSheet) {
          monthlyExpenseTotals[monthNumber - 1] += currentMonthTotal;
        }
      } else {
        Logger.log("Error identifying column totals for sheet: " + sheetName);
      }
    }
  }
  
  // Write compiled data loops back to Report sheet columns
  for (var m = 0; m < 12; m++) {
    var targetRow = m + 2;
    reportSheet.getRange(targetRow, 2).setValue(monthlyIncomeTotals[m]);
    reportSheet.getRange(targetRow, 3).setValue(monthlyExpenseTotals[m]);
  }
  Logger.log("Successfully updated 'التقرير العام'.");
}