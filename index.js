function censor() {
    for (var preaction of vm.preactions) {
        vm.actionTypes[preaction.type].censor(preaction); 
    }
    for (var action of vm.actions) {
        vm.actionTypes[action.type].censor(action); 
    }
}

function preview() {
    var number = 0; 
    for (var file of vm.files) {
        file.modified = file.name; 
        file.warning = "none"; 
        file.filtered = false; 
        if (!file.checked) {
            file.invalid = true; 
            continue; 
        }
        number += 1; 
        file.number = number; 
        for (var action of vm.actions) {
            if (!action.checked || action.censored) {
                continue; 
            }
            vm.actionTypes[action.type].act(file, action); 
            if (file.filtered) {
                file.modified = file.name; 
                break; 
            }
        }
        if (file.modified === file.name) {
            file.warning = vm.warnings.raise("unchanged", file.warning); 
        }
        for (var other of vm.files) {
            if (other === file) {
                break; 
            } else if (other.modified === file.modified) {
                file.warning = vm.warnings.raise("conflict", file.warning); 
            }
        }
        file.invalid = !file.checked || file.filtered; 
        console.log(file.invalid + ":::" + file.name); 
        if (file.invalid) {
            number -= 1; 
        }
    }
}