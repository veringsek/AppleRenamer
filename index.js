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
        if (file.name.split(".").pop() !== file.modified.split(".").pop()) {
            file.warning = vm.warnings.raise("extchanged", file.warning); 
        }
        for (var other of vm.files) {
            if (other === file) {
                break; 
            } else if (other.modified === file.modified) {
                file.warning = vm.warnings.raise("conflict", file.warning); 
            }
        }
        file.invalid = !file.checked || file.filtered; 
        if (file.invalid) {
            number -= 1; 
        }
    }
}

function browseWorkingDir() {
    var dir = dialog.showOpenDialog({properties: ["openDirectory"]}); 
    vm.workingdir = dir; 
}

function loadFiles() {
    fs.readdir(vm.workingdir, (error, filenames) => {
        if (error) {
            vm.files = []; 
            return; 
        }
        var files = []; 
        for (var filename of filenames) {
            var file = {
                dir: vm.workingdir, 
                name: filename, 
                checked: true
            }; 
            files.push(file); 
        }
        vm.files = files; 
    }); 
}