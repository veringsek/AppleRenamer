function changeNewActionType() {
    var type = slcNewActionType.options[slcNewActionType.selectedIndex].value; 
    vmFiles.newAction.type = type; 
}

function addNewAction() {
    var type = vmFiles.newAction.type; 
    switch (type) {
        case "replace": 
            addNewActionReplace(); 
            break; 
    }
}

function addNewActionReplace() {
    var pattern = txtNewActionReplacePattern.value; 
    var replacement = txtNewActionReplaceReplacement.value; 
    vmFiles.actions.push({
        type: "replace", 
        pattern: pattern, 
        replacement: replacement
    }); 
}