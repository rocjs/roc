export default class ExtensionError extends Error {
    constructor(message, extension, version, path) {
        super(message);
        this.extension = extension;
        this.version = version;
        this.path = path;
    }

    toString() {
        return `${this.message}\nOccurred in: ${this.extension}${this.version ? `@${this.version}` : ''}`;
    }

    getPath() {
        return this.path;
    }
}
