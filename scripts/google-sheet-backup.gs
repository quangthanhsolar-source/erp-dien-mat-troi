/**
 * Bản sao Khách hàng CRM và Doanh số sang Google Sheet.
 * Mỗi lần lưu chỉ sửa đúng dòng vừa thêm/sửa, thêm dòng mới ở cuối,
 * và xóa từ dưới lên. Không xóa nội dung cả tab.
 * Triển khai: Apps Script → Triển khai → Quản lý các bản triển khai →
 * bút chì → Phiên bản mới → Triển khai. Giữ nguyên đường dẫn web app cũ.
 * Phần mềm gửi POST text/plain, không đọc được phản hồi (tránh CORS).
 */
var SHEET_ID = '1avo525mavewlq6w9ljxDxJRE4bnK-1WFCL1KHE71crA';
var SHEET_TOKEN = 'qts-erp-sheet-v1';
var TAB_CRM = 'Khách hàng CRM';
var TAB_ORDERS = 'Doanh số';
var TAB_LOG = 'Nhật ký';

function doGet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  ensureHeaders(ss, TAB_CRM, ['Mã','Khu vực','Người phụ trách','Ngày','Nguồn','Tên','SĐT','Địa chỉ','Nhu cầu tiền điện','Trạng thái','Ghi chú','File khảo sát','File báo giá','Cập nhật lúc']);
  ensureHeaders(ss, TAB_ORDERS, ['Mã đơn','Phụ trách','Ngày','Nguồn','Danh mục','Thông tin khách hàng','SĐT','Địa chỉ','Tổng tiền','Đặt cọc','Đã thanh toán','Công nợ','Trạng thái','Hoa hồng','Ghi chú','Cập nhật lúc']);
  ensureHeaders(ss, TAB_LOG, ['Thời điểm','Thư mục','Hành động','Mã','Nội dung']);
  dropEmptyDefault(ss);
  return ContentService.createTextOutput(JSON.stringify({ok:true, mode:'row'})).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    var raw = (e && e.postData && e.postData.contents) || (e && e.parameter && e.parameter.payload) || '';
    var body = JSON.parse(raw || '{}');
    if (!body || body.token !== SHEET_TOKEN) throw new Error('Sai mã');
    var ss = SpreadsheetApp.openById(SHEET_ID);
    if (body.log && body.log.rows && body.log.rows.length) appendRows(ss, body.log.name || TAB_LOG, body.log.headers, body.log.rows);
    if (body.crm) applyTable(ss, body.crm.name || TAB_CRM, body.crm.headers, body.crm.upserts, body.crm.deletes, 'id');
    if (body.orders) applyTable(ss, body.orders.name || TAB_ORDERS, body.orders.headers, body.orders.upserts, body.orders.deletes, 'code');
    dropEmptyDefault(ss);
    return ContentService.createTextOutput(JSON.stringify({ok:true, mode:'row'})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false, error:String(err && err.message || err)})).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function fitRow(row, n) {
  var out = [];
  for (var i = 0; i < n; i++) {
    var v = row && row.length > i ? row[i] : '';
    out.push(v == null ? '' : v);
  }
  return out;
}

function ensureHeaders(ss, name, headers) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() < 1) {
    ensureSize(sh, 1, headers.length);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sh;
}

function ensureSize(sh, minRows, minCols) {
  var maxR = sh.getMaxRows();
  if (minRows > maxR) sh.insertRowsAfter(maxR, minRows - maxR);
  var maxC = sh.getMaxColumns();
  if (minCols > maxC) sh.insertColumnsAfter(maxC, minCols - maxC);
}

function appendRows(ss, name, headers, rows) {
  if (!rows || !rows.length || !headers || !headers.length) return;
  var sh = ensureHeaders(ss, name, headers);
  var values = rows.map(function(r){ return fitRow(r, headers.length); });
  var start = Math.max(sh.getLastRow(), 1) + 1;
  ensureSize(sh, start + values.length - 1, headers.length);
  sh.getRange(start, 1, values.length, headers.length).setValues(values);
}

function planSheetEdits(existingKeys, upserts, deletes, keyField, width) {
  var index = {};
  for (var i = 0; i < existingKeys.length; i++) {
    var existing = String(existingKeys[i] == null ? '' : existingKeys[i]).trim();
    if (!existing) continue;
    if (!index[existing]) index[existing] = [];
    index[existing].push(i + 2);
  }
  var deleteSet = {};
  (deletes || []).forEach(function(key) {
    key = String(key == null ? '' : key).trim();
    if (key) deleteSet[key] = 1;
  });
  var updateMap = {};
  var appendMap = {};
  var appendOrder = [];
  (upserts || []).forEach(function(item) {
    if (!item) return;
    var key = String(item[keyField] == null ? '' : item[keyField]).trim();
    if (!key) return;
    delete deleteSet[key];
    var values = fitRow(item.values || [], width);
    var rows = index[key];
    if (rows && rows.length) {
      rows.forEach(function(r) { updateMap[r] = values; });
    } else if (!appendMap[key]) {
      appendMap[key] = values;
      appendOrder.push(key);
    } else {
      appendMap[key] = values;
    }
  });
  var updates = [];
  Object.keys(updateMap).forEach(function(r) {
    updates.push({row: Number(r), values: updateMap[r]});
  });
  updates.sort(function(a, b) { return a.row - b.row; });
  var appends = appendOrder.map(function(k) { return appendMap[k]; });
  var seenDel = {};
  var deleteRows = [];
  Object.keys(deleteSet).forEach(function(key) {
    var rows = index[key];
    if (!rows) return;
    rows.forEach(function(r) {
      if (seenDel[r]) return;
      seenDel[r] = 1;
      deleteRows.push(r);
    });
  });
  deleteRows.sort(function(a, b) { return b - a; });
  return {updates: updates, appends: appends, deleteRows: deleteRows};
}

function writeUpdates(sh, updates, width) {
  if (!updates || !updates.length) return;
  ensureSize(sh, updates[updates.length - 1].row, width);
  var block = [];
  function flush() {
    if (!block.length) return;
    var values = [];
    for (var i = 0; i < block.length; i++) values.push(block[i].values);
    sh.getRange(block[0].row, 1, values.length, width).setValues(values);
    block = [];
  }
  for (var i = 0; i < updates.length; i++) {
    if (block.length && updates[i].row !== block[block.length - 1].row + 1) flush();
    block.push(updates[i]);
  }
  flush();
}

function deleteRowBlocks(sh, rowsDesc) {
  if (!rowsDesc || !rowsDesc.length) return;
  var i = 0;
  while (i < rowsDesc.length) {
    var bottom = rowsDesc[i];
    var top = bottom;
    while (i + 1 < rowsDesc.length && rowsDesc[i + 1] === top - 1) {
      i++;
      top = rowsDesc[i];
    }
    if (top >= 2) sh.deleteRows(top, bottom - top + 1);
    i++;
  }
}

function applyTable(ss, name, headers, upserts, deletes, keyField) {
  if (!headers || !headers.length) return;
  var ups = upserts || [];
  var dels = deletes || [];
  if (!ups.length && !dels.length) return;
  var sh = ensureHeaders(ss, name, headers);
  var width = headers.length;
  ensureSize(sh, Math.max(sh.getLastRow(), 1), width);
  var existing = [];
  var last = sh.getLastRow();
  if (last >= 2) {
    var col = sh.getRange(2, 1, last - 1, 1).getValues();
    for (var i = 0; i < col.length; i++) existing.push(col[i][0]);
  }
  var plan = planSheetEdits(existing, ups, dels, keyField, width);
  writeUpdates(sh, plan.updates, width);
  if (plan.appends.length) {
    var start = Math.max(sh.getLastRow(), 1) + 1;
    ensureSize(sh, start + plan.appends.length - 1, width);
    sh.getRange(start, 1, plan.appends.length, width).setValues(plan.appends);
  }
  deleteRowBlocks(sh, plan.deleteRows);
}

function dropEmptyDefault(ss) {
  var sh = ss.getSheetByName('Trang tính1');
  if (!sh || ss.getSheets().length < 2) return;
  if (sh.getLastRow() > 1) return;
  ss.deleteSheet(sh);
}
