export class ConfigAppService {
  private readonly envConfig: { [key: string]: any } = null;
  constructor() {
    this.envConfig = {};
    this.envConfig.appPort = process.env.APP_PORT;
  }

  get(key: string): any {
    return this.envConfig[key];
  }
}
