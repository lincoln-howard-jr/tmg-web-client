const createCommentSection = async (listElement, textareaParentElement, commentRoot, commentRootType) => {
  let comments = [], comment_id = commentRoot._id, comment_type = commentRootType, comment_alert;
  // initialize the comment box
  const commentComponent = (comment, parent) => {
      /**
       *  <li class="comment">
       *      <div class="comment-container">
       *          <span class="comment-content">{comment.comment}</span>
       *          <span class="comment-info">
       *              <span class="comment-info-founder">- {comment.user.first} {comment.user.last}</span>
       *              <span class="comment-likes (didIlike ? i-liked)">
       *                  <span>{comment.likes}</span>
       *                  <i class="fa fa-thumbs-up" />
       *              </span>
       *              <span class="comment-open-close">[depends on up and down state]</span>
       *          </span>
       *      </div>
       *      <ul class="comments-list">
       *          <CommentComponent />
       *      </ul>
       *  </li>
       */
      // forum list element
      let _comment = _el ('li.comment', parent);
      // comment container and content
      let _commentContainer = _el ('div.comment-container', _comment);
      _el ('span.comment-content', _commentContainer, comment.comment);
      // comment info
      let _commentInfoParent = _el ('span.comment-info', _commentContainer);
      let _commentInfo = _el ('span', _commentInfoParent);
      _el ('span.comment-info-founder', _commentInfo, `- ${comment.user.first} ${comment.user.last}`);
      // likes
      let _commentLikes = _el ('span.comment-likes', _commentInfo);
      _el ('span', _commentLikes, comment.likes);
      _el ('i.fa.fa-thumbs-up', _commentLikes);
      if (comment.didIlike) {
          _commentLikes.classList.add ('i-liked');
      } else {
          _commentLikes.addEventListener ('click', e => tmg.like ('comments', comment._id));
      }
      // add open handler
      let _commentOpenClose = false;
      if (comment.subCommentCount) {
          _commentOpenClose = _el ('span.comment-open-close', _commentInfo);
          let arrow = _el ('i.fa.fa-chevron-up', _commentOpenClose);
          let open = false;
          _commentOpenClose.addEventListener ('click', e => {
              _comment.classList.toggle ('open');
              arrow.className = 'fa ' + (open ? 'fa-chevron-up' : 'fa-chevron-down');
              open = !open;
          });
      }
      //  add select and open event handlers
      _commentContainer.addEventListener ('click', e => {
          if (_commentLikes.contains (e.target) || (_commentOpenClose && _commentOpenClose.contains (e.target))) return;
          selectComment (_comment, comment)
      });
      // subcomment list
      let subCommentList = _el ('ul.comments-list', _comment);
      // generate subcomment list, if error try again in 30 seconds
      const runSubComments = async () => {
          try {
              subCommentList.innerHTML = '';
              subComments = await tmg.comments ('comments', comment._id);
              subComments.map (subComment => commentComponent (subComment, subCommentList));
          } catch (e) {
              _el ('li', subCommentList, 'error while loading comments')
          }
      }
      runSubComments ();
  }
  // select a comment to comment on
  const selectComment = (_commentComponent, comment) => {
      if (_commentComponent.classList.contains ('selected')) {
          comment_id = commentRoot._id;
          comment_type = commentRootType;
          comment_alert.innerText = 'Commenting on main thread';
      } else {
          Array.from (document.querySelectorAll ('.selected')).forEach (e => e.classList.remove ('selected'));
          comment_id = comment._id;
          comment_type = 'comments';
          comment_alert.innerText = `Commenting on comment by ${comment.user.first} ${comment.user.last}`
      }
      _commentComponent.classList.toggle ('selected');
  }
  // setup comment box
  const initCommentBox = (parent) => {
      let commentBox = _el ('textarea.comment-box', textareaParentElement);
      comment_alert = _el ('p.comment-box-alert', textareaParentElement, 'Commenting on main thread');
      commentBox.addEventListener ('keypress', async (e) => {
          try {
              if (e.keyCode !== 13) return;
              console.log (comment_type, comment_id, commentBox.value);
              await tmg.createComment (comment_type, comment_id, commentBox.value);
              window.location.reload ();
          } catch (e) {
              alert (e);
          }
      });
  }
  try {
    comments = await tmg.comments (commentRootType, commentRoot._id);
    comments.forEach ((c) => {commentComponent (c, listElement)});
    initCommentBox ();
  } catch (e) {
    console.log (e);
  }
}