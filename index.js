function censor() {
    for (var preaction of vm.preactions) {
        vm.actionTypes[preaction.type].censor(preaction); 
    }
    for (var action of vm.actions) {
        vm.actionTypes[action.type].censor(action); 
    }
}

function preview() {
    if (!vm.settings.modificationPreview) {
        return; 
    }
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
        if (path.extname(file.name) !== path.extname(file.modified)) {
            file.warning = vm.warnings.raise("extchanged", file.warning); 
        }
        if (/[\*\:\?\"\|\<\>\/\\]/g.test(file.modified)) {
            file.warning = vm.warnings.raise("illegalchars", file.warning); 
        }
        if (vm.warnings["conflict"] > vm.warnings[file.warning]) {
            for (var other of vm.files) {
                if (other === file) {
                    break; 
                } else if (other.modified === file.modified) {
                    file.warning = vm.warnings.raise("conflict", file.warning); 
                }
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
        for (var f in filenames) {
            var filename = filenames[f]; 
            var file = {
                dir: vm.workingdir, 
                name: filename, 
                checked: true
            }; 
            file.stats = {
                isDirectory: () => {
                    return false; 
                }, 
                isFile: () => {
                    return false; 
                }, 
                failed: true
            }; 
            fs.lstat(path.join(file.dir, file.name), ((i) => {
                return (error, stats) => {
                    if (error) {
                        console.log(error); 
                    } else {
                        vm.files[i].stats = stats; 
                    }
                }
            })(f)); 
            files.push(file); 
        }
        vm.files = files; 
    }); 
}

function execute() {
    for (var file of vm.files) {
        var warning = vm.warnings[file.warning]; 
        if (warning >= 100) {
            var sure = confirm("Some warnings exist. Sure to execute anyway? "); 
            if (!sure) {
                return; 
            }
        }
    }
    var records = []; 
    for (var file of vm.files) {
        var record = rename(path.join(file.dir, file.name), path.join(file.dir, file.modified)); 
        records.push(record); 
    }
    vm.records.push(records); 
}

function rollback() {
    var records = vm.records.pop(); 
    for (var record of records.reverse()) {
        rename(record.modified, record.original); 
    }
}

function rename(original, modified) {
    fs.rename(original, modified); 
    var record = {
        original: original, 
        modified: modified
    }; 
    return record; 
}