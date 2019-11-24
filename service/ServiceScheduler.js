const cp = require('child_process');
const path = require('path');


class ServiceScheduler{
    constructor(serviceSearcher) {
        this.searcher = serviceSearcher;
        this.services = [];
    }
    async RunServices() {
        const directories = await this.searcher.FindDirectories();
        for await(const paths of directories) {
            if(paths.endsWith('resources'))
                {
                    const filePath = path.resolve(paths, 'index.js');
                    const process = cp.fork(filePath, [this.searcher.filePath]);
                    this.services.push(process);                        
                }
                else
                {
                    const filePath = path.resolve(paths, 'index.js');
                    const process = cp.fork(filePath);
                    this.services.push(process);
                }
        }
    }
}

module.exports = ServiceScheduler;