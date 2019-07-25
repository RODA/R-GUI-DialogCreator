// In renderer process (web page).
const { ipcRenderer } = require('electron');
const { dialog } = require('electron').remote;
// get current window for making dialogs modals
const mainWindow = require('electron').remote.getCurrentWindow();

const raphaelPaper = require("../library/raphaelPaper");

// new window clicked
ipcRenderer.on('newWindow', (event, args) => {
    
    if(raphaelPaper.paperExists === true) {
        let confirm = dialog.showMessageBox(mainWindow, {type: "question", message: "Are you sure?", title: "Create new dialog", buttons: ["No", "Yes"]});
        if(confirm){
            raphaelPaper.remove();
            raphaelPaper.make();
        }
    }else{
        raphaelPaper.make();
    }
    document.getElementById('updateDialogProps').disabled = false;
});

// send data to preview window
ipcRenderer.on('previewDialog', (event, args) => {
    if(raphaelPaper.paperExists === true) {
        let container = raphaelPaper.returnContainer();
        ipcRenderer.send('containerData', container);
    } else {
        dialog.showMessageBox(mainWindow, {type: "info", message: "Please create a new dialog first.", title: "No dialog", buttons: ["OK"]});
        ipcRenderer.send('containerData', false);
    }

});

$(document).ready(function(){

    // draw available elements
    $('#elementsList').html(raphaelPaper.drawAvailableElements());

    // send event to add element to paper
    $('#paperAvailableElements').on('click', function(evt) {
        raphaelPaper.addElementToPaper(event.target.id, 20, 60, 'name2');
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

        let properties = $('#dialogProps [id^="dialog"]');
        
        let obj = {};
        properties.each(function(){
            let el = $(this);
            let key = el.attr('name');
            obj[key] = el.val();
        });  

       raphaelPaper.update(obj);
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
                raphaelPaper.updateElement(obj);
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
        raphaelPaper.updateElement(obj);
    });

    // remove an element
    $("#removeElement").on('click', function(){

        // send element data ID
        raphaelPaper.removeElement($("#elparentId").val());

        clearProps();
    });
    $('#conditions').on('click', function(){
        let name = $('#elname').val();
        let id = $('#elparentId').val();
        ipcRenderer.send('conditionsData', {'name': name, 'id': id});
    });
    // Paper Events ========================================
    // show element properties
    raphaelPaper.paperEvents.on('getEl', function(element) {
        
        // disable all elements and hide everything | reseting props tab
        $('#propertiesList [id^="el"]').prop('disabled', true);
        $('#propertiesList .elprop').hide();

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
    });

    // show dialog props
    raphaelPaper.paperEvents.on('dialogUpdate', function(props) {
        
        let properties = $('#dialogProps [id^="dialog"]');
        
        properties.each(function(){
            let el = $(this);
            let key = el.attr('name');
            el.val(props[key]);
        });        
        
    })

    // new dialog - clear elements prop
    raphaelPaper.paperEvents.on('clearProps', function() {
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
