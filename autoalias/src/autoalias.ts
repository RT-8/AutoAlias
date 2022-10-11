import {resolve, relative, isAbsolute} from "path";
import * as fs from "fs";


export class AutoAliasConfiguration {

    public readonly manualAlias : Record<string, unknown> | undefined;
    public readonly extensions : string[];
    public readonly include : AutoAliasTarget[];
    public readonly absoluteTypeScriptConfigurationPath : string | undefined;


    constructor(
         include : AutoAliasTarget[],
         extensions : string[],
         absoluteTypeScriptConfigurationPath : string | undefined = undefined,
         manualAlias : Record<string, unknown> | undefined = undefined) {
            
            this.include = include;
            this.extensions = extensions;
            this.manualAlias = manualAlias;
            this.absoluteTypeScriptConfigurationPath = absoluteTypeScriptConfigurationPath;
    }
    
}

export class AutoAliasTarget {
    public readonly absoluteDirectoryPath : string;
    public readonly ignoreFiles : string[];

    constructor(directoryPath: string, ignoreFiles : string[] | undefined = undefined) {
        this.absoluteDirectoryPath = directoryPath;
        this.ignoreFiles = ignoreFiles ?? [];
    }    
}
    
export class AutoAlias {
    public static readonly autoAliasPrefix = "@auto-alias";
    private aliasObject;
    private readonly configuration : AutoAliasConfiguration;
    

    constructor(configuration : AutoAliasConfiguration) {
        this.aliasObject = configuration.manualAlias ?? {};
        this.configuration = configuration;        
       
        for (const include of this.configuration.include) {
             this.IterateFiles(include.absoluteDirectoryPath, include.ignoreFiles);            
        }

        if (this.configuration.absoluteTypeScriptConfigurationPath) {
            this.ApplyTSConfigPaths();
        }

        console.log("\x1b[32m", "Aliases generated successfully.");
        console.table(this.aliasObject);

        return this.aliasObject;
    }
    
    IterateFiles(directoryPath : string, ignoreFiles : string[]) {

        const directoryEntities : fs.Dirent[] = fs.readdirSync(directoryPath, {withFileTypes : true});
        for (const directoryEntity of directoryEntities) {
            if (ignoreFiles.indexOf(directoryEntity.name) !== -1) {
                continue;
            }

            const entityPath = resolve(directoryPath, directoryEntity.name);
            if (directoryEntity.isFile()) {
                 this.TryAddAlias(entityPath, directoryEntity.name, this.configuration.extensions);
            } else if (directoryEntity.isDirectory()) {
                this.IterateFiles(entityPath, ignoreFiles);
            }

        }
    }
    
    TryAddAlias(filePath : string, fileName : string, allowedExtensions : string[]) {

        let aliasModuleName;

        for (let allowedExtensionIndex = 0; allowedExtensionIndex < allowedExtensions.length; allowedExtensionIndex++) {

            //Check if file has allowed extension.
            let fileExtensionStartIndex;
            if ((fileExtensionStartIndex = fileName.indexOf(allowedExtensions[allowedExtensionIndex])) !== -1) {
                
                //Extract default module name from fileName. May be overwritten by a command.
                aliasModuleName = fileName.substring(0, fileExtensionStartIndex);

                //Quite a bad method for reading the beginnings of files.
                //TODO. Implament a synchronous stream based reading method.
                const lines = fs.readFileSync(filePath, {encoding : 'utf-8'}).split(/\r?\n/);

                for (const line of lines) {
                    
                    let autoAliasPrefixIndex;
                    if ((autoAliasPrefixIndex = line.indexOf(AutoAlias.autoAliasPrefix)) !== -1) {

                        try {
                        const autoAliasCommand = line.substring(autoAliasPrefixIndex + AutoAlias.autoAliasPrefix.length);                        
                        const autoAliasCommandArgs = autoAliasCommand.split(' ');
                        const autoAliasCommandPrefix = autoAliasCommandArgs[0];

                        switch(autoAliasCommandPrefix) {
                            case "-ignore" : return;
                            //-name TestModule
                            case "-name" : aliasModuleName = autoAliasCommandArgs[1]; break;
                        }

                        } catch (ex) {
                            console.error(`AutoAlias - Unable to process in-module command! \n Command : ${line} \n Module : ${filePath}`);
                            throw ex;
                        }
                    } else {
                        break;
                    }
                }

                this.aliasObject[`@${aliasModuleName}`] = filePath;
            }
        }
    }

    ApplyTSConfigPaths = () => {

        let typescriptConfig : string | object;
        try {
            typescriptConfig = fs.readFileSync(this.configuration.absoluteTypeScriptConfigurationPath, {encoding : 'utf-8'}) 
        } catch (ex) {
            console.error(`AutoAlias - Unable to read TypeScript config! \n Provided path : ${this.configuration.absoluteTypeScriptConfigurationPath}`);
        }


        typescriptConfig = <object>JSON.parse(<string>typescriptConfig);
        
        const getTSConfigBaseUrl = (typeScriptConfigurationPath : string) : string => {
            const typeScriptBaseUrl = (<object>typescriptConfig)["compilerOptions"]["baseUrl"];

            if (!typeScriptBaseUrl) {
                const errorMessage = `AutoAlias - baseUrl is not set in tsconfig.json! \n TSConfig path : ${this.configuration.absoluteTypeScriptConfigurationPath}`;
                console.error(errorMessage);
                throw errorMessage;
            }

            if (isAbsolute(typeScriptBaseUrl)) {
                return typeScriptBaseUrl;
            }


            return resolve( resolve(typeScriptConfigurationPath, '..'), typeScriptBaseUrl);            
        }

        const buildTSConfigPaths = (typeScriptBaseUrl : string) => {
            const tsPathsObject = {};
            const aliasObjectKeys = Object.keys(this.aliasObject);

            for (let i = 0; i < aliasObjectKeys.length; i++) {
                let pathKey : string = aliasObjectKeys[i]; 
                let pathSrc = this.aliasObject[pathKey];

                //Calculate relative path from TypeScript's base url
                pathSrc = relative(typeScriptBaseUrl, pathSrc);

                //Remove possible webpack exact match syntax.
                pathKey = pathKey.replace("$", "");

                //Set path.
                tsPathsObject[pathKey] = [pathSrc];
            }

            return tsPathsObject;
        }

        //Set paths object in TypeScript config.
        (<object>typescriptConfig)["compilerOptions"]["paths"] = buildTSConfigPaths(getTSConfigBaseUrl(this.configuration.absoluteTypeScriptConfigurationPath));

        const serializedConfig = JSON.stringify(<object>typescriptConfig, null, " ");
        fs.writeFileSync(this.configuration.absoluteTypeScriptConfigurationPath, serializedConfig);
    }
}