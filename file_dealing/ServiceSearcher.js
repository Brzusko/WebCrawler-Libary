const fs = require('fs');
const path = require('path');

class ServiceSearcher {
    constructor(_path){
        this.filePattern = '.server';
        this.directories = [];
        this.filePath = _path;  
    }
    async FindDirectories(){
        const dir = await fs.promises.opendir(this.filePath);
        let tempFilePath = this.filePath;
        for await(const dirent of dir) {
            if(dirent.isDirectory() && dirent.name !== 'node_modules' && dirent.name !== '.git') {
                tempFilePath = path.resolve(this.filePath, dirent.name);
                const dirInfo = await fs.promises.readdir(tempFilePath, {withFileTypes:true})
                for await(const file of dirInfo) {
                    if(file.name === this.filePattern)
                        this.directories.push(tempFilePath);
                }
            }
        }
        return this.directories;
    }
}

module.exports = ServiceSearcher;