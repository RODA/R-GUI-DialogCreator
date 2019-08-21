const { ipcRenderer } = require('electron');
const raphaelPaperObjects = require("../library/objects");

ipcRenderer.on('dialogCreated', (event, args) => 
{
    raphaelPaperObjects.makeDialog(args);
});

// show syntax / command
raphaelPaperObjects.events.on('commandUpdate', function(data) 
{
    $('#command').html(data);
});