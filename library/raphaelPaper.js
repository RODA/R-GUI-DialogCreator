/* eslint-disable no-console */
const container = require("./container");
const paperElements = require("./raphaelPaperElements");
const helpers = require('./helpers');
const EventEmitter = require('events');
const { dialog } = require('electron').remote;
// get current window for making dialogs modals
const mainWindow = require('electron').remote.getCurrentWindow();

const raphaelPaperSettings = require('./raphaelPaperSettings');

// class PEvents extends EventEmitter {}

var raphaelPaper = {

    paper: {}, 
    paperExists: false,   
    bgId: '',
    paperEvents: new EventEmitter(),
    settings: raphaelPaperSettings,

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
        let bgRect = this.paper.rect(0, 0, this.settings.dialog.width, this.settings.dialog.height).attr({'fill': '#fdfdfd'});
        // bg id for resize
        this.bgId = bgRect.id;
        // set paper exists
        this.paperExists = true;        
        //add info to container - add availabel props
        container.initialize(this.settings.dialog);
        // emit dialog update
        raphaelPaper.paperEvents.emit('dialogUpdate', this.settings.dialog);
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
                this.bgId = bgRect.id;
                // upSize = true;
            }

            // update container        
            container.updateProperties(props);            
        } else {
            // alert no paper to resize
            dialog.showMessageBox(mainWindow, {type: "info", message: "Please create a new dialog first.", title: "No dialog", buttons: ["OK"]});
        }
    },
    
    // remove a paper / dialog
    remove: function()
    {
        this.paper.remove();
        this.paperExists = false;
        // clear props for any selected element 
        raphaelPaper.paperEvents.emit('clearProps');
    },

    // add new element on paper
    addElementToPaper: function(type) 
    {
        // checking if there is a paper
        if(this.paperExists) {
            
            if(!this.settings.availableElements.includes(type) || (paperElements['add' + type] === void 0)) {
                dialog.showMessageBox(mainWindow, {type: "error", message: "Element type not available. Probably functionality not added.", title: "Error", buttons: ["OK"]});
                return;
            }
            
            let dataSettings = this.settings[type.toLowerCase()];

            // checking for duplicate names | checking for the name propertie if exist should not be necessary as all elements should have it           
            if(dataSettings.hasOwnProperty('name')) {
                dataSettings.name = container.elementNameReturn(dataSettings.name);
            }   

            let element = paperElements['add' + type](this.paper, dataSettings);            
        
            // adn cover, drag and drop and add it to the container
            this.addCoverAndDrag(element, dataSettings, false);

        } else {
            dialog.showMessageBox(mainWindow, {type: "info", message: "Please create a new dialog first.", title: "No dialog", buttons: ["OK"]});
        }
    },

    // update element on paper
    updateElement: function(data)
    {                
        // remove the element first
        this.removeElement(data.parentId);

        // reset/add data elementIts
        data.elementIds = [];
        
        // if element does not have conditions add them
        if(data.conditions == void 0) { data.conditions = ''; }

        // checking if we have all properties
        if( helpers.hasSameProps( this.settings[data.type.toLowerCase()], data )){
            
            // checking for duplicate names - add to HTML constrain only chars and numbers
            if(data.hasOwnProperty('name')) {
                data.name = container.elementNameReturn(data.name);
            }
            
            let newElement = paperElements['add' + data.type](this.paper, data);

            this.addCoverAndDrag(newElement, data, true);

        } else {
            console.log('eroare proprietati');
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
        this.addToContainer(elId, element, data);
        
        // add element cover for drag and drop functionelity
        let bbEl = element.getBBox();
        let cover = this.paper.rect(bbEl.x-5, bbEl.y-5, bbEl.width+10, bbEl.height+10).attr({fill: "#FFF", opacity: 0, cursor: "pointer"}).toFront();
        
        var st = this.paper.set();
        st.push( element, cover );
        
        // set element ID for get data
        st.data('elId', elId);
        
        // element mousedown / clicked? get data from container
        st.mousedown(function() {
            raphaelPaper.paperEvents.emit('getEl', container.getElement(this.data("elId")));                
        });
        
        // make element draggable and update container and refresh
        paperElements.draggable.call(st, raphaelPaper.paperEvents, container);

        // on element update triger interface update
        if(update){            
            raphaelPaper.paperEvents.emit('getEl', container.getElement(elId));     
        }
    }, 

    // add element & data to container
    addToContainer: function(parentID, element,  data)
    {
        data.parentId = parentID;

        if(element.type == 'set') {
            element.forEach( (element) => {
                data.elementIds.push(element.id);
            });
        } else {
            data.elementIds.push(element.id);
        }

        // we are modifying the data object here
        let isDataOK = container.prepareData(data);
        
        // check if we have errors | if true show message
        if(isDataOK.error){
            dialog.showMessageBox(mainWindow, {type: "error", message: isDataOK.message, title: "Error", buttons: ["OK"]});
        }
        
        
        container.elements[parentID] = Object.assign({}, data);        
    }, 

    // return a copy of the container for creating the preview dialog
    returnContainer: function()
    {    
        return JSON.stringify(container);
    },
    
    // ask container to validate an element's conditions
    returnConditionStatus: function(data){
        return container.validateConditions(data);
    },
    // getElementFromContainer
    getElementFromContainer: function(id){
        return container.getElement(id);
    }
};

module.exports = raphaelPaper;
