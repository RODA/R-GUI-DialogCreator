const { ipcRenderer } = require('electron');
const objects = require("../library/objects");

ipcRenderer.on('dialogCreated', (event, args) => 
{
    objects.makeDialog(args);
});

// show syntax / command
objects.events.on('commandUpdate', function(data) 
{
    $('#command').html(data);
});

// multiple select for container
document.addEventListener("keydown", event => {
    if (event.key === 'Shift') {
        objects.keyPressedEvent(event.key, true);
    }
});
document.addEventListener("keyup", event => {
    if (event.key === 'Shift') {
        objects.keyPressedEvent(event.key, false);
    }
});