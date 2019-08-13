# electron-r-gui
A R Software GUI in Electron JS



## Conditions

All elements have the show and hide methods.

Other methids are: check, uncheck, select, deselect, value, enable, disable.

All elements can have conditions based on one of the properties: 

- isVisible & isNotVisible,          
- isEnabled & isNotEnabled, 
- isSelected & isNotSelected, 
- isChecked & isNotChecked.

An element responde only to the property you see when you select it. For example the Separator element responds only to ** isVisible **.

All conditions must end with a semicolumn ;

### Condition operators

We have:

1. | (pipe / or) for condition1|condition2 - when one of the conditions is true
2. & (and) for condition1&condition2 - when both of the conditions are true

### Condition writing example

Let's say we have two elements: a checkbox (checkbox1) and a separator (separator1). If we want to make the separator visible only when the checkbox is checked, we can write a condition for the separator like this: ** isVisible=checkbox1:isChecked; **.




