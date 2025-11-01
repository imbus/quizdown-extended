export class Config {
  startOnLoad!: boolean;
  shuffleAnswers!: boolean;
  shuffleQuestions!: boolean;
  nQuestions?: number;
  primaryColor!: string;
  secondaryColor!: string;
  textColor!: string;
  backgroundColor!: string;
  hintSymbolColor!: string;
  hintBgColor!: string;
  passSymbolColor!: string;
  passBgColor!: string;
  failSymbolColor!: string;
  failBgColor!: string;
  infoSymbolColor!: string;
  submitSymbolColor!: string;
  shadowColor!: string;
  codeBgColor!: string;
  passingGrade!: number;
  customPassMsg!: string;
  customFailMsg!: string;
  locale!: 'de' | 'en' | 'es' | 'fr' | null;
  enableRetry!: boolean;
  buttonColor!: string;
  fontFamily?: string;
  fontFamilyHeading?: string;
  fontUrl?: string;
  customStyles?: string;

  private static readonly DEFAULTS: Omit<Config, 'constructor'> = {
    startOnLoad: true,
    shuffleAnswers: true,
    shuffleQuestions: false,
    nQuestions: undefined,
    primaryColor: 'steelblue',
    secondaryColor: '#f2f2f2',
    textColor: 'black',
    backgroundColor: 'white',
    hintSymbolColor: '#ff9800',
    hintBgColor: '#ff990040',
    passSymbolColor: '#00cc88',
    passBgColor: '#00cc8840',
    failSymbolColor: '#e72323',
    failBgColor: '#e7232340',
    infoSymbolColor: '#2196F3',
    submitSymbolColor: '#2196F3',
    shadowColor: '#00000020',
    codeBgColor: '#e0e0e0',
    passingGrade: 60,
    customPassMsg: 'You have passed!',
    customFailMsg: 'You have not passed',
    locale: null,
    enableRetry: true,
    buttonColor: 'steelblue',
    fontFamily: undefined,
    fontFamilyHeading: undefined,
    fontUrl: undefined,
    customStyles: undefined,
  };

  constructor(options: Partial<Config> = {}) {
    // Merge provided options with defaults
    const merged = { ...Config.DEFAULTS, ...options };

    // Assign all properties
    Object.assign(this, merged);
  }
}

export function mergeAttributes(baseConfig: Config, newConfig: Partial<Config>): Config {
  // newConfig overwrites entries in baseConfig
  return new Config({ ...baseConfig, ...newConfig });
}