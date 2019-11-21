const { ipcRenderer } = require('electron');
const { BrowserWindow } = require('electron').remote;

$(document).ready(function(){
    ipcRenderer.on('elementsList', (event, args) => {        
        
        //console.log(args);
        
        $('#syntax').val(args.syntax.command);        

        if(args.elements.length > 0){
            for(let i=0; i<args.elements.length; i++){
                addRow('elementsListTable', args.elements[i]);
            }
        }

        // if we have default elements
        for(let keyEl in args.syntax.defaultElements) {
            let e = document.getElementById('defaultInput_' + keyEl);
            if(e !== null){
                e.value = args.syntax.defaultElements[keyEl];
            }
        }

    });

    $(document).on('click', '#elementsListTable tbody tr td:first-child', function(){
        let el = '{' + $(this).attr('id') + '}';
        insertAtPosition('syntax', el);
    });

    $('#saveSyntax').on('click', function()
    {        
        let syntax = $('#syntax').val();

        let elements = $('[id^="defaultInput_"]');
        let isDefault = {};
        $.each( elements, function(index, element){
            if(element.value !== '') {
                isDefault[$(element).attr('name')] = element.value;
            }
        });

        // send data to container and wait for response
        ipcRenderer.send('saveDialogSyntax', {command: syntax, defaultElements: isDefault});
    });
    // if syntax saved close window
    ipcRenderer.on('syntaxSaved', (event, args) => {
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

    let defaultInput;
    // default value
    if (data.type == 'Checkbox') {
       defaultInput = createSelect(data.name, ['checked', 'unchecked']);  
    } else if(data.type == 'RadioGroup') {
        defaultInput = createSelect(data.name, data.values);  
    }
    else {
        // create default
        defaultInput = document.createElement('input');
        defaultInput.setAttribute('id', 'defaultInput_'+ data.name);
        defaultInput.setAttribute('type', 'text');
        defaultInput.setAttribute('name', data.name);
    }
    //console.log(data);
    
    newCell3.appendChild(defaultInput);
}

function createSelect(name, options){
    
    select = document.createElement('select');    
    select.setAttribute('id', 'defaultInput_'+ name);
    select.setAttribute('name', name);
    
    for(let i = 0; i < options.length; i++) {
        let option = document.createElement("option");

        let val = options[i];
        if(options[i] == 'checked'){
            val = 'TRUE';
        }
        if(options[i] == 'unchecked'){
            val = 'FALSE';
        }
        
        option.value = val;
        option.text = options[i];
        select.appendChild(option);
    }
    return select;
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
