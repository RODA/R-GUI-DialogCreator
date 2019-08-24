
var helpers = {

    //https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    makeid: function() 
    {
        var result           = '';
        var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < 5; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },
    missing: function(obj) {
        return(obj === void 0);
    },
    //https://stackoverflow.com/questions/14368596/how-can-i-check-that-two-objects-have-the-same-set-of-property-names
    // This function ignores the elemnts 'conditions' propertie
    hasSameProps: function( obj1, obj2 ) {
        var obj1Props = Object.keys( obj1 ),
            obj2Props = Object.keys( obj2 );
    
        if ( obj1Props.length == obj2Props.length ) {
            return obj1Props.every( function( prop ) {
                return obj2Props.indexOf( prop ) >= 0;
            });
        }
        return false;
    },
        
    rep: function(rule, times) {
        var result = new Array(times);
        for (var i = 0; i < times; i++) {
            result[i] = rule;
        }
        return(result);
    },

    // remove single or double external quotes "text"
    removeExternalQuotes(str)
    {
        let newStr = str;
        if((str[0] == "'" || str[0] == '"') && (str[str.length-1] == "'" || str[str.length-1] == '"')) {
            newStr = str.substring(1, str.length-1);
        }
        return newStr;
    },

    // return and array depth
    getArrayDepth: function(arr) {
        if (Array.isArray(arr)){
            return 1 + Math.max(...arr.map(t => this.getArrayDepth(t)));
        } else {
            return 0;
        }
    },

    // remove item from array
    removeValueFromArray(arr, value)
    {
        return arr.filter(function(element){            
            return element != value;
        });
    }
      

};

module.exports = helpers;
