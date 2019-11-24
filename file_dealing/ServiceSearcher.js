const fs = require('fs');
const path = require('path');

class ServiceSearcher {
    constructor(){
        this.filePattern = '.server';
        this.directories = [];
    }

    async FindDirectories(dirPath){
        const dir = await fs.promises.opendir(dirPath);
        let filePath = dirPath;
        for await(const dirent of dir) {
            if(dirent.isDirectory() && dirent.name !== 'node_modules' && dirent.name !== '.git') {
                filePath = path.resolve(dirPath, dirent.name);
                const dirInfo = await fs.promises.readdir(filePath, {withFileTypes:true})
                for await(const file of dirInfo) {
                    if(file.name === this.filePattern)
                        this.directories.push(filePath);
                }
            }
        }
    }
}

module.exports = ServiceSearcher;