import { ICommandOptions } from "./message";

export interface FeatureAttribute {
  uptime: Date;
  command: ICommandOptions | Map<any, any>;
}
