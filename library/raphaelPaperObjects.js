/* eslint-disable no-console */
//// TO DO check if properties exists - we need this for import/open dialogs 

const EventEmitter = require('events');
const raphaelPaperSettings = require('./raphaelPaperSettings');
const helpers = require("./helpers");

var raphaelPaperObjects = {
    
    // the main paper
    paper: {},
    // list of all created objects
    objList: {},
    // helper for radiogroups
    radios: {},
    // main event thread
    events: new EventEmitter(),
    // available conditions
    conditions: ['isVisible', 'isNotVisible', 'isEnabled', 'isNotEnabled', 'isSelected', 'isNotSelected', 'isChecked', 'isNotChecked'],
    
    makeDialog: function(container) 
    {       
        if (((container.properties === void 0) == false) && helpers.hasSameProps(raphaelPaperSettings.dialog, container.properties)) {
            
            let props = container.properties;
            this.paper = Raphael('paper', props.width, props.height);
            this.paper.rect(0, 0, props.width, props.height).attr({'fill': '#fdfdfd'});
        }

         // verifica existenta unui paper
        if (this.paper.setSize && container.elements) {
            for (let key in container.elements) {
                this.makeObject(container.elements[key]);
            }
        }
    },
    // TO DO - add input element
    // create an object based on type
    makeObject: function(obj) 
    {
        let elType = obj.type.toLowerCase();
        switch(elType) {
            case "button": 
                this.button.call(this.paper, obj);
                break;
            case "checkbox":
                this.checkBox.call(this.paper, obj);
                break;
            case "input":
                this.input.call(this.paper, obj);
                break;
            case "radio": 
                this.radio.call(this.paper, this.radios, obj);
                break;
            case "label": 
                this.label.call(this.paper, obj);
                break;
            case "separator": 
                this.separator.call(this.paper, obj);
                break;
            case "counter": 
                this.counter.call(this.paper, obj);
                break;
            case "container": 
                this.container.call(this.paper, obj);
                break;
            case "select": 
                this.select.call(this.paper, obj, ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'], new EventEmitter());
                break;
        }
    },
    // ask an element
    askElement: function(name, property)
    {
        let resp;
        switch(property){
            case 'isEnabled':
                resp = raphaelPaperObjects.objList[name].enabled;    
                break;
            case 'isNotEnabled':
                resp = ! raphaelPaperObjects.objList[name].enabled;    
                break;
            case 'isVisible':
                resp = raphaelPaperObjects.objList[name].visible;    
                break;
            case 'isNotVisible':
                resp = ! raphaelPaperObjects.objList[name].visible;    
                break;
            case 'isChecked':
                resp = raphaelPaperObjects.objList[name].checked;    
                break;
            case 'isNotChecked':
                resp = ! raphaelPaperObjects.objList[name].checked;    
                break;
            case 'isSelected':
                resp = raphaelPaperObjects.objList[name].selected;    
                break;
            case 'isNotSelected':
                resp = ! raphaelPaperObjects.objList[name].selected;    
                break;
        }
        return resp;
    },

    // Elements =================================================================
    // button
    button: function(obj)
    {
        let button = {
            name: obj.name,
            visible: (obj.isVisible == 'true') ? true : false,
            enabled: (obj.isEnabled == 'true') ? true : false,
            element: {},
            conditions: raphaelPaperObjects.conditionsParser(obj.conditions),
            initialize: true,
        };

        // data to int
        let dataLeft = parseInt(obj.left);
        let dataTop = parseInt(obj.top);

        // temporary element to get the button's width
        let labelT = this.text(dataLeft, dataTop, obj.label).attr({"text-anchor": "middle", "font-size": 14});
        let lBBox = labelT.getBBox();
        labelT.remove();

        let elButton = {};
        elButton.rect = this.rect(dataLeft, dataTop, Math.round(lBBox.width)+20, Math.round(lBBox.height) + 10).attr({fill: "#f9f9f9", "stroke": "#eeeeee", "stroke-width": 0.7});
        elButton.txt = this.text(dataLeft+10, dataTop + ((Math.round(lBBox.height) / 2) + 5), obj.label).attr({"text-anchor": "start", "font-size": 14});

        elButton.cover = this.rect(dataLeft, dataTop, Math.round(lBBox.width)+20, Math.round(lBBox.height) + 10).attr({fill: "#eeeeee", stroke: "none", "fill-opacity": 0, "cursor": "pointer"});
        elButton.cover.click(function() 
        {
            // TO DO ---------------            
            if(button.enabled) {
                alert('clicked');
            }
        });

        button.element = elButton;

        // listen for events / changes
        raphaelPaperObjects.events.on('iSpeak', function(data)
        {
            if(obj.name != data.name){
                raphaelPaperObjects.conditionsChecker(data, button);
            }
        });
        // Properties
        // ===============================================================================
        button.show = function(){
            for( let i in button.element){
                button.element[i].show();
            }
            //  emit event only if already intialized
            if(!button.initialize) {
                raphaelPaperObjects.events.emit('iSpeak', {name: button.name, status: 'show'});
            }
        };
        button.hide = function(){
            for( let i in button.element){
                button.element[i].hide();
            }
            //  emit event only if already intialized
            if(!button.initialize) {
                raphaelPaperObjects.events.emit('iSpeak', {name: button.name, status: 'hide'});
            }
        };
        button.enable = function() {
            button.enabled = true;
            button.element.rect.attr({fill: "#f9f9f9", opacity: 1});
            button.element.txt.attr({opacity: 1});
            button.element.cover.attr({'cursor': 'pointer'});
            //  emit event only if already intialized
            if(!button.initialize) {
                raphaelPaperObjects.events.emit('iSpeak', {name: button.name, status: 'enable'});
            }
        };
        button.disable = function() {
            button.enabled = false;
            button.element.rect.attr({fill: "#000", opacity: 0.2});
            button.element.txt.attr({opacity: 0.2});
            button.element.cover.attr({'cursor': 'default'});
            //  emit event only if already intialized
            if(!button.initialize) {
                raphaelPaperObjects.events.emit('iSpeak', {name: button.name, status: 'disable'});
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
        raphaelPaperObjects.objList[obj.name] = button;
    },
    // checkbox
    checkBox: function(obj) 
    {        
        // x, y, isChecked, label, pos, dim, fontsize
        // checking / making properties
        if (helpers.missing(obj.top)) { obj.top = 10; }

        if (helpers.missing(obj.left)) { obj.left = 10; }

        if (helpers.missing(obj.isChecked)) { obj.isChecked = false; }

        if (helpers.missing(obj.label)) { obj.label = ""; }

        if (helpers.missing(obj.pos)) { obj.pos = 5; }

        if (helpers.missing(obj.dim)) { obj.dim = 12; }

        if (helpers.missing(obj.fontsize)) { obj.fontsize = 12; }
        

        let checkBox = {
            name: obj.name,
            visible: (obj.isVisible == 'true') ? true : false,
            checked: (obj.isChecked == 'true') ? true : false,
            enabled: (obj.isEnabled == 'true') ? true : false,
            element: {},
            conditions: raphaelPaperObjects.conditionsParser(obj.conditions),
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
        cbElement.label = this.text(xpos, ypos, obj.label).attr({"text-anchor": txtanchor, "font-size": (obj.fontsize + "px")});
        // the box
        cbElement.box = this.rect(parseInt(obj.left), parseInt(obj.top), obj.dim, obj.dim).attr({fill: (checkBox.checked)?"#97bd6c":"#eeeeee","stroke-width": 1.2, stroke: "#a0a0a0"});
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
                        raphaelPaperObjects.events.emit('iSpeak', {name: obj.name, status: 'isChecked'});
                    } else {
                        // the element is unchecked
                        cbElement.box.attr({fill: "#eeeeee"});
                        cbElement.chk.hide();
                        raphaelPaperObjects.events.emit('iSpeak', {name: obj.name, status: 'isNotChecked'});
                    }
                }
            });
        
        // both are useful: for the cover to be able to generically
        // specify if (this.active) {... upon click
        cbElement.cover.checked = true;

        checkBox.element = cbElement;
        // listen for events / changes
        raphaelPaperObjects.events.on('iSpeak', function(data)
        {
            if(data.name != obj.name) {
                raphaelPaperObjects.conditionsChecker(data, checkBox);
            }
        });
        // Properties
        // ===============================================================================
        // checkbox is enabled
        checkBox.enable = function() {
            checkBox.enabled = true;
            checkBox.element.cover.active = true;
            checkBox.element.cover.attr({fill: "#000", opacity: 0, cursor: "pointer"});
            //  emit event only if already intialized
            if(!checkBox.initialize) {
                raphaelPaperObjects.events.emit('iSpeak', {name: obj.name, status: 'enable'});
            }
        };
        // checkbox is not enabled
        checkBox.disable = function() {
            checkBox.enabled = false;
            checkBox.element.cover.active = false;
            checkBox.element.cover.attr({fill: "#000", opacity: 0.2, cursor: "default"});
            //  emit event only if already intialized
            if(!checkBox.initialize) {
                raphaelPaperObjects.events.emit('iSpeak', {name: obj.name, status: 'disable'});
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
                raphaelPaperObjects.events.emit('iSpeak', {name: obj.name, status: 'check'});
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
                raphaelPaperObjects.events.emit('iSpeak', {name: obj.name, status: 'uncheck'});
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
                raphaelPaperObjects.events.emit('iSpeak', {name: obj.name, status: 'show'});
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
                raphaelPaperObjects.events.emit('iSpeak', {name: obj.name, status: 'hide'});
            }
        };
        
        // refresh checkbox - TO check if still needed
        checkBox.refresh = function(x) {
            if (x) { checkBox.isChecked(); }
            else { checkBox.isNotChecked(); }
            //  emit event only if already intialized
            if(!checkBox.initialize) {
                raphaelPaperObjects.events.emit('iSpeak', {name: obj.name, status: 'refresh'});
            }
        };
        
        // moving the checkbox
        // var cbset = this.set(cb.box, cb.chk, cb.cover);
        // cb.move = function(x, y) {
        //     cbset.transform("t" + x + "," + y);
        // };
        
        // Setting the initial properties
        // is the element checked ?            
        if (checkBox.checked) {
            checkBox.check();
        } else {
            checkBox.uncheck();
        }
        // is the element enabled ?
        if (checkBox.enabled) {
            checkBox.enable();
        } else {
            checkBox.disable();
        }
        // is the element visible? 
        if (checkBox.visible) {
            checkBox.show();
        } else {
            checkBox.hide();
        }

        // set to false - we have initialized the element
        checkBox.initialize = false;

        // add the element to the main list
        raphaelPaperObjects.objList[obj.name] = checkBox;
    },
    // container
    // TO DO --- add data functionality
    container: function(obj, data)
    {
        let container = {
            name: obj.name,
            visible: (obj.isVisible == 'true') ? true : false,
            enabled: (obj.isEnabled == 'true') ? true : false,
            element: {},
            conditions: raphaelPaperObjects.conditionsParser(obj.conditions),
            initialize: true,
        };

        // data to int
        let dataLeft = parseInt(obj.left);
        let dataTop = parseInt(obj.top);

        // check for user input
        if(obj.width < 50) { obj.width = 50; }
        else if(obj.width > paper.width - 15) { obj.width = paper.width - 30; dataLeft = 15;}

        if(obj.height < 50) { obj.height = 50; }
        else if(obj.height > paper.height - 15) { obj.height = paper.height - 30; dataTop = 15; }

        container.element = this.rect(dataLeft, dataTop, obj.width, obj.height).attr({fill: "#FFF", "stroke": "#d6d6d6", "stroke-width": 0.7});

        // listen for events / changes
        raphaelPaperObjects.events.on('iSpeak', function(data)
        {
            if(obj.name != data.name){
                raphaelPaperObjects.conditionsChecker(data, button);
            }
        });
        // Properties
        // ===============================================================================
        container.show = function(){
            container.element.show();
            //  emit event only if already intialized
            if(!container.initialize) {
                raphaelPaperObjects.events.emit('iSpeak', {name: container.name, status: 'show'});
            }
        };
        container.hide = function(){
            container.element.hide();
            //  emit event only if already intialized
            if(!container.initialize) {
                raphaelPaperObjects.events.emit('iSpeak', {name: container.name, status: 'hide'});
            }
        };
        container.enable = function() {
            container.enabled = true;
            container.element.attr({fill: "#fff", opacity: 1});
            //  emit event only if already intialized
            if(!container.initialize) {
                raphaelPaperObjects.events.emit('iSpeak', {name: container.name, status: 'enable'});
            }
        };
        container.disable = function() {
            container.enabled = false;
            container.element.attr({fill: "#d6d6d6", opacity: 0.2});
            //  emit event only if already intialized
            if(!container.initialize) {
                raphaelPaperObjects.events.emit('iSpeak', {name: container.name, status: 'disable'});
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
        raphaelPaperObjects.objList[obj.name] = container;     

    },
    // counter
    // TO DO --- emit event on value change
    counter: function(obj) 
    {
        let counter = {
            name: obj.name,
            visible: (obj.isVisible == 'true') ? true : false,
            enabled: (obj.isEnabled == 'true') ? true : false,
            value: parseInt(obj.startval),
            element: {},
            conditions: raphaelPaperObjects.conditionsParser(obj.conditions),
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
        
        elCounter.down = this.rect((dataLeft - (obj.width / 2)) - 14, dataTop - 7, 15, 15)
            .attr({fill: "#fff", opacity: 0, stroke: "#000", "stroke-width": 1, cursor: "pointer"})
            .click(function() {
                if(counter.enabled) {
                    if (counter.value > parseInt(obj.startval)) {
                        counter.value -= 1;
                        elCounter.textvalue.attr({"text": ("" + counter.value)});
                        // TO DO  --- emit event ?
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
                        // TO DO  --- emit event ?
                    }
                }
            });

        counter.element = elCounter;   

        // listen for events / changes - must be declared before thee emit events
        raphaelPaperObjects.events.on('iSpeak', function(data)
        {
            if(obj.name != data.name){
                raphaelPaperObjects.conditionsChecker(data, counter);
            }
        }); 
        // Properties
        // ===============================================================================
        counter.show = function() {
            for (let i in counter.element){
                counter.element[i].show();
            }
            //  emit event only if already intialized
            if(!counter.initialize) {
                raphaelPaperObjects.events.emit('iSpeak', {name: counter.name, status: 'show'});
            }
        };
        counter.hide = function() {
            for (let i in counter.element){
                counter.element[i].hide();
            }
            //  emit event only if already intialized
            if(!counter.initialize) {
                raphaelPaperObjects.events.emit('iSpeak', {name: counter.name, status: 'hide'});
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
                raphaelPaperObjects.events.emit('iSpeak', {name: counter.name, status: 'enable'});
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
                raphaelPaperObjects.events.emit('iSpeak', {name: counter.name, status: 'disable'});
            }
        };
                
        // initial status
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
        container.initialize = false;
        // add the element to the main list
        raphaelPaperObjects.objList[obj.name] = counter;
    }, 
    // input
    // TO DO -- add input capabilities
    input: function(obj)
    {
        let input = {
            name: obj.name,
            value: obj.value,
            visible: (obj.isVisible == 'true') ? true : false,
            enabled: (obj.isEnabled == 'true') ? true : false,
            element: {},
            conditions: raphaelPaperObjects.conditionsParser(obj.conditions),
            initialize: true,
        };

        // data to int
        let dataLeft = parseInt(obj.left);
        let dataTop = parseInt(obj.top);

        let elinput = {};
        elinput.rect = this.rect(dataLeft, dataTop, obj.width, 25).attr({fill: "#ffffff", "stroke": "#bbbbbb", "stroke-width": 0.7});
        if(obj.value.trim() != '') {
            elinput.txt = this.text(dataLeft+7, dataTop + 12, obj.value).attr({"text-anchor": "start", "font-size": 14});
        }

        elinput.cover = this.rect(dataLeft, dataTop, obj.width, 25).attr({fill: "#eeeeee", stroke: "none", "fill-opacity": 0, "cursor": "text"});
        elinput.cover.click(function() 
        {
            // TO DO ---------------            

        });

        input.element = elinput;

        // listen for events / changes
        raphaelPaperObjects.events.on('iSpeak', function(data)
        {
            if(obj.name != data.name){
                raphaelPaperObjects.conditionsChecker(data, input);
            }
        });
        // Properties
        // ===============================================================================
        input.show = function(){
            for( let i in input.element){
                input.element[i].show();
            }
            //  emit event only if already intialized
            if(!input.initialize) {
                raphaelPaperObjects.events.emit('iSpeak', {name: input.name, status: 'show'});
            }
        };
        input.hide = function(){
            for( let i in input.element){
                input.element[i].hide();
            }
            //  emit event only if already intialized
            if(!input.initialize) {
                raphaelPaperObjects.events.emit('iSpeak', {name: input.name, status: 'hide'});
            }
        };
        input.enable = function() {
            input.enabled = true;
            // input.element.rect.attr({fill: "#f9f9f9", opacity: 1});
            // input.element.txt.attr({opacity: 1});
            // input.element.cover.attr({'cursor': 'pointer'});
            //  emit event only if already intialized
            if(!input.initialize) {
                raphaelPaperObjects.events.emit('iSpeak', {name: input.name, status: 'enable'});
            }
        };
        input.disable = function() {
            input.enabled = false;
            // input.element.rect.attr({fill: "#000", opacity: 0.2});
            // input.element.txt.attr({opacity: 0.2});
            // input.element.cover.attr({'cursor': 'default'});
            //  emit event only if already intialized
            if(!input.initialize) {
                raphaelPaperObjects.events.emit('iSpeak', {name: input.name, status: 'disable'});
            }
        };

        // initialize
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
        raphaelPaperObjects.objList[obj.name] = input;
    },       
    // label
    label: function(obj)
    {
        let label = {
            name: obj.name,
            visible: (obj.isVisible == 'true') ? true : false,
            element: {},
            conditions: raphaelPaperObjects.conditionsParser(obj.conditions),
            initialize: true,
        };

        // TO DO check if properties exists - we need this for import/open dialogs
        label.element = this.text(obj.left, obj.top, obj.text).attr({'fill': '#000000', "font-size": obj.fontSize, 'text-anchor': 'start'});
     
        // listen for events / changes
        raphaelPaperObjects.events.on('iSpeak', function(data)
        {
            console.log(data);
            
            if(obj.name != data.name){
                raphaelPaperObjects.conditionsChecker(data, label);
            }
        });
        // Properties
        // ===============================================================================
        label.show = function() {
            this.element.show();
            //  emit event only if already intialized
            if(!label.initialize) {
                raphaelPaperObjects.events.emit('iSpeak', {name: obj.name, status: 'show'});
            }
        };
        label.hide = function() {
            this.element.hide();
            //  emit event only if already intialized
            if(!label.initialize) {
                raphaelPaperObjects.events.emit('iSpeak', {name: obj.name, status: 'hide'});
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
        raphaelPaperObjects.objList[obj.name] = label;
    },
    // separator
    separator: function(obj)
    {
        // return if the received object is not corect;
        if(!helpers.hasSameProps(raphaelPaperSettings[obj.type], obj)) { return false; }

        let separator = {
            name: obj.name,
            visible: (obj.isVisible == 'true') ? true : false,
            element: {},
            conditions: raphaelPaperObjects.conditionsParser(obj.conditions),
            initialize: true,
        };

        // TO DO check if properties exists - we need this for import/open dialogs
        if(obj.direction == 'x') {
            
            if(obj.length < 10 || obj.length > this.width - 20){ obj.length = 300; }
            let v = parseInt(obj.length) + parseInt(obj.left);
            separator.element = this.path("M" + obj.left + " " + obj.top + "L"+ v +" " + obj.top).attr({stroke: "#ccc"});
        } 
        else if(obj.direction == 'y') {

            if(obj.length < 10 || obj.length > this.height - 20){ obj.length = 300; }
            let v = parseInt(obj.length) + parseInt(obj.top);
            separator.element = this.path("M" + obj.left + " " + obj.top + "L" + obj.left + " " + v).attr({stroke: "#ccc"});
        }

        // listen for events / changes
        raphaelPaperObjects.events.on('iSpeak', function(data)
        {
            if(obj.name != data.name){
                raphaelPaperObjects.conditionsChecker(data, separator);
            }
        });
        // Properties
        // ===============================================================================
        separator.show = function() {
            this.element.show();
            //  emit event only if already intialized
            if(!separator.initialize) {            
                raphaelPaperObjects.events.emit('iSpeak', {name: obj.name, status: 'show'});
            }
        };
        separator.hide = function() {
            this.element.hide();
            //  emit event only if already intialized
            if(!separator.initialize) {
                raphaelPaperObjects.events.emit('iSpeak', {name: obj.name, status: 'hide'});
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
        raphaelPaperObjects.objList[obj.name] = separator;
    },
    // radio
    radio: function(radios, obj) 
    {
        let radio = {
            name: obj.name,
            group: obj.radioGroup,
            visible: (obj.isVisible == 'true') ? true : false,
            enabled: (obj.isEnabled == 'true') ? true : false,
            selected: (obj.isSelected == 'true') ? true : false,
            element: {},
            conditions: raphaelPaperObjects.conditionsParser(obj.conditions),
            initialize: true,
        };
        
        if (helpers.missing(obj.size)) { obj.size = 7; }
        if (helpers.missing(obj.vertspace)) { obj.vertspace = 25; }
         // horizontal matrix
        // if (helpers.missing(obj.horspace)) { obj.horspace = helpers.rep(0, obj.labels.length); }
        // if (helpers.missing(obj.lbspace)) { obj.lbspace = 14; }
        if (helpers.missing(obj.fontsize)) { obj.fontsize = 14; }
        
        // initializing the radioGroup
        if(radios[obj.radioGroup] == void 0){
            radios[obj.radioGroup] = {};
        }
    
        // data
        let dataLeft = parseInt(obj.left);
        let dataTop = parseInt(obj.top);

        if(!Array.isArray(radios[obj.radioGroup].label)){ radios[obj.radioGroup].label = []; }
        if(!Array.isArray(radios[obj.radioGroup].cover)){ radios[obj.radioGroup].cover = []; }
        if(!Array.isArray(radios[obj.radioGroup].circle)){ radios[obj.radioGroup].circle = []; }
        if(!Array.isArray(radios[obj.radioGroup].fill)){ radios[obj.radioGroup].fill = []; }
    
        // making / geting last index of the group
        var indexEl = 0;
        if(radios[obj.radioGroup].label.length > 2) {
            indexEl = radios[obj.radioGroup].label.length - 1;
        } else {
            indexEl = radios[obj.radioGroup].label.length;
        }
        // saving the index
        radio.index = indexEl;

        let cColor = obj.isEnabled == 'true' ? "#eeeeee" : "#6c757d";
        let tColor = obj.isEnabled == 'true' ? "#000000" : "#6c757d";
        radios[obj.radioGroup].label[indexEl] = this.text(dataLeft + 15, dataTop, obj.label).attr({"text-anchor": "start", "font-size": obj.fontsize+"px", fill:tColor});
        radios[obj.radioGroup].circle[indexEl] = this.circle(dataLeft, dataTop, obj.size).attr({fill: cColor, "stroke": "#a0a0a0", "stroke-width": 1.2});
        
        // selected - initial hide
        radios[obj.radioGroup].fill[indexEl] = this.set();
        // the interior green circle
        radios[obj.radioGroup].fill[indexEl].push(this.circle(dataLeft, dataTop, obj.size - 0.5).attr({fill: "#97bd6c", stroke: "none"}));
        // the interior black smaller circle
        radios[obj.radioGroup].fill[indexEl].push(this.circle(dataLeft, dataTop, obj.size - 4.5).attr({fill: "#000000", stroke: "none"}));
        // add iD
        // set data to the fisrt element of the set | as of 2.1 set cannot have data
        radios[obj.radioGroup].fill[indexEl][0].data('elementName', obj.name);
        radios[obj.radioGroup].fill[indexEl].hide();


        radios[obj.radioGroup].cover[indexEl] =  this.circle(dataLeft, dataTop, obj.size + 2).attr({fill: "#eeeeee", stroke: "none", "fill-opacity": 0, "cursor": "pointer"});
        radios[obj.radioGroup].cover[indexEl].i = indexEl;
        radios[obj.radioGroup].cover[indexEl].click(function() 
        {
            if(radio.enabled) {
                radios[obj.radioGroup].fill.forEach(function(element, index) 
                {           
                    if(index == indexEl){
                        element.show();
                        // element[0].data('elementName')
                        raphaelPaperObjects.events.emit('iSpeak', {name: radio.name, status: 'select'});
                    }else{
                        element.hide();
                        raphaelPaperObjects.events.emit('iSpeak', {name: radio.name, status: 'deselect'});
                    }
                });
            }
        });

        // listen for events / changes
        raphaelPaperObjects.events.on('iSpeak', function(data)
        {
            if(obj.name != data.name){
                raphaelPaperObjects.conditionsChecker(data, radio);
            }
        });
        // Properties
        // ===============================================================================
        radio.show = function() {
            radios[radio.group].fill.forEach(function(element, index) {                                       
                if(index == radio.index) {
                    element.show();
                } else {
                    element.hide();
                }
            });
            //  emit event only if already intialized
            if(!radio.initialize) {
                raphaelPaperObjects.events.emit('iSpeak', {name: radio.name, status: 'show'});
            }
        };
        radio.hide = function() {
            radios[radio.group].fill.forEach(function(element, index) {                                       
                if(index == radio.index){
                    element.hide();
                }
            });
            //  emit event only if already intialized
            if(!radio.initialize) {            
                raphaelPaperObjects.events.emit('iSpeak', {name: radio.name, status: 'hide'});
            }
        };

        radio.enable = function() {
            radio.enabled = true;
            //  emit event only if already intialized
            if(!radio.initialize) {            
                raphaelPaperObjects.events.emit('iSpeak', {name: radio.name, status: 'enable'});
            }
        };
        radio.disable = function() {
            radio.enabled = false;
            //  emit event only if already intialized
            if(!radio.initialize) {            
                raphaelPaperObjects.events.emit('iSpeak', {name: radio.name, status: 'disable'});
            }
        };

        radio.select = function() {
            radios[radio.group].fill[radio.index].show();
            //  emit event only if already intialized
            if(!radio.initialize) {            
                raphaelPaperObjects.events.emit('iSpeak', {name: radio.name, status: 'select'});
            }
        };
        radio.deselect = function() {
            radios[radio.group].fill[radio.index].hide();
            //  emit event only if already intialized
            if(!radio.initialize) {            
                raphaelPaperObjects.events.emit('iSpeak', {name: radio.name, status: 'deselect'});
            }
        };

        // initial status
        if(radio.visible){
            radio.show();
        } else {
            radio.hide();
        }
        if(radio.enabled){
            radio.enable();
        } else {
            radio.disable();
        }        
        if(radio.selected){
            radio.select();
        } else {
            radio.deselect();
        }        

        // set to false - we have initialized the element
        radio.initialize = false;
        // add the element to the main list
        raphaelPaperObjects.objList[obj.name] = radio;        
    },
    // select
    select: function(obj, list, eventMe)
    {
        // TO DO - resize paper and DIV based on show and hide

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

        let rect = newPaper.rect(5, 5, dataWidth, 25).attr({fill: "#FFFFFF", "stroke": "#333333", "stroke-width": 0.2});  
        
        // show show something is selected
        let selected = newPaper.text(13, 18, 'Selected').attr({"text-anchor": "start",fill: "#333333", "font-size": "14px"}).hide();      
        eventMe.on('selected', function() {
            selected.show();
        });
        eventMe.on('deSelected', function() {
            selected.hide();
        });

        let downsign = newPaper.path([
            ["M", dataWidth - 10 , 13 ],
            ["l", 8, 0],
            ["l", -4, 8],
            ["z"]
        ]).attr({fill: "#333333", "stroke-width": 0});
        let upsign = newPaper.path([
            ["M", dataWidth - 10 , 21 ],
            ["l", 8, 0],
            ["l", -4, -8],
            ["z"]
        ]).attr({fill: "#333333", "stroke-width": 0}).hide();
        
        let showList = newPaper.rect(8 , 8, dataWidth - 6, 19).attr({fill: "#FF0000", "opacity": 0, "cursor": "pointer"});        

        showList.click(function(){
            if(listSet[0].data('visible')) {
                listSet.hide();
                listSet[0].data('visible', 0);
                downsign.show();
                upsign.hide();
                // resize div and paper
                div.style.height = '32px';
                newPaper.setSize((dataWidth + 10), 30);
            } else {
                listSet.show();
                listSet[0].data('visible', 1);
                downsign.hide();
                upsign.show();
                // resize div and paper
                div.style.height = ((list.length * 25) + 43) + 'px';
                newPaper.setSize(dataWidth + 10, ((list.length * 25) + 43));
            }
        });

        // Element list =====================================================
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
                this.attr({"fill": "blue", "opacity": 0.5});   
                this.data('clicked', 1);
                eventMe.emit('selected');
            } else {
                eventMe.emit('deSelected');
                this.attr({fill: "#eeeeee", "opacity": 0}).data('clicked', 0);
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
        
        for(let i = 0; i < list.length; i++) {
            txt[i] = newPaper.text(10, position+3, list[i]).attr({"text-anchor": "start", "font-size": 14, fill: '#333333'}).hide();
            cover[i] = newPaper.rect(5 , position-10, dataWidth, 25).attr({fill: "#eeeeee", "opacity": 0, "cursor": "pointer", stroke: 0})
                            .hide()
                            .data('clicked', 0)
                            .click( elClicked )
                            .hover( elIn, elOut );
            listSet.push( txt[i], cover[i] );
            position += 25;
        }        
    },

    // Conditions =================================================================
    conditionsParser: function(str)
    {
        return {};
    },
    conditionsChecker: function(data, raphaelObject)
    {
        return false;
    }

};  

module.exports = raphaelPaperObjects;
