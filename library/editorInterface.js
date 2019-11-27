// In renderer process (web page).
const { ipcRenderer } = require('electron');
const { dialog } = require('electron').remote;
// get current window for making dialogs modals
const mainWindow = require('electron').remote.getCurrentWindow();
const editor = require("../library/editor");

// helpers for when enter key is pressed
let elementSelected = false;
let enterPressed = false;
let mouseDown = false;

// new window clicked
ipcRenderer.on('newWindow', (event, args) => {
    if(editor.paperExists === true) {
        let confirm = dialog.showMessageBox(mainWindow, {type: "question", message: "Are you sure?", title: "Create new dialog", buttons: ["No", "Yes"]});
        if(confirm){
            editor.remove();
            editor.make();
        }
    }else{
        editor.make();
    }
    document.getElementById('dlgSyntax').disabled = false;
});

// send data to preview window
ipcRenderer.on('previewDialog', (event, args) => {
    if(editor.paperExists === true) {
        let container = editor.returnContainer();
        ipcRenderer.send('containerData', container);
    } else {
        dialog.showMessageBox(mainWindow, {type: "info", message: "Please create a new dialog first.", title: "No dialog", buttons: ["OK"]});
        ipcRenderer.send('containerData', false);
    }
});

// verify element's conditions and respond
ipcRenderer.on('conditionsCheck', (event, args) => {
    let valid = editor.getConditionStatus(args);
    ipcRenderer.send('conditionsValid', valid);
});

// save syntax data
ipcRenderer.on('saveDialogSyntax', (event, args) => {    
    let valid = editor.saveDialogSyntax(args);
    ipcRenderer.send('syntaxSaved', valid);
});

// load previous saved data
ipcRenderer.on('openFile', (event, args) => {
    editor.loadDialogDataFromFile(args);        
    document.getElementById('dlgSyntax').disabled = false;
});

ipcRenderer.on('deselectedElements', (ev, args) => {    
    if (!mouseDown) {
        clearProps();
    }
    elementSelected = false;
});


$(document).ready(function() {

    document.addEventListener('mousedown', () => {
        mouseDown = true;
    });
    document.addEventListener('mouseup', () => {
        mouseDown = false;
    });
    // draw available elements
    $('#elementsList').append(editor.drawAvailableElements());

    // send event to add element to paper
    $('#paperAvailableElements').on('click', function(evt) {
        editor.addElementToPaper(event.target.id, null);
    });

    // Elements name (id) only leters and numbers and max 15 chars
    $('#elname').on("change paste keyup", function() {
        let newVal = $(this).val().replace(/[^a-z0-9]/g,'');
        newVal = (newVal.length < 15) ? newVal : newVal.slice(0, 15);  
        $(this).val(newVal);
     });
    // this.val.regex(/^[a-z0-9]+$/);
    
    // update dialog properties
    var propertyAddEvent = document.querySelectorAll('#dlgProps [id^="dialog"]');
    for(let i = 0; i < propertyAddEvent.length; i++) {
        propertyAddEvent[i].addEventListener('keyup', (ev) => {
            if(ev.which == 13) {
                let properties = $('#dlgProps [id^="dialog"]');
        
                let obj = {};
                properties.each(function(){
                    let el = $(this);
                    let key = el.attr('name');
                    obj[key] = el.val();
                });                          
               editor.update(obj);
            }
        });
        // save on blur
        propertyAddEvent[i].addEventListener('blur', (ev) => {
            let properties = $('#dlgProps [id^="dialog"]');
        
            let obj = {};
            properties.each(function(){
                let el = $(this);
                let key = el.attr('name');
                obj[key] = el.val();
            });                          
           editor.update(obj);
        });
    }

    // add dialog syntax
    $('#dlgSyntax').on('click', function() {
        ipcRenderer.send('startSyntaxWindow', editor.getDialogSyntax());
    });

    // update an element
    var elementsAddEvent = document.querySelectorAll('#propertiesList [id^="el"]');
    for(let i = 0; i < elementsAddEvent.length; i++) {
        // save on enter only if element type not select
        saveCapabilities(elementsAddEvent[i]);        
    }
    
    // update element on press enter
    $(document).on('keyup', function(ev) {
        // remove the element on delete or backspace key
        if(ev.which == 46 || ev.which == 8) {
            if (elementSelected) 
            {
                if (document.activeElement.tagName === 'BODY'){
                    removeElement();
                }
            }
        }
    });

    // remove an element
    $("#removeElement").on('click', function(){
        removeElement();
    });

    // adding / removing an elements conditions
    $('#conditions').on('click', function(){
        let id = $('#elparentId').val();
        let element = editor.getElementFromContainer(id);
        ipcRenderer.send('conditionsData', {'id': id, 'name': element.name, 'conditions': element.conditions});
    });
    
    // hide parent container and variable type
    $('#elobjViewClass').on('change', function() {        
        if ($(this).val() == 'variable') {
            $('#parentContainer').show();
            $('#selectVariableType').show();
        } else {
            $('#selectVariableType').hide();
            $('#parentContainer').hide();
        }
    });
    // hide parent container
    $('#eldataSource').on("change", () => {
        let val = '';
        if ($('#eldataSource option:selected').val() == 'custom') {
            val = '<label for="eldataValue">Values</label> ';
            val += '<input type="text" name="eldataValue" id="eldataValue" />';
        }else {
            val = '<label for="eldataValue">Values</label> ';
            val += '<select name="eldataValue" id="eldataValue">';
            val += '<option value="all">All</option>';
            val += '<option value="dataframe">Data Frames</option>';
            val += '<option value="list">Lists</option>';
            val += '<option value="matrix">Matrices</option>';
            val += '<option value="vector">Vectors</option></select>';
        }
        $('#selectSourceChange').html(val);
        // add save capabilities
        saveCapabilities(document.getElementById('eldataValue'));
    });

    // Paper Events ========================================
    // show element properties
    editor.editorEvents.on('getEl', function(element) 
    {       
        elementSelected = true;
        
        // disable all elements and hide everything | reseting props tab
        $('#propertiesList [id^="el"]').prop('disabled', true);
        $('#propertiesList .elprop').hide();
        
        // trigger change for the select element source values
        if(element.dataSource !== void 0) {
            $("#eldataSource" ).trigger("change");
        }

        // update props tab
        for( let key in element){
            if($('#el' + key).length > 0){
                
                // show main element
                $('#propertiesList').show();

                $('#el' + key).val(element[key]);
                $('#el' + key).prop('disabled', false);
                $('#el' + key).parent().show();
            }
        }
        // disable update and remove button | force reselection
        $("#removeElement").prop('disabled', false);
        
        if(element.type === 'Container') {
            // trigger change for container
            $("#elobjViewClass" ).trigger("change");
        }
        
    });

    // show dialog props
    editor.editorEvents.on('dialogUpdate', function(props) {
        
        let properties = $('#dlgProps [id^="dialog"]');
        
        properties.each(function(){
            let el = $(this);
            let key = el.attr('name');
            el.val(props[key]);
        });        
        
    });

    // new dialog - clear elements prop
    editor.editorEvents.on('clearProps', function() {
        clearProps();
    });

    function removeElement(){
        // send element data ID
        editor.removeElement($("#elparentId").val());
        clearProps();
    }

});

// clear element props
function clearProps()
{
    // clear data form
    let properties = $('#propertiesList [id^="el"]');

    properties.each(function(){
        $(this).val('');
    });

    // hide props list
    $('#propertiesList').hide();
    $('#propertiesList .elprop').hide();

    // disable buttons
    $("#removeElement").prop('disabled', true);
}

// add save capabilities to an element
function saveCapabilities(element)
{
    if (element.tagName !== "SELECT"){
        element.addEventListener('keyup', (ev) => {
            if(ev.which == 13) {
                if (elementSelected) 
                {
                    enterPressed = true;
                    // get all proprerties
                    let properties = $('#propertiesList [id^="el"]');
                    // save all properties to obj
                    let obj = {};
                    properties.each(function(){
                        let el = $(this);
                        if(!el.prop('disabled')){
                            let key = el.attr('name').substr(2);
                            obj[key] = el.val();
                        }
                    });                
                    if(editor.paperExists === true) {
                        // send obj for update
                        editor.updateElement(obj);
                    }
                }
            }
        });
    }
    // save on blur
    element.addEventListener('blur', (ev) => {
        if (!enterPressed) {            
            // get all proprerties
            let properties = $('#propertiesList [id^="el"]');
            // save all properties to obj
            let obj = {};
            properties.each(function(){
                let el = $(this);
                if(!el.prop('disabled')){
                    let key = el.attr('name').substr(2);
                    obj[key] = el.val();
                }
            });       
            if(editor.paperExists === true && obj.type !== void 0) {
                // send obj for update
                editor.updateElement(obj);
            }
        } else {
            enterPressed = false;
        }
    });
}