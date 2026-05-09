// GoogleAppsScript.gs — Updated version with Invite Code System

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0]; // RSVP sheet
    
    // Ensure "Invites" sheet exists
    var inviteSheet = ss.getSheetByName("Invites");
    if (!inviteSheet) {
      inviteSheet = ss.insertSheet("Invites");
      inviteSheet.appendRow(["Code", "Status", "UsedByPhone", "Timestamp"]);
    }

    // Parse the incoming JSON payload
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    // ── Handle RSVP Submission ──────────────────────────────────────────
    if (action === 'submitRsvp') {
      var inviteCode = data.inviteCode;
      
      // 1. Verify Invite Code
      if (!inviteCode) {
        return ContentService.createTextOutput(JSON.stringify({ error: 'An invitation code is required.' })).setMimeType(ContentService.MimeType.JSON);
      }
      
      var inviteRows = inviteSheet.getDataRange().getValues();
      var inviteRowIndex = -1;
      for (var i = 1; i < inviteRows.length; i++) {
        if (inviteRows[i][0] === inviteCode) {
          if (inviteRows[i][1] === 'USED') {
            return ContentService.createTextOutput(JSON.stringify({ error: 'This invitation has already been used.' })).setMimeType(ContentService.MimeType.JSON);
          }
          inviteRowIndex = i + 1; // 1-based index
          break;
        }
      }
      
      if (inviteRowIndex === -1) {
        return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid invitation code.' })).setMimeType(ContentService.MimeType.JSON);
      }

      var guests = Array.isArray(data.guests) ? data.guests : [];
      var rsvpType = data.rsvpType || 'individual';

      if (guests.length === 0) {
        guests = [{ name: data.name, phone: data.phone, attending: data.attending, foods: data.foods }];
      }

      var primaryPhone = data.phone || (guests[0] && guests[0].phone) || '';

      // Check if primary phone already exists in RSVP sheet
      if (primaryPhone) {
        var rows = sheet.getDataRange().getValues();
        for (var i = 1; i < rows.length; i++) {
          if (String(rows[i][2]) === String(primaryPhone)) {
            return ContentService.createTextOutput(JSON.stringify({ error: 'This phone number has already been used to RSVP.' })).setMimeType(ContentService.MimeType.JSON);
          }
        }
      }

      var timestamp = new Date();
      var side = data.side || 'unknown';

      // 2. Add guests to RSVP sheet
      guests.forEach(function(g) {
        var attendingBool = (g.attending === true || g.attending === 'true' || g.attending === 'Yes');
        var row = [ timestamp, g.name || '', g.phone || primaryPhone || '', attendingBool ? 'Yes' : 'No', g.foods ? (Array.isArray(g.foods) ? g.foods.join(', ') : g.foods) : '', 'PENDING', rsvpType, side ];
        sheet.appendRow(row);
      });

      // 3. Mark Code as USED
      inviteSheet.getRange(inviteRowIndex, 2).setValue('USED');
      inviteSheet.getRange(inviteRowIndex, 3).setValue(primaryPhone);
      inviteSheet.getRange(inviteRowIndex, 4).setValue(timestamp);

      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }

    // ── Generate Invite Codes ───────────────────────────────────────────
    else if (action === 'generateCodes') {
      var count = data.count || 100;
      var existingCodes = inviteSheet.getDataRange().getValues().map(function(r) { return r[0]; });
      
      for (var i = 0; i < count; i++) {
        var newCode;
        do {
          newCode = "SW-" + Math.floor(1000 + Math.random() * 9000);
        } while (existingCodes.indexOf(newCode) !== -1);
        
        inviteSheet.appendRow([newCode, 'PENDING', '', '']);
        existingCodes.push(newCode);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, count: count })).setMimeType(ContentService.MimeType.JSON);
    }

    // ── Verify Invite Code ─────────────────────────────────────────────
    else if (action === 'verifyCode') {
      var code = data.code;
      var inviteRows = inviteSheet.getDataRange().getValues();
      for (var i = 1; i < inviteRows.length; i++) {
        if (inviteRows[i][0] === code) {
          return ContentService.createTextOutput(JSON.stringify({ valid: true, status: inviteRows[i][1] })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ valid: false })).setMimeType(ContentService.MimeType.JSON);
    }

    // ── Get Available Codes (Admin) ────────────────────────────────────
    else if (action === 'getAvailableCodes') {
      var rows = inviteSheet.getDataRange().getValues();
      rows.shift(); // header
      var available = rows.map(function(row) {
        return { code: row[0], status: row[1], usedBy: row[2], timestamp: row[3] };
      });
      return ContentService.createTextOutput(JSON.stringify(available)).setMimeType(ContentService.MimeType.JSON);
    }

    // ── Get All Guests (Admin Dashboard) ────────────────────────────────
    else if (action === 'getAllGuests') {
      var rows = sheet.getDataRange().getValues();
      if (rows.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
      rows.shift(); 
      var guests = rows.map(function(row, index) {
        return { id: index + 1, timestamp: row[0], name: row[1], phone: row[2], attending: row[3] === 'Yes', foods: row[4] ? row[4].split(', ') : [], status: row[5] || 'PENDING', rsvpType: row[6] || 'individual', side: row[7] || 'unknown' };
      });
      return ContentService.createTextOutput(JSON.stringify(guests)).setMimeType(ContentService.MimeType.JSON);
    }

    // ── Update Guest Status / Delete Guest (omitted for brevity, keep existing) ──
    else if (action === 'updateStatus') {
      if (!data.id) throw new Error('No guest ID provided');
      sheet.getRange(data.id + 1, 6).setValue(data.status);
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }
    else if (action === 'deleteGuest') {
      if (!data.id) throw new Error('No guest ID provided');
      sheet.deleteRow(data.id + 1);
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ error: 'Unknown action.' })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var rows = sheet.getDataRange().getValues();
  if (rows.length === 0) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  rows.shift();
  var data = rows.map(function(row, index) {
    return { id: index + 1, timestamp: row[0], name: row[1], phone: row[2], attending: row[3] === 'Yes', foods: row[4] ? row[4].split(', ') : [], status: row[5] || 'PENDING', rsvpType: row[6] || 'individual', side: row[7] || 'unknown' };
  });
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
