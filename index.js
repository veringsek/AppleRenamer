function addNewAction() {
    var type = vmBody.newAction.type; 
    switch (type) {
        case "replace": 
            addNewActionReplace(); 
            break; 
    }
}

function addNewActionReplace() {
    var pattern = txtNewActionReplacePattern.value; 
    var replacement = txtNewActionReplaceReplacement.value; 
    vmBody.actions.push({
        type: "replace", 
        checked: true, 
        pattern: pattern, 
        replacement: replacement
    }); 
}

function getFileNumber(index) {
    var files = vmBody.files; 
    var number = 0; 
    for (var i = 0; i <= index; i++) {
        if (files[i].checked) {
            number += 1; 
        }
    }
    return number; 
}