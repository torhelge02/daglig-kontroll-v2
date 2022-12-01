function onFormSubmit(e) {      // Når et form sendes inn
  var form = FormApp.openById('form_id_here');
  var formResponses = form.getResponses();
  var latestResponse = formResponses.length - 1;
  var formResponse = formResponses[latestResponse];
  
  var items = formResponse.getItemResponses();
  
  var employeeNumber = getMethod(items[0]);
  var typeForm = getMethod(items[1]);
  var controlStatusForm = getMethod(items[2]);
  var comment = getMethod(items[3]);

  var datePath = Utilities.formatDate(new Date(), "GMT+1", "yyyy/MMMMM/dd-MM-yyyy")
  var dateAndTime = Utilities.formatDate(new Date(), "GMT+1", "dd-MM-yyyy HH:mm:ss")
  var time = Utilities.formatDate(new Date(), "GMT+1", "HH:mm:ss")
  var date = Utilities.formatDate(new Date(), "GMT+1", "dd.MM.yyyy")
  
  var logToExport = {};
  var statusToExport = {};

  var controlStatus;
  var sheetsRange;
  var controlStatusSheets;

  var ss = SpreadsheetApp.openById("spreadsheet_id_here");
  var type;

  if(controlStatusForm == "Ja") {     // Konvertere input fra Forms til universelle navn
    controlStatus = "OK"
  } else if(controlStatusForm == "Nei") {
    controlStatus = "NotOK"
  } else {
    controlStatus = "_invalidValue_"
  }

  if(typeForm == "Truck") {     // Konvertere input fra Forms til universelle navn
    type = "Truck"
  } else if(typeForm == "Kran A") {
    type = "KranA"
  } else if(typeForm == "Kran B") {
    type = "KranB"
  } else if(typeForm == "Kran C - 10 tonn") {
    type = "KranC-10tonn"
  } else if(typeForm == "Kran C - 70 tonn") {
    type = "KranC-70tonn"
  }

  Logger.log("Control Status: "+controlStatus)      // Logge status på kontroll
  
  logToExport =      // Data som skal eksporteres til logg i Firebase
    {  
      "employeeNumber": employeeNumber,
      "control": controlStatus,
      "comment": comment,
      "time": time
    };

  statusToExport =      // Data som skal eksporteres til status i Firebase
    {
      "employeeNumber": employeeNumber,
      "time": dateAndTime,
      "control": controlStatus,
      "comment": comment
    }

  // Sende data til Firebase            
  var base = FirebaseApp.getDatabaseByUrl('database_url_here');
  base.setData("Logg/AVE1/"+datePath+"/"+type+"/"+time, logToExport);
  base.setData("Status/AVE1/"+type, statusToExport)

  if(type == "Truck") {     // Celler i sheets for status
    sheetsRange = "B1"
  } else if(type == "KranA") {
    sheetsRange = "B2"
  } else if(type == "KranB") {
    sheetsRange = "B3"
  } else if(type == "KranC-10tonn") {
    sheetsRange = "B4"
  } else if(type == "KranC-70tonn") {
    sheetsRange = "B5"
  }

  // Konvertere universelle navn til navn for Sheets
  if(controlStatus == "OK") {
    if(comment == "" || comment == "_none_") {
      controlStatusSheets = "OK"
    } else {
      controlStatusSheets = "OK*"
    }
  } else if(controlStatus == "NotOK") {
    if(comment == "" || comment == "_none_") {
      controlStatusSheets = "Ikke OK"
    } else {
      controlStatusSheets = "Ikke OK*"
    }
  } else if(controlStatus == "NotCompleted") {
    controlStatusSheets = "Ikke kontrollert"
  } else {
    controlStatusSheets = "Feil"
  }

  // Sende status til Sheets
  ss.getRange(sheetsRange).setValue(controlStatusSheets)
}

function getMethod(item) {      // Hente verdier og konvertere verdier ved behov
  var value = item || "_unknown_"; // if null then "_unknown_" is assigned
  
  function check(x) {     // Hvis verdi er blank, konverter til ønsket verdi
    if(x == "")
      return "";
    else 
      return x;
  }
  
  if(value != "_unknown_") {      // Hent verdi
    return check(value.getResponse());
  } else {
    return value;
  }
}

function resetStatus() {      // Resette kontroller hver natt
  var base = FirebaseApp.getDatabaseByUrl('database_url_here');

  var truckStatus = base.getData("Status/AVE1/Truck/control")
  var kranAStatus = base.getData("Status/AVE1/KranA/control")
  var kranBStatus = base.getData("Status/AVE1/KranB/control")
  var kranC10Status = base.getData("Status/AVE1/KranC-10tonn/control")
  var kranC70Status = base.getData("Status/AVE1/KranC-70tonn/control")
  
  var dateAndTime = Utilities.formatDate(new Date(), "GMT+1", "dd-MM-yyyy HH:mm:ss")
  var statusToExport = {};
  var controlStatusSheets = "Ikke kontrollert";

  var ss = SpreadsheetApp.openById("spreadsheet_id_here")

  statusToExport =      // Verdier som skal lastes opp
    {
      "employeeNumber": "N/A",
      "time": dateAndTime,
      "control": "notCompleted",
      "comment": ""
    }

  // Resette hvis kontrollen ikke er "NotOK"
  if(truckStatus != "NotOK") {
    base.setData("Status/AVE1/Truck", statusToExport)
    ss.getRange("B1").setValue(controlStatusSheets)
  }
  if(kranAStatus != "NotOK") {
    base.setData("Status/AVE1/KranA", statusToExport)
    ss.getRange("B2").setValue(controlStatusSheets)
  }
  if(kranBStatus != "NotOK") {
    base.setData("Status/AVE1/KranB", statusToExport)
    ss.getRange("B3").setValue(controlStatusSheets)
  }
  if(kranC10Status != "NotOK") {
    base.setData("Status/AVE1/KranC-10tonn", statusToExport)
    ss.getRange("B4").setValue(controlStatusSheets)
  }
  if(kranC70Status != "NotOK") {
    base.setData("Status/AVE1/KranC-70tonn", statusToExport)
    ss.getRange("B5").setValue(controlStatusSheets)
  }
}