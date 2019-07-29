// check, uncheck, show, hide, select, deselect, enable, disable, "",


var textbox = {
    value: 1,

};

var checkbox = {
    checked: true,
    visible: true,
    enabled: true,
    check: function() { this.checked = true; },
    uncheck: function() { this.checked = false; },

};


// var str = 'check if textbox1 == 4 & eee | ( checkbox1 isChecked | checkbox2 !isChecked) | checkbox3 isVisible; check if textbox1 = 4 & ( checkbox1 isChecked | checkbox2 !isChecked) | checkbox3 isVisible';
var str = 'check if textbox1 == 4 & (eee |  checkbox1 isChecked | checkbox2 !isChecked) & checkbox3 isVisible;';
// var str = 'A if B if C;';

var operands = ['!', '==', '!=', '>=', '<='];
var logicals = ['&', '|'];
var conditions = {};

// before parser trim and check length > 0
function parseConditions(str) 
{   
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
        
        // we have an error
        if(ifC.length != 2){ return { error: true, result: {}}; }
        
        
        obj = recursionParser(ifC[1].trim()); 
        if(obj === void 0){ 
            return { error: true, result: {}}; 
        }
        result[ifC[0].trim()] = obj; 
    }
    
    // console.log(conditions);
}


console.log(parseConditions(str));

function recursionParser(condition) 
{
    let response = {};
    let p1 = condition.match(/\(+/g);
    let p2 = condition.match(/\)+/g);

    let positions = [];
    if(p1 !== null & p2 !== null) {
        if(p1.length == p2.length){
            positions = getPositions(condition);
        }
    } 

    // parsing
    let substrings = [];
    // substrings.push(condition.substring(0, positions[0][0]));
    if(positions.length > 0){
        for(let i=0; i < positions.length + 1; i++) {
            if( i == 0){
                substrings.push(condition.substring(i, positions[i][0]).trim());
            } else if ( i < positions.length) {
                substrings.push(condition.substring(positions[i - 1][1] + 1, positions[i][0]).trim());
            } else {
                substrings.push(condition.substring(positions[i - 1][1] + 1, condition.length).trim());
            }
        }
    } else {
        substrings[0] = condition.trim();
    }

    let p = 0;
    let indexp = 0;
    let indexs = 0;
    
    for (let counter = 0; counter < substrings.length + positions.length; counter++) {
        if (counter == 0) {
            if (substrings.length > 1) {
                let op = substrings[indexs].slice(-1);
                // if wrong operand
                if(!operands.includes(op)){ return false; }
            }

            substrings[indexs] = substrings[indexs].slice(0, -1).trim();
            response[p] = logicOperatorParser(substrings[indexs]);
            p++;
            indexs++;

            if (substrings.length > 1) {
                response[p] = op;
                p++;
            }
        }
        else {
            if (counter % 2 == 1) {
                response[p] = recursionParser(condition.substring(positions[indexp][0] + 1, positions[indexp][1]).trim());
                p++;
                indexp++;
            }
            else {
                // de verificat daca ultimul substring este ""
                // verificam operatorul logic cu care incepe urmatorul substring
                // response[p] = acel operator
                // scoatem din substring operatorul
                // p++;

                // verificam operatorul logic cu care se termina urmatorul substring
                // (in afara de situatia in care nu trebuie sa se mai termine cu nimic pentru ca este ultimul substring)
                // stocam acel operator si il scoatem din substring

                // aplicam recursivitatea cu substringul, pracic ce este intre paranteze
                response[p] = logicOperatorParser(substrings[indexs]);
                p++;

                // daca se aplica situatia
                // response[p] = acel operator
                // p++;

                indexs++;
            }
        }
    }
    
    
    




    // console.log(op);
    console.log(substrings);
    
    
}

function getPositions(str)
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
}

function logicOperatorParser(str)
{

    let response = {};
    let a = str.split('&');
    if(a.length == 1) {
        a = str.split('|');
        for(let i=0; i< a.length; i++){

        }
    }

    for(let i = 0; i < a.length; i ++){
        response.push(a[i].split('|'));
    }
    return res;
}

// ===========================
function operandsParser(str)
{
    let counter = 0;
    let operandFound = ' ';
    for(let i=0; i< operands; i++){
        if(str.indexOf(operands[i]) >= 0){
           counter++;
           operandFound = operands[i];
        }
    }

    if( counter > 1 ) { 
        return void 0; 
    }

    let a = str.split(operandFound);

    return [a[0], operandFound, a[1]];
}