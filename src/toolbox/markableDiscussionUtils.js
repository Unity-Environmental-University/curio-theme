/** DOM helpers for the "Mark as done" buttons. */

const DONE_HTML = (id) => '<button class="btn utc-mark-done" data-discussion-done-id="' + id + '" ><i class="utc-icon-checkmark-circle"></i> <span class="mark-done-labels"><span class="visible">Done</span></span></button>';
const EMPTY_HTML = (id) => '<button class="btn" data-discussion-done-id="' + id + '" ><i class="utc-icon-empty"></i> <span class="mark-done-labels"><span class="visible">Mark as done.</span></span></button>';

/**
 * Renders one button per task container. Button i has id `<key>-btn-<i>` and shows Done if that id is in ids.
 * onClick(taskId, buttonElement) is called when a button is clicked.
 */
export function renderMarkButtons(tasks, key, ids, onClick) {
    Array.from(tasks).forEach((task, i) => {
        const id = key + '-btn-' + i;
        task.innerHTML = ids.indexOf(id) > -1 ? DONE_HTML(id) : EMPTY_HTML(id);
        task.querySelector('button').addEventListener('click', (e) => {
            onClick(e.currentTarget.getAttribute('data-discussion-done-id'), e.currentTarget);
        });
    });
}

const DEFAULT_SAVE_MESSAGE = ' Your progress could not be saved. Please try again.';

/** Shows a message beside the button (once). */
export function showMarkSaveError(button, message = DEFAULT_SAVE_MESSAGE) {
    const container = button && button.parentElement;
    if (!container || container.querySelector('.mark-done-error')) return;
    const msg = document.createElement('span');
    msg.className = 'mark-done-error';
    msg.setAttribute('role', 'alert');
    msg.textContent = message;
    container.appendChild(msg);
}

/** Clears a previous message once a save succeeds. */
export function clearMarkSaveError(button) {
    const container = button && button.parentElement;
    const msg = container && container.querySelector('.mark-done-error');
    if (msg) msg.remove();
}
