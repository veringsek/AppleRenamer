function preview() {
    var number = 0; 
    for (var file of vm.files) {
        if (file.checked) {
            number += 1; 
        }
        file.number = number; 
        file.modified = file.name; 
        file.warning = "none"; 
        for (var action of vm.actions) {
            if (!action.checked) {
                continue; 
            }
            vm.actionTypes[action.type].modify(file, action); 
        }
        if (file.modified === file.name) {
            file.warning = vm.warnings.raise("unchanged", file.warning); 
        }
    }
}