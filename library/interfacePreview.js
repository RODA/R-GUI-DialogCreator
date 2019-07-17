const { ipcRenderer } = require('electron');
const raphaelPaperObjects = require("../library/raphaelPaperObjects");

ipcRenderer.on('dialogCreated', (event, args) => {

    raphaelPaperObjects.makeDialog(args);
    
});

