const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');

const {app, BrowserWindow, Menu} = electron;
const { ipcMain } = require('electron');
// for messages
const { dialog } = require('electron');

let editorWindow;
let aboutWindow;
let objectsWindow;
let conditionsWindow;
let editorSyntaxWindow;
let userManualWindow;

// Setting ENVIROMENT
// process.env.NODE_ENV = 'development';
process.env.NODE_ENV = 'production';

// Listen for app to be ready
app.on('ready', function()
{    
    // Create new window
    editorWindow = new BrowserWindow({
        title: 'R-GUI-DialogCreator',
        webPreferences:{
            nodeIntegration: true
        },
        width: 1200,
        height: 800,
        minWidth: 1200,
        minHeight: 800,
        center: true
    });
    // load html into the window
    editorWindow.loadURL(url.format({
        pathname: path.join(__dirname, './windows/editorWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    
    // maximize
    // editorWindow.maximize();

    // Open the DevTools.
    if (process.env.NODE_ENV === 'development') {
        editorWindow.webContents.openDevTools();
    }

    //Quit app when closed
    editorWindow.on('closed', function(){
        app.quit(); 
    });

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu);

});

// Handle create about window
function createAboutWindow()
{
    // object may be null so no ===
    if (aboutWindow == void 0 || aboutWindow.isDestroyed()) {
        aboutWindow = new BrowserWindow({
            with:600,
            height: 400,
            title: 'About R GUI',
            parent:editorWindow,
            center: true,
            modal: true
        });

        aboutWindow.loadURL(url.format({
            pathname: path.join(__dirname, './windows/aboutWindow.html'),
            protocol: "file:",
            slashes: true
        }));
        // Garbage collection handle
        aboutWindow.on('closed', function(){
            aboutWindow = null;
        });
        aboutWindow.setMenu(null);
    } else {
        aboutWindow.focus();
    }
}

// Handle create preview window
function createObjectsWindow(arg)
{
    let dialogData = JSON.parse(arg);
    
    // object may be null so no ===
    if (objectsWindow == void 0 || objectsWindow.isDestroyed()) {
        // create window but do not show it - waiting for data
        // https://stackoverflow.com/questions/51789711/how-to-send-data-between-parent-and-child-window-in-electron
        objectsWindow = new BrowserWindow({
            webPreferences:{
                nodeIntegration: true
            },

            // added extra space for title bar and scrollbars
            width: parseInt(dialogData.properties.width) + 40,
            height: parseInt(dialogData.properties.height) + 185,
            title: dialogData.properties.title,
            autoHideMenuBar: true,
            parent: editorWindow,
            resizable: false,
            show: false,
            // modal: true
        });

        // Open the DevTools.
        if (process.env.NODE_ENV === 'development') {
            objectsWindow.webContents.openDevTools();
        }

        objectsWindow.loadURL(url.format({
            pathname: path.join(__dirname, './windows/objectsWindow.html'),
            protocol: "file:",
            slashes: true
        }));
        // Garbage collection handle
        objectsWindow.on('closed', function(){
            objectsWindow = null;
            
        });
        // when data is ready show window
        objectsWindow.once("show", () => {
            objectsWindow.webContents.send('dialogCreated', dialogData);
        });
        // when window is ready send data
        objectsWindow.once("ready-to-show", ()=>{
            objectsWindow.show();
        });

        objectsWindow.setMenu(null);
    } else {
        objectsWindow.focus();
    }
}

// =================================================
// Handle create conditions window
function createConditionswWindow(arg)
{
    // object may be null so no ===
    if (conditionsWindow == void 0 || conditionsWindow.isDestroyed()) {

        conditionsWindow = new BrowserWindow({
            webPreferences:{
                nodeIntegration: true
            },
            width: 640,
            height: 310,
            title: toProperCase(arg.name) + ' condtitions',
            autoHideMenuBar: true,
            parent: editorWindow,
            resizable: false,
            show: false,
        });

        // Open the DevTools.
        if (process.env.NODE_ENV === 'development') {
            conditionsWindow.webContents.openDevTools();
        }

        conditionsWindow.loadURL(url.format({
            pathname: path.join(__dirname, './windows/editorConditionsWindow.html'),
            protocol: "file:",
            slashes: true
        }));
        // Garbage collection handle
        conditionsWindow.on('closed', function(){
            conditionsWindow = null;
            
        });
        // when data is ready show window
        conditionsWindow.once("show", () => {
            conditionsWindow.webContents.send('conditionsData', arg);
        });
        // when window is ready send data
        conditionsWindow.once("ready-to-show", ()=>{
            conditionsWindow.show();
        });
        // no menu
        conditionsWindow.setMenu(null);
    } else {
        conditionsWindow.focus();
    }
}
// lunch the conditions window
ipcMain.on('conditionsData', (event, args) => {
    createConditionswWindow(args);
}); 
// send condition for validation to container
ipcMain.on('conditionsCheck', (event, args) => {
    editorWindow.webContents.send('conditionsCheck', args);
}); 
// send back the response
ipcMain.on('conditionsValid', (event, args) => {
    conditionsWindow.webContents.send('conditionsValid', args);
}); 
// =================================================

// =================================================
// Handle create syntax window
function createEditorSyntaxWindow(args)
{   
    // object may be null so no ===
    if (editorSyntaxWindow == void 0 || editorSyntaxWindow.isDestroyed()) {
        // create window but do not show it - waiting for data
        // https://stackoverflow.com/questions/51789711/how-to-send-data-between-parent-and-child-window-in-electron
        editorSyntaxWindow = new BrowserWindow({
            webPreferences:{
                nodeIntegration: true
            },
            width: 800,
            height: 600,
            title: 'Dialog\'s syntax',
            autoHideMenuBar: true,
            parent: editorWindow,
            resizable: false,
            show: false,
        });

        // Open the DevTools.
        if (process.env.NODE_ENV === 'development') {
            editorSyntaxWindow.webContents.openDevTools();
        }

        editorSyntaxWindow.loadURL(url.format({
            pathname: path.join(__dirname, './windows/editorSyntaxWindow.html'),
            protocol: "file:",
            slashes: true
        }));
        // Garbage collection handle
        editorSyntaxWindow.on('closed', function(){
            editorSyntaxWindow = null;
            
        });
        // when data is ready show window
        editorSyntaxWindow.once("show", () => {
            editorSyntaxWindow.webContents.send('elementsList', args);
        });
        // when window is ready send data
        editorSyntaxWindow.once("ready-to-show", ()=>{
            editorSyntaxWindow.show();
        });
        // no menu
        editorSyntaxWindow.setMenu(null);
    } else {
        editorSyntaxWindow.focus();
    }
}
// lunch the conditions window
ipcMain.on('startSyntaxWindow', (event, args) => {   
    createEditorSyntaxWindow(args);
}); 
// send syntax to container
ipcMain.on('saveDialogSyntax', (event, args) => {   
    editorWindow.webContents.send('saveDialogSyntax', args);
}); 
// send back the response
ipcMain.on('syntaxSaved', (event, args) => {
    editorSyntaxWindow.webContents.send('syntaxSaved', args);
}); 
// =================================================

function saveDataToFile(arg)
{
    // save data to file - first try
    dialog.showSaveDialog(editorWindow, {title: 'Save dialog to file', filters: [{name: 'R GUI', extensions: ['json']}]}, function(filename)
    {
        if (filename) {
            fs.writeFile(filename, arg, function(err){
                if(err) { console.log(err); }
                // console.log('Write Successfully');
            });            
        }         
    });
}

// Handle create about window
function createUserManualWindow()
{
    // object may be null so no ===
    if (userManualWindow == void 0 || userManualWindow.isDestroyed()) {
        userManualWindow = new BrowserWindow({
            with:800,
            height: 600,
            title: 'User manual',
            parent:editorWindow,
            center: true,
        });

        userManualWindow.loadURL(url.format({
            pathname: path.join(__dirname, './windows/userManual/userManualWindow.html'),
            protocol: "file:",
            slashes: true
        }));
        // Garbage collection handle
        userManualWindow.on('closed', function(){
            userManualWindow = null;
        });
        userManualWindow.setMenu(null);
    } else {
        userManualWindow.focus();
    }
}

// Create menu template
const mainMenuTemplate = [
    // { role: 'fileMenu' }
    {
        label: 'File',
        submenu:[
            {
                label: 'New',
                accelerator: "CommandOrControl+N",
                click(){
                    editorWindow.webContents.send('newWindow');
                }
            },
            {
                label: 'Preview',
                accelerator: "CommandOrControl+P",
                click(){
                    editorWindow.webContents.send('previewDialog');
                    ipcMain.once('containerData', (event, arg) => {
                        if(arg != false){
                            createObjectsWindow(arg);
                        }
                    });  
                }
            },
            { type: "separator" },
            {
                label: 'Load dialog',
                accelerator: "CommandOrControl+O",
                click(){
                    dialog.showOpenDialog(editorWindow, {title: "Load dialog data", filters: [{name: 'R-GUI-DialogCreator', extensions: ['json']}], properties: ['openFile']}, result => {
                        if (result !== void 0) {                            
                            fs.readFile(result[0], 'utf-8', (err, data) => {
                                if (err) {
                                    dialog.showMessageBox(editorWindow, {type: 'error', title: 'Could not open the file!', buttons: ['OK']});
                                } else {
                                    editorWindow.webContents.send('openFile', data);
                                }
                            });
                        }
                    });
                }
            },
            {
                label: 'Save dialog',
                accelerator: "CommandOrControl+S",
                click(){
                    editorWindow.webContents.send('previewDialog');
                    ipcMain.once('containerData', (event, arg) => {
                        if(arg != false){
                            saveDataToFile(arg);
                        }
                    });  
                }
            },
        ]
    },
    // { role: 'editMenu' }
    {
        label: 'Edit',
        submenu:[
            { label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", role: "selectAll" }
        ]
    },
    // { role: 'infoMenu' }
    {
        label: 'Info',
        submenu:[
            {
                label: 'About',
                click(){
                    createAboutWindow();
                }
            },
            {
                label: 'User manual',
                click(){
                    createUserManualWindow();
                }
            }
        ]
    },

];

if (process.platform === 'win32') {
    mainMenuTemplate[0].submenu.push({ type: "separator" });
    mainMenuTemplate[0].submenu.push({
        label: 'Quit',
        accelerator: "CommandOrControl+Q",
        click(){
            app.quit();
        }
    });
}
// only electron 5
app.setName('R-GUI-DialogCreator');
if (process.platform === 'darwin') {
    // { role: 'appMenu' }  
    mainMenuTemplate.unshift({
        label: app.getName(),
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      });
}

// Add developer tools item if not in production
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: "Developer Tools",
        submenu: [
            {
                label: "Toggle DevTools",
                accelerator: "CommandOrControl+I",
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();        
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}

// Helpers 
// ========
function toProperCase(str) {
    let first = str[0].toUpperCase();
    let rest = str.substring(1, str.lenght);
    return first + rest;
}
