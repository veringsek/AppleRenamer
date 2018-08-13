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

function modifyName(action, file) {
    switch (action.type) {
        case "replace": 
            modifyNameReplace(action, file); 
            break; 
    }
}

function modifyNameReplace(action, file) {
    file.modified = file.modified.replace(new RegExp(action.pattern), action.replacement); 
}

function previewFiles() {
    var number = 0; 
    for (var file of vmBody.files) {
        if (file.checked) {
            number += 1; 
        }
        file.number = number; 
        file.modified = file.name; 
        for (var action of vmBody.actions) {
            if (!action.checked) {
                continue; 
            }
            modifyName(action, file); 
        }
    }
}