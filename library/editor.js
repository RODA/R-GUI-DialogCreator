/* eslint-disable no-console */
const EventEmitter = require('events');
const { dialog } = require('electron').remote;
// get current window for making dialogs modals
const editorWindow = require('electron').remote.getCurrentWindow();

const defaultSettings = require('./defaultSettings');
const elements = require("./editorElements");
const container = require("./container");
const helpers = require('./helpers');

var editor = {

    paper: {}, 
    paperExists: false,   
    bgId: '',
    editorEvents: new EventEmitter(),
    settings: defaultSettings,
    elementList: [],

    // create available element list
    drawAvailableElements: function()
    {
        let ul = document.createElement('ul');
        ul.setAttribute('id', 'paperAvailableElements');
        for(let i = 0; i < this.settings.availableElements.length; i++)
        {
            let li = document.createElement('li');
            li.setAttribute('id', this.settings.availableElements[i]);
            li.innerHTML = this.settings.availableElements[i];
            ul.appendChild(li);
        }
        return ul;  
    },

    // create new paper | default properties
    make: function() 
    {
        this.paper = Raphael('paper', this.settings.dialog.width, this.settings.dialog.height);
        let bgRect = this.paper.rect(1, 1, this.settings.dialog.width - 1, this.settings.dialog.height - 1).attr({'fill': '#FFFFFF'});
        // on paper click deselect all
        bgRect.click(editor.deselectAll);
        // bg id for resize
        this.bgId = bgRect.id;
        // set paper exists
        this.paperExists = true;        
        // set font size and family
        elements.setDefaultFont(this.settings.fontSize, this.settings.fontFamily);
        //add info to container - add availabel props
        container.initialize(this.settings.dialog);
        // emit dialog update
        editor.editorEvents.emit('dialogUpdate', this.settings.dialog);
    },
    // create paper with data from file
    makeFromFile: function(loadData)
    {
        this.paper = Raphael('paper', loadData.properties.width, loadData.properties.height);
        let bgRect = this.paper.rect(1, 1, loadData.properties.width - 1, loadData.properties.height - 1).attr({'fill': '#fdfdfd'});
        // on paper click deselect all
        bgRect.click(editor.deselectAll);
        // bg id for resize
        this.bgId = bgRect.id;
        // set paper exists
        this.paperExists = true;        
        // set font size and family
        elements.setDefaultFont(this.settings.fontSize, this.settings.fontFamily);
        //add info to container - add availabel props
        container.initialize(loadData.properties);
        // emit dialog update
        editor.editorEvents.emit('dialogUpdate', loadData.properties);

        for(let element in loadData.elements){
            // console.log(loadData.elements[element]);
            let data = loadData.elements[element]; 
            this.addElementToPaper(data.type, data);
        }

        this.saveDialogSyntax(loadData.syntax);
    },

    // update paper
    update: function(props) 
    {
        // check for valid paper
        if(this.paper.setSize) {
        
            // let upSize = false;
            if(props.width != container.properties.width || props.height != container.properties.height) {
            
                this.paper.setSize(props.width, props.height);
                // remove previous bg and create a new one
                this.paper.getById(this.bgId).remove();
                let bgRect = this.paper.rect(0, 0, props.width, props.height).attr({'fill': '#fdfdfd'}).toBack();
                bgRect.click(editor.deselectAll);
                this.bgId = bgRect.id;
                // upSize = true;                
            }

            // update container        
            container.updateProperties(props);            
        } else {
            // alert no paper to resize
            dialog.showMessageBox(editorWindow, {type: "info", message: "Please create a new dialog first.", title: "No dialog", buttons: ["OK"]});
        }
    },
    
    // remove a paper / dialog
    remove: function()
    {
        this.paper.remove();
        this.paperExists = false;
        // clear props for any selected element 
        editor.editorEvents.emit('clearProps');
    },

    // load data from file - uses makeFromFile
    // check for valid files
    loadDialogDataFromFile: function(data)
    {
        try {
            let loadData = JSON.parse(data);
            if(loadData.properties !== void 0 && loadData.elements !== void 0 && loadData.syntax !== void 0) {
        
                // check for valid paper
                if(this.paper.setSize) {
                    // alert paper override
                    dialog.showMessageBox(editorWindow, {type: "question", message: "Override curent dialog?", title: "Override", buttons: ["No", "Yes"]}, (response) => {
                        if (response) {
                            editor.remove();
                            this.makeFromFile(loadData);
                        } else {
                            return;
                        }
                    });
                } else {
                    this.makeFromFile(loadData);
                }
            } else {
                dialog.showMessageBox(editorWindow, {type: "error", message: "The provided file is not valid.", title: "Invalid file", buttons: ["OK"]});
            }
        }
        catch(error) {
            dialog.showMessageBox(editorWindow, {type: "error", message: "Error opening file.", title: "Error", buttons: ["OK"]});
        }
    },

    // add new element on paper
    addElementToPaper: function(type, withData) 
    {
        // checking if there is a paper
        if(this.paperExists) {
            
            if(!this.settings.availableElements.includes(type) || (elements['add' + type] === void 0)) {
                dialog.showMessageBox(editorWindow, {type: "error", message: "Element type not available. Probably functionality not added.", title: "Error", buttons: ["OK"]});
                return;
            }
            
            let dataSettings;

            if (withData !== null) {
                dataSettings = withData;
            } else {
                dataSettings = this.settings[type.toLowerCase()];
            }

            // checking for duplicate names | checking for the name propertie if exist should not be necessary as all elements should have it           
            if(dataSettings.hasOwnProperty('name')) {
                dataSettings.name = container.elementNameReturn(dataSettings.name);
            }   

            // check for wrong values
            dataSettings = container.cleanValues(dataSettings);

            let element = elements['add' + type](this.paper, dataSettings);            
        
            // adn cover, drag and drop and add it to the container
            this.addCoverAndDrag(element, dataSettings, false);

        } else {
            dialog.showMessageBox(editorWindow, {type: "info", message: "Please create a new dialog first.", title: "No dialog", buttons: ["OK"]});
        }
    },

    // update element on paper
    updateElement: function(data)
    {                
        console.log(data);
        
        // we need the old conditions if exists
        let oldEl = container.getElement(data.parentId);
        let oldConditions = (oldEl !== void 0) ? oldEl.conditions : '';
        
        // remove the element first
        this.removeElement(data.parentId);

        // reset/add data elementIts
        data.elementIds = [];
        
        // if element does not have conditions add them
        if(data.conditions == void 0) { data.conditions = ''; }
        if(oldConditions !== ''){ data.conditions = oldConditions; }

        // checking if we have all properties
        if( data.type !== void 0 && helpers.hasSameProps( this.settings[data.type.toLowerCase()], data )){
            
            // checking for duplicate names - add to HTML constrain only chars and numbers
            if(data.hasOwnProperty('name')) {
                data.name = container.elementNameReturn(data.name);
            }
            
            // check for wrong values
           data = container.cleanValues(data);
            
            let newElement = elements['add' + data.type](this.paper, data);

            this.addCoverAndDrag(newElement, data, true);

        } else {
            console.log('Properies error!');
        }
    },

    // remove element form paper and container
    removeElement: function(elId)
    {   
        let rmSet = this.paper.set();

        // get elements to remove
        this.paper.forEach(function(element)
        {            
            if(element.data('elId') == elId){
                rmSet.push(element);
            }            
        });
        // remove old elements
        rmSet.remove();
        
        // remove from container
        container.removeElement(elId);
    },

    // add drag and drop functioanlity and update container
    addCoverAndDrag: function(element, data, update)
    {              
        // add element to container
        // make unique ID
        let elId = helpers.makeid();
        
        // add to container
       let containerResp = container.addElement(elId, element, data);

        // check if we have errors | if true show message
        if(containerResp.error){
            dialog.showMessageBox(editorWindow, {type: "error", message: containerResp.message, title: "Error", buttons: ["OK"]});
        }
        
        // add element cover for drag and drop functionelity
        let bbEl = element.getBBox();
        let cover = this.paper.rect(bbEl.x-5, bbEl.y-5, Math.ceil(bbEl.width+10), Math.ceil(bbEl.height+10)).attr({fill: "#fdfdfd", 'fill-opacity': 0, 'stroke-width': 0, cursor: "pointer"}).toFront();
        
        var st = this.paper.set();
        st.push( element, cover );
        
        // set element ID for get data
        st.data('elId', elId);
        
        // add to the main list 
        editor.elementList.push(st);

        // element mousedown / clicked? get data from container
        st.mousedown(function() {                       
            editor.deselectAll();                      
            st.items[st.items.length - 1].attr({'stroke': '#4D90FE', 'stroke-width': 0.5, 'stroke-opacity': 1, 'stroke-dasharray': ["--"]});
            editor.editorEvents.emit('getEl', container.getElement(this.data("elId")));       
        });
    
        // make element draggable and update container and refresh
        elements.draggable.call(st, editor.editorEvents, container);

        // on element update triger interface update
        if(update){            
            st.items[st.items.length - 1].attr({'stroke': '#4D90FE', 'stroke-width': 0.5, 'stroke-opacity': 1, 'stroke-dasharray': ["--"]});
            editor.editorEvents.emit('getEl', container.getElement(elId));   
            editor.currentSelectedElement = data.name;  
        }
    }, 

    // deselect all paper elements
    deselectAll: function()
    {
        for( let i = 0; i < editor.elementList.length; i++){
            // last element in the set should be the cover
            editor.elementList[i].items[editor.elementList[i].items.length - 1].attr({'stroke-width': 0, 'stroke-opacity': 0});
        }
        editorWindow.webContents.send('deselectedElements');
    },

    // ======================================================
    // return a copy of the container for creating the preview dialog
    returnContainer: function(){    
        return JSON.stringify(container);
    },
    
    // ask container to validate an element's conditions
    getConditionStatus: function(data){
        return container.validateConditions(data);
    },
    // getElementFromContainer
    getElementFromContainer: function(id){
        return container.getElement(id);
    },

    // ======================================================
    // get elements for dialog syntax
    getDialogSyntax: function(){
        return container.dataForSyntax();
    },
    // save the dialog syntax
    saveDialogSyntax: function(data){        
        return container.saveSyntax(data);
    },
};

module.exports = editor;
