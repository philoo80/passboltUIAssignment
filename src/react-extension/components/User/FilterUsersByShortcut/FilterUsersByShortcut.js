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
import {withRouter} from "react-router-dom";
import {UserWorkspaceFilterTypes, withUserWorkspace} from "../../../contexts/UserWorkspaceContext";
import {Trans, withTranslation} from "react-i18next";

/**
 * This component allows to select shortcut filters applied on users
 */
class FilterUsersByShortcut extends React.Component {
  /**
   * Default constructor
   * @param props Component props
   */
  constructor(props) {
    super(props);
    this.bindHandlers();
  }

  /**
   * Bind the component handlers
   */
  bindHandlers() {
    this.handleAllItemsClick = this.handleAllItemsClick.bind(this);
    this.handleRecentlyModifiedClick = this.handleRecentlyModifiedClick.bind(this);
  }

  /**
   * Returns true if the All Items shortcut is currently selected
   */
  get isAllItemsSelected() {
    return this.props.userWorkspaceContext.filter.type === UserWorkspaceFilterTypes.ALL;
  }

  /**
   * Returns true if the Recently Modified shortcut is currently selected
   */
  get isRecentlyModifiedSelected() {
    return this.props.userWorkspaceContext.filter.type === UserWorkspaceFilterTypes.RECENTLY_MODIFIED;
  }

  /**
   * Whenever the shortcut "All items" has been selected
   */
  handleAllItemsClick() {
    const filter = {type: UserWorkspaceFilterTypes.ALL};
    this.props.history.push({pathname: '/app/users', state: {filter}});
  }

  /**
   * Whenever the shortcut "Recently modified" has been selected
   */
  handleRecentlyModifiedClick() {
    const filter = {type: UserWorkspaceFilterTypes.RECENTLY_MODIFIED};
    this.props.history.push({pathname: '/app/users', state: {filter}});
  }

  /**
   * Get the translate function
   * @returns {function(...[*]=)}
   */
  get translate() {
    return this.props.t;
  }

  render() {
    return (
      <div className="navigation first shortcuts">
        <ul >
          <li>
            <div className={`row ${this.isAllItemsSelected ? "selected" : ""}`}>
              <div className="main-cell-wrapper">
                <div className="main-cell">
                  <a id="all-users" onClick={this.handleAllItemsClick}>
                    <span><Trans>All users</Trans></span>
                  </a>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div className={`row ${this.isRecentlyModifiedSelected ? "selected" : ""}`}>
              <div className="main-cell-wrapper">
                <div className="main-cell">
                  <a id="recently-modified"  onClick={this.handleRecentlyModifiedClick}>
                    <span><Trans>Recently Modified</Trans></span>
                  </a>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    );
  }
}

FilterUsersByShortcut.propTypes = {
  history: PropTypes.object,
  userWorkspaceContext: PropTypes.object,
  t: PropTypes.func, // The translation function
};

export default withRouter(withUserWorkspace(withTranslation('common')(FilterUsersByShortcut)));
