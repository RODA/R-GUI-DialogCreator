const { ipcRenderer } = require('electron');
const { BrowserWindow } = require('electron').remote;

$(document).ready(function(){
    ipcRenderer.on('elementsList', (event, args) => {        
        
        console.log(args);
        
        $('#syntax').val(args.syntax.command);        

        if(args.elements.length > 0){
            for(let i=0; i<args.elements.length; i++){
                addRow('elementsListTable', args.elements[i]);
            }
        }

        // if we have default elements
        if(args.syntax.defaultElements.length > 0) { 
            args.syntax.defaultElements.forEach(element => {
                let e = document.getElementById('cb_'+element);
                if(e !== null){
                    e.checked = true;
                    console.log('m');
                }
                console.log(e);
                
            });
        }

    });

    $(document).on('click', '#elementsListTable tbody tr td:first-child', function(){
        let el = '{' + $(this).attr('id') + '}';
        insertAtPosition('syntax', el);
    });

    $('#saveSyntax').on('click', function()
    {        
        let syntax = $('#syntax').val();

        let elements = $('input[id^="cb_"]:checked');
        let isDefault = [];
        $.each( elements, function(index, element){
            isDefault.push($(element).attr('name'));
        });

        // send data to container and wait for response
        ipcRenderer.send('saveDialogSyntax', {command: syntax, elements: isDefault});
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
   
    // Insert a cell in the row at index 0
    let newCell1 = newRow.insertCell(0);
    let newCell2 = newRow.insertCell(1);
    let newCell3 = newRow.insertCell(2);

    // Append a text node to the cell
    let newText1 = document.createTextNode(data.name);
    newCell1.appendChild(newText1);
    newCell1.id = data.name;

    let newText2 = document.createTextNode(data.type);
    newCell2.appendChild(newText2);

    // create the is defaul checkbox
    let cb = document.createElement('input');
    cb.setAttribute('id', 'cb_'+ data.name);
    cb.setAttribute('type', 'checkbox');
    cb.setAttribute('name', data.name);
    newCell3.appendChild(cb);
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
