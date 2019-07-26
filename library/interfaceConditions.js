const { ipcRenderer } = require('electron');
const { BrowserWindow } = require('electron').remote;

$(document).ready(function(){
    ipcRenderer.on('conditionsData', (event, args) => {
        $('#conditionsId').val(args.id);
        $('#conditionsName').val(args.name);
        $('#conditions').val(args.conditions);
    });

    $('#saveConditions').on('click', function(){
        let id = $('#conditionsId').val();
        let name = $('#conditionsName').val();
        let conditions = $('#conditions').val();
    
        // send data to container and wait for response
        ipcRenderer.send('conditionsCheck', {'id': id, 'name': name, 'conditions': conditions});
    });
    ipcRenderer.on('conditionsValid', (event, args) => {
        if(args) {
            let window = BrowserWindow.getFocusedWindow();
            window.close();
        } else {
            $('#errors').show();
        }
    });
});