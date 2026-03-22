 import { Client } from "basic-ftp"
 import fsPromises from 'node:fs/promises';

class  MyFTPClient
{

     
      constructor(host, port, user, password, secure, verbose) {
        this.Options = {
            host: host,
            port: port,
            user: user,
            password: password,
            secure: secure,
            verbose: verbose
        };
        this.client = new Client(400000);
        this.client.ftp.verbose = this.Options.verbose;
        
    }

    async connect() {
        await this.client.access({
            host: this.Options.host,
            port: this.Options.port,
            user: this.Options.user,
            password: this.Options.password,
            secure: this.Options.secure
        });
    }
    
      init(callback) {
            callback.bind(this)();
        }
    async DownloadFile(filepath, destination) {
    
        try
        {
             await this.client.downloadTo(
                destination,
                filepath
            );
            return true;
        }
        catch(err)
        {
            console.log("\x1b[31m", "Error downloading file: " + filepath); 
           console.error(err);
            return false;
        }
        

    }


    async  DownloadDirectory(directoryPath,destination)
    {



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

    static async geLocaltDirectorySize(directory) 
    {
    try {
        const files = await fsPromises.readdir(directory);
        let totalSize = 0;
        
        for (const file of files) {
            const filePath = `${directory}/${file}`;
            totalSize += await this.geLocaltFileSize(filePath);
        }
        return totalSize;
        
        
    } catch (err) 
    {
        console.error('Error getting directory size:', err);
        return 0;
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
        const totalSize = await MyFTPClient.geLocaltDirectorySize(localDirectory);


       
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

    async UploadFile(localFile, destination)
    {
        
        await this.client.ensureDir(destination.substring(0, destination.lastIndexOf('/')));
        try
        {
            await this.client.uploadFrom(localFile, destination);
                    
        }
        catch(err)
        {
            console.error('Error uploading file:', err);
            return false;
        }

        return true;
    }
    

    async disconnect()
    {
        await this.client.close();
    }



    async deleteFile(remoteFile)
    {
        try
        {
            await this.client.remove(remoteFile);
        } 
        catch(err)
        {
            console.error('Error deleting file:', err);
            
        }
    }
   
    async deleteDirectory(remoteDirectory)
    {
        try
        {
            await this.client.removeDir(remoteDirectory)
          
            
        }
        catch(err)
        {
            console.error('Error deleting directory:', err);
            
        }
    }



    async IsDirectoryExist(remoteDirectory)
    {
        try
        {
            await this.client.cd(remoteDirectory);
            return true;
        }
        catch(err)
        {
            console.error('Error checking directory existence:', err);
            return false;
        }
    }
    async deleteAllFilesInDirectory(remoteDirectory)
    {
        if (!(await this.IsDirectoryExist(remoteDirectory)))
        {
            console.error('Directory does not exist:', remoteDirectory);
            return false;
        }

        try
        {
            
            const listFiles = await this.client.list(remoteDirectory);
            const files = listFiles.filter(f=>f.type ===1);
            for(const file of files)
            {
                await this.deleteFile(remoteDirectory + "/" + file.name);
            }
           
        }
        catch(err)
        {
            console.error('Error deleting files in directory:', err);
            return false;

        }
        

        return true;
    }
}


const c = new MyFTPClient("192.168.100.52", 4806, "pc", "554216", false, false);

await c.connect();


// await c.DownloadFile("/device/DCIM/Camera/20191106_155609.jpg", "C:\\deep\\pro.jpg");


// await c.UploadFile("C:\\deep\\pro.jpg", "/device/deep/pro2.jpg");


// await c.deleteAllFilesInDirectory("/device/deep/") ? console.log("\x1b[32m", "All files in directory deleted successfully") : console.log("\x1b[31m", "Failed to delete all files in directory");

// await c.deleteFile("/device/deep/pro2.jpg");


// await c.DownloadDirectory("/device/DCIM/Camera", "./my-phone-files");


// MyFTPClient.geLocaltFileSize("C:\\deep\\453770724_1022252395650955_599130495967656234_n.jpg");


// MyFTPClient.geLocaltDirectorySize("C:\\deep\\");


// await c.UploadDirectory("C:\\deep\\", "/device/deep/");

