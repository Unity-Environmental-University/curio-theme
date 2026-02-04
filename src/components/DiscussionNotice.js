const aiPhrase=`Please do not copy or upload peer work (such as discussion posts or \
assignments for peer review) into generative AI tools. Just as your work is your own, \ 
your peers' work is theirs and they have not given permission to use their work \
in this way`;

const replyPhrase='In most Unity DE Discussions, you must post your own initial response \
to the prompt before you will be able to view and/or respond to your peers’ posts.';

const craftDiscussionNotice = (texts = [replyPhrase, aiPhrase]) => `
    <div className="scaffold-media-box cbt-content cbt-discussion-boilerplate" data-context-menu="insert delete"
         editable="false" caninsert="false" data-canhavechild="true">
        <div class="cbt-callout-box">
            <p><strong>
                ${texts.join("<br><br>")}
            </strong></p>
        </div>
    </div>`

export const AIDiscussionNotice = craftDiscussionNotice([aiPhrase]);

export const replyDiscussionNotice = craftDiscussionNotice([replyPhrase]);

export const DiscussionNotice = craftDiscussionNotice();