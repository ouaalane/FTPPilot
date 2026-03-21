 import { Client } from "basic-ftp"
 import fsPromises from 'node:fs/promises';



class  MyFTPClient
{
     constructor(host, port, user, password, secure, verbose)
    {
        
        
        this.Options = {
            host: host,
            port: port,
            user: user,
            password: password,
            secure: secure,
            verbose: verbose
        };
        this.client =  new Client(400000);
        this.client.ftp.verbose = this.Options.verbose; 

    }


    // async DownloadFile(filepath, destination) {
    
    //     try
    //     {
    //         await this.client.downloadToDir(
    //             destination,
    //             filepath
    //         );
    //     }
    //     catch(err)
    //     {
    //         console.log("\x1b[31m", "Error downloading file: " + filepath); 
    //         console.log(err);
    //         return false;
    //     }
        
    //     return true;
    // }


    async  DownloadDirectory(directoryPath,destination)
    {


        await this.client.access({
            host: this.Options.host,
            port: this.Options.port,
            user: this.Options.user,
            password: this.Options.password,
            secure: this.Options.secure
        });


        const listFiles = await this.client.list(directoryPath);
        const files = listFiles.filter(f=>f.type ===1);
         
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);

        let Downloaded = 0;
        let progressPercentage = 0;

        this.client.trackProgress(info => {
            Downloaded += info.bytesOverall - Downloaded; 
            const percentage = ((Downloaded / totalSize) * 100).toFixed(2);
            progressPercentage = percentage;
            console.clear();
            console.log(`\x1b[32m`, `Progress: ${progressPercentage}%`);
        });


        await this.client.downloadToDir(
            destination,
            directoryPath
        );

        console.log(`\x1b[32m`, `Download completed: ${progressPercentage}%`);

        
        


    }

  static async  geLocaltFileSize(filename) {
  try {
    const stats = await fsPromises.stat(filename);
    if (!stats.isFile())
    {
        return 0;
    }
    const fileSizeInBytes = stats.size;
    return  fileSizeInBytes;
  } catch (err) {
    console.error('Error getting file size:', err);
    return 0;
  }
}

   static async geLocaltDirectorySize(directory) {
    try {
        const files = await fsPromises.readdir(directory);
        let totalSize = 0;
        
        for (const file of files) {
            const filePath = `${directory}/${file}`;
            totalSize += await this.geLocaltFileSize(filePath);
        }
        
        console.log(`Directory size: ${totalSize} bytes`);
    } catch (err) {
        console.error('Error getting directory size:', err);
    }
}

    async UploadDirectory(localDirectory, remoteDirectory)
    {
        await this.client.access({
            host: this.Options.host,
            port: this.Options.port,
            user: this.Options.user,
            password: this.Options.password,
            secure: this.Options.secure
        });

        let progressPercentage = 0;
        let Uploaded = 0;
        const totalSize = await this.geLocaltDirectorySize(localDirectory);

        this.client.trackProgress(info => {
            Uploaded += info.bytesOverall - Uploaded; 
            const percentage = ((Uploaded / totalSize) * 100).toFixed(2);
            progressPercentage = percentage;
            console.clear();
            console.log(`\x1b[32m`, `Upload Progress: ${progressPercentage}%`);
        });
        
        await this.client.uploadFromDir(
            localDirectory,
            remoteDirectory
        );



        

    }



}


const c = new MyFTPClient("192.168.100.71", 5972, "pc", "517320", false, false);


// await c.DownloadDirectory("/device/DCIM/Camera", "./my-phone-files");


// MyFTPClient.geLocaltFileSize("C:\\deep\\453770724_1022252395650955_599130495967656234_n.jpg");


// MyFTPClient.geLocaltDirectorySize("C:\\deep\\");


await c.UploadDirectory("C:\\deep\\", "/device/DCIM/Camera");