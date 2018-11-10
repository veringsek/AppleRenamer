function init() {
    vm = new Vue({
        el: "#vueBody", 
        data: {
            busy: "none", 
            workingdir: "", 
            records: [], 
            files: [], 
            fileSelected: -1, 
            preactions: [{
                type: "mark", 
                checked: true, 
                reference: "number", 
                mark: "[:n:]", 
                width: "2"
            }, {
                type: "mark", 
                checked: true, 
                reference: "ext", 
                mark: "[:.xxx:]"
            }, {
                type: "mark", 
                checked: true, 
                reference: "folder", 
                mark: "[:d:]"
            }], 
            actions: [{
                type: "filter", 
                checked: true, 
                pattern: "$"
            }, {
                type: "replace", 
                checked: true, 
                pattern: "^(.*)$", 
                replacement: "[:d:][:n:][:.xxx:]"
            }], 
            actionTypes: {
                replace: {
                    type: "replace", 
                    name: "Replace", 
                    act: (file, action) => {
                        var pattern = action.pattern; 
                        if (!action.puretext) {
                            pattern = new RegExp(action.pattern, "g"); 
                        }
                        var replacement = action.replacement; 
                        for (var preaction of vm.preactions) {
                            if (preaction.censored || !preaction.checked) {
                                continue; 
                            }
                            replacement = replacement.replace(
                                preaction.mark, 
                                vm.actionTypes.mark.act(file, preaction)
                            ); 
                        }
                        file.modified = file.modified.replace(
                            pattern, replacement
                        ); 
                    }, 
                    create: () => {
                        var pattern = vm.newAction.replace.pattern; 
                        var replacement = vm.newAction.replace.replacement; 
                        var puretext = vm.newAction.replace.puretext; 
                        vm.actions.push({
                            type: "replace", 
                            checked: true, 
                            pattern: pattern, 
                            replacement: replacement, 
                            puretext: puretext
                        }); 
                    }, 
                    censor: (action) => {
                        action.censored = false; 
                        if (action.pattern === "") {
                            action.censored = true; 
                            return; 
                        }
                    }
                }, 
                filter: {
                    type: "filter", 
                    name: "Filter", 
                    act: (file, action) => {
                        var pattern; 
                        var filtered; 
                        if (action.puretext) {
                            pattern = action.pattern; 
                            filtered = file.modified.indexOf(pattern) < 0; 
                        } else {
                            pattern = new RegExp(action.pattern); 
                            filtered = !pattern.test(file.modified); 
                        }
                        if (filtered) {
                            file.warning = vm.warnings.raise("filtered", file.warning); 
                            file.filtered = true; 
                        }
                    }, 
                    create: () => {
                        var pattern = vm.newAction.filter.pattern; 
                        var puretext = vm.newAction.filter.puretext; 
                        vm.actions.push({
                            type: "filter", 
                            checked: true, 
                            pattern: pattern, 
                            puretext: puretext
                        }); 
                    }, 
                    censor: (action) => {
                        action.censor = false; 
                    }
                }, 
                mark: {
                    type: "mark", 
                    name: "Mark", 
                    act: (file, action) => {
                        switch (action.reference) {
                            case "number": 
                                var number = file.number.toString(); 
                                var width = parseInt(action.width); 
                                while (number.length < width) {
                                    number = "0" + number; 
                                }
                                return number; 
                                break; 
                            case "ext": 
                                return path.extname(file.name); 
                                break; 
                            case "folder": 
                                var folders = file.dir.split(path.sep).reverse(); 
                                if (folders[0] === "") {
                                    if (folders.length < 1) {
                                        return null; 
                                    }
                                    return folders[1]; 
                                } else {
                                    return folders[0]; 
                                }
                                break; 
                        }
                    }, 
                    create: () => {
                        var reference = vm.newAction.mark.reference; 
                        var mark = vm.newAction.mark.mark; 
                        var preaction = {
                            type: "mark", 
                            checked: true, 
                            reference: reference, 
                            mark: mark
                        }; 
                        if (reference === "number") {
                            preaction.width = vm.newAction.mark.width; 
                        }
                        vm.preactions.push(preaction); 
                    }, 
                    censor: (action) => {
                        action.censor = false; 
                        if (action.mark === "") {
                            action.censored = true; 
                            return; 
                        }
                        for (var other of vm.preactions) {
                            if (other === action) {
                                continue; 
                            } else if (!other.checked || other.censored) {
                                continue; 
                            }
                            if (other.mark === action.mark) {
                                action.censored = true; 
                                return; 
                            }
                        }
                    }
                }
            }, 
            newAction: {
                type: "replace",  
                replace: {
                    pattern: "^(.*)$", 
                    replacement: "$1", 
                    puretext: false
                }, filter: {
                    pattern: "^(.*)$", 
                    puretext: false
                }, mark: {
                    reference: "number", 
                    mark: "[:x:]", 
                    width: "2"
                }
            }, 
            warnings: {
                raise: (a, b) => {
                    var wa = vm.warnings[a]; 
                    if (wa === undefined) {
                        wa = 0; 
                    }
                    var wb = vm.warnings[b]; 
                    if (wb === undefined) {
                        wb = 0; 
                    }
                    if (wa > wb) {
                        return a; 
                    } else {
                        return b
                    }
                },  
                none: 0, 
                unchanged: 10, 
                filtered: 20, 
                extchanged: 100, 
                conflict: 1000, 
                illegalchars: 2000
            }, 
            settings: {
                modificationPreview: true
            }
        }, 
        watch: {
            workingdir: (value, old) => {
                loadFiles(); 
            }, 
            files: {
                handler: (value, old) => {
                    preview(); 
                }, 
                deep: true
            }, 
            preactions: {
                handler: (value, old) => {
                    censor(); 
                    preview(); 
                }, 
                deep: true
            }, 
            actions: {
                handler: (value, old) => {
                    censor(); 
                    preview(); 
                }, 
                deep: true
            }
        }
    }); 

    vm.workingdir = "C:\\"; 
}
            
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
    if (vm.busy !== "none") {
        return; 
    }
    vm.busy = "execute"; 
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
    var bog = []; 
    for (var file of vm.files) {
        var record = rename(path.join(file.dir, file.name), path.join(file.dir, file.modified), bog); 
        records.push(record); 
    }
    vm.records.push(records); 
}

function rollback() {
    if (vm.busy !== "none") {
        return; 
    }
    vm.busy = "rollback"; 
    var records = vm.records.pop(); 
    var bog = []; 
    for (var record of records.reverse()) {
        rename(record.modified, record.original, bog); 
    }
}

function rename(original, modified, bog) {
    bog.push(original); 
    fs.rename(original, modified, ((bog, original, modified) => {
        return (error) => {
            if (error) {
                log(error); 
            }
            bog.pop(original); 
            log(original + " >>> " + modified); 
            if (bog.length < 1) {
                vm.busy = "none"; 
                log("Execution done. "); 
                loadFiles(); 
            }
        }; 
    })(bog, original, modified)); 
    var record = {
        original: original, 
        modified: modified
    }; 
    return record; 
}

function log(msg) {
    txtLog.value += "\n" + msg; 
    txtLog.scrollTop = txtLog.scrollHeight; 
}