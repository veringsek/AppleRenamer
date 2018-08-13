function preview() {
    var number = 0; 
    for (var file of vm.files) {
        file.modified = file.name; 
        file.warning = "none"; 
        if (!file.checked) {
            continue; 
        }
        number += 1; 
        file.number = number; 
        for (var action of vm.actions) {
            if (!action.checked) {
                continue; 
            }
            vm.actionTypes[action.type].modify(file, action); 
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
    }
}