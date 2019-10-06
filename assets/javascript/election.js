// initialize data
let forum, comments = [], election = {month: {month: '', year: ''}}, causes = [];

// dom connections
let causeList;
let forumsList;
let logoutButton;

// get forums
const initForums = async () => {
    return new Promise (async resolve => {
        try {
            let forums = await tmg.forums ();
            forum = forums [0];
            comments = await tmg.comments ('forums', forum._id);
        } catch (e) {
            console.log (e);
        }
        resolve ();
    });
}
const initElection = async () => {
    return new Promise (async resolve => {
        try {
            election = await tmg.getElection ();
            causes = await tmg.getCauses ();
            causes = causes.map (cause => {
                return {...cause, founder: `${cause.user.first} ${cause.user.last}`}
            });
        } catch (e) {
            console.log (e);
        }
        resolve ();
    });
}
// init forum section
const initForumSection = () => {
//    comments.map (comment => commentComponent (comment, forumsList));
    createCommentSection (forumsList, document.querySelector ('#forum-create-comment-container'), forum, 'forums');
}
// open selected cause
let selectedCause, defaultCause = {title: '', actionPlan: '', founder: ''};
const selectCause = (cause, component) => {
    selectedCause = cause;
    Array.from (document.querySelectorAll ('.selected-cause')).forEach (cc => cc.classList.remove ('selected-cause'));
    component.classList.add ('selected-cause');
    document.querySelector ('#cause-title').innerText = cause.title;
    document.querySelector ('#cause-action-plan').innerText = cause.actionPlan;
    document.querySelector ('#cause-founder').innerText = cause.founder;
}
// create cause component
// retunrs dismount method
const causeComponent = (cause, parent) => {
    /**
     *  <li class="comment">
     *      <div class="comment-container">
     *          <span class="comment-content">{cause.title}</span>
     *          <span class="comment-info">
    *                  {cause.likeCount}
     *                 <i class="fa fa-thumbs-up" />
     *              </span>
     *          </span>
     *      </div>
     *  </li>
     */
    let causeContainer = _el ('li.comment.passover', parent);
    let causeContent = _el ('div.comment-container', causeContainer);
    _el ('h6.comment-content', causeContent, cause.title);
    let causeInfo = _el ('span.comment-info', causeContent, cause.likeCount);
    _el ('i.fa.fa-thumbs-up', causeInfo);
    causeContainer.addEventListener ('click', () => {
        window.open (`/cause.html?id=${cause._id}`);
    });
}
// init cause ui
const initElectionUI = () => {
    let heading = document.querySelector ('#cause-list-heading');
    if (election.phase === 'concluded') {
        heading.innerText = `Election for ${election.month.month + 1}/${election.month.year} concluded`;
        let resultsPage = _el ('li.text-center', causeList, 'Check out the results ');
        let link = _el ('a', resultsPage, 'here...');
        link.href = `/results?month=${election.month.month}&year=${election.month.year}`;
        link.target = '_blank';
    }
    if (election.phase === 'prelim')
        heading.innerText = `Preliminary voting open!`;
    if (election.phase === 'intermediate')
        heading.innerText = `Developmental Phase for ${election.month.month + 1}/${election.month.year}`;
    if (election.phase === 'general')
        heading.innerText = 'Time To Vote!';
    let components = causes.map (c => causeComponent (c, causeList));
}
window.addEventListener ('DOMContentLoaded', async () => {
    causeList = document.querySelector ('#cause-list');
    forumsList = document.querySelector ('#forum-list');
    logoutButton = document.querySelector ('#logout-btn');
    await initForums ();
    await initElection ();
    initElectionUI ();
    initForumSection ();
});