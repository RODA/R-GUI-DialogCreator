const container = {

    properties: {}, 
    elements: {},

    // paper properties: name, title, width, height
    initialize: function(obj) 
    {
        this.properties = Object.assign({},obj);
        this.elements = {};
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
    }
};

module.exports = container;
