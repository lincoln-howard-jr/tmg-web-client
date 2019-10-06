// initialize api
const tmg = TMG ();
// construct an element
const _el = (str='div', parent, txt) => {
  let arr = str.split ('.');
  let ret = document.createElement (arr.splice (0, 1) [0]);
  arr.forEach (cn => ret.classList.add (cn));
  if (txt) ret.innerText = txt;
  if (parent) parent.appendChild (ret);
  return ret;
}
// get logged in user
let me, balance;
const initUserInfo = async () => {
  return new Promise (async resolve => {
      try {
          me = await tmg.me ();
          let [err, result] = await tmg.checkGlobalFund ();
          balance = result;
      } catch (e) {
          console.log (e);
      }
      resolve ();
  });
}
// set ui components
const initPage = () => {
  if (!me) {
      Array.from (document.querySelectorAll ('.no-session')).forEach (e => {
          e.classList.remove ('hidden');
      });
  } else {
    document.querySelector ('#session-username').innerText = `${me.first} ${me.last}`;
    document.querySelector ('#global-fund-balance').innerText = `$${balance}`;
    Array.from (document.querySelectorAll ('.has-session')).forEach (e => {
        e.classList.remove ('hidden');
    });
  }
}
window.addEventListener ('DOMContentLoaded', async () => {
  await initUserInfo ();
  initPage ();
});