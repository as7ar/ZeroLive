export namespace main {
	
	export class AccountSetting {
	    id: string;
	    nickname: string;
	
	    static createFrom(source: any = {}) {
	        return new AccountSetting(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.nickname = source["nickname"];
	    }
	}
	export class GeneralSetting {
	    autorun: boolean;
	
	    static createFrom(source: any = {}) {
	        return new GeneralSetting(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.autorun = source["autorun"];
	    }
	}
	export class LiveSetting {
	    chzzk: string;
	    soop: string;
	    weflab: string;
	
	    static createFrom(source: any = {}) {
	        return new LiveSetting(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.chzzk = source["chzzk"];
	        this.soop = source["soop"];
	        this.weflab = source["weflab"];
	    }
	}
	export class Settings {
	    general: GeneralSetting;
	    live: LiveSetting;
	    account: AccountSetting;
	    is_first: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Settings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.general = this.convertValues(source["general"], GeneralSetting);
	        this.live = this.convertValues(source["live"], LiveSetting);
	        this.account = this.convertValues(source["account"], AccountSetting);
	        this.is_first = source["is_first"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

