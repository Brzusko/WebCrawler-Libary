const fs = require('fs');
const path = require('path');

class ServiceSearcher {
    constructor(){
        this.filePattern = '.server';
        this.directories = [];
        this.searchedServicesPaths = [];
    }

    async FindDirectories(){
        const dir = await fs.promises.opendir('..');

        for await(const dirent of dir)
            console.log(dirent.name);
    }
}

module.exports = ServiceSearcher;