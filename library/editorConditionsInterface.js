const { ipcRenderer } = require('electron');
const { BrowserWindow } = require('electron').remote;

$(document).ready(function(){

    // populate conditions inputs
    ipcRenderer.on('conditionsData', (event, args) => {
        $('#conditionsId').val(args.id);
        $('#conditionsName').val(args.name);
        $('#conditions').val(args.conditions);
    });

    // send condtions for validation and to be saved
    $('#saveConditions').on('click', function(){
        let id = $('#conditionsId').val();
        let name = $('#conditionsName').val();
        let conditions = $('#conditions').val();
    
        // send data to container and wait for response
        ipcRenderer.send('conditionsCheck', {'id': id, 'name': name, 'conditions': conditions});
    });

    // close window if conditions are valid and were saved
    ipcRenderer.on('conditionsValid', (event, args) => {
        if(args) {
            let window = BrowserWindow.getFocusedWindow();
            window.close();
        } else {
            let message = '<p id="errors"><span>The conditions are not valid. Please check and click save again.</span><br/> For more information please consult the documentation</p>';
            $('#conditions').css('height', '127px');
            $('#conditionsInputs').append(message);
        }
    });
});