// GoogleAppsScript.gs

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0]; // Use the first sheet

    // Parse the incoming JSON payload we sent from the frontend
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    // Handle RSVP Submission
    if (action === 'submitRsvp') {
      // Check if phone already exists
      var rows = sheet.getDataRange().getValues();
      if (rows.length > 1) { // Ensure there are records beyond the header
        for (var i = 1; i < rows.length; i++) {
          if (rows[i][2] == data.phone) {
             return ContentService.createTextOutput(JSON.stringify({ error: 'You have already submitted an RSVP with this phone number.' }))
              .setMimeType(ContentService.MimeType.JSON);
          }
        }
      }

      var row = [
        new Date(), 
        data.name, 
        data.phone, 
        data.attending ? 'Yes' : 'No', 
        data.foods ? data.foods.join(', ') : '', 
        'PENDING' // Defaults to PENDING status
      ];
      sheet.appendRow(row);
      
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    } 
    
    // Handle Loading All Guests for the Dashboard
    else if (action === 'getAllGuests') {
      // Optionally add a check for the admin credentials here if you really wanted to,
      // but since we bypassed the login hit earlier, we just return the guests.

      var rows = sheet.getDataRange().getValues();
      if (rows.length <= 1) {
         // Return empty array if only header exists
         return ContentService.createTextOutput(JSON.stringify([]))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      rows.shift(); // Remove the header row
      var guests = rows.map(function(row, index) {
        return {
          id: index + 1, // Store a unique Row ID (starts from 1 corresponding to sheet row 2)
          timestamp: row[0],
          name: row[1],
          phone: row[2],
          attending: row[3] === 'Yes',
          foods: row[4] ? row[4].split(', ') : [],
          status: row[5] || 'PENDING'
        };
      });
      
      return ContentService.createTextOutput(JSON.stringify(guests))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Handle Updating a Guest Status (Accept or Reject)
    else if (action === 'updateStatus') {
      // Ensure we have an ID to update
      if (!data.id) throw new Error('No guest ID provided');
      
      // Since data.id corresponds to index + 1 in the previous step,
      // and row 1 is the header, the actual sheet row is `data.id + 1`
      var rowIndex = data.id + 1;
      
      // Update the status column (Column F, which is index 6)
      var statusRange = sheet.getRange(rowIndex, 6);
      statusRange.setValue(data.status);

      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Fallback if no matching action
    return ContentService.createTextOutput(JSON.stringify({ error: 'Unknown Action Provider.' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Keep a doGet just in case you ever want to preview the raw array output 
// directly in the browser by visiting the Web App URL.
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var rows = sheet.getDataRange().getValues();
  if (rows.length === 0) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);

  var headers = rows.shift(); // Remove headers
  var data = rows.map(function(row, index) {
    return {
      id: index + 1,
      timestamp: row[0],
      name: row[1],
      phone: row[2],
      attending: row[3] === 'Yes',
      foods: row[4] ? row[4].split(', ') : [],
      status: row[5] || 'PENDING'
    };
  });
  
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
