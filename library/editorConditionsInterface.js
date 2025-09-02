const ipcRenderer = window.electron ? window.electron.ipcRenderer : null;

$(document).ready(function(){

    // populate conditions inputs
    if (ipcRenderer) {
        ipcRenderer.on('conditionsData', (event, args) => {
            // Defensive: check if args is defined and has expected properties
            if (args && typeof args === 'object' && 'id' in args && 'name' in args && 'conditions' in args) {
                $('#conditionsId').val(args.id);
                $('#conditionsName').val(args.name);
                $('#conditions').val(args.conditions);
            } else {
                // Fallback: clear fields if data is missing
                $('#conditionsId').val('');
                $('#conditionsName').val('');
                $('#conditions').val('');
            }
        });
    }

    // send condtions for validation and to be saved
    $('#saveConditions').on('click', function(){
        let id = $('#conditionsId').val();
        let name = $('#conditionsName').val();
        let conditions = $('#conditions').val();

        // Defensive: only send if all fields are defined and not empty
        if (id && name && typeof conditions === 'string' && ipcRenderer) {
            ipcRenderer.send('conditionsCheck', {'id': id, 'name': name, 'conditions': conditions});
        } else {
            // Show error if any field is missing
            let message = '<p id="errors"><span>Missing or invalid data. Please check all fields and try again.</span></p>';
            $('#conditions').css('height', '127px');
            $('#conditionsInputs').append(message);
        }
    });

    // close window if conditions are valid and were saved
    if (ipcRenderer) {
        ipcRenderer.on('conditionsValid', (event, args) => {
            // Defensive: check if args is defined and is expected type
            if (args) {
                window.close();
            } else {
                let message = '<p id="errors"><span>The conditions are not valid. Please check and click save again.</span><br/> For more information please consult the documentation</p>';
                $('#conditions').css('height', '127px');
                $('#conditionsInputs').append(message);
            }
        });
    }
});