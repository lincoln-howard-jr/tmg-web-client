// construct an element
const _el = (str='div', parent, txt) => {
  let arr = str.split ('.');
  let ret = document.createElement (arr.splice (0, 1) [0]);
  arr.forEach (cn => ret.classList.add (cn));
  if (txt) ret.innerText = txt;
  if (parent) parent.appendChild (ret);
  return ret;
}

// initialize api
const tmg = TMG ();
let me, forum = {comments: []}, election = {month: {month: '', year: ''}}, causes = [];

// dom connections
const causeList = document.querySelector ('#cause-list');
const forumsList = document.querySelector ('#forum-list');
const logoutButton = document.querySelector ('#logout-btn');

// get forums
const initForums = async () => {
    return new Promise (async resolve => {
        try {
            let forums = await tmg.forums ();
            forum = forums [0];
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
// initialize the comment box
let comment_id, comment_type, comment_alert;
const commentComponent = (comment, parent) => {
    /**
     *  <li class="forum-comment">
     *      <div class="forum-comment-container">
     *          <span class="forum-comment-content">{comment.comment}</span>
     *          <span class="forum-comment-info">
     *              <span class="forum-comment-info-founder">- {comment.user.first} {comment.user.last}</span>
     *              <span class="forum-comment-likes (didIlike ? i-liked)">
     *                  <span>{comment.likes}</span>
     *                  <i class="fa fa-thumbs-up" />
     *              </span>
     *              <span class="forum-comment-open-close">[depends on up and down state]</span>
     *          </span>
     *      </div>
     *      <ul class="forum-comments-list">
     *          <CommentComponent />
     *      </ul>
     *  </li>
     */
    // forum list element
    let forumComment = _el ('li.forum-comment', parent);
    // comment container and content
    let forumCommentContainer = _el ('div.forum-comment-container', forumComment);
    _el ('span.forum-comment-content', forumCommentContainer, comment.comment);
    // comment info
    let forumCommentInfo = _el ('span.forum-comment-info', forumCommentContainer);
    _el ('span.forum-comment-info-founder', forumCommentInfo, `- ${comment.user.first} ${comment.user.last}`);
    // likes
    let forumCommentLikes = _el ('span.forum-comment-likes', forumCommentInfo);
    _el ('span', forumCommentLikes, comment.likes);
    _el ('i.fa.fa-thumbs-up', forumCommentLikes);
    if (comment.didIlike) {
        forumCommentLikes.classList.add ('i-liked');
    } else {
        forumCommentLikes.addEventListener ('click', e => tmg.like ('comments', comment._id));
    }
    // add open handler
    let forumCommentOpenClose = false;
    if (comment.subCommentCount) {
        forumCommentOpenClose = _el ('span.forum-comment-open-close', forumCommentInfo);
        let arrow = _el ('i.fa.fa-chevron-up', forumCommentOpenClose);
        let open = false;
        forumCommentOpenClose.addEventListener ('click', e => {
            forumComment.classList.toggle ('open');
            arrow.className = 'fa ' + (open ? 'fa-chevron-up' : 'fa-chevron-down');
            open = !open;
        });
    }
    //  add select and open event handlers
    forumCommentContainer.addEventListener ('click', e => {
        if (forumCommentLikes.contains (e.target) || forumCommentOpenClose.contains (e.target)) return;
        selectComment (forumComment, comment)
    });
    // subcomment list
    let subCommentList = _el ('ul.forum-comments-list', forumComment);
    // generate subcomment list, if error try again in 30 seconds
    const runSubComments = async () => {
        try {
            subCommentList.innerHTML = '';
            subComments = await tmg.comments ('comments', comment._id);
            subComments.map (subComment => commentComponent (subComment, subCommentList));
        } catch (e) {
            _el ('li', subCommentList, 'error while loading comments')
            setTimeout (runSubComments, 30000);
        }
    }
    runSubComments ();
}
// select a comment to comment on
const selectComment = (commentComponent, comment) => {
    if (commentComponent.classList.contains ('selected')) {
        comment_id = forum._id;
        comment_type = 'forums';
        comment_alert.innerText = 'Commenting on main thread';
    } else {
        Array.from (document.querySelectorAll ('.selected')).forEach (e => e.classList.remove ('selected'));
        comment_id = comment._id;
        comment_type = 'comments';
        comment_alert.innerText = `Commenting on comment by ${comment.user.first} ${comment.user.last}`
    }
    commentComponent.classList.toggle ('selected');
}
// setup comment box
const initCommentBox = () => {
    let commentBox = _el ('textarea.comment-box', document.querySelector ('#forum-create-comment-container'));
    comment_alert = _el ('p.comment-box-alert', document.querySelector ('#forum-create-comment-container'), 'Commenting on main thread');
    commentBox.addEventListener ('keypress', async (e) => {
        try {
            if (e.keyCode !== 13) return;
            await tmg.createComment (comment_type, comment_id, commentBox.value);
            commentBox.value = '';
        } catch (e) {
            alert (e);
        }
    });
}
// init forum section
const initForumSection = () => {
    forum.comments.map (comment => commentComponent (comment, forumsList));
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
     *  <li class="cause-container">
     *      <span class="cause-title"></span>
     *      <span class="cause-likes"></span>
     *      <span class="cause-comments"></span>
     *  </li>
     */
    let causeContainer = _el ('li.cause-container', parent);
    _el ('span.cause-title', causeContainer, cause.title);
    let causeLikes = _el ('span.cause-likes', causeContainer);
    _el ('span', causeLikes, cause.likeCount);
    _el ('i.fa.fa-thumbs-up', causeLikes);
    if (cause.didILike) causeLikes.classList.add ('i-liked');
}
// init cause ui
const initElectionUI = () => {
    let heading = document.querySelector ('#cause-list-heading');
    if (election.phase === 'concluded')
        heading.innerText = `Election for ${election.month.month}/${election.month.year} concluded`;
    if (election.phase === 'prelim')
        heading.innerText = `Preliminary voting open!`;
    if (election.phase === 'intermediate')
        heading.innerText = `Developmental Phase for ${election.month.month}/${election.month.year}`;
    if (election.phase === 'general')
        heading.innerText = 'Time To Vote!';
    let components = causes.map (c => causeComponent (c, causeList));
}
(async () => {
    await initForums ();
    await initElection ();
    initElectionUI ();
    initForumSection ();
    initCommentBox ();
}) ();