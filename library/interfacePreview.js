const { ipcRenderer } = require('electron');
const raphaelPaperObjects = require("../library/raphaelPaperObjects");

ipcRenderer.on('dialogCreated', (event, args) => 
{
    raphaelPaperObjects.makeDialog(args);
});

// show syntax / command
raphaelPaperObjects.events.on('commandUpdate', function(data) 
{
    $('#command').append(data);
});