const helpers = require("./helpers");
const conditions = {
    // operands
    operands: ['==', '!=', '>=', '<='],
    //logicals: ['&', '|'],
    elements: [],

    availableProperties: ['selected', 'checked', 'visible', 'enabled'],

    // entry point
    parseConditions: function(str)
    {
        // clear array every type
        this.elements.length = 0;

        let conditions = str.split(';');
        // remove empty trailing condition
        if(conditions[conditions.length - 1] == '') {
            conditions.pop();
        }
        
        // no conditions or error
        if(conditions.length == 0) { return { error: true, result: {}}; }
    
        let result = {};
    
        for(let i=0; i < conditions.length; i++)
        {
            let ifC = conditions[i].split('if');
            
            // we have an error - wrong format no | method if conditions |
            if(ifC.length != 2){ return { error: true, result: {}}; }
                
            obj = this.conditionParserRecursion(ifC[1].trim()); 
            
            // there was an error parsing the conditions
            if(obj === void 0){ return { error: true, result: {}}; }

            result[ifC[0].trim()] = obj; 
        }

        return { error: false, result: result, elements: this.elements.slice() };
    },

    // parse the right side of the if statement
    conditionParserRecursion: function(condition) 
    {
        let response = [];
        let p1 = condition.match(/\(/g);
        let p2 = condition.match(/\)/g);
        
        let positions = [];
        if(p1 !== null & p2 !== null) {
            if (p1.length == p2.length){
                positions = this.getPositions(condition);
            }
            else {
                return false;
            }
        } 

        // parsing
        let substrings = [];
        // spliting string based on ()
        if (positions.length > 0){
            for (let i=0; i < positions.length + 1; i++) {
                if (i == 0){
                    if (positions[i][0] > 0) {
                        substrings.push(condition.substring(0, positions[i][0] - 1));
                    }
                    substrings.push(condition.substring(positions[i][0], positions[i][1] + 1));
                } else if ( i < positions.length) {
                    substrings.push(condition.substring(positions[i - 1][1] + 1, positions[i][0]).trim());
                    substrings.push(condition.substring(positions[i][0], positions[i][1] + 1).trim());
                } else {
                    substrings.push(condition.substring(positions[i - 1][1] + 1, condition.length).trim());
                }
            }
        } else {
            substrings[0] = condition.trim();
        }
        
        // parsing substrings
        for (let i = 0; i < substrings.length; i++) {
            if (substrings[i][0] == "(") {
                // call ourself on the string without the external ()
                response.push(this.conditionParserRecursion(substrings[i].substring(1, substrings[i].length - 1)));
            }
            else {
                if (substrings[i] != "") {
                    
                    let conditionByLogical = this.logicalsParser(substrings[i]);
                    let cPush = [];
                    for (let j = 0; j < conditionByLogical.length; j++) {
                        res = this.operandsParser(conditionByLogical[j]);
                        if (Array.isArray(res)) {
                            cPush.push(res);
                        }else{
                            cPush.push(conditionByLogical[j]);
                        }
                    }
                    response.push(cPush);
                }
            }
        }
        return response;
    },


    checkConditions: function(weHave, element, list)
    {
        // geting only the conditions | skiping elements
        let conditions = element.conditions.conditions;

        // methods to apply
        methods = Object.keys(conditions);
        for(let i in methods){
            let mtd = methods[i];
            let respArray = this.conditionCheckRecursion(conditions[mtd], list);
            
            let depth = helpers.getArrayDepth(respArray);
            
            // console.log(respArray.flat(depth).join(' '));
            isOK = this.textConditionTest(respArray.flat(depth).join(' '));
            // console.log(isOK);
                        
            // conditions are meet, try to apply 'method'
            if(isOK) {
                let asg = mtd.split('=');
                let mtdIs = asg[0].trim();
                let valueIs = (asg[1] != void 0) ? helpers.removeExternalQuotes(asg[1].trim()) : true;
                
                // check if valid method
                if ( typeof list[element.name][mtdIs] === 'function') 
                {
                    list[element.name][mtdIs](valueIs);
                }
            }
        }        
    },

    //
    conditionCheckRecursion: function(conditions, list)
    {        
        // console.log(conditions);
        
        let response = [];
        for(let i = 0; i < conditions.length; i++) {
            if(Array.isArray(conditions[i])) {
                let r = false;
                conditions[i].forEach(function(element) {
                    if(Array.isArray(element)){
                        r = true;
                    }
                });
                if(r) {
                    response.push(this.conditionCheckRecursion(conditions[i], list));
                } else {
                    response.push(this.validateCondition(conditions[i], list));
                }
            } else {
                response.push(conditions[i]);
            }  
        }
        return response;    
    },

    // Helpers 
    // =======================================
    // get the position of the () in the string
    getPositions: function(str)
    {    
        let regex1 = /\(/gi;
        let result;
        let indices1 = [];     
        while((result = regex1.exec(str))){
            indices1.push(result.index);
        }
        
        let regex2 = /\)/gi;
        let indices2 = [];     
        while((result = regex2.exec(str))){
            indices2.push(result.index);
        }
    
        let response = [];
        let first = 0;
        for(let i=0; i < indices1.length; i++){
            if (i == indices1.length - 1) {
                response.push([indices1[first], indices2[i]]);
            } else if (indices2[i] < indices1[i + 1]) {
                response.push([indices1[first], indices2[i]]);
                first = i + 1;
            }
        }
        return response;
    },

    // parse by logicals
    logicalsParser: function(str)
    {
        let response = [];
        let a = str.split('&');
        if(a.length == 1) {
            bla = str.split('|');
            for (let i=0; i < bla.length; i++){
                response.push(bla[i]);
                if (i < bla.length - 1) {
                    response.push("|");
                }
            }
        }
        else {
            for(let i = 0; i < a.length; i ++){
                let bla = a[i].split('|');
                for (let j = 0; j < bla.length; j++) {
                    response.push(bla[j].trim());
                    if (j < bla.length - 1) {
                        response.push("|");
                    }
                }
                if (i < a.length - 1) {
                    response.push("&");
                }
            }
        }

        // remove trailing from split
        if (response[0] == "") { response.shift(); }
        if (response[response.length - 1] == "") { response.pop(); }

        return response;
    },

    // parse by operands
    operandsParser: function(str)
    {
        str = str.trim();
        let counter = 0;
        let operandFound = '';
        for (let i=0; i < this.operands.length; i++){
            if (str.includes(this.operands[i])) {
                counter++;
                operandFound = this.operands[i];
            }
        }
        
        // we have an error -> there should be only one operand
        if ( counter > 1 ) { return void 0; }

        // nothing found, return the string
        if (counter === 0) { return str; }

        let a = str.split(operandFound);

        let element = a[0].trim();
        // save the element that is affecting us
        if(!this.elements.includes(element)) {
            this.elements.push(element);
        }

        return [element, operandFound, a[1].trim()];
    },

    // validate a condition
    validateCondition: function(condition, list)
    {
        // a condition mist have exactly 3 elements | name, operand, property(value)
        if(condition.length != 3){
            return false;
        }
        let res = false;
        let name = condition[0]; 
        let operand = condition[1]; 
        let propertyOrValue = condition[2]; 

        if(this.availableProperties.includes(propertyOrValue))
        {    
            // console.log(name);
            // console.log(propertyOrValue);
            // console.log(list[name][propertyOrValue]);
            
            // check if element and property exists
            if(list[name] === void 0 && list[name][propertyOrValue] === void 0){
                return false;
            }

            switch (operand) {
                case '==':
                    res = list[name][propertyOrValue];
                    break;
                case '!=':
                    res = !list[name][propertyOrValue];
                    break;
            }
        } else {
            
            // check if element and value exists
            if(lista[name].value === void 0){
                return false;
            }
            switch (operand) {
                case '==':
                    res = (list[name].value == propertyOrValue);
                    break;
                case '!=':
                    res = (list[name].value != propertyOrValue);
                    break;
                case '>=':
                    res = (list[name].value >= propertyOrValue) ? true : false;
                    break;
                case '>=':
                    res = (list[name].value <= propertyOrValue) ? true : false;
                    break;
            }
        }                
        // in case of wrong values
        if(res) {
            return true;
        } else {
            return false;
        }
    },

    // text condition test
    textConditionTest: function(txt)
    {
        return Function('"use strict";return (' + txt + ')')();
    }
};

module.exports = conditions;