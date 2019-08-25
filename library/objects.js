/* eslint-disable no-console */
// numer of max elements (events) - to decide on it
//TODO -- ADD slider element - intre 0 si 1
require('events').EventEmitter.prototype._maxListeners = 35;
const EventEmitter = require('events');

const raphaelPaperSettings = require('./defaultSettings');
const helpers = require("./helpers");
const objectsHelpers = require("./objectsHelpers");
const conditions = require('./conditions');


const mockup = require('./objectsMockup');

var objects = {
    
    // defaults 
    fontFamily: 'Open Sans',
    fontSize: '13px',
    // the main paper
    paper: {},
    // list of all created objects
    objList: {},
    // helper for radiogroups
    radios: {},
    // main event thread
    events: new EventEmitter(),
    // command
    command: '',
    
    // create the main window & Raphael paper
    makeDialog: function(container) 
    {       
        if (((container.properties === void 0) == false) && helpers.hasSameProps(raphaelPaperSettings.dialog, container.properties)) {
            
            let props = container.properties;
            // create a new raphael paper
            this.paper = Raphael('paper', props.width, props.height);
            this.paper.rect(0, 0, props.width, props.height).attr({'fill': '#fdfdfd'});
        }

        // check if we have the Raphael paper and if we have elements to display
        if (this.paper.setSize && container.elements) {
            for (let key in container.elements) {
                this.makeObject(container.elements[key]);
            }
        }
        
        //TODO - make syntax work
        // console.log(container.syntax);
        
        if(container.syntax !== void 0 && container.syntax.command != '') {
            this.makeCommand(container.syntax);
        }
        objects.events.on('iSpeak', function(data)
        {
            if(container.syntax !== void 0 && container.syntax.command != '') {
                objects.makeCommand(container.syntax);
            }
        });

        // Testing with mockup data
        objects.events.emit('containerData', mockup);
    },

    // create an object based on it's type
    makeObject: function(obj) 
    {
        let elType = obj.type.toLowerCase();
        switch(elType) {
            case "button": 
                this.button.call(this.paper, obj, elType);
                break;
            case "checkbox":
                this.checkBox.call(this.paper, obj, elType);
                break;
            case "container": 
                this.container.call(this.paper, obj, elType);
                break;
            case "counter": 
                this.counter.call(this.paper, obj, elType);
                break;
            case "input":
                this.input.call(this.paper, obj, elType);
                break;
            case "label": 
                this.label.call(this.paper, obj, elType);
                break;
            case "radio": 
                this.radio.call(this.paper, this.radios, obj, elType);
                break;
            case "select": 
                this.select.call(this.paper, obj, elType, new EventEmitter(), ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6']);
                break;
            case "separator": 
                this.separator.call(this.paper, obj, elType);
                break;
            case "slider": 
                this.slider.call(this.paper, obj, elType);
                break;
        }
    },

    // build the dialog command
    makeCommand: function(syntax)
    {
        let command = syntax.command;
        let previewCommand = this.updateCommand(command, syntax.defaultElements);
        
        // {name}
        let regex = /({[a-z0-9]+})/g;
        let elements = command.match(regex);
        for(let i = 0; i < elements.length; i++) {
            let name = elements[i].substring(1, elements[i].length-1);
            let elementValue = objects.getCommandElementValue(name);
            
            if (elementValue === '') {
                command = this.updateCommand(command, [name]);
                previewCommand = this.updateCommand(previewCommand, [name]);
            }
            command = command.replace(elements[i], elementValue);                       
            previewCommand = previewCommand.replace(elements[i], elementValue);                       
        }
        // update dialog comand
        objects.command = command;
        // console.log(command);
        // console.log(previewCommand);
        
        this.events.emit('commandUpdate', previewCommand);
    },

    keyPressedEvent: function(key, status)
    {
        objects.events.emit('keyTriggered', {key: key, status: status});
    },

    // get the element's value for command
    getCommandElementValue: function(name)
    {
        // we have the object
        if(objects.objList[name] !== void 0) {
            let el = objects.objList[name];
            
            // is a checkbox
            if(el.checked !== void 0) {
                return el.checked;
            }
            // is input or counter
            if(el.value !== void 0) {
                return el.value;
            }
        } else {
            // check if we have a radioGroup            
            if(objects.radios[name] !== void 0) {
                let found = '';
                for (let key in objects.radios[name]) {
        
                    if(objects.objList[key].selected){
                        found = objects.objList[key].name;
                    }
                }
                return found;
            }
        }
    },
    // updateCommand - remove elements
    updateCommand: function(command, defaultElements) 
    {
        // console.log(command);
        // nothing to remove
        if(defaultElements.length == 0) {
            return command;
        }

        let commandArgs = [];
        let newCommand = '';
        commandArgs = objects.getCommandArgs(command);            
        if (commandArgs.length > 0) {                        
            newCommand += commandArgs[0]; 
            for (let j = 1; j < commandArgs.length - 1; j++) {
                let add = true;                   
                for (let i = 0; i < defaultElements.length; i++) {
                    if (commandArgs[j].indexOf(defaultElements[i]) != -1) {
                        add = false;
                    }
                }
                if (add) {
                    newCommand += commandArgs[j] + ',';
                }
            }
            newCommand = newCommand.substring(0, newCommand.length - 1);
            newCommand += commandArgs[commandArgs.length - 1]; 
        }

        return newCommand;
    },
    // get the comand's args
    getCommandArgs: function(command)
    {
        let fIndex = command.indexOf('(');
        let lIndex = command.lastIndexOf(')');
        // wrong formula?
        if (fIndex == -1 || lIndex == -1) {
            return [];
        }
        let cArgs = command.substring(fIndex+1, lIndex);
        // return splited command        
        return [command.substring(0, fIndex+1), cArgs.split(','), command.substring(lIndex, command.length)].flat(1);
    },

    // Elements 
    // =================================================================
    
    // the button element
    button: function(obj, type)
    {
        // return if the received object is not corect;
        if(!helpers.hasSameProps(raphaelPaperSettings[type], obj)) { return false; }

        let button = {
            name: obj.name,
            visible: (obj.isVisible == 'true') ? true : false,
            enabled: (obj.isEnabled == 'true') ? true : false,
            element: {},
            conditions: objects.conditionsParser(obj.conditions),
            initialize: true,
            click: obj.onClick,
        };

        // data to int
        let dataLeft = parseInt(obj.left);
        let dataTop = parseInt(obj.top);

        // get the button's width
        let lBBox = objectsHelpers.getTextDim(this, obj.label, objects.fontSize, objects.fontFamily);

        let elButton = {};
        elButton.rect = this.rect(dataLeft, dataTop, Math.round(lBBox.width)+20, Math.round(lBBox.height) + 10).attr({fill: "#f9f9f9", "stroke": "#eeeeee", "stroke-width": 0.7});
        elButton.txt = this.text(dataLeft+10, dataTop + ((Math.round(lBBox.height) / 2) + 5), obj.label).attr({"text-anchor": "start", "font-size": objects.fontSize, "font-family": objects.fontFamily});

        elButton.cover = this.rect(dataLeft, dataTop, Math.round(lBBox.width)+20, Math.round(lBBox.height) + 10).attr({fill: "#eeeeee", stroke: "none", "fill-opacity": 0, "cursor": "pointer"});
        elButton.cover.click(function() 
        {
            // if enable emit event with command (run or reset)      
            if(button.enabled) {
                // alert(button.click);
                objects.events.emit('iSpeakButton', {name: button.name, status: button.click});
            }
        });

        button.element = elButton;

        // listen for events / changes
        objects.events.on('iSpeak', function(data)
        {
            if(obj.name != data.name){
                objects.conditionsChecker(data, button);
            }
        });

        // Button's properties
        button.show = function(){
            for( let i in button.element){
                button.element[i].show();
            }
            //  emit event only if already intialized
            if(!button.initialize) {
                objects.events.emit('iSpeak', {name: button.name, status: 'show'});
            }
        };
        button.hide = function(){
            for( let i in button.element){
                button.element[i].hide();
            }
            //  emit event only if already intialized
            if(!button.initialize) {
                objects.events.emit('iSpeak', {name: button.name, status: 'hide'});
            }
        };
        button.enable = function() {
            button.enabled = true;
            button.element.rect.attr({fill: "#f9f9f9", opacity: 1});
            button.element.txt.attr({opacity: 1});
            button.element.cover.attr({'cursor': 'pointer'});
            //  emit event only if already intialized
            if(!button.initialize) {
                objects.events.emit('iSpeak', {name: button.name, status: 'enable'});
            }
        };
        button.disable = function() {
            button.enabled = false;
            button.element.rect.attr({fill: "#000", opacity: 0.2});
            button.element.txt.attr({opacity: 0.2});
            button.element.cover.attr({'cursor': 'default'});
            //  emit event only if already intialized
            if(!button.initialize) {
                objects.events.emit('iSpeak', {name: button.name, status: 'disable'});
            }
        };

        // initialize
        if(button.visible) { 
            button.show();
        } else {
            button.hide();
        }
        if(button.enabled) {
            button.enable();
        } else {
            button.disable();
        }        
        // set to false - we have initialized the element
        button.initialize = false;

        // add the element to the main list
        objects.objList[obj.name] = button;
    },

    // the checkbox element
    checkBox: function(obj, type) 
    {        
        // return if the received object is not corect;
        if(!helpers.hasSameProps(raphaelPaperSettings[type], obj)) { return false; }

        // x, y, isChecked, label, pos, dim, fontsize
        // checking / making properties
        if (helpers.missing(obj.top)) { obj.top = 10; }
        if (helpers.missing(obj.left)) { obj.left = 10; }
        if (helpers.missing(obj.isChecked)) { obj.isChecked = false; }
        if (helpers.missing(obj.label)) { obj.label = ""; }
        if (helpers.missing(obj.pos)) { obj.pos = 3; }
        if (helpers.missing(obj.dim)) { obj.dim = 12; }
        if (helpers.missing(obj.fontsize)) { obj.fontsize = objects.fontSize; }
        
        let checkBox = {
            name: obj.name,
            visible: (obj.isVisible == 'true') ? true : false,
            checked: (obj.isChecked == 'true') ? true : false,
            enabled: (obj.isEnabled == 'true') ? true : false,
            element: {},
            conditions: objects.conditionsParser(obj.conditions),
            initialize: true,
        };

        var cbElement = {};     
    
        // checkbox label - position
        var txtanchor = "start";
        var xpos = parseInt(obj.left);
        var ypos = parseInt(obj.top);
        if (obj.pos == 1) { // left
            xpos -= 8;
            ypos += obj.dim / 2;
            txtanchor = "end";
        }
        else if (obj.pos == 2) { // below
            xpos += obj.dim / 2;
            ypos -= obj.dim;
            txtanchor = "middle";
        }
        else if (obj.pos == 3) { // right
            xpos += 20;
            ypos += obj.dim / 2;
        }
        else { // top
            xpos += obj.dim / 2;
            ypos += 27;
            txtanchor = "middle";
        }
        // the label
        cbElement.label = this.text(xpos, ypos, obj.label).attr({"text-anchor": txtanchor, "font-size": (obj.fontsize + "px"), "font-family": objects.fontFamily, "cursor": "default"});
        // the box        
        cbElement.box = this.rect(parseInt(obj.left), parseInt(obj.top), obj.dim, obj.dim).attr({fill: (checkBox.checked ? "#97bd6c" : "#eeeeee"),"stroke-width": 1, stroke: "#a0a0a0"});
        // the checked 
        cbElement.chk = this.path([
            ["M", parseInt(obj.left) + 0.2*obj.dim, parseInt(obj.top) + 0.3*obj.dim],
            ["l", 0.15*obj.dim*2, 0.2*obj.dim*2],
            ["l", 0.3*obj.dim*2, -0.45*obj.dim*2]
        ]).attr({"stroke-width": 2});
        
        // the cover needs to be drawn last, to cover all other drawings (for click events)
        cbElement.cover = this.rect(parseInt(obj.left), parseInt(obj.top), obj.dim, obj.dim)
            .attr({fill: "#fff", opacity: 0, cursor: "pointer"})
            .click(function() {
                // if the element is enabled
                if (checkBox.enabled) {
                    // the element
                    checkBox.checked = !checkBox.checked;
                    // the cover
                    this.checked = checkBox.checked;
                    
                    if (checkBox.checked) {
                        // the element is checked
                        cbElement.box.attr({fill: "#97bd6c"});
                        cbElement.chk.show();
                        objects.events.emit('iSpeak', {name: obj.name, status: 'check'});
                    } else {
                        // the element is unchecked
                        cbElement.box.attr({fill: "#eeeeee"});
                        cbElement.chk.hide();
                        objects.events.emit('iSpeak', {name: obj.name, status: 'uncheck'});
                    }
                }
            });
        
        cbElement.cover.checked = true;

        checkBox.element = cbElement;
        
        // listen for events / changes
        objects.events.on('iSpeak', function(data)
        {
            if(data.name != obj.name) {
                objects.conditionsChecker(data, checkBox);
            }
        });
        
        // Checkbox's properties
        checkBox.enable = function() {
            checkBox.enabled = true;
            checkBox.element.cover.active = true;
            checkBox.element.cover.attr({cursor: "pointer"});
            cbElement.box.attr({fill: (checkBox.checked ? "#97bd6c" : "#eeeeee"), 'stroke': '#a0a0a0'});
            //  emit event only if already intialized
            if(!checkBox.initialize) {
                objects.events.emit('iSpeak', {name: obj.name, status: 'enable'});
            }
        };
        // checkbox is not enabled
        checkBox.disable = function() {
            checkBox.enabled = false;
            checkBox.element.cover.active = false;
            checkBox.element.cover.attr({cursor: "default"});
            cbElement.box.attr({fill: "#aaaaaa", 'stroke': '#666666'});
            //  emit event only if already intialized
            if(!checkBox.initialize) {
                objects.events.emit('iSpeak', {name: obj.name, status: 'disable'});
            }
        };
        // checkbox is checked
        checkBox.check = function() {
            checkBox.checked = true;
            checkBox.element.box.attr({fill: "#97bd6c"});
            checkBox.element.chk.show();
            checkBox.element.cover.checked = true;
            //  emit event only if already intialized
            if(!checkBox.initialize) {
                objects.events.emit('iSpeak', {name: obj.name, status: 'check'});
            }
        };
        // checkbox is not checked
        checkBox.uncheck = function() {
            checkBox.checked = false;
            checkBox.element.box.attr({fill: "#eeeeee"});
            checkBox.element.chk.hide();
            checkBox.element.cover.checked = false;
            //  emit event only if already intialized
            if(!checkBox.initialize) {            
                objects.events.emit('iSpeak', {name: obj.name, status: 'uncheck'});
            }
        };
        // checkbox is visible
        checkBox.show = function() {
            checkBox.element.cover.show();
            checkBox.element.box.show();
            
            if (checkBox.checked) {
                checkBox.element.chk.show();
            } else {
                checkBox.element.chk.hide();
            }
            checkBox.element.label.show();
            //  emit event only if already intialized
            if(!checkBox.initialize) {
                objects.events.emit('iSpeak', {name: obj.name, status: 'show'});
            }
        };
        // checkbox is not visible
        checkBox.hide = function() {
            checkBox.element.cover.hide();
            checkBox.element.box.hide();
            checkBox.element.chk.hide();
            checkBox.element.label.hide();
            //  emit event only if already intialized
            if(!checkBox.initialize) {
                objects.events.emit('iSpeak', {name: obj.name, status: 'hide'});
            }
        };

        // Initialize      
        if (checkBox.checked) {
            checkBox.check();
        } else {
            checkBox.uncheck();
        }
        if (checkBox.enabled) {
            checkBox.enable();
        } else {
            checkBox.disable();
        }
        if (checkBox.visible) {
            checkBox.show();
        } else {
            checkBox.hide();
        }

        // set to false - we have initialized the element
        checkBox.initialize = false;

        // add the element to the main list
        objects.objList[obj.name] = checkBox;
    },

    // the container element
    // TODO --- check data functionality
    container: function(obj, type)
    {
        // return if the received object is not corect;
        if(!helpers.hasSameProps(raphaelPaperSettings[type], obj)) { return false; }

        let container = {
            name: obj.name,
            type: obj.objViewClass,
            parent: obj.parentContainer,
            visible: (obj.isVisible == 'true') ? true : false,
            enabled: (obj.isEnabled == 'true') ? true : false,
            element: {},
            conditions: objects.conditionsParser(obj.conditions),
            initialize: true,
            // multiple items can be selected
            value: [],
            shiftKey: false,
            data: [] 
        };

        // data to int
        let dataLeft = parseInt(obj.left);
        let dataTop = parseInt(obj.top);
        // check for user input
        if(obj.width < 50) { obj.width = 50; }
        else if(obj.width > paper.width - 15) { obj.width = paper.width - 30; dataLeft = 15;}

        if(obj.height < 50) { obj.height = 50; }
        else if(obj.height > paper.height - 15) { obj.height = paper.height - 30; dataTop = 15; }

        // draw rectangle till we have data
        container.element = this.rect(dataLeft, dataTop, obj.width + 6, obj.height).attr({fill: "#ffffff", "stroke": "#d6d6d6", "stroke-width": 1});
        // The containers's element list paper support
        // ===============================================================================
        const listSupport = {
            div: document.createElement("div"),
            paper: {},
            selectElements: {},
            makeSupport: function(noElements) {
                // make hight for div, svg and rect
                let divWidth = (obj.height > noElements * 25 + 11) ? obj.width + 4 : obj.width + 4;
                let svgHeight = (obj.height < noElements * 25 + 11) ? noElements * 25 + 10 : obj.height - 2;

                listSupport.div.style.position = "absolute";
                listSupport.div.style.top = (dataTop - 1) + 'px';
                listSupport.div.style.left = (dataLeft + 16) + 'px';
                // listSupport.div.style.backgroundColor = '#FF0000';
                listSupport.div.style.width = divWidth + 'px';
                listSupport.div.style.height = (obj.height - 2) + 'px';
                //  make object scroll Y if needed
                if(obj.height < noElements * 25 + 11) {
                    listSupport.div.id = 'container-' + obj.name;
                    listSupport.div.className = 'scrollbarStyle';
                } else {
                    listSupport.div.style.border = '2px';
                    listSupport.div.style.borderColor = '#eaeaea';
                    listSupport.div.style.borderStyle = 'solid';
                }

                // hide initial rectangle
                if (typeof container.element.hide === 'function') {
                    container.element.hide();
                }
                // if we already have a paper we have to remove it first
                if (typeof listSupport.paper.remove === 'function') {
                    listSupport.paper.remove();
                }

                let newPaper = Raphael(listSupport.div, obj.width + 2, svgHeight);
                listSupport.selectElements = newPaper.rect(1, 1, obj.width, svgHeight).attr({fill: "#FFFFFF", "stroke-width": 0}).toFront();
                // append div to original|main paper
                document.getElementById('paper').appendChild(listSupport.div);
                
                // save paper referance for later use
                listSupport.paper = newPaper;               
            }
        };

        // The containers's listeners
        // ===============================================================================
        objects.events.on('iSpeak', function(data) // changes
        {
            if(obj.name != data.name){
                objects.conditionsChecker(data, container);
            }
        });
        objects.events.on('containerData', function(data) // new data
        {
            if(obj.name != data.name){
                container.data = (data.data === void 0) ? data : data.data;
                if (container.type === 'dataSet' && data.name === void 0) {
                    container.makeDataSetList(data);
                } else if (container.type === 'variable' && container.parent == data.name) { // variable container and triggered by dataSet container
                    container.makeVarialeSetList(data);
                }
            }
        });        
        objects.events.on('keyTriggered', function(data) // key pressed
        {
            if(data.key === 'Shift') {
                container.shiftKey = data.status;
            }
        });

        // The containers's element list
        // ===============================================================================
        let selectedElementsList = [];
        let txt = [];
        let cover = [];
        let listLength = 0;

        // on click element
        let elClicked = function() { 
            // active only if container is enable
            if(container.enabled)
            {
                let isOn = this.data('clicked');
                let valueName = this.data('elName');            
                let position = this.data('position');            
                
                // if shift key presed
                if(container.shiftKey) {
                    // if we have already selected at least an element
                    if ( selectedElementsList.length > 0) {
                                
                        let first = selectedElementsList[0];
                        selectedElementsList.length = 0;
                        container.value.length = 0;

                        // deselect everything
                        for(let i = 0; i < listLength; i++) {
                            cover[i].attr({fill: "#eeeeee", "opacity": 0}).data('clicked', 0);
                        }

                        if (position >= first) {
                            for(let i = first; i <= position; i++) {
                                cover[i].attr({"fill": "blue", "opacity": 0.5}).data('clicked', 1);
                                selectedElementsList.push(i);
                                container.value.push(cover[i].data('elName'));
                            }   
                        } else if (position < first) {
                            for(let i = position; i <= first; i++) {
                                cover[i].attr({"fill": "blue", "opacity": 0.5}).data('clicked', 1);
                                selectedElementsList.push(i);
                                container.value.push(cover[i].data('elName'));
                            }
                        }
                        // sort selected elements
                        selectedElementsList.sort((a, b)=>{
                            return a < b;
                        });

                    } else {
                        this.attr({"fill": "blue", "opacity": 0.5}).data('clicked', 1);
                        // save|add the name of the selected
                        container.value.push(valueName);
                        selectedElementsList.push(position);
                    }
                } else {
            
                    if(!isOn) {
                        this.attr({"fill": "blue", "opacity": 0.5}).data('clicked', 1);
                        // save|add the name of the selected
                        container.value.push(valueName);
                        selectedElementsList.push(position);
                    } else {
                        this.attr({fill: "#eeeeee", "opacity": 0}).data('clicked', 0);
                        // remove the unselected item
                        container.value = helpers.removeValueFromArray(container.value, valueName);
                        selectedElementsList = helpers.removeValueFromArray(selectedElementsList, position);
                    }
                    
                    // something selected / deselected 
                }                               
                objects.events.emit('containerData', {name: container.name, data: container.data, selected: container.value});            
            }
        };
        container.makeDataSetList = function(data)
        {
            // get dataframes
            let list = Object.keys(data);

            // make paper for list
            listSupport.makeSupport(list.length);
            let newPaper = listSupport.paper;           

            listLength = list.length;
            
            let position = 15;
            // populate the list
            for(let i = 0; i < list.length; i++) {
                txt[i] = newPaper.text(11, position+3, list[i]).attr({"text-anchor": "start", "font-size": objects.fontSize, "font-family": objects.fontFamily, fill: '#333333'});
                // save the name of the
                cover[i] = newPaper.rect(5 , position-10, obj.width - 10, 25).attr({fill: "#eeeeee", "opacity": 0, "cursor": "pointer", stroke: 0})
                                .data('clicked', 0)
                                .data('elName', list[i])
                                .data('position', i);
                position += 25;
            }         

            // add click events for elements
            for(let i = 0; i < cover.length; i++) {
                 cover[i].click(elClicked);
            }
        };
        container.makeVarialeSetList = function(data)
        {           
            // get dataframes
            let list = [];
            for (let i = 0; i < data.selected.length; i++) {
                list.push(data.data[data.selected[i]]);
            }
        
            // level one array
            list = list.flat(list.length);
            console.log(list);
            
            listLength = list.length;

            // remove ald paper and div
            if (typeof listSupport.paper.remove === 'function') {
                listSupport.paper.remove();
                if(listSupport.div.parentNode != null) {
                    listSupport.div.parentNode.removeChild(listSupport.div);
                }
            }

            // do we have data?
            if(listLength == 0) {
                container.element.show();
            } else {
                listSupport.makeSupport(listLength);
                let newPaper = listSupport.paper;
                
                let position = 15;
                // populate the list
                for(let i = 0; i < listLength; i++) {
                    txt[i] = newPaper.text(11, position+3, list[i]).attr({"text-anchor": "start", "font-size": objects.fontSize, "font-family": objects.fontFamily, fill: '#333333'});
                    // save the name of the
                    cover[i] = newPaper.rect(5 , position-10, obj.width - 10, 25).attr({fill: "#eeeeee", "opacity": 0, "cursor": "pointer", stroke: 0})
                                    .data('clicked', 0)
                                    .data('elName', list[i])
                                    .data('position', i);
                    // listSet.push( txt[i], cover[i] );
                    position += 25;
                }         

                // add click events for elements
                for(let i = 0; i < cover.length; i++) {
                    cover[i].click(elClicked);
                }       
            }     
        };

        // the container's properties    
        container.show = function(){
            // container.element.show();
            listSupport.div.style.display = 'block';
            //  emit event only if already intialized
            if(!container.initialize) {
                objects.events.emit('iSpeak', {name: container.name, status: 'show'});
            }
        };
        container.hide = function(){
            listSupport.div.style.display = 'none';
            // container.element.hide();
            //  emit event only if already intialized
            if(!container.initialize) {
                objects.events.emit('iSpeak', {name: container.name, status: 'hide'});
            }
        };
        container.enable = function() {
            container.enabled = true;
            for(let i = 0; i < container.data.length; i++) {
                cover[i].attr({'cursor':'pointer'});
            }
            if (typeof listSupport.selectElements.attr === 'function') {
                listSupport.selectElements.attr({fill: "#ffffff"});
            }
            //  emit event only if already intialized
            if(!container.initialize) {
                objects.events.emit('iSpeak', {name: container.name, status: 'enable'});
            }
        };
        container.disable = function() {
            container.enabled = false;
            for(let i = 0; i < container.data.length; i++) {
                cover[i].attr({'cursor':'default'});
            }
            if (typeof listSupport.selectElements.attr === 'function') {
                listSupport.selectElements.attr({fill: "#eeeeee"});
            }
            //  emit event only if already intialized
            if(!container.initialize) {
                objects.events.emit('iSpeak', {name: container.name, status: 'disable'});
            }
        };

        // initialize
        if(container.visible) { 
            container.show();
        } else {
            container.hide();
        }
        if(container.enabled) {
            container.enable();
        } else {
            container.disable();
        }               

        // set to false - we have initialized the element
        container.initialize = false;

        // add the element to the main list
        objects.objList[obj.name] = container;     
    },

    // the counter element
    counter: function(obj, type) 
    {
        // return if the received object is not corect;
        if(!helpers.hasSameProps(raphaelPaperSettings[type], obj)) { return false; }

        let counter = {
            name: obj.name,
            visible: (obj.isVisible == 'true') ? true : false,
            enabled: (obj.isEnabled == 'true') ? true : false,
            value: parseInt(obj.startval),
            element: {},
            conditions: objects.conditionsParser(obj.conditions),
            initialize: true,
        };

        // obj properties
        if (helpers.missing(obj.fontsize)) { obj.fontsize = 14; }
        if (helpers.missing(obj.width)) { obj.width = 20; }
        
        let elCounter = {};      
        
        // data to int
        let dataLeft = parseInt(obj.left) + 22;
        let dataTop = parseInt(obj.top) ;
        
        let txtanchor = "middle";
        
        elCounter.textvalue = this.text(dataLeft, dataTop, "" + obj.startval)
            .attr({"text-anchor": txtanchor, "font-size": obj.fontsize + "px"});
        
        elCounter.downsign = this.path([
            ["M", dataLeft - 12 - obj.width / 2, dataTop - 6],
            ["l", 12, 0],
            ["l", -6, 12],
            ["z"]
        ]).attr({fill: "#eeeeee", "stroke-width": 1.2, stroke: "#a0a0a0"});
        
        elCounter.upsign = this.path([
            ["M", dataLeft + obj.width / 2, dataTop + 6],
            ["l", 12, 0],
            ["l", -6, -12],
            ["z"]
        ]).attr({fill: "#eeeeee", "stroke-width": 1.2, stroke: "#a0a0a0"});
        
        // listen for events / changes - must be declared before thee emit events
        objects.events.on('iSpeak', function(data)
        {
            if(obj.name != data.name){
                objects.conditionsChecker(data, counter);
            }
        }); 

        elCounter.down = this.rect((dataLeft - (obj.width / 2)) - 14, dataTop - 7, 15, 15)
            .attr({fill: "#fff", opacity: 0, stroke: "#000", "stroke-width": 1, cursor: "pointer"})
            .click(function() {
                if(counter.enabled) {
                    if (counter.value > parseInt(obj.startval)) {
                        counter.value -= 1;
                        elCounter.textvalue.attr({"text": ("" + counter.value)});
                        // say that the value has changed
                        objects.events.emit('iSpeak', {name: counter.name, status: 'value'});
                    }
                }
            });
        
        elCounter.up = this.rect((dataLeft + (obj.width / 2)) - 2, dataTop - 7, 15, 15)
            .attr({fill: "#fff", opacity: 0, stroke: "#000", "stroke-width": 1, cursor: "pointer"})
            .click(function() {
                if(counter.enabled) {
                    if (counter.value < parseInt(obj.maxval)) {
                        counter.value += 1;
                        elCounter.textvalue.attr({"text": ("" + counter.value)});
                        // say that the value has changed
                        objects.events.emit('iSpeak', {name: counter.name, status: 'value'});
                    }
                }
            });

        counter.element = elCounter;   

        // the counter's methods
        counter.show = function() {
            for (let i in counter.element){
                counter.element[i].show();
            }
            //  emit event only if already intialized
            if(!counter.initialize) {
                objects.events.emit('iSpeak', {name: counter.name, status: 'show'});
            }
        };
        counter.hide = function() {
            for (let i in counter.element){
                counter.element[i].hide();
            }
            //  emit event only if already intialized
            if(!counter.initialize) {
                objects.events.emit('iSpeak', {name: counter.name, status: 'hide'});
            }
        };

        counter.enable = function() {
            counter.enabled = true;
            counter.element.textvalue.attr({fill: '#000000'});
            counter.element.upsign.attr({fill: '#eeeeee', opacity: 1});
            counter.element.downsign.attr({fill: '#eeeeee', opacity: 1});
            counter.element.up.attr({'cursor': 'pointer'});
            counter.element.down.attr({'cursor': 'pointer'});
            //  emit event only if already intialized
            if(!counter.initialize) {
                objects.events.emit('iSpeak', {name: counter.name, status: 'enable'});
            }
        };
        counter.disable = function() {
            counter.enabled = false;
            counter.element.textvalue.attr({fill: '#bbbbbb'});
            counter.element.upsign.attr({fill: '#000000', opacity: 0.2});
            counter.element.downsign.attr({fill: '#000000', opacity: 0.2});
            counter.element.up.attr({'cursor': 'default'});
            counter.element.down.attr({'cursor': 'default'});
            //  emit event only if already intialized
            if(!counter.initialize) {
                objects.events.emit('iSpeak', {name: counter.name, status: 'disable'});
            }
        };
                
        // initialize
        if(counter.visible) {
            counter.show();
        } else {
            counter.hide();
        }
        if(counter.enabled) {
            counter.enable();
        } else {
            counter.disable();
        }        

        // set to false - we have initialized the element
        counter.initialize = false;

        // add the element to the main list
        objects.objList[obj.name] = counter;
    }, 

    // the input element
    input: function(obj, type)
    {
        // return if the received object is not corect;
        if(!helpers.hasSameProps(raphaelPaperSettings[type], obj)) { return false; }

        let input = {
            name: obj.name,
            value: obj.value,
            visible: (obj.isVisible == 'true') ? true : false,
            enabled: (obj.isEnabled == 'true') ? true : false,
            element: {},
            conditions: objects.conditionsParser(obj.conditions),
            initialize: true,
            paper: this,
            width: obj.width,
        };

        // data to int
        let dataLeft = parseInt(obj.left);
        let dataTop = parseInt(obj.top);

        let elinput = {};
        elinput.rect = this.rect(dataLeft, dataTop, obj.width, 25).attr({fill: "#ffffff", "stroke": "#bbbbbb", "stroke-width": 0.7});

        elinput.cover = this.rect(dataLeft, dataTop, obj.width, 25).attr({fill: "#eeeeee", stroke: "none", "opacity": 0, "cursor": "text"});
        elinput.cover.click(function() 
        {
            if(input.enabled) {
                objects.customInput(obj.width - 10, 19, dataLeft+22, dataTop+1, input.value, input.paper).then((result) => {
                    input.setValue(result);                    
                });
            }
        }); 

        input.element = elinput;

        // listen for events / changes
        objects.events.on('iSpeak', function(data)
        {
            if(obj.name != data.name){
                objects.conditionsChecker(data, input);
            }
        });

        // the input's methods
        input.setValue = function(val) 
        {    
            // remove previous element 
            if(typeof input.element.txt === 'object' && typeof input.element.txt.remove === "function") {
                input.element.txt.remove();                
            }
            // check if the new text is bigger then the input an trim if so
            let newValDim = objects.getTextDim(val, null);
            
            let newText = (newValDim.width < input.width) ? val :  objects.limitTextOnWidth(val, input.width) + '...';
            input.element.txt = input.paper.text(dataLeft+5, dataTop + 12, newText).attr({"text-anchor": "start", "font-size": 14});
            // make it editable
            input.element.txt.click(function(){
                if(input.enabled) {
                    objects.customInput(obj.width - 10, 19, dataLeft+22, dataTop+1, input.value, input.paper).then((result) => {
                        input.setValue(result);                    
                    });
                }
            });
            // save full new value
            input.value = val;
            if(!input.initialize) {
                objects.events.emit('iSpeak', {name: input.name, status: 'value'});
            }
        };
        input.show = function()
        {
            for( let i in input.element){
                input.element[i].show();
            }
            //  emit event only if already intialized
            if(!input.initialize) {
                objects.events.emit('iSpeak', {name: input.name, status: 'show'});
            }
        };
        input.hide = function(){
            for( let i in input.element){
                input.element[i].hide();
            }
            //  emit event only if already intialized
            if(!input.initialize) {
                objects.events.emit('iSpeak', {name: input.name, status: 'hide'});
            }
        };
        input.enable = function() {
            input.enabled = true;
            input.element.rect.attr({fill: "#ffffff"});
            if(typeof input.element.txt === 'object'){
                input.element.txt.attr({"fill-opacity" : 1, "cursor": "text"});
            }
            input.element.cover.attr({"cursor": "text"});
            //  emit event only if already intialized
            if(!input.initialize) {
                objects.events.emit('iSpeak', {name: input.name, status: 'enable'});
            }
        };
        input.disable = function() {            
            input.enabled = false;
            input.element.rect.attr({fill: "#BBB"});
            if(typeof input.element.txt === 'object'){
                input.element.txt.attr({"fill-opacity" : 0.5, "cursor": "pointer"});
            }
            input.element.cover.attr({"cursor": "pointer"});
            //  emit event only if already intialized
            if(!input.initialize) {
                objects.events.emit('iSpeak', {name: input.name, status: 'disable'});
            }
        };

        // initialize
        if(obj.value.trim() != '') {
            input.setValue.call(this, obj.value);
        }       
        if(input.visible) { 
            input.show();
        } else {
            input.hide();
        }
        if(input.enabled) {
            input.enable();
        } else {
            input.disable();
        } 
        
        // set to false - we have initialized the element
        input.initialize = false;

        // add the element to the main list
        objects.objList[obj.name] = input;
    },       
   
    // the label element
    label: function(obj, type)
    {
        // return if the received object is not corect;
        if(!helpers.hasSameProps(raphaelPaperSettings[type], obj)) { return false; }

        let label = {
            name: obj.name,
            visible: (obj.isVisible == 'true') ? true : false,
            element: {},
            conditions: objects.conditionsParser(obj.conditions),
            initialize: true,
        };

        label.element = this.text(obj.left, obj.top, obj.text).attr({'fill': '#000000', "font-size": obj.fontSize, 'text-anchor': 'start', "cursor": "default"});
     
        // listen for events / changes
        objects.events.on('iSpeak', function(data)
        {            
            if(obj.name != data.name){
                objects.conditionsChecker(data, label);
            }
        });
        
        // the lable's methods
        label.show = function() {
            this.element.show();
            //  emit event only if already intialized
            if(!label.initialize) {
                objects.events.emit('iSpeak', {name: obj.name, status: 'show'});
            }
        };
        label.hide = function() {
            this.element.hide();
            //  emit event only if already intialized
            if(!label.initialize) {
                objects.events.emit('iSpeak', {name: obj.name, status: 'hide'});
            }
        };

        // initial status
        if(label.visible){
            label.show();
        } else {
            label.hide();
        }

        // set to false - we have initialized the element
        label.initialize = false;

        // add the element to the main list
        objects.objList[obj.name] = label;
    },

    // the radio element
    radio: function(radios, obj, type) 
    {
        // return if the received object is not corect;
        if(!helpers.hasSameProps(raphaelPaperSettings[type], obj)) { return false; }

        let radio = {
            name: obj.name,
            group: obj.radioGroup,
            visible: (obj.isVisible == 'true') ? true : false,
            enabled: (obj.isEnabled == 'true') ? true : false,
            selected: (obj.isSelected == 'true') ? true : false,
            element: {},
            conditions: objects.conditionsParser(obj.conditions),
            initialize: true,
        };
        
        // add the element to the main list
        objects.objList[obj.name] = radio;  

        if (helpers.missing(obj.size)) { obj.size = 7; }
        if (helpers.missing(obj.vertspace)) { obj.vertspace = 25; }
        if (helpers.missing(obj.fontsize)) { obj.fontsize = 14; }
        
        // data
        let dataLeft = parseInt(obj.left);
        let dataTop = parseInt(obj.top);
        
        // initializing the radioGroup if it does not already exists
        if(radios[obj.radioGroup] == void 0){
            radios[obj.radioGroup] = {};
        }
        radios[obj.radioGroup][obj.name] = {};
        let me = radios[obj.radioGroup][obj.name];

        // drawing the radio and label
        let cColor = (obj.isEnabled == 'true') ? "#eeeeee" : "#6c757d";
        let tColor = (obj.isEnabled == 'true') ? "#000000" : "#6c757d";
        me.label = this.text(dataLeft + 15, dataTop, obj.label).attr({"text-anchor": "start", "font-size": obj.fontsize+"px", fill:tColor, "cursor":"default"});
        me.circle = this.circle(dataLeft, dataTop, obj.size).attr({fill: cColor, "stroke": "#a0a0a0", "stroke-width": 1.2});
    
        // selected - initial hide - new Raphael SET
        me.fill = this.set();
        // the interior green circle
        me.fill.push(this.circle(dataLeft, dataTop, obj.size - 0.5).attr({fill: "#97bd6c", stroke: "none"}));
        // the interior black smaller circle
        me.fill.push(this.circle(dataLeft, dataTop, obj.size - 4.5).attr({fill: "#000000", stroke: "none"}));
        // add iD / name
        me.name = obj.name;
        me.fill.hide();

        me.cover =  this.circle(dataLeft, dataTop, obj.size + 2).attr({fill: "#eeeeee", stroke: "none", "fill-opacity": 0, "cursor": "pointer"});
        me.cover.click(function() 
        {
            if(radio.enabled) {
                let rList = Object.keys(radios[obj.radioGroup]);
                for(let i = 0; i < rList.length; i++)
                {
                    if(rList[i] == me.name) {
                        radios[obj.radioGroup][rList[i]].fill.show();
                        objects.objList[rList[i]].selected = true;       
                        objects.events.emit('iSpeak', {name: radios[obj.radioGroup][rList[i]].name, status: 'select'});
                    } else {
                        radios[obj.radioGroup][rList[i]].fill.hide();
                        objects.objList[rList[i]].selected = false;
                        objects.events.emit('iSpeak', {name: radios[obj.radioGroup][rList[i]].name, status: 'deselect'});
                    }
                }
            }
        });

        // listen for events / changes
        objects.events.on('iSpeak', function(data)
        {
            if(obj.name != data.name){
                objects.conditionsChecker(data, radio);
            }
        });
        
        // the radio's methods
        radio.show = function() {
            me.label.show();
            me.circle.show();
            // check if selected
            if(radio.selected) {
                me.fill.show();
            }
            //  emit event only if already intialized
            if(!radio.initialize) {
                objects.events.emit('iSpeak', {name: radio.name, status: 'show'});
            }
        };
        radio.hide = function() {
            me.label.hide();
            me.circle.hide();
            me.fill.hide();
            //  emit event only if already intialized
            if(!radio.initialize) {            
                objects.events.emit('iSpeak', {name: radio.name, status: 'hide'});
            }
        };
        radio.enable = function() {
            radio.enabled = true;
            me.cover.attr({'cursor': 'pointer'});
            //  emit event only if already intialized
            if(!radio.initialize) {            
                objects.events.emit('iSpeak', {name: radio.name, status: 'enable'});
            }
        };
        radio.disable = function() {
            radio.enabled = false;
            me.cover.attr({'cursor': 'default'});
            //  emit event only if already intialized
            if(!radio.initialize) {            
                objects.events.emit('iSpeak', {name: radio.name, status: 'disable'});
            }
        };
        radio.select = function() {
            radio.selected = true;
            me.fill.show();
            //  emit event only if already intialized
            if(!radio.initialize) {            
                objects.events.emit('iSpeak', {name: radio.name, status: 'select'});
            }
        };
        radio.deselect = function() {
            radio.selected = false;
            me.fill.hide();
            //  emit event only if already intialized
            if(!radio.initialize) {            
                objects.events.emit('iSpeak', {name: radio.name, status: 'deselect'});
            }
        };

        // initial status
        if(radio.visible) {
            radio.show();
        } else {
            radio.hide();
        }
        if(radio.enabled) {
            radio.enable();
        } else {
            radio.disable();
        }        
        if(radio.selected) {
            radio.select();
        } else {
            radio.deselect();
        }        

        // set to false - we have initialized the element
        radio.initialize = false;
    },

    // the select element
    // TO DO - open element at the bottom of the window
    // custom list / obiecte din R
    select: function(obj, type, eventMe, list)
    {
        // return if the received object is not corect;
        if(!helpers.hasSameProps(raphaelPaperSettings[type], obj)) { return false; }

        let select = {
            name: obj.name,
            visible: (obj.isVisible == 'true') ? true : false,
            enabled: (obj.isEnabled == 'true') ? true : false,
            selected: {},
            value: '',
            element: {},
            conditions: objects.conditionsParser(obj.conditions),
            initialize: true,
        };

        // data to int
        let dataLeft = parseInt(obj.left);
        let dataTop = parseInt(obj.top);
        
        // not widther than 350
        obj.width = (obj.width > 350) ? 350 : obj.width;
        let dataWidth = parseInt(obj.width);

        let div = document.createElement("div");
        div.style.position = "absolute";
        div.style.top = dataTop + 'px';
        div.style.left = dataLeft + 'px';
        // div.style.backgroundColor = '#FF0000';
        div.style.width = (dataWidth + 10) + 'px';
        div.style.height = '32px';

        // initialy paper is small - allow ather elements to be clickable
        let newPaper = Raphael(div, dataWidth + 10, 32);

        let p = document.getElementById('paper');
        p.appendChild(div);

        select.element.rect = newPaper.rect(5, 5, dataWidth, 25).attr({fill: "#FFFFFF", "stroke": "#333333", "stroke-width": 0.2});  
        
        // show / hide selected    
        // ===============================================================================
        eventMe.on('selected', function(data) {
            // check if we have an element | if yes remove it
            if(typeof select.selected.remove === "function") {
                select.selected.remove();                
            }
            select.selected = newPaper.text(13, 18, data).attr({"text-anchor": "start",fill: "#333333", "font-size": "14px"});
            select.value = data;
            // etmit event - obj value change
            objects.events.emit('iSpeak', {name: obj.name, status: 'select'});
        });
        eventMe.on('deSelected', function(data) {
            select.selected.remove();
            select.value = '';
            // etmit event - obj value change
            objects.events.emit('iSpeak', {name: obj.name, status: 'deselect'});
        });

        // Open / close element list
        // ===============================================================================
        select.element.downsign = newPaper.path([
            ["M", dataWidth - 10 , 13 ],
            ["l", 8, 0],
            ["l", -4, 8],
            ["z"]
        ]).attr({fill: "#333333", "stroke-width": 0});
        select.element.upsign = newPaper.path([
            ["M", dataWidth - 10 , 21 ],
            ["l", 8, 0],
            ["l", -4, -8],
            ["z"]
        ]).attr({fill: "#333333", "stroke-width": 0}).hide();
        
        select.element.showList = newPaper.rect(8 , 8, dataWidth - 6, 19).attr({fill: "#FF0000", "opacity": 0, "cursor": "pointer"});        
        select.element.showList.click(function() {
            if(select.enabled) {
                if(listSet[0].data('visible')) {
                    hideSelectables();
                    // resize div and paper
                    div.style.height = '32px';
                    newPaper.setSize((dataWidth + 10), 30);
                } else {
                    showSelectables();
                    // resize div and paper
                    div.style.height = ((list.length * 25) + 43) + 'px';
                    newPaper.setSize(dataWidth + 10, ((list.length * 25) + 43));
                }
            }
        });

        // The select's element list
        // ===============================================================================
        let selectElements = newPaper.rect(5, 30, dataWidth, list.length * 25).attr({fill: "#FFFFFF", "stroke": "#333333", "stroke-width": 0.2}); 
        selectElements.hide();
        selectElements.data('visible', 0);
        selectElements.toFront();   

        let listSet = this.set();
        listSet.push(selectElements);

        let position = 40;
        let txt = [];
        let cover = [];

        // on click element
        let elClicked = function() { 
            let isOn = this.data('clicked');
            for(let j = 0; j < cover.length; j++) {
                cover[j].attr({fill: "#eeeeee", "opacity": 0}).data('clicked', 0);
                txt[j].attr({"fill": "#333333"});
            }
            
            if(!isOn) {
                this.attr({"fill": "blue", "opacity": 0.5}).data('clicked', 1);
                eventMe.emit('selected', this.data('elName'));
            } else {
                this.attr({fill: "#eeeeee", "opacity": 0}).data('clicked', 0);
                eventMe.emit('deSelected', this.data('elName'));
            }
        };
        // on element over
        let elIn = function() { 
            if(!this.data('clicked')){
                this.attr({"opacity": 0.5}); 
            }
        };
        // on element out
        let elOut = function() { 
            if(!this.data('clicked')){
                this.attr({"opacity": 0}); 
            }                                             
        };
        
        // populate the list
        for(let i = 0; i < list.length; i++) {
            txt[i] = newPaper.text(10, position+3, list[i]).attr({"text-anchor": "start", "font-size": 14, fill: '#333333'}).hide();
            // save the name of the
            cover[i] = newPaper.rect(5 , position-10, dataWidth, 25).attr({fill: "#eeeeee", "opacity": 0, "cursor": "pointer", stroke: 0})
                            .hide()
                            .data('clicked', 0)
                            .data('elName', list[i])
                            .click( elClicked )
                            .hover( elIn, elOut );
            listSet.push( txt[i], cover[i] );
            position += 25;
        } 

        // listen for events / changes
        objects.events.on('iSpeak', function(data)
        {
            if(obj.name != data.name){
                objects.conditionsChecker(data, select);
            }            
        });

        // the select's methods
        let hideSelectables = function(){
            // hide element list
            listSet.hide();
            listSet[0].data('visible', 0);
            select.element.downsign.show();
            select.element.upsign.hide();
        };
        let showSelectables = function(){
            // show element list
            listSet.show();
            listSet[0].data('visible', 1);
            select.element.downsign.hide();
            select.element.upsign.show();
        };

        select.show = function(){
            for( let i in select.element) {                
                select.element[i].show();
            }
            // check if we have anythig selected and hide-it
            if(typeof select.selected.remove === "function") {
                select.selected.show();
            }
            hideSelectables();
            //  emit event only if already intialized
            if(!select.initialize) {
                objects.events.emit('iSpeak', {name: select.name, status: 'show'});
            }
        };
        select.hide = function(){
            for( let i in select.element){
                select.element[i].hide();
            }
            // check if we have anythig selected and hide-it
            if(typeof select.selected.remove === "function") {
                select.selected.hide();
            }
            hideSelectables();
            // override hideSelectables
            select.element.downsign.hide();
            //  emit event only if already intialized
            if(!select.initialize) {
                objects.events.emit('iSpeak', {name: select.name, status: 'hide'});
            }
        };
        select.enable = function() {
            select.enabled = true;
            select.element.rect.attr({fill: "#FFFFFF", opacity: 1});
            select.element.downsign.attr({opacity:1});
            select.element.showList.attr({'cursor': 'pointer'});
            hideSelectables();
            //  emit event only if already intialized
            if(!select.initialize) {
                objects.events.emit('iSpeak', {name: select.name, status: 'enable'});
            }
        };
        select.disable = function() {
            select.enabled = false;
            select.element.rect.attr({fill: "#000", opacity: 0.2});
            select.element.downsign.attr({opacity:0.5});
            select.element.showList.attr({'cursor': 'default'});
            hideSelectables();
            //  emit event only if already intialized
            if(!select.initialize) {
                objects.events.emit('iSpeak', {name: select.name, status: 'disable'});
            }
        };

        // initialize
        if(select.visible) { 
            select.show();
        } else {
            select.hide();
        }
        if(select.enabled) {
            select.enable();
        } else {
            select.disable();
        }  

        // set to false - we have initialized the element
        select.initialize = false;

        // add the element to the main list
        objects.objList[obj.name] = select;
    },

    // the separator element
    separator: function(obj, type)
    {
        // return if the received object is not corect;
        if(!helpers.hasSameProps(raphaelPaperSettings[type], obj)) { return false; }

        let separator = {
            name: obj.name,
            visible: (obj.isVisible == 'true') ? true : false,
            element: {},
            conditions: objects.conditionsParser(obj.conditions),
            initialize: true,
        };

        if(obj.direction == 'x') 
        {    
            if(obj.length < 10 || obj.length > this.width - 20){ obj.length = 300; }
            let v = parseInt(obj.length) + parseInt(obj.left);
            separator.element = this.path("M" + obj.left + " " + obj.top + "L"+ v +" " + obj.top).attr({stroke: "#ccc"});
        } else if(obj.direction == 'y') 
        {
            if(obj.length < 10 || obj.length > this.height - 20){ obj.length = 300; }
            let v = parseInt(obj.length) + parseInt(obj.top);
            separator.element = this.path("M" + obj.left + " " + obj.top + "L" + obj.left + " " + v).attr({stroke: "#ccc"});
        }

        // listen for events / changes
        objects.events.on('iSpeak', function(data)
        {
            if(obj.name != data.name){
                objects.conditionsChecker(data, separator);
            }
        });
        
        // the separator's methods
        separator.show = function() {
            this.element.show();
            //  emit event only if already intialized
            if(!separator.initialize) {            
                objects.events.emit('iSpeak', {name: obj.name, status: 'show'});
            }
        };
        separator.hide = function() {
            this.element.hide();
            //  emit event only if already intialized
            if(!separator.initialize) {
                objects.events.emit('iSpeak', {name: obj.name, status: 'hide'});
            }
        };

        // initial status
        if(separator.visible){
            separator.show();
        } else {
            separator.hide();
        }

        // set to false - we have initialized the element
        separator.initialize = false;
        
        // add the element to the main list
        objects.objList[obj.name] = separator;
    },

    // the slider element
    slider: function(obj, type)
    {
        // return if the received object is not corect;
        if(!helpers.hasSameProps(raphaelPaperSettings[type], obj)) { return false; }

        let slider = {
            name: obj.name,
            visible: (obj.isVisible == 'true') ? true : false,
            enabled: (obj.isEnabled == 'true') ? true : false,
            value: obj.value,
            element: {},
            conditions: objects.conditionsParser(obj.conditions),
            initialize: true,
        };

         // data to int
         let dataLeft = parseInt(obj.left);
         let dataTop = parseInt(obj.top);
         let dataWidth = parseInt(obj.length);
         let dataVal = parseFloat(obj.value);

         // check for user input
         if(dataLeft < 10 || dataLeft > paper.width - 10){ dataLeft = 10; }
         if(dataTop < 10 || dataTop > paper.height - 10){ dataTop = 10; }

        // width to big
        if(dataWidth < 50) { dataWidth = 50; }
        else if(dataWidth > paper.width - 30) { dataWidth = paper.width - 30; dataLeft = 15;}

        let v = parseInt(dataWidth) + parseInt(dataLeft);
        
        let line = this.path("M" + dataLeft + " " + dataTop + "L"+ v +" " + dataTop).attr({stroke: "#a0a0a0", "stroke-width": 2});
        let circleLeft = dataLeft + (dataWidth * dataVal);
        let circle = this.circle( circleLeft, dataTop, 7).attr({fill: "#a0a0a0", "cursor": "pointer"});
    
        let ox = 0;
        let oy = 0;
        circle.drag(
            function move(dx, dy){
                if (slider.enabled) {
                    lx = dx + ox;
                    ly = dy + oy;
                    if(lx <= -(dataWidth * dataVal)) {lx = -(dataWidth * dataVal); }
                    if(lx >= (dataWidth - (dataWidth * dataVal))) { lx = dataWidth - (dataWidth * dataVal); }

                    circle.transform('T' + lx + ',' + 0);
                }
            },
            function start(){},
            function end(){
                if (slider.enabled) {                
                    ox = lx;
                    oy = ly;
                    slider.value = Number(lx / dataWidth).toFixed(2); 
                    // say that the value has changed
                    objects.events.emit('iSpeak', {name: slider.name, status: 'value'});               
                }
            }
        );
        let set = this.set();
        set.push(line, circle);
        // save to elements
        slider.element = set;
        // listen for events / changes

        objects.events.on('iSpeak', function(data)
        {
            if(obj.name != data.name){
                objects.conditionsChecker(data, slider);
            }
        });
        
        // the slider's methods
        slider.show = function() {
            slider.element.show();
            //  emit event only if already intialized
            if(!slider.initialize) {            
                objects.events.emit('iSpeak', {name: slider.name, status: 'show'});
            }
        };
        slider.hide = function() {
            slider.element.hide();
            //  emit event only if already intialized
            if(!slider.initialize) {
                objects.events.emit('iSpeak', {name: slider.name, status: 'hide'});
            }
        };

        slider.enable = function() {
            slider.enabled = true;
            // first element in set is the line            
            slider.element.items[0].attr({stroke: "#a0a0a0"});
            // second element in the set is teh circle
            slider.element.items[1].attr({fill: "#a0a0a0", "cursor": "pointer", "stroke": "#000000", "stroke-width": 1});
            //  emit event only if already intialized
            if(!slider.initialize) {
                objects.events.emit('iSpeak', {name: slider.name, status: 'enable'});
            }
        };
        slider.disable = function() {
            slider.enabled = false;
            // first element in set is the line 
            slider.element.items[0].attr({stroke: '#cfcfcf'});
            // second element in the set is teh circle
            slider.element.items[1].attr({fill: "#cfcfcf", "stroke": "#cfcfcf", "stroke-width": 0.2, 'cursor': 'default'});
            //  emit event only if already intialized
            if(!slider.initialize) {
                objects.events.emit('iSpeak', {name: slider.name, status: 'disable'});
            }
        };

        // initial status
        if(slider.visible){
            slider.show();
        } else {
            slider.hide();
        }
        if(slider.enabled) {
            slider.enable();
        } else {
            slider.disable();
        }        

        // set to false - we have initialized the element
        slider.initialize = false;
        
        // add the element to the main list
        objects.objList[obj.name] = slider;
    },

    // Conditions =================================================================
    conditionsParser: function(str)
    {
        let isOK = conditions.parseConditions(str);
                        
        if(!isOK.error) {
            return {conditions: isOK.result, elements: isOK.elements};
        }
        return {conditions: [], elements: []};
    },
    conditionsChecker: function(data, element)
    {                
        // check condition only if the element that "speak" is affecting us
        if(element.conditions.elements.includes(data.name)){
            conditions.checkConditions(data, element, objects.objList);
        }
    },

    // Helper Functions ===========================================================
    // enable input editing
    customInput: function(width, height, x, y, oldValue, paper) 
    {    
        return new Promise((resolve, reject) => {
            let container = paper.canvas.parentNode;    
            let styles = "position: absolute; width: "+ (width) +"px; height: "+ (height) +"px; left: "+ x +"px; top: "+ y +"px; border: none; font-size: 14px; font-weight: 400; background: #ffffff; z-index:9000;";
            
            let input = document.createElement("input");

            input.setAttribute("style", styles);
            input.setAttribute("id", "inputEdit");
            input.value = oldValue;
            container.appendChild(input);
            input.focus();

            input.addEventListener('keyup', (event) => {
                if(event.keyCode === 13) {
                    input.blur();
                }
                if(event.keyCode === 27) {
                    resolve(oldValue);
                    input.blur();
                }
            });
            input.addEventListener('blur', (event) => {
                input.parentNode.removeChild(input);            
                resolve(input.value);
            });            
        });
    },

    // limit a text to a fix width
    limitTextOnWidth(text, width)
    {
        let textDim =  this.getTextDim(text, null);
        
        while(textDim.width > (width - 13))
        {
            text = text.substring(0, text.length - 5);
            textDim = this.getTextDim(text, null);           
        }
        return text;
    }
};  

module.exports = objects;
