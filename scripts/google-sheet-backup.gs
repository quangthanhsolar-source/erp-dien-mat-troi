/**
 * Bản sao Khách hàng CRM và Doanh số sang Google Sheet.
 * Triển khai: Apps Script → Deploy → Web app → Execute as me → Anyone.
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
  return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
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
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
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
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sh;
}

function appendRows(ss, name, headers, rows) {
  if (!rows || !rows.length || !headers || !headers.length) return;
  var sh = ensureHeaders(ss, name, headers);
  var values = rows.map(function(r){ return fitRow(r, headers.length); });
  var start = Math.max(sh.getLastRow(), 1) + 1;
  if (sh.getLastRow() < 1) start = 2;
  sh.getRange(start, 1, values.length, headers.length).setValues(values);
}

function applyTable(ss, name, headers, upserts, deletes, keyField) {
  if (!headers || !headers.length) return;
  var sh = ensureHeaders(ss, name, headers);
  var width = headers.length;
  var map = {};
  var order = [];
  var last = sh.getLastRow();
  if (last >= 2) {
    var data = sh.getRange(2, 1, last - 1, width).getValues();
    data.forEach(function(row){
      var key = String(row[0] == null ? '' : row[0]).trim();
      if (!key || map[key]) return;
      map[key] = fitRow(row, width);
      order.push(key);
    });
  }
  (deletes || []).forEach(function(key){ delete map[String(key)]; });
  (upserts || []).forEach(function(item){
    if (!item) return;
    var key = String(item[keyField] == null ? '' : item[keyField]).trim();
    if (!key) return;
    if (order.indexOf(key) < 0) order.push(key);
    map[key] = fitRow(item.values || [], width);
  });
  var rows = [];
  var seen = {};
  order.forEach(function(key){
    if (!map[key] || seen[key]) return;
    seen[key] = 1;
    rows.push(map[key]);
  });
  var all = [headers].concat(rows);
  sh.clearContents();
  sh.getRange(1, 1, all.length, width).setValues(all);
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, width).setFontWeight('bold');
}

function dropEmptyDefault(ss) {
  var sh = ss.getSheetByName('Trang tính1');
  if (!sh || ss.getSheets().length < 2) return;
  if (sh.getLastRow() > 1) return;
  ss.deleteSheet(sh);
}
