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
import {withAppContext} from "../../../contexts/AppContext";
import {withNavigationContext} from "../../../contexts/NavigationContext";
import {Trans, withTranslation} from "react-i18next";

/**
 * This component allows to navigate throught the differents sections of the user settings workspace
 */
class NavigateIntoUserSettingsWorkspace extends React.Component {
  /**
   * Returns true if the use has the MFA capability
   */
  get isMfaEnabled() {
    return this.props.context.siteSettings.canIUse("multiFactorAuthentication");
  }

  /**
   * Can the user access the theme capability.
   * @returns {bool}
   */
  get canIUseThemeCapability() {
    return this.props.context.siteSettings && this.props.context.siteSettings.canIUse('accountSettings');
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
   */
  render() {
    const isSelected = pathSuffix => this.props.location.pathname.endsWith(pathSuffix);
    return (
      <div className="navigation first shortcuts">
        <ul >
          <li>
            <div
              className={`row ${isSelected('profile') ? 'selected' : ''}`}>
              <div className="main-cell-wrapper">
                <div className="main-cell">
                  <a onClick={this.props.navigationContext.onGoToUserSettingsProfileRequested}>
                    <span><Trans>Profile</Trans></span>
                  </a>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div
              className={`row ${isSelected('passphrase') ? 'selected' : ''}`}>
              <div className="main-cell-wrapper">
                <div className="main-cell">
                  <a onClick={this.props.navigationContext.onGoToUserSettingsPassphraseRequested}>
                    <span><Trans>Passphrase</Trans></span>
                  </a>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div
              className={`row ${isSelected('security-token') ? 'selected' : ''}`}>
              <div className="main-cell-wrapper">
                <div className="main-cell">
                  <a onClick={this.props.navigationContext.onGoToUserSettingsSecurityTokenRequested}>
                    <span><Trans>Security Token</Trans></span>
                  </a>
                </div>
              </div>
            </div>
          </li>
          {this.canIUseThemeCapability &&
          <li>
            <div
              className={`row ${isSelected('theme') ? 'selected' : ''}`}>
              <div className="main-cell-wrapper">
                <div className="main-cell">
                  <a onClick={this.props.navigationContext.onGoToUserSettingsThemeRequested}>
                    <span><Trans>Theme</Trans></span>
                  </a>
                </div>
              </div>
            </div>
          </li>
          }
          {this.isMfaEnabled &&
            <li>
              <div
                className={`row ${isSelected('mfa') ? 'selected' : ''}`}>
                <div className="main-cell-wrapper">
                  <div className="main-cell">
                    <a onClick={this.props.navigationContext.onGoToUserSettingsMfaRequested}>
                      <span><Trans>Multi Factor Authentication</Trans></span>
                    </a>
                  </div>
                </div>
              </div>
            </li>
          }
          <li>
            <div
              className={`row ${isSelected('keys') ? 'selected' : ''}`}>
              <div className="main-cell-wrapper">
                <div className="main-cell">
                  <a onClick={this.props.navigationContext.onGoToUserSettingsKeysRequested}>
                    <span><Trans>Keys inspector</Trans></span>
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

NavigateIntoUserSettingsWorkspace.propTypes = {
  context: PropTypes.any, // The application context
  navigationContext: PropTypes.any, // The application navigation context
  history: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func, // The translation function
};

export default withAppContext(withRouter(withNavigationContext(withTranslation('common')(NavigateIntoUserSettingsWorkspace))));
