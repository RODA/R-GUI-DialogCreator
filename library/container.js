const conditions = require("./conditions");

const container = {

    properties: {}, 
    elements: {},
    syntax: '',

    // paper properties: name, title, width, height
    initialize: function(obj) 
    {
        this.properties = Object.assign({},obj);
        this.elements = {};
        this.syntax = '';
    },
    
    // update paper props
    updateProperties: function(obj)
    {
        // for new props please define in initialization raphaelPaper.js : make
        for (let prop in obj) 
        {
            if(this.properties[prop]) {
                this.properties[prop] = obj[prop];
            }
        }
        console.log(this.syntax);
        
    },

    // element properties
    addElement: function(obj) 
    {
        this.elements.push(obj);
    },

    // return an element by ID
    getElement: function(elId)
    {       
        return this.elements[elId];
    },

    // remove element from container
    removeElement: function(elID)
    {
        delete this.elements[elID];
    },

    // clean / make element data
    prepareData: function(data)
    {
        let response = { error: false, message: ''};
        // trim & convert to int data
        for(let i in data)
        {
            if( i == 'text' || i == 'label' || i == 'conditions' ) {
                data[i] = data[i].trim();
            }
            if( i == 'width' || i == 'height' || i == 'left' || i == 'top' || i == 'startval' || i == 'maxval' ) {
                data[i] = parseInt(data[i]);
            }
        }

        // check if we already have a dataSet container
        if (data.type == 'Container' && data.objViewClass == 'dataSet') {
            if(this.elementContainerDataSetExists()){
                data.objViewClass = 'variable';
                response.error = true;
                response.message = 'You can have only one Data Set Container per dialog.';
            }
        }

        return response;
    },

    // return new element name
    elementNameReturn: function(elName)
    {
        let namesList = this.elementNameList(elName);

        if(namesList.length > 0) {
            while(namesList.includes(elName)) {
                elName = this.elementNameMake(elName);
            }
        }
        return elName;
    },
    // generate element name
    elementNameMake: function(name)
    {
        let numberIs = [];
        let nameArray = name.split('');
        
        while(nameArray.length > 0){
            let elIs = nameArray.pop();
            if(!isNaN(parseInt(elIs))){
                numberIs.push(parseInt(elIs));
            } else {
                break;
            }
        }
        let newNumberIs = '';
        let toRemove = 0;
        if(numberIs.length > 0){
            toRemove = numberIs.length;
            while(numberIs.length > 0){
                newNumberIs += numberIs.pop();
            }
        }

        let no = (newNumberIs != '') ? parseInt(newNumberIs) + 1 : '1';
        let newTxt = (toRemove > 0) ? name.slice(0, -toRemove) : name;

        return(newTxt + no);  
    },
    // check if an element with the same name exists an make list with names
    elementNameList(name)
    {          
        let namesList = [];
        let exists = false;
        for( let el in this.elements) {            
            namesList.push(this.elements[el].name);
            if( this.elements[el].name == name){
                exists = true;
            }
        }        
        if(exists) {
            return namesList;
        }
        return [];
    },

    // element type restrinctions
    elementContainerDataSetExists()
    {
        for( let el in this.elements) {            
            if( this.elements[el].type == 'Container' && this.elements[el].objViewClass == 'dataSet'){
                return true;
            }
        }
        return false;    
    },
    // validate conditions and add them to the element
    validateConditions : function(data)
    {        
        // we received the data
        if(data.id !== void 0 & data.conditions != void 0 & data.name != void 0)
        {
            // let's check if we have the element
            if(this.elements[data.id] !== void 0){
                // TO DO - parse conditions before adding them
                let isOK = conditions.parseConditions(data.conditions);
                
                console.log(isOK);
                
                if(!isOK.error) {
                    this.elements[data.id].conditions = data.conditions;
                    // data saved - return true
                    return true;
                }
            }
        }
        return false;
    },

    // get all the elements for the dialog syntaf
    elementsForSyntax: function()
    {        
        let noElements = Object.keys(this.elements);
        let response = { syntax: this.syntax, elements: []};
    
        if(noElements.length == 0){ return response; }

        for(let i in this.elements){
            if(this.elements[i].type != 'Label' && this.elements[i].type != 'Separator'){
                response.elements.push({name: this.elements[i].name, type: this.elements[i].type});
            }
        }
        return response;
    },
    // save dialog syntax
    saveSyntax: function(data){
        this.syntax = data;
        return true;
    }
};

module.exports = container;
