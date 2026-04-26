// GoogleAppsScript.gs — Updated version (redeploy required)

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0]; // Use the first sheet

    // Parse the incoming JSON payload
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    // ── Handle RSVP Submission ──────────────────────────────────────────
    if (action === 'submitRsvp') {
      var guests = Array.isArray(data.guests) ? data.guests : [];
      var rsvpType = data.rsvpType || 'individual';

      if (guests.length === 0) {
        // Fallback for older single-guest structure
        guests = [{
          name: data.name,
          phone: data.phone,
          attending: data.attending,
          foods: data.foods
        }];
      }

      var primaryPhone = data.phone || (guests[0] && guests[0].phone) || '';

      // Check if primary phone already exists
      if (primaryPhone) {
        var rows = sheet.getDataRange().getValues();
        for (var i = 1; i < rows.length; i++) {
          if (String(rows[i][2]) === String(primaryPhone)) {
            return ContentService
              .createTextOutput(JSON.stringify({ error: 'This phone number has already been used to RSVP.' }))
              .setMimeType(ContentService.MimeType.JSON);
          }
        }
      }

      var timestamp = new Date();
      var side = data.side || 'unknown'; // ← Get side from top-level payload

      guests.forEach(function(g) {
        // Explicitly coerce attending to boolean then to string
        var attendingBool = (g.attending === true || g.attending === 'true' || g.attending === 'Yes');
        var row = [
          timestamp,
          g.name || '',
          g.phone || primaryPhone || '',
          attendingBool ? 'Yes' : 'No',
          g.foods ? (Array.isArray(g.foods) ? g.foods.join(', ') : g.foods) : '',
          'PENDING',
          rsvpType,   // Column 7: rsvpType
          side       // Column 8: side (willy | sonia)
        ];
        sheet.appendRow(row);
      });

      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ── Get All Guests (Admin Dashboard) ────────────────────────────────
    else if (action === 'getAllGuests') {
      var rows = sheet.getDataRange().getValues();
      if (rows.length <= 1) {
        return ContentService
          .createTextOutput(JSON.stringify([]))
          .setMimeType(ContentService.MimeType.JSON);
      }

      rows.shift(); // Remove header row
      var guests = rows.map(function(row, index) {
        return {
          id: index + 1,
          timestamp: row[0],
          name: row[1],
          phone: row[2],
          attending: row[3] === 'Yes',
          foods: row[4] ? row[4].split(', ') : [],
          status: row[5] || 'PENDING',
          rsvpType: row[6] || 'individual',
          side: row[7] || 'unknown' // Column 8
        };
      });

      return ContentService
        .createTextOutput(JSON.stringify(guests))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ── Update Guest Status ──────────────────────────────────────────────
    else if (action === 'updateStatus') {
      if (!data.id) throw new Error('No guest ID provided');
      var rowIndex = data.id + 1;
      sheet.getRange(rowIndex, 6).setValue(data.status);

      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ── Delete Guest ─────────────────────────────────────────────────────
    else if (action === 'deleteGuest') {
      if (!data.id) throw new Error('No guest ID provided');
      var rowIndex = data.id + 1;
      sheet.deleteRow(rowIndex);

      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Unknown action.' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// doGet: preview raw guest list in browser
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var rows = sheet.getDataRange().getValues();
  if (rows.length === 0) {
    return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  }

  rows.shift();
  var data = rows.map(function(row, index) {
    return {
      id: index + 1,
      timestamp: row[0],
      name: row[1],
      phone: row[2],
      attending: row[3] === 'Yes',
      foods: row[4] ? row[4].split(', ') : [],
      status: row[5] || 'PENDING',
      rsvpType: row[6] || 'individual',
      side: row[7] || 'unknown'
    };
  });

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
