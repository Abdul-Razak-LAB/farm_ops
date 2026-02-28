module.exports = [
"[project]/node_modules/semver/internal/constants.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
const SEMVER_SPEC_VERSION = '2.0.0';
const MAX_LENGTH = 256;
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */ 9007199254740991;
// Max safe segment length for coercion.
const MAX_SAFE_COMPONENT_LENGTH = 16;
// Max safe length for a build identifier. The max length minus 6 characters for
// the shortest version with a build 0.0.0+BUILD.
const MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
const RELEASE_TYPES = [
    'major',
    'premajor',
    'minor',
    'preminor',
    'patch',
    'prepatch',
    'prerelease'
];
module.exports = {
    MAX_LENGTH,
    MAX_SAFE_COMPONENT_LENGTH,
    MAX_SAFE_BUILD_LENGTH,
    MAX_SAFE_INTEGER,
    RELEASE_TYPES,
    SEMVER_SPEC_VERSION,
    FLAG_INCLUDE_PRERELEASE: 0b001,
    FLAG_LOOSE: 0b010
};
}),
"[project]/node_modules/semver/internal/debug.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const debug = typeof process === 'object' && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args)=>console.error('SEMVER', ...args) : ()=>{};
module.exports = debug;
}),
"[project]/node_modules/semver/internal/re.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const { MAX_SAFE_COMPONENT_LENGTH, MAX_SAFE_BUILD_LENGTH, MAX_LENGTH } = __turbopack_context__.r("[project]/node_modules/semver/internal/constants.js [app-route] (ecmascript)");
const debug = __turbopack_context__.r("[project]/node_modules/semver/internal/debug.js [app-route] (ecmascript)");
exports = module.exports = {};
// The actual regexps go on exports.re
const re = exports.re = [];
const safeRe = exports.safeRe = [];
const src = exports.src = [];
const safeSrc = exports.safeSrc = [];
const t = exports.t = {};
let R = 0;
const LETTERDASHNUMBER = '[a-zA-Z0-9-]';
// Replace some greedy regex tokens to prevent regex dos issues. These regex are
// used internally via the safeRe object since all inputs in this library get
// normalized first to trim and collapse all extra whitespace. The original
// regexes are exported for userland consumption and lower level usage. A
// future breaking change could export the safer regex only with a note that
// all input should have extra whitespace removed.
const safeRegexReplacements = [
    [
        '\\s',
        1
    ],
    [
        '\\d',
        MAX_LENGTH
    ],
    [
        LETTERDASHNUMBER,
        MAX_SAFE_BUILD_LENGTH
    ]
];
const makeSafeRegex = (value)=>{
    for (const [token, max] of safeRegexReplacements){
        value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
    }
    return value;
};
const createToken = (name, value, isGlobal)=>{
    const safe = makeSafeRegex(value);
    const index = R++;
    debug(name, index, value);
    t[name] = index;
    src[index] = value;
    safeSrc[index] = safe;
    re[index] = new RegExp(value, isGlobal ? 'g' : undefined);
    safeRe[index] = new RegExp(safe, isGlobal ? 'g' : undefined);
};
// The following Regular Expressions can be used for tokenizing,
// validating, and parsing SemVer version strings.
// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.
createToken('NUMERICIDENTIFIER', '0|[1-9]\\d*');
createToken('NUMERICIDENTIFIERLOOSE', '\\d+');
// ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.
createToken('NONNUMERICIDENTIFIER', `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
// ## Main Version
// Three dot-separated numeric identifiers.
createToken('MAINVERSION', `(${src[t.NUMERICIDENTIFIER]})\\.` + `(${src[t.NUMERICIDENTIFIER]})\\.` + `(${src[t.NUMERICIDENTIFIER]})`);
createToken('MAINVERSIONLOOSE', `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` + `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` + `(${src[t.NUMERICIDENTIFIERLOOSE]})`);
// ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.
// Non-numeric identifiers include numeric identifiers but can be longer.
// Therefore non-numeric identifiers must go first.
createToken('PRERELEASEIDENTIFIER', `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIER]})`);
createToken('PRERELEASEIDENTIFIERLOOSE', `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIERLOOSE]})`);
// ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.
createToken('PRERELEASE', `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
createToken('PRERELEASELOOSE', `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
// ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.
createToken('BUILDIDENTIFIER', `${LETTERDASHNUMBER}+`);
// ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.
createToken('BUILD', `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
// ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.
// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.
createToken('FULLPLAIN', `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
createToken('FULL', `^${src[t.FULLPLAIN]}$`);
// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.
createToken('LOOSEPLAIN', `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
createToken('LOOSE', `^${src[t.LOOSEPLAIN]}$`);
createToken('GTLT', '((?:<|>)?=?)');
// Something like "2.*" or "1.2.x".
// Note that "x.x" is a valid xRange identifer, meaning "any version"
// Only the first item is strictly required.
createToken('XRANGEIDENTIFIERLOOSE', `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
createToken('XRANGEIDENTIFIER', `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
createToken('XRANGEPLAIN', `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` + `(?:\\.(${src[t.XRANGEIDENTIFIER]})` + `(?:\\.(${src[t.XRANGEIDENTIFIER]})` + `(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?` + `)?)?`);
createToken('XRANGEPLAINLOOSE', `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?` + `)?)?`);
createToken('XRANGE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
createToken('XRANGELOOSE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
// Coercion.
// Extract anything that could conceivably be a part of a valid semver
createToken('COERCEPLAIN', `${'(^|[^\\d])' + '(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})` + `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` + `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
createToken('COERCE', `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
createToken('COERCEFULL', src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?` + `(?:${src[t.BUILD]})?` + `(?:$|[^\\d])`);
createToken('COERCERTL', src[t.COERCE], true);
createToken('COERCERTLFULL', src[t.COERCEFULL], true);
// Tilde ranges.
// Meaning is "reasonably at or greater than"
createToken('LONETILDE', '(?:~>?)');
createToken('TILDETRIM', `(\\s*)${src[t.LONETILDE]}\\s+`, true);
exports.tildeTrimReplace = '$1~';
createToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
createToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
// Caret ranges.
// Meaning is "at least and backwards compatible with"
createToken('LONECARET', '(?:\\^)');
createToken('CARETTRIM', `(\\s*)${src[t.LONECARET]}\\s+`, true);
exports.caretTrimReplace = '$1^';
createToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
createToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
// A simple gt/lt/eq thing, or just "" to indicate "any version"
createToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
createToken('COMPARATOR', `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
// An expression to strip any whitespace between the gtlt and the thing
// it modifies, so that `> 1.2.3` ==> `>1.2.3`
createToken('COMPARATORTRIM', `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
exports.comparatorTrimReplace = '$1$2$3';
// Something like `1.2.3 - 1.2.4`
// Note that these all use the loose form, because they'll be
// checked against either the strict or loose comparator form
// later.
createToken('HYPHENRANGE', `^\\s*(${src[t.XRANGEPLAIN]})` + `\\s+-\\s+` + `(${src[t.XRANGEPLAIN]})` + `\\s*$`);
createToken('HYPHENRANGELOOSE', `^\\s*(${src[t.XRANGEPLAINLOOSE]})` + `\\s+-\\s+` + `(${src[t.XRANGEPLAINLOOSE]})` + `\\s*$`);
// Star ranges basically just allow anything at all.
createToken('STAR', '(<|>)?=?\\s*\\*');
// >=0.0.0 is like a star
createToken('GTE0', '^\\s*>=\\s*0\\.0\\.0\\s*$');
createToken('GTE0PRE', '^\\s*>=\\s*0\\.0\\.0-0\\s*$');
}),
"[project]/node_modules/semver/internal/parse-options.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// parse out just the options we care about
const looseOption = Object.freeze({
    loose: true
});
const emptyOpts = Object.freeze({});
const parseOptions = (options)=>{
    if (!options) {
        return emptyOpts;
    }
    if (typeof options !== 'object') {
        return looseOption;
    }
    return options;
};
module.exports = parseOptions;
}),
"[project]/node_modules/semver/internal/identifiers.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const numeric = /^[0-9]+$/;
const compareIdentifiers = (a, b)=>{
    if (typeof a === 'number' && typeof b === 'number') {
        return a === b ? 0 : a < b ? -1 : 1;
    }
    const anum = numeric.test(a);
    const bnum = numeric.test(b);
    if (anum && bnum) {
        a = +a;
        b = +b;
    }
    return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
};
const rcompareIdentifiers = (a, b)=>compareIdentifiers(b, a);
module.exports = {
    compareIdentifiers,
    rcompareIdentifiers
};
}),
"[project]/node_modules/semver/classes/semver.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const debug = __turbopack_context__.r("[project]/node_modules/semver/internal/debug.js [app-route] (ecmascript)");
const { MAX_LENGTH, MAX_SAFE_INTEGER } = __turbopack_context__.r("[project]/node_modules/semver/internal/constants.js [app-route] (ecmascript)");
const { safeRe: re, t } = __turbopack_context__.r("[project]/node_modules/semver/internal/re.js [app-route] (ecmascript)");
const parseOptions = __turbopack_context__.r("[project]/node_modules/semver/internal/parse-options.js [app-route] (ecmascript)");
const { compareIdentifiers } = __turbopack_context__.r("[project]/node_modules/semver/internal/identifiers.js [app-route] (ecmascript)");
class SemVer {
    constructor(version, options){
        options = parseOptions(options);
        if (version instanceof SemVer) {
            if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
                return version;
            } else {
                version = version.version;
            }
        } else if (typeof version !== 'string') {
            throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
        }
        if (version.length > MAX_LENGTH) {
            throw new TypeError(`version is longer than ${MAX_LENGTH} characters`);
        }
        debug('SemVer', version, options);
        this.options = options;
        this.loose = !!options.loose;
        // this isn't actually relevant for versions, but keep it so that we
        // don't run into trouble passing this.options around.
        this.includePrerelease = !!options.includePrerelease;
        const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
        if (!m) {
            throw new TypeError(`Invalid Version: ${version}`);
        }
        this.raw = version;
        // these are actually numbers
        this.major = +m[1];
        this.minor = +m[2];
        this.patch = +m[3];
        if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
            throw new TypeError('Invalid major version');
        }
        if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
            throw new TypeError('Invalid minor version');
        }
        if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
            throw new TypeError('Invalid patch version');
        }
        // numberify any prerelease numeric ids
        if (!m[4]) {
            this.prerelease = [];
        } else {
            this.prerelease = m[4].split('.').map((id)=>{
                if (/^[0-9]+$/.test(id)) {
                    const num = +id;
                    if (num >= 0 && num < MAX_SAFE_INTEGER) {
                        return num;
                    }
                }
                return id;
            });
        }
        this.build = m[5] ? m[5].split('.') : [];
        this.format();
    }
    format() {
        this.version = `${this.major}.${this.minor}.${this.patch}`;
        if (this.prerelease.length) {
            this.version += `-${this.prerelease.join('.')}`;
        }
        return this.version;
    }
    toString() {
        return this.version;
    }
    compare(other) {
        debug('SemVer.compare', this.version, this.options, other);
        if (!(other instanceof SemVer)) {
            if (typeof other === 'string' && other === this.version) {
                return 0;
            }
            other = new SemVer(other, this.options);
        }
        if (other.version === this.version) {
            return 0;
        }
        return this.compareMain(other) || this.comparePre(other);
    }
    compareMain(other) {
        if (!(other instanceof SemVer)) {
            other = new SemVer(other, this.options);
        }
        if (this.major < other.major) {
            return -1;
        }
        if (this.major > other.major) {
            return 1;
        }
        if (this.minor < other.minor) {
            return -1;
        }
        if (this.minor > other.minor) {
            return 1;
        }
        if (this.patch < other.patch) {
            return -1;
        }
        if (this.patch > other.patch) {
            return 1;
        }
        return 0;
    }
    comparePre(other) {
        if (!(other instanceof SemVer)) {
            other = new SemVer(other, this.options);
        }
        // NOT having a prerelease is > having one
        if (this.prerelease.length && !other.prerelease.length) {
            return -1;
        } else if (!this.prerelease.length && other.prerelease.length) {
            return 1;
        } else if (!this.prerelease.length && !other.prerelease.length) {
            return 0;
        }
        let i = 0;
        do {
            const a = this.prerelease[i];
            const b = other.prerelease[i];
            debug('prerelease compare', i, a, b);
            if (a === undefined && b === undefined) {
                return 0;
            } else if (b === undefined) {
                return 1;
            } else if (a === undefined) {
                return -1;
            } else if (a === b) {
                continue;
            } else {
                return compareIdentifiers(a, b);
            }
        }while (++i)
    }
    compareBuild(other) {
        if (!(other instanceof SemVer)) {
            other = new SemVer(other, this.options);
        }
        let i = 0;
        do {
            const a = this.build[i];
            const b = other.build[i];
            debug('build compare', i, a, b);
            if (a === undefined && b === undefined) {
                return 0;
            } else if (b === undefined) {
                return 1;
            } else if (a === undefined) {
                return -1;
            } else if (a === b) {
                continue;
            } else {
                return compareIdentifiers(a, b);
            }
        }while (++i)
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(release, identifier, identifierBase) {
        if (release.startsWith('pre')) {
            if (!identifier && identifierBase === false) {
                throw new Error('invalid increment argument: identifier is empty');
            }
            // Avoid an invalid semver results
            if (identifier) {
                const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]);
                if (!match || match[1] !== identifier) {
                    throw new Error(`invalid identifier: ${identifier}`);
                }
            }
        }
        switch(release){
            case 'premajor':
                this.prerelease.length = 0;
                this.patch = 0;
                this.minor = 0;
                this.major++;
                this.inc('pre', identifier, identifierBase);
                break;
            case 'preminor':
                this.prerelease.length = 0;
                this.patch = 0;
                this.minor++;
                this.inc('pre', identifier, identifierBase);
                break;
            case 'prepatch':
                // If this is already a prerelease, it will bump to the next version
                // drop any prereleases that might already exist, since they are not
                // relevant at this point.
                this.prerelease.length = 0;
                this.inc('patch', identifier, identifierBase);
                this.inc('pre', identifier, identifierBase);
                break;
            // If the input is a non-prerelease version, this acts the same as
            // prepatch.
            case 'prerelease':
                if (this.prerelease.length === 0) {
                    this.inc('patch', identifier, identifierBase);
                }
                this.inc('pre', identifier, identifierBase);
                break;
            case 'release':
                if (this.prerelease.length === 0) {
                    throw new Error(`version ${this.raw} is not a prerelease`);
                }
                this.prerelease.length = 0;
                break;
            case 'major':
                // If this is a pre-major version, bump up to the same major version.
                // Otherwise increment major.
                // 1.0.0-5 bumps to 1.0.0
                // 1.1.0 bumps to 2.0.0
                if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
                    this.major++;
                }
                this.minor = 0;
                this.patch = 0;
                this.prerelease = [];
                break;
            case 'minor':
                // If this is a pre-minor version, bump up to the same minor version.
                // Otherwise increment minor.
                // 1.2.0-5 bumps to 1.2.0
                // 1.2.1 bumps to 1.3.0
                if (this.patch !== 0 || this.prerelease.length === 0) {
                    this.minor++;
                }
                this.patch = 0;
                this.prerelease = [];
                break;
            case 'patch':
                // If this is not a pre-release version, it will increment the patch.
                // If it is a pre-release it will bump up to the same patch version.
                // 1.2.0-5 patches to 1.2.0
                // 1.2.0 patches to 1.2.1
                if (this.prerelease.length === 0) {
                    this.patch++;
                }
                this.prerelease = [];
                break;
            // This probably shouldn't be used publicly.
            // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
            case 'pre':
                {
                    const base = Number(identifierBase) ? 1 : 0;
                    if (this.prerelease.length === 0) {
                        this.prerelease = [
                            base
                        ];
                    } else {
                        let i = this.prerelease.length;
                        while(--i >= 0){
                            if (typeof this.prerelease[i] === 'number') {
                                this.prerelease[i]++;
                                i = -2;
                            }
                        }
                        if (i === -1) {
                            // didn't increment anything
                            if (identifier === this.prerelease.join('.') && identifierBase === false) {
                                throw new Error('invalid increment argument: identifier already exists');
                            }
                            this.prerelease.push(base);
                        }
                    }
                    if (identifier) {
                        // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
                        // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
                        let prerelease = [
                            identifier,
                            base
                        ];
                        if (identifierBase === false) {
                            prerelease = [
                                identifier
                            ];
                        }
                        if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
                            if (isNaN(this.prerelease[1])) {
                                this.prerelease = prerelease;
                            }
                        } else {
                            this.prerelease = prerelease;
                        }
                    }
                    break;
                }
            default:
                throw new Error(`invalid increment argument: ${release}`);
        }
        this.raw = this.format();
        if (this.build.length) {
            this.raw += `+${this.build.join('.')}`;
        }
        return this;
    }
}
module.exports = SemVer;
}),
"[project]/node_modules/semver/functions/parse.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const SemVer = __turbopack_context__.r("[project]/node_modules/semver/classes/semver.js [app-route] (ecmascript)");
const parse = (version, options, throwErrors = false)=>{
    if (version instanceof SemVer) {
        return version;
    }
    try {
        return new SemVer(version, options);
    } catch (er) {
        if (!throwErrors) {
            return null;
        }
        throw er;
    }
};
module.exports = parse;
}),
"[project]/node_modules/semver/functions/valid.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const parse = __turbopack_context__.r("[project]/node_modules/semver/functions/parse.js [app-route] (ecmascript)");
const valid = (version, options)=>{
    const v = parse(version, options);
    return v ? v.version : null;
};
module.exports = valid;
}),
"[project]/node_modules/semver/functions/clean.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const parse = __turbopack_context__.r("[project]/node_modules/semver/functions/parse.js [app-route] (ecmascript)");
const clean = (version, options)=>{
    const s = parse(version.trim().replace(/^[=v]+/, ''), options);
    return s ? s.version : null;
};
module.exports = clean;
}),
"[project]/node_modules/semver/functions/inc.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const SemVer = __turbopack_context__.r("[project]/node_modules/semver/classes/semver.js [app-route] (ecmascript)");
const inc = (version, release, options, identifier, identifierBase)=>{
    if (typeof options === 'string') {
        identifierBase = identifier;
        identifier = options;
        options = undefined;
    }
    try {
        return new SemVer(version instanceof SemVer ? version.version : version, options).inc(release, identifier, identifierBase).version;
    } catch (er) {
        return null;
    }
};
module.exports = inc;
}),
"[project]/node_modules/semver/functions/diff.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const parse = __turbopack_context__.r("[project]/node_modules/semver/functions/parse.js [app-route] (ecmascript)");
const diff = (version1, version2)=>{
    const v1 = parse(version1, null, true);
    const v2 = parse(version2, null, true);
    const comparison = v1.compare(v2);
    if (comparison === 0) {
        return null;
    }
    const v1Higher = comparison > 0;
    const highVersion = v1Higher ? v1 : v2;
    const lowVersion = v1Higher ? v2 : v1;
    const highHasPre = !!highVersion.prerelease.length;
    const lowHasPre = !!lowVersion.prerelease.length;
    if (lowHasPre && !highHasPre) {
        // Going from prerelease -> no prerelease requires some special casing
        // If the low version has only a major, then it will always be a major
        // Some examples:
        // 1.0.0-1 -> 1.0.0
        // 1.0.0-1 -> 1.1.1
        // 1.0.0-1 -> 2.0.0
        if (!lowVersion.patch && !lowVersion.minor) {
            return 'major';
        }
        // If the main part has no difference
        if (lowVersion.compareMain(highVersion) === 0) {
            if (lowVersion.minor && !lowVersion.patch) {
                return 'minor';
            }
            return 'patch';
        }
    }
    // add the `pre` prefix if we are going to a prerelease version
    const prefix = highHasPre ? 'pre' : '';
    if (v1.major !== v2.major) {
        return prefix + 'major';
    }
    if (v1.minor !== v2.minor) {
        return prefix + 'minor';
    }
    if (v1.patch !== v2.patch) {
        return prefix + 'patch';
    }
    // high and low are prereleases
    return 'prerelease';
};
module.exports = diff;
}),
"[project]/node_modules/semver/functions/major.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const SemVer = __turbopack_context__.r("[project]/node_modules/semver/classes/semver.js [app-route] (ecmascript)");
const major = (a, loose)=>new SemVer(a, loose).major;
module.exports = major;
}),
"[project]/node_modules/semver/functions/minor.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const SemVer = __turbopack_context__.r("[project]/node_modules/semver/classes/semver.js [app-route] (ecmascript)");
const minor = (a, loose)=>new SemVer(a, loose).minor;
module.exports = minor;
}),
"[project]/node_modules/semver/functions/patch.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const SemVer = __turbopack_context__.r("[project]/node_modules/semver/classes/semver.js [app-route] (ecmascript)");
const patch = (a, loose)=>new SemVer(a, loose).patch;
module.exports = patch;
}),
"[project]/node_modules/semver/functions/prerelease.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const parse = __turbopack_context__.r("[project]/node_modules/semver/functions/parse.js [app-route] (ecmascript)");
const prerelease = (version, options)=>{
    const parsed = parse(version, options);
    return parsed && parsed.prerelease.length ? parsed.prerelease : null;
};
module.exports = prerelease;
}),
"[project]/node_modules/semver/functions/compare.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const SemVer = __turbopack_context__.r("[project]/node_modules/semver/classes/semver.js [app-route] (ecmascript)");
const compare = (a, b, loose)=>new SemVer(a, loose).compare(new SemVer(b, loose));
module.exports = compare;
}),
"[project]/node_modules/semver/functions/rcompare.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const compare = __turbopack_context__.r("[project]/node_modules/semver/functions/compare.js [app-route] (ecmascript)");
const rcompare = (a, b, loose)=>compare(b, a, loose);
module.exports = rcompare;
}),
"[project]/node_modules/semver/functions/compare-loose.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const compare = __turbopack_context__.r("[project]/node_modules/semver/functions/compare.js [app-route] (ecmascript)");
const compareLoose = (a, b)=>compare(a, b, true);
module.exports = compareLoose;
}),
"[project]/node_modules/semver/functions/compare-build.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const SemVer = __turbopack_context__.r("[project]/node_modules/semver/classes/semver.js [app-route] (ecmascript)");
const compareBuild = (a, b, loose)=>{
    const versionA = new SemVer(a, loose);
    const versionB = new SemVer(b, loose);
    return versionA.compare(versionB) || versionA.compareBuild(versionB);
};
module.exports = compareBuild;
}),
"[project]/node_modules/semver/functions/sort.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const compareBuild = __turbopack_context__.r("[project]/node_modules/semver/functions/compare-build.js [app-route] (ecmascript)");
const sort = (list, loose)=>list.sort((a, b)=>compareBuild(a, b, loose));
module.exports = sort;
}),
"[project]/node_modules/semver/functions/rsort.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const compareBuild = __turbopack_context__.r("[project]/node_modules/semver/functions/compare-build.js [app-route] (ecmascript)");
const rsort = (list, loose)=>list.sort((a, b)=>compareBuild(b, a, loose));
module.exports = rsort;
}),
"[project]/node_modules/semver/functions/gt.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const compare = __turbopack_context__.r("[project]/node_modules/semver/functions/compare.js [app-route] (ecmascript)");
const gt = (a, b, loose)=>compare(a, b, loose) > 0;
module.exports = gt;
}),
"[project]/node_modules/semver/functions/lt.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const compare = __turbopack_context__.r("[project]/node_modules/semver/functions/compare.js [app-route] (ecmascript)");
const lt = (a, b, loose)=>compare(a, b, loose) < 0;
module.exports = lt;
}),
"[project]/node_modules/semver/functions/eq.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const compare = __turbopack_context__.r("[project]/node_modules/semver/functions/compare.js [app-route] (ecmascript)");
const eq = (a, b, loose)=>compare(a, b, loose) === 0;
module.exports = eq;
}),
"[project]/node_modules/semver/functions/neq.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const compare = __turbopack_context__.r("[project]/node_modules/semver/functions/compare.js [app-route] (ecmascript)");
const neq = (a, b, loose)=>compare(a, b, loose) !== 0;
module.exports = neq;
}),
"[project]/node_modules/semver/functions/gte.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const compare = __turbopack_context__.r("[project]/node_modules/semver/functions/compare.js [app-route] (ecmascript)");
const gte = (a, b, loose)=>compare(a, b, loose) >= 0;
module.exports = gte;
}),
"[project]/node_modules/semver/functions/lte.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const compare = __turbopack_context__.r("[project]/node_modules/semver/functions/compare.js [app-route] (ecmascript)");
const lte = (a, b, loose)=>compare(a, b, loose) <= 0;
module.exports = lte;
}),
"[project]/node_modules/semver/functions/cmp.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const eq = __turbopack_context__.r("[project]/node_modules/semver/functions/eq.js [app-route] (ecmascript)");
const neq = __turbopack_context__.r("[project]/node_modules/semver/functions/neq.js [app-route] (ecmascript)");
const gt = __turbopack_context__.r("[project]/node_modules/semver/functions/gt.js [app-route] (ecmascript)");
const gte = __turbopack_context__.r("[project]/node_modules/semver/functions/gte.js [app-route] (ecmascript)");
const lt = __turbopack_context__.r("[project]/node_modules/semver/functions/lt.js [app-route] (ecmascript)");
const lte = __turbopack_context__.r("[project]/node_modules/semver/functions/lte.js [app-route] (ecmascript)");
const cmp = (a, op, b, loose)=>{
    switch(op){
        case '===':
            if (typeof a === 'object') {
                a = a.version;
            }
            if (typeof b === 'object') {
                b = b.version;
            }
            return a === b;
        case '!==':
            if (typeof a === 'object') {
                a = a.version;
            }
            if (typeof b === 'object') {
                b = b.version;
            }
            return a !== b;
        case '':
        case '=':
        case '==':
            return eq(a, b, loose);
        case '!=':
            return neq(a, b, loose);
        case '>':
            return gt(a, b, loose);
        case '>=':
            return gte(a, b, loose);
        case '<':
            return lt(a, b, loose);
        case '<=':
            return lte(a, b, loose);
        default:
            throw new TypeError(`Invalid operator: ${op}`);
    }
};
module.exports = cmp;
}),
"[project]/node_modules/semver/functions/coerce.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const SemVer = __turbopack_context__.r("[project]/node_modules/semver/classes/semver.js [app-route] (ecmascript)");
const parse = __turbopack_context__.r("[project]/node_modules/semver/functions/parse.js [app-route] (ecmascript)");
const { safeRe: re, t } = __turbopack_context__.r("[project]/node_modules/semver/internal/re.js [app-route] (ecmascript)");
const coerce = (version, options)=>{
    if (version instanceof SemVer) {
        return version;
    }
    if (typeof version === 'number') {
        version = String(version);
    }
    if (typeof version !== 'string') {
        return null;
    }
    options = options || {};
    let match = null;
    if (!options.rtl) {
        match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
    } else {
        // Find the right-most coercible string that does not share
        // a terminus with a more left-ward coercible string.
        // Eg, '1.2.3.4' wants to coerce '2.3.4', not '3.4' or '4'
        // With includePrerelease option set, '1.2.3.4-rc' wants to coerce '2.3.4-rc', not '2.3.4'
        //
        // Walk through the string checking with a /g regexp
        // Manually set the index so as to pick up overlapping matches.
        // Stop when we get a match that ends at the string end, since no
        // coercible string can be more right-ward without the same terminus.
        const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
        let next;
        while((next = coerceRtlRegex.exec(version)) && (!match || match.index + match[0].length !== version.length)){
            if (!match || next.index + next[0].length !== match.index + match[0].length) {
                match = next;
            }
            coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
        }
        // leave it in a clean state
        coerceRtlRegex.lastIndex = -1;
    }
    if (match === null) {
        return null;
    }
    const major = match[2];
    const minor = match[3] || '0';
    const patch = match[4] || '0';
    const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : '';
    const build = options.includePrerelease && match[6] ? `+${match[6]}` : '';
    return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options);
};
module.exports = coerce;
}),
"[project]/node_modules/semver/internal/lrucache.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

class LRUCache {
    constructor(){
        this.max = 1000;
        this.map = new Map();
    }
    get(key) {
        const value = this.map.get(key);
        if (value === undefined) {
            return undefined;
        } else {
            // Remove the key from the map and add it to the end
            this.map.delete(key);
            this.map.set(key, value);
            return value;
        }
    }
    delete(key) {
        return this.map.delete(key);
    }
    set(key, value) {
        const deleted = this.delete(key);
        if (!deleted && value !== undefined) {
            // If cache is full, delete the least recently used item
            if (this.map.size >= this.max) {
                const firstKey = this.map.keys().next().value;
                this.delete(firstKey);
            }
            this.map.set(key, value);
        }
        return this;
    }
}
module.exports = LRUCache;
}),
"[project]/node_modules/semver/classes/range.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const SPACE_CHARACTERS = /\s+/g;
// hoisted class for cyclic dependency
class Range {
    constructor(range, options){
        options = parseOptions(options);
        if (range instanceof Range) {
            if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
                return range;
            } else {
                return new Range(range.raw, options);
            }
        }
        if (range instanceof Comparator) {
            // just put it in the set and return
            this.raw = range.value;
            this.set = [
                [
                    range
                ]
            ];
            this.formatted = undefined;
            return this;
        }
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        // First reduce all whitespace as much as possible so we do not have to rely
        // on potentially slow regexes like \s*. This is then stored and used for
        // future error messages as well.
        this.raw = range.trim().replace(SPACE_CHARACTERS, ' ');
        // First, split on ||
        this.set = this.raw.split('||')// map the range to a 2d array of comparators
        .map((r)=>this.parseRange(r.trim()))// throw out any comparator lists that are empty
        // this generally means that it was not a valid range, which is allowed
        // in loose mode, but will still throw if the WHOLE range is invalid.
        .filter((c)=>c.length);
        if (!this.set.length) {
            throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
        }
        // if we have any that are not the null set, throw out null sets.
        if (this.set.length > 1) {
            // keep the first one, in case they're all null sets
            const first = this.set[0];
            this.set = this.set.filter((c)=>!isNullSet(c[0]));
            if (this.set.length === 0) {
                this.set = [
                    first
                ];
            } else if (this.set.length > 1) {
                // if we have any that are *, then the range is just *
                for (const c of this.set){
                    if (c.length === 1 && isAny(c[0])) {
                        this.set = [
                            c
                        ];
                        break;
                    }
                }
            }
        }
        this.formatted = undefined;
    }
    get range() {
        if (this.formatted === undefined) {
            this.formatted = '';
            for(let i = 0; i < this.set.length; i++){
                if (i > 0) {
                    this.formatted += '||';
                }
                const comps = this.set[i];
                for(let k = 0; k < comps.length; k++){
                    if (k > 0) {
                        this.formatted += ' ';
                    }
                    this.formatted += comps[k].toString().trim();
                }
            }
        }
        return this.formatted;
    }
    format() {
        return this.range;
    }
    toString() {
        return this.range;
    }
    parseRange(range) {
        // memoize range parsing for performance.
        // this is a very hot path, and fully deterministic.
        const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
        const memoKey = memoOpts + ':' + range;
        const cached = cache.get(memoKey);
        if (cached) {
            return cached;
        }
        const loose = this.options.loose;
        // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
        const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
        range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
        debug('hyphen replace', range);
        // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
        range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
        debug('comparator trim', range);
        // `~ 1.2.3` => `~1.2.3`
        range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
        debug('tilde trim', range);
        // `^ 1.2.3` => `^1.2.3`
        range = range.replace(re[t.CARETTRIM], caretTrimReplace);
        debug('caret trim', range);
        // At this point, the range is completely trimmed and
        // ready to be split into comparators.
        let rangeList = range.split(' ').map((comp)=>parseComparator(comp, this.options)).join(' ').split(/\s+/)// >=0.0.0 is equivalent to *
        .map((comp)=>replaceGTE0(comp, this.options));
        if (loose) {
            // in loose mode, throw out any that are not valid comparators
            rangeList = rangeList.filter((comp)=>{
                debug('loose invalid filter', comp, this.options);
                return !!comp.match(re[t.COMPARATORLOOSE]);
            });
        }
        debug('range list', rangeList);
        // if any comparators are the null set, then replace with JUST null set
        // if more than one comparator, remove any * comparators
        // also, don't include the same comparator more than once
        const rangeMap = new Map();
        const comparators = rangeList.map((comp)=>new Comparator(comp, this.options));
        for (const comp of comparators){
            if (isNullSet(comp)) {
                return [
                    comp
                ];
            }
            rangeMap.set(comp.value, comp);
        }
        if (rangeMap.size > 1 && rangeMap.has('')) {
            rangeMap.delete('');
        }
        const result = [
            ...rangeMap.values()
        ];
        cache.set(memoKey, result);
        return result;
    }
    intersects(range, options) {
        if (!(range instanceof Range)) {
            throw new TypeError('a Range is required');
        }
        return this.set.some((thisComparators)=>{
            return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators)=>{
                return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator)=>{
                    return rangeComparators.every((rangeComparator)=>{
                        return thisComparator.intersects(rangeComparator, options);
                    });
                });
            });
        });
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(version) {
        if (!version) {
            return false;
        }
        if (typeof version === 'string') {
            try {
                version = new SemVer(version, this.options);
            } catch (er) {
                return false;
            }
        }
        for(let i = 0; i < this.set.length; i++){
            if (testSet(this.set[i], version, this.options)) {
                return true;
            }
        }
        return false;
    }
}
module.exports = Range;
const LRU = __turbopack_context__.r("[project]/node_modules/semver/internal/lrucache.js [app-route] (ecmascript)");
const cache = new LRU();
const parseOptions = __turbopack_context__.r("[project]/node_modules/semver/internal/parse-options.js [app-route] (ecmascript)");
const Comparator = __turbopack_context__.r("[project]/node_modules/semver/classes/comparator.js [app-route] (ecmascript)");
const debug = __turbopack_context__.r("[project]/node_modules/semver/internal/debug.js [app-route] (ecmascript)");
const SemVer = __turbopack_context__.r("[project]/node_modules/semver/classes/semver.js [app-route] (ecmascript)");
const { safeRe: re, t, comparatorTrimReplace, tildeTrimReplace, caretTrimReplace } = __turbopack_context__.r("[project]/node_modules/semver/internal/re.js [app-route] (ecmascript)");
const { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = __turbopack_context__.r("[project]/node_modules/semver/internal/constants.js [app-route] (ecmascript)");
const isNullSet = (c)=>c.value === '<0.0.0-0';
const isAny = (c)=>c.value === '';
// take a set of comparators and determine whether there
// exists a version which can satisfy it
const isSatisfiable = (comparators, options)=>{
    let result = true;
    const remainingComparators = comparators.slice();
    let testComparator = remainingComparators.pop();
    while(result && remainingComparators.length){
        result = remainingComparators.every((otherComparator)=>{
            return testComparator.intersects(otherComparator, options);
        });
        testComparator = remainingComparators.pop();
    }
    return result;
};
// comprised of xranges, tildes, stars, and gtlt's at this point.
// already replaced the hyphen ranges
// turn into a set of JUST comparators.
const parseComparator = (comp, options)=>{
    comp = comp.replace(re[t.BUILD], '');
    debug('comp', comp, options);
    comp = replaceCarets(comp, options);
    debug('caret', comp);
    comp = replaceTildes(comp, options);
    debug('tildes', comp);
    comp = replaceXRanges(comp, options);
    debug('xrange', comp);
    comp = replaceStars(comp, options);
    debug('stars', comp);
    return comp;
};
const isX = (id)=>!id || id.toLowerCase() === 'x' || id === '*';
// ~, ~> --> * (any, kinda silly)
// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0-0
// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0-0
// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0-0
// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0-0
// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0-0
// ~0.0.1 --> >=0.0.1 <0.1.0-0
const replaceTildes = (comp, options)=>{
    return comp.trim().split(/\s+/).map((c)=>replaceTilde(c, options)).join(' ');
};
const replaceTilde = (comp, options)=>{
    const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
    return comp.replace(r, (_, M, m, p, pr)=>{
        debug('tilde', comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
            ret = '';
        } else if (isX(m)) {
            ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
            // ~1.2 == >=1.2.0 <1.3.0-0
            ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
        } else if (pr) {
            debug('replaceTilde pr', pr);
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
        } else {
            // ~1.2.3 == >=1.2.3 <1.3.0-0
            ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
        }
        debug('tilde return', ret);
        return ret;
    });
};
// ^ --> * (any, kinda silly)
// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0-0
// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0-0
// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0-0
// ^1.2.3 --> >=1.2.3 <2.0.0-0
// ^1.2.0 --> >=1.2.0 <2.0.0-0
// ^0.0.1 --> >=0.0.1 <0.0.2-0
// ^0.1.0 --> >=0.1.0 <0.2.0-0
const replaceCarets = (comp, options)=>{
    return comp.trim().split(/\s+/).map((c)=>replaceCaret(c, options)).join(' ');
};
const replaceCaret = (comp, options)=>{
    debug('caret', comp, options);
    const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
    const z = options.includePrerelease ? '-0' : '';
    return comp.replace(r, (_, M, m, p, pr)=>{
        debug('caret', comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
            ret = '';
        } else if (isX(m)) {
            ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
            if (M === '0') {
                ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
            } else {
                ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
            }
        } else if (pr) {
            debug('replaceCaret pr', pr);
            if (M === '0') {
                if (m === '0') {
                    ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
                } else {
                    ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
                }
            } else {
                ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
            }
        } else {
            debug('no pr');
            if (M === '0') {
                if (m === '0') {
                    ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
                } else {
                    ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
                }
            } else {
                ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
            }
        }
        debug('caret return', ret);
        return ret;
    });
};
const replaceXRanges = (comp, options)=>{
    debug('replaceXRanges', comp, options);
    return comp.split(/\s+/).map((c)=>replaceXRange(c, options)).join(' ');
};
const replaceXRange = (comp, options)=>{
    comp = comp.trim();
    const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
    return comp.replace(r, (ret, gtlt, M, m, p, pr)=>{
        debug('xRange', comp, ret, gtlt, M, m, p, pr);
        const xM = isX(M);
        const xm = xM || isX(m);
        const xp = xm || isX(p);
        const anyX = xp;
        if (gtlt === '=' && anyX) {
            gtlt = '';
        }
        // if we're including prereleases in the match, then we need
        // to fix this to -0, the lowest possible prerelease value
        pr = options.includePrerelease ? '-0' : '';
        if (xM) {
            if (gtlt === '>' || gtlt === '<') {
                // nothing is allowed
                ret = '<0.0.0-0';
            } else {
                // nothing is forbidden
                ret = '*';
            }
        } else if (gtlt && anyX) {
            // we know patch is an x, because we have any x at all.
            // replace X with 0
            if (xm) {
                m = 0;
            }
            p = 0;
            if (gtlt === '>') {
                // >1 => >=2.0.0
                // >1.2 => >=1.3.0
                gtlt = '>=';
                if (xm) {
                    M = +M + 1;
                    m = 0;
                    p = 0;
                } else {
                    m = +m + 1;
                    p = 0;
                }
            } else if (gtlt === '<=') {
                // <=0.7.x is actually <0.8.0, since any 0.7.x should
                // pass.  Similarly, <=7.x is actually <8.0.0, etc.
                gtlt = '<';
                if (xm) {
                    M = +M + 1;
                } else {
                    m = +m + 1;
                }
            }
            if (gtlt === '<') {
                pr = '-0';
            }
            ret = `${gtlt + M}.${m}.${p}${pr}`;
        } else if (xm) {
            ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
        } else if (xp) {
            ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
        }
        debug('xRange return', ret);
        return ret;
    });
};
// Because * is AND-ed with everything else in the comparator,
// and '' means "any version", just remove the *s entirely.
const replaceStars = (comp, options)=>{
    debug('replaceStars', comp, options);
    // Looseness is ignored here.  star is always as loose as it gets!
    return comp.trim().replace(re[t.STAR], '');
};
const replaceGTE0 = (comp, options)=>{
    debug('replaceGTE0', comp, options);
    return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], '');
};
// This function is passed to string.replace(re[t.HYPHENRANGE])
// M, m, patch, prerelease, build
// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
// 1.2.3 - 3.4 => >=1.2.0 <3.5.0-0 Any 3.4.x will do
// 1.2 - 3.4 => >=1.2.0 <3.5.0-0
// TODO build?
const hyphenReplace = (incPr)=>($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr)=>{
        if (isX(fM)) {
            from = '';
        } else if (isX(fm)) {
            from = `>=${fM}.0.0${incPr ? '-0' : ''}`;
        } else if (isX(fp)) {
            from = `>=${fM}.${fm}.0${incPr ? '-0' : ''}`;
        } else if (fpr) {
            from = `>=${from}`;
        } else {
            from = `>=${from}${incPr ? '-0' : ''}`;
        }
        if (isX(tM)) {
            to = '';
        } else if (isX(tm)) {
            to = `<${+tM + 1}.0.0-0`;
        } else if (isX(tp)) {
            to = `<${tM}.${+tm + 1}.0-0`;
        } else if (tpr) {
            to = `<=${tM}.${tm}.${tp}-${tpr}`;
        } else if (incPr) {
            to = `<${tM}.${tm}.${+tp + 1}-0`;
        } else {
            to = `<=${to}`;
        }
        return `${from} ${to}`.trim();
    };
const testSet = (set, version, options)=>{
    for(let i = 0; i < set.length; i++){
        if (!set[i].test(version)) {
            return false;
        }
    }
    if (version.prerelease.length && !options.includePrerelease) {
        // Find the set of versions that are allowed to have prereleases
        // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
        // That should allow `1.2.3-pr.2` to pass.
        // However, `1.2.4-alpha.notready` should NOT be allowed,
        // even though it's within the range set by the comparators.
        for(let i = 0; i < set.length; i++){
            debug(set[i].semver);
            if (set[i].semver === Comparator.ANY) {
                continue;
            }
            if (set[i].semver.prerelease.length > 0) {
                const allowed = set[i].semver;
                if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
                    return true;
                }
            }
        }
        // Version has a -pre, but it's not one of the ones we like.
        return false;
    }
    return true;
};
}),
"[project]/node_modules/semver/classes/comparator.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const ANY = Symbol('SemVer ANY');
// hoisted class for cyclic dependency
class Comparator {
    static get ANY() {
        return ANY;
    }
    constructor(comp, options){
        options = parseOptions(options);
        if (comp instanceof Comparator) {
            if (comp.loose === !!options.loose) {
                return comp;
            } else {
                comp = comp.value;
            }
        }
        comp = comp.trim().split(/\s+/).join(' ');
        debug('comparator', comp, options);
        this.options = options;
        this.loose = !!options.loose;
        this.parse(comp);
        if (this.semver === ANY) {
            this.value = '';
        } else {
            this.value = this.operator + this.semver.version;
        }
        debug('comp', this);
    }
    parse(comp) {
        const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
        const m = comp.match(r);
        if (!m) {
            throw new TypeError(`Invalid comparator: ${comp}`);
        }
        this.operator = m[1] !== undefined ? m[1] : '';
        if (this.operator === '=') {
            this.operator = '';
        }
        // if it literally is just '>' or '' then allow anything.
        if (!m[2]) {
            this.semver = ANY;
        } else {
            this.semver = new SemVer(m[2], this.options.loose);
        }
    }
    toString() {
        return this.value;
    }
    test(version) {
        debug('Comparator.test', version, this.options.loose);
        if (this.semver === ANY || version === ANY) {
            return true;
        }
        if (typeof version === 'string') {
            try {
                version = new SemVer(version, this.options);
            } catch (er) {
                return false;
            }
        }
        return cmp(version, this.operator, this.semver, this.options);
    }
    intersects(comp, options) {
        if (!(comp instanceof Comparator)) {
            throw new TypeError('a Comparator is required');
        }
        if (this.operator === '') {
            if (this.value === '') {
                return true;
            }
            return new Range(comp.value, options).test(this.value);
        } else if (comp.operator === '') {
            if (comp.value === '') {
                return true;
            }
            return new Range(this.value, options).test(comp.semver);
        }
        options = parseOptions(options);
        // Special cases where nothing can possibly be lower
        if (options.includePrerelease && (this.value === '<0.0.0-0' || comp.value === '<0.0.0-0')) {
            return false;
        }
        if (!options.includePrerelease && (this.value.startsWith('<0.0.0') || comp.value.startsWith('<0.0.0'))) {
            return false;
        }
        // Same direction increasing (> or >=)
        if (this.operator.startsWith('>') && comp.operator.startsWith('>')) {
            return true;
        }
        // Same direction decreasing (< or <=)
        if (this.operator.startsWith('<') && comp.operator.startsWith('<')) {
            return true;
        }
        // same SemVer and both sides are inclusive (<= or >=)
        if (this.semver.version === comp.semver.version && this.operator.includes('=') && comp.operator.includes('=')) {
            return true;
        }
        // opposite directions less than
        if (cmp(this.semver, '<', comp.semver, options) && this.operator.startsWith('>') && comp.operator.startsWith('<')) {
            return true;
        }
        // opposite directions greater than
        if (cmp(this.semver, '>', comp.semver, options) && this.operator.startsWith('<') && comp.operator.startsWith('>')) {
            return true;
        }
        return false;
    }
}
module.exports = Comparator;
const parseOptions = __turbopack_context__.r("[project]/node_modules/semver/internal/parse-options.js [app-route] (ecmascript)");
const { safeRe: re, t } = __turbopack_context__.r("[project]/node_modules/semver/internal/re.js [app-route] (ecmascript)");
const cmp = __turbopack_context__.r("[project]/node_modules/semver/functions/cmp.js [app-route] (ecmascript)");
const debug = __turbopack_context__.r("[project]/node_modules/semver/internal/debug.js [app-route] (ecmascript)");
const SemVer = __turbopack_context__.r("[project]/node_modules/semver/classes/semver.js [app-route] (ecmascript)");
const Range = __turbopack_context__.r("[project]/node_modules/semver/classes/range.js [app-route] (ecmascript)");
}),
"[project]/node_modules/semver/functions/satisfies.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const Range = __turbopack_context__.r("[project]/node_modules/semver/classes/range.js [app-route] (ecmascript)");
const satisfies = (version, range, options)=>{
    try {
        range = new Range(range, options);
    } catch (er) {
        return false;
    }
    return range.test(version);
};
module.exports = satisfies;
}),
"[project]/node_modules/semver/ranges/to-comparators.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const Range = __turbopack_context__.r("[project]/node_modules/semver/classes/range.js [app-route] (ecmascript)");
// Mostly just for testing and legacy API reasons
const toComparators = (range, options)=>new Range(range, options).set.map((comp)=>comp.map((c)=>c.value).join(' ').trim().split(' '));
module.exports = toComparators;
}),
"[project]/node_modules/semver/ranges/max-satisfying.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const SemVer = __turbopack_context__.r("[project]/node_modules/semver/classes/semver.js [app-route] (ecmascript)");
const Range = __turbopack_context__.r("[project]/node_modules/semver/classes/range.js [app-route] (ecmascript)");
const maxSatisfying = (versions, range, options)=>{
    let max = null;
    let maxSV = null;
    let rangeObj = null;
    try {
        rangeObj = new Range(range, options);
    } catch (er) {
        return null;
    }
    versions.forEach((v)=>{
        if (rangeObj.test(v)) {
            // satisfies(v, range, options)
            if (!max || maxSV.compare(v) === -1) {
                // compare(max, v, true)
                max = v;
                maxSV = new SemVer(max, options);
            }
        }
    });
    return max;
};
module.exports = maxSatisfying;
}),
"[project]/node_modules/semver/ranges/min-satisfying.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const SemVer = __turbopack_context__.r("[project]/node_modules/semver/classes/semver.js [app-route] (ecmascript)");
const Range = __turbopack_context__.r("[project]/node_modules/semver/classes/range.js [app-route] (ecmascript)");
const minSatisfying = (versions, range, options)=>{
    let min = null;
    let minSV = null;
    let rangeObj = null;
    try {
        rangeObj = new Range(range, options);
    } catch (er) {
        return null;
    }
    versions.forEach((v)=>{
        if (rangeObj.test(v)) {
            // satisfies(v, range, options)
            if (!min || minSV.compare(v) === 1) {
                // compare(min, v, true)
                min = v;
                minSV = new SemVer(min, options);
            }
        }
    });
    return min;
};
module.exports = minSatisfying;
}),
"[project]/node_modules/semver/ranges/min-version.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const SemVer = __turbopack_context__.r("[project]/node_modules/semver/classes/semver.js [app-route] (ecmascript)");
const Range = __turbopack_context__.r("[project]/node_modules/semver/classes/range.js [app-route] (ecmascript)");
const gt = __turbopack_context__.r("[project]/node_modules/semver/functions/gt.js [app-route] (ecmascript)");
const minVersion = (range, loose)=>{
    range = new Range(range, loose);
    let minver = new SemVer('0.0.0');
    if (range.test(minver)) {
        return minver;
    }
    minver = new SemVer('0.0.0-0');
    if (range.test(minver)) {
        return minver;
    }
    minver = null;
    for(let i = 0; i < range.set.length; ++i){
        const comparators = range.set[i];
        let setMin = null;
        comparators.forEach((comparator)=>{
            // Clone to avoid manipulating the comparator's semver object.
            const compver = new SemVer(comparator.semver.version);
            switch(comparator.operator){
                case '>':
                    if (compver.prerelease.length === 0) {
                        compver.patch++;
                    } else {
                        compver.prerelease.push(0);
                    }
                    compver.raw = compver.format();
                /* fallthrough */ case '':
                case '>=':
                    if (!setMin || gt(compver, setMin)) {
                        setMin = compver;
                    }
                    break;
                case '<':
                case '<=':
                    break;
                /* istanbul ignore next */ default:
                    throw new Error(`Unexpected operation: ${comparator.operator}`);
            }
        });
        if (setMin && (!minver || gt(minver, setMin))) {
            minver = setMin;
        }
    }
    if (minver && range.test(minver)) {
        return minver;
    }
    return null;
};
module.exports = minVersion;
}),
"[project]/node_modules/semver/ranges/valid.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const Range = __turbopack_context__.r("[project]/node_modules/semver/classes/range.js [app-route] (ecmascript)");
const validRange = (range, options)=>{
    try {
        // Return '*' instead of '' so that truthiness works.
        // This will throw if it's invalid anyway
        return new Range(range, options).range || '*';
    } catch (er) {
        return null;
    }
};
module.exports = validRange;
}),
"[project]/node_modules/semver/ranges/outside.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const SemVer = __turbopack_context__.r("[project]/node_modules/semver/classes/semver.js [app-route] (ecmascript)");
const Comparator = __turbopack_context__.r("[project]/node_modules/semver/classes/comparator.js [app-route] (ecmascript)");
const { ANY } = Comparator;
const Range = __turbopack_context__.r("[project]/node_modules/semver/classes/range.js [app-route] (ecmascript)");
const satisfies = __turbopack_context__.r("[project]/node_modules/semver/functions/satisfies.js [app-route] (ecmascript)");
const gt = __turbopack_context__.r("[project]/node_modules/semver/functions/gt.js [app-route] (ecmascript)");
const lt = __turbopack_context__.r("[project]/node_modules/semver/functions/lt.js [app-route] (ecmascript)");
const lte = __turbopack_context__.r("[project]/node_modules/semver/functions/lte.js [app-route] (ecmascript)");
const gte = __turbopack_context__.r("[project]/node_modules/semver/functions/gte.js [app-route] (ecmascript)");
const outside = (version, range, hilo, options)=>{
    version = new SemVer(version, options);
    range = new Range(range, options);
    let gtfn, ltefn, ltfn, comp, ecomp;
    switch(hilo){
        case '>':
            gtfn = gt;
            ltefn = lte;
            ltfn = lt;
            comp = '>';
            ecomp = '>=';
            break;
        case '<':
            gtfn = lt;
            ltefn = gte;
            ltfn = gt;
            comp = '<';
            ecomp = '<=';
            break;
        default:
            throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    // If it satisfies the range it is not outside
    if (satisfies(version, range, options)) {
        return false;
    }
    // From now on, variable terms are as if we're in "gtr" mode.
    // but note that everything is flipped for the "ltr" function.
    for(let i = 0; i < range.set.length; ++i){
        const comparators = range.set[i];
        let high = null;
        let low = null;
        comparators.forEach((comparator)=>{
            if (comparator.semver === ANY) {
                comparator = new Comparator('>=0.0.0');
            }
            high = high || comparator;
            low = low || comparator;
            if (gtfn(comparator.semver, high.semver, options)) {
                high = comparator;
            } else if (ltfn(comparator.semver, low.semver, options)) {
                low = comparator;
            }
        });
        // If the edge version comparator has a operator then our version
        // isn't outside it
        if (high.operator === comp || high.operator === ecomp) {
            return false;
        }
        // If the lowest version comparator has an operator and our version
        // is less than it then it isn't higher than the range
        if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
            return false;
        } else if (low.operator === ecomp && ltfn(version, low.semver)) {
            return false;
        }
    }
    return true;
};
module.exports = outside;
}),
"[project]/node_modules/semver/ranges/gtr.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// Determine if version is greater than all the versions possible in the range.
const outside = __turbopack_context__.r("[project]/node_modules/semver/ranges/outside.js [app-route] (ecmascript)");
const gtr = (version, range, options)=>outside(version, range, '>', options);
module.exports = gtr;
}),
"[project]/node_modules/semver/ranges/ltr.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const outside = __turbopack_context__.r("[project]/node_modules/semver/ranges/outside.js [app-route] (ecmascript)");
// Determine if version is less than all the versions possible in the range
const ltr = (version, range, options)=>outside(version, range, '<', options);
module.exports = ltr;
}),
"[project]/node_modules/semver/ranges/intersects.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const Range = __turbopack_context__.r("[project]/node_modules/semver/classes/range.js [app-route] (ecmascript)");
const intersects = (r1, r2, options)=>{
    r1 = new Range(r1, options);
    r2 = new Range(r2, options);
    return r1.intersects(r2, options);
};
module.exports = intersects;
}),
"[project]/node_modules/semver/ranges/simplify.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// given a set of versions and a range, create a "simplified" range
// that includes the same versions that the original range does
// If the original range is shorter than the simplified one, return that.
const satisfies = __turbopack_context__.r("[project]/node_modules/semver/functions/satisfies.js [app-route] (ecmascript)");
const compare = __turbopack_context__.r("[project]/node_modules/semver/functions/compare.js [app-route] (ecmascript)");
module.exports = (versions, range, options)=>{
    const set = [];
    let first = null;
    let prev = null;
    const v = versions.sort((a, b)=>compare(a, b, options));
    for (const version of v){
        const included = satisfies(version, range, options);
        if (included) {
            prev = version;
            if (!first) {
                first = version;
            }
        } else {
            if (prev) {
                set.push([
                    first,
                    prev
                ]);
            }
            prev = null;
            first = null;
        }
    }
    if (first) {
        set.push([
            first,
            null
        ]);
    }
    const ranges = [];
    for (const [min, max] of set){
        if (min === max) {
            ranges.push(min);
        } else if (!max && min === v[0]) {
            ranges.push('*');
        } else if (!max) {
            ranges.push(`>=${min}`);
        } else if (min === v[0]) {
            ranges.push(`<=${max}`);
        } else {
            ranges.push(`${min} - ${max}`);
        }
    }
    const simplified = ranges.join(' || ');
    const original = typeof range.raw === 'string' ? range.raw : String(range);
    return simplified.length < original.length ? simplified : range;
};
}),
"[project]/node_modules/semver/ranges/subset.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const Range = __turbopack_context__.r("[project]/node_modules/semver/classes/range.js [app-route] (ecmascript)");
const Comparator = __turbopack_context__.r("[project]/node_modules/semver/classes/comparator.js [app-route] (ecmascript)");
const { ANY } = Comparator;
const satisfies = __turbopack_context__.r("[project]/node_modules/semver/functions/satisfies.js [app-route] (ecmascript)");
const compare = __turbopack_context__.r("[project]/node_modules/semver/functions/compare.js [app-route] (ecmascript)");
// Complex range `r1 || r2 || ...` is a subset of `R1 || R2 || ...` iff:
// - Every simple range `r1, r2, ...` is a null set, OR
// - Every simple range `r1, r2, ...` which is not a null set is a subset of
//   some `R1, R2, ...`
//
// Simple range `c1 c2 ...` is a subset of simple range `C1 C2 ...` iff:
// - If c is only the ANY comparator
//   - If C is only the ANY comparator, return true
//   - Else if in prerelease mode, return false
//   - else replace c with `[>=0.0.0]`
// - If C is only the ANY comparator
//   - if in prerelease mode, return true
//   - else replace C with `[>=0.0.0]`
// - Let EQ be the set of = comparators in c
// - If EQ is more than one, return true (null set)
// - Let GT be the highest > or >= comparator in c
// - Let LT be the lowest < or <= comparator in c
// - If GT and LT, and GT.semver > LT.semver, return true (null set)
// - If any C is a = range, and GT or LT are set, return false
// - If EQ
//   - If GT, and EQ does not satisfy GT, return true (null set)
//   - If LT, and EQ does not satisfy LT, return true (null set)
//   - If EQ satisfies every C, return true
//   - Else return false
// - If GT
//   - If GT.semver is lower than any > or >= comp in C, return false
//   - If GT is >=, and GT.semver does not satisfy every C, return false
//   - If GT.semver has a prerelease, and not in prerelease mode
//     - If no C has a prerelease and the GT.semver tuple, return false
// - If LT
//   - If LT.semver is greater than any < or <= comp in C, return false
//   - If LT is <=, and LT.semver does not satisfy every C, return false
//   - If LT.semver has a prerelease, and not in prerelease mode
//     - If no C has a prerelease and the LT.semver tuple, return false
// - Else return true
const subset = (sub, dom, options = {})=>{
    if (sub === dom) {
        return true;
    }
    sub = new Range(sub, options);
    dom = new Range(dom, options);
    let sawNonNull = false;
    OUTER: for (const simpleSub of sub.set){
        for (const simpleDom of dom.set){
            const isSub = simpleSubset(simpleSub, simpleDom, options);
            sawNonNull = sawNonNull || isSub !== null;
            if (isSub) {
                continue OUTER;
            }
        }
        // the null set is a subset of everything, but null simple ranges in
        // a complex range should be ignored.  so if we saw a non-null range,
        // then we know this isn't a subset, but if EVERY simple range was null,
        // then it is a subset.
        if (sawNonNull) {
            return false;
        }
    }
    return true;
};
const minimumVersionWithPreRelease = [
    new Comparator('>=0.0.0-0')
];
const minimumVersion = [
    new Comparator('>=0.0.0')
];
const simpleSubset = (sub, dom, options)=>{
    if (sub === dom) {
        return true;
    }
    if (sub.length === 1 && sub[0].semver === ANY) {
        if (dom.length === 1 && dom[0].semver === ANY) {
            return true;
        } else if (options.includePrerelease) {
            sub = minimumVersionWithPreRelease;
        } else {
            sub = minimumVersion;
        }
    }
    if (dom.length === 1 && dom[0].semver === ANY) {
        if (options.includePrerelease) {
            return true;
        } else {
            dom = minimumVersion;
        }
    }
    const eqSet = new Set();
    let gt, lt;
    for (const c of sub){
        if (c.operator === '>' || c.operator === '>=') {
            gt = higherGT(gt, c, options);
        } else if (c.operator === '<' || c.operator === '<=') {
            lt = lowerLT(lt, c, options);
        } else {
            eqSet.add(c.semver);
        }
    }
    if (eqSet.size > 1) {
        return null;
    }
    let gtltComp;
    if (gt && lt) {
        gtltComp = compare(gt.semver, lt.semver, options);
        if (gtltComp > 0) {
            return null;
        } else if (gtltComp === 0 && (gt.operator !== '>=' || lt.operator !== '<=')) {
            return null;
        }
    }
    // will iterate one or zero times
    for (const eq of eqSet){
        if (gt && !satisfies(eq, String(gt), options)) {
            return null;
        }
        if (lt && !satisfies(eq, String(lt), options)) {
            return null;
        }
        for (const c of dom){
            if (!satisfies(eq, String(c), options)) {
                return false;
            }
        }
        return true;
    }
    let higher, lower;
    let hasDomLT, hasDomGT;
    // if the subset has a prerelease, we need a comparator in the superset
    // with the same tuple and a prerelease, or it's not a subset
    let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
    let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
    // exception: <1.2.3-0 is the same as <1.2.3
    if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === '<' && needDomLTPre.prerelease[0] === 0) {
        needDomLTPre = false;
    }
    for (const c of dom){
        hasDomGT = hasDomGT || c.operator === '>' || c.operator === '>=';
        hasDomLT = hasDomLT || c.operator === '<' || c.operator === '<=';
        if (gt) {
            if (needDomGTPre) {
                if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
                    needDomGTPre = false;
                }
            }
            if (c.operator === '>' || c.operator === '>=') {
                higher = higherGT(gt, c, options);
                if (higher === c && higher !== gt) {
                    return false;
                }
            } else if (gt.operator === '>=' && !satisfies(gt.semver, String(c), options)) {
                return false;
            }
        }
        if (lt) {
            if (needDomLTPre) {
                if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
                    needDomLTPre = false;
                }
            }
            if (c.operator === '<' || c.operator === '<=') {
                lower = lowerLT(lt, c, options);
                if (lower === c && lower !== lt) {
                    return false;
                }
            } else if (lt.operator === '<=' && !satisfies(lt.semver, String(c), options)) {
                return false;
            }
        }
        if (!c.operator && (lt || gt) && gtltComp !== 0) {
            return false;
        }
    }
    // if there was a < or >, and nothing in the dom, then must be false
    // UNLESS it was limited by another range in the other direction.
    // Eg, >1.0.0 <1.0.1 is still a subset of <2.0.0
    if (gt && hasDomLT && !lt && gtltComp !== 0) {
        return false;
    }
    if (lt && hasDomGT && !gt && gtltComp !== 0) {
        return false;
    }
    // we needed a prerelease range in a specific tuple, but didn't get one
    // then this isn't a subset.  eg >=1.2.3-pre is not a subset of >=1.0.0,
    // because it includes prereleases in the 1.2.3 tuple
    if (needDomGTPre || needDomLTPre) {
        return false;
    }
    return true;
};
// >=1.2.3 is lower than >1.2.3
const higherGT = (a, b, options)=>{
    if (!a) {
        return b;
    }
    const comp = compare(a.semver, b.semver, options);
    return comp > 0 ? a : comp < 0 ? b : b.operator === '>' && a.operator === '>=' ? b : a;
};
// <=1.2.3 is higher than <1.2.3
const lowerLT = (a, b, options)=>{
    if (!a) {
        return b;
    }
    const comp = compare(a.semver, b.semver, options);
    return comp < 0 ? a : comp > 0 ? b : b.operator === '<' && a.operator === '<=' ? b : a;
};
module.exports = subset;
}),
"[project]/node_modules/semver/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// just pre-load all the stuff that index.js lazily exports
const internalRe = __turbopack_context__.r("[project]/node_modules/semver/internal/re.js [app-route] (ecmascript)");
const constants = __turbopack_context__.r("[project]/node_modules/semver/internal/constants.js [app-route] (ecmascript)");
const SemVer = __turbopack_context__.r("[project]/node_modules/semver/classes/semver.js [app-route] (ecmascript)");
const identifiers = __turbopack_context__.r("[project]/node_modules/semver/internal/identifiers.js [app-route] (ecmascript)");
const parse = __turbopack_context__.r("[project]/node_modules/semver/functions/parse.js [app-route] (ecmascript)");
const valid = __turbopack_context__.r("[project]/node_modules/semver/functions/valid.js [app-route] (ecmascript)");
const clean = __turbopack_context__.r("[project]/node_modules/semver/functions/clean.js [app-route] (ecmascript)");
const inc = __turbopack_context__.r("[project]/node_modules/semver/functions/inc.js [app-route] (ecmascript)");
const diff = __turbopack_context__.r("[project]/node_modules/semver/functions/diff.js [app-route] (ecmascript)");
const major = __turbopack_context__.r("[project]/node_modules/semver/functions/major.js [app-route] (ecmascript)");
const minor = __turbopack_context__.r("[project]/node_modules/semver/functions/minor.js [app-route] (ecmascript)");
const patch = __turbopack_context__.r("[project]/node_modules/semver/functions/patch.js [app-route] (ecmascript)");
const prerelease = __turbopack_context__.r("[project]/node_modules/semver/functions/prerelease.js [app-route] (ecmascript)");
const compare = __turbopack_context__.r("[project]/node_modules/semver/functions/compare.js [app-route] (ecmascript)");
const rcompare = __turbopack_context__.r("[project]/node_modules/semver/functions/rcompare.js [app-route] (ecmascript)");
const compareLoose = __turbopack_context__.r("[project]/node_modules/semver/functions/compare-loose.js [app-route] (ecmascript)");
const compareBuild = __turbopack_context__.r("[project]/node_modules/semver/functions/compare-build.js [app-route] (ecmascript)");
const sort = __turbopack_context__.r("[project]/node_modules/semver/functions/sort.js [app-route] (ecmascript)");
const rsort = __turbopack_context__.r("[project]/node_modules/semver/functions/rsort.js [app-route] (ecmascript)");
const gt = __turbopack_context__.r("[project]/node_modules/semver/functions/gt.js [app-route] (ecmascript)");
const lt = __turbopack_context__.r("[project]/node_modules/semver/functions/lt.js [app-route] (ecmascript)");
const eq = __turbopack_context__.r("[project]/node_modules/semver/functions/eq.js [app-route] (ecmascript)");
const neq = __turbopack_context__.r("[project]/node_modules/semver/functions/neq.js [app-route] (ecmascript)");
const gte = __turbopack_context__.r("[project]/node_modules/semver/functions/gte.js [app-route] (ecmascript)");
const lte = __turbopack_context__.r("[project]/node_modules/semver/functions/lte.js [app-route] (ecmascript)");
const cmp = __turbopack_context__.r("[project]/node_modules/semver/functions/cmp.js [app-route] (ecmascript)");
const coerce = __turbopack_context__.r("[project]/node_modules/semver/functions/coerce.js [app-route] (ecmascript)");
const Comparator = __turbopack_context__.r("[project]/node_modules/semver/classes/comparator.js [app-route] (ecmascript)");
const Range = __turbopack_context__.r("[project]/node_modules/semver/classes/range.js [app-route] (ecmascript)");
const satisfies = __turbopack_context__.r("[project]/node_modules/semver/functions/satisfies.js [app-route] (ecmascript)");
const toComparators = __turbopack_context__.r("[project]/node_modules/semver/ranges/to-comparators.js [app-route] (ecmascript)");
const maxSatisfying = __turbopack_context__.r("[project]/node_modules/semver/ranges/max-satisfying.js [app-route] (ecmascript)");
const minSatisfying = __turbopack_context__.r("[project]/node_modules/semver/ranges/min-satisfying.js [app-route] (ecmascript)");
const minVersion = __turbopack_context__.r("[project]/node_modules/semver/ranges/min-version.js [app-route] (ecmascript)");
const validRange = __turbopack_context__.r("[project]/node_modules/semver/ranges/valid.js [app-route] (ecmascript)");
const outside = __turbopack_context__.r("[project]/node_modules/semver/ranges/outside.js [app-route] (ecmascript)");
const gtr = __turbopack_context__.r("[project]/node_modules/semver/ranges/gtr.js [app-route] (ecmascript)");
const ltr = __turbopack_context__.r("[project]/node_modules/semver/ranges/ltr.js [app-route] (ecmascript)");
const intersects = __turbopack_context__.r("[project]/node_modules/semver/ranges/intersects.js [app-route] (ecmascript)");
const simplifyRange = __turbopack_context__.r("[project]/node_modules/semver/ranges/simplify.js [app-route] (ecmascript)");
const subset = __turbopack_context__.r("[project]/node_modules/semver/ranges/subset.js [app-route] (ecmascript)");
module.exports = {
    parse,
    valid,
    clean,
    inc,
    diff,
    major,
    minor,
    patch,
    prerelease,
    compare,
    rcompare,
    compareLoose,
    compareBuild,
    sort,
    rsort,
    gt,
    lt,
    eq,
    neq,
    gte,
    lte,
    cmp,
    coerce,
    Comparator,
    Range,
    satisfies,
    toComparators,
    maxSatisfying,
    minSatisfying,
    minVersion,
    validRange,
    outside,
    gtr,
    ltr,
    intersects,
    simplifyRange,
    subset,
    SemVer,
    re: internalRe.re,
    src: internalRe.src,
    tokens: internalRe.t,
    SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: constants.RELEASE_TYPES,
    compareIdentifiers: identifiers.compareIdentifiers,
    rcompareIdentifiers: identifiers.rcompareIdentifiers
};
}),
"[project]/node_modules/@opentelemetry/instrumentation-http/build/src/version.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.VERSION = void 0;
// this is autogenerated file, see scripts/version-update.js
exports.VERSION = '0.57.2';
}),
"[project]/node_modules/@opentelemetry/instrumentation-http/build/src/enums/AttributeNames.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AttributeNames = void 0;
/**
 * https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/semantic_conventions/http.md
 */ var AttributeNames;
(function(AttributeNames) {
    AttributeNames["HTTP_ERROR_NAME"] = "http.error_name";
    AttributeNames["HTTP_ERROR_MESSAGE"] = "http.error_message";
    AttributeNames["HTTP_STATUS_TEXT"] = "http.status_text";
})(AttributeNames = exports.AttributeNames || (exports.AttributeNames = {}));
}),
"[project]/node_modules/@opentelemetry/instrumentation-http/build/src/utils.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.headerCapture = exports.getIncomingStableRequestMetricAttributesOnResponse = exports.getIncomingRequestMetricAttributesOnResponse = exports.getIncomingRequestAttributesOnResponse = exports.getIncomingRequestMetricAttributes = exports.getIncomingRequestAttributes = exports.getRemoteClientAddress = exports.getOutgoingRequestMetricAttributesOnResponse = exports.getOutgoingRequestAttributesOnResponse = exports.setAttributesFromHttpKind = exports.getOutgoingRequestMetricAttributes = exports.getOutgoingRequestAttributes = exports.extractHostnameAndPort = exports.isValidOptionsType = exports.getRequestInfo = exports.isCompressed = exports.setResponseContentLengthAttribute = exports.setRequestContentLengthAttribute = exports.setSpanWithError = exports.satisfiesPattern = exports.parseResponseStatus = exports.getAbsoluteUrl = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const api_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const semantic_conventions_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-http/node_modules/@opentelemetry/semantic-conventions/build/esm/index.js [app-route] (ecmascript)");
const core_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/core/build/esm/index.js [app-route] (ecmascript)");
const url = __turbopack_context__.r("[externals]/url [external] (url, cjs)");
const AttributeNames_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-http/build/src/enums/AttributeNames.js [app-route] (ecmascript)");
const forwardedParse = __turbopack_context__.r("[project]/node_modules/forwarded-parse/index.js [app-route] (ecmascript)");
/**
 * Get an absolute url
 */ const getAbsoluteUrl = (requestUrl, headers, fallbackProtocol = 'http:')=>{
    const reqUrlObject = requestUrl || {};
    const protocol = reqUrlObject.protocol || fallbackProtocol;
    const port = (reqUrlObject.port || '').toString();
    const path = reqUrlObject.path || '/';
    let host = reqUrlObject.host || reqUrlObject.hostname || headers.host || 'localhost';
    // if there is no port in host and there is a port
    // it should be displayed if it's not 80 and 443 (default ports)
    if (host.indexOf(':') === -1 && port && port !== '80' && port !== '443') {
        host += `:${port}`;
    }
    return `${protocol}//${host}${path}`;
};
exports.getAbsoluteUrl = getAbsoluteUrl;
/**
 * Parse status code from HTTP response. [More details](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/data-http.md#status)
 */ const parseResponseStatus = (kind, statusCode)=>{
    const upperBound = kind === api_1.SpanKind.CLIENT ? 400 : 500;
    // 1xx, 2xx, 3xx are OK on client and server
    // 4xx is OK on server
    if (statusCode && statusCode >= 100 && statusCode < upperBound) {
        return api_1.SpanStatusCode.UNSET;
    }
    // All other codes are error
    return api_1.SpanStatusCode.ERROR;
};
exports.parseResponseStatus = parseResponseStatus;
/**
 * Check whether the given obj match pattern
 * @param constant e.g URL of request
 * @param pattern Match pattern
 */ const satisfiesPattern = (constant, pattern)=>{
    if (typeof pattern === 'string') {
        return pattern === constant;
    } else if (pattern instanceof RegExp) {
        return pattern.test(constant);
    } else if (typeof pattern === 'function') {
        return pattern(constant);
    } else {
        throw new TypeError('Pattern is in unsupported datatype');
    }
};
exports.satisfiesPattern = satisfiesPattern;
/**
 * Sets the span with the error passed in params
 * @param {Span} span the span that need to be set
 * @param {Error} error error that will be set to span
 * @param {SemconvStability} semconvStability determines which semconv version to use
 */ const setSpanWithError = (span, error, semconvStability)=>{
    const message = error.message;
    if ((semconvStability & 2 /* OLD */ ) === 2 /* OLD */ ) {
        span.setAttribute(AttributeNames_1.AttributeNames.HTTP_ERROR_NAME, error.name);
        span.setAttribute(AttributeNames_1.AttributeNames.HTTP_ERROR_MESSAGE, message);
    }
    if ((semconvStability & 1 /* STABLE */ ) === 1 /* STABLE */ ) {
        span.setAttribute(semantic_conventions_1.ATTR_ERROR_TYPE, error.name);
    }
    span.setStatus({
        code: api_1.SpanStatusCode.ERROR,
        message
    });
    span.recordException(error);
};
exports.setSpanWithError = setSpanWithError;
/**
 * Adds attributes for request content-length and content-encoding HTTP headers
 * @param { IncomingMessage } Request object whose headers will be analyzed
 * @param { Attributes } Attributes object to be modified
 */ const setRequestContentLengthAttribute = (request, attributes)=>{
    const length = getContentLength(request.headers);
    if (length === null) return;
    if ((0, exports.isCompressed)(request.headers)) {
        attributes[semantic_conventions_1.SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH] = length;
    } else {
        attributes[semantic_conventions_1.SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED] = length;
    }
};
exports.setRequestContentLengthAttribute = setRequestContentLengthAttribute;
/**
 * Adds attributes for response content-length and content-encoding HTTP headers
 * @param { IncomingMessage } Response object whose headers will be analyzed
 * @param { Attributes } Attributes object to be modified
 *
 * @deprecated this is for an older version of semconv. It is retained for compatibility using OTEL_SEMCONV_STABILITY_OPT_IN
 */ const setResponseContentLengthAttribute = (response, attributes)=>{
    const length = getContentLength(response.headers);
    if (length === null) return;
    if ((0, exports.isCompressed)(response.headers)) {
        attributes[semantic_conventions_1.SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH] = length;
    } else {
        attributes[semantic_conventions_1.SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED] = length;
    }
};
exports.setResponseContentLengthAttribute = setResponseContentLengthAttribute;
function getContentLength(headers) {
    const contentLengthHeader = headers['content-length'];
    if (contentLengthHeader === undefined) return null;
    const contentLength = parseInt(contentLengthHeader, 10);
    if (isNaN(contentLength)) return null;
    return contentLength;
}
const isCompressed = (headers)=>{
    const encoding = headers['content-encoding'];
    return !!encoding && encoding !== 'identity';
};
exports.isCompressed = isCompressed;
/**
 * Mimics Node.js conversion of URL strings to RequestOptions expected by
 * `http.request` and `https.request` APIs.
 *
 * See https://github.com/nodejs/node/blob/2505e217bba05fc581b572c685c5cf280a16c5a3/lib/internal/url.js#L1415-L1437
 *
 * @param stringUrl
 * @throws TypeError if the URL is not valid.
 */ function stringUrlToHttpOptions(stringUrl) {
    // This is heavily inspired by Node.js handling of the same situation, trying
    // to follow it as closely as possible while keeping in mind that we only
    // deal with string URLs, not URL objects.
    const { hostname, pathname, port, username, password, search, protocol, hash, href, origin, host } = new URL(stringUrl);
    const options = {
        protocol: protocol,
        hostname: hostname && hostname[0] === '[' ? hostname.slice(1, -1) : hostname,
        hash: hash,
        search: search,
        pathname: pathname,
        path: `${pathname || ''}${search || ''}`,
        href: href,
        origin: origin,
        host: host
    };
    if (port !== '') {
        options.port = Number(port);
    }
    if (username || password) {
        options.auth = `${decodeURIComponent(username)}:${decodeURIComponent(password)}`;
    }
    return options;
}
/**
 * Makes sure options is an url object
 * return an object with default value and parsed options
 * @param logger component logger
 * @param options original options for the request
 * @param [extraOptions] additional options for the request
 */ const getRequestInfo = (logger, options, extraOptions)=>{
    let pathname;
    let origin;
    let optionsParsed;
    let invalidUrl = false;
    if (typeof options === 'string') {
        try {
            const convertedOptions = stringUrlToHttpOptions(options);
            optionsParsed = convertedOptions;
            pathname = convertedOptions.pathname || '/';
        } catch (e) {
            invalidUrl = true;
            logger.verbose('Unable to parse URL provided to HTTP request, using fallback to determine path. Original error:', e);
            // for backward compatibility with how url.parse() behaved.
            optionsParsed = {
                path: options
            };
            pathname = optionsParsed.path || '/';
        }
        origin = `${optionsParsed.protocol || 'http:'}//${optionsParsed.host}`;
        if (extraOptions !== undefined) {
            Object.assign(optionsParsed, extraOptions);
        }
    } else if (options instanceof url.URL) {
        optionsParsed = {
            protocol: options.protocol,
            hostname: typeof options.hostname === 'string' && options.hostname.startsWith('[') ? options.hostname.slice(1, -1) : options.hostname,
            path: `${options.pathname || ''}${options.search || ''}`
        };
        if (options.port !== '') {
            optionsParsed.port = Number(options.port);
        }
        if (options.username || options.password) {
            optionsParsed.auth = `${options.username}:${options.password}`;
        }
        pathname = options.pathname;
        origin = options.origin;
        if (extraOptions !== undefined) {
            Object.assign(optionsParsed, extraOptions);
        }
    } else {
        optionsParsed = Object.assign({
            protocol: options.host ? 'http:' : undefined
        }, options);
        const hostname = optionsParsed.host || (optionsParsed.port != null ? `${optionsParsed.hostname}${optionsParsed.port}` : optionsParsed.hostname);
        origin = `${optionsParsed.protocol || 'http:'}//${hostname}`;
        pathname = options.pathname;
        if (!pathname && optionsParsed.path) {
            try {
                const parsedUrl = new URL(optionsParsed.path, origin);
                pathname = parsedUrl.pathname || '/';
            } catch (e) {
                pathname = '/';
            }
        }
    }
    // some packages return method in lowercase..
    // ensure upperCase for consistency
    const method = optionsParsed.method ? optionsParsed.method.toUpperCase() : 'GET';
    return {
        origin,
        pathname,
        method,
        optionsParsed,
        invalidUrl
    };
};
exports.getRequestInfo = getRequestInfo;
/**
 * Makes sure options is of type string or object
 * @param options for the request
 */ const isValidOptionsType = (options)=>{
    if (!options) {
        return false;
    }
    const type = typeof options;
    return type === 'string' || type === 'object' && !Array.isArray(options);
};
exports.isValidOptionsType = isValidOptionsType;
const extractHostnameAndPort = (requestOptions)=>{
    var _a;
    if (requestOptions.hostname && requestOptions.port) {
        return {
            hostname: requestOptions.hostname,
            port: requestOptions.port
        };
    }
    const matches = ((_a = requestOptions.host) === null || _a === void 0 ? void 0 : _a.match(/^([^:/ ]+)(:\d{1,5})?/)) || null;
    const hostname = requestOptions.hostname || (matches === null ? 'localhost' : matches[1]);
    let port = requestOptions.port;
    if (!port) {
        if (matches && matches[2]) {
            // remove the leading ":". The extracted port would be something like ":8080"
            port = matches[2].substring(1);
        } else {
            port = requestOptions.protocol === 'https:' ? '443' : '80';
        }
    }
    return {
        hostname,
        port
    };
};
exports.extractHostnameAndPort = extractHostnameAndPort;
/**
 * Returns outgoing request attributes scoped to the options passed to the request
 * @param {ParsedRequestOptions} requestOptions the same options used to make the request
 * @param {{ component: string, hostname: string, hookAttributes?: Attributes }} options used to pass data needed to create attributes
 * @param {SemconvStability} semconvStability determines which semconv version to use
 */ const getOutgoingRequestAttributes = (requestOptions, options, semconvStability)=>{
    var _a, _b;
    const hostname = options.hostname;
    const port = options.port;
    const method = (_a = requestOptions.method) !== null && _a !== void 0 ? _a : 'GET';
    const normalizedMethod = normalizeMethod(method);
    const headers = requestOptions.headers || {};
    const userAgent = headers['user-agent'];
    const urlFull = (0, exports.getAbsoluteUrl)(requestOptions, headers, `${options.component}:`);
    const oldAttributes = {
        [semantic_conventions_1.SEMATTRS_HTTP_URL]: urlFull,
        [semantic_conventions_1.SEMATTRS_HTTP_METHOD]: method,
        [semantic_conventions_1.SEMATTRS_HTTP_TARGET]: requestOptions.path || '/',
        [semantic_conventions_1.SEMATTRS_NET_PEER_NAME]: hostname,
        [semantic_conventions_1.SEMATTRS_HTTP_HOST]: (_b = headers.host) !== null && _b !== void 0 ? _b : `${hostname}:${port}`
    };
    const newAttributes = {
        // Required attributes
        [semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD]: normalizedMethod,
        [semantic_conventions_1.ATTR_SERVER_ADDRESS]: hostname,
        [semantic_conventions_1.ATTR_SERVER_PORT]: Number(port),
        [semantic_conventions_1.ATTR_URL_FULL]: urlFull
    };
    // conditionally required if request method required case normalization
    if (method !== normalizedMethod) {
        newAttributes[semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD_ORIGINAL] = method;
    }
    if (userAgent !== undefined) {
        oldAttributes[semantic_conventions_1.SEMATTRS_HTTP_USER_AGENT] = userAgent;
    }
    switch(semconvStability){
        case 1 /* STABLE */ :
            return Object.assign(newAttributes, options.hookAttributes);
        case 2 /* OLD */ :
            return Object.assign(oldAttributes, options.hookAttributes);
    }
    return Object.assign(oldAttributes, newAttributes, options.hookAttributes);
};
exports.getOutgoingRequestAttributes = getOutgoingRequestAttributes;
/**
 * Returns outgoing request Metric attributes scoped to the request data
 * @param {Attributes} spanAttributes the span attributes
 */ const getOutgoingRequestMetricAttributes = (spanAttributes)=>{
    const metricAttributes = {};
    metricAttributes[semantic_conventions_1.SEMATTRS_HTTP_METHOD] = spanAttributes[semantic_conventions_1.SEMATTRS_HTTP_METHOD];
    metricAttributes[semantic_conventions_1.SEMATTRS_NET_PEER_NAME] = spanAttributes[semantic_conventions_1.SEMATTRS_NET_PEER_NAME];
    //TODO: http.url attribute, it should substitute any parameters to avoid high cardinality.
    return metricAttributes;
};
exports.getOutgoingRequestMetricAttributes = getOutgoingRequestMetricAttributes;
/**
 * Returns attributes related to the kind of HTTP protocol used
 * @param {string} [kind] Kind of HTTP protocol used: "1.0", "1.1", "2", "SPDY" or "QUIC".
 */ const setAttributesFromHttpKind = (kind, attributes)=>{
    if (kind) {
        attributes[semantic_conventions_1.SEMATTRS_HTTP_FLAVOR] = kind;
        if (kind.toUpperCase() !== 'QUIC') {
            attributes[semantic_conventions_1.SEMATTRS_NET_TRANSPORT] = semantic_conventions_1.NETTRANSPORTVALUES_IP_TCP;
        } else {
            attributes[semantic_conventions_1.SEMATTRS_NET_TRANSPORT] = semantic_conventions_1.NETTRANSPORTVALUES_IP_UDP;
        }
    }
};
exports.setAttributesFromHttpKind = setAttributesFromHttpKind;
/**
 * Returns outgoing request attributes scoped to the response data
 * @param {IncomingMessage} response the response object
 * @param {SemconvStability} semconvStability determines which semconv version to use
 */ const getOutgoingRequestAttributesOnResponse = (response, semconvStability)=>{
    const { statusCode, statusMessage, httpVersion, socket } = response;
    const oldAttributes = {};
    const stableAttributes = {};
    if (statusCode != null) {
        stableAttributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE] = statusCode;
    }
    if (socket) {
        const { remoteAddress, remotePort } = socket;
        oldAttributes[semantic_conventions_1.SEMATTRS_NET_PEER_IP] = remoteAddress;
        oldAttributes[semantic_conventions_1.SEMATTRS_NET_PEER_PORT] = remotePort;
        // Recommended
        stableAttributes[semantic_conventions_1.ATTR_NETWORK_PEER_ADDRESS] = remoteAddress;
        stableAttributes[semantic_conventions_1.ATTR_NETWORK_PEER_PORT] = remotePort;
        stableAttributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION] = response.httpVersion;
    }
    (0, exports.setResponseContentLengthAttribute)(response, oldAttributes);
    if (statusCode) {
        oldAttributes[semantic_conventions_1.SEMATTRS_HTTP_STATUS_CODE] = statusCode;
        oldAttributes[AttributeNames_1.AttributeNames.HTTP_STATUS_TEXT] = (statusMessage || '').toUpperCase();
    }
    (0, exports.setAttributesFromHttpKind)(httpVersion, oldAttributes);
    switch(semconvStability){
        case 1 /* STABLE */ :
            return stableAttributes;
        case 2 /* OLD */ :
            return oldAttributes;
    }
    return Object.assign(oldAttributes, stableAttributes);
};
exports.getOutgoingRequestAttributesOnResponse = getOutgoingRequestAttributesOnResponse;
/**
 * Returns outgoing request Metric attributes scoped to the response data
 * @param {Attributes} spanAttributes the span attributes
 */ const getOutgoingRequestMetricAttributesOnResponse = (spanAttributes)=>{
    const metricAttributes = {};
    metricAttributes[semantic_conventions_1.SEMATTRS_NET_PEER_PORT] = spanAttributes[semantic_conventions_1.SEMATTRS_NET_PEER_PORT];
    metricAttributes[semantic_conventions_1.SEMATTRS_HTTP_STATUS_CODE] = spanAttributes[semantic_conventions_1.SEMATTRS_HTTP_STATUS_CODE];
    metricAttributes[semantic_conventions_1.SEMATTRS_HTTP_FLAVOR] = spanAttributes[semantic_conventions_1.SEMATTRS_HTTP_FLAVOR];
    return metricAttributes;
};
exports.getOutgoingRequestMetricAttributesOnResponse = getOutgoingRequestMetricAttributesOnResponse;
function parseHostHeader(hostHeader, proto) {
    const parts = hostHeader.split(':');
    // no semicolon implies ipv4 dotted syntax or host name without port
    // x.x.x.x
    // example.com
    if (parts.length === 1) {
        if (proto === 'http') {
            return {
                host: parts[0],
                port: '80'
            };
        }
        if (proto === 'https') {
            return {
                host: parts[0],
                port: '443'
            };
        }
        return {
            host: parts[0]
        };
    }
    // single semicolon implies ipv4 dotted syntax or host name with port
    // x.x.x.x:yyyy
    // example.com:yyyy
    if (parts.length === 2) {
        return {
            host: parts[0],
            port: parts[1]
        };
    }
    // more than 2 parts implies ipv6 syntax with multiple colons
    // [x:x:x:x:x:x:x:x]
    // [x:x:x:x:x:x:x:x]:yyyy
    if (parts[0].startsWith('[')) {
        if (parts[parts.length - 1].endsWith(']')) {
            if (proto === 'http') {
                return {
                    host: hostHeader,
                    port: '80'
                };
            }
            if (proto === 'https') {
                return {
                    host: hostHeader,
                    port: '443'
                };
            }
        } else if (parts[parts.length - 2].endsWith(']')) {
            return {
                host: parts.slice(0, -1).join(':'),
                port: parts[parts.length - 1]
            };
        }
    }
    // if nothing above matches just return the host header
    return {
        host: hostHeader
    };
}
/**
 * Get server.address and port according to http semconv 1.27
 * https://github.com/open-telemetry/semantic-conventions/blob/bf0a2c1134f206f034408b201dbec37960ed60ec/docs/http/http-spans.md#setting-serveraddress-and-serverport-attributes
 */ function getServerAddress(request, component) {
    const forwardedHeader = request.headers['forwarded'];
    if (forwardedHeader) {
        for (const entry of parseForwardedHeader(forwardedHeader)){
            if (entry.host) {
                return parseHostHeader(entry.host, entry.proto);
            }
        }
    }
    const xForwardedHost = request.headers['x-forwarded-host'];
    if (typeof xForwardedHost === 'string') {
        if (typeof request.headers['x-forwarded-proto'] === 'string') {
            return parseHostHeader(xForwardedHost, request.headers['x-forwarded-proto']);
        }
        if (Array.isArray(request.headers['x-forwarded-proto'])) {
            return parseHostHeader(xForwardedHost, request.headers['x-forwarded-proto'][0]);
        }
        return parseHostHeader(xForwardedHost);
    } else if (Array.isArray(xForwardedHost) && typeof xForwardedHost[0] === 'string' && xForwardedHost[0].length > 0) {
        if (typeof request.headers['x-forwarded-proto'] === 'string') {
            return parseHostHeader(xForwardedHost[0], request.headers['x-forwarded-proto']);
        }
        if (Array.isArray(request.headers['x-forwarded-proto'])) {
            return parseHostHeader(xForwardedHost[0], request.headers['x-forwarded-proto'][0]);
        }
        return parseHostHeader(xForwardedHost[0]);
    }
    const host = request.headers['host'];
    if (typeof host === 'string' && host.length > 0) {
        return parseHostHeader(host, component);
    }
    return null;
}
/**
 * Get server.address and port according to http semconv 1.27
 * https://github.com/open-telemetry/semantic-conventions/blob/bf0a2c1134f206f034408b201dbec37960ed60ec/docs/http/http-spans.md#setting-serveraddress-and-serverport-attributes
 */ function getRemoteClientAddress(request) {
    const forwardedHeader = request.headers['forwarded'];
    if (forwardedHeader) {
        for (const entry of parseForwardedHeader(forwardedHeader)){
            if (entry.for) {
                return entry.for;
            }
        }
    }
    const xForwardedFor = request.headers['x-forwarded-for'];
    if (typeof xForwardedFor === 'string') {
        return xForwardedFor;
    } else if (Array.isArray(xForwardedFor)) {
        return xForwardedFor[0];
    }
    const remote = request.socket.remoteAddress;
    if (remote) {
        return remote;
    }
    return null;
}
exports.getRemoteClientAddress = getRemoteClientAddress;
function getInfoFromIncomingMessage(component, request, logger) {
    var _a, _b;
    try {
        if (request.headers.host) {
            return new URL((_a = request.url) !== null && _a !== void 0 ? _a : '/', `${component}://${request.headers.host}`);
        } else {
            const unsafeParsedUrl = new URL((_b = request.url) !== null && _b !== void 0 ? _b : '/', // using localhost as a workaround to still use the URL constructor for parsing
            `${component}://localhost`);
            // since we use localhost as a workaround, ensure we hide the rest of the properties to avoid
            // our workaround leaking though.
            return {
                pathname: unsafeParsedUrl.pathname,
                search: unsafeParsedUrl.search,
                toString: function() {
                    // we cannot use the result of unsafeParsedUrl.toString as it's potentially wrong.
                    return unsafeParsedUrl.pathname + unsafeParsedUrl.search;
                }
            };
        }
    } catch (e) {
        // something is wrong, use undefined - this *should* never happen, logging
        // for troubleshooting in case it does happen.
        logger.verbose('Unable to get URL from request', e);
        return {};
    }
}
/**
 * Returns incoming request attributes scoped to the request data
 * @param {IncomingMessage} request the request object
 * @param {{ component: string, serverName?: string, hookAttributes?: Attributes }} options used to pass data needed to create attributes
 * @param {SemconvStability} semconvStability determines which semconv version to use
 */ const getIncomingRequestAttributes = (request, options, logger)=>{
    const headers = request.headers;
    const userAgent = headers['user-agent'];
    const ips = headers['x-forwarded-for'];
    const httpVersion = request.httpVersion;
    const host = headers.host;
    const hostname = (host === null || host === void 0 ? void 0 : host.replace(/^(.*)(:[0-9]{1,5})/, '$1')) || 'localhost';
    const method = request.method;
    const normalizedMethod = normalizeMethod(method);
    const serverAddress = getServerAddress(request, options.component);
    const serverName = options.serverName;
    const remoteClientAddress = getRemoteClientAddress(request);
    const newAttributes = {
        [semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD]: normalizedMethod,
        [semantic_conventions_1.ATTR_URL_SCHEME]: options.component,
        [semantic_conventions_1.ATTR_SERVER_ADDRESS]: serverAddress === null || serverAddress === void 0 ? void 0 : serverAddress.host,
        [semantic_conventions_1.ATTR_NETWORK_PEER_ADDRESS]: request.socket.remoteAddress,
        [semantic_conventions_1.ATTR_NETWORK_PEER_PORT]: request.socket.remotePort,
        [semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION]: request.httpVersion,
        [semantic_conventions_1.ATTR_USER_AGENT_ORIGINAL]: userAgent
    };
    const parsedUrl = getInfoFromIncomingMessage(options.component, request, logger);
    if ((parsedUrl === null || parsedUrl === void 0 ? void 0 : parsedUrl.pathname) != null) {
        newAttributes[semantic_conventions_1.ATTR_URL_PATH] = parsedUrl.pathname;
    }
    if (remoteClientAddress != null) {
        newAttributes[semantic_conventions_1.ATTR_CLIENT_ADDRESS] = remoteClientAddress;
    }
    if ((serverAddress === null || serverAddress === void 0 ? void 0 : serverAddress.port) != null) {
        newAttributes[semantic_conventions_1.ATTR_SERVER_PORT] = Number(serverAddress.port);
    }
    // conditionally required if request method required case normalization
    if (method !== normalizedMethod) {
        newAttributes[semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD_ORIGINAL] = method;
    }
    const oldAttributes = {
        [semantic_conventions_1.SEMATTRS_HTTP_URL]: parsedUrl.toString(),
        [semantic_conventions_1.SEMATTRS_HTTP_HOST]: host,
        [semantic_conventions_1.SEMATTRS_NET_HOST_NAME]: hostname,
        [semantic_conventions_1.SEMATTRS_HTTP_METHOD]: method,
        [semantic_conventions_1.SEMATTRS_HTTP_SCHEME]: options.component
    };
    if (typeof ips === 'string') {
        oldAttributes[semantic_conventions_1.SEMATTRS_HTTP_CLIENT_IP] = ips.split(',')[0];
    }
    if (typeof serverName === 'string') {
        oldAttributes[semantic_conventions_1.SEMATTRS_HTTP_SERVER_NAME] = serverName;
    }
    if (parsedUrl === null || parsedUrl === void 0 ? void 0 : parsedUrl.pathname) {
        oldAttributes[semantic_conventions_1.SEMATTRS_HTTP_TARGET] = (parsedUrl === null || parsedUrl === void 0 ? void 0 : parsedUrl.pathname) + (parsedUrl === null || parsedUrl === void 0 ? void 0 : parsedUrl.search) || '/';
    }
    if (userAgent !== undefined) {
        oldAttributes[semantic_conventions_1.SEMATTRS_HTTP_USER_AGENT] = userAgent;
    }
    (0, exports.setRequestContentLengthAttribute)(request, oldAttributes);
    (0, exports.setAttributesFromHttpKind)(httpVersion, oldAttributes);
    switch(options.semconvStability){
        case 1 /* STABLE */ :
            return Object.assign(newAttributes, options.hookAttributes);
        case 2 /* OLD */ :
            return Object.assign(oldAttributes, options.hookAttributes);
    }
    return Object.assign(oldAttributes, newAttributes, options.hookAttributes);
};
exports.getIncomingRequestAttributes = getIncomingRequestAttributes;
/**
 * Returns incoming request Metric attributes scoped to the request data
 * @param {Attributes} spanAttributes the span attributes
 * @param {{ component: string }} options used to pass data needed to create attributes
 */ const getIncomingRequestMetricAttributes = (spanAttributes)=>{
    const metricAttributes = {};
    metricAttributes[semantic_conventions_1.SEMATTRS_HTTP_SCHEME] = spanAttributes[semantic_conventions_1.SEMATTRS_HTTP_SCHEME];
    metricAttributes[semantic_conventions_1.SEMATTRS_HTTP_METHOD] = spanAttributes[semantic_conventions_1.SEMATTRS_HTTP_METHOD];
    metricAttributes[semantic_conventions_1.SEMATTRS_NET_HOST_NAME] = spanAttributes[semantic_conventions_1.SEMATTRS_NET_HOST_NAME];
    metricAttributes[semantic_conventions_1.SEMATTRS_HTTP_FLAVOR] = spanAttributes[semantic_conventions_1.SEMATTRS_HTTP_FLAVOR];
    //TODO: http.target attribute, it should substitute any parameters to avoid high cardinality.
    return metricAttributes;
};
exports.getIncomingRequestMetricAttributes = getIncomingRequestMetricAttributes;
/**
 * Returns incoming request attributes scoped to the response data
 * @param {(ServerResponse & { socket: Socket; })} response the response object
 */ const getIncomingRequestAttributesOnResponse = (request, response, semconvStability)=>{
    // take socket from the request,
    // since it may be detached from the response object in keep-alive mode
    const { socket } = request;
    const { statusCode, statusMessage } = response;
    const newAttributes = {
        [semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE]: statusCode
    };
    const rpcMetadata = (0, core_1.getRPCMetadata)(api_1.context.active());
    const oldAttributes = {};
    if (socket) {
        const { localAddress, localPort, remoteAddress, remotePort } = socket;
        oldAttributes[semantic_conventions_1.SEMATTRS_NET_HOST_IP] = localAddress;
        oldAttributes[semantic_conventions_1.SEMATTRS_NET_HOST_PORT] = localPort;
        oldAttributes[semantic_conventions_1.SEMATTRS_NET_PEER_IP] = remoteAddress;
        oldAttributes[semantic_conventions_1.SEMATTRS_NET_PEER_PORT] = remotePort;
    }
    oldAttributes[semantic_conventions_1.SEMATTRS_HTTP_STATUS_CODE] = statusCode;
    oldAttributes[AttributeNames_1.AttributeNames.HTTP_STATUS_TEXT] = (statusMessage || '').toUpperCase();
    if ((rpcMetadata === null || rpcMetadata === void 0 ? void 0 : rpcMetadata.type) === core_1.RPCType.HTTP && rpcMetadata.route !== undefined) {
        oldAttributes[semantic_conventions_1.SEMATTRS_HTTP_ROUTE] = rpcMetadata.route;
        newAttributes[semantic_conventions_1.ATTR_HTTP_ROUTE] = rpcMetadata.route;
    }
    switch(semconvStability){
        case 1 /* STABLE */ :
            return newAttributes;
        case 2 /* OLD */ :
            return oldAttributes;
    }
    return Object.assign(oldAttributes, newAttributes);
};
exports.getIncomingRequestAttributesOnResponse = getIncomingRequestAttributesOnResponse;
/**
 * Returns incoming request Metric attributes scoped to the request data
 * @param {Attributes} spanAttributes the span attributes
 */ const getIncomingRequestMetricAttributesOnResponse = (spanAttributes)=>{
    const metricAttributes = {};
    metricAttributes[semantic_conventions_1.SEMATTRS_HTTP_STATUS_CODE] = spanAttributes[semantic_conventions_1.SEMATTRS_HTTP_STATUS_CODE];
    metricAttributes[semantic_conventions_1.SEMATTRS_NET_HOST_PORT] = spanAttributes[semantic_conventions_1.SEMATTRS_NET_HOST_PORT];
    if (spanAttributes[semantic_conventions_1.SEMATTRS_HTTP_ROUTE] !== undefined) {
        metricAttributes[semantic_conventions_1.SEMATTRS_HTTP_ROUTE] = spanAttributes[semantic_conventions_1.SEMATTRS_HTTP_ROUTE];
    }
    return metricAttributes;
};
exports.getIncomingRequestMetricAttributesOnResponse = getIncomingRequestMetricAttributesOnResponse;
const getIncomingStableRequestMetricAttributesOnResponse = (spanAttributes)=>{
    const metricAttributes = {};
    if (spanAttributes[semantic_conventions_1.ATTR_HTTP_ROUTE] !== undefined) {
        metricAttributes[semantic_conventions_1.ATTR_HTTP_ROUTE] = spanAttributes[semantic_conventions_1.SEMATTRS_HTTP_ROUTE];
    }
    // required if and only if one was sent, same as span requirement
    if (spanAttributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE]) {
        metricAttributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE] = spanAttributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE];
    }
    return metricAttributes;
};
exports.getIncomingStableRequestMetricAttributesOnResponse = getIncomingStableRequestMetricAttributesOnResponse;
function headerCapture(type, headers) {
    const normalizedHeaders = new Map();
    for(let i = 0, len = headers.length; i < len; i++){
        const capturedHeader = headers[i].toLowerCase();
        normalizedHeaders.set(capturedHeader, capturedHeader.replace(/-/g, '_'));
    }
    return (span, getHeader)=>{
        for (const capturedHeader of normalizedHeaders.keys()){
            const value = getHeader(capturedHeader);
            if (value === undefined) {
                continue;
            }
            const normalizedHeader = normalizedHeaders.get(capturedHeader);
            const key = `http.${type}.header.${normalizedHeader}`;
            if (typeof value === 'string') {
                span.setAttribute(key, [
                    value
                ]);
            } else if (Array.isArray(value)) {
                span.setAttribute(key, value);
            } else {
                span.setAttribute(key, [
                    value
                ]);
            }
        }
    };
}
exports.headerCapture = headerCapture;
const KNOWN_METHODS = new Set([
    // methods from https://www.rfc-editor.org/rfc/rfc9110.html#name-methods
    'GET',
    'HEAD',
    'POST',
    'PUT',
    'DELETE',
    'CONNECT',
    'OPTIONS',
    'TRACE',
    // PATCH from https://www.rfc-editor.org/rfc/rfc5789.html
    'PATCH'
]);
function normalizeMethod(method) {
    if (method == null) {
        return 'GET';
    }
    const upper = method.toUpperCase();
    if (KNOWN_METHODS.has(upper)) {
        return upper;
    }
    return '_OTHER';
}
function parseForwardedHeader(header) {
    try {
        return forwardedParse(header);
    } catch (_a) {
        return [];
    }
}
}),
"[project]/node_modules/@opentelemetry/instrumentation-http/build/src/http.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HttpInstrumentation = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const api_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const core_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/core/build/esm/index.js [app-route] (ecmascript)");
const semver = __turbopack_context__.r("[project]/node_modules/semver/index.js [app-route] (ecmascript)");
const url = __turbopack_context__.r("[externals]/url [external] (url, cjs)");
const version_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-http/build/src/version.js [app-route] (ecmascript)");
const instrumentation_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
const core_2 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/core/build/esm/index.js [app-route] (ecmascript)");
const events_1 = __turbopack_context__.r("[externals]/events [external] (events, cjs)");
const semantic_conventions_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-http/node_modules/@opentelemetry/semantic-conventions/build/esm/index.js [app-route] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-http/build/src/utils.js [app-route] (ecmascript)");
/**
 * `node:http` and `node:https` instrumentation for OpenTelemetry
 */ class HttpInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}){
        super('@opentelemetry/instrumentation-http', version_1.VERSION, config);
        /** keep track on spans not ended */ this._spanNotEnded = new WeakSet();
        this._semconvStability = 2 /* OLD */ ;
        this._headerCapture = this._createHeaderCapture();
        for (const entry of (0, core_2.getEnv)().OTEL_SEMCONV_STABILITY_OPT_IN){
            if (entry.toLowerCase() === 'http/dup') {
                // http/dup takes highest precedence. If it is found, there is no need to read the rest of the list
                this._semconvStability = 3 /* DUPLICATE */ ;
                break;
            } else if (entry.toLowerCase() === 'http') {
                this._semconvStability = 1 /* STABLE */ ;
            }
        }
    }
    _updateMetricInstruments() {
        this._oldHttpServerDurationHistogram = this.meter.createHistogram('http.server.duration', {
            description: 'Measures the duration of inbound HTTP requests.',
            unit: 'ms',
            valueType: api_1.ValueType.DOUBLE
        });
        this._oldHttpClientDurationHistogram = this.meter.createHistogram('http.client.duration', {
            description: 'Measures the duration of outbound HTTP requests.',
            unit: 'ms',
            valueType: api_1.ValueType.DOUBLE
        });
        this._stableHttpServerDurationHistogram = this.meter.createHistogram(semantic_conventions_1.METRIC_HTTP_SERVER_REQUEST_DURATION, {
            description: 'Duration of HTTP server requests.',
            unit: 's',
            valueType: api_1.ValueType.DOUBLE,
            advice: {
                explicitBucketBoundaries: [
                    0.005,
                    0.01,
                    0.025,
                    0.05,
                    0.075,
                    0.1,
                    0.25,
                    0.5,
                    0.75,
                    1,
                    2.5,
                    5,
                    7.5,
                    10
                ]
            }
        });
        this._stableHttpClientDurationHistogram = this.meter.createHistogram(semantic_conventions_1.METRIC_HTTP_CLIENT_REQUEST_DURATION, {
            description: 'Duration of HTTP client requests.',
            unit: 's',
            valueType: api_1.ValueType.DOUBLE,
            advice: {
                explicitBucketBoundaries: [
                    0.005,
                    0.01,
                    0.025,
                    0.05,
                    0.075,
                    0.1,
                    0.25,
                    0.5,
                    0.75,
                    1,
                    2.5,
                    5,
                    7.5,
                    10
                ]
            }
        });
    }
    _recordServerDuration(durationMs, oldAttributes, stableAttributes) {
        if ((this._semconvStability & 2 /* OLD */ ) === 2 /* OLD */ ) {
            // old histogram is counted in MS
            this._oldHttpServerDurationHistogram.record(durationMs, oldAttributes);
        }
        if ((this._semconvStability & 1 /* STABLE */ ) === 1 /* STABLE */ ) {
            // stable histogram is counted in S
            this._stableHttpServerDurationHistogram.record(durationMs / 1000, stableAttributes);
        }
    }
    _recordClientDuration(durationMs, oldAttributes, stableAttributes) {
        if ((this._semconvStability & 2 /* OLD */ ) === 2 /* OLD */ ) {
            // old histogram is counted in MS
            this._oldHttpClientDurationHistogram.record(durationMs, oldAttributes);
        }
        if ((this._semconvStability & 1 /* STABLE */ ) === 1 /* STABLE */ ) {
            // stable histogram is counted in S
            this._stableHttpClientDurationHistogram.record(durationMs / 1000, stableAttributes);
        }
    }
    setConfig(config = {}) {
        super.setConfig(config);
        this._headerCapture = this._createHeaderCapture();
    }
    init() {
        return [
            this._getHttpsInstrumentation(),
            this._getHttpInstrumentation()
        ];
    }
    _getHttpInstrumentation() {
        return new instrumentation_1.InstrumentationNodeModuleDefinition('http', [
            '*'
        ], (moduleExports)=>{
            const isESM = moduleExports[Symbol.toStringTag] === 'Module';
            if (!this.getConfig().disableOutgoingRequestInstrumentation) {
                const patchedRequest = this._wrap(moduleExports, 'request', this._getPatchOutgoingRequestFunction('http'));
                const patchedGet = this._wrap(moduleExports, 'get', this._getPatchOutgoingGetFunction(patchedRequest));
                if (isESM) {
                    // To handle `import http from 'http'`, which returns the default
                    // export, we need to set `module.default.*`.
                    moduleExports.default.request = patchedRequest;
                    moduleExports.default.get = patchedGet;
                }
            }
            if (!this.getConfig().disableIncomingRequestInstrumentation) {
                this._wrap(moduleExports.Server.prototype, 'emit', this._getPatchIncomingRequestFunction('http'));
            }
            return moduleExports;
        }, (moduleExports)=>{
            if (moduleExports === undefined) return;
            if (!this.getConfig().disableOutgoingRequestInstrumentation) {
                this._unwrap(moduleExports, 'request');
                this._unwrap(moduleExports, 'get');
            }
            if (!this.getConfig().disableIncomingRequestInstrumentation) {
                this._unwrap(moduleExports.Server.prototype, 'emit');
            }
        });
    }
    _getHttpsInstrumentation() {
        return new instrumentation_1.InstrumentationNodeModuleDefinition('https', [
            '*'
        ], (moduleExports)=>{
            const isESM = moduleExports[Symbol.toStringTag] === 'Module';
            if (!this.getConfig().disableOutgoingRequestInstrumentation) {
                const patchedRequest = this._wrap(moduleExports, 'request', this._getPatchHttpsOutgoingRequestFunction('https'));
                const patchedGet = this._wrap(moduleExports, 'get', this._getPatchHttpsOutgoingGetFunction(patchedRequest));
                if (isESM) {
                    // To handle `import https from 'https'`, which returns the default
                    // export, we need to set `module.default.*`.
                    moduleExports.default.request = patchedRequest;
                    moduleExports.default.get = patchedGet;
                }
            }
            if (!this.getConfig().disableIncomingRequestInstrumentation) {
                this._wrap(moduleExports.Server.prototype, 'emit', this._getPatchIncomingRequestFunction('https'));
            }
            return moduleExports;
        }, (moduleExports)=>{
            if (moduleExports === undefined) return;
            if (!this.getConfig().disableOutgoingRequestInstrumentation) {
                this._unwrap(moduleExports, 'request');
                this._unwrap(moduleExports, 'get');
            }
            if (!this.getConfig().disableIncomingRequestInstrumentation) {
                this._unwrap(moduleExports.Server.prototype, 'emit');
            }
        });
    }
    /**
     * Creates spans for incoming requests, restoring spans' context if applied.
     */ _getPatchIncomingRequestFunction(component) {
        return (original)=>{
            return this._incomingRequestFunction(component, original);
        };
    }
    /**
     * Creates spans for outgoing requests, sending spans' context for distributed
     * tracing.
     */ _getPatchOutgoingRequestFunction(component) {
        return (original)=>{
            return this._outgoingRequestFunction(component, original);
        };
    }
    _getPatchOutgoingGetFunction(clientRequest) {
        return (_original)=>{
            // Re-implement http.get. This needs to be done (instead of using
            // getPatchOutgoingRequestFunction to patch it) because we need to
            // set the trace context header before the returned http.ClientRequest is
            // ended. The Node.js docs state that the only differences between
            // request and get are that (1) get defaults to the HTTP GET method and
            // (2) the returned request object is ended immediately. The former is
            // already true (at least in supported Node versions up to v10), so we
            // simply follow the latter. Ref:
            // https://nodejs.org/dist/latest/docs/api/http.html#http_http_get_options_callback
            // https://github.com/googleapis/cloud-trace-nodejs/blob/master/src/instrumentations/instrumentation-http.ts#L198
            return function outgoingGetRequest(options, ...args) {
                const req = clientRequest(options, ...args);
                req.end();
                return req;
            };
        };
    }
    /** Patches HTTPS outgoing requests */ _getPatchHttpsOutgoingRequestFunction(component) {
        return (original)=>{
            const instrumentation = this;
            return function httpsOutgoingRequest(// eslint-disable-next-line node/no-unsupported-features/node-builtins
            options, ...args) {
                var _a;
                // Makes sure options will have default HTTPS parameters
                if (component === 'https' && typeof options === 'object' && ((_a = options === null || options === void 0 ? void 0 : options.constructor) === null || _a === void 0 ? void 0 : _a.name) !== 'URL') {
                    options = Object.assign({}, options);
                    instrumentation._setDefaultOptions(options);
                }
                return instrumentation._getPatchOutgoingRequestFunction(component)(original)(options, ...args);
            };
        };
    }
    _setDefaultOptions(options) {
        options.protocol = options.protocol || 'https:';
        options.port = options.port || 443;
    }
    /** Patches HTTPS outgoing get requests */ _getPatchHttpsOutgoingGetFunction(clientRequest) {
        return (original)=>{
            const instrumentation = this;
            return function httpsOutgoingRequest(// eslint-disable-next-line node/no-unsupported-features/node-builtins
            options, ...args) {
                return instrumentation._getPatchOutgoingGetFunction(clientRequest)(original)(options, ...args);
            };
        };
    }
    /**
     * Attach event listeners to a client request to end span and add span attributes.
     *
     * @param request The original request object.
     * @param span representing the current operation
     * @param startTime representing the start time of the request to calculate duration in Metric
     * @param oldMetricAttributes metric attributes for old semantic conventions
     * @param stableMetricAttributes metric attributes for new semantic conventions
     */ _traceClientRequest(request, span, startTime, oldMetricAttributes, stableMetricAttributes) {
        if (this.getConfig().requestHook) {
            this._callRequestHook(span, request);
        }
        /**
         * Determines if the request has errored or the response has ended/errored.
         */ let responseFinished = false;
        /*
         * User 'response' event listeners can be added before our listener,
         * force our listener to be the first, so response emitter is bound
         * before any user listeners are added to it.
         */ request.prependListener('response', (response)=>{
            this._diag.debug('outgoingRequest on response()');
            if (request.listenerCount('response') <= 1) {
                response.resume();
            }
            const responseAttributes = (0, utils_1.getOutgoingRequestAttributesOnResponse)(response, this._semconvStability);
            span.setAttributes(responseAttributes);
            oldMetricAttributes = Object.assign(oldMetricAttributes, (0, utils_1.getOutgoingRequestMetricAttributesOnResponse)(responseAttributes));
            if (this.getConfig().responseHook) {
                this._callResponseHook(span, response);
            }
            this._headerCapture.client.captureRequestHeaders(span, (header)=>request.getHeader(header));
            this._headerCapture.client.captureResponseHeaders(span, (header)=>response.headers[header]);
            api_1.context.bind(api_1.context.active(), response);
            const endHandler = ()=>{
                this._diag.debug('outgoingRequest on end()');
                if (responseFinished) {
                    return;
                }
                responseFinished = true;
                let status;
                if (response.aborted && !response.complete) {
                    status = {
                        code: api_1.SpanStatusCode.ERROR
                    };
                } else {
                    // behaves same for new and old semconv
                    status = {
                        code: (0, utils_1.parseResponseStatus)(api_1.SpanKind.CLIENT, response.statusCode)
                    };
                }
                span.setStatus(status);
                if (this.getConfig().applyCustomAttributesOnSpan) {
                    (0, instrumentation_1.safeExecuteInTheMiddle)(()=>this.getConfig().applyCustomAttributesOnSpan(span, request, response), ()=>{}, true);
                }
                this._closeHttpSpan(span, api_1.SpanKind.CLIENT, startTime, oldMetricAttributes, stableMetricAttributes);
            };
            response.on('end', endHandler);
            // See https://github.com/open-telemetry/opentelemetry-js/pull/3625#issuecomment-1475673533
            if (semver.lt(process.version, '16.0.0')) {
                response.on('close', endHandler);
            }
            response.on(events_1.errorMonitor, (error)=>{
                this._diag.debug('outgoingRequest on error()', error);
                if (responseFinished) {
                    return;
                }
                responseFinished = true;
                (0, utils_1.setSpanWithError)(span, error, this._semconvStability);
                span.setStatus({
                    code: api_1.SpanStatusCode.ERROR,
                    message: error.message
                });
                this._closeHttpSpan(span, api_1.SpanKind.CLIENT, startTime, oldMetricAttributes, stableMetricAttributes);
            });
        });
        request.on('close', ()=>{
            this._diag.debug('outgoingRequest on request close()');
            if (request.aborted || responseFinished) {
                return;
            }
            responseFinished = true;
            this._closeHttpSpan(span, api_1.SpanKind.CLIENT, startTime, oldMetricAttributes, stableMetricAttributes);
        });
        request.on(events_1.errorMonitor, (error)=>{
            this._diag.debug('outgoingRequest on request error()', error);
            if (responseFinished) {
                return;
            }
            responseFinished = true;
            (0, utils_1.setSpanWithError)(span, error, this._semconvStability);
            this._closeHttpSpan(span, api_1.SpanKind.CLIENT, startTime, oldMetricAttributes, stableMetricAttributes);
        });
        this._diag.debug('http.ClientRequest return request');
        return request;
    }
    _incomingRequestFunction(component, original) {
        const instrumentation = this;
        return function incomingRequest(event, ...args) {
            // Only traces request events
            if (event !== 'request') {
                return original.apply(this, [
                    event,
                    ...args
                ]);
            }
            const request = args[0];
            const response = args[1];
            const method = request.method || 'GET';
            instrumentation._diag.debug(`${component} instrumentation incomingRequest`);
            if ((0, instrumentation_1.safeExecuteInTheMiddle)(()=>{
                var _a, _b;
                return (_b = (_a = instrumentation.getConfig()).ignoreIncomingRequestHook) === null || _b === void 0 ? void 0 : _b.call(_a, request);
            }, (e)=>{
                if (e != null) {
                    instrumentation._diag.error('caught ignoreIncomingRequestHook error: ', e);
                }
            }, true)) {
                return api_1.context.with((0, core_1.suppressTracing)(api_1.context.active()), ()=>{
                    api_1.context.bind(api_1.context.active(), request);
                    api_1.context.bind(api_1.context.active(), response);
                    return original.apply(this, [
                        event,
                        ...args
                    ]);
                });
            }
            const headers = request.headers;
            const spanAttributes = (0, utils_1.getIncomingRequestAttributes)(request, {
                component: component,
                serverName: instrumentation.getConfig().serverName,
                hookAttributes: instrumentation._callStartSpanHook(request, instrumentation.getConfig().startIncomingSpanHook),
                semconvStability: instrumentation._semconvStability
            }, instrumentation._diag);
            const spanOptions = {
                kind: api_1.SpanKind.SERVER,
                attributes: spanAttributes
            };
            const startTime = (0, core_1.hrTime)();
            const oldMetricAttributes = (0, utils_1.getIncomingRequestMetricAttributes)(spanAttributes);
            // request method and url.scheme are both required span attributes
            const stableMetricAttributes = {
                [semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD]: spanAttributes[semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD],
                [semantic_conventions_1.ATTR_URL_SCHEME]: spanAttributes[semantic_conventions_1.ATTR_URL_SCHEME]
            };
            // recommended if and only if one was sent, same as span recommendation
            if (spanAttributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION]) {
                stableMetricAttributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION] = spanAttributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION];
            }
            const ctx = api_1.propagation.extract(api_1.ROOT_CONTEXT, headers);
            const span = instrumentation._startHttpSpan(method, spanOptions, ctx);
            const rpcMetadata = {
                type: core_2.RPCType.HTTP,
                span
            };
            return api_1.context.with((0, core_2.setRPCMetadata)(api_1.trace.setSpan(ctx, span), rpcMetadata), ()=>{
                api_1.context.bind(api_1.context.active(), request);
                api_1.context.bind(api_1.context.active(), response);
                if (instrumentation.getConfig().requestHook) {
                    instrumentation._callRequestHook(span, request);
                }
                if (instrumentation.getConfig().responseHook) {
                    instrumentation._callResponseHook(span, response);
                }
                instrumentation._headerCapture.server.captureRequestHeaders(span, (header)=>request.headers[header]);
                // After 'error', no further events other than 'close' should be emitted.
                let hasError = false;
                response.on('close', ()=>{
                    if (hasError) {
                        return;
                    }
                    instrumentation._onServerResponseFinish(request, response, span, oldMetricAttributes, stableMetricAttributes, startTime);
                });
                response.on(events_1.errorMonitor, (err)=>{
                    hasError = true;
                    instrumentation._onServerResponseError(span, oldMetricAttributes, stableMetricAttributes, startTime, err);
                });
                return (0, instrumentation_1.safeExecuteInTheMiddle)(()=>original.apply(this, [
                        event,
                        ...args
                    ]), (error)=>{
                    if (error) {
                        (0, utils_1.setSpanWithError)(span, error, instrumentation._semconvStability);
                        instrumentation._closeHttpSpan(span, api_1.SpanKind.SERVER, startTime, oldMetricAttributes, stableMetricAttributes);
                        throw error;
                    }
                });
            });
        };
    }
    _outgoingRequestFunction(component, original) {
        const instrumentation = this;
        return function outgoingRequest(options, ...args) {
            if (!(0, utils_1.isValidOptionsType)(options)) {
                return original.apply(this, [
                    options,
                    ...args
                ]);
            }
            const extraOptions = typeof args[0] === 'object' && (typeof options === 'string' || options instanceof url.URL) ? args.shift() : undefined;
            const { method, invalidUrl, optionsParsed } = (0, utils_1.getRequestInfo)(instrumentation._diag, options, extraOptions);
            /**
             * Node 8's https module directly call the http one so to avoid creating
             * 2 span for the same request we need to check that the protocol is correct
             * See: https://github.com/nodejs/node/blob/v8.17.0/lib/https.js#L245
             */ if (component === 'http' && semver.lt(process.version, '9.0.0') && optionsParsed.protocol === 'https:') {
                return original.apply(this, [
                    optionsParsed,
                    ...args
                ]);
            }
            if ((0, instrumentation_1.safeExecuteInTheMiddle)(()=>{
                var _a, _b;
                return (_b = (_a = instrumentation.getConfig()).ignoreOutgoingRequestHook) === null || _b === void 0 ? void 0 : _b.call(_a, optionsParsed);
            }, (e)=>{
                if (e != null) {
                    instrumentation._diag.error('caught ignoreOutgoingRequestHook error: ', e);
                }
            }, true)) {
                return original.apply(this, [
                    optionsParsed,
                    ...args
                ]);
            }
            const { hostname, port } = (0, utils_1.extractHostnameAndPort)(optionsParsed);
            const attributes = (0, utils_1.getOutgoingRequestAttributes)(optionsParsed, {
                component,
                port,
                hostname,
                hookAttributes: instrumentation._callStartSpanHook(optionsParsed, instrumentation.getConfig().startOutgoingSpanHook)
            }, instrumentation._semconvStability);
            const startTime = (0, core_1.hrTime)();
            const oldMetricAttributes = (0, utils_1.getOutgoingRequestMetricAttributes)(attributes);
            // request method, server address, and server port are both required span attributes
            const stableMetricAttributes = {
                [semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD]: attributes[semantic_conventions_1.ATTR_HTTP_REQUEST_METHOD],
                [semantic_conventions_1.ATTR_SERVER_ADDRESS]: attributes[semantic_conventions_1.ATTR_SERVER_ADDRESS],
                [semantic_conventions_1.ATTR_SERVER_PORT]: attributes[semantic_conventions_1.ATTR_SERVER_PORT]
            };
            // required if and only if one was sent, same as span requirement
            if (attributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE]) {
                stableMetricAttributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE] = attributes[semantic_conventions_1.ATTR_HTTP_RESPONSE_STATUS_CODE];
            }
            // recommended if and only if one was sent, same as span recommendation
            if (attributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION]) {
                stableMetricAttributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION] = attributes[semantic_conventions_1.ATTR_NETWORK_PROTOCOL_VERSION];
            }
            const spanOptions = {
                kind: api_1.SpanKind.CLIENT,
                attributes
            };
            const span = instrumentation._startHttpSpan(method, spanOptions);
            const parentContext = api_1.context.active();
            const requestContext = api_1.trace.setSpan(parentContext, span);
            if (!optionsParsed.headers) {
                optionsParsed.headers = {};
            } else {
                // Make a copy of the headers object to avoid mutating an object the
                // caller might have a reference to.
                optionsParsed.headers = Object.assign({}, optionsParsed.headers);
            }
            api_1.propagation.inject(requestContext, optionsParsed.headers);
            return api_1.context.with(requestContext, ()=>{
                /*
                 * The response callback is registered before ClientRequest is bound,
                 * thus it is needed to bind it before the function call.
                 */ const cb = args[args.length - 1];
                if (typeof cb === 'function') {
                    args[args.length - 1] = api_1.context.bind(parentContext, cb);
                }
                const request = (0, instrumentation_1.safeExecuteInTheMiddle)(()=>{
                    if (invalidUrl) {
                        // we know that the url is invalid, there's no point in injecting context as it will fail validation.
                        // Passing in what the user provided will give the user an error that matches what they'd see without
                        // the instrumentation.
                        return original.apply(this, [
                            options,
                            ...args
                        ]);
                    } else {
                        return original.apply(this, [
                            optionsParsed,
                            ...args
                        ]);
                    }
                }, (error)=>{
                    if (error) {
                        (0, utils_1.setSpanWithError)(span, error, instrumentation._semconvStability);
                        instrumentation._closeHttpSpan(span, api_1.SpanKind.CLIENT, startTime, oldMetricAttributes, stableMetricAttributes);
                        throw error;
                    }
                });
                instrumentation._diag.debug(`${component} instrumentation outgoingRequest`);
                api_1.context.bind(parentContext, request);
                return instrumentation._traceClientRequest(request, span, startTime, oldMetricAttributes, stableMetricAttributes);
            });
        };
    }
    _onServerResponseFinish(request, response, span, oldMetricAttributes, stableMetricAttributes, startTime) {
        const attributes = (0, utils_1.getIncomingRequestAttributesOnResponse)(request, response, this._semconvStability);
        oldMetricAttributes = Object.assign(oldMetricAttributes, (0, utils_1.getIncomingRequestMetricAttributesOnResponse)(attributes));
        stableMetricAttributes = Object.assign(stableMetricAttributes, (0, utils_1.getIncomingStableRequestMetricAttributesOnResponse)(attributes));
        this._headerCapture.server.captureResponseHeaders(span, (header)=>response.getHeader(header));
        span.setAttributes(attributes).setStatus({
            code: (0, utils_1.parseResponseStatus)(api_1.SpanKind.SERVER, response.statusCode)
        });
        const route = attributes[semantic_conventions_1.SEMATTRS_HTTP_ROUTE];
        if (route) {
            span.updateName(`${request.method || 'GET'} ${route}`);
        }
        if (this.getConfig().applyCustomAttributesOnSpan) {
            (0, instrumentation_1.safeExecuteInTheMiddle)(()=>this.getConfig().applyCustomAttributesOnSpan(span, request, response), ()=>{}, true);
        }
        this._closeHttpSpan(span, api_1.SpanKind.SERVER, startTime, oldMetricAttributes, stableMetricAttributes);
    }
    _onServerResponseError(span, oldMetricAttributes, stableMetricAttributes, startTime, error) {
        (0, utils_1.setSpanWithError)(span, error, this._semconvStability);
        // TODO get error attributes for metrics
        this._closeHttpSpan(span, api_1.SpanKind.SERVER, startTime, oldMetricAttributes, stableMetricAttributes);
    }
    _startHttpSpan(name, options, ctx = api_1.context.active()) {
        /*
         * If a parent is required but not present, we use a `NoopSpan` to still
         * propagate context without recording it.
         */ const requireParent = options.kind === api_1.SpanKind.CLIENT ? this.getConfig().requireParentforOutgoingSpans : this.getConfig().requireParentforIncomingSpans;
        let span;
        const currentSpan = api_1.trace.getSpan(ctx);
        if (requireParent === true && currentSpan === undefined) {
            span = api_1.trace.wrapSpanContext(api_1.INVALID_SPAN_CONTEXT);
        } else if (requireParent === true && (currentSpan === null || currentSpan === void 0 ? void 0 : currentSpan.spanContext().isRemote)) {
            span = currentSpan;
        } else {
            span = this.tracer.startSpan(name, options, ctx);
        }
        this._spanNotEnded.add(span);
        return span;
    }
    _closeHttpSpan(span, spanKind, startTime, oldMetricAttributes, stableMetricAttributes) {
        if (!this._spanNotEnded.has(span)) {
            return;
        }
        span.end();
        this._spanNotEnded.delete(span);
        // Record metrics
        const duration = (0, core_1.hrTimeToMilliseconds)((0, core_1.hrTimeDuration)(startTime, (0, core_1.hrTime)()));
        if (spanKind === api_1.SpanKind.SERVER) {
            this._recordServerDuration(duration, oldMetricAttributes, stableMetricAttributes);
        } else if (spanKind === api_1.SpanKind.CLIENT) {
            this._recordClientDuration(duration, oldMetricAttributes, stableMetricAttributes);
        }
    }
    _callResponseHook(span, response) {
        (0, instrumentation_1.safeExecuteInTheMiddle)(()=>this.getConfig().responseHook(span, response), ()=>{}, true);
    }
    _callRequestHook(span, request) {
        (0, instrumentation_1.safeExecuteInTheMiddle)(()=>this.getConfig().requestHook(span, request), ()=>{}, true);
    }
    _callStartSpanHook(request, hookFunc) {
        if (typeof hookFunc === 'function') {
            return (0, instrumentation_1.safeExecuteInTheMiddle)(()=>hookFunc(request), ()=>{}, true);
        }
    }
    _createHeaderCapture() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const config = this.getConfig();
        return {
            client: {
                captureRequestHeaders: (0, utils_1.headerCapture)('request', (_c = (_b = (_a = config.headersToSpanAttributes) === null || _a === void 0 ? void 0 : _a.client) === null || _b === void 0 ? void 0 : _b.requestHeaders) !== null && _c !== void 0 ? _c : []),
                captureResponseHeaders: (0, utils_1.headerCapture)('response', (_f = (_e = (_d = config.headersToSpanAttributes) === null || _d === void 0 ? void 0 : _d.client) === null || _e === void 0 ? void 0 : _e.responseHeaders) !== null && _f !== void 0 ? _f : [])
            },
            server: {
                captureRequestHeaders: (0, utils_1.headerCapture)('request', (_j = (_h = (_g = config.headersToSpanAttributes) === null || _g === void 0 ? void 0 : _g.server) === null || _h === void 0 ? void 0 : _h.requestHeaders) !== null && _j !== void 0 ? _j : []),
                captureResponseHeaders: (0, utils_1.headerCapture)('response', (_m = (_l = (_k = config.headersToSpanAttributes) === null || _k === void 0 ? void 0 : _k.server) === null || _l === void 0 ? void 0 : _l.responseHeaders) !== null && _m !== void 0 ? _m : [])
            }
        };
    }
}
exports.HttpInstrumentation = HttpInstrumentation;
}),
"[project]/node_modules/@opentelemetry/instrumentation-http/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HttpInstrumentation = void 0;
var http_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-http/build/src/http.js [app-route] (ecmascript)");
Object.defineProperty(exports, "HttpInstrumentation", {
    enumerable: true,
    get: function() {
        return http_1.HttpInstrumentation;
    }
});
}),
"[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ __turbopack_context__.s([]);
;
;
;
;
;
}),
"[project]/node_modules/@opentelemetry/instrumentation/build/esm/autoLoaderUtils.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Enable instrumentations
 * @param instrumentations
 * @param tracerProvider
 * @param meterProvider
 */ __turbopack_context__.s([
    "disableInstrumentations",
    ()=>disableInstrumentations,
    "enableInstrumentations",
    ()=>enableInstrumentations
]);
function enableInstrumentations(instrumentations, tracerProvider, meterProvider, loggerProvider) {
    for(var i = 0, j = instrumentations.length; i < j; i++){
        var instrumentation = instrumentations[i];
        if (tracerProvider) {
            instrumentation.setTracerProvider(tracerProvider);
        }
        if (meterProvider) {
            instrumentation.setMeterProvider(meterProvider);
        }
        if (loggerProvider && instrumentation.setLoggerProvider) {
            instrumentation.setLoggerProvider(loggerProvider);
        }
        // instrumentations have been already enabled during creation
        // so enable only if user prevented that by setting enabled to false
        // this is to prevent double enabling but when calling register all
        // instrumentations should be now enabled
        if (!instrumentation.getConfig().enabled) {
            instrumentation.enable();
        }
    }
}
function disableInstrumentations(instrumentations) {
    instrumentations.forEach(function(instrumentation) {
        return instrumentation.disable();
    });
}
}),
"[project]/node_modules/@opentelemetry/instrumentation/build/esm/autoLoader.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "registerInstrumentations",
    ()=>registerInstrumentations
]);
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/trace-api.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$metrics$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/metrics-api.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api-logs/build/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$autoLoaderUtils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/instrumentation/build/esm/autoLoaderUtils.js [app-route] (ecmascript)");
;
;
;
function registerInstrumentations(options) {
    var _a, _b;
    var tracerProvider = options.tracerProvider || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trace"].getTracerProvider();
    var meterProvider = options.meterProvider || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$metrics$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["metrics"].getMeterProvider();
    var loggerProvider = options.loggerProvider || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["logs"].getLoggerProvider();
    var instrumentations = (_b = (_a = options.instrumentations) === null || _a === void 0 ? void 0 : _a.flat()) !== null && _b !== void 0 ? _b : [];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$autoLoaderUtils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["enableInstrumentations"])(instrumentations, tracerProvider, meterProvider, loggerProvider);
    return function() {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$autoLoaderUtils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["disableInstrumentations"])(instrumentations);
    };
}
}),
"[project]/node_modules/@opentelemetry/instrumentation/build/esm/instrumentation.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InstrumentationAbstract",
    ()=>InstrumentationAbstract
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/diag-api.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$metrics$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/metrics-api.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/trace-api.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api-logs/build/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$shimmer$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/shimmer/index.js [app-route] (ecmascript)");
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __assign = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__assign || function() {
    __assign = Object.assign || function(t) {
        for(var s, i = 1, n = arguments.length; i < n; i++){
            s = arguments[i];
            for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
;
;
;
/**
 * Base abstract internal class for instrumenting node and web plugins
 */ var InstrumentationAbstract = function() {
    function InstrumentationAbstract(instrumentationName, instrumentationVersion, config) {
        this.instrumentationName = instrumentationName;
        this.instrumentationVersion = instrumentationVersion;
        this._config = {};
        /* Api to wrap instrumented method */ this._wrap = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$shimmer$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["wrap"];
        /* Api to unwrap instrumented methods */ this._unwrap = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$shimmer$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unwrap"];
        /* Api to mass wrap instrumented method */ this._massWrap = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$shimmer$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["massWrap"];
        /* Api to mass unwrap instrumented methods */ this._massUnwrap = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$shimmer$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["massUnwrap"];
        this.setConfig(config);
        this._diag = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].createComponentLogger({
            namespace: instrumentationName
        });
        this._tracer = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trace"].getTracer(instrumentationName, instrumentationVersion);
        this._meter = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$metrics$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["metrics"].getMeter(instrumentationName, instrumentationVersion);
        this._logger = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["logs"].getLogger(instrumentationName, instrumentationVersion);
        this._updateMetricInstruments();
    }
    Object.defineProperty(InstrumentationAbstract.prototype, "meter", {
        /* Returns meter */ get: function() {
            return this._meter;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Sets MeterProvider to this plugin
     * @param meterProvider
     */ InstrumentationAbstract.prototype.setMeterProvider = function(meterProvider) {
        this._meter = meterProvider.getMeter(this.instrumentationName, this.instrumentationVersion);
        this._updateMetricInstruments();
    };
    Object.defineProperty(InstrumentationAbstract.prototype, "logger", {
        /* Returns logger */ get: function() {
            return this._logger;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Sets LoggerProvider to this plugin
     * @param loggerProvider
     */ InstrumentationAbstract.prototype.setLoggerProvider = function(loggerProvider) {
        this._logger = loggerProvider.getLogger(this.instrumentationName, this.instrumentationVersion);
    };
    /**
     * @experimental
     *
     * Get module definitions defined by {@link init}.
     * This can be used for experimental compile-time instrumentation.
     *
     * @returns an array of {@link InstrumentationModuleDefinition}
     */ InstrumentationAbstract.prototype.getModuleDefinitions = function() {
        var _a;
        var initResult = (_a = this.init()) !== null && _a !== void 0 ? _a : [];
        if (!Array.isArray(initResult)) {
            return [
                initResult
            ];
        }
        return initResult;
    };
    /**
     * Sets the new metric instruments with the current Meter.
     */ InstrumentationAbstract.prototype._updateMetricInstruments = function() {
        return;
    };
    /* Returns InstrumentationConfig */ InstrumentationAbstract.prototype.getConfig = function() {
        return this._config;
    };
    /**
     * Sets InstrumentationConfig to this plugin
     * @param config
     */ InstrumentationAbstract.prototype.setConfig = function(config) {
        // copy config first level properties to ensure they are immutable.
        // nested properties are not copied, thus are mutable from the outside.
        this._config = __assign({
            enabled: true
        }, config);
    };
    /**
     * Sets TraceProvider to this plugin
     * @param tracerProvider
     */ InstrumentationAbstract.prototype.setTracerProvider = function(tracerProvider) {
        this._tracer = tracerProvider.getTracer(this.instrumentationName, this.instrumentationVersion);
    };
    Object.defineProperty(InstrumentationAbstract.prototype, "tracer", {
        /* Returns tracer */ get: function() {
            return this._tracer;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Execute span customization hook, if configured, and log any errors.
     * Any semantics of the trigger and info are defined by the specific instrumentation.
     * @param hookHandler The optional hook handler which the user has configured via instrumentation config
     * @param triggerName The name of the trigger for executing the hook for logging purposes
     * @param span The span to which the hook should be applied
     * @param info The info object to be passed to the hook, with useful data the hook may use
     */ InstrumentationAbstract.prototype._runSpanCustomizationHook = function(hookHandler, triggerName, span, info) {
        if (!hookHandler) {
            return;
        }
        try {
            hookHandler(span, info);
        } catch (e) {
            this._diag.error("Error running span customization hook due to exception in handler", {
                triggerName: triggerName
            }, e);
        }
    };
    return InstrumentationAbstract;
}();
;
}),
"[project]/node_modules/@opentelemetry/instrumentation/build/esm/platform/node/ModuleNameTrie.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ModuleNameSeparator",
    ()=>ModuleNameSeparator,
    "ModuleNameTrie",
    ()=>ModuleNameTrie
]);
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __values = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__values || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function() {
            if (o && i >= o.length) o = void 0;
            return {
                value: o && o[i++],
                done: !o
            };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__read || function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while((n === void 0 || n-- > 0) && !(r = i.next()).done)ar.push(r.value);
    } catch (error) {
        e = {
            error: error
        };
    } finally{
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        } finally{
            if (e) throw e.error;
        }
    }
    return ar;
};
var __spreadArray = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__spreadArray || function(to, from, pack) {
    if (pack || arguments.length === 2) for(var i = 0, l = from.length, ar; i < l; i++){
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var ModuleNameSeparator = '/';
/**
 * Node in a `ModuleNameTrie`
 */ var ModuleNameTrieNode = function() {
    function ModuleNameTrieNode() {
        this.hooks = [];
        this.children = new Map();
    }
    return ModuleNameTrieNode;
}();
/**
 * Trie containing nodes that represent a part of a module name (i.e. the parts separated by forward slash)
 */ var ModuleNameTrie = function() {
    function ModuleNameTrie() {
        this._trie = new ModuleNameTrieNode();
        this._counter = 0;
    }
    /**
     * Insert a module hook into the trie
     *
     * @param {Hooked} hook Hook
     */ ModuleNameTrie.prototype.insert = function(hook) {
        var e_1, _a;
        var trieNode = this._trie;
        try {
            for(var _b = __values(hook.moduleName.split(ModuleNameSeparator)), _c = _b.next(); !_c.done; _c = _b.next()){
                var moduleNamePart = _c.value;
                var nextNode = trieNode.children.get(moduleNamePart);
                if (!nextNode) {
                    nextNode = new ModuleNameTrieNode();
                    trieNode.children.set(moduleNamePart, nextNode);
                }
                trieNode = nextNode;
            }
        } catch (e_1_1) {
            e_1 = {
                error: e_1_1
            };
        } finally{
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            } finally{
                if (e_1) throw e_1.error;
            }
        }
        trieNode.hooks.push({
            hook: hook,
            insertedId: this._counter++
        });
    };
    /**
     * Search for matching hooks in the trie
     *
     * @param {string} moduleName Module name
     * @param {boolean} maintainInsertionOrder Whether to return the results in insertion order
     * @param {boolean} fullOnly Whether to return only full matches
     * @returns {Hooked[]} Matching hooks
     */ ModuleNameTrie.prototype.search = function(moduleName, _a) {
        var e_2, _b;
        var _c = _a === void 0 ? {} : _a, maintainInsertionOrder = _c.maintainInsertionOrder, fullOnly = _c.fullOnly;
        var trieNode = this._trie;
        var results = [];
        var foundFull = true;
        try {
            for(var _d = __values(moduleName.split(ModuleNameSeparator)), _e = _d.next(); !_e.done; _e = _d.next()){
                var moduleNamePart = _e.value;
                var nextNode = trieNode.children.get(moduleNamePart);
                if (!nextNode) {
                    foundFull = false;
                    break;
                }
                if (!fullOnly) {
                    results.push.apply(results, __spreadArray([], __read(nextNode.hooks), false));
                }
                trieNode = nextNode;
            }
        } catch (e_2_1) {
            e_2 = {
                error: e_2_1
            };
        } finally{
            try {
                if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
            } finally{
                if (e_2) throw e_2.error;
            }
        }
        if (fullOnly && foundFull) {
            results.push.apply(results, __spreadArray([], __read(trieNode.hooks), false));
        }
        if (results.length === 0) {
            return [];
        }
        if (results.length === 1) {
            return [
                results[0].hook
            ];
        }
        if (maintainInsertionOrder) {
            results.sort(function(a, b) {
                return a.insertedId - b.insertedId;
            });
        }
        return results.map(function(_a) {
            var hook = _a.hook;
            return hook;
        });
    };
    return ModuleNameTrie;
}();
;
}),
"[project]/node_modules/@opentelemetry/instrumentation/build/esm/platform/node/RequireInTheMiddleSingleton.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RequireInTheMiddleSingleton",
    ()=>RequireInTheMiddleSingleton
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$require$2d$in$2d$the$2d$middle__$5b$external$5d$__$28$require$2d$in$2d$the$2d$middle$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$require$2d$in$2d$the$2d$middle$29$__ = __turbopack_context__.i("[externals]/require-in-the-middle [external] (require-in-the-middle, cjs, [project]/node_modules/require-in-the-middle)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$platform$2f$node$2f$ModuleNameTrie$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/instrumentation/build/esm/platform/node/ModuleNameTrie.js [app-route] (ecmascript)");
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __values = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__values || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function() {
            if (o && i >= o.length) o = void 0;
            return {
                value: o && o[i++],
                done: !o
            };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
;
;
;
/**
 * Whether Mocha is running in this process
 * Inspired by https://github.com/AndreasPizsa/detect-mocha
 *
 * @type {boolean}
 */ var isMocha = [
    'afterEach',
    'after',
    'beforeEach',
    'before',
    'describe',
    'it'
].every(function(fn) {
    // @ts-expect-error TS7053: Element implicitly has an 'any' type
    return typeof /*TURBOPACK member replacement*/ __turbopack_context__.g[fn] === 'function';
});
/**
 * Singleton class for `require-in-the-middle`
 * Allows instrumentation plugins to patch modules with only a single `require` patch
 * WARNING: Because this class will create its own `require-in-the-middle` (RITM) instance,
 * we should minimize the number of new instances of this class.
 * Multiple instances of `@opentelemetry/instrumentation` (e.g. multiple versions) in a single process
 * will result in multiple instances of RITM, which will have an impact
 * on the performance of instrumentation hooks being applied.
 */ var RequireInTheMiddleSingleton = function() {
    function RequireInTheMiddleSingleton() {
        this._moduleNameTrie = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$platform$2f$node$2f$ModuleNameTrie$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ModuleNameTrie"]();
        this._initialize();
    }
    RequireInTheMiddleSingleton.prototype._initialize = function() {
        var _this = this;
        new __TURBOPACK__imported__module__$5b$externals$5d2f$require$2d$in$2d$the$2d$middle__$5b$external$5d$__$28$require$2d$in$2d$the$2d$middle$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$require$2d$in$2d$the$2d$middle$29$__["Hook"](// Intercept all `require` calls; we will filter the matching ones below
        null, {
            internals: true
        }, function(exports, name, basedir) {
            var e_1, _a;
            // For internal files on Windows, `name` will use backslash as the path separator
            var normalizedModuleName = normalizePathSeparators(name);
            var matches = _this._moduleNameTrie.search(normalizedModuleName, {
                maintainInsertionOrder: true,
                // For core modules (e.g. `fs`), do not match on sub-paths (e.g. `fs/promises').
                // This matches the behavior of `require-in-the-middle`.
                // `basedir` is always `undefined` for core modules.
                fullOnly: basedir === undefined
            });
            try {
                for(var matches_1 = __values(matches), matches_1_1 = matches_1.next(); !matches_1_1.done; matches_1_1 = matches_1.next()){
                    var onRequire = matches_1_1.value.onRequire;
                    exports = onRequire(exports, name, basedir);
                }
            } catch (e_1_1) {
                e_1 = {
                    error: e_1_1
                };
            } finally{
                try {
                    if (matches_1_1 && !matches_1_1.done && (_a = matches_1.return)) _a.call(matches_1);
                } finally{
                    if (e_1) throw e_1.error;
                }
            }
            return exports;
        });
    };
    /**
     * Register a hook with `require-in-the-middle`
     *
     * @param {string} moduleName Module name
     * @param {OnRequireFn} onRequire Hook function
     * @returns {Hooked} Registered hook
     */ RequireInTheMiddleSingleton.prototype.register = function(moduleName, onRequire) {
        var hooked = {
            moduleName: moduleName,
            onRequire: onRequire
        };
        this._moduleNameTrie.insert(hooked);
        return hooked;
    };
    /**
     * Get the `RequireInTheMiddleSingleton` singleton
     *
     * @returns {RequireInTheMiddleSingleton} Singleton of `RequireInTheMiddleSingleton`
     */ RequireInTheMiddleSingleton.getInstance = function() {
        var _a;
        // Mocha runs all test suites in the same process
        // This prevents test suites from sharing a singleton
        if (isMocha) return new RequireInTheMiddleSingleton();
        return this._instance = (_a = this._instance) !== null && _a !== void 0 ? _a : new RequireInTheMiddleSingleton();
    };
    return RequireInTheMiddleSingleton;
}();
;
/**
 * Normalize the path separators to forward slash in a module name or path
 *
 * @param {string} moduleNameOrPath Module name or path
 * @returns {string} Normalized module name or path
 */ function normalizePathSeparators(moduleNameOrPath) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["sep"] !== __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$platform$2f$node$2f$ModuleNameTrie$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ModuleNameSeparator"] ? moduleNameOrPath.split(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["sep"]).join(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$platform$2f$node$2f$ModuleNameTrie$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ModuleNameSeparator"]) : moduleNameOrPath;
}
}),
"[project]/node_modules/@opentelemetry/instrumentation/build/esm/utils.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isWrapped",
    ()=>isWrapped,
    "safeExecuteInTheMiddle",
    ()=>safeExecuteInTheMiddle,
    "safeExecuteInTheMiddleAsync",
    ()=>safeExecuteInTheMiddleAsync
]);
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __awaiter = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
        });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__generator || function(thisArg, body) {
    var _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    }, f, y, t, g;
    return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    //TURBOPACK unreachable
    ;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(_)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
};
function safeExecuteInTheMiddle(execute, onFinish, preventThrowingError) {
    var error;
    var result;
    try {
        result = execute();
    } catch (e) {
        error = e;
    } finally{
        onFinish(error, result);
        if (error && !preventThrowingError) {
            // eslint-disable-next-line no-unsafe-finally
            throw error;
        }
        // eslint-disable-next-line no-unsafe-finally
        return result;
    }
}
function safeExecuteInTheMiddleAsync(execute, onFinish, preventThrowingError) {
    return __awaiter(this, void 0, void 0, function() {
        var error, result, e_1;
        return __generator(this, function(_a) {
            switch(_a.label){
                case 0:
                    _a.trys.push([
                        0,
                        2,
                        3,
                        4
                    ]);
                    return [
                        4 /*yield*/ ,
                        execute()
                    ];
                case 1:
                    result = _a.sent();
                    return [
                        3 /*break*/ ,
                        4
                    ];
                case 2:
                    e_1 = _a.sent();
                    error = e_1;
                    return [
                        3 /*break*/ ,
                        4
                    ];
                case 3:
                    onFinish(error, result);
                    if (error && !preventThrowingError) {
                        // eslint-disable-next-line no-unsafe-finally
                        throw error;
                    }
                    // eslint-disable-next-line no-unsafe-finally
                    return [
                        2 /*return*/ ,
                        result
                    ];
                case 4:
                    return [
                        2 /*return*/ 
                    ];
            }
        });
    });
}
function isWrapped(func) {
    return typeof func === 'function' && typeof func.__original === 'function' && typeof func.__unwrap === 'function' && func.__wrapped === true;
}
}),
"[project]/node_modules/@opentelemetry/instrumentation/build/esm/platform/node/instrumentation.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InstrumentationBase",
    ()=>InstrumentationBase
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/util [external] (util, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$semver$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/semver/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$shimmer$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/shimmer/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$instrumentation$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/instrumentation/build/esm/instrumentation.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$platform$2f$node$2f$RequireInTheMiddleSingleton$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/instrumentation/build/esm/platform/node/RequireInTheMiddleSingleton.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$import$2d$in$2d$the$2d$middle__$5b$external$5d$__$28$import$2d$in$2d$the$2d$middle$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$import$2d$in$2d$the$2d$middle$29$__ = __turbopack_context__.i("[externals]/import-in-the-middle [external] (import-in-the-middle, cjs, [project]/node_modules/import-in-the-middle)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/diag-api.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$require$2d$in$2d$the$2d$middle__$5b$external$5d$__$28$require$2d$in$2d$the$2d$middle$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$require$2d$in$2d$the$2d$middle$29$__ = __turbopack_context__.i("[externals]/require-in-the-middle [external] (require-in-the-middle, cjs, [project]/node_modules/require-in-the-middle)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/instrumentation/build/esm/utils.js [app-route] (ecmascript)");
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __extends = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__extends || function() {
    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || ({
            __proto__: []
        }) instanceof Array && function(d, b) {
            d.__proto__ = b;
        } || function(d, b) {
            for(var p in b)if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
        return extendStatics(d, b);
    };
    return function(d, b) {
        if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
}();
var __values = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__values || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function() {
            if (o && i >= o.length) o = void 0;
            return {
                value: o && o[i++],
                done: !o
            };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
;
;
;
;
;
;
;
;
;
;
;
/**
 * Base abstract class for instrumenting node plugins
 */ var InstrumentationBase = function(_super) {
    __extends(InstrumentationBase, _super);
    function InstrumentationBase(instrumentationName, instrumentationVersion, config) {
        var _this = _super.call(this, instrumentationName, instrumentationVersion, config) || this;
        _this._hooks = [];
        _this._requireInTheMiddleSingleton = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$platform$2f$node$2f$RequireInTheMiddleSingleton$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RequireInTheMiddleSingleton"].getInstance();
        _this._enabled = false;
        _this._wrap = function(moduleExports, name, wrapper) {
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isWrapped"])(moduleExports[name])) {
                _this._unwrap(moduleExports, name);
            }
            if (!__TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__["types"].isProxy(moduleExports)) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$shimmer$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["wrap"])(moduleExports, name, wrapper);
            } else {
                var wrapped = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$shimmer$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["wrap"])(Object.assign({}, moduleExports), name, wrapper);
                Object.defineProperty(moduleExports, name, {
                    value: wrapped
                });
                return wrapped;
            }
        };
        _this._unwrap = function(moduleExports, name) {
            if (!__TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__["types"].isProxy(moduleExports)) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$shimmer$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unwrap"])(moduleExports, name);
            } else {
                return Object.defineProperty(moduleExports, name, {
                    value: moduleExports[name]
                });
            }
        };
        _this._massWrap = function(moduleExportsArray, names, wrapper) {
            if (!moduleExportsArray) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].error('must provide one or more modules to patch');
                return;
            } else if (!Array.isArray(moduleExportsArray)) {
                moduleExportsArray = [
                    moduleExportsArray
                ];
            }
            if (!(names && Array.isArray(names))) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].error('must provide one or more functions to wrap on modules');
                return;
            }
            moduleExportsArray.forEach(function(moduleExports) {
                names.forEach(function(name) {
                    _this._wrap(moduleExports, name, wrapper);
                });
            });
        };
        _this._massUnwrap = function(moduleExportsArray, names) {
            if (!moduleExportsArray) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].error('must provide one or more modules to patch');
                return;
            } else if (!Array.isArray(moduleExportsArray)) {
                moduleExportsArray = [
                    moduleExportsArray
                ];
            }
            if (!(names && Array.isArray(names))) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].error('must provide one or more functions to wrap on modules');
                return;
            }
            moduleExportsArray.forEach(function(moduleExports) {
                names.forEach(function(name) {
                    _this._unwrap(moduleExports, name);
                });
            });
        };
        var modules = _this.init();
        if (modules && !Array.isArray(modules)) {
            modules = [
                modules
            ];
        }
        _this._modules = modules || [];
        if (_this._config.enabled) {
            _this.enable();
        }
        return _this;
    }
    InstrumentationBase.prototype._warnOnPreloadedModules = function() {
        var _this = this;
        this._modules.forEach(function(module) {
            var name = module.name;
            try {
                var resolvedModule = (()=>{
                    const e = new Error("Cannot find module as expression is too dynamic");
                    e.code = 'MODULE_NOT_FOUND';
                    throw e;
                })();
                if (__turbopack_context__.c[resolvedModule]) {
                    // Module is already cached, which means the instrumentation hook might not work
                    _this._diag.warn("Module " + name + " has been loaded before " + _this.instrumentationName + " so it might not work, please initialize it before requiring " + name);
                }
            } catch (_a) {
            // Module isn't available, we can simply skip
            }
        });
    };
    InstrumentationBase.prototype._extractPackageVersion = function(baseDir) {
        try {
            var json = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readFileSync"])(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"](baseDir, 'package.json'), {
                encoding: 'utf8'
            });
            var version = JSON.parse(json).version;
            return typeof version === 'string' ? version : undefined;
        } catch (error) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].warn('Failed extracting version', baseDir);
        }
        return undefined;
    };
    InstrumentationBase.prototype._onRequire = function(module, exports, name, baseDir) {
        var _this = this;
        var _a;
        if (!baseDir) {
            if (typeof module.patch === 'function') {
                module.moduleExports = exports;
                if (this._enabled) {
                    this._diag.debug('Applying instrumentation patch for nodejs core module on require hook', {
                        module: module.name
                    });
                    return module.patch(exports);
                }
            }
            return exports;
        }
        var version = this._extractPackageVersion(baseDir);
        module.moduleVersion = version;
        if (module.name === name) {
            // main module
            if (isSupported(module.supportedVersions, version, module.includePrerelease)) {
                if (typeof module.patch === 'function') {
                    module.moduleExports = exports;
                    if (this._enabled) {
                        this._diag.debug('Applying instrumentation patch for module on require hook', {
                            module: module.name,
                            version: module.moduleVersion,
                            baseDir: baseDir
                        });
                        return module.patch(exports, module.moduleVersion);
                    }
                }
            }
            return exports;
        }
        // internal file
        var files = (_a = module.files) !== null && _a !== void 0 ? _a : [];
        var normalizedName = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["normalize"](name);
        var supportedFileInstrumentations = files.filter(function(f) {
            return f.name === normalizedName;
        }).filter(function(f) {
            return isSupported(f.supportedVersions, version, module.includePrerelease);
        });
        return supportedFileInstrumentations.reduce(function(patchedExports, file) {
            file.moduleExports = patchedExports;
            if (_this._enabled) {
                _this._diag.debug('Applying instrumentation patch for nodejs module file on require hook', {
                    module: module.name,
                    version: module.moduleVersion,
                    fileName: file.name,
                    baseDir: baseDir
                });
                // patch signature is not typed, so we cast it assuming it's correct
                return file.patch(patchedExports, module.moduleVersion);
            }
            return patchedExports;
        }, exports);
    };
    InstrumentationBase.prototype.enable = function() {
        var e_1, _a, e_2, _b, e_3, _c;
        var _this = this;
        if (this._enabled) {
            return;
        }
        this._enabled = true;
        // already hooked, just call patch again
        if (this._hooks.length > 0) {
            try {
                for(var _d = __values(this._modules), _e = _d.next(); !_e.done; _e = _d.next()){
                    var module_1 = _e.value;
                    if (typeof module_1.patch === 'function' && module_1.moduleExports) {
                        this._diag.debug('Applying instrumentation patch for nodejs module on instrumentation enabled', {
                            module: module_1.name,
                            version: module_1.moduleVersion
                        });
                        module_1.patch(module_1.moduleExports, module_1.moduleVersion);
                    }
                    try {
                        for(var _f = (e_2 = void 0, __values(module_1.files)), _g = _f.next(); !_g.done; _g = _f.next()){
                            var file = _g.value;
                            if (file.moduleExports) {
                                this._diag.debug('Applying instrumentation patch for nodejs module file on instrumentation enabled', {
                                    module: module_1.name,
                                    version: module_1.moduleVersion,
                                    fileName: file.name
                                });
                                file.patch(file.moduleExports, module_1.moduleVersion);
                            }
                        }
                    } catch (e_2_1) {
                        e_2 = {
                            error: e_2_1
                        };
                    } finally{
                        try {
                            if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                        } finally{
                            if (e_2) throw e_2.error;
                        }
                    }
                }
            } catch (e_1_1) {
                e_1 = {
                    error: e_1_1
                };
            } finally{
                try {
                    if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                } finally{
                    if (e_1) throw e_1.error;
                }
            }
            return;
        }
        this._warnOnPreloadedModules();
        var _loop_1 = function(module_2) {
            var hookFn = function(exports, name, baseDir) {
                if (!baseDir && __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["isAbsolute"](name)) {
                    var parsedPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["parse"](name);
                    name = parsedPath.name;
                    baseDir = parsedPath.dir;
                }
                return _this._onRequire(module_2, exports, name, baseDir);
            };
            var onRequire = function(exports, name, baseDir) {
                return _this._onRequire(module_2, exports, name, baseDir);
            };
            // `RequireInTheMiddleSingleton` does not support absolute paths.
            // For an absolute paths, we must create a separate instance of the
            // require-in-the-middle `Hook`.
            var hook = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["isAbsolute"](module_2.name) ? new __TURBOPACK__imported__module__$5b$externals$5d2f$require$2d$in$2d$the$2d$middle__$5b$external$5d$__$28$require$2d$in$2d$the$2d$middle$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$require$2d$in$2d$the$2d$middle$29$__["Hook"]([
                module_2.name
            ], {
                internals: true
            }, onRequire) : this_1._requireInTheMiddleSingleton.register(module_2.name, onRequire);
            this_1._hooks.push(hook);
            var esmHook = new __TURBOPACK__imported__module__$5b$externals$5d2f$import$2d$in$2d$the$2d$middle__$5b$external$5d$__$28$import$2d$in$2d$the$2d$middle$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$import$2d$in$2d$the$2d$middle$29$__["Hook"]([
                module_2.name
            ], {
                internals: false
            }, hookFn);
            this_1._hooks.push(esmHook);
        };
        var this_1 = this;
        try {
            for(var _h = __values(this._modules), _j = _h.next(); !_j.done; _j = _h.next()){
                var module_2 = _j.value;
                _loop_1(module_2);
            }
        } catch (e_3_1) {
            e_3 = {
                error: e_3_1
            };
        } finally{
            try {
                if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
            } finally{
                if (e_3) throw e_3.error;
            }
        }
    };
    InstrumentationBase.prototype.disable = function() {
        var e_4, _a, e_5, _b;
        if (!this._enabled) {
            return;
        }
        this._enabled = false;
        try {
            for(var _c = __values(this._modules), _d = _c.next(); !_d.done; _d = _c.next()){
                var module_3 = _d.value;
                if (typeof module_3.unpatch === 'function' && module_3.moduleExports) {
                    this._diag.debug('Removing instrumentation patch for nodejs module on instrumentation disabled', {
                        module: module_3.name,
                        version: module_3.moduleVersion
                    });
                    module_3.unpatch(module_3.moduleExports, module_3.moduleVersion);
                }
                try {
                    for(var _e = (e_5 = void 0, __values(module_3.files)), _f = _e.next(); !_f.done; _f = _e.next()){
                        var file = _f.value;
                        if (file.moduleExports) {
                            this._diag.debug('Removing instrumentation patch for nodejs module file on instrumentation disabled', {
                                module: module_3.name,
                                version: module_3.moduleVersion,
                                fileName: file.name
                            });
                            file.unpatch(file.moduleExports, module_3.moduleVersion);
                        }
                    }
                } catch (e_5_1) {
                    e_5 = {
                        error: e_5_1
                    };
                } finally{
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    } finally{
                        if (e_5) throw e_5.error;
                    }
                }
            }
        } catch (e_4_1) {
            e_4 = {
                error: e_4_1
            };
        } finally{
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            } finally{
                if (e_4) throw e_4.error;
            }
        }
    };
    InstrumentationBase.prototype.isEnabled = function() {
        return this._enabled;
    };
    return InstrumentationBase;
}(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$instrumentation$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["InstrumentationAbstract"]);
;
function isSupported(supportedVersions, version, includePrerelease) {
    if (typeof version === 'undefined') {
        // If we don't have the version, accept the wildcard case only
        return supportedVersions.includes('*');
    }
    return supportedVersions.some(function(supportedVersion) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$semver$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["satisfies"])(version, supportedVersion, {
            includePrerelease: includePrerelease
        });
    });
}
}),
"[project]/node_modules/@opentelemetry/instrumentation/build/esm/instrumentationNodeModuleDefinition.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InstrumentationNodeModuleDefinition",
    ()=>InstrumentationNodeModuleDefinition
]);
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var InstrumentationNodeModuleDefinition = function() {
    function InstrumentationNodeModuleDefinition(name, supportedVersions, // eslint-disable-next-line @typescript-eslint/no-explicit-any
    patch, // eslint-disable-next-line @typescript-eslint/no-explicit-any
    unpatch, files) {
        this.name = name;
        this.supportedVersions = supportedVersions;
        this.patch = patch;
        this.unpatch = unpatch;
        this.files = files || [];
    }
    return InstrumentationNodeModuleDefinition;
}();
;
}),
"[project]/node_modules/@opentelemetry/instrumentation/build/esm/instrumentationNodeModuleFile.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InstrumentationNodeModuleFile",
    ()=>InstrumentationNodeModuleFile
]);
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
var InstrumentationNodeModuleFile = function() {
    function InstrumentationNodeModuleFile(name, supportedVersions, // eslint-disable-next-line @typescript-eslint/no-explicit-any
    patch, // eslint-disable-next-line @typescript-eslint/no-explicit-any
    unpatch) {
        this.supportedVersions = supportedVersions;
        this.patch = patch;
        this.unpatch = unpatch;
        this.name = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["normalize"])(name);
    }
    return InstrumentationNodeModuleFile;
}();
;
}),
"[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InstrumentationBase",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$platform$2f$node$2f$instrumentation$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["InstrumentationBase"],
    "InstrumentationNodeModuleDefinition",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$instrumentationNodeModuleDefinition$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["InstrumentationNodeModuleDefinition"],
    "InstrumentationNodeModuleFile",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$instrumentationNodeModuleFile$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["InstrumentationNodeModuleFile"],
    "isWrapped",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isWrapped"],
    "registerInstrumentations",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$autoLoader$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerInstrumentations"],
    "safeExecuteInTheMiddle",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeExecuteInTheMiddle"],
    "safeExecuteInTheMiddleAsync",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeExecuteInTheMiddleAsync"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$autoLoader$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/instrumentation/build/esm/autoLoader.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$platform$2f$node$2f$instrumentation$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/instrumentation/build/esm/platform/node/instrumentation.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$instrumentationNodeModuleDefinition$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/instrumentation/build/esm/instrumentationNodeModuleDefinition.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$instrumentationNodeModuleFile$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/instrumentation/build/esm/instrumentationNodeModuleFile.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/instrumentation/build/esm/utils.js [app-route] (ecmascript)");
}),
"[project]/node_modules/@opentelemetry/api-logs/build/esm/platform/node/globalThis.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /** only globals that common to node and browsers are allowed */ // eslint-disable-next-line node/no-unsupported-features/es-builtins
__turbopack_context__.s([
    "_globalThis",
    ()=>_globalThis
]);
var _globalThis = typeof globalThis === 'object' ? globalThis : /*TURBOPACK member replacement*/ __turbopack_context__.g;
}),
"[project]/node_modules/@opentelemetry/api-logs/build/esm/internal/global-utils.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "API_BACKWARDS_COMPATIBILITY_VERSION",
    ()=>API_BACKWARDS_COMPATIBILITY_VERSION,
    "GLOBAL_LOGS_API_KEY",
    ()=>GLOBAL_LOGS_API_KEY,
    "_global",
    ()=>_global,
    "makeGetter",
    ()=>makeGetter
]);
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$platform$2f$node$2f$globalThis$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api-logs/build/esm/platform/node/globalThis.js [app-route] (ecmascript)");
;
var GLOBAL_LOGS_API_KEY = Symbol.for('io.opentelemetry.js.api.logs');
var _global = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$platform$2f$node$2f$globalThis$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_globalThis"];
function makeGetter(requiredVersion, instance, fallback) {
    return function(version) {
        return version === requiredVersion ? instance : fallback;
    };
}
var API_BACKWARDS_COMPATIBILITY_VERSION = 1;
}),
"[project]/node_modules/@opentelemetry/api-logs/build/esm/NoopLogger.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NOOP_LOGGER",
    ()=>NOOP_LOGGER,
    "NoopLogger",
    ()=>NoopLogger
]);
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var NoopLogger = function() {
    function NoopLogger() {}
    NoopLogger.prototype.emit = function(_logRecord) {};
    return NoopLogger;
}();
;
var NOOP_LOGGER = new NoopLogger();
}),
"[project]/node_modules/@opentelemetry/api-logs/build/esm/NoopLoggerProvider.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NOOP_LOGGER_PROVIDER",
    ()=>NOOP_LOGGER_PROVIDER,
    "NoopLoggerProvider",
    ()=>NoopLoggerProvider
]);
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$NoopLogger$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api-logs/build/esm/NoopLogger.js [app-route] (ecmascript)");
;
var NoopLoggerProvider = function() {
    function NoopLoggerProvider() {}
    NoopLoggerProvider.prototype.getLogger = function(_name, _version, _options) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$NoopLogger$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NoopLogger"]();
    };
    return NoopLoggerProvider;
}();
;
var NOOP_LOGGER_PROVIDER = new NoopLoggerProvider();
}),
"[project]/node_modules/@opentelemetry/api-logs/build/esm/ProxyLogger.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProxyLogger",
    ()=>ProxyLogger
]);
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$NoopLogger$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api-logs/build/esm/NoopLogger.js [app-route] (ecmascript)");
;
var ProxyLogger = function() {
    function ProxyLogger(_provider, name, version, options) {
        this._provider = _provider;
        this.name = name;
        this.version = version;
        this.options = options;
    }
    /**
     * Emit a log record. This method should only be used by log appenders.
     *
     * @param logRecord
     */ ProxyLogger.prototype.emit = function(logRecord) {
        this._getLogger().emit(logRecord);
    };
    /**
     * Try to get a logger from the proxy logger provider.
     * If the proxy logger provider has no delegate, return a noop logger.
     */ ProxyLogger.prototype._getLogger = function() {
        if (this._delegate) {
            return this._delegate;
        }
        var logger = this._provider.getDelegateLogger(this.name, this.version, this.options);
        if (!logger) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$NoopLogger$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NOOP_LOGGER"];
        }
        this._delegate = logger;
        return this._delegate;
    };
    return ProxyLogger;
}();
;
}),
"[project]/node_modules/@opentelemetry/api-logs/build/esm/ProxyLoggerProvider.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProxyLoggerProvider",
    ()=>ProxyLoggerProvider
]);
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$NoopLoggerProvider$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api-logs/build/esm/NoopLoggerProvider.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$ProxyLogger$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api-logs/build/esm/ProxyLogger.js [app-route] (ecmascript)");
;
;
var ProxyLoggerProvider = function() {
    function ProxyLoggerProvider() {}
    ProxyLoggerProvider.prototype.getLogger = function(name, version, options) {
        var _a;
        return (_a = this.getDelegateLogger(name, version, options)) !== null && _a !== void 0 ? _a : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$ProxyLogger$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ProxyLogger"](this, name, version, options);
    };
    ProxyLoggerProvider.prototype.getDelegate = function() {
        var _a;
        return (_a = this._delegate) !== null && _a !== void 0 ? _a : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$NoopLoggerProvider$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NOOP_LOGGER_PROVIDER"];
    };
    /**
     * Set the delegate logger provider
     */ ProxyLoggerProvider.prototype.setDelegate = function(delegate) {
        this._delegate = delegate;
    };
    ProxyLoggerProvider.prototype.getDelegateLogger = function(name, version, options) {
        var _a;
        return (_a = this._delegate) === null || _a === void 0 ? void 0 : _a.getLogger(name, version, options);
    };
    return ProxyLoggerProvider;
}();
;
}),
"[project]/node_modules/@opentelemetry/api-logs/build/esm/api/logs.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LogsAPI",
    ()=>LogsAPI
]);
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$internal$2f$global$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api-logs/build/esm/internal/global-utils.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$NoopLoggerProvider$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api-logs/build/esm/NoopLoggerProvider.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$ProxyLoggerProvider$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api-logs/build/esm/ProxyLoggerProvider.js [app-route] (ecmascript)");
;
;
;
var LogsAPI = function() {
    function LogsAPI() {
        this._proxyLoggerProvider = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$ProxyLoggerProvider$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ProxyLoggerProvider"]();
    }
    LogsAPI.getInstance = function() {
        if (!this._instance) {
            this._instance = new LogsAPI();
        }
        return this._instance;
    };
    LogsAPI.prototype.setGlobalLoggerProvider = function(provider) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$internal$2f$global$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_global"][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$internal$2f$global$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GLOBAL_LOGS_API_KEY"]]) {
            return this.getLoggerProvider();
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$internal$2f$global$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_global"][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$internal$2f$global$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GLOBAL_LOGS_API_KEY"]] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$internal$2f$global$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["makeGetter"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$internal$2f$global$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["API_BACKWARDS_COMPATIBILITY_VERSION"], provider, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$NoopLoggerProvider$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NOOP_LOGGER_PROVIDER"]);
        this._proxyLoggerProvider.setDelegate(provider);
        return provider;
    };
    /**
     * Returns the global logger provider.
     *
     * @returns LoggerProvider
     */ LogsAPI.prototype.getLoggerProvider = function() {
        var _a, _b;
        return (_b = (_a = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$internal$2f$global$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_global"][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$internal$2f$global$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GLOBAL_LOGS_API_KEY"]]) === null || _a === void 0 ? void 0 : _a.call(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$internal$2f$global$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_global"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$internal$2f$global$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["API_BACKWARDS_COMPATIBILITY_VERSION"])) !== null && _b !== void 0 ? _b : this._proxyLoggerProvider;
    };
    /**
     * Returns a logger from the global logger provider.
     *
     * @returns Logger
     */ LogsAPI.prototype.getLogger = function(name, version, options) {
        return this.getLoggerProvider().getLogger(name, version, options);
    };
    /** Remove the global logger provider */ LogsAPI.prototype.disable = function() {
        delete __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$internal$2f$global$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_global"][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$internal$2f$global$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GLOBAL_LOGS_API_KEY"]];
        this._proxyLoggerProvider = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$ProxyLoggerProvider$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ProxyLoggerProvider"]();
    };
    return LogsAPI;
}();
;
}),
"[project]/node_modules/@opentelemetry/api-logs/build/esm/index.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ __turbopack_context__.s([
    "logs",
    ()=>logs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$api$2f$logs$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api-logs/build/esm/api/logs.js [app-route] (ecmascript)");
;
;
;
;
;
;
var logs = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2d$logs$2f$build$2f$esm$2f$api$2f$logs$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LogsAPI"].getInstance();
}),
"[project]/node_modules/shimmer/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

function isFunction(funktion) {
    return typeof funktion === 'function';
}
// Default to complaining loudly when things don't go according to plan.
var logger = console.error.bind(console);
// Sets a property on an object, preserving its enumerability.
// This function assumes that the property is already writable.
function defineProperty(obj, name, value) {
    var enumerable = !!obj[name] && obj.propertyIsEnumerable(name);
    Object.defineProperty(obj, name, {
        configurable: true,
        enumerable: enumerable,
        writable: true,
        value: value
    });
}
// Keep initialization idempotent.
function shimmer(options) {
    if (options && options.logger) {
        if (!isFunction(options.logger)) logger("new logger isn't a function, not replacing");
        else logger = options.logger;
    }
}
function wrap(nodule, name, wrapper) {
    if (!nodule || !nodule[name]) {
        logger('no original function ' + name + ' to wrap');
        return;
    }
    if (!wrapper) {
        logger('no wrapper function');
        logger(new Error().stack);
        return;
    }
    if (!isFunction(nodule[name]) || !isFunction(wrapper)) {
        logger('original object and wrapper must be functions');
        return;
    }
    var original = nodule[name];
    var wrapped = wrapper(original, name);
    defineProperty(wrapped, '__original', original);
    defineProperty(wrapped, '__unwrap', function() {
        if (nodule[name] === wrapped) defineProperty(nodule, name, original);
    });
    defineProperty(wrapped, '__wrapped', true);
    defineProperty(nodule, name, wrapped);
    return wrapped;
}
function massWrap(nodules, names, wrapper) {
    if (!nodules) {
        logger('must provide one or more modules to patch');
        logger(new Error().stack);
        return;
    } else if (!Array.isArray(nodules)) {
        nodules = [
            nodules
        ];
    }
    if (!(names && Array.isArray(names))) {
        logger('must provide one or more functions to wrap on modules');
        return;
    }
    nodules.forEach(function(nodule) {
        names.forEach(function(name) {
            wrap(nodule, name, wrapper);
        });
    });
}
function unwrap(nodule, name) {
    if (!nodule || !nodule[name]) {
        logger('no function to unwrap.');
        logger(new Error().stack);
        return;
    }
    if (!nodule[name].__unwrap) {
        logger('no original to unwrap to -- has ' + name + ' already been unwrapped?');
    } else {
        return nodule[name].__unwrap();
    }
}
function massUnwrap(nodules, names) {
    if (!nodules) {
        logger('must provide one or more modules to patch');
        logger(new Error().stack);
        return;
    } else if (!Array.isArray(nodules)) {
        nodules = [
            nodules
        ];
    }
    if (!(names && Array.isArray(names))) {
        logger('must provide one or more functions to unwrap on modules');
        return;
    }
    nodules.forEach(function(nodule) {
        names.forEach(function(name) {
            unwrap(nodule, name);
        });
    });
}
shimmer.wrap = wrap;
shimmer.massWrap = massWrap;
shimmer.unwrap = unwrap;
shimmer.massUnwrap = massUnwrap;
module.exports = shimmer;
}),
"[externals]/require-in-the-middle [external] (require-in-the-middle, cjs, [project]/node_modules/require-in-the-middle)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("require-in-the-middle-2ca7b9c2766f317e", () => require("require-in-the-middle-2ca7b9c2766f317e"));

module.exports = mod;
}),
"[externals]/import-in-the-middle [external] (import-in-the-middle, cjs, [project]/node_modules/import-in-the-middle)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("import-in-the-middle-ac114f323ad7e863", () => require("import-in-the-middle-ac114f323ad7e863"));

module.exports = mod;
}),
"[project]/node_modules/forwarded-parse/lib/error.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
/**
 * An error thrown by the parser on unexpected input.
 *
 * @constructor
 * @param {string} message The error message.
 * @param {string} input The unexpected input.
 * @public
 */ function ParseError(message, input) {
    Error.captureStackTrace(this, ParseError);
    this.name = this.constructor.name;
    this.message = message;
    this.input = input;
}
util.inherits(ParseError, Error);
module.exports = ParseError;
}),
"[project]/node_modules/forwarded-parse/lib/ascii.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Check if a character is a delimiter as defined in section 3.2.6 of RFC 7230.
 *
 *
 * @param {number} code The code of the character to check.
 * @returns {boolean} `true` if the character is a delimiter, else `false`.
 * @public
 */ function isDelimiter(code) {
    return code === 0x22 // '"'
     || code === 0x28 // '('
     || code === 0x29 // ')'
     || code === 0x2C // ','
     || code === 0x2F // '/'
     || code >= 0x3A && code <= 0x40 // ':', ';', '<', '=', '>', '?' '@'
     || code >= 0x5B && code <= 0x5D // '[', '\', ']'
     || code === 0x7B // '{'
     || code === 0x7D; // '}'
}
/**
 * Check if a character is allowed in a token as defined in section 3.2.6
 * of RFC 7230.
 *
 * @param {number} code The code of the character to check.
 * @returns {boolean} `true` if the character is allowed, else `false`.
 * @public
 */ function isTokenChar(code) {
    return code === 0x21 // '!'
     || code >= 0x23 && code <= 0x27 // '#', '$', '%', '&', '''
     || code === 0x2A // '*'
     || code === 0x2B // '+'
     || code === 0x2D // '-'
     || code === 0x2E // '.'
     || code >= 0x30 && code <= 0x39 // 0-9
     || code >= 0x41 && code <= 0x5A // A-Z
     || code >= 0x5E && code <= 0x7A // '^', '_', '`', a-z
     || code === 0x7C // '|'
     || code === 0x7E; // '~'
}
/**
 * Check if a character is a printable ASCII character.
 *
 * @param {number} code The code of the character to check.
 * @returns {boolean} `true` if `code` is in the %x20-7E range, else `false`.
 * @public
 */ function isPrint(code) {
    return code >= 0x20 && code <= 0x7E;
}
/**
 * Check if a character is an extended ASCII character.
 *
 * @param {number} code The code of the character to check.
 * @returns {boolean} `true` if `code` is in the %x80-FF range, else `false`.
 * @public
 */ function isExtended(code) {
    return code >= 0x80 && code <= 0xFF;
}
module.exports = {
    isDelimiter: isDelimiter,
    isTokenChar: isTokenChar,
    isExtended: isExtended,
    isPrint: isPrint
};
}),
"[project]/node_modules/forwarded-parse/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
var ParseError = __turbopack_context__.r("[project]/node_modules/forwarded-parse/lib/error.js [app-route] (ecmascript)");
var ascii = __turbopack_context__.r("[project]/node_modules/forwarded-parse/lib/ascii.js [app-route] (ecmascript)");
var isDelimiter = ascii.isDelimiter;
var isTokenChar = ascii.isTokenChar;
var isExtended = ascii.isExtended;
var isPrint = ascii.isPrint;
/**
 * Unescape a string.
 *
 * @param {string} str The string to unescape.
 * @returns {string} A new unescaped string.
 * @private
 */ function decode(str) {
    return str.replace(/\\(.)/g, '$1');
}
/**
 * Build an error message when an unexpected character is found.
 *
 * @param {string} header The header field value.
 * @param {number} position The position of the unexpected character.
 * @returns {string} The error message.
 * @private
 */ function unexpectedCharacterMessage(header, position) {
    return util.format("Unexpected character '%s' at index %d", header.charAt(position), position);
}
/**
 * Parse the `Forwarded` header field value into an array of objects.
 *
 * @param {string} header The header field value.
 * @returns {Object[]}
 * @public
 */ function parse(header) {
    var mustUnescape = false;
    var isEscaping = false;
    var inQuotes = false;
    var forwarded = {};
    var output = [];
    var start = -1;
    var end = -1;
    var parameter;
    var code;
    for(var i = 0; i < header.length; i++){
        code = header.charCodeAt(i);
        if (parameter === undefined) {
            if (i !== 0 && start === -1 && (code === 0x20 /*' '*/  || code === 0x09 /*'\t'*/ )) {
                continue;
            }
            if (isTokenChar(code)) {
                if (start === -1) start = i;
            } else if (code === 0x3D /*'='*/  && start !== -1) {
                parameter = header.slice(start, i).toLowerCase();
                start = -1;
            } else {
                throw new ParseError(unexpectedCharacterMessage(header, i), header);
            }
        } else {
            if (isEscaping && (code === 0x09 || isPrint(code) || isExtended(code))) {
                isEscaping = false;
            } else if (isTokenChar(code)) {
                if (end !== -1) {
                    throw new ParseError(unexpectedCharacterMessage(header, i), header);
                }
                if (start === -1) start = i;
            } else if (isDelimiter(code) || isExtended(code)) {
                if (inQuotes) {
                    if (code === 0x22 /*'"'*/ ) {
                        inQuotes = false;
                        end = i;
                    } else if (code === 0x5C /*'\'*/ ) {
                        if (start === -1) start = i;
                        isEscaping = mustUnescape = true;
                    } else if (start === -1) {
                        start = i;
                    }
                } else if (code === 0x22 && header.charCodeAt(i - 1) === 0x3D) {
                    inQuotes = true;
                } else if ((code === 0x2C /*','*/  || code === 0x3B /*';'*/ ) && (start !== -1 || end !== -1)) {
                    if (start !== -1) {
                        if (end === -1) end = i;
                        forwarded[parameter] = mustUnescape ? decode(header.slice(start, end)) : header.slice(start, end);
                    } else {
                        forwarded[parameter] = '';
                    }
                    if (code === 0x2C) {
                        output.push(forwarded);
                        forwarded = {};
                    }
                    parameter = undefined;
                    start = end = -1;
                } else {
                    throw new ParseError(unexpectedCharacterMessage(header, i), header);
                }
            } else if (code === 0x20 || code === 0x09) {
                if (end !== -1) continue;
                if (inQuotes) {
                    if (start === -1) start = i;
                } else if (start !== -1) {
                    end = i;
                } else {
                    throw new ParseError(unexpectedCharacterMessage(header, i), header);
                }
            } else {
                throw new ParseError(unexpectedCharacterMessage(header, i), header);
            }
        }
    }
    if (parameter === undefined || inQuotes || start === -1 && end === -1 || code === 0x20 || code === 0x09) {
        throw new ParseError('Unexpected end of input', header);
    }
    if (start !== -1) {
        if (end === -1) end = i;
        forwarded[parameter] = mustUnescape ? decode(header.slice(start, end)) : header.slice(start, end);
    } else {
        forwarded[parameter] = '';
    }
    output.push(forwarded);
    return output;
}
module.exports = parse;
}),
"[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/Sampler.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * A sampling decision that determines how a {@link Span} will be recorded
 * and collected.
 */ __turbopack_context__.s([
    "SamplingDecision",
    ()=>SamplingDecision
]);
var SamplingDecision;
(function(SamplingDecision) {
    /**
     * `Span.isRecording() === false`, span will not be recorded and all events
     * and attributes will be dropped.
     */ SamplingDecision[SamplingDecision["NOT_RECORD"] = 0] = "NOT_RECORD";
    /**
     * `Span.isRecording() === true`, but `Sampled` flag in {@link TraceFlags}
     * MUST NOT be set.
     */ SamplingDecision[SamplingDecision["RECORD"] = 1] = "RECORD";
    /**
     * `Span.isRecording() === true` AND `Sampled` flag in {@link TraceFlags}
     * MUST be set.
     */ SamplingDecision[SamplingDecision["RECORD_AND_SAMPLED"] = 2] = "RECORD_AND_SAMPLED";
})(SamplingDecision || (SamplingDecision = {}));
}),
"[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/enums.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ // Event name definitions
__turbopack_context__.s([
    "ExceptionEventName",
    ()=>ExceptionEventName
]);
var ExceptionEventName = 'exception';
}),
"[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/Span.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Span",
    ()=>Span
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/diag-api.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2f$status$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/trace/status.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$time$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/core/build/esm/common/time.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$attributes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/core/build/esm/common/attributes.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$platform$2f$node$2f$performance$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/core/build/esm/platform/node/performance.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$node_modules$2f40$opentelemetry$2f$semantic$2d$conventions$2f$build$2f$esm$2f$trace$2f$SemanticAttributes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/sdk-trace-base/node_modules/@opentelemetry/semantic-conventions/build/esm/trace/SemanticAttributes.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$enums$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/enums.js [app-route] (ecmascript)");
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __assign = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__assign || function() {
    __assign = Object.assign || function(t) {
        for(var s, i = 1, n = arguments.length; i < n; i++){
            s = arguments[i];
            for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __values = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__values || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function() {
            if (o && i >= o.length) o = void 0;
            return {
                value: o && o[i++],
                done: !o
            };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__read || function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while((n === void 0 || n-- > 0) && !(r = i.next()).done)ar.push(r.value);
    } catch (error) {
        e = {
            error: error
        };
    } finally{
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        } finally{
            if (e) throw e.error;
        }
    }
    return ar;
};
var __spreadArray = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__spreadArray || function(to, from, pack) {
    if (pack || arguments.length === 2) for(var i = 0, l = from.length, ar; i < l; i++){
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
;
;
;
;
/**
 * This class represents a span.
 */ var Span = function() {
    /**
     * Constructs a new Span instance.
     *
     * @deprecated calling Span constructor directly is not supported. Please use tracer.startSpan.
     * */ function Span(parentTracer, context, spanName, spanContext, kind, parentSpanId, links, startTime, _deprecatedClock, attributes) {
        if (links === void 0) {
            links = [];
        }
        this.attributes = {};
        this.links = [];
        this.events = [];
        this._droppedAttributesCount = 0;
        this._droppedEventsCount = 0;
        this._droppedLinksCount = 0;
        this.status = {
            code: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2f$status$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SpanStatusCode"].UNSET
        };
        this.endTime = [
            0,
            0
        ];
        this._ended = false;
        this._duration = [
            -1,
            -1
        ];
        this.name = spanName;
        this._spanContext = spanContext;
        this.parentSpanId = parentSpanId;
        this.kind = kind;
        this.links = links;
        var now = Date.now();
        this._performanceStartTime = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$platform$2f$node$2f$performance$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["otperformance"].now();
        this._performanceOffset = now - (this._performanceStartTime + (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$time$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTimeOrigin"])());
        this._startTimeProvided = startTime != null;
        this.startTime = this._getTime(startTime !== null && startTime !== void 0 ? startTime : now);
        this.resource = parentTracer.resource;
        this.instrumentationLibrary = parentTracer.instrumentationLibrary;
        this._spanLimits = parentTracer.getSpanLimits();
        this._attributeValueLengthLimit = this._spanLimits.attributeValueLengthLimit || 0;
        if (attributes != null) {
            this.setAttributes(attributes);
        }
        this._spanProcessor = parentTracer.getActiveSpanProcessor();
        this._spanProcessor.onStart(this, context);
    }
    Span.prototype.spanContext = function() {
        return this._spanContext;
    };
    Span.prototype.setAttribute = function(key, value) {
        if (value == null || this._isSpanEnded()) return this;
        if (key.length === 0) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].warn("Invalid attribute key: " + key);
            return this;
        }
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$attributes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAttributeValue"])(value)) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].warn("Invalid attribute value set for key: " + key);
            return this;
        }
        if (Object.keys(this.attributes).length >= this._spanLimits.attributeCountLimit && !Object.prototype.hasOwnProperty.call(this.attributes, key)) {
            this._droppedAttributesCount++;
            return this;
        }
        this.attributes[key] = this._truncateToSize(value);
        return this;
    };
    Span.prototype.setAttributes = function(attributes) {
        var e_1, _a;
        try {
            for(var _b = __values(Object.entries(attributes)), _c = _b.next(); !_c.done; _c = _b.next()){
                var _d = __read(_c.value, 2), k = _d[0], v = _d[1];
                this.setAttribute(k, v);
            }
        } catch (e_1_1) {
            e_1 = {
                error: e_1_1
            };
        } finally{
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            } finally{
                if (e_1) throw e_1.error;
            }
        }
        return this;
    };
    /**
     *
     * @param name Span Name
     * @param [attributesOrStartTime] Span attributes or start time
     *     if type is {@type TimeInput} and 3rd param is undefined
     * @param [timeStamp] Specified time stamp for the event
     */ Span.prototype.addEvent = function(name, attributesOrStartTime, timeStamp) {
        if (this._isSpanEnded()) return this;
        if (this._spanLimits.eventCountLimit === 0) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].warn('No events allowed.');
            this._droppedEventsCount++;
            return this;
        }
        if (this.events.length >= this._spanLimits.eventCountLimit) {
            if (this._droppedEventsCount === 0) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].debug('Dropping extra events.');
            }
            this.events.shift();
            this._droppedEventsCount++;
        }
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$time$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTimeInput"])(attributesOrStartTime)) {
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$time$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTimeInput"])(timeStamp)) {
                timeStamp = attributesOrStartTime;
            }
            attributesOrStartTime = undefined;
        }
        var attributes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$attributes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeAttributes"])(attributesOrStartTime);
        this.events.push({
            name: name,
            attributes: attributes,
            time: this._getTime(timeStamp),
            droppedAttributesCount: 0
        });
        return this;
    };
    Span.prototype.addLink = function(link) {
        this.links.push(link);
        return this;
    };
    Span.prototype.addLinks = function(links) {
        var _a;
        (_a = this.links).push.apply(_a, __spreadArray([], __read(links), false));
        return this;
    };
    Span.prototype.setStatus = function(status) {
        if (this._isSpanEnded()) return this;
        this.status = __assign({}, status);
        // When using try-catch, the caught "error" is of type `any`. When then assigning `any` to `status.message`,
        // TypeScript will not error. While this can happen during use of any API, it is more common on Span#setStatus()
        // as it's likely used in a catch-block. Therefore, we validate if `status.message` is actually a string, null, or
        // undefined to avoid an incorrect type causing issues downstream.
        if (this.status.message != null && typeof status.message !== 'string') {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].warn("Dropping invalid status.message of type '" + typeof status.message + "', expected 'string'");
            delete this.status.message;
        }
        return this;
    };
    Span.prototype.updateName = function(name) {
        if (this._isSpanEnded()) return this;
        this.name = name;
        return this;
    };
    Span.prototype.end = function(endTime) {
        if (this._isSpanEnded()) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].error(this.name + " " + this._spanContext.traceId + "-" + this._spanContext.spanId + " - You can only call end() on a span once.");
            return;
        }
        this._ended = true;
        this.endTime = this._getTime(endTime);
        this._duration = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$time$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hrTimeDuration"])(this.startTime, this.endTime);
        if (this._duration[0] < 0) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].warn('Inconsistent start and end time, startTime > endTime. Setting span duration to 0ms.', this.startTime, this.endTime);
            this.endTime = this.startTime.slice();
            this._duration = [
                0,
                0
            ];
        }
        if (this._droppedEventsCount > 0) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].warn("Dropped " + this._droppedEventsCount + " events because eventCountLimit reached");
        }
        this._spanProcessor.onEnd(this);
    };
    Span.prototype._getTime = function(inp) {
        if (typeof inp === 'number' && inp <= __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$platform$2f$node$2f$performance$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["otperformance"].now()) {
            // must be a performance timestamp
            // apply correction and convert to hrtime
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$time$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hrTime"])(inp + this._performanceOffset);
        }
        if (typeof inp === 'number') {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$time$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["millisToHrTime"])(inp);
        }
        if (inp instanceof Date) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$time$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["millisToHrTime"])(inp.getTime());
        }
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$time$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTimeInputHrTime"])(inp)) {
            return inp;
        }
        if (this._startTimeProvided) {
            // if user provided a time for the start manually
            // we can't use duration to calculate event/end times
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$time$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["millisToHrTime"])(Date.now());
        }
        var msDuration = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$platform$2f$node$2f$performance$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["otperformance"].now() - this._performanceStartTime;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$time$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addHrTimes"])(this.startTime, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$time$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["millisToHrTime"])(msDuration));
    };
    Span.prototype.isRecording = function() {
        return this._ended === false;
    };
    Span.prototype.recordException = function(exception, time) {
        var attributes = {};
        if (typeof exception === 'string') {
            attributes[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$node_modules$2f40$opentelemetry$2f$semantic$2d$conventions$2f$build$2f$esm$2f$trace$2f$SemanticAttributes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SEMATTRS_EXCEPTION_MESSAGE"]] = exception;
        } else if (exception) {
            if (exception.code) {
                attributes[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$node_modules$2f40$opentelemetry$2f$semantic$2d$conventions$2f$build$2f$esm$2f$trace$2f$SemanticAttributes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SEMATTRS_EXCEPTION_TYPE"]] = exception.code.toString();
            } else if (exception.name) {
                attributes[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$node_modules$2f40$opentelemetry$2f$semantic$2d$conventions$2f$build$2f$esm$2f$trace$2f$SemanticAttributes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SEMATTRS_EXCEPTION_TYPE"]] = exception.name;
            }
            if (exception.message) {
                attributes[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$node_modules$2f40$opentelemetry$2f$semantic$2d$conventions$2f$build$2f$esm$2f$trace$2f$SemanticAttributes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SEMATTRS_EXCEPTION_MESSAGE"]] = exception.message;
            }
            if (exception.stack) {
                attributes[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$node_modules$2f40$opentelemetry$2f$semantic$2d$conventions$2f$build$2f$esm$2f$trace$2f$SemanticAttributes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SEMATTRS_EXCEPTION_STACKTRACE"]] = exception.stack;
            }
        }
        // these are minimum requirements from spec
        if (attributes[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$node_modules$2f40$opentelemetry$2f$semantic$2d$conventions$2f$build$2f$esm$2f$trace$2f$SemanticAttributes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SEMATTRS_EXCEPTION_TYPE"]] || attributes[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$node_modules$2f40$opentelemetry$2f$semantic$2d$conventions$2f$build$2f$esm$2f$trace$2f$SemanticAttributes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SEMATTRS_EXCEPTION_MESSAGE"]]) {
            this.addEvent(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$enums$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ExceptionEventName"], attributes, time);
        } else {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].warn("Failed to record an exception " + exception);
        }
    };
    Object.defineProperty(Span.prototype, "duration", {
        get: function() {
            return this._duration;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Span.prototype, "ended", {
        get: function() {
            return this._ended;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Span.prototype, "droppedAttributesCount", {
        get: function() {
            return this._droppedAttributesCount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Span.prototype, "droppedEventsCount", {
        get: function() {
            return this._droppedEventsCount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Span.prototype, "droppedLinksCount", {
        get: function() {
            return this._droppedLinksCount;
        },
        enumerable: false,
        configurable: true
    });
    Span.prototype._isSpanEnded = function() {
        if (this._ended) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].warn("Can not execute the operation on ended Span {traceId: " + this._spanContext.traceId + ", spanId: " + this._spanContext.spanId + "}");
        }
        return this._ended;
    };
    // Utility function to truncate given value within size
    // for value type of string, will truncate to given limit
    // for type of non-string, will return same value
    Span.prototype._truncateToLimitUtil = function(value, limit) {
        if (value.length <= limit) {
            return value;
        }
        return value.substring(0, limit);
    };
    /**
     * If the given attribute value is of type string and has more characters than given {@code attributeValueLengthLimit} then
     * return string with truncated to {@code attributeValueLengthLimit} characters
     *
     * If the given attribute value is array of strings then
     * return new array of strings with each element truncated to {@code attributeValueLengthLimit} characters
     *
     * Otherwise return same Attribute {@code value}
     *
     * @param value Attribute value
     * @returns truncated attribute value if required, otherwise same value
     */ Span.prototype._truncateToSize = function(value) {
        var _this = this;
        var limit = this._attributeValueLengthLimit;
        // Check limit
        if (limit <= 0) {
            // Negative values are invalid, so do not truncate
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].warn("Attribute value limit must be positive, got " + limit);
            return value;
        }
        // String
        if (typeof value === 'string') {
            return this._truncateToLimitUtil(value, limit);
        }
        // Array of strings
        if (Array.isArray(value)) {
            return value.map(function(val) {
                return typeof val === 'string' ? _this._truncateToLimitUtil(val, limit) : val;
            });
        }
        // Other types, no need to apply value length limit
        return value;
    };
    return Span;
}();
;
}),
"[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/sampler/AlwaysOffSampler.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AlwaysOffSampler",
    ()=>AlwaysOffSampler
]);
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$Sampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/Sampler.js [app-route] (ecmascript)");
;
/** Sampler that samples no traces. */ var AlwaysOffSampler = function() {
    function AlwaysOffSampler() {}
    AlwaysOffSampler.prototype.shouldSample = function() {
        return {
            decision: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$Sampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SamplingDecision"].NOT_RECORD
        };
    };
    AlwaysOffSampler.prototype.toString = function() {
        return 'AlwaysOffSampler';
    };
    return AlwaysOffSampler;
}();
;
}),
"[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/sampler/AlwaysOnSampler.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AlwaysOnSampler",
    ()=>AlwaysOnSampler
]);
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$Sampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/Sampler.js [app-route] (ecmascript)");
;
/** Sampler that samples all traces. */ var AlwaysOnSampler = function() {
    function AlwaysOnSampler() {}
    AlwaysOnSampler.prototype.shouldSample = function() {
        return {
            decision: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$Sampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SamplingDecision"].RECORD_AND_SAMPLED
        };
    };
    AlwaysOnSampler.prototype.toString = function() {
        return 'AlwaysOnSampler';
    };
    return AlwaysOnSampler;
}();
;
}),
"[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/sampler/ParentBasedSampler.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ParentBasedSampler",
    ()=>ParentBasedSampler
]);
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2f$spancontext$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/trace/spancontext-utils.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2f$trace_flags$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/trace/trace_flags.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/trace-api.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$global$2d$error$2d$handler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/core/build/esm/common/global-error-handler.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$sampler$2f$AlwaysOffSampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/sampler/AlwaysOffSampler.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$sampler$2f$AlwaysOnSampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/sampler/AlwaysOnSampler.js [app-route] (ecmascript)");
;
;
;
;
/**
 * A composite sampler that either respects the parent span's sampling decision
 * or delegates to `delegateSampler` for root spans.
 */ var ParentBasedSampler = function() {
    function ParentBasedSampler(config) {
        var _a, _b, _c, _d;
        this._root = config.root;
        if (!this._root) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$global$2d$error$2d$handler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["globalErrorHandler"])(new Error('ParentBasedSampler must have a root sampler configured'));
            this._root = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$sampler$2f$AlwaysOnSampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AlwaysOnSampler"]();
        }
        this._remoteParentSampled = (_a = config.remoteParentSampled) !== null && _a !== void 0 ? _a : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$sampler$2f$AlwaysOnSampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AlwaysOnSampler"]();
        this._remoteParentNotSampled = (_b = config.remoteParentNotSampled) !== null && _b !== void 0 ? _b : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$sampler$2f$AlwaysOffSampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AlwaysOffSampler"]();
        this._localParentSampled = (_c = config.localParentSampled) !== null && _c !== void 0 ? _c : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$sampler$2f$AlwaysOnSampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AlwaysOnSampler"]();
        this._localParentNotSampled = (_d = config.localParentNotSampled) !== null && _d !== void 0 ? _d : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$sampler$2f$AlwaysOffSampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AlwaysOffSampler"]();
    }
    ParentBasedSampler.prototype.shouldSample = function(context, traceId, spanName, spanKind, attributes, links) {
        var parentContext = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trace"].getSpanContext(context);
        if (!parentContext || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2f$spancontext$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSpanContextValid"])(parentContext)) {
            return this._root.shouldSample(context, traceId, spanName, spanKind, attributes, links);
        }
        if (parentContext.isRemote) {
            if (parentContext.traceFlags & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2f$trace_flags$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TraceFlags"].SAMPLED) {
                return this._remoteParentSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
            }
            return this._remoteParentNotSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
        }
        if (parentContext.traceFlags & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2f$trace_flags$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TraceFlags"].SAMPLED) {
            return this._localParentSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
        }
        return this._localParentNotSampled.shouldSample(context, traceId, spanName, spanKind, attributes, links);
    };
    ParentBasedSampler.prototype.toString = function() {
        return "ParentBased{root=" + this._root.toString() + ", remoteParentSampled=" + this._remoteParentSampled.toString() + ", remoteParentNotSampled=" + this._remoteParentNotSampled.toString() + ", localParentSampled=" + this._localParentSampled.toString() + ", localParentNotSampled=" + this._localParentNotSampled.toString() + "}";
    };
    return ParentBasedSampler;
}();
;
}),
"[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/sampler/TraceIdRatioBasedSampler.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TraceIdRatioBasedSampler",
    ()=>TraceIdRatioBasedSampler
]);
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2f$spancontext$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/trace/spancontext-utils.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$Sampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/Sampler.js [app-route] (ecmascript)");
;
;
/** Sampler that samples a given fraction of traces based of trace id deterministically. */ var TraceIdRatioBasedSampler = function() {
    function TraceIdRatioBasedSampler(_ratio) {
        if (_ratio === void 0) {
            _ratio = 0;
        }
        this._ratio = _ratio;
        this._ratio = this._normalize(_ratio);
        this._upperBound = Math.floor(this._ratio * 0xffffffff);
    }
    TraceIdRatioBasedSampler.prototype.shouldSample = function(context, traceId) {
        return {
            decision: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2f$spancontext$2d$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isValidTraceId"])(traceId) && this._accumulate(traceId) < this._upperBound ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$Sampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SamplingDecision"].RECORD_AND_SAMPLED : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$Sampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SamplingDecision"].NOT_RECORD
        };
    };
    TraceIdRatioBasedSampler.prototype.toString = function() {
        return "TraceIdRatioBased{" + this._ratio + "}";
    };
    TraceIdRatioBasedSampler.prototype._normalize = function(ratio) {
        if (typeof ratio !== 'number' || isNaN(ratio)) return 0;
        return ratio >= 1 ? 1 : ratio <= 0 ? 0 : ratio;
    };
    TraceIdRatioBasedSampler.prototype._accumulate = function(traceId) {
        var accumulation = 0;
        for(var i = 0; i < traceId.length / 8; i++){
            var pos = i * 8;
            var part = parseInt(traceId.slice(pos, pos + 8), 16);
            accumulation = (accumulation ^ part) >>> 0;
        }
        return accumulation;
    };
    return TraceIdRatioBasedSampler;
}();
;
}),
"[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/config.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildSamplerFromEnv",
    ()=>buildSamplerFromEnv,
    "loadDefaultConfig",
    ()=>loadDefaultConfig
]);
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/diag-api.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$platform$2f$node$2f$environment$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/core/build/esm/platform/node/environment.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$utils$2f$sampling$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/core/build/esm/utils/sampling.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$sampler$2f$AlwaysOffSampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/sampler/AlwaysOffSampler.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$sampler$2f$AlwaysOnSampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/sampler/AlwaysOnSampler.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$sampler$2f$ParentBasedSampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/sampler/ParentBasedSampler.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$sampler$2f$TraceIdRatioBasedSampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/sampler/TraceIdRatioBasedSampler.js [app-route] (ecmascript)");
;
;
;
;
;
;
var FALLBACK_OTEL_TRACES_SAMPLER = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$utils$2f$sampling$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TracesSamplerValues"].AlwaysOn;
var DEFAULT_RATIO = 1;
function loadDefaultConfig() {
    var env = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$platform$2f$node$2f$environment$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEnv"])();
    return {
        sampler: buildSamplerFromEnv(env),
        forceFlushTimeoutMillis: 30000,
        generalLimits: {
            attributeValueLengthLimit: env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT,
            attributeCountLimit: env.OTEL_ATTRIBUTE_COUNT_LIMIT
        },
        spanLimits: {
            attributeValueLengthLimit: env.OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT,
            attributeCountLimit: env.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT,
            linkCountLimit: env.OTEL_SPAN_LINK_COUNT_LIMIT,
            eventCountLimit: env.OTEL_SPAN_EVENT_COUNT_LIMIT,
            attributePerEventCountLimit: env.OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT,
            attributePerLinkCountLimit: env.OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT
        },
        mergeResourceWithDefaults: true
    };
}
function buildSamplerFromEnv(environment) {
    if (environment === void 0) {
        environment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$platform$2f$node$2f$environment$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEnv"])();
    }
    switch(environment.OTEL_TRACES_SAMPLER){
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$utils$2f$sampling$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TracesSamplerValues"].AlwaysOn:
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$sampler$2f$AlwaysOnSampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AlwaysOnSampler"]();
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$utils$2f$sampling$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TracesSamplerValues"].AlwaysOff:
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$sampler$2f$AlwaysOffSampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AlwaysOffSampler"]();
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$utils$2f$sampling$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TracesSamplerValues"].ParentBasedAlwaysOn:
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$sampler$2f$ParentBasedSampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ParentBasedSampler"]({
                root: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$sampler$2f$AlwaysOnSampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AlwaysOnSampler"]()
            });
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$utils$2f$sampling$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TracesSamplerValues"].ParentBasedAlwaysOff:
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$sampler$2f$ParentBasedSampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ParentBasedSampler"]({
                root: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$sampler$2f$AlwaysOffSampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AlwaysOffSampler"]()
            });
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$utils$2f$sampling$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TracesSamplerValues"].TraceIdRatio:
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$sampler$2f$TraceIdRatioBasedSampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TraceIdRatioBasedSampler"](getSamplerProbabilityFromEnv(environment));
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$utils$2f$sampling$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TracesSamplerValues"].ParentBasedTraceIdRatio:
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$sampler$2f$ParentBasedSampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ParentBasedSampler"]({
                root: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$sampler$2f$TraceIdRatioBasedSampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TraceIdRatioBasedSampler"](getSamplerProbabilityFromEnv(environment))
            });
        default:
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].error("OTEL_TRACES_SAMPLER value \"" + environment.OTEL_TRACES_SAMPLER + " invalid, defaulting to " + FALLBACK_OTEL_TRACES_SAMPLER + "\".");
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$sampler$2f$AlwaysOnSampler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AlwaysOnSampler"]();
    }
}
function getSamplerProbabilityFromEnv(environment) {
    if (environment.OTEL_TRACES_SAMPLER_ARG === undefined || environment.OTEL_TRACES_SAMPLER_ARG === '') {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].error("OTEL_TRACES_SAMPLER_ARG is blank, defaulting to " + DEFAULT_RATIO + ".");
        return DEFAULT_RATIO;
    }
    var probability = Number(environment.OTEL_TRACES_SAMPLER_ARG);
    if (isNaN(probability)) {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].error("OTEL_TRACES_SAMPLER_ARG=" + environment.OTEL_TRACES_SAMPLER_ARG + " was given, but it is invalid, defaulting to " + DEFAULT_RATIO + ".");
        return DEFAULT_RATIO;
    }
    if (probability < 0 || probability > 1) {
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].error("OTEL_TRACES_SAMPLER_ARG=" + environment.OTEL_TRACES_SAMPLER_ARG + " was given, but it is out of range ([0..1]), defaulting to " + DEFAULT_RATIO + ".");
        return DEFAULT_RATIO;
    }
    return probability;
}
}),
"[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/utility.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mergeConfig",
    ()=>mergeConfig,
    "reconfigureLimits",
    ()=>reconfigureLimits
]);
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$config$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/config.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$utils$2f$environment$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/core/build/esm/utils/environment.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$platform$2f$node$2f$environment$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/core/build/esm/platform/node/environment.js [app-route] (ecmascript)");
;
;
function mergeConfig(userConfig) {
    var perInstanceDefaults = {
        sampler: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$config$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildSamplerFromEnv"])()
    };
    var DEFAULT_CONFIG = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$config$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadDefaultConfig"])();
    var target = Object.assign({}, DEFAULT_CONFIG, perInstanceDefaults, userConfig);
    target.generalLimits = Object.assign({}, DEFAULT_CONFIG.generalLimits, userConfig.generalLimits || {});
    target.spanLimits = Object.assign({}, DEFAULT_CONFIG.spanLimits, userConfig.spanLimits || {});
    return target;
}
function reconfigureLimits(userConfig) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var spanLimits = Object.assign({}, userConfig.spanLimits);
    var parsedEnvConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$platform$2f$node$2f$environment$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEnvWithoutDefaults"])();
    /**
     * Reassign span attribute count limit to use first non null value defined by user or use default value
     */ spanLimits.attributeCountLimit = (_f = (_e = (_d = (_b = (_a = userConfig.spanLimits) === null || _a === void 0 ? void 0 : _a.attributeCountLimit) !== null && _b !== void 0 ? _b : (_c = userConfig.generalLimits) === null || _c === void 0 ? void 0 : _c.attributeCountLimit) !== null && _d !== void 0 ? _d : parsedEnvConfig.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT) !== null && _e !== void 0 ? _e : parsedEnvConfig.OTEL_ATTRIBUTE_COUNT_LIMIT) !== null && _f !== void 0 ? _f : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$utils$2f$environment$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_ATTRIBUTE_COUNT_LIMIT"];
    /**
     * Reassign span attribute value length limit to use first non null value defined by user or use default value
     */ spanLimits.attributeValueLengthLimit = (_m = (_l = (_k = (_h = (_g = userConfig.spanLimits) === null || _g === void 0 ? void 0 : _g.attributeValueLengthLimit) !== null && _h !== void 0 ? _h : (_j = userConfig.generalLimits) === null || _j === void 0 ? void 0 : _j.attributeValueLengthLimit) !== null && _k !== void 0 ? _k : parsedEnvConfig.OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT) !== null && _l !== void 0 ? _l : parsedEnvConfig.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT) !== null && _m !== void 0 ? _m : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$utils$2f$environment$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT"];
    return Object.assign({}, userConfig, {
        spanLimits: spanLimits
    });
}
}),
"[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/platform/node/RandomIdGenerator.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RandomIdGenerator",
    ()=>RandomIdGenerator
]);
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var SPAN_ID_BYTES = 8;
var TRACE_ID_BYTES = 16;
var RandomIdGenerator = function() {
    function RandomIdGenerator() {
        /**
         * Returns a random 16-byte trace ID formatted/encoded as a 32 lowercase hex
         * characters corresponding to 128 bits.
         */ this.generateTraceId = getIdGenerator(TRACE_ID_BYTES);
        /**
         * Returns a random 8-byte span ID formatted/encoded as a 16 lowercase hex
         * characters corresponding to 64 bits.
         */ this.generateSpanId = getIdGenerator(SPAN_ID_BYTES);
    }
    return RandomIdGenerator;
}();
;
var SHARED_BUFFER = Buffer.allocUnsafe(TRACE_ID_BYTES);
function getIdGenerator(bytes) {
    return function generateId() {
        for(var i = 0; i < bytes / 4; i++){
            // unsigned right shift drops decimal part of the number
            // it is required because if a number between 2**32 and 2**32 - 1 is generated, an out of range error is thrown by writeUInt32BE
            SHARED_BUFFER.writeUInt32BE(Math.random() * Math.pow(2, 32) >>> 0, i * 4);
        }
        // If buffer is all 0, set the last byte to 1 to guarantee a valid w3c id is generated
        for(var i = 0; i < bytes; i++){
            if (SHARED_BUFFER[i] > 0) {
                break;
            } else if (i === bytes - 1) {
                SHARED_BUFFER[bytes - 1] = 1;
            }
        }
        return SHARED_BUFFER.toString('hex', 0, bytes);
    };
}
}),
"[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/Tracer.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Tracer",
    ()=>Tracer
]);
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$context$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/context-api.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/trace-api.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2f$span_kind$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/trace/span_kind.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2f$SamplingResult$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/trace/SamplingResult.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2f$trace_flags$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/trace/trace_flags.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/diag-api.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2f$invalid$2d$span$2d$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/trace/invalid-span-constants.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$attributes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/core/build/esm/common/attributes.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$trace$2f$suppress$2d$tracing$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/core/build/esm/trace/suppress-tracing.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$Span$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/Span.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$utility$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/utility.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$platform$2f$node$2f$RandomIdGenerator$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/platform/node/RandomIdGenerator.js [app-route] (ecmascript)");
;
;
;
;
;
/**
 * This class represents a basic tracer.
 */ var Tracer = function() {
    /**
     * Constructs a new Tracer instance.
     */ function Tracer(instrumentationLibrary, config, _tracerProvider) {
        this._tracerProvider = _tracerProvider;
        var localConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$utility$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mergeConfig"])(config);
        this._sampler = localConfig.sampler;
        this._generalLimits = localConfig.generalLimits;
        this._spanLimits = localConfig.spanLimits;
        this._idGenerator = config.idGenerator || new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$platform$2f$node$2f$RandomIdGenerator$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RandomIdGenerator"]();
        this.resource = _tracerProvider.resource;
        this.instrumentationLibrary = instrumentationLibrary;
    }
    /**
     * Starts a new Span or returns the default NoopSpan based on the sampling
     * decision.
     */ Tracer.prototype.startSpan = function(name, options, context) {
        var _a, _b, _c;
        if (options === void 0) {
            options = {};
        }
        if (context === void 0) {
            context = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$context$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["context"].active();
        }
        // remove span from context in case a root span is requested via options
        if (options.root) {
            context = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trace"].deleteSpan(context);
        }
        var parentSpan = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trace"].getSpan(context);
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$trace$2f$suppress$2d$tracing$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTracingSuppressed"])(context)) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].debug('Instrumentation suppressed, returning Noop Span');
            var nonRecordingSpan = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trace"].wrapSpanContext(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2f$invalid$2d$span$2d$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["INVALID_SPAN_CONTEXT"]);
            return nonRecordingSpan;
        }
        var parentSpanContext = parentSpan === null || parentSpan === void 0 ? void 0 : parentSpan.spanContext();
        var spanId = this._idGenerator.generateSpanId();
        var traceId;
        var traceState;
        var parentSpanId;
        if (!parentSpanContext || !__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trace"].isSpanContextValid(parentSpanContext)) {
            // New root span.
            traceId = this._idGenerator.generateTraceId();
        } else {
            // New child span.
            traceId = parentSpanContext.traceId;
            traceState = parentSpanContext.traceState;
            parentSpanId = parentSpanContext.spanId;
        }
        var spanKind = (_a = options.kind) !== null && _a !== void 0 ? _a : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2f$span_kind$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SpanKind"].INTERNAL;
        var links = ((_b = options.links) !== null && _b !== void 0 ? _b : []).map(function(link) {
            return {
                context: link.context,
                attributes: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$attributes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeAttributes"])(link.attributes)
            };
        });
        var attributes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$attributes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeAttributes"])(options.attributes);
        // make sampling decision
        var samplingResult = this._sampler.shouldSample(context, traceId, name, spanKind, attributes, links);
        traceState = (_c = samplingResult.traceState) !== null && _c !== void 0 ? _c : traceState;
        var traceFlags = samplingResult.decision === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2f$SamplingResult$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SamplingDecision"].RECORD_AND_SAMPLED ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2f$trace_flags$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TraceFlags"].SAMPLED : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2f$trace_flags$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TraceFlags"].NONE;
        var spanContext = {
            traceId: traceId,
            spanId: spanId,
            traceFlags: traceFlags,
            traceState: traceState
        };
        if (samplingResult.decision === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2f$SamplingResult$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SamplingDecision"].NOT_RECORD) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].debug('Recording is off, propagating context in a non-recording span');
            var nonRecordingSpan = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trace"].wrapSpanContext(spanContext);
            return nonRecordingSpan;
        }
        // Set initial span attributes. The attributes object may have been mutated
        // by the sampler, so we sanitize the merged attributes before setting them.
        var initAttributes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$attributes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeAttributes"])(Object.assign(attributes, samplingResult.attributes));
        var span = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$Span$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Span"](this, context, name, spanContext, spanKind, parentSpanId, links, options.startTime, undefined, initAttributes);
        return span;
    };
    Tracer.prototype.startActiveSpan = function(name, arg2, arg3, arg4) {
        var opts;
        var ctx;
        var fn;
        if (arguments.length < 2) {
            return;
        } else if (arguments.length === 2) {
            fn = arg2;
        } else if (arguments.length === 3) {
            opts = arg2;
            fn = arg3;
        } else {
            opts = arg2;
            ctx = arg3;
            fn = arg4;
        }
        var parentContext = ctx !== null && ctx !== void 0 ? ctx : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$context$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["context"].active();
        var span = this.startSpan(name, opts, parentContext);
        var contextWithSpanSet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trace"].setSpan(parentContext, span);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$context$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["context"].with(contextWithSpanSet, fn, undefined, span);
    };
    /** Returns the active {@link GeneralLimits}. */ Tracer.prototype.getGeneralLimits = function() {
        return this._generalLimits;
    };
    /** Returns the active {@link SpanLimits}. */ Tracer.prototype.getSpanLimits = function() {
        return this._spanLimits;
    };
    Tracer.prototype.getActiveSpanProcessor = function() {
        return this._tracerProvider.getActiveSpanProcessor();
    };
    return Tracer;
}();
;
}),
"[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/MultiSpanProcessor.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MultiSpanProcessor",
    ()=>MultiSpanProcessor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$global$2d$error$2d$handler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/core/build/esm/common/global-error-handler.js [app-route] (ecmascript)");
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __values = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__values || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function() {
            if (o && i >= o.length) o = void 0;
            return {
                value: o && o[i++],
                done: !o
            };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
;
/**
 * Implementation of the {@link SpanProcessor} that simply forwards all
 * received events to a list of {@link SpanProcessor}s.
 */ var MultiSpanProcessor = function() {
    function MultiSpanProcessor(_spanProcessors) {
        this._spanProcessors = _spanProcessors;
    }
    MultiSpanProcessor.prototype.forceFlush = function() {
        var e_1, _a;
        var promises = [];
        try {
            for(var _b = __values(this._spanProcessors), _c = _b.next(); !_c.done; _c = _b.next()){
                var spanProcessor = _c.value;
                promises.push(spanProcessor.forceFlush());
            }
        } catch (e_1_1) {
            e_1 = {
                error: e_1_1
            };
        } finally{
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            } finally{
                if (e_1) throw e_1.error;
            }
        }
        return new Promise(function(resolve) {
            Promise.all(promises).then(function() {
                resolve();
            }).catch(function(error) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$global$2d$error$2d$handler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["globalErrorHandler"])(error || new Error('MultiSpanProcessor: forceFlush failed'));
                resolve();
            });
        });
    };
    MultiSpanProcessor.prototype.onStart = function(span, context) {
        var e_2, _a;
        try {
            for(var _b = __values(this._spanProcessors), _c = _b.next(); !_c.done; _c = _b.next()){
                var spanProcessor = _c.value;
                spanProcessor.onStart(span, context);
            }
        } catch (e_2_1) {
            e_2 = {
                error: e_2_1
            };
        } finally{
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            } finally{
                if (e_2) throw e_2.error;
            }
        }
    };
    MultiSpanProcessor.prototype.onEnd = function(span) {
        var e_3, _a;
        try {
            for(var _b = __values(this._spanProcessors), _c = _b.next(); !_c.done; _c = _b.next()){
                var spanProcessor = _c.value;
                spanProcessor.onEnd(span);
            }
        } catch (e_3_1) {
            e_3 = {
                error: e_3_1
            };
        } finally{
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            } finally{
                if (e_3) throw e_3.error;
            }
        }
    };
    MultiSpanProcessor.prototype.shutdown = function() {
        var e_4, _a;
        var promises = [];
        try {
            for(var _b = __values(this._spanProcessors), _c = _b.next(); !_c.done; _c = _b.next()){
                var spanProcessor = _c.value;
                promises.push(spanProcessor.shutdown());
            }
        } catch (e_4_1) {
            e_4 = {
                error: e_4_1
            };
        } finally{
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            } finally{
                if (e_4) throw e_4.error;
            }
        }
        return new Promise(function(resolve, reject) {
            Promise.all(promises).then(function() {
                resolve();
            }, reject);
        });
    };
    return MultiSpanProcessor;
}();
;
}),
"[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/export/NoopSpanProcessor.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NoopSpanProcessor",
    ()=>NoopSpanProcessor
]);
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /** No-op implementation of SpanProcessor */ var NoopSpanProcessor = function() {
    function NoopSpanProcessor() {}
    NoopSpanProcessor.prototype.onStart = function(_span, _context) {};
    NoopSpanProcessor.prototype.onEnd = function(_span) {};
    NoopSpanProcessor.prototype.shutdown = function() {
        return Promise.resolve();
    };
    NoopSpanProcessor.prototype.forceFlush = function() {
        return Promise.resolve();
    };
    return NoopSpanProcessor;
}();
;
}),
"[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/export/BatchSpanProcessorBase.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BatchSpanProcessorBase",
    ()=>BatchSpanProcessorBase
]);
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$context$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/context-api.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/diag-api.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2f$trace_flags$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/trace/trace_flags.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$utils$2f$callback$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/core/build/esm/utils/callback.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$ExportResult$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/core/build/esm/ExportResult.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$platform$2f$node$2f$environment$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/core/build/esm/platform/node/environment.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$global$2d$error$2d$handler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/core/build/esm/common/global-error-handler.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$trace$2f$suppress$2d$tracing$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/core/build/esm/trace/suppress-tracing.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$platform$2f$node$2f$timer$2d$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/core/build/esm/platform/node/timer-util.js [app-route] (ecmascript)");
;
;
/**
 * Implementation of the {@link SpanProcessor} that batches spans exported by
 * the SDK then pushes them to the exporter pipeline.
 */ var BatchSpanProcessorBase = function() {
    function BatchSpanProcessorBase(_exporter, config) {
        this._exporter = _exporter;
        this._isExporting = false;
        this._finishedSpans = [];
        this._droppedSpansCount = 0;
        var env = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$platform$2f$node$2f$environment$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEnv"])();
        this._maxExportBatchSize = typeof (config === null || config === void 0 ? void 0 : config.maxExportBatchSize) === 'number' ? config.maxExportBatchSize : env.OTEL_BSP_MAX_EXPORT_BATCH_SIZE;
        this._maxQueueSize = typeof (config === null || config === void 0 ? void 0 : config.maxQueueSize) === 'number' ? config.maxQueueSize : env.OTEL_BSP_MAX_QUEUE_SIZE;
        this._scheduledDelayMillis = typeof (config === null || config === void 0 ? void 0 : config.scheduledDelayMillis) === 'number' ? config.scheduledDelayMillis : env.OTEL_BSP_SCHEDULE_DELAY;
        this._exportTimeoutMillis = typeof (config === null || config === void 0 ? void 0 : config.exportTimeoutMillis) === 'number' ? config.exportTimeoutMillis : env.OTEL_BSP_EXPORT_TIMEOUT;
        this._shutdownOnce = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$utils$2f$callback$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BindOnceFuture"](this._shutdown, this);
        if (this._maxExportBatchSize > this._maxQueueSize) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].warn('BatchSpanProcessor: maxExportBatchSize must be smaller or equal to maxQueueSize, setting maxExportBatchSize to match maxQueueSize');
            this._maxExportBatchSize = this._maxQueueSize;
        }
    }
    BatchSpanProcessorBase.prototype.forceFlush = function() {
        if (this._shutdownOnce.isCalled) {
            return this._shutdownOnce.promise;
        }
        return this._flushAll();
    };
    // does nothing.
    BatchSpanProcessorBase.prototype.onStart = function(_span, _parentContext) {};
    BatchSpanProcessorBase.prototype.onEnd = function(span) {
        if (this._shutdownOnce.isCalled) {
            return;
        }
        if ((span.spanContext().traceFlags & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2f$trace_flags$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TraceFlags"].SAMPLED) === 0) {
            return;
        }
        this._addToBuffer(span);
    };
    BatchSpanProcessorBase.prototype.shutdown = function() {
        return this._shutdownOnce.call();
    };
    BatchSpanProcessorBase.prototype._shutdown = function() {
        var _this = this;
        return Promise.resolve().then(function() {
            return _this.onShutdown();
        }).then(function() {
            return _this._flushAll();
        }).then(function() {
            return _this._exporter.shutdown();
        });
    };
    /** Add a span in the buffer. */ BatchSpanProcessorBase.prototype._addToBuffer = function(span) {
        if (this._finishedSpans.length >= this._maxQueueSize) {
            // limit reached, drop span
            if (this._droppedSpansCount === 0) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].debug('maxQueueSize reached, dropping spans');
            }
            this._droppedSpansCount++;
            return;
        }
        if (this._droppedSpansCount > 0) {
            // some spans were dropped, log once with count of spans dropped
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].warn("Dropped " + this._droppedSpansCount + " spans because maxQueueSize reached");
            this._droppedSpansCount = 0;
        }
        this._finishedSpans.push(span);
        this._maybeStartTimer();
    };
    /**
     * Send all spans to the exporter respecting the batch size limit
     * This function is used only on forceFlush or shutdown,
     * for all other cases _flush should be used
     * */ BatchSpanProcessorBase.prototype._flushAll = function() {
        var _this = this;
        return new Promise(function(resolve, reject) {
            var promises = [];
            // calculate number of batches
            var count = Math.ceil(_this._finishedSpans.length / _this._maxExportBatchSize);
            for(var i = 0, j = count; i < j; i++){
                promises.push(_this._flushOneBatch());
            }
            Promise.all(promises).then(function() {
                resolve();
            }).catch(reject);
        });
    };
    BatchSpanProcessorBase.prototype._flushOneBatch = function() {
        var _this = this;
        this._clearTimer();
        if (this._finishedSpans.length === 0) {
            return Promise.resolve();
        }
        return new Promise(function(resolve, reject) {
            var timer = setTimeout(function() {
                // don't wait anymore for export, this way the next batch can start
                reject(new Error('Timeout'));
            }, _this._exportTimeoutMillis);
            // prevent downstream exporter calls from generating spans
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$context$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["context"].with((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$trace$2f$suppress$2d$tracing$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["suppressTracing"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$context$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["context"].active()), function() {
                // Reset the finished spans buffer here because the next invocations of the _flush method
                // could pass the same finished spans to the exporter if the buffer is cleared
                // outside the execution of this callback.
                var spans;
                if (_this._finishedSpans.length <= _this._maxExportBatchSize) {
                    spans = _this._finishedSpans;
                    _this._finishedSpans = [];
                } else {
                    spans = _this._finishedSpans.splice(0, _this._maxExportBatchSize);
                }
                var doExport = function() {
                    return _this._exporter.export(spans, function(result) {
                        var _a;
                        clearTimeout(timer);
                        if (result.code === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$ExportResult$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ExportResultCode"].SUCCESS) {
                            resolve();
                        } else {
                            reject((_a = result.error) !== null && _a !== void 0 ? _a : new Error('BatchSpanProcessor: span export failed'));
                        }
                    });
                };
                var pendingResources = null;
                for(var i = 0, len = spans.length; i < len; i++){
                    var span = spans[i];
                    if (span.resource.asyncAttributesPending && span.resource.waitForAsyncAttributes) {
                        pendingResources !== null && pendingResources !== void 0 ? pendingResources : pendingResources = [];
                        pendingResources.push(span.resource.waitForAsyncAttributes());
                    }
                }
                // Avoid scheduling a promise to make the behavior more predictable and easier to test
                if (pendingResources === null) {
                    doExport();
                } else {
                    Promise.all(pendingResources).then(doExport, function(err) {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$global$2d$error$2d$handler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["globalErrorHandler"])(err);
                        reject(err);
                    });
                }
            });
        });
    };
    BatchSpanProcessorBase.prototype._maybeStartTimer = function() {
        var _this = this;
        if (this._isExporting) return;
        var flush = function() {
            _this._isExporting = true;
            _this._flushOneBatch().finally(function() {
                _this._isExporting = false;
                if (_this._finishedSpans.length > 0) {
                    _this._clearTimer();
                    _this._maybeStartTimer();
                }
            }).catch(function(e) {
                _this._isExporting = false;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$common$2f$global$2d$error$2d$handler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["globalErrorHandler"])(e);
            });
        };
        // we only wait if the queue doesn't have enough elements yet
        if (this._finishedSpans.length >= this._maxExportBatchSize) {
            return flush();
        }
        if (this._timer !== undefined) return;
        this._timer = setTimeout(function() {
            return flush();
        }, this._scheduledDelayMillis);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$platform$2f$node$2f$timer$2d$util$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unrefTimer"])(this._timer);
    };
    BatchSpanProcessorBase.prototype._clearTimer = function() {
        if (this._timer !== undefined) {
            clearTimeout(this._timer);
            this._timer = undefined;
        }
    };
    return BatchSpanProcessorBase;
}();
;
}),
"[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/platform/node/export/BatchSpanProcessor.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BatchSpanProcessor",
    ()=>BatchSpanProcessor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$export$2f$BatchSpanProcessorBase$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/export/BatchSpanProcessorBase.js [app-route] (ecmascript)");
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __extends = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__extends || function() {
    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || ({
            __proto__: []
        }) instanceof Array && function(d, b) {
            d.__proto__ = b;
        } || function(d, b) {
            for(var p in b)if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
        return extendStatics(d, b);
    };
    return function(d, b) {
        if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
}();
;
var BatchSpanProcessor = function(_super) {
    __extends(BatchSpanProcessor, _super);
    function BatchSpanProcessor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BatchSpanProcessor.prototype.onShutdown = function() {};
    return BatchSpanProcessor;
}(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$export$2f$BatchSpanProcessorBase$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BatchSpanProcessorBase"]);
;
}),
"[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/BasicTracerProvider.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BasicTracerProvider",
    ()=>BasicTracerProvider,
    "ForceFlushState",
    ()=>ForceFlushState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$context$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/context-api.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/diag-api.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$propagation$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/propagation-api.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/trace-api.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$propagation$2f$composite$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/core/build/esm/propagation/composite.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$baggage$2f$propagation$2f$W3CBaggagePropagator$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/core/build/esm/baggage/propagation/W3CBaggagePropagator.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$trace$2f$W3CTraceContextPropagator$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/core/build/esm/trace/W3CTraceContextPropagator.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$platform$2f$node$2f$environment$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/core/build/esm/platform/node/environment.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$utils$2f$merge$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/core/build/esm/utils/merge.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$resources$2f$build$2f$esm$2f$Resource$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/resources/build/esm/Resource.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$Tracer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/Tracer.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$config$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/config.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$MultiSpanProcessor$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/MultiSpanProcessor.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$export$2f$NoopSpanProcessor$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/export/NoopSpanProcessor.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$platform$2f$node$2f$export$2f$BatchSpanProcessor$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/platform/node/export/BatchSpanProcessor.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$utility$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/sdk-trace-base/build/esm/utility.js [app-route] (ecmascript)");
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __read = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__read || function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while((n === void 0 || n-- > 0) && !(r = i.next()).done)ar.push(r.value);
    } catch (error) {
        e = {
            error: error
        };
    } finally{
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        } finally{
            if (e) throw e.error;
        }
    }
    return ar;
};
var __spreadArray = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__spreadArray || function(to, from, pack) {
    if (pack || arguments.length === 2) for(var i = 0, l = from.length, ar; i < l; i++){
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
;
;
;
;
;
;
;
;
;
var ForceFlushState;
(function(ForceFlushState) {
    ForceFlushState[ForceFlushState["resolved"] = 0] = "resolved";
    ForceFlushState[ForceFlushState["timeout"] = 1] = "timeout";
    ForceFlushState[ForceFlushState["error"] = 2] = "error";
    ForceFlushState[ForceFlushState["unresolved"] = 3] = "unresolved";
})(ForceFlushState || (ForceFlushState = {}));
/**
 * This class represents a basic tracer provider which platform libraries can extend
 */ var BasicTracerProvider = function() {
    function BasicTracerProvider(config) {
        if (config === void 0) {
            config = {};
        }
        var _a, _b;
        this._registeredSpanProcessors = [];
        this._tracers = new Map();
        var mergedConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$utils$2f$merge$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["merge"])({}, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$config$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadDefaultConfig"])(), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$utility$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["reconfigureLimits"])(config));
        this.resource = (_a = mergedConfig.resource) !== null && _a !== void 0 ? _a : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$resources$2f$build$2f$esm$2f$Resource$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Resource"].empty();
        if (mergedConfig.mergeResourceWithDefaults) {
            this.resource = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$resources$2f$build$2f$esm$2f$Resource$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Resource"].default().merge(this.resource);
        }
        this._config = Object.assign({}, mergedConfig, {
            resource: this.resource
        });
        if ((_b = config.spanProcessors) === null || _b === void 0 ? void 0 : _b.length) {
            this._registeredSpanProcessors = __spreadArray([], __read(config.spanProcessors), false);
            this.activeSpanProcessor = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$MultiSpanProcessor$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MultiSpanProcessor"](this._registeredSpanProcessors);
        } else {
            var defaultExporter = this._buildExporterFromEnv();
            if (defaultExporter !== undefined) {
                var batchProcessor = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$platform$2f$node$2f$export$2f$BatchSpanProcessor$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BatchSpanProcessor"](defaultExporter);
                this.activeSpanProcessor = batchProcessor;
            } else {
                this.activeSpanProcessor = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$export$2f$NoopSpanProcessor$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NoopSpanProcessor"]();
            }
        }
    }
    BasicTracerProvider.prototype.getTracer = function(name, version, options) {
        var key = name + "@" + (version || '') + ":" + ((options === null || options === void 0 ? void 0 : options.schemaUrl) || '');
        if (!this._tracers.has(key)) {
            this._tracers.set(key, new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$Tracer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Tracer"]({
                name: name,
                version: version,
                schemaUrl: options === null || options === void 0 ? void 0 : options.schemaUrl
            }, this._config, this));
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this._tracers.get(key);
    };
    /**
     * @deprecated please use {@link TracerConfig} spanProcessors property
     * Adds a new {@link SpanProcessor} to this tracer.
     * @param spanProcessor the new SpanProcessor to be added.
     */ BasicTracerProvider.prototype.addSpanProcessor = function(spanProcessor) {
        if (this._registeredSpanProcessors.length === 0) {
            // since we might have enabled by default a batchProcessor, we disable it
            // before adding the new one
            this.activeSpanProcessor.shutdown().catch(function(err) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].error('Error while trying to shutdown current span processor', err);
            });
        }
        this._registeredSpanProcessors.push(spanProcessor);
        this.activeSpanProcessor = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$sdk$2d$trace$2d$base$2f$build$2f$esm$2f$MultiSpanProcessor$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MultiSpanProcessor"](this._registeredSpanProcessors);
    };
    BasicTracerProvider.prototype.getActiveSpanProcessor = function() {
        return this.activeSpanProcessor;
    };
    /**
     * Register this TracerProvider for use with the OpenTelemetry API.
     * Undefined values may be replaced with defaults, and
     * null values will be skipped.
     *
     * @param config Configuration object for SDK registration
     */ BasicTracerProvider.prototype.register = function(config) {
        if (config === void 0) {
            config = {};
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trace"].setGlobalTracerProvider(this);
        if (config.propagator === undefined) {
            config.propagator = this._buildPropagatorFromEnv();
        }
        if (config.contextManager) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$context$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["context"].setGlobalContextManager(config.contextManager);
        }
        if (config.propagator) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$propagation$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["propagation"].setGlobalPropagator(config.propagator);
        }
    };
    BasicTracerProvider.prototype.forceFlush = function() {
        var timeout = this._config.forceFlushTimeoutMillis;
        var promises = this._registeredSpanProcessors.map(function(spanProcessor) {
            return new Promise(function(resolve) {
                var state;
                var timeoutInterval = setTimeout(function() {
                    resolve(new Error("Span processor did not completed within timeout period of " + timeout + " ms"));
                    state = ForceFlushState.timeout;
                }, timeout);
                spanProcessor.forceFlush().then(function() {
                    clearTimeout(timeoutInterval);
                    if (state !== ForceFlushState.timeout) {
                        state = ForceFlushState.resolved;
                        resolve(state);
                    }
                }).catch(function(error) {
                    clearTimeout(timeoutInterval);
                    state = ForceFlushState.error;
                    resolve(error);
                });
            });
        });
        return new Promise(function(resolve, reject) {
            Promise.all(promises).then(function(results) {
                var errors = results.filter(function(result) {
                    return result !== ForceFlushState.resolved;
                });
                if (errors.length > 0) {
                    reject(errors);
                } else {
                    resolve();
                }
            }).catch(function(error) {
                return reject([
                    error
                ]);
            });
        });
    };
    BasicTracerProvider.prototype.shutdown = function() {
        return this.activeSpanProcessor.shutdown();
    };
    /**
     * TS cannot yet infer the type of this.constructor:
     * https://github.com/Microsoft/TypeScript/issues/3841#issuecomment-337560146
     * There is no need to override either of the getters in your child class.
     * The type of the registered component maps should be the same across all
     * classes in the inheritance tree.
     */ BasicTracerProvider.prototype._getPropagator = function(name) {
        var _a;
        return (_a = this.constructor._registeredPropagators.get(name)) === null || _a === void 0 ? void 0 : _a();
    };
    BasicTracerProvider.prototype._getSpanExporter = function(name) {
        var _a;
        return (_a = this.constructor._registeredExporters.get(name)) === null || _a === void 0 ? void 0 : _a();
    };
    BasicTracerProvider.prototype._buildPropagatorFromEnv = function() {
        var _this = this;
        // per spec, propagators from env must be deduplicated
        var uniquePropagatorNames = Array.from(new Set((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$platform$2f$node$2f$environment$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEnv"])().OTEL_PROPAGATORS));
        var propagators = uniquePropagatorNames.map(function(name) {
            var propagator = _this._getPropagator(name);
            if (!propagator) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].warn("Propagator \"" + name + "\" requested through environment variable is unavailable.");
            }
            return propagator;
        });
        var validPropagators = propagators.reduce(function(list, item) {
            if (item) {
                list.push(item);
            }
            return list;
        }, []);
        if (validPropagators.length === 0) {
            return;
        } else if (uniquePropagatorNames.length === 1) {
            return validPropagators[0];
        } else {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$propagation$2f$composite$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CompositePropagator"]({
                propagators: validPropagators
            });
        }
    };
    BasicTracerProvider.prototype._buildExporterFromEnv = function() {
        var exporterName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$platform$2f$node$2f$environment$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEnv"])().OTEL_TRACES_EXPORTER;
        if (exporterName === 'none' || exporterName === '') return;
        var exporter = this._getSpanExporter(exporterName);
        if (!exporter) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].error("Exporter \"" + exporterName + "\" requested through environment variable is unavailable.");
        }
        return exporter;
    };
    BasicTracerProvider._registeredPropagators = new Map([
        [
            'tracecontext',
            function() {
                return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$trace$2f$W3CTraceContextPropagator$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["W3CTraceContextPropagator"]();
            }
        ],
        [
            'baggage',
            function() {
                return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$baggage$2f$propagation$2f$W3CBaggagePropagator$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["W3CBaggagePropagator"]();
            }
        ]
    ]);
    BasicTracerProvider._registeredExporters = new Map();
    return BasicTracerProvider;
}();
;
}),
"[project]/node_modules/@opentelemetry/instrumentation-undici/build/src/version.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
// this is autogenerated file, see scripts/version-update.js
exports.PACKAGE_VERSION = '0.10.1';
exports.PACKAGE_NAME = '@opentelemetry/instrumentation-undici';
}),
"[project]/node_modules/@opentelemetry/instrumentation-undici/build/src/enums/SemanticAttributes.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SemanticAttributes = void 0;
// DO NOT EDIT, this is an Auto-generated file from scripts/semconv/templates//templates/SemanticAttributes.ts.j2
exports.SemanticAttributes = {
    /**
     * State of the HTTP connection in the HTTP connection pool.
     */ HTTP_CONNECTION_STATE: 'http.connection.state',
    /**
    * Describes a class of error the operation ended with.
    *
    * Note: The `error.type` SHOULD be predictable and SHOULD have low cardinality.
  Instrumentations SHOULD document the list of errors they report.
  
  The cardinality of `error.type` within one instrumentation library SHOULD be low.
  Telemetry consumers that aggregate data from multiple instrumentation libraries and applications
  should be prepared for `error.type` to have high cardinality at query time when no
  additional filters are applied.
  
  If the operation has completed successfully, instrumentations SHOULD NOT set `error.type`.
  
  If a specific domain defines its own set of error identifiers (such as HTTP or gRPC status codes),
  it&#39;s RECOMMENDED to:
  
  * Use a domain-specific attribute
  * Set `error.type` to capture all errors, regardless of whether they are defined within the domain-specific set or not.
    */ ERROR_TYPE: 'error.type',
    /**
     * The size of the request payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
     */ HTTP_REQUEST_BODY_SIZE: 'http.request.body.size',
    /**
    * HTTP request method.
    *
    * Note: HTTP request method value SHOULD be &#34;known&#34; to the instrumentation.
  By default, this convention defines &#34;known&#34; methods as the ones listed in [RFC9110](https://www.rfc-editor.org/rfc/rfc9110.html#name-methods)
  and the PATCH method defined in [RFC5789](https://www.rfc-editor.org/rfc/rfc5789.html).
  
  If the HTTP request method is not known to instrumentation, it MUST set the `http.request.method` attribute to `_OTHER`.
  
  If the HTTP instrumentation could end up converting valid HTTP request methods to `_OTHER`, then it MUST provide a way to override
  the list of known HTTP methods. If this override is done via environment variable, then the environment variable MUST be named
  OTEL_INSTRUMENTATION_HTTP_KNOWN_METHODS and support a comma-separated list of case-sensitive known HTTP methods
  (this list MUST be a full override of the default known method, it is not a list of known methods in addition to the defaults).
  
  HTTP method names are case-sensitive and `http.request.method` attribute value MUST match a known HTTP method name exactly.
  Instrumentations for specific web frameworks that consider HTTP methods to be case insensitive, SHOULD populate a canonical equivalent.
  Tracing instrumentations that do so, MUST also set `http.request.method_original` to the original value.
    */ HTTP_REQUEST_METHOD: 'http.request.method',
    /**
     * Original HTTP method sent by the client in the request line.
     */ HTTP_REQUEST_METHOD_ORIGINAL: 'http.request.method_original',
    /**
     * The ordinal number of request resending attempt (for any reason, including redirects).
     *
     * Note: The resend count SHOULD be updated each time an HTTP request gets resent by the client, regardless of what was the cause of the resending (e.g. redirection, authorization failure, 503 Server Unavailable, network issues, or any other).
     */ HTTP_REQUEST_RESEND_COUNT: 'http.request.resend_count',
    /**
     * The size of the response payload body in bytes. This is the number of bytes transferred excluding headers and is often, but not always, present as the [Content-Length](https://www.rfc-editor.org/rfc/rfc9110.html#field.content-length) header. For requests using transport encoding, this should be the compressed size.
     */ HTTP_RESPONSE_BODY_SIZE: 'http.response.body.size',
    /**
     * [HTTP response status code](https://tools.ietf.org/html/rfc7231#section-6).
     */ HTTP_RESPONSE_STATUS_CODE: 'http.response.status_code',
    /**
    * The matched route, that is, the path template in the format used by the respective server framework.
    *
    * Note: MUST NOT be populated when this is not supported by the HTTP server framework as the route attribute should have low-cardinality and the URI path can NOT substitute it.
  SHOULD include the [application root](/docs/http/http-spans.md#http-server-definitions) if there is one.
    */ HTTP_ROUTE: 'http.route',
    /**
     * Peer address of the network connection - IP address or Unix domain socket name.
     */ NETWORK_PEER_ADDRESS: 'network.peer.address',
    /**
     * Peer port number of the network connection.
     */ NETWORK_PEER_PORT: 'network.peer.port',
    /**
     * [OSI application layer](https://osi-model.com/application-layer/) or non-OSI equivalent.
     *
     * Note: The value SHOULD be normalized to lowercase.
     */ NETWORK_PROTOCOL_NAME: 'network.protocol.name',
    /**
     * Version of the protocol specified in `network.protocol.name`.
     *
     * Note: `network.protocol.version` refers to the version of the protocol used and might be different from the protocol client&#39;s version. If the HTTP client has a version of `0.27.2`, but sends HTTP version `1.1`, this attribute should be set to `1.1`.
     */ NETWORK_PROTOCOL_VERSION: 'network.protocol.version',
    /**
     * Server domain name if available without reverse DNS lookup; otherwise, IP address or Unix domain socket name.
     *
     * Note: When observed from the client side, and when communicating through an intermediary, `server.address` SHOULD represent the server address behind any intermediaries, for example proxies, if it&#39;s available.
     */ SERVER_ADDRESS: 'server.address',
    /**
     * Server port number.
     *
     * Note: When observed from the client side, and when communicating through an intermediary, `server.port` SHOULD represent the server port behind any intermediaries, for example proxies, if it&#39;s available.
     */ SERVER_PORT: 'server.port',
    /**
    * Absolute URL describing a network resource according to [RFC3986](https://www.rfc-editor.org/rfc/rfc3986).
    *
    * Note: For network calls, URL usually has `scheme://host[:port][path][?query][#fragment]` format, where the fragment is not transmitted over HTTP, but if it is known, it SHOULD be included nevertheless.
  `url.full` MUST NOT contain credentials passed via URL in form of `https://username:password@www.example.com/`. In such case username and password SHOULD be redacted and attribute&#39;s value SHOULD be `https://REDACTED:REDACTED@www.example.com/`.
  `url.full` SHOULD capture the absolute URL when it is available (or can be reconstructed) and SHOULD NOT be validated or modified except for sanitizing purposes.
    */ URL_FULL: 'url.full',
    /**
     * The [URI path](https://www.rfc-editor.org/rfc/rfc3986#section-3.3) component.
     */ URL_PATH: 'url.path',
    /**
     * The [URI query](https://www.rfc-editor.org/rfc/rfc3986#section-3.4) component.
     *
     * Note: Sensitive content provided in query string SHOULD be scrubbed when instrumentations can identify it.
     */ URL_QUERY: 'url.query',
    /**
     * The [URI scheme](https://www.rfc-editor.org/rfc/rfc3986#section-3.1) component identifying the used protocol.
     */ URL_SCHEME: 'url.scheme',
    /**
     * Value of the [HTTP User-Agent](https://www.rfc-editor.org/rfc/rfc9110.html#field.user-agent) header sent by the client.
     */ USER_AGENT_ORIGINAL: 'user_agent.original'
};
}),
"[project]/node_modules/@opentelemetry/instrumentation-undici/build/src/undici.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UndiciInstrumentation = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const diagch = __turbopack_context__.r("[externals]/diagnostics_channel [external] (diagnostics_channel, cjs)");
const url_1 = __turbopack_context__.r("[externals]/url [external] (url, cjs)");
const instrumentation_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
const api_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
/** @knipignore */ const version_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-undici/build/src/version.js [app-route] (ecmascript)");
const SemanticAttributes_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-undici/build/src/enums/SemanticAttributes.js [app-route] (ecmascript)");
const core_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/core/build/esm/index.js [app-route] (ecmascript)");
// A combination of https://github.com/elastic/apm-agent-nodejs and
// https://github.com/gadget-inc/opentelemetry-instrumentations/blob/main/packages/opentelemetry-instrumentation-undici/src/index.ts
class UndiciInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}){
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
        this._recordFromReq = new WeakMap();
    }
    // No need to instrument files/modules
    init() {
        return undefined;
    }
    disable() {
        super.disable();
        this._channelSubs.forEach((sub)=>sub.unsubscribe());
        this._channelSubs.length = 0;
    }
    enable() {
        // "enabled" handling is currently a bit messy with InstrumentationBase.
        // If constructed with `{enabled: false}`, this `.enable()` is still called,
        // and `this.getConfig().enabled !== this.isEnabled()`, creating confusion.
        //
        // For now, this class will setup for instrumenting if `.enable()` is
        // called, but use `this.getConfig().enabled` to determine if
        // instrumentation should be generated. This covers the more likely common
        // case of config being given a construction time, rather than later via
        // `instance.enable()`, `.disable()`, or `.setConfig()` calls.
        super.enable();
        // This method is called by the super-class constructor before ours is
        // called. So we need to ensure the property is initalized.
        this._channelSubs = this._channelSubs || [];
        // Avoid to duplicate subscriptions
        if (this._channelSubs.length > 0) {
            return;
        }
        this.subscribeToChannel('undici:request:create', this.onRequestCreated.bind(this));
        this.subscribeToChannel('undici:client:sendHeaders', this.onRequestHeaders.bind(this));
        this.subscribeToChannel('undici:request:headers', this.onResponseHeaders.bind(this));
        this.subscribeToChannel('undici:request:trailers', this.onDone.bind(this));
        this.subscribeToChannel('undici:request:error', this.onError.bind(this));
    }
    _updateMetricInstruments() {
        this._httpClientDurationHistogram = this.meter.createHistogram('http.client.request.duration', {
            description: 'Measures the duration of outbound HTTP requests.',
            unit: 's',
            valueType: api_1.ValueType.DOUBLE,
            advice: {
                explicitBucketBoundaries: [
                    0.005,
                    0.01,
                    0.025,
                    0.05,
                    0.075,
                    0.1,
                    0.25,
                    0.5,
                    0.75,
                    1,
                    2.5,
                    5,
                    7.5,
                    10
                ]
            }
        });
    }
    subscribeToChannel(diagnosticChannel, onMessage) {
        var _a;
        // `diagnostics_channel` had a ref counting bug until v18.19.0.
        // https://github.com/nodejs/node/pull/47520
        const [major, minor] = process.version.replace('v', '').split('.').map((n)=>Number(n));
        const useNewSubscribe = major > 18 || major === 18 && minor >= 19;
        let unsubscribe;
        if (useNewSubscribe) {
            (_a = diagch.subscribe) === null || _a === void 0 ? void 0 : _a.call(diagch, diagnosticChannel, onMessage);
            unsubscribe = ()=>{
                var _a;
                return (_a = diagch.unsubscribe) === null || _a === void 0 ? void 0 : _a.call(diagch, diagnosticChannel, onMessage);
            };
        } else {
            const channel = diagch.channel(diagnosticChannel);
            channel.subscribe(onMessage);
            unsubscribe = ()=>channel.unsubscribe(onMessage);
        }
        this._channelSubs.push({
            name: diagnosticChannel,
            unsubscribe
        });
    }
    // This is the 1st message we receive for each request (fired after request creation). Here we will
    // create the span and populate some atttributes, then link the span to the request for further
    // span processing
    onRequestCreated({ request }) {
        // Ignore if:
        // - instrumentation is disabled
        // - ignored by config
        // - method is 'CONNECT'
        const config = this.getConfig();
        const enabled = config.enabled !== false;
        const shouldIgnoreReq = (0, instrumentation_1.safeExecuteInTheMiddle)(()=>{
            var _a;
            return !enabled || request.method === 'CONNECT' || ((_a = config.ignoreRequestHook) === null || _a === void 0 ? void 0 : _a.call(config, request));
        }, (e)=>e && this._diag.error('caught ignoreRequestHook error: ', e), true);
        if (shouldIgnoreReq) {
            return;
        }
        const startTime = (0, core_1.hrTime)();
        let requestUrl;
        try {
            requestUrl = new url_1.URL(request.path, request.origin);
        } catch (err) {
            this._diag.warn('could not determine url.full:', err);
            // Skip instrumenting this request.
            return;
        }
        const urlScheme = requestUrl.protocol.replace(':', '');
        const requestMethod = this.getRequestMethod(request.method);
        const attributes = {
            [SemanticAttributes_1.SemanticAttributes.HTTP_REQUEST_METHOD]: requestMethod,
            [SemanticAttributes_1.SemanticAttributes.HTTP_REQUEST_METHOD_ORIGINAL]: request.method,
            [SemanticAttributes_1.SemanticAttributes.URL_FULL]: requestUrl.toString(),
            [SemanticAttributes_1.SemanticAttributes.URL_PATH]: requestUrl.pathname,
            [SemanticAttributes_1.SemanticAttributes.URL_QUERY]: requestUrl.search,
            [SemanticAttributes_1.SemanticAttributes.URL_SCHEME]: urlScheme
        };
        const schemePorts = {
            https: '443',
            http: '80'
        };
        const serverAddress = requestUrl.hostname;
        const serverPort = requestUrl.port || schemePorts[urlScheme];
        attributes[SemanticAttributes_1.SemanticAttributes.SERVER_ADDRESS] = serverAddress;
        if (serverPort && !isNaN(Number(serverPort))) {
            attributes[SemanticAttributes_1.SemanticAttributes.SERVER_PORT] = Number(serverPort);
        }
        // Get user agent from headers
        let userAgent;
        if (Array.isArray(request.headers)) {
            const idx = request.headers.findIndex((h)=>h.toLowerCase() === 'user-agent');
            if (idx >= 0) {
                userAgent = request.headers[idx + 1];
            }
        } else if (typeof request.headers === 'string') {
            const headers = request.headers.split('\r\n');
            const uaHeader = headers.find((h)=>h.toLowerCase().startsWith('user-agent'));
            userAgent = uaHeader && uaHeader.substring(uaHeader.indexOf(':') + 1).trim();
        }
        if (userAgent) {
            attributes[SemanticAttributes_1.SemanticAttributes.USER_AGENT_ORIGINAL] = userAgent;
        }
        // Get attributes from the hook if present
        const hookAttributes = (0, instrumentation_1.safeExecuteInTheMiddle)(()=>{
            var _a;
            return (_a = config.startSpanHook) === null || _a === void 0 ? void 0 : _a.call(config, request);
        }, (e)=>e && this._diag.error('caught startSpanHook error: ', e), true);
        if (hookAttributes) {
            Object.entries(hookAttributes).forEach(([key, val])=>{
                attributes[key] = val;
            });
        }
        // Check if parent span is required via config and:
        // - if a parent is required but not present, we use a `NoopSpan` to still
        //   propagate context without recording it.
        // - create a span otherwise
        const activeCtx = api_1.context.active();
        const currentSpan = api_1.trace.getSpan(activeCtx);
        let span;
        if (config.requireParentforSpans && (!currentSpan || !api_1.trace.isSpanContextValid(currentSpan.spanContext()))) {
            span = api_1.trace.wrapSpanContext(api_1.INVALID_SPAN_CONTEXT);
        } else {
            span = this.tracer.startSpan(requestMethod === '_OTHER' ? 'HTTP' : requestMethod, {
                kind: api_1.SpanKind.CLIENT,
                attributes: attributes
            }, activeCtx);
        }
        // Execute the request hook if defined
        (0, instrumentation_1.safeExecuteInTheMiddle)(()=>{
            var _a;
            return (_a = config.requestHook) === null || _a === void 0 ? void 0 : _a.call(config, span, request);
        }, (e)=>e && this._diag.error('caught requestHook error: ', e), true);
        // Context propagation goes last so no hook can tamper
        // the propagation headers
        const requestContext = api_1.trace.setSpan(api_1.context.active(), span);
        const addedHeaders = {};
        api_1.propagation.inject(requestContext, addedHeaders);
        const headerEntries = Object.entries(addedHeaders);
        for(let i = 0; i < headerEntries.length; i++){
            const [k, v] = headerEntries[i];
            if (typeof request.addHeader === 'function') {
                request.addHeader(k, v);
            } else if (typeof request.headers === 'string') {
                request.headers += `${k}: ${v}\r\n`;
            } else if (Array.isArray(request.headers)) {
                // undici@6.11.0 accidentally, briefly removed `request.addHeader()`.
                request.headers.push(k, v);
            }
        }
        this._recordFromReq.set(request, {
            span,
            attributes,
            startTime
        });
    }
    // This is the 2nd message we receive for each request. It is fired when connection with
    // the remote is established and about to send the first byte. Here we do have info about the
    // remote address and port so we can populate some `network.*` attributes into the span
    onRequestHeaders({ request, socket }) {
        var _a;
        const record = this._recordFromReq.get(request);
        if (!record) {
            return;
        }
        const config = this.getConfig();
        const { span } = record;
        const { remoteAddress, remotePort } = socket;
        const spanAttributes = {
            [SemanticAttributes_1.SemanticAttributes.NETWORK_PEER_ADDRESS]: remoteAddress,
            [SemanticAttributes_1.SemanticAttributes.NETWORK_PEER_PORT]: remotePort
        };
        // After hooks have been processed (which may modify request headers)
        // we can collect the headers based on the configuration
        if ((_a = config.headersToSpanAttributes) === null || _a === void 0 ? void 0 : _a.requestHeaders) {
            const headersToAttribs = new Set(config.headersToSpanAttributes.requestHeaders.map((n)=>n.toLowerCase()));
            // headers could be in form
            // ['name: value', ...] for v5
            // ['name', 'value', ...] for v6
            const rawHeaders = Array.isArray(request.headers) ? request.headers : request.headers.split('\r\n');
            rawHeaders.forEach((h, idx)=>{
                const sepIndex = h.indexOf(':');
                const hasSeparator = sepIndex !== -1;
                const name = (hasSeparator ? h.substring(0, sepIndex) : h).toLowerCase();
                const value = hasSeparator ? h.substring(sepIndex + 1) : rawHeaders[idx + 1];
                if (headersToAttribs.has(name)) {
                    spanAttributes[`http.request.header.${name}`] = value.trim();
                }
            });
        }
        span.setAttributes(spanAttributes);
    }
    // This is the 3rd message we get for each request and it's fired when the server
    // headers are received, body may not be accessible yet.
    // From the response headers we can set the status and content length
    onResponseHeaders({ request, response }) {
        var _a, _b;
        const record = this._recordFromReq.get(request);
        if (!record) {
            return;
        }
        const { span, attributes } = record;
        const spanAttributes = {
            [SemanticAttributes_1.SemanticAttributes.HTTP_RESPONSE_STATUS_CODE]: response.statusCode
        };
        const config = this.getConfig();
        // Execute the response hook if defined
        (0, instrumentation_1.safeExecuteInTheMiddle)(()=>{
            var _a;
            return (_a = config.responseHook) === null || _a === void 0 ? void 0 : _a.call(config, span, {
                request,
                response
            });
        }, (e)=>e && this._diag.error('caught responseHook error: ', e), true);
        const headersToAttribs = new Set();
        if ((_a = config.headersToSpanAttributes) === null || _a === void 0 ? void 0 : _a.responseHeaders) {
            (_b = config.headersToSpanAttributes) === null || _b === void 0 ? void 0 : _b.responseHeaders.forEach((name)=>headersToAttribs.add(name.toLowerCase()));
        }
        for(let idx = 0; idx < response.headers.length; idx = idx + 2){
            const name = response.headers[idx].toString().toLowerCase();
            const value = response.headers[idx + 1];
            if (headersToAttribs.has(name)) {
                spanAttributes[`http.response.header.${name}`] = value.toString();
            }
            if (name === 'content-length') {
                const contentLength = Number(value.toString());
                if (!isNaN(contentLength)) {
                    spanAttributes['http.response.header.content-length'] = contentLength;
                }
            }
        }
        span.setAttributes(spanAttributes);
        span.setStatus({
            code: response.statusCode >= 400 ? api_1.SpanStatusCode.ERROR : api_1.SpanStatusCode.UNSET
        });
        record.attributes = Object.assign(attributes, spanAttributes);
    }
    // This is the last event we receive if the request went without any errors
    onDone({ request }) {
        const record = this._recordFromReq.get(request);
        if (!record) {
            return;
        }
        const { span, attributes, startTime } = record;
        // End the span
        span.end();
        this._recordFromReq.delete(request);
        // Record metrics
        this.recordRequestDuration(attributes, startTime);
    }
    // This is the event we get when something is wrong in the request like
    // - invalid options when calling `fetch` global API or any undici method for request
    // - connectivity errors such as unreachable host
    // - requests aborted through an `AbortController.signal`
    // NOTE: server errors are considered valid responses and it's the lib consumer
    // who should deal with that.
    onError({ request, error }) {
        const record = this._recordFromReq.get(request);
        if (!record) {
            return;
        }
        const { span, attributes, startTime } = record;
        // NOTE: in `undici@6.3.0` when request aborted the error type changes from
        // a custom error (`RequestAbortedError`) to a built-in `DOMException` carrying
        // some differences:
        // - `code` is from DOMEXception (ABORT_ERR: 20)
        // - `message` changes
        // - stacktrace is smaller and contains node internal frames
        span.recordException(error);
        span.setStatus({
            code: api_1.SpanStatusCode.ERROR,
            message: error.message
        });
        span.end();
        this._recordFromReq.delete(request);
        // Record metrics (with the error)
        attributes[SemanticAttributes_1.SemanticAttributes.ERROR_TYPE] = error.message;
        this.recordRequestDuration(attributes, startTime);
    }
    recordRequestDuration(attributes, startTime) {
        // Time to record metrics
        const metricsAttributes = {};
        // Get the attribs already in span attributes
        const keysToCopy = [
            SemanticAttributes_1.SemanticAttributes.HTTP_RESPONSE_STATUS_CODE,
            SemanticAttributes_1.SemanticAttributes.HTTP_REQUEST_METHOD,
            SemanticAttributes_1.SemanticAttributes.SERVER_ADDRESS,
            SemanticAttributes_1.SemanticAttributes.SERVER_PORT,
            SemanticAttributes_1.SemanticAttributes.URL_SCHEME,
            SemanticAttributes_1.SemanticAttributes.ERROR_TYPE
        ];
        keysToCopy.forEach((key)=>{
            if (key in attributes) {
                metricsAttributes[key] = attributes[key];
            }
        });
        // Take the duration and record it
        const durationSeconds = (0, core_1.hrTimeToMilliseconds)((0, core_1.hrTimeDuration)(startTime, (0, core_1.hrTime)())) / 1000;
        this._httpClientDurationHistogram.record(durationSeconds, metricsAttributes);
    }
    getRequestMethod(original) {
        const knownMethods = {
            CONNECT: true,
            OPTIONS: true,
            HEAD: true,
            GET: true,
            POST: true,
            PUT: true,
            PATCH: true,
            DELETE: true,
            TRACE: true
        };
        if (original.toUpperCase() in knownMethods) {
            return original.toUpperCase();
        }
        return '_OTHER';
    }
}
exports.UndiciInstrumentation = UndiciInstrumentation;
}),
"[project]/node_modules/@opentelemetry/instrumentation-undici/build/src/types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
}),
"[project]/node_modules/@opentelemetry/instrumentation-undici/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-undici/build/src/undici.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-undici/build/src/types.js [app-route] (ecmascript)"), exports);
}),
"[project]/node_modules/@opentelemetry/instrumentation-fs/build/src/version.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
// this is autogenerated file, see scripts/version-update.js
exports.PACKAGE_VERSION = '0.19.1';
exports.PACKAGE_NAME = '@opentelemetry/instrumentation-fs';
}),
"[project]/node_modules/@opentelemetry/instrumentation-fs/build/src/constants.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SYNC_FUNCTIONS = exports.CALLBACK_FUNCTIONS = exports.PROMISE_FUNCTIONS = void 0;
exports.PROMISE_FUNCTIONS = [
    'access',
    'appendFile',
    'chmod',
    'chown',
    'copyFile',
    'cp',
    'lchown',
    'link',
    'lstat',
    'lutimes',
    'mkdir',
    'mkdtemp',
    'open',
    'opendir',
    'readdir',
    'readFile',
    'readlink',
    'realpath',
    'rename',
    'rm',
    'rmdir',
    'stat',
    'symlink',
    'truncate',
    'unlink',
    'utimes',
    'writeFile'
];
exports.CALLBACK_FUNCTIONS = [
    'access',
    'appendFile',
    'chmod',
    'chown',
    'copyFile',
    'cp',
    'exists',
    'lchown',
    'link',
    'lstat',
    'lutimes',
    'mkdir',
    'mkdtemp',
    'open',
    'opendir',
    'readdir',
    'readFile',
    'readlink',
    'realpath',
    'realpath.native',
    'rename',
    'rm',
    'rmdir',
    'stat',
    'symlink',
    'truncate',
    'unlink',
    'utimes',
    'writeFile'
];
exports.SYNC_FUNCTIONS = [
    'accessSync',
    'appendFileSync',
    'chmodSync',
    'chownSync',
    'copyFileSync',
    'cpSync',
    'existsSync',
    'lchownSync',
    'linkSync',
    'lstatSync',
    'lutimesSync',
    'mkdirSync',
    'mkdtempSync',
    'opendirSync',
    'openSync',
    'readdirSync',
    'readFileSync',
    'readlinkSync',
    'realpathSync',
    'realpathSync.native',
    'renameSync',
    'rmdirSync',
    'rmSync',
    'statSync',
    'symlinkSync',
    'truncateSync',
    'unlinkSync',
    'utimesSync',
    'writeFileSync'
];
}),
"[project]/node_modules/@opentelemetry/instrumentation-fs/build/src/utils.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.indexFs = exports.splitTwoLevels = void 0;
function splitTwoLevels(functionName) {
    const memberParts = functionName.split('.');
    if (memberParts.length > 1) {
        if (memberParts.length !== 2) throw Error(`Invalid member function name ${functionName}`);
        return memberParts;
    } else {
        return [
            functionName
        ];
    }
}
exports.splitTwoLevels = splitTwoLevels;
function indexFs(fs, member) {
    if (!member) throw new Error(JSON.stringify({
        member
    }));
    const splitResult = splitTwoLevels(member);
    const [functionName1, functionName2] = splitResult;
    if (functionName2) {
        return {
            objectToPatch: fs[functionName1],
            functionNameToPatch: functionName2
        };
    } else {
        return {
            objectToPatch: fs,
            functionNameToPatch: functionName1
        };
    }
}
exports.indexFs = indexFs;
}),
"[project]/node_modules/@opentelemetry/instrumentation-fs/build/src/instrumentation.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FsInstrumentation = void 0;
const api = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const core_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/core/build/esm/index.js [app-route] (ecmascript)");
const instrumentation_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
/** @knipignore */ const version_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-fs/build/src/version.js [app-route] (ecmascript)");
const constants_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-fs/build/src/constants.js [app-route] (ecmascript)");
const util_1 = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
const utils_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-fs/build/src/utils.js [app-route] (ecmascript)");
/**
 * This is important for 2-level functions like `realpath.native` to retain the 2nd-level
 * when patching the 1st-level.
 */ function patchedFunctionWithOriginalProperties(patchedFunction, original) {
    return Object.assign(patchedFunction, original);
}
class FsInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}){
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
    }
    init() {
        return [
            new instrumentation_1.InstrumentationNodeModuleDefinition('fs', [
                '*'
            ], (fs)=>{
                for (const fName of constants_1.SYNC_FUNCTIONS){
                    const { objectToPatch, functionNameToPatch } = (0, utils_1.indexFs)(fs, fName);
                    if ((0, instrumentation_1.isWrapped)(objectToPatch[functionNameToPatch])) {
                        this._unwrap(objectToPatch, functionNameToPatch);
                    }
                    this._wrap(objectToPatch, functionNameToPatch, this._patchSyncFunction.bind(this, fName));
                }
                for (const fName of constants_1.CALLBACK_FUNCTIONS){
                    const { objectToPatch, functionNameToPatch } = (0, utils_1.indexFs)(fs, fName);
                    if ((0, instrumentation_1.isWrapped)(objectToPatch[functionNameToPatch])) {
                        this._unwrap(objectToPatch, functionNameToPatch);
                    }
                    if (fName === 'exists') {
                        // handling separately because of the inconsistent cb style:
                        // `exists` doesn't have error as the first argument, but the result
                        this._wrap(objectToPatch, functionNameToPatch, this._patchExistsCallbackFunction.bind(this, fName));
                        continue;
                    }
                    this._wrap(objectToPatch, functionNameToPatch, this._patchCallbackFunction.bind(this, fName));
                }
                for (const fName of constants_1.PROMISE_FUNCTIONS){
                    if ((0, instrumentation_1.isWrapped)(fs.promises[fName])) {
                        this._unwrap(fs.promises, fName);
                    }
                    this._wrap(fs.promises, fName, this._patchPromiseFunction.bind(this, fName));
                }
                return fs;
            }, (fs)=>{
                if (fs === undefined) return;
                for (const fName of constants_1.SYNC_FUNCTIONS){
                    const { objectToPatch, functionNameToPatch } = (0, utils_1.indexFs)(fs, fName);
                    if ((0, instrumentation_1.isWrapped)(objectToPatch[functionNameToPatch])) {
                        this._unwrap(objectToPatch, functionNameToPatch);
                    }
                }
                for (const fName of constants_1.CALLBACK_FUNCTIONS){
                    const { objectToPatch, functionNameToPatch } = (0, utils_1.indexFs)(fs, fName);
                    if ((0, instrumentation_1.isWrapped)(objectToPatch[functionNameToPatch])) {
                        this._unwrap(objectToPatch, functionNameToPatch);
                    }
                }
                for (const fName of constants_1.PROMISE_FUNCTIONS){
                    if ((0, instrumentation_1.isWrapped)(fs.promises[fName])) {
                        this._unwrap(fs.promises, fName);
                    }
                }
            }),
            new instrumentation_1.InstrumentationNodeModuleDefinition('fs/promises', [
                '*'
            ], (fsPromises)=>{
                for (const fName of constants_1.PROMISE_FUNCTIONS){
                    if ((0, instrumentation_1.isWrapped)(fsPromises[fName])) {
                        this._unwrap(fsPromises, fName);
                    }
                    this._wrap(fsPromises, fName, this._patchPromiseFunction.bind(this, fName));
                }
                return fsPromises;
            }, (fsPromises)=>{
                if (fsPromises === undefined) return;
                for (const fName of constants_1.PROMISE_FUNCTIONS){
                    if ((0, instrumentation_1.isWrapped)(fsPromises[fName])) {
                        this._unwrap(fsPromises, fName);
                    }
                }
            })
        ];
    }
    _patchSyncFunction(functionName, original) {
        const instrumentation = this;
        const patchedFunction = function(...args) {
            const activeContext = api.context.active();
            if (!instrumentation._shouldTrace(activeContext)) {
                return original.apply(this, args);
            }
            if (instrumentation._runCreateHook(functionName, {
                args: args
            }) === false) {
                return api.context.with((0, core_1.suppressTracing)(activeContext), original, this, ...args);
            }
            const span = instrumentation.tracer.startSpan(`fs ${functionName}`);
            try {
                // Suppress tracing for internal fs calls
                const res = api.context.with((0, core_1.suppressTracing)(api.trace.setSpan(activeContext, span)), original, this, ...args);
                instrumentation._runEndHook(functionName, {
                    args: args,
                    span
                });
                return res;
            } catch (error) {
                span.recordException(error);
                span.setStatus({
                    message: error.message,
                    code: api.SpanStatusCode.ERROR
                });
                instrumentation._runEndHook(functionName, {
                    args: args,
                    span,
                    error
                });
                throw error;
            } finally{
                span.end();
            }
        };
        return patchedFunctionWithOriginalProperties(patchedFunction, original);
    }
    _patchCallbackFunction(functionName, original) {
        const instrumentation = this;
        const patchedFunction = function(...args) {
            const activeContext = api.context.active();
            if (!instrumentation._shouldTrace(activeContext)) {
                return original.apply(this, args);
            }
            if (instrumentation._runCreateHook(functionName, {
                args: args
            }) === false) {
                return api.context.with((0, core_1.suppressTracing)(activeContext), original, this, ...args);
            }
            const lastIdx = args.length - 1;
            const cb = args[lastIdx];
            if (typeof cb === 'function') {
                const span = instrumentation.tracer.startSpan(`fs ${functionName}`);
                // Return to the context active during the call in the callback
                args[lastIdx] = api.context.bind(activeContext, function(error) {
                    if (error) {
                        span.recordException(error);
                        span.setStatus({
                            message: error.message,
                            code: api.SpanStatusCode.ERROR
                        });
                    }
                    instrumentation._runEndHook(functionName, {
                        args: args,
                        span,
                        error
                    });
                    span.end();
                    return cb.apply(this, arguments);
                });
                try {
                    // Suppress tracing for internal fs calls
                    return api.context.with((0, core_1.suppressTracing)(api.trace.setSpan(activeContext, span)), original, this, ...args);
                } catch (error) {
                    span.recordException(error);
                    span.setStatus({
                        message: error.message,
                        code: api.SpanStatusCode.ERROR
                    });
                    instrumentation._runEndHook(functionName, {
                        args: args,
                        span,
                        error
                    });
                    span.end();
                    throw error;
                }
            } else {
                // TODO: what to do if we are pretty sure it's going to throw
                return original.apply(this, args);
            }
        };
        return patchedFunctionWithOriginalProperties(patchedFunction, original);
    }
    _patchExistsCallbackFunction(functionName, original) {
        const instrumentation = this;
        const patchedFunction = function(...args) {
            const activeContext = api.context.active();
            if (!instrumentation._shouldTrace(activeContext)) {
                return original.apply(this, args);
            }
            if (instrumentation._runCreateHook(functionName, {
                args: args
            }) === false) {
                return api.context.with((0, core_1.suppressTracing)(activeContext), original, this, ...args);
            }
            const lastIdx = args.length - 1;
            const cb = args[lastIdx];
            if (typeof cb === 'function') {
                const span = instrumentation.tracer.startSpan(`fs ${functionName}`);
                // Return to the context active during the call in the callback
                args[lastIdx] = api.context.bind(activeContext, function() {
                    // `exists` never calls the callback with an error
                    instrumentation._runEndHook(functionName, {
                        args: args,
                        span
                    });
                    span.end();
                    return cb.apply(this, arguments);
                });
                try {
                    // Suppress tracing for internal fs calls
                    return api.context.with((0, core_1.suppressTracing)(api.trace.setSpan(activeContext, span)), original, this, ...args);
                } catch (error) {
                    span.recordException(error);
                    span.setStatus({
                        message: error.message,
                        code: api.SpanStatusCode.ERROR
                    });
                    instrumentation._runEndHook(functionName, {
                        args: args,
                        span,
                        error
                    });
                    span.end();
                    throw error;
                }
            } else {
                return original.apply(this, args);
            }
        };
        const functionWithOriginalProperties = patchedFunctionWithOriginalProperties(patchedFunction, original);
        // `exists` has a custom promisify function because of the inconsistent signature
        // replicating that on the patched function
        const promisified = function(path) {
            return new Promise((resolve)=>functionWithOriginalProperties(path, resolve));
        };
        Object.defineProperty(promisified, 'name', {
            value: functionName
        });
        Object.defineProperty(functionWithOriginalProperties, util_1.promisify.custom, {
            value: promisified
        });
        return functionWithOriginalProperties;
    }
    _patchPromiseFunction(functionName, original) {
        const instrumentation = this;
        const patchedFunction = async function(...args) {
            const activeContext = api.context.active();
            if (!instrumentation._shouldTrace(activeContext)) {
                return original.apply(this, args);
            }
            if (instrumentation._runCreateHook(functionName, {
                args: args
            }) === false) {
                return api.context.with((0, core_1.suppressTracing)(activeContext), original, this, ...args);
            }
            const span = instrumentation.tracer.startSpan(`fs ${functionName}`);
            try {
                // Suppress tracing for internal fs calls
                const res = await api.context.with((0, core_1.suppressTracing)(api.trace.setSpan(activeContext, span)), original, this, ...args);
                instrumentation._runEndHook(functionName, {
                    args: args,
                    span
                });
                return res;
            } catch (error) {
                span.recordException(error);
                span.setStatus({
                    message: error.message,
                    code: api.SpanStatusCode.ERROR
                });
                instrumentation._runEndHook(functionName, {
                    args: args,
                    span,
                    error
                });
                throw error;
            } finally{
                span.end();
            }
        };
        return patchedFunctionWithOriginalProperties(patchedFunction, original);
    }
    _runCreateHook(...args) {
        const { createHook } = this.getConfig();
        if (typeof createHook === 'function') {
            try {
                return createHook(...args);
            } catch (e) {
                this._diag.error('caught createHook error', e);
            }
        }
        return true;
    }
    _runEndHook(...args) {
        const { endHook } = this.getConfig();
        if (typeof endHook === 'function') {
            try {
                endHook(...args);
            } catch (e) {
                this._diag.error('caught endHook error', e);
            }
        }
    }
    _shouldTrace(context) {
        if ((0, core_1.isTracingSuppressed)(context)) {
            // Performance optimization. Avoid creating additional contexts and spans
            // if we already know that the tracing is being suppressed.
            return false;
        }
        const { requireParentSpan } = this.getConfig();
        if (requireParentSpan) {
            const parentSpan = api.trace.getSpan(context);
            if (parentSpan == null) {
                return false;
            }
        }
        return true;
    }
}
exports.FsInstrumentation = FsInstrumentation;
}),
"[project]/node_modules/@opentelemetry/instrumentation-fs/build/src/types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
}),
"[project]/node_modules/@opentelemetry/instrumentation-fs/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-fs/build/src/instrumentation.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-fs/build/src/types.js [app-route] (ecmascript)"), exports);
}),
"[project]/node_modules/@opentelemetry/instrumentation-express/build/src/enums/ExpressLayerType.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ExpressLayerType = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var ExpressLayerType;
(function(ExpressLayerType) {
    ExpressLayerType["ROUTER"] = "router";
    ExpressLayerType["MIDDLEWARE"] = "middleware";
    ExpressLayerType["REQUEST_HANDLER"] = "request_handler";
})(ExpressLayerType = exports.ExpressLayerType || (exports.ExpressLayerType = {}));
}),
"[project]/node_modules/@opentelemetry/instrumentation-express/build/src/enums/AttributeNames.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AttributeNames = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var AttributeNames;
(function(AttributeNames) {
    AttributeNames["EXPRESS_TYPE"] = "express.type";
    AttributeNames["EXPRESS_NAME"] = "express.name";
})(AttributeNames = exports.AttributeNames || (exports.AttributeNames = {}));
}),
"[project]/node_modules/@opentelemetry/instrumentation-express/build/src/internal-types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports._LAYERS_STORE_PROPERTY = exports.kLayerPatched = void 0;
/**
 * This symbol is used to mark express layer as being already instrumented
 * since its possible to use a given layer multiple times (ex: middlewares)
 */ exports.kLayerPatched = Symbol('express-layer-patched');
/**
 * This const define where on the `request` object the Instrumentation will mount the
 * current stack of express layer.
 *
 * It is necessary because express doesn't store the different layers
 * (ie: middleware, router etc) that it called to get to the current layer.
 * Given that, the only way to know the route of a given layer is to
 * store the path of where each previous layer has been mounted.
 *
 * ex: bodyParser > auth middleware > /users router > get /:id
 *  in this case the stack would be: ["/users", "/:id"]
 *
 * ex2: bodyParser > /api router > /v1 router > /users router > get /:id
 *  stack: ["/api", "/v1", "/users", ":id"]
 *
 */ exports._LAYERS_STORE_PROPERTY = '__ot_middlewares';
}),
"[project]/node_modules/@opentelemetry/instrumentation-express/build/src/utils.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getLayerPath = exports.asErrorAndMessage = exports.isLayerIgnored = exports.getLayerMetadata = exports.getRouterPath = exports.storeLayerPath = void 0;
const ExpressLayerType_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-express/build/src/enums/ExpressLayerType.js [app-route] (ecmascript)");
const AttributeNames_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-express/build/src/enums/AttributeNames.js [app-route] (ecmascript)");
const internal_types_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-express/build/src/internal-types.js [app-route] (ecmascript)");
/**
 * Store layers path in the request to be able to construct route later
 * @param request The request where
 * @param [value] the value to push into the array
 */ const storeLayerPath = (request, value)=>{
    if (Array.isArray(request[internal_types_1._LAYERS_STORE_PROPERTY]) === false) {
        Object.defineProperty(request, internal_types_1._LAYERS_STORE_PROPERTY, {
            enumerable: false,
            value: []
        });
    }
    if (value === undefined) return;
    request[internal_types_1._LAYERS_STORE_PROPERTY].push(value);
};
exports.storeLayerPath = storeLayerPath;
/**
 * Recursively search the router path from layer stack
 * @param path The path to reconstruct
 * @param layer The layer to reconstruct from
 * @returns The reconstructed path
 */ const getRouterPath = (path, layer)=>{
    var _a, _b, _c, _d;
    const stackLayer = (_b = (_a = layer.handle) === null || _a === void 0 ? void 0 : _a.stack) === null || _b === void 0 ? void 0 : _b[0];
    if ((_c = stackLayer === null || stackLayer === void 0 ? void 0 : stackLayer.route) === null || _c === void 0 ? void 0 : _c.path) {
        return `${path}${stackLayer.route.path}`;
    }
    if ((_d = stackLayer === null || stackLayer === void 0 ? void 0 : stackLayer.handle) === null || _d === void 0 ? void 0 : _d.stack) {
        return (0, exports.getRouterPath)(path, stackLayer);
    }
    return path;
};
exports.getRouterPath = getRouterPath;
/**
 * Parse express layer context to retrieve a name and attributes.
 * @param route The route of the layer
 * @param layer Express layer
 * @param [layerPath] if present, the path on which the layer has been mounted
 */ const getLayerMetadata = (route, layer, layerPath)=>{
    var _a;
    if (layer.name === 'router') {
        const maybeRouterPath = (0, exports.getRouterPath)('', layer);
        const extractedRouterPath = maybeRouterPath ? maybeRouterPath : layerPath || route || '/';
        return {
            attributes: {
                [AttributeNames_1.AttributeNames.EXPRESS_NAME]: extractedRouterPath,
                [AttributeNames_1.AttributeNames.EXPRESS_TYPE]: ExpressLayerType_1.ExpressLayerType.ROUTER
            },
            name: `router - ${extractedRouterPath}`
        };
    } else if (layer.name === 'bound dispatch') {
        return {
            attributes: {
                [AttributeNames_1.AttributeNames.EXPRESS_NAME]: (_a = route || layerPath) !== null && _a !== void 0 ? _a : 'request handler',
                [AttributeNames_1.AttributeNames.EXPRESS_TYPE]: ExpressLayerType_1.ExpressLayerType.REQUEST_HANDLER
            },
            name: `request handler${layer.path ? ` - ${route || layerPath}` : ''}`
        };
    } else {
        return {
            attributes: {
                [AttributeNames_1.AttributeNames.EXPRESS_NAME]: layer.name,
                [AttributeNames_1.AttributeNames.EXPRESS_TYPE]: ExpressLayerType_1.ExpressLayerType.MIDDLEWARE
            },
            name: `middleware - ${layer.name}`
        };
    }
};
exports.getLayerMetadata = getLayerMetadata;
/**
 * Check whether the given obj match pattern
 * @param constant e.g URL of request
 * @param obj obj to inspect
 * @param pattern Match pattern
 */ const satisfiesPattern = (constant, pattern)=>{
    if (typeof pattern === 'string') {
        return pattern === constant;
    } else if (pattern instanceof RegExp) {
        return pattern.test(constant);
    } else if (typeof pattern === 'function') {
        return pattern(constant);
    } else {
        throw new TypeError('Pattern is in unsupported datatype');
    }
};
/**
 * Check whether the given request is ignored by configuration
 * It will not re-throw exceptions from `list` provided by the client
 * @param constant e.g URL of request
 * @param [list] List of ignore patterns
 * @param [onException] callback for doing something when an exception has
 *     occurred
 */ const isLayerIgnored = (name, type, config)=>{
    var _a;
    if (Array.isArray(config === null || config === void 0 ? void 0 : config.ignoreLayersType) && ((_a = config === null || config === void 0 ? void 0 : config.ignoreLayersType) === null || _a === void 0 ? void 0 : _a.includes(type))) {
        return true;
    }
    if (Array.isArray(config === null || config === void 0 ? void 0 : config.ignoreLayers) === false) return false;
    try {
        for (const pattern of config.ignoreLayers){
            if (satisfiesPattern(name, pattern)) {
                return true;
            }
        }
    } catch (e) {
    /* catch block*/ }
    return false;
};
exports.isLayerIgnored = isLayerIgnored;
/**
 * Converts a user-provided error value into an error and error message pair
 *
 * @param error - User-provided error value
 * @returns Both an Error or string representation of the value and an error message
 */ const asErrorAndMessage = (error)=>error instanceof Error ? [
        error,
        error.message
    ] : [
        String(error),
        String(error)
    ];
exports.asErrorAndMessage = asErrorAndMessage;
/**
 * Extracts the layer path from the route arguments
 *
 * @param args - Arguments of the route
 * @returns The layer path
 */ const getLayerPath = (args)=>{
    const firstArg = args[0];
    if (Array.isArray(firstArg)) {
        return firstArg.map((arg)=>extractLayerPathSegment(arg) || '').join(',');
    }
    return extractLayerPathSegment(firstArg);
};
exports.getLayerPath = getLayerPath;
const extractLayerPathSegment = (arg)=>{
    if (typeof arg === 'string') {
        return arg;
    }
    if (arg instanceof RegExp || typeof arg === 'number') {
        return arg.toString();
    }
    return;
};
}),
"[project]/node_modules/@opentelemetry/instrumentation-express/build/src/version.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
// this is autogenerated file, see scripts/version-update.js
exports.PACKAGE_VERSION = '0.47.1';
exports.PACKAGE_NAME = '@opentelemetry/instrumentation-express';
}),
"[project]/node_modules/@opentelemetry/instrumentation-express/build/src/instrumentation.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ExpressInstrumentation = void 0;
const core_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/core/build/esm/index.js [app-route] (ecmascript)");
const api_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const ExpressLayerType_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-express/build/src/enums/ExpressLayerType.js [app-route] (ecmascript)");
const AttributeNames_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-express/build/src/enums/AttributeNames.js [app-route] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-express/build/src/utils.js [app-route] (ecmascript)");
/** @knipignore */ const version_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-express/build/src/version.js [app-route] (ecmascript)");
const instrumentation_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
const semantic_conventions_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/semantic-conventions/build/esm/index.js [app-route] (ecmascript)");
const internal_types_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-express/build/src/internal-types.js [app-route] (ecmascript)");
/** Express instrumentation for OpenTelemetry */ class ExpressInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}){
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
    }
    init() {
        return [
            new instrumentation_1.InstrumentationNodeModuleDefinition('express', [
                '>=4.0.0 <5'
            ], (moduleExports)=>{
                const routerProto = moduleExports.Router;
                // patch express.Router.route
                if ((0, instrumentation_1.isWrapped)(routerProto.route)) {
                    this._unwrap(routerProto, 'route');
                }
                this._wrap(routerProto, 'route', this._getRoutePatch());
                // patch express.Router.use
                if ((0, instrumentation_1.isWrapped)(routerProto.use)) {
                    this._unwrap(routerProto, 'use');
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this._wrap(routerProto, 'use', this._getRouterUsePatch());
                // patch express.Application.use
                if ((0, instrumentation_1.isWrapped)(moduleExports.application.use)) {
                    this._unwrap(moduleExports.application, 'use');
                }
                this._wrap(moduleExports.application, 'use', // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this._getAppUsePatch());
                return moduleExports;
            }, (moduleExports)=>{
                if (moduleExports === undefined) return;
                const routerProto = moduleExports.Router;
                this._unwrap(routerProto, 'route');
                this._unwrap(routerProto, 'use');
                this._unwrap(moduleExports.application, 'use');
            })
        ];
    }
    /**
     * Get the patch for Router.route function
     */ _getRoutePatch() {
        const instrumentation = this;
        return function(original) {
            return function route_trace(...args) {
                const route = original.apply(this, args);
                const layer = this.stack[this.stack.length - 1];
                instrumentation._applyPatch(layer, (0, utils_1.getLayerPath)(args));
                return route;
            };
        };
    }
    /**
     * Get the patch for Router.use function
     */ _getRouterUsePatch() {
        const instrumentation = this;
        return function(original) {
            return function use(...args) {
                const route = original.apply(this, args);
                const layer = this.stack[this.stack.length - 1];
                instrumentation._applyPatch(layer, (0, utils_1.getLayerPath)(args));
                return route;
            };
        };
    }
    /**
     * Get the patch for Application.use function
     */ _getAppUsePatch() {
        const instrumentation = this;
        return function(original) {
            return function use(...args) {
                const route = original.apply(this, args);
                const layer = this._router.stack[this._router.stack.length - 1];
                instrumentation._applyPatch(layer, (0, utils_1.getLayerPath)(args));
                return route;
            };
        };
    }
    /** Patch each express layer to create span and propagate context */ _applyPatch(layer, layerPath) {
        const instrumentation = this;
        // avoid patching multiple times the same layer
        if (layer[internal_types_1.kLayerPatched] === true) return;
        layer[internal_types_1.kLayerPatched] = true;
        this._wrap(layer, 'handle', (original)=>{
            // TODO: instrument error handlers
            if (original.length === 4) return original;
            const patched = function(req, res) {
                (0, utils_1.storeLayerPath)(req, layerPath);
                const route = req[internal_types_1._LAYERS_STORE_PROPERTY].filter((path)=>path !== '/' && path !== '/*').join('')// remove duplicate slashes to normalize route
                .replace(/\/{2,}/g, '/');
                const attributes = {
                    [semantic_conventions_1.SEMATTRS_HTTP_ROUTE]: route.length > 0 ? route : '/'
                };
                const metadata = (0, utils_1.getLayerMetadata)(route, layer, layerPath);
                const type = metadata.attributes[AttributeNames_1.AttributeNames.EXPRESS_TYPE];
                const rpcMetadata = (0, core_1.getRPCMetadata)(api_1.context.active());
                if ((rpcMetadata === null || rpcMetadata === void 0 ? void 0 : rpcMetadata.type) === core_1.RPCType.HTTP) {
                    rpcMetadata.route = route || '/';
                }
                // verify against the config if the layer should be ignored
                if ((0, utils_1.isLayerIgnored)(metadata.name, type, instrumentation.getConfig())) {
                    if (type === ExpressLayerType_1.ExpressLayerType.MIDDLEWARE) {
                        req[internal_types_1._LAYERS_STORE_PROPERTY].pop();
                    }
                    return original.apply(this, arguments);
                }
                if (api_1.trace.getSpan(api_1.context.active()) === undefined) {
                    return original.apply(this, arguments);
                }
                const spanName = instrumentation._getSpanName({
                    request: req,
                    layerType: type,
                    route
                }, metadata.name);
                const span = instrumentation.tracer.startSpan(spanName, {
                    attributes: Object.assign(attributes, metadata.attributes)
                });
                const { requestHook } = instrumentation.getConfig();
                if (requestHook) {
                    (0, instrumentation_1.safeExecuteInTheMiddle)(()=>requestHook(span, {
                            request: req,
                            layerType: type,
                            route
                        }), (e)=>{
                        if (e) {
                            api_1.diag.error('express instrumentation: request hook failed', e);
                        }
                    }, true);
                }
                let spanHasEnded = false;
                if (metadata.attributes[AttributeNames_1.AttributeNames.EXPRESS_TYPE] !== ExpressLayerType_1.ExpressLayerType.MIDDLEWARE) {
                    span.end();
                    spanHasEnded = true;
                }
                // listener for response.on('finish')
                const onResponseFinish = ()=>{
                    if (spanHasEnded === false) {
                        spanHasEnded = true;
                        span.end();
                    }
                };
                // verify we have a callback
                const args = Array.from(arguments);
                const callbackIdx = args.findIndex((arg)=>typeof arg === 'function');
                if (callbackIdx >= 0) {
                    arguments[callbackIdx] = function() {
                        var _a;
                        // express considers anything but an empty value, "route" or "router"
                        // passed to its callback to be an error
                        const maybeError = arguments[0];
                        const isError = ![
                            undefined,
                            null,
                            'route',
                            'router'
                        ].includes(maybeError);
                        if (!spanHasEnded && isError) {
                            const [error, message] = (0, utils_1.asErrorAndMessage)(maybeError);
                            span.recordException(error);
                            span.setStatus({
                                code: api_1.SpanStatusCode.ERROR,
                                message
                            });
                        }
                        if (spanHasEnded === false) {
                            spanHasEnded = true;
                            (_a = req.res) === null || _a === void 0 ? void 0 : _a.removeListener('finish', onResponseFinish);
                            span.end();
                        }
                        if (!(req.route && isError)) {
                            req[internal_types_1._LAYERS_STORE_PROPERTY].pop();
                        }
                        const callback = args[callbackIdx];
                        return callback.apply(this, arguments);
                    };
                }
                try {
                    return original.apply(this, arguments);
                } catch (anyError) {
                    const [error, message] = (0, utils_1.asErrorAndMessage)(anyError);
                    span.recordException(error);
                    span.setStatus({
                        code: api_1.SpanStatusCode.ERROR,
                        message
                    });
                    throw anyError;
                } finally{
                    /**
                     * At this point if the callback wasn't called, that means either the
                     * layer is asynchronous (so it will call the callback later on) or that
                     * the layer directly end the http response, so we'll hook into the "finish"
                     * event to handle the later case.
                     */ if (!spanHasEnded) {
                        res.once('finish', onResponseFinish);
                    }
                }
            };
            // `handle` isn't just a regular function in some cases. It also contains
            // some properties holding metadata and state so we need to proxy them
            // through through patched function
            // ref: https://github.com/open-telemetry/opentelemetry-js-contrib/issues/1950
            // Also some apps/libs do their own patching before OTEL and have these properties
            // in the proptotype. So we use a `for...in` loop to get own properties and also
            // any enumerable prop in the prototype chain
            // ref: https://github.com/open-telemetry/opentelemetry-js-contrib/issues/2271
            for(const key in original){
                Object.defineProperty(patched, key, {
                    get () {
                        return original[key];
                    },
                    set (value) {
                        original[key] = value;
                    }
                });
            }
            return patched;
        });
    }
    _getSpanName(info, defaultName) {
        var _a;
        const { spanNameHook } = this.getConfig();
        if (!(spanNameHook instanceof Function)) {
            return defaultName;
        }
        try {
            return (_a = spanNameHook(info, defaultName)) !== null && _a !== void 0 ? _a : defaultName;
        } catch (err) {
            api_1.diag.error('express instrumentation: error calling span name rewrite hook', err);
            return defaultName;
        }
    }
}
exports.ExpressInstrumentation = ExpressInstrumentation;
}),
"[project]/node_modules/@opentelemetry/instrumentation-express/build/src/types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
}),
"[project]/node_modules/@opentelemetry/instrumentation-express/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-express/build/src/instrumentation.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-express/build/src/enums/ExpressLayerType.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-express/build/src/enums/AttributeNames.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-express/build/src/types.js [app-route] (ecmascript)"), exports);
}),
"[project]/node_modules/balanced-match/dist/esm/index.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "balanced",
    ()=>balanced,
    "range",
    ()=>range
]);
const balanced = (a, b, str)=>{
    const ma = a instanceof RegExp ? maybeMatch(a, str) : a;
    const mb = b instanceof RegExp ? maybeMatch(b, str) : b;
    const r = ma !== null && mb != null && range(ma, mb, str);
    return r && {
        start: r[0],
        end: r[1],
        pre: str.slice(0, r[0]),
        body: str.slice(r[0] + ma.length, r[1]),
        post: str.slice(r[1] + mb.length)
    };
};
const maybeMatch = (reg, str)=>{
    const m = str.match(reg);
    return m ? m[0] : null;
};
const range = (a, b, str)=>{
    let begs, beg, left, right = undefined, result;
    let ai = str.indexOf(a);
    let bi = str.indexOf(b, ai + 1);
    let i = ai;
    if (ai >= 0 && bi > 0) {
        if (a === b) {
            return [
                ai,
                bi
            ];
        }
        begs = [];
        left = str.length;
        while(i >= 0 && !result){
            if (i === ai) {
                begs.push(i);
                ai = str.indexOf(a, i + 1);
            } else if (begs.length === 1) {
                const r = begs.pop();
                if (r !== undefined) result = [
                    r,
                    bi
                ];
            } else {
                beg = begs.pop();
                if (beg !== undefined && beg < left) {
                    left = beg;
                    right = bi;
                }
                bi = str.indexOf(b, i + 1);
            }
            i = ai < bi && ai >= 0 ? ai : bi;
        }
        if (begs.length && right !== undefined) {
            result = [
                left,
                right
            ];
        }
    }
    return result;
};
}),
"[project]/node_modules/brace-expansion/dist/esm/index.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EXPANSION_MAX",
    ()=>EXPANSION_MAX,
    "expand",
    ()=>expand
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$balanced$2d$match$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/balanced-match/dist/esm/index.js [app-route] (ecmascript)");
;
const escSlash = '\0SLASH' + Math.random() + '\0';
const escOpen = '\0OPEN' + Math.random() + '\0';
const escClose = '\0CLOSE' + Math.random() + '\0';
const escComma = '\0COMMA' + Math.random() + '\0';
const escPeriod = '\0PERIOD' + Math.random() + '\0';
const escSlashPattern = new RegExp(escSlash, 'g');
const escOpenPattern = new RegExp(escOpen, 'g');
const escClosePattern = new RegExp(escClose, 'g');
const escCommaPattern = new RegExp(escComma, 'g');
const escPeriodPattern = new RegExp(escPeriod, 'g');
const slashPattern = /\\\\/g;
const openPattern = /\\{/g;
const closePattern = /\\}/g;
const commaPattern = /\\,/g;
const periodPattern = /\\./g;
const EXPANSION_MAX = 100_000;
function numeric(str) {
    return !isNaN(str) ? parseInt(str, 10) : str.charCodeAt(0);
}
function escapeBraces(str) {
    return str.replace(slashPattern, escSlash).replace(openPattern, escOpen).replace(closePattern, escClose).replace(commaPattern, escComma).replace(periodPattern, escPeriod);
}
function unescapeBraces(str) {
    return str.replace(escSlashPattern, '\\').replace(escOpenPattern, '{').replace(escClosePattern, '}').replace(escCommaPattern, ',').replace(escPeriodPattern, '.');
}
/**
 * Basically just str.split(","), but handling cases
 * where we have nested braced sections, which should be
 * treated as individual members, like {a,{b,c},d}
 */ function parseCommaParts(str) {
    if (!str) {
        return [
            ''
        ];
    }
    const parts = [];
    const m = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$balanced$2d$match$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["balanced"])('{', '}', str);
    if (!m) {
        return str.split(',');
    }
    const { pre, body, post } = m;
    const p = pre.split(',');
    p[p.length - 1] += '{' + body + '}';
    const postParts = parseCommaParts(post);
    if (post.length) {
        ;
        p[p.length - 1] += postParts.shift();
        p.push.apply(p, postParts);
    }
    parts.push.apply(parts, p);
    return parts;
}
function expand(str, options = {}) {
    if (!str) {
        return [];
    }
    const { max = EXPANSION_MAX } = options;
    // I don't know why Bash 4.3 does this, but it does.
    // Anything starting with {} will have the first two bytes preserved
    // but *only* at the top level, so {},a}b will not expand to anything,
    // but a{},b}c will be expanded to [a}c,abc].
    // One could argue that this is a bug in Bash, but since the goal of
    // this module is to match Bash's rules, we escape a leading {}
    if (str.slice(0, 2) === '{}') {
        str = '\\{\\}' + str.slice(2);
    }
    return expand_(escapeBraces(str), max, true).map(unescapeBraces);
}
function embrace(str) {
    return '{' + str + '}';
}
function isPadded(el) {
    return /^-?0\d/.test(el);
}
function lte(i, y) {
    return i <= y;
}
function gte(i, y) {
    return i >= y;
}
function expand_(str, max, isTop) {
    /** @type {string[]} */ const expansions = [];
    const m = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$balanced$2d$match$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["balanced"])('{', '}', str);
    if (!m) return [
        str
    ];
    // no need to expand pre, since it is guaranteed to be free of brace-sets
    const pre = m.pre;
    const post = m.post.length ? expand_(m.post, max, false) : [
        ''
    ];
    if (/\$$/.test(m.pre)) {
        for(let k = 0; k < post.length && k < max; k++){
            const expansion = pre + '{' + m.body + '}' + post[k];
            expansions.push(expansion);
        }
    } else {
        const isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
        const isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
        const isSequence = isNumericSequence || isAlphaSequence;
        const isOptions = m.body.indexOf(',') >= 0;
        if (!isSequence && !isOptions) {
            // {a},b}
            if (m.post.match(/,(?!,).*\}/)) {
                str = m.pre + '{' + m.body + escClose + m.post;
                return expand_(str, max, true);
            }
            return [
                str
            ];
        }
        let n;
        if (isSequence) {
            n = m.body.split(/\.\./);
        } else {
            n = parseCommaParts(m.body);
            if (n.length === 1 && n[0] !== undefined) {
                // x{{a,b}}y ==> x{a}y x{b}y
                n = expand_(n[0], max, false).map(embrace);
                //XXX is this necessary? Can't seem to hit it in tests.
                /* c8 ignore start */ if (n.length === 1) {
                    return post.map((p)=>m.pre + n[0] + p);
                }
            /* c8 ignore stop */ }
        }
        // at this point, n is the parts, and we know it's not a comma set
        // with a single entry.
        let N;
        if (isSequence && n[0] !== undefined && n[1] !== undefined) {
            const x = numeric(n[0]);
            const y = numeric(n[1]);
            const width = Math.max(n[0].length, n[1].length);
            let incr = n.length === 3 && n[2] !== undefined ? Math.abs(numeric(n[2])) : 1;
            let test = lte;
            const reverse = y < x;
            if (reverse) {
                incr *= -1;
                test = gte;
            }
            const pad = n.some(isPadded);
            N = [];
            for(let i = x; test(i, y); i += incr){
                let c;
                if (isAlphaSequence) {
                    c = String.fromCharCode(i);
                    if (c === '\\') {
                        c = '';
                    }
                } else {
                    c = String(i);
                    if (pad) {
                        const need = width - c.length;
                        if (need > 0) {
                            const z = new Array(need + 1).join('0');
                            if (i < 0) {
                                c = '-' + z + c.slice(1);
                            } else {
                                c = z + c;
                            }
                        }
                    }
                }
                N.push(c);
            }
        } else {
            N = [];
            for(let j = 0; j < n.length; j++){
                N.push.apply(N, expand_(n[j], max, false));
            }
        }
        for(let j = 0; j < N.length; j++){
            for(let k = 0; k < post.length && expansions.length < max; k++){
                const expansion = pre + N[j] + post[k];
                if (!isTop || isSequence || expansion) {
                    expansions.push(expansion);
                }
            }
        }
    }
    return expansions;
}
}),
"[project]/node_modules/minimatch/dist/esm/assert-valid-pattern.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assertValidPattern",
    ()=>assertValidPattern
]);
const MAX_PATTERN_LENGTH = 1024 * 64;
const assertValidPattern = (pattern)=>{
    if (typeof pattern !== 'string') {
        throw new TypeError('invalid pattern');
    }
    if (pattern.length > MAX_PATTERN_LENGTH) {
        throw new TypeError('pattern is too long');
    }
};
}),
"[project]/node_modules/minimatch/dist/esm/brace-expressions.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseClass",
    ()=>parseClass
]);
// translate the various posix character classes into unicode properties
// this works across all unicode locales
// { <posix class>: [<translation>, /u flag required, negated]
const posixClasses = {
    '[:alnum:]': [
        '\\p{L}\\p{Nl}\\p{Nd}',
        true
    ],
    '[:alpha:]': [
        '\\p{L}\\p{Nl}',
        true
    ],
    '[:ascii:]': [
        '\\x' + '00-\\x' + '7f',
        false
    ],
    '[:blank:]': [
        '\\p{Zs}\\t',
        true
    ],
    '[:cntrl:]': [
        '\\p{Cc}',
        true
    ],
    '[:digit:]': [
        '\\p{Nd}',
        true
    ],
    '[:graph:]': [
        '\\p{Z}\\p{C}',
        true,
        true
    ],
    '[:lower:]': [
        '\\p{Ll}',
        true
    ],
    '[:print:]': [
        '\\p{C}',
        true
    ],
    '[:punct:]': [
        '\\p{P}',
        true
    ],
    '[:space:]': [
        '\\p{Z}\\t\\r\\n\\v\\f',
        true
    ],
    '[:upper:]': [
        '\\p{Lu}',
        true
    ],
    '[:word:]': [
        '\\p{L}\\p{Nl}\\p{Nd}\\p{Pc}',
        true
    ],
    '[:xdigit:]': [
        'A-Fa-f0-9',
        false
    ]
};
// only need to escape a few things inside of brace expressions
// escapes: [ \ ] -
const braceEscape = (s)=>s.replace(/[[\]\\-]/g, '\\$&');
// escape all regexp magic characters
const regexpEscape = (s)=>s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
// everything has already been escaped, we just have to join
const rangesToString = (ranges)=>ranges.join('');
const parseClass = (glob, position)=>{
    const pos = position;
    /* c8 ignore start */ if (glob.charAt(pos) !== '[') {
        throw new Error('not in a brace expression');
    }
    /* c8 ignore stop */ const ranges = [];
    const negs = [];
    let i = pos + 1;
    let sawStart = false;
    let uflag = false;
    let escaping = false;
    let negate = false;
    let endPos = pos;
    let rangeStart = '';
    WHILE: while(i < glob.length){
        const c = glob.charAt(i);
        if ((c === '!' || c === '^') && i === pos + 1) {
            negate = true;
            i++;
            continue;
        }
        if (c === ']' && sawStart && !escaping) {
            endPos = i + 1;
            break;
        }
        sawStart = true;
        if (c === '\\') {
            if (!escaping) {
                escaping = true;
                i++;
                continue;
            }
        // escaped \ char, fall through and treat like normal char
        }
        if (c === '[' && !escaping) {
            // either a posix class, a collation equivalent, or just a [
            for (const [cls, [unip, u, neg]] of Object.entries(posixClasses)){
                if (glob.startsWith(cls, i)) {
                    // invalid, [a-[] is fine, but not [a-[:alpha]]
                    if (rangeStart) {
                        return [
                            '$.',
                            false,
                            glob.length - pos,
                            true
                        ];
                    }
                    i += cls.length;
                    if (neg) negs.push(unip);
                    else ranges.push(unip);
                    uflag = uflag || u;
                    continue WHILE;
                }
            }
        }
        // now it's just a normal character, effectively
        escaping = false;
        if (rangeStart) {
            // throw this range away if it's not valid, but others
            // can still match.
            if (c > rangeStart) {
                ranges.push(braceEscape(rangeStart) + '-' + braceEscape(c));
            } else if (c === rangeStart) {
                ranges.push(braceEscape(c));
            }
            rangeStart = '';
            i++;
            continue;
        }
        // now might be the start of a range.
        // can be either c-d or c-] or c<more...>] or c] at this point
        if (glob.startsWith('-]', i + 1)) {
            ranges.push(braceEscape(c + '-'));
            i += 2;
            continue;
        }
        if (glob.startsWith('-', i + 1)) {
            rangeStart = c;
            i += 2;
            continue;
        }
        // not the start of a range, just a single character
        ranges.push(braceEscape(c));
        i++;
    }
    if (endPos < i) {
        // didn't see the end of the class, not a valid class,
        // but might still be valid as a literal match.
        return [
            '',
            false,
            0,
            false
        ];
    }
    // if we got no ranges and no negates, then we have a range that
    // cannot possibly match anything, and that poisons the whole glob
    if (!ranges.length && !negs.length) {
        return [
            '$.',
            false,
            glob.length - pos,
            true
        ];
    }
    // if we got one positive range, and it's a single character, then that's
    // not actually a magic pattern, it's just that one literal character.
    // we should not treat that as "magic", we should just return the literal
    // character. [_] is a perfectly valid way to escape glob magic chars.
    if (negs.length === 0 && ranges.length === 1 && /^\\?.$/.test(ranges[0]) && !negate) {
        const r = ranges[0].length === 2 ? ranges[0].slice(-1) : ranges[0];
        return [
            regexpEscape(r),
            false,
            endPos - pos,
            false
        ];
    }
    const sranges = '[' + (negate ? '^' : '') + rangesToString(ranges) + ']';
    const snegs = '[' + (negate ? '' : '^') + rangesToString(negs) + ']';
    const comb = ranges.length && negs.length ? '(' + sranges + '|' + snegs + ')' : ranges.length ? sranges : snegs;
    return [
        comb,
        uflag,
        endPos - pos,
        true
    ];
};
}),
"[project]/node_modules/minimatch/dist/esm/unescape.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Un-escape a string that has been escaped with {@link escape}.
 *
 * If the {@link windowsPathsNoEscape} option is used, then square-brace
 * escapes are removed, but not backslash escapes.  For example, it will turn
 * the string `'[*]'` into `*`, but it will not turn `'\\*'` into `'*'`,
 * becuase `\` is a path separator in `windowsPathsNoEscape` mode.
 *
 * When `windowsPathsNoEscape` is not set, then both brace escapes and
 * backslash escapes are removed.
 *
 * Slashes (and backslashes in `windowsPathsNoEscape` mode) cannot be escaped
 * or unescaped.
 */ __turbopack_context__.s([
    "unescape",
    ()=>unescape
]);
const unescape = (s, { windowsPathsNoEscape = false } = {})=>{
    return windowsPathsNoEscape ? s.replace(/\[([^\/\\])\]/g, '$1') : s.replace(/((?!\\).|^)\[([^\/\\])\]/g, '$1$2').replace(/\\([^\/])/g, '$1');
};
}),
"[project]/node_modules/minimatch/dist/esm/ast.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AST",
    ()=>AST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$minimatch$2f$dist$2f$esm$2f$brace$2d$expressions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/minimatch/dist/esm/brace-expressions.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$minimatch$2f$dist$2f$esm$2f$unescape$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/minimatch/dist/esm/unescape.js [app-route] (ecmascript)");
// parse a single path portion
var _a;
;
;
const types = new Set([
    '!',
    '?',
    '+',
    '*',
    '@'
]);
const isExtglobType = (c)=>types.has(c);
const isExtglobAST = (c)=>isExtglobType(c.type);
const adoptionMap = new Map([
    [
        '!',
        [
            '@'
        ]
    ],
    [
        '?',
        [
            '?',
            '@'
        ]
    ],
    [
        '@',
        [
            '@'
        ]
    ],
    [
        '*',
        [
            '*',
            '+',
            '?',
            '@'
        ]
    ],
    [
        '+',
        [
            '+',
            '@'
        ]
    ]
]);
const adoptionWithSpaceMap = new Map([
    [
        '!',
        [
            '?'
        ]
    ],
    [
        '@',
        [
            '?'
        ]
    ],
    [
        '+',
        [
            '?',
            '*'
        ]
    ]
]);
const adoptionAnyMap = new Map([
    [
        '!',
        [
            '?',
            '@'
        ]
    ],
    [
        '?',
        [
            '?',
            '@'
        ]
    ],
    [
        '@',
        [
            '?',
            '@'
        ]
    ],
    [
        '*',
        [
            '*',
            '+',
            '?',
            '@'
        ]
    ],
    [
        '+',
        [
            '+',
            '@',
            '?',
            '*'
        ]
    ]
]);
const usurpMap = new Map([
    [
        '!',
        new Map([
            [
                '!',
                '@'
            ]
        ])
    ],
    [
        '?',
        new Map([
            [
                '*',
                '*'
            ],
            [
                '+',
                '*'
            ]
        ])
    ],
    [
        '@',
        new Map([
            [
                '!',
                '!'
            ],
            [
                '?',
                '?'
            ],
            [
                '@',
                '@'
            ],
            [
                '*',
                '*'
            ],
            [
                '+',
                '+'
            ]
        ])
    ],
    [
        '+',
        new Map([
            [
                '?',
                '*'
            ],
            [
                '*',
                '*'
            ]
        ])
    ]
]);
// Patterns that get prepended to bind to the start of either the
// entire string, or just a single path portion, to prevent dots
// and/or traversal patterns, when needed.
// Exts don't need the ^ or / bit, because the root binds that already.
const startNoTraversal = '(?!(?:^|/)\\.\\.?(?:$|/))';
const startNoDot = '(?!\\.)';
// characters that indicate a start of pattern needs the "no dots" bit,
// because a dot *might* be matched. ( is not in the list, because in
// the case of a child extglob, it will handle the prevention itself.
const addPatternStart = new Set([
    '[',
    '.'
]);
// cases where traversal is A-OK, no dot prevention needed
const justDots = new Set([
    '..',
    '.'
]);
const reSpecials = new Set('().*{}+?[]^$\\!');
const regExpEscape = (s)=>s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
// any single thing other than /
const qmark = '[^/]';
// * => any number of characters
const star = qmark + '*?';
// use + when we need to ensure that *something* matches, because the * is
// the only thing in the path portion.
const starNoEmpty = qmark + '+?';
class AST {
    type;
    #root;
    #hasMagic;
    #uflag = false;
    #parts = [];
    #parent;
    #parentIndex;
    #negs;
    #filledNegs = false;
    #options;
    #toString;
    // set to true if it's an extglob with no children
    // (which really means one child of '')
    #emptyExt = false;
    constructor(type, parent, options = {}){
        this.type = type;
        // extglobs are inherently magical
        if (type) this.#hasMagic = true;
        this.#parent = parent;
        this.#root = this.#parent ? this.#parent.#root : this;
        this.#options = this.#root === this ? options : this.#root.#options;
        this.#negs = this.#root === this ? [] : this.#root.#negs;
        if (type === '!' && !this.#root.#filledNegs) this.#negs.push(this);
        this.#parentIndex = this.#parent ? this.#parent.#parts.length : 0;
    }
    get hasMagic() {
        /* c8 ignore start */ if (this.#hasMagic !== undefined) return this.#hasMagic;
        /* c8 ignore stop */ for (const p of this.#parts){
            if (typeof p === 'string') continue;
            if (p.type || p.hasMagic) return this.#hasMagic = true;
        }
        // note: will be undefined until we generate the regexp src and find out
        return this.#hasMagic;
    }
    // reconstructs the pattern
    toString() {
        if (this.#toString !== undefined) return this.#toString;
        if (!this.type) {
            return this.#toString = this.#parts.map((p)=>String(p)).join('');
        } else {
            return this.#toString = this.type + '(' + this.#parts.map((p)=>String(p)).join('|') + ')';
        }
    }
    #fillNegs() {
        /* c8 ignore start */ if (this !== this.#root) throw new Error('should only call on root');
        if (this.#filledNegs) return this;
        /* c8 ignore stop */ // call toString() once to fill this out
        this.toString();
        this.#filledNegs = true;
        let n;
        while(n = this.#negs.pop()){
            if (n.type !== '!') continue;
            // walk up the tree, appending everthing that comes AFTER parentIndex
            let p = n;
            let pp = p.#parent;
            while(pp){
                for(let i = p.#parentIndex + 1; !pp.type && i < pp.#parts.length; i++){
                    for (const part of n.#parts){
                        /* c8 ignore start */ if (typeof part === 'string') {
                            throw new Error('string part in extglob AST??');
                        }
                        /* c8 ignore stop */ part.copyIn(pp.#parts[i]);
                    }
                }
                p = pp;
                pp = p.#parent;
            }
        }
        return this;
    }
    push(...parts) {
        for (const p of parts){
            if (p === '') continue;
            /* c8 ignore start */ if (typeof p !== 'string' && !(p instanceof _a && p.#parent === this)) {
                throw new Error('invalid part: ' + p);
            }
            /* c8 ignore stop */ this.#parts.push(p);
        }
    }
    toJSON() {
        const ret = this.type === null ? this.#parts.slice().map((p)=>typeof p === 'string' ? p : p.toJSON()) : [
            this.type,
            ...this.#parts.map((p)=>p.toJSON())
        ];
        if (this.isStart() && !this.type) ret.unshift([]);
        if (this.isEnd() && (this === this.#root || this.#root.#filledNegs && this.#parent?.type === '!')) {
            ret.push({});
        }
        return ret;
    }
    isStart() {
        if (this.#root === this) return true;
        // if (this.type) return !!this.#parent?.isStart()
        if (!this.#parent?.isStart()) return false;
        if (this.#parentIndex === 0) return true;
        // if everything AHEAD of this is a negation, then it's still the "start"
        const p = this.#parent;
        for(let i = 0; i < this.#parentIndex; i++){
            const pp = p.#parts[i];
            if (!(pp instanceof _a && pp.type === '!')) {
                return false;
            }
        }
        return true;
    }
    isEnd() {
        if (this.#root === this) return true;
        if (this.#parent?.type === '!') return true;
        if (!this.#parent?.isEnd()) return false;
        if (!this.type) return this.#parent?.isEnd();
        // if not root, it'll always have a parent
        /* c8 ignore start */ const pl = this.#parent ? this.#parent.#parts.length : 0;
        /* c8 ignore stop */ return this.#parentIndex === pl - 1;
    }
    copyIn(part) {
        if (typeof part === 'string') this.push(part);
        else this.push(part.clone(this));
    }
    clone(parent) {
        const c = new _a(this.type, parent);
        for (const p of this.#parts){
            c.copyIn(p);
        }
        return c;
    }
    static #parseAST(str, ast, pos, opt, extDepth) {
        const maxDepth = opt.maxExtglobRecursion ?? 2;
        let escaping = false;
        let inBrace = false;
        let braceStart = -1;
        let braceNeg = false;
        if (ast.type === null) {
            // outside of a extglob, append until we find a start
            let i = pos;
            let acc = '';
            while(i < str.length){
                const c = str.charAt(i++);
                // still accumulate escapes at this point, but we do ignore
                // starts that are escaped
                if (escaping || c === '\\') {
                    escaping = !escaping;
                    acc += c;
                    continue;
                }
                if (inBrace) {
                    if (i === braceStart + 1) {
                        if (c === '^' || c === '!') {
                            braceNeg = true;
                        }
                    } else if (c === ']' && !(i === braceStart + 2 && braceNeg)) {
                        inBrace = false;
                    }
                    acc += c;
                    continue;
                } else if (c === '[') {
                    inBrace = true;
                    braceStart = i;
                    braceNeg = false;
                    acc += c;
                    continue;
                }
                const doRecurse = !opt.noext && isExtglobType(c) && str.charAt(i) === '(' && extDepth <= maxDepth;
                if (doRecurse) {
                    ast.push(acc);
                    acc = '';
                    const ext = new _a(c, ast);
                    i = _a.#parseAST(str, ext, i, opt, extDepth + 1);
                    ast.push(ext);
                    continue;
                }
                acc += c;
            }
            ast.push(acc);
            return i;
        }
        // some kind of extglob, pos is at the (
        // find the next | or )
        let i = pos + 1;
        let part = new _a(null, ast);
        const parts = [];
        let acc = '';
        while(i < str.length){
            const c = str.charAt(i++);
            // still accumulate escapes at this point, but we do ignore
            // starts that are escaped
            if (escaping || c === '\\') {
                escaping = !escaping;
                acc += c;
                continue;
            }
            if (inBrace) {
                if (i === braceStart + 1) {
                    if (c === '^' || c === '!') {
                        braceNeg = true;
                    }
                } else if (c === ']' && !(i === braceStart + 2 && braceNeg)) {
                    inBrace = false;
                }
                acc += c;
                continue;
            } else if (c === '[') {
                inBrace = true;
                braceStart = i;
                braceNeg = false;
                acc += c;
                continue;
            }
            const doRecurse = isExtglobType(c) && str.charAt(i) === '(' && /* c8 ignore start - the maxDepth is sufficient here */ (extDepth <= maxDepth || ast && ast.#canAdoptType(c));
            /* c8 ignore stop */ if (doRecurse) {
                const depthAdd = ast && ast.#canAdoptType(c) ? 0 : 1;
                part.push(acc);
                acc = '';
                const ext = new _a(c, part);
                part.push(ext);
                i = _a.#parseAST(str, ext, i, opt, extDepth + depthAdd);
                continue;
            }
            if (c === '|') {
                part.push(acc);
                acc = '';
                parts.push(part);
                part = new _a(null, ast);
                continue;
            }
            if (c === ')') {
                if (acc === '' && ast.#parts.length === 0) {
                    ast.#emptyExt = true;
                }
                part.push(acc);
                acc = '';
                ast.push(...parts, part);
                return i;
            }
            acc += c;
        }
        // unfinished extglob
        // if we got here, it was a malformed extglob! not an extglob, but
        // maybe something else in there.
        ast.type = null;
        ast.#hasMagic = undefined;
        ast.#parts = [
            str.substring(pos - 1)
        ];
        return i;
    }
    #canAdoptWithSpace(child) {
        return this.#canAdopt(child, adoptionWithSpaceMap);
    }
    #canAdopt(child, map = adoptionMap) {
        if (!child || typeof child !== 'object' || child.type !== null || child.#parts.length !== 1 || this.type === null) {
            return false;
        }
        const gc = child.#parts[0];
        if (!gc || typeof gc !== 'object' || gc.type === null) {
            return false;
        }
        return this.#canAdoptType(gc.type, map);
    }
    #canAdoptType(c, map = adoptionAnyMap) {
        return !!map.get(this.type)?.includes(c);
    }
    #adoptWithSpace(child, index) {
        const gc = child.#parts[0];
        const blank = new _a(null, gc, this.options);
        blank.#parts.push('');
        gc.push(blank);
        this.#adopt(child, index);
    }
    #adopt(child, index) {
        const gc = child.#parts[0];
        this.#parts.splice(index, 1, ...gc.#parts);
        for (const p of gc.#parts){
            if (typeof p === 'object') p.#parent = this;
        }
        this.#toString = undefined;
    }
    #canUsurpType(c) {
        const m = usurpMap.get(this.type);
        return !!m?.has(c);
    }
    #canUsurp(child) {
        if (!child || typeof child !== 'object' || child.type !== null || child.#parts.length !== 1 || this.type === null || this.#parts.length !== 1) {
            return false;
        }
        const gc = child.#parts[0];
        if (!gc || typeof gc !== 'object' || gc.type === null) {
            return false;
        }
        return this.#canUsurpType(gc.type);
    }
    #usurp(child) {
        const m = usurpMap.get(this.type);
        const gc = child.#parts[0];
        const nt = m?.get(gc.type);
        /* c8 ignore start - impossible */ if (!nt) return false;
        /* c8 ignore stop */ this.#parts = gc.#parts;
        for (const p of this.#parts){
            if (typeof p === 'object') p.#parent = this;
        }
        this.type = nt;
        this.#toString = undefined;
        this.#emptyExt = false;
    }
    #flatten() {
        if (!isExtglobAST(this)) {
            for (const p of this.#parts){
                if (typeof p === 'object') p.#flatten();
            }
        } else {
            let iterations = 0;
            let done = false;
            do {
                done = true;
                for(let i = 0; i < this.#parts.length; i++){
                    const c = this.#parts[i];
                    if (typeof c === 'object') {
                        c.#flatten();
                        if (this.#canAdopt(c)) {
                            done = false;
                            this.#adopt(c, i);
                        } else if (this.#canAdoptWithSpace(c)) {
                            done = false;
                            this.#adoptWithSpace(c, i);
                        } else if (this.#canUsurp(c)) {
                            done = false;
                            this.#usurp(c);
                        }
                    }
                }
            }while (!done && ++iterations < 10)
        }
        this.#toString = undefined;
    }
    static fromGlob(pattern, options = {}) {
        const ast = new _a(null, undefined, options);
        _a.#parseAST(pattern, ast, 0, options, 0);
        return ast;
    }
    // returns the regular expression if there's magic, or the unescaped
    // string if not.
    toMMPattern() {
        // should only be called on root
        /* c8 ignore start */ if (this !== this.#root) return this.#root.toMMPattern();
        /* c8 ignore stop */ const glob = this.toString();
        const [re, body, hasMagic, uflag] = this.toRegExpSource();
        // if we're in nocase mode, and not nocaseMagicOnly, then we do
        // still need a regular expression if we have to case-insensitively
        // match capital/lowercase characters.
        const anyMagic = hasMagic || this.#hasMagic || this.#options.nocase && !this.#options.nocaseMagicOnly && glob.toUpperCase() !== glob.toLowerCase();
        if (!anyMagic) {
            return body;
        }
        const flags = (this.#options.nocase ? 'i' : '') + (uflag ? 'u' : '');
        return Object.assign(new RegExp(`^${re}$`, flags), {
            _src: re,
            _glob: glob
        });
    }
    get options() {
        return this.#options;
    }
    // returns the string match, the regexp source, whether there's magic
    // in the regexp (so a regular expression is required) and whether or
    // not the uflag is needed for the regular expression (for posix classes)
    // TODO: instead of injecting the start/end at this point, just return
    // the BODY of the regexp, along with the start/end portions suitable
    // for binding the start/end in either a joined full-path makeRe context
    // (where we bind to (^|/), or a standalone matchPart context (where
    // we bind to ^, and not /).  Otherwise slashes get duped!
    //
    // In part-matching mode, the start is:
    // - if not isStart: nothing
    // - if traversal possible, but not allowed: ^(?!\.\.?$)
    // - if dots allowed or not possible: ^
    // - if dots possible and not allowed: ^(?!\.)
    // end is:
    // - if not isEnd(): nothing
    // - else: $
    //
    // In full-path matching mode, we put the slash at the START of the
    // pattern, so start is:
    // - if first pattern: same as part-matching mode
    // - if not isStart(): nothing
    // - if traversal possible, but not allowed: /(?!\.\.?(?:$|/))
    // - if dots allowed or not possible: /
    // - if dots possible and not allowed: /(?!\.)
    // end is:
    // - if last pattern, same as part-matching mode
    // - else nothing
    //
    // Always put the (?:$|/) on negated tails, though, because that has to be
    // there to bind the end of the negated pattern portion, and it's easier to
    // just stick it in now rather than try to inject it later in the middle of
    // the pattern.
    //
    // We can just always return the same end, and leave it up to the caller
    // to know whether it's going to be used joined or in parts.
    // And, if the start is adjusted slightly, can do the same there:
    // - if not isStart: nothing
    // - if traversal possible, but not allowed: (?:/|^)(?!\.\.?$)
    // - if dots allowed or not possible: (?:/|^)
    // - if dots possible and not allowed: (?:/|^)(?!\.)
    //
    // But it's better to have a simpler binding without a conditional, for
    // performance, so probably better to return both start options.
    //
    // Then the caller just ignores the end if it's not the first pattern,
    // and the start always gets applied.
    //
    // But that's always going to be $ if it's the ending pattern, or nothing,
    // so the caller can just attach $ at the end of the pattern when building.
    //
    // So the todo is:
    // - better detect what kind of start is needed
    // - return both flavors of starting pattern
    // - attach $ at the end of the pattern when creating the actual RegExp
    //
    // Ah, but wait, no, that all only applies to the root when the first pattern
    // is not an extglob. If the first pattern IS an extglob, then we need all
    // that dot prevention biz to live in the extglob portions, because eg
    // +(*|.x*) can match .xy but not .yx.
    //
    // So, return the two flavors if it's #root and the first child is not an
    // AST, otherwise leave it to the child AST to handle it, and there,
    // use the (?:^|/) style of start binding.
    //
    // Even simplified further:
    // - Since the start for a join is eg /(?!\.) and the start for a part
    // is ^(?!\.), we can just prepend (?!\.) to the pattern (either root
    // or start or whatever) and prepend ^ or / at the Regexp construction.
    toRegExpSource(allowDot) {
        const dot = allowDot ?? !!this.#options.dot;
        if (this.#root === this) {
            this.#flatten();
            this.#fillNegs();
        }
        if (!isExtglobAST(this)) {
            const noEmpty = this.isStart() && this.isEnd();
            const src = this.#parts.map((p)=>{
                const [re, _, hasMagic, uflag] = typeof p === 'string' ? _a.#parseGlob(p, this.#hasMagic, noEmpty) : p.toRegExpSource(allowDot);
                this.#hasMagic = this.#hasMagic || hasMagic;
                this.#uflag = this.#uflag || uflag;
                return re;
            }).join('');
            let start = '';
            if (this.isStart()) {
                if (typeof this.#parts[0] === 'string') {
                    // this is the string that will match the start of the pattern,
                    // so we need to protect against dots and such.
                    // '.' and '..' cannot match unless the pattern is that exactly,
                    // even if it starts with . or dot:true is set.
                    const dotTravAllowed = this.#parts.length === 1 && justDots.has(this.#parts[0]);
                    if (!dotTravAllowed) {
                        const aps = addPatternStart;
                        // check if we have a possibility of matching . or ..,
                        // and prevent that.
                        const needNoTrav = // dots are allowed, and the pattern starts with [ or .
                        dot && aps.has(src.charAt(0)) || src.startsWith('\\.') && aps.has(src.charAt(2)) || src.startsWith('\\.\\.') && aps.has(src.charAt(4));
                        // no need to prevent dots if it can't match a dot, or if a
                        // sub-pattern will be preventing it anyway.
                        const needNoDot = !dot && !allowDot && aps.has(src.charAt(0));
                        start = needNoTrav ? startNoTraversal : needNoDot ? startNoDot : '';
                    }
                }
            }
            // append the "end of path portion" pattern to negation tails
            let end = '';
            if (this.isEnd() && this.#root.#filledNegs && this.#parent?.type === '!') {
                end = '(?:$|\\/)';
            }
            const final = start + src + end;
            return [
                final,
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$minimatch$2f$dist$2f$esm$2f$unescape$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unescape"])(src),
                this.#hasMagic = !!this.#hasMagic,
                this.#uflag
            ];
        }
        // We need to calculate the body *twice* if it's a repeat pattern
        // at the start, once in nodot mode, then again in dot mode, so a
        // pattern like *(?) can match 'x.y'
        const repeated = this.type === '*' || this.type === '+';
        // some kind of extglob
        const start = this.type === '!' ? '(?:(?!(?:' : '(?:';
        let body = this.#partsToRegExp(dot);
        if (this.isStart() && this.isEnd() && !body && this.type !== '!') {
            // invalid extglob, has to at least be *something* present, if it's
            // the entire path portion.
            const s = this.toString();
            const me = this;
            me.#parts = [
                s
            ];
            me.type = null;
            me.#hasMagic = undefined;
            return [
                s,
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$minimatch$2f$dist$2f$esm$2f$unescape$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unescape"])(this.toString()),
                false,
                false
            ];
        }
        // XXX abstract out this map method
        let bodyDotAllowed = !repeated || allowDot || dot || !startNoDot ? '' : this.#partsToRegExp(true);
        if (bodyDotAllowed === body) {
            bodyDotAllowed = '';
        }
        if (bodyDotAllowed) {
            body = `(?:${body})(?:${bodyDotAllowed})*?`;
        }
        // an empty !() is exactly equivalent to a starNoEmpty
        let final = '';
        if (this.type === '!' && this.#emptyExt) {
            final = (this.isStart() && !dot ? startNoDot : '') + starNoEmpty;
        } else {
            const close = this.type === '!' ? '))' + (this.isStart() && !dot && !allowDot ? startNoDot : '') + star + ')' : this.type === '@' ? ')' : this.type === '?' ? ')?' : this.type === '+' && bodyDotAllowed ? ')' : this.type === '*' && bodyDotAllowed ? `)?` : `)${this.type}`;
            final = start + body + close;
        }
        return [
            final,
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$minimatch$2f$dist$2f$esm$2f$unescape$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unescape"])(body),
            this.#hasMagic = !!this.#hasMagic,
            this.#uflag
        ];
    }
    #partsToRegExp(dot) {
        return this.#parts.map((p)=>{
            // extglob ASTs should only contain parent ASTs
            /* c8 ignore start */ if (typeof p === 'string') {
                throw new Error('string type in extglob ast??');
            }
            /* c8 ignore stop */ // can ignore hasMagic, because extglobs are already always magic
            const [re, _, _hasMagic, uflag] = p.toRegExpSource(dot);
            this.#uflag = this.#uflag || uflag;
            return re;
        }).filter((p)=>!(this.isStart() && this.isEnd()) || !!p).join('|');
    }
    static #parseGlob(glob, hasMagic, noEmpty = false) {
        let escaping = false;
        let re = '';
        let uflag = false;
        // multiple stars that aren't globstars coalesce into one *
        let inStar = false;
        for(let i = 0; i < glob.length; i++){
            const c = glob.charAt(i);
            if (escaping) {
                escaping = false;
                re += (reSpecials.has(c) ? '\\' : '') + c;
                inStar = false;
                continue;
            }
            if (c === '\\') {
                if (i === glob.length - 1) {
                    re += '\\\\';
                } else {
                    escaping = true;
                }
                continue;
            }
            if (c === '[') {
                const [src, needUflag, consumed, magic] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$minimatch$2f$dist$2f$esm$2f$brace$2d$expressions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseClass"])(glob, i);
                if (consumed) {
                    re += src;
                    uflag = uflag || needUflag;
                    i += consumed - 1;
                    hasMagic = hasMagic || magic;
                    inStar = false;
                    continue;
                }
            }
            if (c === '*') {
                if (inStar) continue;
                inStar = true;
                re += noEmpty && /^[*]+$/.test(glob) ? starNoEmpty : star;
                hasMagic = true;
                continue;
            } else {
                inStar = false;
            }
            if (c === '?') {
                re += qmark;
                hasMagic = true;
                continue;
            }
            re += regExpEscape(c);
        }
        return [
            re,
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$minimatch$2f$dist$2f$esm$2f$unescape$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unescape"])(glob),
            !!hasMagic,
            uflag
        ];
    }
}
_a = AST;
}),
"[project]/node_modules/minimatch/dist/esm/escape.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Escape all magic characters in a glob pattern.
 *
 * If the {@link windowsPathsNoEscape | GlobOptions.windowsPathsNoEscape}
 * option is used, then characters are escaped by wrapping in `[]`, because
 * a magic character wrapped in a character class can only be satisfied by
 * that exact character.  In this mode, `\` is _not_ escaped, because it is
 * not interpreted as a magic character, but instead as a path separator.
 */ __turbopack_context__.s([
    "escape",
    ()=>escape
]);
const escape = (s, { windowsPathsNoEscape = false } = {})=>{
    // don't need to escape +@! because we escape the parens
    // that make those magic, and escaping ! as [!] isn't valid,
    // because [!]] is a valid glob class meaning not ']'.
    return windowsPathsNoEscape ? s.replace(/[?*()[\]]/g, '[$&]') : s.replace(/[?*()[\]\\]/g, '\\$&');
};
}),
"[project]/node_modules/minimatch/dist/esm/index.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GLOBSTAR",
    ()=>GLOBSTAR,
    "Minimatch",
    ()=>Minimatch,
    "braceExpand",
    ()=>braceExpand,
    "defaults",
    ()=>defaults,
    "filter",
    ()=>filter,
    "makeRe",
    ()=>makeRe,
    "match",
    ()=>match,
    "minimatch",
    ()=>minimatch,
    "sep",
    ()=>sep
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$brace$2d$expansion$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/brace-expansion/dist/esm/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$minimatch$2f$dist$2f$esm$2f$assert$2d$valid$2d$pattern$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/minimatch/dist/esm/assert-valid-pattern.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$minimatch$2f$dist$2f$esm$2f$ast$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/minimatch/dist/esm/ast.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$minimatch$2f$dist$2f$esm$2f$escape$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/minimatch/dist/esm/escape.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$minimatch$2f$dist$2f$esm$2f$unescape$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/minimatch/dist/esm/unescape.js [app-route] (ecmascript)");
;
;
;
;
;
const minimatch = (p, pattern, options = {})=>{
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$minimatch$2f$dist$2f$esm$2f$assert$2d$valid$2d$pattern$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertValidPattern"])(pattern);
    // shortcut: comments match nothing.
    if (!options.nocomment && pattern.charAt(0) === '#') {
        return false;
    }
    return new Minimatch(pattern, options).match(p);
};
// Optimized checking for the most common glob patterns.
const starDotExtRE = /^\*+([^+@!?\*\[\(]*)$/;
const starDotExtTest = (ext)=>(f)=>!f.startsWith('.') && f.endsWith(ext);
const starDotExtTestDot = (ext)=>(f)=>f.endsWith(ext);
const starDotExtTestNocase = (ext)=>{
    ext = ext.toLowerCase();
    return (f)=>!f.startsWith('.') && f.toLowerCase().endsWith(ext);
};
const starDotExtTestNocaseDot = (ext)=>{
    ext = ext.toLowerCase();
    return (f)=>f.toLowerCase().endsWith(ext);
};
const starDotStarRE = /^\*+\.\*+$/;
const starDotStarTest = (f)=>!f.startsWith('.') && f.includes('.');
const starDotStarTestDot = (f)=>f !== '.' && f !== '..' && f.includes('.');
const dotStarRE = /^\.\*+$/;
const dotStarTest = (f)=>f !== '.' && f !== '..' && f.startsWith('.');
const starRE = /^\*+$/;
const starTest = (f)=>f.length !== 0 && !f.startsWith('.');
const starTestDot = (f)=>f.length !== 0 && f !== '.' && f !== '..';
const qmarksRE = /^\?+([^+@!?\*\[\(]*)?$/;
const qmarksTestNocase = ([$0, ext = ''])=>{
    const noext = qmarksTestNoExt([
        $0
    ]);
    if (!ext) return noext;
    ext = ext.toLowerCase();
    return (f)=>noext(f) && f.toLowerCase().endsWith(ext);
};
const qmarksTestNocaseDot = ([$0, ext = ''])=>{
    const noext = qmarksTestNoExtDot([
        $0
    ]);
    if (!ext) return noext;
    ext = ext.toLowerCase();
    return (f)=>noext(f) && f.toLowerCase().endsWith(ext);
};
const qmarksTestDot = ([$0, ext = ''])=>{
    const noext = qmarksTestNoExtDot([
        $0
    ]);
    return !ext ? noext : (f)=>noext(f) && f.endsWith(ext);
};
const qmarksTest = ([$0, ext = ''])=>{
    const noext = qmarksTestNoExt([
        $0
    ]);
    return !ext ? noext : (f)=>noext(f) && f.endsWith(ext);
};
const qmarksTestNoExt = ([$0])=>{
    const len = $0.length;
    return (f)=>f.length === len && !f.startsWith('.');
};
const qmarksTestNoExtDot = ([$0])=>{
    const len = $0.length;
    return (f)=>f.length === len && f !== '.' && f !== '..';
};
/* c8 ignore start */ const defaultPlatform = typeof process === 'object' && process ? typeof process.env === 'object' && process.env && process.env.__MINIMATCH_TESTING_PLATFORM__ || process.platform : 'posix';
const path = {
    win32: {
        sep: '\\'
    },
    posix: {
        sep: '/'
    }
};
const sep = defaultPlatform === 'win32' ? path.win32.sep : path.posix.sep;
minimatch.sep = sep;
const GLOBSTAR = Symbol('globstar **');
minimatch.GLOBSTAR = GLOBSTAR;
// any single thing other than /
// don't need to escape / when using new RegExp()
const qmark = '[^/]';
// * => any number of characters
const star = qmark + '*?';
// ** when dots are allowed.  Anything goes, except .. and .
// not (^ or / followed by one or two dots followed by $ or /),
// followed by anything, any number of times.
const twoStarDot = '(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?';
// not a ^ or / followed by a dot,
// followed by anything, any number of times.
const twoStarNoDot = '(?:(?!(?:\\/|^)\\.).)*?';
const filter = (pattern, options = {})=>(p)=>minimatch(p, pattern, options);
minimatch.filter = filter;
const ext = (a, b = {})=>Object.assign({}, a, b);
const defaults = (def)=>{
    if (!def || typeof def !== 'object' || !Object.keys(def).length) {
        return minimatch;
    }
    const orig = minimatch;
    const m = (p, pattern, options = {})=>orig(p, pattern, ext(def, options));
    return Object.assign(m, {
        Minimatch: class Minimatch extends orig.Minimatch {
            constructor(pattern, options = {}){
                super(pattern, ext(def, options));
            }
            static defaults(options) {
                return orig.defaults(ext(def, options)).Minimatch;
            }
        },
        AST: class AST extends orig.AST {
            /* c8 ignore start */ constructor(type, parent, options = {}){
                super(type, parent, ext(def, options));
            }
            /* c8 ignore stop */ static fromGlob(pattern, options = {}) {
                return orig.AST.fromGlob(pattern, ext(def, options));
            }
        },
        unescape: (s, options = {})=>orig.unescape(s, ext(def, options)),
        escape: (s, options = {})=>orig.escape(s, ext(def, options)),
        filter: (pattern, options = {})=>orig.filter(pattern, ext(def, options)),
        defaults: (options)=>orig.defaults(ext(def, options)),
        makeRe: (pattern, options = {})=>orig.makeRe(pattern, ext(def, options)),
        braceExpand: (pattern, options = {})=>orig.braceExpand(pattern, ext(def, options)),
        match: (list, pattern, options = {})=>orig.match(list, pattern, ext(def, options)),
        sep: orig.sep,
        GLOBSTAR: GLOBSTAR
    });
};
minimatch.defaults = defaults;
const braceExpand = (pattern, options = {})=>{
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$minimatch$2f$dist$2f$esm$2f$assert$2d$valid$2d$pattern$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertValidPattern"])(pattern);
    // Thanks to Yeting Li <https://github.com/yetingli> for
    // improving this regexp to avoid a ReDOS vulnerability.
    if (options.nobrace || !/\{(?:(?!\{).)*\}/.test(pattern)) {
        // shortcut. no need to expand.
        return [
            pattern
        ];
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$brace$2d$expansion$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["expand"])(pattern);
};
minimatch.braceExpand = braceExpand;
const makeRe = (pattern, options = {})=>new Minimatch(pattern, options).makeRe();
minimatch.makeRe = makeRe;
const match = (list, pattern, options = {})=>{
    const mm = new Minimatch(pattern, options);
    list = list.filter((f)=>mm.match(f));
    if (mm.options.nonull && !list.length) {
        list.push(pattern);
    }
    return list;
};
minimatch.match = match;
// replace stuff like \* with *
const globMagic = /[?*]|[+@!]\(.*?\)|\[|\]/;
const regExpEscape = (s)=>s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
class Minimatch {
    options;
    set;
    pattern;
    windowsPathsNoEscape;
    nonegate;
    negate;
    comment;
    empty;
    preserveMultipleSlashes;
    partial;
    globSet;
    globParts;
    nocase;
    isWindows;
    platform;
    windowsNoMagicRoot;
    maxGlobstarRecursion;
    regexp;
    constructor(pattern, options = {}){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$minimatch$2f$dist$2f$esm$2f$assert$2d$valid$2d$pattern$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertValidPattern"])(pattern);
        options = options || {};
        this.options = options;
        this.maxGlobstarRecursion = options.maxGlobstarRecursion ?? 200;
        this.pattern = pattern;
        this.platform = options.platform || defaultPlatform;
        this.isWindows = this.platform === 'win32';
        this.windowsPathsNoEscape = !!options.windowsPathsNoEscape || options.allowWindowsEscape === false;
        if (this.windowsPathsNoEscape) {
            this.pattern = this.pattern.replace(/\\/g, '/');
        }
        this.preserveMultipleSlashes = !!options.preserveMultipleSlashes;
        this.regexp = null;
        this.negate = false;
        this.nonegate = !!options.nonegate;
        this.comment = false;
        this.empty = false;
        this.partial = !!options.partial;
        this.nocase = !!this.options.nocase;
        this.windowsNoMagicRoot = options.windowsNoMagicRoot !== undefined ? options.windowsNoMagicRoot : !!(this.isWindows && this.nocase);
        this.globSet = [];
        this.globParts = [];
        this.set = [];
        // make the set of regexps etc.
        this.make();
    }
    hasMagic() {
        if (this.options.magicalBraces && this.set.length > 1) {
            return true;
        }
        for (const pattern of this.set){
            for (const part of pattern){
                if (typeof part !== 'string') return true;
            }
        }
        return false;
    }
    debug(..._) {}
    make() {
        const pattern = this.pattern;
        const options = this.options;
        // empty patterns and comments match nothing.
        if (!options.nocomment && pattern.charAt(0) === '#') {
            this.comment = true;
            return;
        }
        if (!pattern) {
            this.empty = true;
            return;
        }
        // step 1: figure out negation, etc.
        this.parseNegate();
        // step 2: expand braces
        this.globSet = [
            ...new Set(this.braceExpand())
        ];
        if (options.debug) {
            this.debug = (...args)=>console.error(...args);
        }
        this.debug(this.pattern, this.globSet);
        // step 3: now we have a set, so turn each one into a series of
        // path-portion matching patterns.
        // These will be regexps, except in the case of "**", which is
        // set to the GLOBSTAR object for globstar behavior,
        // and will not contain any / characters
        //
        // First, we preprocess to make the glob pattern sets a bit simpler
        // and deduped.  There are some perf-killing patterns that can cause
        // problems with a glob walk, but we can simplify them down a bit.
        const rawGlobParts = this.globSet.map((s)=>this.slashSplit(s));
        this.globParts = this.preprocess(rawGlobParts);
        this.debug(this.pattern, this.globParts);
        // glob --> regexps
        let set = this.globParts.map((s, _, __)=>{
            if (this.isWindows && this.windowsNoMagicRoot) {
                // check if it's a drive or unc path.
                const isUNC = s[0] === '' && s[1] === '' && (s[2] === '?' || !globMagic.test(s[2])) && !globMagic.test(s[3]);
                const isDrive = /^[a-z]:/i.test(s[0]);
                if (isUNC) {
                    return [
                        ...s.slice(0, 4),
                        ...s.slice(4).map((ss)=>this.parse(ss))
                    ];
                } else if (isDrive) {
                    return [
                        s[0],
                        ...s.slice(1).map((ss)=>this.parse(ss))
                    ];
                }
            }
            return s.map((ss)=>this.parse(ss));
        });
        this.debug(this.pattern, set);
        // filter out everything that didn't compile properly.
        this.set = set.filter((s)=>s.indexOf(false) === -1);
        // do not treat the ? in UNC paths as magic
        if (this.isWindows) {
            for(let i = 0; i < this.set.length; i++){
                const p = this.set[i];
                if (p[0] === '' && p[1] === '' && this.globParts[i][2] === '?' && typeof p[3] === 'string' && /^[a-z]:$/i.test(p[3])) {
                    p[2] = '?';
                }
            }
        }
        this.debug(this.pattern, this.set);
    }
    // various transforms to equivalent pattern sets that are
    // faster to process in a filesystem walk.  The goal is to
    // eliminate what we can, and push all ** patterns as far
    // to the right as possible, even if it increases the number
    // of patterns that we have to process.
    preprocess(globParts) {
        // if we're not in globstar mode, then turn all ** into *
        if (this.options.noglobstar) {
            for(let i = 0; i < globParts.length; i++){
                for(let j = 0; j < globParts[i].length; j++){
                    if (globParts[i][j] === '**') {
                        globParts[i][j] = '*';
                    }
                }
            }
        }
        const { optimizationLevel = 1 } = this.options;
        if (optimizationLevel >= 2) {
            // aggressive optimization for the purpose of fs walking
            globParts = this.firstPhasePreProcess(globParts);
            globParts = this.secondPhasePreProcess(globParts);
        } else if (optimizationLevel >= 1) {
            // just basic optimizations to remove some .. parts
            globParts = this.levelOneOptimize(globParts);
        } else {
            // just collapse multiple ** portions into one
            globParts = this.adjascentGlobstarOptimize(globParts);
        }
        return globParts;
    }
    // just get rid of adjascent ** portions
    adjascentGlobstarOptimize(globParts) {
        return globParts.map((parts)=>{
            let gs = -1;
            while(-1 !== (gs = parts.indexOf('**', gs + 1))){
                let i = gs;
                while(parts[i + 1] === '**'){
                    i++;
                }
                if (i !== gs) {
                    parts.splice(gs, i - gs);
                }
            }
            return parts;
        });
    }
    // get rid of adjascent ** and resolve .. portions
    levelOneOptimize(globParts) {
        return globParts.map((parts)=>{
            parts = parts.reduce((set, part)=>{
                const prev = set[set.length - 1];
                if (part === '**' && prev === '**') {
                    return set;
                }
                if (part === '..') {
                    if (prev && prev !== '..' && prev !== '.' && prev !== '**') {
                        set.pop();
                        return set;
                    }
                }
                set.push(part);
                return set;
            }, []);
            return parts.length === 0 ? [
                ''
            ] : parts;
        });
    }
    levelTwoFileOptimize(parts) {
        if (!Array.isArray(parts)) {
            parts = this.slashSplit(parts);
        }
        let didSomething = false;
        do {
            didSomething = false;
            // <pre>/<e>/<rest> -> <pre>/<rest>
            if (!this.preserveMultipleSlashes) {
                for(let i = 1; i < parts.length - 1; i++){
                    const p = parts[i];
                    // don't squeeze out UNC patterns
                    if (i === 1 && p === '' && parts[0] === '') continue;
                    if (p === '.' || p === '') {
                        didSomething = true;
                        parts.splice(i, 1);
                        i--;
                    }
                }
                if (parts[0] === '.' && parts.length === 2 && (parts[1] === '.' || parts[1] === '')) {
                    didSomething = true;
                    parts.pop();
                }
            }
            // <pre>/<p>/../<rest> -> <pre>/<rest>
            let dd = 0;
            while(-1 !== (dd = parts.indexOf('..', dd + 1))){
                const p = parts[dd - 1];
                if (p && p !== '.' && p !== '..' && p !== '**') {
                    didSomething = true;
                    parts.splice(dd - 1, 2);
                    dd -= 2;
                }
            }
        }while (didSomething)
        return parts.length === 0 ? [
            ''
        ] : parts;
    }
    // First phase: single-pattern processing
    // <pre> is 1 or more portions
    // <rest> is 1 or more portions
    // <p> is any portion other than ., .., '', or **
    // <e> is . or ''
    //
    // **/.. is *brutal* for filesystem walking performance, because
    // it effectively resets the recursive walk each time it occurs,
    // and ** cannot be reduced out by a .. pattern part like a regexp
    // or most strings (other than .., ., and '') can be.
    //
    // <pre>/**/../<p>/<p>/<rest> -> {<pre>/../<p>/<p>/<rest>,<pre>/**/<p>/<p>/<rest>}
    // <pre>/<e>/<rest> -> <pre>/<rest>
    // <pre>/<p>/../<rest> -> <pre>/<rest>
    // **/**/<rest> -> **/<rest>
    //
    // **/*/<rest> -> */**/<rest> <== not valid because ** doesn't follow
    // this WOULD be allowed if ** did follow symlinks, or * didn't
    firstPhasePreProcess(globParts) {
        let didSomething = false;
        do {
            didSomething = false;
            // <pre>/**/../<p>/<p>/<rest> -> {<pre>/../<p>/<p>/<rest>,<pre>/**/<p>/<p>/<rest>}
            for (let parts of globParts){
                let gs = -1;
                while(-1 !== (gs = parts.indexOf('**', gs + 1))){
                    let gss = gs;
                    while(parts[gss + 1] === '**'){
                        // <pre>/**/**/<rest> -> <pre>/**/<rest>
                        gss++;
                    }
                    // eg, if gs is 2 and gss is 4, that means we have 3 **
                    // parts, and can remove 2 of them.
                    if (gss > gs) {
                        parts.splice(gs + 1, gss - gs);
                    }
                    let next = parts[gs + 1];
                    const p = parts[gs + 2];
                    const p2 = parts[gs + 3];
                    if (next !== '..') continue;
                    if (!p || p === '.' || p === '..' || !p2 || p2 === '.' || p2 === '..') {
                        continue;
                    }
                    didSomething = true;
                    // edit parts in place, and push the new one
                    parts.splice(gs, 1);
                    const other = parts.slice(0);
                    other[gs] = '**';
                    globParts.push(other);
                    gs--;
                }
                // <pre>/<e>/<rest> -> <pre>/<rest>
                if (!this.preserveMultipleSlashes) {
                    for(let i = 1; i < parts.length - 1; i++){
                        const p = parts[i];
                        // don't squeeze out UNC patterns
                        if (i === 1 && p === '' && parts[0] === '') continue;
                        if (p === '.' || p === '') {
                            didSomething = true;
                            parts.splice(i, 1);
                            i--;
                        }
                    }
                    if (parts[0] === '.' && parts.length === 2 && (parts[1] === '.' || parts[1] === '')) {
                        didSomething = true;
                        parts.pop();
                    }
                }
                // <pre>/<p>/../<rest> -> <pre>/<rest>
                let dd = 0;
                while(-1 !== (dd = parts.indexOf('..', dd + 1))){
                    const p = parts[dd - 1];
                    if (p && p !== '.' && p !== '..' && p !== '**') {
                        didSomething = true;
                        const needDot = dd === 1 && parts[dd + 1] === '**';
                        const splin = needDot ? [
                            '.'
                        ] : [];
                        parts.splice(dd - 1, 2, ...splin);
                        if (parts.length === 0) parts.push('');
                        dd -= 2;
                    }
                }
            }
        }while (didSomething)
        return globParts;
    }
    // second phase: multi-pattern dedupes
    // {<pre>/*/<rest>,<pre>/<p>/<rest>} -> <pre>/*/<rest>
    // {<pre>/<rest>,<pre>/<rest>} -> <pre>/<rest>
    // {<pre>/**/<rest>,<pre>/<rest>} -> <pre>/**/<rest>
    //
    // {<pre>/**/<rest>,<pre>/**/<p>/<rest>} -> <pre>/**/<rest>
    // ^-- not valid because ** doens't follow symlinks
    secondPhasePreProcess(globParts) {
        for(let i = 0; i < globParts.length - 1; i++){
            for(let j = i + 1; j < globParts.length; j++){
                const matched = this.partsMatch(globParts[i], globParts[j], !this.preserveMultipleSlashes);
                if (matched) {
                    globParts[i] = [];
                    globParts[j] = matched;
                    break;
                }
            }
        }
        return globParts.filter((gs)=>gs.length);
    }
    partsMatch(a, b, emptyGSMatch = false) {
        let ai = 0;
        let bi = 0;
        let result = [];
        let which = '';
        while(ai < a.length && bi < b.length){
            if (a[ai] === b[bi]) {
                result.push(which === 'b' ? b[bi] : a[ai]);
                ai++;
                bi++;
            } else if (emptyGSMatch && a[ai] === '**' && b[bi] === a[ai + 1]) {
                result.push(a[ai]);
                ai++;
            } else if (emptyGSMatch && b[bi] === '**' && a[ai] === b[bi + 1]) {
                result.push(b[bi]);
                bi++;
            } else if (a[ai] === '*' && b[bi] && (this.options.dot || !b[bi].startsWith('.')) && b[bi] !== '**') {
                if (which === 'b') return false;
                which = 'a';
                result.push(a[ai]);
                ai++;
                bi++;
            } else if (b[bi] === '*' && a[ai] && (this.options.dot || !a[ai].startsWith('.')) && a[ai] !== '**') {
                if (which === 'a') return false;
                which = 'b';
                result.push(b[bi]);
                ai++;
                bi++;
            } else {
                return false;
            }
        }
        // if we fall out of the loop, it means they two are identical
        // as long as their lengths match
        return a.length === b.length && result;
    }
    parseNegate() {
        if (this.nonegate) return;
        const pattern = this.pattern;
        let negate = false;
        let negateOffset = 0;
        for(let i = 0; i < pattern.length && pattern.charAt(i) === '!'; i++){
            negate = !negate;
            negateOffset++;
        }
        if (negateOffset) this.pattern = pattern.slice(negateOffset);
        this.negate = negate;
    }
    // set partial to true to test if, for example,
    // "/a/b" matches the start of "/*/b/*/d"
    // Partial means, if you run out of file before you run
    // out of pattern, then that's fine, as long as all
    // the parts match.
    matchOne(file, pattern, partial = false) {
        let fileStartIndex = 0;
        let patternStartIndex = 0;
        // UNC paths like //?/X:/... can match X:/... and vice versa
        // Drive letters in absolute drive or unc paths are always compared
        // case-insensitively.
        if (this.isWindows) {
            const fileDrive = typeof file[0] === 'string' && /^[a-z]:$/i.test(file[0]);
            const fileUNC = !fileDrive && file[0] === '' && file[1] === '' && file[2] === '?' && /^[a-z]:$/i.test(file[3]);
            const patternDrive = typeof pattern[0] === 'string' && /^[a-z]:$/i.test(pattern[0]);
            const patternUNC = !patternDrive && pattern[0] === '' && pattern[1] === '' && pattern[2] === '?' && typeof pattern[3] === 'string' && /^[a-z]:$/i.test(pattern[3]);
            const fdi = fileUNC ? 3 : fileDrive ? 0 : undefined;
            const pdi = patternUNC ? 3 : patternDrive ? 0 : undefined;
            if (typeof fdi === 'number' && typeof pdi === 'number') {
                const [fd, pd] = [
                    file[fdi],
                    pattern[pdi]
                ];
                if (fd.toLowerCase() === pd.toLowerCase()) {
                    pattern[pdi] = fd;
                    patternStartIndex = pdi;
                    fileStartIndex = fdi;
                }
            }
        }
        // resolve and reduce . and .. portions in the file as well.
        // dont' need to do the second phase, because it's only one string[]
        const { optimizationLevel = 1 } = this.options;
        if (optimizationLevel >= 2) {
            file = this.levelTwoFileOptimize(file);
        }
        if (pattern.includes(GLOBSTAR)) {
            return this.#matchGlobstar(file, pattern, partial, fileStartIndex, patternStartIndex);
        }
        return this.#matchOne(file, pattern, partial, fileStartIndex, patternStartIndex);
    }
    #matchGlobstar(file, pattern, partial, fileIndex, patternIndex) {
        const firstgs = pattern.indexOf(GLOBSTAR, patternIndex);
        const lastgs = pattern.lastIndexOf(GLOBSTAR);
        const [head, body, tail] = [
            pattern.slice(patternIndex, firstgs),
            pattern.slice(firstgs + 1, lastgs),
            pattern.slice(lastgs + 1)
        ];
        if (head.length) {
            const fileHead = file.slice(fileIndex, fileIndex + head.length);
            if (!this.#matchOne(fileHead, head, partial, 0, 0)) return false;
            fileIndex += head.length;
        }
        let fileTailMatch = 0;
        if (tail.length) {
            if (tail.length + fileIndex > file.length) return false;
            let tailStart = file.length - tail.length;
            if (this.#matchOne(file, tail, partial, tailStart, 0)) {
                fileTailMatch = tail.length;
            } else {
                if (file[file.length - 1] !== '' || fileIndex + tail.length === file.length) {
                    return false;
                }
                tailStart--;
                if (!this.#matchOne(file, tail, partial, tailStart, 0)) return false;
                fileTailMatch = tail.length + 1;
            }
        }
        if (!body.length) {
            let sawSome = !!fileTailMatch;
            for(let i = fileIndex; i < file.length - fileTailMatch; i++){
                const f = String(file[i]);
                sawSome = true;
                if (f === '.' || f === '..' || !this.options.dot && f.startsWith('.')) {
                    return false;
                }
            }
            return sawSome;
        }
        const bodySegments = [
            [
                [],
                0
            ]
        ];
        let currentBody = bodySegments[0];
        let nonGsParts = 0;
        const nonGsPartsSums = [
            0
        ];
        for (const b of body){
            if (b === GLOBSTAR) {
                nonGsPartsSums.push(nonGsParts);
                currentBody = [
                    [],
                    0
                ];
                bodySegments.push(currentBody);
            } else {
                currentBody[0].push(b);
                nonGsParts++;
            }
        }
        let i = bodySegments.length - 1;
        const fileLength = file.length - fileTailMatch;
        for (const b of bodySegments){
            b[1] = fileLength - (nonGsPartsSums[i--] + b[0].length);
        }
        return !!this.#matchGlobStarBodySections(file, bodySegments, fileIndex, 0, partial, 0, !!fileTailMatch);
    }
    #matchGlobStarBodySections(file, bodySegments, fileIndex, bodyIndex, partial, globStarDepth, sawTail) {
        const bs = bodySegments[bodyIndex];
        if (!bs) {
            for(let i = fileIndex; i < file.length; i++){
                sawTail = true;
                const f = file[i];
                if (f === '.' || f === '..' || !this.options.dot && f.startsWith('.')) {
                    return false;
                }
            }
            return sawTail;
        }
        const [body, after] = bs;
        while(fileIndex <= after){
            const m = this.#matchOne(file.slice(0, fileIndex + body.length), body, partial, fileIndex, 0);
            if (m && globStarDepth < this.maxGlobstarRecursion) {
                const sub = this.#matchGlobStarBodySections(file, bodySegments, fileIndex + body.length, bodyIndex + 1, partial, globStarDepth + 1, sawTail);
                if (sub !== false) return sub;
            }
            const f = file[fileIndex];
            if (f === '.' || f === '..' || !this.options.dot && f.startsWith('.')) {
                return false;
            }
            fileIndex++;
        }
        return null;
    }
    #matchOne(file, pattern, partial, fileIndex, patternIndex) {
        let fi;
        let pi;
        let pl;
        let fl;
        for(fi = fileIndex, pi = patternIndex, fl = file.length, pl = pattern.length; fi < fl && pi < pl; fi++, pi++){
            this.debug('matchOne loop');
            let p = pattern[pi];
            let f = file[fi];
            this.debug(pattern, p, f);
            /* c8 ignore start */ if (p === false || p === GLOBSTAR) return false;
            /* c8 ignore stop */ let hit;
            if (typeof p === 'string') {
                hit = f === p;
                this.debug('string match', p, f, hit);
            } else {
                hit = p.test(f);
                this.debug('pattern match', p, f, hit);
            }
            if (!hit) return false;
        }
        if (fi === fl && pi === pl) {
            return true;
        } else if (fi === fl) {
            return partial;
        } else if (pi === pl) {
            return fi === fl - 1 && file[fi] === '';
        /* c8 ignore start */ } else {
            throw new Error('wtf?');
        }
    /* c8 ignore stop */ }
    braceExpand() {
        return braceExpand(this.pattern, this.options);
    }
    parse(pattern) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$minimatch$2f$dist$2f$esm$2f$assert$2d$valid$2d$pattern$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertValidPattern"])(pattern);
        const options = this.options;
        // shortcuts
        if (pattern === '**') return GLOBSTAR;
        if (pattern === '') return '';
        // far and away, the most common glob pattern parts are
        // *, *.*, and *.<ext>  Add a fast check method for those.
        let m;
        let fastTest = null;
        if (m = pattern.match(starRE)) {
            fastTest = options.dot ? starTestDot : starTest;
        } else if (m = pattern.match(starDotExtRE)) {
            fastTest = (options.nocase ? options.dot ? starDotExtTestNocaseDot : starDotExtTestNocase : options.dot ? starDotExtTestDot : starDotExtTest)(m[1]);
        } else if (m = pattern.match(qmarksRE)) {
            fastTest = (options.nocase ? options.dot ? qmarksTestNocaseDot : qmarksTestNocase : options.dot ? qmarksTestDot : qmarksTest)(m);
        } else if (m = pattern.match(starDotStarRE)) {
            fastTest = options.dot ? starDotStarTestDot : starDotStarTest;
        } else if (m = pattern.match(dotStarRE)) {
            fastTest = dotStarTest;
        }
        const re = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$minimatch$2f$dist$2f$esm$2f$ast$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AST"].fromGlob(pattern, this.options).toMMPattern();
        if (fastTest && typeof re === 'object') {
            // Avoids overriding in frozen environments
            Reflect.defineProperty(re, 'test', {
                value: fastTest
            });
        }
        return re;
    }
    makeRe() {
        if (this.regexp || this.regexp === false) return this.regexp;
        // at this point, this.set is a 2d array of partial
        // pattern strings, or "**".
        //
        // It's better to use .match().  This function shouldn't
        // be used, really, but it's pretty convenient sometimes,
        // when you just want to work with a regex.
        const set = this.set;
        if (!set.length) {
            this.regexp = false;
            return this.regexp;
        }
        const options = this.options;
        const twoStar = options.noglobstar ? star : options.dot ? twoStarDot : twoStarNoDot;
        const flags = new Set(options.nocase ? [
            'i'
        ] : []);
        // regexpify non-globstar patterns
        // if ** is only item, then we just do one twoStar
        // if ** is first, and there are more, prepend (\/|twoStar\/)? to next
        // if ** is last, append (\/twoStar|) to previous
        // if ** is in the middle, append (\/|\/twoStar\/) to previous
        // then filter out GLOBSTAR symbols
        let re = set.map((pattern)=>{
            const pp = pattern.map((p)=>{
                if (p instanceof RegExp) {
                    for (const f of p.flags.split(''))flags.add(f);
                }
                return typeof p === 'string' ? regExpEscape(p) : p === GLOBSTAR ? GLOBSTAR : p._src;
            });
            pp.forEach((p, i)=>{
                const next = pp[i + 1];
                const prev = pp[i - 1];
                if (p !== GLOBSTAR || prev === GLOBSTAR) {
                    return;
                }
                if (prev === undefined) {
                    if (next !== undefined && next !== GLOBSTAR) {
                        pp[i + 1] = '(?:\\/|' + twoStar + '\\/)?' + next;
                    } else {
                        pp[i] = twoStar;
                    }
                } else if (next === undefined) {
                    pp[i - 1] = prev + '(?:\\/|' + twoStar + ')?';
                } else if (next !== GLOBSTAR) {
                    pp[i - 1] = prev + '(?:\\/|\\/' + twoStar + '\\/)' + next;
                    pp[i + 1] = GLOBSTAR;
                }
            });
            return pp.filter((p)=>p !== GLOBSTAR).join('/');
        }).join('|');
        // need to wrap in parens if we had more than one thing with |,
        // otherwise only the first will be anchored to ^ and the last to $
        const [open, close] = set.length > 1 ? [
            '(?:',
            ')'
        ] : [
            '',
            ''
        ];
        // must match entire pattern
        // ending in a * or ** will make it less strict.
        re = '^' + open + re + close + '$';
        // can match anything, as long as it's not this.
        if (this.negate) re = '^(?!' + re + ').+$';
        try {
            this.regexp = new RegExp(re, [
                ...flags
            ].join(''));
        /* c8 ignore start */ } catch (ex) {
            // should be impossible
            this.regexp = false;
        }
        /* c8 ignore stop */ return this.regexp;
    }
    slashSplit(p) {
        // if p starts with // on windows, we preserve that
        // so that UNC paths aren't broken.  Otherwise, any number of
        // / characters are coalesced into one, unless
        // preserveMultipleSlashes is set to true.
        if (this.preserveMultipleSlashes) {
            return p.split('/');
        } else if (this.isWindows && /^\/\/[^\/]+/.test(p)) {
            // add an extra '' for the one we lose
            return [
                '',
                ...p.split(/\/+/)
            ];
        } else {
            return p.split(/\/+/);
        }
    }
    match(f, partial = this.partial) {
        this.debug('match', f, this.pattern);
        // short-circuit in the case of busted things.
        // comments, etc.
        if (this.comment) {
            return false;
        }
        if (this.empty) {
            return f === '';
        }
        if (f === '/' && partial) {
            return true;
        }
        const options = this.options;
        // windows: need to use /, not \
        if (this.isWindows) {
            f = f.split('\\').join('/');
        }
        // treat the test path as a set of pathparts.
        const ff = this.slashSplit(f);
        this.debug(this.pattern, 'split', ff);
        // just ONE of the pattern sets in this.set needs to match
        // in order for it to be valid.  If negating, then just one
        // match means that we have failed.
        // Either way, return on the first hit.
        const set = this.set;
        this.debug(this.pattern, 'set', set);
        // Find the basename of the path by looking for the last non-empty segment
        let filename = ff[ff.length - 1];
        if (!filename) {
            for(let i = ff.length - 2; !filename && i >= 0; i--){
                filename = ff[i];
            }
        }
        for(let i = 0; i < set.length; i++){
            const pattern = set[i];
            let file = ff;
            if (options.matchBase && pattern.length === 1) {
                file = [
                    filename
                ];
            }
            const hit = this.matchOne(file, pattern, partial);
            if (hit) {
                if (options.flipNegate) {
                    return true;
                }
                return !this.negate;
            }
        }
        // didn't get any hits.  this is success if it's a negative
        // pattern, failure otherwise.
        if (options.flipNegate) {
            return false;
        }
        return this.negate;
    }
    static defaults(def) {
        return minimatch.defaults(def).Minimatch;
    }
}
;
;
;
/* c8 ignore stop */ minimatch.AST = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$minimatch$2f$dist$2f$esm$2f$ast$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AST"];
minimatch.Minimatch = Minimatch;
minimatch.escape = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$minimatch$2f$dist$2f$esm$2f$escape$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["escape"];
minimatch.unescape = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$minimatch$2f$dist$2f$esm$2f$unescape$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unescape"];
}),
"[project]/node_modules/@opentelemetry/instrumentation-graphql/build/src/enum.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SpanNames = exports.TokenKind = exports.AllowedOperationTypes = void 0;
var AllowedOperationTypes;
(function(AllowedOperationTypes) {
    AllowedOperationTypes["QUERY"] = "query";
    AllowedOperationTypes["MUTATION"] = "mutation";
    AllowedOperationTypes["SUBSCRIPTION"] = "subscription";
})(AllowedOperationTypes = exports.AllowedOperationTypes || (exports.AllowedOperationTypes = {}));
var TokenKind;
(function(TokenKind) {
    TokenKind["SOF"] = "<SOF>";
    TokenKind["EOF"] = "<EOF>";
    TokenKind["BANG"] = "!";
    TokenKind["DOLLAR"] = "$";
    TokenKind["AMP"] = "&";
    TokenKind["PAREN_L"] = "(";
    TokenKind["PAREN_R"] = ")";
    TokenKind["SPREAD"] = "...";
    TokenKind["COLON"] = ":";
    TokenKind["EQUALS"] = "=";
    TokenKind["AT"] = "@";
    TokenKind["BRACKET_L"] = "[";
    TokenKind["BRACKET_R"] = "]";
    TokenKind["BRACE_L"] = "{";
    TokenKind["PIPE"] = "|";
    TokenKind["BRACE_R"] = "}";
    TokenKind["NAME"] = "Name";
    TokenKind["INT"] = "Int";
    TokenKind["FLOAT"] = "Float";
    TokenKind["STRING"] = "String";
    TokenKind["BLOCK_STRING"] = "BlockString";
    TokenKind["COMMENT"] = "Comment";
})(TokenKind = exports.TokenKind || (exports.TokenKind = {}));
var SpanNames;
(function(SpanNames) {
    SpanNames["EXECUTE"] = "graphql.execute";
    SpanNames["PARSE"] = "graphql.parse";
    SpanNames["RESOLVE"] = "graphql.resolve";
    SpanNames["VALIDATE"] = "graphql.validate";
    SpanNames["SCHEMA_VALIDATE"] = "graphql.validateSchema";
    SpanNames["SCHEMA_PARSE"] = "graphql.parseSchema";
})(SpanNames = exports.SpanNames || (exports.SpanNames = {}));
}),
"[project]/node_modules/@opentelemetry/instrumentation-graphql/build/src/enums/AttributeNames.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AttributeNames = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var AttributeNames;
(function(AttributeNames) {
    AttributeNames["SOURCE"] = "graphql.source";
    AttributeNames["FIELD_NAME"] = "graphql.field.name";
    AttributeNames["FIELD_PATH"] = "graphql.field.path";
    AttributeNames["FIELD_TYPE"] = "graphql.field.type";
    AttributeNames["OPERATION_TYPE"] = "graphql.operation.type";
    AttributeNames["OPERATION_NAME"] = "graphql.operation.name";
    AttributeNames["VARIABLES"] = "graphql.variables.";
    AttributeNames["ERROR_VALIDATION_NAME"] = "graphql.validation.error";
})(AttributeNames = exports.AttributeNames || (exports.AttributeNames = {}));
}),
"[project]/node_modules/@opentelemetry/instrumentation-graphql/build/src/symbols.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.OTEL_GRAPHQL_DATA_SYMBOL = exports.OTEL_PATCHED_SYMBOL = void 0;
exports.OTEL_PATCHED_SYMBOL = Symbol.for('opentelemetry.patched');
exports.OTEL_GRAPHQL_DATA_SYMBOL = Symbol.for('opentelemetry.graphql_data');
}),
"[project]/node_modules/@opentelemetry/instrumentation-graphql/build/src/internal-types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.OPERATION_NOT_SUPPORTED = void 0;
const symbols_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-graphql/build/src/symbols.js [app-route] (ecmascript)");
exports.OPERATION_NOT_SUPPORTED = 'Operation$operationName$not' + ' supported';
}),
"[project]/node_modules/@opentelemetry/instrumentation-graphql/build/src/utils.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.wrapFieldResolver = exports.wrapFields = exports.getSourceFromLocation = exports.getOperation = exports.endSpan = exports.addSpanSource = exports.addInputVariableAttributes = exports.isPromise = void 0;
const api = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const enum_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-graphql/build/src/enum.js [app-route] (ecmascript)");
const AttributeNames_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-graphql/build/src/enums/AttributeNames.js [app-route] (ecmascript)");
const symbols_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-graphql/build/src/symbols.js [app-route] (ecmascript)");
const OPERATION_VALUES = Object.values(enum_1.AllowedOperationTypes);
// https://github.com/graphql/graphql-js/blob/main/src/jsutils/isPromise.ts
const isPromise = (value)=>{
    return typeof (value === null || value === void 0 ? void 0 : value.then) === 'function';
};
exports.isPromise = isPromise;
// https://github.com/graphql/graphql-js/blob/main/src/jsutils/isObjectLike.ts
const isObjectLike = (value)=>{
    return typeof value == 'object' && value !== null;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addInputVariableAttribute(span, key, variable) {
    if (Array.isArray(variable)) {
        variable.forEach((value, idx)=>{
            addInputVariableAttribute(span, `${key}.${idx}`, value);
        });
    } else if (variable instanceof Object) {
        Object.entries(variable).forEach(([nestedKey, value])=>{
            addInputVariableAttribute(span, `${key}.${nestedKey}`, value);
        });
    } else {
        span.setAttribute(`${AttributeNames_1.AttributeNames.VARIABLES}${String(key)}`, variable);
    }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addInputVariableAttributes(span, variableValues) {
    Object.entries(variableValues).forEach(([key, value])=>{
        addInputVariableAttribute(span, key, value);
    });
}
exports.addInputVariableAttributes = addInputVariableAttributes;
function addSpanSource(span, loc, allowValues, start, end) {
    const source = getSourceFromLocation(loc, allowValues, start, end);
    span.setAttribute(AttributeNames_1.AttributeNames.SOURCE, source);
}
exports.addSpanSource = addSpanSource;
function createFieldIfNotExists(tracer, getConfig, contextValue, info, path) {
    let field = getField(contextValue, path);
    let spanAdded = false;
    if (!field) {
        spanAdded = true;
        const parent = getParentField(contextValue, path);
        field = {
            parent,
            span: createResolverSpan(tracer, getConfig, contextValue, info, path, parent.span),
            error: null
        };
        addField(contextValue, path, field);
    }
    return {
        spanAdded,
        field
    };
}
function createResolverSpan(tracer, getConfig, contextValue, info, path, parentSpan) {
    var _a, _b;
    const attributes = {
        [AttributeNames_1.AttributeNames.FIELD_NAME]: info.fieldName,
        [AttributeNames_1.AttributeNames.FIELD_PATH]: path.join('.'),
        [AttributeNames_1.AttributeNames.FIELD_TYPE]: info.returnType.toString()
    };
    const span = tracer.startSpan(`${enum_1.SpanNames.RESOLVE} ${attributes[AttributeNames_1.AttributeNames.FIELD_PATH]}`, {
        attributes
    }, parentSpan ? api.trace.setSpan(api.context.active(), parentSpan) : undefined);
    const document = contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL].source;
    const fieldNode = info.fieldNodes.find((fieldNode)=>fieldNode.kind === 'Field');
    if (fieldNode) {
        addSpanSource(span, document.loc, getConfig().allowValues, (_a = fieldNode.loc) === null || _a === void 0 ? void 0 : _a.start, (_b = fieldNode.loc) === null || _b === void 0 ? void 0 : _b.end);
    }
    return span;
}
function endSpan(span, error) {
    if (error) {
        span.recordException(error);
    }
    span.end();
}
exports.endSpan = endSpan;
function getOperation(document, operationName) {
    if (!document || !Array.isArray(document.definitions)) {
        return undefined;
    }
    if (operationName) {
        return document.definitions.filter((definition)=>{
            var _a;
            return OPERATION_VALUES.indexOf((_a = definition) === null || _a === void 0 ? void 0 : _a.operation) !== -1;
        }).find((definition)=>{
            var _a, _b;
            return operationName === ((_b = (_a = definition) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b.value);
        });
    } else {
        return document.definitions.find((definition)=>{
            var _a;
            return OPERATION_VALUES.indexOf((_a = definition) === null || _a === void 0 ? void 0 : _a.operation) !== -1;
        });
    }
}
exports.getOperation = getOperation;
function addField(contextValue, path, field) {
    return contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL].fields[path.join('.')] = field;
}
function getField(contextValue, path) {
    return contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL].fields[path.join('.')];
}
function getParentField(contextValue, path) {
    for(let i = path.length - 1; i > 0; i--){
        const field = getField(contextValue, path.slice(0, i));
        if (field) {
            return field;
        }
    }
    return {
        span: contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL].span
    };
}
function pathToArray(mergeItems, path) {
    const flattened = [];
    let curr = path;
    while(curr){
        let key = curr.key;
        if (mergeItems && typeof key === 'number') {
            key = '*';
        }
        flattened.push(String(key));
        curr = curr.prev;
    }
    return flattened.reverse();
}
function repeatBreak(i) {
    return repeatChar('\n', i);
}
function repeatSpace(i) {
    return repeatChar(' ', i);
}
function repeatChar(char, to) {
    let text = '';
    for(let i = 0; i < to; i++){
        text += char;
    }
    return text;
}
const KindsToBeRemoved = [
    enum_1.TokenKind.FLOAT,
    enum_1.TokenKind.STRING,
    enum_1.TokenKind.INT,
    enum_1.TokenKind.BLOCK_STRING
];
function getSourceFromLocation(loc, allowValues = false, inputStart, inputEnd) {
    var _a, _b;
    let source = '';
    if (loc === null || loc === void 0 ? void 0 : loc.startToken) {
        const start = typeof inputStart === 'number' ? inputStart : loc.start;
        const end = typeof inputEnd === 'number' ? inputEnd : loc.end;
        let next = loc.startToken.next;
        let previousLine = 1;
        while(next){
            if (next.start < start) {
                next = next.next;
                previousLine = next === null || next === void 0 ? void 0 : next.line;
                continue;
            }
            if (next.end > end) {
                next = next.next;
                previousLine = next === null || next === void 0 ? void 0 : next.line;
                continue;
            }
            let value = next.value || next.kind;
            let space = '';
            if (!allowValues && KindsToBeRemoved.indexOf(next.kind) >= 0) {
                // value = repeatChar('*', value.length);
                value = '*';
            }
            if (next.kind === enum_1.TokenKind.STRING) {
                value = `"${value}"`;
            }
            if (next.kind === enum_1.TokenKind.EOF) {
                value = '';
            }
            if (next.line > previousLine) {
                source += repeatBreak(next.line - previousLine);
                previousLine = next.line;
                space = repeatSpace(next.column - 1);
            } else {
                if (next.line === ((_a = next.prev) === null || _a === void 0 ? void 0 : _a.line)) {
                    space = repeatSpace(next.start - (((_b = next.prev) === null || _b === void 0 ? void 0 : _b.end) || 0));
                }
            }
            source += space + value;
            if (next) {
                next = next.next;
            }
        }
    }
    return source;
}
exports.getSourceFromLocation = getSourceFromLocation;
function wrapFields(type, tracer, getConfig) {
    if (!type || typeof type.getFields !== 'function' || type[symbols_1.OTEL_PATCHED_SYMBOL]) {
        return;
    }
    const fields = type.getFields();
    type[symbols_1.OTEL_PATCHED_SYMBOL] = true;
    Object.keys(fields).forEach((key)=>{
        const field = fields[key];
        if (!field) {
            return;
        }
        if (field.resolve) {
            field.resolve = wrapFieldResolver(tracer, getConfig, field.resolve);
        }
        if (field.type) {
            let unwrappedType = field.type;
            while(unwrappedType.ofType){
                unwrappedType = unwrappedType.ofType;
            }
            wrapFields(unwrappedType, tracer, getConfig);
        }
    });
}
exports.wrapFields = wrapFields;
const handleResolveSpanError = (resolveSpan, err, shouldEndSpan)=>{
    if (!shouldEndSpan) {
        return;
    }
    resolveSpan.recordException(err);
    resolveSpan.setStatus({
        code: api.SpanStatusCode.ERROR,
        message: err.message
    });
    resolveSpan.end();
};
const handleResolveSpanSuccess = (resolveSpan, shouldEndSpan)=>{
    if (!shouldEndSpan) {
        return;
    }
    resolveSpan.end();
};
function wrapFieldResolver(tracer, getConfig, fieldResolver, isDefaultResolver = false) {
    if (wrappedFieldResolver[symbols_1.OTEL_PATCHED_SYMBOL] || typeof fieldResolver !== 'function') {
        return fieldResolver;
    }
    function wrappedFieldResolver(source, args, contextValue, info) {
        if (!fieldResolver) {
            return undefined;
        }
        const config = getConfig();
        // follows what graphql is doing to decide if this is a trivial resolver
        // for which we don't need to create a resolve span
        if (config.ignoreTrivialResolveSpans && isDefaultResolver && (isObjectLike(source) || typeof source === 'function')) {
            const property = source[info.fieldName];
            // a function execution is not trivial and should be recorder.
            // property which is not a function is just a value and we don't want a "resolve" span for it
            if (typeof property !== 'function') {
                return fieldResolver.call(this, source, args, contextValue, info);
            }
        }
        if (!contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL]) {
            return fieldResolver.call(this, source, args, contextValue, info);
        }
        const path = pathToArray(config.mergeItems, info && info.path);
        const depth = path.filter((item)=>typeof item === 'string').length;
        let field;
        let shouldEndSpan = false;
        if (config.depth >= 0 && config.depth < depth) {
            field = getParentField(contextValue, path);
        } else {
            const newField = createFieldIfNotExists(tracer, getConfig, contextValue, info, path);
            field = newField.field;
            shouldEndSpan = newField.spanAdded;
        }
        return api.context.with(api.trace.setSpan(api.context.active(), field.span), ()=>{
            try {
                const res = fieldResolver.call(this, source, args, contextValue, info);
                if ((0, exports.isPromise)(res)) {
                    return res.then((r)=>{
                        handleResolveSpanSuccess(field.span, shouldEndSpan);
                        return r;
                    }, (err)=>{
                        handleResolveSpanError(field.span, err, shouldEndSpan);
                        throw err;
                    });
                } else {
                    handleResolveSpanSuccess(field.span, shouldEndSpan);
                    return res;
                }
            } catch (err) {
                handleResolveSpanError(field.span, err, shouldEndSpan);
                throw err;
            }
        });
    }
    wrappedFieldResolver[symbols_1.OTEL_PATCHED_SYMBOL] = true;
    return wrappedFieldResolver;
}
exports.wrapFieldResolver = wrapFieldResolver;
}),
"[project]/node_modules/@opentelemetry/instrumentation-graphql/build/src/version.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
// this is autogenerated file, see scripts/version-update.js
exports.PACKAGE_VERSION = '0.47.1';
exports.PACKAGE_NAME = '@opentelemetry/instrumentation-graphql';
}),
"[project]/node_modules/@opentelemetry/instrumentation-graphql/build/src/instrumentation.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GraphQLInstrumentation = void 0;
const api_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const instrumentation_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
const enum_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-graphql/build/src/enum.js [app-route] (ecmascript)");
const AttributeNames_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-graphql/build/src/enums/AttributeNames.js [app-route] (ecmascript)");
const symbols_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-graphql/build/src/symbols.js [app-route] (ecmascript)");
const internal_types_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-graphql/build/src/internal-types.js [app-route] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-graphql/build/src/utils.js [app-route] (ecmascript)");
/** @knipignore */ const version_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-graphql/build/src/version.js [app-route] (ecmascript)");
const DEFAULT_CONFIG = {
    mergeItems: false,
    depth: -1,
    allowValues: false,
    ignoreResolveSpans: false
};
const supportedVersions = [
    '>=14.0.0 <17'
];
class GraphQLInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}){
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, Object.assign(Object.assign({}, DEFAULT_CONFIG), config));
    }
    setConfig(config = {}) {
        super.setConfig(Object.assign(Object.assign({}, DEFAULT_CONFIG), config));
    }
    init() {
        const module = new instrumentation_1.InstrumentationNodeModuleDefinition('graphql', supportedVersions);
        module.files.push(this._addPatchingExecute());
        module.files.push(this._addPatchingParser());
        module.files.push(this._addPatchingValidate());
        return module;
    }
    _addPatchingExecute() {
        return new instrumentation_1.InstrumentationNodeModuleFile('graphql/execution/execute.js', supportedVersions, // cannot make it work with appropriate type as execute function has 2
        //types and/cannot import function but only types
        (moduleExports)=>{
            if ((0, instrumentation_1.isWrapped)(moduleExports.execute)) {
                this._unwrap(moduleExports, 'execute');
            }
            this._wrap(moduleExports, 'execute', this._patchExecute(moduleExports.defaultFieldResolver));
            return moduleExports;
        }, (moduleExports)=>{
            if (moduleExports) {
                this._unwrap(moduleExports, 'execute');
            }
        });
    }
    _addPatchingParser() {
        return new instrumentation_1.InstrumentationNodeModuleFile('graphql/language/parser.js', supportedVersions, (moduleExports)=>{
            if ((0, instrumentation_1.isWrapped)(moduleExports.parse)) {
                this._unwrap(moduleExports, 'parse');
            }
            this._wrap(moduleExports, 'parse', this._patchParse());
            return moduleExports;
        }, (moduleExports)=>{
            if (moduleExports) {
                this._unwrap(moduleExports, 'parse');
            }
        });
    }
    _addPatchingValidate() {
        return new instrumentation_1.InstrumentationNodeModuleFile('graphql/validation/validate.js', supportedVersions, (moduleExports)=>{
            if ((0, instrumentation_1.isWrapped)(moduleExports.validate)) {
                this._unwrap(moduleExports, 'validate');
            }
            this._wrap(moduleExports, 'validate', this._patchValidate());
            return moduleExports;
        }, (moduleExports)=>{
            if (moduleExports) {
                this._unwrap(moduleExports, 'validate');
            }
        });
    }
    _patchExecute(defaultFieldResolved) {
        const instrumentation = this;
        return function execute(original) {
            return function patchExecute() {
                let processedArgs;
                // case when apollo server is used for example
                if (arguments.length >= 2) {
                    const args = arguments;
                    processedArgs = instrumentation._wrapExecuteArgs(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], defaultFieldResolved);
                } else {
                    const args = arguments[0];
                    processedArgs = instrumentation._wrapExecuteArgs(args.schema, args.document, args.rootValue, args.contextValue, args.variableValues, args.operationName, args.fieldResolver, args.typeResolver, defaultFieldResolved);
                }
                const operation = (0, utils_1.getOperation)(processedArgs.document, processedArgs.operationName);
                const span = instrumentation._createExecuteSpan(operation, processedArgs);
                processedArgs.contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL] = {
                    source: processedArgs.document ? processedArgs.document || processedArgs.document[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL] : undefined,
                    span,
                    fields: {}
                };
                return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), ()=>{
                    return (0, instrumentation_1.safeExecuteInTheMiddle)(()=>{
                        return original.apply(this, [
                            processedArgs
                        ]);
                    }, (err, result)=>{
                        instrumentation._handleExecutionResult(span, err, result);
                    });
                });
            };
        };
    }
    _handleExecutionResult(span, err, result) {
        const config = this.getConfig();
        if (result === undefined || err) {
            (0, utils_1.endSpan)(span, err);
            return;
        }
        if ((0, utils_1.isPromise)(result)) {
            result.then((resultData)=>{
                if (typeof config.responseHook !== 'function') {
                    (0, utils_1.endSpan)(span);
                    return;
                }
                this._executeResponseHook(span, resultData);
            }, (error)=>{
                (0, utils_1.endSpan)(span, error);
            });
        } else {
            if (typeof config.responseHook !== 'function') {
                (0, utils_1.endSpan)(span);
                return;
            }
            this._executeResponseHook(span, result);
        }
    }
    _executeResponseHook(span, result) {
        const { responseHook } = this.getConfig();
        if (!responseHook) {
            return;
        }
        (0, instrumentation_1.safeExecuteInTheMiddle)(()=>{
            responseHook(span, result);
        }, (err)=>{
            if (err) {
                this._diag.error('Error running response hook', err);
            }
            (0, utils_1.endSpan)(span, undefined);
        }, true);
    }
    _patchParse() {
        const instrumentation = this;
        return function parse(original) {
            return function patchParse(source, options) {
                return instrumentation._parse(this, original, source, options);
            };
        };
    }
    _patchValidate() {
        const instrumentation = this;
        return function validate(original) {
            return function patchValidate(schema, documentAST, rules, options, typeInfo) {
                return instrumentation._validate(this, original, schema, documentAST, rules, typeInfo, options);
            };
        };
    }
    _parse(obj, original, source, options) {
        const config = this.getConfig();
        const span = this.tracer.startSpan(enum_1.SpanNames.PARSE);
        return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), ()=>{
            return (0, instrumentation_1.safeExecuteInTheMiddle)(()=>{
                return original.call(obj, source, options);
            }, (err, result)=>{
                if (result) {
                    const operation = (0, utils_1.getOperation)(result);
                    if (!operation) {
                        span.updateName(enum_1.SpanNames.SCHEMA_PARSE);
                    } else if (result.loc) {
                        (0, utils_1.addSpanSource)(span, result.loc, config.allowValues);
                    }
                }
                (0, utils_1.endSpan)(span, err);
            });
        });
    }
    _validate(obj, original, schema, documentAST, rules, typeInfo, options) {
        const span = this.tracer.startSpan(enum_1.SpanNames.VALIDATE, {});
        return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), ()=>{
            return (0, instrumentation_1.safeExecuteInTheMiddle)(()=>{
                return original.call(obj, schema, documentAST, rules, options, typeInfo);
            }, (err, errors)=>{
                if (!documentAST.loc) {
                    span.updateName(enum_1.SpanNames.SCHEMA_VALIDATE);
                }
                if (errors && errors.length) {
                    span.recordException({
                        name: AttributeNames_1.AttributeNames.ERROR_VALIDATION_NAME,
                        message: JSON.stringify(errors)
                    });
                }
                (0, utils_1.endSpan)(span, err);
            });
        });
    }
    _createExecuteSpan(operation, processedArgs) {
        var _a;
        const config = this.getConfig();
        const span = this.tracer.startSpan(enum_1.SpanNames.EXECUTE, {});
        if (operation) {
            const { operation: operationType, name: nameNode } = operation;
            span.setAttribute(AttributeNames_1.AttributeNames.OPERATION_TYPE, operationType);
            const operationName = nameNode === null || nameNode === void 0 ? void 0 : nameNode.value;
            // https://opentelemetry.io/docs/reference/specification/trace/semantic_conventions/instrumentation/graphql/
            // > The span name MUST be of the format <graphql.operation.type> <graphql.operation.name> provided that graphql.operation.type and graphql.operation.name are available.
            // > If graphql.operation.name is not available, the span SHOULD be named <graphql.operation.type>.
            if (operationName) {
                span.setAttribute(AttributeNames_1.AttributeNames.OPERATION_NAME, operationName);
                span.updateName(`${operationType} ${operationName}`);
            } else {
                span.updateName(operationType);
            }
        } else {
            let operationName = ' ';
            if (processedArgs.operationName) {
                operationName = ` "${processedArgs.operationName}" `;
            }
            operationName = internal_types_1.OPERATION_NOT_SUPPORTED.replace('$operationName$', operationName);
            span.setAttribute(AttributeNames_1.AttributeNames.OPERATION_NAME, operationName);
        }
        if ((_a = processedArgs.document) === null || _a === void 0 ? void 0 : _a.loc) {
            (0, utils_1.addSpanSource)(span, processedArgs.document.loc, config.allowValues);
        }
        if (processedArgs.variableValues && config.allowValues) {
            (0, utils_1.addInputVariableAttributes)(span, processedArgs.variableValues);
        }
        return span;
    }
    _wrapExecuteArgs(schema, document, rootValue, contextValue, variableValues, operationName, fieldResolver, typeResolver, defaultFieldResolved) {
        if (!contextValue) {
            contextValue = {};
        }
        if (contextValue[symbols_1.OTEL_GRAPHQL_DATA_SYMBOL] || this.getConfig().ignoreResolveSpans) {
            return {
                schema,
                document,
                rootValue,
                contextValue,
                variableValues,
                operationName,
                fieldResolver,
                typeResolver
            };
        }
        const isUsingDefaultResolver = fieldResolver == null;
        // follows graphql implementation here:
        // https://github.com/graphql/graphql-js/blob/0b7daed9811731362c71900e12e5ea0d1ecc7f1f/src/execution/execute.ts#L494
        const fieldResolverForExecute = fieldResolver !== null && fieldResolver !== void 0 ? fieldResolver : defaultFieldResolved;
        fieldResolver = (0, utils_1.wrapFieldResolver)(this.tracer, ()=>this.getConfig(), fieldResolverForExecute, isUsingDefaultResolver);
        if (schema) {
            (0, utils_1.wrapFields)(schema.getQueryType(), this.tracer, ()=>this.getConfig());
            (0, utils_1.wrapFields)(schema.getMutationType(), this.tracer, ()=>this.getConfig());
        }
        return {
            schema,
            document,
            rootValue,
            contextValue,
            variableValues,
            operationName,
            fieldResolver,
            typeResolver
        };
    }
}
exports.GraphQLInstrumentation = GraphQLInstrumentation;
}),
"[project]/node_modules/@opentelemetry/instrumentation-graphql/build/src/types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
}),
"[project]/node_modules/@opentelemetry/instrumentation-graphql/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-graphql/build/src/instrumentation.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-graphql/build/src/types.js [app-route] (ecmascript)"), exports);
}),
"[project]/node_modules/@opentelemetry/instrumentation-kafkajs/build/src/version.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
// this is autogenerated file, see scripts/version-update.js
exports.PACKAGE_VERSION = '0.7.1';
exports.PACKAGE_NAME = '@opentelemetry/instrumentation-kafkajs';
}),
"[project]/node_modules/@opentelemetry/instrumentation-kafkajs/build/src/propagator.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.bufferTextMapGetter = void 0;
/*
same as open telemetry's `defaultTextMapGetter`,
but also handle case where header is buffer,
adding toString() to make sure string is returned
*/ exports.bufferTextMapGetter = {
    get (carrier, key) {
        var _a;
        if (!carrier) {
            return undefined;
        }
        const keys = Object.keys(carrier);
        for (const carrierKey of keys){
            if (carrierKey === key || carrierKey.toLowerCase() === key) {
                return (_a = carrier[carrierKey]) === null || _a === void 0 ? void 0 : _a.toString();
            }
        }
        return undefined;
    },
    keys (carrier) {
        return carrier ? Object.keys(carrier) : [];
    }
};
}),
"[project]/node_modules/@opentelemetry/instrumentation-kafkajs/build/src/instrumentation.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors, Aspecto
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.KafkaJsInstrumentation = void 0;
const api_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const semantic_conventions_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/semantic-conventions/build/esm/index.js [app-route] (ecmascript)");
/** @knipignore */ const version_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-kafkajs/build/src/version.js [app-route] (ecmascript)");
const propagator_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-kafkajs/build/src/propagator.js [app-route] (ecmascript)");
const instrumentation_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
class KafkaJsInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}){
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
    }
    init() {
        const unpatch = (moduleExports)=>{
            var _a, _b;
            if ((0, instrumentation_1.isWrapped)((_a = moduleExports === null || moduleExports === void 0 ? void 0 : moduleExports.Kafka) === null || _a === void 0 ? void 0 : _a.prototype.producer)) {
                this._unwrap(moduleExports.Kafka.prototype, 'producer');
            }
            if ((0, instrumentation_1.isWrapped)((_b = moduleExports === null || moduleExports === void 0 ? void 0 : moduleExports.Kafka) === null || _b === void 0 ? void 0 : _b.prototype.consumer)) {
                this._unwrap(moduleExports.Kafka.prototype, 'consumer');
            }
        };
        const module = new instrumentation_1.InstrumentationNodeModuleDefinition('kafkajs', [
            '>=0.1.0 <3'
        ], (moduleExports)=>{
            var _a, _b;
            unpatch(moduleExports);
            this._wrap((_a = moduleExports === null || moduleExports === void 0 ? void 0 : moduleExports.Kafka) === null || _a === void 0 ? void 0 : _a.prototype, 'producer', this._getProducerPatch());
            this._wrap((_b = moduleExports === null || moduleExports === void 0 ? void 0 : moduleExports.Kafka) === null || _b === void 0 ? void 0 : _b.prototype, 'consumer', this._getConsumerPatch());
            return moduleExports;
        }, unpatch);
        return module;
    }
    _getConsumerPatch() {
        const instrumentation = this;
        return (original)=>{
            return function consumer(...args) {
                const newConsumer = original.apply(this, args);
                if ((0, instrumentation_1.isWrapped)(newConsumer.run)) {
                    instrumentation._unwrap(newConsumer, 'run');
                }
                instrumentation._wrap(newConsumer, 'run', instrumentation._getConsumerRunPatch());
                return newConsumer;
            };
        };
    }
    _getProducerPatch() {
        const instrumentation = this;
        return (original)=>{
            return function consumer(...args) {
                const newProducer = original.apply(this, args);
                if ((0, instrumentation_1.isWrapped)(newProducer.sendBatch)) {
                    instrumentation._unwrap(newProducer, 'sendBatch');
                }
                instrumentation._wrap(newProducer, 'sendBatch', instrumentation._getProducerSendBatchPatch());
                if ((0, instrumentation_1.isWrapped)(newProducer.send)) {
                    instrumentation._unwrap(newProducer, 'send');
                }
                instrumentation._wrap(newProducer, 'send', instrumentation._getProducerSendPatch());
                return newProducer;
            };
        };
    }
    _getConsumerRunPatch() {
        const instrumentation = this;
        return (original)=>{
            return function run(...args) {
                const config = args[0];
                if (config === null || config === void 0 ? void 0 : config.eachMessage) {
                    if ((0, instrumentation_1.isWrapped)(config.eachMessage)) {
                        instrumentation._unwrap(config, 'eachMessage');
                    }
                    instrumentation._wrap(config, 'eachMessage', instrumentation._getConsumerEachMessagePatch());
                }
                if (config === null || config === void 0 ? void 0 : config.eachBatch) {
                    if ((0, instrumentation_1.isWrapped)(config.eachBatch)) {
                        instrumentation._unwrap(config, 'eachBatch');
                    }
                    instrumentation._wrap(config, 'eachBatch', instrumentation._getConsumerEachBatchPatch());
                }
                return original.call(this, config);
            };
        };
    }
    _getConsumerEachMessagePatch() {
        const instrumentation = this;
        return (original)=>{
            return function eachMessage(...args) {
                const payload = args[0];
                const propagatedContext = api_1.propagation.extract(api_1.ROOT_CONTEXT, payload.message.headers, propagator_1.bufferTextMapGetter);
                const span = instrumentation._startConsumerSpan(payload.topic, payload.message, semantic_conventions_1.MESSAGINGOPERATIONVALUES_PROCESS, propagatedContext);
                const eachMessagePromise = api_1.context.with(api_1.trace.setSpan(propagatedContext, span), ()=>{
                    return original.apply(this, args);
                });
                return instrumentation._endSpansOnPromise([
                    span
                ], eachMessagePromise);
            };
        };
    }
    _getConsumerEachBatchPatch() {
        return (original)=>{
            const instrumentation = this;
            return function eachBatch(...args) {
                const payload = args[0];
                // https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/semantic_conventions/messaging.md#topic-with-multiple-consumers
                const receivingSpan = instrumentation._startConsumerSpan(payload.batch.topic, undefined, semantic_conventions_1.MESSAGINGOPERATIONVALUES_RECEIVE, api_1.ROOT_CONTEXT);
                return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), receivingSpan), ()=>{
                    const spans = payload.batch.messages.map((message)=>{
                        var _a;
                        const propagatedContext = api_1.propagation.extract(api_1.ROOT_CONTEXT, message.headers, propagator_1.bufferTextMapGetter);
                        const spanContext = (_a = api_1.trace.getSpan(propagatedContext)) === null || _a === void 0 ? void 0 : _a.spanContext();
                        let origSpanLink;
                        if (spanContext) {
                            origSpanLink = {
                                context: spanContext
                            };
                        }
                        return instrumentation._startConsumerSpan(payload.batch.topic, message, semantic_conventions_1.MESSAGINGOPERATIONVALUES_PROCESS, undefined, origSpanLink);
                    });
                    const batchMessagePromise = original.apply(this, args);
                    spans.unshift(receivingSpan);
                    return instrumentation._endSpansOnPromise(spans, batchMessagePromise);
                });
            };
        };
    }
    _getProducerSendBatchPatch() {
        const instrumentation = this;
        return (original)=>{
            return function sendBatch(...args) {
                const batch = args[0];
                const messages = batch.topicMessages || [];
                const spans = messages.map((topicMessage)=>topicMessage.messages.map((message)=>instrumentation._startProducerSpan(topicMessage.topic, message))).reduce((acc, val)=>acc.concat(val), []);
                const origSendResult = original.apply(this, args);
                return instrumentation._endSpansOnPromise(spans, origSendResult);
            };
        };
    }
    _getProducerSendPatch() {
        const instrumentation = this;
        return (original)=>{
            return function send(...args) {
                const record = args[0];
                const spans = record.messages.map((message)=>{
                    return instrumentation._startProducerSpan(record.topic, message);
                });
                const origSendResult = original.apply(this, args);
                return instrumentation._endSpansOnPromise(spans, origSendResult);
            };
        };
    }
    _endSpansOnPromise(spans, sendPromise) {
        return Promise.resolve(sendPromise).catch((reason)=>{
            let errorMessage;
            if (typeof reason === 'string') errorMessage = reason;
            else if (typeof reason === 'object' && Object.prototype.hasOwnProperty.call(reason, 'message')) errorMessage = reason.message;
            spans.forEach((span)=>span.setStatus({
                    code: api_1.SpanStatusCode.ERROR,
                    message: errorMessage
                }));
            throw reason;
        }).finally(()=>{
            spans.forEach((span)=>span.end());
        });
    }
    _startConsumerSpan(topic, message, operation, context, link) {
        const span = this.tracer.startSpan(topic, {
            kind: api_1.SpanKind.CONSUMER,
            attributes: {
                [semantic_conventions_1.SEMATTRS_MESSAGING_SYSTEM]: 'kafka',
                [semantic_conventions_1.SEMATTRS_MESSAGING_DESTINATION]: topic,
                [semantic_conventions_1.SEMATTRS_MESSAGING_OPERATION]: operation
            },
            links: link ? [
                link
            ] : []
        }, context);
        const { consumerHook } = this.getConfig();
        if (consumerHook && message) {
            (0, instrumentation_1.safeExecuteInTheMiddle)(()=>consumerHook(span, {
                    topic,
                    message
                }), (e)=>{
                if (e) this._diag.error('consumerHook error', e);
            }, true);
        }
        return span;
    }
    _startProducerSpan(topic, message) {
        var _a;
        const span = this.tracer.startSpan(topic, {
            kind: api_1.SpanKind.PRODUCER,
            attributes: {
                [semantic_conventions_1.SEMATTRS_MESSAGING_SYSTEM]: 'kafka',
                [semantic_conventions_1.SEMATTRS_MESSAGING_DESTINATION]: topic
            }
        });
        message.headers = (_a = message.headers) !== null && _a !== void 0 ? _a : {};
        api_1.propagation.inject(api_1.trace.setSpan(api_1.context.active(), span), message.headers);
        const { producerHook } = this.getConfig();
        if (producerHook) {
            (0, instrumentation_1.safeExecuteInTheMiddle)(()=>producerHook(span, {
                    topic,
                    message
                }), (e)=>{
                if (e) this._diag.error('producerHook error', e);
            }, true);
        }
        return span;
    }
}
exports.KafkaJsInstrumentation = KafkaJsInstrumentation;
}),
"[project]/node_modules/@opentelemetry/instrumentation-kafkajs/build/src/types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
}),
"[project]/node_modules/@opentelemetry/instrumentation-kafkajs/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors, Aspecto
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-kafkajs/build/src/instrumentation.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-kafkajs/build/src/types.js [app-route] (ecmascript)"), exports);
}),
"[project]/node_modules/@opentelemetry/instrumentation-lru-memoizer/build/src/version.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
// this is autogenerated file, see scripts/version-update.js
exports.PACKAGE_VERSION = '0.44.1';
exports.PACKAGE_NAME = '@opentelemetry/instrumentation-lru-memoizer';
}),
"[project]/node_modules/@opentelemetry/instrumentation-lru-memoizer/build/src/instrumentation.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.LruMemoizerInstrumentation = void 0;
const api_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const instrumentation_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
/** @knipignore */ const version_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-lru-memoizer/build/src/version.js [app-route] (ecmascript)");
class LruMemoizerInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}){
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
    }
    init() {
        return [
            new instrumentation_1.InstrumentationNodeModuleDefinition('lru-memoizer', [
                '>=1.3 <3'
            ], (moduleExports)=>{
                // moduleExports is a function which receives an options object,
                // and returns a "memoizer" function upon invocation.
                // We want to patch this "memoizer's" internal function
                const asyncMemoizer = function() {
                    // This following function is invoked every time the user wants to get a (possible) memoized value
                    // We replace it with another function in which we bind the current context to the last argument (callback)
                    const origMemoizer = moduleExports.apply(this, arguments);
                    return function() {
                        const modifiedArguments = [
                            ...arguments
                        ];
                        // last argument is the callback
                        const origCallback = modifiedArguments.pop();
                        const callbackWithContext = typeof origCallback === 'function' ? api_1.context.bind(api_1.context.active(), origCallback) : origCallback;
                        modifiedArguments.push(callbackWithContext);
                        return origMemoizer.apply(this, modifiedArguments);
                    };
                };
                // sync function preserves context, but we still need to export it
                // as the lru-memoizer package does
                asyncMemoizer.sync = moduleExports.sync;
                return asyncMemoizer;
            }, undefined // no need to disable as this instrumentation does not create any spans
            )
        ];
    }
}
exports.LruMemoizerInstrumentation = LruMemoizerInstrumentation;
}),
"[project]/node_modules/@opentelemetry/instrumentation-lru-memoizer/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-lru-memoizer/build/src/instrumentation.js [app-route] (ecmascript)"), exports);
}),
"[project]/node_modules/@opentelemetry/instrumentation-mongodb/build/src/internal-types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MongodbCommandType = void 0;
var MongodbCommandType;
(function(MongodbCommandType) {
    MongodbCommandType["CREATE_INDEXES"] = "createIndexes";
    MongodbCommandType["FIND_AND_MODIFY"] = "findAndModify";
    MongodbCommandType["IS_MASTER"] = "isMaster";
    MongodbCommandType["COUNT"] = "count";
    MongodbCommandType["AGGREGATE"] = "aggregate";
    MongodbCommandType["UNKNOWN"] = "unknown";
})(MongodbCommandType = exports.MongodbCommandType || (exports.MongodbCommandType = {}));
}),
"[project]/node_modules/@opentelemetry/instrumentation-mongodb/build/src/version.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
// this is autogenerated file, see scripts/version-update.js
exports.PACKAGE_VERSION = '0.52.0';
exports.PACKAGE_NAME = '@opentelemetry/instrumentation-mongodb';
}),
"[project]/node_modules/@opentelemetry/instrumentation-mongodb/build/src/instrumentation.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MongoDBInstrumentation = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const api_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const instrumentation_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
const semantic_conventions_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/semantic-conventions/build/esm/index.js [app-route] (ecmascript)");
const internal_types_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-mongodb/build/src/internal-types.js [app-route] (ecmascript)");
/** @knipignore */ const version_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-mongodb/build/src/version.js [app-route] (ecmascript)");
const DEFAULT_CONFIG = {
    requireParentSpan: true
};
/** mongodb instrumentation plugin for OpenTelemetry */ class MongoDBInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}){
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, Object.assign(Object.assign({}, DEFAULT_CONFIG), config));
    }
    setConfig(config = {}) {
        super.setConfig(Object.assign(Object.assign({}, DEFAULT_CONFIG), config));
    }
    _updateMetricInstruments() {
        this._connectionsUsage = this.meter.createUpDownCounter('db.client.connections.usage', {
            description: 'The number of connections that are currently in state described by the state attribute.',
            unit: '{connection}'
        });
    }
    init() {
        const { v3PatchConnection: v3PatchConnection, v3UnpatchConnection: v3UnpatchConnection } = this._getV3ConnectionPatches();
        const { v4PatchConnect, v4UnpatchConnect } = this._getV4ConnectPatches();
        const { v4PatchConnectionCallback, v4PatchConnectionPromise, v4UnpatchConnection } = this._getV4ConnectionPatches();
        const { v4PatchConnectionPool, v4UnpatchConnectionPool } = this._getV4ConnectionPoolPatches();
        const { v4PatchSessions, v4UnpatchSessions } = this._getV4SessionsPatches();
        return [
            new instrumentation_1.InstrumentationNodeModuleDefinition('mongodb', [
                '>=3.3.0 <4'
            ], undefined, undefined, [
                new instrumentation_1.InstrumentationNodeModuleFile('mongodb/lib/core/wireprotocol/index.js', [
                    '>=3.3.0 <4'
                ], v3PatchConnection, v3UnpatchConnection)
            ]),
            new instrumentation_1.InstrumentationNodeModuleDefinition('mongodb', [
                '>=4.0.0 <7'
            ], undefined, undefined, [
                new instrumentation_1.InstrumentationNodeModuleFile('mongodb/lib/cmap/connection.js', [
                    '>=4.0.0 <6.4'
                ], v4PatchConnectionCallback, v4UnpatchConnection),
                new instrumentation_1.InstrumentationNodeModuleFile('mongodb/lib/cmap/connection.js', [
                    '>=6.4.0 <7'
                ], v4PatchConnectionPromise, v4UnpatchConnection),
                new instrumentation_1.InstrumentationNodeModuleFile('mongodb/lib/cmap/connection_pool.js', [
                    '>=4.0.0 <6.4'
                ], v4PatchConnectionPool, v4UnpatchConnectionPool),
                new instrumentation_1.InstrumentationNodeModuleFile('mongodb/lib/cmap/connect.js', [
                    '>=4.0.0 <7'
                ], v4PatchConnect, v4UnpatchConnect),
                new instrumentation_1.InstrumentationNodeModuleFile('mongodb/lib/sessions.js', [
                    '>=4.0.0 <7'
                ], v4PatchSessions, v4UnpatchSessions)
            ])
        ];
    }
    _getV3ConnectionPatches() {
        return {
            v3PatchConnection: (moduleExports)=>{
                // patch insert operation
                if ((0, instrumentation_1.isWrapped)(moduleExports.insert)) {
                    this._unwrap(moduleExports, 'insert');
                }
                this._wrap(moduleExports, 'insert', this._getV3PatchOperation('insert'));
                // patch remove operation
                if ((0, instrumentation_1.isWrapped)(moduleExports.remove)) {
                    this._unwrap(moduleExports, 'remove');
                }
                this._wrap(moduleExports, 'remove', this._getV3PatchOperation('remove'));
                // patch update operation
                if ((0, instrumentation_1.isWrapped)(moduleExports.update)) {
                    this._unwrap(moduleExports, 'update');
                }
                this._wrap(moduleExports, 'update', this._getV3PatchOperation('update'));
                // patch other command
                if ((0, instrumentation_1.isWrapped)(moduleExports.command)) {
                    this._unwrap(moduleExports, 'command');
                }
                this._wrap(moduleExports, 'command', this._getV3PatchCommand());
                // patch query
                if ((0, instrumentation_1.isWrapped)(moduleExports.query)) {
                    this._unwrap(moduleExports, 'query');
                }
                this._wrap(moduleExports, 'query', this._getV3PatchFind());
                // patch get more operation on cursor
                if ((0, instrumentation_1.isWrapped)(moduleExports.getMore)) {
                    this._unwrap(moduleExports, 'getMore');
                }
                this._wrap(moduleExports, 'getMore', this._getV3PatchCursor());
                return moduleExports;
            },
            v3UnpatchConnection: (moduleExports)=>{
                if (moduleExports === undefined) return;
                this._unwrap(moduleExports, 'insert');
                this._unwrap(moduleExports, 'remove');
                this._unwrap(moduleExports, 'update');
                this._unwrap(moduleExports, 'command');
                this._unwrap(moduleExports, 'query');
                this._unwrap(moduleExports, 'getMore');
            }
        };
    }
    _getV4SessionsPatches() {
        return {
            v4PatchSessions: (moduleExports)=>{
                if ((0, instrumentation_1.isWrapped)(moduleExports.acquire)) {
                    this._unwrap(moduleExports, 'acquire');
                }
                this._wrap(moduleExports.ServerSessionPool.prototype, 'acquire', this._getV4AcquireCommand());
                if ((0, instrumentation_1.isWrapped)(moduleExports.release)) {
                    this._unwrap(moduleExports, 'release');
                }
                this._wrap(moduleExports.ServerSessionPool.prototype, 'release', this._getV4ReleaseCommand());
                return moduleExports;
            },
            v4UnpatchSessions: (moduleExports)=>{
                if (moduleExports === undefined) return;
                if ((0, instrumentation_1.isWrapped)(moduleExports.acquire)) {
                    this._unwrap(moduleExports, 'acquire');
                }
                if ((0, instrumentation_1.isWrapped)(moduleExports.release)) {
                    this._unwrap(moduleExports, 'release');
                }
            }
        };
    }
    _getV4AcquireCommand() {
        const instrumentation = this;
        return (original)=>{
            return function patchAcquire() {
                const nSessionsBeforeAcquire = this.sessions.length;
                const session = original.call(this);
                const nSessionsAfterAcquire = this.sessions.length;
                if (nSessionsBeforeAcquire === nSessionsAfterAcquire) {
                    //no session in the pool. a new session was created and used
                    instrumentation._connectionsUsage.add(1, {
                        state: 'used',
                        'pool.name': instrumentation._poolName
                    });
                } else if (nSessionsBeforeAcquire - 1 === nSessionsAfterAcquire) {
                    //a session was already in the pool. remove it from the pool and use it.
                    instrumentation._connectionsUsage.add(-1, {
                        state: 'idle',
                        'pool.name': instrumentation._poolName
                    });
                    instrumentation._connectionsUsage.add(1, {
                        state: 'used',
                        'pool.name': instrumentation._poolName
                    });
                }
                return session;
            };
        };
    }
    _getV4ReleaseCommand() {
        const instrumentation = this;
        return (original)=>{
            return function patchRelease(session) {
                const cmdPromise = original.call(this, session);
                instrumentation._connectionsUsage.add(-1, {
                    state: 'used',
                    'pool.name': instrumentation._poolName
                });
                instrumentation._connectionsUsage.add(1, {
                    state: 'idle',
                    'pool.name': instrumentation._poolName
                });
                return cmdPromise;
            };
        };
    }
    _getV4ConnectionPoolPatches() {
        return {
            v4PatchConnectionPool: (moduleExports)=>{
                const poolPrototype = moduleExports.ConnectionPool.prototype;
                if ((0, instrumentation_1.isWrapped)(poolPrototype.checkOut)) {
                    this._unwrap(poolPrototype, 'checkOut');
                }
                this._wrap(poolPrototype, 'checkOut', this._getV4ConnectionPoolCheckOut());
                return moduleExports;
            },
            v4UnpatchConnectionPool: (moduleExports)=>{
                if (moduleExports === undefined) return;
                this._unwrap(moduleExports.ConnectionPool.prototype, 'checkOut');
            }
        };
    }
    _getV4ConnectPatches() {
        return {
            v4PatchConnect: (moduleExports)=>{
                if ((0, instrumentation_1.isWrapped)(moduleExports.connect)) {
                    this._unwrap(moduleExports, 'connect');
                }
                this._wrap(moduleExports, 'connect', this._getV4ConnectCommand());
                return moduleExports;
            },
            v4UnpatchConnect: (moduleExports)=>{
                if (moduleExports === undefined) return;
                this._unwrap(moduleExports, 'connect');
            }
        };
    }
    // This patch will become unnecessary once
    // https://jira.mongodb.org/browse/NODE-5639 is done.
    _getV4ConnectionPoolCheckOut() {
        return (original)=>{
            return function patchedCheckout(callback) {
                const patchedCallback = api_1.context.bind(api_1.context.active(), callback);
                return original.call(this, patchedCallback);
            };
        };
    }
    _getV4ConnectCommand() {
        const instrumentation = this;
        return (original)=>{
            return function patchedConnect(options, callback) {
                // from v6.4 `connect` method only accepts an options param and returns a promise
                // with the connection
                if (original.length === 1) {
                    const result = original.call(this, options);
                    if (result && typeof result.then === 'function') {
                        result.then(()=>instrumentation.setPoolName(options), // this handler is set to pass the lint rules
                        ()=>undefined);
                    }
                    return result;
                }
                // Earlier versions expects a callback param and return void
                const patchedCallback = function(err, conn) {
                    if (err || !conn) {
                        callback(err, conn);
                        return;
                    }
                    instrumentation.setPoolName(options);
                    callback(err, conn);
                };
                return original.call(this, options, patchedCallback);
            };
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _getV4ConnectionPatches() {
        return {
            v4PatchConnectionCallback: (moduleExports)=>{
                // patch insert operation
                if ((0, instrumentation_1.isWrapped)(moduleExports.Connection.prototype.command)) {
                    this._unwrap(moduleExports.Connection.prototype, 'command');
                }
                this._wrap(moduleExports.Connection.prototype, 'command', this._getV4PatchCommandCallback());
                return moduleExports;
            },
            v4PatchConnectionPromise: (moduleExports)=>{
                // patch insert operation
                if ((0, instrumentation_1.isWrapped)(moduleExports.Connection.prototype.command)) {
                    this._unwrap(moduleExports.Connection.prototype, 'command');
                }
                this._wrap(moduleExports.Connection.prototype, 'command', this._getV4PatchCommandPromise());
                return moduleExports;
            },
            v4UnpatchConnection: (moduleExports)=>{
                if (moduleExports === undefined) return;
                this._unwrap(moduleExports.Connection.prototype, 'command');
            }
        };
    }
    /** Creates spans for common operations */ _getV3PatchOperation(operationName) {
        const instrumentation = this;
        return (original)=>{
            return function patchedServerCommand(server, ns, ops, options, callback) {
                const currentSpan = api_1.trace.getSpan(api_1.context.active());
                const skipInstrumentation = instrumentation._checkSkipInstrumentation(currentSpan);
                const resultHandler = typeof options === 'function' ? options : callback;
                if (skipInstrumentation || typeof resultHandler !== 'function' || typeof ops !== 'object') {
                    if (typeof options === 'function') {
                        return original.call(this, server, ns, ops, options);
                    } else {
                        return original.call(this, server, ns, ops, options, callback);
                    }
                }
                const span = instrumentation.tracer.startSpan(`mongodb.${operationName}`, {
                    kind: api_1.SpanKind.CLIENT
                });
                instrumentation._populateV3Attributes(span, ns, server, // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ops[0], operationName);
                const patchedCallback = instrumentation._patchEnd(span, resultHandler);
                // handle when options is the callback to send the correct number of args
                if (typeof options === 'function') {
                    return original.call(this, server, ns, ops, patchedCallback);
                } else {
                    return original.call(this, server, ns, ops, options, patchedCallback);
                }
            };
        };
    }
    /** Creates spans for command operation */ _getV3PatchCommand() {
        const instrumentation = this;
        return (original)=>{
            return function patchedServerCommand(server, ns, cmd, options, callback) {
                const currentSpan = api_1.trace.getSpan(api_1.context.active());
                const skipInstrumentation = instrumentation._checkSkipInstrumentation(currentSpan);
                const resultHandler = typeof options === 'function' ? options : callback;
                if (skipInstrumentation || typeof resultHandler !== 'function' || typeof cmd !== 'object') {
                    if (typeof options === 'function') {
                        return original.call(this, server, ns, cmd, options);
                    } else {
                        return original.call(this, server, ns, cmd, options, callback);
                    }
                }
                const commandType = MongoDBInstrumentation._getCommandType(cmd);
                const type = commandType === internal_types_1.MongodbCommandType.UNKNOWN ? 'command' : commandType;
                const span = instrumentation.tracer.startSpan(`mongodb.${type}`, {
                    kind: api_1.SpanKind.CLIENT
                });
                const operation = commandType === internal_types_1.MongodbCommandType.UNKNOWN ? undefined : commandType;
                instrumentation._populateV3Attributes(span, ns, server, cmd, operation);
                const patchedCallback = instrumentation._patchEnd(span, resultHandler);
                // handle when options is the callback to send the correct number of args
                if (typeof options === 'function') {
                    return original.call(this, server, ns, cmd, patchedCallback);
                } else {
                    return original.call(this, server, ns, cmd, options, patchedCallback);
                }
            };
        };
    }
    /** Creates spans for command operation */ _getV4PatchCommandCallback() {
        const instrumentation = this;
        return (original)=>{
            return function patchedV4ServerCommand(ns, cmd, options, callback) {
                const currentSpan = api_1.trace.getSpan(api_1.context.active());
                const skipInstrumentation = instrumentation._checkSkipInstrumentation(currentSpan);
                const resultHandler = callback;
                const commandType = Object.keys(cmd)[0];
                if (typeof cmd !== 'object' || cmd.ismaster || cmd.hello) {
                    return original.call(this, ns, cmd, options, callback);
                }
                let span = undefined;
                if (!skipInstrumentation) {
                    span = instrumentation.tracer.startSpan(`mongodb.${commandType}`, {
                        kind: api_1.SpanKind.CLIENT
                    });
                    instrumentation._populateV4Attributes(span, this, ns, cmd, commandType);
                }
                const patchedCallback = instrumentation._patchEnd(span, resultHandler, this.id, commandType);
                return original.call(this, ns, cmd, options, patchedCallback);
            };
        };
    }
    _getV4PatchCommandPromise() {
        const instrumentation = this;
        return (original)=>{
            return function patchedV4ServerCommand(...args) {
                const [ns, cmd] = args;
                const currentSpan = api_1.trace.getSpan(api_1.context.active());
                const skipInstrumentation = instrumentation._checkSkipInstrumentation(currentSpan);
                const commandType = Object.keys(cmd)[0];
                const resultHandler = ()=>undefined;
                if (typeof cmd !== 'object' || cmd.ismaster || cmd.hello) {
                    return original.apply(this, args);
                }
                let span = undefined;
                if (!skipInstrumentation) {
                    span = instrumentation.tracer.startSpan(`mongodb.${commandType}`, {
                        kind: api_1.SpanKind.CLIENT
                    });
                    instrumentation._populateV4Attributes(span, this, ns, cmd, commandType);
                }
                const patchedCallback = instrumentation._patchEnd(span, resultHandler, this.id, commandType);
                const result = original.apply(this, args);
                result.then((res)=>patchedCallback(null, res), (err)=>patchedCallback(err));
                return result;
            };
        };
    }
    /** Creates spans for find operation */ _getV3PatchFind() {
        const instrumentation = this;
        return (original)=>{
            return function patchedServerCommand(server, ns, cmd, cursorState, options, callback) {
                const currentSpan = api_1.trace.getSpan(api_1.context.active());
                const skipInstrumentation = instrumentation._checkSkipInstrumentation(currentSpan);
                const resultHandler = typeof options === 'function' ? options : callback;
                if (skipInstrumentation || typeof resultHandler !== 'function' || typeof cmd !== 'object') {
                    if (typeof options === 'function') {
                        return original.call(this, server, ns, cmd, cursorState, options);
                    } else {
                        return original.call(this, server, ns, cmd, cursorState, options, callback);
                    }
                }
                const span = instrumentation.tracer.startSpan('mongodb.find', {
                    kind: api_1.SpanKind.CLIENT
                });
                instrumentation._populateV3Attributes(span, ns, server, cmd, 'find');
                const patchedCallback = instrumentation._patchEnd(span, resultHandler);
                // handle when options is the callback to send the correct number of args
                if (typeof options === 'function') {
                    return original.call(this, server, ns, cmd, cursorState, patchedCallback);
                } else {
                    return original.call(this, server, ns, cmd, cursorState, options, patchedCallback);
                }
            };
        };
    }
    /** Creates spans for find operation */ _getV3PatchCursor() {
        const instrumentation = this;
        return (original)=>{
            return function patchedServerCommand(server, ns, cursorState, batchSize, options, callback) {
                const currentSpan = api_1.trace.getSpan(api_1.context.active());
                const skipInstrumentation = instrumentation._checkSkipInstrumentation(currentSpan);
                const resultHandler = typeof options === 'function' ? options : callback;
                if (skipInstrumentation || typeof resultHandler !== 'function') {
                    if (typeof options === 'function') {
                        return original.call(this, server, ns, cursorState, batchSize, options);
                    } else {
                        return original.call(this, server, ns, cursorState, batchSize, options, callback);
                    }
                }
                const span = instrumentation.tracer.startSpan('mongodb.getMore', {
                    kind: api_1.SpanKind.CLIENT
                });
                instrumentation._populateV3Attributes(span, ns, server, cursorState.cmd, 'getMore');
                const patchedCallback = instrumentation._patchEnd(span, resultHandler);
                // handle when options is the callback to send the correct number of args
                if (typeof options === 'function') {
                    return original.call(this, server, ns, cursorState, batchSize, patchedCallback);
                } else {
                    return original.call(this, server, ns, cursorState, batchSize, options, patchedCallback);
                }
            };
        };
    }
    /**
     * Get the mongodb command type from the object.
     * @param command Internal mongodb command object
     */ static _getCommandType(command) {
        if (command.createIndexes !== undefined) {
            return internal_types_1.MongodbCommandType.CREATE_INDEXES;
        } else if (command.findandmodify !== undefined) {
            return internal_types_1.MongodbCommandType.FIND_AND_MODIFY;
        } else if (command.ismaster !== undefined) {
            return internal_types_1.MongodbCommandType.IS_MASTER;
        } else if (command.count !== undefined) {
            return internal_types_1.MongodbCommandType.COUNT;
        } else if (command.aggregate !== undefined) {
            return internal_types_1.MongodbCommandType.AGGREGATE;
        } else {
            return internal_types_1.MongodbCommandType.UNKNOWN;
        }
    }
    /**
     * Populate span's attributes by fetching related metadata from the context
     * @param span span to add attributes to
     * @param connectionCtx mongodb internal connection context
     * @param ns mongodb namespace
     * @param command mongodb internal representation of a command
     */ _populateV4Attributes(span, connectionCtx, ns, command, operation) {
        let host, port;
        if (connectionCtx) {
            const hostParts = typeof connectionCtx.address === 'string' ? connectionCtx.address.split(':') : '';
            if (hostParts.length === 2) {
                host = hostParts[0];
                port = hostParts[1];
            }
        }
        // capture parameters within the query as well if enhancedDatabaseReporting is enabled.
        let commandObj;
        if ((command === null || command === void 0 ? void 0 : command.documents) && command.documents[0]) {
            commandObj = command.documents[0];
        } else if (command === null || command === void 0 ? void 0 : command.cursors) {
            commandObj = command.cursors;
        } else {
            commandObj = command;
        }
        this._addAllSpanAttributes(span, ns.db, ns.collection, host, port, commandObj, operation);
    }
    /**
     * Populate span's attributes by fetching related metadata from the context
     * @param span span to add attributes to
     * @param ns mongodb namespace
     * @param topology mongodb internal representation of the network topology
     * @param command mongodb internal representation of a command
     */ _populateV3Attributes(span, ns, topology, command, operation) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        // add network attributes to determine the remote server
        let host;
        let port;
        if (topology && topology.s) {
            host = (_b = (_a = topology.s.options) === null || _a === void 0 ? void 0 : _a.host) !== null && _b !== void 0 ? _b : topology.s.host;
            port = (_e = (_d = (_c = topology.s.options) === null || _c === void 0 ? void 0 : _c.port) !== null && _d !== void 0 ? _d : topology.s.port) === null || _e === void 0 ? void 0 : _e.toString();
            if (host == null || port == null) {
                const address = (_f = topology.description) === null || _f === void 0 ? void 0 : _f.address;
                if (address) {
                    const addressSegments = address.split(':');
                    host = addressSegments[0];
                    port = addressSegments[1];
                }
            }
        }
        // The namespace is a combination of the database name and the name of the
        // collection or index, like so: [database-name].[collection-or-index-name].
        // It could be a string or an instance of MongoDBNamespace, as such we
        // always coerce to a string to extract db and collection.
        const [dbName, dbCollection] = ns.toString().split('.');
        // capture parameters within the query as well if enhancedDatabaseReporting is enabled.
        const commandObj = (_h = (_g = command === null || command === void 0 ? void 0 : command.query) !== null && _g !== void 0 ? _g : command === null || command === void 0 ? void 0 : command.q) !== null && _h !== void 0 ? _h : command;
        this._addAllSpanAttributes(span, dbName, dbCollection, host, port, commandObj, operation);
    }
    _addAllSpanAttributes(span, dbName, dbCollection, host, port, commandObj, operation) {
        // add database related attributes
        span.setAttributes({
            [semantic_conventions_1.SEMATTRS_DB_SYSTEM]: semantic_conventions_1.DBSYSTEMVALUES_MONGODB,
            [semantic_conventions_1.SEMATTRS_DB_NAME]: dbName,
            [semantic_conventions_1.SEMATTRS_DB_MONGODB_COLLECTION]: dbCollection,
            [semantic_conventions_1.SEMATTRS_DB_OPERATION]: operation,
            [semantic_conventions_1.SEMATTRS_DB_CONNECTION_STRING]: `mongodb://${host}:${port}/${dbName}`
        });
        if (host && port) {
            span.setAttribute(semantic_conventions_1.SEMATTRS_NET_PEER_NAME, host);
            const portNumber = parseInt(port, 10);
            if (!isNaN(portNumber)) {
                span.setAttribute(semantic_conventions_1.SEMATTRS_NET_PEER_PORT, portNumber);
            }
        }
        if (!commandObj) return;
        const { dbStatementSerializer: configDbStatementSerializer } = this.getConfig();
        const dbStatementSerializer = typeof configDbStatementSerializer === 'function' ? configDbStatementSerializer : this._defaultDbStatementSerializer.bind(this);
        (0, instrumentation_1.safeExecuteInTheMiddle)(()=>{
            const query = dbStatementSerializer(commandObj);
            span.setAttribute(semantic_conventions_1.SEMATTRS_DB_STATEMENT, query);
        }, (err)=>{
            if (err) {
                this._diag.error('Error running dbStatementSerializer hook', err);
            }
        }, true);
    }
    _defaultDbStatementSerializer(commandObj) {
        const { enhancedDatabaseReporting } = this.getConfig();
        const resultObj = enhancedDatabaseReporting ? commandObj : this._scrubStatement(commandObj);
        return JSON.stringify(resultObj);
    }
    _scrubStatement(value) {
        if (Array.isArray(value)) {
            return value.map((element)=>this._scrubStatement(element));
        }
        if (typeof value === 'object' && value !== null) {
            return Object.fromEntries(Object.entries(value).map(([key, element])=>[
                    key,
                    this._scrubStatement(element)
                ]));
        }
        // A value like string or number, possible contains PII, scrub it
        return '?';
    }
    /**
     * Triggers the response hook in case it is defined.
     * @param span The span to add the results to.
     * @param result The command result
     */ _handleExecutionResult(span, result) {
        const { responseHook } = this.getConfig();
        if (typeof responseHook === 'function') {
            (0, instrumentation_1.safeExecuteInTheMiddle)(()=>{
                responseHook(span, {
                    data: result
                });
            }, (err)=>{
                if (err) {
                    this._diag.error('Error running response hook', err);
                }
            }, true);
        }
    }
    /**
     * Ends a created span.
     * @param span The created span to end.
     * @param resultHandler A callback function.
     * @param connectionId: The connection ID of the Command response.
     */ _patchEnd(span, resultHandler, connectionId, commandType) {
        // mongodb is using "tick" when calling a callback, this way the context
        // in final callback (resultHandler) is lost
        const activeContext = api_1.context.active();
        const instrumentation = this;
        return function patchedEnd(...args) {
            const error = args[0];
            if (span) {
                if (error instanceof Error) {
                    span === null || span === void 0 ? void 0 : span.setStatus({
                        code: api_1.SpanStatusCode.ERROR,
                        message: error.message
                    });
                } else {
                    const result = args[1];
                    instrumentation._handleExecutionResult(span, result);
                }
                span.end();
            }
            return api_1.context.with(activeContext, ()=>{
                if (commandType === 'endSessions') {
                    instrumentation._connectionsUsage.add(-1, {
                        state: 'idle',
                        'pool.name': instrumentation._poolName
                    });
                }
                return resultHandler.apply(this, args);
            });
        };
    }
    setPoolName(options) {
        var _a, _b;
        const host = (_a = options.hostAddress) === null || _a === void 0 ? void 0 : _a.host;
        const port = (_b = options.hostAddress) === null || _b === void 0 ? void 0 : _b.port;
        const database = options.dbName;
        const poolName = `mongodb://${host}:${port}/${database}`;
        this._poolName = poolName;
    }
    _checkSkipInstrumentation(currentSpan) {
        const requireParentSpan = this.getConfig().requireParentSpan;
        const hasNoParentSpan = currentSpan === undefined;
        return requireParentSpan === true && hasNoParentSpan;
    }
}
exports.MongoDBInstrumentation = MongoDBInstrumentation;
}),
"[project]/node_modules/@opentelemetry/instrumentation-mongodb/build/src/types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MongodbCommandType = void 0;
var MongodbCommandType;
(function(MongodbCommandType) {
    MongodbCommandType["CREATE_INDEXES"] = "createIndexes";
    MongodbCommandType["FIND_AND_MODIFY"] = "findAndModify";
    MongodbCommandType["IS_MASTER"] = "isMaster";
    MongodbCommandType["COUNT"] = "count";
    MongodbCommandType["UNKNOWN"] = "unknown";
})(MongodbCommandType = exports.MongodbCommandType || (exports.MongodbCommandType = {}));
}),
"[project]/node_modules/@opentelemetry/instrumentation-mongodb/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-mongodb/build/src/instrumentation.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-mongodb/build/src/types.js [app-route] (ecmascript)"), exports);
}),
"[project]/node_modules/@opentelemetry/instrumentation-mongoose/build/src/utils.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.handleCallbackResponse = exports.handlePromiseResponse = exports.getAttributesFromCollection = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const api_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const instrumentation_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
const semantic_conventions_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/semantic-conventions/build/esm/index.js [app-route] (ecmascript)");
function getAttributesFromCollection(collection) {
    return {
        [semantic_conventions_1.SEMATTRS_DB_MONGODB_COLLECTION]: collection.name,
        [semantic_conventions_1.SEMATTRS_DB_NAME]: collection.conn.name,
        [semantic_conventions_1.SEMATTRS_DB_USER]: collection.conn.user,
        [semantic_conventions_1.SEMATTRS_NET_PEER_NAME]: collection.conn.host,
        [semantic_conventions_1.SEMATTRS_NET_PEER_PORT]: collection.conn.port
    };
}
exports.getAttributesFromCollection = getAttributesFromCollection;
function setErrorStatus(span, error = {}) {
    span.recordException(error);
    span.setStatus({
        code: api_1.SpanStatusCode.ERROR,
        message: `${error.message} ${error.code ? `\nMongoose Error Code: ${error.code}` : ''}`
    });
}
function applyResponseHook(span, response, responseHook, moduleVersion = undefined) {
    if (!responseHook) {
        return;
    }
    (0, instrumentation_1.safeExecuteInTheMiddle)(()=>responseHook(span, {
            moduleVersion,
            response
        }), (e)=>{
        if (e) {
            api_1.diag.error('mongoose instrumentation: responseHook error', e);
        }
    }, true);
}
function handlePromiseResponse(execResponse, span, responseHook, moduleVersion = undefined) {
    if (!(execResponse instanceof Promise)) {
        applyResponseHook(span, execResponse, responseHook, moduleVersion);
        span.end();
        return execResponse;
    }
    return execResponse.then((response)=>{
        applyResponseHook(span, response, responseHook, moduleVersion);
        return response;
    }).catch((err)=>{
        setErrorStatus(span, err);
        throw err;
    }).finally(()=>span.end());
}
exports.handlePromiseResponse = handlePromiseResponse;
function handleCallbackResponse(callback, exec, originalThis, span, args, responseHook, moduleVersion = undefined) {
    let callbackArgumentIndex = 0;
    if (args.length === 2) {
        callbackArgumentIndex = 1;
    }
    args[callbackArgumentIndex] = (err, response)=>{
        err ? setErrorStatus(span, err) : applyResponseHook(span, response, responseHook, moduleVersion);
        span.end();
        return callback(err, response);
    };
    return exec.apply(originalThis, args);
}
exports.handleCallbackResponse = handleCallbackResponse;
}),
"[project]/node_modules/@opentelemetry/instrumentation-mongoose/build/src/version.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
// this is autogenerated file, see scripts/version-update.js
exports.PACKAGE_VERSION = '0.46.1';
exports.PACKAGE_NAME = '@opentelemetry/instrumentation-mongoose';
}),
"[project]/node_modules/@opentelemetry/instrumentation-mongoose/build/src/mongoose.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MongooseInstrumentation = exports._STORED_PARENT_SPAN = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const api_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const core_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/core/build/esm/index.js [app-route] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-mongoose/build/src/utils.js [app-route] (ecmascript)");
const instrumentation_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
/** @knipignore */ const version_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-mongoose/build/src/version.js [app-route] (ecmascript)");
const semantic_conventions_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/semantic-conventions/build/esm/index.js [app-route] (ecmascript)");
const contextCaptureFunctionsCommon = [
    'deleteOne',
    'deleteMany',
    'find',
    'findOne',
    'estimatedDocumentCount',
    'countDocuments',
    'distinct',
    'where',
    '$where',
    'findOneAndUpdate',
    'findOneAndDelete',
    'findOneAndReplace'
];
const contextCaptureFunctions6 = [
    'remove',
    'count',
    'findOneAndRemove',
    ...contextCaptureFunctionsCommon
];
const contextCaptureFunctions7 = [
    'count',
    'findOneAndRemove',
    ...contextCaptureFunctionsCommon
];
const contextCaptureFunctions8 = [
    ...contextCaptureFunctionsCommon
];
function getContextCaptureFunctions(moduleVersion) {
    /* istanbul ignore next */ if (!moduleVersion) {
        return contextCaptureFunctionsCommon;
    } else if (moduleVersion.startsWith('6.') || moduleVersion.startsWith('5.')) {
        return contextCaptureFunctions6;
    } else if (moduleVersion.startsWith('7.')) {
        return contextCaptureFunctions7;
    } else {
        return contextCaptureFunctions8;
    }
}
function instrumentRemove(moduleVersion) {
    return moduleVersion && (moduleVersion.startsWith('5.') || moduleVersion.startsWith('6.')) || false;
}
// when mongoose functions are called, we store the original call context
// and then set it as the parent for the spans created by Query/Aggregate exec()
// calls. this bypass the unlinked spans issue on thenables await operations.
exports._STORED_PARENT_SPAN = Symbol('stored-parent-span');
class MongooseInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}){
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
    }
    init() {
        const module = new instrumentation_1.InstrumentationNodeModuleDefinition('mongoose', [
            '>=5.9.7 <9'
        ], this.patch.bind(this), this.unpatch.bind(this));
        return module;
    }
    patch(moduleExports, moduleVersion) {
        this._wrap(moduleExports.Model.prototype, 'save', this.patchOnModelMethods('save', moduleVersion));
        // mongoose applies this code on module require:
        // Model.prototype.$save = Model.prototype.save;
        // which captures the save function before it is patched.
        // so we need to apply the same logic after instrumenting the save function.
        moduleExports.Model.prototype.$save = moduleExports.Model.prototype.save;
        if (instrumentRemove(moduleVersion)) {
            this._wrap(moduleExports.Model.prototype, 'remove', this.patchOnModelMethods('remove', moduleVersion));
        }
        this._wrap(moduleExports.Query.prototype, 'exec', this.patchQueryExec(moduleVersion));
        this._wrap(moduleExports.Aggregate.prototype, 'exec', this.patchAggregateExec(moduleVersion));
        const contextCaptureFunctions = getContextCaptureFunctions(moduleVersion);
        contextCaptureFunctions.forEach((funcName)=>{
            this._wrap(moduleExports.Query.prototype, funcName, this.patchAndCaptureSpanContext(funcName));
        });
        this._wrap(moduleExports.Model, 'aggregate', this.patchModelAggregate());
        return moduleExports;
    }
    unpatch(moduleExports, moduleVersion) {
        const contextCaptureFunctions = getContextCaptureFunctions(moduleVersion);
        this._unwrap(moduleExports.Model.prototype, 'save');
        // revert the patch for $save which we applied by aliasing it to patched `save`
        moduleExports.Model.prototype.$save = moduleExports.Model.prototype.save;
        if (instrumentRemove(moduleVersion)) {
            this._unwrap(moduleExports.Model.prototype, 'remove');
        }
        this._unwrap(moduleExports.Query.prototype, 'exec');
        this._unwrap(moduleExports.Aggregate.prototype, 'exec');
        contextCaptureFunctions.forEach((funcName)=>{
            this._unwrap(moduleExports.Query.prototype, funcName);
        });
        this._unwrap(moduleExports.Model, 'aggregate');
    }
    patchAggregateExec(moduleVersion) {
        const self = this;
        return (originalAggregate)=>{
            return function exec(callback) {
                var _a;
                if (self.getConfig().requireParentSpan && api_1.trace.getSpan(api_1.context.active()) === undefined) {
                    return originalAggregate.apply(this, arguments);
                }
                const parentSpan = this[exports._STORED_PARENT_SPAN];
                const attributes = {};
                const { dbStatementSerializer } = self.getConfig();
                if (dbStatementSerializer) {
                    attributes[semantic_conventions_1.SEMATTRS_DB_STATEMENT] = dbStatementSerializer('aggregate', {
                        options: this.options,
                        aggregatePipeline: this._pipeline
                    });
                }
                const span = self._startSpan(this._model.collection, (_a = this._model) === null || _a === void 0 ? void 0 : _a.modelName, 'aggregate', attributes, parentSpan);
                return self._handleResponse(span, originalAggregate, this, arguments, callback, moduleVersion);
            };
        };
    }
    patchQueryExec(moduleVersion) {
        const self = this;
        return (originalExec)=>{
            return function exec(callback) {
                if (self.getConfig().requireParentSpan && api_1.trace.getSpan(api_1.context.active()) === undefined) {
                    return originalExec.apply(this, arguments);
                }
                const parentSpan = this[exports._STORED_PARENT_SPAN];
                const attributes = {};
                const { dbStatementSerializer } = self.getConfig();
                if (dbStatementSerializer) {
                    attributes[semantic_conventions_1.SEMATTRS_DB_STATEMENT] = dbStatementSerializer(this.op, {
                        condition: this._conditions,
                        updates: this._update,
                        options: this.options,
                        fields: this._fields
                    });
                }
                const span = self._startSpan(this.mongooseCollection, this.model.modelName, this.op, attributes, parentSpan);
                return self._handleResponse(span, originalExec, this, arguments, callback, moduleVersion);
            };
        };
    }
    patchOnModelMethods(op, moduleVersion) {
        const self = this;
        return (originalOnModelFunction)=>{
            return function method(options, callback) {
                if (self.getConfig().requireParentSpan && api_1.trace.getSpan(api_1.context.active()) === undefined) {
                    return originalOnModelFunction.apply(this, arguments);
                }
                const serializePayload = {
                    document: this
                };
                if (options && !(options instanceof Function)) {
                    serializePayload.options = options;
                }
                const attributes = {};
                const { dbStatementSerializer } = self.getConfig();
                if (dbStatementSerializer) {
                    attributes[semantic_conventions_1.SEMATTRS_DB_STATEMENT] = dbStatementSerializer(op, serializePayload);
                }
                const span = self._startSpan(this.constructor.collection, this.constructor.modelName, op, attributes);
                if (options instanceof Function) {
                    callback = options;
                    options = undefined;
                }
                return self._handleResponse(span, originalOnModelFunction, this, arguments, callback, moduleVersion);
            };
        };
    }
    // we want to capture the otel span on the object which is calling exec.
    // in the special case of aggregate, we need have no function to path
    // on the Aggregate object to capture the context on, so we patch
    // the aggregate of Model, and set the context on the Aggregate object
    patchModelAggregate() {
        const self = this;
        return (original)=>{
            return function captureSpanContext() {
                const currentSpan = api_1.trace.getSpan(api_1.context.active());
                const aggregate = self._callOriginalFunction(()=>original.apply(this, arguments));
                if (aggregate) aggregate[exports._STORED_PARENT_SPAN] = currentSpan;
                return aggregate;
            };
        };
    }
    patchAndCaptureSpanContext(funcName) {
        const self = this;
        return (original)=>{
            return function captureSpanContext() {
                this[exports._STORED_PARENT_SPAN] = api_1.trace.getSpan(api_1.context.active());
                return self._callOriginalFunction(()=>original.apply(this, arguments));
            };
        };
    }
    _startSpan(collection, modelName, operation, attributes, parentSpan) {
        return this.tracer.startSpan(`mongoose.${modelName}.${operation}`, {
            kind: api_1.SpanKind.CLIENT,
            attributes: Object.assign(Object.assign(Object.assign({}, attributes), (0, utils_1.getAttributesFromCollection)(collection)), {
                [semantic_conventions_1.SEMATTRS_DB_OPERATION]: operation,
                [semantic_conventions_1.SEMATTRS_DB_SYSTEM]: 'mongoose'
            })
        }, parentSpan ? api_1.trace.setSpan(api_1.context.active(), parentSpan) : undefined);
    }
    _handleResponse(span, exec, originalThis, args, callback, moduleVersion = undefined) {
        const self = this;
        if (callback instanceof Function) {
            return self._callOriginalFunction(()=>(0, utils_1.handleCallbackResponse)(callback, exec, originalThis, span, args, self.getConfig().responseHook, moduleVersion));
        } else {
            const response = self._callOriginalFunction(()=>exec.apply(originalThis, args));
            return (0, utils_1.handlePromiseResponse)(response, span, self.getConfig().responseHook, moduleVersion);
        }
    }
    _callOriginalFunction(originalFunction) {
        if (this.getConfig().suppressInternalInstrumentation) {
            return api_1.context.with((0, core_1.suppressTracing)(api_1.context.active()), originalFunction);
        } else {
            return originalFunction();
        }
    }
}
exports.MongooseInstrumentation = MongooseInstrumentation;
}),
"[project]/node_modules/@opentelemetry/instrumentation-mongoose/build/src/types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
}),
"[project]/node_modules/@opentelemetry/instrumentation-mongoose/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ __exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-mongoose/build/src/mongoose.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-mongoose/build/src/types.js [app-route] (ecmascript)"), exports);
}),
"[project]/node_modules/@opentelemetry/instrumentation-mysql/build/src/AttributeNames.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AttributeNames = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ // Mysql specific attributes not covered by semantic conventions
var AttributeNames;
(function(AttributeNames) {
    AttributeNames["MYSQL_VALUES"] = "db.mysql.values";
})(AttributeNames = exports.AttributeNames || (exports.AttributeNames = {}));
}),
"[project]/node_modules/@opentelemetry/instrumentation-mysql/build/src/utils.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getPoolName = exports.arrayStringifyHelper = exports.getSpanName = exports.getDbValues = exports.getDbStatement = exports.getConnectionAttributes = void 0;
const semantic_conventions_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/semantic-conventions/build/esm/index.js [app-route] (ecmascript)");
/**
 * Get an Attributes map from a mysql connection config object
 *
 * @param config ConnectionConfig
 */ function getConnectionAttributes(config) {
    const { host, port, database, user } = getConfig(config);
    const portNumber = parseInt(port, 10);
    if (!isNaN(portNumber)) {
        return {
            [semantic_conventions_1.SEMATTRS_NET_PEER_NAME]: host,
            [semantic_conventions_1.SEMATTRS_NET_PEER_PORT]: portNumber,
            [semantic_conventions_1.SEMATTRS_DB_CONNECTION_STRING]: getJDBCString(host, port, database),
            [semantic_conventions_1.SEMATTRS_DB_NAME]: database,
            [semantic_conventions_1.SEMATTRS_DB_USER]: user
        };
    }
    return {
        [semantic_conventions_1.SEMATTRS_NET_PEER_NAME]: host,
        [semantic_conventions_1.SEMATTRS_DB_CONNECTION_STRING]: getJDBCString(host, port, database),
        [semantic_conventions_1.SEMATTRS_DB_NAME]: database,
        [semantic_conventions_1.SEMATTRS_DB_USER]: user
    };
}
exports.getConnectionAttributes = getConnectionAttributes;
function getConfig(config) {
    const { host, port, database, user } = config && config.connectionConfig || config || {};
    return {
        host,
        port,
        database,
        user
    };
}
function getJDBCString(host, port, database) {
    let jdbcString = `jdbc:mysql://${host || 'localhost'}`;
    if (typeof port === 'number') {
        jdbcString += `:${port}`;
    }
    if (typeof database === 'string') {
        jdbcString += `/${database}`;
    }
    return jdbcString;
}
/**
 * @returns the database statement being executed.
 */ function getDbStatement(query) {
    if (typeof query === 'string') {
        return query;
    } else {
        return query.sql;
    }
}
exports.getDbStatement = getDbStatement;
function getDbValues(query, values) {
    if (typeof query === 'string') {
        return arrayStringifyHelper(values);
    } else {
        // According to https://github.com/mysqljs/mysql#performing-queries
        // The values argument will override the values in the option object.
        return arrayStringifyHelper(values || query.values);
    }
}
exports.getDbValues = getDbValues;
/**
 * The span name SHOULD be set to a low cardinality value
 * representing the statement executed on the database.
 *
 * @returns SQL statement without variable arguments or SQL verb
 */ function getSpanName(query) {
    const rawQuery = typeof query === 'object' ? query.sql : query;
    // Extract the SQL verb
    const firstSpace = rawQuery === null || rawQuery === void 0 ? void 0 : rawQuery.indexOf(' ');
    if (typeof firstSpace === 'number' && firstSpace !== -1) {
        return rawQuery === null || rawQuery === void 0 ? void 0 : rawQuery.substring(0, firstSpace);
    }
    return rawQuery;
}
exports.getSpanName = getSpanName;
function arrayStringifyHelper(arr) {
    if (arr) return `[${arr.toString()}]`;
    return '';
}
exports.arrayStringifyHelper = arrayStringifyHelper;
function getPoolName(pool) {
    const c = pool.config.connectionConfig;
    let poolName = '';
    poolName += c.host ? `host: '${c.host}', ` : '';
    poolName += c.port ? `port: ${c.port}, ` : '';
    poolName += c.database ? `database: '${c.database}', ` : '';
    poolName += c.user ? `user: '${c.user}'` : '';
    if (!c.user) {
        poolName = poolName.substring(0, poolName.length - 2); //omit last comma
    }
    return poolName.trim();
}
exports.getPoolName = getPoolName;
}),
"[project]/node_modules/@opentelemetry/instrumentation-mysql/build/src/version.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
// this is autogenerated file, see scripts/version-update.js
exports.PACKAGE_VERSION = '0.45.1';
exports.PACKAGE_NAME = '@opentelemetry/instrumentation-mysql';
}),
"[project]/node_modules/@opentelemetry/instrumentation-mysql/build/src/instrumentation.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MySQLInstrumentation = void 0;
const api_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const instrumentation_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
const semantic_conventions_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/semantic-conventions/build/esm/index.js [app-route] (ecmascript)");
const AttributeNames_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-mysql/build/src/AttributeNames.js [app-route] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-mysql/build/src/utils.js [app-route] (ecmascript)");
/** @knipignore */ const version_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-mysql/build/src/version.js [app-route] (ecmascript)");
class MySQLInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}){
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
        this._setMetricInstruments();
    }
    setMeterProvider(meterProvider) {
        super.setMeterProvider(meterProvider);
        this._setMetricInstruments();
    }
    _setMetricInstruments() {
        this._connectionsUsage = this.meter.createUpDownCounter('db.client.connections.usage', {
            description: 'The number of connections that are currently in state described by the state attribute.',
            unit: '{connection}'
        });
    }
    init() {
        return [
            new instrumentation_1.InstrumentationNodeModuleDefinition('mysql', [
                '>=2.0.0 <3'
            ], (moduleExports)=>{
                if ((0, instrumentation_1.isWrapped)(moduleExports.createConnection)) {
                    this._unwrap(moduleExports, 'createConnection');
                }
                this._wrap(moduleExports, 'createConnection', this._patchCreateConnection());
                if ((0, instrumentation_1.isWrapped)(moduleExports.createPool)) {
                    this._unwrap(moduleExports, 'createPool');
                }
                this._wrap(moduleExports, 'createPool', this._patchCreatePool());
                if ((0, instrumentation_1.isWrapped)(moduleExports.createPoolCluster)) {
                    this._unwrap(moduleExports, 'createPoolCluster');
                }
                this._wrap(moduleExports, 'createPoolCluster', this._patchCreatePoolCluster());
                return moduleExports;
            }, (moduleExports)=>{
                if (moduleExports === undefined) return;
                this._unwrap(moduleExports, 'createConnection');
                this._unwrap(moduleExports, 'createPool');
                this._unwrap(moduleExports, 'createPoolCluster');
            })
        ];
    }
    // global export function
    _patchCreateConnection() {
        return (originalCreateConnection)=>{
            const thisPlugin = this;
            return function createConnection(_connectionUri) {
                const originalResult = originalCreateConnection(...arguments);
                // This is unwrapped on next call after unpatch
                thisPlugin._wrap(originalResult, 'query', thisPlugin._patchQuery(originalResult));
                return originalResult;
            };
        };
    }
    // global export function
    _patchCreatePool() {
        return (originalCreatePool)=>{
            const thisPlugin = this;
            return function createPool(_config) {
                const pool = originalCreatePool(...arguments);
                thisPlugin._wrap(pool, 'query', thisPlugin._patchQuery(pool));
                thisPlugin._wrap(pool, 'getConnection', thisPlugin._patchGetConnection(pool));
                thisPlugin._wrap(pool, 'end', thisPlugin._patchPoolEnd(pool));
                thisPlugin._setPoolcallbacks(pool, thisPlugin, '');
                return pool;
            };
        };
    }
    _patchPoolEnd(pool) {
        return (originalPoolEnd)=>{
            const thisPlugin = this;
            return function end(callback) {
                const nAll = pool._allConnections.length;
                const nFree = pool._freeConnections.length;
                const nUsed = nAll - nFree;
                const poolName = (0, utils_1.getPoolName)(pool);
                thisPlugin._connectionsUsage.add(-nUsed, {
                    state: 'used',
                    name: poolName
                });
                thisPlugin._connectionsUsage.add(-nFree, {
                    state: 'idle',
                    name: poolName
                });
                originalPoolEnd.apply(pool, arguments);
            };
        };
    }
    // global export function
    _patchCreatePoolCluster() {
        return (originalCreatePoolCluster)=>{
            const thisPlugin = this;
            return function createPool(_config) {
                const cluster = originalCreatePoolCluster(...arguments);
                // This is unwrapped on next call after unpatch
                thisPlugin._wrap(cluster, 'getConnection', thisPlugin._patchGetConnection(cluster));
                thisPlugin._wrap(cluster, 'add', thisPlugin._patchAdd(cluster));
                return cluster;
            };
        };
    }
    _patchAdd(cluster) {
        return (originalAdd)=>{
            const thisPlugin = this;
            return function add(id, config) {
                // Unwrap if unpatch has been called
                if (!thisPlugin['_enabled']) {
                    thisPlugin._unwrap(cluster, 'add');
                    return originalAdd.apply(cluster, arguments);
                }
                originalAdd.apply(cluster, arguments);
                const nodes = cluster['_nodes'];
                if (nodes) {
                    const nodeId = typeof id === 'object' ? 'CLUSTER::' + cluster._lastId : String(id);
                    const pool = nodes[nodeId].pool;
                    thisPlugin._setPoolcallbacks(pool, thisPlugin, id);
                }
            };
        };
    }
    // method on cluster or pool
    _patchGetConnection(pool) {
        return (originalGetConnection)=>{
            const thisPlugin = this;
            return function getConnection(arg1, arg2, arg3) {
                // Unwrap if unpatch has been called
                if (!thisPlugin['_enabled']) {
                    thisPlugin._unwrap(pool, 'getConnection');
                    return originalGetConnection.apply(pool, arguments);
                }
                if (arguments.length === 1 && typeof arg1 === 'function') {
                    const patchFn = thisPlugin._getConnectionCallbackPatchFn(arg1);
                    return originalGetConnection.call(pool, patchFn);
                }
                if (arguments.length === 2 && typeof arg2 === 'function') {
                    const patchFn = thisPlugin._getConnectionCallbackPatchFn(arg2);
                    return originalGetConnection.call(pool, arg1, patchFn);
                }
                if (arguments.length === 3 && typeof arg3 === 'function') {
                    const patchFn = thisPlugin._getConnectionCallbackPatchFn(arg3);
                    return originalGetConnection.call(pool, arg1, arg2, patchFn);
                }
                return originalGetConnection.apply(pool, arguments);
            };
        };
    }
    _getConnectionCallbackPatchFn(cb) {
        const thisPlugin = this;
        const activeContext = api_1.context.active();
        return function(err, connection) {
            if (connection) {
                // this is the callback passed into a query
                // no need to unwrap
                if (!(0, instrumentation_1.isWrapped)(connection.query)) {
                    thisPlugin._wrap(connection, 'query', thisPlugin._patchQuery(connection));
                }
            }
            if (typeof cb === 'function') {
                api_1.context.with(activeContext, cb, this, err, connection);
            }
        };
    }
    _patchQuery(connection) {
        return (originalQuery)=>{
            const thisPlugin = this;
            return function query(query, _valuesOrCallback, _callback) {
                if (!thisPlugin['_enabled']) {
                    thisPlugin._unwrap(connection, 'query');
                    return originalQuery.apply(connection, arguments);
                }
                const span = thisPlugin.tracer.startSpan((0, utils_1.getSpanName)(query), {
                    kind: api_1.SpanKind.CLIENT,
                    attributes: Object.assign(Object.assign({}, MySQLInstrumentation.COMMON_ATTRIBUTES), (0, utils_1.getConnectionAttributes)(connection.config))
                });
                span.setAttribute(semantic_conventions_1.SEMATTRS_DB_STATEMENT, (0, utils_1.getDbStatement)(query));
                if (thisPlugin.getConfig().enhancedDatabaseReporting) {
                    let values;
                    if (Array.isArray(_valuesOrCallback)) {
                        values = _valuesOrCallback;
                    } else if (arguments[2]) {
                        values = [
                            _valuesOrCallback
                        ];
                    }
                    span.setAttribute(AttributeNames_1.AttributeNames.MYSQL_VALUES, (0, utils_1.getDbValues)(query, values));
                }
                const cbIndex = Array.from(arguments).findIndex((arg)=>typeof arg === 'function');
                const parentContext = api_1.context.active();
                if (cbIndex === -1) {
                    const streamableQuery = api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), ()=>{
                        return originalQuery.apply(connection, arguments);
                    });
                    api_1.context.bind(parentContext, streamableQuery);
                    return streamableQuery.on('error', (err)=>span.setStatus({
                            code: api_1.SpanStatusCode.ERROR,
                            message: err.message
                        })).on('end', ()=>{
                        span.end();
                    });
                } else {
                    thisPlugin._wrap(arguments, cbIndex, thisPlugin._patchCallbackQuery(span, parentContext));
                    return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), ()=>{
                        return originalQuery.apply(connection, arguments);
                    });
                }
            };
        };
    }
    _patchCallbackQuery(span, parentContext) {
        return (originalCallback)=>{
            return function(err, results, fields) {
                if (err) {
                    span.setStatus({
                        code: api_1.SpanStatusCode.ERROR,
                        message: err.message
                    });
                }
                span.end();
                return api_1.context.with(parentContext, ()=>originalCallback(...arguments));
            };
        };
    }
    _setPoolcallbacks(pool, thisPlugin, id) {
        //TODO:: use semantic convention
        const poolName = id || (0, utils_1.getPoolName)(pool);
        pool.on('connection', (connection)=>{
            thisPlugin._connectionsUsage.add(1, {
                state: 'idle',
                name: poolName
            });
        });
        pool.on('acquire', (connection)=>{
            thisPlugin._connectionsUsage.add(-1, {
                state: 'idle',
                name: poolName
            });
            thisPlugin._connectionsUsage.add(1, {
                state: 'used',
                name: poolName
            });
        });
        pool.on('release', (connection)=>{
            thisPlugin._connectionsUsage.add(-1, {
                state: 'used',
                name: poolName
            });
            thisPlugin._connectionsUsage.add(1, {
                state: 'idle',
                name: poolName
            });
        });
    }
}
exports.MySQLInstrumentation = MySQLInstrumentation;
MySQLInstrumentation.COMMON_ATTRIBUTES = {
    [semantic_conventions_1.SEMATTRS_DB_SYSTEM]: semantic_conventions_1.DBSYSTEMVALUES_MYSQL
};
}),
"[project]/node_modules/@opentelemetry/instrumentation-mysql/build/src/types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
}),
"[project]/node_modules/@opentelemetry/instrumentation-mysql/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-mysql/build/src/instrumentation.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-mysql/build/src/types.js [app-route] (ecmascript)"), exports);
}),
"[project]/node_modules/@opentelemetry/sql-common/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.addSqlCommenterComment = void 0;
const api_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const core_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/core/build/esm/index.js [app-route] (ecmascript)");
// NOTE: This function currently is returning false-positives
// in cases where comment characters appear in string literals
// ("SELECT '-- not a comment';" would return true, although has no comment)
function hasValidSqlComment(query) {
    const indexOpeningDashDashComment = query.indexOf('--');
    if (indexOpeningDashDashComment >= 0) {
        return true;
    }
    const indexOpeningSlashComment = query.indexOf('/*');
    if (indexOpeningSlashComment < 0) {
        return false;
    }
    const indexClosingSlashComment = query.indexOf('*/');
    return indexOpeningDashDashComment < indexClosingSlashComment;
}
// sqlcommenter specification (https://google.github.io/sqlcommenter/spec/#value-serialization)
// expects us to URL encode based on the RFC 3986 spec (https://en.wikipedia.org/wiki/Percent-encoding),
// but encodeURIComponent does not handle some characters correctly (! ' ( ) *),
// which means we need special handling for this
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
function fixedEncodeURIComponent(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, (c)=>`%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}
function addSqlCommenterComment(span, query) {
    if (typeof query !== 'string' || query.length === 0) {
        return query;
    }
    // As per sqlcommenter spec we shall not add a comment if there already is a comment
    // in the query
    if (hasValidSqlComment(query)) {
        return query;
    }
    const propagator = new core_1.W3CTraceContextPropagator();
    const headers = {};
    propagator.inject(api_1.trace.setSpan(api_1.ROOT_CONTEXT, span), headers, api_1.defaultTextMapSetter);
    // sqlcommenter spec requires keys in the comment to be sorted lexicographically
    const sortedKeys = Object.keys(headers).sort();
    if (sortedKeys.length === 0) {
        return query;
    }
    const commentString = sortedKeys.map((key)=>{
        const encodedValue = fixedEncodeURIComponent(headers[key]);
        return `${key}='${encodedValue}'`;
    }).join(',');
    return `${query} /*${commentString}*/`;
}
exports.addSqlCommenterComment = addSqlCommenterComment;
}),
"[project]/node_modules/@opentelemetry/instrumentation-mysql2/build/src/utils.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getConnectionPrototypeToInstrument = exports.once = exports.getSpanName = exports.getDbStatement = exports.getConnectionAttributes = void 0;
const semantic_conventions_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/semantic-conventions/build/esm/index.js [app-route] (ecmascript)");
/**
 * Get an Attributes map from a mysql connection config object
 *
 * @param config ConnectionConfig
 */ function getConnectionAttributes(config) {
    const { host, port, database, user } = getConfig(config);
    const portNumber = parseInt(port, 10);
    if (!isNaN(portNumber)) {
        return {
            [semantic_conventions_1.SEMATTRS_NET_PEER_NAME]: host,
            [semantic_conventions_1.SEMATTRS_NET_PEER_PORT]: portNumber,
            [semantic_conventions_1.SEMATTRS_DB_CONNECTION_STRING]: getJDBCString(host, port, database),
            [semantic_conventions_1.SEMATTRS_DB_NAME]: database,
            [semantic_conventions_1.SEMATTRS_DB_USER]: user
        };
    }
    return {
        [semantic_conventions_1.SEMATTRS_NET_PEER_NAME]: host,
        [semantic_conventions_1.SEMATTRS_DB_CONNECTION_STRING]: getJDBCString(host, port, database),
        [semantic_conventions_1.SEMATTRS_DB_NAME]: database,
        [semantic_conventions_1.SEMATTRS_DB_USER]: user
    };
}
exports.getConnectionAttributes = getConnectionAttributes;
function getConfig(config) {
    const { host, port, database, user } = config && config.connectionConfig || config || {};
    return {
        host,
        port,
        database,
        user
    };
}
function getJDBCString(host, port, database) {
    let jdbcString = `jdbc:mysql://${host || 'localhost'}`;
    if (typeof port === 'number') {
        jdbcString += `:${port}`;
    }
    if (typeof database === 'string') {
        jdbcString += `/${database}`;
    }
    return jdbcString;
}
/**
 * Conjures up the value for the db.statement attribute by formatting a SQL query.
 *
 * @returns the database statement being executed.
 */ function getDbStatement(query, format, values) {
    if (!format) {
        return typeof query === 'string' ? query : query.sql;
    }
    if (typeof query === 'string') {
        return values ? format(query, values) : query;
    } else {
        // According to https://github.com/mysqljs/mysql#performing-queries
        // The values argument will override the values in the option object.
        return values || query.values ? format(query.sql, values || query.values) : query.sql;
    }
}
exports.getDbStatement = getDbStatement;
/**
 * The span name SHOULD be set to a low cardinality value
 * representing the statement executed on the database.
 *
 * @returns SQL statement without variable arguments or SQL verb
 */ function getSpanName(query) {
    const rawQuery = typeof query === 'object' ? query.sql : query;
    // Extract the SQL verb
    const firstSpace = rawQuery === null || rawQuery === void 0 ? void 0 : rawQuery.indexOf(' ');
    if (typeof firstSpace === 'number' && firstSpace !== -1) {
        return rawQuery === null || rawQuery === void 0 ? void 0 : rawQuery.substring(0, firstSpace);
    }
    return rawQuery;
}
exports.getSpanName = getSpanName;
const once = (fn)=>{
    let called = false;
    return (...args)=>{
        if (called) return;
        called = true;
        return fn(...args);
    };
};
exports.once = once;
function getConnectionPrototypeToInstrument(connection) {
    const connectionPrototype = connection.prototype;
    const basePrototype = Object.getPrototypeOf(connectionPrototype);
    // mysql2@3.11.5 included a refactoring, where most code was moved out of the `Connection` class and into a shared base
    // so we need to instrument that instead, see https://github.com/sidorares/node-mysql2/pull/3081
    // This checks if the functions we're instrumenting are there on the base - we cannot use the presence of a base
    // prototype since EventEmitter is the base for mysql2@<=3.11.4
    if (typeof (basePrototype === null || basePrototype === void 0 ? void 0 : basePrototype.query) === 'function' && typeof (basePrototype === null || basePrototype === void 0 ? void 0 : basePrototype.execute) === 'function') {
        return basePrototype;
    }
    // otherwise instrument the connection directly.
    return connectionPrototype;
}
exports.getConnectionPrototypeToInstrument = getConnectionPrototypeToInstrument;
}),
"[project]/node_modules/@opentelemetry/instrumentation-mysql2/build/src/version.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
// this is autogenerated file, see scripts/version-update.js
exports.PACKAGE_VERSION = '0.45.2';
exports.PACKAGE_NAME = '@opentelemetry/instrumentation-mysql2';
}),
"[project]/node_modules/@opentelemetry/instrumentation-mysql2/build/src/instrumentation.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MySQL2Instrumentation = void 0;
const api = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const instrumentation_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
const semantic_conventions_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/semantic-conventions/build/esm/index.js [app-route] (ecmascript)");
const sql_common_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/sql-common/build/src/index.js [app-route] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-mysql2/build/src/utils.js [app-route] (ecmascript)");
/** @knipignore */ const version_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-mysql2/build/src/version.js [app-route] (ecmascript)");
const supportedVersions = [
    '>=1.4.2 <4'
];
class MySQL2Instrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}){
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
    }
    init() {
        let format;
        function setFormatFunction(moduleExports) {
            if (!format && moduleExports.format) {
                format = moduleExports.format;
            }
        }
        const patch = (ConnectionPrototype)=>{
            if ((0, instrumentation_1.isWrapped)(ConnectionPrototype.query)) {
                this._unwrap(ConnectionPrototype, 'query');
            }
            this._wrap(ConnectionPrototype, 'query', this._patchQuery(format, false));
            if ((0, instrumentation_1.isWrapped)(ConnectionPrototype.execute)) {
                this._unwrap(ConnectionPrototype, 'execute');
            }
            this._wrap(ConnectionPrototype, 'execute', this._patchQuery(format, true));
        };
        const unpatch = (ConnectionPrototype)=>{
            this._unwrap(ConnectionPrototype, 'query');
            this._unwrap(ConnectionPrototype, 'execute');
        };
        return [
            new instrumentation_1.InstrumentationNodeModuleDefinition('mysql2', supportedVersions, (moduleExports)=>{
                setFormatFunction(moduleExports);
                return moduleExports;
            }, ()=>{}, [
                new instrumentation_1.InstrumentationNodeModuleFile('mysql2/promise.js', supportedVersions, (moduleExports)=>{
                    setFormatFunction(moduleExports);
                    return moduleExports;
                }, ()=>{}),
                new instrumentation_1.InstrumentationNodeModuleFile('mysql2/lib/connection.js', supportedVersions, (moduleExports)=>{
                    const ConnectionPrototype = (0, utils_1.getConnectionPrototypeToInstrument)(moduleExports);
                    patch(ConnectionPrototype);
                    return moduleExports;
                }, (moduleExports)=>{
                    if (moduleExports === undefined) return;
                    const ConnectionPrototype = (0, utils_1.getConnectionPrototypeToInstrument)(moduleExports);
                    unpatch(ConnectionPrototype);
                })
            ])
        ];
    }
    _patchQuery(format, isPrepared) {
        return (originalQuery)=>{
            const thisPlugin = this;
            return function query(query, _valuesOrCallback, _callback) {
                let values;
                if (Array.isArray(_valuesOrCallback)) {
                    values = _valuesOrCallback;
                } else if (arguments[2]) {
                    values = [
                        _valuesOrCallback
                    ];
                }
                const span = thisPlugin.tracer.startSpan((0, utils_1.getSpanName)(query), {
                    kind: api.SpanKind.CLIENT,
                    attributes: Object.assign(Object.assign(Object.assign({}, MySQL2Instrumentation.COMMON_ATTRIBUTES), (0, utils_1.getConnectionAttributes)(this.config)), {
                        [semantic_conventions_1.SEMATTRS_DB_STATEMENT]: (0, utils_1.getDbStatement)(query, format, values)
                    })
                });
                if (!isPrepared && thisPlugin.getConfig().addSqlCommenterCommentToQueries) {
                    arguments[0] = query = typeof query === 'string' ? (0, sql_common_1.addSqlCommenterComment)(span, query) : Object.assign(query, {
                        sql: (0, sql_common_1.addSqlCommenterComment)(span, query.sql)
                    });
                }
                const endSpan = (0, utils_1.once)((err, results)=>{
                    if (err) {
                        span.setStatus({
                            code: api.SpanStatusCode.ERROR,
                            message: err.message
                        });
                    } else {
                        const { responseHook } = thisPlugin.getConfig();
                        if (typeof responseHook === 'function') {
                            (0, instrumentation_1.safeExecuteInTheMiddle)(()=>{
                                responseHook(span, {
                                    queryResults: results
                                });
                            }, (err)=>{
                                if (err) {
                                    thisPlugin._diag.warn('Failed executing responseHook', err);
                                }
                            }, true);
                        }
                    }
                    span.end();
                });
                if (arguments.length === 1) {
                    if (typeof query.onResult === 'function') {
                        thisPlugin._wrap(query, 'onResult', thisPlugin._patchCallbackQuery(endSpan));
                    }
                    const streamableQuery = originalQuery.apply(this, arguments);
                    // `end` in mysql behaves similarly to `result` in mysql2.
                    streamableQuery.once('error', (err)=>{
                        endSpan(err);
                    }).once('result', (results)=>{
                        endSpan(undefined, results);
                    });
                    return streamableQuery;
                }
                if (typeof arguments[1] === 'function') {
                    thisPlugin._wrap(arguments, 1, thisPlugin._patchCallbackQuery(endSpan));
                } else if (typeof arguments[2] === 'function') {
                    thisPlugin._wrap(arguments, 2, thisPlugin._patchCallbackQuery(endSpan));
                }
                return originalQuery.apply(this, arguments);
            };
        };
    }
    _patchCallbackQuery(endSpan) {
        return (originalCallback)=>{
            return function(err, results, fields) {
                endSpan(err, results);
                return originalCallback(...arguments);
            };
        };
    }
}
exports.MySQL2Instrumentation = MySQL2Instrumentation;
MySQL2Instrumentation.COMMON_ATTRIBUTES = {
    [semantic_conventions_1.SEMATTRS_DB_SYSTEM]: semantic_conventions_1.DBSYSTEMVALUES_MYSQL
};
}),
"[project]/node_modules/@opentelemetry/instrumentation-mysql2/build/src/types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
}),
"[project]/node_modules/@opentelemetry/instrumentation-mysql2/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-mysql2/build/src/instrumentation.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-mysql2/build/src/types.js [app-route] (ecmascript)"), exports);
}),
"[project]/node_modules/@opentelemetry/instrumentation-ioredis/build/src/utils.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.endSpan = void 0;
const api_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const endSpan = (span, err)=>{
    if (err) {
        span.recordException(err);
        span.setStatus({
            code: api_1.SpanStatusCode.ERROR,
            message: err.message
        });
    }
    span.end();
};
exports.endSpan = endSpan;
}),
"[project]/node_modules/@opentelemetry/instrumentation-ioredis/build/src/version.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
// this is autogenerated file, see scripts/version-update.js
exports.PACKAGE_VERSION = '0.47.1';
exports.PACKAGE_NAME = '@opentelemetry/instrumentation-ioredis';
}),
"[project]/node_modules/@opentelemetry/instrumentation-ioredis/build/src/instrumentation.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.IORedisInstrumentation = void 0;
const api_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const instrumentation_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
const semantic_conventions_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/semantic-conventions/build/esm/index.js [app-route] (ecmascript)");
const instrumentation_2 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-ioredis/build/src/utils.js [app-route] (ecmascript)");
const redis_common_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/redis-common/build/src/index.js [app-route] (ecmascript)");
/** @knipignore */ const version_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-ioredis/build/src/version.js [app-route] (ecmascript)");
const DEFAULT_CONFIG = {
    requireParentSpan: true
};
class IORedisInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}){
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, Object.assign(Object.assign({}, DEFAULT_CONFIG), config));
    }
    setConfig(config = {}) {
        super.setConfig(Object.assign(Object.assign({}, DEFAULT_CONFIG), config));
    }
    init() {
        return [
            new instrumentation_1.InstrumentationNodeModuleDefinition('ioredis', [
                '>=2.0.0 <6'
            ], (module, moduleVersion)=>{
                const moduleExports = module[Symbol.toStringTag] === 'Module' ? module.default // ESM
                 : module; // CommonJS
                if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.sendCommand)) {
                    this._unwrap(moduleExports.prototype, 'sendCommand');
                }
                this._wrap(moduleExports.prototype, 'sendCommand', this._patchSendCommand(moduleVersion));
                if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.connect)) {
                    this._unwrap(moduleExports.prototype, 'connect');
                }
                this._wrap(moduleExports.prototype, 'connect', this._patchConnection());
                return module;
            }, (module)=>{
                if (module === undefined) return;
                const moduleExports = module[Symbol.toStringTag] === 'Module' ? module.default // ESM
                 : module; // CommonJS
                this._unwrap(moduleExports.prototype, 'sendCommand');
                this._unwrap(moduleExports.prototype, 'connect');
            })
        ];
    }
    /**
     * Patch send command internal to trace requests
     */ _patchSendCommand(moduleVersion) {
        return (original)=>{
            return this._traceSendCommand(original, moduleVersion);
        };
    }
    _patchConnection() {
        return (original)=>{
            return this._traceConnection(original);
        };
    }
    _traceSendCommand(original, moduleVersion) {
        const instrumentation = this;
        return function(cmd) {
            if (arguments.length < 1 || typeof cmd !== 'object') {
                return original.apply(this, arguments);
            }
            const config = instrumentation.getConfig();
            const dbStatementSerializer = config.dbStatementSerializer || redis_common_1.defaultDbStatementSerializer;
            const hasNoParentSpan = api_1.trace.getSpan(api_1.context.active()) === undefined;
            if (config.requireParentSpan === true && hasNoParentSpan) {
                return original.apply(this, arguments);
            }
            const span = instrumentation.tracer.startSpan(cmd.name, {
                kind: api_1.SpanKind.CLIENT,
                attributes: {
                    [semantic_conventions_1.SEMATTRS_DB_SYSTEM]: semantic_conventions_1.DBSYSTEMVALUES_REDIS,
                    [semantic_conventions_1.SEMATTRS_DB_STATEMENT]: dbStatementSerializer(cmd.name, cmd.args)
                }
            });
            const { requestHook } = config;
            if (requestHook) {
                (0, instrumentation_2.safeExecuteInTheMiddle)(()=>requestHook(span, {
                        moduleVersion,
                        cmdName: cmd.name,
                        cmdArgs: cmd.args
                    }), (e)=>{
                    if (e) {
                        api_1.diag.error('ioredis instrumentation: request hook failed', e);
                    }
                }, true);
            }
            const { host, port } = this.options;
            span.setAttributes({
                [semantic_conventions_1.SEMATTRS_NET_PEER_NAME]: host,
                [semantic_conventions_1.SEMATTRS_NET_PEER_PORT]: port,
                [semantic_conventions_1.SEMATTRS_DB_CONNECTION_STRING]: `redis://${host}:${port}`
            });
            try {
                const result = original.apply(this, arguments);
                const origResolve = cmd.resolve;
                /* eslint-disable @typescript-eslint/no-explicit-any */ cmd.resolve = function(result) {
                    (0, instrumentation_2.safeExecuteInTheMiddle)(()=>{
                        var _a;
                        return (_a = config.responseHook) === null || _a === void 0 ? void 0 : _a.call(config, span, cmd.name, cmd.args, result);
                    }, (e)=>{
                        if (e) {
                            api_1.diag.error('ioredis instrumentation: response hook failed', e);
                        }
                    }, true);
                    (0, utils_1.endSpan)(span, null);
                    origResolve(result);
                };
                const origReject = cmd.reject;
                cmd.reject = function(err) {
                    (0, utils_1.endSpan)(span, err);
                    origReject(err);
                };
                return result;
            } catch (error) {
                (0, utils_1.endSpan)(span, error);
                throw error;
            }
        };
    }
    _traceConnection(original) {
        const instrumentation = this;
        return function() {
            const hasNoParentSpan = api_1.trace.getSpan(api_1.context.active()) === undefined;
            if (instrumentation.getConfig().requireParentSpan === true && hasNoParentSpan) {
                return original.apply(this, arguments);
            }
            const span = instrumentation.tracer.startSpan('connect', {
                kind: api_1.SpanKind.CLIENT,
                attributes: {
                    [semantic_conventions_1.SEMATTRS_DB_SYSTEM]: semantic_conventions_1.DBSYSTEMVALUES_REDIS,
                    [semantic_conventions_1.SEMATTRS_DB_STATEMENT]: 'connect'
                }
            });
            const { host, port } = this.options;
            span.setAttributes({
                [semantic_conventions_1.SEMATTRS_NET_PEER_NAME]: host,
                [semantic_conventions_1.SEMATTRS_NET_PEER_PORT]: port,
                [semantic_conventions_1.SEMATTRS_DB_CONNECTION_STRING]: `redis://${host}:${port}`
            });
            try {
                const client = original.apply(this, arguments);
                (0, utils_1.endSpan)(span, null);
                return client;
            } catch (error) {
                (0, utils_1.endSpan)(span, error);
                throw error;
            }
        };
    }
}
exports.IORedisInstrumentation = IORedisInstrumentation;
}),
"[project]/node_modules/@opentelemetry/instrumentation-ioredis/build/src/types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
}),
"[project]/node_modules/@opentelemetry/instrumentation-ioredis/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-ioredis/build/src/instrumentation.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-ioredis/build/src/types.js [app-route] (ecmascript)"), exports);
}),
"[project]/node_modules/@opentelemetry/redis-common/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.defaultDbStatementSerializer = void 0;
/**
 * List of regexes and the number of arguments that should be serialized for matching commands.
 * For example, HSET should serialize which key and field it's operating on, but not its value.
 * Setting the subset to -1 will serialize all arguments.
 * Commands without a match will have their first argument serialized.
 *
 * Refer to https://redis.io/commands/ for the full list.
 */ const serializationSubsets = [
    {
        regex: /^ECHO/i,
        args: 0
    },
    {
        regex: /^(LPUSH|MSET|PFA|PUBLISH|RPUSH|SADD|SET|SPUBLISH|XADD|ZADD)/i,
        args: 1
    },
    {
        regex: /^(HSET|HMSET|LSET|LINSERT)/i,
        args: 2
    },
    {
        regex: /^(ACL|BIT|B[LRZ]|CLIENT|CLUSTER|CONFIG|COMMAND|DECR|DEL|EVAL|EX|FUNCTION|GEO|GET|HINCR|HMGET|HSCAN|INCR|L[TRLM]|MEMORY|P[EFISTU]|RPOP|S[CDIMORSU]|XACK|X[CDGILPRT]|Z[CDILMPRS])/i,
        args: -1
    }
];
/**
 * Given the redis command name and arguments, return a combination of the
 * command name + the allowed arguments according to `serializationSubsets`.
 * @param cmdName The redis command name
 * @param cmdArgs The redis command arguments
 * @returns a combination of the command name + args according to `serializationSubsets`.
 */ const defaultDbStatementSerializer = (cmdName, cmdArgs)=>{
    var _a, _b;
    if (Array.isArray(cmdArgs) && cmdArgs.length) {
        const nArgsToSerialize = (_b = (_a = serializationSubsets.find(({ regex })=>{
            return regex.test(cmdName);
        })) === null || _a === void 0 ? void 0 : _a.args) !== null && _b !== void 0 ? _b : 0;
        const argsToSerialize = nArgsToSerialize >= 0 ? cmdArgs.slice(0, nArgsToSerialize) : cmdArgs;
        if (cmdArgs.length > argsToSerialize.length) {
            argsToSerialize.push(`[${cmdArgs.length - nArgsToSerialize} other arguments]`);
        }
        return `${cmdName} ${argsToSerialize.join(' ')}`;
    }
    return cmdName;
};
exports.defaultDbStatementSerializer = defaultDbStatementSerializer;
}),
"[project]/node_modules/@opentelemetry/instrumentation-redis-4/build/src/utils.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getClientAttributes = void 0;
const semantic_conventions_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/semantic-conventions/build/esm/index.js [app-route] (ecmascript)");
function getClientAttributes(diag, options) {
    var _a, _b;
    return {
        [semantic_conventions_1.SEMATTRS_DB_SYSTEM]: semantic_conventions_1.DBSYSTEMVALUES_REDIS,
        [semantic_conventions_1.SEMATTRS_NET_PEER_NAME]: (_a = options === null || options === void 0 ? void 0 : options.socket) === null || _a === void 0 ? void 0 : _a.host,
        [semantic_conventions_1.SEMATTRS_NET_PEER_PORT]: (_b = options === null || options === void 0 ? void 0 : options.socket) === null || _b === void 0 ? void 0 : _b.port,
        [semantic_conventions_1.SEMATTRS_DB_CONNECTION_STRING]: removeCredentialsFromDBConnectionStringAttribute(diag, options === null || options === void 0 ? void 0 : options.url)
    };
}
exports.getClientAttributes = getClientAttributes;
/**
 * removeCredentialsFromDBConnectionStringAttribute removes basic auth from url and user_pwd from query string
 *
 * Examples:
 *   redis://user:pass@localhost:6379/mydb => redis://localhost:6379/mydb
 *   redis://localhost:6379?db=mydb&user_pwd=pass => redis://localhost:6379?db=mydb
 */ function removeCredentialsFromDBConnectionStringAttribute(diag, url) {
    if (typeof url !== 'string' || !url) {
        return;
    }
    try {
        const u = new URL(url);
        u.searchParams.delete('user_pwd');
        u.username = '';
        u.password = '';
        return u.href;
    } catch (err) {
        diag.error('failed to sanitize redis connection url', err);
    }
    return;
}
}),
"[project]/node_modules/@opentelemetry/instrumentation-redis-4/build/src/version.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
// this is autogenerated file, see scripts/version-update.js
exports.PACKAGE_VERSION = '0.46.1';
exports.PACKAGE_NAME = '@opentelemetry/instrumentation-redis-4';
}),
"[project]/node_modules/@opentelemetry/instrumentation-redis-4/build/src/instrumentation.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RedisInstrumentation = void 0;
const api_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const instrumentation_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-redis-4/build/src/utils.js [app-route] (ecmascript)");
const redis_common_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/redis-common/build/src/index.js [app-route] (ecmascript)");
/** @knipignore */ const version_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-redis-4/build/src/version.js [app-route] (ecmascript)");
const semantic_conventions_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/semantic-conventions/build/esm/index.js [app-route] (ecmascript)");
const OTEL_OPEN_SPANS = Symbol('opentelemetry.instrumentation.redis.open_spans');
const MULTI_COMMAND_OPTIONS = Symbol('opentelemetry.instrumentation.redis.multi_command_options');
const DEFAULT_CONFIG = {
    requireParentSpan: false
};
class RedisInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}){
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, Object.assign(Object.assign({}, DEFAULT_CONFIG), config));
    }
    setConfig(config = {}) {
        super.setConfig(Object.assign(Object.assign({}, DEFAULT_CONFIG), config));
    }
    init() {
        // @node-redis/client is a new package introduced and consumed by 'redis 4.0.x'
        // on redis@4.1.0 it was changed to @redis/client.
        // we will instrument both packages
        return [
            this._getInstrumentationNodeModuleDefinition('@redis/client'),
            this._getInstrumentationNodeModuleDefinition('@node-redis/client')
        ];
    }
    _getInstrumentationNodeModuleDefinition(basePackageName) {
        const commanderModuleFile = new instrumentation_1.InstrumentationNodeModuleFile(`${basePackageName}/dist/lib/commander.js`, [
            '^1.0.0'
        ], (moduleExports, moduleVersion)=>{
            const transformCommandArguments = moduleExports.transformCommandArguments;
            if (!transformCommandArguments) {
                this._diag.error('internal instrumentation error, missing transformCommandArguments function');
                return moduleExports;
            }
            // function name and signature changed in redis 4.1.0 from 'extendWithCommands' to 'attachCommands'
            // the matching internal package names starts with 1.0.x (for redis 4.0.x)
            const functionToPatch = (moduleVersion === null || moduleVersion === void 0 ? void 0 : moduleVersion.startsWith('1.0.')) ? 'extendWithCommands' : 'attachCommands';
            // this is the function that extend a redis client with a list of commands.
            // the function patches the commandExecutor to record a span
            if ((0, instrumentation_1.isWrapped)(moduleExports === null || moduleExports === void 0 ? void 0 : moduleExports[functionToPatch])) {
                this._unwrap(moduleExports, functionToPatch);
            }
            this._wrap(moduleExports, functionToPatch, this._getPatchExtendWithCommands(transformCommandArguments));
            return moduleExports;
        }, (moduleExports)=>{
            if ((0, instrumentation_1.isWrapped)(moduleExports === null || moduleExports === void 0 ? void 0 : moduleExports.extendWithCommands)) {
                this._unwrap(moduleExports, 'extendWithCommands');
            }
            if ((0, instrumentation_1.isWrapped)(moduleExports === null || moduleExports === void 0 ? void 0 : moduleExports.attachCommands)) {
                this._unwrap(moduleExports, 'attachCommands');
            }
        });
        const multiCommanderModule = new instrumentation_1.InstrumentationNodeModuleFile(`${basePackageName}/dist/lib/client/multi-command.js`, [
            '^1.0.0'
        ], (moduleExports)=>{
            var _a;
            const redisClientMultiCommandPrototype = (_a = moduleExports === null || moduleExports === void 0 ? void 0 : moduleExports.default) === null || _a === void 0 ? void 0 : _a.prototype;
            if ((0, instrumentation_1.isWrapped)(redisClientMultiCommandPrototype === null || redisClientMultiCommandPrototype === void 0 ? void 0 : redisClientMultiCommandPrototype.exec)) {
                this._unwrap(redisClientMultiCommandPrototype, 'exec');
            }
            this._wrap(redisClientMultiCommandPrototype, 'exec', this._getPatchMultiCommandsExec());
            if ((0, instrumentation_1.isWrapped)(redisClientMultiCommandPrototype === null || redisClientMultiCommandPrototype === void 0 ? void 0 : redisClientMultiCommandPrototype.addCommand)) {
                this._unwrap(redisClientMultiCommandPrototype, 'addCommand');
            }
            this._wrap(redisClientMultiCommandPrototype, 'addCommand', this._getPatchMultiCommandsAddCommand());
            return moduleExports;
        }, (moduleExports)=>{
            var _a;
            const redisClientMultiCommandPrototype = (_a = moduleExports === null || moduleExports === void 0 ? void 0 : moduleExports.default) === null || _a === void 0 ? void 0 : _a.prototype;
            if ((0, instrumentation_1.isWrapped)(redisClientMultiCommandPrototype === null || redisClientMultiCommandPrototype === void 0 ? void 0 : redisClientMultiCommandPrototype.exec)) {
                this._unwrap(redisClientMultiCommandPrototype, 'exec');
            }
            if ((0, instrumentation_1.isWrapped)(redisClientMultiCommandPrototype === null || redisClientMultiCommandPrototype === void 0 ? void 0 : redisClientMultiCommandPrototype.addCommand)) {
                this._unwrap(redisClientMultiCommandPrototype, 'addCommand');
            }
        });
        const clientIndexModule = new instrumentation_1.InstrumentationNodeModuleFile(`${basePackageName}/dist/lib/client/index.js`, [
            '^1.0.0'
        ], (moduleExports)=>{
            var _a;
            const redisClientPrototype = (_a = moduleExports === null || moduleExports === void 0 ? void 0 : moduleExports.default) === null || _a === void 0 ? void 0 : _a.prototype;
            // In some @redis/client versions 'multi' is a method. In later
            // versions, as of https://github.com/redis/node-redis/pull/2324,
            // 'MULTI' is a method and 'multi' is a property defined in the
            // constructor that points to 'MULTI', and therefore it will not
            // be defined on the prototype.
            if (redisClientPrototype === null || redisClientPrototype === void 0 ? void 0 : redisClientPrototype.multi) {
                if ((0, instrumentation_1.isWrapped)(redisClientPrototype === null || redisClientPrototype === void 0 ? void 0 : redisClientPrototype.multi)) {
                    this._unwrap(redisClientPrototype, 'multi');
                }
                this._wrap(redisClientPrototype, 'multi', this._getPatchRedisClientMulti());
            }
            if (redisClientPrototype === null || redisClientPrototype === void 0 ? void 0 : redisClientPrototype.MULTI) {
                if ((0, instrumentation_1.isWrapped)(redisClientPrototype === null || redisClientPrototype === void 0 ? void 0 : redisClientPrototype.MULTI)) {
                    this._unwrap(redisClientPrototype, 'MULTI');
                }
                this._wrap(redisClientPrototype, 'MULTI', this._getPatchRedisClientMulti());
            }
            if ((0, instrumentation_1.isWrapped)(redisClientPrototype === null || redisClientPrototype === void 0 ? void 0 : redisClientPrototype.sendCommand)) {
                this._unwrap(redisClientPrototype, 'sendCommand');
            }
            this._wrap(redisClientPrototype, 'sendCommand', this._getPatchRedisClientSendCommand());
            this._wrap(redisClientPrototype, 'connect', this._getPatchedClientConnect());
            return moduleExports;
        }, (moduleExports)=>{
            var _a;
            const redisClientPrototype = (_a = moduleExports === null || moduleExports === void 0 ? void 0 : moduleExports.default) === null || _a === void 0 ? void 0 : _a.prototype;
            if ((0, instrumentation_1.isWrapped)(redisClientPrototype === null || redisClientPrototype === void 0 ? void 0 : redisClientPrototype.multi)) {
                this._unwrap(redisClientPrototype, 'multi');
            }
            if ((0, instrumentation_1.isWrapped)(redisClientPrototype === null || redisClientPrototype === void 0 ? void 0 : redisClientPrototype.MULTI)) {
                this._unwrap(redisClientPrototype, 'MULTI');
            }
            if ((0, instrumentation_1.isWrapped)(redisClientPrototype === null || redisClientPrototype === void 0 ? void 0 : redisClientPrototype.sendCommand)) {
                this._unwrap(redisClientPrototype, 'sendCommand');
            }
        });
        return new instrumentation_1.InstrumentationNodeModuleDefinition(basePackageName, [
            '^1.0.0'
        ], (moduleExports)=>{
            return moduleExports;
        }, ()=>{}, [
            commanderModuleFile,
            multiCommanderModule,
            clientIndexModule
        ]);
    }
    // serves both for redis 4.0.x where function name is extendWithCommands
    // and redis ^4.1.0 where function name is attachCommands
    _getPatchExtendWithCommands(transformCommandArguments) {
        const plugin = this;
        return function extendWithCommandsPatchWrapper(original) {
            return function extendWithCommandsPatch(config) {
                var _a;
                if (((_a = config === null || config === void 0 ? void 0 : config.BaseClass) === null || _a === void 0 ? void 0 : _a.name) !== 'RedisClient') {
                    return original.apply(this, arguments);
                }
                const origExecutor = config.executor;
                config.executor = function(command, args) {
                    const redisCommandArguments = transformCommandArguments(command, args).args;
                    return plugin._traceClientCommand(origExecutor, this, arguments, redisCommandArguments);
                };
                return original.apply(this, arguments);
            };
        };
    }
    _getPatchMultiCommandsExec() {
        const plugin = this;
        return function execPatchWrapper(original) {
            return function execPatch() {
                const execRes = original.apply(this, arguments);
                if (typeof (execRes === null || execRes === void 0 ? void 0 : execRes.then) !== 'function') {
                    plugin._diag.error('got non promise result when patching RedisClientMultiCommand.exec');
                    return execRes;
                }
                return execRes.then((redisRes)=>{
                    const openSpans = this[OTEL_OPEN_SPANS];
                    plugin._endSpansWithRedisReplies(openSpans, redisRes);
                    return redisRes;
                }).catch((err)=>{
                    const openSpans = this[OTEL_OPEN_SPANS];
                    if (!openSpans) {
                        plugin._diag.error('cannot find open spans to end for redis multi command');
                    } else {
                        const replies = err.constructor.name === 'MultiErrorReply' ? err.replies : new Array(openSpans.length).fill(err);
                        plugin._endSpansWithRedisReplies(openSpans, replies);
                    }
                    return Promise.reject(err);
                });
            };
        };
    }
    _getPatchMultiCommandsAddCommand() {
        const plugin = this;
        return function addCommandWrapper(original) {
            return function addCommandPatch(args) {
                return plugin._traceClientCommand(original, this, arguments, args);
            };
        };
    }
    _getPatchRedisClientMulti() {
        return function multiPatchWrapper(original) {
            return function multiPatch() {
                const multiRes = original.apply(this, arguments);
                multiRes[MULTI_COMMAND_OPTIONS] = this.options;
                return multiRes;
            };
        };
    }
    _getPatchRedisClientSendCommand() {
        const plugin = this;
        return function sendCommandWrapper(original) {
            return function sendCommandPatch(args) {
                return plugin._traceClientCommand(original, this, arguments, args);
            };
        };
    }
    _getPatchedClientConnect() {
        const plugin = this;
        return function connectWrapper(original) {
            return function patchedConnect() {
                const options = this.options;
                const attributes = (0, utils_1.getClientAttributes)(plugin._diag, options);
                const span = plugin.tracer.startSpan(`${RedisInstrumentation.COMPONENT}-connect`, {
                    kind: api_1.SpanKind.CLIENT,
                    attributes
                });
                const res = api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), ()=>{
                    return original.apply(this);
                });
                return res.then((result)=>{
                    span.end();
                    return result;
                }).catch((error)=>{
                    span.recordException(error);
                    span.setStatus({
                        code: api_1.SpanStatusCode.ERROR,
                        message: error.message
                    });
                    span.end();
                    return Promise.reject(error);
                });
            };
        };
    }
    _traceClientCommand(origFunction, origThis, origArguments, redisCommandArguments) {
        const hasNoParentSpan = api_1.trace.getSpan(api_1.context.active()) === undefined;
        if (hasNoParentSpan && this.getConfig().requireParentSpan) {
            return origFunction.apply(origThis, origArguments);
        }
        const clientOptions = origThis.options || origThis[MULTI_COMMAND_OPTIONS];
        const commandName = redisCommandArguments[0]; // types also allows it to be a Buffer, but in practice it only string
        const commandArgs = redisCommandArguments.slice(1);
        const dbStatementSerializer = this.getConfig().dbStatementSerializer || redis_common_1.defaultDbStatementSerializer;
        const attributes = (0, utils_1.getClientAttributes)(this._diag, clientOptions);
        try {
            const dbStatement = dbStatementSerializer(commandName, commandArgs);
            if (dbStatement != null) {
                attributes[semantic_conventions_1.SEMATTRS_DB_STATEMENT] = dbStatement;
            }
        } catch (e) {
            this._diag.error('dbStatementSerializer throw an exception', e, {
                commandName
            });
        }
        const span = this.tracer.startSpan(`${RedisInstrumentation.COMPONENT}-${commandName}`, {
            kind: api_1.SpanKind.CLIENT,
            attributes
        });
        const res = api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), ()=>{
            return origFunction.apply(origThis, origArguments);
        });
        if (typeof (res === null || res === void 0 ? void 0 : res.then) === 'function') {
            res.then((redisRes)=>{
                this._endSpanWithResponse(span, commandName, commandArgs, redisRes, undefined);
            }, (err)=>{
                this._endSpanWithResponse(span, commandName, commandArgs, null, err);
            });
        } else {
            const redisClientMultiCommand = res;
            redisClientMultiCommand[OTEL_OPEN_SPANS] = redisClientMultiCommand[OTEL_OPEN_SPANS] || [];
            redisClientMultiCommand[OTEL_OPEN_SPANS].push({
                span,
                commandName,
                commandArgs
            });
        }
        return res;
    }
    _endSpansWithRedisReplies(openSpans, replies) {
        if (!openSpans) {
            return this._diag.error('cannot find open spans to end for redis multi command');
        }
        if (replies.length !== openSpans.length) {
            return this._diag.error('number of multi command spans does not match response from redis');
        }
        for(let i = 0; i < openSpans.length; i++){
            const { span, commandName, commandArgs } = openSpans[i];
            const currCommandRes = replies[i];
            const [res, err] = currCommandRes instanceof Error ? [
                null,
                currCommandRes
            ] : [
                currCommandRes,
                undefined
            ];
            this._endSpanWithResponse(span, commandName, commandArgs, res, err);
        }
    }
    _endSpanWithResponse(span, commandName, commandArgs, response, error) {
        const { responseHook } = this.getConfig();
        if (!error && responseHook) {
            try {
                responseHook(span, commandName, commandArgs, response);
            } catch (err) {
                this._diag.error('responseHook throw an exception', err);
            }
        }
        if (error) {
            span.recordException(error);
            span.setStatus({
                code: api_1.SpanStatusCode.ERROR,
                message: error === null || error === void 0 ? void 0 : error.message
            });
        }
        span.end();
    }
}
exports.RedisInstrumentation = RedisInstrumentation;
RedisInstrumentation.COMPONENT = 'redis';
}),
"[project]/node_modules/@opentelemetry/instrumentation-redis-4/build/src/types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
}),
"[project]/node_modules/@opentelemetry/instrumentation-redis-4/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-redis-4/build/src/instrumentation.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-redis-4/build/src/types.js [app-route] (ecmascript)"), exports);
}),
"[project]/node_modules/@opentelemetry/instrumentation-pg/build/src/internal-types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EVENT_LISTENERS_SET = void 0;
exports.EVENT_LISTENERS_SET = Symbol('opentelemetry.instrumentation.pg.eventListenersSet');
}),
"[project]/node_modules/@opentelemetry/instrumentation-pg/build/src/enums/AttributeNames.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AttributeNames = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ // Postgresql specific attributes not covered by semantic conventions
var AttributeNames;
(function(AttributeNames) {
    AttributeNames["PG_VALUES"] = "db.postgresql.values";
    AttributeNames["PG_PLAN"] = "db.postgresql.plan";
    AttributeNames["IDLE_TIMEOUT_MILLIS"] = "db.postgresql.idle.timeout.millis";
    AttributeNames["MAX_CLIENT"] = "db.postgresql.max.client";
})(AttributeNames = exports.AttributeNames || (exports.AttributeNames = {}));
}),
"[project]/node_modules/@opentelemetry/instrumentation-pg/build/src/semconv.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.METRIC_DB_CLIENT_OPERATION_DURATION = exports.METRIC_DB_CLIENT_CONNECTION_PENDING_REQUESTS = exports.METRIC_DB_CLIENT_CONNECTION_COUNT = exports.DB_CLIENT_CONNECTION_STATE_VALUE_IDLE = exports.DB_CLIENT_CONNECTION_STATE_VALUE_USED = exports.ATTR_DB_OPERATION_NAME = exports.ATTR_DB_NAMESPACE = exports.ATTR_DB_CLIENT_CONNECTION_STATE = exports.ATTR_DB_CLIENT_CONNECTION_POOL_NAME = void 0;
/**
 * The name of the connection pool; unique within the instrumented application. In case the connection pool implementation doesn't provide a name, instrumentation **SHOULD** use a combination of parameters that would make the name unique, for example, combining attributes `server.address`, `server.port`, and `db.namespace`, formatted as `server.address:server.port/db.namespace`. Instrumentations that generate connection pool name following different patterns **SHOULD** document it.
 *
 * @example myDataSource
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */ exports.ATTR_DB_CLIENT_CONNECTION_POOL_NAME = 'db.client.connection.pool.name';
/**
 * The state of a connection in the pool
 *
 * @example idle
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */ exports.ATTR_DB_CLIENT_CONNECTION_STATE = 'db.client.connection.state';
/**
 * The name of the database, fully qualified within the server address and port.
 *
 * @example customers
 * @example test.users
 *
 * @note If a database system has multiple namespace components, they **SHOULD** be concatenated (potentially using database system specific conventions) from most general to most specific namespace component, and more specific namespaces **SHOULD NOT** be captured without the more general namespaces, to ensure that "startswith" queries for the more general namespaces will be valid.
 * Semantic conventions for individual database systems **SHOULD** document what `db.namespace` means in the context of that system.
 * It is **RECOMMENDED** to capture the value as provided by the application without attempting to do any case normalization.
 * This attribute has stability level RELEASE CANDIDATE.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */ exports.ATTR_DB_NAMESPACE = 'db.namespace';
/**
 * The name of the operation or command being executed.
 *
 * @example findAndModify
 * @example HMSET
 * @example SELECT
 *
 * @note It is **RECOMMENDED** to capture the value as provided by the application without attempting to do any case normalization.
 * If the operation name is parsed from the query text, it **SHOULD** be the first operation name found in the query.
 * For batch operations, if the individual operations are known to have the same operation name then that operation name **SHOULD** be used prepended by `BATCH `, otherwise `db.operation.name` **SHOULD** be `BATCH` or some other database system specific term if more applicable.
 * This attribute has stability level RELEASE CANDIDATE.
 *
 * @experimental This attribute is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */ exports.ATTR_DB_OPERATION_NAME = 'db.operation.name';
/**
 * Enum value "used" for attribute {@link ATTR_DB_CLIENT_CONNECTION_STATE}.
 */ exports.DB_CLIENT_CONNECTION_STATE_VALUE_USED = 'used';
/**
 * Enum value "idle" for attribute {@link ATTR_DB_CLIENT_CONNECTION_STATE}.
 */ exports.DB_CLIENT_CONNECTION_STATE_VALUE_IDLE = 'idle';
/**
 * The number of connections that are currently in state described by the `state` attribute
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */ exports.METRIC_DB_CLIENT_CONNECTION_COUNT = 'db.client.connection.count';
/**
 * The number of current pending requests for an open connection
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */ exports.METRIC_DB_CLIENT_CONNECTION_PENDING_REQUESTS = 'db.client.connection.pending_requests';
/**
 * Duration of database client operations.
 *
 * @note Batch operations **SHOULD** be recorded as a single operation.
 *
 * @experimental This metric is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */ exports.METRIC_DB_CLIENT_OPERATION_DURATION = 'db.client.operation.duration';
}),
"[project]/node_modules/@opentelemetry/instrumentation-pg/build/src/enums/SpanNames.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SpanNames = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ // Contains span names produced by instrumentation
var SpanNames;
(function(SpanNames) {
    SpanNames["QUERY_PREFIX"] = "pg.query";
    SpanNames["CONNECT"] = "pg.connect";
    SpanNames["POOL_CONNECT"] = "pg-pool.connect";
})(SpanNames = exports.SpanNames || (exports.SpanNames = {}));
}),
"[project]/node_modules/@opentelemetry/instrumentation-pg/build/src/utils.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isObjectWithTextString = exports.getErrorMessage = exports.patchClientConnectCallback = exports.patchCallbackPGPool = exports.updateCounter = exports.getPoolName = exports.patchCallback = exports.handleExecutionResult = exports.handleConfigQuery = exports.shouldSkipInstrumentation = exports.getSemanticAttributesFromPool = exports.getSemanticAttributesFromConnection = exports.getConnectionString = exports.parseNormalizedOperationName = exports.getQuerySpanName = void 0;
const api_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const AttributeNames_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-pg/build/src/enums/AttributeNames.js [app-route] (ecmascript)");
const semantic_conventions_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/semantic-conventions/build/esm/index.js [app-route] (ecmascript)");
const semconv_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-pg/build/src/semconv.js [app-route] (ecmascript)");
const instrumentation_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
const SpanNames_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-pg/build/src/enums/SpanNames.js [app-route] (ecmascript)");
/**
 * Helper function to get a low cardinality span name from whatever info we have
 * about the query.
 *
 * This is tricky, because we don't have most of the information (table name,
 * operation name, etc) the spec recommends using to build a low-cardinality
 * value w/o parsing. So, we use db.name and assume that, if the query's a named
 * prepared statement, those `name` values will be low cardinality. If we don't
 * have a named prepared statement, we try to parse an operation (despite the
 * spec's warnings).
 *
 * @params dbName The name of the db against which this query is being issued,
 *   which could be missing if no db name was given at the time that the
 *   connection was established.
 * @params queryConfig Information we have about the query being issued, typed
 *   to reflect only the validation we've actually done on the args to
 *   `client.query()`. This will be undefined if `client.query()` was called
 *   with invalid arguments.
 */ function getQuerySpanName(dbName, queryConfig) {
    // NB: when the query config is invalid, we omit the dbName too, so that
    // someone (or some tool) reading the span name doesn't misinterpret the
    // dbName as being a prepared statement or sql commit name.
    if (!queryConfig) return SpanNames_1.SpanNames.QUERY_PREFIX;
    // Either the name of a prepared statement; or an attempted parse
    // of the SQL command, normalized to uppercase; or unknown.
    const command = typeof queryConfig.name === 'string' && queryConfig.name ? queryConfig.name : parseNormalizedOperationName(queryConfig.text);
    return `${SpanNames_1.SpanNames.QUERY_PREFIX}:${command}${dbName ? ` ${dbName}` : ''}`;
}
exports.getQuerySpanName = getQuerySpanName;
function parseNormalizedOperationName(queryText) {
    const indexOfFirstSpace = queryText.indexOf(' ');
    let sqlCommand = indexOfFirstSpace === -1 ? queryText : queryText.slice(0, indexOfFirstSpace);
    sqlCommand = sqlCommand.toUpperCase();
    // Handle query text being "COMMIT;", which has an extra semicolon before the space.
    return sqlCommand.endsWith(';') ? sqlCommand.slice(0, -1) : sqlCommand;
}
exports.parseNormalizedOperationName = parseNormalizedOperationName;
function getConnectionString(params) {
    const host = params.host || 'localhost';
    const port = params.port || 5432;
    const database = params.database || '';
    return `postgresql://${host}:${port}/${database}`;
}
exports.getConnectionString = getConnectionString;
function getPort(port) {
    // Port may be NaN as parseInt() is used on the value, passing null will result in NaN being parsed.
    // https://github.com/brianc/node-postgres/blob/2a8efbee09a284be12748ed3962bc9b816965e36/packages/pg/lib/connection-parameters.js#L66
    if (Number.isInteger(port)) {
        return port;
    }
    // Unable to find the default used in pg code, so falling back to 'undefined'.
    return undefined;
}
function getSemanticAttributesFromConnection(params) {
    return {
        [semantic_conventions_1.SEMATTRS_DB_SYSTEM]: semantic_conventions_1.DBSYSTEMVALUES_POSTGRESQL,
        [semantic_conventions_1.SEMATTRS_DB_NAME]: params.database,
        [semantic_conventions_1.SEMATTRS_DB_CONNECTION_STRING]: getConnectionString(params),
        [semantic_conventions_1.SEMATTRS_NET_PEER_NAME]: params.host,
        [semantic_conventions_1.SEMATTRS_NET_PEER_PORT]: getPort(params.port),
        [semantic_conventions_1.SEMATTRS_DB_USER]: params.user
    };
}
exports.getSemanticAttributesFromConnection = getSemanticAttributesFromConnection;
function getSemanticAttributesFromPool(params) {
    return {
        [semantic_conventions_1.SEMATTRS_DB_SYSTEM]: semantic_conventions_1.DBSYSTEMVALUES_POSTGRESQL,
        [semantic_conventions_1.SEMATTRS_DB_NAME]: params.database,
        [semantic_conventions_1.SEMATTRS_DB_CONNECTION_STRING]: getConnectionString(params),
        [semantic_conventions_1.SEMATTRS_NET_PEER_NAME]: params.host,
        [semantic_conventions_1.SEMATTRS_NET_PEER_PORT]: getPort(params.port),
        [semantic_conventions_1.SEMATTRS_DB_USER]: params.user,
        [AttributeNames_1.AttributeNames.IDLE_TIMEOUT_MILLIS]: params.idleTimeoutMillis,
        [AttributeNames_1.AttributeNames.MAX_CLIENT]: params.maxClient
    };
}
exports.getSemanticAttributesFromPool = getSemanticAttributesFromPool;
function shouldSkipInstrumentation(instrumentationConfig) {
    return instrumentationConfig.requireParentSpan === true && api_1.trace.getSpan(api_1.context.active()) === undefined;
}
exports.shouldSkipInstrumentation = shouldSkipInstrumentation;
// Create a span from our normalized queryConfig object,
// or return a basic span if no queryConfig was given/could be created.
function handleConfigQuery(tracer, instrumentationConfig, queryConfig) {
    // Create child span.
    const { connectionParameters } = this;
    const dbName = connectionParameters.database;
    const spanName = getQuerySpanName(dbName, queryConfig);
    const span = tracer.startSpan(spanName, {
        kind: api_1.SpanKind.CLIENT,
        attributes: getSemanticAttributesFromConnection(connectionParameters)
    });
    if (!queryConfig) {
        return span;
    }
    // Set attributes
    if (queryConfig.text) {
        span.setAttribute(semantic_conventions_1.SEMATTRS_DB_STATEMENT, queryConfig.text);
    }
    if (instrumentationConfig.enhancedDatabaseReporting && Array.isArray(queryConfig.values)) {
        try {
            const convertedValues = queryConfig.values.map((value)=>{
                if (value == null) {
                    return 'null';
                } else if (value instanceof Buffer) {
                    return value.toString();
                } else if (typeof value === 'object') {
                    if (typeof value.toPostgres === 'function') {
                        return value.toPostgres();
                    }
                    return JSON.stringify(value);
                } else {
                    //string, number
                    return value.toString();
                }
            });
            span.setAttribute(AttributeNames_1.AttributeNames.PG_VALUES, convertedValues);
        } catch (e) {
            api_1.diag.error('failed to stringify ', queryConfig.values, e);
        }
    }
    // Set plan name attribute, if present
    if (typeof queryConfig.name === 'string') {
        span.setAttribute(AttributeNames_1.AttributeNames.PG_PLAN, queryConfig.name);
    }
    return span;
}
exports.handleConfigQuery = handleConfigQuery;
function handleExecutionResult(config, span, pgResult) {
    if (typeof config.responseHook === 'function') {
        (0, instrumentation_1.safeExecuteInTheMiddle)(()=>{
            config.responseHook(span, {
                data: pgResult
            });
        }, (err)=>{
            if (err) {
                api_1.diag.error('Error running response hook', err);
            }
        }, true);
    }
}
exports.handleExecutionResult = handleExecutionResult;
function patchCallback(instrumentationConfig, span, cb, attributes, recordDuration) {
    return function patchedCallback(err, res) {
        if (err) {
            if (Object.prototype.hasOwnProperty.call(err, 'code')) {
                attributes[semantic_conventions_1.ATTR_ERROR_TYPE] = err['code'];
            }
            span.setStatus({
                code: api_1.SpanStatusCode.ERROR,
                message: err.message
            });
        } else {
            handleExecutionResult(instrumentationConfig, span, res);
        }
        recordDuration();
        span.end();
        cb.call(this, err, res);
    };
}
exports.patchCallback = patchCallback;
function getPoolName(pool) {
    let poolName = '';
    poolName += ((pool === null || pool === void 0 ? void 0 : pool.host) ? `${pool.host}` : 'unknown_host') + ':';
    poolName += ((pool === null || pool === void 0 ? void 0 : pool.port) ? `${pool.port}` : 'unknown_port') + '/';
    poolName += (pool === null || pool === void 0 ? void 0 : pool.database) ? `${pool.database}` : 'unknown_database';
    return poolName.trim();
}
exports.getPoolName = getPoolName;
function updateCounter(poolName, pool, connectionCount, connectionPendingRequests, latestCounter) {
    const all = pool.totalCount;
    const pending = pool.waitingCount;
    const idle = pool.idleCount;
    const used = all - idle;
    connectionCount.add(used - latestCounter.used, {
        [semconv_1.ATTR_DB_CLIENT_CONNECTION_STATE]: semconv_1.DB_CLIENT_CONNECTION_STATE_VALUE_USED,
        [semconv_1.ATTR_DB_CLIENT_CONNECTION_POOL_NAME]: poolName
    });
    connectionCount.add(idle - latestCounter.idle, {
        [semconv_1.ATTR_DB_CLIENT_CONNECTION_STATE]: semconv_1.DB_CLIENT_CONNECTION_STATE_VALUE_IDLE,
        [semconv_1.ATTR_DB_CLIENT_CONNECTION_POOL_NAME]: poolName
    });
    connectionPendingRequests.add(pending - latestCounter.pending, {
        [semconv_1.ATTR_DB_CLIENT_CONNECTION_POOL_NAME]: poolName
    });
    return {
        used: used,
        idle: idle,
        pending: pending
    };
}
exports.updateCounter = updateCounter;
function patchCallbackPGPool(span, cb) {
    return function patchedCallback(err, res, done) {
        if (err) {
            span.setStatus({
                code: api_1.SpanStatusCode.ERROR,
                message: err.message
            });
        }
        span.end();
        cb.call(this, err, res, done);
    };
}
exports.patchCallbackPGPool = patchCallbackPGPool;
function patchClientConnectCallback(span, cb) {
    return function patchedClientConnectCallback(err) {
        if (err) {
            span.setStatus({
                code: api_1.SpanStatusCode.ERROR,
                message: err.message
            });
        }
        span.end();
        cb.apply(this, arguments);
    };
}
exports.patchClientConnectCallback = patchClientConnectCallback;
/**
 * Attempt to get a message string from a thrown value, while being quite
 * defensive, to recognize the fact that, in JS, any kind of value (even
 * primitives) can be thrown.
 */ function getErrorMessage(e) {
    return typeof e === 'object' && e !== null && 'message' in e ? String(e.message) : undefined;
}
exports.getErrorMessage = getErrorMessage;
function isObjectWithTextString(it) {
    var _a;
    return typeof it === 'object' && typeof ((_a = it) === null || _a === void 0 ? void 0 : _a.text) === 'string';
}
exports.isObjectWithTextString = isObjectWithTextString;
}),
"[project]/node_modules/@opentelemetry/instrumentation-pg/build/src/version.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
// this is autogenerated file, see scripts/version-update.js
exports.PACKAGE_VERSION = '0.51.1';
exports.PACKAGE_NAME = '@opentelemetry/instrumentation-pg';
}),
"[project]/node_modules/@opentelemetry/instrumentation-pg/build/src/instrumentation.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PgInstrumentation = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const instrumentation_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
const api_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const internal_types_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-pg/build/src/internal-types.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-pg/build/src/utils.js [app-route] (ecmascript)");
const sql_common_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/sql-common/build/src/index.js [app-route] (ecmascript)");
/** @knipignore */ const version_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-pg/build/src/version.js [app-route] (ecmascript)");
const SpanNames_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-pg/build/src/enums/SpanNames.js [app-route] (ecmascript)");
const core_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/core/build/esm/index.js [app-route] (ecmascript)");
const semantic_conventions_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/semantic-conventions/build/esm/index.js [app-route] (ecmascript)");
const semconv_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-pg/build/src/semconv.js [app-route] (ecmascript)");
function extractModuleExports(module) {
    return module[Symbol.toStringTag] === 'Module' ? module.default // ESM
     : module; // CommonJS
}
class PgInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}){
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
        // Pool events connect, acquire, release and remove can be called
        // multiple times without changing the values of total, idle and waiting
        // connections. The _connectionsCounter is used to keep track of latest
        // values and only update the metrics _connectionsCount and _connectionPendingRequests
        // when the value change.
        this._connectionsCounter = {
            used: 0,
            idle: 0,
            pending: 0
        };
    }
    _updateMetricInstruments() {
        this._operationDuration = this.meter.createHistogram(semconv_1.METRIC_DB_CLIENT_OPERATION_DURATION, {
            description: 'Duration of database client operations.',
            unit: 's',
            valueType: api_1.ValueType.DOUBLE,
            advice: {
                explicitBucketBoundaries: [
                    0.001,
                    0.005,
                    0.01,
                    0.05,
                    0.1,
                    0.5,
                    1,
                    5,
                    10
                ]
            }
        });
        this._connectionsCounter = {
            idle: 0,
            pending: 0,
            used: 0
        };
        this._connectionsCount = this.meter.createUpDownCounter(semconv_1.METRIC_DB_CLIENT_CONNECTION_COUNT, {
            description: 'The number of connections that are currently in state described by the state attribute.',
            unit: '{connection}'
        });
        this._connectionPendingRequests = this.meter.createUpDownCounter(semconv_1.METRIC_DB_CLIENT_CONNECTION_PENDING_REQUESTS, {
            description: 'The number of current pending requests for an open connection.',
            unit: '{connection}'
        });
    }
    init() {
        const SUPPORTED_PG_VERSIONS = [
            '>=8.0.3 <9'
        ];
        const modulePgNativeClient = new instrumentation_1.InstrumentationNodeModuleFile('pg/lib/native/client.js', SUPPORTED_PG_VERSIONS, this._patchPgClient.bind(this), this._unpatchPgClient.bind(this));
        const modulePgClient = new instrumentation_1.InstrumentationNodeModuleFile('pg/lib/client.js', SUPPORTED_PG_VERSIONS, this._patchPgClient.bind(this), this._unpatchPgClient.bind(this));
        const modulePG = new instrumentation_1.InstrumentationNodeModuleDefinition('pg', SUPPORTED_PG_VERSIONS, (module)=>{
            const moduleExports = extractModuleExports(module);
            this._patchPgClient(moduleExports.Client);
            return module;
        }, (module)=>{
            const moduleExports = extractModuleExports(module);
            this._unpatchPgClient(moduleExports.Client);
            return module;
        }, [
            modulePgClient,
            modulePgNativeClient
        ]);
        const modulePGPool = new instrumentation_1.InstrumentationNodeModuleDefinition('pg-pool', [
            '>=2.0.0 <4'
        ], (moduleExports)=>{
            if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.connect)) {
                this._unwrap(moduleExports.prototype, 'connect');
            }
            this._wrap(moduleExports.prototype, 'connect', this._getPoolConnectPatch());
            return moduleExports;
        }, (moduleExports)=>{
            if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.connect)) {
                this._unwrap(moduleExports.prototype, 'connect');
            }
        });
        return [
            modulePG,
            modulePGPool
        ];
    }
    _patchPgClient(module) {
        if (!module) {
            return;
        }
        const moduleExports = extractModuleExports(module);
        if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.query)) {
            this._unwrap(moduleExports.prototype, 'query');
        }
        if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.connect)) {
            this._unwrap(moduleExports.prototype, 'connect');
        }
        this._wrap(moduleExports.prototype, 'query', this._getClientQueryPatch());
        this._wrap(moduleExports.prototype, 'connect', this._getClientConnectPatch());
        return module;
    }
    _unpatchPgClient(module) {
        const moduleExports = extractModuleExports(module);
        if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.query)) {
            this._unwrap(moduleExports.prototype, 'query');
        }
        if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.connect)) {
            this._unwrap(moduleExports.prototype, 'connect');
        }
        return module;
    }
    _getClientConnectPatch() {
        const plugin = this;
        return (original)=>{
            return function connect(callback) {
                if (utils.shouldSkipInstrumentation(plugin.getConfig())) {
                    return original.call(this, callback);
                }
                const span = plugin.tracer.startSpan(SpanNames_1.SpanNames.CONNECT, {
                    kind: api_1.SpanKind.CLIENT,
                    attributes: utils.getSemanticAttributesFromConnection(this)
                });
                if (callback) {
                    const parentSpan = api_1.trace.getSpan(api_1.context.active());
                    callback = utils.patchClientConnectCallback(span, callback);
                    if (parentSpan) {
                        callback = api_1.context.bind(api_1.context.active(), callback);
                    }
                }
                const connectResult = api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), ()=>{
                    return original.call(this, callback);
                });
                return handleConnectResult(span, connectResult);
            };
        };
    }
    recordOperationDuration(attributes, startTime) {
        const metricsAttributes = {};
        const keysToCopy = [
            semantic_conventions_1.SEMATTRS_DB_SYSTEM,
            semconv_1.ATTR_DB_NAMESPACE,
            semantic_conventions_1.ATTR_ERROR_TYPE,
            semantic_conventions_1.ATTR_SERVER_PORT,
            semantic_conventions_1.ATTR_SERVER_ADDRESS,
            semconv_1.ATTR_DB_OPERATION_NAME
        ];
        keysToCopy.forEach((key)=>{
            if (key in attributes) {
                metricsAttributes[key] = attributes[key];
            }
        });
        const durationSeconds = (0, core_1.hrTimeToMilliseconds)((0, core_1.hrTimeDuration)(startTime, (0, core_1.hrTime)())) / 1000;
        this._operationDuration.record(durationSeconds, metricsAttributes);
    }
    _getClientQueryPatch() {
        const plugin = this;
        return (original)=>{
            this._diag.debug('Patching pg.Client.prototype.query');
            return function query(...args) {
                if (utils.shouldSkipInstrumentation(plugin.getConfig())) {
                    return original.apply(this, args);
                }
                const startTime = (0, core_1.hrTime)();
                // client.query(text, cb?), client.query(text, values, cb?), and
                // client.query(configObj, cb?) are all valid signatures. We construct
                // a queryConfig obj from all (valid) signatures to build the span in a
                // unified way. We verify that we at least have query text, and code
                // defensively when dealing with `queryConfig` after that (to handle all
                // the other invalid cases, like a non-array for values being provided).
                // The type casts here reflect only what we've actually validated.
                const arg0 = args[0];
                const firstArgIsString = typeof arg0 === 'string';
                const firstArgIsQueryObjectWithText = utils.isObjectWithTextString(arg0);
                // TODO: remove the `as ...` casts below when the TS version is upgraded.
                // Newer TS versions will use the result of firstArgIsQueryObjectWithText
                // to properly narrow arg0, but TS 4.3.5 does not.
                const queryConfig = firstArgIsString ? {
                    text: arg0,
                    values: Array.isArray(args[1]) ? args[1] : undefined
                } : firstArgIsQueryObjectWithText ? arg0 : undefined;
                const attributes = {
                    [semantic_conventions_1.SEMATTRS_DB_SYSTEM]: semantic_conventions_1.DBSYSTEMVALUES_POSTGRESQL,
                    [semconv_1.ATTR_DB_NAMESPACE]: this.database,
                    [semantic_conventions_1.ATTR_SERVER_PORT]: this.connectionParameters.port,
                    [semantic_conventions_1.ATTR_SERVER_ADDRESS]: this.connectionParameters.host
                };
                if (queryConfig === null || queryConfig === void 0 ? void 0 : queryConfig.text) {
                    attributes[semconv_1.ATTR_DB_OPERATION_NAME] = utils.parseNormalizedOperationName(queryConfig === null || queryConfig === void 0 ? void 0 : queryConfig.text);
                }
                const recordDuration = ()=>{
                    plugin.recordOperationDuration(attributes, startTime);
                };
                const instrumentationConfig = plugin.getConfig();
                const span = utils.handleConfigQuery.call(this, plugin.tracer, instrumentationConfig, queryConfig);
                // Modify query text w/ a tracing comment before invoking original for
                // tracing, but only if args[0] has one of our expected shapes.
                if (instrumentationConfig.addSqlCommenterCommentToQueries) {
                    if (firstArgIsString) {
                        args[0] = (0, sql_common_1.addSqlCommenterComment)(span, arg0);
                    } else if (firstArgIsQueryObjectWithText && !('name' in arg0)) {
                        // In the case of a query object, we need to ensure there's no name field
                        // as this indicates a prepared query, where the comment would remain the same
                        // for every invocation and contain an outdated trace context.
                        args[0] = Object.assign(Object.assign({}, arg0), {
                            text: (0, sql_common_1.addSqlCommenterComment)(span, arg0.text)
                        });
                    }
                }
                // Bind callback (if any) to parent span (if any)
                if (args.length > 0) {
                    const parentSpan = api_1.trace.getSpan(api_1.context.active());
                    if (typeof args[args.length - 1] === 'function') {
                        // Patch ParameterQuery callback
                        args[args.length - 1] = utils.patchCallback(instrumentationConfig, span, args[args.length - 1], attributes, recordDuration);
                        // If a parent span exists, bind the callback
                        if (parentSpan) {
                            args[args.length - 1] = api_1.context.bind(api_1.context.active(), args[args.length - 1]);
                        }
                    } else if (typeof (queryConfig === null || queryConfig === void 0 ? void 0 : queryConfig.callback) === 'function') {
                        // Patch ConfigQuery callback
                        let callback = utils.patchCallback(plugin.getConfig(), span, queryConfig.callback, attributes, recordDuration);
                        // If a parent span existed, bind the callback
                        if (parentSpan) {
                            callback = api_1.context.bind(api_1.context.active(), callback);
                        }
                        args[0].callback = callback;
                    }
                }
                const { requestHook } = instrumentationConfig;
                if (typeof requestHook === 'function' && queryConfig) {
                    (0, instrumentation_1.safeExecuteInTheMiddle)(()=>{
                        // pick keys to expose explicitly, so we're not leaking pg package
                        // internals that are subject to change
                        const { database, host, port, user } = this.connectionParameters;
                        const connection = {
                            database,
                            host,
                            port,
                            user
                        };
                        requestHook(span, {
                            connection,
                            query: {
                                text: queryConfig.text,
                                // nb: if `client.query` is called with illegal arguments
                                // (e.g., if `queryConfig.values` is passed explicitly, but a
                                // non-array is given), then the type casts will be wrong. But
                                // we leave it up to the queryHook to handle that, and we
                                // catch and swallow any errors it throws. The other options
                                // are all worse. E.g., we could leave `queryConfig.values`
                                // and `queryConfig.name` as `unknown`, but then the hook body
                                // would be forced to validate (or cast) them before using
                                // them, which seems incredibly cumbersome given that these
                                // casts will be correct 99.9% of the time -- and pg.query
                                // will immediately throw during development in the other .1%
                                // of cases. Alternatively, we could simply skip calling the
                                // hook when `values` or `name` don't have the expected type,
                                // but that would add unnecessary validation overhead to every
                                // hook invocation and possibly be even more confusing/unexpected.
                                values: queryConfig.values,
                                name: queryConfig.name
                            }
                        });
                    }, (err)=>{
                        if (err) {
                            plugin._diag.error('Error running query hook', err);
                        }
                    }, true);
                }
                let result;
                try {
                    result = original.apply(this, args);
                } catch (e) {
                    span.setStatus({
                        code: api_1.SpanStatusCode.ERROR,
                        message: utils.getErrorMessage(e)
                    });
                    span.end();
                    throw e;
                }
                // Bind promise to parent span and end the span
                if (result instanceof Promise) {
                    return result.then((result)=>{
                        // Return a pass-along promise which ends the span and then goes to user's orig resolvers
                        return new Promise((resolve)=>{
                            utils.handleExecutionResult(plugin.getConfig(), span, result);
                            recordDuration();
                            span.end();
                            resolve(result);
                        });
                    }).catch((error)=>{
                        return new Promise((_, reject)=>{
                            span.setStatus({
                                code: api_1.SpanStatusCode.ERROR,
                                message: error.message
                            });
                            recordDuration();
                            span.end();
                            reject(error);
                        });
                    });
                }
                // else returns void
                return result; // void
            };
        };
    }
    _setPoolConnectEventListeners(pgPool) {
        if (pgPool[internal_types_1.EVENT_LISTENERS_SET]) return;
        const poolName = utils.getPoolName(pgPool.options);
        pgPool.on('connect', ()=>{
            this._connectionsCounter = utils.updateCounter(poolName, pgPool, this._connectionsCount, this._connectionPendingRequests, this._connectionsCounter);
        });
        pgPool.on('acquire', ()=>{
            this._connectionsCounter = utils.updateCounter(poolName, pgPool, this._connectionsCount, this._connectionPendingRequests, this._connectionsCounter);
        });
        pgPool.on('remove', ()=>{
            this._connectionsCounter = utils.updateCounter(poolName, pgPool, this._connectionsCount, this._connectionPendingRequests, this._connectionsCounter);
        });
        pgPool.on('release', ()=>{
            this._connectionsCounter = utils.updateCounter(poolName, pgPool, this._connectionsCount, this._connectionPendingRequests, this._connectionsCounter);
        });
        pgPool[internal_types_1.EVENT_LISTENERS_SET] = true;
    }
    _getPoolConnectPatch() {
        const plugin = this;
        return (originalConnect)=>{
            return function connect(callback) {
                if (utils.shouldSkipInstrumentation(plugin.getConfig())) {
                    return originalConnect.call(this, callback);
                }
                // setup span
                const span = plugin.tracer.startSpan(SpanNames_1.SpanNames.POOL_CONNECT, {
                    kind: api_1.SpanKind.CLIENT,
                    attributes: utils.getSemanticAttributesFromPool(this.options)
                });
                plugin._setPoolConnectEventListeners(this);
                if (callback) {
                    const parentSpan = api_1.trace.getSpan(api_1.context.active());
                    callback = utils.patchCallbackPGPool(span, callback);
                    // If a parent span exists, bind the callback
                    if (parentSpan) {
                        callback = api_1.context.bind(api_1.context.active(), callback);
                    }
                }
                const connectResult = api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), ()=>{
                    return originalConnect.call(this, callback);
                });
                return handleConnectResult(span, connectResult);
            };
        };
    }
}
exports.PgInstrumentation = PgInstrumentation;
function handleConnectResult(span, connectResult) {
    if (!(connectResult instanceof Promise)) {
        return connectResult;
    }
    const connectResultPromise = connectResult;
    return api_1.context.bind(api_1.context.active(), connectResultPromise.then((result)=>{
        span.end();
        return result;
    }).catch((error)=>{
        span.setStatus({
            code: api_1.SpanStatusCode.ERROR,
            message: utils.getErrorMessage(error)
        });
        span.end();
        return Promise.reject(error);
    }));
}
}),
"[project]/node_modules/@opentelemetry/instrumentation-pg/build/src/types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
}),
"[project]/node_modules/@opentelemetry/instrumentation-pg/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-pg/build/src/instrumentation.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-pg/build/src/types.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-pg/build/src/enums/AttributeNames.js [app-route] (ecmascript)"), exports);
}),
"[project]/node_modules/@prisma/instrumentation/dist/index.mjs [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PrismaInstrumentation",
    ()=>PrismaInstrumentation
]);
// src/PrismaInstrumentation.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/trace-api.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$platform$2f$node$2f$instrumentation$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/instrumentation/build/esm/platform/node/instrumentation.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$instrumentationNodeModuleDefinition$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/instrumentation/build/esm/instrumentationNodeModuleDefinition.js [app-route] (ecmascript)");
// src/ActiveTracingHelper.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$context$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/context-api.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2f$span_kind$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/trace/span_kind.js [app-route] (ecmascript)");
// src/index.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$autoLoader$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/instrumentation/build/esm/autoLoader.js [app-route] (ecmascript)");
;
;
;
var showAllTraces = process.env.PRISMA_SHOW_ALL_TRACES === "true";
var nonSampledTraceParent = `00-10-10-00`;
function engineSpanKindToOtelSpanKind(engineSpanKind) {
    switch(engineSpanKind){
        case "client":
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2f$span_kind$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SpanKind"].CLIENT;
        case "internal":
        default:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2f$span_kind$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SpanKind"].INTERNAL;
    }
}
var ActiveTracingHelper = class {
    traceMiddleware;
    tracerProvider;
    ignoreSpanTypes;
    constructor({ traceMiddleware, tracerProvider, ignoreSpanTypes }){
        this.traceMiddleware = traceMiddleware;
        this.tracerProvider = tracerProvider;
        this.ignoreSpanTypes = ignoreSpanTypes;
    }
    isEnabled() {
        return true;
    }
    getTraceParent(context) {
        const span = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trace"].getSpanContext(context ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$context$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["context"].active());
        if (span) {
            return `00-${span.traceId}-${span.spanId}-0${span.traceFlags}`;
        }
        return nonSampledTraceParent;
    }
    dispatchEngineSpans(spans) {
        const tracer = this.tracerProvider.getTracer("prisma");
        const linkIds = /* @__PURE__ */ new Map();
        const roots = spans.filter((span)=>span.parentId === null);
        for (const root of roots){
            dispatchEngineSpan(tracer, root, spans, linkIds, this.ignoreSpanTypes);
        }
    }
    getActiveContext() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$context$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["context"].active();
    }
    runInChildSpan(options, callback) {
        if (typeof options === "string") {
            options = {
                name: options
            };
        }
        if (options.internal && !showAllTraces) {
            return callback();
        }
        if (options.middleware && !this.traceMiddleware) {
            return callback();
        }
        const tracer = this.tracerProvider.getTracer("prisma");
        const context = options.context ?? this.getActiveContext();
        const name = `prisma:client:${options.name}`;
        if (shouldIgnoreSpan(name, this.ignoreSpanTypes)) {
            return callback();
        }
        if (options.active === false) {
            const span = tracer.startSpan(name, options, context);
            return endSpan(span, callback(span, context));
        }
        return tracer.startActiveSpan(name, options, (span)=>endSpan(span, callback(span, context)));
    }
};
function dispatchEngineSpan(tracer, engineSpan, allSpans, linkIds, ignoreSpanTypes) {
    if (shouldIgnoreSpan(engineSpan.name, ignoreSpanTypes)) return;
    const spanOptions = {
        attributes: engineSpan.attributes,
        kind: engineSpanKindToOtelSpanKind(engineSpan.kind),
        startTime: engineSpan.startTime
    };
    tracer.startActiveSpan(engineSpan.name, spanOptions, (span)=>{
        linkIds.set(engineSpan.id, span.spanContext().spanId);
        if (engineSpan.links) {
            span.addLinks(engineSpan.links.flatMap((link)=>{
                const linkedId = linkIds.get(link);
                if (!linkedId) {
                    return [];
                }
                return {
                    context: {
                        spanId: linkedId,
                        traceId: span.spanContext().traceId,
                        traceFlags: span.spanContext().traceFlags
                    }
                };
            }));
        }
        const children = allSpans.filter((s)=>s.parentId === engineSpan.id);
        for (const child of children){
            dispatchEngineSpan(tracer, child, allSpans, linkIds, ignoreSpanTypes);
        }
        span.end(engineSpan.endTime);
    });
}
function endSpan(span, result) {
    if (isPromiseLike(result)) {
        return result.then((value)=>{
            span.end();
            return value;
        }, (reason)=>{
            span.end();
            throw reason;
        });
    }
    span.end();
    return result;
}
function isPromiseLike(value) {
    return value != null && typeof value["then"] === "function";
}
function shouldIgnoreSpan(spanName, ignoreSpanTypes) {
    return ignoreSpanTypes.some((pattern)=>typeof pattern === "string" ? pattern === spanName : pattern.test(spanName));
}
// package.json
var package_default = {
    name: "@prisma/instrumentation",
    version: "6.11.1",
    description: "OpenTelemetry compliant instrumentation for Prisma Client",
    main: "dist/index.js",
    module: "dist/index.mjs",
    types: "dist/index.d.ts",
    exports: {
        ".": {
            require: {
                types: "./dist/index.d.ts",
                default: "./dist/index.js"
            },
            import: {
                types: "./dist/index.d.ts",
                default: "./dist/index.mjs"
            }
        }
    },
    license: "Apache-2.0",
    homepage: "https://www.prisma.io",
    repository: {
        type: "git",
        url: "https://github.com/prisma/prisma.git",
        directory: "packages/instrumentation"
    },
    bugs: "https://github.com/prisma/prisma/issues",
    devDependencies: {
        "@prisma/internals": "workspace:*",
        "@swc/core": "1.11.5",
        "@types/jest": "29.5.14",
        "@types/node": "18.19.76",
        "@opentelemetry/api": "1.9.0",
        jest: "29.7.0",
        "jest-junit": "16.0.0",
        typescript: "5.4.5"
    },
    dependencies: {
        "@opentelemetry/instrumentation": "^0.52.0 || ^0.53.0 || ^0.54.0 || ^0.55.0 || ^0.56.0 || ^0.57.0"
    },
    peerDependencies: {
        "@opentelemetry/api": "^1.8"
    },
    files: [
        "dist"
    ],
    keywords: [
        "prisma",
        "instrumentation",
        "opentelemetry",
        "otel"
    ],
    scripts: {
        dev: "DEV=true tsx helpers/build.ts",
        build: "tsx helpers/build.ts",
        prepublishOnly: "pnpm run build",
        test: "jest"
    },
    sideEffects: false
};
// src/constants.ts
var VERSION = package_default.version;
var majorVersion = VERSION.split(".")[0];
var GLOBAL_INSTRUMENTATION_ACCESSOR_KEY = "PRISMA_INSTRUMENTATION";
var GLOBAL_VERSIONED_INSTRUMENTATION_ACCESSOR_KEY = `V${majorVersion}_PRISMA_INSTRUMENTATION`;
var NAME = package_default.name;
var MODULE_NAME = "@prisma/client";
// src/PrismaInstrumentation.ts
var PrismaInstrumentation = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$platform$2f$node$2f$instrumentation$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["InstrumentationBase"] {
    tracerProvider;
    constructor(config = {}){
        super(NAME, VERSION, config);
    }
    setTracerProvider(tracerProvider) {
        this.tracerProvider = tracerProvider;
    }
    init() {
        const module = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$instrumentation$2f$build$2f$esm$2f$instrumentationNodeModuleDefinition$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["InstrumentationNodeModuleDefinition"](MODULE_NAME, [
            VERSION
        ]);
        return [
            module
        ];
    }
    enable() {
        const config = this._config;
        const globalValue = {
            helper: new ActiveTracingHelper({
                traceMiddleware: config.middleware ?? false,
                tracerProvider: this.tracerProvider ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$trace$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trace"].getTracerProvider(),
                ignoreSpanTypes: config.ignoreSpanTypes ?? []
            })
        };
        /*TURBOPACK member replacement*/ __turbopack_context__.g[GLOBAL_INSTRUMENTATION_ACCESSOR_KEY] = globalValue;
        /*TURBOPACK member replacement*/ __turbopack_context__.g[GLOBAL_VERSIONED_INSTRUMENTATION_ACCESSOR_KEY] = globalValue;
    }
    disable() {
        delete /*TURBOPACK member replacement*/ __turbopack_context__.g[GLOBAL_INSTRUMENTATION_ACCESSOR_KEY];
        delete /*TURBOPACK member replacement*/ __turbopack_context__.g[GLOBAL_VERSIONED_INSTRUMENTATION_ACCESSOR_KEY];
    }
    isEnabled() {
        return Boolean(/*TURBOPACK member replacement*/ __turbopack_context__.g[GLOBAL_VERSIONED_INSTRUMENTATION_ACCESSOR_KEY]);
    }
};
;
;
}),
"[project]/node_modules/@opentelemetry/instrumentation-hapi/build/src/version.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
// this is autogenerated file, see scripts/version-update.js
exports.PACKAGE_VERSION = '0.45.2';
exports.PACKAGE_NAME = '@opentelemetry/instrumentation-hapi';
}),
"[project]/node_modules/@opentelemetry/instrumentation-hapi/build/src/internal-types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HapiLifecycleMethodNames = exports.HapiLayerType = exports.handlerPatched = exports.HapiComponentName = void 0;
exports.HapiComponentName = '@hapi/hapi';
/**
 * This symbol is used to mark a Hapi route handler or server extension handler as
 * already patched, since its possible to use these handlers multiple times
 * i.e. when allowing multiple versions of one plugin, or when registering a plugin
 * multiple times on different servers.
 */ exports.handlerPatched = Symbol('hapi-handler-patched');
exports.HapiLayerType = {
    ROUTER: 'router',
    PLUGIN: 'plugin',
    EXT: 'server.ext'
};
exports.HapiLifecycleMethodNames = new Set([
    'onPreAuth',
    'onCredentials',
    'onPostAuth',
    'onPreHandler',
    'onPostHandler',
    'onPreResponse',
    'onRequest'
]);
}),
"[project]/node_modules/@opentelemetry/instrumentation-hapi/build/src/enums/AttributeNames.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AttributeNames = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var AttributeNames;
(function(AttributeNames) {
    AttributeNames["HAPI_TYPE"] = "hapi.type";
    AttributeNames["PLUGIN_NAME"] = "hapi.plugin.name";
    AttributeNames["EXT_TYPE"] = "server.ext.type";
})(AttributeNames = exports.AttributeNames || (exports.AttributeNames = {}));
}),
"[project]/node_modules/@opentelemetry/instrumentation-hapi/build/src/utils.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getPluginFromInput = exports.getExtMetadata = exports.getRouteMetadata = exports.isPatchableExtMethod = exports.isDirectExtInput = exports.isLifecycleExtEventObj = exports.isLifecycleExtType = exports.getPluginName = void 0;
const semantic_conventions_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/semantic-conventions/build/esm/index.js [app-route] (ecmascript)");
const internal_types_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-hapi/build/src/internal-types.js [app-route] (ecmascript)");
const AttributeNames_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-hapi/build/src/enums/AttributeNames.js [app-route] (ecmascript)");
function getPluginName(plugin) {
    if (plugin.name) {
        return plugin.name;
    } else {
        return plugin.pkg.name;
    }
}
exports.getPluginName = getPluginName;
const isLifecycleExtType = (variableToCheck)=>{
    return typeof variableToCheck === 'string' && internal_types_1.HapiLifecycleMethodNames.has(variableToCheck);
};
exports.isLifecycleExtType = isLifecycleExtType;
const isLifecycleExtEventObj = (variableToCheck)=>{
    var _a;
    const event = (_a = variableToCheck) === null || _a === void 0 ? void 0 : _a.type;
    return event !== undefined && (0, exports.isLifecycleExtType)(event);
};
exports.isLifecycleExtEventObj = isLifecycleExtEventObj;
const isDirectExtInput = (variableToCheck)=>{
    return Array.isArray(variableToCheck) && variableToCheck.length <= 3 && (0, exports.isLifecycleExtType)(variableToCheck[0]) && typeof variableToCheck[1] === 'function';
};
exports.isDirectExtInput = isDirectExtInput;
const isPatchableExtMethod = (variableToCheck)=>{
    return !Array.isArray(variableToCheck);
};
exports.isPatchableExtMethod = isPatchableExtMethod;
const getRouteMetadata = (route, pluginName)=>{
    if (pluginName) {
        return {
            attributes: {
                [semantic_conventions_1.SEMATTRS_HTTP_ROUTE]: route.path,
                [semantic_conventions_1.SEMATTRS_HTTP_METHOD]: route.method,
                [AttributeNames_1.AttributeNames.HAPI_TYPE]: internal_types_1.HapiLayerType.PLUGIN,
                [AttributeNames_1.AttributeNames.PLUGIN_NAME]: pluginName
            },
            name: `${pluginName}: route - ${route.path}`
        };
    }
    return {
        attributes: {
            [semantic_conventions_1.SEMATTRS_HTTP_ROUTE]: route.path,
            [semantic_conventions_1.SEMATTRS_HTTP_METHOD]: route.method,
            [AttributeNames_1.AttributeNames.HAPI_TYPE]: internal_types_1.HapiLayerType.ROUTER
        },
        name: `route - ${route.path}`
    };
};
exports.getRouteMetadata = getRouteMetadata;
const getExtMetadata = (extPoint, pluginName)=>{
    if (pluginName) {
        return {
            attributes: {
                [AttributeNames_1.AttributeNames.EXT_TYPE]: extPoint,
                [AttributeNames_1.AttributeNames.HAPI_TYPE]: internal_types_1.HapiLayerType.EXT,
                [AttributeNames_1.AttributeNames.PLUGIN_NAME]: pluginName
            },
            name: `${pluginName}: ext - ${extPoint}`
        };
    }
    return {
        attributes: {
            [AttributeNames_1.AttributeNames.EXT_TYPE]: extPoint,
            [AttributeNames_1.AttributeNames.HAPI_TYPE]: internal_types_1.HapiLayerType.EXT
        },
        name: `ext - ${extPoint}`
    };
};
exports.getExtMetadata = getExtMetadata;
const getPluginFromInput = (pluginObj)=>{
    if ('plugin' in pluginObj) {
        if ('plugin' in pluginObj.plugin) {
            return pluginObj.plugin.plugin;
        }
        return pluginObj.plugin;
    }
    return pluginObj;
};
exports.getPluginFromInput = getPluginFromInput;
}),
"[project]/node_modules/@opentelemetry/instrumentation-hapi/build/src/instrumentation.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HapiInstrumentation = void 0;
const api = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const core_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/core/build/esm/index.js [app-route] (ecmascript)");
const instrumentation_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
/** @knipignore */ const version_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-hapi/build/src/version.js [app-route] (ecmascript)");
const internal_types_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-hapi/build/src/internal-types.js [app-route] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-hapi/build/src/utils.js [app-route] (ecmascript)");
/** Hapi instrumentation for OpenTelemetry */ class HapiInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}){
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
    }
    init() {
        return new instrumentation_1.InstrumentationNodeModuleDefinition(internal_types_1.HapiComponentName, [
            '>=17.0.0 <22'
        ], (module)=>{
            const moduleExports = module[Symbol.toStringTag] === 'Module' ? module.default : module;
            if (!(0, instrumentation_1.isWrapped)(moduleExports.server)) {
                this._wrap(moduleExports, 'server', this._getServerPatch.bind(this));
            }
            if (!(0, instrumentation_1.isWrapped)(moduleExports.Server)) {
                this._wrap(moduleExports, 'Server', this._getServerPatch.bind(this));
            }
            return moduleExports;
        }, (module)=>{
            const moduleExports = module[Symbol.toStringTag] === 'Module' ? module.default : module;
            this._massUnwrap([
                moduleExports
            ], [
                'server',
                'Server'
            ]);
        });
    }
    /**
     * Patches the Hapi.server and Hapi.Server functions in order to instrument
     * the server.route, server.ext, and server.register functions via calls to the
     * @function _getServerRoutePatch, @function _getServerExtPatch, and
     * @function _getServerRegisterPatch functions
     * @param original - the original Hapi Server creation function
     */ _getServerPatch(original) {
        const instrumentation = this;
        const self = this;
        return function server(opts) {
            const newServer = original.apply(this, [
                opts
            ]);
            self._wrap(newServer, 'route', (originalRouter)=>{
                return instrumentation._getServerRoutePatch.bind(instrumentation)(originalRouter);
            });
            // Casting as any is necessary here due to multiple overloads on the Hapi.ext
            // function, which requires supporting a variety of different parameters
            // as extension inputs
            self._wrap(newServer, 'ext', (originalExtHandler)=>{
                return instrumentation._getServerExtPatch.bind(instrumentation)(// eslint-disable-next-line @typescript-eslint/no-explicit-any
                originalExtHandler);
            });
            // Casting as any is necessary here due to multiple overloads on the Hapi.Server.register
            // function, which requires supporting a variety of different types of Plugin inputs
            self._wrap(newServer, 'register', // eslint-disable-next-line @typescript-eslint/no-explicit-any
            instrumentation._getServerRegisterPatch.bind(instrumentation));
            return newServer;
        };
    }
    /**
     * Patches the plugin register function used by the Hapi Server. This function
     * goes through each plugin that is being registered and adds instrumentation
     * via a call to the @function _wrapRegisterHandler function.
     * @param {RegisterFunction<T>} original - the original register function which
     * registers each plugin on the server
     */ _getServerRegisterPatch(original) {
        const instrumentation = this;
        return function register(pluginInput, options) {
            if (Array.isArray(pluginInput)) {
                for (const pluginObj of pluginInput){
                    const plugin = (0, utils_1.getPluginFromInput)(pluginObj);
                    instrumentation._wrapRegisterHandler(plugin);
                }
            } else {
                const plugin = (0, utils_1.getPluginFromInput)(pluginInput);
                instrumentation._wrapRegisterHandler(plugin);
            }
            return original.apply(this, [
                pluginInput,
                options
            ]);
        };
    }
    /**
     * Patches the Server.ext function which adds extension methods to the specified
     * point along the request lifecycle. This function accepts the full range of
     * accepted input into the standard Hapi `server.ext` function. For each extension,
     * it adds instrumentation to the handler via a call to the @function _wrapExtMethods
     * function.
     * @param original - the original ext function which adds the extension method to the server
     * @param {string} [pluginName] - if present, represents the name of the plugin responsible
     * for adding this server extension. Else, signifies that the extension was added directly
     */ _getServerExtPatch(original, pluginName) {
        const instrumentation = this;
        return function ext(...args) {
            if (Array.isArray(args[0])) {
                const eventsList = args[0];
                for(let i = 0; i < eventsList.length; i++){
                    const eventObj = eventsList[i];
                    if ((0, utils_1.isLifecycleExtType)(eventObj.type)) {
                        const lifecycleEventObj = eventObj;
                        const handler = instrumentation._wrapExtMethods(lifecycleEventObj.method, eventObj.type, pluginName);
                        lifecycleEventObj.method = handler;
                        eventsList[i] = lifecycleEventObj;
                    }
                }
                return original.apply(this, args);
            } else if ((0, utils_1.isDirectExtInput)(args)) {
                const extInput = args;
                const method = extInput[1];
                const handler = instrumentation._wrapExtMethods(method, extInput[0], pluginName);
                return original.apply(this, [
                    extInput[0],
                    handler,
                    extInput[2]
                ]);
            } else if ((0, utils_1.isLifecycleExtEventObj)(args[0])) {
                const lifecycleEventObj = args[0];
                const handler = instrumentation._wrapExtMethods(lifecycleEventObj.method, lifecycleEventObj.type, pluginName);
                lifecycleEventObj.method = handler;
                return original.call(this, lifecycleEventObj);
            }
            return original.apply(this, args);
        };
    }
    /**
     * Patches the Server.route function. This function accepts either one or an array
     * of Hapi.ServerRoute objects and adds instrumentation on each route via a call to
     * the @function _wrapRouteHandler function.
     * @param {HapiServerRouteInputMethod} original - the original route function which adds
     * the route to the server
     * @param {string} [pluginName] - if present, represents the name of the plugin responsible
     * for adding this server route. Else, signifies that the route was added directly
     */ _getServerRoutePatch(original, pluginName) {
        const instrumentation = this;
        return function route(route) {
            if (Array.isArray(route)) {
                for(let i = 0; i < route.length; i++){
                    const newRoute = instrumentation._wrapRouteHandler.call(instrumentation, route[i], pluginName);
                    route[i] = newRoute;
                }
            } else {
                route = instrumentation._wrapRouteHandler.call(instrumentation, route, pluginName);
            }
            return original.apply(this, [
                route
            ]);
        };
    }
    /**
     * Wraps newly registered plugins to add instrumentation to the plugin's clone of
     * the original server. Specifically, wraps the server.route and server.ext functions
     * via calls to @function _getServerRoutePatch and @function _getServerExtPatch
     * @param {Hapi.Plugin<T>} plugin - the new plugin which is being instrumented
     */ _wrapRegisterHandler(plugin) {
        const instrumentation = this;
        const pluginName = (0, utils_1.getPluginName)(plugin);
        const oldRegister = plugin.register;
        const self = this;
        const newRegisterHandler = function(server, options) {
            self._wrap(server, 'route', (original)=>{
                return instrumentation._getServerRoutePatch.bind(instrumentation)(original, pluginName);
            });
            // Casting as any is necessary here due to multiple overloads on the Hapi.ext
            // function, which requires supporting a variety of different parameters
            // as extension inputs
            self._wrap(server, 'ext', (originalExtHandler)=>{
                return instrumentation._getServerExtPatch.bind(instrumentation)(// eslint-disable-next-line @typescript-eslint/no-explicit-any
                originalExtHandler, pluginName);
            });
            return oldRegister.call(this, server, options);
        };
        plugin.register = newRegisterHandler;
    }
    /**
     * Wraps request extension methods to add instrumentation to each new extension handler.
     * Patches each individual extension in order to create the
     * span and propagate context. It does not create spans when there is no parent span.
     * @param {PatchableExtMethod | PatchableExtMethod[]} method - the request extension
     * handler which is being instrumented
     * @param {Hapi.ServerRequestExtType} extPoint - the point in the Hapi request lifecycle
     * which this extension targets
     * @param {string} [pluginName] - if present, represents the name of the plugin responsible
     * for adding this server route. Else, signifies that the route was added directly
     */ _wrapExtMethods(method, extPoint, pluginName) {
        const instrumentation = this;
        if (method instanceof Array) {
            for(let i = 0; i < method.length; i++){
                method[i] = instrumentation._wrapExtMethods(method[i], extPoint);
            }
            return method;
        } else if ((0, utils_1.isPatchableExtMethod)(method)) {
            if (method[internal_types_1.handlerPatched] === true) return method;
            method[internal_types_1.handlerPatched] = true;
            const newHandler = async function(...params) {
                if (api.trace.getSpan(api.context.active()) === undefined) {
                    return await method.apply(this, params);
                }
                const metadata = (0, utils_1.getExtMetadata)(extPoint, pluginName);
                const span = instrumentation.tracer.startSpan(metadata.name, {
                    attributes: metadata.attributes
                });
                try {
                    return await api.context.with(api.trace.setSpan(api.context.active(), span), method, undefined, ...params);
                } catch (err) {
                    span.recordException(err);
                    span.setStatus({
                        code: api.SpanStatusCode.ERROR,
                        message: err.message
                    });
                    throw err;
                } finally{
                    span.end();
                }
            };
            return newHandler;
        }
        return method;
    }
    /**
     * Patches each individual route handler method in order to create the
     * span and propagate context. It does not create spans when there is no parent span.
     * @param {PatchableServerRoute} route - the route handler which is being instrumented
     * @param {string} [pluginName] - if present, represents the name of the plugin responsible
     * for adding this server route. Else, signifies that the route was added directly
     */ _wrapRouteHandler(route, pluginName) {
        var _a;
        const instrumentation = this;
        if (route[internal_types_1.handlerPatched] === true) return route;
        route[internal_types_1.handlerPatched] = true;
        const wrapHandler = (oldHandler)=>{
            return async function(...params) {
                if (api.trace.getSpan(api.context.active()) === undefined) {
                    return await oldHandler.call(this, ...params);
                }
                const rpcMetadata = (0, core_1.getRPCMetadata)(api.context.active());
                if ((rpcMetadata === null || rpcMetadata === void 0 ? void 0 : rpcMetadata.type) === core_1.RPCType.HTTP) {
                    rpcMetadata.route = route.path;
                }
                const metadata = (0, utils_1.getRouteMetadata)(route, pluginName);
                const span = instrumentation.tracer.startSpan(metadata.name, {
                    attributes: metadata.attributes
                });
                try {
                    return await api.context.with(api.trace.setSpan(api.context.active(), span), ()=>oldHandler.call(this, ...params));
                } catch (err) {
                    span.recordException(err);
                    span.setStatus({
                        code: api.SpanStatusCode.ERROR,
                        message: err.message
                    });
                    throw err;
                } finally{
                    span.end();
                }
            };
        };
        if (typeof route.handler === 'function') {
            route.handler = wrapHandler(route.handler);
        } else if (typeof route.options === 'function') {
            const oldOptions = route.options;
            route.options = function(server) {
                const options = oldOptions(server);
                if (typeof options.handler === 'function') {
                    options.handler = wrapHandler(options.handler);
                }
                return options;
            };
        } else if (typeof ((_a = route.options) === null || _a === void 0 ? void 0 : _a.handler) === 'function') {
            route.options.handler = wrapHandler(route.options.handler);
        }
        return route;
    }
}
exports.HapiInstrumentation = HapiInstrumentation;
}),
"[project]/node_modules/@opentelemetry/instrumentation-hapi/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-hapi/build/src/instrumentation.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-hapi/build/src/enums/AttributeNames.js [app-route] (ecmascript)"), exports);
}),
"[project]/node_modules/@opentelemetry/instrumentation-koa/build/src/types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.KoaLayerType = void 0;
var KoaLayerType;
(function(KoaLayerType) {
    KoaLayerType["ROUTER"] = "router";
    KoaLayerType["MIDDLEWARE"] = "middleware";
})(KoaLayerType = exports.KoaLayerType || (exports.KoaLayerType = {}));
}),
"[project]/node_modules/@opentelemetry/instrumentation-koa/build/src/version.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
// this is autogenerated file, see scripts/version-update.js
exports.PACKAGE_VERSION = '0.47.1';
exports.PACKAGE_NAME = '@opentelemetry/instrumentation-koa';
}),
"[project]/node_modules/@opentelemetry/instrumentation-koa/build/src/enums/AttributeNames.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AttributeNames = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var AttributeNames;
(function(AttributeNames) {
    AttributeNames["KOA_TYPE"] = "koa.type";
    AttributeNames["KOA_NAME"] = "koa.name";
})(AttributeNames = exports.AttributeNames || (exports.AttributeNames = {}));
}),
"[project]/node_modules/@opentelemetry/instrumentation-koa/build/src/utils.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isLayerIgnored = exports.getMiddlewareMetadata = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const types_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-koa/build/src/types.js [app-route] (ecmascript)");
const AttributeNames_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-koa/build/src/enums/AttributeNames.js [app-route] (ecmascript)");
const semantic_conventions_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/semantic-conventions/build/esm/index.js [app-route] (ecmascript)");
const getMiddlewareMetadata = (context, layer, isRouter, layerPath)=>{
    var _a;
    if (isRouter) {
        return {
            attributes: {
                [AttributeNames_1.AttributeNames.KOA_NAME]: layerPath === null || layerPath === void 0 ? void 0 : layerPath.toString(),
                [AttributeNames_1.AttributeNames.KOA_TYPE]: types_1.KoaLayerType.ROUTER,
                [semantic_conventions_1.SEMATTRS_HTTP_ROUTE]: layerPath === null || layerPath === void 0 ? void 0 : layerPath.toString()
            },
            name: context._matchedRouteName || `router - ${layerPath}`
        };
    } else {
        return {
            attributes: {
                [AttributeNames_1.AttributeNames.KOA_NAME]: (_a = layer.name) !== null && _a !== void 0 ? _a : 'middleware',
                [AttributeNames_1.AttributeNames.KOA_TYPE]: types_1.KoaLayerType.MIDDLEWARE
            },
            name: `middleware - ${layer.name}`
        };
    }
};
exports.getMiddlewareMetadata = getMiddlewareMetadata;
/**
 * Check whether the given request is ignored by configuration
 * @param [list] List of ignore patterns
 * @param [onException] callback for doing something when an exception has
 *     occurred
 */ const isLayerIgnored = (type, config)=>{
    var _a;
    return !!(Array.isArray(config === null || config === void 0 ? void 0 : config.ignoreLayersType) && ((_a = config === null || config === void 0 ? void 0 : config.ignoreLayersType) === null || _a === void 0 ? void 0 : _a.includes(type)));
};
exports.isLayerIgnored = isLayerIgnored;
}),
"[project]/node_modules/@opentelemetry/instrumentation-koa/build/src/internal-types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.kLayerPatched = void 0;
/**
 * This symbol is used to mark a Koa layer as being already instrumented
 * since its possible to use a given layer multiple times (ex: middlewares)
 */ exports.kLayerPatched = Symbol('koa-layer-patched');
}),
"[project]/node_modules/@opentelemetry/instrumentation-koa/build/src/instrumentation.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.KoaInstrumentation = void 0;
const api = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const instrumentation_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
const types_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-koa/build/src/types.js [app-route] (ecmascript)");
/** @knipignore */ const version_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-koa/build/src/version.js [app-route] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-koa/build/src/utils.js [app-route] (ecmascript)");
const core_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/core/build/esm/index.js [app-route] (ecmascript)");
const internal_types_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-koa/build/src/internal-types.js [app-route] (ecmascript)");
/** Koa instrumentation for OpenTelemetry */ class KoaInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}){
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
    }
    init() {
        return new instrumentation_1.InstrumentationNodeModuleDefinition('koa', [
            '>=2.0.0 <3'
        ], (module)=>{
            const moduleExports = module[Symbol.toStringTag] === 'Module' ? module.default // ESM
             : module; // CommonJS
            if (moduleExports == null) {
                return moduleExports;
            }
            if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.use)) {
                this._unwrap(moduleExports.prototype, 'use');
            }
            this._wrap(moduleExports.prototype, 'use', this._getKoaUsePatch.bind(this));
            return module;
        }, (module)=>{
            const moduleExports = module[Symbol.toStringTag] === 'Module' ? module.default // ESM
             : module; // CommonJS
            if ((0, instrumentation_1.isWrapped)(moduleExports.prototype.use)) {
                this._unwrap(moduleExports.prototype, 'use');
            }
        });
    }
    /**
     * Patches the Koa.use function in order to instrument each original
     * middleware layer which is introduced
     * @param {KoaMiddleware} middleware - the original middleware function
     */ _getKoaUsePatch(original) {
        const plugin = this;
        return function use(middlewareFunction) {
            let patchedFunction;
            if (middlewareFunction.router) {
                patchedFunction = plugin._patchRouterDispatch(middlewareFunction);
            } else {
                patchedFunction = plugin._patchLayer(middlewareFunction, false);
            }
            return original.apply(this, [
                patchedFunction
            ]);
        };
    }
    /**
     * Patches the dispatch function used by @koa/router. This function
     * goes through each routed middleware and adds instrumentation via a call
     * to the @function _patchLayer function.
     * @param {KoaMiddleware} dispatchLayer - the original dispatch function which dispatches
     * routed middleware
     */ _patchRouterDispatch(dispatchLayer) {
        var _a;
        api.diag.debug('Patching @koa/router dispatch');
        const router = dispatchLayer.router;
        const routesStack = (_a = router === null || router === void 0 ? void 0 : router.stack) !== null && _a !== void 0 ? _a : [];
        for (const pathLayer of routesStack){
            const path = pathLayer.path;
            const pathStack = pathLayer.stack;
            for(let j = 0; j < pathStack.length; j++){
                const routedMiddleware = pathStack[j];
                pathStack[j] = this._patchLayer(routedMiddleware, true, path);
            }
        }
        return dispatchLayer;
    }
    /**
     * Patches each individual @param middlewareLayer function in order to create the
     * span and propagate context. It does not create spans when there is no parent span.
     * @param {KoaMiddleware} middlewareLayer - the original middleware function.
     * @param {boolean} isRouter - tracks whether the original middleware function
     * was dispatched by the router originally
     * @param {string?} layerPath - if present, provides additional data from the
     * router about the routed path which the middleware is attached to
     */ _patchLayer(middlewareLayer, isRouter, layerPath) {
        const layerType = isRouter ? types_1.KoaLayerType.ROUTER : types_1.KoaLayerType.MIDDLEWARE;
        // Skip patching layer if its ignored in the config
        if (middlewareLayer[internal_types_1.kLayerPatched] === true || (0, utils_1.isLayerIgnored)(layerType, this.getConfig())) return middlewareLayer;
        if (middlewareLayer.constructor.name === 'GeneratorFunction' || middlewareLayer.constructor.name === 'AsyncGeneratorFunction') {
            api.diag.debug('ignoring generator-based Koa middleware layer');
            return middlewareLayer;
        }
        middlewareLayer[internal_types_1.kLayerPatched] = true;
        api.diag.debug('patching Koa middleware layer');
        return async (context, next)=>{
            const parent = api.trace.getSpan(api.context.active());
            if (parent === undefined) {
                return middlewareLayer(context, next);
            }
            const metadata = (0, utils_1.getMiddlewareMetadata)(context, middlewareLayer, isRouter, layerPath);
            const span = this.tracer.startSpan(metadata.name, {
                attributes: metadata.attributes
            });
            const rpcMetadata = (0, core_1.getRPCMetadata)(api.context.active());
            if ((rpcMetadata === null || rpcMetadata === void 0 ? void 0 : rpcMetadata.type) === core_1.RPCType.HTTP && context._matchedRoute) {
                rpcMetadata.route = context._matchedRoute.toString();
            }
            const { requestHook } = this.getConfig();
            if (requestHook) {
                (0, instrumentation_1.safeExecuteInTheMiddle)(()=>requestHook(span, {
                        context,
                        middlewareLayer,
                        layerType
                    }), (e)=>{
                    if (e) {
                        api.diag.error('koa instrumentation: request hook failed', e);
                    }
                }, true);
            }
            const newContext = api.trace.setSpan(api.context.active(), span);
            return api.context.with(newContext, async ()=>{
                try {
                    return await middlewareLayer(context, next);
                } catch (err) {
                    span.recordException(err);
                    throw err;
                } finally{
                    span.end();
                }
            });
        };
    }
}
exports.KoaInstrumentation = KoaInstrumentation;
}),
"[project]/node_modules/@opentelemetry/instrumentation-koa/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-koa/build/src/instrumentation.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-koa/build/src/types.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-koa/build/src/enums/AttributeNames.js [app-route] (ecmascript)"), exports);
}),
"[project]/node_modules/@opentelemetry/instrumentation-connect/build/src/enums/AttributeNames.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ConnectNames = exports.ConnectTypes = exports.AttributeNames = void 0;
var AttributeNames;
(function(AttributeNames) {
    AttributeNames["CONNECT_TYPE"] = "connect.type";
    AttributeNames["CONNECT_NAME"] = "connect.name";
})(AttributeNames = exports.AttributeNames || (exports.AttributeNames = {}));
var ConnectTypes;
(function(ConnectTypes) {
    ConnectTypes["MIDDLEWARE"] = "middleware";
    ConnectTypes["REQUEST_HANDLER"] = "request_handler";
})(ConnectTypes = exports.ConnectTypes || (exports.ConnectTypes = {}));
var ConnectNames;
(function(ConnectNames) {
    ConnectNames["MIDDLEWARE"] = "middleware";
    ConnectNames["REQUEST_HANDLER"] = "request handler";
})(ConnectNames = exports.ConnectNames || (exports.ConnectNames = {}));
}),
"[project]/node_modules/@opentelemetry/instrumentation-connect/build/src/version.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
// this is autogenerated file, see scripts/version-update.js
exports.PACKAGE_VERSION = '0.43.1';
exports.PACKAGE_NAME = '@opentelemetry/instrumentation-connect';
}),
"[project]/node_modules/@opentelemetry/instrumentation-connect/build/src/internal-types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports._LAYERS_STORE_PROPERTY = void 0;
exports._LAYERS_STORE_PROPERTY = Symbol('opentelemetry.instrumentation-connect.request-route-stack');
}),
"[project]/node_modules/@opentelemetry/instrumentation-connect/build/src/utils.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.generateRoute = exports.replaceCurrentStackRoute = exports.addNewStackLayer = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const api_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const internal_types_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-connect/build/src/internal-types.js [app-route] (ecmascript)");
const addNewStackLayer = (request)=>{
    if (Array.isArray(request[internal_types_1._LAYERS_STORE_PROPERTY]) === false) {
        Object.defineProperty(request, internal_types_1._LAYERS_STORE_PROPERTY, {
            enumerable: false,
            value: []
        });
    }
    request[internal_types_1._LAYERS_STORE_PROPERTY].push('/');
    const stackLength = request[internal_types_1._LAYERS_STORE_PROPERTY].length;
    return ()=>{
        if (stackLength === request[internal_types_1._LAYERS_STORE_PROPERTY].length) {
            request[internal_types_1._LAYERS_STORE_PROPERTY].pop();
        } else {
            api_1.diag.warn('Connect: Trying to pop the stack multiple time');
        }
    };
};
exports.addNewStackLayer = addNewStackLayer;
const replaceCurrentStackRoute = (request, newRoute)=>{
    if (newRoute) {
        request[internal_types_1._LAYERS_STORE_PROPERTY].splice(-1, 1, newRoute);
    }
};
exports.replaceCurrentStackRoute = replaceCurrentStackRoute;
// generate route from existing stack on request object.
// splash between stack layer will be deduped
// ["/first/", "/second", "/third/"] => /first/second/third/
const generateRoute = (request)=>{
    return request[internal_types_1._LAYERS_STORE_PROPERTY].reduce((acc, sub)=>acc.replace(/\/+$/, '') + sub);
};
exports.generateRoute = generateRoute;
}),
"[project]/node_modules/@opentelemetry/instrumentation-connect/build/src/instrumentation.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ConnectInstrumentation = exports.ANONYMOUS_NAME = void 0;
const api_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const core_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/core/build/esm/index.js [app-route] (ecmascript)");
const AttributeNames_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-connect/build/src/enums/AttributeNames.js [app-route] (ecmascript)");
/** @knipignore */ const version_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-connect/build/src/version.js [app-route] (ecmascript)");
const instrumentation_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
const semantic_conventions_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/semantic-conventions/build/esm/index.js [app-route] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-connect/build/src/utils.js [app-route] (ecmascript)");
exports.ANONYMOUS_NAME = 'anonymous';
/** Connect instrumentation for OpenTelemetry */ class ConnectInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}){
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
    }
    init() {
        return [
            new instrumentation_1.InstrumentationNodeModuleDefinition('connect', [
                '>=3.0.0 <4'
            ], (moduleExports)=>{
                return this._patchConstructor(moduleExports);
            })
        ];
    }
    _patchApp(patchedApp) {
        if (!(0, instrumentation_1.isWrapped)(patchedApp.use)) {
            this._wrap(patchedApp, 'use', this._patchUse.bind(this));
        }
        if (!(0, instrumentation_1.isWrapped)(patchedApp.handle)) {
            this._wrap(patchedApp, 'handle', this._patchHandle.bind(this));
        }
    }
    _patchConstructor(original) {
        const instrumentation = this;
        return function(...args) {
            const app = original.apply(this, args);
            instrumentation._patchApp(app);
            return app;
        };
    }
    _patchNext(next, finishSpan) {
        return function nextFunction(err) {
            const result = next.apply(this, [
                err
            ]);
            finishSpan();
            return result;
        };
    }
    _startSpan(routeName, middleWare) {
        let connectType;
        let connectName;
        let connectTypeName;
        if (routeName) {
            connectType = AttributeNames_1.ConnectTypes.REQUEST_HANDLER;
            connectTypeName = AttributeNames_1.ConnectNames.REQUEST_HANDLER;
            connectName = routeName;
        } else {
            connectType = AttributeNames_1.ConnectTypes.MIDDLEWARE;
            connectTypeName = AttributeNames_1.ConnectNames.MIDDLEWARE;
            connectName = middleWare.name || exports.ANONYMOUS_NAME;
        }
        const spanName = `${connectTypeName} - ${connectName}`;
        const options = {
            attributes: {
                [semantic_conventions_1.SEMATTRS_HTTP_ROUTE]: routeName.length > 0 ? routeName : '/',
                [AttributeNames_1.AttributeNames.CONNECT_TYPE]: connectType,
                [AttributeNames_1.AttributeNames.CONNECT_NAME]: connectName
            }
        };
        return this.tracer.startSpan(spanName, options);
    }
    _patchMiddleware(routeName, middleWare) {
        const instrumentation = this;
        const isErrorMiddleware = middleWare.length === 4;
        function patchedMiddleware() {
            if (!instrumentation.isEnabled()) {
                return middleWare.apply(this, arguments);
            }
            const [reqArgIdx, resArgIdx, nextArgIdx] = isErrorMiddleware ? [
                1,
                2,
                3
            ] : [
                0,
                1,
                2
            ];
            const req = arguments[reqArgIdx];
            const res = arguments[resArgIdx];
            const next = arguments[nextArgIdx];
            (0, utils_1.replaceCurrentStackRoute)(req, routeName);
            const rpcMetadata = (0, core_1.getRPCMetadata)(api_1.context.active());
            if (routeName && (rpcMetadata === null || rpcMetadata === void 0 ? void 0 : rpcMetadata.type) === core_1.RPCType.HTTP) {
                rpcMetadata.route = (0, utils_1.generateRoute)(req);
            }
            let spanName = '';
            if (routeName) {
                spanName = `request handler - ${routeName}`;
            } else {
                spanName = `middleware - ${middleWare.name || exports.ANONYMOUS_NAME}`;
            }
            const span = instrumentation._startSpan(routeName, middleWare);
            instrumentation._diag.debug('start span', spanName);
            let spanFinished = false;
            function finishSpan() {
                if (!spanFinished) {
                    spanFinished = true;
                    instrumentation._diag.debug(`finishing span ${span.name}`);
                    span.end();
                } else {
                    instrumentation._diag.debug(`span ${span.name} - already finished`);
                }
                res.removeListener('close', finishSpan);
            }
            res.addListener('close', finishSpan);
            arguments[nextArgIdx] = instrumentation._patchNext(next, finishSpan);
            return middleWare.apply(this, arguments);
        }
        Object.defineProperty(patchedMiddleware, 'length', {
            value: middleWare.length,
            writable: false,
            configurable: true
        });
        return patchedMiddleware;
    }
    _patchUse(original) {
        const instrumentation = this;
        return function(...args) {
            const middleWare = args[args.length - 1];
            const routeName = args[args.length - 2] || '';
            args[args.length - 1] = instrumentation._patchMiddleware(routeName, middleWare);
            return original.apply(this, args);
        };
    }
    _patchHandle(original) {
        const instrumentation = this;
        return function() {
            const [reqIdx, outIdx] = [
                0,
                2
            ];
            const req = arguments[reqIdx];
            const out = arguments[outIdx];
            const completeStack = (0, utils_1.addNewStackLayer)(req);
            if (typeof out === 'function') {
                arguments[outIdx] = instrumentation._patchOut(out, completeStack);
            }
            return original.apply(this, arguments);
        };
    }
    _patchOut(out, completeStack) {
        return function nextFunction(...args) {
            completeStack();
            return Reflect.apply(out, this, args);
        };
    }
}
exports.ConnectInstrumentation = ConnectInstrumentation;
}),
"[project]/node_modules/@opentelemetry/instrumentation-connect/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-connect/build/src/enums/AttributeNames.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-connect/build/src/instrumentation.js [app-route] (ecmascript)"), exports);
}),
"[project]/node_modules/@opentelemetry/instrumentation-knex/build/src/version.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
// this is autogenerated file, see scripts/version-update.js
exports.PACKAGE_VERSION = '0.44.1';
exports.PACKAGE_NAME = '@opentelemetry/instrumentation-knex';
}),
"[project]/node_modules/@opentelemetry/instrumentation-knex/build/src/constants.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SUPPORTED_VERSIONS = exports.MODULE_NAME = void 0;
exports.MODULE_NAME = 'knex';
exports.SUPPORTED_VERSIONS = [
    // use "lib/execution" for runner.js, "lib" for client.js as basepath, latest tested 0.95.6
    '>=0.22.0 <4',
    // use "lib" as basepath
    '>=0.10.0 <0.18.0',
    '>=0.19.0 <0.22.0',
    // use "src" as basepath
    '>=0.18.0 <0.19.0'
];
}),
"[project]/node_modules/@opentelemetry/instrumentation-knex/build/src/utils.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.extractTableName = exports.limitLength = exports.getName = exports.mapSystem = exports.otelExceptionFromKnexError = exports.getFormatter = void 0;
const semantic_conventions_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/semantic-conventions/build/esm/index.js [app-route] (ecmascript)");
const getFormatter = (runner)=>{
    if (runner) {
        if (runner.client) {
            if (runner.client._formatQuery) {
                return runner.client._formatQuery.bind(runner.client);
            } else if (runner.client.SqlString) {
                return runner.client.SqlString.format.bind(runner.client.SqlString);
            }
        }
        if (runner.builder) {
            return runner.builder.toString.bind(runner.builder);
        }
    }
    return ()=>'<noop formatter>';
};
exports.getFormatter = getFormatter;
function otelExceptionFromKnexError(err, message) {
    if (!(err && err instanceof Error)) {
        return err;
    }
    return {
        message,
        code: err.code,
        stack: err.stack,
        name: err.name
    };
}
exports.otelExceptionFromKnexError = otelExceptionFromKnexError;
const systemMap = new Map([
    [
        'sqlite3',
        semantic_conventions_1.DBSYSTEMVALUES_SQLITE
    ],
    [
        'pg',
        semantic_conventions_1.DBSYSTEMVALUES_POSTGRESQL
    ]
]);
const mapSystem = (knexSystem)=>{
    return systemMap.get(knexSystem) || knexSystem;
};
exports.mapSystem = mapSystem;
const getName = (db, operation, table)=>{
    if (operation) {
        if (table) {
            return `${operation} ${db}.${table}`;
        }
        return `${operation} ${db}`;
    }
    return db;
};
exports.getName = getName;
const limitLength = (str, maxLength)=>{
    if (typeof str === 'string' && typeof maxLength === 'number' && 0 < maxLength && maxLength < str.length) {
        return str.substring(0, maxLength) + '..';
    }
    return str;
};
exports.limitLength = limitLength;
const extractTableName = (builder)=>{
    var _a;
    const table = (_a = builder === null || builder === void 0 ? void 0 : builder._single) === null || _a === void 0 ? void 0 : _a.table;
    if (typeof table === 'object') {
        return (0, exports.extractTableName)(table);
    }
    return table;
};
exports.extractTableName = extractTableName;
}),
"[project]/node_modules/@opentelemetry/instrumentation-knex/build/src/instrumentation.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.KnexInstrumentation = void 0;
const api = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
/** @knipignore */ const version_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-knex/build/src/version.js [app-route] (ecmascript)");
const constants = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-knex/build/src/constants.js [app-route] (ecmascript)");
const instrumentation_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
const semantic_conventions_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/semantic-conventions/build/esm/index.js [app-route] (ecmascript)");
const utils = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-knex/build/src/utils.js [app-route] (ecmascript)");
const contextSymbol = Symbol('opentelemetry.instrumentation-knex.context');
const DEFAULT_CONFIG = {
    maxQueryLength: 1022,
    requireParentSpan: false
};
class KnexInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}){
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, Object.assign(Object.assign({}, DEFAULT_CONFIG), config));
    }
    setConfig(config = {}) {
        super.setConfig(Object.assign(Object.assign({}, DEFAULT_CONFIG), config));
    }
    init() {
        const module = new instrumentation_1.InstrumentationNodeModuleDefinition(constants.MODULE_NAME, constants.SUPPORTED_VERSIONS);
        module.files.push(this.getClientNodeModuleFileInstrumentation('src'), this.getClientNodeModuleFileInstrumentation('lib'), this.getRunnerNodeModuleFileInstrumentation('src'), this.getRunnerNodeModuleFileInstrumentation('lib'), this.getRunnerNodeModuleFileInstrumentation('lib/execution'));
        return module;
    }
    getRunnerNodeModuleFileInstrumentation(basePath) {
        return new instrumentation_1.InstrumentationNodeModuleFile(`knex/${basePath}/runner.js`, constants.SUPPORTED_VERSIONS, (Runner, moduleVersion)=>{
            this.ensureWrapped(Runner.prototype, 'query', this.createQueryWrapper(moduleVersion));
            return Runner;
        }, (Runner, moduleVersion)=>{
            this._unwrap(Runner.prototype, 'query');
            return Runner;
        });
    }
    getClientNodeModuleFileInstrumentation(basePath) {
        return new instrumentation_1.InstrumentationNodeModuleFile(`knex/${basePath}/client.js`, constants.SUPPORTED_VERSIONS, (Client)=>{
            this.ensureWrapped(Client.prototype, 'queryBuilder', this.storeContext.bind(this));
            this.ensureWrapped(Client.prototype, 'schemaBuilder', this.storeContext.bind(this));
            this.ensureWrapped(Client.prototype, 'raw', this.storeContext.bind(this));
            return Client;
        }, (Client)=>{
            this._unwrap(Client.prototype, 'queryBuilder');
            this._unwrap(Client.prototype, 'schemaBuilder');
            this._unwrap(Client.prototype, 'raw');
            return Client;
        });
    }
    createQueryWrapper(moduleVersion) {
        const instrumentation = this;
        return function wrapQuery(original) {
            return function wrapped_logging_method(query) {
                var _a, _b, _c, _d, _e, _f;
                const config = this.client.config;
                const table = utils.extractTableName(this.builder);
                // `method` actually refers to the knex API method - Not exactly "operation"
                // in the spec sense, but matches most of the time.
                const operation = query === null || query === void 0 ? void 0 : query.method;
                const name = ((_a = config === null || config === void 0 ? void 0 : config.connection) === null || _a === void 0 ? void 0 : _a.filename) || ((_b = config === null || config === void 0 ? void 0 : config.connection) === null || _b === void 0 ? void 0 : _b.database);
                const { maxQueryLength } = instrumentation.getConfig();
                const attributes = {
                    'knex.version': moduleVersion,
                    [semantic_conventions_1.SEMATTRS_DB_SYSTEM]: utils.mapSystem(config.client),
                    [semantic_conventions_1.SEMATTRS_DB_SQL_TABLE]: table,
                    [semantic_conventions_1.SEMATTRS_DB_OPERATION]: operation,
                    [semantic_conventions_1.SEMATTRS_DB_USER]: (_c = config === null || config === void 0 ? void 0 : config.connection) === null || _c === void 0 ? void 0 : _c.user,
                    [semantic_conventions_1.SEMATTRS_DB_NAME]: name,
                    [semantic_conventions_1.SEMATTRS_NET_PEER_NAME]: (_d = config === null || config === void 0 ? void 0 : config.connection) === null || _d === void 0 ? void 0 : _d.host,
                    [semantic_conventions_1.SEMATTRS_NET_PEER_PORT]: (_e = config === null || config === void 0 ? void 0 : config.connection) === null || _e === void 0 ? void 0 : _e.port,
                    [semantic_conventions_1.SEMATTRS_NET_TRANSPORT]: ((_f = config === null || config === void 0 ? void 0 : config.connection) === null || _f === void 0 ? void 0 : _f.filename) === ':memory:' ? 'inproc' : undefined
                };
                if (maxQueryLength) {
                    // filters both undefined and 0
                    attributes[semantic_conventions_1.SEMATTRS_DB_STATEMENT] = utils.limitLength(query === null || query === void 0 ? void 0 : query.sql, maxQueryLength);
                }
                const parentContext = this.builder[contextSymbol] || api.context.active();
                const parentSpan = api.trace.getSpan(parentContext);
                const hasActiveParent = parentSpan && api.trace.isSpanContextValid(parentSpan.spanContext());
                if (instrumentation._config.requireParentSpan && !hasActiveParent) {
                    return original.bind(this)(...arguments);
                }
                const span = instrumentation.tracer.startSpan(utils.getName(name, operation, table), {
                    kind: api.SpanKind.CLIENT,
                    attributes
                }, parentContext);
                const spanContext = api.trace.setSpan(api.context.active(), span);
                return api.context.with(spanContext, original, this, ...arguments).then((result)=>{
                    span.end();
                    return result;
                }).catch((err)=>{
                    // knex adds full query with all the binding values to the message,
                    // we want to undo that without changing the original error
                    const formatter = utils.getFormatter(this);
                    const fullQuery = formatter(query.sql, query.bindings || []);
                    const message = err.message.replace(fullQuery + ' - ', '');
                    const exc = utils.otelExceptionFromKnexError(err, message);
                    span.recordException(exc);
                    span.setStatus({
                        code: api.SpanStatusCode.ERROR,
                        message
                    });
                    span.end();
                    throw err;
                });
            };
        };
    }
    storeContext(original) {
        return function wrapped_logging_method() {
            const builder = original.apply(this, arguments);
            // Builder is a custom promise type and when awaited it fails to propagate context.
            // We store the parent context at the moment of initiating the builder
            // otherwise we'd have nothing to attach the span as a child for in `query`.
            Object.defineProperty(builder, contextSymbol, {
                value: api.context.active()
            });
            return builder;
        };
    }
    ensureWrapped(obj, methodName, wrapper) {
        if ((0, instrumentation_1.isWrapped)(obj[methodName])) {
            this._unwrap(obj, methodName);
        }
        this._wrap(obj, methodName, wrapper);
    }
}
exports.KnexInstrumentation = KnexInstrumentation;
}),
"[project]/node_modules/@opentelemetry/instrumentation-knex/build/src/types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
}),
"[project]/node_modules/@opentelemetry/instrumentation-knex/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-knex/build/src/instrumentation.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-knex/build/src/types.js [app-route] (ecmascript)"), exports);
}),
"[project]/node_modules/@opentelemetry/instrumentation-tedious/build/src/utils.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.once = exports.getSpanName = void 0;
/**
 * The span name SHOULD be set to a low cardinality value
 * representing the statement executed on the database.
 *
 * @returns Operation executed on Tedious Connection. Does not map to SQL statement in any way.
 */ function getSpanName(operation, db, sql, bulkLoadTable) {
    if (operation === 'execBulkLoad' && bulkLoadTable && db) {
        return `${operation} ${bulkLoadTable} ${db}`;
    }
    if (operation === 'callProcedure') {
        // `sql` refers to procedure name with `callProcedure`
        if (db) {
            return `${operation} ${sql} ${db}`;
        }
        return `${operation} ${sql}`;
    }
    // do not use `sql` in general case because of high-cardinality
    if (db) {
        return `${operation} ${db}`;
    }
    return `${operation}`;
}
exports.getSpanName = getSpanName;
const once = (fn)=>{
    let called = false;
    return (...args)=>{
        if (called) return;
        called = true;
        return fn(...args);
    };
};
exports.once = once;
}),
"[project]/node_modules/@opentelemetry/instrumentation-tedious/build/src/version.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
// this is autogenerated file, see scripts/version-update.js
exports.PACKAGE_VERSION = '0.18.1';
exports.PACKAGE_NAME = '@opentelemetry/instrumentation-tedious';
}),
"[project]/node_modules/@opentelemetry/instrumentation-tedious/build/src/instrumentation.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TediousInstrumentation = void 0;
const api = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const events_1 = __turbopack_context__.r("[externals]/events [external] (events, cjs)");
const instrumentation_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
const semantic_conventions_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/semantic-conventions/build/esm/index.js [app-route] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-tedious/build/src/utils.js [app-route] (ecmascript)");
/** @knipignore */ const version_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-tedious/build/src/version.js [app-route] (ecmascript)");
const CURRENT_DATABASE = Symbol('opentelemetry.instrumentation-tedious.current-database');
const PATCHED_METHODS = [
    'callProcedure',
    'execSql',
    'execSqlBatch',
    'execBulkLoad',
    'prepare',
    'execute'
];
function setDatabase(databaseName) {
    Object.defineProperty(this, CURRENT_DATABASE, {
        value: databaseName,
        writable: true
    });
}
class TediousInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}){
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
    }
    init() {
        return [
            new instrumentation_1.InstrumentationNodeModuleDefinition(TediousInstrumentation.COMPONENT, [
                '>=1.11.0 <20'
            ], (moduleExports)=>{
                const ConnectionPrototype = moduleExports.Connection.prototype;
                for (const method of PATCHED_METHODS){
                    if ((0, instrumentation_1.isWrapped)(ConnectionPrototype[method])) {
                        this._unwrap(ConnectionPrototype, method);
                    }
                    this._wrap(ConnectionPrototype, method, this._patchQuery(method));
                }
                if ((0, instrumentation_1.isWrapped)(ConnectionPrototype.connect)) {
                    this._unwrap(ConnectionPrototype, 'connect');
                }
                this._wrap(ConnectionPrototype, 'connect', this._patchConnect);
                return moduleExports;
            }, (moduleExports)=>{
                if (moduleExports === undefined) return;
                const ConnectionPrototype = moduleExports.Connection.prototype;
                for (const method of PATCHED_METHODS){
                    this._unwrap(ConnectionPrototype, method);
                }
                this._unwrap(ConnectionPrototype, 'connect');
            })
        ];
    }
    _patchConnect(original) {
        return function patchedConnect() {
            var _a, _b;
            setDatabase.call(this, (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.options) === null || _b === void 0 ? void 0 : _b.database);
            // remove the listener first in case it's already added
            this.removeListener('databaseChange', setDatabase);
            this.on('databaseChange', setDatabase);
            this.once('end', ()=>{
                this.removeListener('databaseChange', setDatabase);
            });
            return original.apply(this, arguments);
        };
    }
    _patchQuery(operation) {
        return (originalMethod)=>{
            const thisPlugin = this;
            function patchedMethod(request) {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                if (!(request instanceof events_1.EventEmitter)) {
                    thisPlugin._diag.warn(`Unexpected invocation of patched ${operation} method. Span not recorded`);
                    return originalMethod.apply(this, arguments);
                }
                let procCount = 0;
                let statementCount = 0;
                const incrementStatementCount = ()=>statementCount++;
                const incrementProcCount = ()=>procCount++;
                const databaseName = this[CURRENT_DATABASE];
                const sql = ((request)=>{
                    var _a, _b;
                    // Required for <11.0.9
                    if (request.sqlTextOrProcedure === 'sp_prepare' && ((_b = (_a = request.parametersByName) === null || _a === void 0 ? void 0 : _a.stmt) === null || _b === void 0 ? void 0 : _b.value)) {
                        return request.parametersByName.stmt.value;
                    }
                    return request.sqlTextOrProcedure;
                })(request);
                const span = thisPlugin.tracer.startSpan((0, utils_1.getSpanName)(operation, databaseName, sql, request.table), {
                    kind: api.SpanKind.CLIENT,
                    attributes: {
                        [semantic_conventions_1.SEMATTRS_DB_SYSTEM]: semantic_conventions_1.DBSYSTEMVALUES_MSSQL,
                        [semantic_conventions_1.SEMATTRS_DB_NAME]: databaseName,
                        [semantic_conventions_1.SEMATTRS_NET_PEER_PORT]: (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.options) === null || _b === void 0 ? void 0 : _b.port,
                        [semantic_conventions_1.SEMATTRS_NET_PEER_NAME]: (_c = this.config) === null || _c === void 0 ? void 0 : _c.server,
                        // >=4 uses `authentication` object, older versions just userName and password pair
                        [semantic_conventions_1.SEMATTRS_DB_USER]: (_e = (_d = this.config) === null || _d === void 0 ? void 0 : _d.userName) !== null && _e !== void 0 ? _e : (_h = (_g = (_f = this.config) === null || _f === void 0 ? void 0 : _f.authentication) === null || _g === void 0 ? void 0 : _g.options) === null || _h === void 0 ? void 0 : _h.userName,
                        [semantic_conventions_1.SEMATTRS_DB_STATEMENT]: sql,
                        [semantic_conventions_1.SEMATTRS_DB_SQL_TABLE]: request.table
                    }
                });
                const endSpan = (0, utils_1.once)((err)=>{
                    request.removeListener('done', incrementStatementCount);
                    request.removeListener('doneInProc', incrementStatementCount);
                    request.removeListener('doneProc', incrementProcCount);
                    request.removeListener('error', endSpan);
                    this.removeListener('end', endSpan);
                    span.setAttribute('tedious.procedure_count', procCount);
                    span.setAttribute('tedious.statement_count', statementCount);
                    if (err) {
                        span.setStatus({
                            code: api.SpanStatusCode.ERROR,
                            message: err.message
                        });
                    }
                    span.end();
                });
                request.on('done', incrementStatementCount);
                request.on('doneInProc', incrementStatementCount);
                request.on('doneProc', incrementProcCount);
                request.once('error', endSpan);
                this.on('end', endSpan);
                if (typeof request.callback === 'function') {
                    thisPlugin._wrap(request, 'callback', thisPlugin._patchCallbackQuery(endSpan));
                } else {
                    thisPlugin._diag.error('Expected request.callback to be a function');
                }
                return api.context.with(api.trace.setSpan(api.context.active(), span), originalMethod, this, ...arguments);
            }
            Object.defineProperty(patchedMethod, 'length', {
                value: originalMethod.length,
                writable: false
            });
            return patchedMethod;
        };
    }
    _patchCallbackQuery(endSpan) {
        return (originalCallback)=>{
            return function(err, rowCount, rows) {
                endSpan(err);
                return originalCallback.apply(this, arguments);
            };
        };
    }
}
exports.TediousInstrumentation = TediousInstrumentation;
TediousInstrumentation.COMPONENT = 'tedious';
}),
"[project]/node_modules/@opentelemetry/instrumentation-tedious/build/src/types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
}),
"[project]/node_modules/@opentelemetry/instrumentation-tedious/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-tedious/build/src/instrumentation.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-tedious/build/src/types.js [app-route] (ecmascript)"), exports);
}),
"[project]/node_modules/@opentelemetry/instrumentation-generic-pool/build/src/version.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
// this is autogenerated file, see scripts/version-update.js
exports.PACKAGE_VERSION = '0.43.1';
exports.PACKAGE_NAME = '@opentelemetry/instrumentation-generic-pool';
}),
"[project]/node_modules/@opentelemetry/instrumentation-generic-pool/build/src/instrumentation.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GenericPoolInstrumentation = void 0;
const api = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const instrumentation_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
/** @knipignore */ const version_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-generic-pool/build/src/version.js [app-route] (ecmascript)");
const MODULE_NAME = 'generic-pool';
class GenericPoolInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}){
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
        // only used for v2 - v2.3)
        this._isDisabled = false;
    }
    init() {
        return [
            new instrumentation_1.InstrumentationNodeModuleDefinition(MODULE_NAME, [
                '>=3.0.0 <4'
            ], (moduleExports)=>{
                const Pool = moduleExports.Pool;
                if ((0, instrumentation_1.isWrapped)(Pool.prototype.acquire)) {
                    this._unwrap(Pool.prototype, 'acquire');
                }
                this._wrap(Pool.prototype, 'acquire', this._acquirePatcher.bind(this));
                return moduleExports;
            }, (moduleExports)=>{
                const Pool = moduleExports.Pool;
                this._unwrap(Pool.prototype, 'acquire');
                return moduleExports;
            }),
            new instrumentation_1.InstrumentationNodeModuleDefinition(MODULE_NAME, [
                '>=2.4.0 <3'
            ], (moduleExports)=>{
                const Pool = moduleExports.Pool;
                if ((0, instrumentation_1.isWrapped)(Pool.prototype.acquire)) {
                    this._unwrap(Pool.prototype, 'acquire');
                }
                this._wrap(Pool.prototype, 'acquire', this._acquireWithCallbacksPatcher.bind(this));
                return moduleExports;
            }, (moduleExports)=>{
                const Pool = moduleExports.Pool;
                this._unwrap(Pool.prototype, 'acquire');
                return moduleExports;
            }),
            new instrumentation_1.InstrumentationNodeModuleDefinition(MODULE_NAME, [
                '>=2.0.0 <2.4'
            ], (moduleExports)=>{
                this._isDisabled = false;
                if ((0, instrumentation_1.isWrapped)(moduleExports.Pool)) {
                    this._unwrap(moduleExports, 'Pool');
                }
                this._wrap(moduleExports, 'Pool', this._poolWrapper.bind(this));
                return moduleExports;
            }, (moduleExports)=>{
                // since the object is created on the fly every time, we need to use
                // a boolean switch here to disable the instrumentation
                this._isDisabled = true;
                return moduleExports;
            })
        ];
    }
    _acquirePatcher(original) {
        const instrumentation = this;
        return function wrapped_acquire(...args) {
            const parent = api.context.active();
            const span = instrumentation.tracer.startSpan('generic-pool.acquire', {}, parent);
            return api.context.with(api.trace.setSpan(parent, span), ()=>{
                return original.call(this, ...args).then((value)=>{
                    span.end();
                    return value;
                }, (err)=>{
                    span.recordException(err);
                    span.end();
                    throw err;
                });
            });
        };
    }
    _poolWrapper(original) {
        const instrumentation = this;
        return function wrapped_pool() {
            const pool = original.apply(this, arguments);
            instrumentation._wrap(pool, 'acquire', instrumentation._acquireWithCallbacksPatcher.bind(instrumentation));
            return pool;
        };
    }
    _acquireWithCallbacksPatcher(original) {
        const instrumentation = this;
        return function wrapped_acquire(cb, priority) {
            // only used for v2 - v2.3
            if (instrumentation._isDisabled) {
                return original.call(this, cb, priority);
            }
            const parent = api.context.active();
            const span = instrumentation.tracer.startSpan('generic-pool.acquire', {}, parent);
            return api.context.with(api.trace.setSpan(parent, span), ()=>{
                original.call(this, (err, client)=>{
                    span.end();
                    // Not checking whether cb is a function because
                    // the original code doesn't do that either.
                    if (cb) {
                        return cb(err, client);
                    }
                }, priority);
            });
        };
    }
}
exports.GenericPoolInstrumentation = GenericPoolInstrumentation;
}),
"[project]/node_modules/@opentelemetry/instrumentation-generic-pool/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-generic-pool/build/src/instrumentation.js [app-route] (ecmascript)"), exports);
}),
"[project]/node_modules/@opentelemetry/instrumentation-dataloader/build/src/types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
}),
"[project]/node_modules/@opentelemetry/instrumentation-dataloader/build/src/version.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
// this is autogenerated file, see scripts/version-update.js
exports.PACKAGE_VERSION = '0.16.1';
exports.PACKAGE_NAME = '@opentelemetry/instrumentation-dataloader';
}),
"[project]/node_modules/@opentelemetry/instrumentation-dataloader/build/src/instrumentation.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DataloaderInstrumentation = void 0;
const instrumentation_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
const api_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
/** @knipignore */ const version_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-dataloader/build/src/version.js [app-route] (ecmascript)");
const MODULE_NAME = 'dataloader';
class DataloaderInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}){
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, config);
    }
    init() {
        return [
            new instrumentation_1.InstrumentationNodeModuleDefinition(MODULE_NAME, [
                '>=2.0.0 <3'
            ], (dataloader)=>{
                this._patchLoad(dataloader.prototype);
                this._patchLoadMany(dataloader.prototype);
                return this._getPatchedConstructor(dataloader);
            }, (dataloader)=>{
                if ((0, instrumentation_1.isWrapped)(dataloader.prototype.load)) {
                    this._unwrap(dataloader.prototype, 'load');
                }
                if ((0, instrumentation_1.isWrapped)(dataloader.prototype.loadMany)) {
                    this._unwrap(dataloader.prototype, 'loadMany');
                }
            })
        ];
    }
    shouldCreateSpans() {
        const config = this.getConfig();
        const hasParentSpan = api_1.trace.getSpan(api_1.context.active()) !== undefined;
        return hasParentSpan || !config.requireParentSpan;
    }
    getSpanName(dataloader, operation) {
        const dataloaderName = dataloader.name;
        if (dataloaderName === undefined || dataloaderName === null) {
            return `${MODULE_NAME}.${operation}`;
        }
        return `${MODULE_NAME}.${operation} ${dataloaderName}`;
    }
    _getPatchedConstructor(constructor) {
        const prototype = constructor.prototype;
        const instrumentation = this;
        function PatchedDataloader(...args) {
            const inst = new constructor(...args);
            if (!instrumentation.isEnabled()) {
                return inst;
            }
            if ((0, instrumentation_1.isWrapped)(inst._batchLoadFn)) {
                instrumentation._unwrap(inst, '_batchLoadFn');
            }
            instrumentation._wrap(inst, '_batchLoadFn', (original)=>{
                return function patchedBatchLoadFn(...args) {
                    var _a;
                    if (!instrumentation.isEnabled() || !instrumentation.shouldCreateSpans()) {
                        return original.call(this, ...args);
                    }
                    const parent = api_1.context.active();
                    const span = instrumentation.tracer.startSpan(instrumentation.getSpanName(inst, 'batch'), {
                        links: (_a = this._batch) === null || _a === void 0 ? void 0 : _a.spanLinks
                    }, parent);
                    return api_1.context.with(api_1.trace.setSpan(parent, span), ()=>{
                        return original.apply(this, args).then((value)=>{
                            span.end();
                            return value;
                        }).catch((err)=>{
                            span.recordException(err);
                            span.setStatus({
                                code: api_1.SpanStatusCode.ERROR,
                                message: err.message
                            });
                            span.end();
                            throw err;
                        });
                    });
                };
            });
            return inst;
        }
        PatchedDataloader.prototype = prototype;
        return PatchedDataloader;
    }
    _patchLoad(proto) {
        if ((0, instrumentation_1.isWrapped)(proto.load)) {
            this._unwrap(proto, 'load');
        }
        this._wrap(proto, 'load', this._getPatchedLoad.bind(this));
    }
    _getPatchedLoad(original) {
        const instrumentation = this;
        return function patchedLoad(...args) {
            if (!instrumentation.shouldCreateSpans()) {
                return original.call(this, ...args);
            }
            const parent = api_1.context.active();
            const span = instrumentation.tracer.startSpan(instrumentation.getSpanName(this, 'load'), {
                kind: api_1.SpanKind.CLIENT
            }, parent);
            return api_1.context.with(api_1.trace.setSpan(parent, span), ()=>{
                const result = original.call(this, ...args).then((value)=>{
                    span.end();
                    return value;
                }).catch((err)=>{
                    span.recordException(err);
                    span.setStatus({
                        code: api_1.SpanStatusCode.ERROR,
                        message: err.message
                    });
                    span.end();
                    throw err;
                });
                const loader = this;
                if (loader._batch) {
                    if (!loader._batch.spanLinks) {
                        loader._batch.spanLinks = [];
                    }
                    loader._batch.spanLinks.push({
                        context: span.spanContext()
                    });
                }
                return result;
            });
        };
    }
    _patchLoadMany(proto) {
        if ((0, instrumentation_1.isWrapped)(proto.loadMany)) {
            this._unwrap(proto, 'loadMany');
        }
        this._wrap(proto, 'loadMany', this._getPatchedLoadMany.bind(this));
    }
    _getPatchedLoadMany(original) {
        const instrumentation = this;
        return function patchedLoadMany(...args) {
            if (!instrumentation.shouldCreateSpans()) {
                return original.call(this, ...args);
            }
            const parent = api_1.context.active();
            const span = instrumentation.tracer.startSpan(instrumentation.getSpanName(this, 'loadMany'), {
                kind: api_1.SpanKind.CLIENT
            }, parent);
            return api_1.context.with(api_1.trace.setSpan(parent, span), ()=>{
                // .loadMany never rejects, as errors from internal .load
                // calls are caught by dataloader lib
                return original.call(this, ...args).then((value)=>{
                    span.end();
                    return value;
                });
            });
        };
    }
}
exports.DataloaderInstrumentation = DataloaderInstrumentation;
}),
"[project]/node_modules/@opentelemetry/instrumentation-dataloader/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-dataloader/build/src/types.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-dataloader/build/src/instrumentation.js [app-route] (ecmascript)"), exports);
}),
"[project]/node_modules/@opentelemetry/instrumentation-amqplib/build/src/types.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DEFAULT_CONFIG = exports.EndOperation = void 0;
var EndOperation;
(function(EndOperation) {
    EndOperation["AutoAck"] = "auto ack";
    EndOperation["Ack"] = "ack";
    EndOperation["AckAll"] = "ackAll";
    EndOperation["Reject"] = "reject";
    EndOperation["Nack"] = "nack";
    EndOperation["NackAll"] = "nackAll";
    EndOperation["ChannelClosed"] = "channel closed";
    EndOperation["ChannelError"] = "channel error";
    EndOperation["InstrumentationTimeout"] = "instrumentation timeout";
})(EndOperation = exports.EndOperation || (exports.EndOperation = {}));
exports.DEFAULT_CONFIG = {
    consumeTimeoutMs: 1000 * 60,
    useLinksForConsume: false
};
}),
"[project]/node_modules/@opentelemetry/instrumentation-amqplib/build/src/utils.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isConfirmChannelTracing = exports.unmarkConfirmChannelTracing = exports.markConfirmChannelTracing = exports.getConnectionAttributesFromUrl = exports.getConnectionAttributesFromServer = exports.normalizeExchange = exports.CONNECTION_ATTRIBUTES = exports.CHANNEL_CONSUME_TIMEOUT_TIMER = exports.CHANNEL_SPANS_NOT_ENDED = exports.MESSAGE_STORED_SPAN = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const api_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const semantic_conventions_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/semantic-conventions/build/esm/index.js [app-route] (ecmascript)");
exports.MESSAGE_STORED_SPAN = Symbol('opentelemetry.amqplib.message.stored-span');
exports.CHANNEL_SPANS_NOT_ENDED = Symbol('opentelemetry.amqplib.channel.spans-not-ended');
exports.CHANNEL_CONSUME_TIMEOUT_TIMER = Symbol('opentelemetry.amqplib.channel.consumer-timeout-timer');
exports.CONNECTION_ATTRIBUTES = Symbol('opentelemetry.amqplib.connection.attributes');
const IS_CONFIRM_CHANNEL_CONTEXT_KEY = (0, api_1.createContextKey)('opentelemetry.amqplib.channel.is-confirm-channel');
const normalizeExchange = (exchangeName)=>exchangeName !== '' ? exchangeName : '<default>';
exports.normalizeExchange = normalizeExchange;
const censorPassword = (url)=>{
    return url.replace(/:[^:@/]*@/, ':***@');
};
const getPort = (portFromUrl, resolvedProtocol)=>{
    // we are using the resolved protocol which is upper case
    // this code mimic the behavior of the amqplib which is used to set connection params
    return portFromUrl || (resolvedProtocol === 'AMQP' ? 5672 : 5671);
};
const getProtocol = (protocolFromUrl)=>{
    const resolvedProtocol = protocolFromUrl || 'amqp';
    // the substring removed the ':' part of the protocol ('amqp:' -> 'amqp')
    const noEndingColon = resolvedProtocol.endsWith(':') ? resolvedProtocol.substring(0, resolvedProtocol.length - 1) : resolvedProtocol;
    // upper cases to match spec
    return noEndingColon.toUpperCase();
};
const getHostname = (hostnameFromUrl)=>{
    // if user supplies empty hostname, it gets forwarded to 'net' package which default it to localhost.
    // https://nodejs.org/docs/latest-v12.x/api/net.html#net_socket_connect_options_connectlistener
    return hostnameFromUrl || 'localhost';
};
const extractConnectionAttributeOrLog = (url, attributeKey, attributeValue, nameForLog)=>{
    if (attributeValue) {
        return {
            [attributeKey]: attributeValue
        };
    } else {
        api_1.diag.error(`amqplib instrumentation: could not extract connection attribute ${nameForLog} from user supplied url`, {
            url
        });
        return {};
    }
};
const getConnectionAttributesFromServer = (conn)=>{
    var _a, _b;
    const product = (_b = (_a = conn.serverProperties.product) === null || _a === void 0 ? void 0 : _a.toLowerCase) === null || _b === void 0 ? void 0 : _b.call(_a);
    if (product) {
        return {
            [semantic_conventions_1.SEMATTRS_MESSAGING_SYSTEM]: product
        };
    } else {
        return {};
    }
};
exports.getConnectionAttributesFromServer = getConnectionAttributesFromServer;
const getConnectionAttributesFromUrl = (url)=>{
    const attributes = {
        [semantic_conventions_1.SEMATTRS_MESSAGING_PROTOCOL_VERSION]: '0.9.1'
    };
    url = url || 'amqp://localhost';
    if (typeof url === 'object') {
        const connectOptions = url;
        const protocol = getProtocol(connectOptions === null || connectOptions === void 0 ? void 0 : connectOptions.protocol);
        Object.assign(attributes, Object.assign({}, extractConnectionAttributeOrLog(url, semantic_conventions_1.SEMATTRS_MESSAGING_PROTOCOL, protocol, 'protocol')));
        const hostname = getHostname(connectOptions === null || connectOptions === void 0 ? void 0 : connectOptions.hostname);
        Object.assign(attributes, Object.assign({}, extractConnectionAttributeOrLog(url, semantic_conventions_1.SEMATTRS_NET_PEER_NAME, hostname, 'hostname')));
        const port = getPort(connectOptions.port, protocol);
        Object.assign(attributes, Object.assign({}, extractConnectionAttributeOrLog(url, semantic_conventions_1.SEMATTRS_NET_PEER_PORT, port, 'port')));
    } else {
        const censoredUrl = censorPassword(url);
        attributes[semantic_conventions_1.SEMATTRS_MESSAGING_URL] = censoredUrl;
        try {
            const urlParts = new URL(censoredUrl);
            const protocol = getProtocol(urlParts.protocol);
            Object.assign(attributes, Object.assign({}, extractConnectionAttributeOrLog(censoredUrl, semantic_conventions_1.SEMATTRS_MESSAGING_PROTOCOL, protocol, 'protocol')));
            const hostname = getHostname(urlParts.hostname);
            Object.assign(attributes, Object.assign({}, extractConnectionAttributeOrLog(censoredUrl, semantic_conventions_1.SEMATTRS_NET_PEER_NAME, hostname, 'hostname')));
            const port = getPort(urlParts.port ? parseInt(urlParts.port) : undefined, protocol);
            Object.assign(attributes, Object.assign({}, extractConnectionAttributeOrLog(censoredUrl, semantic_conventions_1.SEMATTRS_NET_PEER_PORT, port, 'port')));
        } catch (err) {
            api_1.diag.error('amqplib instrumentation: error while extracting connection details from connection url', {
                censoredUrl,
                err
            });
        }
    }
    return attributes;
};
exports.getConnectionAttributesFromUrl = getConnectionAttributesFromUrl;
const markConfirmChannelTracing = (context)=>{
    return context.setValue(IS_CONFIRM_CHANNEL_CONTEXT_KEY, true);
};
exports.markConfirmChannelTracing = markConfirmChannelTracing;
const unmarkConfirmChannelTracing = (context)=>{
    return context.deleteValue(IS_CONFIRM_CHANNEL_CONTEXT_KEY);
};
exports.unmarkConfirmChannelTracing = unmarkConfirmChannelTracing;
const isConfirmChannelTracing = (context)=>{
    return context.getValue(IS_CONFIRM_CHANNEL_CONTEXT_KEY) === true;
};
exports.isConfirmChannelTracing = isConfirmChannelTracing;
}),
"[project]/node_modules/@opentelemetry/instrumentation-amqplib/build/src/version.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PACKAGE_NAME = exports.PACKAGE_VERSION = void 0;
// this is autogenerated file, see scripts/version-update.js
exports.PACKAGE_VERSION = '0.46.1';
exports.PACKAGE_NAME = '@opentelemetry/instrumentation-amqplib';
}),
"[project]/node_modules/@opentelemetry/instrumentation-amqplib/build/src/amqplib.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AmqplibInstrumentation = void 0;
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const api_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const core_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/core/build/esm/index.js [app-route] (ecmascript)");
const instrumentation_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation/build/esm/index.js [app-route] (ecmascript)");
const semantic_conventions_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/semantic-conventions/build/esm/index.js [app-route] (ecmascript)");
const types_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-amqplib/build/src/types.js [app-route] (ecmascript)");
const utils_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-amqplib/build/src/utils.js [app-route] (ecmascript)");
/** @knipignore */ const version_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-amqplib/build/src/version.js [app-route] (ecmascript)");
const supportedVersions = [
    '>=0.5.5 <1'
];
class AmqplibInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}){
        super(version_1.PACKAGE_NAME, version_1.PACKAGE_VERSION, Object.assign(Object.assign({}, types_1.DEFAULT_CONFIG), config));
    }
    setConfig(config = {}) {
        super.setConfig(Object.assign(Object.assign({}, types_1.DEFAULT_CONFIG), config));
    }
    init() {
        const channelModelModuleFile = new instrumentation_1.InstrumentationNodeModuleFile('amqplib/lib/channel_model.js', supportedVersions, this.patchChannelModel.bind(this), this.unpatchChannelModel.bind(this));
        const callbackModelModuleFile = new instrumentation_1.InstrumentationNodeModuleFile('amqplib/lib/callback_model.js', supportedVersions, this.patchChannelModel.bind(this), this.unpatchChannelModel.bind(this));
        const connectModuleFile = new instrumentation_1.InstrumentationNodeModuleFile('amqplib/lib/connect.js', supportedVersions, this.patchConnect.bind(this), this.unpatchConnect.bind(this));
        const module = new instrumentation_1.InstrumentationNodeModuleDefinition('amqplib', supportedVersions, undefined, undefined, [
            channelModelModuleFile,
            connectModuleFile,
            callbackModelModuleFile
        ]);
        return module;
    }
    patchConnect(moduleExports) {
        moduleExports = this.unpatchConnect(moduleExports);
        if (!(0, instrumentation_1.isWrapped)(moduleExports.connect)) {
            this._wrap(moduleExports, 'connect', this.getConnectPatch.bind(this));
        }
        return moduleExports;
    }
    unpatchConnect(moduleExports) {
        if ((0, instrumentation_1.isWrapped)(moduleExports.connect)) {
            this._unwrap(moduleExports, 'connect');
        }
        return moduleExports;
    }
    patchChannelModel(moduleExports, moduleVersion) {
        if (!(0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.publish)) {
            this._wrap(moduleExports.Channel.prototype, 'publish', this.getPublishPatch.bind(this, moduleVersion));
        }
        if (!(0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.consume)) {
            this._wrap(moduleExports.Channel.prototype, 'consume', this.getConsumePatch.bind(this, moduleVersion));
        }
        if (!(0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.ack)) {
            this._wrap(moduleExports.Channel.prototype, 'ack', this.getAckPatch.bind(this, false, types_1.EndOperation.Ack));
        }
        if (!(0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.nack)) {
            this._wrap(moduleExports.Channel.prototype, 'nack', this.getAckPatch.bind(this, true, types_1.EndOperation.Nack));
        }
        if (!(0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.reject)) {
            this._wrap(moduleExports.Channel.prototype, 'reject', this.getAckPatch.bind(this, true, types_1.EndOperation.Reject));
        }
        if (!(0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.ackAll)) {
            this._wrap(moduleExports.Channel.prototype, 'ackAll', this.getAckAllPatch.bind(this, false, types_1.EndOperation.AckAll));
        }
        if (!(0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.nackAll)) {
            this._wrap(moduleExports.Channel.prototype, 'nackAll', this.getAckAllPatch.bind(this, true, types_1.EndOperation.NackAll));
        }
        if (!(0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.emit)) {
            this._wrap(moduleExports.Channel.prototype, 'emit', this.getChannelEmitPatch.bind(this));
        }
        if (!(0, instrumentation_1.isWrapped)(moduleExports.ConfirmChannel.prototype.publish)) {
            this._wrap(moduleExports.ConfirmChannel.prototype, 'publish', this.getConfirmedPublishPatch.bind(this, moduleVersion));
        }
        return moduleExports;
    }
    unpatchChannelModel(moduleExports) {
        if ((0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.publish)) {
            this._unwrap(moduleExports.Channel.prototype, 'publish');
        }
        if ((0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.consume)) {
            this._unwrap(moduleExports.Channel.prototype, 'consume');
        }
        if ((0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.ack)) {
            this._unwrap(moduleExports.Channel.prototype, 'ack');
        }
        if ((0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.nack)) {
            this._unwrap(moduleExports.Channel.prototype, 'nack');
        }
        if ((0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.reject)) {
            this._unwrap(moduleExports.Channel.prototype, 'reject');
        }
        if ((0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.ackAll)) {
            this._unwrap(moduleExports.Channel.prototype, 'ackAll');
        }
        if ((0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.nackAll)) {
            this._unwrap(moduleExports.Channel.prototype, 'nackAll');
        }
        if ((0, instrumentation_1.isWrapped)(moduleExports.Channel.prototype.emit)) {
            this._unwrap(moduleExports.Channel.prototype, 'emit');
        }
        if ((0, instrumentation_1.isWrapped)(moduleExports.ConfirmChannel.prototype.publish)) {
            this._unwrap(moduleExports.ConfirmChannel.prototype, 'publish');
        }
        return moduleExports;
    }
    getConnectPatch(original) {
        return function patchedConnect(url, socketOptions, openCallback) {
            return original.call(this, url, socketOptions, function(err, conn) {
                if (err == null) {
                    const urlAttributes = (0, utils_1.getConnectionAttributesFromUrl)(url);
                    // the type of conn in @types/amqplib is amqp.Connection, but in practice the library send the
                    // `serverProperties` on the `conn` and not in a property `connection`.
                    // I don't have capacity to debug it currently but it should probably be fixed in @types or
                    // in the package itself
                    // currently setting as any to calm typescript
                    const serverAttributes = (0, utils_1.getConnectionAttributesFromServer)(conn);
                    conn[utils_1.CONNECTION_ATTRIBUTES] = Object.assign(Object.assign({}, urlAttributes), serverAttributes);
                }
                openCallback.apply(this, arguments);
            });
        };
    }
    getChannelEmitPatch(original) {
        const self = this;
        return function emit(eventName) {
            if (eventName === 'close') {
                self.endAllSpansOnChannel(this, true, types_1.EndOperation.ChannelClosed, undefined);
                const activeTimer = this[utils_1.CHANNEL_CONSUME_TIMEOUT_TIMER];
                if (activeTimer) {
                    clearInterval(activeTimer);
                }
                this[utils_1.CHANNEL_CONSUME_TIMEOUT_TIMER] = undefined;
            } else if (eventName === 'error') {
                self.endAllSpansOnChannel(this, true, types_1.EndOperation.ChannelError, undefined);
            }
            return original.apply(this, arguments);
        };
    }
    getAckAllPatch(isRejected, endOperation, original) {
        const self = this;
        return function ackAll(requeueOrEmpty) {
            self.endAllSpansOnChannel(this, isRejected, endOperation, requeueOrEmpty);
            return original.apply(this, arguments);
        };
    }
    getAckPatch(isRejected, endOperation, original) {
        const self = this;
        return function ack(message, allUpToOrRequeue, requeue) {
            var _a;
            const channel = this;
            // we use this patch in reject function as well, but it has different signature
            const requeueResolved = endOperation === types_1.EndOperation.Reject ? allUpToOrRequeue : requeue;
            const spansNotEnded = (_a = channel[utils_1.CHANNEL_SPANS_NOT_ENDED]) !== null && _a !== void 0 ? _a : [];
            const msgIndex = spansNotEnded.findIndex((msgDetails)=>msgDetails.msg === message);
            if (msgIndex < 0) {
                // should not happen in happy flow
                // but possible if user is calling the api function ack twice with same message
                self.endConsumerSpan(message, isRejected, endOperation, requeueResolved);
            } else if (endOperation !== types_1.EndOperation.Reject && allUpToOrRequeue) {
                for(let i = 0; i <= msgIndex; i++){
                    self.endConsumerSpan(spansNotEnded[i].msg, isRejected, endOperation, requeueResolved);
                }
                spansNotEnded.splice(0, msgIndex + 1);
            } else {
                self.endConsumerSpan(message, isRejected, endOperation, requeueResolved);
                spansNotEnded.splice(msgIndex, 1);
            }
            return original.apply(this, arguments);
        };
    }
    getConsumePatch(moduleVersion, original) {
        const self = this;
        return function consume(queue, onMessage, options) {
            const channel = this;
            if (!Object.prototype.hasOwnProperty.call(channel, utils_1.CHANNEL_SPANS_NOT_ENDED)) {
                const { consumeTimeoutMs } = self.getConfig();
                if (consumeTimeoutMs) {
                    const timer = setInterval(()=>{
                        self.checkConsumeTimeoutOnChannel(channel);
                    }, consumeTimeoutMs);
                    timer.unref();
                    channel[utils_1.CHANNEL_CONSUME_TIMEOUT_TIMER] = timer;
                }
                channel[utils_1.CHANNEL_SPANS_NOT_ENDED] = [];
            }
            const patchedOnMessage = function(msg) {
                var _a, _b, _c, _d, _e;
                // msg is expected to be null for signaling consumer cancel notification
                // https://www.rabbitmq.com/consumer-cancel.html
                // in this case, we do not start a span, as this is not a real message.
                if (!msg) {
                    return onMessage.call(this, msg);
                }
                const headers = (_a = msg.properties.headers) !== null && _a !== void 0 ? _a : {};
                let parentContext = api_1.propagation.extract(api_1.ROOT_CONTEXT, headers);
                const exchange = (_b = msg.fields) === null || _b === void 0 ? void 0 : _b.exchange;
                let links;
                if (self._config.useLinksForConsume) {
                    const parentSpanContext = parentContext ? (_c = api_1.trace.getSpan(parentContext)) === null || _c === void 0 ? void 0 : _c.spanContext() : undefined;
                    parentContext = undefined;
                    if (parentSpanContext) {
                        links = [
                            {
                                context: parentSpanContext
                            }
                        ];
                    }
                }
                const span = self.tracer.startSpan(`${queue} process`, {
                    kind: api_1.SpanKind.CONSUMER,
                    attributes: Object.assign(Object.assign({}, (_d = channel === null || channel === void 0 ? void 0 : channel.connection) === null || _d === void 0 ? void 0 : _d[utils_1.CONNECTION_ATTRIBUTES]), {
                        [semantic_conventions_1.SEMATTRS_MESSAGING_DESTINATION]: exchange,
                        [semantic_conventions_1.SEMATTRS_MESSAGING_DESTINATION_KIND]: semantic_conventions_1.MESSAGINGDESTINATIONKINDVALUES_TOPIC,
                        [semantic_conventions_1.SEMATTRS_MESSAGING_RABBITMQ_ROUTING_KEY]: (_e = msg.fields) === null || _e === void 0 ? void 0 : _e.routingKey,
                        [semantic_conventions_1.SEMATTRS_MESSAGING_OPERATION]: semantic_conventions_1.MESSAGINGOPERATIONVALUES_PROCESS,
                        [semantic_conventions_1.SEMATTRS_MESSAGING_MESSAGE_ID]: msg === null || msg === void 0 ? void 0 : msg.properties.messageId,
                        [semantic_conventions_1.SEMATTRS_MESSAGING_CONVERSATION_ID]: msg === null || msg === void 0 ? void 0 : msg.properties.correlationId
                    }),
                    links
                }, parentContext);
                const { consumeHook } = self.getConfig();
                if (consumeHook) {
                    (0, instrumentation_1.safeExecuteInTheMiddle)(()=>consumeHook(span, {
                            moduleVersion,
                            msg
                        }), (e)=>{
                        if (e) {
                            api_1.diag.error('amqplib instrumentation: consumerHook error', e);
                        }
                    }, true);
                }
                if (!(options === null || options === void 0 ? void 0 : options.noAck)) {
                    // store the message on the channel so we can close the span on ackAll etc
                    channel[utils_1.CHANNEL_SPANS_NOT_ENDED].push({
                        msg,
                        timeOfConsume: (0, core_1.hrTime)()
                    });
                    // store the span on the message, so we can end it when user call 'ack' on it
                    msg[utils_1.MESSAGE_STORED_SPAN] = span;
                }
                const setContext = parentContext ? parentContext : api_1.ROOT_CONTEXT;
                api_1.context.with(api_1.trace.setSpan(setContext, span), ()=>{
                    onMessage.call(this, msg);
                });
                if (options === null || options === void 0 ? void 0 : options.noAck) {
                    self.callConsumeEndHook(span, msg, false, types_1.EndOperation.AutoAck);
                    span.end();
                }
            };
            arguments[1] = patchedOnMessage;
            return original.apply(this, arguments);
        };
    }
    getConfirmedPublishPatch(moduleVersion, original) {
        const self = this;
        return function confirmedPublish(exchange, routingKey, content, options, callback) {
            const channel = this;
            const { span, modifiedOptions } = self.createPublishSpan(self, exchange, routingKey, channel, options);
            const { publishHook } = self.getConfig();
            if (publishHook) {
                (0, instrumentation_1.safeExecuteInTheMiddle)(()=>publishHook(span, {
                        moduleVersion,
                        exchange,
                        routingKey,
                        content,
                        options: modifiedOptions,
                        isConfirmChannel: true
                    }), (e)=>{
                    if (e) {
                        api_1.diag.error('amqplib instrumentation: publishHook error', e);
                    }
                }, true);
            }
            const patchedOnConfirm = function(err, ok) {
                try {
                    callback === null || callback === void 0 ? void 0 : callback.call(this, err, ok);
                } finally{
                    const { publishConfirmHook } = self.getConfig();
                    if (publishConfirmHook) {
                        (0, instrumentation_1.safeExecuteInTheMiddle)(()=>publishConfirmHook(span, {
                                moduleVersion,
                                exchange,
                                routingKey,
                                content,
                                options,
                                isConfirmChannel: true,
                                confirmError: err
                            }), (e)=>{
                            if (e) {
                                api_1.diag.error('amqplib instrumentation: publishConfirmHook error', e);
                            }
                        }, true);
                    }
                    if (err) {
                        span.setStatus({
                            code: api_1.SpanStatusCode.ERROR,
                            message: "message confirmation has been nack'ed"
                        });
                    }
                    span.end();
                }
            };
            // calling confirm channel publish function is storing the message in queue and registering the callback for broker confirm.
            // span ends in the patched callback.
            const markedContext = (0, utils_1.markConfirmChannelTracing)(api_1.context.active());
            const argumentsCopy = [
                ...arguments
            ];
            argumentsCopy[3] = modifiedOptions;
            argumentsCopy[4] = api_1.context.bind((0, utils_1.unmarkConfirmChannelTracing)(api_1.trace.setSpan(markedContext, span)), patchedOnConfirm);
            return api_1.context.with(markedContext, original.bind(this, ...argumentsCopy));
        };
    }
    getPublishPatch(moduleVersion, original) {
        const self = this;
        return function publish(exchange, routingKey, content, options) {
            if ((0, utils_1.isConfirmChannelTracing)(api_1.context.active())) {
                // work already done
                return original.apply(this, arguments);
            } else {
                const channel = this;
                const { span, modifiedOptions } = self.createPublishSpan(self, exchange, routingKey, channel, options);
                const { publishHook } = self.getConfig();
                if (publishHook) {
                    (0, instrumentation_1.safeExecuteInTheMiddle)(()=>publishHook(span, {
                            moduleVersion,
                            exchange,
                            routingKey,
                            content,
                            options: modifiedOptions,
                            isConfirmChannel: false
                        }), (e)=>{
                        if (e) {
                            api_1.diag.error('amqplib instrumentation: publishHook error', e);
                        }
                    }, true);
                }
                // calling normal channel publish function is only storing the message in queue.
                // it does not send it and waits for an ack, so the span duration is expected to be very short.
                const argumentsCopy = [
                    ...arguments
                ];
                argumentsCopy[3] = modifiedOptions;
                const originalRes = original.apply(this, argumentsCopy);
                span.end();
                return originalRes;
            }
        };
    }
    createPublishSpan(self, exchange, routingKey, channel, options) {
        var _a;
        const normalizedExchange = (0, utils_1.normalizeExchange)(exchange);
        const span = self.tracer.startSpan(`publish ${normalizedExchange}`, {
            kind: api_1.SpanKind.PRODUCER,
            attributes: Object.assign(Object.assign({}, channel.connection[utils_1.CONNECTION_ATTRIBUTES]), {
                [semantic_conventions_1.SEMATTRS_MESSAGING_DESTINATION]: exchange,
                [semantic_conventions_1.SEMATTRS_MESSAGING_DESTINATION_KIND]: semantic_conventions_1.MESSAGINGDESTINATIONKINDVALUES_TOPIC,
                [semantic_conventions_1.SEMATTRS_MESSAGING_RABBITMQ_ROUTING_KEY]: routingKey,
                [semantic_conventions_1.SEMATTRS_MESSAGING_MESSAGE_ID]: options === null || options === void 0 ? void 0 : options.messageId,
                [semantic_conventions_1.SEMATTRS_MESSAGING_CONVERSATION_ID]: options === null || options === void 0 ? void 0 : options.correlationId
            })
        });
        const modifiedOptions = options !== null && options !== void 0 ? options : {};
        modifiedOptions.headers = (_a = modifiedOptions.headers) !== null && _a !== void 0 ? _a : {};
        api_1.propagation.inject(api_1.trace.setSpan(api_1.context.active(), span), modifiedOptions.headers);
        return {
            span,
            modifiedOptions
        };
    }
    endConsumerSpan(message, isRejected, operation, requeue) {
        const storedSpan = message[utils_1.MESSAGE_STORED_SPAN];
        if (!storedSpan) return;
        if (isRejected !== false) {
            storedSpan.setStatus({
                code: api_1.SpanStatusCode.ERROR,
                message: operation !== types_1.EndOperation.ChannelClosed && operation !== types_1.EndOperation.ChannelError ? `${operation} called on message${requeue === true ? ' with requeue' : requeue === false ? ' without requeue' : ''}` : operation
            });
        }
        this.callConsumeEndHook(storedSpan, message, isRejected, operation);
        storedSpan.end();
        message[utils_1.MESSAGE_STORED_SPAN] = undefined;
    }
    endAllSpansOnChannel(channel, isRejected, operation, requeue) {
        var _a;
        const spansNotEnded = (_a = channel[utils_1.CHANNEL_SPANS_NOT_ENDED]) !== null && _a !== void 0 ? _a : [];
        spansNotEnded.forEach((msgDetails)=>{
            this.endConsumerSpan(msgDetails.msg, isRejected, operation, requeue);
        });
        channel[utils_1.CHANNEL_SPANS_NOT_ENDED] = [];
    }
    callConsumeEndHook(span, msg, rejected, endOperation) {
        const { consumeEndHook } = this.getConfig();
        if (!consumeEndHook) return;
        (0, instrumentation_1.safeExecuteInTheMiddle)(()=>consumeEndHook(span, {
                msg,
                rejected,
                endOperation
            }), (e)=>{
            if (e) {
                api_1.diag.error('amqplib instrumentation: consumerEndHook error', e);
            }
        }, true);
    }
    checkConsumeTimeoutOnChannel(channel) {
        var _a;
        const currentTime = (0, core_1.hrTime)();
        const spansNotEnded = (_a = channel[utils_1.CHANNEL_SPANS_NOT_ENDED]) !== null && _a !== void 0 ? _a : [];
        let i;
        const { consumeTimeoutMs } = this.getConfig();
        for(i = 0; i < spansNotEnded.length; i++){
            const currMessage = spansNotEnded[i];
            const timeFromConsume = (0, core_1.hrTimeDuration)(currMessage.timeOfConsume, currentTime);
            if ((0, core_1.hrTimeToMilliseconds)(timeFromConsume) < consumeTimeoutMs) {
                break;
            }
            this.endConsumerSpan(currMessage.msg, null, types_1.EndOperation.InstrumentationTimeout, true);
        }
        spansNotEnded.splice(0, i);
    }
}
exports.AmqplibInstrumentation = AmqplibInstrumentation;
}),
"[project]/node_modules/@opentelemetry/instrumentation-amqplib/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
            return m[k];
        }
    });
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ __exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-amqplib/build/src/amqplib.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/node_modules/@opentelemetry/instrumentation-amqplib/build/src/types.js [app-route] (ecmascript)"), exports);
}),
"[project]/node_modules/@opentelemetry/resources/build/esm/platform/node/default-service-name.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ __turbopack_context__.s([
    "defaultServiceName",
    ()=>defaultServiceName
]);
function defaultServiceName() {
    return "unknown_service:" + process.argv0;
}
}),
"[project]/node_modules/@opentelemetry/resources/build/esm/Resource.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Resource",
    ()=>Resource
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/api/build/esm/diag-api.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$resources$2f$node_modules$2f40$opentelemetry$2f$semantic$2d$conventions$2f$build$2f$esm$2f$resource$2f$SemanticResourceAttributes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/resources/node_modules/@opentelemetry/semantic-conventions/build/esm/resource/SemanticResourceAttributes.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$platform$2f$node$2f$sdk$2d$info$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/core/build/esm/platform/node/sdk-info.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$resources$2f$build$2f$esm$2f$platform$2f$node$2f$default$2d$service$2d$name$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@opentelemetry/resources/build/esm/platform/node/default-service-name.js [app-route] (ecmascript)");
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var __assign = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__assign || function() {
    __assign = Object.assign || function(t) {
        for(var s, i = 1, n = arguments.length; i < n; i++){
            s = arguments[i];
            for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
        });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__generator || function(thisArg, body) {
    var _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    }, f, y, t, g;
    return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    //TURBOPACK unreachable
    ;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(_)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
};
var __read = ("TURBOPACK compile-time value", void 0) && ("TURBOPACK compile-time value", void 0).__read || function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while((n === void 0 || n-- > 0) && !(r = i.next()).done)ar.push(r.value);
    } catch (error) {
        e = {
            error: error
        };
    } finally{
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        } finally{
            if (e) throw e.error;
        }
    }
    return ar;
};
;
;
;
;
/**
 * A Resource describes the entity for which a signals (metrics or trace) are
 * collected.
 */ var Resource = function() {
    function Resource(/**
     * A dictionary of attributes with string keys and values that provide
     * information about the entity as numbers, strings or booleans
     * TODO: Consider to add check/validation on attributes.
     */ attributes, asyncAttributesPromise) {
        var _this = this;
        var _a;
        this._attributes = attributes;
        this.asyncAttributesPending = asyncAttributesPromise != null;
        this._syncAttributes = (_a = this._attributes) !== null && _a !== void 0 ? _a : {};
        this._asyncAttributesPromise = asyncAttributesPromise === null || asyncAttributesPromise === void 0 ? void 0 : asyncAttributesPromise.then(function(asyncAttributes) {
            _this._attributes = Object.assign({}, _this._attributes, asyncAttributes);
            _this.asyncAttributesPending = false;
            return asyncAttributes;
        }, function(err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].debug("a resource's async attributes promise rejected: %s", err);
            _this.asyncAttributesPending = false;
            return {};
        });
    }
    /**
     * Returns an empty Resource
     */ Resource.empty = function() {
        return Resource.EMPTY;
    };
    /**
     * Returns a Resource that identifies the SDK in use.
     */ Resource.default = function() {
        var _a;
        return new Resource((_a = {}, _a[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$resources$2f$node_modules$2f40$opentelemetry$2f$semantic$2d$conventions$2f$build$2f$esm$2f$resource$2f$SemanticResourceAttributes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SEMRESATTRS_SERVICE_NAME"]] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$resources$2f$build$2f$esm$2f$platform$2f$node$2f$default$2d$service$2d$name$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["defaultServiceName"])(), _a[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$resources$2f$node_modules$2f40$opentelemetry$2f$semantic$2d$conventions$2f$build$2f$esm$2f$resource$2f$SemanticResourceAttributes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SEMRESATTRS_TELEMETRY_SDK_LANGUAGE"]] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$platform$2f$node$2f$sdk$2d$info$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SDK_INFO"][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$resources$2f$node_modules$2f40$opentelemetry$2f$semantic$2d$conventions$2f$build$2f$esm$2f$resource$2f$SemanticResourceAttributes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SEMRESATTRS_TELEMETRY_SDK_LANGUAGE"]], _a[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$resources$2f$node_modules$2f40$opentelemetry$2f$semantic$2d$conventions$2f$build$2f$esm$2f$resource$2f$SemanticResourceAttributes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SEMRESATTRS_TELEMETRY_SDK_NAME"]] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$platform$2f$node$2f$sdk$2d$info$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SDK_INFO"][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$resources$2f$node_modules$2f40$opentelemetry$2f$semantic$2d$conventions$2f$build$2f$esm$2f$resource$2f$SemanticResourceAttributes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SEMRESATTRS_TELEMETRY_SDK_NAME"]], _a[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$resources$2f$node_modules$2f40$opentelemetry$2f$semantic$2d$conventions$2f$build$2f$esm$2f$resource$2f$SemanticResourceAttributes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SEMRESATTRS_TELEMETRY_SDK_VERSION"]] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$core$2f$build$2f$esm$2f$platform$2f$node$2f$sdk$2d$info$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SDK_INFO"][__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$resources$2f$node_modules$2f40$opentelemetry$2f$semantic$2d$conventions$2f$build$2f$esm$2f$resource$2f$SemanticResourceAttributes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SEMRESATTRS_TELEMETRY_SDK_VERSION"]], _a));
    };
    Object.defineProperty(Resource.prototype, "attributes", {
        get: function() {
            var _a;
            if (this.asyncAttributesPending) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$opentelemetry$2f$api$2f$build$2f$esm$2f$diag$2d$api$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["diag"].error('Accessing resource attributes before async attributes settled');
            }
            return (_a = this._attributes) !== null && _a !== void 0 ? _a : {};
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns a promise that will never be rejected. Resolves when all async attributes have finished being added to
     * this Resource's attributes. This is useful in exporters to block until resource detection
     * has finished.
     */ Resource.prototype.waitForAsyncAttributes = function() {
        return __awaiter(this, void 0, void 0, function() {
            return __generator(this, function(_a) {
                switch(_a.label){
                    case 0:
                        if (!this.asyncAttributesPending) return [
                            3 /*break*/ ,
                            2
                        ];
                        return [
                            4 /*yield*/ ,
                            this._asyncAttributesPromise
                        ];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        return [
                            2 /*return*/ 
                        ];
                }
            });
        });
    };
    /**
     * Returns a new, merged {@link Resource} by merging the current Resource
     * with the other Resource. In case of a collision, other Resource takes
     * precedence.
     *
     * @param other the Resource that will be merged with this.
     * @returns the newly merged Resource.
     */ Resource.prototype.merge = function(other) {
        var _this = this;
        var _a;
        if (!other) return this;
        // SpanAttributes from other resource overwrite attributes from this resource.
        var mergedSyncAttributes = __assign(__assign({}, this._syncAttributes), (_a = other._syncAttributes) !== null && _a !== void 0 ? _a : other.attributes);
        if (!this._asyncAttributesPromise && !other._asyncAttributesPromise) {
            return new Resource(mergedSyncAttributes);
        }
        var mergedAttributesPromise = Promise.all([
            this._asyncAttributesPromise,
            other._asyncAttributesPromise
        ]).then(function(_a) {
            var _b;
            var _c = __read(_a, 2), thisAsyncAttributes = _c[0], otherAsyncAttributes = _c[1];
            return __assign(__assign(__assign(__assign({}, _this._syncAttributes), thisAsyncAttributes), (_b = other._syncAttributes) !== null && _b !== void 0 ? _b : other.attributes), otherAsyncAttributes);
        });
        return new Resource(mergedSyncAttributes, mergedAttributesPromise);
    };
    Resource.EMPTY = new Resource({});
    return Resource;
}();
;
}),
"[project]/node_modules/@opentelemetry/context-async-hooks/build/src/AbstractAsyncHooksContextManager.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AbstractAsyncHooksContextManager = void 0;
const events_1 = __turbopack_context__.r("[externals]/events [external] (events, cjs)");
const ADD_LISTENER_METHODS = [
    'addListener',
    'on',
    'once',
    'prependListener',
    'prependOnceListener'
];
class AbstractAsyncHooksContextManager {
    constructor(){
        this._kOtListeners = Symbol('OtListeners');
        this._wrapped = false;
    }
    /**
     * Binds a the certain context or the active one to the target function and then returns the target
     * @param context A context (span) to be bind to target
     * @param target a function or event emitter. When target or one of its callbacks is called,
     *  the provided context will be used as the active context for the duration of the call.
     */ bind(context, target) {
        if (target instanceof events_1.EventEmitter) {
            return this._bindEventEmitter(context, target);
        }
        if (typeof target === 'function') {
            return this._bindFunction(context, target);
        }
        return target;
    }
    _bindFunction(context, target) {
        const manager = this;
        const contextWrapper = function(...args) {
            return manager.with(context, ()=>target.apply(this, args));
        };
        Object.defineProperty(contextWrapper, 'length', {
            enumerable: false,
            configurable: true,
            writable: false,
            value: target.length
        });
        /**
         * It isn't possible to tell Typescript that contextWrapper is the same as T
         * so we forced to cast as any here.
         */ // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return contextWrapper;
    }
    /**
     * By default, EventEmitter call their callback with their context, which we do
     * not want, instead we will bind a specific context to all callbacks that
     * go through it.
     * @param context the context we want to bind
     * @param ee EventEmitter an instance of EventEmitter to patch
     */ _bindEventEmitter(context, ee) {
        const map = this._getPatchMap(ee);
        if (map !== undefined) return ee;
        this._createPatchMap(ee);
        // patch methods that add a listener to propagate context
        ADD_LISTENER_METHODS.forEach((methodName)=>{
            if (ee[methodName] === undefined) return;
            ee[methodName] = this._patchAddListener(ee, ee[methodName], context);
        });
        // patch methods that remove a listener
        if (typeof ee.removeListener === 'function') {
            ee.removeListener = this._patchRemoveListener(ee, ee.removeListener);
        }
        if (typeof ee.off === 'function') {
            ee.off = this._patchRemoveListener(ee, ee.off);
        }
        // patch method that remove all listeners
        if (typeof ee.removeAllListeners === 'function') {
            ee.removeAllListeners = this._patchRemoveAllListeners(ee, ee.removeAllListeners);
        }
        return ee;
    }
    /**
     * Patch methods that remove a given listener so that we match the "patched"
     * version of that listener (the one that propagate context).
     * @param ee EventEmitter instance
     * @param original reference to the patched method
     */ _patchRemoveListener(ee, original) {
        const contextManager = this;
        return function(event, listener) {
            var _a;
            const events = (_a = contextManager._getPatchMap(ee)) === null || _a === void 0 ? void 0 : _a[event];
            if (events === undefined) {
                return original.call(this, event, listener);
            }
            const patchedListener = events.get(listener);
            return original.call(this, event, patchedListener || listener);
        };
    }
    /**
     * Patch methods that remove all listeners so we remove our
     * internal references for a given event.
     * @param ee EventEmitter instance
     * @param original reference to the patched method
     */ _patchRemoveAllListeners(ee, original) {
        const contextManager = this;
        return function(event) {
            const map = contextManager._getPatchMap(ee);
            if (map !== undefined) {
                if (arguments.length === 0) {
                    contextManager._createPatchMap(ee);
                } else if (map[event] !== undefined) {
                    delete map[event];
                }
            }
            return original.apply(this, arguments);
        };
    }
    /**
     * Patch methods on an event emitter instance that can add listeners so we
     * can force them to propagate a given context.
     * @param ee EventEmitter instance
     * @param original reference to the patched method
     * @param [context] context to propagate when calling listeners
     */ _patchAddListener(ee, original, context) {
        const contextManager = this;
        return function(event, listener) {
            /**
             * This check is required to prevent double-wrapping the listener.
             * The implementation for ee.once wraps the listener and calls ee.on.
             * Without this check, we would wrap that wrapped listener.
             * This causes an issue because ee.removeListener depends on the onceWrapper
             * to properly remove the listener. If we wrap their wrapper, we break
             * that detection.
             */ if (contextManager._wrapped) {
                return original.call(this, event, listener);
            }
            let map = contextManager._getPatchMap(ee);
            if (map === undefined) {
                map = contextManager._createPatchMap(ee);
            }
            let listeners = map[event];
            if (listeners === undefined) {
                listeners = new WeakMap();
                map[event] = listeners;
            }
            const patchedListener = contextManager.bind(context, listener);
            // store a weak reference of the user listener to ours
            listeners.set(listener, patchedListener);
            /**
             * See comment at the start of this function for the explanation of this property.
             */ contextManager._wrapped = true;
            try {
                return original.call(this, event, patchedListener);
            } finally{
                contextManager._wrapped = false;
            }
        };
    }
    _createPatchMap(ee) {
        const map = Object.create(null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ee[this._kOtListeners] = map;
        return map;
    }
    _getPatchMap(ee) {
        return ee[this._kOtListeners];
    }
}
exports.AbstractAsyncHooksContextManager = AbstractAsyncHooksContextManager;
}),
"[project]/node_modules/@opentelemetry/context-async-hooks/build/src/AsyncHooksContextManager.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AsyncHooksContextManager = void 0;
const api_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const asyncHooks = __turbopack_context__.r("[externals]/async_hooks [external] (async_hooks, cjs)");
const AbstractAsyncHooksContextManager_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/context-async-hooks/build/src/AbstractAsyncHooksContextManager.js [app-route] (ecmascript)");
class AsyncHooksContextManager extends AbstractAsyncHooksContextManager_1.AbstractAsyncHooksContextManager {
    constructor(){
        super();
        this._contexts = new Map();
        this._stack = [];
        this._asyncHook = asyncHooks.createHook({
            init: this._init.bind(this),
            before: this._before.bind(this),
            after: this._after.bind(this),
            destroy: this._destroy.bind(this),
            promiseResolve: this._destroy.bind(this)
        });
    }
    active() {
        var _a;
        return (_a = this._stack[this._stack.length - 1]) !== null && _a !== void 0 ? _a : api_1.ROOT_CONTEXT;
    }
    with(context, fn, thisArg, ...args) {
        this._enterContext(context);
        try {
            return fn.call(thisArg, ...args);
        } finally{
            this._exitContext();
        }
    }
    enable() {
        this._asyncHook.enable();
        return this;
    }
    disable() {
        this._asyncHook.disable();
        this._contexts.clear();
        this._stack = [];
        return this;
    }
    /**
     * Init hook will be called when userland create a async context, setting the
     * context as the current one if it exist.
     * @param uid id of the async context
     * @param type the resource type
     */ _init(uid, type) {
        // ignore TIMERWRAP as they combine timers with same timeout which can lead to
        // false context propagation. TIMERWRAP has been removed in node 11
        // every timer has it's own `Timeout` resource anyway which is used to propagate
        // context.
        if (type === 'TIMERWRAP') return;
        const context = this._stack[this._stack.length - 1];
        if (context !== undefined) {
            this._contexts.set(uid, context);
        }
    }
    /**
     * Destroy hook will be called when a given context is no longer used so we can
     * remove its attached context.
     * @param uid uid of the async context
     */ _destroy(uid) {
        this._contexts.delete(uid);
    }
    /**
     * Before hook is called just before executing a async context.
     * @param uid uid of the async context
     */ _before(uid) {
        const context = this._contexts.get(uid);
        if (context !== undefined) {
            this._enterContext(context);
        }
    }
    /**
     * After hook is called just after completing the execution of a async context.
     */ _after() {
        this._exitContext();
    }
    /**
     * Set the given context as active
     */ _enterContext(context) {
        this._stack.push(context);
    }
    /**
     * Remove the context at the root of the stack
     */ _exitContext() {
        this._stack.pop();
    }
}
exports.AsyncHooksContextManager = AsyncHooksContextManager;
}),
"[project]/node_modules/@opentelemetry/context-async-hooks/build/src/AsyncLocalStorageContextManager.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AsyncLocalStorageContextManager = void 0;
const api_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/api/build/esm/index.js [app-route] (ecmascript)");
const async_hooks_1 = __turbopack_context__.r("[externals]/async_hooks [external] (async_hooks, cjs)");
const AbstractAsyncHooksContextManager_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/context-async-hooks/build/src/AbstractAsyncHooksContextManager.js [app-route] (ecmascript)");
class AsyncLocalStorageContextManager extends AbstractAsyncHooksContextManager_1.AbstractAsyncHooksContextManager {
    constructor(){
        super();
        this._asyncLocalStorage = new async_hooks_1.AsyncLocalStorage();
    }
    active() {
        var _a;
        return (_a = this._asyncLocalStorage.getStore()) !== null && _a !== void 0 ? _a : api_1.ROOT_CONTEXT;
    }
    with(context, fn, thisArg, ...args) {
        const cb = thisArg == null ? fn : fn.bind(thisArg);
        return this._asyncLocalStorage.run(context, cb, ...args);
    }
    enable() {
        return this;
    }
    disable() {
        this._asyncLocalStorage.disable();
        return this;
    }
}
exports.AsyncLocalStorageContextManager = AsyncLocalStorageContextManager;
}),
"[project]/node_modules/@opentelemetry/context-async-hooks/build/src/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AsyncLocalStorageContextManager = exports.AsyncHooksContextManager = void 0;
var AsyncHooksContextManager_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/context-async-hooks/build/src/AsyncHooksContextManager.js [app-route] (ecmascript)");
Object.defineProperty(exports, "AsyncHooksContextManager", {
    enumerable: true,
    get: function() {
        return AsyncHooksContextManager_1.AsyncHooksContextManager;
    }
});
var AsyncLocalStorageContextManager_1 = __turbopack_context__.r("[project]/node_modules/@opentelemetry/context-async-hooks/build/src/AsyncLocalStorageContextManager.js [app-route] (ecmascript)");
Object.defineProperty(exports, "AsyncLocalStorageContextManager", {
    enumerable: true,
    get: function() {
        return AsyncLocalStorageContextManager_1.AsyncLocalStorageContextManager;
    }
});
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__56bae579._.js.map