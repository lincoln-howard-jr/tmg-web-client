// get logged in user's cause
let myCause;
const getMyCause = async () => {
  return new Promise (async (resolve) => {
    try {
      myCause = await tmg.getMyCause ();
    } catch (e) {
      console.log (e);
    }
    resolve ();
  });
}
const upateMyCause = async (cause) => {
  return new Promise (async (resolve) => {
    try {
      let result = await tmg.updateMyCause (cause);
      resolve ([null, result]);
    } catch (e) {
      resolve ([e, null]);
    }
  });
}
// dom connectors
let titleInput, actionPlanInput, submitBtn;
// upload action plan
const handleSubmit = async () => {
  return new Promise (async (resolve) => {
    try {
      let data = {
        title: titleInput.value,
        actionPlan: actionPlanInput.value
      }
      let [err, result] = await updateMyCause ();
      console.log (data, err, result);
      window.reload ();
    } catch (e) {
      resolve ([e, null]);
    }
  });
}
// run main method
window.addEventListener ('DOMContentLoaded', async () => {
  titleInput = document.querySelector ('#title-input');
  actionPlanInput = document.querySelector ('#action-plan-input');
  submitBtn = document.querySelector ('#submit-btn');
  await getMyCause ();
  submitBtn.addEventListener ('click', handleSubmit);
  if (!myCause) location.href = '/login.html';
  titleInput.value = myCause.title || '';
  actionPlanInput.innerText = myCause.actionPlan || '';
  submitBtn.addEventListener ('click', async () => {
    try {
      let cause = {
        title: titleInput.value,
        actionPlan: actionPlanInput.value
      }
      myCause = await upateMyCause (cause);
    } catch (e) {
      console.log (e);
      alert ('Unable to update cause');
    }
  });

});