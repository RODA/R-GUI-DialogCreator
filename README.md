# electron-r-gui
A R Software GUI in Electron JS


## Conditions

You can add conditions to an element to create complex logic like: show an element based on the state of the other elements in the dialog.

A condition can be splited in two parts: the left and the right part of the **if** statement. We have: do method **if** condidions are meet. 
For eg.: check if checkbox2 == checked & (radio1 == selected | radio3 == selected | radio2 != selected);

On the left side of **if** an operand must be: method or setValue == value
On the right side of **if** an operand must be: element name *operand (==, !=, >=, <=)* element's property or value

All conditions must end with a semicolumn (;)

## Condition properties and methods

Properties available: selected, checked, visible, enabled, value.
Methods available: show, hide, check, uncheck, select, deselect, setValue, enable, disable.

### Condition operators

Logical operators: &, |

1. & (and) for *condition1 & condition2* - when both of the conditions are true
2. | (pipe / or) for *condition1 | condition2* - when one of the conditions is true

Comparison operators: ==, !=, >=, <=

1. == (equal) *radio1 == selected* - radio1 must be selected
2. != (not equal) *checkbox1 != checked* - checkbox1 must not be checked
3. >= (greater or equal than) *input1 >= 5* - input1's value is greater or equal than 5
4. <= (less or equal than) *input1 <= 5* - input1's value is less or equal than 5


### Condition writing example

Example 1

Let's say we have two elements: a checkbox (checkbox1) and a separator (separator1). 
If we want to make the separator visible only when the checkbox is checked, we can write *a condition for the separator* like this: **show if checkbox1 == checked;**.
Of course we can write the condition also like this: ** show == true if checkbox1 == checked; **, but the == true part is going to be ignored.

Example 2 

We have four elements: input1, checkbox1, radio1, radio2 and the condition: **setValue = 'text' if checkbox1 != checked & (radio1 == selected | radio2 == selected);** for the *input1* element.
Here we are assigning the value of "text" to input1 only if checkbox1 is not checked and one of the radio1 or radio2 is selected.


