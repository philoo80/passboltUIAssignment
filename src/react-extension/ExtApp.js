/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.12.0
 */

/* eslint-disable no-unused-vars */
/* eslint-enable no-unused-vars */
import React, {Component} from "react";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import PropTypes from "prop-types";
import DisplayMainMenu from "./components/Common/Menu/DisplayMainMenu";
import ActionFeedbackContextProvider from "./contexts/ActionFeedbackContext";
import DisplayActionFeedbacks from "./components/Common/ActionFeedback/DisplayActionFeedbacks";
import DialogContextProvider from "./contexts/DialogContext";
import ManageDialogs from "./components/Common/Dialog/ManageDialogs/ManageDialogs";
import ResourceWorkspaceContextProvider from "./contexts/ResourceWorkspaceContext";
import UserWorkspaceContextProvider from "./contexts/UserWorkspaceContext";
import ContextualMenuContextProvider from "./contexts/ContextualMenuContext";
import ManageContextualMenu from "./components/Common/ContextualMenu/ManageContextualMenu";
import ManageLoading from "./components/Common/Loading/ManageLoading/ManageLoading";
import LoadingContextProvider from "./contexts/LoadingContext";
import DisplayUserWorkspace from "./components/User/DisplayUserWorkspace/DisplayUserWorkspace";
import HandleRouteFallback from "./components/Common/Route/HandleRouteFallback";
import DisplayUserSettingsWorkspace
  from "./components/UserSetting/DisplayUserSettingsWorkspace/DisplayUserSettingsWorkspace";
import HandleSessionExpired from "./components/Authentication/HandleSessionExpired/HandleSessionExpired";
import Footer from "./components/Common/Footer/Footer";
import HandleExtAppRouteChanged from "./components/Common/Route/HandleExtAppRouteChanged";
import NavigationContextProvider from "./contexts/NavigationContext";
import AdministrationWorkspaceContextProvider from "./contexts/AdministrationWorkspaceContext";
import ManageAnnouncements from "./components/Announcement/ManageAnnouncements/ManageAnnouncements";
import AnnouncementContextProvider from "./contexts/AnnouncementContext";
import HandleSubscriptionAnnouncement
  from "./components/Announcement/HandleSubscriptionAnnouncement/HandleSubscriptionAnnouncement";
import ExtAppContextProvider from "./contexts/ExtAppContext";

import TranslationProvider from "./components/Common/Internationalisation/TranslationProvider";
import UserSettingsContextProvider from "./contexts/UserSettingsContext";
import AdministrationWorkspace from "./components/Administration/AdministrationWorkspace";
import AppContext from "./contexts/AppContext";
import HandlePassphraseEntryEvents
  from "./components/AuthenticationPassphrase/HandlePassphraseEntryEvents/HandlePassphraseEntryEvents";
import HandleFolderMoveStrategyEvents
  from "./components/ResourceFolder/HandleFolderMoveStrategyEvents/HandleFolderMoveStrategyEvents";
import HandleProgressEvents from "./components/Common/Progress/HandleProgressEvents/HandleProgressEvents";
import HandleErrorEvents from "./components/Common/Error/HandleErrorEvents/HandleErrorEvents";
import DisplayResourcesWorkspace from "./components/Resource/DisplayResourcesWorkspace/DisplayResourcesWorkspace";

/**
 * The passbolt application served by the browser extension.
 * Briefly it takes care of:
 * - The administration workspace
 * - The user workspace
 * - Most of the user settings MFA screen. Because of duo constraints.
 */
class ExtApp extends Component {
  /*
   * =============================================================
   *  View
   * =============================================================
   */
  render() {
    return (
      <ExtAppContextProvider port={this.props.port} storage={this.props.storage}>
        <AppContext.Consumer>
          {appContext =>
            <TranslationProvider loadingPath="/data/locales/{{lng}}/{{ns}}.json">
              <ActionFeedbackContextProvider>
                <DialogContextProvider>
                  <AnnouncementContextProvider>
                    <ContextualMenuContextProvider>
                      <LoadingContextProvider>

                        { /* Action Feedback Management */}
                        <DisplayActionFeedbacks/>

                        { /* Dialogs Management */}
                        <HandlePassphraseEntryEvents/>
                        <HandleFolderMoveStrategyEvents/>
                        <HandleProgressEvents/>
                        <HandleErrorEvents/>
                        <HandleSessionExpired/>

                        { /* Announcement Management */}
                        {appContext.loggedInUser && appContext.loggedInUser.role.name === "admin"
                          && appContext.siteSettings.canIUse('ee')
                          && <HandleSubscriptionAnnouncement/>}

                        <Router>
                          <NavigationContextProvider>
                            <HandleExtAppRouteChanged/>
                            <Switch>
                              { /* The following routes are not handled by the browser extension application. */}
                              <Route exact path={[
                                "/app/administration",
                                "/app/administration/mfa",
                                "/app/administration/users-directory",
                                "/app/administration/email-notification",
                                "/app/settings/mfa"
                              ]}/>
                              {/* Passwords workspace */}
                              <Route path={[
                                "/app/folders/view/:filterByFolderId",
                                "/app/passwords/view/:selectedResourceId",
                                "/app/passwords",
                              ]}>
                                <ResourceWorkspaceContextProvider>
                                  <ManageDialogs/>
                                  <ManageContextualMenu/>
                                  <ManageAnnouncements/>
                                  <div id="container" className="page password">
                                    <div id="app" className="app ready" tabIndex="1000">
                                      <div className="header first">
                                        <DisplayMainMenu/>
                                      </div>
                                      <DisplayResourcesWorkspace onMenuItemClick={this.handleWorkspaceSelect}/>
                                    </div>
                                  </div>
                                </ResourceWorkspaceContextProvider>
                              </Route>
                              {/* Users workspace */}
                              <Route path={[
                                "/app/groups/view/:selectedGroupId",
                                "/app/groups/edit/:selectedGroupId",
                                "/app/users/view/:selectedUserId",
                                "/app/users",
                              ]}>
                                <UserWorkspaceContextProvider>
                                  <ManageDialogs/>
                                  <ManageContextualMenu/>
                                  <ManageAnnouncements/>
                                  <div id="container" className="page user">
                                    <div id="app" className="app ready" tabIndex="1000">
                                      <div className="header first">
                                        <DisplayMainMenu/>
                                      </div>
                                      <DisplayUserWorkspace/>
                                    </div>
                                  </div>
                                </UserWorkspaceContextProvider>
                              </Route>
                              {/* User settings workspace */}
                              <Route path={"/app/settings"}>
                                <UserSettingsContextProvider>
                                  <ManageDialogs/>
                                  <ManageAnnouncements/>
                                  <div id="container" className="page settings">
                                    <div id="app" className="app ready" tabIndex="1000">
                                      <div className="header first">
                                        <DisplayMainMenu/>
                                      </div>
                                      <DisplayUserSettingsWorkspace/>
                                    </div>
                                  </div>
                                </UserSettingsContextProvider>
                              </Route>
                              {/* Subscription settings */}
                              <Route exact path={"/app/administration/subscription"}>
                                <AdministrationWorkspaceContextProvider>
                                  <ManageDialogs/>
                                  <AdministrationWorkspace/>
                                </AdministrationWorkspaceContextProvider>
                              </Route>
                              {/* Fallback */}
                              <Route path="/">
                                <HandleRouteFallback/>
                              </Route>
                            </Switch>
                          </NavigationContextProvider>
                        </Router>
                        <ManageLoading/>
                        <Footer/>
                      </LoadingContextProvider>
                    </ContextualMenuContextProvider>
                  </AnnouncementContextProvider>
                </DialogContextProvider>
              </ActionFeedbackContextProvider>
            </TranslationProvider>
          }
        </AppContext.Consumer>
      </ExtAppContextProvider>
    );
  }
}

ExtApp.propTypes = {
  onClose: PropTypes.func,
  disabled: PropTypes.bool,
  port: PropTypes.object,
  storage: PropTypes.object,
};

export default ExtApp;
