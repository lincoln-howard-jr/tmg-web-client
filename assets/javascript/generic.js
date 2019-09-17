// initialize api
const tmg = TMG ();
// get logged in user
const initUserInfo = async () => {
  return new Promise (async resolve => {
      try {
          me = await tmg.me ();
      } catch (e) {
          console.log (e);
      }
      resolve ();
  });
}
// set ui components
const initPage = () => {
  if (!me) {
      Array.from (document.querySelectorAll ('.auth-btn')).forEach (e => {
          e.classList.remove ('hidden');
      });
  }
}
(async () => {
  await initUserInfo ();
  initPage ();
}) ();