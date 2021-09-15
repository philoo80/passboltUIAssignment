/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.13.0
 */

import React from "react";
import PropTypes from "prop-types";
import {withAppContext} from "../../../contexts/AppContext";
import Icon from "../../Common/Icons/Icon";
import {withUserWorkspace} from "../../../contexts/UserWorkspaceContext";
import EditUser from "../EditUser/EditUser";
import {withDialog} from "../../../contexts/DialogContext";
import DeleteUser from "../DeleteUser/DeleteUser";
import DeleteUserWithConflicts from "../DeleteUser/DeleteUserWithConflicts";
import NotifyError from "../../Common/Error/NotifyError/NotifyError";
import {withActionFeedback} from "../../../contexts/ActionFeedbackContext";
import ConfirmDisableUserMFA from "../ConfirmDisableUserMFA/ConfirmDisableUserMFA";
import {Trans, withTranslation} from "react-i18next";

/**
 * This component is a container of multiple actions applicable on user
 */
class DisplayUserWorkspaceActions extends React.Component {
  /**
   * Constructor
   * @param {Object} props
   */
  constructor(props) {
    super(props);
    this.state = this.defaultState;
    this.bindCallbacks();
    this.createRefs();
  }

  /**
   * Returns the component default state
   */
  get defaultState() {
    return {
      moreMenuOpen: false // Display flag for the more button menu
    };
  }

  /**
   * Bind callbacks methods
   */
  bindCallbacks() {
    this.handleDocumentClickEvent = this.handleDocumentClickEvent.bind(this);
    this.handleDetailsLockedEvent = this.handleDetailsLockedEvent.bind(this);
    this.handleEditClickEvent = this.handleEditClickEvent.bind(this);
    this.handleDeleteClickEvent = this.handleDeleteClickEvent.bind(this);
    this.handleMoreClickEvent = this.handleMoreClickEvent.bind(this);
    this.handleDisableMfaEvent = this.handleDisableMfaEvent.bind(this);
    this.handleCopyPermalinkEvent = this.handleCopyPermalinkEvent.bind(this);
    this.handleResendInviteClickEvent = this.handleResendInviteClickEvent.bind(this);
  }

  /**
   * Create DOM nodes or React elements references in order to be able to access them programmatically.
   */
  createRefs() {
    this.moreMenuRef = React.createRef();
  }

  /**
   * Whenever the component is mounted
   */
  componentDidMount() {
    document.addEventListener('click', this.handleDocumentClickEvent);
  }

  /**
   * Whenever the component will unmount
   */
  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClickEvent);
  }

  /**
   * Returns true if the current user can delete the current selected user
   */
  get canDelete() {
    const isNotCurrentUser = this.selectedUser && this.props.context.loggedInUser.id !== this.selectedUser.id;
    return !this.isButtonDisabled() && isNotCurrentUser;
  }

  /**
   * Handle view detail click event
   */
  handleDetailsLockedEvent() {
    // lock or unlock the detail resource or folder
    this.props.userWorkspaceContext.onDetailsLocked();
  }

  /**
   * Handle the will of copying the user permalink
   */
  handleCopyPermalinkEvent() {
    this.copyPermalink();
  }

  /**
   * Handle the will of
   */
  handleResendInviteClickEvent() {
    this.resendInvite();
  }

  /**
   * Has lock for the detail display
   * @returns {boolean}
   */
  hasDetailsLocked() {
    return this.props.userWorkspaceContext.details.locked;
  }

  /**
   * Handle edit click event
   */
  handleEditClickEvent() {
    const editUserDialogProps = {
      id: this.selectedUser.id
    };
    this.props.context.setContext({editUserDialogProps});
    this.props.dialogContext.open(EditUser);
  }

  /**
   * Handle delete click event
   */
  async handleDeleteClickEvent() {
    try {
      await this.props.context.port.request("passbolt.users.delete-dry-run", this.selectedUser.id);
      this.displayDeleteUserDialog();
    } catch (error) {
      if (error.name === "DeleteDryRunError") {
        this.displayDeleteUserWithConflictsDialog(error.errors);
      } else {
        this.handleError(error);
      }
    }
  }

  /**
   * Display delete user dialog when there is not conflict to solve
   */
  displayDeleteUserDialog() {
    const deleteUserDialogProps = {
      user: this.selectedUser
    };
    this.props.context.setContext({deleteUserDialogProps});
    this.props.dialogContext.open(DeleteUser);
  }

  /**
   * Display delete user dialog when there is conflict to solve.
   */
  displayDeleteUserWithConflictsDialog(errors) {
    const deleteUserWithConflictsDialogProps = {
      user: this.selectedUser,
      errors: errors,
    };
    this.props.context.setContext({deleteUserWithConflictsDialogProps});
    this.props.dialogContext.open(DeleteUserWithConflicts);
  }

  /**
   * Display error dialog
   * @param error
   */
  handleError(error) {
    const errorDialogProps = {
      title: this.translate("There was an unexpected error..."),
      message: error.message
    };
    this.props.context.setContext({errorDialogProps});
    this.props.dialogContext.open(NotifyError);
  }

  /**
   * Handle the open or close the more menu
   */
  handleMoreClickEvent() {
    this.toggleMoreMenu();
  }

  /**
   * Handle the will of disable MFA for a user
   */
  handleDisableMfaEvent() {
    this.disableMFA();
  }

  /**
   * Handle click events on document. Hide the component if the click occurred outside of the component.
   * @param {ReactEvent} event The event
   */
  handleDocumentClickEvent(event) {
    // Prevent closing when the user click on an element of the menu
    if (this.moreMenuRef.current && this.moreMenuRef.current.contains(event.target)) {
      return;
    }
    this.closeMoreMenu();
  }

  /**
   * Get selected user
   * @returns {user|null}
   */
  get selectedUser() {
    return this.props.userWorkspaceContext.selectedUsers[0];
  }

  /**
   * Returns true if the more actions are available
   */
  get hasMoreActionAllowed() {
    return this.hasOneUserSelected();
  }

  /**
   * Returns true if the current user can copy a user permalink
   */
  get canCopyPermalink() {
    return Boolean(this.selectedUser);
  }

  /**
   * Can the logged in user use the mfa capability.
   */
  get canIUseMfa() {
    return this.props.context.siteSettings.canIUse("multiFactorAuthentication");
  }

  /**
   * Returns true if the current user can disable the MFA of a user
   */
  get canDisableMfaForUser() {
    return this.selectedUser && this.selectedUser.is_mfa_enabled;
  }

  /**
   * Returns true if the logged in user can use the resend capability.
   */
  get canIUseResend() {
    return this.isLoggedInUserAdmin();
  }

  /**
   * Returns true if the logged in user can resend an invite to the user
   */
  get canResendInviteToUser() {
    return this.selectedUser && !this.selectedUser.active;
  }

  /**
   * Check if the users workspace has one user selected.
   * @return {boolean}
   */
  hasOneUserSelected() {
    return this.props.userWorkspaceContext.selectedUsers.length === 1;
  }

  /**
   * Check if the button is disabled.
   * @returns {boolean}
   */
  isButtonDisabled() {
    return !this.hasOneUserSelected();
  }

  /**
   * Can update the resource
   * @returns {boolean}
   */
  isLoggedInUserAdmin() {
    return this.props.context.loggedInUser && this.props.context.loggedInUser.role.name === "admin";
  }

  /**
   * Disable the selected user's MFA
   */
  disableMFA() {
    this.closeMoreMenu();
    this.props.dialogContext.open(ConfirmDisableUserMFA);
  }


  /**
   * Toggles the more menu
   */
  toggleMoreMenu() {
    const moreMenuOpen = !this.state.moreMenuOpen;
    this.setState({moreMenuOpen});
  }

  /**
   * Close the more menu
   */
  closeMoreMenu() {
    this.setState({moreMenuOpen: false});
  }

  /**
   * Copy the user permalink
   */
  async copyPermalink() {
    this.closeMoreMenu();
    const baseUrl = this.props.context.userSettings.getTrustedDomain();
    const permalink = `${baseUrl}/app/users/view/${this.selectedUser.id}`;
    await this.props.context.port.request("passbolt.clipboard.copy", permalink);
    this.props.actionFeedbackContext.displaySuccess(this.translate("The permalink has been copied to clipboard"));
  }

  /**
   * Resend an invite to the given user
   */
  resendInvite() {
    this.props.context.port.request('passbolt.users.resend-invite', this.selectedUser.username)
      .then(this.onResendInviteSuccess.bind(this))
      .catch(this.onResendInviteFailure.bind(this));
  }

  /**
   * Whenever the resend invite succeeds
   */
  onResendInviteSuccess() {
    this.props.actionFeedbackContext.displaySuccess(this.translate("The invite has been resent successfully"));
    this.toggleMoreMenu();
  }

  /**
   * Whenever the resend invite fails
   * @param error An error
   */
  onResendInviteFailure(error) {
    const errorDialogProps = {
      title: "There was an unexpected error...",
      message: error.message
    };
    this.toggleMoreMenu();
    this.props.context.setContext({errorDialogProps});
    this.props.dialogContext.open(NotifyError);
  }

  /**
   * Get the translate function
   * @returns {function(...[*]=)}
   */
  get translate() {
    return this.props.t;
  }

  /**
   * Render the component
   * @returns {JSX}
   */
  render() {
    return (
      <div className="col2_3 actions-wrapper">
        <div className="actions">
          {this.isLoggedInUserAdmin() &&
          <ul className="ready">
            <li>
              <a className={`button ready ${this.isButtonDisabled() ? "disabled" : ""}`} onClick={this.handleEditClickEvent}>
                <Icon name="edit"/>
                <span><Trans>Edit</Trans></span>
              </a>
            </li>
            <li>
              <a className={`button ready ${!this.canDelete ? "disabled" : ""}`} onClick={this.handleDeleteClickEvent}>
                <Icon name="trash"/>
                <span><Trans>Delete</Trans></span>
              </a>
            </li>
            <div className="dropdown" ref={this.moreMenuRef}>
              <a
                className={`button ready ${this.hasMoreActionAllowed ? "" : "disabled"}`}
                onClick={this.handleMoreClickEvent}>
                <span><Trans>More</Trans></span>
                <Icon name="caret-down"/>
              </a>
              <ul className={`dropdown-content menu ready ${this.state.moreMenuOpen ? "visible" : ""}`}>
                <li id="copy-user-permalink" className="separator-after">
                  <div className="row">
                    <div className="main-cell-wrapper">
                      <div className="main-cell">
                        <a
                          onClick={this.handleCopyPermalinkEvent}
                          className={`${this.canCopyPermalink ? "" : "disabled"}`}>
                          <span><Trans>Copy permalink to clipboard</Trans></span>
                        </a>
                      </div>
                    </div>
                  </div>
                </li>
                {this.canIUseResend &&
                <li id="resend-invite-user" className="separator-after">
                  <div className="row">
                    <div className="main-cell-wrapper">
                      <div className="main-cell">
                        <a onClick={this.handleResendInviteClickEvent}
                          className={`${this.canResendInviteToUser ? "" : "disabled"}`}>
                          <span><Trans>Resend invite</Trans></span>
                        </a>
                      </div>
                    </div>
                  </div>
                </li>
                }
                {this.canIUseMfa &&
                <li id="disable-mfa-action" className="">
                  <div className="row">
                    <div className="main-cell-wrapper">
                      <div className="main-cell">
                        <a
                          id="disable-mfa"
                          onClick={this.handleDisableMfaEvent}
                          className={this.canDisableMfaForUser ? '' : 'disabled'}>
                          <span><Trans>Disable MFA</Trans></span>
                        </a>
                      </div>
                    </div>
                  </div>
                </li>
                }
              </ul>
            </div>
          </ul>
          }
        </div>
        <div className="actions secondary">
          <ul className="ready">
            <li>
              <a
                className={`button toggle info ${this.hasDetailsLocked() ? "selected" : ""}`}
                onClick={this.handleDetailsLockedEvent}>
                <Icon name="info-circle"/>
                <span className="visuallyhidden">View detail</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

DisplayUserWorkspaceActions.propTypes = {
  context: PropTypes.any, // The application context
  userWorkspaceContext: PropTypes.any, // the user workspace context
  dialogContext: PropTypes.any, // the dialog context
  actionFeedbackContext: PropTypes.object, // the action feeedback context
  t: PropTypes.func, // The translation function
};

export default withAppContext(withActionFeedback(withDialog(withUserWorkspace(withTranslation('common')(DisplayUserWorkspaceActions)))));
