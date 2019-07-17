/* eslint-disable no-console */
//// TO DO check if properties exists - we need this for import/open dialogs 

const EventEmitter = require('events');
const raphaelPaperSettings = require('./raphaelPaperSettings');
const helpers = require("./helpers");

var raphaelPaperObjects = {
    
    paper: {},
    radios: {},
    events: new EventEmitter(),
    
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
    makeObject: function(obj) 
    {        
        let elType = obj.type.toLowerCase();
        switch(elType) {
            case "checkbox":
                this.checkBox.call(this.paper, obj);
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
            case "button": 
                this.button.call(this.paper, obj);
                break;
            case "container": 
                this.container.call(this.paper, obj);
                break;
            case "select": 
                this.select.call(this.paper, obj, ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'], new EventEmitter());
                break;
        }
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

        if (helpers.missing(obj.pos)) { obj.pos = 3; }

        if (helpers.missing(obj.dim)) { obj.dim = 12; }

        if (helpers.missing(obj.fontsize)) { obj.fontsize = 12; }
        
        var cb = [];
        cb.active = true;
        
        // an array because the label might be arranged on multiple lines
        cb.label = new Array(1);
        
        var txtanchor = "start";
        var xpos = parseInt(obj.left);
        var ypos = parseInt(obj.top);
        if (obj.pos == 1) { // left
            xpos -= 8;
            ypos += obj.dim / 2;
            txtanchor = "end";
        }
        else if (obj.pos == 2) { // above
            xpos += obj.dim / 2;
            ypos -= obj.dim;
            txtanchor = "middle";
        }
        else if (obj.pos == 3) { // right
            xpos += 20;
            ypos += obj.dim / 2;
        }
        else { // below
            xpos += obj.dim / 2;
            ypos += 5;
            txtanchor = "middle";
        }
        
        cb.label[0] = this.text(xpos, ypos, obj.label)
            .attr({"text-anchor": txtanchor, "font-size": (obj.fontsize + "px")});
        
        cb.box = this.rect(parseInt(obj.left), parseInt(obj.top), obj.dim, obj.dim)
            .attr({fill: (obj.isChecked === 'true')?"#97bd6c":"#eeeeee","stroke-width": 1.2, stroke: "#a0a0a0"});
        
        cb.chk = this.path([
            ["M", parseInt(obj.left) + 0.2*obj.dim, parseInt(obj.top) + 0.3*obj.dim],
            ["l", 0.15*obj.dim*2, 0.2*obj.dim*2],
            ["l", 0.3*obj.dim*2, -0.45*obj.dim*2]
        ]).attr({"stroke-width": 2});
        
            
        if (obj.isChecked === 'true') {
            cb.box.attr({fill: "#97bd6c"});
            cb.chk.show();
        }
        else {
            cb.box.attr({fill: "#eeeeee"});
            cb.chk.hide();
        }
        
        // obj.isChecked comes as string
        cb.isChecked = (obj.isChecked == 'true') ? true : false;
        
        
        // the cover needs to be drawn last, to cover all other drawings (for click events)
        cb.cover = this.rect(parseInt(obj.left), parseInt(obj.top), obj.dim, obj.dim)
            .attr({fill: "#fff", opacity: 0, cursor: "pointer"})
            .click(function() {
                if (cb.active) {
                    cb.isChecked = !cb.isChecked;
                    this.isChecked = cb.isChecked;
                    
                    if (cb.isChecked) {
                        cb.box.attr({fill: "#97bd6c"});
                        cb.chk.show();
                        raphaelPaperObjects.events.emit('clicked', obj.name);
                    }
                    else {
                         cb.box.attr({fill: "#eeeeee"});
                         cb.chk.hide();
                         raphaelPaperObjects.events.emit('unClicked', obj.name);
                    }
                }
            });
        
        // both are useful: for the cover to be able to generically
        // specify if (this.active) {... upon click
        cb.cover.active = true;
        
        cb.activate = function() {
            cb.active = true;
            cb.cover.active = true;
            cb.cover.attr({fill: "#000", opacity: 0, cursor: "pointer"});
        };
            
        cb.deactivate = function() {
            cb.active = false;
            cb.cover.active = false;
            cb.cover.attr({fill: "#000", opacity: 0.2, cursor: "default"});
        };
        
        cb.uncheck = function() {
            cb.isChecked = false;
            cb.box.attr({fill: "#eeeeee"});
            cb.chk.hide();
            cb.cover.isChecked = false;
            raphaelPaperObjects.events.emit('unClicked', obj.name);
        };
        
          
        cb.check = function() {
            cb.isChecked = true;
            cb.box.attr({fill: "#97bd6c"});
            cb.chk.show();
            cb.cover.isChecked = true;
            raphaelPaperObjects.events.emit('clicked', obj.name);
        };
        
        cb.refresh = function(x) {
            if (x) {
                cb.check();
            }
            else {
                cb.uncheck();
            }
        };
        
        cb.hideIt = function() {
            cb.cover.hide();
            cb.box.hide();
            cb.chk.hide();
            for (var i = 0; i < cb.label.length; i++) {
                cb.label[i].hide();
            }
        };
        
        cb.showIt = function() {
            cb.cover.show();
            cb.box.show();
            
            if (cb.isChecked) {
                cb.chk.show();
            }
            else {
                cb.chk.hide();
            }
            
            for (var i = 0; i < cb.label.length; i++) {
                cb.label[i].show();
            }
        };
        
        var cbset = this.set(cb.box, cb.chk, cb.cover);
        
        cb.move = function(x, y) {
            cbset.transform("t" + x + "," + y);
        };
        

        raphaelPaperObjects.events.on('clicked', function(data){
            console.log('clicked: '+data);
            if(data == obj.conditions & !cb.isChecked){
                cb.check();
            }
        });
        raphaelPaperObjects.events.on('unClicked', function(data){
            console.log('unClicked: '+data);
            if(data == obj.conditions & cb.isChecked){
                cb.uncheck();
            }
        });


        // return(cb);
    },
    // label
    label: function(obj)
    {
        // TO DO check if properties exists - we need this for import/open dialogs
        this.text(obj.left, obj.top, obj.text).attr({fill: '#000', "font-size": obj.fontSize, 'text-anchor': 'start'});
    },
    // separator
    separator: function(obj)
    {
        // TO DO check if properties exists - we need this for import/open dialogs
        if(obj.direction == 'x') {
            
            if(obj.length < 10 || obj.length > this.width - 20){ obj.length = 300; }
            let v = parseInt(obj.length) + parseInt(obj.left);
            this.path("M" + obj.left + " " + obj.top + "L"+ v +" " + obj.top).attr({stroke: "#ccc"});
        } 
        else if(obj.direction == 'y') {

            if(obj.length < 10 || obj.length > this.height - 20){ obj.length = 300; }
            let v = parseInt(obj.length) + parseInt(obj.top);
            this.path("M" + obj.left + " " + obj.top + "L" + obj.left + " " + v).attr({stroke: "#ccc"});
        }
    },
    // radio
    radio: function(radios, obj) 
    {
        if (helpers.missing(obj.size)) { obj.size = 6.5; }
        
        if (helpers.missing(obj.vertspace)) { obj.vertspace = 25; }
        
         // horizontal matrix
        // if (helpers.missing(obj.horspace)) { obj.horspace = helpers.rep(0, obj.labels.length); }
        
        // if (helpers.missing(obj.lbspace)) { obj.lbspace = 14; }
        
        if (helpers.missing(obj.fontsize)) { obj.fontsize = 12; }
        
        // console.log(radios);
        
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
    
        
        var indexEl = 0;
        // console.log(radios[obj.radioGroup].label.length);
        if(radios[obj.radioGroup].label.length > 2) {
            indexEl = radios[obj.radioGroup].label.length - 1;
        } else {
            indexEl = radios[obj.radioGroup].label.length;
        }

        let cColor = obj.isEnabled == 'true' ? "#eeeeee" : "#6c757d";
        let tColor = obj.isEnabled == 'true' ? "#000000" : "#6c757d";
        radios[obj.radioGroup].label[indexEl] = this.text(dataLeft + 15, dataTop, obj.label).attr({"text-anchor": "start", "font-size": obj.fontsize+"px", fill:tColor});
        radios[obj.radioGroup].circle[indexEl] = this.circle(dataLeft, dataTop, obj.size).attr({fill: cColor, "stroke": "#a0a0a0", "stroke-width": 1.2});
        
        // if(radios[obj.radioGroup].fill == void 0){
            radios[obj.radioGroup].fill[indexEl] = this.set();
        
            // the interior green circle
            radios[obj.radioGroup].fill[indexEl].push(this.circle(dataLeft, dataTop, obj.size - 0.5).attr({fill: "#97bd6c", stroke: "none"}));
            // the interior black smaller circle
            radios[obj.radioGroup].fill[indexEl].push(this.circle(dataLeft, dataTop, obj.size - 4.5).attr({fill: "#000000", stroke: "none"}));
            // add iD
            
            // set data to the fisrt element of the set | as of 2.1 set cannot have data
            radios[obj.radioGroup].fill[indexEl][0].data('elementName', obj.name);
            
            radios[obj.radioGroup].fill[indexEl].hide();

        // }

        //the covers, for click events
        if(obj.isEnabled == 'true') {
            radios[obj.radioGroup].cover[indexEl] =  this.circle(dataLeft, dataTop, obj.size + 2).attr({fill: "#eeeeee", stroke: "none", "fill-opacity": 0, "cursor": "pointer"});
            radios[obj.radioGroup].cover[indexEl].i = indexEl;
            radios[obj.radioGroup].cover[indexEl].click(function() 
            {
                radios[obj.radioGroup].fill.forEach(function(element, index) 
                {           
                    if(index == indexEl){
                        element.show();
                        raphaelPaperObjects.events.emit('clicked', element[0].data('elementName'));
                    }else{
                        element.hide();
                        raphaelPaperObjects.events.emit('unClicked', element[0].data('elementName'));
                    }
                });
            });
        }
        
        if(obj.isSelected == 'true') {
            radios[obj.radioGroup].fill[indexEl].show();
        }

    
        raphaelPaperObjects.events.on('clicked', function(data){
            console.log('clicked: '+data);
            if(data == obj.conditions){
                radios[obj.radioGroup].label[indexEl].attr({fill: "#FF0000"});
            }            
        });
        raphaelPaperObjects.events.on('unClicked', function(data){
            console.log('unClicked: '+data);
            if(data == obj.conditions){
                radios[obj.radioGroup].label[indexEl].attr({fill: "#000000"});
            }
        });
        
        radios[obj.radioGroup].hideIt = function() {
            radios[obj.radioGroup].fill.forEach(function(element, index) {                                       
                if(index == indexEl){
                    element.hide();
                }
            });
            raphaelPaperObjects.events.emit('unClicked', obj.name);
        };
        
        radios[obj.radioGroup].showIt = function() {
            radios[obj.radioGroup].fill.forEach(function(element, index) {                                       
                if(index == indexEl){
                    element.show();
                }else{
                    element.hide();
                }
            });  
            raphaelPaperObjects.events.emit('clicked', obj.name);
        };
        
        // return(rd);
        
    },
    // counter
    counter: function(obj) 
    {
    
        if (helpers.missing(obj.fontsize)) { obj.fontsize = 14; }
        
        if (helpers.missing(obj.width)) { obj.width = 20; }
        
        var cntr = [];
        cntr.active = true;
        cntr.value = parseInt(obj.startval);
        
        // data to int
        let dataLeft = parseInt(obj.left) + 22;
        let dataTop = parseInt(obj.top) ;
        
        var txtanchor = "middle";
        
        // cntr.textlabel = this.text(dataLeft, dataTop, "")
        //     .attr({"text-anchor": txtanchor, "font-size": obj.fontsize + "px"});
        
        cntr.textvalue = this.text(dataLeft, dataTop, "" + obj.startval)
            .attr({"text-anchor": txtanchor, "font-size": obj.fontsize + "px"});
        
        
        cntr.downsign = this.path([
            ["M", dataLeft - 12 - obj.width / 2, dataTop - 5],
            ["l", 12, 0],
            ["l", -6, 12],
            ["z"]
        ]).attr({fill: "#eeeeee", "stroke-width": 1.2, stroke: "#a0a0a0"});
        
        cntr.upsign = this.path([
            ["M", dataLeft + obj.width / 2, dataTop + 5],
            ["l", 12, 0],
            ["l", -6, -12],
            ["z"]
        ]).attr({fill: "#eeeeee", "stroke-width": 1.2, stroke: "#a0a0a0"});
        
        cntr.down = this.rect(dataLeft - 22, dataTop - 6, 15, 15)
            .attr({fill: "#fff", opacity: 0, stroke: "#000", "stroke-width": 1, cursor: "pointer"})
            .click(function() {
                if (cntr.value > parseInt(obj.startval)) {
                    cntr.value -= 1;
                    cntr.textvalue.attr({"text": ("" + cntr.value)});
                }
            });
        
        cntr.up = this.rect(dataLeft + 8, dataTop - 8, 15, 15)
            .attr({fill: "#fff", opacity: 0, stroke: "#000", "stroke-width": 1, cursor: "pointer"})
            .click(function() {
                if (cntr.value < parseInt(obj.maxval)) {
                    cntr.value += 1;
                    cntr.textvalue.attr({"text": ("" + cntr.value)});
                }
            });
        
        cntr.hideIt = function() {
            cntr.upsign.hide();
            cntr.downsign.hide();
            cntr.up.hide();
            cntr.down.hide();
            cntr.textvalue.hide();
            cntr.textlabel.hide();
        };
        
        cntr.showIt = function() {
            cntr.upsign.show();
            cntr.downsign.show();
            cntr.up.show();
            cntr.down.show();
            cntr.textvalue.show();
            cntr.textlabel.show();
        };
        
    
        // cntr.label = function(options) {
            
        //     if (options.anchor == void 0) {
        //         options.anchor = "end";
        //     }
            
        //     if (options.label != void 0) {
        //         cntr.textlabel.attr({"text": "" + options.label, "text-anchor": 'end'});
        //     }
            
        //     if (options.x != void 0 && options.y != void 0) {
        //         cntr.textlabel.transform("t" + options.x + "," + options.y);
        //     }
        // };
        
        // console.log('final');
        // cntr.label(obj);
        // return(cntr);
    },
    // button
    button: function(obj)
    {
        // data to int
        let dataLeft = parseInt(obj.left);
        let dataTop = parseInt(obj.top);

        // temporary element to get the button's width
        let labelT = this.text(dataLeft, dataTop, obj.label).attr({"text-anchor": "middle", "font-size": 14});
        let lBBox = labelT.getBBox();
        labelT.remove();

        // 
        this.rect(dataLeft, dataTop, Math.round(lBBox.width)+20, Math.round(lBBox.height) + 10).attr({fill: "#f9f9f9", "stroke": "#eeeeee", "stroke-width": 0.7});
        this.text(dataLeft+10, dataTop + ((Math.round(lBBox.height) / 2) + 5), obj.label).attr({"text-anchor": "start", "font-size": 14});

        let cover = this.rect(dataLeft, dataTop, Math.round(lBBox.width)+20, Math.round(lBBox.height) + 10).attr({fill: "#eeeeee", stroke: "none", "fill-opacity": 0, "cursor": "pointer"});

        cover.click(function(){
            alert('clicked');
        });

    },
    // container
    container: function(obj)
    {
        // data to int
        let dataLeft = parseInt(obj.left);
        let dataTop = parseInt(obj.top);

        // check for user input
        if(obj.width < 50) { obj.width = 50; }
        else if(obj.width > paper.width - 15) { obj.width = paper.width - 30; dataLeft = 15;}

        if(obj.height < 50) { obj.height = 50; }
        else if(obj.height > paper.height - 15) { obj.height = paper.height - 30; dataTop = 15; }

        this.rect(dataLeft, dataTop, obj.width, obj.height).attr({fill: "#FFF", "stroke": "#d6d6d6", "stroke-width": 0.7});

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
    }
};

module.exports = raphaelPaperObjects;
