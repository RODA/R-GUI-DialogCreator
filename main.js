const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');

const {app, BrowserWindow, Menu} = electron;
const { ipcMain } = require('electron');
// for messages
const { dialog } = require('electron');

let mainWindow;
let aboutWindow;
let previewWindow;

// Listen for app to be ready
app.on('ready', function()
{    
    // Create new window
    mainWindow = new BrowserWindow({
        webPreferences:{
            nodeIntegration: true
        },
        minWidth: 1200,
        minHeight: 800,
        // center: true
    });
    // load html into the window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, './windows/mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // maximize
    // mainWindow.maximize();

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    //Quit app when closed
    mainWindow.on('closed', function(){
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
    aboutWindow = new BrowserWindow({
        with:600,
        height: 400,
        title: 'About R GUI',
        parent:mainWindow,
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
}

// Handle create preview window
function createPreviewWindow(arg)
{
    let dialogData = JSON.parse(arg);

    // create window but do not show it - waiting for data
    // https://stackoverflow.com/questions/51789711/how-to-send-data-between-parent-and-child-window-in-electron
    previewWindow = new BrowserWindow({
        webPreferences:{
            nodeIntegration: true
        },

        // added extra space for title bar and scrollbars
        width: parseInt(dialogData.properties.width) + 40,
        height: parseInt(dialogData.properties.height) + 45,
        title: dialogData.properties.title,
        autoHideMenuBar: true,
        parent: mainWindow,
        resizable: false,
        show: false,
        // modal: true
    });

    // Open the DevTools.
    previewWindow.webContents.openDevTools();

    previewWindow.loadURL(url.format({
        pathname: path.join(__dirname, './windows/previewWindow.html'),
        protocol: "file:",
        slashes: true
    }));
    // Garbage collection handle
    previewWindow.on('closed', function(){
        previewWindow = null;
        
    });
    // when data is ready show window
    previewWindow.once("show", () => {
        previewWindow.webContents.send('dialogCreated', dialogData);
    });
    // when window is ready send data
    previewWindow.once("ready-to-show", ()=>{
        previewWindow.show();
    });

    previewWindow.setMenu(null);
}
// Handle create conditions window
function createConditionswWindow(arg)
{   
    // create window but do not show it - waiting for data
    // https://stackoverflow.com/questions/51789711/how-to-send-data-between-parent-and-child-window-in-electron
    conditionsWindow = new BrowserWindow({
        webPreferences:{
            nodeIntegration: true
        },
        width: 640,
        height: 380,
        title: arg.name+' condtitions',
        autoHideMenuBar: true,
        parent: mainWindow,
        resizable: false,
        show: false,
    });

    // Open the DevTools.
    conditionsWindow.webContents.openDevTools();

    conditionsWindow.loadURL(url.format({
        pathname: path.join(__dirname, './windows/conditionsWindow.html'),
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
}
// lunch the conditions window
ipcMain.on('conditionsData', (event, args) => {
    createConditionswWindow(args);
}); 
// send condition for validation to container
ipcMain.on('conditionsCheck', (event, args) => {
    mainWindow.webContents.send('conditionsCheck', args);
}); 
// send back the response
ipcMain.on('conditionsValid', (event, args) => {
    conditionsWindow.webContents.send('conditionsValid', args);
}); 


function saveDataToFile(arg)
{
    // save data to file - first try
    dialog.showSaveDialog(mainWindow, {title: 'Save dialog to file', filters: [{name: 'R GUI', extensions: ['dat']}]}, function(filename)
    {    
        fs.writeFile(filename + '.dat', arg, function(err){
            if(err) { console.log(err); }
            
            console.log('Write Successfully');
        });                     
    });
}

// Create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu:[
            {
                label: 'New',
                accelerator: "CommandOrControl+N",
                click(){
                    mainWindow.webContents.send('newWindow');
                }
            },
            {
                label: 'Preview',
                accelerator: "CommandOrControl+P",
                click(){
                    mainWindow.webContents.send('previewDialog');
                    ipcMain.once('containerData', (event, arg) => {
                        if(arg != false){
                            createPreviewWindow(arg);
                        }
                    });  
                }
            },
            {
                label: 'Load',
                accelerator: "CommandOrControl+O",
                click(){
                    dialog.showMessageBox(mainWindow, {type: "info", message: "Comming soon...", title: "WIP", buttons: ["OK"]});
                }
            },
            {
                label: 'Save',
                accelerator: "CommandOrControl+S",
                click(){
                    mainWindow.webContents.send('previewDialog');
                    ipcMain.once('containerData', (event, arg) => {
                        if(arg != false){
                            saveDataToFile(arg);
                        }
                    });  
                }
            },
            {
                label: 'Exit',
                accelerator: "CommandOrControl+Q",
                click(){
                    app.quit();
                }
            }
        ]
    },
    {
        label: 'Info',
        submenu:[
            {
                label: 'About',
                click(){
                    createAboutWindow();
                }
            }
        ]
    }
];

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