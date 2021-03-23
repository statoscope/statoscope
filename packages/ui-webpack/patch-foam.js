/* eslint-env node */
module.exports = function (content) {
  return content
    .replace(/\s+a\s*=\s*document,/, ' a=arguments[0],')
    .replace(/X\s*=\s*new\s+Ja/, 'X=new Ja(u)')
    .replace(/d\s*=\s*new\s+Ja/, 'd=new Ja(a)');
};
