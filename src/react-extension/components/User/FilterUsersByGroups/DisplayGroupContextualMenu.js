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
import {withDialog} from "../../../contexts/DialogContext";
import ContextualMenuWrapper from "../../Common/ContextualMenu/ContextualMenuWrapper";
import DeleteUserGroupWithConflicts from "../../UserGroup/DeleteUserGroup/DeleteUserGroupWithConflicts";
import NotifyError from "../../Common/Error/NotifyError/NotifyError";
import DeleteUserGroup from "../../UserGroup/DeleteUserGroup/DeleteUserGroup";
import EditUserGroup from "../../UserGroup/EditUserGroup/EditUserGroup";
import {withUserWorkspace} from "../../../contexts/UserWorkspaceContext";
import {Trans, withTranslation} from "react-i18next";

class DisplayGroupContextualMenu extends React.Component {
  /**
   * Constructor
   * Initialize state and bind methods
   */
  constructor(props) {
    super(props);
    this.bindCallbacks();
  }

  /**
   * Bind callbacks methods
   */
  bindCallbacks() {
    this.handleDeleteClickEvent = this.handleDeleteClickEvent.bind(this);
    this.handleEditGroup = this.handleEditGroup.bind(this);
  }

  /**
   * Get group
   * @returns {null|{deleted: boolean, created: string, name: string, modified_by: string, modified: string, id: string, created_by: string, groups_users: [{is_admin: boolean, group_id: string, user_id: string, created: string, id: string}, {is_admin: boolean, group_id: string, user_id: string, created: string, id: string}], my_group_user: {is_admin: boolean, group_id: string, user_id: string, created: string, id: string}}}
   */
  get group() {
    return this.props.group;
  }

  /**
   * Returns true if the current user is admin
   */
  get isCurrentUserAdmin() {
    return this.props.context.loggedInUser && this.props.context.loggedInUser.role.name === 'admin';
  }

  /**
   * Handle delete click event
   */
  async handleDeleteClickEvent() {
    try {
      await this.props.context.port.request("passbolt.groups.delete-dry-run", this.group.id);
      this.displayDeleteGroupDialog();
    } catch (error) {
      if (error.name === "DeleteDryRunError") {
        this.displayDeleteGroupWithConflictsDialog(error.errors);
      } else {
        this.handleError(error);
      }
    }
    this.props.hide();
  }

  /**
   * Display delete user dialog when there is not conflict to solve
   */
  displayDeleteGroupDialog() {
    const deleteGroupDialogProps = {
      group: this.group
    };
    this.props.context.setContext({deleteGroupDialogProps});
    this.props.dialogContext.open(DeleteUserGroup);
  }

  /**
   * Display delete user dialog when there is conflict to solve.
   */
  displayDeleteGroupWithConflictsDialog(errors) {
    const deleteGroupWithConflictsDialogProps = {
      group: this.group,
      errors
    };
    this.props.context.setContext({deleteGroupWithConflictsDialogProps});
    this.props.dialogContext.open(DeleteUserGroupWithConflicts);
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
   * Handle the will of edit a group
   */
  async handleEditGroup() {
    await this.props.userWorkspaceContext.onGroupToEdit(this.props.group);
    this.props.dialogContext.open(EditUserGroup);
    this.props.hide();
  }

  /**
   * Get the translate function
   * @returns {function(...[*]=)}
   */
  get translate() {
    return this.props.t;
  }

  /**
   * Render the component.
   * @returns {JSX}
   */
  render() {
    return (
      <ContextualMenuWrapper
        hide={this.props.hide}
        left={this.props.left}
        top={this.props.top}>
        <li key="option-filter-all-groups" className="ready closed">
          <div className="row">
            <div className="main-cell-wrapper">
              <div className="main-cell">
                <a
                  id="edit-group"
                  onClick={this.handleEditGroup}>
                  <span><Trans>Edit group</Trans></span>
                </a>
              </div>
            </div>
          </div>
        </li>
        {this.isCurrentUserAdmin &&
          <li key="option-delete-group" className="ready closed">
            <div className="row">
              <div className="main-cell-wrapper">
                <div className="main-cell">
                  <a
                    id="delete-group"
                    onClick={this.handleDeleteClickEvent}>
                    <span><Trans>Delete Group</Trans></span>
                  </a>
                </div>
              </div>
            </div>
          </li>
        }
      </ContextualMenuWrapper>
    );
  }
}

DisplayGroupContextualMenu.propTypes = {
  context: PropTypes.any, // The application context
  hide: PropTypes.func, // Hide the contextual menu
  left: PropTypes.number, // left position in px of the page
  top: PropTypes.number, // top position in px of the page
  group: PropTypes.object,
  dialogContext: PropTypes.any, // The dialog context
  userWorkspaceContext: PropTypes.object, // The user workspace context
  t: PropTypes.func, // The translation function
};

export default withAppContext(withUserWorkspace(withDialog(withTranslation('common')(DisplayGroupContextualMenu))));
