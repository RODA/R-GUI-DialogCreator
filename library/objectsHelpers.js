
const objectsHelpers = {
    // retun a text's width
    getTextDim: function(paper, text, fSize, fFamily) 
    {
        // temporary element to get the button's width
        let labelT = paper.text(50, 50, text).attr({"text-anchor": "start", "font-size": fSize, "font-family": fFamily});
        let lBBox = labelT.getBBox();
        labelT.remove();   

        return {width: lBBox.width, height: lBBox.height};
    },
};

module.exports = objectsHelpers;