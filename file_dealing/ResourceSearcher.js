const fsp = require('fs').promises;
const path = require('path');


class ResourcseSearcher{
    constructor(_path){
        this.mainPath = _path;
        this.jsonPath = path.resolve(this.mainPath, 'resources/resources_json');
        this.filesPath = path.resolve(this.mainPath, 'static');
        this.jsonFileName = 'images.json'
        this.jsonStructure = {};
    }

    async LoadResources() {
        const isFounded = await this.CheckJsonFileExist();
        let fileHandle = null;
        await this.GenerateJsonStructure();
        if(isFounded) {
            try {
                const resourceFilePath = path.resolve(this.jsonPath, this.jsonFileName);
                const fileHandle = await fsp.open(resourceFilePath, 'w+');
                const buffer = Buffer.from(JSON.stringify(this.jsonStructure, null, 2));
                await fileHandle.write(buffer, 0, buffer.length, 0);
                await fileHandle.close();
            } finally {
                if(fileHandle)
                    await fileHandle.close();
            }
        } else {
            const newFilePath = path.resolve(this.jsonPath, this.jsonFileName);
            const fileAppendResult = await fsp.appendFile(newFilePath, JSON.stringify(this.jsonStructure, null, 2));
        }
    }

    async CheckJsonFileExist() {
        const dir =  await fsp.readdir(this.jsonPath)
        let returnValue = false;
        if(dir.length === 0)
            return returnValue;
        else {
            dir.forEach(fileName => {
                if(fileName === this.jsonFileName)
                {
                    returnValue = true;
                }
            });
            return returnValue;
        }
    }   
    
    async GenerateJsonStructure(){
        let staticSection = [];
        const resourceDir = await fsp.opendir(this.filesPath);
        for await(const dirent of resourceDir){
            if(dirent.isDirectory() === false)
            {
                staticSection.push({name:`${name}`, path:path.resolve(this.filesPath, dirent.name)});
                this.jsonStructure['static'] = staticSection;
            }
            else {
                const innerResource = await fsp.readdir(path.resolve(this.filesPath, dirent.name), {withFileTypes:true});
                let innerFilePath = path.resolve(this.filesPath, dirent.name);
                let innerFileArray = [];
                for await(const innerDirent of innerResource){
                    innerFileArray.push({name: innerDirent.name, path: path.resolve(innerFilePath, innerDirent.name)});
                }
                this.jsonStructure[`${dirent.name}`] = innerFileArray;
            }

        }
    }

    async GetImagesDataFromFile() {
        let data = {};
        const imageFilePath = path.resolve(this.jsonPath, this.jsonFileName);
        if(this.CheckJsonFileExist())
        {
            let fileHandle = null;
            try {
                fileHandle = await fsp.open(imageFilePath, 'r+');
                const buffer = await fileHandle.readFile();
                data = JSON.parse(buffer.toString());
                await fileHandle.close();
            } finally {

            }
        }
        return data;
    }
}

module.exports = ResourcseSearcher;