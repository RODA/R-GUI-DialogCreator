const { ipcRenderer } = require('electron');
const { BrowserWindow } = require('electron').remote;

$(document).ready(function(){
    ipcRenderer.on('elementsList', (event, args) => {        
        $('#syntax').val(args.syntax);

        if(args.elements.length > 0){
            for(let i=0; i<args.elements.length; i++){
                addRow('elementsListTable', args.elements[i]);
            }
        }
    });

    $(document).on('click', '#elementsListTable tbody tr', function(){
        let el = '{' + $(this).attr('id') + '}';
        insertAtPosition('syntax', el);
    });

    $('#saveSyntax').on('click', function()
    {        
        let syntax = $('#syntax').val();
        // send data to container and wait for response
        ipcRenderer.send('saveDialogSyntax', syntax);
    });
    ipcRenderer.on('syntaxSaved', (event, args) => {
        console.log(args);
        
        if(args) {
            let window = BrowserWindow.getFocusedWindow();
            window.close();
        } else {
            $('#errors').show();
        }
    });
});

// add element to the table
function addRow(tableID, data) {
    // Get a reference to the table
    let tableRef = document.getElementById(tableID).getElementsByTagName('tbody')[0];

    // Insert a row at the end of the table
    let newRow = tableRef.insertRow(-1);

    // set an ID
    newRow.id = data.name;
    
    // Insert a cell in the row at index 0
    let newCell1 = newRow.insertCell(0);
    let newCell2 = newRow.insertCell(1);

    // Append a text node to the cell
    let newText1 = document.createTextNode(data.name);
    let newText2 = document.createTextNode(data.type);
    newCell1.appendChild(newText1);
    newCell2.appendChild(newText2);
}
// insert element at the position
// https://stackoverflow.com/questions/1064089/inserting-a-text-where-cursor-is-using-javascript-jquery
function insertAtPosition(areaId, text) {
    var txtarea = document.getElementById(areaId);
    if (!txtarea) {
        return;
    }

    var scrollPos = txtarea.scrollTop;
    var strPos = 0;
    strPos = txtarea.selectionStart;

    var front = (txtarea.value).substring(0, strPos);
    var back = (txtarea.value).substring(strPos, txtarea.value.length);
    txtarea.value = front + text + back;
    strPos = strPos + text.length;

    txtarea.scrollTop = scrollPos;
}
