module.exports = () => {
    Boolean.prototype.humanize = function () {
        if (this) {
            return "enabled";
        } else {
            return "disabled";
        }
    }

    String.prototype.capitalize = function () {
        return this.charAt(0).toUpperCase() + this.slice(1)
    }

    String.prototype.format = function format() {
        let original = this.toString();
        if (!arguments.length) return original;
        const type = typeof arguments[0], options = type === "string" || type === "number" ? Array.prototype.slice.call(arguments) : arguments[0];
        for (const text in options) original = original.replace(new RegExp(`\\{${text}\\}`, "gi"), options[text]);
        return original;
    };
}