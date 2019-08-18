const _el = (str='div', parent, txt) => {
  let arr = str.split ('.');
  let ret = document.createElement (arr.splice (0, 1) [0]);
  arr.forEach (cn => ret.classList.add (cn));
  if (txt) ret.innerText = txt;
  if (parent) parent.appendChild (ret);
  return ret;
}

const createCommentBox = (parent, _type, _id) => {
    let commentBox = _el ('textarea.comment-box', parent);
    let alert = _el ('p.comment-box-alert', parent, 'Commenting on main thread');
    let type = _type;
    let id = _id;
    commentBox.addEventListener ('keypress', async (e) => {
        try {
            if (e.keyCode !== 13) return;
            let comment = await tmg.createComment (type, id, commentBox.value);
            commentBox.value = '';
        } catch (e) {
            alert (e);
        }
    });
    const setCommentBoxAlert = (_alert) => {
        alert.innerText = _alert;
    }
    const setCommentBoxId = (_id) => {
        id = _id;
    }
    const setCommentBoxType = (_type) => {
        type = _type;
    }
    return {commentBox, setCommentBoxId, setCommentBoxType, setCommentBoxAlert};
}

const tmg = TMG ();
const causeList = document.querySelector ('#proposal-list');
const forumsList = document.querySelector ('#forum-list');
const logoutButton = document.querySelector ('#logout-btn');
logoutButton.addEventListener ('click', async (e) => {
    try {
        await tmg.logout ();
    } catch (e) {
        alert (e);
    }
});
(async () => {
  try {
      // selected cause ui
      const keys = 'title actionPlan founder'.split (' ');
      const defaultCause = {title: '', actionPlan: '', founder: '', likeCount: ''};
      const selectedCauseUI = keys.reduce ((acc, val) => {
          acc [val] = document.querySelector (`#selected-${val}`);
          return acc;
      }, {});
      const setSelectedCauseUI = (cause=defaultCause) => {
          keys.forEach (k => selectedCauseUI [k].innerText = cause [k] );
      }
      // setup for elections
      const currElection = await tmg.getElection ();
      const currCauses = await tmg.getCauses ();
      let selectedCause = null;
      let causeUIElements = currCauses.map (cause => {
          //
          cause.founder = `${cause.user.first} ${cause.user.last}`;
          let el = _el('li', causeList);
          let spans = 'title founder'.split (' ').map (cn => _el (`span.${cn}`, el, cause [cn]));
          // add evts
          el.addEventListener ('click', (evt) => {
              if (selectedCause === cause)
                  selectedCause = defaultCause;
              else
                  selectedCause = cause;
              setSelectedCauseUI (selectedCause);
          });
          return el;
      });
        // main elections page
        const forums = await tmg.forums ();
        // create forums section vars
        let setCommentBoxId, setCommentBoxType;
        
        // create comment component for a comment on a parent
        const commentComponent = (comment, parent) => {
            let open = false;
            let subComments = [];
            let commentContainer = _el ('li.comment-container', parent);
            _el ('span', commentContainer, comment.comment);
            _el ('span.italics', commentContainer, `${comment.user.first} ${comment.user.last}`);
            let likeDetails = _el ('span.like-details', commentContainer);
            if (comment.didILike) likeDetails.classList.add ('i-liked');
            _el ('span', likeDetails, comment.likes)
            _el ('i.fa.fa-thumbs-up', likeDetails);
            let commentDetails = _el ('span.comment-details', commentContainer);
            _el ('span', commentDetails, comment.subCommentCount);
            _el ('i.fa.fa-comment', commentDetails);
            let subCommentsList = _el ('ul.comments-list');
            let loadSubComments = async (e) => {
                commentContainer.classList.add ('selected');
                if (!comment.subCommentCount) return;
                try {
                    subComments = await tmg.comments ('comments', comment._id);
                    subComments.map (c => commentComponent (c, subCommentsList));
                    setCommentBoxId (comment._id);
                    setCommentBoxType ('comments');
                    commentContainer.appendChild (subCommentsList);;
                } catch (e) {
                    console.log (e);
                }
            }
            commentDetails.addEventListener ('click', loadSubComments);
        }
        // forums 
        forums.forEach (forum => {
            // create forum container
            let forumContainer = _el ('li.forum-container', forumsList);
            _el ('h3', forumContainer, forum.title);
            // comments list
            let commentsList = _el ('ul.comments-list', forumContainer);
            forum.comments.map (comment => commentComponent (comment, commentsList));
            let cbox = createCommentBox (document.querySelector ('#forum-comment-container'), 'forums', forum._id);
            setCommentBoxId = cbox.setCommentBoxId;
            setCommentBoxType = cbox.setCommentBoxType;
        });
  } catch (e) {
      alert (e);
  }
}) ();