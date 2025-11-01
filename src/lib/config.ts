import type { info } from "autoprefixer";

function get(attr, def) {
    return typeof attr != 'undefined' ? attr : def;
}

function renameProp(oldprop: string, newprop: string, obj: object) {
    if (oldprop in obj) {
        obj[newprop] = obj[oldprop];
    }
}

const toRename = {
    start_on_load: 'startOnLoad',
    shuffle_answers: 'shuffleAnswers',
    shuffle_questions: 'shuffleQuestions',
    button_color: 'buttonColor',
    primary_color: 'primaryColor',
    secondary_color: 'secondaryColor',
    text_color: 'textColor',
};

export class Config {
    startOnLoad: boolean;
    shuffleAnswers: boolean;
    shuffleQuestions: boolean;
    nQuestions: number | undefined;
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    backgroundColor: string;
    hintSymbolColor: string;
    hintBgColor: string;
    passSymbolColor: string;
    passBgColor: string
    failSymbolColor: string;
    failBgColor: string;
    infoSymbolColor: string;
    submitSymbolColor: string;
    shadowColor: string;
    codeBgColor: string;
    passingGrade: number | undefined;
    customPassMsg: string;
    customFailMsg: string;
    locale: 'de' | 'en' | 'es' | 'fr' | null;
    enableRetry: boolean;
    buttonColor: string;
    fontFamily: string | undefined;
    fontFamilyHeading: string | undefined;
    fontUrl: string | undefined;
    customStyles: string | undefined;

    constructor(options: Config | object) {
        // handle <=v0.3.0 snake_case options for backwards compatibility
        for (const oldName in toRename) {
            renameProp(oldName, toRename[oldName], options);
        }
        this.startOnLoad = get(options['startOnLoad'], true);
        this.shuffleAnswers = get(options['shuffleAnswers'], true);
        this.shuffleQuestions = get(options['shuffleQuestions'], false);
        this.nQuestions = get(options['nQuestions'], undefined);
        this.primaryColor = get(options['primaryColor'], 'steelblue');
        this.secondaryColor = get(options['secondaryColor'], '#f2f2f2');
        this.textColor = get(options['textColor'], 'black');
        this.backgroundColor = get(options['backgroundColor'], 'white');
        this.hintSymbolColor = get(options['hintSymbolColor'], '#ff9800');
        this.hintBgColor = get(options['hintBgColor'], '#ff990040');
        this.passSymbolColor = get(options['passSymbolColor'], '#00cc88');
        this.passBgColor = get(options['passBgColor'], '#00cc8840');
        this.failSymbolColor = get(options['failSymbolColor'], '#e72323');
        this.failBgColor = get(options['failBgColor'], '#e7232340');
        this.infoSymbolColor = get(options['infoSymbolColor'], '#2196F3');
        this.submitSymbolColor = get(options['submitSymbolColor'], '#2196F3');
        this.shadowColor = get(options['shadowColor'], '#00000020');
        this.codeBgColor = get(options['codeBgColor'], '#e0e0e0');
        this.passingGrade = get(options['passingGrade'], undefined);
        this.customPassMsg = get(options['customPassMsg'], 'You have passed!');
        this.customFailMsg = get(options['customFailMsg'], 'You have not passed');
        this.locale = get(options['locale'], null);
        this.enableRetry = get(options['enableRetry'],true);
        this.buttonColor = get(options['buttonColor'], 'steelblue');
        this.fontFamily = get(options['fontFamily'], undefined);
        this.fontFamilyHeading = get(options['fontFamilyHeading'], undefined);
        this.fontUrl = get(options['fontUrl'], undefined);
        this.customStyles = get(options['customStyles'], undefined);
    }
}

export function mergeAttributes(baseConfig: Config, newConfig: Config): Config {
    //newConfig overwrites entries in baseConfig
    let config = new Config(baseConfig);
    for (let attrname in newConfig) {
        if (Object.prototype.hasOwnProperty.call(newConfig, attrname)) {
            config[attrname] = newConfig[attrname];
        }
    }
    return config;
}