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
    console.log(file.modified); 
    file.modified = file.modified.replace(new RegExp(action.pattern), action.replacement); 
    console.log("===>>> " + file.modified); 
}

function modifyFile(index) {
    var file = vmBody.files[index]; 
    file.modified = file.name; 
    for (var action of vmBody.actions) {
        if (!action.checked) {
            continue; 
        }
        modifyName(action, file); 
    }
}

function modifyFiles() {
    var files = vmBody.files; 
    for (var f = 0; f < files.length; f++) {
        modifyFile(f); 
    }
}

function getFileNumbers() {
    var files = vmBody.files; 
    for (var f = 0; f < files.length; f++) {
        getFileNumber(f); 
    }
}

function getFileNumber(index) {
    var files = vmBody.files; 
    var number = 0; 
    for (var i = 0; i <= index; i++) {
        if (files[i].checked) {
            number += 1; 
        }
    }
    files[index].number = number; 
    return number; 
}