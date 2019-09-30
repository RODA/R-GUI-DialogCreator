// In renderer process (web page).
const { ipcRenderer } = require('electron');
const { dialog } = require('electron').remote;
// get current window for making dialogs modals
const mainWindow = require('electron').remote.getCurrentWindow();
const editor = require("../library/editor");

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
    document.getElementById('updateDialogProps').disabled = false;
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
    document.getElementById('updateDialogProps').disabled = false;
    document.getElementById('dlgSyntax').disabled = false;
});

$(document).ready(function(){

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
    $('#updateDialogProps').on('click', function() {

        let properties = $('#dlgProps [id^="dialog"]');
        
        let obj = {};
        properties.each(function(){
            let el = $(this);
            let key = el.attr('name');
            obj[key] = el.val();
        });                  
        console.log(properties);
        
       editor.update(obj);
    });
    // add dialog syntax
    $('#dlgSyntax').on('click', function() {
        ipcRenderer.send('startSyntaxWindow', editor.getDialogSyntax());
    });

    // update element on press enter
    $(document).on('keypress',function(e) {
        if(e.which == 13) {
            let aaa = $('#updateElProps').prop('disabled');
            if(! aaa ) {
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
                // send obj for update
                editor.updateElement(obj);
            }
        }
    });
    // update an element
    $('#updateElProps').on('click', function(){
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
        // send obj for update
        editor.updateElement(obj);
    });

    // remove an element
    $("#removeElement").on('click', function(){

        // send element data ID
        editor.removeElement($("#elparentId").val());

        clearProps();
    });

    // adding / removing an elements conditions
    $('#conditions').on('click', function(){
        let id = $('#elparentId').val();
        let element = editor.getElementFromContainer(id);
        ipcRenderer.send('conditionsData', {'id': id, 'name': element.name, 'conditions': element.conditions});
    });
    
    // hide parent container
    $('#eldataSource').on("change", () => {
        if ($('#elobjViewClass option:selected').val() == 'variable') {
            $('#parentContainer').show();
        }else {
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
    });

    // Paper Events ========================================
    // show element properties
    editor.editorEvents.on('getEl', function(element) {
        
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
        $('#updateElProps').prop('disabled', false);
        $("#removeElement").prop('disabled', false);
        // trigger change for container
        $("#elobjViewClass" ).trigger("change");
        
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
        $('#updateElProps').prop('disabled', true);
        $("#removeElement").prop('disabled', true);
    }
});
