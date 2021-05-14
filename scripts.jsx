// Global text from main textarea
let mainText = document.getElementById("mainText");

// Global string defaultHash, stores hash in its original form
// inputID:[templateText,isMandatory,value]
// Application default status
const defaultHash = {
    "inputProblem": ["Problem", true, ""],
    "inputModel": ["Device Model", true, ""],
    "inputSerial": ["SN", true, ""],
    "inputDistributor": ["Distributor", true, ""],
    "inputFirmware": ["Firmware", false, ""],
    "selectFirst": ["- First time happening?", false, ""],
    "selectBefore": ["- Was it working before?", false, ""],
    "inputFrequency": ["- How often does it happen and under what conditions?", false, ""],
    "inputError": ["- Error", false, ""],
    "inputSoftware": ["- App/Software used", false, ""],
    "selectWhere": ["- Problem happens on", false, ""],
    "selectWhere2": ["", false, ""],
    "selectCompatible": ["- Are the units compatible?", false, ""],
    "inputSources": ["- Sources", false, ""],
    "inputTx": ["\nTroubleshooting", true, ""],
    "inputMissing": ["\nMissing Steps", false, ""]
};

// Global letiable mainFields, tracks how many additional models/serials/firmware fields have been added
// Global const, maximum number of fields to prevent user to get confused
let mainFields = 1;
const maxFields = 4;

// TODO
// Add event listener to elements in the dropdown menu
// Couldn't make it work even with anonymous functions, switched to old school

// let names = document.querySelectorAll(".dropdown-item");

// for (let i in names) {
//   document.addEventListener('click', function() {
//     setCookie(names[i]);
//   });
// }

// Will try this format:
// let x = document.getElementById("demo");
// x.onclick = function () {
//   document.body.innerHTML = Date();

// Global string formHash, copies defaultHash
let formHash = JSON.parse(JSON.stringify(defaultHash));

// Global current date in the required format
let d = new Date();
let currentDate = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();

// checkVersion() Shows the latest features of the version on the first load of the app.
// Created after noticing people were unaware of the features of the app
function checkVersion() {
    if (localStorage.checkVersion14 != "true") {
        $(document).ready(function () {
            $("#checkVersion").modal();
        });
    }
    localStorage.setItem("checkVersion14", "true");
}

// setName(element) Stores the name of the user on the local storage and updates the dropdownmenu
function setName(element) {
    localStorage.setItem("wizardName", element.textContent);

    document.getElementById("dropdownWizard").textContent = element.textContent;
    updateTextarea(document.getElementById("inputProblem"));
}

// updateTextarea(element) Textarea gets updated automatically
function updateTextarea(element) {
    let str = document.getElementById("dropdownWizard").innerHTML + " - " + currentDate + "\n\n";
    let model = document.getElementById("inputModel");
    let serial = document.getElementById("inputSerial");
    let firmware = document.getElementById("inputFirmware");

    // selects all model fields by filtering for the id name
    let allmodels = Array.from(document.querySelectorAll('[id^=inputModel]'));
    let allserials = Array.from(document.querySelectorAll('[id^=inputSerial]'));
    let allfirmwares = Array.from(document.querySelectorAll('[id^=inputFirmware]'));

    // update hash with the new info, reset if needed
    // and create strings needed for multiple fields under the same category
    if (element == "reset") {
        formHash = JSON.parse(JSON.stringify(defaultHash));
    } else if (allmodels.includes(element)) {
        let string = "";
        for (let i = 0; i < allmodels.length; i++) {
            string += allmodels[i].value + " ";
            if (allmodels[i + 1] && allmodels[i+1].value != "") {
                string += "// ";
            }
        }
        formHash[model.id][2] = string;
    } else if (allserials.includes(element)) {
        let string = "";
        for (let i = 0; i < allserials.length; i++) {
            string += allserials[i].value + " ";
            if (allserials[i + 1] && allserials[i+1].value != "") {
                string += "// ";
            }
        }
        formHash[serial.id][2] = string;
    } else if (allfirmwares.includes(element)) {
        let string = "";
        for (let i = 0; i < allfirmwares.length; i++) {
            string += allfirmwares[i].value + " ";
            if (allfirmwares[i + 1] && allfirmwares[i+1].value != "") {
                string += "// ";
            }
        }
        formHash[firmware.id][2] = string;
    } else {
        formHash[element.id][2] = element.value;
    }

    // create and output final string from hash
    for (let i in formHash) {
        // if its empty or na and optional
        if ((formHash[i][2] == "" || formHash[i][2] == "na") && !formHash[i][1]) {
            str += "";
            // special case for the "happens where" fields
        } else if ((i == "selectWhere" || i == "selectWhere2") && formHash["selectWhere2"][2] != "na") {
            if (i == "selectWhere2") {
                ;
            } else {
                str += formHash[i][0] + ": " + formHash[i][2] + ", " + formHash["selectWhere2"][2] + "\n";
            }
            // Additional return carriages after the Distributor field
        } else if (i == "inputDistributor" && formHash["inputFirmware"][2] == "") {
            str += formHash[i][0] + ": " + formHash[i][2] + "\n\n";
        } else if (i == "inputFirmware" && formHash["inputFirmware"][2] != "") {
            str += formHash[i][0] + ": " + formHash[i][2] + "\n\n";
            // Additional return carriages for the troubleshoot field
        } else if (i == "inputTx") {
            str += formHash[i][0] + ": \n\n" + formHash[i][2] + "\n";
        } else if (i == "inputModel" || i == "inputSerial") {
            str += formHash[i][0] + ": " + formHash[i][2].toUpperCase() + "\n";
        } else {
            str += formHash[i][0] + ": " + formHash[i][2] + "\n";
        }
    }
    mainText.value = str;
}

// addFields() adds additional model/serial/firmware fields on the main app
function addFields() {
    if (mainFields < maxFields) {
        mainFields++;

        let button = document.getElementById("addNewFields");

        let model = document.createElement("input");
        let serial = document.createElement("input");
        let firmware = document.createElement("input");

        let modelParent = document.getElementById("inputModel").parentNode;
        let currentSerialNode = document.getElementById("inputSerial").parentNode.lastElementChild;
        let currentFirmwareNode = document.getElementById("inputFirmware").parentNode.lastElementChild;

        model.setAttribute("list", "deviceList");
        model.classList.add("form-control");
        model.classList.add("form-control-sm");
        model.classList.add("uppercase");
        model.setAttribute("id", `inputModel${mainFields}`);
        model.placeholder = "Model Number";
        model.setAttribute("onInput", "updateTextarea(this)");
        
        serial.classList.add("form-control");
        serial.classList.add("form-control-sm");
        serial.classList.add("uppercase");
        serial.setAttribute("id", `inputSerial${mainFields}`);
        serial.placeholder = "Serial Number";
        serial.setAttribute("onInput", "updateTextarea(this)");        

        firmware.classList.add("form-control");
        firmware.classList.add("form-control-sm");
        firmware.setAttribute("id", `inputFirmware${mainFields}`);
        firmware.placeholder = "Firmware";
        firmware.setAttribute("onInput", "updateTextarea(this)");        

        modelParent.insertBefore(model, button);
        currentSerialNode.parentNode.insertBefore(serial, currentSerialNode.nextElementSibling);
        currentFirmwareNode.parentNode.insertBefore(firmware, currentFirmwareNode.nextElementSibling);
    }
}

// loadStorage() Loads name of the user
function loadStorage() {
    if (localStorage.wizardName) {
        document.getElementById("dropdownWizard").innerHTML = localStorage.wizardName;
    }
}

// formReset(), resets form to default state
function formReset() {
    document.getElementById("dataForm").reset();
    let sources = document.getElementById("inputSources");
    sources.className = "form-control form-control-sm";

    // remove any extrafields created
    let allmodels = Array.from(document.querySelectorAll('[id^=inputModel]'));
    let allserials = Array.from(document.querySelectorAll('[id^=inputSerial]'));
    let allfirmwares = Array.from(document.querySelectorAll('[id^=inputFirmware]'));

    for (let i = 1; i < allmodels.length; i++) {
        allmodels[i].parentNode.removeChild(allmodels[i]);
        allserials[i].parentNode.removeChild(allserials[i]);
        allfirmwares[i].parentNode.removeChild(allfirmwares[i]);
    }

    mainFields = 1;
    updateTextarea("reset");
}

// Removes the last fields on the linked model/serial/firmware fields
function removeLastField() {
    let allmodels = Array.from(document.querySelectorAll('[id^=inputModel]'));
    let allserials = Array.from(document.querySelectorAll('[id^=inputSerial]'));
    let allfirmwares = Array.from(document.querySelectorAll('[id^=inputFirmware]'));

    if (mainFields > 1) {
        allmodels[0].parentNode.removeChild(allmodels[allmodels.length - 1]);
        allserials[0].parentNode.removeChild(allserials[allserials.length - 1]);
        allfirmwares[0].parentNode.removeChild(allfirmwares[allfirmwares.length - 1]);

        mainFields--;
    }
}

// copyTextArea() copies the text on the main textarea to the clipboard. Also highlights missing fields
function copyTextArea() {
    let sources = document.getElementById("inputSources");
    if (!sources.value) {
        sources.className = "form-control form-control-sm border border-danger";
    } else {
        sources.className = "form-control form-control-sm";
    }
    mainText.select();
    document.execCommand("copy");
}

// Templates. TODO: 1 function for all templates

// Password Reset
function passwordReset() {
    let templateText = JSON.parse(JSON.stringify(formHash));
    templateText.inputProblem[0, 2] = "Password Reset";
    templateText.inputTx[0, 2] = "Date on the screen is <INSERT DATE HERE>.\nSent email with the passwords and asked to follow the instructions included.";

    for (let k in templateText) {
        document.getElementById(k).value = templateText[k][2];
    }

    templateText.inputSources[0, 2] = "https://dahuawiki.com/PasswordReset";

    updateTextarea(document.getElementById("inputProblem"));
    updateTextarea(document.getElementById("inputTx"));
    updateTextarea(document.getElementById("inputSources"));
}

// Remote connection setup, thank you Miguel!
function P2PSetup(interface) {
    let templateText = JSON.parse(JSON.stringify(formHash));
    templateText.inputProblem[0, 2] = "P2P connection setup";
    if (interface == "Blue") {
        templateText.inputTx[0, 2] = "On the Unit: Main Menu > Network (Setting) > P2P and enabled P2P. Click OK.\r" +
            "Status 'Not Connected'.\r" +
            "Main Menu > Network (Setting) > TCP/IP > Edit (Pencil) Ethernet Port 1 and enable DHCP. Click OK.\r" +
            "Enable DHCP again. Click Apply.\r" +
            "Main Menu > Shut Down > Restart to reboot the unit.\r" +
            "Main Menu > Network (Setting) > P2P.\r" +
            "Status: 'Connect Success'.\r" +
            "On the Phone/Tablet: Open iDMSS/gDMSS.\r" +
            "Tap the Device icon on the bottom.\r" +
            "+ Sign > Scan >  Next > NVR > Device Name, Username and Password > Save.\r";
        templateText.inputSources[0, 2] = "https://dahuawiki.com/Troubleshoot/NVR/P2P_Troubleshoot";
    } else {
        templateText.inputTx[0, 2] = "On the unit: Main Menu > Network > P2P > Enable > Apply.\r" +
            "P2P Status: 'Offline'.\r" +
            "Main Menu > Network > TCP > Enable DHCP > Apply.\r" +
            "Top Right Icon > Reboot.\r" +
            "Main Menu > Network > P2P > P2P Status: 'Online'.\r" +
            "On the Phone/Tablet Open iDMSS/gDMSS.\r" +
            "Tap the Device icon on the bottom.\r" +
            "+ Sign > Scan >  Next > NVR > Device Name, Username and Password > Save.\r";
        templateText.inputSources[0, 2] = "https://dahuawiki.com/New_GUI/Instructions/Remote_Access_via_P2P";
    }

    for (let k in templateText) {
        document.getElementById(k).value = templateText[k][2];
    }

    updateTextarea(document.getElementById("inputProblem"));
    updateTextarea(document.getElementById("inputTx"));
    updateTextarea(document.getElementById("inputSources"));
}

// Motion Setup
function motionRecording(interface) {
    let templateText = JSON.parse(JSON.stringify(formHash));
    templateText.inputProblem[0, 2] = "Motion recording setup";
    if (interface == "Blue") {
        templateText.inputTx[0, 2] = "Main Menu > Event under Settings > Video Detect > Motion Detect > Enable.\r" +
            "Enable Record Channel. Channel is the same as the camera channel.\r" +
            "Main Menu > Storage > Schedule > Hit Motion/MD > Hit All > Draw motion lines over the timeline.\r" +
            "Main Menu > Storage > Record > Cameras are on Auto for the Main Stream\r";
        templateText.inputSources[0, 2] = "http://www.dahuawiki.com/NVR/Recording_Setup/Motion_Record_Troubleshoot";
    } else {
        templateText.inputTx[0, 2] = "Main Menu > Management > Camera > Video Detect > Motion Detect > Enable MD\r" +
            "Enable Record Channel. Channel is the same as the camera channel.\r" +
            "Main Menu > Management > Storage > Schedule > Hit Motion/MD > Hit All > Draw motion lines over the timeline.\r" +
            "Main Menu > Storage > Record > Cameras are on Auto for the Main Stream";
        templateText.inputSources[0, 2] = "https://dahuawiki.com/New_GUI/Instructions/Motion_Record";
    }

    for (let k in templateText) {
        document.getElementById(k).value = templateText[k][2];
    }

    updateTextarea(document.getElementById("inputProblem"));
    updateTextarea(document.getElementById("inputTx"));
}

// Email notifications setup
function emailNotifications(interface) {
    let templateText = JSON.parse(JSON.stringify(formHash));
    templateText.inputProblem[0, 2] = "Email Notifications Setup";
    let commonText = "Server smtp.mail.yahoo.com, port 465.\r" +
        "Username is the full gmail address, password for gmail account.\r" +
        "Sender and receiver, emails where you want to send/receive notifications from/to.\r" +
        "Attachment enabled.\r" +
        "Save then hit Test.\r";

    if (interface == "Blue") {
        templateText.inputTx[0, 2] = "Main Menu > Network > Email > Enable.\r" + commonText;
        templateText.inputSources[0, 2] = "https://dahuawiki.com/Email/Email_Notifications_Setup_Yahoo";
    } else if (interface == "Black") {
        templateText.inputTx[0, 2] = "Management > Network > Email > Enable.\r" + commonText;
        templateText.inputSources[0, 2] = "https://dahuawiki.com/Email/Email_Notifications_Setup_Yahoo";
    } else if (interface == "Web") {
        templateText.inputTx[0, 2] = "Setup > Network > Email > Enable.\r" + commonText;
        templateText.inputSources[0, 2] = "https://dahuawiki.com/Email/Email_Notifications_Setup_Yahoo";

    } else {
        templateText.inputTx[0, 2] = "+ > Device Config > Select Recorder > Network > Email > Enable.\r" + commonText;
        templateText.inputSources[0, 2] = "https://dahuawiki.com/Email/Email_Notifications_Setup_Yahoo";
        templateText.inputSoftware[0, 2] = "SmartPSS"
    }

    for (let k in templateText) {
        document.getElementById(k).value = templateText[k][2];
    }

    updateTextarea(document.getElementById("inputProblem"));
    updateTextarea(document.getElementById("inputTx"));
}

window.onload = function () {
    loadStorage();
    formReset();
    checkVersion();
}

// Keyboard Shortcuts
function doc_keyUp(e) {
    // alt+r
    if (e.altKey && e.keyCode == 82) {
        $(document).ready(function () {
            $("#resetModal").modal();
        });
    }
    // alt+g
    if (e.altKey && e.keyCode == 71) {
        copyTextArea();
    }
}
document.addEventListener('keyup', doc_keyUp, false);    