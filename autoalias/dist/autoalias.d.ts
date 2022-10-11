export declare class AutoAliasConfiguration {
    readonly manualAlias: Record<string, unknown> | undefined;
    readonly extensions: string[];
    readonly include: AutoAliasTarget[];
    readonly absoluteTypeScriptConfigurationPath: string | undefined;
    constructor(include: AutoAliasTarget[], extensions: string[], absoluteTypeScriptConfigurationPath?: string | undefined, manualAlias?: Record<string, unknown> | undefined);
}
export declare class AutoAliasTarget {
    readonly absoluteDirectoryPath: string;
    readonly ignoreFiles: string[];
    constructor(directoryPath: string, ignoreFiles?: string[] | undefined);
}
export declare class AutoAlias {
    static readonly autoAliasPrefix = "@auto-alias";
    private aliasObject;
    private readonly configuration;
    constructor(configuration: AutoAliasConfiguration);
    IterateFiles(directoryPath: string, ignoreFiles: string[]): void;
    TryAddAlias(filePath: string, fileName: string, allowedExtensions: string[]): void;
    ApplyTSConfigPaths: () => void;
}
