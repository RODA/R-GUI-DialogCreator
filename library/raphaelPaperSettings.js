var raphaelPaperSettings = {

    // dialog properties
    dialog: { name: 'NewDialog', title: 'New dialog', width: 640, height: 480},

    // available dialog elements
    availableElements: ['Button', 'Checkbox', 'Container', 'Counter', 'Input', 'Label', 'Radio', 'Select', 'Separator'],

    // elements -----------------------------------------------------------

    label: { parentId: '', type: 'Label', name: 'label1', text: 'My label', left: '10', top: '10', fontSize: 14, isVisible: 'true', elementIds: [], conditions: ''},

    separator: { parentId: '', type: 'Separator', name: 'separator1', direction: 'x', left: '10', top: '10', length: 300, isVisible: 'true', elementIds: [], conditions: ''},
    
    checkbox: { parentId: '', type: 'Checkbox', name: 'checkbox1', label: 'My checkbox', left: '10', top: '10', isChecked: 'false', isEnabled: 'true', isVisible: 'true', elementIds: [], conditions: ''},
    
    radio: { parentId: '', type: 'Radio', name: 'radio1', radioGroup: 'radiogroup1', label: 'My radiobox', left: '10', top: '10', isSelected: 'false', isEnabled: 'true', isVisible: 'true', elementIds: [], conditions: ''},
    
    counter: { parentId: '', type: 'Counter', name: 'counter1', startval: 1, maxval: 5, width: 25, left: '15', top: '15', isVisible: 'true', isEnabled: 'true', elementIds: [], conditions: ''},
    
    button: { parentId: '', type: 'Button', name: 'button1', label: "My Button", left: '15', top: '15', isVisible: 'true', isEnabled: 'true', elementIds: [], conditions: ''},
    
    container: { parentId: '', type: 'Container', name: 'container1', objViewClass: 'variable', width: 150, height: 200, left: '15', top: '15', isVisible: 'true', elementIds: [], conditions: ''},
    
    select: { parentId: '', type: 'Select', name: 'select1', 'width': 120, label: "My Select", left: '15', top: '15', isVisible: 'true', elementIds: [], conditions: ''},
    
    input: { parentId: '', type: 'Input', name: 'input1', 'width': 120, left: '15', top: '15', isVisible: 'true', value: '', elementIds: [], conditions: ''},

    

};

module.exports = raphaelPaperSettings;