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
import {withDialog} from "../../../contexts/DialogContext";
import ContextualMenuWrapper from "../../Common/ContextualMenu/ContextualMenuWrapper";
import CreateResourceFolder from "../../ResourceFolder/CreateResourceFolder/CreateResourceFolder";
import {withAppContext} from "../../../contexts/AppContext";
import RenameResourceFolder from "../../ResourceFolder/RenameResourceFolder/RenameResourceFolder";
import DeleteResourceFolder from "../../ResourceFolder/DeleteResourceFolder/DeleteResourceFolder";
import ShareDialog from "../../Share/ShareDialog";
import ExportResources from "../ExportResources/ExportResources";
import {withResourceWorkspace} from "../../../contexts/ResourceWorkspaceContext";
import {Trans, withTranslation} from "react-i18next";

class FilterResourcesByFoldersItemContextualMenu extends React.Component {
  /**
   * Constructor
   * Initialize state and bind methods
   */
  constructor(props) {
    super(props);
    this.state = this.getDefaultState();
    this.bindCallbacks();
  }

  /**
   * Return default state
   * @returns {Object} default state
   */
  getDefaultState() {
    return {};
  }

  /**
   * Bind callbacks methods
   */
  bindCallbacks() {
    this.handleCreateFolderItemClickEvent = this.handleCreateFolderItemClickEvent.bind(this);
    this.handleRenameFolderItemClickEvent = this.handleRenameFolderItemClickEvent.bind(this);
    this.handleShareFolderItemClickEvent = this.handleShareFolderItemClickEvent.bind(this);
    this.handleExportFolderItemClickEvent = this.handleExportFolderItemClickEvent.bind(this);
    this.handleDeleteFolderItemClickEvent = this.handleDeleteFolderItemClickEvent.bind(this);
  }

  /**
   * Handle click on the create a folder menu option.
   */
  handleCreateFolderItemClickEvent() {
    if (this.canUpdate()) {
      this.props.context.setContext({folderCreateDialogProps: {folderParentId: this.props.folder.id}});
      this.props.dialogContext.open(CreateResourceFolder);
      this.props.hide();
    }
  }

  /**
   * Handle click on the rename a folder menu option.
   */
  handleRenameFolderItemClickEvent() {
    if (this.canUpdate()) {
      this.props.context.setContext({folder: this.props.folder});
      this.props.dialogContext.open(RenameResourceFolder);
      this.props.hide();
    }
  }

  /**
   * Handle click on the share a folder menu option.
   */
  handleShareFolderItemClickEvent() {
    if (this.canShare()) {
      const foldersIds = [this.props.folder.id];
      this.props.context.setContext({shareDialogProps: {foldersIds}});
      this.props.dialogContext.open(ShareDialog);
      this.props.hide();
    }
  }

  /**
   * Handle click on the export a folder menu option.
   */
  async handleExportFolderItemClickEvent() {
    if (this.canExport()) {
      await this.export();
      this.props.hide();
    }
  }

  /**
   * Handle click on the delete a folder menu option.
   */
  handleDeleteFolderItemClickEvent() {
    if (this.canUpdate()) {
      this.props.context.setContext({folder: this.props.folder});
      this.props.dialogContext.open(DeleteResourceFolder);
      this.props.hide();
    }
  }

  /**
   * Check if the user can update the folder.
   * @returns {boolean}
   */
  canUpdate() {
    return this.props.folder.permission.type >= 7;
  }

  /**
   * Check if the user can share the folder.
   * @returns {boolean}
   */
  canShare() {
    return this.props.folder.permission.type === 15;
  }


  /**
   * Returns true if the user can export
   */
  canExport() {
    return this.props.context.siteSettings.settings.passbolt.plugins.export;
  }

  /**
   * Exports the selected resources
   */
  async export() {
    const foldersIds = [this.props.folder.id];
    await this.props.resourceWorkspaceContext.onResourcesToExport({foldersIds});
    await this.props.dialogContext.open(ExportResources);
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
    const canUpdate = this.canUpdate();
    const canShare = this.canShare();
    const canExport = this.canExport();

    return (
      <ContextualMenuWrapper
        hide={this.props.hide}
        left={this.props.left}
        top={this.props.top}>
        <li key="option-create-folder" className={`ready closed ${canUpdate ? "" : "disabled"}`}>
          <div className="row">
            <div className="main-cell-wrapper">
              <div className="main-cell">
                <a onClick={this.handleCreateFolderItemClickEvent}><span><Trans>Create folder</Trans></span></a>
              </div>
            </div>
          </div>
        </li>
        <li key="option-rename-folder" className={`separator-after ready closed ${canUpdate ? "" : "disabled"}`}>
          <div className="row">
            <div className="main-cell-wrapper">
              <div className="main-cell">
                <a onClick={this.handleRenameFolderItemClickEvent}><span><Trans>Rename</Trans></span></a>
              </div>
            </div>
          </div>
        </li>
        <li key="option-share-folder" className={`ready closed ${canShare ? "" : "disabled"}`}>
          <div className="row">
            <div className="main-cell-wrapper">
              <div className="main-cell">
                <a onClick={this.handleShareFolderItemClickEvent}><span><Trans>Share</Trans></span></a>
              </div>
            </div>
          </div>
        </li>
        <li key="option-export-folder" className={`ready closed ${canExport ? "" : "disabled"}`}>
          <div className="row">
            <div className="main-cell-wrapper">
              <div className="main-cell">
                <a
                  className={`${this.canExport() ? "" : "disabled"}`}
                  onClick={this.handleExportFolderItemClickEvent}>
                  <span><Trans>Export</Trans></span>
                </a>
              </div>
            </div>
          </div>
        </li>
        <li key="option-delete-folder" className={`ready closed ${canUpdate ? "" : "disabled"}`}>
          <div className="row">
            <div className="main-cell-wrapper">
              <div className="main-cell">
                <a onClick={this.handleDeleteFolderItemClickEvent}><span><Trans>Delete</Trans></span></a>
              </div>
            </div>
          </div>
        </li>
      </ContextualMenuWrapper>
    );
  }
}

FilterResourcesByFoldersItemContextualMenu.propTypes = {
  context: PropTypes.any, // The application context
  folder: PropTypes.object,
  hide: PropTypes.func, // Hide the contextual menu
  left: PropTypes.number, // left position in px of the page
  top: PropTypes.number, // top position in px of the page
  dialogContext: PropTypes.any,
  resourceWorkspaceContext: PropTypes.any, // Resource workspace context
  t: PropTypes.func, // The translation function
};

export default withAppContext(withResourceWorkspace(withDialog(withTranslation('common')(FilterResourcesByFoldersItemContextualMenu))));
