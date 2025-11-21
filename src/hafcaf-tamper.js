/**
 * Tamper enables you to utilize a very simple template system.
 * @param {string} tmpl
 * @param {{ [key: string]: any; }} values
 * @example
 * // returns "<p>My name is Roasty and I like it toasty.</p>"
 * tamp("<p>My name is {name} and I like it {adjective}</p>", {name: "Roasty", adjective: "toasty"});
 */
const tamp = (tmpl, values) =>
  Object.keys(values).reduce((acc, key) => {
    return acc.replace(new RegExp(`{${key}}`, "g"), values[key]);
  }, tmpl);

export default tamp;
