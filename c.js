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


// var str = 'check if textbox1 == 4 & eee | ( checkbox1 == check | checkbox2 != check) | checkbox3 == visible; check if textbox1 = 4 & ( checkbox1 isChecked | checkbox2 !isChecked) | checkbox3 isVisible';
var str = 'check if textbox1 == 4 & eee | ( checkbox1 >= check | checkbox2 != check) | checkbox3 == visible; show if textbox1 == 4 & eee | ( checkbox1 >= check | checkbox2 != check) | checkbox3 == visible;';
// var str = 'check if (A == 4) & (B | C  == checked | D != checked) | (E == visible);';
// var str = 'check if (A <= 5 & G | J & (D | I)) | (B | C) | D & (H >= 8);';

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
        console.log(obj);
        
        if(obj === void 0){ 
            return { error: true, result: {}}; 
        }
        result[ifC[0].trim()] = obj; 
    }
    
    return(result);
    // console.log(conditions);
}


console.log(parseConditions(str));


// check if (A == 4) & (B |  C isChecked | D !isChecked) | (E isVisible)
function recursionParser(condition) 
{
    let response = [];
    let p1 = condition.match(/\(/g);
    let p2 = condition.match(/\)/g);
    
    let positions = [];
    if(p1 !== null & p2 !== null) {
        if (p1.length == p2.length){
            positions = getPositions(condition);
        }
        else {
            return(false)
        }
    } 

    // parsing
    let substrings = [];
    // substrings.push(condition.substring(0, positions[0][0]));
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
    // console.log(substrings);
    for (let i = 0; i < substrings.length; i++) {
        if (substrings[i][0] == "(") {
            // facem recursie pe substringul respectiv fara parantezele externe
            response.push(recursionParser(substrings[i].substring(1, substrings[i].length - 1)));
        }
        else {
            if (substrings[i] != "") {
                
                let conditionByLogical = logicOperatorParser(substrings[i]);
                let cPush = [];
                for (let j = 0; j < conditionByLogical.length; j++) {
                    res = operandsParser(conditionByLogical[j]);
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
    return(response);
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
    // (A <= 5 & G | J & (D | I)) | (B | C) | D & (H >= 8);
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

    if (response[0] == "") {
        response.shift();
    }

    if (response[response.length - 1] == "") {
        response.pop();
    }

    return response;
}

// ===========================
// console.log(operandsParser("A <= 5"));

function operandsParser(str)
{
    let counter = 0;
    let operandFound = '';
    for (let i=0; i < operands.length; i++){
        if (str.indexOf(operands[i]) >= 0){
           counter++;
           operandFound = operands[i];
        }
    }

    if ( counter > 1 ) { 
        return void 0; 
    }

    if (counter == 0) {
        return str;
    }

    let a = str.split(operandFound);

    return [a[0].trim(), operandFound, a[1].trim()];
}



const customInput = function(width, height, x, y, oldValue, paper) 
{    
    let container = paper.canvas.parentNode;
    let styles = "position: absolute; width: "+ (width) +"px; height: "+ (height) +"px; left: "+ x +"px; top: "+ y +"px; border: none; font-size: 14px; font-weight: 400; background: none; opacity: 0";
    
    let input = document.createElement("input");
    let newValue;

    input.addEventListener('focus', startEditing);
    input.addEventListener('keyup', _handleKeyDown);
    input.addEventListener('blur', stopEditing);

    input.focus();

    function _handleKeyDown(event){
        var tmp               = document.createElement("span");
        var text              = this.input.value;
        tmp.setAttribute('style', this.input.style.cssText);
        tmp.style.height      = null;
        tmp.style.width       = null;
        tmp.style.visibility  = 'hidden';
        tmp.innerHTML         = text.split('\n').join('<br />');

        this.input.parentNode.appendChild(tmp);

        this.input.style.width = tmp.offsetWidth + "px";
        this.input.style.height = tmp.offsetHeight + "px";

        tmp.parentNode.removeChild(tmp);
    }
    function startEditing(event) {
        input.setAttribute("style", styles);
        input.value = oldValue;
        container.appendChild(input);
    }
    function stopEditing(event) {
        newValue  = input.value;
        input.parentNode.removeChild(input);
    }

    return newValue;
};
