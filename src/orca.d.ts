export interface OrcaOptions {
  globalKey?: string;
  entryKey?: string;
}

export interface ActionOptions {
  priority?: number;
  excludes?: string | string[];
}

export interface RunOptions {
  runGlobals?: boolean;
}

export interface CallbackDefinition {
  func: () => void;
  excludes: string[];
}
